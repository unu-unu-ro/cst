const USER_NAME_KEY = "fisa-nume";
const STORAGE_KEY = "fisa-form-data";

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
