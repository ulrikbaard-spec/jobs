/* =========================================================
   AB-HEM · CHATBOT ENGINE (LOCAL + SELECTABLE AI MODEL)
   ========================================================= */

const DEFAULT_SYSTEM_PROMPT = `Du är AB-Hems digitala kundtjänstassistent på ab-hem.se.
Svara alltid vänligt, kortfattat och på svenska.
Hitta ALDRIG på egna regler, priser, uppsägningstider eller löften.
Lista aldrig påhittade lediga lägenheter – hänvisa alltid med länk till sidan för lediga bostäder.

FAKTA & LÄNKAR FÖR AB-HEM:
- Lediga bostäder: https://ab-hem.se/lediga-bostader/
- Intresseanmälan: https://ab-hem.se/intresseanmalan/
- Hyres-pott (Bostadsstipendium): Utvalda lägenheter kan beviljas 500–1 500 kr lägre hyra/månad i 60 månader (5 år). Alla kan ansöka genom att berätta om sin boendesituation och sitt behov. Vanliga uthyrningskrav gäller. Läs mer och ansök: https://ab-hem.se/hyres-pott/ eller se bostäder med Hyres-pott: https://ab-hem.se/lediga-bostader/?lan=&kommun=&antal_rum=&ovrigt=Hyres-pott&filter_submit=Hitta+bostad&apartment_sort_list=
- Uthyrningspolicy & krav: https://ab-hem.se/uthyrningspolicy/
- Möblerade lägenheter: https://ab-hem.se/moblerade-lagenheter/
- Naturnära boende: https://ab-hem.se/naturnara-boende-2/
- Våra 17 kommuner (https://ab-hem.se/kommuner/): Norberg (Kärrgruvan), Sala, Avesta (Krylbo, Horndal, Näs bruk, By kyrkby), Hedemora (Stjärnsund), Laxå, Lindesberg (Guldsmedshyttan, Storå, Fellingsbro), Örebro (Odensbacken), Ljusnarsberg (Kopparberg), Lekeberg (Fjugesta), Sandviken (Storvik, Stenbacksskolan), Hofors (Torsåker), Ockelbo, Söderhamn, Hudiksvall (Delsbo), Nordanstig (Bergsjö), Östhammar (Österbybruk, Dannemora), Enköping (Fjärdhundra) och Norrtälje (Herräng). Kommunsidor finns på https://ab-hem.se/kommuner/kommun-<kommunnamn>/
- Felanmälan & vanliga frågor: Tipsa om https://ab-hem.se/vanliga_fragor_alla/ och felanmälan online https://ab-hem.se/felanmalan/ eller telefon 0581-402 00 (val 2, vardagar kl. 08.00–12.00), e-post info@ab-hem.se.
- Akut jour (endast vid akut fara som brand, vattenläcka, översvämning): 0581-402 00 (val 3) – öppet dygnet runt.
- Uthyrning & Kontakt: Telefon 0581-402 00 (val 1, vardagar kl. 08.00–12.00), e-post bostad@ab-hem.se, kontor Myntgatan 5B, 738 31 Norberg (https://ab-hem.se/kontakta-oss/).`;

const AI_MODELS = {
    gemini: [
        { value: "gemini-3.8-flash", label: "gemini-3.8-flash (Standard & Snabb – Gratis kvot)" },
        { value: "gemini-3.8-flash-lite", label: "gemini-3.8-flash-lite (Ultra-snabb – Gratis kvot)" },
        { value: "gemini-3-flash-preview", label: "gemini-3-flash-preview (Gemini 3 Flash)" },
        { value: "gemini-3.8-pro", label: "gemini-3.8-pro (Avancerad)" },
        { value: "gemini-flash-latest", label: "gemini-flash-latest (Alltid senaste Flash)" }
    ],
    openai: [
        { value: "gpt-4o-mini", label: "gpt-4o-mini (Rekommenderad – Snabb)" },
        { value: "gpt-4o", label: "gpt-4o (Avancerad)" }
    ],
    anthropic: [
        { value: "claude-3-5-haiku-latest", label: "claude-3-5-haiku-latest (Snabb)" },
        { value: "claude-3-7-sonnet-latest", label: "claude-3-7-sonnet-latest (Avancerad)" }
    ]
};

