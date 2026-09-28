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
