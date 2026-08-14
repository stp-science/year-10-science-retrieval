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
const week = $('raceWeek');
const button = $('generateRaceButton');
const display = $('raceDisplay');
const empty = $('emptyRace');
let data = null;
let user = auth.currentUser;

const esc = (v) => String(v ?? '').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#039;');
const norm = (v) => String(v || '').trim().toLowerCase().replace(/\s+/g,' ');
const nameFor = (id) => data?.students?.find((s) => s.id === id)?.name || 'Unknown driver';

function parseRace(source = data) {
  try { return source?.currentRaceJson ? JSON.parse(source.currentRaceJson) : null; }
  catch { return null; }
}

function parseTime(raw) {
  const v = String(raw || '').trim();
  if (!v) return null;
  if (v.includes(':')) {
    const p = v.split(':');
    if (p.length !== 2) return null;
    const m = Number(p[0]), s = Number(p[1]);
    return Number.isFinite(m) && Number.isFinite(s) && m >= 0 && s >= 0 && s < 60 ? m * 60 + s : null;
  }
  const s = Number(v);
  return Number.isFinite(s) && s > 0 ? s : null;
}

function formatTime(value) {
  const s = Number(value);
  if (!Number.isFinite(s)) return '—';
  if (s < 60) return `${s.toFixed(3)} s`;
  const m = Math.floor(s / 60), r = s - m * 60;
  return `${m}:${r.toFixed(3).padStart(6,'0')}`;
}

