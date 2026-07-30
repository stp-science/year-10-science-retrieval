import { firebaseConfig } from './firebase-config.js';

const appModule = await import('https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js');
const authModule = await import('https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js');
const firestoreModule = await import('https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js');

const firebaseApp = appModule.getApps().length ? appModule.getApps()[0] : appModule.initializeApp(firebaseConfig);
const auth = authModule.getAuth(firebaseApp);
const db = firestoreModule.getFirestore(firebaseApp);
const championshipRef = firestoreModule.doc(db, 'rcClub', 'data');

const $ = (id) => document.getElementById(id);
const raceFormat = $('raceFormat');
const raceWeek = $('raceWeek');
const heatSizeWrap = $('heatSizeWrap');
const generateButton = $('generateRaceButton');
const raceDisplay = $('raceDisplay');
const emptyRace = $('emptyRace');

let latestDocData = null;
let currentUser = auth.currentUser;
let lastRenderedRaceJson = '';

const esc = (value) => String(value ?? '')
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#039;');

function parseRace(data) {
  if (!data || typeof data.currentRaceJson !== 'string' || !data.currentRaceJson) return null;
  try {
    return JSON.parse(data.currentRaceJson);
  } catch (error) {
    console.error('Could not read time trial data:', error);
    return null;
  }
}

function studentName(id) {
  return latestDocData?.students?.find((student) => student.id === id)?.name || 'Unknown driver';
}

function chunkFour(ids) {
  const groups = [];
  for (let index = 0; index < ids.length; index += 4) groups.push(ids.slice(index, index + 4));
  return groups;
}

function bestLap(race, id) {
  const attempts = race?.laps?.[id] || [];
  return attempts.length ? Math.min(...attempts.map(Number).filter(Number.isFinite)) : null;
}

function formatLap(seconds) {
  if (!Number.isFinite(Number(seconds))) return '—';
  const value = Number(seconds);
  if (value < 60) return `${value.toFixed(3)} s`;
  const minutes = Math.floor(value / 60);
  const remainder = value - minutes * 60;
  return `${minutes}:${remainder.toFixed(3).padStart(6, '0')}`;
}

function parseLapInput(raw) {
  const value = String(raw || '').trim();
  if (!value) return null;
  if (value.includes(':')) {
    const parts = value.split(':');
    if (parts.length !== 2) return null;
    const minutes = Number(parts[0]);
    const seconds = Number(parts[1]);
    if (!Number.isFinite(minutes) || !Number.isFinite(seconds) || minutes < 0 || seconds < 0 || seconds >= 60) return null;
    return minutes * 60 + seconds;
  }
  const seconds = Number(value);
  return Number.isFinite(seconds) && seconds > 0 ? seconds : null;
}

function rankingFor(race) {
  return (race.present || [])
    .map((id) => ({ id, best: bestLap(race, id) }))
    .sort((a, b) => {
      if (a.best === null && b.best === null) return studentName(a.id).localeCompare(studentName(b.id));
      if (a.best === null) return 1;
      if (b.best === null) return -1;
      return a.best - b.best || studentName(a.id).localeCompare(studentName(b.id));
    });
}

function showMessage(message, error = false) {
  const toast = $('toast');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.toggle('error', error);
  toast.classList.remove('hidden');
  window.setTimeout(() => toast.classList.add('hidden'), 3600);
}

async function saveRace(race, message) {
  try {
    await firestoreModule.setDoc(championshipRef, {
      currentRaceJson: JSON.stringify(race),
      updatedAt: new Date().toISOString()
    }, { merge: true });
    if (message) showMessage(message);
    return true;
  } catch (error) {
    console.error('Could not save time trial:', error);
    showMessage('Could not save the time trial update.', true);
    return false;
  }
}

function renderGroups(race) {
  return `<div class="time-trial-section">
    <div class="time-trial-section-title">🚦 Track groups — maximum 4 cars at once</div>
    <div class="time-trial-groups">
      ${(race.groups || []).map((group, index) => `
        <div class="time-trial-group">
          <strong>Group ${index + 1}</strong>
          ${group.map((id) => `<span>${esc(studentName(id))}</span>`).join('')}
        </div>`).join('')}
    </div>
    <p class="muted small time-trial-note">These are only track groups. Students can have several attempts during the session and their single fastest lap counts.</p>
  </div>`;
}

