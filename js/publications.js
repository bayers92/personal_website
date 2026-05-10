(function () {
  "use strict";

  var scholarProfileUrl = "https://scholar.google.com/citations?hl=en&user=38iwVeUAAAAJ&view_op=list_works&sortby=pubdate";
  var publicationSources = ["data/publications.json", "php/publications.php"];
  var publicationList = document.getElementById("publication-list");
  var publicationStatus = document.getElementById("publication-status");
  var publicationsPerPage = 10;
  var currentPage = 1;
  var allPublications = [];
  var paginationControls;

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
    renderPaginationControls(0);

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

  function getPaginationControls() {
    if (!publicationList) {
      return null;
    }

    if (!paginationControls) {
      paginationControls = document.createElement("nav");
      paginationControls.className = "publication-pagination";
      paginationControls.setAttribute("aria-label", "Publication pages");
      publicationList.insertAdjacentElement("afterend", paginationControls);
    }

    return paginationControls;
  }

  function renderPaginationControls(totalPages) {
    var controls = getPaginationControls();
    if (!controls) {
      return;
    }

    controls.innerHTML = "";

    if (totalPages <= 1) {
      controls.hidden = true;
      return;
    }

    controls.hidden = false;

    var previousButton = document.createElement("button");
    previousButton.type = "button";
    previousButton.className = "publication-page-button";
    previousButton.textContent = "Previous";
    previousButton.disabled = currentPage === 1;
    previousButton.addEventListener("click", function () {
      renderPublicationsPage(currentPage - 1);
    });

    var pageLabel = document.createElement("span");
    pageLabel.className = "publication-page-label";
    pageLabel.textContent = "Page " + currentPage + " of " + totalPages;

    var nextButton = document.createElement("button");
    nextButton.type = "button";
    nextButton.className = "publication-page-button";
    nextButton.textContent = "Next";
    nextButton.disabled = currentPage === totalPages;
    nextButton.addEventListener("click", function () {
      renderPublicationsPage(currentPage + 1);
    });

    controls.appendChild(previousButton);
    controls.appendChild(pageLabel);
    controls.appendChild(nextButton);
  }

  function renderPublicationsPage(page) {
    if (!publicationList) {
      return;
    }

    var totalPages = Math.max(1, Math.ceil(allPublications.length / publicationsPerPage));
    currentPage = Math.min(Math.max(page, 1), totalPages);

    publicationList.innerHTML = "";

    allPublications
      .slice((currentPage - 1) * publicationsPerPage, currentPage * publicationsPerPage)
      .forEach(function (publication) {
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

    renderPaginationControls(totalPages);
  }

  function renderPublications(publications) {
    allPublications = publications;
    renderPublicationsPage(1);
  }

  function fetchPublicationSource(sourceIndex) {
    return fetch(publicationSources[sourceIndex], {
      headers: {
        "Accept": "application/json"
      }
    })
      .then(function (response) {
        if (!response.ok) {
          throw new Error("Publication source failed");
        }
        return response.json();
      })
      .then(function (payload) {
        if (!payload.publications || !payload.publications.length) {
          throw new Error("No publications returned");
        }
        return payload;
      })
      .catch(function () {
        if (sourceIndex + 1 < publicationSources.length) {
          return fetchPublicationSource(sourceIndex + 1);
        }
        throw new Error("No publication source loaded");
      });
  }

  function loadScholarPublications() {
    if (!window.fetch) {
      setStatus("Your browser could not load publications automatically.");
      renderEmptyState("View the latest publication list on Google Scholar");
      return;
    }

    setStatus("Loading recent publications from Google Scholar...");

    fetchPublicationSource(0)
      .then(function (payload) {
        renderPublications(payload.publications);
        setStatus("Pulled from Google Scholar, sorted by publication date.");
      })
      .catch(function () {
        setStatus("Could not load publication data automatically.");
        renderEmptyState("View the latest publication list on Google Scholar");
      });
  }

  loadScholarPublications();
}());
