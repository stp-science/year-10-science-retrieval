import { adminEmail } from './firebase-config.js';

const WEEK = 6;
const $ = (id) => document.getElementById(id);
const wait = (ms) => new Promise((resolve) => window.setTimeout(resolve, ms));

let latestData = null;
let auth = null;
let firestore = null;
let championshipRef = null;

function esc(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function showMessage(message, error = false) {
  const toast = $('toast');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.toggle('error', error);
  toast.classList.remove('hidden');
  window.setTimeout(() => toast.classList.add('hidden'), 4200);
}

function authorised() {
  return String(auth?.currentUser?.email || '').toLowerCase() === String(adminEmail || '').toLowerCase();
}

function week6From(data = latestData) {
  return (data?.weeks || []).find((week) => Number(week.number) === WEEK) || null;
}

function driverName(id) {
  return latestData?.students?.find((student) => student.id === id)?.name || 'Unknown driver';
}

function activeDrivers() {
  return [...(latestData?.students || [])]
    .filter((student) => student.active !== false)
    .sort((a, b) => a.name.localeCompare(b.name));
}

function ensurePanel() {
  const adminGrid = document.querySelector('#admin .admin-grid');
  if (!adminGrid) return null;

  let panel = $('week6QuickPointsCard');
  if (panel) return panel;

  panel = document.createElement('div');
  panel.id = 'week6QuickPointsCard';
  panel.className = 'admin-card';
  panel.innerHTML = `
    <div class="admin-card-title">🏆 Week 6 Quick Points</div>
    <p class="muted small">Week 6 was run informally. Add championship points directly to the students who won. Points accumulate, so you can award the same student more than once.</p>
    <div id="week6QuickPointsList" class="student-admin-list"></div>
  `;
  adminGrid.appendChild(panel);
  return panel;
}

function render() {
  const panel = ensurePanel();
  if (!panel || !latestData) return;

  const list = $('week6QuickPointsList');
  if (!list) return;

  const week6 = week6From();
  const points = week6?.points || {};

  list.innerHTML = activeDrivers().map((student) => {
    const total = Number(points[student.id] || 0);
    return `
      <div class="student-admin-row" data-week6-driver="${esc(student.id)}" style="align-items:center;gap:8px;flex-wrap:wrap;">
        <div style="flex:1;min-width:150px;">
          <strong>${esc(student.name)}</strong>
          <div class="muted small">Week 6 total: <strong>${total} pts</strong></div>
        </div>
        <div style="display:flex;gap:6px;flex-wrap:wrap;align-items:center;">
          <button class="btn btn-ghost" type="button" data-week6-add="${esc(student.id)}|1">+1</button>
          <button class="btn btn-ghost" type="button" data-week6-add="${esc(student.id)}|2">+2</button>
          <button class="btn btn-ghost" type="button" data-week6-add="${esc(student.id)}|4">+4</button>
          <button class="btn btn-ghost" type="button" data-week6-add="${esc(student.id)}|5">+5</button>
          <button class="btn btn-ghost" type="button" data-week6-add="${esc(student.id)}|10">+10</button>
          <input class="input" type="number" min="1" step="1" placeholder="Custom" data-week6-custom="${esc(student.id)}" style="width:92px;" />
          <button class="btn btn-primary" type="button" data-week6-custom-add="${esc(student.id)}">Add</button>
        </div>
      </div>
    `;
  }).join('');

  if (!authorised()) {
    list.querySelectorAll('button,input').forEach((element) => { element.disabled = true; });
  }

  list.querySelectorAll('[data-week6-add]').forEach((button) => {
    button.addEventListener('click', async () => {
      const [studentId, amountText] = button.dataset.week6Add.split('|');
      await addPoints(studentId, Number(amountText));
    });
  });

  list.querySelectorAll('[data-week6-custom-add]').forEach((button) => {
    button.addEventListener('click', async () => {
      const studentId = button.dataset.week6CustomAdd;
      const input = list.querySelector(`[data-week6-custom="${CSS.escape(studentId)}"]`);
      const amount = Number(input?.value);
      if (!Number.isInteger(amount) || amount <= 0) {
        showMessage('Enter a whole number of points greater than zero.', true);
        return;
      }
      await addPoints(studentId, amount);
      if (input) input.value = '';
    });
  });
}

async function addPoints(studentId, amount) {
  if (!authorised()) {
    showMessage('Sign in through Teacher Admin first.', true);
    return;
  }
  if (!Number.isInteger(amount) || amount <= 0) return;

  try {
    const snapshot = await firestore.getDoc(championshipRef);
    if (!snapshot.exists()) throw new Error('Championship data could not be found.');

    const stored = snapshot.data() || {};
    const weeks = JSON.parse(JSON.stringify(stored.weeks || []));
    const week6 = weeks.find((week) => Number(week.number) === WEEK);
    if (!week6) throw new Error('Week 6 could not be found.');

    week6.points = week6.points || {};
    week6.places = {};
    week6.points[studentId] = Number(week6.points[studentId] || 0) + amount;

    await firestore.setDoc(championshipRef, {
      weeks,
      updatedAt: new Date().toISOString()
    }, { merge: true });

    showMessage(`${driverName(studentId)} awarded ${amount} Week 6 point${amount === 1 ? '' : 's'}.`);
  } catch (error) {
    console.error('Could not add Week 6 points:', error);
    showMessage(error?.message || 'Could not add Week 6 points.', true);
  }
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

  auth = authModule.getAuth(app);
  const db = firestoreModule.getFirestore(app);
  championshipRef = firestoreModule.doc(db, 'rcClub', 'data');
  firestore = firestoreModule;

  authModule.onAuthStateChanged(auth, () => render());

  firestoreModule.onSnapshot(championshipRef, (snapshot) => {
    if (!snapshot.exists()) return;
    latestData = snapshot.data();
    render();
  });

  ensurePanel();
}

initialise();
