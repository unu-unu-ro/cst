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
  // 2. Router / Dispatcher
  if (document.getElementById("links-container")) {
    initHomePage();
  }
  if (document.getElementById("groups-container")) {
    initGroupsPage();
  }
  if (document.getElementById("participants-body")) {
    initParticipantsPage();
  }
  if (document.getElementById("schedule-container")) {
    initSchedulePage();
  }

  // Specific Handout Logic
  if (window.location.pathname.includes("handout")) {
    initHandout();
  }
});

function initHandout() {
  // 1. Fetch Event Info for Title and Cover
  fetch("data/data.json")
    .then(res => res.json())
    .then(data => {
      const event = data.event || {};

      // Set Document Title (affects printed file name)
      const cleanSubtitle = (event.subtitle || "").replace("Predicare din profeți - ", "");
      document.title = `Mapa Participant - ${cleanSubtitle || "Atelier"} - CST 2026`;

      // Populate Cover Page
      const coverContainer = document.getElementById("cover-page");
      if (coverContainer) {
        coverContainer.innerHTML = `
                    <div class="cover-logos">
                        <img src="../../assets/11logo.png" alt="Biserica 11 Logo" style="filter: grayscale(100%);">
                        <img src="https://cst-media.s3.amazonaws.com/graphic/cst-logo-black-web.jpg" alt="CST Logo">
                    </div>
                    <div class="cover-title">${event.title || "Atelier de predicare expozitivă"}</div>
                    <div class="cover-subtitle">${event.subtitle || ""}</div>
                    <div class="cover-details">
                        ${event.details || ""}
                    </div>
                    
                    <div class="cover-fields">
                        <div class="field-row">
                            <span class="field-label">Nume:</span>
                            <div class="field-line"></div>
                        </div>
                        <div class="field-row">
                            <span class="field-label">Grupă:</span>
                            <div class="field-line"></div>
                        </div>
                    </div>
                `;
      }
    })
    .catch(err => console.error("Error loading event data for handout:", err));

  // 2. Inject Print Footer (previously in global logic)
  const footer = document.createElement("div");
  footer.className = "print-footer";
  footer.style.display = "none"; // Hidden on screen, shown in print via CSS
  footer.innerHTML = `
        <img src="../../assets/11logo.png" alt="Biserica 11 Logo" style="height: 25px;">
        <div class="print-footer-text">
            
        </div>
        <img src="https://cst-media.s3.amazonaws.com/graphic/cst-logo-black-web.jpg" alt="CST Logo" style="height: 25px;">
    `;
  document.body.appendChild(footer);

  // 3. Generate Note Pages based on Schedule
  const notesContainer = document.getElementById("notes-container");
  if (notesContainer) {
    fetch("data/orar.json")
      .then(res => res.json())
      .then(data => {
        notesContainer.innerHTML = "";
        let pageCount = 0;

        data.schedule.forEach(day => {
          day.sessions.forEach(session => {
            if (session.pageInPrint === true) {
              pageCount++;
              const notePage = document.createElement("div");
              notePage.className = "note-page";

              // Generate empty space or just header as requested
              /* Lines removed per user request
                           let linesHtml = "";
                           for(let i=0; i<34; i++) {
                               linesHtml += `<div class="note-line"></div>`;
                           }
                           */

              notePage.innerHTML = `
                                <div class="note-header">
                                    <div class="note-title">${session.title}</div>
                                    <div class="note-meta">
                                        ${day.day} | ${session.time} | ${session.speaker || ""}
                                    </div>
                                </div>
                                <!-- No lines, just white space -->
                                <div class="note-lines"></div>
                           `;
              notesContainer.appendChild(notePage);
            }
          });
        });
      })
      .catch(err => console.error("Error loading schedule for notes:", err));
  }

  // 4. Populate Feedback Page
  const feedbackContainer = document.getElementById("feedback-page");
  if (feedbackContainer) {
    feedbackContainer.innerHTML = `
            <div class="page-break"></div>
            <div class="feedback-content" style="height: 100vh; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center;">
                <h1 style="font-size: 32pt; margin-bottom: 50px;">Formular feedback</h1>
                <img src="data/qrevaluare.png" alt="QR Code Feedback" style="width: 300px; height: 300px; margin-bottom: 20px;">
                <p style="font-size: 14pt; color: #666;">Scanează codul de mai sus pentru a ne oferi feedback-ul tău.</p>
            </div>
        `;
  }
}

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

  /* Print logic moved to initHandout exclusively */
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

// Keywords that identify a break/pause session
const BREAK_KEYWORDS = ["pauză", "prânz", "sosire"];

// Romanian month name → 0-based index
const RO_MONTHS = {
  Ianuarie: 0,
  Februarie: 1,
  Martie: 2,
  Aprilie: 3,
  Mai: 4,
  Iunie: 5,
  Iulie: 6,
  August: 7,
  Septembrie: 8,
  Octombrie: 9,
  Noiembrie: 10,
  Decembrie: 11
};

/**
 * Parse a Romanian day string (e.g. "Miercuri, 4 Martie") into a Date (year = current year).
 * @param {string} dayStr
 * @returns {Date|null}
 */
function parseDayDate(dayStr) {
  const match = dayStr.match(/(\d+)\s+(\w+)/);
  if (!match) return null;
  const month = RO_MONTHS[match[2]];
  if (month === undefined) return null;
  return new Date(new Date().getFullYear(), month, parseInt(match[1]));
}

