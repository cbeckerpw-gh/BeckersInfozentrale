/* ==========================================================================
Settings-Modul Logik (js/settings.js)
========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    const settingsModal = document.getElementById('settings-modal');
    const btnOpenSettings = document.getElementById('btn-open-settings');
    const btnCloseSettings = document.getElementById('btn-close-settings');
    const btnResetTimers = document.getElementById('btn-reset-timers');
    const btnClearTimers = document.getElementById('btn-clear-timers');

    // Modal öffnen
    if (btnOpenSettings && settingsModal) {
        btnOpenSettings.addEventListener('click', () => {
            settingsModal.classList.remove('hidden');
        });
    }

    // Modal schließen
    if (btnCloseSettings && settingsModal) {
        btnCloseSettings.addEventListener('click', () => {
            settingsModal.classList.add('hidden');
        });
    }

    // Schließen beim Klick auf den Hintergrund
    if (settingsModal) {
        settingsModal.addEventListener('click', (e) => {
            if (e.target === settingsModal) {
                settingsModal.classList.add('hidden');
            }
        });
    }

    // Timer zurücksetzen
    if (btnResetTimers) {
        btnResetTimers.addEventListener('click', () => {
            if (confirm('Möchtest du wirklich alle Timer zurücksetzen?')) {
                localStorage.removeItem('timerData'); // Je nach Schlüssel in deinem Projektspeicher
                location.reload();
            }
        });
    }

    // Speicher komplett leeren
    if (btnClearTimers) {
        btnClearTimers.addEventListener('click', () => {
            if (confirm('Achtung: Möchtest du den gesamten Speicher leeren?')) {
                localStorage.clear();
                location.reload();
            }
        });
    }
});

});
