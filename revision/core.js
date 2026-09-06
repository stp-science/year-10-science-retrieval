let state = loadState();
let currentModule = state.currentModule || 'atoms';
let view = 'learn';
let currentLesson = 0;

const panel = document.getElementById('content-panel');
const moduleButtons = document.getElementById('module-buttons');
const dashboardProgress = document.getElementById('dashboard-progress');
const xpTotal = document.getElementById('xp-total');
const gamesBadge = document.getElementById('games-badge');

init();

function init() {
  document.body.classList.toggle('dark', localStorage.getItem(THEME_KEY) === 'dark');
  document.getElementById('theme-toggle').textContent = document.body.classList.contains('dark') ? '☀' : '☾';
  document.getElementById('theme-toggle').addEventListener('click', () => {
    document.body.classList.toggle('dark');
    localStorage.setItem(THEME_KEY, document.body.classList.contains('dark') ? 'dark' : 'light');
    document.getElementById('theme-toggle').textContent = document.body.classList.contains('dark') ? '☀' : '☾';
  });

  document.querySelectorAll('.mode-tab').forEach(b => b.addEventListener('click', () => {
    document.querySelectorAll('.mode-tab').forEach(x => x.classList.remove('active'));
    b.classList.add('active');
    view = b.dataset.view;
    render();
  }));

  renderModuleButtons();
  render();
}

function loadState() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {checks:{}, exam:{}, xp:0};
  } catch {
    return {checks:{}, exam:{}, xp:0};
  }
}

function saveState() {
  state.currentModule = currentModule;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  updateDashboard();
}

function ensure() {
  state.checks ||= {};
  state.exam ||= {};
  state.xp ||= 0;
  state.checks[currentModule] ||= {};
  state.exam[currentModule] ||= {};
}

function renderModuleButtons() {
  moduleButtons.innerHTML = Object.entries(modules).map(([id,m]) => `
    <button class="module-button ${id === currentModule ? 'active' : ''}" data-module="${id}" style="--module-soft:${m.soft}">
      <span class="module-icon">${m.icon}</span>
      <span><strong>${m.short}</strong><small>${m.subtitle}</small></span>
    </button>`).join('');

  moduleButtons.querySelectorAll('button').forEach(b => b.addEventListener('click', () => {
    currentModule = b.dataset.module;
    currentLesson = 0;
    state.currentModule = currentModule;
    renderModuleButtons();
    render();
    saveState();
  }));
}

function render() {
  ensure();
  const m = modules[currentModule];
  panel.style.setProperty('--module', m.colour);
  if (view === 'learn') renderLearn();
  if (view === 'check') renderCheck();
  if (view === 'exam') renderExam();
  if (view === 'games') renderGames();
  updateDashboard();
  window.scrollTo({top:Math.max(0, document.querySelector('.mode-tabs').offsetTop - 90), behavior:'smooth'});
}

function hero() {
  const m = modules[currentModule];
  return `<section class="module-hero" style="--module:${m.colour}"><span class="module-number">TOPIC ${m.number}</span><h2>${m.name}</h2><p>${m.intro}</p></section>`;
}

function renderLearn() {
  const m = modules[currentModule];
  currentLesson = Math.max(0, Math.min(currentLesson, m.lessons.length - 1));

  panel.innerHTML = hero() + `
    <section aria-label="Choose revision section" style="background:var(--card);border:1px solid var(--line);border-radius:18px;padding:16px 18px;margin:0 0 16px;box-shadow:0 8px 24px rgba(24,45,79,.05);">
      <label for="lesson-select" style="display:block;font-size:.78rem;font-weight:900;letter-spacing:.09em;text-transform:uppercase;color:var(--muted);margin-bottom:7px;">Choose section</label>
      <select id="lesson-select" style="width:100%;min-height:46px;border:1px solid var(--line);border-radius:12px;padding:10px 40px 10px 12px;background:var(--card);color:var(--ink);font:inherit;font-weight:750;">
        ${m.lessons.map((l,i) => `<option value="${i}">${i + 1}. ${l.title}</option>`).join('')}
      </select>
      <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;margin-top:12px;">
        <button class="check-btn" id="prev-lesson" type="button">← Previous</button>
        <strong id="lesson-count" style="color:var(--muted);font-size:.88rem;"></strong>
        <button class="check-btn" id="next-lesson" type="button">Next →</button>
      </div>
    </section>
    <article class="lesson-card" id="lesson-card"></article>`;

  const select = document.getElementById('lesson-select');
  const card = document.getElementById('lesson-card');
  const count = document.getElementById('lesson-count');
  const prev = document.getElementById('prev-lesson');
  const next = document.getElementById('next-lesson');

  function showLesson(index) {
    currentLesson = Math.max(0, Math.min(Number(index), m.lessons.length - 1));
    const lesson = m.lessons[currentLesson];
    select.value = String(currentLesson);
    count.textContent = `Section ${currentLesson + 1} of ${m.lessons.length}`;
    prev.disabled = currentLesson === 0;
    next.disabled = currentLesson === m.lessons.length - 1;
    card.innerHTML = `<h3>${lesson.title}</h3>${lesson.body()}`;
  }

  select.addEventListener('change', () => showLesson(select.value));
  prev.addEventListener('click', () => showLesson(currentLesson - 1));
  next.addEventListener('click', () => showLesson(currentLesson + 1));
  showLesson(currentLesson);
}

