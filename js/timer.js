/**
 * MODULE_TASKS_TIMER: Canvas Zeichnen & Timer-Ablauf
 */

let timerSeconds = 600;
let remainingSeconds = 600;
let timerInterval = null;
let isRunning = false;
let activeAssignee = 'oskar';

const canvas = document.getElementById('clock');
const ctx = canvas ? canvas.getContext('2d') : null;

function drawClock() {
    if (!ctx) return;
    ctx.clearRect(0, 0, 200, 200);

    // Ziffernblatt Hintergrund
    ctx.beginPath();
    ctx.arc(100, 100, 90, 0, 2 * Math.PI);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 4;
    ctx.stroke();

    // Rote Füllung (exakt auf 60 Minuten Skala bezogen)
    if (remainingSeconds > 0) {
        let currentSecondsRatio = remainingSeconds / 3600; 
        let startAngle = -0.5 * Math.PI; 
        let endAngle = startAngle + (2 * Math.PI * currentSecondsRatio);

        ctx.beginPath();
        ctx.moveTo(100, 100);
        ctx.arc(100, 100, 88, startAngle, endAngle, false);
        ctx.lineTo(100, 100);
        ctx.fillStyle = '#ef4444';
        ctx.fill();
    }

    // 12 Stunden Striche
    for (let i = 0; i < 12; i++) {
        let angle = i * Math.PI / 6;
        ctx.beginPath();
        ctx.moveTo(100 + 78 * Math.cos(angle), 100 + 78 * Math.sin(angle));
        ctx.lineTo(100 + 88 * Math.cos(angle), 100 + 88 * Math.sin(angle));
        ctx.strokeStyle = '#333333';
        ctx.lineWidth = i % 3 === 0 ? 3 : 1.5;
        ctx.stroke();
    }
}

function updateDisplay() {
    let mn = Math.floor(remainingSeconds / 60);
    let sc = remainingSeconds % 60;
    document.getElementById('disp').innerText = 
        `\({mn.toString().padStart(2, '0')}:\){sc.toString().padStart(2, '0')}`;
    drawClock();
}

function startTimer() {
    if (isRunning) return;
    isRunning = true;
    document.getElementById('sBtn').style.display = 'none';
    document.getElementById('fBtn').style.display = 'inline-block';

    timerInterval = setInterval(() => {
        remainingSeconds--;
        updateDisplay();
        if (remainingSeconds <= 0) {
            clearInterval(timerInterval);
            finishTimer(false);
        }
    }, 1000);
}

function finishTimer(success) {
    clearInterval(timerInterval);
    document.getElementById('pImg').innerText = success ? '🚀' : '❌';
    document.getElementById('pTit').innerText = success ? 'Super gemacht!' : 'Zeit um!';
    document.getElementById('pTit').style.color = success ? '#22c55e' : '#ef4444';
    document.getElementById('feedback-pop').style.display = 'flex';
}

function closeFeedbackPop() {
    document.getElementById('feedback-pop').style.display = 'none';
    resetTimer();
}

function resetTimer() {
    clearInterval(timerInterval);
    isRunning = false;
    remainingSeconds = timerSeconds;
    document.getElementById('sBtn').style.display = 'inline-block';
    document.getElementById('fBtn').style.display = 'none';
    updateDisplay();
}

// Initialer Aufruf
drawClock();
