// Map interaction logic
let scale = 1;
const SCALE_STEP = 0.2;
const MIN_SCALE = 0.5;
const MAX_SCALE = 3;

function initMap() {
    const map = $('#map');
    let isDragging = false;
    let currentX;
    let currentY;
    let initialX;
    let initialY;

    map.addEventListener('mousedown', startDragging);
    document.addEventListener('mousemove', drag);
    document.addEventListener('mouseup', stopDragging);
    
    // Touch events
    map.addEventListener('touchstart', e => {
        const touch = e.touches[0];
        startDragging(touch);
    });
    document.addEventListener('touchmove', e => {
        e.preventDefault();
        const touch = e.touches[0];
        drag(touch);
    });
    document.addEventListener('touchend', stopDragging);

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