function renderCheck() {
  const qs = checks[currentModule];
  const saved = state.checks[currentModule] || {};
  const correct = Object.values(saved).filter(v => v.correct).length;
  panel.innerHTML = hero() + `<section class="quiz-card"><div class="quiz-top"><div><h3>Quick Check</h3><p>Answer from memory. You can change an answer until you check it.</p></div><span class="score-pill">${correct}/${qs.length} correct</span></div><div id="questions">${qs.map((x,i) => questionHTML(x,i,saved[i])).join('')}</div><button class="reset-btn" id="reset-check">Reset this topic</button></section>`;
  panel.querySelectorAll('.option').forEach(o => o.addEventListener('click', () => selectOption(o)));
  panel.querySelectorAll('.check-btn').forEach(b => b.addEventListener('click', () => checkQuestion(Number(b.dataset.i))));
  document.getElementById('reset-check').addEventListener('click', () => {
    if (confirm('Reset Quick Check progress for this topic?')) {
      state.checks[currentModule] = {};
      saveState();
      renderCheck();
    }
  });
}

function questionHTML(x,i,s) {
  return `<div class="question-card" id="q-${i}"><div class="question-meta"><span>Question ${i+1}</span><span>1 mark</span></div><div class="question-text">${x.text}</div><div class="options">${x.options.map((op,j) => `<label class="option ${s&&s.checked?(j===x.answer?'correct':(j===s.selected&&j!==x.answer?'wrong':'')):''}" data-i="${i}" data-j="${j}"><input type="radio" name="q${i}" value="${j}" ${s&&s.selected===j?'checked':''} ${s&&s.checked?'disabled':''}><span><strong>${String.fromCharCode(65+j)}.</strong> ${op}</span></label>`).join('')}</div><button class="check-btn" data-i="${i}" ${s&&s.checked?'disabled':''}>${s&&s.checked?'Checked':'Check answer'}</button>${s&&s.checked?`<div class="feedback ${s.correct?'good':'bad'}">${s.correct?'Correct.':'Not quite.'} ${x.explanation}</div>`:''}</div>`;
}

function selectOption(label) {
  const i = Number(label.dataset.i), j = Number(label.dataset.j);
  const card = document.getElementById(`q-${i}`);
  if (card.querySelector('.check-btn').disabled) return;
  card.querySelectorAll('.option').forEach(x => x.classList.remove('picked'));
  label.classList.add('picked');
  label.querySelector('input').checked = true;
  state.checks[currentModule][i] = {selected:j, checked:false, correct:false};
  saveState();
}

function checkQuestion(i) {
  const x = checks[currentModule][i];
  const card = document.getElementById(`q-${i}`);
  const radio = card.querySelector('input:checked');
  if (!radio) {
    card.insertAdjacentHTML('beforeend','<div class="feedback bad">Choose an answer first.</div>');
    return;
  }
  const selected = Number(radio.value), correct = selected === x.answer;
  const wasCorrect = state.checks[currentModule][i]?.correct;
  state.checks[currentModule][i] = {selected, checked:true, correct};
  if (correct && !wasCorrect) state.xp += 10;
  saveState();
  renderCheck();
}

function renderExam() {
  const es = exams[currentModule];
  const saved = state.exam[currentModule] || {};
  const earned = Object.values(saved).reduce((a,v) => a + (v.mark || 0), 0);
  const total = es.reduce((a,v) => a + v.marks, 0);
  panel.innerHTML = hero() + `<section class="exam-card"><div class="exam-top"><div><h3>GCSE-style Exam Practice</h3><p>Write a full answer first. Then reveal the marking points and mark yourself fairly.</p></div><span class="score-pill">${earned}/${total} marks banked</span></div>${es.map((x,i) => examHTML(x,i,saved[i])).join('')}<button class="reset-btn" id="reset-exam">Reset exam marks</button></section>`;
  panel.querySelectorAll('.show-answer-btn').forEach(b => b.addEventListener('click', () => document.getElementById(`scheme-${b.dataset.i}`).classList.toggle('open')));
  panel.querySelectorAll('.mark-button').forEach(b => b.addEventListener('click', () => selfMark(b)));
  document.getElementById('reset-exam').addEventListener('click', () => {
    if (confirm('Reset exam self-marks for this topic?')) {
      state.exam[currentModule] = {};
      saveState();
      renderExam();
    }
  });
}