// Kommuner och tillhörande orter hos AB-hem
const MUNICIPALITIES_DATA = [
    {
        name: "Norberg",
        slug: "kommun-norberg",
        keywords: ["norberg", "kärrgruvan", "karrgruvan", "klackberg"],
        filterUrl: "https://ab-hem.se/lediga-bostader/?lan=V%C3%A4stmanland%2C%7C&kommun=Norberg%2C%7C&antal_rum=&filter_submit=Hitta+bostad&apartment_sort_list=",
        desc: "I Norbergs kommun har AB-hem trivsamma lägenheter både centralt i Norberg och i naturnära Kärrgruvan."
    },
    {
        name: "Sala",
        slug: "kommun-sala",
        keywords: ["sala", "ransta", "살라"],
        filterUrl: "https://ab-hem.se/lediga-bostader/?lan=V%C3%A4stmanland%2C%7C&kommun=Sala%2C%7C&antal_rum=&filter_submit=Hitta+bostad&apartment_sort_list=",
        desc: "I Sala kommun erbjuder AB-hem bostäder med närhet till historisk stadskärna, service, tågstation och vacker natur."
    },
    {
        name: "Avesta",
        slug: "kommun-avesta",
        keywords: ["avesta", "krylbo", "horndal", "näs bruk", "nas bruk", "by kyrkby", "hede"],
        filterUrl: "https://ab-hem.se/lediga-bostader/?lan=Dalarna%2C%7C&kommun=Avesta%2C%7C&antal_rum=&filter_submit=Hitta+bostad&apartment_sort_list=",
        desc: "I Avesta kommun har AB-hem bostäder bland annat i Krylbo (nära tågstationen), Horndal och natursköna Näs bruk/By kyrkby vid Dalälven."
    },
    {
        name: "Hedemora",
        slug: "kommun-hedemora",
        keywords: ["hedemora", "stjärnsund", "stjarnsund", "långshyttan"],
        filterUrl: "https://ab-hem.se/lediga-bostader/?lan=Dalarna%2C%7C&kommun=Hedemora%2C%7C&antal_rum=&filter_submit=Hitta+bostad&apartment_sort_list=",
        desc: "I Hedemora kommun finns AB-hem i bland annat Hedemora och den levande bruksidyllen Stjärnsund i södra Dalarna."
    },
    {
        name: "Laxå",
        slug: "kommun-laxa",
        keywords: ["laxå", "laxa", "hasselfors", "finnerödja", "tiveden"],
        filterUrl: "https://ab-hem.se/lediga-bostader/?lan=%C3%96rebro%2C%7C&kommun=Lax%C3%A5%2C%7C&antal_rum=&filter_submit=Hitta+bostad&apartment_sort_list=",
        desc: "I Laxå kommun bor du nära Tivedens storslagna natur, sjön Toften och goda pendlingsmöjligheter längs Västra stambanan."
    },
    {
        name: "Lindesberg",
        slug: "kommun-lindesberg",
        keywords: ["lindesberg", "guldsmedshyttan", "storå", "stora", "fellingsbro", "frövi"],
        filterUrl: "https://ab-hem.se/lediga-bostader/?lan=%C3%96rebro%2C%7C&kommun=Lindesberg%2C%7C&antal_rum=&filter_submit=Hitta+bostad&apartment_sort_list=",
        desc: "I Lindesbergs kommun har AB-hem bostäder i bland annat Guldsmedshyttan, Storå och Fellingsbro."
    },
    {
        name: "Örebro",
        slug: "kommun-orebro",
        keywords: ["örebro", "orebro", "odensbacken"],
        filterUrl: "https://ab-hem.se/lediga-bostader/?lan=%C3%96rebro%2C%7C&kommun=%C3%96rebro%2C%7C&antal_rum=&filter_submit=Hitta+bostad&apartment_sort_list=",
        desc: "I Örebro kommun erbjuder AB-hem bostäder i bland annat Odensbacken på Närkeslätten med närhet till service och Hjälmaren."
    },
    {
        name: "Ljusnarsberg",
        slug: "kommun-ljusnarsberg",
        keywords: ["ljusnarsberg", "kopparberg", "ställdalen"],
        filterUrl: "https://ab-hem.se/lediga-bostader/?lan=%C3%96rebro%2C%7C&kommun=Ljusnarsberg%2C%7C&antal_rum=&filter_submit=Hitta+bostad&apartment_sort_list=",
        desc: "I Ljusnarsbergs kommun har AB-hem bostäder i Kopparberg – en charmig bruksort med tågstation och storslagen Bergslagsnatur."
    },
    {
        name: "Lekeberg",
        slug: "kommun-lekeberg",
        keywords: ["lekeberg", "fjugesta", "mullhyttan"],
        filterUrl: "https://ab-hem.se/lediga-bostader/?lan=%C3%96rebro%2C%7C&kommun=Lekeberg%2C%7C&antal_rum=&filter_submit=Hitta+bostad&apartment_sort_list=",
        desc: "I Lekebergs kommun finns AB-hem i Fjugesta med närhet till Kilsbergen, Sannabadet och bekvämt pendlingsavstånd till Örebro."
    },
    {
        name: "Sandviken",
        slug: "kommun-sandviken",
        keywords: ["sandviken", "storvik", "stenbacksskolan"],
        filterUrl: "https://ab-hem.se/lediga-bostader/?lan=G%C3%A4vleborg%2C%7C&kommun=Sandviken%2C%7C&antal_rum=&filter_submit=Hitta+bostad&apartment_sort_list=",
        desc: "I Sandvikens kommun erbjuder AB-hem bland annat unika lägenheter i den ombyggda Stenbacksskolan samt radhus i järnvägsorten Storvik."
    },
    {
        name: "Hofors",
        slug: "kommun-hofors",
        keywords: ["hofors", "torsåker", "torsaker"],
        filterUrl: "https://ab-hem.se/lediga-bostader/?lan=G%C3%A4vleborg%2C%7C&kommun=Hofors%2C%7C&antal_rum=&filter_submit=Hitta+bostad&apartment_sort_list=",
        desc: "I Hofors kommun har AB-hem bostäder i bland annat Torsåker och Hofors – nära badsjöar, Solbergaskolan, föreningsliv och pendling mot Sandviken och Gävle."
    },
    {
        name: "Ockelbo",
        slug: "kommun-ockelbo",
        keywords: ["ockelbo", "åmot", "amot", "jädraås"],
        filterUrl: "https://ab-hem.se/lediga-bostader/?lan=G%C3%A4vleborg%2C%7C&kommun=Ockelbo%2C%7C&antal_rum=&filter_submit=Hitta+bostad&apartment_sort_list=",
        desc: "I Ockelbo kommun bor du nära Wij Trädgårdar, Bysjön, tågstationen och ett levande föreningsliv."
    },
    {
        name: "Söderhamn",
        slug: "kommun-soderhamn",
        keywords: ["söderhamn", "soderhamn", "marmaverken", "ljusne"],
        filterUrl: "https://ab-hem.se/lediga-bostader/?lan=G%C3%A4vleborg%2C%7C&kommun=S%C3%B6derhamn%2C%7C&antal_rum=&filter_submit=Hitta+bostad&apartment_sort_list=",
        desc: "I Söderhamns kommun har AB-hem bostäder med närhet till Hälsingekusten, skärgårdsliv, sjöar och goda tågförbindelser."
    },
    {
        name: "Hudiksvall",
        slug: "kommun-hudiksvall",
        keywords: ["hudiksvall", "delsbo", "dellen"],
        filterUrl: "https://ab-hem.se/lediga-bostader/?lan=G%C3%A4vleborg%2C%7C&kommun=Hudiksvall%2C%7C&antal_rum=&filter_submit=Hitta+bostad&apartment_sort_list=",
        desc: "I Hudiksvalls kommun erbjuder AB-hem bostäder i natursköna Delsbo i Dellenbygden."
    },
    {
        name: "Nordanstig",
        slug: "kommun-nordanstig",
        keywords: ["nordanstig", "bergsjö", "bergsjo", "gnarp", "harmånger"],
        filterUrl: "https://ab-hem.se/lediga-bostader/?lan=G%C3%A4vleborg%2C%7C&kommun=Nordanstig%2C%7C&antal_rum=&filter_submit=Hitta+bostad&apartment_sort_list=",
        desc: "I Nordanstigs kommun finns AB-hem i Bergsjö i norra Hälsingland – nära berg, sjöar och pendlingsavstånd till Hudiksvall."
    },
    {
        name: "Östhammar",
        slug: "kommun-osthammar",
        keywords: ["östhammar", "osthammar", "österbybruk", "osterbybruk", "dannemora", "gimo"],
        filterUrl: "https://ab-hem.se/lediga-bostader/?lan=Uppsala%2C%7C&kommun=%C3%96sthammar%2C%7C&antal_rum=&filter_submit=Hitta+bostad&apartment_sort_list=",
        desc: "I Östhammars kommun har AB-hem bostäder i den anrika vallonbygden Österbybruk och Dannemora med goda pendlingsmöjligheter mot Uppsala."
    },
    {
        name: "Enköping",
        slug: "kommun-enkoping",
        keywords: ["enköping", "enkoping", "fjärdhundra", "fjardhundra"],
        filterUrl: "https://ab-hem.se/lediga-bostader/?lan=Uppsala%2C%7C&kommun=Enk%C3%B6ping%2C%7C&antal_rum=&filter_submit=Hitta+bostad&apartment_sort_list=",
        desc: "I Enköpings kommun erbjuder AB-hem bostäder i Fjärdhundra med närhet till Enköping, Sala, Västerås och Uppsala."
    },
    {
        name: "Norrtälje",
        slug: "kommun-norrtalje",
        keywords: ["norrtälje", "norrtalje", "herräng", "herrang", "roslagen"],
        filterUrl: "https://ab-hem.se/lediga-bostader/?lan=Stockholm%2C%7C&kommun=Norrt%C3%A4lje%2C%7C&antal_rum=&filter_submit=Hitta+bostad&apartment_sort_list=",
        desc: "I Norrtälje kommun har AB-hem bostäder i kustorten Herräng i Roslagen med skärgårdsliv och havsbad."
    }
];

const chatState = {
    isOpen: true,
    history: [],
    ttsEnabled: false,
    isListening: false,
    askedViaVoice: false,
    kbFiles: [],
    editingKbId: null,
    verifiedGeminiModel: ""
};

const els = {};
let recognition = null;
let activeSpeakBtn = null;
let speechSilenceTimer = null;
let speechWatchdogTimer = null;

document.addEventListener("DOMContentLoaded", () => {
    cacheElements();
    initSettingsPanel();
    initKnowledgeBase();
    initSpeechEngine();
    bindEvents();
    startWelcomeMessage();
});

function cacheElements() {
    els.aiProvider = document.getElementById("ai-provider");
    els.aiModelWrap = document.getElementById("ai-model-wrap");
    els.aiModel = document.getElementById("ai-model");
    els.aiKeyWrap = document.getElementById("ai-key-wrap");
    els.aiApiKey = document.getElementById("ai-api-key");
    els.btnTestKey = document.getElementById("btn-test-key");
    els.apiKeyStatus = document.getElementById("api-key-status");
    els.aiSystemPrompt = document.getElementById("ai-system-prompt");

    els.kbDropzone = document.getElementById("kb-dropzone");
    els.kbFileInput = document.getElementById("kb-file-input");
    els.kbFilesList = document.getElementById("kb-files-list");
    els.btnClearKb = document.getElementById("btn-clear-kb");
    els.kbPreviewBox = document.getElementById("kb-preview-box");
    els.kbPreviewTitle = document.getElementById("kb-preview-title");
    els.kbPreviewTextarea = document.getElementById("kb-preview-textarea");
    els.btnSaveKbEdit = document.getElementById("btn-save-kb-edit");
    els.btnCloseKbPreview = document.getElementById("btn-close-kb-preview");

    els.demoOpenChat = document.getElementById("demo-open-chat");
    els.demoResetChat = document.getElementById("demo-reset-chat");
    els.testQuestionBtns = Array.from(document.querySelectorAll(".test-q-btn"));

    els.chatWindow = document.getElementById("ab-chat-window");
    els.chatLauncher = document.getElementById("ab-chat-launcher");
    els.chatToggleTts = document.getElementById("ab-chat-toggle-tts");
    els.chatClose = document.getElementById("ab-chat-close");
    els.chatClear = document.getElementById("ab-chat-clear");
    els.chatMessages = document.getElementById("ab-chat-messages");
    els.chatQuickBar = document.getElementById("ab-chat-quick-bar");
    els.chatForm = document.getElementById("ab-chat-form");
    els.chatInput = document.getElementById("ab-chat-input");
    els.chatMic = document.getElementById("ab-chat-mic");
    els.chatModeBadge = document.getElementById("ab-chat-mode-badge");
}

function detectProviderFromKey(key) {
    const k = (key || "").trim();
    if (!k) return null;
    if (k.startsWith("AIza")) return "gemini";
    if (k.startsWith("sk-ant-")) return "anthropic";
    if (k.startsWith("sk-")) return "openai";
    return null;
}

