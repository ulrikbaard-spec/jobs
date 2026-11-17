/* =========================================================
   AB-HEM · JOBS – APP LOGIC & GOOGLE SHEETS CONNECTOR
   Sheet ID: 1l_nOEIaMlOuiyAec5ElWUj5kQajIlC6_EHJZhazx6HU (gid=0)
   ========================================================= */

const SHEET_ID = "1l_nOEIaMlOuiyAec5ElWUj5kQajIlC6_EHJZhazx6HU";
const SHEET_GID = "0";

// Exakt kolumnordning enligt specifikation (32 kolumner)
const COLUMNS = [
    "Nr",
    "Skapad datum",
    "Bovärd",
    "Rubrik",
    "Jobb-beskrivning",
    "Hyresavi nr",
    "Huskod",
    "Var mer exakt?",
    "Person",
    "Start datum",
    "Slut datum",
    "Firmanamn",
    "Bovärds telefon",
    "Akut?",
    "Prisförslag",
    "Timförslag",
    "Adress",
    "F namn",
    "Fastighetsskötare",
    "Fastighetsskötare Email",
    "Fastighetsskötare Telefon",
    "Bovärd Email",
    "Bovärd Namn",
    "Antal 110",
    "Område",
    "Status",
    "Avslutad",
    "S1",
    "S2",
    "S3",
    "Typ",
    "Distrikt"
];

// Gruppering i detaljvyn (alla 32 kolumner täcks)
const DETAIL_GROUPS = [
    {
        title: "Grundinfo & Status",
        fields: [
            { key: "Nr" },
            { key: "Skapad datum" },
            { key: "Status" },
            { key: "Avslutad" },
            { key: "Akut?" },
            { key: "Typ" },
            { key: "Rubrik", full: true },
            { key: "Jobb-beskrivning", full: true }
        ]
    },
    {
        title: "Plats & Fastighet",
        fields: [
            { key: "Adress", full: true },
            { key: "Var mer exakt?", full: true },
            { key: "Huskod" },
            { key: "Område" },
            { key: "Distrikt" },
            { key: "Hyresavi nr" },
            { key: "Antal 110" }
        ]
    },
    {
        title: "Fastighetsskötare, Bovärd & Kontakt",
        fields: [
            { key: "Fastighetsskötare" },
            { key: "Fastighetsskötare Telefon", type: "tel" },
            { key: "Fastighetsskötare Email", type: "email", full: true },
            { key: "Bovärd" },
            { key: "Bovärd Namn" },
            { key: "Bovärds telefon", type: "tel" },
            { key: "Bovärd Email", type: "email", full: true },
            { key: "Person" },
            { key: "Firmanamn" },
            { key: "F namn" }
        ]
    },
    {
        title: "Tid, Ekonomi & Kodfält",
        fields: [
            { key: "Start datum" },
            { key: "Slut datum" },
            { key: "Prisförslag" },
            { key: "Timförslag" },
            { key: "S1" },
            { key: "S2" },
            { key: "S3" }
        ]
    }
];

