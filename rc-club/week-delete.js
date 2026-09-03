import './week5-relay.js?v=20260903-1527';
import './week4-head-to-head.js?v=20260903-0755';
import { adminEmail } from './firebase-config.js';

const $ = (id) => document.getElementById(id);
const deleteWeek = $('deleteWeek');
const deleteButton = $('deleteWeekDataButton');
const resultWeek = $('resultWeek');

const wait = (milliseconds) => new Promise((resolve) => window.setTimeout(resolve, milliseconds));

function showMessage(message, error = false) {
  const toast = $('toast');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.toggle('error', error);
  toast.classList.remove('hidden');
  window.setTimeout(() => toast.classList.add('hidden'), 4200);
}

function syncWeekOptions() {
  if (!deleteWeek || !resultWeek || resultWeek.options.length === 0) return;
  const selected = deleteWeek.value;
  deleteWeek.innerHTML = [...resultWeek.options]
    .map((option) => `<option value="${option.value}">${option.textContent}</option>`)
    .join('');
  if (selected && [...deleteWeek.options].some((option) => option.value === selected)) {
    deleteWeek.value = selected;
  }
}

async function waitForFirebaseApp(appModule) {
  for (let attempt = 0; attempt < 150; attempt += 1) {
    if (appModule.getApps().length) return appModule.getApps()[0];
    await wait(100);
  }
  return null;
}

async function initialiseWeekDeletion() {
  if (!deleteWeek || !deleteButton) return;

  syncWeekOptions();
  if (resultWeek) {
    const observer = new MutationObserver(syncWeekOptions);
    observer.observe(resultWeek, { childList: true, subtree: true });
  }

  const appModule = await import('https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js');
  const authModule = await import('https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js');
  const firestoreModule = await import('https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js');

  const firebaseApp = await waitForFirebaseApp(appModule);
  if (!firebaseApp) {
    deleteButton.disabled = true;
    deleteButton.title = 'Firebase is not connected.';
    return;
  }

  const auth = authModule.getAuth(firebaseApp);
  const db = firestoreModule.getFirestore(firebaseApp);
  const championshipRef = firestoreModule.doc(db, 'rcClub', 'data');

  const authorised = () => String(auth.currentUser?.email || '').toLowerCase() === String(adminEmail || '').toLowerCase();

  authModule.onAuthStateChanged(auth, () => {
    deleteButton.disabled = !authorised();
    deleteButton.title = authorised() ? '' : 'Sign in through Teacher Admin first.';
  });

  deleteButton.addEventListener('click', async () => {
    if (!authorised()) {
      showMessage('Sign in through Teacher Admin before deleting race data.', true);
      return;
    }

    const weekNumber = Number(deleteWeek.value);
    if (!Number.isFinite(weekNumber)) {
      showMessage('Choose a week to delete.', true);
      return;
    }

    deleteButton.disabled = true;
    const originalText = deleteButton.textContent;
    deleteButton.textContent = 'Checking week…';

    try {
      const snapshot = await firestoreModule.getDoc(championshipRef);
      if (!snapshot.exists()) throw new Error('Championship data could not be found.');

      const stored = snapshot.data() || {};
      const weeks = JSON.parse(JSON.stringify(stored.weeks || []));
      const week = weeks.find((item) => Number(item.number) === weekNumber);
      if (!week) throw new Error(`Week ${weekNumber} could not be found.`);

      const hasResults = Object.keys(week.points || {}).length > 0 || Object.keys(week.places || {}).length > 0;
      let currentRace = null;
      if (typeof stored.currentRaceJson === 'string' && stored.currentRaceJson) {
        try {
          currentRace = JSON.parse(stored.currentRaceJson);
        } catch (error) {
          console.error('Could not read the current race data:', error);
        }
      }
      const hasCurrentRaceData = Number(currentRace?.week) === weekNumber;

      if (!hasResults && !hasCurrentRaceData) {
        showMessage(`Week ${weekNumber} does not currently have any saved race data.`, true);
        return;
      }

      const extra = hasCurrentRaceData ? ' Any open draw, lap times or live race progress for this week will also be removed.' : '';
      const confirmed = window.confirm(
        `Delete all saved race results and championship points for Week ${weekNumber}?${extra}\n\nThis cannot be undone.`
      );
      if (!confirmed) return;

      week.points = {};
      week.places = {};

      const update = {
        weeks,
        updatedAt: new Date().toISOString()
      };
      if (hasCurrentRaceData) update.currentRaceJson = null;

      await firestoreModule.setDoc(championshipRef, update, { merge: true });
      showMessage(`Week ${weekNumber} race data deleted.`);
    } catch (error) {
      console.error('Could not delete week data:', error);
      showMessage(error?.message || 'The week data could not be deleted.', true);
    } finally {
      deleteButton.disabled = !authorised();
      deleteButton.textContent = originalText;
    }
  });
}

initialiseWeekDeletion();