function initSettingsPanel() {
    els.aiSystemPrompt.value = DEFAULT_SYSTEM_PROMPT;

    try {
        const savedKey = localStorage.getItem("abhem_demo_api_key") || "";
        const savedProvider = localStorage.getItem("abhem_demo_provider") || "";
        if (savedKey) {
            els.aiApiKey.value = savedKey;
        }
        if (savedProvider && ["local", "gemini", "openai", "anthropic"].includes(savedProvider)) {
            els.aiProvider.value = savedProvider;
        } else if (savedKey) {
            const detected = detectProviderFromKey(savedKey);
            if (detected) els.aiProvider.value = detected;
        }
    } catch (_) { }

    updateProviderUI();
}

function updateProviderUI() {
    const provider = els.aiProvider.value;
    const kbSuffix = chatState.kbFiles.length > 0 ? ` · 📚 ${chatState.kbFiles.length} fil${chatState.kbFiles.length > 1 ? "er" : ""}` : "";

    if (provider === "local") {
        els.aiModelWrap.hidden = true;
        els.chatModeBadge.innerHTML = `<span class="ab-online-dot"></span> Lokal svarsmotor${kbSuffix}`;
        return;
    }

    els.aiModelWrap.hidden = false;

    const models = AI_MODELS[provider] || [];
    const prevModel = els.aiModel.value;
    els.aiModel.innerHTML = "";
    models.forEach((m) => {
        const opt = document.createElement("option");
        opt.value = m.value;
        opt.textContent = m.label;
        els.aiModel.appendChild(opt);
    });
    if (models.some((m) => m.value === prevModel)) {
        els.aiModel.value = prevModel;
    }

    const providerLabel = provider === "gemini" ? "Gemini AI" : provider === "openai" ? "OpenAI" : "Claude AI";
    els.chatModeBadge.innerHTML = `<span class="ab-online-dot"></span> ${providerLabel} (${els.aiModel.value})${kbSuffix}`;
}

/* =========================================================
   KUNSKAPSFILER (.MD / RETELL / .TXT / .JSON / .CSV)
   ========================================================= */

function initKnowledgeBase() {
    try {
        const raw = localStorage.getItem("abhem_demo_kb_files");
        if (raw) {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) {
                chatState.kbFiles = parsed;
            }
        }
    } catch (_) { }
    renderKbFilesList();
    updateProviderUI();
}

function saveKbFilesToStorage() {
    try {
        localStorage.setItem("abhem_demo_kb_files", JSON.stringify(chatState.kbFiles));
    } catch (e) {
        console.warn("Kunde inte spara kunskapsfiler i localStorage:", e);
    }
    renderKbFilesList();
    updateProviderUI();
}

async function handleUploadedFiles(fileList) {
    if (!fileList || fileList.length === 0) return;

    for (const file of Array.from(fileList)) {
        try {
            const content = await file.text();
            const existingIdx = chatState.kbFiles.findIndex((f) => f.name.toLowerCase() === file.name.toLowerCase());
            const entry = {
                id: "kb_" + Date.now() + "_" + Math.floor(Math.random() * 10000),
                name: file.name,
                content: content.trim(),
                size: file.size || content.length
            };
            if (existingIdx !== -1) {
                chatState.kbFiles[existingIdx] = entry;
            } else {
                chatState.kbFiles.push(entry);
            }
        } catch (err) {
            console.error("Kunde inte läsa fil:", file.name, err);
        }
    }

    saveKbFilesToStorage();

    appendBotMessage(
        `📚 **Kunskapsfil${fileList.length > 1 ? "er" : ""} inläst${fileList.length > 1 ? "a" : ""}!**\n\nJag har nu tillgång till innehållet i **${Array.from(fileList).map((f) => f.name).join(", ")}** (totalt ${chatState.kbFiles.length} aktiv${chatState.kbFiles.length > 1 ? "a" : ""} kunskapsfil${chatState.kbFiles.length > 1 ? "er" : ""}). Prova att ställa en fråga utifrån filen!`,
        [],
        false
    );
}

function renderKbFilesList() {
    if (!els.kbFilesList) return;
    els.kbFilesList.innerHTML = "";
    els.btnClearKb.hidden = chatState.kbFiles.length === 0;

    chatState.kbFiles.forEach((file) => {
        const row = document.createElement("div");
        row.className = "kb-file-item";

        const charCount = (file.content || "").length.toLocaleString("sv-SE");
        row.innerHTML = `
            <div class="kb-file-info">
                <span class="kb-file-icon">📄</span>
                <div class="kb-file-meta">
                    <span class="kb-file-name">${escapeHtml(file.name)}</span>
                    <span class="kb-file-size">${charCount} tecken · Aktiv i kunskapsbasen</span>
                </div>
            </div>
            <div class="kb-file-actions">
                <button type="button" class="kb-mini-btn btn-edit-kb">Visa / Redigera</button>
                <button type="button" class="kb-mini-btn danger btn-delete-kb">Ta bort</button>
            </div>
        `;

        row.querySelector(".btn-edit-kb").addEventListener("click", () => openKbPreview(file.id));
        row.querySelector(".btn-delete-kb").addEventListener("click", () => deleteKbFile(file.id));
        els.kbFilesList.appendChild(row);
    });
}

function openKbPreview(id) {
    const file = chatState.kbFiles.find((f) => f.id === id);
    if (!file) return;
    chatState.editingKbId = id;
    els.kbPreviewTitle.textContent = `📄 ${file.name}`;
    els.kbPreviewTextarea.value = file.content;
    els.kbPreviewBox.hidden = false;
    els.kbPreviewTextarea.focus();
}

function closeKbPreview() {
    chatState.editingKbId = null;
    els.kbPreviewBox.hidden = true;
}

function saveKbPreviewEdit() {
    if (!chatState.editingKbId) return;
    const file = chatState.kbFiles.find((f) => f.id === chatState.editingKbId);
    if (file) {
        file.content = els.kbPreviewTextarea.value.trim();
        file.size = file.content.length;
        saveKbFilesToStorage();
    }
    closeKbPreview();
}

function deleteKbFile(id) {
    chatState.kbFiles = chatState.kbFiles.filter((f) => f.id !== id);
    if (chatState.editingKbId === id) {
        closeKbPreview();
    }
    saveKbFilesToStorage();
}

function buildFullSystemPrompt() {
    const base = els.aiSystemPrompt.value.trim() || DEFAULT_SYSTEM_PROMPT;
    if (chatState.kbFiles.length === 0) {
        return base;
    }

    const kbBlock = chatState.kbFiles
        .map((f) => `\n\n========================================\nKUNSKAPSFIL: ${f.name}\n========================================\n${f.content}`)
        .join("");

    return `${base}\n\nNEDAN FÖLJER UPPLADDADE KUNSKAPSFILER (t.ex. från Retell / interna dokument). Använd alltid denna kunskap i första hand när du svarar på besökarens frågor:${kbBlock}`;
}