function shuffle(items) {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function findNamed(ids, target) {
  return ids.find((id) => norm(nameFor(id)) === target) || ids.find((id) => norm(nameFor(id)).startsWith(target));
}

function makeOrder(ids) {
  const fixed = [findNamed(ids,'ollie p'), findNamed(ids,'vinsen'), findNamed(ids,'riley')].filter(Boolean);
  return [...fixed, ...shuffle(ids.filter((id) => !fixed.includes(id)))];
}

function toast(message, isError = false) {
  const el = $('toast');
  if (!el) return;
  el.textContent = message;
  el.classList.toggle('error', isError);
  el.classList.remove('hidden');
  setTimeout(() => el.classList.add('hidden'), 3500);
}

async function saveRace(race, message) {
  race.updatedAt = new Date().toISOString();
  await firestoreModule.setDoc(ref, { currentRaceJson: JSON.stringify(race), updatedAt: race.updatedAt }, { merge: true });
  if (message) toast(message);
}

function ranked(race) {
  return (race.order || []).map((id) => {
    const t = Number(race.times?.[id]);
    return { id, time: Number.isFinite(t) && t > 0 ? t : null };
  }).sort((a,b) => a.time === null ? 1 : b.time === null ? -1 : a.time - b.time);
}

function render(race) {
  if (!race || race.type !== 'week3-trial') return;
  empty?.classList.add('hidden');
  if ($('raceMeta')) $('raceMeta').textContent = 'Week 3 • One car at a time • 3 laps • Lowest total time wins';

  const runningRows = (race.order || []).map((id,i) => {
    const t = Number(race.times?.[id]);
    const has = Number.isFinite(t) && t > 0;
    return `<tr><td><strong>${i+1}</strong></td><td><strong>${esc(nameFor(id))}</strong></td><td class="time-trial-best">${has ? formatTime(t) : '—'}</td>${user ? `<td><div class="time-trial-entry"><input class="input time-trial-lap-input" data-w3-input="${esc(id)}" placeholder="e.g. 48.250" inputmode="decimal"><button class="btn btn-primary" data-w3-save="${esc(id)}">${has ? 'Update' : 'Save'}</button>${has ? `<button class="btn btn-ghost" data-w3-clear="${esc(id)}">Clear</button>` : ''}</div></td>` : ''}</tr>`;
  }).join('');

  const leaderboardRows = ranked(race).map((entry,i) => {
    const has = entry.time !== null;
    const pos = has ? (i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1) : '—';
    return `<tr class="${has && i < 3 ? `time-trial-podium-${i+1}` : ''}"><td>${pos}</td><td><strong>${esc(nameFor(entry.id))}</strong></td><td class="time-trial-best">${has ? formatTime(entry.time) : 'Awaiting time'}</td></tr>`;
  }).join('');

  display.innerHTML = `<div class="time-trial-manager week3-trial-manager"><div class="race-title"><div><h3>🏁 Week 3 Driving Trial / Obstacle Rally</h3><div class="muted small">One car at a time • 3 complete laps • enter one total time</div></div><span class="time-trial-count">${race.order?.length || 0} drivers</span></div><div class="time-trial-section"><div class="time-trial-section-title">🚦 Running order</div><div class="time-trial-table-wrap"><table class="time-trial-table"><thead><tr><th>Order</th><th>Driver</th><th>3-lap total</th>${user ? '<th>Enter time</th>' : ''}</tr></thead><tbody>${runningRows}</tbody></table></div></div><div class="time-trial-section"><div class="time-trial-section-title">🏆 Live leaderboard</div><div class="time-trial-table-wrap"><table class="time-trial-table"><thead><tr><th>Pos</th><th>Driver</th><th>3-lap total</th></tr></thead><tbody>${leaderboardRows}</tbody></table></div>${user ? '<div class="time-trial-actions"><button id="finishW3" class="btn btn-primary">🏁 Finish Week 3 & award championship points</button></div>' : ''}</div></div>`;

  if (!user) return;
  document.querySelectorAll('[data-w3-save]').forEach((b) => b.addEventListener('click', async () => {
    const id = b.dataset.w3Save;
    const input = document.querySelector(`[data-w3-input="${CSS.escape(id)}"]`);
    const t = parseTime(input?.value);
    if (t === null) return toast('Enter the total time for all 3 laps.', true);
    race.times ||= {};
    race.times[id] = Number(t.toFixed(3));
    await saveRace(race, `${nameFor(id)} saved: ${formatTime(t)}`);
  }));
  document.querySelectorAll('[data-w3-clear]').forEach((b) => b.addEventListener('click', async () => {
    delete race.times?.[b.dataset.w3Clear];
    await saveRace(race, 'Time cleared.');
  }));
  $('finishW3')?.addEventListener('click', () => finish(race));
}

async function finish(race) {
  const list = ranked(race).filter((x) => x.time !== null);
  if (!list.length) return toast('Enter at least one 3-lap time first.', true);
  if (!confirm('Use this 3-lap ranking as the official Week 3 result and award championship points?')) return;
  const snap = await firestoreModule.getDoc(ref);
  const stored = snap.data() || {};
  const weeks = JSON.parse(JSON.stringify(stored.weeks || []));
  const w3 = weeks.find((w) => Number(w.number) === 3);
  if (!w3) return toast('Week 3 could not be found.', true);
  w3.places = {}; w3.points = {};
  const scoring = stored.scoring || [10,8,6,5,4,3,2,1];
  list.forEach((x,i) => { w3.places[x.id] = i + 1; w3.points[x.id] = Number(scoring[i] ?? 0); });
  race.finalizedAt = new Date().toISOString();
  await firestoreModule.setDoc(ref, { weeks, currentRaceJson: JSON.stringify(race), updatedAt: race.finalizedAt }, { merge: true });
  toast('Week 3 results and championship points saved.');
}

function applyUi() {
  if (fmt?.value !== 'time-trial-week3') return;
  week.value = '3';
  week.disabled = true;
  $('heatSizeWrap')?.classList.add('hidden');
  button.textContent = '🎲 Generate Week 3 Running Order';
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
  const old = parseRace(data);
  const times = old?.type === 'week3-trial' ? old.times || {} : {};
  const race = { type:'week3-trial', week:3, label:'Week 3 Driving Trial / Obstacle Rally — 3-Lap Total', present, order:makeOrder(present), times, createdAt:new Date().toISOString() };
  await saveRace(race, 'Running order created: Ollie P 1st, Vinsen 2nd, Riley 3rd, then the remaining drivers.');
  document.querySelector('[data-tab="race-day"]')?.click();
}

fmt?.addEventListener('change', applyUi);
button?.addEventListener('click', start, true);
authModule.onAuthStateChanged(auth, (u) => { user = u; setTimeout(() => render(parseRace()),0); });
firestoreModule.onSnapshot(ref, (snap) => { if (!snap.exists()) return; data = snap.data(); setTimeout(() => { applyUi(); render(parseRace(data)); },0); });

const observer = new MutationObserver(() => {
  const race = parseRace();
  if (race?.type === 'week3-trial' && !display?.querySelector('.week3-trial-manager')) setTimeout(() => render(race),0);
});
if (display) observer.observe(display,{childList:true});
applyUi();