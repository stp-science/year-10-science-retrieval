import { firebaseConfig } from './firebase-config.js';

const appModule = await import('https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js');
const authModule = await import('https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js');
const firestoreModule = await import('https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js');
const app = appModule.getApps().length ? appModule.getApps()[0] : appModule.initializeApp(firebaseConfig);
const auth = authModule.getAuth(app);
const db = firestoreModule.getFirestore(app);
const ref = firestoreModule.doc(db, 'rcClub', 'data');

const $ = (id) => document.getElementById(id);
const fmt = $('raceFormat');
const weekSelect = $('raceWeek');
const generateButton = $('generateRaceButton');
const display = $('raceDisplay');
const empty = $('emptyRace');
const PENALTY_SECONDS = 5;
let data = null;
let user = auth.currentUser;
let migrationInProgress = false;

const esc = (v) => String(v ?? '').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#039;');
const norm = (v) => String(v || '').trim().toLowerCase().replace(/\s+/g,' ');
const nameFor = (id) => data?.students?.find((s) => s.id === id)?.name || 'Unknown driver';

function parseRace(source = data) {
  try { return source?.currentRaceJson ? JSON.parse(source.currentRaceJson) : null; }
  catch { return null; }
}

function toast(message, error = false) {
  const el = $('toast');
  if (!el) return;
  el.textContent = message;
  el.classList.toggle('error', error);
  el.classList.remove('hidden');
  setTimeout(() => el.classList.add('hidden'), 3500);
}

function parseTime(raw) {
  const v = String(raw || '').trim();
  if (!v) return null;
  if (v.includes(':')) {
    const [mText, sText] = v.split(':');
    const m = Number(mText), s = Number(sText);
    return Number.isFinite(m) && Number.isFinite(s) && m >= 0 && s >= 0 && s < 60 ? m * 60 + s : null;
  }
  const s = Number(v);
  return Number.isFinite(s) && s > 0 ? s : null;
}

function formatTime(value) {
  const seconds = Number(value);
  if (!Number.isFinite(seconds)) return '—';
  if (seconds < 60) return `${seconds.toFixed(3)} s`;
  const m = Math.floor(seconds / 60);
  const s = seconds - m * 60;
  return `${m}:${s.toFixed(3).padStart(6, '0')}`;
}

