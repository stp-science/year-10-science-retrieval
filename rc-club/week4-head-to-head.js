import { adminEmail } from './firebase-config.js';

const $ = (id) => document.getElementById(id);
const formatSelect = $('raceFormat');
const raceWeek = $('raceWeek');
const generateButton = $('generateRaceButton');
const heatSizeWrap = $('heatSizeWrap');
const raceDisplay = $('raceDisplay');
const emptyRace = $('emptyRace');

const FORMAT = 'week4-seeded-head-to-head';
const WEEK = 4;
const RACES_PER_DRIVER = 4;
const POINTS_PER_WIN = 2;

let latestData = null;
let auth = null;
let firestore = null;
let championshipRef = null;
let currentUser = null;

const esc = (value) => String(value ?? '')
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#039;');

const wait = (ms) => new Promise((resolve) => window.setTimeout(resolve, ms));

function showMessage(message, error = false) {
  const toast = $('toast');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.toggle('error', error);
  toast.classList.remove('hidden');
  window.setTimeout(() => toast.classList.add('hidden'), 4200);
}

function parseRace(source = latestData) {
  if (!source || typeof source.currentRaceJson !== 'string' || !source.currentRaceJson) return null;
  try {
    return JSON.parse(source.currentRaceJson);
  } catch (error) {
    console.error('Could not read Week 4 race data:', error);
    return null;
  }
}

function authorised() {
  return String(currentUser?.email || '').toLowerCase() === String(adminEmail || '').toLowerCase();
}

function studentName(id) {
  return latestData?.students?.find((student) => student.id === id)?.name || 'Unknown driver';
}

function injectWeek4Option() {
  if (!formatSelect || [...formatSelect.options].some((option) => option.value === FORMAT)) return;
  const option = document.createElement('option');
  option.value = FORMAT;
  option.textContent = '🏎️ Week 4 Big Machines — seeded head-to-head (2 pts per win)';
  const before = [...formatSelect.options].find((item) => item.value === 'knockout-random');
  if (before) formatSelect.insertBefore(option, before);
  else formatSelect.appendChild(option);
}

function applyWeek4Ui() {
  if (!formatSelect || formatSelect.value !== FORMAT) return;
  if (raceWeek) {
    raceWeek.value = String(WEEK);
    raceWeek.disabled = true;
  }
  heatSizeWrap?.classList.add('hidden');
  if (generateButton) generateButton.textContent = '🏎️ Generate Week 4 Seeded Race Schedule';
}

function seedStandings(ids, stored) {
  const weeks = stored.weeks || [];
  const students = stored.students || [];
  const totalBeforeWeek4 = (id) => weeks
    .filter((week) => Number(week.number) !== WEEK)
    .reduce((sum, week) => sum + Number(week.points?.[id] || 0), 0);
  const winsBeforeWeek4 = (id) => weeks
    .filter((week) => Number(week.number) !== WEEK)
    .reduce((sum, week) => sum + (Number(week.places?.[id]) === 1 ? 1 : 0), 0);
  const name = (id) => students.find((student) => student.id === id)?.name || '';

  return [...ids].sort((a, b) =>
    totalBeforeWeek4(b) - totalBeforeWeek4(a) ||
    winsBeforeWeek4(b) - winsBeforeWeek4(a) ||
    name(a).localeCompare(name(b))
  );
}

function alternatingSeedLayout(seedOrder) {
  const layout = [];
  let high = 0;
  let low = seedOrder.length - 1;
  while (high <= low) {
    layout.push(seedOrder[high]);
    high += 1;
    if (high <= low) {
      layout.push(seedOrder[low]);
      low -= 1;
    }
  }
  return layout;
}

function canonicalPair(a, b) {
  return String(a) < String(b) ? a + '|' + b : b + '|' + a;
}

