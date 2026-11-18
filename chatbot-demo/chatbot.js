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
        { value: "gemini-2.5-flash", label: "gemini-2.5-flash (Rekommenderad – Snabb)" },
        { value: "gemini-2.5-pro", label: "gemini-2.5-pro (Avancerad)" }
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
    history: []
};

const els = {};

document.addEventListener("DOMContentLoaded", () => {
    cacheElements();
    initSettingsPanel();
    bindEvents();
    startWelcomeMessage();
});

function cacheElements() {
    els.aiProvider = document.getElementById("ai-provider");
    els.aiModelWrap = document.getElementById("ai-model-wrap");
    els.aiModel = document.getElementById("ai-model");
    els.aiKeyWrap = document.getElementById("ai-key-wrap");
    els.aiApiKey = document.getElementById("ai-api-key");
    els.aiSystemPrompt = document.getElementById("ai-system-prompt");

    els.demoOpenChat = document.getElementById("demo-open-chat");
    els.demoResetChat = document.getElementById("demo-reset-chat");
    els.testQuestionBtns = Array.from(document.querySelectorAll(".test-q-btn"));

    els.chatWindow = document.getElementById("ab-chat-window");
    els.chatLauncher = document.getElementById("ab-chat-launcher");
    els.chatClose = document.getElementById("ab-chat-close");
    els.chatClear = document.getElementById("ab-chat-clear");
    els.chatMessages = document.getElementById("ab-chat-messages");
    els.chatQuickBar = document.getElementById("ab-chat-quick-bar");
    els.chatForm = document.getElementById("ab-chat-form");
    els.chatInput = document.getElementById("ab-chat-input");
    els.chatModeBadge = document.getElementById("ab-chat-mode-badge");
}

function initSettingsPanel() {
    els.aiSystemPrompt.value = DEFAULT_SYSTEM_PROMPT;
    updateProviderUI();
}

function updateProviderUI() {
    const provider = els.aiProvider.value;

    if (provider === "local") {
        els.aiModelWrap.hidden = true;
        els.aiKeyWrap.hidden = true;
        els.chatModeBadge.innerHTML = `<span class="ab-online-dot"></span> Svarar direkt dygnet runt`;
        return;
    }

    els.aiModelWrap.hidden = false;
    els.aiKeyWrap.hidden = false;

    const models = AI_MODELS[provider] || [];
    els.aiModel.innerHTML = "";
    models.forEach((m) => {
        const opt = document.createElement("option");
        opt.value = m.value;
        opt.textContent = m.label;
        els.aiModel.appendChild(opt);
    });

    const providerLabel = provider === "gemini" ? "Gemini AI" : provider === "openai" ? "OpenAI" : "Claude AI";
    els.chatModeBadge.innerHTML = `<span class="ab-online-dot"></span> ${providerLabel} aktiv`;
}

function bindEvents() {
    els.aiProvider.addEventListener("change", updateProviderUI);

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
}

function resetConversation() {
    chatState.history = [];
    els.chatMessages.innerHTML = "";
    startWelcomeMessage();
}

function startWelcomeMessage() {
    appendBotMessage(
        "Hej och välkommen till **AB-hem**! 👋\n\nJag hjälper dig med frågor om lediga lägenheter, **Hyres-potten**, våra 17 kommuner, uthyrningskrav eller felanmälan.\n\nVälj ett ämne nedan eller skriv din fråga!",
        [
            { label: "Se alla lediga bostäder →", url: "https://ab-hem.se/lediga-bostader/" },
            { label: "Läs om Hyres-potten →", url: "https://ab-hem.se/hyres-pott/" }
        ]
    );
}

/* =========================================================
   HANTERA FRÅGA (AI ELLER LOKAL MOTOR)
   ========================================================= */

async function handleUserQuestion(questionText) {
    appendUserMessage(questionText);
    chatState.history.push({ role: "user", content: questionText });

    const typingEl = showTypingIndicator();

    const provider = els.aiProvider.value;
    const apiKey = els.aiApiKey.value.trim();
    const model = els.aiModel.value;
    const systemPrompt = els.aiSystemPrompt.value.trim() || DEFAULT_SYSTEM_PROMPT;

    try {
        if (provider !== "local" && apiKey) {
            const aiReply = await callSelectedAiModel({
                provider,
                model,
                apiKey,
                systemPrompt,
                history: chatState.history.slice(-6)
            });
            removeTypingIndicator(typingEl);
            chatState.history.push({ role: "assistant", content: aiReply });
            appendBotMessage(aiReply, extractSuggestedLinksForText(questionText + " " + aiReply));
        } else {
            // Kort naturlig fördröjning för lokal svarsmotor
            await new Promise((r) => setTimeout(r, 320));
            const localReply = getLocalBotResponse(questionText);
            removeTypingIndicator(typingEl);
            chatState.history.push({ role: "assistant", content: localReply.text });
            appendBotMessage(localReply.text, localReply.links);
        }
    } catch (err) {
        console.warn("AI-anrop misslyckades, använder lokalt reservläge:", err);
        removeTypingIndicator(typingEl);
        const fallback = getLocalBotResponse(questionText);
        appendBotMessage(
            fallback.text + `\n\n*(Obs: Kunde inte nå vald AI-modell [${err.message}], så svaret kommer från AB-hems inbyggda reservläge).*`,
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

async function callSelectedAiModel({ provider, model, apiKey, systemPrompt, history }) {
    if (provider === "gemini") {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;
        const contents = history.map((msg) => ({
            role: msg.role === "assistant" ? "model" : "user",
            parts: [{ text: msg.content }]
        }));

        const res = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                system_instruction: { parts: [{ text: systemPrompt }] },
                contents,
                generationConfig: { temperature: 0.3, maxOutputTokens: 500 }
            })
        });

        if (!res.ok) {
            throw new Error(`Gemini HTTP ${res.status}`);
        }
        const data = await res.json();
        return data?.candidates?.[0]?.content?.parts?.[0]?.text || "Kunde inte tolka svaret från Gemini.";
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
                max_tokens: 500,
                messages: [
                    { role: "system", content: systemPrompt },
                    ...history
                ]
            })
        });

        if (!res.ok) {
            throw new Error(`OpenAI HTTP ${res.status}`);
        }
        const data = await res.json();
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
                max_tokens: 500,
                system: systemPrompt,
                messages: history
            })
        });

        if (!res.ok) {
            throw new Error(`Anthropic HTTP ${res.status}`);
        }
        const data = await res.json();
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

function appendBotMessage(markdownText, actionLinks = []) {
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

    wrap.appendChild(bubble);
    els.chatMessages.appendChild(wrap);
    scrollToBottom();
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

