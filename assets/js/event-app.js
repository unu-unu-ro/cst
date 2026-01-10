/**
 * Unified Event Application Script
 * --------------------------------
 * Handles logic for Home, Groups, Participants, and Schedule pages.
 * Auto-detects the current page context based on DOM elements.
 *
 * Usage: Include this script in all event HTML pages.
 */

document.addEventListener("DOMContentLoaded", () => {
  // 1. Common Layout & Utilities
  initLayout();

  // 2. Router / Dispatcher
  if (document.getElementById("links-container")) {
    initHomePage();
  } else if (document.getElementById("groups-container")) {
    initGroupsPage();
  } else if (document.getElementById("participants-body")) {
    initParticipantsPage();
  } else if (document.getElementById("schedule-container")) {
    initSchedulePage();
  }
});

/**
 * Initializes common layout elements.
 */
function initLayout() {
  // Auto-inject Back Button if header-nav exists but is empty
  const headerNav = document.querySelector(".header-nav");
  if (headerNav && headerNav.children.length === 0) {
    headerNav.innerHTML = `
            <a href="index" class="back-link">
                <i class="fa-solid fa-arrow-left"></i> Înapoi
            </a>
        `;
  }
}

/**
 * Home Page Logic
 * Fetches data/data.json
 */
function initHomePage() {
  const linksContainer = document.getElementById("links-container");
  const titleElement = document.getElementById("event-title");
  const subtitleElement = document.getElementById("event-subtitle");
  const detailsElement = document.getElementById("event-details");

  fetch("data/data.json")
    .then(response => response.json())
    .then(data => {
      // Populate Event Info
      if (data.event) {
        if (titleElement) titleElement.textContent = data.event.title || "";
        if (subtitleElement) subtitleElement.textContent = data.event.subtitle || "";
        if (detailsElement) detailsElement.textContent = data.event.details || "";
      }

      // Populate Links
      const links = data.links || [];
      const linksArray = Array.isArray(data) ? data : links; // Fallback

      linksArray.forEach(link => {
        if (link.active) {
          const linkElement = document.createElement("a");
          linkElement.href = link.url;
          linkElement.className = "link-card";

          if (link.url.startsWith("http")) {
            linkElement.target = "_blank";
            linkElement.rel = "noopener noreferrer";
          }

          linkElement.innerHTML = `
                        <i class="${link.icon}"></i>
                        <span>${link.name}</span>
                    `;

          linksContainer.appendChild(linkElement);
        }
      });
    })
    .catch(error => {
      console.error("Error loading content:", error);
      if (linksContainer) linksContainer.innerHTML = "<p>Error loading content.</p>";
    })
    .finally(() => {
      // Inject Discreet "Back to Hub" footer
      // We do this in finally to ensure it appears after content load attempts,
      // or we could just do it immediately. Doing it immediately is safer for UI stability.
    });

  // Inject Discreet "Back to Hub" footer
  // Appending to the main container (parent of linksContainer)
  // The structure is .container > .profile + .links
  const container = document.querySelector(".container");
  if (container) {
    const footer = document.createElement("div");
    footer.className = "hub-footer";
    const year = new Date().getFullYear();
    footer.innerHTML = `
            <a href="../../index">← Înapoi la Hub</a>
            <div style="font-size: 0.8rem; margin-top: 0.5rem; opacity: 0.7;">
                &copy; ${year} CST Biserica Unu-Unu, Cluj Napoca 🤍
            </div>
        `;
    container.appendChild(footer);
  }
}

/**
 * Groups Page Logic
 * Fetches data/participants.json
 */