// Demodata (för förhandsvisning om arket inte är publikt delat än)
const DEMO_JOBS = [
    {
        "Nr": "1048",
        "Skapad datum": "2026-11-17",
        "Bovärd": "ML",
        "Rubrik": "Droppande blandare i kök samt löst handtag balkongdörr",
        "Jobb-beskrivning": "Hyresgäst meddelar att köksblandaren droppar konstant vid varmvatten. Samtidigt behöver handtaget till balkongdörren skruvas åt och justeras.",
        "Hyresavi nr": "41702-01",
        "Huskod": "417",
        "Var mer exakt?": "Lgh 1102, 1 tr",
        "Person": "Anna Lindström",
        "Start datum": "2026-11-18",
        "Slut datum": "2026-11-20",
        "Firmanamn": "AB-Hem Drift",
        "Bovärds telefon": "0581-402 00",
        "Akut?": "Nej",
        "Prisförslag": "1 200 kr",
        "Timförslag": "1,5 h",
        "Adress": "Älvgatan 14, Krylbo",
        "F namn": "Krylbo Älven 4",
        "Fastighetsskötare": "Mikael Sundström",
        "Fastighetsskötare Email": "mikael@ab-hem.se",
        "Fastighetsskötare Telefon": "070-112 23 34",
        "Bovärd Email": "bovard.dalarna@ab-hem.se",
        "Bovärd Namn": "Maria Larsson",
        "Antal 110": "1",
        "Område": "Krylbo",
        "Status": "Pågående",
        "Avslutad": "",
        "S1": "VVS",
        "S2": "Snickeri",
        "S3": "",
        "Typ": "Felanmälan",
        "Distrikt": "Dalarna"
    },
    {
        "Nr": "1047",
        "Skapad datum": "2026-11-16",
        "Bovärd": "JH",
        "Rubrik": "Värmepump larmar i undercentral – ingen värme på gaveln",
        "Jobb-beskrivning": "Tryckfall i värmesystemet rapporterat på morgonen. Behöver luftas och kontrolleras omgående i källarens undercentral.",
        "Hyresavi nr": "",
        "Huskod": "162",
        "Var mer exakt?": "Källare / Undercentral port B",
        "Person": "",
        "Start datum": "2026-11-16",
        "Slut datum": "2026-11-17",
        "Firmanamn": "Bergslagens Värme & Rör",
        "Bovärds telefon": "0581-402 00",
        "Akut?": "Ja",
        "Prisförslag": "4 500 kr",
        "Timförslag": "3 h",
        "Adress": "Myntgatan 5B, Norberg",
        "F namn": "Myntet 2",
        "Fastighetsskötare": "Anders Berg",
        "Fastighetsskötare Email": "anders@ab-hem.se",
        "Fastighetsskötare Telefon": "070-223 34 45",
        "Bovärd Email": "johan@ab-hem.se",
        "Bovärd Namn": "Johan Holm",
        "Antal 110": "2",
        "Område": "Norberg Centrum",
        "Status": "Ny",
        "Avslutad": "",
        "S1": "Värme",
        "S2": "Jour",
        "S3": "Prio 1",
        "Typ": "Akut åtgärd",
        "Distrikt": "Västmanland"
    },
    {
        "Nr": "1045",
        "Skapad datum": "2026-11-12",
        "Bovärd": "JH",
        "Rubrik": "Målning av hall och byte av golvsocklar inför inflytt",
        "Jobb-beskrivning": "Inför ny hyresgäst 1/12 ska hallen spacklas och målas i bruten vit (S 0502-Y). Nya målade golvsocklar monteras mot sovrum.",
        "Hyresavi nr": "12604-02",
        "Huskod": "126",
        "Var mer exakt?": "Lgh 1001, bv",
        "Person": "Ny inflyttande",
        "Start datum": "2026-11-14",
        "Slut datum": "2026-11-25",
        "Firmanamn": "Måleri & Bygg i Sala",
        "Bovärds telefon": "0581-402 00",
        "Akut?": "Nej",
        "Prisförslag": "8 900 kr",
        "Timförslag": "12 h",
        "Adress": "Gruvgatan 8, Kärrgruvan",
        "F namn": "Kärrgruvan 1:14",
        "Fastighetsskötare": "Anders Berg",
        "Fastighetsskötare Email": "anders@ab-hem.se",
        "Fastighetsskötare Telefon": "070-223 34 45",
        "Bovärd Email": "johan@ab-hem.se",
        "Bovärd Namn": "Johan Holm",
        "Antal 110": "1",
        "Område": "Kärrgruvan",
        "Status": "Beställd",
        "Avslutad": "",
        "S1": "Målning",
        "S2": "Inflytt",
        "S3": "",
        "Typ": "Underhåll",
        "Distrikt": "Västmanland"
    },
    {
        "Nr": "1041",
        "Skapad datum": "2026-11-05",
        "Bovärd": "EK",
        "Rubrik": "Byte av torktumlare i gemensam tvättstuga",
        "Jobb-beskrivning": "Torktumlare nr 2 har trasigt värmeelement. Ny maskin levererad, gammal kopplas ur och forslas bort.",
        "Hyresavi nr": "",
        "Huskod": "310",
        "Var mer exakt?": "Tvättstuga gårdshus",
        "Person": "",
        "Start datum": "2026-11-06",
        "Slut datum": "2026-11-08",
        "Firmanamn": "Gästrike Vitvaruservice",
        "Bovärds telefon": "0581-402 00",
        "Akut?": "Nej",
        "Prisförslag": "6 400 kr",
        "Timförslag": "2 h",
        "Adress": "Skolgatan 12, Storvik",
        "F namn": "Stenbacken 3",
        "Fastighetsskötare": "Patrik Lind",
        "Fastighetsskötare Email": "patrik@ab-hem.se",
        "Fastighetsskötare Telefon": "070-334 45 56",
        "Bovärd Email": "elin@ab-hem.se",
        "Bovärd Namn": "Elin Karlsson",
        "Antal 110": "1",
        "Område": "Storvik",
        "Status": "Avslutad",
        "Avslutad": "2026-11-08",
        "S1": "Tvättstuga",
        "S2": "Vitvaror",
        "S3": "",
        "Typ": "Installation",
        "Distrikt": "Gävleborg"
    }
];

// Applikationens tillstånd
const state = {
    allJobs: [],
    filteredJobs: [],
    selectedJob: null,
    isDemoMode: false,
    filters: {
        search: "",
        caretaker: "",
        status: "",
        type: "",
        nr: "",
        dateFrom: "",
        dateTo: "",
        datePreset: "all",
        acuteOnly: false,
        sort: "date_desc"
    }
};

// DOM-referenser
const els = {};

document.addEventListener("DOMContentLoaded", () => {
    cacheElements();
    bindEvents();
    loadSheetData();
});

function cacheElements() {
    els.syncStatus = document.getElementById("sync-status");
    els.kpiStrip = document.getElementById("kpi-strip");
    els.btnToggleFilters = document.getElementById("btn-toggle-filters");
    els.activeFilterBadge = document.getElementById("active-filter-badge");
    els.btnRefresh = document.getElementById("btn-refresh");
    els.refreshIcon = document.getElementById("refresh-icon");

    els.accessBanner = document.getElementById("access-banner");
    els.btnRetrySheet = document.getElementById("btn-retry-sheet");
    els.btnLoadDemo = document.getElementById("btn-load-demo");

    els.filterPanel = document.getElementById("filter-panel");
    els.filterSearch = document.getElementById("filter-search");
    els.btnClearSearch = document.getElementById("btn-clear-search");
    els.filterCaretaker = document.getElementById("filter-caretaker");
    els.filterStatus = document.getElementById("filter-status");
    els.filterType = document.getElementById("filter-type");
    els.filterNr = document.getElementById("filter-nr");
    els.filterDateFrom = document.getElementById("filter-date-from");
    els.filterDateTo = document.getElementById("filter-date-to");
    els.filterSort = document.getElementById("filter-sort");
    els.filterAcute = document.getElementById("filter-acute");
    els.presetChips = Array.from(document.querySelectorAll(".preset-chip"));

    els.resultsCount = document.getElementById("results-count");
    els.activeChips = document.getElementById("active-chips");
    els.btnResetFilters = document.getElementById("btn-reset-filters");

    els.loadingState = document.getElementById("loading-state");
    els.emptyState = document.getElementById("empty-state");
    els.btnEmptyReset = document.getElementById("btn-empty-reset");
    els.jobsList = document.getElementById("jobs-list");

    els.modalBackdrop = document.getElementById("job-modal-backdrop");
    els.modalBadges = document.getElementById("modal-badges");
    els.modalTitle = document.getElementById("modal-title");
    els.modalSubtitle = document.getElementById("modal-subtitle");
    els.modalQuickActions = document.getElementById("modal-quick-actions");
    els.modalBody = document.getElementById("modal-body");
    els.btnCloseModal = document.getElementById("btn-close-modal");
    els.btnModalDone = document.getElementById("btn-modal-done");
    els.toggleAllColumns = document.getElementById("toggle-all-columns");
}

