/**
 * Isolierter Test für Hintergrund-Timer via Timestamp (v1.1-dev)
 * Inklusive vorbereiteter (auskommentierter) Pipedream-Synchronisation
 */
(function () {
    'use strict';

    let testInterval = null;
    let syncInterval = null;
    const STORAGE_KEY = 'test_timer_end_time';

    // -------------------------------------------------------------------------
    // PIPEDREAM KONFIGURATION (Geplant für 01.10.26)
    // -------------------------------------------------------------------------
    // const PIPEDREAM_WEBHOOK_URL = 'https://YOUR_PIPEDREAM_ENDPOINT.m.pipedream.net';
    // const SYNC_INTERVAL_MS = 5000; // Alle 5 Sekunden Daten abgleichen

    function initTestTimer() {
        console.log('🧪 Test-Timer v1.1-dev wird initialisiert...');

        const btnStart = document.getElementById('btn-test-start');
        const btnReset = document.getElementById('btn-test-reset');

        if (btnStart) {
            btnStart.addEventListener('click', function () {
                startTestTimer(120); // 120 Sekunden = 2 Min
            });
        }

        if (btnReset) {
            btnReset.addEventListener('click', resetTestTimer);
        }

        // Event-Listener: Reagiert sofort beim Zurückkehren in den Tab / Entsperren
        document.addEventListener('visibilitychange', function () {
            if (document.visibilityState === 'visible') {
                updateTimerDisplay();
                // IF PIPEDREAM ACTIVE:
                // fetchTimerFromPipedream();
            }
        });

        checkExistingTimer();

        // ---------------------------------------------------------------------
        // START PIPEDREAM POLLING (Auskommentiert bis 01.10.26)
        // ---------------------------------------------------------------------
        /*
        startPipedreamSync();
        */
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initTestTimer);
    } else {
        initTestTimer();
    }

    function startTestTimer(seconds) {
        const endTime = Date.now() + (seconds * 1000);
        localStorage.setItem(STORAGE_KEY, endTime.toString());

        updateStatus('Timer läuft (Lokal)...');
        runInterval();

        // ---------------------------------------------------------------------
        // PIPEDREAM: Timer-Start an Server senden (Auskommentiert)
        // ---------------------------------------------------------------------
        /*
        sendTimerToPipedream({
            id: 'test-timer-1',
            endTime: endTime,
            status: 'running'
        });
        */
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

        // ---------------------------------------------------------------------
        // PIPEDREAM: Reset an Server senden (Auskommentiert)
        // ---------------------------------------------------------------------
        /*
        sendTimerToPipedream({
            id: 'test-timer-1',
            status: 'reset'
        });
        */
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

    // =========================================================================
    // PIPEDREAM API FUNKTIONEN (VORBEREITET FÜR 01.10.26)
    // =========================================================================

    /*
    function startPipedreamSync() {
        if (syncInterval) clearInterval(syncInterval);
        
        // Erstes Mal sofort laden, danach alle X Sekunden
        fetchTimerFromPipedream();
        syncInterval = setInterval(fetchTimerFromPipedream, SYNC_INTERVAL_MS);
    }

    async function sendTimerToPipedream(timerData) {
        try {
            const response = await fetch(PIPEDREAM_WEBHOOK_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(timerData)
            });
            if (response.ok) {
                console.log('☁️ Sync zu Pipedream erfolgreich');
            }
        } catch (err) {
            console.error('❌ Fehler beim Senden an Pipedream:', err);
        }
    }

    async function fetchTimerFromPipedream() {
        try {
            const response = await fetch(PIPEDREAM_WEBHOOK_URL);
            if (response.ok) {
                const data = await response.json();
                
                // Falls ein fremdes Gerät den Timer gestartet hat
                if (data && data.endTime && data.status === 'running') {
                    const localEndTime = localStorage.getItem(STORAGE_KEY);
                    if (localEndTime !== data.endTime.toString()) {
                        localStorage.setItem(STORAGE_KEY, data.endTime.toString());
                        updateStatus('☁️ Synch: Timer von anderem Gerät empfangen!');
                        runInterval();
                    }
                } else if (data && data.status === 'reset') {
                    resetTestTimer();
                }
            }
        } catch (err) {
            console.warn('⚠️ Pipedream nicht erreichbar:', err);
        }
    }
    */
})();
