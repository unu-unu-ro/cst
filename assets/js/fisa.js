// TODO
//  - allow markdown for better formatting
//  - auto indentify bible references and format them differently
//     - (auto set title attribute with full reference)
//  - store values in firebase based on user account
//  - updatePreviewWindow: optimize by only sending updated field instead of reloading entire preview

// PDF Generation using browser print functionality
let previewWindow = null;

function autoResizeTextareas(input) {
  let textareas;
  if (input && input.tagName.toLowerCase() === "textarea") {
    textareas = [input];
  } else {
    textareas = $$("textarea");
  }
  textareas.forEach(textarea => {
    textarea.style.height = "auto";
    textarea.style.height = textarea.scrollHeight + 2 + "px";
  });
}

function persistFormData(input) {
  const formData = getFormValues();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));

  // Save Nume separately
  const numeInput = $("#nume");
  localStorage.setItem(USER_NAME_KEY, numeInput.value);

  // Update page title with name and text
  updatePageTitle(formData.nume, formData.text);
  autoResizeTextareas(input);
  return formData;
}

function updatePageTitle(nume, text) {
  document.title = getPageTitle(nume, text);
}

function loadFormData() {
  const data = getPersistedData();
  setFormValues(data);

  // Load Nume separately
  const numeInput = $("#nume");
  const numeVal = localStorage.getItem(USER_NAME_KEY);
  if (numeVal !== null) {
    numeInput.value = numeVal;
  }

  updatePageTitle(numeInput.value, $("#text").value);
  autoResizeTextareas();
}

function resetFormData() {
  showCustomAlert(
    "Ești sigur că vrei să ștergi toate câmpurile completate?",
    function () {
      localStorage.removeItem(STORAGE_KEY);
      $("form").reset();
      $("#text").value = ""; // text is outside form, so reset separately
      const inputs = $$("input, textarea");
      inputs.forEach(input => {
        input.classList.remove("error");
      });
      $$(".error-message").forEach(msg => msg.remove());
      updateProgress();
      autoResizeTextareas();
    },
    true
  );
}

// Progress tracking
function updateProgress() {
  const steps = $$(".form-step");
  let completedSteps = 0;

  steps.forEach((step, index) => {
    const requiredFields = step.querySelectorAll("[required]");
    const stepCompleted = Array.from(requiredFields).every(field => field.value.trim());

    if (stepCompleted) {
      completedSteps++;
    }
  });

  const progressPercentage = (completedSteps / steps.length) * 100;
  $("#progressFill").style.width = progressPercentage + "%";

  // Update current step indicator
  let currentStep = 1;
  for (let i = 0; i < steps.length; i++) {
    const requiredFields = steps[i].querySelectorAll("[required]");
    const stepCompleted = Array.from(requiredFields).every(field => field.value.trim());
    if (!stepCompleted) {
      currentStep = i + 1;
      break;
    }
    if (i === steps.length - 1) {
      currentStep = steps.length;
    }
  }
  $("#currentStep").textContent = currentStep;
}

