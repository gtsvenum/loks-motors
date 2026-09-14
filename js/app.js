/* ============================================================
   LOKS MOTORS — app.js (vanilla JS, no dependencies)
   Sections:
     1. CONFIG data (edit models/upgrades/prices HERE)
     2. Mobile nav
     3. Fade-in on scroll (IntersectionObserver)
     4. Build configurator (steps, live total, summary, form)
   ============================================================ */

"use strict";

/* Mark JS as active — CSS scopes fade-in hiding to html.js so content
   stays visible if JavaScript ever fails to load. */
document.documentElement.classList.add("js");

/* ------------------------------------------------------------
   1. CONFIG DATA — edit base models & upgrade prices here.
   ------------------------------------------------------------ */
const CONFIG = {
  // Base models for Step 1 (radio cards). basePrice in USD.
  models: [
    { id: "mustang67",  year: 1967, name: "Ford Mustang Fastback",       basePrice: 145000 },
    { id: "chevelle70", year: 1970, name: "Chevrolet Chevelle SS",       basePrice: 98000 },
    { id: "bronco76",   year: 1976, name: "Ford Bronco",                 basePrice: 160000 },
    { id: "camaro69",   year: 1969, name: "Chevrolet Camaro SS",         basePrice: 152000 },
    { id: "gn87",       year: 1987, name: "Buick Grand National",        basePrice: 89000 },
    { id: "fzj80-94",   year: 1994, name: "Toyota Land Cruiser FZJ80",   basePrice: 105000 },
  ],

  // Upgrade options for Step 2, grouped by category. price in USD.
  upgrades: [
    {
      category: "Powertrain",
      items: [
        { id: "crate-v8",   label: "Modern V8 crate engine swap",      price: 28000 },
        { id: "efi",        label: "Fuel injection conversion",        price: 6500 },
        { id: "auto-trans", label: "Modern automatic transmission",    price: 9500 },
        { id: "manual-5sp", label: "Manual 5-speed conversion",        price: 8500 },
      ],
    },
    {
      category: "Chassis & Handling",
      items: [
        { id: "suspension", label: "Full suspension upgrade",          price: 12000 },
        { id: "disc-brakes",label: "4-wheel disc brakes",              price: 7500 },
        { id: "pwr-steer",  label: "Power steering",                   price: 4200 },
      ],
    },
    {
      category: "Comfort & Tech",
      items: [
        { id: "ac",         label: "Modern A/C climate control",       price: 8000 },
        { id: "leather",    label: "Custom leather interior",          price: 15000 },
        { id: "carplay",    label: "Modern audio w/ Apple CarPlay",    price: 3800 },
        { id: "pwr-win",    label: "Power windows & locks",            price: 3200 },
        { id: "led",        label: "LED lighting",                     price: 2400 },
      ],
    },
    {
      category: "Exterior",
      items: [
        { id: "paint",      label: "Show-quality paint",               price: 18000 },
        { id: "wheels",     label: "Custom wheels & tires",            price: 6000 },
      ],
    },
  ],
};

// USD formatter (no cents — these are estimates)
const fmtUSD = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

/* ------------------------------------------------------------
   2. MOBILE NAV
   ------------------------------------------------------------ */
const navToggle = document.getElementById("navToggle");
const navMenu = document.getElementById("navMenu");

navToggle.addEventListener("click", () => {
  const open = navMenu.classList.toggle("is-open");
  navToggle.classList.toggle("is-open", open);
  navToggle.setAttribute("aria-expanded", String(open));
});

// Close mobile menu after tapping any link inside it
navMenu.addEventListener("click", (e) => {
  if (e.target.matches("a")) {
    navMenu.classList.remove("is-open");
    navToggle.classList.remove("is-open");
    navToggle.setAttribute("aria-expanded", "false");
  }
});

/* ------------------------------------------------------------
   3. FADE-IN ON SCROLL
   ------------------------------------------------------------ */
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target); // animate once
      }
    });
  },
  { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
);

document.querySelectorAll(".fade-in").forEach((el) => observer.observe(el));

/* ------------------------------------------------------------
   4. BUILD CONFIGURATOR
   State: selected base model + set of selected upgrade ids.
   Total = model.basePrice + sum(selected upgrade prices).
   ------------------------------------------------------------ */
const state = {
  modelId: null,
  selectedUpgrades: new Set(),
};

// --- DOM refs ---
const modelsEl = document.getElementById("configModels");
const upgradesEl = document.getElementById("configUpgrades");
const summaryEl = document.getElementById("configSummary");
const totalEl = document.getElementById("configTotal");
const totalModelEl = document.getElementById("totalModel");
const stepEls = document.querySelectorAll(".config__step");
const panelEls = document.querySelectorAll(".config__panel");
const toStep2Btn = document.getElementById("toStep2");

// --- Render Step 1: model radio cards ---
modelsEl.innerHTML = CONFIG.models
  .map(
    (m) => `
    <label class="model-card">
      <input type="radio" name="baseModel" value="${m.id}" />
      <span class="model-card__inner">
        <span class="model-card__year">${m.year}</span>
        <span class="model-card__name">${m.name}</span>
        <span class="model-card__price">Base build from <strong>${fmtUSD.format(m.basePrice)}</strong></span>
      </span>
    </label>`
  )
  .join("");