function bindEvents() {
    // Filter-panel toggle på mobil
    els.btnToggleFilters.addEventListener("click", () => {
        const isCollapsed = els.filterPanel.classList.toggle("collapsed");
        els.btnToggleFilters.setAttribute("aria-expanded", String(!isCollapsed));
    });

    // Uppdatera från Google Sheet
    els.btnRefresh.addEventListener("click", () => {
        loadSheetData();
    });

    els.btnRetrySheet.addEventListener("click", () => {
        loadSheetData();
    });

    els.btnLoadDemo.addEventListener("click", () => {
        activateDemoData();
    });

    // Sökfält
    els.filterSearch.addEventListener("input", (e) => {
        state.filters.search = e.target.value.trim();
        els.btnClearSearch.hidden = !state.filters.search;
        applyFiltersAndRender();
    });

    els.btnClearSearch.addEventListener("click", () => {
        els.filterSearch.value = "";
        state.filters.search = "";
        els.btnClearSearch.hidden = true;
        applyFiltersAndRender();
    });

    // Dropdowns & Nr
    els.filterCaretaker.addEventListener("change", (e) => {
        state.filters.caretaker = e.target.value;
        applyFiltersAndRender();
    });

    els.filterStatus.addEventListener("change", (e) => {
        state.filters.status = e.target.value;
        applyFiltersAndRender();
    });

    els.filterType.addEventListener("change", (e) => {
        state.filters.type = e.target.value;
        applyFiltersAndRender();
    });

    els.filterNr.addEventListener("input", (e) => {
        state.filters.nr = e.target.value.trim();
        applyFiltersAndRender();
    });

    // Datumfilter
    els.filterDateFrom.addEventListener("change", (e) => {
        state.filters.dateFrom = e.target.value;
        state.filters.datePreset = "custom";
        updatePresetChipsUI();
        applyFiltersAndRender();
    });

    els.filterDateTo.addEventListener("change", (e) => {
        state.filters.dateTo = e.target.value;
        state.filters.datePreset = "custom";
        updatePresetChipsUI();
        applyFiltersAndRender();
    });

    els.presetChips.forEach((chip) => {
        chip.addEventListener("click", () => {
            const preset = chip.getAttribute("data-preset");
            applyDatePreset(preset);
        });
    });

    // Sortering & Akut
    els.filterSort.addEventListener("change", (e) => {
        state.filters.sort = e.target.value;
        applyFiltersAndRender();
    });

    els.filterAcute.addEventListener("change", (e) => {
        state.filters.acuteOnly = e.target.checked;
        applyFiltersAndRender();
    });

    // Återställ filter
    els.btnResetFilters.addEventListener("click", resetAllFilters);
    els.btnEmptyReset.addEventListener("click", resetAllFilters);

    // Modal
    els.btnCloseModal.addEventListener("click", closeJobModal);
    els.btnModalDone.addEventListener("click", closeJobModal);
    els.modalBackdrop.addEventListener("click", (e) => {
        if (e.target === els.modalBackdrop) {
            closeJobModal();
        }
    });

    els.toggleAllColumns.addEventListener("change", () => {
        if (state.selectedJob) {
            renderModalBody(state.selectedJob);
        }
    });

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && !els.modalBackdrop.hidden) {
            closeJobModal();
        }
    });
}

/* =========================================================
   GOOGLE SHEETS FETCHING (JSONP + CSV FALLBACK)
   ========================================================= */

async function loadSheetData() {
    setLoading(true);
    els.syncStatus.textContent = "Hämtar data från Google Sheet…";

    try {
        // 1. Försök med JSONP (fungerar utan CORS-problem i webbläsare när arket är delat)
        const rows = await fetchViaGvizJsonp();
        onSheetLoaded(rows, false);
    } catch (jsonpErr) {
        try {
            // 2. Reservmetod: Hämta CSV via fetch
            const csvRows = await fetchViaCsv();
            onSheetLoaded(csvRows, false);
        } catch (csvErr) {
            console.warn("Kunde inte hämta Google Sheet direkt:", jsonpErr, csvErr);
            setLoading(false);
            els.accessBanner.hidden = false;
            els.syncStatus.textContent = "Väntar på läsbehörighet i Google Sheets";

            // Om vi inte har någon data alls laddad ännu, visa tom vy tills man väljer demo eller låser upp
            if (state.allJobs.length === 0) {
                els.resultsCount.textContent = "0 jobb inlästa (behörighet krävs)";
            }
        }
    }
}

