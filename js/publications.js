(function () {
  "use strict";

  var scholarProfileUrl = "https://scholar.google.com/citations?hl=en&user=38iwVeUAAAAJ&view_op=list_works&sortby=pubdate";
  var publicationSources = ["data/publications.json", "php/publications.php"];
  var publicationList = document.getElementById("publication-list");
  var publicationStatus = document.getElementById("publication-status");
  var sortButtons = document.querySelectorAll("[data-publication-sort]");
  var publicationsPerPage = 10;
  var currentPage = 1;
  var allPublications = [];
  var publicationsBySort = {
    newest: [],
    cited: []
  };
  var currentSort = "newest";
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

  function getCitationCount(publication) {
    var citationCount = Number(publication.citations);
    return Number.isFinite(citationCount) ? citationCount : 0;
  }

  function formatCitationCount(publication) {
    var citationCount = getCitationCount(publication);
    return citationCount + (citationCount === 1 ? " citation" : " citations");
  }

  function updatePublicationStatus() {
    if (currentSort === "cited") {
      setStatus("Pulled from Google Scholar, sorted by citation count.");
      return;
    }

    setStatus("Pulled from Google Scholar, sorted by publication date.");
  }

  function getSortedPublications() {
    var publications = publicationsBySort[currentSort] && publicationsBySort[currentSort].length
      ? publicationsBySort[currentSort].slice()
      : allPublications.slice();

    if (currentSort === "cited" && (!publicationsBySort.cited || !publicationsBySort.cited.length)) {
      publications.sort(function (first, second) {
        var citationDifference = getCitationCount(second) - getCitationCount(first);
        if (citationDifference !== 0) {
          return citationDifference;
        }

        return Number(second.year || 0) - Number(first.year || 0);
      });
    }

    return publications;
  }

  function updateSortButtons() {
    Array.prototype.forEach.call(sortButtons, function (button) {
      var isActive = button.getAttribute("data-publication-sort") === currentSort;
      button.className = isActive ? "publication-sort-button is-active" : "publication-sort-button";
      button.setAttribute("aria-pressed", isActive ? "true" : "false");
    });
  }

  function bindSortControls() {
    Array.prototype.forEach.call(sortButtons, function (button) {
      button.addEventListener("click", function () {
        var nextSort = button.getAttribute("data-publication-sort");
        if (!nextSort || nextSort === currentSort) {
          return;
        }

        currentSort = nextSort;
        updateSortButtons();
        updatePublicationStatus();
        renderPublicationsPage(1);
      });
    });
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

    var sortedPublications = getSortedPublications();
    var totalPages = Math.max(1, Math.ceil(sortedPublications.length / publicationsPerPage));
    currentPage = Math.min(Math.max(page, 1), totalPages);

    publicationList.innerHTML = "";

    sortedPublications
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

        if (currentSort === "cited") {
          year.textContent = formatCitationCount(publication);
        }

        link.appendChild(title);
        link.appendChild(year);
        item.appendChild(link);
        publicationList.appendChild(item);
      });

    renderPaginationControls(totalPages);
  }

  function renderPublications(publications) {
    if (Array.isArray(publications)) {
      allPublications = publications;
      publicationsBySort.newest = publications;
      publicationsBySort.cited = [];
      renderPublicationsPage(1);
      return;
    }

    allPublications = publications.publications || [];
    publicationsBySort.newest = publications.publicationsBySort && publications.publicationsBySort.newest
      ? publications.publicationsBySort.newest
      : allPublications;
    publicationsBySort.cited = publications.publicationsBySort && publications.publicationsBySort.cited
      ? publications.publicationsBySort.cited
      : [];
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
        renderPublications(payload);
        updatePublicationStatus();
      })
      .catch(function () {
        setStatus("Could not load publication data automatically.");
        renderEmptyState("View the latest publication list on Google Scholar");
      });
  }

  bindSortControls();
  updateSortButtons();
  loadScholarPublications();
}());