function renderLeaderboard(race) {
  const ranking = rankingFor(race);
  return `<div class="time-trial-section">
    <div class="time-trial-section-title">⏱️ Live fastest-lap leaderboard</div>
    <div class="time-trial-table-wrap">
      <table class="time-trial-table">
        <thead><tr><th>Pos</th><th>Driver</th><th>Fastest lap</th><th>Attempts</th>${currentUser ? '<th>Add lap</th>' : ''}</tr></thead>
        <tbody>
          ${ranking.map((entry, index) => {
            const attempts = race.laps?.[entry.id] || [];
            const position = entry.best === null ? '—' : index + 1;
            const attemptText = attempts.length ? attempts.map(formatLap).join(' • ') : 'No time yet';
            return `<tr class="${entry.best !== null && index < 3 ? `time-trial-podium-${index + 1}` : ''}">
              <td class="time-trial-position">${entry.best !== null && index === 0 ? '🥇' : entry.best !== null && index === 1 ? '🥈' : entry.best !== null && index === 2 ? '🥉' : position}</td>
              <td><strong>${esc(studentName(entry.id))}</strong></td>
              <td class="time-trial-best">${formatLap(entry.best)}</td>
              <td class="time-trial-attempts">${esc(attemptText)}</td>
              ${currentUser ? `<td>
                <div class="time-trial-entry">
                  <input class="input time-trial-lap-input" data-lap-input="${esc(entry.id)}" inputmode="decimal" placeholder="e.g. 12.345" aria-label="New lap time for ${esc(studentName(entry.id))}" />
                  <button class="btn btn-primary" data-add-lap="${esc(entry.id)}">Add</button>
                  ${attempts.length ? `<button class="btn btn-ghost" data-undo-lap="${esc(entry.id)}" title="Remove the most recent lap">Undo</button>` : ''}
                </div>
              </td>` : ''}
            </tr>`;
          }).join('')}
        </tbody>
      </table>
    </div>
    ${currentUser ? '<div class="time-trial-actions"><button id="finalizeTimeTrial" class="btn btn-primary">🏁 Finish Week 1 & award championship points</button></div>' : ''}
  </div>`;
}

function bindTimeTrialControls(race) {
  document.querySelectorAll('[data-add-lap]').forEach((button) => {
    button.addEventListener('click', async () => {
      const id = button.dataset.addLap;
      const input = document.querySelector(`[data-lap-input="${CSS.escape(id)}"]`);
      const seconds = parseLapInput(input?.value);
      if (seconds === null || seconds <= 0) {
        showMessage('Enter a valid lap time, for example 12.345 or 1:02.345.', true);
        return;
      }
      race.laps = race.laps || {};
      race.laps[id] = race.laps[id] || [];
      race.laps[id].push(Number(seconds.toFixed(3)));
      await saveRace(race, `${studentName(id)} lap added — ${formatLap(seconds)}.`);
    });
  });

  document.querySelectorAll('[data-undo-lap]').forEach((button) => {
    button.addEventListener('click', async () => {
      const id = button.dataset.undoLap;
      const attempts = race.laps?.[id] || [];
      if (!attempts.length) return;
      attempts.pop();
      await saveRace(race, `${studentName(id)}'s most recent lap was removed.`);
    });
  });

  const finalizeButton = $('finalizeTimeTrial');
  if (finalizeButton) finalizeButton.addEventListener('click', () => finalizeWeekOne(race));
}

function renderTimeTrial(data = latestDocData) {
  latestDocData = data || latestDocData;
  const race = parseRace(latestDocData);
  if (!race || race.type !== 'time-trial') return false;

  emptyRace?.classList.add('hidden');
  const raceMeta = $('raceMeta');
  if (raceMeta) raceMeta.textContent = 'Week 1 • Time Trial • Fastest lap overall';

  const renderedKey = JSON.stringify(race) + `|admin:${Boolean(currentUser)}` + `|students:${latestDocData?.students?.length || 0}`;
  if (lastRenderedRaceJson === renderedKey && raceDisplay?.querySelector('.time-trial-manager')) return true;
  lastRenderedRaceJson = renderedKey;

  raceDisplay.innerHTML = `<div class="time-trial-manager">
    <div class="race-title">
      <div><h3>⏱️ Week 1 Time Trial</h3><div class="muted small">Several attempts allowed • fastest single lap wins</div></div>
      <span class="time-trial-count">${race.present?.length || 0} drivers</span>
    </div>
    ${renderGroups(race)}
    ${renderLeaderboard(race)}
  </div>`;

  if (currentUser) bindTimeTrialControls(race);
  return true;
}

