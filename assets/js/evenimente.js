document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("eventsContainer");
  if (!container) return;

  function isPastEvent(endDate) {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    return now > end;
  }

  function formatDateRange(startStr, endStr) {
    const start = new Date(startStr);
    const end = endStr ? new Date(endStr) : start;
    if (isNaN(start.getTime())) return { day: "?", month: "", year: "" };
    if (isNaN(end.getTime())) return { day: String(start.getDate()), month: "", year: String(start.getFullYear()) };
    const monthNames = [
      "Ianuarie",
      "Februarie",
      "Martie",
      "Aprilie",
      "Mai",
      "Iunie",
      "Iulie",
      "August",
      "Septembrie",
      "Octombrie",
      "Noiembrie",
      "Decembrie"
    ];

    const sameMonth = start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear();
    const sameDay = start.getDate() === end.getDate() && sameMonth;

    if (sameDay) {
      return { day: String(start.getDate()), month: monthNames[start.getMonth()], year: String(start.getFullYear()) };
    }
    if (sameMonth) {
      return {
        day: `${start.getDate()}–${end.getDate()}`,
        month: monthNames[start.getMonth()],
        year: String(start.getFullYear())
      };
    }
    return {
      day: `${start.getDate()}–${end.getDate()}`,
      month: `${monthNames[start.getMonth()].substring(0, 3)}–${monthNames[end.getMonth()].substring(0, 3)}`,
      year: String(end.getFullYear())
    };
  }

  function createEventItem(event, isPast) {
    const dateInfo = formatDateRange(event.startDate, event.endDate || event.startDate);
    const li = document.createElement("li");
    li.className = "event-item" + (isPast ? " event-item-past" : "");

    const link = document.createElement("a");
    link.className = "event-item-link";
    link.href = event.buttonLink;

    link.innerHTML = `
      <div class="event-date ${isPast ? "event-date-past" : ""}">
        <span class="event-date-day">${dateInfo.day}</span>
        <span class="event-date-month">${dateInfo.month}</span>
        <span class="event-date-year">${dateInfo.year}</span>
      </div>
      <div class="event-details">
        <h4 class="event-title">${event.title}</h4>
        ${event.location ? `<span class="event-location">📍 ${event.location}</span>` : ""}
        ${event.type ? `<span class="event-type-badge">${event.type}</span>` : ""}
      </div>
      <span class="event-arrow">→</span>
    `;

    li.appendChild(link);
    return li;
  }

  async function loadEvents() {
    try {
      const response = await fetch("./content/events.json");
      if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
      const events = await response.json();

      // Separate active vs past
      const activeEvents = events
        .filter(e => !isPastEvent(e.endDate || e.startDate))
        .sort((a, b) => new Date(a.startDate) - new Date(b.startDate));

      const pastEvents = events
        .filter(e => isPastEvent(e.endDate || e.startDate))
        .sort((a, b) => new Date(b.startDate) - new Date(a.startDate));

      container.innerHTML = "";

      // Active events
      if (activeEvents.length > 0) {
        const activeSection = document.createElement("div");
        activeSection.className = "events-group";

        const activeTitle = document.createElement("h3");
        activeTitle.className = "events-group-title";
        activeTitle.textContent = "Evenimente viitoare";
        activeSection.appendChild(activeTitle);

        const activeList = document.createElement("ul");
        activeList.className = "events-list";
        activeEvents.forEach(ev => activeList.appendChild(createEventItem(ev, false)));
        activeSection.appendChild(activeList);

        container.appendChild(activeSection);
      }

      // Past events
      if (pastEvents.length > 0) {
        const pastSection = document.createElement("div");
        pastSection.className = "events-group events-past-group";

        const toggleBtn = document.createElement("button");
        toggleBtn.className = "events-group-toggle";
        toggleBtn.innerHTML = `Evenimente trecute (${pastEvents.length}) <span class="toggle-icon">▼</span>`;
        toggleBtn.addEventListener("click", () => {
          pastSection.classList.toggle("expanded");
        });
        pastSection.appendChild(toggleBtn);

        const pastList = document.createElement("ul");
        pastList.className = "events-list past-events-list";
        pastEvents.forEach(ev => pastList.appendChild(createEventItem(ev, true)));
        pastSection.appendChild(pastList);

        container.appendChild(pastSection);
      }

      if (activeEvents.length === 0 && pastEvents.length === 0) {
        container.innerHTML = "<p>Nu sunt evenimente disponibile momentan.</p>";
      }
    } catch (error) {
      console.error("Could not load events:", error);
      container.innerHTML =
        '<p class="error-message">Nu s-au putut încărca evenimentele. Încearcă din nou mai târziu.</p>';
    }
  }

  loadEvents();
});
