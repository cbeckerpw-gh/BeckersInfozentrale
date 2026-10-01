/* ==========================================================================
   Settings-Modul Logik (js/settings.js)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    console.log("Settings-Modul geladen.");

    const settingsModal = document.getElementById('settings-modal');
    const btnOpenSettings = document.getElementById('btn-open-settings');
    const btnCloseSettings = document.getElementById('btn-close-settings');
    const btnResetTimers = document.getElementById('btn-reset-timers');
    const btnClearTimers = document.getElementById('btn-clear-timers');

    if (!btnOpenSettings) console.warn("Element #btn-open-settings nicht gefunden!");
    if (!settingsModal) console.warn("Element #settings-modal nicht gefunden!");

    // Modal öffnen
    if (btnOpenSettings && settingsModal) {
        btnOpenSettings.addEventListener('click', () => {
            console.log("Settings-Button geklickt.");
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
                localStorage.removeItem('timerData');
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
