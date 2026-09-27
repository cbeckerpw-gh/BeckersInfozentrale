/**
 * Steuerung des Einstellungen- & Verwaltungs-Popups
 */
const SettingsModule = {
    init() {
        const btnOpen = document.getElementById('btn-open-settings');
        const btnClose = document.getElementById('btn-close-settings');
        const modal = document.getElementById('modal-settings');

        if (btnOpen && modal) {
            btnOpen.addEventListener('click', () => modal.classList.remove('hidden'));
        }
        if (btnClose && modal) {
            btnClose.addEventListener('click', () => modal.classList.add('hidden'));
        }
    }
};
