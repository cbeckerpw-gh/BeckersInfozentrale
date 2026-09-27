# BeckersInfozentrale

Projektarchitektur & Modul-DokumentationProjekt: Kindgerechter Familienplaner mit EnergieflussanzeigeHosting: GitHub Pages (Serverless HTML5/CSS3/JS)Backend & Schnittstellen: Pipedream (REST API Proxy)Zielgeräte: Wallpanel (iPad 10" Querformat, $1024 \times 768 \text{ px}$+) und Smartphones (Responsive CSS Grid/Flexbox)📁 Ordnerstruktur für GitHub RepositoryErstelle in deinem GitHub-Repository folgende Ordner- und Dateistruktur:Plaintextfamilienplaner/
├── index.html              # Haupt-Layout und HTML-Grundgerüst
├── css/
│   └── style.css           # Zentrales Responsive Design & Theme
├── js/
│   ├── app.js              # Hauptsteuerung & Modul-Initialisierung
│   ├── modules/
│   │   ├── calendar.js     # Modul 1: Kalender (3-Spalten & Personen-Parsing)
│   │   ├── tasks.js        # Modul 2: Kindgerechter Aufgaben-Timer & Popups
│   │   ├── energy.js       # Modul 3: Energieflussanzeige (PV, Akku, Netz, Zappi)
│   │   ├── shelly.js       # Modul 4: Shelly Statusanzeige
│   │   └── settings.js     # Modul 5: Einstellungen & Admin-Bereich
│   └── utils/
│       └── api.js          # REST-API Fetcher (Pipedream-Anbindung & Auto-Refresh)
├── assets/
│   ├── icons/              # Kindgerechte Icons (SVG/PNG für Aufgaben & Personen)
│   └── audio/              # Soundeffekte (Erfolg / Timer-Ablauf)
├── pipedream/
│   ├── google-calendar-endpoint.js # Pipedream Workflow Code für Kalender
│   └── energy-shelly-endpoint.js   # Pipedream Workflow Code für Energie & Shelly
└── README.md               # Projektdokumentation & Deployment-Anleitung
🔒 Sicherheits-, Performance- & ArchitekturkonzeptSicherheit (Serverless API Proxy):Keine API-Keys oder Zugangsdaten (Google OAuth Tokens, Sungrow/iSolarCloud Credentials, MyEnergi Zappi Credentials, Shelly Cloud Keys) im Client-Code.Sämtliche externe Abfragen laufen über Pipedream HTTP-Endpoints. Pipedream authentifiziert sich gegenüber den APIs und sendet ausschließlich gefilterte, anonymisierte JSON-Daten an GitHub Pages.CORS-Header in Pipedream schränken Zugriffe auf deine GitHub-Pages-Domain ein.Performance & Auto-Refresh:Der Client führt ein zeitgesteuertes Polling durch (z. B. Kalender alle 5 Minuten, Energiedaten alle 15 Sekunden).Die verbleibende Zeit bis zum nächsten Sync wird als Count-Down Timer in der Statusleiste angezeigt.UX & Kindgerechte Bedienung:Mindest-Touch-Flächen von $60 \times 60 \text{ px}$ für Kinderhände.Farblegende für Personen: Papa, Mama, Oskar, Irma, Eltern/Allgemein.Visueller analoger Timer (SVG mit abnehmendem roten Kreissegment) für intuitives Zeitverständnis (5–6 Jahre).

Modul 1: index.html (Haupt-HTML-Gerüst)Das HTML-Gerüst definiert das 3-Spalten-Layout für den Kalender, den Header mit Farblegende/Statusleiste, das Energie-Dashboard und die Modals (Popups) für Aufgaben und Einstellungen.
++
Familienplaner & Dashboard
++

Modul 2: css/style.css (Styles & Responsive iPad/Mobile Layout)
Das CSS ist modulweise gegliedert und nutzt CSS-Variablen für das konsistente Personen-Farbschema.

CSS
/* ==========================================================================
   1. GLOBAL STYLES & VARIABLE DEFINITIONS
   ========================================================================== */
:root {
    --color-papa: #2196F3;       /* Blau */
    --color-mama: #E91E63;       /* Pink */
    --color-oskar: #FF9800;      /* Orange */
    --color-irma: #9C27B0;       /* Violett */
    --color-eltern: #4CAF50;     /* Grün */
    
    --bg-dark: #121212;
    --bg-card: #1E1E1E;
    --bg-card-hover: #2A2A2A;
    --text-main: #FFFFFF;
    --text-muted: #AAAAAA;
    
    --font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
}

* {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
}

body {
    background-color: var(--bg-dark);
    color: var(--text-main);
    font-family: var(--font-family);
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    overflow-x: hidden;
}

/* ==========================================================================
   2. HEADER & PERSONEN-LEGENDE
   ========================================================================== */
.app-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 15px;
    background-color: #1A1A1A;
    border-bottom: 2px solid #333;
}