function searchUploadedKnowledgeFiles(rawQuestion) {
    if (chatState.kbFiles.length === 0) return null;

    const stopWords = new Set([
        "och", "att", "det", "som", "en", "ett", "på", "är", "av", "för", "med", "till", "den", "har", "de",
        "inte", "om", "ett", "han", "men", "var", "jag", "sig", "från", "vi", "så", "kan", "man", "när",
        "år", "säger", "under", "också", "efter", "eller", "nu", "sin", "där", "vid", "mot", "ska", "skulle",
        "kommer", "får", "finns", "hur", "vad", "vilka", "vilken", "vilket", "er", "era", "ni", "hos", "ab-hem", "abhem"
    ]);

    const words = rawQuestion
        .toLowerCase()
        .replace(/[^\p{L}\p{N}\s-]/gu, " ")
        .split(/\s+/)
        .filter((w) => w.length >= 3 && !stopWords.has(w));

    if (words.length === 0) return null;

    let bestChunk = null;
    let bestScore = 0;
    let bestFile = "";

    for (const file of chatState.kbFiles) {
        // Dela upp markdown-filen i logiska avsnitt vid rubriker (#, ##, ###) eller dubbelradbrytningar
        const sections = String(file.content || "").split(/\n(?=##?\s)|(?:\r?\n){2,}/);
        for (const sec of sections) {
            const trimmed = sec.trim();
            if (trimmed.length < 20) continue;
            const lowerSec = trimmed.toLowerCase();
            let score = 0;
            for (const w of words) {
                if (lowerSec.includes(w)) {
                    score += w.length >= 5 ? 2 : 1;
                }
            }
            if (score > bestScore) {
                bestScore = score;
                bestChunk = trimmed;
                bestFile = file.name;
            }
        }
    }

    if (bestScore >= 2 && bestChunk) {
        return {
            text: `📄 **Svar från kunskapsfil (${bestFile}):**\n\n${bestChunk.slice(0, 900)}`,
            links: extractSuggestedLinksForText(rawQuestion + " " + bestChunk)
        };
    }

    return null;
}

function bindEvents() {
    els.aiProvider.addEventListener("change", () => {
        updateProviderUI();
        try {
            localStorage.setItem("abhem_demo_provider", els.aiProvider.value);
        } catch (_) { }
    });

    els.aiModel.addEventListener("change", () => {
        updateProviderUI();
    });

    // Auto-detektera leverantör så fort man klistrar in eller skriver en nyckel
    els.aiApiKey.addEventListener("input", () => {
        const key = els.aiApiKey.value.trim();
        const detected = detectProviderFromKey(key);
        if (detected && els.aiProvider.value !== detected) {
            els.aiProvider.value = detected;
            updateProviderUI();
        }
        try {
            localStorage.setItem("abhem_demo_api_key", key);
            localStorage.setItem("abhem_demo_provider", els.aiProvider.value);
        } catch (_) { }
    });

    if (els.btnTestKey) {
        els.btnTestKey.addEventListener("click", verifyAndSaveApiKey);
    }

    // Kunskapsfiler (.md / .txt / .json / .csv) uppladdning & drag-and-drop
    if (els.kbFileInput) {
        els.kbFileInput.addEventListener("change", (e) => {
            handleUploadedFiles(e.target.files);
            els.kbFileInput.value = "";
        });
    }

    if (els.kbDropzone) {
        ["dragenter", "dragover"].forEach((evt) => {
            els.kbDropzone.addEventListener(evt, (e) => {
                e.preventDefault();
                e.stopPropagation();
                els.kbDropzone.classList.add("is-dragover");
            });
        });

        ["dragleave", "drop"].forEach((evt) => {
            els.kbDropzone.addEventListener(evt, (e) => {
                e.preventDefault();
                e.stopPropagation();
                els.kbDropzone.classList.remove("is-dragover");
            });
        });

        els.kbDropzone.addEventListener("drop", (e) => {
            if (e.dataTransfer && e.dataTransfer.files) {
                handleUploadedFiles(e.dataTransfer.files);
            }
        });
    }

    if (els.btnClearKb) {
        els.btnClearKb.addEventListener("click", () => {
            chatState.kbFiles = [];
            closeKbPreview();
            saveKbFilesToStorage();
        });
    }

    if (els.btnSaveKbEdit) {
        els.btnSaveKbEdit.addEventListener("click", saveKbPreviewEdit);
    }

    if (els.btnCloseKbPreview) {
        els.btnCloseKbPreview.addEventListener("click", closeKbPreview);
    }

    els.chatLauncher.addEventListener("click", () => {
        toggleChatWindow(!chatState.isOpen);
    });

    els.chatClose.addEventListener("click", () => {
        toggleChatWindow(false);
    });

    els.demoOpenChat.addEventListener("click", () => {
        toggleChatWindow(true);
        els.chatInput.focus();
    });

    els.chatClear.addEventListener("click", resetConversation);
    els.demoResetChat.addEventListener("click", resetConversation);

    if (els.chatToggleTts) {
        els.chatToggleTts.addEventListener("click", () => {
            setTtsEnabled(!chatState.ttsEnabled);
            if (!chatState.ttsEnabled) {
                stopSpeaking();
            }
        });
    }

    if (els.chatMic) {
        els.chatMic.addEventListener("click", toggleSpeechRecognition);
    }

    // Quick reply chips i chatten
    els.chatQuickBar.addEventListener("click", (e) => {
        const chip = e.target.closest(".ab-quick-chip");
        if (!chip) return;
        const q = chip.getAttribute("data-q");
        if (q) {
            handleUserQuestion(q);
        }
    });

    // Testfrågor i demopanelen
    els.testQuestionBtns.forEach((btn) => {
        btn.addEventListener("click", () => {
            const q = btn.getAttribute("data-q");
            toggleChatWindow(true);
            handleUserQuestion(q);
        });
    });

    // Skicka fråga via formuläret
    els.chatForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const text = els.chatInput.value.trim();
        if (!text) return;
        els.chatInput.value = "";
        handleUserQuestion(text);
    });
}

function toggleChatWindow(open) {
    chatState.isOpen = open;
    els.chatWindow.classList.toggle("is-closed", !open);
    els.chatLauncher.setAttribute("aria-expanded", String(open));
    if (!open) {
        stopSpeaking();
    }
}

function resetConversation() {
    stopSpeaking();
    chatState.history = [];
    els.chatMessages.innerHTML = "";
    startWelcomeMessage();
}

function startWelcomeMessage() {
    appendBotMessage(
        "Hej och välkommen till **AB-hem**! 👋\n\nJag hjälper dig med frågor om lediga lägenheter, **Hyres-potten**, våra 17 kommuner, uthyrningskrav eller felanmälan.\n\nVälj ett ämne nedan, skriv en fråga eller tryck på **🎤 mikrofonen** för att prata med mig!",
        [
            { label: "Se alla lediga bostäder →", url: "https://ab-hem.se/lediga-bostader/" },
            { label: "Läs om Hyres-potten →", url: "https://ab-hem.se/hyres-pott/" }
        ],
        false
    );
}

/* =========================================================
   RÖSTFUNKTION (TAL-TILL-TEXT + GEMINI AUDIO FALLBACK & TTS)
   ========================================================= */

let mediaRecorder = null;
let recordedChunks = [];

function initSpeechEngine() {
    if ("speechSynthesis" in window) {
        window.speechSynthesis.getVoices();
        window.speechSynthesis.onvoiceschanged = () => {
            window.speechSynthesis.getVoices();
        };
    }
}

function startListeningUI(statusText = "🎤 Lyssnar… prata nu (tryck igen för att skicka)") {
    chatState.isListening = true;
    if (els.chatMic) els.chatMic.classList.add("is-listening");
    els.chatInput.classList.add("is-listening-input");
    els.chatInput.placeholder = statusText;
}

function stopListeningUI() {
    chatState.isListening = false;
    clearTimeout(speechSilenceTimer);
    clearTimeout(speechWatchdogTimer);
    if (els.chatMic) els.chatMic.classList.remove("is-listening");
    els.chatInput.classList.remove("is-listening-input");
    els.chatInput.placeholder = "Skriv eller tryck 🎤 för att prata…";
}

function finalizeSpokenInput(text) {
    const clean = (text || els.chatInput.value || "").trim();
    stopListeningUI();
    if (recognition) {
        try {
            recognition.onresult = null;
            recognition.onend = null;
            recognition.onerror = null;
            recognition.abort();
        } catch (_) { }
        recognition = null;
    }
    if (clean) {
        els.chatInput.value = "";
        setTtsEnabled(true);
        chatState.askedViaVoice = true;
        handleUserQuestion(clean);
    }
}

async function toggleSpeechRecognition() {
    stopSpeaking();

    // 1. Om vi redan lyssnar -> avbryt direkt och skicka det som sagts (hänger aldrig!)
    if (chatState.isListening) {
        if (mediaRecorder && mediaRecorder.state === "recording") {
            try { mediaRecorder.stop(); } catch (_) { }
            return;
        }
        finalizeSpokenInput(els.chatInput.value);
        return;
    }

    // 2. Kontrollera om sidan körs från file:// (där Chrome/Edge blockerar mikrofonen)
    if (window.location.protocol === "file:") {
        appendBotMessage(
            "🎤 **Mikrofon kräver `https://` eller `localhost`**\n\nWebbläsare blockerar mikrofonen när en fil öppnas direkt från hårddisken (`file://`). Öppna istället live-länken nedan så fungerar mikrofonen direkt:",
            [
                { label: "Öppna med mikrofon (GitHub Pages) →", url: "https://ulrikbaard-spec.github.io/jobs/chatbot-demo/" }
            ],
            false
        );
        return;
    }

    els.chatInput.value = "";
    startListeningUI("🎤 Lyssnar på svenska… prata nu!");

    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (SpeechRec) {
        try {
            recognition = new SpeechRec();
            recognition.lang = "sv-SE";
            recognition.continuous = true;
            recognition.interimResults = true;

            let latestTranscript = "";
            let handledByFallback = false;

            // Watchdog om webbläsarens taligenkänning fastnar utan att höra något inom 8 sek
            speechWatchdogTimer = setTimeout(() => {
                if (chatState.isListening && !latestTranscript) {
                    finalizeSpokenInput("");
                    els.chatInput.placeholder = "Hörde inget tal – tryck 🎤 för att prova igen";
                }
            }, 8000);

            recognition.onstart = () => {
                startListeningUI("🎤 Lyssnar… prata nu (skickas automatiskt när du tystnar)");
            };

            recognition.onresult = (event) => {
                clearTimeout(speechWatchdogTimer);
                let transcript = "";
                for (let i = 0; i < event.results.length; i++) {
                    transcript += event.results[i][0].transcript;
                }
                latestTranscript = transcript.trim();
                els.chatInput.value = latestTranscript;

                // Skicka automatiskt efter 1,4 sekunders tystnad efter att du pratat klart!
                clearTimeout(speechSilenceTimer);
                if (latestTranscript) {
                    speechSilenceTimer = setTimeout(() => {
                        if (chatState.isListening) {
                            finalizeSpokenInput(latestTranscript);
                        }
                    }, 1400);
                }
            };

            recognition.onerror = async (event) => {
                console.warn("SpeechRecognition error:", event.error);
                if (event.error === "aborted") return;

                if (
                    (event.error === "network" || event.error === "service-not-allowed") &&
                    els.aiApiKey.value.trim()
                ) {
                    handledByFallback = true;
                    await startMediaRecorderFallback();
                    return;
                }

                stopListeningUI();

                if (event.error === "not-allowed" || event.error === "permission-denied") {
                    appendBotMessage(
                        "🎤 **Mikrofonen är blockerad i webbläsaren.** Klicka på hänglåset/ikonen till vänster i adressfältet och tillåt **Mikrofon**, och prova sedan igen!",
                        [],
                        false
                    );
                } else if (event.error === "no-speech") {
                    els.chatInput.placeholder = "Hörde inget tal – tryck 🎤 för att prova igen";
                } else {
                    appendBotMessage(
                        `🎤 Kunde inte starta röstinmatning (${event.error}). Kontrollera att en mikrofon är ansluten och tillåten i webbläsaren.`,
                        [],
                        false
                    );
                }
            };

            recognition.onend = () => {
                if (handledByFallback || !chatState.isListening) return;
                finalizeSpokenInput(latestTranscript || els.chatInput.value);
            };

            recognition.start();
            return;
        } catch (err) {
            console.warn("SpeechRecognition start exception:", err);
        }
    }

    // Reservmetod om webbläsaren saknar SpeechRecognition (t.ex. Firefox eller iOS WebView)
    await startMediaRecorderFallback();
}

