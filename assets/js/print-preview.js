function renderPreview(steps, values) {
  document.title = getPageTitle(values["nume"], values["text"]);

  const emptyAns = '<span class="empty-answer">Nu a fost completat</span>';

  let html = `
    <div class="extra-row">
      <span class="extra-label">Nume:</span>
      <span class="extra-value" style="flex:1;text-align:left;">${values["nume"] || emptyAns}</span>
      <span class="extra-label">Text:</span>
      <span class="extra-value" style="flex:1;text-align:left;">${values["text"] || emptyAns}</span>
    </div>
    <div class="date">Completat cu <a href="https://cst.unu-unu.ro/fisa">https://cst.unu-unu.ro/fisa</a></div>
  `;

  html += steps
    .map(
      step => `
    <div class="step" id="step-${step.number}">
      <h3>${step.number}. ${step.title}</h3>
      ${step.questions
        .map(
          q => `
        <div class="question">
          <div class="question-label">${q.label}</div>
          <div class="answer">${parseMarkdown(values[q.field]) || emptyAns}</div>
        </div>`
        )
        .join("")}
    </div>`
    )
    .join("");

  $("#preview-content").innerHTML = html;
}

document.addEventListener("DOMContentLoaded", () => {
  const values = getPersistedData();
  renderPreview(STEPS, values);

  // Auto-print if ?print=1 is in the URL
  if (new URLSearchParams(window.location.search).get("print") === "1") {
    window.addEventListener("load", function () {
      setTimeout(() => {
        window.print();
        // remove ?print=1 from URL after printing to prevent accidental reprints on reload
        history.replaceState(null, "", window.location.pathname);
      }, 500);
    });
  }
});