function shuffle(ids) {
  const out = [...ids];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function named(ids, target) {
  return ids.find((id) => norm(nameFor(id)) === target) || ids.find((id) => norm(nameFor(id)).startsWith(target));
}

function makeOrder(ids) {
  const fixed = [named(ids, 'ollie p'), named(ids, 'vinsen'), named(ids, 'riley')].filter(Boolean);
  return [...fixed, ...shuffle(ids.filter((id) => !fixed.includes(id)))];
}

function normalizeWeek3Race(race) {
  if (!race || Number(race.week) !== 3) return null;
  const present = Array.isArray(race.present) ? race.present : [];
  const order = Array.isArray(race.order) && race.order.length ? race.order : makeOrder(present);
  const times = { ...(race.times || {}) };
  if (race.type === 'time-trial' && race.laps) {
    for (const id of present) {
      if (times[id] !== undefined) continue;
      const attempts = (race.laps[id] || []).map(Number).filter((n) => Number.isFinite(n) && n > 0);
      if (attempts.length) times[id] = Math.min(...attempts);
    }
  }
  return {
    type: 'week3-trial',
    week: 3,
    label: 'Week 3 Driving Trial / Obstacle Rally — 3-Lap Total + Penalties',
    present,
    order,
    times,
    penalties: { ...(race.penalties || {}) },
    penaltySeconds: PENALTY_SECONDS,
    createdAt: race.createdAt || new Date().toISOString(),
    updatedAt: race.updatedAt || new Date().toISOString()
  };
}

async function saveRace(race, message) {
  race.updatedAt = new Date().toISOString();
  await firestoreModule.setDoc(ref, { currentRaceJson: JSON.stringify(race), updatedAt: race.updatedAt }, { merge: true });
  if (message) toast(message);
}

function resultFor(race, id) {
  const raw = Number(race.times?.[id]);
  if (!Number.isFinite(raw) || raw <= 0) return { raw: null, penalties: 0, added: 0, final: null };
  const penalties = Math.max(0, Math.floor(Number(race.penalties?.[id]) || 0));
  const added = penalties * PENALTY_SECONDS;
  return { raw, penalties, added, final: raw + added };
}

function ranking(race) {
  return (race.order || []).map((id) => ({ id, ...resultFor(race, id) })).sort((a, b) => {
    if (a.final === null && b.final === null) return race.order.indexOf(a.id) - race.order.indexOf(b.id);
    if (a.final === null) return 1;
    if (b.final === null) return -1;
    return a.final - b.final;
  });
}

function render(raceInput) {
  const race = normalizeWeek3Race(raceInput);
  if (!race) return false;
  empty?.classList.add('hidden');
  if ($('raceMeta')) $('raceMeta').textContent = 'Week 3 • One car at a time • 3 laps • +5 seconds per mistake';

  const rows = race.order.map((id, index) => {
    const r = resultFor(race, id);
    const saved = r.raw !== null;
    return `<tr>
      <td><strong>${index + 1}</strong></td>
      <td><strong>${esc(nameFor(id))}</strong></td>
      <td>${saved ? formatTime(r.raw) : '—'}</td>
      <td>${saved ? r.penalties : '—'}</td>
      <td>${saved ? `+${r.added} s` : '—'}</td>
      <td class="time-trial-best">${saved ? formatTime(r.final) : '—'}</td>
      ${user ? `<td>
        <div class="time-trial-entry" style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;">
          <input class="input time-trial-lap-input" data-w3-time="${esc(id)}" inputmode="decimal" placeholder="3-lap time" value="${saved ? esc(r.raw) : ''}" style="max-width:140px;">
          <label style="display:flex;align-items:center;gap:5px;white-space:nowrap;"><span>Penalties</span><input class="input" data-w3-pen="${esc(id)}" type="number" min="0" step="1" value="${r.penalties}" style="width:75px;"></label>
          <button class="btn btn-primary" data-w3-save="${esc(id)}">${saved ? 'Update' : 'Save'}</button>
          ${saved ? `<button class="btn btn-ghost" data-w3-clear="${esc(id)}">Clear</button>` : ''}
        </div>
      </td>` : ''}
    </tr>`;
  }).join('');

  const board = ranking(race).map((r, index) => {
    const saved = r.final !== null;
    const pos = !saved ? '—' : index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1;
    return `<tr class="${saved && index < 3 ? `time-trial-podium-${index + 1}` : ''}"><td>${pos}</td><td><strong>${esc(nameFor(r.id))}</strong></td><td>${saved ? formatTime(r.raw) : 'Awaiting time'}</td><td>${saved ? r.penalties : '—'}</td><td>${saved ? `+${r.added} s` : '—'}</td><td class="time-trial-best">${saved ? formatTime(r.final) : '—'}</td></tr>`;
  }).join('');

  display.innerHTML = `<div class="time-trial-manager week3-trial-manager">
    <div class="race-title"><div><h3>🏁 Week 3 Driving Trial / Obstacle Rally</h3><div class="muted small">One car at a time • 3 laps • every mistake = +5 seconds</div></div><span class="time-trial-count">${race.order.length} drivers</span></div>
    <div class="time-trial-section"><div class="time-trial-section-title">🚦 Running order & result entry</div><p class="muted small time-trial-note">Enter the total raw time for all 3 laps and the number of penalties. Final time is calculated automatically.</p><div class="time-trial-table-wrap"><table class="time-trial-table"><thead><tr><th>Order</th><th>Driver</th><th>Raw 3-lap time</th><th>Penalties</th><th>Penalty time</th><th>Final time</th>${user ? '<th>Enter result</th>' : ''}</tr></thead><tbody>${rows}</tbody></table></div></div>
    <div class="time-trial-section"><div class="time-trial-section-title">🏆 Live leaderboard</div><div class="time-trial-table-wrap"><table class="time-trial-table"><thead><tr><th>Pos</th><th>Driver</th><th>Raw time</th><th>Penalties</th><th>Added</th><th>Final time</th></tr></thead><tbody>${board}</tbody></table></div>${user ? '<div class="time-trial-actions"><button id="finishW3" class="btn btn-primary">🏁 Finish Week 3 & award championship points</button></div>' : ''}</div>
  </div>`;

  if (!user) return true;

  document.querySelectorAll('[data-w3-save]').forEach((button) => button.addEventListener('click', async () => {
    const id = button.dataset.w3Save;
    const raw = parseTime(document.querySelector(`[data-w3-time="${CSS.escape(id)}"]`)?.value);
    const penalties = Number(document.querySelector(`[data-w3-pen="${CSS.escape(id)}"]`)?.value ?? 0);
    if (raw === null) return toast('Enter the total time for all 3 laps.', true);
    if (!Number.isInteger(penalties) || penalties < 0) return toast('Penalties must be 0, 1, 2, 3…', true);
    race.times[id] = Number(raw.toFixed(3));
    race.penalties[id] = penalties;
    await saveRace(race, `${nameFor(id)}: ${formatTime(raw)} + ${penalties * 5} s = ${formatTime(raw + penalties * 5)}.`);
  }));

  document.querySelectorAll('[data-w3-clear]').forEach((button) => button.addEventListener('click', async () => {
    const id = button.dataset.w3Clear;
    delete race.times[id];
    delete race.penalties[id];
    await saveRace(race, `${nameFor(id)} result cleared.`);
  }));

  $('finishW3')?.addEventListener('click', async () => {
    const placed = ranking(race).filter((r) => r.final !== null);
    if (!placed.length) return toast('Enter at least one result first.', true);
    if (!confirm('Use these final times, including penalties, as the official Week 3 results?')) return;
    const snap = await firestoreModule.getDoc(ref);
    const stored = snap.data() || {};
    const weeks = JSON.parse(JSON.stringify(stored.weeks || []));
    const w3 = weeks.find((w) => Number(w.number) === 3);
    if (!w3) return toast('Week 3 could not be found.', true);
    w3.places = {};
    w3.points = {};
    const scoring = stored.scoring || [10,8,6,5,4,3,2,1];
    placed.forEach((r, i) => { w3.places[r.id] = i + 1; w3.points[r.id] = Number(scoring[i] ?? 0); });
    race.finalizedAt = new Date().toISOString();
    await firestoreModule.setDoc(ref, { weeks, currentRaceJson: JSON.stringify(race), updatedAt: race.finalizedAt }, { merge: true });
    toast('Week 3 results and championship points saved.');
  });
  return true;
}

function applyUi() {
  if (fmt?.value !== 'time-trial-week3') return;
  if (weekSelect) { weekSelect.value = '3'; weekSelect.disabled = true; }
  $('heatSizeWrap')?.classList.add('hidden');
  if (generateButton) generateButton.textContent = '🎲 Generate Week 3 Running Order';
}

async function start(event) {
  if (fmt?.value !== 'time-trial-week3') return;
  event.preventDefault();
  event.stopImmediatePropagation();
  const present = [...document.querySelectorAll('[data-attendance]:checked')].map((c) => c.dataset.attendance);
  if (!present.length) return toast('Tick the students taking part first.', true);
  if (!user) return toast('Sign in through Teacher Admin first.', true);
  const snap = await firestoreModule.getDoc(ref);
  data = snap.data() || data;
  const old = normalizeWeek3Race(parseRace(data));
  const race = {
    type: 'week3-trial', week: 3,
    label: 'Week 3 Driving Trial / Obstacle Rally — 3-Lap Total + Penalties',
    present,
    order: makeOrder(present),
    times: old?.times || {},
    penalties: old?.penalties || {},
    penaltySeconds: PENALTY_SECONDS,
    createdAt: new Date().toISOString()
  };
  await saveRace(race, 'Week 3 running order created. Ollie P 1st, Vinsen 2nd, Riley 3rd.');
  document.querySelector('[data-tab="race-day"]')?.click();
}

fmt?.addEventListener('change', applyUi);
generateButton?.addEventListener('click', start, true);

authModule.onAuthStateChanged(auth, (u) => {
  user = u;
  setTimeout(() => render(parseRace()), 0);
});

firestoreModule.onSnapshot(ref, async (snap) => {
  if (!snap.exists()) return;
  data = snap.data();
  const original = parseRace(data);
  const normalized = normalizeWeek3Race(original);
  if (user && original && Number(original.week) === 3 && original.type !== 'week3-trial' && normalized && !migrationInProgress) {
    migrationInProgress = true;
    try { await saveRace(normalized); } finally { migrationInProgress = false; }
    return;
  }
  setTimeout(() => { applyUi(); render(original); }, 0);
});

const observer = new MutationObserver(() => {
  const race = parseRace();
  if (Number(race?.week) === 3 && !display?.querySelector('.week3-trial-manager')) setTimeout(() => render(race), 0);
});
if (display) observer.observe(display, { childList: true });
applyUi();