function fetchViaGvizJsonp() {
    return new Promise((resolve, reject) => {
        const callbackName = "abHemJobsCallback_" + Date.now() + "_" + Math.floor(Math.random() * 1000);
        const script = document.createElement("script");
        let settled = false;

        const timeout = setTimeout(() => {
            if (!settled) {
                settled = true;
                cleanup();
                reject(new Error("Timeout vid hämtning av Google Sheet."));
            }
        }, 6500);

        function cleanup() {
            clearTimeout(timeout);
            delete window[callbackName];
            if (script.parentNode) {
                script.parentNode.removeChild(script);
            }
        }

        window[callbackName] = function (response) {
            if (settled) return;
            settled = true;
            cleanup();

            if (!response || response.status === "error" || !response.table) {
                reject(new Error("Ogiltigt svar från Google Visualization API."));
                return;
            }

            const jobs = parseGvizTable(response.table);
            resolve(jobs);
        };

        script.onerror = function () {
            if (settled) return;
            settled = true;
            cleanup();
            reject(new Error("Kunde inte ladda Google Sheet (kontrollera delningsinställningar)."));
        };

        script.src = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?gid=${SHEET_GID}&tqx=out:json;responseHandler:${callbackName}&_=${Date.now()}`;
        document.body.appendChild(script);
    });
}

function parseGvizTable(table) {
    const rawCols = (table.cols || []).map((col, idx) => (col.label || "").trim() || COLUMNS[idx] || `Kolumn_${idx}`);
    const rows = table.rows || [];

    // Kontrollera om första raden i praktiken är rubrikraden (om Google inte satte col.label)
    const hasHeaderLabels = rawCols.some((label) => label.toLowerCase() === "nr" || label.toLowerCase() === "rubrik");
    let startRowIndex = 0;
    let effectiveHeaders = rawCols.slice();

    if (!hasHeaderLabels && rows.length > 0) {
        const firstRowValues = (rows[0].c || []).map((cell) => getCellDisplayValue(cell));
        if (firstRowValues.some((v) => v.toLowerCase() === "nr" || v.toLowerCase() === "rubrik")) {
            effectiveHeaders = firstRowValues;
            startRowIndex = 1;
        }
    }

    const jobs = [];
    for (let r = startRowIndex; r < rows.length; r++) {
        const rowCells = (rows[r] && rows[r].c) ? rows[r].c : [];
        const job = {};
        let hasAnyValue = false;

        COLUMNS.forEach((colName, idx) => {
            // Hitta antingen via matchande rubriknamn eller via kolumnindex
            let headerIdx = effectiveHeaders.findIndex(
                (h) => normalizeHeader(h) === normalizeHeader(colName)
            );
            if (headerIdx === -1) {
                headerIdx = idx;
            }
            const val = getCellDisplayValue(rowCells[headerIdx]);
            if (val !== "") {
                hasAnyValue = true;
            }
            job[colName] = val;
        });

        if (hasAnyValue) {
            jobs.push(job);
        }
    }

    return jobs;
}

function getCellDisplayValue(cell) {
    if (!cell || cell.v === null || cell.v === undefined) return "";
    if (cell.f !== undefined && cell.f !== null && String(cell.f).trim() !== "") {
        return String(cell.f).trim();
    }
    return String(cell.v).trim();
}

async function fetchViaCsv() {
    const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&gid=${SHEET_GID}&_=${Date.now()}`;
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) {
        throw new Error("HTTP " + res.status);
    }
    const text = await res.text();
    if (text.trim().startsWith("<!DOCTYPE html") || text.includes("accounts.google.com")) {
        throw new Error("Sheet redirects to Google login");
    }
    const matrix = parseCsvMatrix(text);
    if (matrix.length < 2) {
        return [];
    }
    const headers = matrix[0];
    const jobs = [];

    for (let i = 1; i < matrix.length; i++) {
        const row = matrix[i];
        const job = {};
        let hasAnyValue = false;

        COLUMNS.forEach((colName, idx) => {
            let headerIdx = headers.findIndex((h) => normalizeHeader(h) === normalizeHeader(colName));
            if (headerIdx === -1) headerIdx = idx;
            const val = (row[headerIdx] || "").trim();
            if (val !== "") hasAnyValue = true;
            job[colName] = val;
        });

        if (hasAnyValue) {
            jobs.push(job);
        }
    }
    return jobs;
}

function parseCsvMatrix(csvText) {
    const rows = [];
    let currentRow = [];
    let currentVal = "";
    let inQuotes = false;

    for (let i = 0; i < csvText.length; i++) {
        const ch = csvText[i];
        const next = csvText[i + 1];

        if (inQuotes) {
            if (ch === '"' && next === '"') {
                currentVal += '"';
                i++;
            } else if (ch === '"') {
                inQuotes = false;
            } else {
                currentVal += ch;
            }
        } else {
            if (ch === '"') {
                inQuotes = true;
            } else if (ch === ",") {
                currentRow.push(currentVal);
                currentVal = "";
            } else if (ch === "\n") {
                currentRow.push(currentVal);
                rows.push(currentRow);
                currentRow = [];
                currentVal = "";
            } else if (ch === "\r") {
                // hoppa över CR
            } else {
                currentVal += ch;
            }
        }
    }

    if (currentVal.length > 0 || currentRow.length > 0) {
        currentRow.push(currentVal);
        rows.push(currentRow);
    }
    return rows;
}

function normalizeHeader(str) {
    return String(str || "")
        .toLowerCase()
        .replace(/\s+/g, " ")
        .trim();
}

function onSheetLoaded(jobs, isDemo) {
    state.allJobs = jobs;
    state.isDemoMode = isDemo;
    setLoading(false);

    if (!isDemo) {
        els.accessBanner.hidden = true;
        const now = new Date().toLocaleTimeString("sv-SE", { hour: "2-digit", minute: "2-digit" });
        els.syncStatus.textContent = `Live · ${jobs.length} jobb · Uppdaterad ${now}`;
    } else {
        els.syncStatus.textContent = `Demoläge · ${jobs.length} exempeljobb`;
    }

    populateFilterOptions();
    applyFiltersAndRender();
}

function activateDemoData() {
    onSheetLoaded(DEMO_JOBS, true);
}

function setLoading(loading) {
    els.loadingState.hidden = !loading;
    els.refreshIcon.classList.toggle("spinning", loading);
}

/* =========================================================
   POPULERA DROPDOWNS & KPI-PILLER
   ========================================================= */

function populateFilterOptions() {
    populateSelectWithCounts(els.filterCaretaker, "Fastighetsskötare", "Alla fastighetsskötare", state.filters.caretaker);
    populateSelectWithCounts(els.filterStatus, "Status", "Alla statusar", state.filters.status);
    populateSelectWithCounts(els.filterType, "Typ", "Alla typer", state.filters.type);
}

function populateSelectWithCounts(selectEl, columnKey, defaultLabel, currentValue) {
    const counts = new Map();
    state.allJobs.forEach((job) => {
        const val = (job[columnKey] || "").trim();
        if (val) {
            counts.set(val, (counts.get(val) || 0) + 1);
        }
    });

    const sortedKeys = Array.from(counts.keys()).sort((a, b) => a.localeCompare(b, "sv"));
    selectEl.innerHTML = "";

    const firstOpt = document.createElement("option");
    firstOpt.value = "";
    firstOpt.textContent = defaultLabel;
    selectEl.appendChild(firstOpt);

    sortedKeys.forEach((key) => {
        const opt = document.createElement("option");
        opt.value = key;
        opt.textContent = `${key} (${counts.get(key)})`;
        selectEl.appendChild(opt);
    });

    selectEl.value = counts.has(currentValue) ? currentValue : "";
}

function renderKpiStrip() {
    els.kpiStrip.innerHTML = "";

    // 1. Alla jobb
    const allPill = createKpiPill(
        "Alla jobb",
        state.allJobs.length,
        !state.filters.status && !state.filters.acuteOnly,
        () => {
            state.filters.status = "";
            state.filters.acuteOnly = false;
            els.filterStatus.value = "";
            els.filterAcute.checked = false;
            applyFiltersAndRender();
        }
    );
    els.kpiStrip.appendChild(allPill);

    // 2. Akuta jobb
    const acuteCount = state.allJobs.filter(isJobAcute).length;
    if (acuteCount > 0) {
        const acutePill = createKpiPill(
            "🔥 Akuta",
            acuteCount,
            state.filters.acuteOnly,
            () => {
                state.filters.acuteOnly = !state.filters.acuteOnly;
                els.filterAcute.checked = state.filters.acuteOnly;
                applyFiltersAndRender();
            },
            "acute-pill"
        );
        els.kpiStrip.appendChild(acutePill);
    }

    // 3. Per Status
    const statusCounts = new Map();
    state.allJobs.forEach((job) => {
        const st = (job["Status"] || "").trim();
        if (st) {
            statusCounts.set(st, (statusCounts.get(st) || 0) + 1);
        }
    });

    statusCounts.forEach((count, statusName) => {
        const isActive = state.filters.status === statusName && !state.filters.acuteOnly;
        const pill = createKpiPill(statusName, count, isActive, () => {
            state.filters.status = state.filters.status === statusName ? "" : statusName;
            state.filters.acuteOnly = false;
            els.filterStatus.value = state.filters.status;
            els.filterAcute.checked = false;
            applyFiltersAndRender();
        });
        els.kpiStrip.appendChild(pill);
    });
}

function createKpiPill(label, count, isActive, onClick, extraClass = "") {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = `kpi-pill ${extraClass} ${isActive ? "active" : ""}`.trim();
    btn.innerHTML = `<span>${escapeHtml(label)}</span><strong>${count}</strong>`;
    btn.addEventListener("click", onClick);
    return btn;
}

/* =========================================================
   FILTRERING & SORTERING
   ========================================================= */

function applyDatePreset(preset) {
    state.filters.datePreset = preset;
    const today = new Date();
    const toIso = (d) => d.toISOString().slice(0, 10);

    if (preset === "all") {
        state.filters.dateFrom = "";
        state.filters.dateTo = "";
    } else if (preset === "today") {
        const iso = toIso(today);
        state.filters.dateFrom = iso;
        state.filters.dateTo = iso;
    } else if (preset === "7d") {
        const d = new Date(today);
        d.setDate(d.getDate() - 7);
        state.filters.dateFrom = toIso(d);
        state.filters.dateTo = toIso(today);
    } else if (preset === "30d") {
        const d = new Date(today);
        d.setDate(d.getDate() - 30);
        state.filters.dateFrom = toIso(d);
        state.filters.dateTo = toIso(today);
    }

    els.filterDateFrom.value = state.filters.dateFrom;
    els.filterDateTo.value = state.filters.dateTo;
    updatePresetChipsUI();
    applyFiltersAndRender();
}

function updatePresetChipsUI() {
    els.presetChips.forEach((chip) => {
        chip.classList.toggle("active", chip.getAttribute("data-preset") === state.filters.datePreset);
    });
}

function resetAllFilters() {
    state.filters = {
        search: "",
        caretaker: "",
        status: "",
        type: "",
        nr: "",
        dateFrom: "",
        dateTo: "",
        datePreset: "all",
        acuteOnly: false,
        sort: "date_desc"
    };

    els.filterSearch.value = "";
    els.btnClearSearch.hidden = true;
    els.filterCaretaker.value = "";
    els.filterStatus.value = "";
    els.filterType.value = "";
    els.filterNr.value = "";
    els.filterDateFrom.value = "";
    els.filterDateTo.value = "";
    els.filterSort.value = "date_desc";
    els.filterAcute.checked = false;
    updatePresetChipsUI();

    applyFiltersAndRender();
}

function applyFiltersAndRender() {
    const f = state.filters;
    const searchLower = f.search.toLowerCase();
    const nrLower = f.nr.toLowerCase();

    const filtered = state.allJobs.filter((job) => {
        // 1. Fastighetsskötare
        if (f.caretaker && (job["Fastighetsskötare"] || "").trim() !== f.caretaker) {
            return false;
        }

        // 2. Status
        if (f.status && (job["Status"] || "").trim() !== f.status) {
            return false;
        }

        // 3. Typ
        if (f.type && (job["Typ"] || "").trim() !== f.type) {
            return false;
        }

        // 4. Jobb-Nr
        if (nrLower && !(job["Nr"] || "").toLowerCase().includes(nrLower)) {
            return false;
        }

        // 5. Endast akuta
        if (f.acuteOnly && !isJobAcute(job)) {
            return false;
        }

        // 6. Skapad datum (Från / Till)
        if (f.dateFrom || f.dateTo) {
            const jobDate = normalizeDateString(job["Skapad datum"]);
            if (!jobDate) return false;
            if (f.dateFrom && jobDate < f.dateFrom) return false;
            if (f.dateTo && jobDate > f.dateTo) return false;
        }

        // 7. Fritextsökning (Nr, Rubrik, Beskrivning, Adress, Huskod, Område, Fastighetsskötare, Bovärd, Person)
        if (searchLower) {
            const haystack = [
                job["Nr"],
                job["Rubrik"],
                job["Jobb-beskrivning"],
                job["Adress"],
                job["Huskod"],
                job["Område"],
                job["Distrikt"],
                job["Fastighetsskötare"],
                job["Bovärd"],
                job["Bovärd Namn"],
                job["Person"],
                job["Typ"]
            ]
                .join(" ")
                .toLowerCase();

            if (!haystack.includes(searchLower)) {
                return false;
            }
        }

        return true;
    });

    // Sortering
    filtered.sort((a, b) => compareJobs(a, b, f.sort));

    state.filteredJobs = filtered;
    renderKpiStrip();
    renderActiveFilterToolbar();
    renderJobsList();
}

function compareJobs(a, b, sortKey) {
    if (sortKey === "acute_first") {
        const acA = isJobAcute(a) ? 1 : 0;
        const acB = isJobAcute(b) ? 1 : 0;
        if (acA !== acB) return acB - acA;
    }

    if (sortKey === "nr_desc" || sortKey === "nr_asc") {
        const nA = parseFloat(String(a["Nr"] || "").replace(/[^\d.-]/g, "")) || 0;
        const nB = parseFloat(String(b["Nr"] || "").replace(/[^\d.-]/g, "")) || 0;
        if (nA !== nB) {
            return sortKey === "nr_desc" ? nB - nA : nA - nB;
        }
    }

    const dA = normalizeDateString(a["Skapad datum"]) || "";
    const dB = normalizeDateString(b["Skapad datum"]) || "";
    if (dA !== dB) {
        return sortKey === "date_asc" ? dA.localeCompare(dB) : dB.localeCompare(dA);
    }

    const nrA = parseFloat(String(a["Nr"] || "").replace(/[^\d.-]/g, "")) || 0;
    const nrB = parseFloat(String(b["Nr"] || "").replace(/[^\d.-]/g, "")) || 0;
    return nrB - nrA;
}

function normalizeDateString(raw) {
    if (!raw) return "";
    const str = String(raw).trim();
    // Matchar YYYY-MM-DD (även med tid efteråt)
    const isoMatch = str.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})/);
    if (isoMatch) {
        const y = isoMatch[1];
        const m = isoMatch[2].padStart(2, "0");
        const d = isoMatch[3].padStart(2, "0");
        return `${y}-${m}-${d}`;
    }
    // Matchar DD/MM/YYYY eller DD.MM.YYYY
    const euMatch = str.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})/);
    if (euMatch) {
        const d = euMatch[1].padStart(2, "0");
        const m = euMatch[2].padStart(2, "0");
        const y = euMatch[3];
        return `${y}-${m}-${d}`;
    }
    return str;
}

