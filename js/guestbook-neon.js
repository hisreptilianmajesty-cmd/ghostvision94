// ===============================
// GhostVision '94 — Guestbook JS
// Neon-compatible rewrite (Option B)
// ===============================

// Your confirmed Google Form entry IDs
const ENTRY_NAME = "entry.371490563";
const ENTRY_EMAIL = "entry.394002833";
const ENTRY_TEXT = "entry.982526811";

// Your confirmed Google Form POST URL
const GOOGLE_FORM_POST =
  "https://docs.google.com/forms/d/e/1FAIpQLSczKWxEpkr-Psc230Q3gosFNSil5BzKIjsBoTeuWHo111lMwg/formResponse";

// Find your neon popup form
const form = document.getElementById("gform");

// Hidden iframe
const iframe = document.getElementById("hidden_iframe");

// Close popup after submit
let submitted = false;

// Inject correct attributes into the form
form.setAttribute("method", "POST");
form.setAttribute("action", GOOGLE_FORM_POST);
form.setAttribute("target", "hidden_iframe");

// Rewrite field names to match Google Form
document.getElementById("GOOGLE_ENTRY_ID_Name").setAttribute("name", ENTRY_NAME);
document.getElementById("GOOGLE_ENTRY_ID_Email").setAttribute("name", ENTRY_EMAIL);
document.getElementById("GOOGLE_ENTRY_ID_TextArea").setAttribute("name", ENTRY_TEXT);

// Handle form submission
form.addEventListener("submit", function () {
  submitted = true;
});

// When iframe loads after POST, close popup
iframe.onload = function () {
  if (submitted) {
    // Close popup by clearing hash
    location.hash = "";

    // Reset form
    form.reset();

    // Reset recaptcha if present
    if (typeof grecaptcha !== "undefined") {
      grecaptcha.reset();
    }

    submitted = false;
  }
};

// ===============================
// Load All Entries (Google Sheet → JSON)
// ===============================

// This part loads entries into #AllEntries_Content
// You can customize this later if you want formatting changes.

async function loadEntries() {
  const container = document.getElementById("AllEntries_Content");
  container.innerHTML = "<p style='opacity:0.7;'>Loading entries...</p>";

  try {
    // Your Google Sheet CSV export URL
    const sheetURL =
      "https://docs.google.com/spreadsheets/d/" +
      "128BR0KeT6EGfBZZVAeSMXQjB5b-oJz0Y7xxQPn4ejjc" +
      "/gviz/tq?tqx=out:csv";

    const response = await fetch(sheetURL);
    const csv = await response.text();

    const rows = csv.split("\n").slice(1); // skip header

    container.innerHTML = "";

    rows.forEach((row) => {
      const cols = row.split(",");

      if (cols.length >= 3) {
        const name = cols[0];
        const email = cols[1];
        const text = cols[2];

        const entryDiv = document.createElement("div");
        entryDiv.className = "guestbook-entry";
        entryDiv.innerHTML = `
          <span class="entry-name">${name}</span>
          <span class="entry-date">${new Date().toLocaleDateString()}</span>
          <p>${text}</p>
          <div style="font-size:0.7rem;opacity:0.7;">From: ${email}</div>
        `;
        container.appendChild(entryDiv);
      }
    });
  } catch (err) {
    container.innerHTML =
      "<p style='color:red;'>Failed to load entries.</p>";
  }
}

// Load entries when #AllEntries popup opens
window.addEventListener("hashchange", () => {
  if (location.hash === "#AllEntries") {
    loadEntries();
  }
});
