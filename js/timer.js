/**
 * Hauptmodul für Aufgabentimer
 * - Standby-feste Zeiterfassung via Date.now() / endTime
 * - Sauberes DOM-Rendering ohne String-Escaping-Probleme
 * - Exakte v1.0 CSS-Klassen und Layout-Struktur
 */
(function () {
    'use strict';

    let timers = [];
    let activeIntervals = {};
    const STORAGE_KEY = 'family_info_center_timers';

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

        setupSelectGroups();

        // Beim Entsperren des Bildschirms oder Tab-Wechsel Zeiten anhand des Zeitstempels abgleichen
        document.addEventListener('visibilitychange', function () {
            if (document.visibilityState === 'visible') {
                updateAllTimersUI();
            }
        });
    }

    function setupSelectGroups() {
        const selectGroups = document.querySelectorAll('.select-group');
        selectGroups.forEach(function (group) {
            const buttons = group.querySelectorAll('.btn-select');
            buttons.forEach(function (btn) {
                btn.addEventListener('click', function () {
                    buttons.forEach(function (b) { b.classList.remove('active'); });
                    this.classList.add('active');
                });
            });
        });
    }

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
            remainingSeconds: durationMinutes * 60,
            dayTarget: dayTarget,
            status: 'idle',
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

    // Timer Steuerung
    window.startTimer = function (id) {
        const timer = timers.find(function (t) { return t.id === id; });
        if (!timer) return;

        if (timer.status !== 'running') {
            const secToRun = (timer.remainingSeconds !== undefined && timer.remainingSeconds > 0) 
                ? timer.remainingSeconds 
                : timer.durationSeconds;
            
            timer.remainingSeconds = secToRun;
            timer.endTime = Date.now() + (secToRun * 1000);
            timer.status = 'running';
            saveTimersToStorage();

            runTimerInterval(timer);
            renderAllTimers();
        }
    };

    window.pauseTimer = function (id) {
        const timer = timers.find(function (t) { return t.id === id; });
        if (!timer || timer.status !== 'running') return;

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

    window.finishTimerDirectly = function (id) {
        const timer = timers.find(function (t) { return t.id === id; });
        if (!timer) return;

        if (activeIntervals[id]) {
            clearInterval(activeIntervals[id]);
            delete activeIntervals[id];
        }

        handleTimerFinished(timer);
    };

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

        timer.remainingSeconds = remainingSec;

        const displayEl = document.getElementById('display-' + timer.id);
        if (displayEl) {
            const min = Math.floor(remainingSec / 60);
            const sec = remainingSec % 60;
            const minStr = min < 10 ? '0' + min : '' + min;
            const secStr = sec < 10 ? '0' + sec : '' + sec;
            displayEl.textContent = minStr + ':' + secStr;
        }

        return remainingSec <= 0;
    }

    function updateAllTimersUI() {
        timers.forEach(function (timer) {
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

        // Erledigte Aufgabe aus der aktiven Liste entfernen, damit sie verschwindet
        timers = timers.filter(function (t) { return t.id !== timer.id; });

        saveTimersToStorage();
        renderAllTimers();
        showResultModal(timer);
    }

    function showResultModal(timer) {
        const resultModal = document.getElementById('result-modal');
        const resultTitle = document.getElementById('result-title');
        const resultText = document.getElementById('result-text');

        if (!resultModal) return;

        const personName = timer.person === 'oskar' ? 'Oskar' : 'Irma';

        if (resultTitle) resultTitle.textContent = '🎉 Super gemacht!';
        if (resultText) resultText.textContent = personName + ' hat die Aufgabe erledigt!';

        resultModal.classList.remove('hidden');
    }

    function startGlobalBackgroundSync() {
        timers.forEach(function (timer) {
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

    // Rendering-Logik für Spalten
    function renderAllTimers() {
        const listToday = document.getElementById('list-today');
        const listTomorrow = document.getElementById('list-tomorrow');
        const listAfterTomorrow = document.getElementById('list-after-tomorrow');

        if (listToday) listToday.innerHTML = '';
        if (listTomorrow) listTomorrow.innerHTML = '';
        if (listAfterTomorrow) listAfterTomorrow.innerHTML = '';

        // Nur unfertige Timer anzeigen
        const activeTimers = timers.filter(function (t) { return t.status !== 'finished'; });

        activeTimers.forEach(function (timer) {
            const cardElement = createTimerCardElement(timer);

            if (timer.dayTarget === 'today' && listToday) {
                listToday.appendChild(cardElement);
            } else if (timer.dayTarget === 'tomorrow' && listTomorrow) {
                listTomorrow.appendChild(cardElement);
            } else if (timer.dayTarget === 'after-tomorrow' && listAfterTomorrow) {
                listAfterTomorrow.appendChild(cardElement);
            } else if (timer.dayTarget === 'all') {
                if (listToday) listToday.appendChild(cardElement.cloneNode(true));
                if (listTomorrow) listTomorrow.appendChild(cardElement.cloneNode(true));
                if (listAfterTomorrow) listAfterTomorrow.appendChild(cardElement.cloneNode(true));
            }
        });
    }

    // Erzeugt die Card-Struktur über DOM-Knoten (verhindert Chat-Maskierungsfehler)
    function createTimerCardElement(timer) {
        const card = document.createElement('div');
        card.className = 'timer-card status-' + timer.status;
        card.id = 'card-' + timer.id;

        const personName = timer.person === 'oskar' ? 'Oskar' : 'Irma';
        const personIcon = timer.person === 'oskar' ? '👦' : '👧';

        let topicName = 'Zähneputzen';
        let topicIcon = '🪥';
        if (timer.topic === 'anziehen') {
            topicName = 'Anziehen';
            topicIcon = '👕';
        } else if (timer.topic === 'aufraumen') {
            topicName = 'Aufräumen';
            topicIcon = '🧸';
        }

        let displayTime = '00:00';
        if (timer.status === 'running' && timer.endTime) {
            const remainingSec = Math.max(0, Math.round((timer.endTime - Date.now()) / 1000));
            const min = Math.floor(remainingSec / 60);
            const sec = remainingSec % 60;
            displayTime = (min < 10 ? '0' + min : min) + ':' + (sec < 10 ? '0' + sec : sec);
        } else {
            const secToUse = (timer.remainingSeconds !== undefined) ? timer.remainingSeconds : timer.durationSeconds;
            const min = Math.floor(secToUse / 60);
            const sec = secToUse % 60;
            displayTime = (min < 10 ? '0' + min : min) + ':' + (sec < 10 ? '0' + sec : sec);
        }

        // 1. Info Block
        const infoDiv = document.createElement('div');
        infoDiv.className = 'timer-info';

        const titleDiv = document.createElement('div');
        titleDiv.className = 'timer-title';
        titleDiv.textContent = personIcon + ' ' + personName + ' ' + topicIcon;

        const subtitleDiv = document.createElement('div');
        subtitleDiv.className = 'timer-subtitle';
        subtitleDiv.textContent = topicName;

        infoDiv.appendChild(titleDiv);
        infoDiv.appendChild(subtitleDiv);

        // 2. Display Block
        const displayDiv = document.createElement('div');
        displayDiv.className = 'timer-display';
        displayDiv.id = 'display-' + timer.id;
        displayDiv.textContent = displayTime;

        // 3. Actions Block
        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'timer-actions';

        const isRunning = timer.status === 'running';

        const mainBtn = document.createElement('button');
        mainBtn.className = 'btn btn-sm ' + (isRunning ? 'btn-warning' : 'btn-success');
        mainBtn.textContent = isRunning ? '⏸ Pause' : '▶ Start';
        mainBtn.setAttribute('onclick', (isRunning ? 'pauseTimer' : 'startTimer') + '("' + timer.id + '")');

        const finishBtn = document.createElement('button');
        finishBtn.className = 'btn btn-sm btn-outline';
        finishBtn.textContent = '✅ Erledigt';
        finishBtn.setAttribute('onclick', 'finishTimerDirectly("' + timer.id + '")');

        actionsDiv.appendChild(mainBtn);
        actionsDiv.appendChild(finishBtn);

        // Zusammenbauen
        card.appendChild(infoDiv);
        card.appendChild(displayDiv);
        card.appendChild(actionsDiv);

        return card;
    }

    function saveTimersToStorage() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(timers));
    }

    function loadTimersFromStorage() {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            try {
                timers = JSON.parse(stored);
            } catch (e) {
                timers = [];
            }
        }
    }
})();
