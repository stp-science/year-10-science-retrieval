import { adminEmail } from './firebase-config.js';

const $ = (id) => document.getElementById(id);
const formatSelect = $('raceFormat');
const raceWeek = $('raceWeek');
const generateButton = $('generateRaceButton');
const heatSizeWrap = $('heatSizeWrap');
const raceDisplay = $('raceDisplay');
const emptyRace = $('emptyRace');

const FORMAT = 'week5-seeded-relay';
const WEEK = 5;
const RELAY_RACES = 2;
const FASTEST_LAP_BONUS = 4;
const RACE_DURATION_SECONDS = 570;
const DRIVE_STINT_SECONDS = 150;
const PIT_STOP_SECONDS = 60;
const TEACHER_ID = 'teacher-mr-lea';
const TEACHER_NAME = 'Mr Lea';

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

function authorised() {
  return String(currentUser?.email || '').toLowerCase() === String(adminEmail || '').toLowerCase();
}

function parseRace(source = latestData) {
  if (!source || typeof source.currentRaceJson !== 'string' || !source.currentRaceJson) return null;
  try {
    return JSON.parse(source.currentRaceJson);
  } catch (error) {
    console.error('Could not read Week 5 relay data:', error);
    return null;
  }
}

function studentName(id) {
  if (id === TEACHER_ID) return TEACHER_NAME;
  return latestData?.students?.find((student) => student.id === id)?.name || 'Unknown driver';
}

function isChampionshipDriver(id) {
  return id !== TEACHER_ID;
}

function ensureTeacherOption() {
  const attendanceList = $('attendanceList');
  if (!attendanceList) return;

  const existing = $('week5TeacherFillWrap');
  if (formatSelect?.value !== FORMAT) {
    existing?.remove();
    return;
  }
  if (existing) return;

  const wrap = document.createElement('div');
  wrap.id = 'week5TeacherFillWrap';
  wrap.style.marginTop = '10px';
  wrap.innerHTML = `
    <label class="attendance-item" style="border-top:1px solid rgba(255,255,255,.12);padding-top:10px;">
      <input id="week5TeacherFill" type="checkbox" />
      <span><strong>${TEACHER_NAME}</strong> <span class="muted small">(teacher fill-in — no championship points)</span></span>
    </label>
    <div class="muted small" style="margin-top:6px;">Tick Mr Lea when an odd number of students are racing. He will be used to balance one relay team but is excluded from all championship points.</div>
  `;
  attendanceList.appendChild(wrap);
}

function injectOption() {
  if (!formatSelect || [...formatSelect.options].some((option) => option.value === FORMAT)) return;
  const option = document.createElement('option');
  option.value = FORMAT;
  option.textContent = '🏁 Week 5 Team Relay — 2 seeded relay races';
  const before = [...formatSelect.options].find((item) => item.value === 'teams');
  if (before) formatSelect.insertBefore(option, before);
  else formatSelect.appendChild(option);
}

function applyUi() {
  if (!formatSelect || !raceWeek || !generateButton) return;
  if (formatSelect.value === FORMAT) {
    raceWeek.value = String(WEEK);
    raceWeek.disabled = true;
    heatSizeWrap?.classList.add('hidden');
    generateButton.textContent = '🏁 Generate Week 5 Relay Teams';
    ensureTeacherOption();
  } else {
    if (raceWeek.disabled && raceWeek.value === String(WEEK)) raceWeek.disabled = false;
    if (generateButton.textContent === '🏁 Generate Week 5 Relay Teams') {
      generateButton.textContent = "🎲 Generate Today's Races";
    }
    ensureTeacherOption();
  }
}

function championshipSeedOrder(ids, stored) {
  const weeks = stored.weeks || [];
  const students = stored.students || [];
  const pointsBeforeWeek5 = (id) => weeks
    .filter((week) => Number(week.number) !== WEEK)
    .reduce((sum, week) => sum + Number(week.points?.[id] || 0), 0);
  const winsBeforeWeek5 = (id) => weeks
    .filter((week) => Number(week.number) !== WEEK)
    .reduce((sum, week) => sum + (Number(week.places?.[id]) === 1 ? 1 : 0), 0);
  const name = (id) => students.find((student) => student.id === id)?.name || '';

  return [...ids].sort((a, b) =>
    pointsBeforeWeek5(b) - pointsBeforeWeek5(a) ||
    winsBeforeWeek5(b) - winsBeforeWeek5(a) ||
    name(a).localeCompare(name(b))
  );
}