// --- Render Step 2: upgrade checkbox groups ---
upgradesEl.innerHTML = CONFIG.upgrades
  .map(
    (group) => `
    <div class="upgrade-group">
      <h4>${group.category}</h4>
      ${group.items
        .map(
          (u) => `
        <label class="upgrade">
          <input type="checkbox" value="${u.id}" data-price="${u.price}" />
          <span class="upgrade__label">${u.label}</span>
          <span class="upgrade__price">+${fmtUSD.format(u.price)}</span>
        </label>`
        )
        .join("")}
    </div>`
  )
  .join("");

// --- Helpers ---
function getModel(id) {
  return CONFIG.models.find((m) => m.id === id) || null;
}

function getUpgrade(id) {
  for (const group of CONFIG.upgrades) {
    const found = group.items.find((u) => u.id === id);
    if (found) return found;
  }
  return null;
}

function computeTotal() {
  const model = getModel(state.modelId);
  let total = model ? model.basePrice : 0;
  state.selectedUpgrades.forEach((id) => {
    const u = getUpgrade(id);
    if (u) total += u.price;
  });
  return total;
}

// Update the sticky total bar
function renderTotal() {
  const model = getModel(state.modelId);
  totalEl.textContent = fmtUSD.format(computeTotal());
  totalModelEl.textContent = model
    ? `${model.year} ${model.name}`
    : "No base model selected";
}

// --- Step navigation ---
function goToStep(n) {
  panelEls.forEach((p) =>
    p.classList.toggle("is-active", p.dataset.panel === String(n))
  );
  stepEls.forEach((s) => {
    const stepNum = Number(s.dataset.step);
    s.classList.toggle("is-active", stepNum === n);
    s.classList.toggle("is-done", stepNum < n);
  });
  if (n === 3) renderSummary();
  // Keep the configurator in view when switching steps
  document.getElementById("configurator").scrollIntoView({ behavior: "smooth", block: "start" });
}

// --- Step 3: build summary ---
function renderSummary() {
  const model = getModel(state.modelId);
  if (!model) {
    summaryEl.innerHTML = "<p>Please select a base model first.</p>";
    return;
  }

  const upgradeRows = [...state.selectedUpgrades]
    .map((id) => getUpgrade(id))
    .filter(Boolean)
    .map(
      (u) => `<li><span>${u.label}</span><span>+${fmtUSD.format(u.price)}</span></li>`
    )
    .join("");

  summaryEl.innerHTML = `
    <h4>Your Build</h4>
    <ul>
      <li>
        <span><strong>${model.year} ${model.name}</strong> — base build</span>
        <span>${fmtUSD.format(model.basePrice)}</span>
      </li>
      ${upgradeRows || "<li><span>No upgrades selected — stock restoration spec</span><span>—</span></li>"}
      <li class="summary-total">
        <span>Estimated Total</span>
        <span>${fmtUSD.format(computeTotal())}</span>
      </li>
    </ul>`;
}

// --- Event wiring ---

// Step 1: model selection enables "Next"
modelsEl.addEventListener("change", (e) => {
  if (e.target.name === "baseModel") {
    state.modelId = e.target.value;
    toStep2Btn.disabled = false;
    renderTotal();
  }
});

// Step 2: checkbox toggles update running total live
upgradesEl.addEventListener("change", (e) => {
  if (e.target.type === "checkbox") {
    if (e.target.checked) state.selectedUpgrades.add(e.target.value);
    else state.selectedUpgrades.delete(e.target.value);
    renderTotal();
  }
});

// Nav buttons
toStep2Btn.addEventListener("click", () => goToStep(2));
document.getElementById("toStep3").addEventListener("click", () => goToStep(3));
document.getElementById("backTo1").addEventListener("click", () => goToStep(1));
document.getElementById("backTo2").addEventListener("click", () => goToStep(2));

// Quote form: client-side success only.
// TODO: replace with Formspree endpoint or backend POST —
//   e.g. fetch("https://formspree.io/f/XXXX", { method: "POST", body: new FormData(form) })
const quoteForm = document.getElementById("quoteForm");
const quoteSuccess = document.getElementById("quoteSuccess");

quoteForm.addEventListener("submit", (e) => {
  e.preventDefault();

  // Minimal validation: name + valid-ish email required
  const name = quoteForm.elements.name.value.trim();
  const email = quoteForm.elements.email.value.trim();
  if (!name || !email || !email.includes("@")) {
    alert("Please provide your name and a valid email so we can reach you.");
    return;
  }

  // Simulate submission success
  quoteForm.querySelectorAll("input, textarea, button[type=submit]").forEach((el) => {
    el.disabled = true;
  });
  quoteSuccess.hidden = false;
});

/* ------------------------------------------------------------
   Misc: footer year
   ------------------------------------------------------------ */
document.getElementById("year").textContent = new Date().getFullYear();
