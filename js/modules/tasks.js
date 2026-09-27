/**
 * Steuerung des kindgerechten Timers (Analog/Digital)
 */
const TasksModule = {
    timerInterval: null,
    timeRemaining: 0,
    totalTime: 0,

    init() {
        this.bindEvents();
    },

    bindEvents() {
        const btnClose = document.getElementById('btn-close-timer');
        const btnCancel = document.getElementById('btn-cancel-timer');
        const btnStart = document.getElementById('btn-start-timer');
        const btnPause = document.getElementById('btn-pause-timer');

        if (btnClose) btnClose.addEventListener('click', () => this.closeTimer());
        if (btnCancel) btnCancel.addEventListener('click', () => this.closeTimer());

        if (btnStart) {
            btnStart.addEventListener('click', () => {
                if (!this.timerInterval) {
                    this.timerInterval = setInterval(() => this.tick(), 1000);
                }
            });
        }

        if (btnPause) {
            btnPause.addEventListener('click', () => {
                clearInterval(this.timerInterval);
                this.timerInterval = null;
            });
        }
    },

    addTaskToColumn(dayId, title, person, durationMinutes) {
        const container = document.getElementById(`timers-${dayId}`);
        if (!container) return;

        const btn = document.createElement('button');
        btn.className = `task-card-btn ${person}`;
        btn.innerHTML = `⏱️ \({title} (\){durationMinutes}m)`;
        btn.onclick = () => this.openTimer(title, person, durationMinutes);

        container.appendChild(btn);
    },

    openTimer(title, assignee, minutes) {
        this.totalTime = minutes * 60;
        this.timeRemaining = this.totalTime;

        document.getElementById('timer-task-title').textContent = title;
        document.getElementById('timer-task-assignee').textContent = `Für: ${assignee}`;
        
        this.updateClockDisplay();
        document.getElementById('modal-task-timer').classList.remove('hidden');
    },

    closeTimer() {
        clearInterval(this.timerInterval);
        this.timerInterval = null;
        document.getElementById('modal-task-timer').classList.add('hidden');
    },

    tick() {
        if (this.timeRemaining > 0) {
            this.timeRemaining--;
            this.updateClockDisplay();
        } else {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
            alert("Zeit abgelaufen!");
        }
    },

    updateClockDisplay() {
        const mins = Math.floor(this.timeRemaining / 60);
        const secs = this.timeRemaining % 60;
        
        document.getElementById('digital-timer-text').textContent = 
            `\({String(mins).padStart(2, '0')}:\){String(secs).padStart(2, '0')}`;

        // Analog SVG Tortendiagramm-Berechnung
        const ratio = this.timeRemaining / this.totalTime;
        const angle = ratio * 360;
        const radians = (angle - 90) * (Math.PI / 180);
        const x = 50 + 45 * Math.cos(radians);
        const y = 50 + 45 * Math.sin(radians);
        const largeArc = angle > 180 ? 1 : 0;

        const pathData = angle >= 360 
            ? "M 50 50 L 50 5 A 45 45 0 1 1 49.9 5 Z" 
            : `M 50 50 L 50 5 A 45 45 0 \({largeArc} 1\){x} ${y} Z`;

        const slice = document.getElementById('clock-slice');
        if (slice) slice.setAttribute('d', pathData);
    }
};
