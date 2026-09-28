# Kindgerechter Familienplaner & Energieflussanzeige

Ein serverloses, hochsicheres Dashboard optimiert für GitHub Pages, ausgelegt für Wandschirme (iPad 10" Querformat) und Smartphones.

## Features
- **3-Spalten-Planer**: Heute, Morgen, Übermorgen.
- **Namens- & Rechte-Parsing**: Unterscheidung nach Papa, Mama, Oskar, Irma sowie Kombi-Karten (z.B. "Oskar + Irma - ...").
- **Visual Time-Timer**: Kindgerechte analoge Uhr mit 60-Minuten-Skala, Tortengrafik, Raketen-Belohnungs-Animation 🎉.
- **Energiefluss-Anzeige**: Live-Messwerte für PV, Speicher, Hausverbrauch, Netzbezug/Einspeisung mit dynamischen roten/grünen Richtungs-Pfeilen.
- **Shelly Integration**: Statusanzeige für Kinderzimmer-Beleuchtung.

## Installation & Setup
1. Repository klonen und Struktur auf GitHub Pages aufrufen.
2. In Pipedream einen Endpoint einrichten und die generierte URL in den Einstellungen der Web-App unter `⚙️` eintragen.
3. Die Seite auf dem iPad im Kiosk-Modus / Safari zum Home-Bildschirm hinzufügen.

## Module

### 1. Aufgabentimer (`timer.js` / `timer.css`)
- **Funktion**: Erzeugt dynamisch interaktive Timer für Aufgaben im Familienalltag (Zähneputzen, Anziehen, Aufräumen).
- **Layout**: 3-Spalten-Uebersicht (*Heute*, *Morgen*, *Übermorgen*).
- **Visualisierung**: Restzeitanzeige in Form einer visuellen SVG-Analoguhr mit schrumpfendem rotem Kreissegment.
- **Interaktion**: 
  - Status *Bereit* -> Grüner Start-Button.
  - Status *Laufend* -> Oranger Fertig-Button.
  - Vorzeitige Abgabe -> Erfolgs-Popup mit **🚀 Raketen-Icon**.
  - Zeitablauf ohne Abgabe -> Info-Popup mit **❌ rotem Kreuz**.
- **Erstellung**: Einstellungen über Modal-Dialog für Person (Oskar, Irma), Thema, Dauer, Zieltag und Wiederholungsanzahl.

📌 Versionsstand & Branching
v1.0 (Baseline - Stabil): Core-Timer-Funktionalität (js/timer.js), Modals, UI-Erstellung, Popups und lokale Zeitverwaltung. Dieser Stand ist eingefroren und bildet die Grundlage.

v1.1-dev (In Entwicklung):

Timestamp-basierte Countdown-Steuerung (Date.now()) für exakte Fortführung nach Tab-Wechseln, Hintergrunding und Display-Sperren.

Pipedream-Schnittstelle zur geräteübergreifenden Synchronisation (iPad, Smartphone, PC).

🛠️ Pipedream Backend Code & Setup (Geplant für 01.10.2026)
Um die geräteübergreifende Synchronisation auf GitHub Pages ohne eigenen Server zu ermöglichen, nutzt das Dashboard einen Pipedream HTTP Workflow mit einem Data Store.

1. Pipedream Workflow Schritte
Erstelle in Pipedream einen neuen HTTP / Webhook Trigger.

Füge einen Data Store mit dem Namen timer_store hinzu.

Füge einen Node.js Code Step ein und füge den folgenden Code ein:

Node.js Code für den Pipedream-Step:
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
      const activeTimer = await dataStore.get("test-timer-1");

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

🚀 Inbetriebnahme der Pipedream-Sync in js/test-timer.js
Kopiere die Pipedream Webhook-URL aus deinem erstellten Workflow.

Öffne js/test-timer.js.

Trage die URL in PIPEDREAM_WEBHOOK_URL ein.

Entferne die Kommentarzeichen (/* ... */) um die Pipedream-Funktionen und den Intervall-Aufruf startPipedreamSync().
