(function () {
  "use strict";

  var scholarProfileUrl = "https://scholar.google.com/citations?user=38iwVeUAAAAJ&hl=en";
  var scholarProxyUrl = "https://api.allorigins.win/raw?url=" + encodeURIComponent(scholarProfileUrl);
  var publicationList = document.getElementById("publication-list");
  var publicationStatus = document.getElementById("publication-status");

  var fallbackPublications = [
    {
      title: "Long-term renal function after venoarterial extracorporeal membrane oxygenation",
      year: "2021",
      url: "https://onlinelibrary.wiley.com/doi/10.1111/jocs.15277"
    },
    {
      title: "Using Machine Learning to Improve Survival Prediction After Heart Transplantation",
      year: "2021",
      url: "https://www.authorea.com/users/410636/articles/519936-using-machine-learning-to-improve-survival-prediction-after-heart-transplantation?commit=05081778296de5446da89ba59d3e64a289da1152"
    },
    {
      title: "Patient-Reported Outcomes Measurement Information System (PROMIS) in Left Ventricular Assist Devices",
      year: "2020",
      url: "https://www.annalsthoracicsurgery.org/article/S0003-4975(20)32041-5/pdf"
    },
    {
      title: "Development of a High-Fidelity Coronary Artery Bypass Graft Training Platform Using 3D Printing and Hydrogel Molding",
      year: "2020",
      url: "https://www.jtcvs.org/article/S0022-5223(20)31548-8/fulltext"
    },
    {
      title: "Predicting Survival after Extracorporeal Membrane Oxygenation using Machine Learning",
      year: "2020",
      url: "https://www.annalsthoracicsurgery.org/article/S0003-4975(20)30749-9/fulltext"
    },
    {
      title: "Minimally invasive off-pump surgical pulmonary embolectomy for improved patient-centred care",
      year: "2020",
      url: "https://academic.oup.com/ejcts/article-abstract/59/5/1126/5998321?redirectedFrom=fulltext"
    },
    {
      title: "Venoarterial ECMO Without Routine Systemic Anticoagulation Decreases Adverse Events",
      year: "2019",
      url: "https://www.annalsthoracicsurgery.org/article/S0003-4975(19)31429-8/fulltext"
    },
    {
      title: "Implantation of a Fully Magnetically Levitated Left Ventricular Assist Device Using a Sternal-Sparing Surgical Technique",
      year: "2019",
      url: "https://www.jhltonline.org/article/S1053-2498(19)31687-0/fulltext"
    },
    {
      title: "Enabling Atrial Fibrillation Detection Using a Weight Scale",
      year: "2016",
      url: "http://www.cinc.org/archives/2016/pdf/281-158.pdf"
    }
  ];

  function renderPublications(publications, statusText) {
    if (!publicationList) {
      return;
    }

    publicationList.innerHTML = "";

    publications.slice(0, 10).forEach(function (publication) {
      var item = document.createElement("li");
      item.className = "publication-item";

      var link = document.createElement("a");
      link.href = publication.url || scholarProfileUrl;
      link.target = "_blank";
      link.rel = "noopener";

      var title = document.createElement("span");
      title.className = "publication-title";
      title.textContent = publication.title;

      var year = document.createElement("span");
      year.className = "publication-year";
      year.textContent = publication.year ? "(" + publication.year + ")" : "";

      link.appendChild(title);
      link.appendChild(year);
      item.appendChild(link);
      publicationList.appendChild(item);
    });

    if (publicationStatus) {
      publicationStatus.textContent = statusText;
    }
  }

  function parseScholarPublications(html) {
    var doc = new DOMParser().parseFromString(html, "text/html");
    var rows = Array.prototype.slice.call(doc.querySelectorAll(".gsc_a_tr"));

    return rows.map(function (row) {
      var titleLink = row.querySelector(".gsc_a_at");
      var year = row.querySelector(".gsc_a_y .gsc_a_h");
      var href = titleLink ? titleLink.getAttribute("href") : "";

      if (href && href.indexOf("/") === 0) {
        href = "https://scholar.google.com" + href;
      }

      return {
        title: titleLink ? titleLink.textContent.trim() : "",
        year: year ? year.textContent.trim() : "",
        url: href || scholarProfileUrl
      };
    }).filter(function (publication) {
      return publication.title;
    });
  }

  function loadScholarPublications() {
    renderPublications(fallbackPublications, "Loading recent publications from Google Scholar...");

    if (!window.fetch || !window.DOMParser) {
      renderPublications(fallbackPublications, "Showing cached publications. Google Scholar is available from the link above.");
      return;
    }

    fetch(scholarProxyUrl)
      .then(function (response) {
        if (!response.ok) {
          throw new Error("Scholar request failed");
        }
        return response.text();
      })
      .then(function (html) {
        var scholarPublications = parseScholarPublications(html);
        if (!scholarPublications.length) {
          throw new Error("No Scholar publications parsed");
        }
        renderPublications(scholarPublications, "Pulled from Google Scholar.");
      })
      .catch(function () {
        renderPublications(fallbackPublications, "Showing cached publications. Google Scholar is available from the link above.");
      });
  }

  loadScholarPublications();
}());