function buildSeededPairings(seedOrder) {
  const n = seedOrder.length;
  const matches = [];

  const add = (a, b) => matches.push({ a, b, winner: null, resolved: false });

  if (n === 2) {
    for (let i = 0; i < 4; i += 1) add(seedOrder[0], seedOrder[1]);
    return matches;
  }

  if (n === 3) {
    for (let repeat = 0; repeat < 2; repeat += 1) {
      add(seedOrder[0], seedOrder[2]);
      add(seedOrder[0], seedOrder[1]);
      add(seedOrder[1], seedOrder[2]);
    }
    return matches;
  }

  if (n === 4) {
    add(seedOrder[0], seedOrder[3]);
    add(seedOrder[0], seedOrder[2]);
    add(seedOrder[0], seedOrder[1]);
    add(seedOrder[1], seedOrder[3]);
    add(seedOrder[1], seedOrder[2]);
    add(seedOrder[2], seedOrder[3]);
    add(seedOrder[0], seedOrder[3]);
    add(seedOrder[1], seedOrder[2]);
    return matches;
  }

  const layout = alternatingSeedLayout(seedOrder);
  const seen = new Set();

  for (let i = 0; i < n; i += 1) {
    for (const offset of [1, 2]) {
      const a = layout[i];
      const b = layout[(i + offset) % n];
      const key = canonicalPair(a, b);
      if (!seen.has(key)) {
        seen.add(key);
        add(a, b);
      }
    }
  }

  return matches;
}

function orderMatches(matches) {
  const remaining = matches.map((match, index) => ({ ...match, originalIndex: index }));
  const ordered = [];
  let previous = null;

  while (remaining.length) {
    let bestIndex = 0;
    let bestOverlap = Infinity;

    remaining.forEach((match, index) => {
      const overlap = previous
        ? Number(match.a === previous.a || match.a === previous.b) + Number(match.b === previous.a || match.b === previous.b)
        : 0;
      if (overlap < bestOverlap) {
        bestOverlap = overlap;
        bestIndex = index;
      }
    });

    const [next] = remaining.splice(bestIndex, 1);
    ordered.push({ a: next.a, b: next.b, winner: null, resolved: false });
    previous = next;
  }

  return ordered.map((match, index) => ({ ...match, id: 'w4-race-' + (index + 1) }));
}

function validateFourRaces(ids, matches) {
  const counts = Object.fromEntries(ids.map((id) => [id, 0]));
  matches.forEach((match) => {
    counts[match.a] = (counts[match.a] || 0) + 1;
    counts[match.b] = (counts[match.b] || 0) + 1;
  });
  return ids.every((id) => counts[id] === RACES_PER_DRIVER);
}

function raceStats(race) {
  const stats = Object.fromEntries((race.seedOrder || []).map((id, index) => [id, {
    id,
    seed: index + 1,
    races: 0,
    wins: 0,
    points: 0
  }]));

  (race.matches || []).forEach((match) => {
    if (stats[match.a]) stats[match.a].races += 1;
    if (stats[match.b]) stats[match.b].races += 1;
    if (match.winner && stats[match.winner]) {
      stats[match.winner].wins += 1;
      stats[match.winner].points += POINTS_PER_WIN;
    }
  });

  return Object.values(stats);
}

