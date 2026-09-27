/**
 * APP BOOTSTRAPPER & AUTO-REFRESH ENGINE
 */

let refreshCountdown = 60;

function initApp() {
    updateDates();
    fetchData();

    // 1-Sekunden Timer für Countdown und Datenaktualisierung
    setInterval(() => {
        refreshCountdown--;
        document.getElementById('refresh-countdown').innerText = `${refreshCountdown}s`;

        if (refreshCountdown <= 0) {
            refreshCountdown = 60;
            fetchData();
        }
    }, 1000);
}

function updateDates() {
    const now = new Date();
    document.getElementById('date-today').innerText = formatDate(now);
    
    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);
    document.getElementById('date-tomorrow').innerText = formatDate(tomorrow);

    const afterTomorrow = new Date(now);
    afterTomorrow.setDate(now.getDate() + 2);
    document.getElementById('date-after-tomorrow').innerText = formatDate(afterTomorrow);
}

function formatDate(date) {
    return date.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' });
}

function fetchData() {
    document.getElementById('last-update-time').innerText = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    
    // API Aufrufe aus api.js
    if (typeof fetchCalendarData === 'function') fetchCalendarData();
    if (typeof fetchEnergyData === 'function') fetchEnergyData();
}

window.onload = initApp;
