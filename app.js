/* =========================================================
   AB-HEM · JOBS – APP LOGIC & GOOGLE SHEETS CONNECTOR
   Sheet ID: 1l_nOEIaMlOuiyAec5ElWUj5kQajIlC6_EHJZhazx6HU
   Anpassad för de 29 kolumnerna och enbart öppna jobb
   ========================================================= */

const SHEET_ID = "1l_nOEIaMlOuiyAec5ElWUj5kQajIlC6_EHJZhazx6HU";
const SHEET_GID = "0";
const PAGE_SIZE = 60;

// Exakt kolumnordning enligt den nya strukturen i Google Sheet (29 kolumner)
const COLUMNS = [
    "Nr",
    "Status",
    "Typ",
    "Skapad datum",
    "Avslutad",
    "Rubrik",
    "Jobb-beskrivning",
    "Hyresavi nr",
    "Huskod",
    "Var mer exakt?",
    "Akut?",
    "Fastighetsskötare",
    "Fastighetsskötare Email",
    "Fastighetsskötare Telefon",
    "Bovärd",
    "Bovärd Email",
    "Bovärd Namn",
    "Hyresavier::Lägenhetskod",
    "Bovärd Telefon",
    "Hyresavier::Namn",
    "Hyresavier::Adress",
    "Hyresavier::Lgh.nr",
    "Hyresavier::Postnr",
    "Hyresavier::Postadress",
    "Hyresavier::Tel 1",
    "Hyresavier::Email",
    "Hyresavier::Tillträdesdag",
    "Hyresavier::Månadskod",
    "Hyresavier::Utflyttningsdag"
];

// Gruppering i detaljvyn (alla 29 kolumner täcks)
const DETAIL_GROUPS = [
    {
        title: "Hyresgäst & Lägenhet (Hyresavier)",
        fields: [
            { key: "Hyresavier::Namn", full: true },
            { key: "Hyresavier::Adress", full: true },
            { key: "Hyresavier::Postnr" },
            { key: "Hyresavier::Postadress" },
            { key: "Hyresavier::Lgh.nr" },
            { key: "Hyresavier::Lägenhetskod" },
            { key: "Hyresavier::Tel 1", type: "tel" },
            { key: "Hyresavier::Email", type: "email" },
            { key: "Hyresavier::Tillträdesdag" },
            { key: "Hyresavier::Utflyttningsdag" },
            { key: "Hyresavier::Månadskod" },
            { key: "Hyresavi nr" }
        ]
    },
    {
        title: "Grundinfo & Status",
        fields: [
            { key: "Nr" },
            { key: "Status" },
            { key: "Typ" },
            { key: "Akut?" },
            { key: "Skapad datum" },
            { key: "Avslutad" },
            { key: "Huskod" },
            { key: "Var mer exakt?" },
            { key: "Rubrik", full: true },
            { key: "Jobb-beskrivning", full: true }
        ]
    },
    {
        title: "Fastighetsskötare & Bovärd",
        fields: [
            { key: "Fastighetsskötare" },
            { key: "Fastighetsskötare Telefon", type: "tel" },
            { key: "Fastighetsskötare Email", type: "email", full: true },
            { key: "Bovärd Namn" },
            { key: "Bovärd Telefon", type: "tel" },
            { key: "Bovärd Email", type: "email", full: true },
            { key: "Bovärd", full: true }
        ]
    }
];

