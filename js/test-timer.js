/**
 * Isolierter Test für Hintergrund-Timer via Timestamp (v1.1-dev) - inkl. Konsole-Logs
 */
(function () {
    'use strict';

    let testInterval = null;
    const STORAGE_KEY = 'test_timer_end_time';

    function initTestTimer() {
        console.log('🧪 Test-Timer v1.1-dev wird initialisiert...');

        const btnStart = document.getElementById('btn-test-start');
        const btnReset = document.getElementById('btn-test-reset');

        if (!btnStart) {
            console.error('❌ Fehler: Button #btn-test-start im HTML nicht gefunden!');
            return;
        }

        if (!btnReset) {
            console.error('❌ Fehler: Button #btn-test-reset im HTML nicht gefunden!');
            return;
        }

        console.log('✅ Buttons erfolgreich im DOM gefunden. Binde Click-Events...');

        btnStart.addEventListener('click', function () {
            console.log('▶️ Button "2 Min Starten" geklickt!');
            startTestTimer(120); // 120 Sekunden = 2 Min
        });

        btnReset.addEventListener('click', function () {
            console.log('🔄 Button "Reset" geklickt!');
            resetTestTimer();
        });

        // Event-Listener: Reagiert sofort beim Zurückkehren in den Tab / Entsperren
        document.addEventListener('visibilitychange', function () {
            if (document.visibilityState === 'visible') {
                console.log('👁️ Tab wieder sichtbar. Aktualisiere Anzeige...');
                updateTimerDisplay();
            }
        });

        checkExistingTimer();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initTestTimer);
    } else {
        initTestTimer();
    }

    function startTestTimer(seconds) {
        const endTime = Date.now() + (seconds * 1000);
        localStorage.setItem(STORAGE_KEY, endTime.toString());

        updateStatus('Timer läuft...');
        runInterval();
    }

    function runInterval() {
        if (testInterval) clearInterval(testInterval);

        testInterval = setInterval(function () {
            const isFinished = updateTimerDisplay();
            if (isFinished) {
                clearInterval(testInterval);
            }
        }, 1000);

        updateTimerDisplay();
    }

    function updateTimerDisplay() {
        const storedEndTime = localStorage.getItem(STORAGE_KEY);
        const display = document.getElementById('test-timer-display');
        if (!display || !storedEndTime) return true;

        const endTime = parseInt(storedEndTime, 10);
        const now = Date.now();
        const remainingMs = endTime - now;
        const remainingSec = Math.max(0, Math.round(remainingMs / 1000));

        const min = Math.floor(remainingSec / 60);
        const sec = remainingSec % 60;
        display.textContent = (min < 10 ? '0' : '') + min + ':' + (sec < 10 ? '0' : '') + sec;

        if (remainingSec <= 0) {
            updateStatus('🚀 Zeit abgelaufen!');
            localStorage.removeItem(STORAGE_KEY);
            return true;
        }

        return false;
    }

    function resetTestTimer() {
        if (testInterval) clearInterval(testInterval);
        localStorage.removeItem(STORAGE_KEY);
        
        const display = document.getElementById('test-timer-display');
        if (display) display.textContent = '02:00';
        updateStatus('Status: Bereit');
    }

    function checkExistingTimer() {
        const storedEndTime = localStorage.getItem(STORAGE_KEY);
        if (storedEndTime) {
            const remainingSec = Math.round((parseInt(storedEndTime, 10) - Date.now()) / 1000);
            if (remainingSec > 0) {
                updateStatus('Timer aus Hintergrund wiederhergestellt!');
                runInterval();
            } else {
                localStorage.removeItem(STORAGE_KEY);
            }
        }
    }

    function updateStatus(text) {
        const statusEl = document.getElementById('test-timer-status');
        if (statusEl) statusEl.textContent = text;
    }
})();