async function finalizeWeekOne(race) {
  const ranked = rankingFor(race).filter((entry) => entry.best !== null);
  const missing = (race.present || []).filter((id) => bestLap(race, id) === null);
  if (!ranked.length) {
    showMessage('Add at least one lap time before finishing Week 1.', true);
    return;
  }
  if (missing.length) {
    const names = missing.map(studentName).join(', ');
    if (!window.confirm(`${names} do not have a lap time yet. Finish Week 1 without them?`)) return;
  }
  if (!window.confirm('Use the current fastest-lap order as the official Week 1 result and award championship points?')) return;

  try {
    const snapshot = await firestoreModule.getDoc(championshipRef);
    const stored = snapshot.data() || {};
    const weeks = JSON.parse(JSON.stringify(stored.weeks || []));
    const weekOne = weeks.find((week) => Number(week.number) === 1);
    if (!weekOne) throw new Error('Week 1 could not be found.');
    weekOne.places = {};
    weekOne.points = {};
    const scoring = stored.scoring || [10, 8, 6, 5, 4, 3, 2, 1];
    ranked.forEach((entry, index) => {
      const place = index + 1;
      weekOne.places[entry.id] = place;
      weekOne.points[entry.id] = Number(scoring[index] ?? 0);
    });
    race.finalizedAt = new Date().toISOString();
    await firestoreModule.setDoc(championshipRef, {
      weeks,
      currentRaceJson: JSON.stringify(race),
      updatedAt: new Date().toISOString()
    }, { merge: true });
    showMessage('Week 1 results and championship points saved.');
  } catch (error) {
    console.error('Could not finalize Week 1:', error);
    showMessage('Could not save the Week 1 results.', true);
  }
}

function applyFormatUi() {
  if (!raceFormat || !raceWeek || !generateButton) return;
  const isTimeTrial = raceFormat.value === 'time-trial';
  if (isTimeTrial) {
    raceWeek.value = '1';
    raceWeek.disabled = true;
    heatSizeWrap?.classList.add('hidden');
    generateButton.textContent = '⏱️ Start / Update Time Trial';
  } else {
    raceWeek.disabled = false;
    generateButton.textContent = "🎲 Generate Today's Races";
  }
}

async function startTimeTrial(event) {
  if (raceFormat?.value !== 'time-trial') return;
  event.preventDefault();
  event.stopImmediatePropagation();

  const present = [...document.querySelectorAll('[data-attendance]:checked')].map((checkbox) => checkbox.dataset.attendance);
  if (!present.length) {
    showMessage('Tick the students who are present first.', true);
    return;
  }
  if (!currentUser) {
    showMessage('Teacher Admin must be signed in to start the time trial.', true);
    return;
  }

  try {
    const snapshot = await firestoreModule.getDoc(championshipRef);
    const stored = snapshot.data() || {};
    const existingRace = parseRace(stored);
    const existingLaps = existingRace?.type === 'time-trial' ? existingRace.laps || {} : {};
    const laps = {};
    present.forEach((id) => { laps[id] = existingLaps[id] || []; });

    const race = {
      type: 'time-trial',
      label: 'Week 1 Time Trial — Fastest Lap',
      week: 1,
      present,
      groups: chunkFour(present),
      laps,
      createdAt: existingRace?.type === 'time-trial' ? existingRace.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    await saveRace(race, 'Week 1 time trial ready. Add lap times as students complete attempts.');
    document.querySelector('[data-tab="race-day"]')?.click();
  } catch (error) {
    console.error('Could not start time trial:', error);
    showMessage('Could not start the Week 1 time trial.', true);
  }
}

raceFormat?.addEventListener('change', applyFormatUi);
generateButton?.addEventListener('click', startTimeTrial, true);

authModule.onAuthStateChanged(auth, (user) => {
  currentUser = user;
  window.setTimeout(() => renderTimeTrial(), 0);
});

firestoreModule.onSnapshot(championshipRef, (snapshot) => {
  if (!snapshot.exists()) return;
  latestDocData = snapshot.data();
  window.setTimeout(() => {
    applyFormatUi();
    renderTimeTrial(latestDocData);
  }, 0);
});

const displayObserver = new MutationObserver(() => {
  const race = parseRace(latestDocData);
  if (race?.type === 'time-trial' && !raceDisplay?.querySelector('.time-trial-manager')) {
    window.setTimeout(() => renderTimeTrial(latestDocData), 0);
  }
});
if (raceDisplay) displayObserver.observe(raceDisplay, { childList: true });

applyFormatUi();