// Form validation
function validateForm() {
  const requiredFields = $$("[required]");
  let isValid = true;

  // Clear previous errors
  $$(".error").forEach(field => field.classList.remove("error"));
  $$(".error-message").forEach(msg => msg.remove());

  requiredFields.forEach(field => {
    if (!field.value.trim()) {
      field.classList.add("error");

      const errorMsg = document.createElement("div");
      errorMsg.className = "error-message";
      errorMsg.textContent = "Acest câmp este obligatoriu";
      field.parentNode.appendChild(errorMsg);

      isValid = false;
    }
  });

  if (!isValid) {
    // Scroll to first error
    const firstError = $(".error");
    if (firstError) {
      firstError.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }

  return isValid;
}

// Custom Alert logic
function showCustomAlert(message, onConfirm, isConfirm) {
  let alertBox = $("#custom-alert");
  if (!alertBox) {
    alertBox = document.createElement("div");
    alertBox.id = "custom-alert";
    alertBox.className = "custom-alert";
    alertBox.style.display = "none";
    alertBox.style.position = "fixed";
    alertBox.style.top = "0";
    alertBox.style.left = "0";
    alertBox.style.width = "100vw";
    alertBox.style.height = "100vh";
    alertBox.style.zIndex = "9999";
    alertBox.style.background = "rgba(0,0,0,0.25)";
    alertBox.style.display = "flex";
    alertBox.style.alignItems = "center";
    alertBox.style.justifyContent = "center";
    alertBox.innerHTML = `
            <div class="custom-alert-content" style="background: #fff; border-radius: 10px; box-shadow: 0 4px 24px rgba(0,0,0,0.18); padding: 2rem; min-width: 320px; max-width: 90vw; text-align: center;">
              <span id="custom-alert-message" style="display:block; margin-bottom: 1.5rem; font-size: 1.1rem;"></span>
              <div class="custom-alert-actions"></div>
            </div>
          `;
    document.body.appendChild(alertBox);
  }
  alertBox.style.display = "flex";
  alertBox.style.visibility = "visible";
  alertBox.querySelector("#custom-alert-message").innerHTML = message;
  const actions = alertBox.querySelector(".custom-alert-actions");
  actions.innerHTML = "";
  if (isConfirm) {
    const confirmBtn = document.createElement("button");
    confirmBtn.textContent = "Da";
    confirmBtn.className = "btn-primary";
    confirmBtn.style.marginRight = "1rem";
    confirmBtn.onclick = function () {
      closeCustomAlert();
      if (onConfirm) onConfirm();
    };
    const cancelBtn = document.createElement("button");
    cancelBtn.textContent = "Nu";
    cancelBtn.className = "btn-secondary";
    cancelBtn.onclick = function () {
      closeCustomAlert();
    };
    actions.appendChild(confirmBtn);
    actions.appendChild(cancelBtn);
  } else {
    const okBtn = document.createElement("button");
    okBtn.textContent = "OK";
    okBtn.className = "btn-primary";
    okBtn.onclick = function () {
      closeCustomAlert();
    };
    actions.appendChild(okBtn);
  }
}

function closeCustomAlert() {
  const alertBox = $("#custom-alert");
  if (alertBox) {
    alertBox.style.display = "none";
    alertBox.style.visibility = "hidden";
  }
}

function showCountdownToast(message, seconds, onComplete) {
  let toast = $("#countdown-toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "countdown-toast";
    toast.style.cssText = `
      position: fixed; bottom: 2rem; left: 50%; transform: translateX(-50%);
      background: #333; color: #fff; padding: 0.85rem 1.5rem;
      border-radius: 8px; font-size: 1rem; z-index: 9999;
      box-shadow: 0 4px 16px rgba(0,0,0,0.25); text-align: center;
      transition: opacity 0.3s;
    `;
    document.body.appendChild(toast);
  }

  let remaining = seconds;
  toast.style.opacity = "1";
  toast.style.display = "block";
  toast.textContent = `${message} ${remaining}s...`;

  const interval = setInterval(() => {
    remaining--;
    if (remaining > 0) {
      toast.textContent = `${message} ${remaining}s...`;
    } else {
      clearInterval(interval);
      toast.style.opacity = "0";
      setTimeout(() => {
        toast.style.display = "none";
      }, 300);
      if (onComplete) onComplete();
    }
  }, 1000);
}

// Load JSON file and populate form
function loadJson() {
  const fileInput = document.createElement("input");
  fileInput.type = "file";
  fileInput.accept = ".json,application/json";
  fileInput.style.display = "none";
  document.body.appendChild(fileInput);

  fileInput.addEventListener("change", function () {
    const file = fileInput.files[0];
    if (!file) {
      document.body.removeChild(fileInput);
      return;
    }
    const reader = new FileReader();
    reader.onload = function (e) {
      try {
        const data = JSON.parse(e.target.result);
        setFormValues(data);
        persistFormData();
        updateProgress();
        showCustomAlert(
          `Fișa a fost încărcată cu succes din <strong>${file.name}</strong>. <br />
          (Document modificat la: <strong>${new Date(data.date).toLocaleString("ro-RO")}</strong>)`
        );
      } catch (err) {
        console.error("Error loading JSON:", err);
        showCustomAlert("Fișierul selectat nu este un JSON valid.");
      } finally {
        document.body.removeChild(fileInput);
      }
    };
    reader.readAsText(file);
  });

  fileInput.click();
}

function downloadJson() {
  const values = getFormValues();
  const date = new Date();
  values.date = date.toISOString();
  const rawData = JSON.stringify(values, null, 2);
  // Swedish locale) produces ISO-like local time.
  const dateStr = date.toLocaleString("sv").slice(0, 16).replace(":", "-").replace(" ", "_");
  const rawName = `${getPageTitle(values["nume"], values["text"])} - ${dateStr} - raw.json`;
  download(rawData, getFileName(rawName), "application/json");
}

function renderSteps(steps) {
  const el = $("#cst-steps");
  if (!el) return;

  const stepsHtml = steps
    .map(
      step => `
    <div class="form-step">
      <h3>${step.number}. ${step.title}</h3>
      ${step.hint ? `<div class="hint">${step.hint}</div>` : ""}
      ${step.questions
        .map(q => {
          const required = q.required ? " required" : "";
          const reqMark = q.required ? ' <span class="required">*</span>' : "";
          const placeholder = q.placeholder ? q.placeholder.replace(/\n/g, "&#10;") : "";
          const phAttr = placeholder ? ` placeholder="${placeholder}"` : "";
          const field =
            q.type === "text"
              ? `<input type="text" id="${q.field}" name="${q.field}"${required}${phAttr} class="form-group-input" />`
              : `<textarea id="${q.field}" name="${q.field}"${required}${q.cls ? ` class="${q.cls}"` : ""}${phAttr}></textarea>`;
          return `
        <div class="form-group">
          <label for="${q.field}">
            ${q.label}${reqMark}
          </label>
          ${q.hint ? `<div class="hint">${q.hint}</div>` : ""}
          ${field}
        </div>`;
        })
        .join("")}
    </div>`
    )
    .join("");

  el.innerHTML = stepsHtml;
}

function openPreview() {
  persistFormData();
  if (previewWindow && !previewWindow.closed) {
    previewWindow.location.reload();
    previewWindow.focus();
  } else {
    previewWindow = window.open("print-preview", "_blank");
  }
}

function generatePDF() {
  const isValid = validateForm();

  if (isValid) {
    openPreview();
    return;
  }

  // Form is invalid: show countdown in existing alert then open preview
  let remaining = 6;
  const baseMsg =
    "Te rugăm să completezi toate câmpurile obligatorii (marcate cu *) înainte de a salva fișa PDF.<br><br><em>Preview-ul se va deschide în</em>";
  showCustomAlert(`${baseMsg} <strong>${remaining}s</strong>...`);
  const countInterval = setInterval(() => {
    remaining--;
    const msgEl = $("#custom-alert-message");
    if (remaining > 0 && msgEl) {
      msgEl.innerHTML = `${baseMsg} <strong>${remaining}s</strong>...`;
    } else {
      clearInterval(countInterval);
      closeCustomAlert();
      openPreview();
    }
  }, 1000);
}

function updatePreviewWindow(input) {
  // TODO - optimize by only sending updated field instead of reloading entire preview
  if (previewWindow && !previewWindow.closed) {
    console.info("Updating preview window due to input[%o] change:", input.name);
    previewWindow.location.reload();
  }
}

// Event listeners
document.addEventListener("DOMContentLoaded", function () {
  renderSteps(STEPS);

  // Set Current Year
  $$(".current-year").forEach(el => {
    el.textContent = new Date().getFullYear();
  });

  // Load saved form data
  loadFormData();

  // Update progress on input and save data
  const inputs = $$("input, textarea");
  inputs.forEach(input => {
    input.addEventListener(
      "input",
      debounce(function () {
        updateProgress();
        persistFormData(input);
        updatePreviewWindow(input);
      }, 300)
    );

    input.addEventListener("blur", function () {
      // Clear error state when user starts typing
      if (this.classList.contains("error") && this.value.trim()) {
        this.classList.remove("error");
        const errorMsg = this.parentNode.querySelector(".error-message");
        if (errorMsg) {
          errorMsg.remove();
        }
      }
      persistFormData(input);
    });
  });

  // Reset form button
  $("#resetForm").addEventListener("click", resetFormData);

  $("#loadJson").addEventListener("click", loadJson);
  $("#downloadJson").addEventListener("click", downloadJson);

  // Generate PDF button
  $("#generatePDF").addEventListener("click", generatePDF);

  // Formatting Help Modal logic
  const modal = $("#formattingHelpModal");
  const openBtn = $("#openFormattingHelp");
  const closeBtn = $("#closeFormattingHelp");

  if (openBtn && modal && closeBtn) {
    openBtn.addEventListener("click", function () {
      modal.style.display = "flex";
    });

    closeBtn.addEventListener("click", function () {
      modal.style.display = "none";
    });

    // Close when clicking outside
    modal.addEventListener("click", function (e) {
      if (e.target === modal) {
        modal.style.display = "none";
      }
    });

    // Close on Escape key
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && modal.style.display === "flex") {
        modal.style.display = "none";
      }
    });
  }

  // Initial progress update
  updateProgress();
});