function relayTeamPlan(participantCount) {
  const preferredTeamSizes = [3, 4, 2];
  for (const teamSize of preferredTeamSizes) {
    if (participantCount % teamSize !== 0) continue;
    const teamCount = participantCount / teamSize;
    if (teamCount >= 2) return { teamSize, teamCount };
  }
  return null;
}

function shuffle(items) {
  const output = [...items];
  for (let i = output.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [output[i], output[j]] = [output[j], output[i]];
  }
  return output;
}

function pairKey(a, b) {
  return String(a) < String(b) ? a + '|' + b : b + '|' + a;
}

function teammatePairs(teams) {
  const pairs = new Set();
  teams.forEach((team) => {
    for (let i = 0; i < team.members.length; i += 1) {
      for (let j = i + 1; j < team.members.length; j += 1) {
        pairs.add(pairKey(team.members[i], team.members[j]));
      }
    }
  });
  return pairs;
}

function makeCandidateTeams(seedOrder, teamCount, raceIndex) {
  const teams = Array.from({ length: teamCount }, (_, index) => ({
    id: 'w5-r' + (raceIndex + 1) + '-team-' + (index + 1),
    name: 'Team ' + (index + 1),
    members: []
  }));

  const layers = [];
  for (let start = 0; start < seedOrder.length; start += teamCount) {
    layers.push(seedOrder.slice(start, start + teamCount));
  }

  layers.forEach((layer, layerIndex) => {
    let ordered = [...layer];

    if (layerIndex > 0) {
      ordered = shuffle(ordered);
    }

    let offset = 0;
    if (layerIndex > 0 && teamCount > 1) {
      offset = Math.floor(Math.random() * teamCount);
    }

    ordered.forEach((studentId, position) => {
      const teamIndex = (position + offset) % teamCount;
      teams[teamIndex].members.push(studentId);
    });
  });

  return teams;
}

function teamBalancePenalty(teams) {
  const sizes = teams.map((team) => team.members.length);
  const min = Math.min(...sizes);
  const max = Math.max(...sizes);
  let penalty = (max - min) * 100;
  sizes.forEach((size) => {
    if (size < 2 || size > 4) penalty += 10000;
  });
  return penalty;
}

function repeatedTeammatePenalty(teams, avoidPairs) {
  let repeats = 0;
  teams.forEach((team) => {
    for (let i = 0; i < team.members.length; i += 1) {
      for (let j = i + 1; j < team.members.length; j += 1) {
        if (avoidPairs.has(pairKey(team.members[i], team.members[j]))) repeats += 1;
      }
    }
  });
  return repeats * 1000;
}

function rankSpreadPenalty(teams, seedOrder) {
  const rank = new Map(seedOrder.map((id, index) => [id, index + 1]));
  let penalty = 0;
  teams.forEach((team) => {
    const ranks = team.members.map((id) => rank.get(id)).filter(Number.isFinite);
    if (ranks.length < 2) return;
    const spread = Math.max(...ranks) - Math.min(...ranks);
    penalty -= spread;
  });
  return penalty;
}

function equalTeamPenalty(teams, teamSize, teacherFill) {
  const sizes = teams.map((team) => team.members.length).sort((a, b) => a - b);
  if (!teacherFill) {
    return sizes.every((size) => size === teamSize) ? 0 : 100000;
  }

  const shortTeams = sizes.filter((size) => size === teamSize - 1).length;
  const fullTeams = sizes.filter((size) => size === teamSize).length;
  return shortTeams === 1 && fullTeams === teams.length - 1 ? 0 : 100000;
}