// Applikationens tillstånd
const state = {
    allJobs: [],
    filteredJobs: [],
    visibleCount: PAGE_SIZE,
    selectedJob: null,
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
let scrollObserver = null;

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
    els.loadMoreWrap = document.getElementById("load-more-wrap");
    els.btnLoadMore = document.getElementById("btn-load-more");

    els.modalBackdrop = document.getElementById("job-modal-backdrop");
    els.modalBadges = document.getElementById("modal-badges");
    els.modalTitle = document.getElementById("modal-title");
    els.modalSubtitle = document.getElementById("modal-subtitle");
    els.modalQuickActions = document.getElementById("modal-quick-actions");
    els.modalBody = document.getElementById("modal-body");
    els.btnCloseModal = document.getElementById("btn-close-modal");
    els.btnModalDone = document.getElementById("btn-modal-done");
    els.toggleAllColumns = document.getElementById("toggle-all-columns");

    els.personalBanner = document.getElementById("personal-banner");
    els.personalName = document.getElementById("personal-name");
    els.personalStats = document.getElementById("personal-stats");
    els.btnSharePersonal = document.getElementById("btn-share-personal");
    els.btnClearPersonal = document.getElementById("btn-clear-personal");
    els.btnCopyCaretakerLink = document.getElementById("btn-copy-caretaker-link");
    els.toast = document.getElementById("toast");
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

    if (els.btnRetrySheet) {
        els.btnRetrySheet.addEventListener("click", () => loadSheetData());
    }

    // Sökfält
    let searchTimer = null;
    els.filterSearch.addEventListener("input", (e) => {
        const val = e.target.value.trim();
        els.btnClearSearch.hidden = !val;
        clearTimeout(searchTimer);
        searchTimer = setTimeout(() => {
            state.filters.search = val;
            applyFiltersAndRender();
        }, 80);
    });

    els.btnClearSearch.addEventListener("click", () => {
        els.filterSearch.value = "";
        state.filters.search = "";
        els.btnClearSearch.hidden = true;
        applyFiltersAndRender();
    });

    // Dropdowns & Nr
    els.filterCaretaker.addEventListener("change", (e) => {
        const val = e.target.value;
        state.filters.caretaker = val;
        syncCaretakerToUrlAndStorage(val);
        applyFiltersAndRender();
    });

    if (els.btnClearPersonal) {
        els.btnClearPersonal.addEventListener("click", () => {
            state.filters.caretaker = "";
            els.filterCaretaker.value = "";
            syncCaretakerToUrlAndStorage("");
            applyFiltersAndRender();
            showToast("Visar nu alla jobb på hela företaget.");
        });
    }

    if (els.btnSharePersonal) {
        els.btnSharePersonal.addEventListener("click", () => {
            copyCaretakerLink(state.filters.caretaker);
        });
    }

    if (els.btnCopyCaretakerLink) {
        els.btnCopyCaretakerLink.addEventListener("click", () => {
            copyCaretakerLink(state.filters.caretaker || els.filterCaretaker.value);
        });
    }

    els.filterStatus.addEventListener("change", (e) => {
        state.filters.status = e.target.value;
        applyFiltersAndRender();
    });

    els.filterType.addEventListener("change", (e) => {
        state.filters.type = e.target.value;
        applyFiltersAndRender();
    });

    let nrTimer = null;
    els.filterNr.addEventListener("input", (e) => {
        const val = e.target.value.trim();
        clearTimeout(nrTimer);
        nrTimer = setTimeout(() => {
            state.filters.nr = val;
            applyFiltersAndRender();
        }, 80);
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

    // Visa fler-knapp + automatisk scroll-laddning
    if (els.btnLoadMore) {
        els.btnLoadMore.addEventListener("click", () => {
            loadMoreCards();
        });
    }

    if ("IntersectionObserver" in window && els.loadMoreWrap) {
        scrollObserver = new IntersectionObserver(
            (entries) => {
                if (entries[0] && entries[0].isIntersecting) {
                    if (state.visibleCount < state.filteredJobs.length) {
                        loadMoreCards();
                    }
                }
            },
            { rootMargin: "320px" }
        );
        scrollObserver.observe(els.loadMoreWrap);
    }

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
   GOOGLE SHEETS FETCHING (CSV + JSONP FALLBACK)
   ========================================================= */

async function loadSheetData() {
    setLoading(true);
    els.syncStatus.textContent = "Läser in öppna jobb från Google Sheet…";

    try {
        const csvJobs = await fetchViaCsv();
        onSheetLoaded(csvJobs);
    } catch (csvErr) {
        try {
            const jsonpJobs = await fetchViaGvizJsonp();
            onSheetLoaded(jsonpJobs);
        } catch (jsonpErr) {
            console.warn("Kunde inte hämta Google Sheet:", csvErr, jsonpErr);
            setLoading(false);
            els.accessBanner.hidden = false;
            els.syncStatus.textContent = "Kunde inte nå Google Sheet";
        }
    }
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
    const headerIndexMap = COLUMNS.map((colName, idx) => {
        const found = headers.findIndex((h) => normalizeHeader(h) === normalizeHeader(colName));
        return found !== -1 ? found : idx;
    });

    const jobs = [];
    for (let i = 1; i < matrix.length; i++) {
        const row = matrix[i];
        if (!row || row.length === 0) continue;

        const job = {};
        let hasMeaningfulValue = false;

        for (let c = 0; c < COLUMNS.length; c++) {
            const colName = COLUMNS[c];
            const val = (row[headerIndexMap[c]] || "").trim();
            job[colName] = val;
            if (isMeaningfulValue(val)) {
                hasMeaningfulValue = true;
            }
        }

        if (hasMeaningfulValue && (job["Nr"] || job["Rubrik"] || job["Jobb-beskrivning"])) {
            jobs.push(job);
        }
    }
    return jobs;
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
        }, 15000);

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
            reject(new Error("Kunde inte ladda Google Sheet."));
        };

        script.src = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?gid=${SHEET_GID}&tqx=out:json;responseHandler:${callbackName}&_=${Date.now()}`;
        document.body.appendChild(script);
    });
}

function parseGvizTable(table) {
    const rawCols = (table.cols || []).map((col, idx) => (col.label || "").trim() || COLUMNS[idx] || `Kolumn_${idx}`);
    const rows = table.rows || [];

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

    const headerIndexMap = COLUMNS.map((colName, idx) => {
        const found = effectiveHeaders.findIndex((h) => normalizeHeader(h) === normalizeHeader(colName));
        return found !== -1 ? found : idx;
    });

    const jobs = [];
    for (let r = startRowIndex; r < rows.length; r++) {
        const rowCells = (rows[r] && rows[r].c) ? rows[r].c : [];
        const job = {};
        let hasMeaningfulValue = false;

        for (let c = 0; c < COLUMNS.length; c++) {
            const colName = COLUMNS[c];
            const val = getCellDisplayValue(rowCells[headerIndexMap[c]]);
            job[colName] = val;
            if (isMeaningfulValue(val)) {
                hasMeaningfulValue = true;
            }
        }

        if (hasMeaningfulValue && (job["Nr"] || job["Rubrik"] || job["Jobb-beskrivning"])) {
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

function onSheetLoaded(jobs) {
    state.allJobs = jobs;
    setLoading(false);
    els.accessBanner.hidden = true;

    const now = new Date().toLocaleTimeString("sv-SE", { hour: "2-digit", minute: "2-digit" });
    els.syncStatus.textContent = `Live · ${jobs.length.toLocaleString("sv-SE")} öppna jobb · Uppdaterad ${now}`;

    // Läs av eventuell personlig snabblänk i URL eller sparad fastighetsskötare
    detectUrlParametersAndStorage();

    applyFiltersAndRender();
}

function setLoading(loading) {
    els.loadingState.hidden = !loading;
    els.refreshIcon.classList.toggle("spinning", loading);
}

/* =========================================================
   POPULERA DROPDOWNS & KPI-PILLER (DYNAMISKT / FACETTERAT)
   ========================================================= */

function doesJobMatchFilters(job, ignoreField = "") {
    const f = state.filters;
    const searchLower = f.search.toLowerCase();
    const nrLower = f.nr.toLowerCase();

    // 1. Fastighetsskötare
    if (ignoreField !== "caretaker" && f.caretaker) {
        if (cleanEmptyValue(job["Fastighetsskötare"]) !== f.caretaker) {
            return false;
        }
    }

    // 2. Status
    if (ignoreField !== "status" && f.status) {
        if ((job["Status"] || "").trim() !== f.status) {
            return false;
        }
    }

    // 3. Typ (skiftlägesoberoende)
    if (ignoreField !== "type" && f.type) {
        if (cleanEmptyValue(job["Typ"]).toLowerCase() !== f.type.toLowerCase()) {
            return false;
        }
    }

    // 4. Jobb-Nr
    if (ignoreField !== "nr" && nrLower) {
        if (!(job["Nr"] || "").toLowerCase().includes(nrLower)) {
            return false;
        }
    }

    // 5. Endast akuta
    if (ignoreField !== "acute" && f.acuteOnly) {
        if (!isJobAcute(job)) {
            return false;
        }
    }

    // 6. Skapad datum (Från / Till)
    if (ignoreField !== "date" && (f.dateFrom || f.dateTo)) {
        const jobDate = normalizeDateString(job["Skapad datum"]);
        if (!jobDate) return false;
        if (f.dateFrom && jobDate < f.dateFrom) return false;
        if (f.dateTo && jobDate > f.dateTo) return false;
    }

    // 7. Fritextsökning (söker i alla relevanta fält inkl. Hyresavier)
    if (ignoreField !== "search" && searchLower) {
        const haystack = [
            job["Nr"],
            job["Rubrik"],
            job["Jobb-beskrivning"],
            job["Hyresavi nr"],
            job["Huskod"],
            job["Var mer exakt?"],
            job["Fastighetsskötare"],
            job["Bovärd"],
            job["Bovärd Namn"],
            job["Typ"],
            job["Hyresavier::Lägenhetskod"],
            job["Hyresavier::Namn"],
            job["Hyresavier::Adress"],
            job["Hyresavier::Lgh.nr"],
            job["Hyresavier::Postnr"],
            job["Hyresavier::Postadress"],
            job["Hyresavier::Tel 1"],
            job["Hyresavier::Email"],
            job["Hyresavier::Månadskod"]
        ]
            .join(" ")
            .toLowerCase();

        if (!haystack.includes(searchLower)) {
            return false;
        }
    }

    return true;
}

function populateFilterOptions() {
    const jobsForCaretaker = state.allJobs.filter((j) => doesJobMatchFilters(j, "caretaker"));
    populateSelectWithCounts(
        els.filterCaretaker,
        jobsForCaretaker,
        "Fastighetsskötare",
        `Alla fastighetsskötare (${jobsForCaretaker.length.toLocaleString("sv-SE")})`,
        state.filters.caretaker,
        false
    );

    const jobsForStatus = state.allJobs.filter((j) => doesJobMatchFilters(j, "status"));
    populateStatusSelect(jobsForStatus);

    const jobsForType = state.allJobs.filter((j) => doesJobMatchFilters(j, "type"));
    populateSelectWithCounts(
        els.filterType,
        jobsForType,
        "Typ",
        `Alla typer (${jobsForType.length.toLocaleString("sv-SE")})`,
        state.filters.type,
        true
    );
}

function populateStatusSelect(baseJobs) {
    const counts = new Map();

    baseJobs.forEach((job) => {
        const st = (job["Status"] || "").trim();
        if (st) {
            counts.set(st, (counts.get(st) || 0) + 1);
        }
    });

    const currentValue = state.filters.status;
    els.filterStatus.innerHTML = "";

    const allOpt = document.createElement("option");
    allOpt.value = "";
    allOpt.textContent = `Alla statusar (${baseJobs.length.toLocaleString("sv-SE")})`;
    els.filterStatus.appendChild(allOpt);

    const statusOrder = ["Ny", "Pågår", "Pausad"];
    const sortedKeys = Array.from(counts.keys()).sort((a, b) => {
        const idxA = statusOrder.indexOf(a);
        const idxB = statusOrder.indexOf(b);
        if (idxA !== -1 && idxB !== -1) return idxA - idxB;
        if (idxA !== -1) return -1;
        if (idxB !== -1) return 1;
        return a.localeCompare(b, "sv");
    });

    sortedKeys.forEach((key) => {
        const opt = document.createElement("option");
        opt.value = key;
        opt.textContent = `${key} (${counts.get(key).toLocaleString("sv-SE")})`;
        els.filterStatus.appendChild(opt);
    });

    if (currentValue && !counts.has(currentValue)) {
        const zeroOpt = document.createElement("option");
        zeroOpt.value = currentValue;
        zeroOpt.textContent = `${currentValue} (0)`;
        els.filterStatus.appendChild(zeroOpt);
    }

    els.filterStatus.value = currentValue;
}

function populateSelectWithCounts(selectEl, baseJobs, columnKey, defaultLabel, currentValue, caseInsensitive = false) {
    const counts = new Map();
    const displayLabels = new Map();

    baseJobs.forEach((job) => {
        const raw = cleanEmptyValue(job[columnKey]);
        if (!raw) return;
        const key = caseInsensitive ? raw.toLowerCase() : raw;
        counts.set(key, (counts.get(key) || 0) + 1);
        if (!displayLabels.has(key) || (raw[0] === raw[0].toUpperCase() && raw[0] !== raw[0].toLowerCase())) {
            displayLabels.set(key, raw);
        }
    });

    const sortedKeys = Array.from(counts.keys()).sort((a, b) =>
        (displayLabels.get(a) || a).localeCompare(displayLabels.get(b) || b, "sv")
    );

    selectEl.innerHTML = "";

    const firstOpt = document.createElement("option");
    firstOpt.value = "";
    firstOpt.textContent = defaultLabel;
    selectEl.appendChild(firstOpt);

    sortedKeys.forEach((key) => {
        const opt = document.createElement("option");
        opt.value = key;
        opt.textContent = `${displayLabels.get(key)} (${counts.get(key).toLocaleString("sv-SE")})`;
        selectEl.appendChild(opt);
    });

    if (currentValue && !counts.has(currentValue)) {
        const zeroOpt = document.createElement("option");
        zeroOpt.value = currentValue;
        zeroOpt.textContent = `${currentValue} (0)`;
        selectEl.appendChild(zeroOpt);
    }

    selectEl.value = currentValue;
}

function renderKpiStrip() {
    els.kpiStrip.innerHTML = "";
    const baseJobs = state.allJobs.filter((j) => doesJobMatchFilters(j, "status"));

    // 1. Alla öppna jobb (inom nuvarande övriga filter)
    const allPill = createKpiPill(
        "Alla öppna",
        baseJobs.length,
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

    // 2. Akuta jobb (om det finns några)
    const acuteCount = baseJobs.filter(isJobAcute).length;
    if (acuteCount > 0 || state.filters.acuteOnly) {
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

    // 3. Per Status (Ny, Pågår, Pausad)
    const statusOrder = ["Ny", "Pågår", "Pausad"];
    const statusCounts = new Map();
    baseJobs.forEach((job) => {
        const st = (job["Status"] || "").trim();
        if (st) {
            statusCounts.set(st, (statusCounts.get(st) || 0) + 1);
        }
    });

    const sortedStatuses = Array.from(statusCounts.keys()).sort((a, b) => {
        const idxA = statusOrder.indexOf(a);
        const idxB = statusOrder.indexOf(b);
        if (idxA !== -1 && idxB !== -1) return idxA - idxB;
        if (idxA !== -1) return -1;
        if (idxB !== -1) return 1;
        return a.localeCompare(b, "sv");
    });

    sortedStatuses.forEach((statusName) => {
        const count = statusCounts.get(statusName);
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
    btn.innerHTML = `<span>${escapeHtml(label)}</span><strong>${count.toLocaleString("sv-SE")}</strong>`;
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

    syncCaretakerToUrlAndStorage("");

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
    const filtered = state.allJobs.filter((job) => doesJobMatchFilters(job, ""));

    // Sortering
    filtered.sort((a, b) => compareJobs(a, b, state.filters.sort));

    state.filteredJobs = filtered;
    state.visibleCount = PAGE_SIZE;

    populateFilterOptions();
    renderKpiStrip();
    renderActiveFilterToolbar();
    updatePersonalBannerUI();
    renderJobsList(false);
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
    return sortKey === "date_asc" ? nrA - nrB : nrB - nrA;
}

function normalizeDateString(raw) {
    if (!raw) return "";
    const str = String(raw).trim();
    const isoMatch = str.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})/);
    if (isoMatch) {
        const y = isoMatch[1];
        const m = isoMatch[2].padStart(2, "0");
        const d = isoMatch[3].padStart(2, "0");
        return `${y}-${m}-${d}`;
    }
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

function isMeaningfulValue(val) {
    const s = String(val || "").trim().toLowerCase();
    return s !== "" && s !== "0" && s !== "inget";
}

function cleanEmptyValue(val) {
    const s = String(val || "").trim();
    if (s === "" || s === "0" || s.toLowerCase() === "inget") {
        return "";
    }
    return s;
}

function formatSwedishPhone(rawPhone) {
    const s = cleanEmptyValue(rawPhone);
    if (!s) return "";
    if (/^[1-9]\d{7,9}$/.test(s)) {
        return "0" + s;
    }
    return s;
}

function extractPhoneFromText(text) {
    const s = cleanEmptyValue(text);
    if (!s) return "";
    const match = s.match(/(\+46|0)\d[\d\s-]{6,13}\d/);
    return match ? match[0].trim() : "";
}

function getStatusClass(statusRaw) {
    const s = String(statusRaw || "").trim().toLowerCase();
    if (!s) return "status-default";
    if (s.includes("klar") || s.includes("avslut") || s.includes("utförd")) return "status-done";
    if (s.includes("pågå") || s.includes("arbete") || s.includes("beställ")) return "status-progress";
    if (s.includes("ny") || s.includes("öppen") || s.includes("inkomm")) return "status-open";
    if (s.includes("paus") || s.includes("vänt") || s.includes("utred")) return "status-wait";
    return "status-default";
}

/* =========================================================
   URL-PARAMETRAR, SNABBLÄNKAR & PERSONLIG MOBILHEADER
   ========================================================= */

function detectUrlParametersAndStorage() {
    const params = new URLSearchParams(window.location.search);
    const paramCaretaker = params.get("skotare") || params.get("fastighetsskotare") || params.get("caretaker");
    const paramBovard = params.get("bovard") || params.get("vard");

    if (paramCaretaker) {
        const queryLower = paramCaretaker.trim().toLowerCase();
        const allCaretakers = Array.from(new Set(state.allJobs.map((j) => cleanEmptyValue(j["Fastighetsskötare"])).filter(Boolean)));

        // Exakt eller delvis matchning mot fastighetsskötare i arket
        const match = allCaretakers.find((c) => c.toLowerCase() === queryLower)
            || allCaretakers.find((c) => c.toLowerCase().includes(queryLower))
            || paramCaretaker.trim();

        state.filters.caretaker = match;
        els.filterCaretaker.value = match;
        try {
            localStorage.setItem("abhem_jobs_saved_caretaker", match);
        } catch (_) { }

        // På mobil: fäll ihop filterpanelen så att skötaren ser sina jobb direkt under bannern
        if (window.innerWidth <= 768 && els.filterPanel) {
            els.filterPanel.classList.add("collapsed");
            if (els.btnToggleFilters) {
                els.btnToggleFilters.setAttribute("aria-expanded", "false");
            }
        }
        return;
    }

    if (paramBovard) {
        state.filters.search = paramBovard.trim();
        els.filterSearch.value = paramBovard.trim();
        els.btnClearSearch.hidden = false;
        return;
    }

    // Om inga URL-parametrar gavs, kolla om användaren har sparat sin fastighetsskötare i localStorage
    try {
        const saved = localStorage.getItem("abhem_jobs_saved_caretaker");
        if (saved) {
            const allCaretakers = Array.from(new Set(state.allJobs.map((j) => cleanEmptyValue(j["Fastighetsskötare"])).filter(Boolean)));
            if (allCaretakers.includes(saved)) {
                state.filters.caretaker = saved;
                els.filterCaretaker.value = saved;
                if (window.innerWidth <= 768 && els.filterPanel) {
                    els.filterPanel.classList.add("collapsed");
                    if (els.btnToggleFilters) {
                        els.btnToggleFilters.setAttribute("aria-expanded", "false");
                    }
                }
            }
        }
    } catch (_) { }
}

function syncCaretakerToUrlAndStorage(caretaker) {
    const params = new URLSearchParams(window.location.search);
    if (caretaker) {
        params.set("skotare", caretaker);
        try {
            localStorage.setItem("abhem_jobs_saved_caretaker", caretaker);
        } catch (_) { }
    } else {
        params.delete("skotare");
        params.delete("fastighetsskotare");
        params.delete("caretaker");
        try {
            localStorage.removeItem("abhem_jobs_saved_caretaker");
        } catch (_) { }
    }

    const newSearch = params.toString() ? `?${params.toString()}` : window.location.pathname;
    window.history.replaceState(null, "", newSearch);
}

function updatePersonalBannerUI() {
    const caretaker = state.filters.caretaker;
    if (!caretaker) {
        if (els.personalBanner) els.personalBanner.hidden = true;
        if (els.btnCopyCaretakerLink) els.btnCopyCaretakerLink.hidden = true;
        return;
    }

    if (els.personalBanner) {
        els.personalBanner.hidden = false;
        els.personalName.textContent = caretaker;

        // Räkna antal aktiva och akuta jobb för vald skötare
        const caretakerJobs = state.allJobs.filter((j) => cleanEmptyValue(j["Fastighetsskötare"]) === caretaker);
        const acuteCount = caretakerJobs.filter(isJobAcute).length;
        const total = caretakerJobs.length;

        let statsHtml = `Du har <strong>${total}</strong> aktiv${total === 1 ? "t" : "a"} jobb tilldelat`;
        if (acuteCount > 0) {
            statsHtml += ` <span class="acute-highlight">🔥 ${acuteCount} akut${acuteCount === 1 ? "" : "a"}</span>`;
        }
        els.personalStats.innerHTML = statsHtml;
    }

    if (els.btnCopyCaretakerLink) {
        els.btnCopyCaretakerLink.hidden = false;
        els.btnCopyCaretakerLink.title = `Kopiera snabblänk för ${caretaker}`;
    }
}

async function copyCaretakerLink(caretakerName) {
    if (!caretakerName) return;
    const url = `${window.location.origin}${window.location.pathname}?skotare=${encodeURIComponent(caretakerName)}`;

    try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            await navigator.clipboard.writeText(url);
        } else {
            const temp = document.createElement("input");
            temp.value = url;
            document.body.appendChild(temp);
            temp.select();
            document.execCommand("copy");
            document.body.removeChild(temp);
        }

        showToast(`📋 Snabblänk för ${caretakerName} kopierad till urklipp!`);

        if (els.btnCopyCaretakerLink) {
            const original = els.btnCopyCaretakerLink.innerHTML;
            els.btnCopyCaretakerLink.classList.add("is-copied");
            els.btnCopyCaretakerLink.innerHTML = "✅ Kopierad!";
            setTimeout(() => {
                els.btnCopyCaretakerLink.classList.remove("is-copied");
                els.btnCopyCaretakerLink.innerHTML = original;
            }, 2500);
        }
    } catch (e) {
        prompt("Kopiera snabblänken manuellt:", url);
    }
}

let toastTimer = null;
function showToast(message, duration = 3000) {
    if (!els.toast) return;
    els.toast.textContent = message;
    els.toast.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
        els.toast.hidden = true;
    }, duration);
}

/* =========================================================
   RENDERING: AKTIVA FILTER & JOBBLISTA
   ========================================================= */

function renderActiveFilterToolbar() {
    const f = state.filters;
    const chips = [];

    if (f.caretaker) {
        chips.push({
            label: `Skötare: ${f.caretaker}`,
            clear: () => {
                f.caretaker = "";
                els.filterCaretaker.value = "";
                syncCaretakerToUrlAndStorage("");
            }
        });
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

    if (chips.length > 0) {
        els.activeFilterBadge.hidden = false;
        els.activeFilterBadge.textContent = String(chips.length);
        els.btnResetFilters.hidden = false;
    } else {
        els.activeFilterBadge.hidden = true;
        els.btnResetFilters.hidden = true;
    }

    els.resultsCount.textContent = `Visar ${state.filteredJobs.length.toLocaleString("sv-SE")} av ${state.allJobs.length.toLocaleString("sv-SE")} öppna jobb`;
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

function renderJobsList(append = false) {
    if (!append) {
        els.jobsList.innerHTML = "";
    }

    if (state.allJobs.length === 0) {
        els.emptyState.hidden = true;
        if (els.loadMoreWrap) els.loadMoreWrap.hidden = true;
        return;
    }

    if (state.filteredJobs.length === 0) {
        els.emptyState.hidden = false;
        if (els.loadMoreWrap) els.loadMoreWrap.hidden = true;
        return;
    }

    els.emptyState.hidden = true;

    const startIdx = append ? els.jobsList.children.length : 0;
    const endIdx = Math.min(state.visibleCount, state.filteredJobs.length);
    const slice = state.filteredJobs.slice(startIdx, endIdx);

    const fragment = document.createDocumentFragment();

    slice.forEach((job) => {
        fragment.appendChild(createJobCardElement(job));
    });

    els.jobsList.appendChild(fragment);

    if (els.loadMoreWrap && els.btnLoadMore) {
        const remaining = state.filteredJobs.length - endIdx;
        if (remaining > 0) {
            els.loadMoreWrap.hidden = false;
            els.btnLoadMore.textContent = `Visa fler jobb (${remaining.toLocaleString("sv-SE")} kvar)`;
        } else {
            els.loadMoreWrap.hidden = true;
        }
    }
}

function loadMoreCards() {
    state.visibleCount += PAGE_SIZE;
    renderJobsList(true);
}

function createJobCardElement(job) {
    const card = document.createElement("article");
    const acute = isJobAcute(job);
    card.className = `job-card ${acute ? "is-acute" : ""}`.trim();
    card.tabIndex = 0;

    const nrText = job["Nr"] ? `#${job["Nr"]}` : "Utan nr";
    const createdText = job["Skapad datum"] || "Datum saknas";
    const statusText = job["Status"] || "Ej angiven";
    const statusClass = getStatusClass(statusText);
    const typeText = cleanEmptyValue(job["Typ"]);
    const titleText = cleanEmptyValue(job["Rubrik"]) || cleanEmptyValue(job["Jobb-beskrivning"]) || `Jobb ${nrText}`;
    const descText = cleanEmptyValue(job["Jobb-beskrivning"]);
    const caretakerText = cleanEmptyValue(job["Fastighetsskötare"]) || "Ej tilldelad";

    const streetAddress = cleanEmptyValue(job["Hyresavier::Adress"]);
    const cityAddress = cleanEmptyValue(job["Hyresavier::Postadress"]);
    const lghKod = cleanEmptyValue(job["Hyresavier::Lägenhetskod"]);
    const lghNr = cleanEmptyValue(job["Hyresavier::Lgh.nr"]);
    const huskod = cleanEmptyValue(job["Huskod"]);

    const addressParts = [
        streetAddress,
        cityAddress,
        !streetAddress && huskod ? `Huskod ${huskod}` : ""
    ].filter(Boolean);
    const addressText = addressParts.join(" · ") || "—";

    const tenantName = cleanEmptyValue(job["Hyresavier::Namn"]);
    const bovardText = cleanEmptyValue(job["Bovärd Namn"]) || cleanEmptyValue(job["Bovärd"]) || "—";

    const locParts = [
        tenantName,
        lghNr ? `Lgh ${lghNr}` : "",
        lghKod ? `Kod ${lghKod}` : "",
        cleanEmptyValue(job["Var mer exakt?"])
    ].filter(Boolean);
    const exactLocation = locParts.join(" · ") || (cleanEmptyValue(job["Hyresavi nr"]) ? `Avi ${cleanEmptyValue(job["Hyresavi nr"])}` : "—");

    // Mobiloptimerade snabbknappar (Ring hyresgäst / Karta / Detaljer)
    const rawPhone = cleanEmptyValue(job["Hyresavier::Tel 1"]) || extractPhoneFromText(job["Jobb-beskrivning"] || "");
    const cleanPhone = formatSwedishPhone(rawPhone);
    const tenantFirstName = tenantName ? tenantName.split(" ")[0] : "";
    const mapAddress = [streetAddress, cityAddress || cleanEmptyValue(job["Hyresavier::Postnr"])].filter(Boolean).join(", ");

    const actionBtns = [];

    if (cleanPhone) {
        const dialNumber = cleanPhone.replace(/[^\d+]/g, "");
        actionBtns.push(`
            <a href="tel:${escapeHtml(dialNumber)}" class="card-action-btn card-action-call" title="Ring ${escapeHtml(tenantName || 'hyresgäst')}" onclick="event.stopPropagation()">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                </svg>
                <span>Ring ${escapeHtml(tenantFirstName || 'hyresgäst')}</span>
            </a>
        `);
    }

    if (mapAddress) {
        actionBtns.push(`
            <a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapAddress)}" target="_blank" rel="noopener" class="card-action-btn card-action-map" title="Öppna adress i Google Maps" onclick="event.stopPropagation()">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
                    <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"></polygon>
                    <line x1="8" y1="2" x2="8" y2="18"></line>
                    <line x1="16" y1="6" x2="16" y2="22"></line>
                </svg>
                <span>Karta</span>
            </a>
        `);
    }

    actionBtns.push(`
        <button type="button" class="card-action-btn card-action-open" aria-label="Visa fullständiga jobbdetaljer">
            <span>Öppna →</span>
        </button>
    `);

    const actionsHtml = `<div class="job-card-actions">${actionBtns.join("")}</div>`;

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
                <span class="meta-label">Adress / Ort</span>
                <span class="meta-value">📍 ${escapeHtml(addressText)}</span>
            </div>
            <div class="meta-item">
                <span class="meta-label">Hyresgäst / Lägenhet</span>
                <span class="meta-value">🏠 ${escapeHtml(exactLocation)}</span>
            </div>
            <div class="meta-item">
                <span class="meta-label">Bovärd</span>
                <span class="meta-value">👤 ${escapeHtml(bovardText)}</span>
            </div>
        </div>

        ${actionsHtml}
    `;

    card.addEventListener("click", () => openJobModal(job));
    card.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            openJobModal(job);
        }
    });

    return card;
}

/* =========================================================
   MODAL / MOBIL DETALJVY (ALLA 29 KOLUMNER)
   ========================================================= */

function openJobModal(job) {
    state.selectedJob = job;

    const nrText = job["Nr"] ? `#${job["Nr"]}` : "Utan nr";
    const statusText = job["Status"] || "Ej angiven";
    const statusClass = getStatusClass(statusText);
    const acute = isJobAcute(job);
    const typeText = cleanEmptyValue(job["Typ"]);

    els.modalBadges.innerHTML = `
        <span class="nr-badge">${escapeHtml(nrText)}</span>
        <span class="status-badge ${statusClass}">${escapeHtml(statusText)}</span>
        ${acute ? `<span class="acute-badge">🔥 Akut</span>` : ""}
        ${typeText ? `<span class="type-badge">${escapeHtml(typeText)}</span>` : ""}
    `;

    els.modalTitle.textContent = cleanEmptyValue(job["Rubrik"]) || "Jobb " + nrText;
    const modalAddress = cleanEmptyValue(job["Hyresavier::Adress"]);
    const modalCity = cleanEmptyValue(job["Hyresavier::Postadress"]);
    const modalLgh = cleanEmptyValue(job["Hyresavier::Lgh.nr"]);

    const subParts = [
        job["Skapad datum"] ? `Skapad ${job["Skapad datum"]}` : "",
        modalAddress,
        modalLgh ? `Lgh ${modalLgh}` : "",
        modalCity
    ].filter(Boolean);
    els.modalSubtitle.textContent = subParts.join(" · ");

    // Snabbknappar för mobil (Ring hyresgäst, Ring skötare, Ring bovärd, Karta)
    els.modalQuickActions.innerHTML = "";

    const tenantPhone = formatSwedishPhone(job["Hyresavier::Tel 1"]);
    if (tenantPhone) {
        const tenantLabel = cleanEmptyValue(job["Hyresavier::Namn"]) || tenantPhone;
        els.modalQuickActions.appendChild(
            createActionPill(
                `📞 Hyresgäst (${tenantLabel})`,
                `tel:${tenantPhone.replace(/[^\d+]/g, "")}`
            )
        );
    }

    const caretakerPhone = formatSwedishPhone(job["Fastighetsskötare Telefon"]);
    if (caretakerPhone) {
        els.modalQuickActions.appendChild(
            createActionPill(
                `📞 Skötare (${cleanEmptyValue(job["Fastighetsskötare"]) || caretakerPhone})`,
                `tel:${caretakerPhone.replace(/[^\d+]/g, "")}`
            )
        );
    }

    const bovardPhone = formatSwedishPhone(job["Bovärd Telefon"]) || extractPhoneFromText(job["Bovärd"]);
    if (bovardPhone) {
        const bovardName =
            cleanEmptyValue(job["Bovärd Namn"]) ||
            cleanEmptyValue(job["Bovärd"]).replace(bovardPhone, "").trim() ||
            bovardPhone;
        els.modalQuickActions.appendChild(
            createActionPill(`📞 Bovärd (${bovardName})`, `tel:${bovardPhone.replace(/[^\d+]/g, "")}`)
        );
    }

    const addressQuery = [
        modalAddress,
        cleanEmptyValue(job["Hyresavier::Postnr"]),
        modalCity
    ]
        .filter(Boolean)
        .join(" ");
    if (addressQuery) {
        els.modalQuickActions.appendChild(
            createActionPill(
                "📍 Öppna i Karta",
                `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addressQuery)}`,
                true
            )
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

    const desc = cleanEmptyValue(job["Jobb-beskrivning"]);
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
            return isMeaningfulValue(job[f.key]);
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
            let rawVal = String(job[field.key] || "").trim();
            const isEmpty = !isMeaningfulValue(rawVal);

            if (!isEmpty && field.type === "tel") {
                rawVal = formatSwedishPhone(rawVal);
            }

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
                value.innerHTML = `<a href="tel:${escapeHtml(rawVal.replace(/[^\d+]/g, ""))}">${escapeHtml(rawVal)}</a>`;
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
