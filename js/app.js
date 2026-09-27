/**
 * Hauptinitialisierung und Auto-Sync Loop
 */
document.addEventListener('DOMContentLoaded', () => {
    // Module initialisieren
    CalendarModule.init();
    TasksModule.init();
    SettingsModule.init();

    // Auto-Sync Timer Starter
    let countdown = 30;
    
    async function syncData() {
        const data = await API.fetchDashboardData();
        if (data) {
            EnergyModule.update(data.energy);
            ShellyModule.update(data.shelly);
            if (data.events) CalendarModule.renderEvents(data.events);
            
            document.getElementById('last-update').textContent = `Stand: ${data.timestamp}`;
        }
    }

    // Erster Sync-Aufruf
    syncData();

    // Countdown-Intervall (Jede Sekunde)
    setInterval(() => {
        countdown--;
        if (countdown <= 0) {
            syncData();
            countdown = 30;
        }
        
        const countEl = document.getElementById('sync-countdown');
        if (countEl) {
            countEl.textContent = `00:${String(countdown).padStart(2, '0')}`;
        }
    }, 1000);
});
