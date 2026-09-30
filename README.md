# Kindgerechter Familienplaner & Energieflussanzeige

Ein serverloses, hochsicheres Dashboard optimiert für GitHub Pages, ausgelegt für Wandschirme (iPad 10" Querformat) und Smartphones.

## Features
- **3-Spalten-Planer**: Heute, Morgen, Übermorgen.
- **Namens- & Rechte-Parsing**: Unterscheidung nach Papa, Mama, Oskar, Irma sowie Kombi-Karten (z.B. "Oskar + Irma - ...").
- **Visual Time-Timer**: 
  - Kindgerechte analoge Uhr mit 60-Minuten-Skala und schrumpfender SVG-Tortengrafik.
  - Auto-Close der Ergebnis-Popups nach **30 Sekunden** oder per Klick auf den abgedunkelten Hintergrund.
  - **Override-Logik**: Läuft eine neuere Meldung auf, schließt sich das alte Popup sofort und die neueste Meldung startet mit einem frischen 30-Sekunden-Timer.
  - Kindgerechte Visualisierung: Fettgedruckte Namen im Popup (`**Oskar**`) und rotes Kreuz (**`❌`**) auf Buttons für abgelaufene/nicht geschaffte Aufgaben.
  - Abgelaufene Aufgaben bleiben den Tag über visuell ausgegraut in der Übersicht erhalten.
- **Energiefluss-Anzeige**: Live-Messwerte für PV, Speicher, Hausverbrauch, Netzbezug/Einspeisung mit dynamischen roten/grünen Richtungs-Pfeilen.
- **Shelly Integration**: Statusanzeige für Kinderzimmer-Beleuchtung.

## Installation & Setup
1. Repository klonen und Struktur auf GitHub Pages aufrufen.
2. In Pipedream einen Endpoint einrichten und die generierte URL in den Einstellungen der Web-App unter `⚙️` eintragen.
3. Die Seite auf dem iPad im Kiosk-Modus / Safari zum Home-Bildschirm hinzufügen.

## Module

### 1. Aufgabentimer (`timer.js` / `timer.css`)
- **Funktion**: Erzeugt dynamisch interaktive Timer für Aufgaben im Familienalltag (Zähneputzen, Anziehen, Aufräumen).
- **Layout**: 3-Spalten-Übersicht (*Heute*, *Morgen*, *Übermorgen*).
- **Visualisierung**: Restzeitanzeige in Form einer visuellen SVG-Analoguhr mit schrumpfendem rotem Kreissegment.
- **Interaktion**: 
  - Status *Bereit* -> Grüner Start-Button (`▶ Start`).
  - Status *Laufend* -> Oranger Fertig-Button (`🟧 Fertig`).
  - Status *Nicht geschafft* -> Deaktivierter grauer Button mit rotem Kreuz (`❌`).
  - Vorzeitige Abgabe -> Erfolgs-Popup mit Konfetti („🎉 Super gemacht!“).
  - Zeitablauf ohne Abgabe -> Info-Popup („❌ Nicht geschafft“).
  - Popups schließen automatisch nach 30 Sekunden oder bei Klick auf den Backdrop.
- **Erstellung**: Einstellungen über Modal-Dialog für Person (Oskar, Irma), Thema, Dauer, Zieltag und Wiederholungsanzahl.

## 📌 Versionsstand & Branching

### v1.2 (Produktiv - Aktueller Stand)
- **Hintergrund-Synchronisation**: Timestamp-basierte Countdown-Steuerung (`Date.now()`) für exakte Fortführung nach Tab-Wechseln, Hintergrunding und Display-Sperren.
- **Ergebnis-Modal Upgrades**:
  - Auto-Close nach 30 Sekunden.
  - Override-Logik (neueste Meldung gewinnt und setzt Timer zurück).
  - Backdrop-Click-Close.
  - Fettgedruckte Namen (`**`) im Popup-Text.
- **Failed-State & Cleanup**:
  - Abgelaufene Aufgaben verbleiben ausgegraut in der Tagesliste.
  - Button-Anzeige bei abgelaufenen Aufgaben auf kindgerechtes `❌` umgestellt.
  - Test-UI (`test-timer.js` und Footer-HTML) vollständig aus dem Produktivcode aufgeräumt.

### v1.0 / v1.1 (Historie)
- Baseline-Timer-Funktionalität, Modals, UI-Erstellung, Popups und initiale Timestamp-Steuerung.

## 🛠️ Pipedream Backend Code & Setup (Backend-Sync)
Um die geräteübergreifende Synchronisation auf GitHub Pages ohne eigenen Server zu ermöglichen, nutzt das Dashboard einen Pipedream HTTP Workflow mit einem Data Store.

### 1. Pipedream Workflow Schritte
1. Erstelle in Pipedream einen neuen HTTP / Webhook Trigger.
2. Füge einen Data Store mit dem Namen `timer_store` hinzu.
3. Füge einen Node.js Code Step mit folgendem Code ein:

```javascript
import { axios } from "@pipedream/platform";

export default defineComponent({
  async run({ steps, $ }) {
    const method = steps.trigger.event.method;
    const body = steps.trigger.event.body;

    // Data Store "timer_store" anbinden
    const dataStore = $.data.el.get("timer_store");

    // 1. POST-Anfrage: Timer-Daten vom Client speichern / aktualisieren
    if (method === "POST") {
      if (body && body.id) {
        // Timer im Data Store ablegen
        await dataStore.set(body.id, {
          id: body.id,
          endTime: body.endTime || null,
          status: body.status || "idle",
          updatedAt: Date.now()
        });

        return await $.respond({
          status: 200,
          headers: { "Content-Type": "application/json" },
          body: { message: "Timer erfolgreich in Pipedream gespeichert", data: body }
        });
      }
    }

    // 2. GET-Anfrage: Aktuellen Timer-Status für Clients abrufen
    if (method === "GET") {
      const activeTimer = await dataStore.get("timer-data");

      return await $.respond({
        status: 200,
        headers: { "Content-Type": "application/json" },
        body: activeTimer || { status: "none" }
      });
    }

    // Standard-Antwort für andere HTTP-Methoden
    return await $.respond({
      status: 400,
      body: { error: "Ungültige Anfrage" }
    });
  },
});
