/**
 * Hauptmodul für Aufgabentimer (v1.0 mit rot eingefärbter visueller Uhr & Standby-Fix)
 */
(function () {
    'use strict';

    let timers = [];
    let activeIntervals = {};
    const STORAGE_KEY = 'family_info_center_timers';
    const MAX_CLOCK_MINUTES = 60; // Voller Kreis = 60 Minuten

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

        const durationSec = durationMinutes * 60;

        const newTimer = {
            id: 'timer-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
            person: person,
            topic: topic,
            durationMinutes: durationMinutes,
            durationSeconds: durationSec,
            remainingSeconds: durationSec,
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

        // Textzeit aktualisieren
        const displayEl = document.getElementById('display-' + timer.id);
        if (displayEl) {
            const min = Math.floor(remainingSec / 60);
            const sec = remainingSec % 60;
            displayEl.textContent = (min < 10 ? '0' + min : min) + ':' + (sec < 10 ? '0' + sec : sec);
        }

        // Rotes SVG Pie-Segment (Kuchenstück) aktualisieren
        const pieSector = document.getElementById('pie-sector-' + timer.id);
        if (pieSector) {
            const minutesLeft = remainingSec / 60;
            const pathData = describePieSector(18, 18, 16, 0, minutesLeft);
            pieSector.setAttribute('d', pathData);
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
        if (resultText) resultText.textContent = personName + ' hat die Aufgabe geschafft!';

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

    function renderAllTimers() {
        const listToday = document.getElementById('list-today');
        const listTomorrow = document.getElementById('list-tomorrow');
        const listAfterTomorrow = document.getElementById('list-after-tomorrow');

        if (listToday) listToday.innerHTML = '';
        if (listTomorrow) listTomorrow.innerHTML = '';
        if (listAfterTomorrow) listAfterTomorrow.innerHTML = '';

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

    // Hilfsfunktion: Erzeugt SVG Path für rote Zeitfläche (Kuchenstück)
    function describePieSector(cx, cy, r, startMinutes, endMinutes) {
        const totalMinutes = MAX_CLOCK_MINUTES; // 60 Min = 360 Grad
        
        if (endMinutes >= totalMinutes) {
            return `M \({cx}\){cy - r} A \({r}\){r} 0 1 1 \({cx - 0.001}\){cy - r} Z`;
        }

        const startAngle = (startMinutes / totalMinutes) * 360;
        const endAngle = (endMinutes / totalMinutes) * 360;

        const startRad = (startAngle - 90) * Math.PI / 180.0;
        const endRad = (endAngle - 90) * Math.PI / 180.0;

        const x1 = cx + (r * Math.cos(startRad));
        const y1 = cy + (r * Math.sin(startRad));
        const x2 = cx + (r * Math.cos(endRad));
        const y2 = cy + (r * Math.sin(endRad));

        const largeArcFlag = (endAngle - startAngle) <= 180 ? "0" : "1";

        return [
            "M", cx, cy,
            "L", x1, y1,
            "A", r, r, 0, largeArcFlag, 1, x2, y2,
            "Z"
        ].join(" ");
    }

    function createTimerCardElement(timer) {
        const card = document.createElement('div');
        card.className = 'timer-card status-' + timer.status;
        card.id = 'card-' + timer.id;
        card.style.display = 'flex';
        card.style.alignItems = 'center';
        card.style.justifyContent = 'space-between';
        card.style.gap = '12px';
        card.style.padding = '12px 16px';

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

        let remainingSec = timer.durationSeconds;
        if (timer.status === 'running' && timer.endTime) {
            remainingSec = Math.max(0, Math.round((timer.endTime - Date.now()) / 1000));
        } else if (timer.remainingSeconds !== undefined) {
            remainingSec = timer.remainingSeconds;
        }

        const min = Math.floor(remainingSec / 60);
        const sec = remainingSec % 60;
        const displayTime = (min < 10 ? '0' + min : min) + ':' + (sec < 10 ? '0' + sec : sec);

        // 1. Info Block
        const infoDiv = document.createElement('div');
        infoDiv.style.display = 'flex';
        infoDiv.style.alignItems = 'center';
        infoDiv.style.gap = '8px';

        const titleDiv = document.createElement('span');
        titleDiv.style.fontWeight = 'bold';
        titleDiv.textContent = personIcon + ' ' + personName;

        const subtitleDiv = document.createElement('span');
        subtitleDiv.textContent = topicIcon + ' ' + topicName;

        infoDiv.appendChild(titleDiv);
        infoDiv.appendChild(subtitleDiv);

        // 2. Visuelle Uhr (SVG Zifferblatt mit rotem Kuchenstück)
        const clockContainer = document.createElement('div');
        clockContainer.style.display = 'flex';
        clockContainer.style.flexDirection = 'column';
        clockContainer.style.alignItems = 'center';
        clockContainer.style.gap = '4px';

        const svgNS = "http://www.w3.org/2000/svg";
        const svg = document.createElementNS(svgNS, "svg");
        svg.setAttribute("viewBox", "0 0 36 36");
        svg.style.width = "40px";
        svg.style.height = "40px";

        // Weißer Hintergrund-Kreis (Zifferblatt)
        const bgCircle = document.createElementNS(svgNS, "circle");
        bgCircle.setAttribute("cx", "18");
        bgCircle.setAttribute("cy", "18");
        bgCircle.setAttribute("r", "16");
        bgCircle.setAttribute("fill", "#ffffff");
        bgCircle.setAttribute("stroke", "#cccccc");
        bgCircle.setAttribute("stroke-width", "1");

        // Rotes Kuchenstück für verbleibende Zeit
        const minutesLeft = remainingSec / 60;
        const pieSector = document.createElementNS(svgNS, "path");
        pieSector.setAttribute("id", "pie-sector-" + timer.id);
        pieSector.setAttribute("fill", "#e74c3c"); // Rot
        pieSector.setAttribute("d", describePieSector(18, 18, 16, 0, minutesLeft));

        // Schwarzer Mittelpunkt (Zeiger-Achse)
        const centerDot = document.createElementNS(svgNS, "circle");
        centerDot.setAttribute("cx", "18");
        centerDot.setAttribute("cy", "18");
        centerDot.setAttribute("r", "1.5");
        centerDot.setAttribute("fill", "#333333");

        svg.appendChild(bgCircle);
        svg.appendChild(pieSector);
        svg.appendChild(centerDot);

        const displayDiv = document.createElement('div');
        displayDiv.id = 'display-' + timer.id;
        displayDiv.style.fontSize = '0.85rem';
        displayDiv.style.fontWeight = 'bold';
        displayDiv.textContent = displayTime;

        clockContainer.appendChild(svg);
        clockContainer.appendChild(displayDiv);

        // 3. Dynamischer Button (Grün / Orange)
        const actionsDiv = document.createElement('div');

        const isRunning = timer.status === 'running';
        const actionBtn = document.createElement('button');
        actionBtn.style.padding = '8px 16px';
        actionBtn.style.borderRadius = '6px';
        actionBtn.style.border = 'none';
        actionBtn.style.color = '#ffffff';
        actionBtn.style.fontWeight = 'bold';
        actionBtn.style.cursor = 'pointer';

        if (isRunning) {
            actionBtn.style.backgroundColor = '#ff9800'; // Orange
            actionBtn.textContent = '🟧 Fertig';
            actionBtn.setAttribute('onclick', 'finishTimerDirectly("' + timer.id + '")');
        } else {
            actionBtn.style.backgroundColor = '#4caf50'; // Grün
            actionBtn.textContent = '▶ Start';
            actionBtn.setAttribute('onclick', 'startTimer("' + timer.id + '")');
        }

        actionsDiv.appendChild(actionBtn);

        // Zusammenbauen
        card.appendChild(infoDiv);
        card.appendChild(clockContainer);
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