function isJobAcute(job) {
    const val = String(job["Akut?"] || "").trim().toLowerCase();
    return val === "ja" || val === "yes" || val === "true" || val === "1" || val === "akut";
}

function getStatusClass(statusRaw) {
    const s = String(statusRaw || "").trim().toLowerCase();
    if (!s) return "status-default";
    if (s.includes("avslut") || s.includes("klar") || s.includes("utförd")) return "status-done";
    if (s.includes("pågå") || s.includes("arbete") || s.includes("beställ")) return "status-progress";
    if (s.includes("ny") || s.includes("öppen") || s.includes("inkomm")) return "status-open";
    if (s.includes("vänt") || s.includes("paus") || s.includes("utred")) return "status-wait";
    return "status-default";
}

/* =========================================================
   RENDERING: AKTIVA FILTER & JOBBLISTA
   ========================================================= */

function renderActiveFilterToolbar() {
    const f = state.filters;
    const chips = [];

    if (f.caretaker) {
        chips.push({ label: `Skötare: ${f.caretaker}`, clear: () => { f.caretaker = ""; els.filterCaretaker.value = ""; } });
    }
    if (f.status) {
        chips.push({ label: `Status: ${f.status}`, clear: () => { f.status = ""; els.filterStatus.value = ""; } });
    }
    if (f.type) {
        chips.push({ label: `Typ: ${f.type}`, clear: () => { f.type = ""; els.filterType.value = ""; } });
    }
    if (f.nr) {
        chips.push({ label: `Nr: ${f.nr}`, clear: () => { f.nr = ""; els.filterNr.value = ""; } });
    }
    if (f.dateFrom || f.dateTo) {
        const rangeText = `${f.dateFrom || "…"} → ${f.dateTo || "…"}`;
        chips.push({
            label: `Datum: ${rangeText}`,
            clear: () => {
                f.dateFrom = "";
                f.dateTo = "";
                f.datePreset = "all";
                els.filterDateFrom.value = "";
                els.filterDateTo.value = "";
                updatePresetChipsUI();
            }
        });
    }
    if (f.acuteOnly) {
        chips.push({ label: "🔥 Endast akuta", clear: () => { f.acuteOnly = false; els.filterAcute.checked = false; } });
    }
    if (f.search) {
        chips.push({ label: `Sök: "${f.search}"`, clear: () => { f.search = ""; els.filterSearch.value = ""; els.btnClearSearch.hidden = true; } });
    }

    // Uppdatera räknare i headern på mobil
    if (chips.length > 0) {
        els.activeFilterBadge.hidden = false;
        els.activeFilterBadge.textContent = String(chips.length);
        els.btnResetFilters.hidden = false;
    } else {
        els.activeFilterBadge.hidden = true;
        els.btnResetFilters.hidden = true;
    }

    els.resultsCount.textContent = `Visar ${state.filteredJobs.length} av ${state.allJobs.length} jobb`;
    els.activeChips.innerHTML = "";

    chips.forEach((chip) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "active-chip";
        btn.innerHTML = `<span>${escapeHtml(chip.label)}</span><span>✕</span>`;
        btn.addEventListener("click", () => {
            chip.clear();
            applyFiltersAndRender();
        });
        els.activeChips.appendChild(btn);
    });
}