function initGroupsPage() {
  const container = document.getElementById("groups-container");

  fetch("data/participants.json")
    .then(res => res.json())
    .then(data => {
      if (!Array.isArray(data) || data.length === 0) throw new Error("No data");

      const groups = {};

      // Group by 'group' field (Leader Name)
      data.forEach(p => {
        const groupKey = p.group || "Nedefinit";
        if (!groups[groupKey]) groups[groupKey] = [];
        groups[groupKey].push(p);
      });

      container.innerHTML = ""; // Clear loading

      Object.keys(groups)
        .sort()
        .forEach(groupName => {
          const groupMembers = groups[groupName];

          // Sorting: Ucenic -> Participant -> Observator
          const roleOrder = { Ucenic: 1, Participant: 2, Observator: 3 };

          groupMembers.sort((a, b) => {
            const roleA = roleOrder[a.role] || 4;
            const roleB = roleOrder[b.role] || 4;
            return roleA - roleB;
          });

          const groupDiv = document.createElement("div");
          groupDiv.className = "group-section";

          let membersHtml = "";
          groupMembers.forEach(member => {
            // Skip Leader if they are the leader of this group
            if (member.role === "Lider") return;

            let badge = "";
            if (member.role === "Ucenic") badge = `<span class="role-tag role-APP" title="Ucenic">U</span>`;
            if (member.role === "Observator") badge = `<span class="role-tag role-OBS" title="Observator">O</span>`;

            const texts = [member.text1, member.text2].filter(t => t).join(", ");

            membersHtml += `
                        <div class="participant-row">
                            <div class="participant-info">
                                ${badge} <span>${member.name}</span>
                            </div>
                            <div class="participant-texts">
                                <small>${texts}</small>
                            </div>
                        </div>
                    `;
          });

          const headerText = groupName === "Nedefinit" ? "Grupă Neasignată" : `${groupName}`;

          groupDiv.innerHTML = `
                    <div class="group-header">${headerText}</div>
                    ${membersHtml}
                `;
          container.appendChild(groupDiv);
        });
    })
    .catch(err => {
      console.error(err);
      container.innerHTML =
        '<p style="text-align:center; padding: 20px;">Împărțirea pe grupe va fi disponibilă în curând.</p>';
    });
}

/**
 * Participants Page Logic
 * Fetches data/participants.json
 */
function initParticipantsPage() {
  const tbody = document.getElementById("participants-body");
  const loading = document.getElementById("loading");
  const counterElement = document.getElementById("participant-count");

  fetch("data/participants.json")
    .then(res => res.json())
    .then(data => {
      if (loading) loading.style.display = "none";

      data.sort((a, b) => a.name.localeCompare(b.name));

      // Update counter
      if (counterElement) {
        counterElement.textContent = data.length;
      }

      data.forEach(p => {
        const row = document.createElement("tr");
        
        // Build role badge if role is not "Participant"
        let roleBadge = "";
        if (p.role === "Ucenic") {
          roleBadge = ` <span class="role-tag role-APP" title="Ucenic">U</span>`;
        } else if (p.role === "Observator") {
          roleBadge = ` <span class="role-tag role-OBS" title="Observator">O</span>`;
        } else if (p.role === "Lider") {
          roleBadge = ` <span class="role-tag role-LID" title="Lider">L</span>`;
        }
        
        row.innerHTML = `
                    <td data-label="Nume"><strong>${p.name}</strong>${roleBadge}</td>
                    <td data-label="Text 1">${p.text1 || "-"}</td>
                    <td data-label="Text 2">${p.text2 || "-"}</td>
                `;
        tbody.appendChild(row);
      });
    })
    .catch(err => {
      console.error(err);
      if (loading) loading.textContent = "Eroare la încărcarea datelor.";
    });
}

/**
 * Schedule Page Logic
 * Fetches data/orar.json
 */
function initSchedulePage() {
  const container = document.getElementById("schedule-container");

  fetch("data/orar.json")
    .then(res => res.json())
    .then(data => {
      container.innerHTML = "";

      data.schedule.forEach(day => {
        const dayDiv = document.createElement("div");
        dayDiv.className = "group-section day";

        let sessionsHtml = "";
        day.sessions.forEach(session => {
          const isBreak =
            session.title.toLowerCase().includes("pauză") ||
            session.title.toLowerCase().includes("prânz") ||
            session.title.toLowerCase().includes("sosire");
          const sessionClass = isBreak ? "session-break" : "session-normal";

          if (session.type === "break" || isBreak) {
            sessionsHtml += `<p class="${sessionClass}"><strong>${session.time}</strong> - ${session.title}</p>`;
          } else {
            const description = session.speaker
              ? `${session.title} <span class="speaker">• ${session.speaker}</span>`
              : session.title;
            sessionsHtml += `<p class="${sessionClass}"><strong>${session.time}</strong> - ${description}</p>`;
          }
        });

        dayDiv.innerHTML = `
                    <div class="group-header">${day.day}</div>
                    ${sessionsHtml}
                `;
        container.appendChild(dayDiv);
      });
    })
    .catch(err => {
      console.error(err);
      container.innerHTML = "<p>Eroare la încărcarea programului.</p>";
    });
}
