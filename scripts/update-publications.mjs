import fs from "node:fs/promises";

const scholarUrls = {
  newest: "https://scholar.google.com/citations?hl=en&user=38iwVeUAAAAJ&view_op=list_works&sortby=pubdate",
  cited: "https://scholar.google.com/citations?hl=en&user=38iwVeUAAAAJ&view_op=list_works&sortby=cited",
};
const scholarUrl = scholarUrls.newest;
const outputPath = new URL("../data/publications.json", import.meta.url);

function decodeHtml(value) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCharCode(parseInt(code, 16)));
}

function stripTags(value) {
  return decodeHtml(value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim());
}

function parseCitationCount(value) {
  const citationText = stripTags(value);
  const citationCount = Number(citationText.replace(/,/g, ""));
  return Number.isFinite(citationCount) ? citationCount : 0;
}

function absolutizeScholarUrl(href) {
  if (!href) return scholarUrl;
  const decoded = decodeHtml(href);
  if (/^https?:\/\//.test(decoded)) return decoded;
  if (decoded.startsWith("/")) return `https://scholar.google.com${decoded}`;
  return `https://scholar.google.com/${decoded}`;
}

function parsePublications(html) {
  const rowPattern = /<tr[^>]*class="[^"]*\bgsc_a_tr\b[^"]*"[^>]*>([\s\S]*?)<\/tr>/g;
  const publications = [];
  let rowMatch;

  while ((rowMatch = rowPattern.exec(html))) {
    const row = rowMatch[1];
    const titleMatch = row.match(/<a\b([^>]*)>([\s\S]*?)<\/a>/);
    if (!titleMatch || !/\bclass="[^"]*\bgsc_a_at\b[^"]*"/.test(titleMatch[1])) continue;

    const citationMatch = row.match(/<td[^>]*class="[^"]*\bgsc_a_c\b[^"]*"[^>]*>([\s\S]*?)<\/td>/);
    const yearMatch = row.match(/<span[^>]*class="[^"]*\bgsc_a_h\b[^"]*"[^>]*>([\s\S]*?)<\/span>/);
    const hrefMatch = titleMatch[1].match(/\bhref="([^"]*)"/);
    const title = stripTags(titleMatch[2]);

    if (!title) continue;

    publications.push({
      title,
      year: yearMatch ? stripTags(yearMatch[1]) : "",
      citations: citationMatch ? parseCitationCount(citationMatch[1]) : 0,
      url: absolutizeScholarUrl(hrefMatch ? hrefMatch[1] : ""),
    });
  }

  return publications;
}

async function fetchPublications(url) {
  const response = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (compatible; BrianAyersWebsite/1.0)",
      "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.9",
    },
  });

  if (!response.ok) {
    throw new Error(`Google Scholar returned HTTP ${response.status}`);
  }

  const html = await response.text();
  const publications = parsePublications(html);

  if (!publications.length) {
    throw new Error("No publications parsed from Google Scholar.");
  }

  return publications;
}

const publicationsBySort = {
  newest: await fetchPublications(scholarUrls.newest),
  cited: await fetchPublications(scholarUrls.cited),
};

const payload = {
  source: scholarUrls.newest,
  sources: scholarUrls,
  updatedAt: new Date().toISOString(),
  publications: publicationsBySort.newest,
  publicationsBySort,
};

await fs.writeFile(outputPath, `${JSON.stringify(payload, null, 2)}\n`);
console.log(`Wrote ${publicationsBySort.newest.length} newest and ${publicationsBySort.cited.length} cited publications to ${outputPath.pathname}`);
