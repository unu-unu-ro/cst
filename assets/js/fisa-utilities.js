const USER_NAME_KEY = "fisa-nume";
const STORAGE_KEY = "fisa-form-data";

/**
 * CST Steps
 */
const STEPS = [
  {
    number: 1,
    title: "Structura textului",
    questions: [
      {
        label: "a) Arată structura sub formă de secțiuni, alături de versetele aferente",
        field: "structura-sectiuni",
        placeholder: "Ex: I. Introducere (v. 1-3), II. Dezvoltarea principală (v. 4-10), etc.",
        required: true,
        cls: "large"
      },
      {
        label: "b) Explică strategiile folosite pentru a identifica structura",
        field: "structura-strategii",
        placeholder: "Ex: Cuvinte cheie repetate, conjuncții, schimbări de ton, etc.",
        required: true
      },
      {
        label: "c) Pe ce pune accent această structură?",
        field: "structura-accent",
        required: true
      }
    ]
  },
  {
    number: 2,
    title: "Contextul pasajului",
    hint: "Indicație: Te rugăm să le incluzi doar pe cele care sunt relevante pentru înțelesul pasajului",
    questions: [
      {
        label: "a) Contextul literar",
        field: "context-literar",
        hint: "pasajele dinainte și după"
      },
      {
        label: "b) Contextul istoric",
        field: "context-istoric",
        hint: "împrejurările destinatarilor"
      },
      {
        label: "c) Contextul cultural",
        field: "context-cultural",
        hint: "detalii despre viața oamenilor din acea vreme"
      },
      {
        label: "d) Contextul biblic",
        field: "context-biblic"
      }
    ]
  },
  {
    number: 3,
    title: "Ideea autorului",
    questions: [
      {
        label: "Care este ideea centrală pe care o argumentează autorul în fața ascultătorilor săi?",
        field: "ideea-autorului",
        required: true
      }
    ]
  },
  {
    number: 4,
    title: "Legătura cu Evanghelia",
    questions: [
      {
        label: "Care este legătura dintre acest pasaj și Evanghelia Domnului Isus Cristos?",
        field: "legatura-evanghelia",
        required: true
      }
    ]
  },
  {
    number: 5,
    title: "Ideea ta centrală",
    questions: [
      {
        label: "Care este ideea centrală pe care tu o vei argumenta în fața ascultătorilor tăi?",
        field: "ideea-mea",
        required: true
      }
    ]
  },
  {
    number: 6,
    title: "Aplicații",
    questions: [
      {
        label: "Aplicații pentru cei mântuiți",
        field: "aplicatii-mantuiti",
        required: true
      },
      {
        label: "Aplicații pentru cei nemântuiți",
        field: "aplicatii-nemantuiti",
        required: true
      }
    ]
  },
  {
    number: 7,
    title: "Titlu și schiță",
    questions: [
      {
        label: "Care este titlul predicii tale?",
        field: "titlu-predica",
        required: true,
        type: "text"
      },
      {
        label: "Cum arată schița mesajului?",
        field: "schita-mesaj",
        required: true
      }
    ]
  }
];

function getPageTitle(nume, text) {
  nume = nume || "";
  text = text || "";

  let title = "Formular Fișă de lucru – 7 Pași";

  if (nume && text) {
    title = `${nume} - ${text}`;
  } else if (nume) {
    title = `${nume} - Fișă de lucru`;
  } else if (text) {
    title = `Fișă de lucru - ${text}`;
  }
  return title;
}

function getPersistedData() {
  const savedData = localStorage.getItem(STORAGE_KEY);
  if (savedData) {
    try {
      return JSON.parse(savedData);
    } catch (e) {
      console.error("Error parsing saved form data:", e);
      return {};
    }
  }
  return {};
}

function parseMarkdown(text) {
  if (!text) return "";
  text = text.replace(/(\n)/g, "$1$1"); // Preserve line breaks (in case there is only one newline, which is ignored by markdown)
  text = text.replaceAll("  ", " &nbsp;"); // replace double spaces with non-breaking space
  const html = window.marked.parse(text);
  return window.DOMPurify.sanitize(html);
}