async function startMediaRecorderFallback() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        stopListeningUI();
        appendBotMessage(
            "🎤 Din webbläsare stöder inte mikrofoninspelning på denna sida. Prova i Chrome, Edge eller Safari via `https://ulrikbaard-spec.github.io/jobs/chatbot-demo/`.",
            [],
            false
        );
        return;
    }

    const apiKey = els.aiApiKey.value.trim();
    if (!apiKey) {
        stopListeningUI();
        appendBotMessage(
            "🎤 Din webbläsare saknar inbyggd svensk tal-till-text. Lägg in din **Gemini API-nyckel** i panelen till vänster (eller öppna sidan i Google Chrome) för att prata med boten!",
            [],
            false
        );
        return;
    }

    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        recordedChunks = [];
        mediaRecorder = new MediaRecorder(stream);

        mediaRecorder.ondataavailable = (e) => {
            if (e.data && e.data.size > 0) {
                recordedChunks.push(e.data);
            }
        };

        mediaRecorder.onstop = async () => {
            stream.getTracks().forEach((t) => t.stop());
            stopListeningUI();

            const blob = new Blob(recordedChunks, { type: mediaRecorder.mimeType || "audio/webm" });
            if (blob.size < 500) return;

            els.chatInput.placeholder = "⏳ Tolkar det du sa…";
            try {
                const transcript = await transcribeAudioWithGemini(blob, apiKey);
                els.chatInput.placeholder = "Skriv eller tryck 🎤 för att prata…";
                if (transcript) {
                    setTtsEnabled(true);
                    chatState.askedViaVoice = true;
                    handleUserQuestion(transcript);
                }
            } catch (err) {
                els.chatInput.placeholder = "Skriv eller tryck 🎤 för att prata…";
                appendBotMessage(`🎤 Kunde inte tolka ljudet: ${err.message}`, [], false);
            }
        };

        startListeningUI("🎤 Spelar in… Prata nu och tryck på 🎤 igen när du är klar!");
        mediaRecorder.start();

        // Stoppa automatiskt efter 8 sekunder om användaren inte tryckt igen
        setTimeout(() => {
            if (mediaRecorder && mediaRecorder.state === "recording") {
                mediaRecorder.stop();
            }
        }, 8000);
    } catch (err) {
        stopListeningUI();
        appendBotMessage(
            `🎤 Kunde inte komma åt mikrofonen (${err.message}). Kontrollera att du tillåtit mikrofonen i webbläsaren.`,
            [],
            false
        );
    }
}

async function transcribeAudioWithGemini(audioBlob, apiKey) {
    const base64Audio = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            const res = String(reader.result || "");
            resolve(res.split(",")[1] || "");
        };
        reader.onerror = reject;
        reader.readAsDataURL(audioBlob);
    });

    const activeModel = chatState.verifiedGeminiModel || els.aiModel.value || "gemini-3.8-flash";
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(activeModel)}:generateContent?key=${encodeURIComponent(apiKey)}`;
    const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            contents: [
                {
                    role: "user",
                    parts: [
                        { text: "Transkribera exakt vad som sägs i detta ljudklipp på svenska. Svara ENDAST med de transkriberade orden, inget annat." },
                        { inlineData: { mimeType: audioBlob.type || "audio/webm", data: base64Audio } }
                    ]
                }
            ]
        })
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
        throw new Error(data?.error?.message || `HTTP ${res.status}`);
    }
    return (data?.candidates?.[0]?.content?.parts?.[0]?.text || "").trim();
}

function setTtsEnabled(enabled) {
    chatState.ttsEnabled = enabled;
    if (!els.chatToggleTts) return;
    els.chatToggleTts.textContent = enabled ? "🔊" : "🔇";
    els.chatToggleTts.classList.toggle("is-active", enabled);
    els.chatToggleTts.setAttribute("aria-pressed", String(enabled));
    els.chatToggleTts.title = enabled
        ? "Röstuppläsning är PÅ (klicka för att stänga av)"
        : "Röstuppläsning är AV (klicka för att slå på)";
}

function cleanTextForSpeech(markdownText) {
    return String(markdownText || "")
        // Ta bort tekniska obs-rader på slutet
        .replace(/\*\(Obs:[\s\S]*?\)\*/gi, "")
        // Gör om markdown-länkar [text](url) till bara text
        .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, "$1")
        // Ta bort råa URL:er
        .replace(/https?:\/\/[^\s)]+/g, "")
        // Ta bort markdown-fetstil/kursiv och punktlisttecken
        .replace(/[*#_~`•]/g, "")
        // Ta bort emojis och symboler
        .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, "")
        .replace(/\s+/g, " ")
        .trim();
}

function stopSpeaking() {
    if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
    }
    if (activeSpeakBtn) {
        activeSpeakBtn.classList.remove("is-speaking");
        activeSpeakBtn.innerHTML = "🔊 Lyssna";
        activeSpeakBtn = null;
    }
}

function speakText(rawText, btnEl = null) {
    if (!("speechSynthesis" in window)) return;

    // Om man klickar på samma knapp som redan läser upp -> stoppa
    if (btnEl && activeSpeakBtn === btnEl && window.speechSynthesis.speaking) {
        stopSpeaking();
        return;
    }

    stopSpeaking();

    const clean = cleanTextForSpeech(rawText);
    if (!clean) return;

    const utterance = new SpeechSynthesisUtterance(clean);
    utterance.lang = "sv-SE";
    utterance.rate = 1.02;

    const voices = window.speechSynthesis.getVoices();
    const svVoices = voices.filter((v) => v.lang && v.lang.toLowerCase().startsWith("sv"));
    if (svVoices.length > 0) {
        // Prioritera naturliga röster (Natural / Online / Google / Alva / Klara / Sofie)
        const preferred =
            svVoices.find((v) => /natural|online|google|alva|klara|sofie|mattias/i.test(v.name)) ||
            svVoices[0];
        utterance.voice = preferred;
    }

    if (btnEl) {
        activeSpeakBtn = btnEl;
        btnEl.classList.add("is-speaking");
        btnEl.innerHTML = "⏹️ Stoppa";
    }

    utterance.onend = () => {
        if (activeSpeakBtn === btnEl && btnEl) {
            btnEl.classList.remove("is-speaking");
            btnEl.innerHTML = "🔊 Lyssna";
            activeSpeakBtn = null;
        }
    };

    utterance.onerror = () => {
        if (activeSpeakBtn === btnEl && btnEl) {
            btnEl.classList.remove("is-speaking");
            btnEl.innerHTML = "🔊 Lyssna";
            activeSpeakBtn = null;
        }
    };

    window.speechSynthesis.speak(utterance);
}

/* =========================================================
   HANTERA FRÅGA & TESTA API-NYCKEL
   ========================================================= */

