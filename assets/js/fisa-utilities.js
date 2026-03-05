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
        placeholder: "Ex: I. Introducere (v. 1-3)\nII. Dezvoltarea principală (v. 4-10)\netc.",
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
        placeholder: "Explică tema principală evidențiată prin structura identificată",
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
        hint: "pasajele dinainte și după",
        placeholder: "Descriere a contextului literar relevant pentru înțelegerea pasajului"
      },
      {
        label: "b) Contextul istoric",
        field: "context-istoric",
        hint: "împrejurările destinatarilor",
        placeholder: "Împrejurările istorice relevante pentru destinatarii originali"
      },
      {
        label: "c) Contextul cultural",
        field: "context-cultural",
        hint: "detalii despre viața oamenilor din acea vreme",
        placeholder: "Aspecte culturale care ajută la înțelegerea textului"
      },
      {
        label: "d) Contextul biblic",
        field: "context-biblic",
        hint: "citate, aluzii sau legături cu alte cărți din Biblie",
        placeholder: "Legături cu alte texte biblice, citate sau aluzii"
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
        hint: "într-o propoziție scurtă",
        placeholder: "Formulează într-o propoziție clară și concisă ideea centrală a autorului",
        required: true
      }
    ]
  },
  {
    number: 4,
    title: "Legătura cu Evanghelia",
    questions: [
      {
        label:
          "Care este legătura dintre acest pasaj și Evanghelia Domnului Isus Cristos? Ce parte a Evangheliei este avută în vedere?",
        field: "legatura-evanghelia",
        placeholder:
          "Explică cum se conectează pasajul cu Evanghelia și ce aspect specific al Evangheliei este evidențiat",
        required: true,
        cls: "large"
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
        hint: "într-o propoziție scurtă",
        placeholder: "Formulează ideea centrală pe care o vei predica, bazată pe înțelegerea pasajului",
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
        placeholder: "Aplicații practice și spirituale pentru creștini",
        required: true,
        cls: "large"
      },
      {
        label: "Aplicații pentru cei nemântuiți",
        field: "aplicatii-nemantuiti",
        placeholder: "Aplicații și îndemnuri pentru cei care nu sunt încă creștini",
        required: true,
        cls: "large"
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
        placeholder: "Un titlu clar și captivant pentru predica ta",
        required: true,
        type: "text"
      },
      {
        label: "Cum arată schița mesajului?",
        field: "schita-mesaj",
        placeholder: "I. Introducere\nII. Punctul principal 1\nIII. Punctul principal 2\nIV. Concluzie",
        required: true,
        cls: "large"
      }
    ]
  }
];

function getPageTitle(nume, text) {
  nume = nume || "";
  text = text || "";
  text = text.replaceAll(":", ".").trim();

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
