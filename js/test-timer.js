/**
 * Isolierter Test für Hintergrund-Timer via Timestamp (v1.1-dev)
 */
(function () {
    'use strict';

    let testInterval = null;
    const STORAGE_KEY = 'test_timer_end_time';

    document.addEventListener('DOMContentLoaded', () => {
        const btnStart = document.getElementById('btn-test-start');
        const btnReset = document.getElementById('btn-test-reset');

        if (btnStart) btnStart.addEventListener('click', () => startTestTimer(120)); // 120 Sekunden = 2 Min
        if (btnReset) btnReset.addEventListener('click', resetTestTimer);

        // Event-Listener: Feuert sofort, wenn man zum Tab zurückkehrt oder die App wieder öffnet
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible') {
                updateTimerDisplay();
            }
        });

        // Prüfen, ob noch ein aktiver Test-Timer läuft (z. B. nach Tab-Reload)
        checkExistingTimer();
    });

    function startTestTimer(seconds) {
        const endTime = Date.now() + (seconds * 1000);
        localStorage.setItem(STORAGE_KEY, endTime.toString());

        updateStatus('Timer läuft...');
        runInterval();
    }

    function runInterval() {
        if (testInterval) clearInterval(testInterval);

        // Optische Aktualisierung jede Sekunde
        testInterval = setInterval(() => {
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

        // Formatierung MM:SS
        const min = Math.floor(remainingSec / 60);
        const sec = remainingSec % 60;
        display.textContent = (min < 10 ? '0' : '') + min + ':' + (sec < 10 ? '0' : '') + sec;

        if (remainingSec <= 0) {
            updateStatus('🚀 Zeit abgelaufen!');
            localStorage.removeItem(STORAGE_KEY);
            return true; // Timer ist fertig
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
