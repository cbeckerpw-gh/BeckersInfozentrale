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
        if (btnCloseResult) btnCloseResult.addEventListener('click', () => resultModal.classList.add('hidden'));

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

        // Tage ermitteln, in die eingefügt werden soll
        const targetDays = dayKey === 'all' ? ['today', 'tomorrow', 'after-tomorrow'] : [dayKey];

        targetDays.forEach(day => {
            for (let i = 1; i <= repeatCount; i++) {
                const repeatLabel = repeatCount > 1 ? ' (' + i + '/' + repeatCount + ')' : '';
                const timerObj = {
                    id: 'timer-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5),
                    personKey,
                    topicKey,
                    durationMin,
                    durationSec: durationMin * 60,
                    remainingSec: durationMin * 60,
                    repeatLabel,
                    day,
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
            '