.legend-container {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
}

.legend-item {
    padding: 6px 12px;
    border-radius: 20px;
    font-size: 0.9rem;
    font-weight: bold;
    color: #FFF;
    display: flex;
    align-items: center;
    gap: 5px;
}

.legend-item.papa   { background-color: var(--color-papa); }
.legend-item.mama   { background-color: var(--color-mama); }
.legend-item.oskar  { background-color: var(--color-oskar); }
.legend-item.irma   { background-color: var(--color-irma); }
.legend-item.eltern { background-color: var(--color-eltern); }

.status-container {
    display: flex;
    align-items: center;
    gap: 15px;
    font-size: 0.85rem;
    color: var(--text-muted);
}

.btn-icon {
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
}

/* ==========================================================================
   3. ENERGIEFLUSS & SHELLY BAR (Modul 3 & 4)
   ========================================================================== */
.energy-shelly-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 15px;
    background-color: #181818;
    border-bottom: 1px solid #2C2C2C;
    gap: 15px;
}

.energy-flow-container {
    display: flex;
    align-items: center;
    gap: 15px;
    flex-grow: 1;
}

.energy-node {
    background-color: var(--bg-card);
    padding: 8px 12px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 0.9rem;
}

.energy-node .arrow {
    font-weight: bold;
    font-size: 1.1rem;
}

