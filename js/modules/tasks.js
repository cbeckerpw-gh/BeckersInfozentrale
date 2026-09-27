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
        if (btnClose) {
            btnClose.addEventListener('click', () => this.closeTimer());
        }
    },

    openTimer(title, assignee, minutes) {
        this.totalTime = minutes * 60;
        this.timeRemaining = this.totalTime;

        document.getElementById('timer-task-title').textContent = title;
        document.getElementById('timer-task-assignee').textContent = assignee;
        
        this.updateClockDisplay();
        document.getElementById('modal-task-timer').classList.remove('hidden');
    },

    closeTimer() {
        clearInterval(this.timerInterval);
        document.getElementById('modal-task-timer').classList.add('hidden');
    },

    updateClockDisplay() {
        const mins = Math.floor(this.timeRemaining / 60);
        const secs = this.timeRemaining % 60;
        
        const digitalText = `\({String(mins).padStart(2, '0')}:\){String(secs).padStart(2, '0')}`;
        document.getElementById('digital-timer-text').textContent = digitalText;

        // Visual SVG Fill update logic...
    }
};