function generateBalancedTeams(seedOrder, raceIndex, avoidPairs = new Set(), participantCount = seedOrder.length, teacherFill = false) {
  const plan = relayTeamPlan(participantCount);
  if (!plan) return [];

  const { teamCount, teamSize } = plan;
  let best = null;
  let bestScore = Infinity;

  for (let attempt = 0; attempt < 800; attempt += 1) {
    const candidate = makeCandidateTeams(seedOrder, teamCount, raceIndex);
    const score =
      equalTeamPenalty(candidate, teamSize, teacherFill) +
      teamBalancePenalty(candidate) +
      repeatedTeammatePenalty(candidate, avoidPairs) +
      rankSpreadPenalty(candidate, seedOrder);

    if (score < bestScore) {
      bestScore = score;
      best = candidate;
    }
  }

  return best || [];
}

function addTeacherToTeam(teams, previousTeacherMates = new Set()) {
  if (!teams.length) return teams;
  const minSize = Math.min(...teams.map((team) => team.members.length));
  const candidates = teams.filter((team) => team.members.length === minSize);
  candidates.sort((a, b) => {
    const repeatA = a.members.filter((id) => previousTeacherMates.has(id)).length;
    const repeatB = b.members.filter((id) => previousTeacherMates.has(id)).length;
    return repeatA - repeatB;
  });
  candidates[0].members.push(TEACHER_ID);
  return teams;
}

function teacherMates(teams) {
  const team = teams.find((item) => item.members.includes(TEACHER_ID));
  return new Set((team?.members || []).filter((id) => id !== TEACHER_ID));
}

