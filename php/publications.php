<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: public, max-age=3600');

$scholarUrl = 'https://scholar.google.com/citations?hl=en&user=38iwVeUAAAAJ&view_op=list_works&sortby=pubdate';
$scholarUrls = [
    'newest' => $scholarUrl,
    'cited' => 'https://scholar.google.com/citations?hl=en&user=38iwVeUAAAAJ&view_op=list_works&sortby=cited',
];

function respond(int $statusCode, array $payload): void
{
    http_response_code($statusCode);
    echo json_encode($payload, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    exit;
}

function fetchScholarProfile(string $url): string
{
    $headers = [
        'User-Agent: Mozilla/5.0 (compatible; BrianAyersWebsite/1.0; +https://brianayers.com)',
        'Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language: en-US,en;q=0.9'
    ];

    if (function_exists('curl_init')) {
        $ch = curl_init($url);
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_FOLLOWLOCATION => true,
            CURLOPT_HTTPHEADER => $headers,
            CURLOPT_TIMEOUT => 10,
            CURLOPT_CONNECTTIMEOUT => 5,
        ]);

        $html = curl_exec($ch);
        $status = (int) curl_getinfo($ch, CURLINFO_RESPONSE_CODE);
        $error = curl_error($ch);
        curl_close($ch);

        if (is_string($html) && $html !== '' && $status >= 200 && $status < 300) {
            return $html;
        }

        throw new RuntimeException($error !== '' ? $error : 'Google Scholar returned HTTP ' . $status);
    }

    $context = stream_context_create([
        'http' => [
            'method' => 'GET',
            'header' => implode("\r\n", $headers),
            'timeout' => 10,
        ],
    ]);

    $html = @file_get_contents($url, false, $context);
    if (is_string($html) && $html !== '') {
        return $html;
    }

    throw new RuntimeException('Unable to fetch Google Scholar profile.');
}

function absoluteScholarUrl(string $href): string
{
    if ($href === '') {
        return 'https://scholar.google.com/citations?hl=en&user=38iwVeUAAAAJ&view_op=list_works&sortby=pubdate';
    }

    if (preg_match('/^https?:\/\//', $href) === 1) {
        return $href;
    }

    if (strpos($href, '/') === 0) {
        return 'https://scholar.google.com' . $href;
    }

    return 'https://scholar.google.com/' . $href;
}

function parseCitationCount(string $value): int
{
    $citationText = trim(preg_replace('/\s+/', ' ', $value));
    $citationText = str_replace(',', '', $citationText);
    return ctype_digit($citationText) ? (int) $citationText : 0;
}

function parseScholarPublications(string $html): array
{
    libxml_use_internal_errors(true);
    $document = new DOMDocument();
    $document->loadHTML($html);
    libxml_clear_errors();

    $xpath = new DOMXPath($document);
    $rows = $xpath->query("//*[contains(concat(' ', normalize-space(@class), ' '), ' gsc_a_tr ')]");
    $publications = [];

    foreach ($rows as $row) {
        $titleNodes = $xpath->query(".//*[contains(concat(' ', normalize-space(@class), ' '), ' gsc_a_at ')]", $row);
        if (!$titleNodes || $titleNodes->length === 0) {
            continue;
        }

        $titleNode = $titleNodes->item(0);
        $title = trim(preg_replace('/\s+/', ' ', $titleNode->textContent));
        if ($title === '') {
            continue;
        }

        $yearNodes = $xpath->query(".//*[contains(concat(' ', normalize-space(@class), ' '), ' gsc_a_y ')]//*[contains(concat(' ', normalize-space(@class), ' '), ' gsc_a_h ')]", $row);
        $year = $yearNodes && $yearNodes->length > 0 ? trim($yearNodes->item(0)->textContent) : '';
        $citationNodes = $xpath->query(".//*[contains(concat(' ', normalize-space(@class), ' '), ' gsc_a_c ')]", $row);
        $citations = $citationNodes && $citationNodes->length > 0 ? parseCitationCount($citationNodes->item(0)->textContent) : 0;
        $href = $titleNode instanceof DOMElement ? $titleNode->getAttribute('href') : '';

        $publications[] = [
            'title' => $title,
            'year' => $year,
            'citations' => $citations,
            'url' => absoluteScholarUrl($href),
        ];
    }

    return $publications;
}

try {
    $publicationsBySort = [];

    foreach ($scholarUrls as $sort => $url) {
        $html = fetchScholarProfile($url);
        $publicationsBySort[$sort] = array_slice(parseScholarPublications($html), 0, 20);
    }

    if (!$publicationsBySort['newest']) {
        throw new RuntimeException('No publications were parsed from Google Scholar.');
    }

    respond(200, [
        'source' => $scholarUrl,
        'sources' => $scholarUrls,
        'publications' => $publicationsBySort['newest'],
        'publicationsBySort' => $publicationsBySort,
    ]);
} catch (Throwable $error) {
    respond(502, [
        'source' => $scholarUrl,
        'error' => $error->getMessage(),
        'publications' => [],
    ]);
}
