      // TODO: 
      //  - refactor into separate JS file if needed
      //  - allow markdown for better formatting
      //  - auto indentify bible references and format them differently
      //     - (auto set title attribute with full reference)
      //  - store values in firebase based on user account

      // LocalStorage functionality
      const STORAGE_KEY = "fisa-form-data";

      function saveFormData() {
        const formData = {};
        const inputs = document.querySelectorAll("input, textarea");
        inputs.forEach(input => {
          if (input.name && input.name !== "nume") {
            formData[input.name] = input.value;
          }
        });
        // Save Nume separately
        const numeInput = document.getElementById("nume");
        if (numeInput) {
          localStorage.setItem("fisa-nume", numeInput.value);
        }
        // Save Text in main formData
        const textInput = document.getElementById("text");
        if (textInput) {
          formData["text"] = textInput.value;
        }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));

        // Update page title with name and text
        updatePageTitle();
      }

      function updatePageTitle() {
        const nume = document.getElementById("nume").value || localStorage.getItem("fisa-nume") || "";
        const text = document.getElementById("text").value || "";

        if (nume && text) {
          document.title = `${nume} - ${text}`;
        } else if (nume) {
          document.title = `${nume} - Fișă de lucru`;
        } else if (text) {
          document.title = `Fișă de lucru - ${text}`;
        } else {
          document.title = "Formular Fișă de lucru – 7 Pași";
        }
      }

      function loadFormData() {
        const savedData = localStorage.getItem(STORAGE_KEY);
        if (savedData) {
          try {
            const formData = JSON.parse(savedData);
            Object.keys(formData).forEach(name => {
              const input = document.querySelector(`[name="${name}"]`);
              if (input && name !== "nume") {
                input.value = formData[name];
              }
            });
            // Load Text field
            const textInput = document.getElementById("text");
            if (textInput && formData["text"] !== undefined) {
              textInput.value = formData["text"];
            }
          } catch (e) {
            console.error("Error loading form data:", e);
          }
        }
        // Load Nume separately
        const numeInput = document.getElementById("nume");
        const numeVal = localStorage.getItem("fisa-nume");
        if (numeInput && numeVal !== null) {
          numeInput.value = numeVal;
        }

        // Update page title after loading data
        updatePageTitle();
      }

      function resetFormData() {
        showCustomAlert(
          "Ești sigur că vrei să ștergi toate câmpurile completate?",
          function () {
            localStorage.removeItem(STORAGE_KEY);
            // Do NOT remove fisa-nume
            const inputs = document.querySelectorAll("input, textarea");
            inputs.forEach(input => {
              if (input.name !== "nume") {
                input.value = "";
              }
              input.classList.remove("error");
            });
            document.querySelectorAll(".error-message").forEach(msg => msg.remove());
            // Restore Nume from localStorage
            const numeInput = document.getElementById("nume");
            const numeVal = localStorage.getItem("fisa-nume");
            if (numeInput && numeVal !== null) {
              numeInput.value = numeVal;
            }
            updateProgress();
          },
          true
        );
      }

      // Progress tracking
      function updateProgress() {
        const steps = document.querySelectorAll(".form-step");
        let completedSteps = 0;

        steps.forEach((step, index) => {
          const requiredFields = step.querySelectorAll("[required]");
          const stepCompleted = Array.from(requiredFields).every(field => field.value.trim());

          if (stepCompleted) {
            completedSteps++;
          }
        });

        const progressPercentage = (completedSteps / steps.length) * 100;
        document.getElementById("progressFill").style.width = progressPercentage + "%";

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
        document.getElementById("currentStep").textContent = currentStep;
      }

      // Form validation
      function validateForm() {
        const requiredFields = document.querySelectorAll("[required]");
        let isValid = true;

        // Clear previous errors
        document.querySelectorAll(".error").forEach(field => field.classList.remove("error"));
        document.querySelectorAll(".error-message").forEach(msg => msg.remove());

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
          showCustomAlert("Te rugăm să completezi toate câmpurile obligatorii (marcate cu *) înainte de a salva fișa PDF.");
          // Scroll to first error
          const firstError = document.querySelector(".error");
          if (firstError) {
            firstError.scrollIntoView({ behavior: "smooth", block: "center" });
          }
        }

        return isValid;
      }

      // Custom Alert logic
      function showCustomAlert(message, onConfirm, isConfirm) {
        let alertBox = document.getElementById("custom-alert");
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
        alertBox.querySelector("#custom-alert-message").textContent = message;
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
        const alertBox = document.getElementById("custom-alert");
        if (alertBox) {
          alertBox.style.display = "none";
          alertBox.style.visibility = "hidden";
        }
      }

      // Simple Markdown Parser
      function parseMarkdown(text) {
        if (!text) return "";
        
        // Escape HTML to prevent XSS (basic)
        let html = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

        // Bold: **text**
        html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

        // Italic: *text*
        html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');

        // Headers: # Header (Limit to h3/h4 equivalent for PDF readability)
        html = html.replace(/^#\s+(.*$)/gm, '<h4 style="margin: 0.5rem 0 0.2rem 0; color: #2a3f54;">$1</h4>');
        html = html.replace(/^##\s+(.*$)/gm, '<h5 style="margin: 0.5rem 0 0.2rem 0; color: #2a3f54;">$1</h5>');

        // Lists: - Item
        // A bit tricky with regex only, so we handle single lines. 
        // For a true list, we'd need block parsing, but simple line replacement works for "visual" lists in PDF.
        html = html.replace(/^\-\s+(.*$)/gm, '• $1<br>');

        // Newlines to <br>
        html = html.replace(/\n/g, '<br>');

        return html;
      }

      // PDF Generation using browser print functionality
      function generatePDF() {
        if (!validateForm()) {
          return;
        }

        // Create a new window with the form content formatted for printing
        const printWindow = window.open("", "_blank");
        const formData = new FormData(document.getElementById("fisaForm"));

        // Get today's date
        const today = new Date().toLocaleDateString("ro-RO");
        // Get Nume and Text
        const nume = document.getElementById("nume").value || localStorage.getItem("fisa-nume") || "";
        const text = document.getElementById("text").value || "";

        // Build the HTML content for the PDF with more compact styling
        let htmlContent = `<!DOCTYPE html>
<html lang="ro">
<head>
  <meta charset="UTF-8">
  <title>${document.title}</title>
  <style>
    @page { margin: 1.5cm; size: A4; }
    body { font-family: Arial, sans-serif; line-height: 1.4; color: #333; margin: 0; padding: 0; font-size: 11pt; }
    .header { text-align: center; margin-bottom: 1.5rem; border-bottom: 1px solid #005a5b; padding-bottom: 0.8rem; }
    .header h1 { color: #2a3f54; font-size: 1.4rem; margin: 0 0 0.3rem 0; text-transform: uppercase; letter-spacing: 0.5px; }
    .header p { color: #555; margin: 0; font-style: italic; font-size: 0.9rem; }
    .extra-row { display: flex; justify-content: space-between; align-items: center; margin: 1.2rem 0 0.8rem 0; font-size: 1rem; }
    .extra-row .extra-label { font-weight: bold; color: #2a3f54; margin-right: 0.5rem; }
    .extra-row .extra-value { color: #333; font-style: normal; margin-left: 0.5rem; text-align: right; }
    .date { text-align: right; margin-bottom: 1rem; font-size: 0.8rem; color: #666; }
    .step { margin-bottom: 1.2rem; page-break-inside: avoid; }
    .step h3 { color: #2a3f54; font-size: 1rem; margin-bottom: 0.8rem; text-transform: uppercase; border-bottom: 1px solid #005a5b; padding-bottom: 0.3rem; font-weight: bold; }
    .question { margin-bottom: 0.8rem; }
    .question-label { font-weight: bold; color: #555; margin-bottom: 0.2rem; font-size: 0.9rem; }
    .answer { background: #f9f9f9; padding: 0.5rem; border-left: 2px solid #005a5b; margin-bottom: 0.6rem; white-space: pre-wrap; word-wrap: break-word; font-size: 0.9rem; }
    .empty-answer { color: #999; font-style: italic; }
    @media print { body { font-size: 10pt; line-height: 1.3; } .step { page-break-inside: avoid; margin-bottom: 1rem; } .question { margin-bottom: 0.6rem; } .answer { padding: 0.4rem; margin-bottom: 0.5rem; } .header { margin-bottom: 1rem; padding-bottom: 0.6rem; } .extra-row { font-size: 0.95rem; margin: 0.8rem 0; } }
  </style>
</head>
<body>
  <div class="header">
    <h1>Fișă de lucru pentru Pregătirea Predicii</h1>
    <p>Parcurge cei 7 pași de bază pentru o predicare expozitivă fidelă</p>
  </div>
  <div class="extra-row">
    <span class="extra-label">Nume:</span>
    <span class="extra-value" style="flex:1;text-align:left;">${nume || '<span class="empty-answer">-</span>'}</span>
        <span class="extra-label">Text:</span>
        <span class="extra-value" style="flex:1;text-align:left;">${text || '<span class="empty-answer">-</span>'}</span>
  </div>
  <div class="date">Completat cu <a href="http://cst.unu-unu.ro/fisa">http://cst.unu-unu.ro/fisa</a></div>
  <div class="step">
    <h3>1. Structura textului</h3>
    <div class="question">
      <div class="question-label">a) Arată structura sub formă de secțiuni, alături de versetele aferente</div>
      <div class="answer">${
        parseMarkdown(formData.get("structura-sectiuni")) || '<span class="empty-answer">Nu a fost completat</span>'
      }</div>
    </div>
    <div class="question">
      <div class="question-label">b) Explică strategiile folosite pentru a identifica structura</div>
      <div class="answer">${
        parseMarkdown(formData.get("structura-strategii")) || '<span class="empty-answer">Nu a fost completat</span>'
      }</div>
    </div>
    <div class="question">
      <div class="question-label">c) Pe ce pune accent această structură?</div>
      <div class="answer">${
        parseMarkdown(formData.get("structura-accent")) || '<span class="empty-answer">Nu a fost completat</span>'
      }</div>
    </div>
  </div>
  <div class="step">
    <h3>2. Contextul pasajului</h3>
    <div class="question">
      <div class="question-label">a) Contextul literar</div>
      <div class="answer">${parseMarkdown(formData.get("context-literar")) || '<span class="empty-answer">Nu a fost completat</span>'}</div>
    </div>
    <div class="question">
      <div class="question-label">b) Contextul istoric</div>
      <div class="answer">${parseMarkdown(formData.get("context-istoric")) || '<span class="empty-answer">Nu a fost completat</span>'}</div>
    </div>
    <div class="question">
      <div class="question-label">c) Contextul cultural</div>
      <div class="answer">${
        parseMarkdown(formData.get("context-cultural")) || '<span class="empty-answer">Nu a fost completat</span>'
      }</div>
    </div>
    <div class="question">
      <div class="question-label">d) Contextul biblic</div>
      <div class="answer">${parseMarkdown(formData.get("context-biblic")) || '<span class="empty-answer">Nu a fost completat</span>'}</div>
    </div>
  </div>
`;
        // Steps 3-7
        const steps = [
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
              {
                label: "Aplicații pentru cei mântuiți",
                field: "aplicatii-mantuiti"
              },
              {
                label: "Aplicații pentru cei nemântuiți",
                field: "aplicatii-nemantuiti"
              }
            ]
          },
          {
            number: 7,
            title: "Titlu și schiță",
            questions: [
              {
                label: "Care este titlul predicii tale?",
                field: "titlu-predica"
              },
              {
                label: "Cum arată schița mesajului?",
                field: "schita-mesaj"
              }
            ]
          }
        ];
        steps.forEach(step => {
          htmlContent += `<div class="step"><h3>${step.number}. ${step.title}</h3>`;
          step.questions.forEach(question => {
            htmlContent += `
              <div class="question">
                <div class="question-label">${question.label}</div>
                <div class="answer">${
                  parseMarkdown(formData.get(question.field)) || '<span class="empty-answer">Nu a fost completat</span>'
                }</div>
              </div>
            `;
          });
          htmlContent += `</div>`;
        });
        htmlContent += `</body></html>`;

        // Write content to the new window and print
        printWindow.document.write(htmlContent);
        printWindow.document.close();

        // Wait for content to load, then print
        printWindow.onload = function () {
          setTimeout(() => {
            printWindow.print();
            printWindow.close();
          }, 500);
        };
      }

      // Event listeners
      document.addEventListener("DOMContentLoaded", function () {
        // Set Current Year
        document.querySelectorAll(".current-year").forEach(el => {
          el.textContent = new Date().getFullYear();
        });

        // Load saved form data
        loadFormData();

        // Update progress on input and save data
        const inputs = document.querySelectorAll("input, textarea");
        inputs.forEach(input => {
          input.addEventListener("input", function () {
            updateProgress();
            saveFormData();
          });
          input.addEventListener("blur", function () {
            // Clear error state when user starts typing
            if (this.classList.contains("error") && this.value.trim()) {
              this.classList.remove("error");
              const errorMsg = this.parentNode.querySelector(".error-message");
              if (errorMsg) {
                errorMsg.remove();
              }
            }
            saveFormData();
          });
        });

        // Reset form button
        document.getElementById("resetForm").addEventListener("click", resetFormData);

        // Generate PDF button
        document.getElementById("generatePDF").addEventListener("click", generatePDF);

        // Formatting Help Modal logic
        const modal = document.getElementById("formattingHelpModal");
        const openBtn = document.getElementById("openFormattingHelp");
        const closeBtn = document.getElementById("closeFormattingHelp");

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
          document.addEventListener('keydown', function(event) {
            if (event.key === "Escape" && modal.style.display === "flex") {
              modal.style.display = "none";
            }
          });
        }

        // Initial progress update
        updateProgress();
      });
