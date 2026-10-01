/**
 * Hauptmodul für Aufgabentimer (v1.6 - Fettgedruckte Namen & Rotes Kreuz bei Failed)
 */
(function () {
    'use strict';

    let timers = [];
    let activeIntervals = {};
    let resultModalTimeout = null; // Speichert den Auto-Close Timeout des Popups
    const STORAGE_KEY = 'family_info_center_timers';
    const MAX_CLOCK_MINUTES = 60; // Voller Kreis = 60 Minuten
    const RESULT_POPUP_DURATION = 30000; // 30 Sekunden Anzeigezeit für Ergebnis-Popups

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
        const resultModal = document.getElementById('result-modal');

        if (btnOpenModal) btnOpenModal.addEventListener('click', openModal);
        if (btnCloseModal) btnCloseModal.addEventListener('click', closeModal);
        if (btnCloseResult) btnCloseResult.addEventListener('click', closeResultModal);

        // Klick außerhalb des Modals (Backdrop-Click) schließt das Ergebnis-Popup
        if (resultModal) {
            resultModal.addEventListener('click', function (e) {
                if (e.target === resultModal) {
                    closeResultModal();
                }
            });
        }

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
            const isPersonGroup = group.id === 'group-person';
            const buttons = group.querySelectorAll('.btn-select');

            buttons.forEach(function (btn) {
                btn.addEventListener('click', function () {
                    if (isPersonGroup) {
                        const activeBtns = group.querySelectorAll('.btn-select.active');
                        if (this.classList.contains('active')) {
                            if (activeBtns.length > 1) {
                                this.classList.remove('active');
                            }
                        } else {
                            this.classList.add('active');
                        }
                    } else {
                        buttons.forEach(function (b) { b.classList.remove('active'); });
                        this.classList.add('active');
                    }
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

        // Laufenden Auto-Close-Timer löschen
        if (resultModalTimeout) {
            clearTimeout(resultModalTimeout);
            resultModalTimeout = null;
        }
    }

    function handleFormSubmit(e) {
        e.preventDefault();

        const selectedPersons = getActivePersonValues();
        const personsToCreate = selectedPersons.length > 0 ? selectedPersons : ['oskar'];

        const topic = getActiveSelectValue('group-topic') || 'zahne';
        const durationMinutes = parseInt(getActiveSelectValue('group-duration') || '5', 10);
        const dayTargetRaw = getActiveSelectValue('group-day') || 'today';
        const repeatCountRaw = String(getActiveSelectValue('group-repeat') || '1').toLowerCase();

        let targetDays = [];
        if (dayTargetRaw === 'all' || dayTargetRaw === 'alle' || dayTargetRaw === 'alle 3 tage') {
            targetDays = ['today', 'tomorrow', 'after-tomorrow'];
        } else {
            targetDays = [dayTargetRaw];
        }

        let repeatTimes = 1;
        if (repeatCountRaw.includes('2')) repeatTimes = 2;
        if (repeatCountRaw.includes('3')) repeatTimes = 3;

        const durationSec = durationMinutes * 60;

        personsToCreate.forEach(function (person) {
            targetDays.forEach(function (day) {
                for (let i = 1; i <= repeatTimes; i++) {
                    const repeatLabel = repeatTimes > 1 ? ' (' + i + '/' + repeatTimes + ')' : '';

                    const newTimer = {
                        id: 'timer-' + Date.now() + '-' + Math.floor(Math.random() * 10000) + '-' + i,
                        person: person,
                        topic: topic,
                        repeatLabel: repeatLabel,
                        durationMinutes: durationMinutes,
                        durationSeconds: durationSec,
                        remainingSeconds: durationSec,
                        dayTarget: day,
                        status: 'idle',
                        endTime: null
                    };

                    timers.push(newTimer);
                }
            });
        });

        saveTimersToStorage();
        renderAllTimers();
        closeModal();
    }

    function getActivePersonValues() {
        const group = document.getElementById('group-person');
        if (!group) return [];
        const activeBtns = group.querySelectorAll('.btn-select.active');
        const persons = [];
        activeBtns.forEach(function (btn) {
            persons.push(btn.getAttribute('data-value'));
        });
        return persons;
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

        if (timer.status !== 'running' && timer.status !== 'failed') {
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

        handleTimerFinished(timer, true);
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
                handleTimerFinished(timer, false);
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
            displayEl.textContent = (min < 10 ? '0' + min : min) + ':' + (sec < 10 ? '0' + sec : sec);
        }

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
                    handleTimerFinished(timer, false);
                }
            }
        });
    }

    function handleTimerFinished(timer, isSuccess) {
        if (isSuccess) {
            // Erfolgreich beendet -> Entfernen
            timer.status = 'finished';
            timer.endTime = null;
            timer.remainingSeconds = 0;
            timers = timers.filter(function (t) { return t.id !== timer.id; });
        } else {
            // Nicht geschafft -> Ausgegraut in der Liste behalten
            timer.status = 'failed';
            timer.endTime = null;
            timer.remainingSeconds = 0;
        }

        saveTimersToStorage();
        renderAllTimers();
        showResultModal(timer, isSuccess);
    }

    function showResultModal(timer, isSuccess) {
        const resultModal = document.getElementById('result-modal');
        const resultTitle = document.getElementById('result-title');
        const resultText = document.getElementById('result-text');
        const btnCloseResult = document.getElementById('btn-close-result');

        if (!resultModal) return;

        // Vorherigen Auto-Close Timeout abbrechen (Override-Logik)
        if (resultModalTimeout) {
            clearTimeout(resultModalTimeout);
            resultModalTimeout = null;
        }

        const personName = timer.person === 'oskar' ? 'Oskar' : 'Irma';

        if (isSuccess) {
            if (resultTitle) resultTitle.textContent = '🎉 ' + personName + ', super gemacht!';
            if (resultText) resultText.innerHTML = '**' + personName + '**, du hast die Aufgabe **"' + taskTitle + '"** erfolgreich geschafft!';
            if (btnCloseResult) btnCloseResult.textContent = 'Super!';
        } else {
            if (resultTitle) resultTitle.textContent = '❌ ' + personName + ', knapp vorbei';
            if (resultText) resultText.innerHTML = '**' + personName + '**, du hast die Aufgabe **"' + taskTitle + '"** leider nicht geschafft';
            if (btnCloseResult) btnCloseResult.textContent = 'OK';
        }

        // Popup anzeigen
        resultModal.classList.remove('hidden');

        // Neustart des 30-Sekunden Auto-Close-Timers
        resultModalTimeout = setTimeout(function () {
            closeResultModal();
        }, RESULT_POPUP_DURATION);
    }

    function startGlobalBackgroundSync() {
        timers.forEach(function (timer) {
            if (timer.status === 'running' && timer.endTime) {
                const now = Date.now();
                if (now >= timer.endTime) {
                    handleTimerFinished(timer, false);
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
            } else if ((timer.dayTarget === 'after-tomorrow' || timer.dayTarget === 'ubermorgen') && listAfterTomorrow) {
                listAfterTomorrow.appendChild(cardElement);
            }
        });
    }

    function describePieSector(cx, cy, r, startMinutes, endMinutes) {
        const totalMinutes = MAX_CLOCK_MINUTES;

        if (endMinutes >= totalMinutes) {
            return 'M ' + cx + ' ' + (cy - r) + ' A ' + r + ' ' + r + ' 0 1 1 ' + (cx - 0.001) + ' ' + (cy - r) + ' Z';
        }

        const startAngle = (startMinutes / totalMinutes) * 360;
        const endAngle = (endMinutes / totalMinutes) * 360;

        const startRad = (startAngle - 90) * Math.PI / 180.0;
        const endRad = (endAngle - 90) * Math.PI / 180.0;

        const x1 = cx + (r * Math.cos(startRad));
        const y1 = cy + (r * Math.sin(startRad));
        const x2 = cx + (r * Math.cos(endRad));
        const y2 = cy + (r * Math.sin(endRad));

        const largeArcFlag = (endAngle - startAngle) <= 180 ? '0' : '1';

        return [
            'M', cx, cy,
            'L', x1, y1,
            'A', r, r, 0, largeArcFlag, 1, x2, y2,
            'Z'
        ].join(' ');
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

        // Ausgrauen, wenn abgelaufen / nicht geschafft
        if (timer.status === 'failed') {
            card.style.opacity = '0.45';
            card.style.filter = 'grayscale(80%)';
        }

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

        const repeatSuffix = timer.repeatLabel || '';

        let remainingSec = timer.durationSeconds;
        if (timer.status === 'failed') {
            remainingSec = 0;
        } else if (timer.status === 'running' && timer.endTime) {
            remainingSec = Math.max(0, Math.round((timer.endTime - Date.now()) / 1000));
        } else if (timer.remainingSeconds !== undefined) {
            remainingSec = timer.remainingSeconds;
        }

        const min = Math.floor(remainingSec / 60);
        const sec = remainingSec % 60;
        const displayTime = (min < 10 ? '0' + min : min) + ':' + (sec < 10 ? '0' + sec : sec);

        const infoDiv = document.createElement('div');
        infoDiv.style.display = 'flex';
        infoDiv.style.flexDirection = 'column';
        infoDiv.style.gap = '4px';

        const personDiv = document.createElement('div');
        personDiv.style.fontWeight = 'bold';
        personDiv.textContent = personIcon + ' ' + personName;

        const topicDiv = document.createElement('div');
        topicDiv.style.fontSize = '0.9rem';
        topicDiv.style.color = '#cccccc';
        topicDiv.textContent = topicIcon + ' ' + topicName + repeatSuffix;

        infoDiv.appendChild(personDiv);
        infoDiv.appendChild(topicDiv);

        const clockContainer = document.createElement('div');
        clockContainer.style.display = 'flex';
        clockContainer.style.flexDirection = 'column';
        clockContainer.style.alignItems = 'center';
        clockContainer.style.gap = '4px';

        const svgNS = 'http://www.w3.org/2000/svg';
        const svg = document.createElementNS(svgNS, 'svg');
        svg.setAttribute('viewBox', '0 0 36 36');
        svg.style.width = '40px';
        svg.style.height = '40px';

        const bgCircle = document.createElementNS(svgNS, 'circle');
        bgCircle.setAttribute('cx', '18');
        bgCircle.setAttribute('cy', '18');
        bgCircle.setAttribute('r', '16');
        bgCircle.setAttribute('fill', '#ffffff');
        bgCircle.setAttribute('stroke', '#cccccc');
        bgCircle.setAttribute('stroke-width', '1');

        const minutesLeft = remainingSec / 60;
        const pieSector = document.createElementNS(svgNS, 'path');
        pieSector.setAttribute('id', 'pie-sector-' + timer.id);
        pieSector.setAttribute('fill', '#e74c3c');
        pieSector.setAttribute('d', describePieSector(18, 18, 16, 0, minutesLeft));

        const centerDot = document.createElementNS(svgNS, 'circle');
        centerDot.setAttribute('cx', '18');
        centerDot.setAttribute('cy', '18');
        centerDot.setAttribute('r', '1.5');
        centerDot.setAttribute('fill', '#333333');

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

        const actionsDiv = document.createElement('div');

        const isRunning = timer.status === 'running';
        const isFailed = timer.status === 'failed';
        const actionBtn = document.createElement('button');
        actionBtn.style.padding = '8px 16px';
        actionBtn.style.borderRadius = '6px';
        actionBtn.style.border = 'none';
        actionBtn.style.color = '#ffffff';
        actionBtn.style.fontWeight = 'bold';
        actionBtn.style.cursor = 'pointer';

        if (isFailed) {
            actionBtn.style.backgroundColor = '#555555';
            actionBtn.style.cursor = 'not-allowed';
            actionBtn.style.fontSize = '1.2rem';
            actionBtn.textContent = '❌';
            actionBtn.disabled = true;
        } else if (isRunning) {
            actionBtn.style.backgroundColor = '#ff9800';
            actionBtn.textContent = '🟧 Fertig';
            actionBtn.setAttribute('onclick', 'finishTimerDirectly("' + timer.id + '")');
        } else {
            actionBtn.style.backgroundColor = '#4caf50';
            actionBtn.textContent = '▶ Start';
            actionBtn.setAttribute('onclick', 'startTimer("' + timer.id + '")');
        }

        actionsDiv.appendChild(actionBtn);

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
