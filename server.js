const express = require('express');
const path = require('path');
const fs = require('fs').promises;

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const DATA_DIR = path.join(__dirname, 'data');

app.get('/api/questions', async (req, res) => {
  try {
    const raw = await fs.readFile(path.join(DATA_DIR, 'questions.json'), 'utf8');
    const questions = JSON.parse(raw);
    const shuffled = questions.sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 5).map(q => ({ id: q.id, question: q.question, choices: q.choices, answer: q.answer }));
    res.json(selected);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load questions' });
  }
});

app.post('/api/score', async (req, res) => {
  const { name, score } = req.body;
  if (typeof name !== 'string' || typeof score !== 'number') return res.status(400).json({ error: 'Invalid payload' });
  try {
    const scoresPath = path.join(DATA_DIR, 'scores.json');
    let raw = await fs.readFile(scoresPath, 'utf8');
    const scores = JSON.parse(raw);
    scores.push({ name, score, date: new Date().toISOString() });
    scores.sort((a, b) => b.score - a.score);
    const top = scores.slice(0, 10);
    await fs.writeFile(scoresPath, JSON.stringify(top, null, 2));
    res.json(top);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to save score' });
  }
});

app.get('/api/scores', async (req, res) => {
  try {
    const raw = await fs.readFile(path.join(DATA_DIR, 'scores.json'), 'utf8');
    res.json(JSON.parse(raw));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load scores' });
  }
});

app.listen(PORT, () => console.log(`Server started on http://localhost:${PORT}`));
