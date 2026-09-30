/**
 * Hauptanwendungs-Steuerung (app.js)
 * Initialisiert die Anwendung und das Theme-Management.
 */

document.addEventListener('DOMContentLoaded', () => {
    'use strict';

    /**
     * Verwaltet das Umschalten zwischen Light und Dark Mode
     */
    function initTheme() {
        const themeToggleBtn = document.getElementById('theme-toggle');
        const storedTheme = localStorage.getItem('theme') || 'light';

        // Initiales Theme setzen
        document.documentElement.setAttribute('data-theme', storedTheme);
        updateToggleIcon(storedTheme);

        if (themeToggleBtn) {
            themeToggleBtn.addEventListener('click', () => {
                const currentTheme = document.documentElement.getAttribute('data-theme');
                const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

                document.documentElement.setAttribute('data-theme', newTheme);
                localStorage.setItem('theme', newTheme);
                updateToggleIcon(newTheme);
            });
        }
    }

    function updateToggleIcon(theme) {
        const themeToggleBtn = document.getElementById('theme-toggle');
        if (themeToggleBtn) {
            themeToggleBtn.innerHTML = theme === 'dark' ? '☀️ Light Mode' : '🌙 Dark Mode';
        }
    }

    /**
     * Startet die Anwendung und koordinierte Skripte
     */
    function initApp() {
        initTheme();
        console.log('Familienplaner & Energiefluss erfolgreich initialisiert (Theme Support aktiv).');
    }

    initApp();
});
