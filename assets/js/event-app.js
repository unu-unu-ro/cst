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
  const rightActions = [
    {
      icon: "fa-solid fa-file-alt",
      title: "Listă participanți",
      url: "participanti"
    },
    {
      icon: "fa-solid fa-people-group",
      title: "Grupe de lucru",
      url: "grupe"
    },
    {
      icon: "fa-solid fa-calendar-days",
      title: "Orar zilnic",
      url: "orar"
    },
    {
      icon: "fa-solid fa-book",
      title: "Ghid de pregătire",
      url: "../../ghid"
    }
  ];
  if (headerNav && headerNav.children.length === 0) {
    headerNav.innerHTML = `
            <a href="index" class="back-link">
                <i class="fa-solid fa-arrow-left"></i> Înapoi
            </a>
            <div class="tfill"></div>
            ${rightActions
              .map(action => {
                const currentPath = window.location.pathname;
                const isSelected =
                  currentPath.endsWith("/" + action.url) || currentPath.endsWith("/" + action.url + ".html");
                return `
                <a href="${action.url}" class="action-link${isSelected ? " selected" : ""}" title="${action.title}">
                    <i class="${action.icon}"></i>
                </a>`;
              })
              .join("")}
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

          const presentSet = getPresent();

          let membersHtml = "";
          groupMembers.forEach(member => {
            // Skip Leader if they are the leader of this group
            if (member.role === "Lider") return;

            let badge = "";
            if (member.role === "Ucenic") badge = `<span class="role-tag role-APP" title="Ucenic">U</span>`;
            if (member.role === "Observator") badge = `<span class="role-tag role-OBS" title="Observator">O</span>`;

            const texts = [member.text1, member.text2].filter(t => t).join(", ");
            const absentClass = presentSet.size > 0 && !presentSet.has(member.name) ? " member-absent" : "";

            membersHtml += `
                        <div class="participant-row${absentClass}">
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

// ── Presence helpers (shared by participants & groups pages) ──────────────
const PRESENCE_KEY = "cst-presence-cj2026";

function getPresent() {
  try {
    return new Set(JSON.parse(localStorage.getItem(PRESENCE_KEY) || "[]"));
  } catch (e) {
    return new Set();
  }
}

function savePresent(set) {
  localStorage.setItem(PRESENCE_KEY, JSON.stringify([...set]));
}
// ────────────────────────────────────────────────────────────────────────────

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

      const present = getPresent();

      data.forEach(p => {
        const row = document.createElement("tr");
        const isPresent = present.has(p.name);

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
                    <td class="presence-cell" data-label="Prezent">
                      <button class="presence-btn${isPresent ? " is-present" : ""}" aria-label="Toggle prezență" title="${isPresent ? "Prezent" : "Absent"}">
                        <i class="${isPresent ? "fa-solid fa-circle-check" : "fa-regular fa-circle"}"></i>
                      </button>
                    </td>
                    <td data-label="Nume"><strong>${p.name}</strong>${roleBadge}</td>
                    <td data-label="Text 1">${p.text1 || "-"}</td>
                    <td data-label="Text 2">${p.text2 || "-"}</td>
                `;

        const btn = row.querySelector(".presence-btn");
        btn.addEventListener("click", () => {
          const currentPresent = getPresent();
          if (currentPresent.has(p.name)) {
            currentPresent.delete(p.name);
            btn.classList.remove("is-present");
            btn.querySelector("i").className = "fa-regular fa-circle";
            btn.title = "Absent";
          } else {
            currentPresent.add(p.name);
            btn.classList.add("is-present");
            btn.querySelector("i").className = "fa-solid fa-circle-check";
            btn.title = "Prezent";
          }
          savePresent(currentPresent);
        });

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
      : new Date(start.getTime() + 60 * 60 * 1000); // last session: 1-hour fallback (matches getCurrentEvent)
  if (now >= start && now < end) return "session-in-progress";
  if (now >= end) return "session-past";
  return "";
}

/**
 * Pure function. Walks the schedule and returns the currently in-progress session,
 * or null if none. The last session of a day is kept "in-progress" for 1 hour after
 * its start time before being marked past.
 *
 * @param {object} data  - parsed orar.json
 * @param {Date}   now
 * @returns {{ key: string, day: string, time: string, title: string } | null}
 */
function getCurrentEvent(data, now) {
  for (let dayIndex = 0; dayIndex < data.schedule.length; dayIndex++) {
    const day = data.schedule[dayIndex];
    for (let sessionIndex = 0; sessionIndex < day.sessions.length; sessionIndex++) {
      const session = day.sessions[sessionIndex];
      const start = getSessionDateTime(day.day, session.time);
      if (!start) continue;

      const isLastOfDay = sessionIndex + 1 === day.sessions.length;
      let end;
      if (!isLastOfDay) {
        end = getSessionDateTime(day.day, day.sessions[sessionIndex + 1].time);
      } else {
        // Last session of the day (or whole schedule): cap at 1 hour so it never
        // bleeds into the next day's morning.
        end = new Date(start.getTime() + 60 * 60 * 1000);
      }

      if (now >= start && now < end) {
        return {
          key: `${day.day}|${session.time}|${session.title}`,
          day: day.day,
          time: session.time,
          title: session.title
        };
      }
    }
  }
  return null;
}

/**
 * Pure function. Builds and returns the full schedule HTML string given the data and
 * the current in-progress event (used to annotate sessions).
 *
 * @param {object}      data          - parsed orar.json
 * @param {object|null} currentEvent  - result of getCurrentEvent()
 * @param {Date}        now
 * @returns {string}  HTML to set on the container
 */
function buildScheduleHtml(data, currentEvent, now) {
  let html = "";

  data.schedule.forEach((day, dayIndex) => {
    let sessionsHtml = "";

    day.sessions.forEach((session, sessionIndex) => {
      const isLastOfDay = sessionIndex + 1 === day.sessions.length;
      let nextDayStr = null;
      let nextTimeStr = null;
      if (!isLastOfDay) {
        nextDayStr = day.day;
        nextTimeStr = day.sessions[sessionIndex + 1].time;
      }
      // If last of day, leave nextDayStr/nextTimeStr null so getSessionStatus
      // uses its 1-hour fallback — avoids bleeding into the next day.

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

    html += `
      <div class="group-section day">
        <div class="group-header">${day.day}</div>
        <div class="sessions-list">${sessionsHtml}</div>
      </div>`;
  });

  return html;
}

/**
 * Renders the schedule into the container. Returns the current in-progress event.
 *
 * @param {HTMLElement} container
 * @param {object}      data
 * @returns {{ key: string, day: string, time: string, title: string } | null}
 */
function renderSchedule(container, data) {
  const now = new Date();
  const currentEvent = getCurrentEvent(data, now);

  container.innerHTML = buildScheduleHtml(data, currentEvent, now);

  if (currentEvent) {
    const inProgress = container.querySelector(".session-in-progress");
    if (inProgress) {
      const top = inProgress.getBoundingClientRect().top + window.scrollY - 15;
      window.scrollTo({ top, behavior: "smooth" });
    }
  }

  return currentEvent;
}

/**
 * Schedule Page Logic
 * Fetches data/orar.json once, then re-renders automatically at each session boundary.
 */
function initSchedulePage() {
  const container = document.getElementById("schedule-container");
  let scheduleTimer = null;
  let lastRenderedEvent = undefined; // undefined = never rendered
  let lastRenderedDate = null; // date string of the last render

  function scheduleNextRefresh(data) {
    if (scheduleTimer !== null) {
      clearTimeout(scheduleTimer);
      scheduleTimer = null;
    }
    const now = new Date();
    const allBoundaries = [];
    data.schedule.forEach(day => {
      day.sessions.forEach(session => {
        const dt = getSessionDateTime(day.day, session.time);
        if (dt) allBoundaries.push(dt);
      });
    });
    // Also add start+1h for the last session of every day so the "in-progress"
    // badge is cleared even when there are no more session-start boundaries that day.
    data.schedule.forEach(day => {
      if (day.sessions.length > 0) {
        const lastSession = day.sessions[day.sessions.length - 1];
        const lastStart = getSessionDateTime(day.day, lastSession.time);
        if (lastStart) {
          allBoundaries.push(new Date(lastStart.getTime() + 60 * 60 * 1000));
        }
      }
    });

    const nextBoundary = allBoundaries.filter(dt => dt > now).sort((a, b) => a - b)[0];
    if (nextBoundary) {
      const msUntilNext = nextBoundary.getTime() - now.getTime() + 500;
      console.log(
        `[schedule] next refresh in ${Math.round(msUntilNext / 1000)}s at ${nextBoundary.toLocaleTimeString()}`
      );
      scheduleTimer = setTimeout(() => repaintIfChanged(data), msUntilNext);
    }
  }

  function repaintIfChanged(data) {
    const now = new Date();
    const todayStr = now.toDateString();
    const currentEvent = getCurrentEvent(data, now);
    const currentKey = currentEvent ? currentEvent.key : null;
    const lastKey = lastRenderedEvent !== undefined ? (lastRenderedEvent ? lastRenderedEvent.key : null) : undefined;

    // Repaint if: never rendered, day changed, or in-progress event changed
    const dayChanged = lastRenderedDate !== null && lastRenderedDate !== todayStr;
    const eventChanged = lastKey === undefined || currentKey !== lastKey;

    if (dayChanged || eventChanged) {
      lastRenderedEvent = renderSchedule(container, data);
      lastRenderedDate = todayStr;
    }

    scheduleNextRefresh(data);
  }

  fetch("data/orar.json")
    .then(res => res.json())
    .then(data => {
      if (!data.schedule || data.schedule.length === 0) {
        container.innerHTML = "<p>Programul nu este disponibil (fișierul de date este gol).</p>";
        return;
      }

      lastRenderedEvent = renderSchedule(container, data);
      lastRenderedDate = new Date().toDateString();
      scheduleNextRefresh(data);

      document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "visible") {
          repaintIfChanged(data);
        }
      });

      window.addEventListener("focus", () => {
        repaintIfChanged(data);
      });
    })
    .catch(err => {
      console.error(err);
      container.innerHTML = "<p>Eroare la încărcarea programului.</p>";
    });
}
