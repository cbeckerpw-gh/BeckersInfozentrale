/**
 * MODULE_CALENDAR: Logik zur Zuordnung von Terminen zu Personen & Rendering
 */

function parseEventAssignee(title, calendarOwnerEmail) {
    const cleanTitle = title.trim();
    const lowerTitle = cleanTitle.toLowerCase();

    // 1. Wenn es das persönliche Konto von Papa oder Mama ist
    if (calendarOwnerEmail === 'papa@gmail.com') return 'papa';
    if (calendarOwnerEmail === 'mama@gmail.com') return 'mama';

    // 2. Musterprüfung im Familienkalender für Namenskombinationen
    // Prüft z.B. "Oskar + Irma - ...", "Oskar/Irma - ...", "Irma & Oskar - ..."
    const multiChildPattern = /(oskar\s*[\+\/\&]\s*irma|irma\s*[\+\/\&]\s*oskar)/i;
    if (multiChildPattern.test(lowerTitle)) {
        return 'oskar-irma'; // Beiden Kindern zuordnen
    }

    // 3. Einzelzuordnungen am Anfang des Titels
    if (lowerTitle.startsWith('oskar')) return 'oskar';
    if (lowerTitle.startsWith('irma')) return 'irma';

    // 4. Default Fallback
    return 'eltern';
}

function renderEvents(eventsData) {
    const containers = {
        today: document.getElementById('events-today'),
        tomorrow: document.getElementById('events-tomorrow'),
        afterTomorrow: document.getElementById('events-after-tomorrow')
    };

    // Container leeren
    Object.values(containers).forEach(c => c.innerHTML = '');

    const now = new Date();

    eventsData.forEach(event => {
        const startDate = new Date(event.start);
        const endDate = new Date(event.end);
        const dayKey = getDayKey(startDate, now);

        if (!containers[dayKey]) return;

        const assignee = parseEventAssignee(event.summary, event.ownerEmail);
        const isPast = endDate < now && !(now.getHours() === 23 && now.getMinutes() === 59);

        // Bei Kombi "Oskar & Irma" erzeugen wir 2 visuellen Zuordnungen oder spezielle Dual-Karte
        const card = document.createElement('div');
        card.className = `event-card event-\({assignee}\){isPast ? 'past-event' : ''}`;
        
        let timeStr = event.isAllDay 
            ? 'Ganztägig (00:00 - 23:59)' 
            : `\({formatTime(startDate)} -\){formatTime(endDate)}`;

        card.innerHTML = `
            ${timeStr}
            ${event.summary}
        `;

        // Klick auf Event öffnet Timer, falls es eine Kinderaufgabe ist
        if (assignee === 'oskar' || assignee === 'irma' || assignee === 'oskar-irma') {
            card.onclick = () => openTimerModalForTask(event.summary, assignee);
        }

        containers[dayKey].appendChild(card);
    });
}

function getDayKey(eventDate, referenceDate) {
    const diffDays = Math.floor((eventDate.setHours(0,0,0,0) - referenceDate.setHours(0,0,0,0)) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'today';
    if (diffDays === 1) return 'tomorrow';
    if (diffDays === 2) return 'afterTomorrow';
    return null;
}

function formatTime(date) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}
