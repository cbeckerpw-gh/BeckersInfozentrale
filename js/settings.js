/* ==========================================================================
Settings-Modul Logik (js/settings.js)
========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
const settingsModal = document.getElementById('settings-modal');
const btnOpenSettings = document.getElementById('btn-open-settings');
const btnCloseSettings = document.getElementById('btn-close-settings');
const btnResetTimers = document.getElementById('btn-reset-timers');
const btnClearTimers = document.getElementById('btn-clear-timers');

// Settings Modal öffnen
if (btnOpenSettings && settingsModal) {
    btnOpenSettings.addEventListener('click', () => {
        settingsModal.classList.remove('hidden');
    });
}

// Settings Modal schließen
if (btnCloseSettings && settingsModal) {
    btnCloseSettings.addEventListener('click', () => {
        settingsModal.classList.add('hidden');
    });
}

// Modal schließen beim Klick auf den Overlay-Hintergrund
if (settingsModal) {
    settingsModal.addEventListener('click', (e) => {
        if (e.target === settingsModal) {
            settingsModal.classList.add('hidden');
        }
    });
}

// 1. Alle Timer zurücksetzen (Status & verbleibende Zeit)
if (btnResetTimers) {
    btnResetTimers.addEventListener('click', () => {
        if (confirm('Möchtest du wirklich alle Timer auf den Ursprungszustand zurücksetzen?')) {
            // Versucht die Funktion aus timer.js aufzurufen, falls vorhanden
            if (typeof resetAllTimers === 'function') {
                resetAllTimers();
            } else {
                // Fallback: LocalStorage zurücksetzen & neu laden
                localStorage.removeItem('timerData');
                location.reload();
            }
            settingsModal.classList.add('hidden');
        }
    });
}

// 2. Alle Timer löschen (Speicher komplett leeren)
if (btnClearTimers) {
    btnClearTimers.addEventListener('click', () => {
        if (confirm('Achtung: Möchtest du wirklich alle angelegten Timer komplett löschen?')) {
            localStorage.clear();
            location.reload();
        }
    });
}


});
