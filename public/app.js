async function fetchQuestions() {
  const res = await fetch('/api/questions');
  return res.json();
}

function $(s) { return document.querySelector(s); }

let questions = [];
let index = 0;
let score = 0;

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
