/**
 * Aufgabentimer-Modul (timer.js)
 * Verwaltet das dynamische Erstellen, Ausführen und visuelle Darstellen von Timern.
 */

const TimerModule = (function () {
    'use strict';

    // Konfigurations-Mappings für Icons & Bezeichnungen
    const PERSONS = {
        oskar: { name: 'Oskar', icon: '👦' },
        irma: { name: 'Irma', icon: '👧' }
    };

    const TOPICS = {
        zahne: { name: 'Zähneputzen', icon: '🪥' },
        anziehen: { name: 'Anziehen', icon: '👕' },
        aufraumen: { name: 'Aufräumen', icon: '🧸' }
    };

    // Speicher für aktive Timer-Instanzen
    let timers = [];

    // Referenz für den Auto-Close-Timer des Ergebnis-Popups
    let popupAutoCloseTimeout = null;

    /**
     * Initialisiert Event-Listener für Formular & Modal
     */
    function init() {
        setupModalEvents();
        setupFormSelectionEvents();
    }

    /**
     * Bindet Event-Listener für Modals und Formularabsendung
     */
    function setupModalEvents() {
        const btnOpen = document.getElementById('btn-open-timer-modal');
        const btnClose = document.getElementById('btn-close-modal');
        const modal = document.getElementById('timer-modal');
        const form = document.getElementById('timer-form');
        const btnCloseResult = document.getElementById('btn-close-result');
        const resultModal = document.getElementById('result-modal');

        if (btnOpen) btnOpen.addEventListener('click', () => modal.classList.remove('hidden'));
        if (btnClose) btnClose.addEventListener('click', () => modal.classList.add('hidden'));

        // Schließen des Ergebnis-Popups über den Button
        if (btnCloseResult) {
            btnCloseResult.addEventListener('click', hideResultPopup);
        }

        // Schließen des Ergebnis-Popups bei Klick auf den Hintergrund
        if (resultModal) {
            resultModal.addEventListener('click', (e) => {
                if (e.target === resultModal) {
                    hideResultPopup();
                }
            });
        }

        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                createTimersFromForm();
                modal.classList.add('hidden');
            });
        }
    }

    /**
     * Stellt sicher, dass bei Auswahl-Buttons nur jeweils einer pro Gruppe 'active' ist
     */
    function setupFormSelectionEvents() {
        const selectGroups = document.querySelectorAll('.select-group');
        selectGroups.forEach(group => {
            group.addEventListener('click', (e) => {
                if (e.target.classList.contains('btn-select')) {
                    group.querySelectorAll('.btn-select').forEach(b => b.classList.remove('active'));
                    e.target.classList.add('active');
                }
            });
        });
    }

    /**
     * Liest das Erstellungs-Formular aus und generiert die Timer-Karten
     */
    function createTimersFromForm() {
        const personKey = getSelectedValue('group-person') || 'oskar';
        const topicKey = getSelectedValue('group-topic') || 'zahne';
        const durationMin = parseInt(getSelectedValue('group-duration') || '5', 10);
        const dayKey = getSelectedValue('group-day') || 'today';
        const repeatCount = parseInt(getSelectedValue('group-repeat') || '1', 10);

        const todayStr = new Date().toISOString().split('T')[0];

        // Tage ermitteln, in die eingefügt werden soll
        const targetDays = dayKey === 'all' ? ['today', 'tomorrow', 'after-tomorrow'] : [dayKey];

        targetDays.forEach(day => {
            for (let i = 1; i <= repeatCount; i++) {
                const repeatLabel = repeatCount > 1 ? ' (' + i + '/' + repeatCount + ')' : '';
                const timerObj = {
                    id: 'timer-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5),
                    createdDate: todayStr,
                    personKey: personKey,
                    topicKey: topicKey,
                    durationMin: durationMin,
                    durationSec: durationMin * 60,
                    remainingSec: durationMin * 60,
                    repeatLabel: repeatLabel,
                    day: day,
                    status: 'ready', // ready, running, finished, failed
                    intervalId: null
                };
                timers.push(timerObj);
                renderTimerCard(timerObj);
            }
        });
    }

    /**
     * Hilfsfunktion zum Auslesen des aktiven Werts einer Button-Gruppe
     */
    function getSelectedValue(groupId) {
        const activeBtn = document.querySelector('#' + groupId + ' .btn-select.active');
        return activeBtn ? activeBtn.getAttribute('data-value') : null;
    }

    /**
     * Rendert die HTML-Karte für einen einzelnen Timer in die entsprechende Spalte
     */
    function renderTimerCard(timer) {
        const targetList = document.getElementById('list-' + timer.day);
        if (!targetList) return;

        const person = PERSONS[timer.personKey];
        const topic = TOPICS[timer.topicKey];

        const card = document.createElement('div');
        card.className = 'timer-card';
        card.id = timer.id;

        card.innerHTML = 
            '<div class="timer-info">' +
                '<div class="timer-icons">' +
                    '<span>' + person.icon + '</span>' +
                    '<span>' + topic.icon + '</span>' +
                '</div>' +
                '<div class="timer-details">' +
                    '<span class="timer-title">' + person.name + ' - ' + topic.name + timer.repeatLabel + '</span>' +
                    '<span class="timer-subtext" id="time-text-' + timer.id + '">' + Math.ceil(timer.remainingSec / 60) + ' Min</span>' +
                '</div>' +
            '</div>' +
            '<div class="analog-clock-container" id="clock-' + timer.id + '">' +
                generateClockSVG(timer.remainingSec, false) +
            '</div>' +
            '<button class="btn btn-success" id="btn-action-' + timer.id + '">Start</button>';

        targetList.appendChild(card);

        // Action-Button Event-Listener
        const actionBtn = card.querySelector('#btn-action-' + timer.id);
        actionBtn.addEventListener('click', () => handleTimerAction(timer.id));
    }

    /**
     * Steuert den Ablauf (Start -> Fertig) des Timers
     */
    function handleTimerAction(timerId) {
        const timer = timers.find(t => t.id === timerId);
        if (!timer || timer.status === 'failed') return;

        const actionBtn = document.getElementById('btn-action-' + timerId);

        if (timer.status === 'ready') {
            // Timer starten
            timer.status = 'running';
            actionBtn.textContent = 'Fertig';
            actionBtn.className = 'btn btn-warning';
            
            startCountdown(timer);
        } else if (timer.status === 'running') {
            // Vorzeitig fertig gemeldet -> Erfolg!
            clearInterval(timer.intervalId);
            timer.status = 'finished';

            const person = PERSONS[timer.personKey];
            const topic = TOPICS[timer.topicKey];

            showResultPopup(
                '🚀', 
                person.icon + ' Klasse ' + person.name + ', gut gemacht!', 
                'Du hast die Aufgabe "' + topic.name + '" rechtzeitig geschafft!',
                'Super!'
            );

            removeTimerCard(timerId);
        }
    }

    /**
     * Führt den Sekunden-Countdown aus und aktualisiert die Analoguhr
     */
    function startCountdown(timer) {
        timer.intervalId = setInterval(() => {
            timer.remainingSec--;

            updateClockSVG(timer.id, timer.remainingSec);

            if (timer.remainingSec <= 0) {
                // Zeit abgelaufen ohne Fertigmeldung -> Nicht geschafft
                clearInterval(timer.intervalId);
                timer.status = 'failed';
                
                const person = PERSONS[timer.personKey];
                const topic = TOPICS[timer.topicKey];

                showResultPopup(
                    '❌', 
                    'Zeit abgelaufen!', 
                    person.name + ' hat die Aufgabe "' + topic.name + '" leider nicht rechtzeitig geschafft.',
                    'OK'
                );
                markTimerAsFailed(timer.id);
            }
        }, 1000);
    }

    /**
     * Erzeugt das SVG der Analoguhr.
     */
    function generateClockSVG(remainingSec, isFailed) {
        if (isFailed) {
            return '<svg class="analog-clock-svg" viewBox="0 0 50 50">' +
                    '<circle class="clock-face" cx="25" cy="25" r="20" />' +
                    '<path d="M 15 15 L 35 35 M 35 15 L 15 35" stroke="#d32f2f" stroke-width="4" stroke-linecap="round" />' +
                '</svg>';
        }

        const remainingMin = remainingSec / 60;
        const angle = Math.min(360, Math.max(0, remainingMin * 6));

        const radians = (angle - 90) * (Math.PI / 180);
        const x = 25 + 20 * Math.cos(radians);
        const y = 25 + 20 * Math.sin(radians);
        const largeArc = angle > 180 ? 1 : 0;

        let pathData = '';
        if (angle >= 359.9) {
            pathData = 'M 25 5 A 20 20 0 1 1 24.99 5 Z';
        } else if (angle > 0) {
            pathData = 'M 25 25 L 25 5 A 20 20 0 ' + largeArc + ' 1 ' + x + ' ' + y + ' Z';
        }

        return '<svg class="analog-clock-svg" viewBox="0 0 50 50">' +
                '<circle class="clock-face" cx="25" cy="25" r="20" />' +
                '<path class="clock-segment" d="' + pathData + '" />' +
                '<circle class="clock-center" cx="25" cy="25" r="2" />' +
            '</svg>';
    }

    /**
     * Aktualisiert die Uhr auf der Karte im Sekundentakt
     */
    function updateClockSVG(timerId, remainingSec) {
        const clockContainer = document.getElementById('clock-' + timerId);
        const timeText = document.getElementById('time-text-' + timerId);
        
        if (clockContainer) {
            clockContainer.innerHTML = generateClockSVG(remainingSec, false);
        }

        if (timeText) {
            const min = Math.floor(remainingSec / 60);
            const sec = remainingSec % 60;
            timeText.textContent = min + ':' + (sec < 10 ? '0' : '') + sec + ' Min';
        }
    }

    /**
     * Wandelt die Timerkarte bei Ablauf visuell in eine nicht bestandene Karte um
     */
    function markTimerAsFailed(timerId) {
        const card = document.getElementById(timerId);
        const actionBtn = document.getElementById('btn-action-' + timerId);
        const clockContainer = document.getElementById('clock-' + timerId);
        const timeText = document.getElementById('time-text-' + timerId);

        if (card) {
            card.classList.add('failed');
        }

        if (actionBtn) {
            actionBtn.textContent = 'Ablauf';
            actionBtn.className = 'btn btn-failed';
            actionBtn.disabled = true;
        }

        if (clockContainer) {
            clockContainer.innerHTML = generateClockSVG(0, true);
        }

        if (timeText) {
            timeText.textContent = 'Abgelaufen';
        }
    }

    /**
     * Öffnet das Ergebnis-Popup mit dynamischem Button-Text & Auto-Close nach 60s
     */
    function showResultPopup(icon, title, text, btnText) {
        // Falls bereits ein Auto-Close-Timer läuft, löschen wir diesen
        if (popupAutoCloseTimeout) {
            clearTimeout(popupAutoCloseTimeout);
            popupAutoCloseTimeout = null;
        }

        document.getElementById('result-icon').textContent = icon;
        document.getElementById('result-title').textContent = title;
        document.getElementById('result-text').textContent = text;
        
        const btnCloseResult = document.getElementById('btn-close-result');
        if (btnCloseResult) {
            btnCloseResult.textContent = btnText || 'OK';
        }

        const resultModal = document.getElementById('result-modal');
        if (resultModal) {
            resultModal.classList.remove('hidden');
        }

        // Auto-Close nach 60 Sekunden (60000 ms) einrichten
        popupAutoCloseTimeout = setTimeout(() => {
            hideResultPopup();
        }, 60000);
    }

    /**
     * Schließt das Ergebnis-Popup sauber und storniert den Timer
     */
    function hideResultPopup() {
        if (popupAutoCloseTimeout) {
            clearTimeout(popupAutoCloseTimeout);
            popupAutoCloseTimeout = null;
        }

        const resultModal = document.getElementById('result-modal');
        if (resultModal) {
            resultModal.classList.add('hidden');
        }
    }

    /**
     * Entfernt eine Timerkarte nach erfolgreicher Fertigstellung aus dem DOM
     */
    function removeTimerCard(timerId) {
        const card = document.getElementById(timerId);
        if (card) card.remove();
        timers = timers.filter(t => t.id !== timerId);
    }

    return {
        init: init
    };
})();

// Modul nach Laden des DOM initialisieren
document.addEventListener('DOMContentLoaded', () => {
    TimerModule.init();
});
