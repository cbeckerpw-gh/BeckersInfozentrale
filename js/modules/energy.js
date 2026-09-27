/**
 * Energiefluss-Anzeige (PV, Speicher, Netz, Zappi)
 */
const EnergyModule = {
    update(data) {
        if (!data) return;
        
        if (data.pv !== undefined) document.getElementById('val-pv').textContent = `${data.pv.toFixed(1)} kW`;
        if (data.battery !== undefined) document.getElementById('val-battery').textContent = `${data.battery.toFixed(1)} kW`;
        if (data.house !== undefined) document.getElementById('val-house').textContent = `${data.house.toFixed(1)} kW`;
        if (data.grid !== undefined) document.getElementById('val-grid').textContent = `${data.grid.toFixed(1)} kW`;
        if (data.zappi !== undefined) document.getElementById('val-zappi').textContent = `${data.zappi.toFixed(1)} kW`;
    }
};