function renderJobsList() {
    els.jobsList.innerHTML = "";

    if (state.allJobs.length === 0) {
        els.emptyState.hidden = true;
        return;
    }

    if (state.filteredJobs.length === 0) {
        els.emptyState.hidden = false;
        return;
    }

    els.emptyState.hidden = true;

    const fragment = document.createDocumentFragment();

    state.filteredJobs.forEach((job) => {
        const card = document.createElement("article");
        const acute = isJobAcute(job);
        card.className = `job-card ${acute ? "is-acute" : ""}`.trim();
        card.tabIndex = 0;

        const nrText = job["Nr"] ? `#${job["Nr"]}` : "Utan nr";
        const createdText = job["Skapad datum"] || "Datum saknas";
        const statusText = job["Status"] || "Ej angiven";
        const statusClass = getStatusClass(statusText);
        const typeText = job["Typ"] || "";
        const titleText = job["Rubrik"] || job["Jobb-beskrivning"] || "Arbetsorder utan rubrik";
        const descText = job["Jobb-beskrivning"] || "";
        const caretakerText = job["Fastighetsskötare"] || "Ej tilldelad";
        const addressParts = [job["Adress"], job["Område"] || job["Huskod"]].filter(Boolean);
        const addressText = addressParts.join(" · ") || "Adress saknas";
        const bovardText = job["Bovärd Namn"] || job["Bovärd"] || "—";
        const exactLocation = job["Var mer exakt?"] || (job["Huskod"] ? `Huskod ${job["Huskod"]}` : "—");

        card.innerHTML = `
            <div class="job-card-top">
                <div class="job-card-top-left">
                    <span class="nr-badge">${escapeHtml(nrText)}</span>
                    <span class="date-badge">📅 ${escapeHtml(createdText)}</span>
                    ${typeText ? `<span class="type-badge">${escapeHtml(typeText)}</span>` : ""}
                </div>
                <div class="job-card-top-right">
                    ${acute ? `<span class="acute-badge">🔥 Akut</span>` : ""}
                    <span class="status-badge ${statusClass}">${escapeHtml(statusText)}</span>
                </div>
            </div>

            <h3 class="job-card-title">${escapeHtml(titleText)}</h3>
            ${descText && descText !== titleText ? `<p class="job-card-desc">${escapeHtml(descText)}</p>` : ""}

            <div class="job-card-meta">
                <div class="meta-item">
                    <span class="meta-label">Fastighetsskötare</span>
                    <span class="meta-value">🔧 ${escapeHtml(caretakerText)}</span>
                </div>
                <div class="meta-item">
                    <span class="meta-label">Adress / Område</span>
                    <span class="meta-value">📍 ${escapeHtml(addressText)}</span>
                </div>
                <div class="meta-item">
                    <span class="meta-label">Plats / Huskod</span>
                    <span class="meta-value">🏢 ${escapeHtml(exactLocation)}</span>
                </div>
                <div class="meta-item">
                    <span class="meta-label">Bovärd</span>
                    <span class="meta-value">👤 ${escapeHtml(bovardText)}</span>
                </div>
            </div>
        `;

        card.addEventListener("click", () => openJobModal(job));
        card.addEventListener("keydown", (e) => {
            if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                openJobModal(job);
            }
        });

        fragment.appendChild(card);
    });

    els.jobsList.appendChild(fragment);
}