function parseTime(raw) {
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

function formatTime(value) {
  const seconds = Number(value);
  if (!Number.isFinite(seconds)) return '—';
  if (seconds < 60) return seconds.toFixed(3) + ' s';
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds - minutes * 60;
  return minutes + ':' + remainder.toFixed(3).padStart(6, '0');
}

function raceRanking(relayRace) {
  return relayRace.teams
    .map((team) => {
      const result = relayRace.results?.[team.id] || {};
      const laps = Number(result.laps);
      const fastestLap = Number(result.fastestLap);
      return {
        team,
        laps: Number.isFinite(laps) && laps >= 0 ? laps : null,
        fastestLap: Number.isFinite(fastestLap) && fastestLap > 0 ? fastestLap : null
      };
    })
    .sort((a, b) => {
      if (a.laps === null && b.laps === null) return a.team.name.localeCompare(b.team.name);
      if (a.laps === null) return 1;
      if (b.laps === null) return -1;
      if (b.laps !== a.laps) return b.laps - a.laps;
      if (a.fastestLap === null && b.fastestLap === null) return a.team.name.localeCompare(b.team.name);
      if (a.fastestLap === null) return 1;
      if (b.fastestLap === null) return -1;
      return a.fastestLap - b.fastestLap;
    });
}

function fastestTeam(relayRace) {
  const withTimes = relayRace.teams
    .map((team) => ({
      team,
      time: Number(relayRace.results?.[team.id]?.fastestLap)
    }))
    .filter((entry) => Number.isFinite(entry.time) && entry.time > 0)
    .sort((a, b) => a.time - b.time);
  return withTimes[0] || null;
}

function resultPointsForRace(relayRace, scoring) {
  const byStudent = {};
  if (!relayRace.finalized) return byStudent;

  const ranking = raceRanking(relayRace);
  ranking.forEach((entry, index) => {
    if (entry.laps === null) return;
    const points = Number(scoring[index] ?? 0);
    entry.team.members.filter(isChampionshipDriver).forEach((studentId) => {
      byStudent[studentId] = Number(byStudent[studentId] || 0) + points;
    });
  });

  const fastest = fastestTeam(relayRace);
  if (fastest) {
    fastest.team.members.filter(isChampionshipDriver).forEach((studentId) => {
      byStudent[studentId] = Number(byStudent[studentId] || 0) + FASTEST_LAP_BONUS;
    });
  }

  return byStudent;
}

function allWeek5Points(race, scoring) {
  const totals = {};
  (race.relayRaces || []).forEach((relayRace) => {
    const racePoints = resultPointsForRace(relayRace, scoring);
    Object.entries(racePoints).forEach(([studentId, points]) => {
      totals[studentId] = Number(totals[studentId] || 0) + Number(points || 0);
    });
  });
  return totals;
}

function relayInstructions() {
  return `
    <div class="time-trial-section">
      <div class="time-trial-section-title">⏱️ Relay format — 9:30 per race</div>
      <div class="race-grid">
        <div class="race-card"><h4>Stint 1</h4><div class="driver-slot">0:00–2:30 racing</div></div>
        <div class="race-card"><h4>Pit stop 1</h4><div class="driver-slot">2:30–3:30 • 1 minute</div></div>
        <div class="race-card"><h4>Stint 2</h4><div class="driver-slot">3:30–6:00 racing</div></div>
        <div class="race-card"><h4>Pit stop 2</h4><div class="driver-slot">6:00–7:00 • 1 minute</div></div>
        <div class="race-card"><h4>Stint 3</h4><div class="driver-slot">7:00–9:30 racing</div></div>
      </div>
      <p class="muted small time-trial-note">Teams contain 2–4 students depending on attendance. Teams decide their driver order for the three 2:30 driving stints. The race ends at exactly 9:30.</p>
    </div>`;
}

function teamCard(team, seedOrder) {
  const rank = new Map(seedOrder.map((id, index) => [id, index + 1]));
  return `<div class="race-card">
    <h4>${esc(team.name)}</h4>
    ${team.members.map((id) => id === TEACHER_ID
      ? `<div class="driver-slot"><strong>Teacher</strong> ${esc(studentName(id))} <span class="muted small">• no points</span></div>`
      : `<div class="driver-slot"><strong>#${rank.get(id)}</strong> ${esc(studentName(id))}</div>`).join('')}
  </div>`;
}

function pointsSummaryForRelay(relayRace, scoring) {
  if (!relayRace.finalized) return '<span class="muted small">Results not awarded yet.</span>';
  const ranking = raceRanking(relayRace);
  const fastest = fastestTeam(relayRace);

  return ranking.map((entry, index) => {
    if (entry.laps === null) return '';
    const placePoints = Number(scoring[index] ?? 0);
    const bonus = fastest?.team.id === entry.team.id ? FASTEST_LAP_BONUS : 0;
    const teacherNote = entry.team.members.includes(TEACHER_ID) ? ' per student (Mr Lea excluded)' : ' each';
    return `<span class="podium-chip">${index + 1}. ${esc(entry.team.name)} • ${entry.laps} laps • ${placePoints} pts${teacherNote}${bonus ? ' + 4 fastest-lap bonus to student members' : ''}</span>`;
  }).join('');
}

function renderRelayRace(relayRace, raceIndex, seedOrder, scoring) {
  const ranking = raceRanking(relayRace);
  const fastest = fastestTeam(relayRace);

  const resultRows = relayRace.teams.map((team) => {
    const saved = relayRace.results?.[team.id] || {};
    const lapsValue = Number.isFinite(Number(saved.laps)) ? Number(saved.laps) : '';
    const fastestValue = Number.isFinite(Number(saved.fastestLap)) && Number(saved.fastestLap) > 0
      ? formatTime(Number(saved.fastestLap)).replace(' s', '')
      : '';

    const rankedEntry = ranking.find((entry) => entry.team.id === team.id);
    const rankIndex = ranking.findIndex((entry) => entry.team.id === team.id);
    const placeText = relayRace.finalized && rankedEntry?.laps !== null ? String(rankIndex + 1) : '—';

    return `<tr>
      <td><strong>${esc(team.name)}</strong></td>
      <td>${team.members.map((id) => esc(studentName(id))).join(', ')}</td>
      <td>${authorised()
        ? `<input class="input" type="number" min="0" step="1" data-w5-laps="${raceIndex}|${esc(team.id)}" value="${lapsValue}" placeholder="Laps" style="max-width:90px;">`
        : (lapsValue === '' ? '—' : lapsValue)}</td>
      <td>${authorised()
        ? `<input class="input" inputmode="decimal" data-w5-fastest="${raceIndex}|${esc(team.id)}" value="${fastestValue}" placeholder="e.g. 18.450" style="max-width:130px;">`
        : (fastestValue || '—')}</td>
      <td>${placeText}</td>
      <td>${relayRace.finalized && fastest?.team.id === team.id ? '⚡ +4 each' : '—'}</td>
    </tr>`;
  }).join('');

  return `
    <div class="time-trial-section">
      <div class="time-trial-section-title">🏁 Relay Race ${raceIndex + 1}</div>
      <div class="race-grid">
        ${relayRace.teams.map((team) => teamCard(team, seedOrder)).join('')}
      </div>

      <div class="time-trial-table-wrap" style="margin-top:16px;">
        <table class="time-trial-table">
          <thead><tr><th>Team</th><th>Members</th><th>Total laps</th><th>Fastest lap</th><th>Place</th><th>Bonus</th></tr></thead>
          <tbody>${resultRows}</tbody>
        </table>
      </div>

      ${authorised() ? `<div class="time-trial-actions"><button class="btn btn-primary" data-w5-save-race="${raceIndex}">${relayRace.finalized ? 'Update' : 'Award'} Relay Race ${raceIndex + 1} Points</button></div>` : ''}

      <div class="result-podium" style="margin-top:12px;">${pointsSummaryForRelay(relayRace, scoring)}</div>
    </div>`;
}

function renderWeek5(race = parseRace()) {
  if (!race || race.type !== FORMAT || !raceDisplay) return false;

  emptyRace?.classList.add('hidden');
  const meta = $('raceMeta');
  if (meta) meta.textContent = 'Week 5 • Two seeded team relays • 9:30 each • place points + fastest-lap bonus';

  const scoring = latestData?.scoring || [10, 8, 6, 5, 4, 3, 2, 1];
  const totals = allWeek5Points(race, scoring);

  raceDisplay.innerHTML = `
    <div class="time-trial-manager week5-relay-manager">
      <div class="race-title">
        <div>
          <h3>🏁 Week 5 Team Relay</h3>
          <div class="muted small">Two different seeded team races • teams mixed from the top, middle and bottom of the championship standings • Race 2 remixed to minimise repeat teammates</div>
        </div>
        <span class="time-trial-count">${race.present?.length || 0} students${race.teacherFillIn ? ' + Mr Lea' : ''} • ${race.teamCount || ''} equal teams of ${race.teamSize || ''} • 2 relay races</span>
      </div>

      <div class="time-trial-section">
        <div class="time-trial-section-title">🌱 Seeding used</div>
        <p class="muted small time-trial-note">${(race.seedOrder || []).map((id, index) => `#${index + 1} ${esc(studentName(id))}`).join(' • ')}</p>
        <p class="muted small time-trial-note">Every relay team has exactly the same number of people. The generator chooses equal teams of 2, 3 or 4 and balances them using the championship ranking. ${race.teacherFillIn ? 'Mr Lea has been added as a teacher fill-in to make the numbers divide evenly and cannot earn championship points.' : ''}</p>
      </div>

      ${relayInstructions()}

      ${(race.relayRaces || []).map((relayRace, index) => renderRelayRace(relayRace, index, race.seedOrder || [], scoring)).join('')}

      <div class="time-trial-section">
        <div class="time-trial-section-title">🏆 Week 5 championship points earned</div>
        <div class="time-trial-table-wrap">
          <table class="time-trial-table">
            <thead><tr><th>Driver</th><th>Week 5 points</th></tr></thead>
            <tbody>${(race.seedOrder || []).map((id) => `<tr><td><strong>${esc(studentName(id))}</strong></td><td class="time-trial-best"><strong>${Number(totals[id] || 0)}</strong></td></tr>`).join('')}</tbody>
          </table>
        </div>
      </div>
    </div>`;

  if (authorised()) bindRaceResultControls(race);
  return true;
}

async function saveWeek5Points(race) {
  const snapshot = await firestore.getDoc(championshipRef);
  if (!snapshot.exists()) throw new Error('Championship data could not be found.');
  const stored = snapshot.data() || {};
  const weeks = JSON.parse(JSON.stringify(stored.weeks || []));
  const week5 = weeks.find((week) => Number(week.number) === WEEK);
  if (!week5) throw new Error('Week 5 could not be found.');

  const scoring = stored.scoring || [10, 8, 6, 5, 4, 3, 2, 1];
  week5.points = allWeek5Points(race, scoring);
  week5.places = {};

  race.updatedAt = new Date().toISOString();
  await firestore.setDoc(championshipRef, {
    weeks,
    currentRaceJson: JSON.stringify(race),
    updatedAt: race.updatedAt
  }, { merge: true });
}

function bindRaceResultControls(race) {
  document.querySelectorAll('[data-w5-save-race]').forEach((button) => {
    button.addEventListener('click', async () => {
      const raceIndex = Number(button.dataset.w5SaveRace);
      const fresh = await firestore.getDoc(championshipRef);
      if (!fresh.exists()) return;
      const stored = fresh.data() || {};
      latestData = stored;
      const currentRace = parseRace(stored);
      const relayRace = currentRace?.relayRaces?.[raceIndex];
      if (!currentRace || currentRace.type !== FORMAT || !relayRace) return;

      const results = {};
      for (const team of relayRace.teams) {
        const lapsInput = document.querySelector(`[data-w5-laps="${raceIndex}|${CSS.escape(team.id)}"]`);
        const fastestInput = document.querySelector(`[data-w5-fastest="${raceIndex}|${CSS.escape(team.id)}"]`);
        const laps = Number(lapsInput?.value);
        const fastestLap = parseTime(fastestInput?.value);

        if (!Number.isInteger(laps) || laps < 0) {
          showMessage('Enter a whole-number lap total for every team in Relay Race ' + (raceIndex + 1) + '.', true);
          return;
        }
        if (fastestLap === null) {
          showMessage('Enter a valid fastest lap for every team in Relay Race ' + (raceIndex + 1) + '.', true);
          return;
        }

        results[team.id] = {
          laps,
          fastestLap: Number(fastestLap.toFixed(3))
        };
      }

      relayRace.results = results;
      relayRace.finalized = true;
      relayRace.finalizedAt = new Date().toISOString();

      try {
        await saveWeek5Points(currentRace);
        const fastest = fastestTeam(relayRace);
        showMessage('Relay Race ' + (raceIndex + 1) + ' points awarded. ' + (fastest ? fastest.team.name + ' earned the +4 fastest-lap bonus.' : ''));
      } catch (error) {
        console.error(error);
        showMessage('Could not save the Week 5 relay results.', true);
      }
    });
  });
}

async function generateWeek5(event) {
  if (formatSelect?.value !== FORMAT) return;
  event.preventDefault();
  event.stopImmediatePropagation();

  if (!authorised()) {
    showMessage('Sign in through Teacher Admin first.', true);
    return;
  }

  const present = [...document.querySelectorAll('[data-attendance]:checked')].map((checkbox) => checkbox.dataset.attendance);
  const teacherSelected = Boolean($('week5TeacherFill')?.checked);

  if (teacherSelected && present.length % 2 === 0) {
    showMessage('Mr Lea is only needed as the teacher fill-in when an odd number of students are present.', true);
    return;
  }

  if (!teacherSelected && present.length % 2 === 1) {
    showMessage('There is an odd number of students. Tick Mr Lea so the relay teams can all be the same size.', true);
    return;
  }

  if (present.length < 4) {
    showMessage('Week 5 needs at least four students so there can be at least two relay teams.', true);
    return;
  }

  try {
    const snapshot = await firestore.getDoc(championshipRef);
    if (!snapshot.exists()) throw new Error('Championship data could not be found.');
    const stored = snapshot.data() || {};
    latestData = stored;

    const existing = parseRace(stored);
    const sameDrivers = existing?.type === FORMAT &&
      [...(existing.present || [])].sort().join('|') === [...present].sort().join('|') &&
      Boolean(existing.teacherFillIn) === teacherSelected;

    if (sameDrivers) {
      showMessage('The Week 5 relay teams already exist. Continuing with the saved races.');
      document.querySelector('[data-tab="race-day"]')?.click();
      renderWeek5(existing);
      return;
    }

    const week5 = (stored.weeks || []).find((week) => Number(week.number) === WEEK);
    const hasWeek5Points = Object.values(week5?.points || {}).some((value) => Number(value) !== 0);
    if (hasWeek5Points && !window.confirm('Week 5 already has championship points saved. Generate new teams and reset those Week 5 points?')) return;

    const seedOrder = championshipSeedOrder(present, stored);
    const participantCount = present.length + (teacherSelected ? 1 : 0);
    const teamPlan = relayTeamPlan(participantCount);
    if (!teamPlan) {
      throw new Error('Could not split this attendance into equal relay teams of 2, 3 or 4.');
    }

    const teams1 = generateBalancedTeams(seedOrder, 0, new Set(), participantCount, teacherSelected);
    if (teacherSelected) addTeacherToTeam(teams1);

    const avoidPairs = teammatePairs(teams1);
    const previousTeacherMates = teacherSelected ? teacherMates(teams1) : new Set();
    const teams2 = generateBalancedTeams(seedOrder, 1, avoidPairs, participantCount, teacherSelected);
    if (teacherSelected) addTeacherToTeam(teams2, previousTeacherMates);

    if (teams1.length < 2 || teams2.length < 2) {
      throw new Error('Could not create at least two balanced relay teams.');
    }

    const allTeamsEqual = [...teams1, ...teams2].every((team) => team.members.length === teamPlan.teamSize);
    if (!allTeamsEqual) {
      throw new Error('Could not create equal-sized relay teams. Please regenerate the draw.');
    }

    const race = {
      type: FORMAT,
      label: 'Week 5 Team Relay — Two Seeded Races',
      week: WEEK,
      present,
      teacherFillIn: teacherSelected,
      teamSize: teamPlan.teamSize,
      teamCount: teamPlan.teamCount,
      seedOrder,
      relayRaces: [
        { number: 1, teams: teams1, results: {}, finalized: false },
        { number: 2, teams: teams2, results: {}, finalized: false }
      ],
      raceDurationSeconds: RACE_DURATION_SECONDS,
      driveStintSeconds: DRIVE_STINT_SECONDS,
      pitStopSeconds: PIT_STOP_SECONDS,
      fastestLapBonus: FASTEST_LAP_BONUS,
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

    showMessage('Week 5 teams created: ' + teamPlan.teamCount + ' equal teams of ' + teamPlan.teamSize + ' for each relay race.' + (teacherSelected ? ' Mr Lea has been added as the no-points teacher fill-in.' : ''));
    document.querySelector('[data-tab="race-day"]')?.click();
  } catch (error) {
    console.error('Could not generate Week 5 relay teams:', error);
    showMessage(error?.message || 'Could not create the Week 5 relay teams.', true);
  }
}

async function initialise() {
  injectOption();
  formatSelect?.addEventListener('change', applyUi);
  generateButton?.addEventListener('click', generateWeek5, true);

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
    showMessage('Week 5 manager could not connect to Firebase.', true);
    return;
  }

  auth = authModule.getAuth(app);
  const db = firestoreModule.getFirestore(app);
  championshipRef = firestoreModule.doc(db, 'rcClub', 'data');
  firestore = firestoreModule;
  currentUser = auth.currentUser;

  authModule.onAuthStateChanged(auth, (user) => {
    currentUser = user;
    window.setTimeout(() => renderWeek5(), 0);
  });

  firestoreModule.onSnapshot(championshipRef, (snapshot) => {
    if (!snapshot.exists()) return;
    latestData = snapshot.data();
    window.setTimeout(() => {
      injectOption();
      applyUi();
      renderWeek5(parseRace(latestData));
    }, 0);
  });

  const attendanceList = $('attendanceList');
  if (attendanceList) {
    const attendanceObserver = new MutationObserver(() => ensureTeacherOption());
    attendanceObserver.observe(attendanceList, { childList: true });
  }

  const observer = new MutationObserver(() => {
    ensureTeacherOption();
    const race = parseRace();
    if (race?.type === FORMAT && !raceDisplay?.querySelector('.week5-relay-manager')) {
      window.setTimeout(() => renderWeek5(race), 0);
    }
  });
  if (raceDisplay) observer.observe(raceDisplay, { childList: true });

  applyUi();
}

initialise();
