/**
 * Kalender & Termindarstellung für Heute, Morgen, Übermorgen
 */
const CalendarModule = {
    init() {
        this.renderDates();
    },

    renderDates() {
        const today = new Date();
        const days = ['date-heute', 'date-morgen', 'date-uebermorgen'];
        
        days.forEach((id, index) => {
            const dateObj = new Date(today);
            dateObj.setDate(today.getDate() + index);
            const formatted = dateObj.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' });
            
            const el = document.getElementById(id);
            if (el) el.textContent = formatted;
        });
    },

    renderEvents(events = []) {
        // Leert bestehende Listen
        ['events-heute', 'events-morgen', 'events-uebermorgen'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.innerHTML = '';
        });

        // Beispiel-Rendering für Termine
        events.forEach(event => {
            const containerId = `events-${event.dayTarget}`; // 'heute', 'morgen', etc.
            const container = document.getElementById(containerId);
            if (!container) return;

            const card = document.createElement('div');
            card.className = `event-card ${event.personClass}`;
            card.innerHTML = `
                ${event.time}
                ${event.title}
            `;
            container.appendChild(card);
        });
    }
};