function sanitizeAlternatingHistory(history) {
    const cleaned = [];
    for (const msg of history) {
        if (!msg || !msg.content) continue;
        if (cleaned.length === 0) {
            if (msg.role === "user") {
                cleaned.push({ role: "user", content: msg.content });
            }
        } else {
            const last = cleaned[cleaned.length - 1];
            if (last.role === msg.role) {
                last.content += "\n" + msg.content;
            } else {
                cleaned.push({ role: msg.role, content: msg.content });
            }
        }
    }
    return cleaned;
}

async function verifyAndSaveApiKey() {
    const apiKey = els.aiApiKey.value.trim();
    if (!apiKey) {
        els.apiKeyStatus.style.color = "#b91c1c";
        els.apiKeyStatus.textContent = "⚠️ Klistra in en API-nyckel i rutan först.";
        return;
    }

    const detected = detectProviderFromKey(apiKey);
    if (detected && els.aiProvider.value !== detected) {
        els.aiProvider.value = detected;
        updateProviderUI();
    } else if (els.aiProvider.value === "local") {
        // Om nyckeln inte har standardprefix men användaren klickar Testa & Spara, välj Gemini som standard
        els.aiProvider.value = "gemini";
        updateProviderUI();
    }

    const provider = els.aiProvider.value;
    const model = els.aiModel.value;
    els.apiKeyStatus.style.color = "#173c36";
    els.apiKeyStatus.textContent = `⏳ Testar anslutning mot ${provider.toUpperCase()} (${model})…`;

    try {
        await callSelectedAiModel({
            provider,
            model,
            apiKey,
            systemPrompt: "Svara endast med ordet OK.",
            history: [{ role: "user", content: "Test" }]
        });

        try {
            localStorage.setItem("abhem_demo_api_key", apiKey);
            localStorage.setItem("abhem_demo_provider", provider);
        } catch (_) { }

        els.apiKeyStatus.style.color = "#15803d";
        els.apiKeyStatus.textContent = `✅ API-nyckel verifierad och aktiv (${provider.toUpperCase()} · ${els.aiModel.value})! Nu svarar AI-modellen i chatten.`;
    } catch (err) {
        els.apiKeyStatus.style.color = "#b91c1c";
        els.apiKeyStatus.textContent = `❌ Kunde inte verifiera nyckeln: ${err.message}`;
    }
}

async function handleUserQuestion(questionText) {
    appendUserMessage(questionText);
    chatState.history.push({ role: "user", content: questionText });

    const typingEl = showTypingIndicator();

    const apiKey = els.aiApiKey.value.trim();
    if (apiKey && els.aiProvider.value === "local") {
        els.aiProvider.value = detectProviderFromKey(apiKey) || "gemini";
        updateProviderUI();
    }

    const provider = els.aiProvider.value;
    const model = els.aiModel.value;
    const systemPrompt = buildFullSystemPrompt();

    try {
        if (provider !== "local" && apiKey) {
            const cleanHist = sanitizeAlternatingHistory(chatState.history.slice(-8));
            const aiReply = await callSelectedAiModel({
                provider,
                model,
                apiKey,
                systemPrompt,
                history: cleanHist
            });
            removeTypingIndicator(typingEl);
            chatState.history.push({ role: "assistant", content: aiReply });
            appendBotMessage(aiReply, extractSuggestedLinksForText(questionText + " " + aiReply));
        } else {
            await new Promise((r) => setTimeout(r, 320));
            const kbMatch = searchUploadedKnowledgeFiles(questionText);
            const localReply = kbMatch || getLocalBotResponse(questionText);
            removeTypingIndicator(typingEl);
            chatState.history.push({ role: "assistant", content: localReply.text });
            appendBotMessage(localReply.text, localReply.links);
        }
    } catch (err) {
        console.warn("AI-anrop misslyckades, använder lokalt reservläge:", err);
        removeTypingIndicator(typingEl);
        const kbMatch = searchUploadedKnowledgeFiles(questionText);
        const fallback = kbMatch || getLocalBotResponse(questionText);
        chatState.history.push({ role: "assistant", content: fallback.text });
        if (els.apiKeyStatus) {
            els.apiKeyStatus.style.color = "#b91c1c";
            els.apiKeyStatus.textContent = `❌ AI-fel: ${err.message}`;
        }
        appendBotMessage(
            fallback.text + `\n\n*(Obs: AI-anropet gav felet "${err.message}", så svaret ovan kommer från AB-hems inbyggda reservläge).*`,
            fallback.links
        );
    }
}

/* =========================================================
   SMART LOKAL SVARSMOTOR (ALLA 17 KOMMUNER + AB-HEM FAKTA)
   ========================================================= */

