/**
 * Hauptmodul für Aufgabentimer (v1.1)
 * Nutzt Timestamp-basierte Berechnung (Date.now()) für exakte Hintergrund- und Standby-Zeiten.
 */
(function () {
    'use strict';

    let timers = [];
    let activeIntervals = {};
    const STORAGE_KEY = 'family_info_center_timers';

    // Initialisierung beim Laden der Seite
    function initTimerModule() {
        loadTimersFromStorage();
        bindUIEvents();
        renderAllTimers();
        startGlobalBackgroundSync();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initTimerModule);
    } else {
        initTimerModule();
    }

    // Event-Listener für UI und Tab-Sichtbarkeit
    function bindUIEvents() {
        const btnOpenModal = document.getElementById('btn-open-timer-modal');
        const btnCloseModal = document.getElementById('btn-close-modal');
        const timerForm = document.getElementById('timer-form');
        const btnCloseResult = document.getElementById('btn-close-result');

        if (btnOpenModal) btnOpenModal.addEventListener('click', openModal);
        if (btnCloseModal) btnCloseModal.addEventListener('click', closeModal);
        if (btnCloseResult) btnCloseResult.addEventListener('click', closeResultModal);

        if (timerForm) {
            timerForm.addEventListener('submit', handleFormSubmit);
        }

        // Toggle-Buttons in den Formular-Auswahlgruppen
        setupSelectGroups();

        // Sofortige Aktualisierung beim Entsperren oder Tab-Wechsel
        document.addEventListener('visibilitychange', function () {
            if (document.visibilityState === 'visible') {
                updateAllTimersUI();
            }
        });
    }

    function setupSelectGroups() {
        const selectGroups = document.querySelectorAll('.select-group');
        selectGroups.forEach(group => {
            const buttons = group.querySelectorAll('.btn-select');
            buttons.forEach(btn => {
                btn.addEventListener('click', function () {
                    buttons.forEach(b => b.classList.remove('active'));
                    this.classList.add('active');
                });
            });
        });
    }

    // Modal-Steuerung
    function openModal() {
        const modal = document.getElementById('timer-modal');
        if (modal) modal.classList.remove('hidden');
    }

    function closeModal() {
        const modal = document.getElementById('timer-modal');
        if (modal) modal.classList.add('hidden');
    }

    function closeResultModal() {
        const modal = document.getElementById('result-modal');
        if (modal) modal.classList.add('hidden');
    }

    // Timer aus Formular erstellen
    function handleFormSubmit(e) {
        e.preventDefault();

        const person = getActiveSelectValue('group-person') || 'oskar';
        const topic = getActiveSelectValue('group-topic') || 'zahne';
        const durationMinutes = parseInt(getActiveSelectValue('group-duration') || '5', 10);
        const dayTarget = getActiveSelectValue('group-day') || 'today';

        const newTimer = {
            id: 'timer-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
            person: person,
            topic: topic,
            durationMinutes: durationMinutes,
            durationSeconds: durationMinutes * 60,
            dayTarget: dayTarget,
            status: 'idle', // 'idle', 'running', 'paused', 'finished'
            endTime: null
        };

        timers.push(newTimer);
        saveTimersToStorage();
        renderAllTimers();
        closeModal();
    }

    function getActiveSelectValue(groupId) {
        const group = document.getElementById(groupId);
        if (!group) return null;
        const activeBtn = group.querySelector('.btn-select.active');
        return activeBtn ? activeBtn.getAttribute('data-value') : null;
    }

    // Timer Steuerung: Start / Pause / Reset
    window.startTimer = function (id) {
        const timer = timers.find(t => t.id === id);
        if (!timer) return;

        if (timer.status !== 'running') {
            // Endzeitpunkt basierend auf verbleibender Dauer festlegen
            const remainingSec = timer.remainingSeconds !== undefined ? timer.remainingSeconds : timer.durationSeconds;
            timer.endTime = Date.now() + (remainingSec * 1000);
            timer.status = 'running';
            saveTimersToStorage();

            runTimerInterval(timer);
        }
    };

    window.pauseTimer = function (id) {
        const timer = timers.find(t => t.id === id);
        if (!timer || timer.status !== 'running') return;

        // Verbleibende Sekunden beim Pausieren sichern
        const now = Date.now();
        const remainingMs = timer.endTime - now;
        timer.remainingSeconds = Math.max(0, Math.round(remainingMs / 1000));
        timer.status = 'paused';
        timer.endTime = null;

        if (activeIntervals[id]) {
            clearInterval(activeIntervals[id]);
            delete activeIntervals[id];
        }

        saveTimersToStorage();
        renderAllTimers();
    };

    window.resetTimer = function (id) {
        const timer = timers.find(t => t.id === id);
        if (!timer) return;

        if (activeIntervals[id]) {
            clearInterval(activeIntervals[id]);
            delete activeIntervals[id];
        }

        timer.status = 'idle';
        timer.endTime = null;
        timer.remainingSeconds = timer.durationSeconds;

        saveTimersToStorage();
        renderAllTimers();
    };

    // Intervall-Ausführung pro laufendem Timer
    function runTimerInterval(timer) {
        if (activeIntervals[timer.id]) {
            clearInterval(activeIntervals[timer.id]);
        }

        activeIntervals[timer.id] = setInterval(function () {
            const isFinished = updateSingleTimerUI(timer);
            if (isFinished) {
                clearInterval(activeIntervals[timer.id]);
                delete activeIntervals[timer.id];
                handleTimerFinished(timer);
            }
        }, 1000);

        updateSingleTimerUI(timer);
    }

    function updateSingleTimerUI(timer) {
        if (timer.status !== 'running' || !timer.endTime) return false;

        const now = Date.now();
        const remainingMs = timer.endTime - now;
        const remainingSec = Math.max(0, Math.round(remainingMs / 1000));

        const displayEl = document.getElementById('display-' + timer.id);
        if (displayEl) {
            const min = Math.floor(remainingSec / 60);
            const sec = remainingSec % 60;
            displayEl.textContent = (min < 10 ? '0' : '') + min + ':' + (sec < 10 ? '0' : '') + sec;
        }

        if (remainingSec <= 0) {
            return true; // Timer ist abgelaufen
        }

        return false;
    }

    function updateAllTimersUI() {
        timers.forEach(timer => {
            if (timer.status === 'running') {
                const isFinished = updateSingleTimerUI(timer);
                if (isFinished) {
                    if (activeIntervals[timer.id]) {
                        clearInterval(activeIntervals[timer.id]);
                        delete activeIntervals[timer.id];
                    }
                    handleTimerFinished(timer);
                }
            }
        });
    }

    function handleTimerFinished(timer) {
        timer.status = 'finished';
        timer.endTime = null;
        timer.remainingSeconds = 0;
        saveTimersToStorage();
        renderAllTimers();

        // Popup / Result Modal anzeigen
        showResultModal(timer);
    }

    function showResultModal(timer) {
        const resultModal = document.getElementById('result-modal');
        const resultTitle = document.getElementById('result-title');
        const resultText = document.getElementById('result-text');
        const resultIcon = document.getElementById('result-icon');

        if (!resultModal) return;

        const personName = timer.person === 'oskar' ? 'Oskar' : 'Irma';
        
        if (resultTitle) resultTitle.textContent = '🎉 Super gemacht!';
        if (resultText) resultText.textContent = personName + ' hat die Aufgabe zeitnah erledigt!';
        if (resultIcon) resultIcon.textContent = '⏱️';

        resultModal.classList.remove('hidden');
    }

    // Automatischer Hintergrund-Sync / Wiederherstellung beim Laden
    function startGlobalBackgroundSync() {
        timers.forEach(timer => {
            if (timer.status === 'running' && timer.endTime) {
                const now = Date.now();
                if (now >= timer.endTime) {
                    handleTimerFinished(timer);
                } else {
                    runTimerInterval(timer);
                }
            }
        });
    }

    // Rendering-Logik für die 3 Spalten (Heute, Morgen, Übermorgen)
    function renderAllTimers() {
        const listToday = document.getElementById('list-today');
        const listTomorrow = document.getElementById('list-tomorrow');
        const listAfterTomorrow = document.getElementById('list-after-tomorrow');

        if (listToday) listToday.innerHTML = '';
        if (listTomorrow) listTomorrow.innerHTML = '';
        if (listAfterTomorrow) listAfterTomorrow.innerHTML = '';

        timers.forEach(timer => {
            const cardHTML = createTimerCardHTML(timer);

            if (timer.dayTarget === 'today' && listToday) {
                listToday.insertAdjacentHTML('beforeend', cardHTML);
            } else if (timer.dayTarget === 'tomorrow' && listTomorrow) {
                listTomorrow.insertAdjacentHTML('beforeend', cardHTML);
            } else if (timer.dayTarget === 'after-tomorrow' && listAfterTomorrow) {
                listAfterTomorrow.insertAdjacentHTML('beforeend', cardHTML);
            } else if (timer.dayTarget === 'all') {
                if (listToday) listToday.insertAdjacentHTML('beforeend', cardHTML);
                if (listTomorrow) listTomorrow.insertAdjacentHTML('beforeend', cardHTML);
                if (listAfterTomorrow) listAfterTomorrow.insertAdjacentHTML('beforeend', cardHTML);
            }
        });
    }

    function createTimerCardHTML(timer) {
        const personIcon = timer.person === 'oskar' ? '👦 Oskar' : '👧 Irma';
        let topicIcon = '🪥 Zähneputzen';
        if (timer.topic === 'anziehen') topicIcon = '👕 Anziehen';
        if (timer.topic === 'aufraumen') topicIcon = '🧸 Aufräumen';

        let displayTime = '00:00';
        if (timer.status === 'running' && timer.endTime) {
            const remainingSec = Math.max(0, Math.round((timer.endTime - Date.now()) / 1000));
            const min = Math.floor(remainingSec / 60);
            const sec = remainingSec % 60;
            displayTime = (min < 10 ? '0' : '') + min + ':' + (sec < 10 ? '0' : '') + sec;
        } else {
            const secToUse = timer.remainingSeconds !== undefined ? timer.remainingSeconds : timer.durationSeconds;
            const min = Math.floor(secToUse / 60);
            const sec = secToUse % 60;
            displayTime = (min < 10 ? '0' : '') + min + ':' + (sec < 10 ? '0' : '') + sec;
        }

        return [
            '
