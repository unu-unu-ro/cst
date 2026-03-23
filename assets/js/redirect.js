(function () {
  var TARGET = "https://predicare-expozitiva.ro";
  var DELAY = 2800; // ms

  var css = `
    #rd-overlay {
      position: fixed;
      inset: 0;
      z-index: 99999;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1rem;
      background: rgba(22, 35, 48, 0.72);
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      animation: rd-fade-in 0.5s ease forwards;
    }
    @keyframes rd-fade-in {
      from { opacity: 0; }
      to   { opacity: 1; }
    }
    #rd-card {
      background: #ffffff;
      border-radius: 12px;
      padding: 2.8rem 2.4rem 2.4rem;
      max-width: 420px;
      width: 100%;
      text-align: center;
      box-shadow: 0 24px 60px rgba(0, 0, 0, 0.35);
      animation: rd-slide-up 0.5s ease forwards;
    }
    @keyframes rd-slide-up {
      from { opacity: 0; transform: translateY(18px); }
      to   { opacity: 1; transform: translateY(0);    }
    }
    #rd-badge {
      display: inline-block;
      background: #e8f4f4;
      color: #005a5b;
      font-family: "Work Sans", sans-serif;
      font-size: 0.7rem;
      font-weight: 600;
      letter-spacing: 2px;
      text-transform: uppercase;
      padding: 0.3rem 0.8rem;
      border-radius: 100px;
      margin-bottom: 1.4rem;
    }
    #rd-icon {
      width: 52px;
      height: 52px;
      margin: 0 auto 1.2rem;
      background: linear-gradient(135deg, #2a3f54, #005a5b);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    #rd-icon svg {
      width: 24px;
      height: 24px;
      fill: none;
      stroke: #ffffff;
      stroke-width: 2;
      stroke-linecap: round;
      stroke-linejoin: round;
    }
    #rd-heading {
      font-family: "League Spartan", sans-serif;
      font-size: 1.25rem;
      font-weight: 700;
      color: #2a3f54;
      letter-spacing: 0.5px;
      margin-bottom: 0.5rem;
    }
    #rd-sub {
      font-family: "Work Sans", sans-serif;
      font-size: 0.9rem;
      color: #555555;
      margin-bottom: 1.8rem;
      line-height: 1.5;
    }
    #rd-url {
      display: inline-block;
      font-family: "Work Sans", sans-serif;
      font-size: 0.95rem;
      font-weight: 600;
      color: #005a5b;
      background: #f0f8f8;
      border: 1px solid #c2dede;
      border-radius: 6px;
      padding: 0.45rem 1rem;
      margin-bottom: 2rem;
      word-break: break-all;
    }
    #rd-bar-wrap {
      height: 4px;
      background: #e8eef3;
      border-radius: 4px;
      overflow: hidden;
      margin-bottom: 1rem;
    }
    #rd-bar {
      height: 100%;
      width: 0%;
      background: linear-gradient(90deg, #2a3f54, #005a5b);
      border-radius: 4px;
      transition: width linear;
    }
    #rd-note {
      font-family: "Work Sans", sans-serif;
      font-size: 0.78rem;
      color: #999999;
    }
    #rd-note a {
      color: #005a5b;
      text-decoration: none;
      font-weight: 600;
    }
    #rd-note a:hover { text-decoration: underline; }
  `;

  function injectStyles() {
    var el = document.createElement("style");
    el.textContent = css;
    document.head.appendChild(el);
  }

  function buildOverlay() {
    var rawHTML = `
      <div id="rd-card">
        <div id="rd-badge">Site mutat</div>
        <div id="rd-icon">
          <svg viewBox="0 0 24 24">
            <path d="M5 12h14M13 6l6 6-6 6"/>
          </svg>
        </div>
        <h2 id="rd-heading">Adresă nouă</h2>
        <p id="rd-sub">
          Acest site a fost relocat.<br>
          Vei fi redirecționat automat.
        </p>
        <span id="rd-url">predicare-expozitiva.ro</span>
        <div id="rd-bar-wrap"><div id="rd-bar"></div></div>
        <p id="rd-note">
          Nu se încarcă? <a href="${TARGET}" id="rd-link">Apasă aici</a>
        </p>
      </div>
    `;

    var overlay = document.createElement("div");
    overlay.id = "rd-overlay";
    overlay.innerHTML =
      typeof DOMPurify !== "undefined"
        ? DOMPurify.sanitize(rawHTML, { ADD_ATTR: ["id"] })
        : rawHTML;

    document.body.appendChild(overlay);

    // Kick off the progress bar on next frame so the CSS transition fires
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        var bar = document.getElementById("rd-bar");
        if (bar) {
          bar.style.transitionDuration = DELAY + "ms";
          bar.style.width = "100%";
        }
      });
    });

    setTimeout(function () {
      window.location.replace(TARGET);
    }, DELAY);
  }

  function run() {
    injectStyles();
    if (document.body) {
      buildOverlay();
    } else {
      document.addEventListener("DOMContentLoaded", buildOverlay);
    }
  }

  // Load DOMPurify from CDN, then run. Fall back gracefully on error.
  var purifyScript = document.createElement("script");
  purifyScript.src =
    "https://cdn.jsdelivr.net/npm/dompurify@3/dist/purify.min.js";
  purifyScript.onload = run;
  purifyScript.onerror = run;
  document.head.appendChild(purifyScript);
})();
