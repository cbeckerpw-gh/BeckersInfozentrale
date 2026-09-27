/**
 * Status-Anzeige der eingebundenen Shelly-Geräte
 */
const ShellyModule = {
    update(shellyData) {
        if (!shellyData) return;

        const oskarLightEl = document.querySelector('#shelly-oskar-light .shelly-state');
        if (oskarLightEl && shellyData.oskarLight) {
            oskarLightEl.textContent = shellyData.oskarLight;
            oskarLightEl.className = `shelly-state ${shellyData.oskarLight === 'AN' ? 'badge-on' : 'badge-off'}`;
        }
    }
};