function examHTML(x,i,s) {
  return `<div class="question-card"><div class="question-meta"><span class="exam-command">${x.title}</span><span class="marks">[${x.marks} marks]</span></div><div class="question-text">${x.prompt}</div><textarea class="short-answer" placeholder="Write your answer here..."></textarea><button class="show-answer-btn" data-i="${i}">Show marking points</button><div class="mark-scheme" id="scheme-${i}"><strong>Indicative marking points:</strong><ul>${x.scheme.map(p => `<li>${p}</li>`).join('')}</ul><div class="self-mark"><span>My mark:</span>${Array.from({length:x.marks+1},(_,m) => `<button class="mark-button ${s&&s.mark===m?'selected':''}" data-i="${i}" data-mark="${m}">${m}</button>`).join('')}<span>/ ${x.marks}</span></div></div></div>`;
}

function selfMark(btn) {
  const i = Number(btn.dataset.i), mark = Number(btn.dataset.mark);
  const prev = state.exam[currentModule][i]?.mark || 0;
  state.exam[currentModule][i] = {mark};
  if (mark > prev) state.xp += (mark - prev) * 5;
  saveState();
  renderExam();
}

function moduleStats(id) {
  const c = state.checks?.[id] || {};
  const qs = checks[id].length;
  const correct = Object.values(c).filter(v => v.correct).length;
  const checkPct = correct / qs * 100;
  const eSaved = state.exam?.[id] || {};
  const earned = Object.values(eSaved).reduce((a,v) => a + (v.mark || 0), 0);
  const total = exams[id].reduce((a,v) => a + v.marks, 0);
  const examPct = total ? earned / total * 100 : 0;
  const mastery = Math.round((checkPct + examPct) / 2);
  const unlocked = correct >= Math.ceil(qs * .7) && earned >= Math.ceil(total * .5);
  return {correct, qs, earned, total, mastery, unlocked};
}

function updateDashboard() {
  ensure();
  xpTotal.textContent = state.xp || 0;
  const unlocked = Object.keys(modules).filter(id => moduleStats(id).unlocked).length;
  gamesBadge.textContent = `${unlocked}/4`;
  dashboardProgress.innerHTML = Object.entries(modules).map(([id,m]) => {
    const s = moduleStats(id);
    return `<div class="section-progress-row"><div class="section-progress-head"><span>${m.short}</span><strong>${s.mastery}%</strong></div><div class="progress-track"><span style="width:${s.mastery}%"></span></div><p>${s.unlocked?`${games[id].name} unlocked`:`Need 70% Quick Check + 50% exam marks to unlock ${games[id].name}`}</p></div>`;
  }).join('');
}

function renderGames() {
  const stats = Object.fromEntries(Object.keys(modules).map(id => [id,moduleStats(id)]));
  panel.innerHTML = `<section class="module-hero" style="--module:#193b67"><span class="module-number">REVISION ARCADE</span><h2>Earn the games</h2><p>These are just arcade games—no extra science questions. Master revision first, then take a short break.</p></section><div class="arcade-grid">${Object.entries(modules).map(([id,m]) => {
    const s = stats[id], g = games[id];
    return `<article class="arcade-card ${s.unlocked?'':'locked'}" id="game-${id}"><span class="lock-banner">${s.unlocked?'Unlocked ✓':'Locked 🔒'}</span><div class="arcade-icon">${g.icon}</div><h3>${g.name}</h3><p>Unlocked by ${m.short}: ${s.correct}/${s.qs} Quick Check and ${s.earned}/${s.total} exam marks.</p>${s.unlocked?`<button class="game-btn" data-game="${id}">Play</button>`:''}<div class="game-slot" id="slot-${id}"></div></article>`;
  }).join('')}</div>`;
  panel.querySelectorAll('.game-btn').forEach(b => b.addEventListener('click', () => launchGame(b.dataset.game)));
}

function launchGame(id) {
  document.querySelectorAll('.game-slot').forEach(s => s.innerHTML = '');
  if (id === 'atoms') spaceGame(document.getElementById('slot-atoms'));
  if (id === 'forces') breakoutGame(document.getElementById('slot-forces'));
  if (id === 'acids') snakeGame(document.getElementById('slot-acids'));
  if (id === 'genetics') pongGame(document.getElementById('slot-genetics'));
}
