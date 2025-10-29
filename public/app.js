// Map interaction logic
let scale = 1;
const SCALE_STEP = 0.2;
const MIN_SCALE = 0.5;
const MAX_SCALE = 3;

// Drawing state
let isDrawing = false;
let isDragging = false;
let currentX;
let currentY;
let initialX;
let initialY;

function initMap() {
    const map = $('#map');
    const canvas = $('#drawCanvas');
    const ctx = canvas.getContext('2d');
    const mapImage = $('#mapImage');

    // Set canvas size to match the container
    function resizeCanvas() {
        canvas.width = map.clientWidth;
        canvas.height = map.clientHeight;
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';
    }

    // Initial resize and bind to window resize
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Drawing functions
    function startDrawing(e) {
        if (e.shiftKey) { // Hold shift to draw
            isDrawing = true;
            isDragging = false;
            ctx.beginPath();
            const rect = canvas.getBoundingClientRect();
            ctx.moveTo(
                (e.clientX - rect.left) / scale,
                (e.clientY - rect.top) / scale
            );
            e.preventDefault();
        } else {
            isDragging = true;
            isDrawing = false;
            initialX = e.clientX - currentX;
            initialY = e.clientY - currentY;
        }
    }

    function draw(e) {
        if (isDrawing) {
            const rect = canvas.getBoundingClientRect();
            ctx.strokeStyle = $('#draw-color').value;
            ctx.lineWidth = $('#brush-size').value / scale;
            ctx.lineTo(
                (e.clientX - rect.left) / scale,
                (e.clientY - rect.top) / scale
            );
            ctx.stroke();
        } else if (isDragging) {
            currentX = e.clientX - initialX;
            currentY = e.clientY - initialY;
            updateMapPosition();
        }
    }

    function stopDrawing() {
        isDrawing = false;
        isDragging = false;
    }

    // Mouse events
    map.addEventListener('mousedown', startDrawing);
    document.addEventListener('mousemove', draw);
    document.addEventListener('mouseup', stopDrawing);
    
    // Touch events
    map.addEventListener('touchstart', e => {
        const touch = e.touches[0];
        startDrawing(touch);
    });
    document.addEventListener('touchmove', e => {
        e.preventDefault();
        const touch = e.touches[0];
        draw(touch);
    });
    document.addEventListener('touchend', stopDrawing);

    // Clear drawing
    $('#clear-drawing').addEventListener('click', () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    });

    function startDragging(e) {
        initialX = e.clientX - currentX;
        initialY = e.clientY - currentY;
        isDragging = true;
    }

    function drag(e) {
        if (isDragging) {
            e.preventDefault();
            currentX = e.clientX - initialX;
            currentY = e.clientY - initialY;
            updateMapPosition();
        }
    }

    function stopDragging() {
        isDragging = false;
    }

    function updateMapPosition() {
        map.style.transform = `translate(${currentX}px, ${currentY}px) scale(${scale})`;
    }

    // Zoom controls
    $('#zoom-in').addEventListener('click', () => {
        if (scale < MAX_SCALE) {
            scale += SCALE_STEP;
            updateMapPosition();
        }
    });

    $('#zoom-out').addEventListener('click', () => {
        if (scale > MIN_SCALE) {
            scale -= SCALE_STEP;
            updateMapPosition();
        }
    });
}

async function fetchQuestions() {
    const res = await fetch('/api/questions');
    return res.json();
}

function $(s) { return document.querySelector(s); }

let questions = [];
let index = 0;
let score = 0;

// Initialize map when page loads
window.onload = initMap;

$('#start').addEventListener('click', async () => {
  const name = $('#name').value.trim();
  if (!name) { alert('Please enter your name'); return; }
  questions = await fetchQuestions();
  index = 0; score = 0;
  $('#start-screen').classList.add('hidden');
  $('#quiz').classList.remove('hidden');
  showQuestion();
});

function showQuestion() {
  const q = questions[index];
  $('#question-area').textContent = `${index+1}. ${q.question}`;
  const choices = $('#choices');
  choices.innerHTML = '';
  q.choices.forEach((c, i) => {
    const btn = document.createElement('button');
    btn.textContent = c;
    btn.addEventListener('click', () => selectAnswer(i));
    choices.appendChild(btn);
  });
  $('#next').classList.add('hidden');
}

function selectAnswer(choiceIndex) {
  const q = questions[index];
  const correct = q.answer === choiceIndex;
  if (correct) score += 1;
  // visually indicate
  [...$('#choices').children].forEach((b, i) => {
    b.disabled = true;
    if (i === q.answer) b.classList.add('correct');
    if (i === choiceIndex && i !== q.answer) b.classList.add('wrong');
  });
  $('#next').classList.remove('hidden');
}

$('#next').addEventListener('click', () => {
  index += 1;
  if (index >= questions.length) showResults();
  else showQuestion();
});

function showResults() {
  $('#quiz').classList.add('hidden');
  $('#result').classList.remove('hidden');
  $('#score-text').textContent = `You scored ${score} out of ${questions.length}`;
}

$('#submit-score').addEventListener('click', async () => {
  const name = $('#name').value.trim();
  const res = await fetch('/api/score', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, score })
  });
  const top = await res.json();
  renderLeaderboard(top);
});

$('#play-again').addEventListener('click', () => {
  $('#result').classList.add('hidden');
  $('#start-screen').classList.remove('hidden');
});

async function loadLeaderboard() {
  const res = await fetch('/api/scores');
  const top = await res.json();
  renderLeaderboard(top);
}

function renderLeaderboard(list) {
  const ol = $('#leaderboard');
  ol.innerHTML = '';
  list.forEach(item => {
    const li = document.createElement('li');
    li.textContent = `${item.name} — ${item.score}`;
    ol.appendChild(li);
  });
}

// initial load
loadLeaderboard();
