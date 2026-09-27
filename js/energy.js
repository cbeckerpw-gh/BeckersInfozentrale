/**
 * MODULE_ENERGY_SHELLY: Verarbeitet Messwerte und setzt Farb- und Pfeil-Status
 */

function updateEnergyUI(data) {
    // PV Erzeugung
    document.getElementById('val-pv').innerText = data.pv_kw.toFixed(1);

    // Netzbezug / Einspeisung (Positiv = Einspeisung, Negativ = Bezug)
    const gridVal = data.grid_kw;
    const gridElem = document.getElementById('arrow-grid');
    document.getElementById('val-grid').innerText = Math.abs(gridVal).toFixed(1);

    if (gridVal >= 0) {
        gridElem.className = 'arrow arrow-green';
        gridElem.innerText = '➡️'; // Einspeisung ins Netz
    } else {
        gridElem.className = 'arrow arrow-red';
        gridElem.innerText = '⬅️'; // Bezug aus Netz
    }

    // Hausverbrauch
    document.getElementById('val-house').innerText = data.house_kw.toFixed(1);

    // Shelly Status
    const shellyBadge = document.getElementById('shelly-status');
    if (data.shelly_oskar_light) {
        shellyBadge.className = 'shelly-badge badge-on';
        shellyBadge.innerText = 'AN';
    } else {
        shellyBadge.className = 'shelly-badge badge-off';
        shellyBadge.innerText = 'AUS';
    }
}
