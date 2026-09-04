import { adminEmail } from './firebase-config.js';

const FORMAT = 'week5-seeded-relay';
const ROTATION_VERSION = 2;
const TEACHER_ID = 'teacher-mr-lea';

const wait = (ms) => new Promise((resolve) => window.setTimeout(resolve, ms));

function showMessage(message, error = false) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.toggle('error', error);
  toast.classList.remove('hidden');
  window.setTimeout(() => toast.classList.add('hidden'), 4200);
}

function shuffle(items) {
  const output = [...items];
  for (let i = output.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [output[i], output[j]] = [output[j], output[i]];
  }
  return output;
}

function teamKey(members) {
  return [...members].sort().join('|');
}

function pairKey(a, b) {
  return String(a) < String(b) ? `${a}|${b}` : `${b}|${a}`;
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

function teammateMap(teams) {
  const map = new Map();
  teams.forEach((team) => {
    team.members.forEach((id) => {
      if (!map.has(id)) map.set(id, new Set());
      team.members.forEach((other) => {
        if (other !== id) map.get(id).add(other);
      });
    });
  });
  return map;
}

function everyoneGetsNewTeammate(candidate, previousMap) {
  const candidateMap = teammateMap(candidate);
  for (const [id, newMates] of candidateMap.entries()) {
    const oldMates = previousMap.get(id) || new Set();
    if (![...newMates].some((mate) => !oldMates.has(mate))) return false;
  }
  return true;
}

function repeatedPairCount(candidate, previousPairs) {
  let repeats = 0;
  candidate.forEach((team) => {
    for (let i = 0; i < team.members.length; i += 1) {
      for (let j = i + 1; j < team.members.length; j += 1) {
        if (previousPairs.has(pairKey(team.members[i], team.members[j]))) repeats += 1;
      }
    }
  });
  return repeats;
}

function bucketFor(id, seedOrder) {
  if (id === TEACHER_ID) return null;
  const index = seedOrder.indexOf(id);
  if (index < 0) return null;
  const n = seedOrder.length;
  if (index < Math.ceil(n / 3)) return 0;
  if (index < Math.ceil((2 * n) / 3)) return 1;
  return 2;
}

function rankingBalancePenalty(candidate, seedOrder) {
  let penalty = 0;
  candidate.forEach((team) => {
    const counts = [0, 0, 0];
    team.members.forEach((id) => {
      const bucket = bucketFor(id, seedOrder);
      if (bucket !== null) counts[bucket] += 1;
    });
    counts.forEach((count) => {
      if (count > 1) penalty += (count - 1) * (count - 1);
    });
  });
  return penalty;
}

function makeCandidate(participants, targetSizes, raceNumber) {
  const ordered = shuffle(participants);
  const sizes = shuffle(targetSizes);
  const teams = [];
  let cursor = 0;
  sizes.forEach((size, index) => {
    teams.push({
      id: `w5-r${raceNumber}-team-${index + 1}`,
      name: `Team ${index + 1}`,
      members: ordered.slice(cursor, cursor + size)
    });
    cursor += size;
  });
  return teams;
}

function rotateTeams(race) {
  const firstRace = race.relayRaces?.[0];
  const secondRace = race.relayRaces?.[1];
  if (!firstRace?.teams?.length || !secondRace) return null;

  const participants = firstRace.teams.flatMap((team) => team.members);
  const targetSizes = Array.isArray(race.teamSizes) && race.teamSizes.length
    ? [...race.teamSizes]
    : secondRace.teams.map((team) => team.members.length);

  if (targetSizes.reduce((sum, size) => sum + Number(size || 0), 0) !== participants.length) return null;

  const firstKeys = new Set(firstRace.teams.map((team) => teamKey(team.members)));
  const previousPairs = teammatePairs(firstRace.teams);
  const previousMap = teammateMap(firstRace.teams);
  const seedOrder = race.seedOrder || participants.filter((id) => id !== TEACHER_ID);

  let best = null;
  let bestScore = Infinity;

  for (let attempt = 0; attempt < 20000; attempt += 1) {
    const candidate = makeCandidate(participants, targetSizes, 2);
    const exactRepeats = candidate.filter((team) => firstKeys.has(teamKey(team.members))).length;
    const allRotated = everyoneGetsNewTeammate(candidate, previousMap);
    const repeatPairs = repeatedPairCount(candidate, previousPairs);
    const balancePenalty = rankingBalancePenalty(candidate, seedOrder);

    const score =
      exactRepeats * 10000000 +
      (allRotated ? 0 : 1000000) +
      repeatPairs * 10000 +
      balancePenalty * 100;

    if (score < bestScore) {
      best = candidate;
      bestScore = score;
    }

    if (exactRepeats === 0 && allRotated && repeatPairs === 0 && balancePenalty === 0) break;
  }

  if (!best) return null;
  const hasExactRepeat = best.some((team) => firstKeys.has(teamKey(team.members)));
  if (hasExactRepeat || !everyoneGetsNewTeammate(best, previousMap)) return null;

  return best;
}

async function initialise() {
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
  if (!app) return;

  const auth = authModule.getAuth(app);
  const db = firestoreModule.getFirestore(app);
  const ref = firestoreModule.doc(db, 'rcClub', 'data');
  let updating = false;

  const authorised = () => String(auth.currentUser?.email || '').toLowerCase() === String(adminEmail || '').toLowerCase();

  firestoreModule.onSnapshot(ref, async (snapshot) => {
    if (updating || !authorised() || !snapshot.exists()) return;

    const stored = snapshot.data() || {};
    if (typeof stored.currentRaceJson !== 'string' || !stored.currentRaceJson) return;

    let race = null;
    try {
      race = JSON.parse(stored.currentRaceJson);
    } catch {
      return;
    }

    if (race?.type !== FORMAT || Number(race.week) !== 5) return;
    if (Number(race.rotationVersion || 0) >= ROTATION_VERSION) return;

    const secondRace = race.relayRaces?.[1];
    const secondHasResults = Boolean(secondRace?.finalized) || Object.keys(secondRace?.results || {}).length > 0;
    if (secondHasResults) return;

    const rotated = rotateTeams(race);
    if (!rotated) {
      console.warn('Week 5 Race 2 could not be rotated under the current team-size rules.');
      return;
    }

    race.relayRaces[1].teams = rotated;
    race.rotationVersion = ROTATION_VERSION;
    race.rotationRule = 'Race 2 has no repeated full team and every participant gets at least one new teammate.';
    race.updatedAt = new Date().toISOString();

    updating = true;
    try {
      await firestoreModule.setDoc(ref, {
        currentRaceJson: JSON.stringify(race),
        updatedAt: race.updatedAt
      }, { merge: true });
      showMessage('Race 2 teams rotated — every driver has at least one new teammate.');
    } catch (error) {
      console.error('Could not rotate Week 5 Race 2 teams:', error);
      showMessage('Could not rotate the Race 2 teams.', true);
    } finally {
      updating = false;
    }
  });
}

initialise();
