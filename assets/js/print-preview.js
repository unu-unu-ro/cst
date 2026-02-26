const STEPS = [
  {
    number: 1,
    title: "Structura textului",
    questions: [
      {
        label: "a) Arată structura sub formă de secțiuni, alături de versetele aferente",
        field: "structura-sectiuni"
      },
      { label: "b) Explică strategiile folosite pentru a identifica structura", field: "structura-strategii" },
      { label: "c) Pe ce pune accent această structură?", field: "structura-accent" }
    ]
  },
  {
    number: 2,
    title: "Contextul pasajului",
    questions: [
      { label: "a) Contextul literar", field: "context-literar" },
      { label: "b) Contextul istoric", field: "context-istoric" },
      { label: "c) Contextul cultural", field: "context-cultural" },
      { label: "d) Contextul biblic", field: "context-biblic" }
    ]
  },
  {
    number: 3,
    title: "Ideea autorului",
    questions: [
      {
        label: "Care este ideea centrală pe care o argumentează autorul în fața ascultătorilor săi?",
        field: "ideea-autorului"
      }
    ]
  },
  {
    number: 4,
    title: "Legătura cu Evanghelia",
    questions: [
      {
        label: "Care este legătura dintre acest pasaj și Evanghelia Domnului Isus Cristos?",
        field: "legatura-evanghelia"
      }
    ]
  },
  {
    number: 5,
    title: "Ideea ta centrală",
    questions: [
      {
        label: "Care este ideea centrală pe care tu o vei argumenta în fața ascultătorilor tăi?",
        field: "ideea-mea"
      }
    ]
  },
  {
    number: 6,
    title: "Aplicații",
    questions: [
      { label: "Aplicații pentru cei mântuiți", field: "aplicatii-mantuiti" },
      { label: "Aplicații pentru cei nemântuiți", field: "aplicatii-nemantuiti" }
    ]
  },
  {
    number: 7,
    title: "Titlu și schiță",
    questions: [
      { label: "Care este titlul predicii tale?", field: "titlu-predica" },
      { label: "Cum arată schița mesajului?", field: "schita-mesaj" }
    ]
  }
];

function renderPreview(values) {
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

  html += STEPS.map(
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
  ).join("");

  $("#preview-content").innerHTML = html;
}

document.addEventListener("DOMContentLoaded", () => {
  const values = getPersistedData();
  renderPreview(values);

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
