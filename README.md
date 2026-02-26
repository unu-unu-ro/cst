# CST - Ateliere de predicare expozitivă

Acest proiect găzduiește pagina web a CST Unu Unu. Pagina include informații despre evenimente, resurse și ghiduri pentru atelierele de predicare expozitivă.

## 🌐 Link activ

[![Live](https://img.shields.io/badge/Vezi_live-cst.unu--unu.ro-brightgreen?style=for-the-badge)](https://cst.unu-unu.ro)

---

## 📦 Structura proiectului

```
📁 root
│
├── index.html         # Conferința principală
├── assets/
│   ├── css/           # Stiluri (inclusiv event-style.css)
│   ├── js/            # Scripturi (inclusiv event-app.js)
│   └── ...
├── content/           # Date JSON globale
├── events/            # Folder pentru evenimente
│   ├── CJ-2026/       # Exemplu eveniment
│   │   ├── data/      # JSON-uri specifice evenimentului
│   │   ├── index.html
│   │   └── ...
└── README.md
```

## 🚀 Cum se creează un nou eveniment

Platforma este construită pentru a fi ușor extensibilă. Pentru a adăuga un nou eveniment (ex: `CJ-2027`):

1.  **Copiază structura**:
    Duplică folderul `events/CJ-2026` și redenumește-l (ex: `events/CJ-2027`).

2.  **Actualizează Datele**:
    În noul folder `events/CJ-2027/data/`, editează fișierele JSON:
    - `data.json`: Titlul evenimentului, subtitlu, link-uri.
    - `participants.json`: Lista de participanți și grupe.
    - `orar.json`: Programul evenimentului.

3.  **Gata!**:
    Nu este necesară nicio modificare de cod HTML/JS/CSS. Logica globală din `assets/js/event-app.js` se va ocupa automat de noul eveniment.

4.  **Adaugă în Lista Principală** (Opțional):
    Dacă dorești ca evenimentul să apară pe prima pagină, adaugă-l în `content/events.json`.

---

## 🎯 Funcționalități

- Pagina principală cu informații generale despre conferință și ateliere
- Secțiune pentru resurse, încărcate dintr-un fișier JSON
- Secțiune pentru evenimente viitoare, încărcate dintr-un fișier JSON
- Navigare între tab-uri pentru o experiență organizată
- Sistem de carduri pentru prezentarea informațiilor
- Design responsive, optimizat pentru desktop și mobil

---

## 🛠️ Tehnologii utilizate

- HTML5 pentru structura paginii
- CSS3 pentru design și layout
- JavaScript pentru manipulare DOM și încărcare din JSON
- GitHub Pages pentru hosting
- Prettier pentru formatarea codului

---

## 📚 Instrucțiuni de instalare

1. Clonează repository-ul:

```bash
git clone https://github.com/unu-unu-ro/cst.git
cd cst
npm install
```

2. Run Prettier to format the code:

```bash
npx prettier --write .
```

3. Start

```bash
npm start
```

---

## ✅ Contribuții

- Feedback-ul și propunerile de îmbunătățire sunt binevenite.
- Pentru contribuții, deschide un Pull Request sau contactează echipa organizatoare.

---

## 📧 Contact

Pentru întrebări sau sugestii, poți contacta echipa Unu-Unu la: [contact@unu-unu.ro](mailto:contact@unu-unu.ro)