.arrow.green { color: #4CAF50; }
.arrow.red   { color: #F44336; }

.shelly-container {
    display: flex;
    gap: 10px;
}

.shelly-item {
    background-color: var(--bg-card);
    padding: 6px 10px;
    border-radius: 6px;
    font-size: 0.85rem;
}

.badge-on { color: #4CAF50; font-weight: bold; }
.badge-off { color: #888888; }

/* ==========================================================================
   4. 3-SPALTEN-PLANER (Modul 1 & 2)
   ========================================================================== */
.planner-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 15px;
    padding: 15px;
    flex-grow: 1;
}

.day-column {
    background-color: #181818;
    border-radius: 10px;
    padding: 12px;
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.column-header {
    font-size: 1.2rem;
    border-bottom: 2px solid #333;
    padding-bottom: 5px;
}

.date-sub {
    font-size: 0.85rem;
    color: var(--text-muted);
}

.events-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
    overflow-y: auto;
}

/* Kalendereinträge-Styling */
.event-card {
    padding: 10px 12px;
    border-radius: 6px;
    border-left: 6px solid #CCC;
    background-color: var(--bg-card);
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.event-card.papa   { border-left-color: var(--color-papa); }
.event-card.mama   { border-left-color: var(--color-mama); }
.event-card.oskar  { border-left-color: var(--color-oskar); }
.event-card.irma   { border-left-color: var(--color-irma); }
.event-card.eltern { border-left-color: var(--color-eltern); }

.event-card.expired {
    opacity: 0.4;
    filter: grayscale(80%);
}

.event-time {
    font-size: 0.75rem;
    color: var(--text-muted);
}

.event-title {
    font-weight: 600;
    font-size: 0.95rem;
}

/* ==========================================================================
   5. TIMER & MODAL POPUPS (Modul 2)
   ========================================================================== */
.modal {
    position: fixed;
    top: 0; left: 0; width: 100vw; height: 100vh;
    background-color: rgba(0,0,0,0.85);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
}

.modal.hidden { display: none; }

.modal-content {
    background-color: var(--bg-card);
    padding: 25px;
    border-radius: 12px;
    width: 90%;
    max-width: 450px;
    text-align: center;
    position: relative;
}

.btn-close-modal {
    position: absolute;
    top: 10px; right: 15px;
    background: none; border: none;
    color: #FFF; font-size: 1.5rem; cursor: pointer;
}

/* Visuelle Uhr (SVG Analog Timer) */
.visual-clock-container {
    width: 180px;
    height: 180px;
    margin: 20px auto;
}

.analog-clock-svg {
    width: 100%; height: 100%;
}

.clock-face {
    fill: #222;
    stroke: #FFF;
    stroke-width: 3;
}

.clock-fill {
    fill: #E53935; /* Rote Füllung des ablaufenden Timers */
    opacity: 0.85;
}

.clock-hand {
    stroke: #FFF;
    stroke-width: 3;
    stroke-linecap: round;
}

.digital-timer-display {
    font-size: 2.5rem;
    font-weight: bold;
    margin: 10px 0;
}

.btn-action {
    padding: 12px 24px;
    font-size: 1.1rem;
    border: none;
    border-radius: 8px;
    font-weight: bold;
    cursor: pointer;
    width: 100%;
    margin-top: 10px;
}

.btn-green { background-color: #4CAF50; color: #FFF; }
.btn-blue  { background-color: #2196F3; color: #FFF; }
.btn-gray  { background-color: #555555; color: #FFF; }

.rocket-animation { font-size: 4rem; margin-bottom: 10px; }
.cross-animation { font-size: 4rem; color: #F44336; margin-bottom: 10px; }

/* Mini Timer Badge in der Tages-Spalte */
.mini-timer-card {
    background-color: #332200;
    border: 2px solid var(--color-oskar);
    padding: 8px;
    border-radius: 6px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    cursor: pointer;
}

/* ==========================================================================
   6. RESPONSIVE DESIGN (iPad Querformat vs. Smartphone)
   ========================================================================== */
@media (max-width: 850px) {
    .planner-grid {
        grid-template-columns: 1fr; /* Spalten untereinander auf Mobilgeräten */
    }
    .energy-flow-container {
        flex-wrap: wrap;
    }
}
Modul 3: js/utils/api.js (REST-API Controller & Auto-Refresh)
Verwaltet zentral die Verbindung zu Pipedream und das zeitsynchrone Intervall-Polling.

JavaScript
/**
 * Modul: REST API Fetcher & Sync Engine
 * Stellt die Verbindung zu Pipedream her und steuert automatische Updates.
 */
const API_CONFIG = {
    // Pipedream Endpoints (Hier deine generierten Pipedream URLs eintragen)
    PIPEDREAM_CALENDAR_URL: 'https://YOUR_PIPEDREAM_ID.m.pipedream.net/calendar',
    PIPEDREAM_TELEMETRY_URL: 'https://YOUR_PIPEDREAM_ID.m.pipedream.net/telemetry',
    REFRESH_INTERVAL_SEC: 300 // 5 Minuten Kalender-Sync
};

class ApiService {
    constructor() {
        this.countdown = API_CONFIG.REFRESH_INTERVAL_SEC;
    }

    /**
     * Startet den automatischen Aktualisierungs-Timer für die UI
     */
    startAutoRefresh(onCalendarFetch, onTelemetryFetch) {
        // Erstaufruf
        onCalendarFetch();
        onTelemetryFetch();

        // 15-Sekunden Intervall für Energiedaten (Schnell)
        setInterval(() => {
            onTelemetryFetch();
        }, 15000);

        // Countdown & 5-Minuten Intervall für Kalender
        setInterval(() => {
            this.countdown--;
            this.updateCountdownUI();

            if (this.countdown <= 0) {
                onCalendarFetch();
                this.countdown = API_CONFIG.REFRESH_INTERVAL_SEC;
            }
        }, 1000);
    }

    updateCountdownUI() {
        const minutes = String(Math.floor(this.countdown / 60)).padStart(2, '0');
        const seconds = String(this.countdown % 60).padStart(2, '0');
        const el = document.getElementById('sync-countdown');
        if (el) el.textContent = `\({minutes}:\){seconds}`;

        const now = new Date();
        const lastUpdateEl = document.getElementById('last-update');
        if (lastUpdateEl) lastUpdateEl.textContent = `Stand: ${now.toLocaleTimeString()}`;
    }

    async fetchCalendarData() {
        try {
            const response = await fetch(API_CONFIG.PIPEDREAM_CALENDAR_URL);
            if (!response.ok) throw new Error('Netzwerkfehler Kalender-API');
            return await response.json();
        } catch (error) {
            console.error('Fehler beim Abrufen der Kalenderdaten:', error);
            return null;
        }
    }

    async fetchTelemetryData() {
        try {
            const response = await fetch(API_CONFIG.PIPEDREAM_TELEMETRY_URL);
            if (!response.ok) throw new Error('Netzwerkfehler Telemetrie-API');
            return await response.json();
        } catch (error) {
            console.error('Fehler beim Abrufen der Energiedaten:', error);
            return null;
        }
    }
}

const apiService = new ApiService();
Modul 4: js/modules/calendar.js (Kalender-Parsing & Zuordnung)
Übernimmt das Verarbeiten der Google-Kalender-Daten, die Zuordnungs-Logik nach Text-Kriterien (Oskar, Irma, Kombinationen) sowie die Darstellung der 3-Spalten-Übersicht.

JavaScript
/**
 * Modul 1: Kalender-Logik (Heute, Morgen, Übermorgen)
 * Filterung nach Namen, ganztägige/mehrtägige Termine & Ausgrauen.
 */
class CalendarModule {
    constructor() {
        this.events = [];
    }

    init() {
        this.updateDateHeaders();
    }

    updateDateHeaders() {
        const today = new Date();
        const morgen = new Date(today); morgen.setDate(today.getDate() + 1);
        const uebermorgen = new Date(today); uebermorgen.setDate(today.getDate() + 2);

        document.getElementById('date-heute').textContent = today.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' });
        document.getElementById('date-morgen').textContent = morgen.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' });
        document.getElementById('date-uebermorgen').textContent = uebermorgen.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' });
    }

    /**
     * Ermittelt die Personenzuordnung basierend auf Mailkonto und Titel-Syntaktik.
     */
    determineAssignee(event) {
        // Mailkonten-Ebene
        if (event.account === 'papa') return 'papa';
        if (event.account === 'mama') return 'mama';

        // Familienkalender-Parsing via RegEx
        const title = (event.summary || '').toLowerCase();
        
        const hasOskar = title.includes('oskar');
        const hasIrma = title.includes('irma');

        if (hasOskar && hasIrma) return 'both'; // Oskar & Irma
        if (hasOskar) return 'oskar';
        if (hasIrma) return 'irma';

        return 'eltern'; // Standard / Allgemein
    }

    renderEvents(eventsData) {
        if (!eventsData) return;
        this.events = eventsData;

        const containers = {
            heute: document.getElementById('events-heute'),
            morgen: document.getElementById('events-morgen'),
            uebermorgen: document.getElementById('events-uebermorgen')
        };

        Object.values(containers).forEach(c => c.innerHTML = '');

        const now = new Date();

        this.events.forEach(event => {
            const assignee = this.determineAssignee(event);
            const eventStart = new Date(event.start);
            const eventEnd = new Date(event.end);
            
            // Bestimme Zielspalte (heute, morgen, uebermorgen)
            const targetDay = this.getDayCategory(eventStart);
            if (!targetDay || !containers[targetDay]) return;

            // Ist der Termin abgelaufen? (Endzeit erreicht, aber noch am selben Tag)
            const isExpired = now > eventEnd;

            const card = document.createElement('div');
            card.className = `event-card \({assignee}\){isExpired ? 'expired' : ''}`;

            const timeString = event.isAllDay 
                ? '00:00 - 23:59 (Ganztägig)'
                : `\({eventStart.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} -\){eventEnd.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`;

            card.innerHTML = `
${timeString}

${event.summary}

        `;

        containers[targetDay].appendChild(card);
    });
}

getDayCategory(date) {
    const today = new Date();
    today.setHours(0,0,0,0);
    
    const target = new Date(date);
    target.setHours(0,0,0,0);

    const diffDays = Math.round((target - today) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'heute';
    if (diffDays === 1) return 'morgen';
    if (diffDays === 2) return 'uebermorgen';
    return null;
}
}

const calendarModule = new CalendarModule();

Modul 5: js/modules/tasks.js (Visueller Timer & Popups)
Steuert die Ausführung der Aufgaben-Timer, das Ausfüllen des analogen SVG-Uhrenkreises sowie das Feedback-System.

JavaScript
/**
 * Modul 2: Kindgerechte Aufgaben & Visueller Analog-Timer
 */
class TaskModule {
    constructor() {
        this.activeTimer = null;
        this.timerInterval = null;
        this.totalSeconds = 0;
        this.remainingSeconds = 0;
    }

    init() {
        document.getElementById('btn-close-timer').addEventListener('click', () => this.closeTimerModal());
        document.getElementById('btn-start-timer').addEventListener('click', () => this.startTimer());
        document.getElementById('btn-complete-task').addEventListener('click', () => this.completeTaskSuccess());
        document.getElementById('btn-close-feedback').addEventListener('click', () => this.closeFeedbackModal());
    }

    openTimerModal(task) {
        this.activeTimer = task;
        this.totalSeconds = task.minutes * 60;
        this.remainingSeconds = this.totalSeconds;

        document.getElementById('timer-task-title').textContent = `\({task.icon}\){task.title}`;
        document.getElementById('timer-task-assignee').textContent = `Für: ${task.assignee.toUpperCase()}`;
        
        this.updateDigitalDisplay();
        this.updateSVGClock(1.0); // Full Circle

        document.getElementById('btn-start-timer').classList.remove('hidden');
        document.getElementById('btn-complete-task').classList.add('hidden');
        document.getElementById('modal-task-timer').classList.remove('hidden');
    }

    startTimer() {
        document.getElementById('btn-start-timer').classList.add('hidden');
        document.getElementById('btn-complete-task').classList.remove('hidden');

        this.timerInterval = setInterval(() => {
            this.remainingSeconds--;
            this.updateDigitalDisplay();
            
            const progressRatio = this.remainingSeconds / this.totalSeconds;
            this.updateSVGClock(progressRatio);

            if (this.remainingSeconds <= 0) {
                clearInterval(this.timerInterval);
                this.triggerTimerExpired();
            }
        }, 1000);
    }

    updateDigitalDisplay() {
        const m = String(Math.floor(this.remainingSeconds / 60)).padStart(2, '0');
        const s = String(this.remainingSeconds % 60).padStart(2, '0');
        document.getElementById('digital-timer-text').textContent = `\({m}:\){s}`;
    }

    /**
     * Zeichnet ein Kreissegment (Pie Slice) in SVG basierend auf dem verbleibenden Zeitanteil.
     */
    updateSVGClock(ratio) {
        const path = document.getElementById('clock-fill-path');
        if (ratio <= 0) {
            path.setAttribute('d', '');
            return;
        }

        const angle = ratio * 360;
        const radians = (angle - 90) * (Math.PI / 180);
        const x = 50 + 45 * Math.cos(radians);
        const y = 50 + 45 * Math.sin(radians);
        const largeArc = angle > 180 ? 1 : 0;

        // Path Definition für Pie Slice ausgehend von 12 Uhr Position (50, 5)
        const d = `M 50 50 L 50 5 A 45 45 0 \({largeArc} 1\){x} ${y} Z`;
        path.setAttribute('d', d);
    }

    completeTaskSuccess() {
        clearInterval(this.timerInterval);
        this.closeTimerModal();
        
        // Pop-Up Belobigung mit Rakete
        document.getElementById('feedback-success').classList.remove('hidden');
        document.getElementById('feedback-failed').classList.add('hidden');
        document.getElementById('modal-feedback').classList.remove('hidden');
    }

    triggerTimerExpired() {
        this.closeTimerModal();

        // Pop-Up Rotes Kreuz
        document.getElementById('feedback-failed').classList.remove('hidden');
        document.getElementById('feedback-success').classList.add('hidden');
        document.getElementById('modal-feedback').classList.remove('hidden');
    }

    closeTimerModal() {
        document.getElementById('modal-task-timer').classList.add('hidden');
    }

    closeFeedbackModal() {
        document.getElementById('modal-feedback').classList.add('hidden');
    }
}

const taskModule = new TaskModule();
Modul 6: js/modules/energy.js (Energiefluss & Zappi)
Rendert Leistungswerte der Sungrow PV-Anlage, Hausverbrauch, Batterie, Netzbezug/Einspeisung sowie der Zappi-Wallbox mit richtungsweisenden Farbpfeilen.

JavaScript
/**
 * Modul 3: Energieflussanzeige
 */
class EnergyModule {
    render(telemetry) {
        if (!telemetry || !telemetry.energy) return;

        const { pv, battery, house, grid, zappi } = telemetry.energy;

        // PV Dach
        document.getElementById('val-pv').textContent = `${pv.toFixed(1)} kW`;

        // Speicher
        document.getElementById('val-battery').textContent = `${Math.abs(battery).toFixed(1)} kW`;
        this.setArrow('arrow-battery', battery > 0 ? 'green' : 'red', battery > 0 ? '➔' : '⬅');

        // Haus
        document.getElementById('val-house').textContent = `${house.toFixed(1)} kW`;

        // Netz (Positiv = Einspeisung [Grün], Negativ = Bezug [Rot])
        document.getElementById('val-grid').textContent = `${Math.abs(grid).toFixed(1)} kW`;
        if (grid >= 0) {
            this.setArrow('arrow-grid', 'green', '➔'); // Einspeisen
        } else {
            this.setArrow('arrow-grid', 'red', '⬅'); // Netzbezug
        }

        // Zappi Wallbox
        document.getElementById('val-zappi').textContent = `${zappi.toFixed(1)} kW`;
    }

    setArrow(elementId, colorClass, symbol) {
        const el = document.getElementById(elementId);
        if (el) {
            el.className = `arrow ${colorClass}`;
            el.textContent = symbol;
        }
    }
}

const energyModule = new EnergyModule();
Modul 7: js/modules/shelly.js (Shelly Status)
JavaScript
/**
 * Modul 4: Shelly Statusanzeige
 */
class ShellyModule {
    render(telemetry) {
        if (!telemetry || !telemetry.shelly) return;

        const container = document.getElementById('shelly-status-list');
        container.innerHTML = '';

        telemetry.shelly.forEach(device => {
            const div = document.createElement('div');
            div.className = 'shelly-item';
            div.innerHTML = `
                ${device.name}:
                
                    ${device.isOn ? 'AN 💡' : 'AUS'}
                
            `;
            container.appendChild(div);
        });
    }
}

const shellyModule = new ShellyModule();
Modul 8: js/modules/settings.js (Verwaltung/Admin)
JavaScript
/**
 * Modul 5: Einstellungen & Aufgabenverwaltung
 */
class SettingsModule {
    constructor() {
        this.selectedMinutes = 15;
    }

    init() {
        document.getElementById('btn-open-settings').addEventListener('click', () => {
            document.getElementById('modal-settings').classList.remove('hidden');
        });

        document.getElementById('btn-close-settings').addEventListener('click', () => {
            document.getElementById('modal-settings').classList.add('hidden');
        });

        // Time Button Selectors
        document.querySelectorAll('.btn-time-select').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.btn-time-select').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.selectedMinutes = parseInt(e.target.getAttribute('data-minutes'));
            });
        });

        document.getElementById('form-create-task').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveTask();
        });
    }

    saveTask() {
        const assignee = document.getElementById('select-assignee').value;
        const topic = document.getElementById('select-topic').value;
        const repeat = document.getElementById('task-repeat').value;

        const newTask = {
            id: Date.now(),
            assignee,
            topic,
            minutes: this.selectedMinutes,
            repeat
        };

        console.log('Neue Aufgabe erstellt:', newTask);
        document.getElementById('modal-settings').classList.add('hidden');
    }
}

const settingsModule = new SettingsModule();
Modul 9: js/app.js (Hauptsteuerung)
Initialisiert alle Teilmodule und startet die Sync-Engine.

JavaScript
/**
 * Haupt-Anwendungs-Entrypoint (Main Application Initialization)
 */
document.addEventListener('DOMContentLoaded', () => {
    // Initialisiere alle UI-Module
    calendarModule.init();
    taskModule.init();
    settingsModule.init();

    // Starte Sync Engine für REST APIs
    apiService.startAutoRefresh(
        async () => {
            const calendarData = await apiService.fetchCalendarData();
            calendarModule.renderEvents(calendarData);
        },
        async () => {
            const telemetryData = await apiService.fetchTelemetryData();
            energyModule.render(telemetryData);
            shellyModule.render(telemetryData);
        }
    );
});
Modul 10: pipedream/google-calendar-endpoint.js (Backend API Engine)
Pipedream Node.js Endpoint zum sicheren Auslesen und Aufbereiten mehrerer Google Kalender ohne Bekanntgabe von Keys an das Frontend.

JavaScript
import { axios } from "@pipedream/platform";

export default defineComponent({
  props: {
    google_calendar: {
      type: "app",
      app: "google_calendar",
    },
  },
  async run({ steps, $ }) {
    // Liste der zu abfragenden Kalender-IDs
    const calendarIds = [
      { id: "primary", account: "papa" },
      { id: "MAMA_CALENDAR_ID@group.calendar.google.com", account: "mama" },
      { id: "FAMILY_CALENDAR_ID@group.calendar.google.com", account: "family" }
    ];

    const timeMin = new Date();
    timeMin.setHours(0,0,0,0);
    const timeMax = new Date();
    timeMax.setDate(timeMax.getDate() + 3);

    let allEvents = [];

    for (const cal of calendarIds) {
      const response = await axios($, {
        url: `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(cal.id)}/events`,
        headers: {
          Authorization: `Bearer \({this.google_calendar.\)auth.oauth_access_token}`,
        },
        params: {
          timeMin: timeMin.toISOString(),
          timeMax: timeMax.toISOString(),
          singleEvents: true,
          orderBy: "startTime",
        },
      });

      const parsedEvents = response.items.map(item => ({
        id: item.id,
        summary: item.summary,
        start: item.start.dateTime || item.start.date,
        end: item.end.dateTime || item.end.date,
        isAllDay: !item.start.dateTime,
        account: cal.account
      }));

      allEvents = allEvents.concat(parsedEvents);
    }

    return allEvents;
  },
});
📝 Projektdokumentation: README.md
Markdown
# Kindgerechter Familienplaner mit Energieflussanzeige

Ein serverless Web-Dashboard für Wandtablets (z. B. iPad 10" Querformat) und Smartphones.

## Features
- **3-Spalten-Kalender**: Übersicht für Heute, Morgen und Übermorgen.
- **Automatische Personenzuordnung**: Namens-Parsing (Papa, Mama, Oskar, Irma, Eltern).
- **Kindgerechter Aufgaben-Timer**: Analoge Visualisierung der Verstreichenden Zeit mit interaktiven Popups (Raketen-Belobigung vs. Rotes Kreuz).
- **Live-Energiefluss**: Anzeige von Sungrow PV, Speicher, Hausverbrauch, Netz-Einspeisung/Bezug und Zappi Wallbox mit Dynamik-Pfeilen.
- **Shelly Status-Monitor**: Direkte Kontrolle wichtiger Lichter/Verbraucher.
- **Höchste Sicherheit**: Keine API-Keys im Client (Pipedream REST API Proxy).

## Setup & Deployment auf GitHub Pages

1. **Repository anlegen**: Erstelle ein neues GitHub Repository und lade die Dateien gemäß der definierten Ordnerstruktur hoch.
2. **GitHub Pages aktivieren**:
   - Gehe zu `Settings` -> `Pages`.
   - Wähle den `main` Branch und den Ordner `/ (root)`.
   - Speichere die Einstellungen.
3. **Pipedream Endpoints konfigurieren**:
   - Richte in Pipedream Workflows für Google Calendar und deine Telemetriegeschwindigkeit (PV/Shelly) ein.
   - Trage die erzeugten Endpoint-URLs in `js/utils/api.js` unter `PIPEDREAM_CALENDAR_URL` und `PIPEDREAM_TELEMETRY_URL` ein.