/* =========================================================
   MODAL / MOBIL DETALJVY (ALLA 32 KOLUMNER)
   ========================================================= */

function openJobModal(job) {
    state.selectedJob = job;

    const nrText = job["Nr"] ? `#${job["Nr"]}` : "Utan nr";
    const statusText = job["Status"] || "Ej angiven";
    const statusClass = getStatusClass(statusText);
    const acute = isJobAcute(job);
    const typeText = job["Typ"] || "";

    els.modalBadges.innerHTML = `
        <span class="nr-badge">${escapeHtml(nrText)}</span>
        <span class="status-badge ${statusClass}">${escapeHtml(statusText)}</span>
        ${acute ? `<span class="acute-badge">🔥 Akut</span>` : ""}
        ${typeText ? `<span class="type-badge">${escapeHtml(typeText)}</span>` : ""}
    `;

    els.modalTitle.textContent = job["Rubrik"] || "Jobb #" + (job["Nr"] || "");
    const subParts = [
        job["Skapad datum"] ? `Skapad ${job["Skapad datum"]}` : "",
        job["Adress"] || "",
        job["Område"] || job["Distrikt"] || ""
    ].filter(Boolean);
    els.modalSubtitle.textContent = subParts.join(" · ");

    // Snabbknappar för mobil (Ring skötare, Ring bovärd, Karta)
    els.modalQuickActions.innerHTML = "";

    const caretakerPhone = (job["Fastighetsskötare Telefon"] || "").trim();
    if (caretakerPhone) {
        els.modalQuickActions.appendChild(
            createActionPill(`📞 Skötare (${job["Fastighetsskötare"] || caretakerPhone})`, `tel:${caretakerPhone.replace(/\s+/g, "")}`)
        );
    }

    const bovardPhone = (job["Bovärds telefon"] || "").trim();
    if (bovardPhone) {
        els.modalQuickActions.appendChild(
            createActionPill(`📞 Bovärd (${job["Bovärd Namn"] || job["Bovärd"] || bovardPhone})`, `tel:${bovardPhone.replace(/\s+/g, "")}`)
        );
    }

    const addressQuery = [job["Adress"], job["Område"]].filter(Boolean).join(", ");
    if (addressQuery) {
        els.modalQuickActions.appendChild(
            createActionPill("📍 Öppna i Karta", `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addressQuery)}`, true)
        );
    }

    renderModalBody(job);

    els.modalBackdrop.hidden = false;
    document.body.style.overflow = "hidden";
}

