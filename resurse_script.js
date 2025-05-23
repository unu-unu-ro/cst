document.addEventListener("DOMContentLoaded", () => {
  const mainElement = document.querySelector("main");

  async function loadSupplementaryResources() {
    try {
      const response = await fetch("../content/supplementary_resources.json");
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
        sectionElement.id = sectionData.sectionId.replace("-items", ""); // e.g., carti-recomandate

        const titleElement = document.createElement("h2");
        titleElement.classList.add("section-title");
        titleElement.textContent = sectionData.sectionTitle;
        sectionElement.appendChild(titleElement);

        const resourceListDiv = document.createElement("div");
        resourceListDiv.classList.add("resource-list");
        resourceListDiv.id = sectionData.sectionId; // e.g., carti-recomandate-items

        if (sectionData.items && sectionData.items.length > 0) {
          sectionData.items.forEach(item => {
            const entryDiv = document.createElement("div");
            entryDiv.classList.add("resource-entry");

            const itemTitle = document.createElement("h3");
            const itemLink = document.createElement("a");
            itemLink.href = item.link;
            itemLink.textContent = item.title;
            if (item.link.startsWith("http")) {
              // Open external links in new tab
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

      // Add the 'Back to main page' button after loading content
      const navigationSection = document.createElement("section");
      navigationSection.classList.add("navigation-links");
      const backLinkPara = document.createElement("p");
      const backLink = document.createElement("a");
      backLink.href = "../index.html";
      backLink.classList.add("btn");
      backLink.textContent = "Înapoi la pagina principală";
      backLinkPara.appendChild(backLink);
      navigationSection.appendChild(backLinkPara);
      mainElement.appendChild(navigationSection);
    } catch (error) {
      console.error("Could not load supplementary resources:", error);
      mainElement.innerHTML = '<p class="error-message">Nu s-au putut încărca resursele. Vă rugăm încercați mai târziu.</p>';
    }
  }

  loadSupplementaryResources();
});