function getLocalBotResponse(rawQuestion) {
    const q = rawQuestion.toLowerCase();

    // 1. Akut jour (brand, vattenläcka, översvämning, akut)
    if (
        q.includes("jour") ||
        q.includes("vattenläck") ||
        q.includes("översväm") ||
        q.includes("brand") ||
        q.includes("sprutar vatten") ||
        (q.includes("akut") && !q.includes("hyres"))
    ) {
        return {
            text: "🚨 **Akut jour (dygnet runt)**\n\nVid akuta fel som innebär fara för fastigheten eller person (t.ex. vattenläcka, översvämning eller brand), ring genast vår jour på:\n\n**0581-402 00 (val 3)** – öppet dygnet runt.\n\n*(Vid mindre brådskande fel gör du enklast en vanlig felanmälan online).*",
            links: [
                { label: "📞 Ring Jouren: 0581-402 00", url: "tel:058140200" },
                { label: "Gör vanlig felanmälan online →", url: "https://ab-hem.se/felanmalan/" }
            ]
        };
    }

    // 2. Felanmälan & service för befintliga hyresgäster
    if (
        q.includes("felanmäl") ||
        q.includes("trasig") ||
        q.includes("kylskåp") ||
        q.includes("spis") ||
        q.includes("värme") ||
        q.includes("varmvatten") ||
        q.includes("nyckel") ||
        q.includes("tvättstug")
    ) {
        return {
            text: "🔧 **Göra en felanmälan**\n\nInnan du gör en felanmälan får du gärna titta bland våra vanliga frågor.\n\nDu kan göra din felanmälan online dygnet runt eller kontakta oss på:\n• **Telefon:** 0581-402 00 (val 2), vardagar kl. 08.00–12.00\n• **E-post:** info@ab-hem.se",
            links: [
                { label: "Gör felanmälan online →", url: "https://ab-hem.se/felanmalan/" },
                { label: "Se vanliga frågor & svar →", url: "https://ab-hem.se/vanliga_fragor_alla/" }
            ]
        };
    }

    // 3. Hyres-pott / Bostadsstipendium / Rabatt
    if (
        q.includes("hyres-pott") ||
        q.includes("hyrespott") ||
        q.includes("pott") ||
        q.includes("rabatt") ||
        q.includes("stipendium") ||
        q.includes("billigare hyra")
    ) {
        return {
            text: "💚 **AB-hems Hyres-pott (Bostadsstipendium)**\n\nIbland är rätt bostad lite för dyr. Då kan utvalda lägenheter hos AB-hem beviljas **500–1 500 kr lägre hyra varje månad under 5 år (60 månader)**.\n\nAlla kan ansöka! Du berättar kort hur du bor idag, vilket behov du har och vad bostaden skulle betyda för dig. AB-hems vanliga uthyrningskrav gäller fortfarande.",
            links: [
                { label: "Se bostäder med Hyres-pott →", url: "https://ab-hem.se/lediga-bostader/?lan=&kommun=&antal_rum=&ovrigt=Hyres-pott&filter_submit=Hitta+bostad&apartment_sort_list=" },
                { label: "Läs mer & ansök om Hyres-pott →", url: "https://ab-hem.se/hyres-pott/" },
                { label: "Se exempel & berättelser →", url: "https://ab-hem.se/hyrespott-berattelser/" }
            ]
        };
    }

    // 4. Specifik kommun eller ort (alla 17 kommuner + tätorter)
    const matchedMunicipality = MUNICIPALITIES_DATA.find((m) =>
        m.keywords.some((kw) => q.includes(kw))
    );

    if (matchedMunicipality) {
        return {
            text: `📍 **Bo hos AB-hem i ${matchedMunicipality.name}**\n\n${matchedMunicipality.desc}\n\nKlicka nedan för att se alla aktuella lediga lägenheter i ${matchedMunicipality.name} eller läs mer om kommunen:`,
            links: [
                { label: `Se lediga bostäder i ${matchedMunicipality.name} →`, url: matchedMunicipality.filterUrl },
                { label: `Läs vår guide om ${matchedMunicipality.name} →`, url: `https://ab-hem.se/kommuner/${matchedMunicipality.slug}/` },
                { label: "Lämna intresseanmälan →", url: "https://ab-hem.se/intresseanmalan/" }
            ]
        };
    }

    // 5. Möblerade lägenheter / Företagsboende
    if (q.includes("möbler") || q.includes("företag") || q.includes("veckopendl")) {
        return {
            text: "🛋️ **Möblerade lägenheter**\n\nAB-hem erbjuder färdigmöblerade lägenheter på flera orter – ett smidigt alternativ för både företag, veckopendlare och privatpersoner som behöver ett inflyttningsklart hem.",
            links: [
                { label: "Läs om möblerade lägenheter →", url: "https://ab-hem.se/moblerade-lagenheter/" },
                { label: "Kontakta uthyrningen →", url: "https://ab-hem.se/kontakta-oss/" }
            ]
        };
    }

    // 6. Uthyrningspolicy, krav, betalningsanmärkning, köpoäng
    if (
        q.includes("krav") ||
        q.includes("policy") ||
        q.includes("anmärkning") ||
        q.includes("inkomst") ||
        q.includes("kredit") ||
        q.includes("intresseanmäl") ||
        q.includes("kö")
    ) {
        return {
            text: "📋 **Uthyrningspolicy & Intresseanmälan**\n\nPå vår sida för uthyrningspolicy kan du läsa om vilka grundkrav som gäller för att hyra bostad hos AB-hem. Hittar du ingen ledig lägenhet som passar just idag kan du alltid skicka in en intresseanmälan!",
            links: [
                { label: "Läs AB-hems uthyrningspolicy →", url: "https://ab-hem.se/uthyrningspolicy/" },
                { label: "Lämna en intresseanmälan →", url: "https://ab-hem.se/intresseanmalan/" },
                { label: "Se lediga bostäder →", url: "https://ab-hem.se/lediga-bostader/" }
            ]
        };
    }

    // 7. Vilka kommuner / Var finns ni
    if (
        q.includes("kommun") ||
        q.includes("orter") ||
        q.includes("var finns ni") ||
        q.includes("områden")
    ) {
        return {
            text: "📍 **AB-hems 17 kommuner**\n\nVi erbjuder hyreslägenheter, radhus och villor i 17 kommuner i Mellansverige:\n\n• **Västmanland:** Norberg, Sala\n• **Dalarna:** Avesta, Hedemora\n• **Örebro län:** Laxå, Lindesberg, Örebro, Ljusnarsberg, Lekeberg\n• **Gävleborg:** Sandviken (Storvik), Hofors (Torsåker), Ockelbo, Söderhamn, Hudiksvall (Delsbo), Nordanstig\n• **Uppsala & Stockholm:** Östhammar, Enköping, Norrtälje (Herräng)",
            links: [
                { label: "Utforska alla våra kommuner →", url: "https://ab-hem.se/kommuner/" },
                { label: "Se alla lediga bostäder →", url: "https://ab-hem.se/lediga-bostader/" }
            ]
        };
    }

    // 8. Naturnära boende / Jobba hemifrån
    if (q.includes("natur") || q.includes("jobba hemma") || q.includes("pendla") || q.includes("hund")) {
        return {
            text: "🌲 **Bo i naturen – pendla till stan**\n\nHos AB-hem hittar du naturnära bostäder på mindre orter där du får mer plats, lugnare tempo och ofta lägre hyra – med möjlighet att jobba hemifrån eller pendla till större städer.",
            links: [
                { label: "Upptäck Naturnära boende →", url: "https://ab-hem.se/naturnara-boende-2/" },
                { label: "Se lediga bostäder →", url: "https://ab-hem.se/lediga-bostader/" }
            ]
        };
    }

    // 9. Kontakt / Öppettider / Telefon
    if (
        q.includes("kontakt") ||
        q.includes("telefon") ||
        q.includes("öppettid") ||
        q.includes("mail") ||
        q.includes("mejl") ||
        q.includes("adress")
    ) {
        return {
            text: "📞 **Kontakta AB-hem**\n\n• **Telefon:** 0581-402 00 (vardagar kl. 08.00–12.00)\n  – Val 1: Uthyrning (`bostad@ab-hem.se`)\n  – Val 2: Felanmälan (`info@ab-hem.se`)\n  – Val 3: Akut jour (dygnet runt)\n• **Kontorsadress:** Myntgatan 5B, 738 31 Norberg",
            links: [
                { label: "Gå till Kontakta oss →", url: "https://ab-hem.se/kontakta-oss/" },
                { label: "Mejla uthyrningen (bostad@ab-hem.se)", url: "mailto:bostad@ab-hem.se" }
            ]
        };
    }

    // 10. Lediga bostäder / Lägenheter (generellt)
    if (
        q.includes("ledig") ||
        q.includes("lägenhet") ||
        q.includes("bostad") ||
        q.includes("bostäder") ||
        q.includes("hyra") ||
        q.includes("söka") ||
        q.includes("radhus")
    ) {
        return {
            text: "🏠 **Söker du ledig lägenhet hos AB-hem?**\n\nPå vår bostadssida ser du alla lägenheter, radhus och villor som är lediga att söka just nu. Du kan enkelt filtrera på län, kommun och antal rum.\n\nTips: Du kan också skriva namnet på en kommun här i chatten (t.ex. *Norberg*, *Sala*, *Avesta* eller *Storvik*) så ger jag dig direktlänken dit!",
            links: [
                { label: "Se alla lediga bostäder →", url: "https://ab-hem.se/lediga-bostader/" },
                { label: "Se bostäder med Hyres-pott →", url: "https://ab-hem.se/lediga-bostader/?lan=&kommun=&antal_rum=&ovrigt=Hyres-pott&filter_submit=Hitta+bostad&apartment_sort_list=" },
                { label: "Lämna intresseanmälan →", url: "https://ab-hem.se/intresseanmalan/" }
            ]
        };
    }

    // 11. Vänlig fallback
    return {
        text: "Tack för din fråga! 😊\n\nJag hittade inget exakt standardsvar på just det, men här nedanför hittar du direktlänkar till våra vanligaste sidor. Du är också varmt välkommen att kontakta vår uthyrning eller kundtjänst på **0581-402 00** (vardagar kl. 08.00–12.00) eller **bostad@ab-hem.se**.",
        links: [
            { label: "Se alla lediga bostäder →", url: "https://ab-hem.se/lediga-bostader/" },
            { label: "Vanliga frågor & svar →", url: "https://ab-hem.se/vanliga_fragor_alla/" },
            { label: "Kontakta AB-hem →", url: "https://ab-hem.se/kontakta-oss/" }
        ]
    };
}

/* =========================================================
   ANROP TILL VALBAR AI-MODELL (GEMINI / OPENAI / ANTHROPIC)
   ========================================================= */

