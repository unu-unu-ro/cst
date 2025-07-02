document.addEventListener("DOMContentLoaded", () => {
  const tabs = document.querySelectorAll(".tab-link");
  const tabContents = document.querySelectorAll(".tab-content");
  const eventsGrid = document.querySelector("#events .card-grid");
  const resourcesGrid = document.querySelector("#resources .card-grid");

  // Function to create a card element
  function createCard(item) {
    const card = document.createElement("div");
    card.classList.add("card");

    const title = document.createElement("h3");
    title.textContent = item.title;

    const description = document.createElement("p");
    description.textContent = item.description;
    description.setAttribute("title", item.description); // Add full description as a tooltip

    // Check if text is truncated and add class if so
    // This check is a bit basic and might need refinement for perfect accuracy across all browsers/scenarios
    // It relies on the height of the content vs the scrollable height
    requestAnimationFrame(() => {
      // Use requestAnimationFrame to ensure styles are applied
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
      gridElement.innerHTML = ""; // Clear existing content
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

  // Load initial content
  loadContent("events.json", eventsGrid);
  loadContent("resources.json", resourcesGrid);

  tabs.forEach(tab => {
    tab.addEventListener("click", event => {
      event.preventDefault(); // Prevent default anchor behavior

      // Remove active class from all tabs and content
      tabs.forEach(t => t.classList.remove("active"));
      tabContents.forEach(tc => tc.classList.remove("active"));

      // Add active class to the clicked tab
      tab.classList.add("active");

      // Add active class to the corresponding content
      const targetId = tab.dataset.target;
      const targetContent = document.getElementById(targetId);
      if (targetContent) {
        targetContent.classList.add("active");
      }
    });
  });

  // Back to Content Start button functionality
  const backToContentStartBtn = document.getElementById("backToContentStartBtn");
  const mainContentStartElement = document.getElementById("cuprins"); // For ghid.html

  // Sticky navigation for index.html
  const nav = document.querySelector(".tab-nav");
  const mainContent = document.querySelector("main"); // Assuming there's only one main element

  if (nav && mainContent) {
    const navHeight = nav.offsetHeight;
    let navOffsetTop = nav.offsetTop;

    function updateNavOffset() {
      // Recalculate offset if not fixed, in case of layout changes (e.g. window resize, though not explicitly handled here)
      if (!nav.classList.contains("fixed-nav")) {
        navOffsetTop = nav.offsetTop;
      }
    }

    window.addEventListener("scroll", () => {
      updateNavOffset(); // Ensure offset is current before checking scroll position
      if (window.pageYOffset > navOffsetTop) {
        if (!nav.classList.contains("fixed-nav")) {
          nav.classList.add("fixed-nav");
          mainContent.style.paddingTop = `${navHeight}px`;
          mainContent.classList.add("main-content-padded"); // Add class for potential further styling
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
});
