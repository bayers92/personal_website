(function () {
  "use strict";

  var scholarProfileUrl = "https://scholar.google.com/citations?hl=en&user=38iwVeUAAAAJ&view_op=list_works&sortby=pubdate";
  var publicationEndpoint = "php/publications.php";
  var publicationList = document.getElementById("publication-list");
  var publicationStatus = document.getElementById("publication-status");

  function setStatus(message) {
    if (publicationStatus) {
      publicationStatus.textContent = message;
    }
  }

  function renderEmptyState(message) {
    if (!publicationList) {
      return;
    }

    publicationList.innerHTML = "";

    var item = document.createElement("li");
    item.className = "publication-item publication-empty";

    var link = document.createElement("a");
    link.href = scholarProfileUrl;
    link.target = "_blank";
    link.rel = "noopener";

    var title = document.createElement("span");
    title.className = "publication-title";
    title.textContent = message;

    var year = document.createElement("span");
    year.className = "publication-year";
    year.textContent = "Open Scholar";

    link.appendChild(title);
    link.appendChild(year);
    item.appendChild(link);
    publicationList.appendChild(item);
  }

  function renderPublications(publications) {
    if (!publicationList) {
      return;
    }

    publicationList.innerHTML = "";

    publications.forEach(function (publication) {
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
  }

  function loadScholarPublications() {
    if (!window.fetch) {
      setStatus("Your browser could not load publications automatically.");
      renderEmptyState("View the latest publication list on Google Scholar");
      return;
    }

    setStatus("Loading recent publications from Google Scholar...");

    fetch(publicationEndpoint, {
      headers: {
        "Accept": "application/json"
      }
    })
      .then(function (response) {
        if (!response.ok) {
          throw new Error("Publication endpoint failed");
        }
        return response.json();
      })
      .then(function (payload) {
        if (!payload.publications || !payload.publications.length) {
          throw new Error("No publications returned");
        }
        renderPublications(payload.publications);
        setStatus("Pulled from Google Scholar, sorted by publication date.");
      })
      .catch(function () {
        setStatus("Could not load Google Scholar automatically from this server.");
        renderEmptyState("View the latest publication list on Google Scholar");
      });
  }

  loadScholarPublications();
}());
