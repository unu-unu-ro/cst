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
});