/**
 * Build a full Date from a Romanian day string and a "HH:MM" time string.
 * @param {string} dayStr
 * @param {string} timeStr
 * @returns {Date|null}
 */
function getSessionDateTime(dayStr, timeStr) {
  const date = parseDayDate(dayStr);
  if (!date) return null;
  const [h, m] = timeStr.split(":").map(Number);
  date.setHours(h, m, 0, 0);
  return date;
}

/**
 * Return the CSS status class for a session relative to `now`.
 * @param {Date}        now
 * @param {string}      dayStr
 * @param {string}      timeStr
 * @param {string|null} nextDayStr
 * @param {string|null} nextTimeStr
 * @returns {"session-in-progress"|"session-past"|""}
 */
function getSessionStatus(now, dayStr, timeStr, nextDayStr, nextTimeStr) {
  const start = getSessionDateTime(dayStr, timeStr);
  if (!start) return "";
  const end =
    nextTimeStr && nextDayStr
      ? getSessionDateTime(nextDayStr, nextTimeStr)
      : new Date(start.getTime() + 30 * 60 * 1000); // last session: 30-min fallback
  if (now >= start && now < end) return "session-in-progress";
  if (now >= end) return "session-past";
  return "";
}

/**
 * Schedule Page Logic
 * Fetches data/orar.json once, then re-renders automatically at each session boundary.
 */
function initSchedulePage() {
  const container = document.getElementById("schedule-container");

  fetch("data/orar.json")
    .then(res => res.json())
    .then(data => {
      if (!data.schedule || data.schedule.length === 0) {
        container.innerHTML = "<p>Programul nu este disponibil (fișierul de date este gol).</p>";
        return;
      }
      renderSchedule(container, data);

      // Re-render when the tab becomes visible again (timer may have been throttled/paused)
      document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "visible") {
          renderSchedule(container, data);
        }
      });

      // Also re-render when the window regains focus (e.g. switching back from another app)
      window.addEventListener("focus", () => {
        renderSchedule(container, data);
      });
    })
    .catch(err => {
      console.error(err);
      container.innerHTML = "<p>Eroare la încărcarea programului.</p>";
    });
}

let _scheduleTimer = null;

/**
 * Render the schedule and set a timer to re-render at the next session boundary.
 */
function renderSchedule(container, data) {
  if (_scheduleTimer !== null) {
    clearTimeout(_scheduleTimer);
    _scheduleTimer = null;
  }

  container.innerHTML = "";
  const now = new Date();

  // Collect all session start DateTimes across all days
  const allBoundaries = [];
  data.schedule.forEach((day, dayIndex) => {
    day.sessions.forEach((session, sessionIndex) => {
      const dt = getSessionDateTime(day.day, session.time);
      if (dt) allBoundaries.push(dt);
    });
  });

  // Find the next boundary strictly in the future
  const nextBoundary = allBoundaries.filter(dt => dt > now).sort((a, b) => a - b)[0];

  if (nextBoundary) {
    const msUntilNext = nextBoundary.getTime() - now.getTime() + 500; // +0.5s buffer
    console.log(
      `[schedule] next refresh in ${Math.round(msUntilNext / 1000)}s at ${nextBoundary.toLocaleTimeString()}`
    );
    _scheduleTimer = setTimeout(() => renderSchedule(container, data), msUntilNext);
  }

  data.schedule.forEach((day, dayIndex) => {
    const dayDiv = document.createElement("div");
    dayDiv.className = "group-section day";

    let sessionsHtml = "";

    day.sessions.forEach((session, sessionIndex) => {
      // Determine next session (across days)
      let nextDayStr = null;
      let nextTimeStr = null;
      if (sessionIndex + 1 < day.sessions.length) {
        nextDayStr = day.day;
        nextTimeStr = day.sessions[sessionIndex + 1].time;
      } else if (dayIndex + 1 < data.schedule.length) {
        nextDayStr = data.schedule[dayIndex + 1].day;
        nextTimeStr = data.schedule[dayIndex + 1].sessions[0].time;
      }

      const statusClass = getSessionStatus(now, day.day, session.time, nextDayStr, nextTimeStr);

      const title = session.title.toLowerCase();
      const isBreak = BREAK_KEYWORDS.some(kw => title.includes(kw));
      const baseClass = isBreak ? "session-break" : "session-normal";
      const sessionClass = statusClass ? `${baseClass} ${statusClass}` : baseClass;
      const isInProgress = statusClass === "session-in-progress";
      const badgeAfterHour = isInProgress ? ` <span class="now-badge now-badge--mobile">● ACUM</span>` : "";
      const badgeAfterText = isInProgress ? ` <span class="now-badge now-badge--desktop">● ACUM</span>` : "";

      if (session.type === "break" || isBreak) {
        sessionsHtml += `<p class="${sessionClass}"><strong>${session.time}${badgeAfterHour}</strong> ${session.title}${badgeAfterText}</p>`;
      } else {
        const description = session.speaker
          ? `${session.title} <span class="speaker">• ${session.speaker}</span>`
          : session.title;
        sessionsHtml += `<p class="${sessionClass}"><strong>${session.time}${badgeAfterHour}</strong> ${description}${badgeAfterText}</p>`;
      }
    });

    dayDiv.innerHTML = `
                    <div class="group-header">${day.day}</div>
                    <div class="sessions-list">
                        ${sessionsHtml}
                    </div>
                `;
    container.appendChild(dayDiv);
  });
}