async function discoverGeminiModels(apiKey) {
    const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(apiKey)}`
    );
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
        throw new Error(data?.error?.message || `Gemini Models HTTP ${res.status}`);
    }

    // Filtrera BORT alla image-, vision-, tts-, audio-, exp- och 1.x/2.0-modeller som saknar gratis textkvot
    const list = (data.models || [])
        .filter((m) => {
            const name = String(m.name || "").toLowerCase();
            const methods = m.supportedGenerationMethods || [];
            return (
                methods.includes("generateContent") &&
                name.includes("gemini") &&
                !name.includes("image") &&
                !name.includes("imagen") &&
                !name.includes("vision") &&
                !name.includes("tts") &&
                !name.includes("audio") &&
                !name.includes("live") &&
                !name.includes("thinking") &&
                !name.includes("exp") &&
                !name.includes("1.5") &&
                !name.includes("1.0") &&
                !name.includes("2.0") &&
                !name.includes("embedding") &&
                !name.includes("robotics") &&
                !name.includes("computer-use") &&
                !name.includes("learnlm") &&
                !name.includes("gemma")
            );
        })
        .map((m) => String(m.name).replace(/^models\//, ""));

    // Prioritera standardmodeller med gratis kvot (Free Tier) först
    const freeTierPriority = [
        "gemini-3.8-flash",
        "gemini-3.8-flash-lite",
        "gemini-flash-latest",
        "gemini-3-flash-preview",
        "gemini-3.1-flash-lite-preview",
        "gemini-3.8-pro",
        "gemini-2.5-flash",
        "gemini-2.5-flash-lite"
    ];

    list.sort((a, b) => {
        const idxA = freeTierPriority.indexOf(a);
        const idxB = freeTierPriority.indexOf(b);
        if (idxA !== -1 && idxB !== -1) return idxA - idxB;
        if (idxA !== -1) return -1;
        if (idxB !== -1) return 1;
        const aFlash = a.includes("flash") ? 0 : 1;
        const bFlash = b.includes("flash") ? 0 : 1;
        if (aFlash !== bFlash) return aFlash - bFlash;
        return a.localeCompare(b);
    });

    return list;
}

async function callSelectedAiModel({ provider, model, apiKey, systemPrompt, history }) {
    if (provider === "gemini") {
        // Om vi redan hittat en fungerande modell för denna session, anropa den direkt utan att loopa!
        let candidateModels = [];
        if (chatState.verifiedGeminiModel) {
            candidateModels = [chatState.verifiedGeminiModel];
        } else {
            let discovered = [];
            try {
                discovered = await discoverGeminiModels(apiKey);
            } catch (discErr) {
                if (
                    String(discErr.message).includes("API_KEY_INVALID") ||
                    String(discErr.message).includes("API key not valid")
                ) {
                    throw discErr;
                }
            }

            if (discovered.length > 0) {
                AI_MODELS.gemini = discovered.map((m) => ({ value: m, label: m }));
            }

            const safeSelected =
                model &&
                    !model.includes("image") &&
                    !model.includes("2.0") &&
                    !model.includes("1.5")
                    ? [model]
                    : [];

            candidateModels = Array.from(
                new Set([
                    ...safeSelected,
                    ...discovered,
                    "gemini-3.8-flash",
                    "gemini-3.8-flash-lite",
                    "gemini-3-flash-preview",
                    "gemini-flash-latest"
                ])
            );
        }

        const errors = [];

        for (const candidateModel of candidateModels.slice(0, 6)) {
            const controller = new AbortController();
            const timer = setTimeout(() => controller.abort(), 12000);
            try {
                const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(candidateModel)}:generateContent?key=${encodeURIComponent(apiKey)}`;
                const contents = history.map((msg) => ({
                    role: msg.role === "assistant" ? "model" : "user",
                    parts: [{ text: msg.content }]
                }));

                const res = await fetch(url, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    signal: controller.signal,
                    body: JSON.stringify({
                        systemInstruction: { parts: [{ text: systemPrompt }] },
                        contents,
                        generationConfig: { temperature: 0.3, maxOutputTokens: 600 }
                    })
                });
                clearTimeout(timer);

                const data = await res.json().catch(() => ({}));
                if (!res.ok) {
                    const errMsg = data?.error?.message || `Gemini HTTP ${res.status}`;
                    throw new Error(`[${candidateModel}] ${errMsg}`);
                }

                // Spara den fungerande modellen så att alla kommande svar går direkt på <1 sekund!
                chatState.verifiedGeminiModel = candidateModel;
                updateProviderUI();
                els.aiModel.value = candidateModel;

                return data?.candidates?.[0]?.content?.parts?.[0]?.text || "Kunde inte tolka svaret från Gemini.";
            } catch (e) {
                clearTimeout(timer);
                if (chatState.verifiedGeminiModel === candidateModel) {
                    chatState.verifiedGeminiModel = "";
                }
                errors.push(e.name === "AbortError" ? `[${candidateModel}] Timeout efter 12s` : e.message);
                if (String(e.message).includes("API_KEY_INVALID") || String(e.message).includes("API key not valid")) {
                    break;
                }
            }
        }
        // Om fel berodde på gamla pensionerade modeller, visa sista eller mest relevanta felet
        const nonDepError = errors.find((er) => !er.includes("no longer available") && !er.includes("not found"));
        throw new Error(nonDepError || errors[errors.length - 1] || errors[0] || "Kunde inte ansluta till Gemini API.");
    }

    if (provider === "openai") {
        const res = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model,
                temperature: 0.3,
                max_tokens: 600,
                messages: [
                    { role: "system", content: systemPrompt },
                    ...history
                ]
            })
        });

        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
            throw new Error(data?.error?.message || `OpenAI HTTP ${res.status}`);
        }
        return data?.choices?.[0]?.message?.content || "Kunde inte tolka svaret från OpenAI.";
    }

    if (provider === "anthropic") {
        const res = await fetch("https://api.anthropic.com/v1/messages", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-api-key": apiKey,
                "anthropic-version": "2023-06-01",
                "anthropic-dangerous-direct-browser-access": "true"
            },
            body: JSON.stringify({
                model,
                max_tokens: 600,
                system: systemPrompt,
                messages: history
            })
        });

        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
            throw new Error(data?.error?.message || `Anthropic HTTP ${res.status}`);
        }
        return data?.content?.[0]?.text || "Kunde inte tolka svaret från Claude.";
    }

    throw new Error("Okänd AI-leverantör");
}

function extractSuggestedLinksForText(combinedText) {
    const lower = combinedText.toLowerCase();
    const links = [];

    const matchedMuni = MUNICIPALITIES_DATA.find((m) =>
        m.keywords.some((kw) => lower.includes(kw))
    );
    if (matchedMuni) {
        links.push({ label: `Lediga bostäder i ${matchedMuni.name} →`, url: matchedMuni.filterUrl });
        links.push({ label: `Läs om ${matchedMuni.name} →`, url: `https://ab-hem.se/kommuner/${matchedMuni.slug}/` });
    } else if (lower.includes("ledig") || lower.includes("lägenhet") || lower.includes("bostad")) {
        links.push({ label: "Se alla lediga bostäder →", url: "https://ab-hem.se/lediga-bostader/" });
    }

    if (lower.includes("hyres-pott") || lower.includes("hyrespott") || lower.includes("rabatt")) {
        links.push({ label: "Läs om Hyres-potten →", url: "https://ab-hem.se/hyres-pott/" });
    }
    if (lower.includes("felanmäl")) {
        links.push({ label: "Gör felanmälan online →", url: "https://ab-hem.se/felanmalan/" });
    }

    return links.slice(0, 3);
}

/* =========================================================
   RENDERING AV CHATTBUBBLOR
   ========================================================= */

function appendUserMessage(text) {
    const wrap = document.createElement("div");
    wrap.className = "ab-msg ab-msg-user";
    wrap.innerHTML = `<div class="ab-msg-bubble">${escapeHtml(text)}</div>`;
    els.chatMessages.appendChild(wrap);
    scrollToBottom();
}

function appendBotMessage(markdownText, actionLinks = [], autoSpeak = true) {
    const wrap = document.createElement("div");
    wrap.className = "ab-msg ab-msg-bot";

    const bubble = document.createElement("div");
    bubble.className = "ab-msg-bubble";
    bubble.innerHTML = formatSimpleMarkdown(markdownText);

    if (actionLinks && actionLinks.length > 0) {
        const linksWrap = document.createElement("div");
        linksWrap.className = "ab-msg-links";
        actionLinks.forEach((item) => {
            const a = document.createElement("a");
            a.className = "ab-action-link";
            a.href = item.url;
            if (!item.url.startsWith("tel:") && !item.url.startsWith("mailto:")) {
                a.target = "_blank";
                a.rel = "noopener";
            }
            a.innerHTML = `<span>${escapeHtml(item.label)}</span>`;
            linksWrap.appendChild(a);
        });
        bubble.appendChild(linksWrap);
    }

    // Lägg till "🔊 Lyssna"-knapp under varje botsvar
    let speakBtn = null;
    if ("speechSynthesis" in window) {
        const footer = document.createElement("div");
        footer.className = "ab-msg-footer";
        speakBtn = document.createElement("button");
        speakBtn.type = "button";
        speakBtn.className = "ab-speak-btn";
        speakBtn.innerHTML = "🔊 Lyssna";
        speakBtn.addEventListener("click", () => {
            speakText(markdownText, speakBtn);
        });
        footer.appendChild(speakBtn);
        bubble.appendChild(footer);
    }

    wrap.appendChild(bubble);
    els.chatMessages.appendChild(wrap);
    scrollToBottom();

    if (autoSpeak && (chatState.ttsEnabled || chatState.askedViaVoice)) {
        chatState.askedViaVoice = false;
        speakText(markdownText, speakBtn);
    }
}

function showTypingIndicator() {
    const el = document.createElement("div");
    el.className = "ab-typing";
    el.innerHTML = `<span></span><span></span><span></span>`;
    els.chatMessages.appendChild(el);
    scrollToBottom();
    return el;
}

function removeTypingIndicator(el) {
    if (el && el.parentNode) {
        el.parentNode.removeChild(el);
    }
}

function scrollToBottom() {
    els.chatMessages.scrollTop = els.chatMessages.scrollHeight;
}

function formatSimpleMarkdown(text) {
    const escaped = escapeHtml(text);
    const withBold = escaped.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
    const withItalic = withBold.replace(/\*(.+?)\*/g, "<em>$1</em>");
    const withLinks = withItalic.replace(
        /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,
        '<a href="$2" target="_blank" rel="noopener">$1</a>'
    );

    return withLinks
        .split(/\n\n+/)
        .map((p) => `<p>${p.replace(/\n/g, "<br>")}</p>`)
        .join("");
}

function escapeHtml(str) {
    return String(str || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

