// ===============================
// GhostVision '94 — Neon Guestbook JS
// ===============================

// Google Form Entry IDs
const ENTRY_NAME = "entry.371490563";
const ENTRY_EMAIL = "entry.394002833";
const ENTRY_TEXT = "entry.982526811";

// Google Form POST URL
const GOOGLE_FORM_POST =
  "https://docs.google.com/forms/d/e/1FAIpQLSczKWxEpkr-Psc230Q3gosFNSil5BzKIjsBoTeuWHo111lMwg/formResponse";

// Form + iframe
const form = document.getElementById("gform");
const iframe = document.getElementById("hidden_iframe");

let submitted = false;

// Rewrite form attributes
form.setAttribute("method", "POST");
form.setAttribute("action", GOOGLE_FORM_POST);
form.setAttribute("target", "hidden_iframe");

// Rewrite field names
document.getElementById("GOOGLE_ENTRY_ID_Name").setAttribute("name", ENTRY_NAME);
document.getElementById("GOOGLE_ENTRY_ID_Email").setAttribute("name", ENTRY_EMAIL);
document.getElementById("GOOGLE_ENTRY_ID_TextArea").setAttribute("name", ENTRY_TEXT);

// Handle submission
form.addEventListener("submit", function () {
  submitted = true;
});

// Close popup after iframe loads
iframe.onload = function () {
  if (submitted) {
    location.hash = ""; // close popup
    form.reset();

    if (typeof grecaptcha !== "undefined") {
      grecaptcha.reset();
    }

    submitted = false;
  }
};

// ===============================
// Helpers
// ===============================

function sanitize(str) {
  if (!str) return "";
  str = str.replace(/[^\x00-\x7F]/g, ""); // remove unicode spam
  return str.replace(/[&<>"']/g, (m) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  }[m]));
}

// ===============================
// Safe Timestamp Parser (DD/MM/YYYY 24h)
// ===============================

function parseSheetTimestamp(ts) {
  // Example: "22/09/2026 10:50:53"
  const [datePart, timePart] = ts.split(" ");
  const [day, month, year] = datePart.split("/").map(Number);
  const [hours, minutes] = timePart.split(":").map(Number);

  return new Date(year, month - 1, day, hours, minutes);
}

// ===============================
// 1994 Date Mapping (Option B)
// Today (22/09/2026) → August 2, 1994
// ===============================

function mapTo1994(dateString) {
  const realDate = parseSheetTimestamp(dateString);

  const startOfYear = new Date(realDate.getFullYear(), 0, 1);
  const dayOfYear = Math.floor((realDate - startOfYear) / (1000 * 60 * 60 * 24));

  const mapped = new Date(1994, 0, 1);

  // Offset so 22/09/2026 (day 265) → August 2, 1994 (day 214)
  const OFFSET_DAYS = -51;
  mapped.setDate(mapped.getDate() + dayOfYear + OFFSET_DAYS);

  const months = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December"
  ];

  const month = months[mapped.getMonth()];
  const day = mapped.getDate();
  const year = mapped.getFullYear();

  return `${month} ${day}, ${year}`;
}

function mapTimeTo1994(dateString) {
  const realDate = parseSheetTimestamp(dateString);

  let hours = realDate.getHours();
  const minutes = String(realDate.getMinutes()).padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";

  hours = hours % 12 || 12;

  return `${hours}:${minutes} ${ampm}`;
}

// ===============================
// Load Latest 5 Entries (Neon Version)
// ===============================

async function loadLatestEntries() {
  const container = document.getElementById("LatestEntries");
  container.innerHTML = "<p style='opacity:0.7;'>Loading latest entries...</p>";

  try {
    const sheetURL =
      "https://opensheet.elk.sh/128BR0KeT6EGfBZZVAeSMXQjB5b-oJz0Y7xxQPn4ejjc/Form Responses 1";

    const response = await fetch(sheetURL);
    const data = await response.json();

    const sorted = data.reverse();

    container.innerHTML = "";

    for (let i = 0; i < 5 && i < sorted.length; i++) {
      const row = sorted[i];

      const name = sanitize(row.Name);
      const text = sanitize(row.Guestbook_Entry);

      const retroDate = mapTo1994(row.Timestamp);
      const retroTime = mapTimeTo1994(row.Timestamp);

      const entry = document.createElement("div");
      entry.className = "guestbook-entry";
      entry.innerHTML = `
        <span class="entry-name">${name}</span>
        <span class="entry-date">${retroDate} — ${retroTime}</span>
        <p style="margin-top:4px;font-size:0.85rem;">${text}</p>
      `;
      container.appendChild(entry);
    }
  } catch (err) {
    container.innerHTML = "<p style='color:red;'>Failed to load entries.</p>";
  }
}

// ===============================
// Load ALL Entries (Neon Version)
// ===============================

async function loadAllEntries() {
  const container = document.getElementById("AllEntries_Content");
  container.innerHTML = "<p style='opacity:0.7;'>Loading entries...</p>";

  try {
    const sheetURL =
      "https://opensheet.elk.sh/128BR0KeT6EGfBZZVAeSMXQjB5b-oJz0Y7xxQPn4ejjc/Form Responses 1";

    const response = await fetch(sheetURL);
    const data = await response.json();

    container.innerHTML = "";

    data.reverse().forEach((row) => {
      const name = sanitize(row.Name);
      const text = sanitize(row.Guestbook_Entry);

      const retroDate = mapTo1994(row.Timestamp);
      const retroTime = mapTimeTo1994(row.Timestamp);

      const entry = document.createElement("div");
      entry.className = "guestbook-entry";
      entry.innerHTML = `
        <span class="entry-name">${name}</span>
        <span class="entry-date">${retroDate} — ${retroTime}</span>
        <p>${text}</p>
      `;
      container.appendChild(entry);
    });
  } catch (err) {
    container.innerHTML = "<p style='color:red;'>Failed to load entries.</p>";
  }
}

// ===============================
// Auto-load latest entries on page load
// ===============================

window.addEventListener("load", loadLatestEntries);

// Load all entries when popup opens
window.addEventListener("hashchange", () => {
  if (location.hash === "#AllEntries") {
    loadAllEntries();
  }
});
