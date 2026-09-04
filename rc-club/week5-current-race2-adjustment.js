import { adminEmail } from './firebase-config.js';

const FORMAT = 'week5-seeded-relay';
const WEEK = 5;
const TEACHER_ID = 'teacher-mr-lea';
const PATCH_ID = '2026-09-04-race2-sam-betham-mr-lea-v2';

const wait = (ms) => new Promise((resolve) => window.setTimeout(resolve, ms));

function normalise(value) {
  return String(value || '').trim().toLowerCase();
}

function showMessage(message, error = false) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.toggle('error', error);
  toast.classList.remove('hidden');
  window.setTimeout(() => toast.classList.add('hidden'), 4200);
}

function teamNames(team, students) {
  return (team?.members || []).map((id) => {
    if (id === TEACHER_ID) return 'mr lea';
    return normalise(students.find((student) => student.id === id)?.name);
  }).filter(Boolean);
}

function hasAll(team, requiredNames, students) {
  const names = new Set(teamNames(team, students));
  return requiredNames.every((name) => names.has(normalise(name)));
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

  return [...new Set(ids)].sort((a, b) =>
    pointsBeforeWeek5(b) - pointsBeforeWeek5(a) ||
    winsBeforeWeek5(b) - winsBeforeWeek5(a) ||
    name(a).localeCompare(name(b))
  );
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
  let applying = false;

  const authorised = () => normalise(auth.currentUser?.email) === normalise(adminEmail);

  async function applyPatch() {
    if (applying || !authorised()) return;
    applying = true;

    try {
      const snapshot = await firestoreModule.getDoc(ref);
      if (!snapshot.exists()) return;

      const stored = snapshot.data() || {};
      const students = stored.students || [];
      if (typeof stored.currentRaceJson !== 'string' || !stored.currentRaceJson) return;

      let race = null;
      try {
        race = JSON.parse(stored.currentRaceJson);
      } catch {
        return;
      }

      if (race?.type !== FORMAT || Number(race.week) !== WEEK) return;
      if (race.manualRace2Patch === PATCH_ID) return;

      const secondRace = race.relayRaces?.[1];
      if (!secondRace?.teams?.length || secondRace.finalized || Object.keys(secondRace.results || {}).length) return;

      const team1 = secondRace.teams.find((team) => hasAll(team, ['Ollie P', 'Sam Bau', 'Vinsen T'], students));
      const team2 = secondRace.teams.find((team) => hasAll(team, ['Ted M', 'Riley C', 'Yimo S'], students));
      if (!team1 || !team2) return;

      const samBetham = students.find((student) => normalise(student.name) === 'sam betham');
      if (!samBetham) {
        showMessage('Could not find Sam Betham in the driver list.', true);
        return;
      }

      secondRace.teams.forEach((team) => {
        team.members = (team.members || []).filter((id) => id !== samBetham.id && id !== TEACHER_ID);
      });

      team1.members.push(samBetham.id);
      team2.members.push(TEACHER_ID);

      race.present = [...new Set([...(race.present || []), samBetham.id])];
      race.seedOrder = championshipSeedOrder(race.present, stored);
      race.teacherFillIn = true;
      race.rotationVersion = 99;
      race.manualRace2Patch = PATCH_ID;
      race.manualRace2Note = 'Race 2 manually adjusted: Sam Betham added to Team 1 and Mr Lea added to Team 2. Sam Betham retains his championship seed.';
      race.updatedAt = new Date().toISOString();

      await firestoreModule.setDoc(ref, {
        currentRaceJson: JSON.stringify(race),
        updatedAt: race.updatedAt
      }, { merge: true });

      showMessage('Race 2 updated: Sam Betham now shows with his championship ranking; Mr Lea remains the no-points teacher fill-in.');
    } catch (error) {
      console.error('Could not apply the Race 2 adjustment:', error);
      showMessage('Could not apply the Race 2 team adjustment.', true);
    } finally {
      applying = false;
    }
  }

  authModule.onAuthStateChanged(auth, () => {
    window.setTimeout(applyPatch, 200);
  });

  if (auth.currentUser) window.setTimeout(applyPatch, 200);
}

initialise();
