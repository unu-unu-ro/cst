document.addEventListener("DOMContentLoaded", () => {
  // Resource cards grid (homepage or any page with #resourcesGrid)
  const resourcesGrid = document.getElementById("resourcesGrid");

  // Function to create a card element
  function createCard(item) {
    const card = document.createElement("div");
    card.classList.add("card");

    const title = document.createElement("h3");
    title.textContent = item.title;

    const description = document.createElement("p");
    description.textContent = item.description;
    description.setAttribute("title", item.description);

    requestAnimationFrame(() => {
      if (description.scrollHeight > description.clientHeight) {
        description.classList.add("truncated");
      }
    });

    const button = document.createElement("a");
    button.classList.add("btn");
    button.href = item.buttonLink;
    button.textContent = item.buttonText;

    card.appendChild(title);
    card.appendChild(description);
    card.appendChild(button);

    return card;
  }

  // Function to load content from JSON
  async function loadContent(jsonFile, gridElement) {
    try {
      const response = await fetch(`./content/${jsonFile}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const items = await response.json();
      gridElement.innerHTML = "";
      items.forEach(item => {
        const cardElement = createCard(item);
        gridElement.appendChild(cardElement);
        // Re-check truncation after card is added to DOM and rendered
        const pElement = cardElement.querySelector("p");
        if (pElement) {
          requestAnimationFrame(() => {
            // Ensure styles are applied and element has dimensions
            requestAnimationFrame(() => {
              if (pElement.scrollHeight > pElement.clientHeight) {
                pElement.classList.add("truncated");
              } else {
                pElement.classList.remove("truncated");
              }
            });
          });
        }
      });
    } catch (error) {
      console.error(`Could not load ${jsonFile}:`, error);
      gridElement.innerHTML = `<p class="error-message">Failed to load content. Please try again later.</p>`;
    }
  }

  // Load initial content if grids exist
  if (resourcesGrid) loadContent("resources.json", resourcesGrid);

  // Sticky Navigation Logic (works for site-nav)
  const header = document.querySelector("header");
  const nav = document.querySelector(".site-nav") || document.querySelector(".tab-nav");
  const mainContent = document.querySelector("main");

  // Set Current Year
  document.querySelectorAll(".current-year").forEach(el => {
    el.textContent = new Date().getFullYear();
  });

  // Handle hash scrolling (e.g., index#contact)
  const hash = window.location.hash.substring(1);
  if (hash) {
    const target = document.getElementById(hash);
    if (target) {
      setTimeout(() => target.scrollIntoView({ behavior: "smooth" }), 300);
    }
  }

  // Back to Content Start button functionality
  const backToContentStartBtn = document.getElementById("backToContentStartBtn");
  const mainContentStartElement = document.getElementById("cuprins"); // For ghid.html

  if (nav && mainContent) {
    const navHeight = nav.offsetHeight;

    // Initial offset calculation
    let stickyOffset = header ? header.offsetHeight : nav.offsetTop;

    // Recalculate on window resize to be safe
    window.addEventListener("resize", () => {
      if (!nav.classList.contains("fixed-nav")) {
        stickyOffset = header ? header.offsetHeight : nav.offsetTop;
      }
    });

    window.addEventListener("scroll", () => {
      // If not fixed, keep updating offset (e.g. if content before changes)
      if (!nav.classList.contains("fixed-nav")) {
        stickyOffset = header ? header.offsetHeight : nav.offsetTop;
      }

      if (window.pageYOffset > stickyOffset) {
        if (!nav.classList.contains("fixed-nav")) {
          nav.classList.add("fixed-nav");
          mainContent.style.paddingTop = `${navHeight}px`;
          mainContent.classList.add("main-content-padded");
        }
      } else {
        if (nav.classList.contains("fixed-nav")) {
          nav.classList.remove("fixed-nav");
          mainContent.style.paddingTop = "0";
          mainContent.classList.remove("main-content-padded");
        }
      }
    });
  }

  // Mobile nav toggle
  const navToggle = document.querySelector(".nav-toggle");
  const navList = document.querySelector(".site-nav ul");
  if (navToggle && navList) {
    navToggle.addEventListener("click", () => {
      const isOpen = navList.classList.toggle("nav-open");
      navToggle.setAttribute("aria-expanded", isOpen);
      navToggle.textContent = isOpen ? "\u2715" : "\u2630";
    });

    // Close menu when a link is tapped
    navList.querySelectorAll(".nav-link").forEach(link => {
      link.addEventListener("click", () => {
        navList.classList.remove("nav-open");
        navToggle.setAttribute("aria-expanded", "false");
        navToggle.textContent = "\u2630";
      });
    });
  }

  // Back to Content Start button functionality (ghid.html)
  if (backToContentStartBtn && mainContentStartElement) {
    window.addEventListener("scroll", () => {
      if (window.scrollY > 300) {
        // Show button after scrolling 300px
        backToContentStartBtn.style.display = "block";
      } else {
        backToContentStartBtn.style.display = "none";
      }
    });

    backToContentStartBtn.addEventListener("click", e => {
      e.preventDefault(); // Prevent any default action
      mainContentStartElement.scrollIntoView({ behavior: "smooth" });
    });
  } else {
    if (!backToContentStartBtn) {
      console.warn("Back to Content Start button not found.");
    }
    if (!mainContentStartElement) {
      console.warn("Target element for Back to Content Start button (structura-pasajului) not found.");
    }
  }

  // Print to PDF functionality (ghid.html)
  const printToPdfBtn = document.getElementById("printToPdfBtn");
  if (printToPdfBtn) {
    printToPdfBtn.addEventListener("click", () => {
      // Set print date in document for footer
      const printDate = new Date().toLocaleDateString("ro-RO", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });

      // Add print date to body for CSS access
      document.body.setAttribute("data-print-date", printDate);

      // Add print class for any additional styling
      document.body.classList.add("printing");

      // Brief delay to ensure styles are applied
      setTimeout(() => {
        window.print();

        // Remove print class after printing
        setTimeout(() => {
          document.body.classList.remove("printing");
        }, 1000);
      }, 100);
    });
  }

  // Conference banner: show during alert window based on events.json and display countdown
  const confBanner = document.getElementById("conferenceBanner");
  const confLink = document.getElementById("conferenceLink");
  const confText = document.getElementById("conferenceText");
  async function checkEventAlerts() {
    if (!confBanner || !confLink || !confText) return;
    try {
      const response = await fetch("./content/events.json");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const events = await response.json();
      const now = new Date();

      // Find first event with valid alert window covering current time
      const active = events.find(ev => {
        if (!ev.alertFromDate || !ev.alertToDate) return false;
        const from = new Date(ev.alertFromDate);
        const to = new Date(ev.alertToDate);
        if (isNaN(from.getTime()) || isNaN(to.getTime())) return false;
        return now >= from && now <= to;
      });

      const hasActive = !!(active && active.buttonLink);
      if (hasActive) {
        // Link to event page
        confLink.href = active.buttonLink;

        // Compute countdown using events.json fields
        const startStr = active.startDate;
        const title = active.title || "Eveniment";
        if (startStr) {
          const startDate = new Date(startStr);
          if (!isNaN(startDate.getTime())) {
            const msDiff = startDate.getTime() - now.getTime();
            const days = Math.max(0, Math.ceil(msDiff / (1000 * 60 * 60 * 24)));
            confText.textContent = `📅 ${days} zile pana la ${title}`;
          } else {
            confText.textContent = `📅 Urmatorul atelier e aproape: ${title}`;
          }
        } else {
          confText.textContent = `📅 Urmatorul atelier e aproape: ${title}`;
        }

        confBanner.style.display = "block";
        // Attach banner to nav: remove spacing
        if (nav) nav.classList.add("nav-banner-attached");
        if (mainContent) mainContent.classList.add("main-banner-attached");
      } else {
        confBanner.style.display = "none";
        // Restore spacing when banner hidden
        if (nav) nav.classList.remove("nav-banner-attached");
        if (mainContent) mainContent.classList.remove("main-banner-attached");
      }
    } catch (err) {
      console.error("Could not evaluate event alerts:", err);
      confBanner.style.display = "none";
      if (nav) nav.classList.remove("nav-banner-attached");
      if (mainContent) mainContent.classList.remove("main-banner-attached");
    }
  }

  // Evaluate on load
  checkEventAlerts();

  // Scripture verse rotation
  const scriptureVerses = document.querySelectorAll(".scripture-verse");
  const scriptureDots = document.querySelector(".scripture-dots");
  if (scriptureVerses.length > 1 && scriptureDots) {
    let currentVerse = 0;

    // Create dot indicators
    scriptureVerses.forEach((_, i) => {
      const dot = document.createElement("button");
      dot.classList.add("scripture-dot");
      dot.setAttribute("aria-label", `Verset ${i + 1}`);
      if (i === 0) dot.classList.add("active");
      dot.addEventListener("click", () => showVerse(i));
      scriptureDots.appendChild(dot);
    });

    const dots = scriptureDots.querySelectorAll(".scripture-dot");

    function showVerse(index) {
      scriptureVerses[currentVerse].classList.remove("active");
      dots[currentVerse].classList.remove("active");
      currentVerse = index;
      scriptureVerses[currentVerse].classList.add("active");
      dots[currentVerse].classList.add("active");
    }

    setInterval(() => {
      showVerse((currentVerse + 1) % scriptureVerses.length);
    }, 8000);
  }
});

// Resource Page Logic
if (window.location.pathname.includes("resurse")) {
  document.addEventListener("DOMContentLoaded", () => {
    const mainElement = document.querySelector("main");
    if (!mainElement) return;

    async function loadSupplementaryResources() {
      try {
        const response = await fetch("content/resources.json");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const sections = await response.json();

        if (sections.length === 0) {
          mainElement.innerHTML = "<p>Nu sunt resurse disponibile momentan.</p>";
          return;
        }

        sections.forEach(sectionData => {
          const sectionElement = document.createElement("section");
          sectionElement.id = sectionData.sectionId.replace("-items", "");

          const titleElement = document.createElement("h2");
          titleElement.classList.add("section-title");
          titleElement.textContent = sectionData.sectionTitle;
          sectionElement.appendChild(titleElement);

          const resourceListDiv = document.createElement("div");
          resourceListDiv.classList.add("resource-list");
          resourceListDiv.id = sectionData.sectionId;

          if (sectionData.items && sectionData.items.length > 0) {
            sectionData.items.forEach(item => {
              const entryDiv = document.createElement("div");
              entryDiv.classList.add("resource-entry");

              const itemTitle = document.createElement("h3");
              const itemLink = document.createElement("a");
              itemLink.href = item.link;
              itemLink.textContent = item.title;
              if (item.link.startsWith("http")) {
                itemLink.target = "_blank";
              }
              itemTitle.appendChild(itemLink);
              entryDiv.appendChild(itemTitle);

              const itemDescription = document.createElement("p");
              itemDescription.textContent = item.description;
              entryDiv.appendChild(itemDescription);

              resourceListDiv.appendChild(entryDiv);
            });
          } else {
            const noItemsPara = document.createElement("p");
            noItemsPara.textContent = "Nu sunt elemente în această secțiune.";
            resourceListDiv.appendChild(noItemsPara);
          }
          sectionElement.appendChild(resourceListDiv);
          mainElement.appendChild(sectionElement);
        });

        // Add the 'Back to main page' button
        const navigationSection = document.createElement("section");
        navigationSection.classList.add("navigation-links");
        const backLinkPara = document.createElement("p");
        const backLink = document.createElement("a");
        backLink.href = "index";
        backLink.classList.add("btn");
        backLink.textContent = "Înapoi la pagina principală";
        backLinkPara.appendChild(backLink);
        navigationSection.appendChild(backLinkPara);
        mainElement.appendChild(navigationSection);
      } catch (error) {
        console.error("Could not load supplementary resources:", error);
        mainElement.innerHTML =
          '<p class="error-message">Nu s-au putut încărca resursele. Vă rugăm încercați mai târziu.</p>';
      }
    }

    loadSupplementaryResources();
  });
}