function createActionPill(label, href, external = false) {
    const a = document.createElement("a");
    a.className = "action-pill";
    a.href = href;
    if (external) {
        a.target = "_blank";
        a.rel = "noopener";
    }
    a.textContent = label;
    return a;
}

function renderModalBody(job) {
    const showEmpty = els.toggleAllColumns.checked;
    els.modalBody.innerHTML = "";

    // Fremhävd ruta för Jobb-beskrivning överst
    const desc = (job["Jobb-beskrivning"] || "").trim();
    if (desc || showEmpty) {
        const descBox = document.createElement("div");
        descBox.className = "detail-description-box";
        descBox.innerHTML = `
            <h4>Jobb-beskrivning</h4>
            <p>${desc ? escapeHtml(desc) : "<em>Ingen beskrivning angiven</em>"}</p>
        `;
        els.modalBody.appendChild(descBox);
    }

    DETAIL_GROUPS.forEach((group) => {
        const visibleFields = group.fields.filter((f) => {
            if (showEmpty) return true;
            return String(job[f.key] || "").trim() !== "";
        });

        if (visibleFields.length === 0) return;

        const section = document.createElement("div");
        section.className = "detail-section";

        const heading = document.createElement("h3");
        heading.className = "detail-section-title";
        heading.textContent = group.title;
        section.appendChild(heading);

        const grid = document.createElement("div");
        grid.className = "detail-grid";

        visibleFields.forEach((field) => {
            const rawVal = String(job[field.key] || "").trim();
            const isEmpty = rawVal === "";

            const cell = document.createElement("div");
            cell.className = `detail-cell ${field.full ? "full-width" : ""} ${isEmpty ? "is-empty" : ""}`.trim();

            const label = document.createElement("span");
            label.className = "detail-label";
            label.textContent = field.key;

            const value = document.createElement("span");
            value.className = "detail-value";

            if (isEmpty) {
                value.textContent = "—";
            } else if (field.type === "tel") {
                value.innerHTML = `<a href="tel:${escapeHtml(rawVal.replace(/\s+/g, ""))}">${escapeHtml(rawVal)}</a>`;
            } else if (field.type === "email") {
                value.innerHTML = `<a href="mailto:${escapeHtml(rawVal)}">${escapeHtml(rawVal)}</a>`;
            } else {
                value.textContent = rawVal;
            }

            cell.appendChild(label);
            cell.appendChild(value);
            grid.appendChild(cell);
        });

        section.appendChild(grid);
        els.modalBody.appendChild(section);
    });
}

function closeJobModal() {
    els.modalBackdrop.hidden = true;
    document.body.style.overflow = "";
    state.selectedJob = null;
}

function escapeHtml(str) {
    return String(str || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}
