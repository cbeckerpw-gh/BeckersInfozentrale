/**
 * ZentraIer API Handler für Daten-Sync & Endpunkte
 */
const API = {
    // Standard-Intervall in ms (30 Sekunden)
    SYNC_INTERVAL: 30000,

    async fetchDashboardData() {
        try {
            // Beispiel für spätere Google Apps Script / Home Assistant Anbindung
            // const response = await fetch('YOUR_SCRIPT_OR_HA_URL');
            // return await response.json();
            
            return {
                timestamp: new Date().toLocaleTimeString(),
                energy: { pv: 3.4, battery: 1.2, house: 0.8, grid: 0.0, zappi: 1.4 },
                shelly: { oskarLight: "AUS" },
                events: []
            };
        } catch (error) {
            console.error("Fehler beim Abrufen der Dashboard-Daten:", error);
            return null;
        }
    }
};