function renderWeek4(race = parseRace()) {
  if (!race || race.type !== FORMAT || !raceDisplay) return false;

  emptyRace?.classList.add('hidden');
  const meta = $('raceMeta');
  if (meta) meta.textContent = 'Week 4 • Seeded head-to-head • 4 races each • 2 championship points per win';

  const stats = raceStats(race);
  const raceRows = (race.matches || []).map((match, index) => {
    const winner = match.winner;
    return `<tr>
      <td><strong>${index + 1}</strong></td>
      <td>${winner === match.a ? '🏁 ' : ''}<strong>${esc(studentName(match.a))}</strong></td>
      <td>vs</td>
      <td>${winner === match.b ? '🏁 ' : ''}<strong>${esc(studentName(match.b))}</strong></td>
      <td>
        ${winner ? `<strong>${esc(studentName(winner))}</strong> +2 pts` : '<span class="muted">Awaiting result</span>'}
      </td>
      ${authorised() ? `<td>
        <div class="time-trial-entry" style="display:flex;gap:6px;flex-wrap:wrap;">
          <button class="btn ${winner === match.a ? 'btn-primary' : 'btn-ghost'}" data-w4-winner="${index}|${esc(match.a)}">${esc(studentName(match.a))}</button>
          <button class="btn ${winner === match.b ? 'btn-primary' : 'btn-ghost'}" data-w4-winner="${index}|${esc(match.b)}">${esc(studentName(match.b))}</button>
          ${winner ? `<button class="btn btn-ghost" data-w4-undo="${index}">Undo</button>` : ''}
        </div>
      </td>` : ''}
    </tr>`;
  }).join('');

  const summaryRows = stats.map((entry) => `<tr>
    <td><strong>#${entry.seed}</strong></td>
    <td><strong>${esc(studentName(entry.id))}</strong></td>
    <td>${entry.races}/${RACES_PER_DRIVER}</td>
    <td>${entry.wins}</td>
    <td class="time-trial-best"><strong>${entry.points}</strong></td>
  </tr>`).join('');

  raceDisplay.innerHTML = `
    <div class="time-trial-manager week4-head-manager">
      <div class="race-title">
        <div>
          <h3>🏎️ Week 4 Big Machines — Seeded Head-to-Head</h3>
          <div class="muted small">Seeded from the championship standings at the start of Week 4 • every driver races exactly 4 times • each win adds 2 points directly to the championship table</div>
        </div>
        <span class="time-trial-count">${race.seedOrder?.length || 0} drivers • ${race.matches?.length || 0} races</span>
      </div>

      <div class="time-trial-section">
        <div class="time-trial-section-title">🌱 Week 4 seeds</div>
        <p class="muted small time-trial-note">${(race.seedOrder || []).map((id, index) => `#${index + 1} ${esc(studentName(id))}`).join(' • ')}</p>
      </div>

      <div class="time-trial-section">
        <div class="time-trial-section-title">🏁 Race schedule</div>
        <p class="muted small time-trial-note">Only two cars are needed. Work down the list one race at a time. The schedule is balanced so every student has exactly four races${(race.seedOrder?.length || 0) % 2 ? ', even with an odd number of drivers' : ''}.</p>
        <div class="time-trial-table-wrap">
          <table class="time-trial-table">
            <thead><tr><th>Race</th><th>Driver 1</th><th></th><th>Driver 2</th><th>Winner / points</th>${authorised() ? '<th>Award winner</th>' : ''}</tr></thead>
            <tbody>${raceRows}</tbody>
          </table>
        </div>
      </div>

      <div class="time-trial-section">
        <div class="time-trial-section-title">📊 Week 4 progress</div>
        <div class="time-trial-table-wrap">
          <table class="time-trial-table">
            <thead><tr><th>Seed</th><th>Driver</th><th>Scheduled races</th><th>Wins</th><th>W4 championship pts</th></tr></thead>
            <tbody>${summaryRows}</tbody>
          </table>
        </div>
      </div>
    </div>`;

  if (authorised()) bindResultButtons(race);
  return true;
}

async function saveRaceAndPoints(race) {
  const snapshot = await firestore.getDoc(championshipRef);
  if (!snapshot.exists()) throw new Error('Championship data could not be found.');
  const stored = snapshot.data() || {};
  const weeks = JSON.parse(JSON.stringify(stored.weeks || []));
  const week4 = weeks.find((week) => Number(week.number) === WEEK);
  if (!week4) throw new Error('Week 4 could not be found.');

  week4.points = {};
  week4.places = {};

  (race.matches || []).forEach((match) => {
    if (!match.winner) return;
    week4.points[match.winner] = Number(week4.points[match.winner] || 0) + POINTS_PER_WIN;
  });

  race.updatedAt = new Date().toISOString();
  await firestore.setDoc(championshipRef, {
    weeks,
    currentRaceJson: JSON.stringify(race),
    updatedAt: race.updatedAt
  }, { merge: true });
}

function bindResultButtons(race) {
  document.querySelectorAll('[data-w4-winner]').forEach((button) => {
    button.addEventListener('click', async () => {
      const [indexText, winnerId] = button.dataset.w4Winner.split('|');
      const index = Number(indexText);
      const fresh = await firestore.getDoc(championshipRef);
      const stored = fresh.data() || {};
      const currentRace = parseRace(stored);
      if (!currentRace || currentRace.type !== FORMAT || !currentRace.matches?.[index]) return;
      const match = currentRace.matches[index];
      if (![match.a, match.b].includes(winnerId)) return;
      match.winner = winnerId;
      match.resolved = true;
      try {
        await saveRaceAndPoints(currentRace);
        showMessage(`${studentName(winnerId)} awarded 2 championship points.`);
      } catch (error) {
        console.error(error);
        showMessage('Could not save the Week 4 result.', true);
      }
    });
  });

  document.querySelectorAll('[data-w4-undo]').forEach((button) => {
    button.addEventListener('click', async () => {
      const index = Number(button.dataset.w4Undo);
      const fresh = await firestore.getDoc(championshipRef);
      const stored = fresh.data() || {};
      const currentRace = parseRace(stored);
      if (!currentRace || currentRace.type !== FORMAT || !currentRace.matches?.[index]) return;
      currentRace.matches[index].winner = null;
      currentRace.matches[index].resolved = false;
      try {
        await saveRaceAndPoints(currentRace);
        showMessage('Race result removed and Week 4 points recalculated.');
      } catch (error) {
        console.error(error);
        showMessage('Could not undo the Week 4 result.', true);
      }
    });
  });
}

async function generateWeek4(event) {
  if (formatSelect?.value !== FORMAT) return;
  event.preventDefault();
  event.stopImmediatePropagation();

  if (!authorised()) {
    showMessage('Sign in through Teacher Admin first.', true);
    return;
  }

  const present = [...document.querySelectorAll('[data-attendance]:checked')].map((checkbox) => checkbox.dataset.attendance);
  if (present.length < 2) {
    showMessage('Select at least two students for Week 4.', true);
    return;
  }

  try {
    const snapshot = await firestore.getDoc(championshipRef);
    if (!snapshot.exists()) throw new Error('Championship data could not be found.');
    const stored = snapshot.data() || {};
    latestData = stored;

    const existing = parseRace(stored);
    const sameDrivers = existing?.type === FORMAT &&
      [...(existing.present || [])].sort().join('|') === [...present].sort().join('|');

    if (sameDrivers) {
      showMessage('The Week 4 schedule already exists. Continuing with the saved races.');
      document.querySelector('[data-tab="race-day"]')?.click();
      renderWeek4(existing);
      return;
    }

    const week4 = (stored.weeks || []).find((week) => Number(week.number) === WEEK);
    const hasWeek4Points = Object.values(week4?.points || {}).some((value) => Number(value) !== 0);
    if (hasWeek4Points && !window.confirm('Week 4 already has championship points saved. Generate a new schedule and reset those Week 4 points?')) return;

    const seedOrder = seedStandings(present, stored);
    const pairings = orderMatches(buildSeededPairings(seedOrder));

    if (!validateFourRaces(present, pairings)) {
      throw new Error('Could not create an equal four-race schedule.');
    }

    const race = {
      type: FORMAT,
      label: 'Week 4 Big Machines — Seeded Head-to-Head',
      week: WEEK,
      present,
      seedOrder,
      racesPerDriver: RACES_PER_DRIVER,
      pointsPerWin: POINTS_PER_WIN,
      matches: pairings,
      createdAt: new Date().toISOString()
    };

    const weeks = JSON.parse(JSON.stringify(stored.weeks || []));
    const targetWeek = weeks.find((week) => Number(week.number) === WEEK);
    if (targetWeek) {
      targetWeek.points = {};
      targetWeek.places = {};
    }

    await firestore.setDoc(championshipRef, {
      weeks,
      currentRaceJson: JSON.stringify(race),
      updatedAt: new Date().toISOString()
    }, { merge: true });

    showMessage(`Week 4 schedule created: ${pairings.length} races, exactly 4 races per driver.`);
    document.querySelector('[data-tab="race-day"]')?.click();
  } catch (error) {
    console.error('Could not create Week 4 schedule:', error);
    showMessage(error?.message || 'Could not create the Week 4 schedule.', true);
  }
}

async function initialise() {
  injectWeek4Option();
  formatSelect?.addEventListener('change', applyWeek4Ui);
  generateButton?.addEventListener('click', generateWeek4, true);

  const appModule = await import('https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js');
  const authModule = await import('https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js');
  const firestoreModule = await import('https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js');

  let app = null;
  for (let attempt = 0; attempt < 150; attempt += 1) {
    if (appModule.getApps().length) {
      app = appModule.getApps()[0];
      break;
    }
    await wait(100);
  }
  if (!app) {
    showMessage('Week 4 manager could not connect to Firebase.', true);
    return;
  }

  auth = authModule.getAuth(app);
  const db = firestoreModule.getFirestore(app);
  championshipRef = firestoreModule.doc(db, 'rcClub', 'data');
  firestore = firestoreModule;
  currentUser = auth.currentUser;

  authModule.onAuthStateChanged(auth, (user) => {
    currentUser = user;
    window.setTimeout(() => renderWeek4(), 0);
  });

  firestoreModule.onSnapshot(championshipRef, (snapshot) => {
    if (!snapshot.exists()) return;
    latestData = snapshot.data();
    window.setTimeout(() => {
      injectWeek4Option();
      applyWeek4Ui();
      renderWeek4(parseRace(latestData));
    }, 0);
  });

  const observer = new MutationObserver(() => {
    const race = parseRace();
    if (race?.type === FORMAT && !raceDisplay?.querySelector('.week4-head-manager')) {
      window.setTimeout(() => renderWeek4(race), 0);
    }
  });
  if (raceDisplay) observer.observe(raceDisplay, { childList: true });

  applyWeek4Ui();
}

initialise();
