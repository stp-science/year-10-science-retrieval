import { firebaseConfig, adminEmail } from './firebase-config.js';

const appModule = await import('https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js');
const authModule = await import('https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js');
const firestoreModule = await import('https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js');

const app = appModule.getApps().length ? appModule.getApps()[0] : appModule.initializeApp(firebaseConfig);
const auth = authModule.getAuth(app);
const db = firestoreModule.getFirestore(app);
const championshipRef = firestoreModule.doc(db, 'rcClub', 'data');

const normalize = (value) => String(value || '').trim().toLowerCase().replace(/\s+/g, ' ');

async function ensureZacC(user) {
  if (!user) return;
  if (normalize(user.email) !== normalize(adminEmail)) return;

  const snapshot = await firestoreModule.getDoc(championshipRef);
  if (!snapshot.exists()) return;

  const stored = snapshot.data() || {};
  const students = Array.isArray(stored.students) ? [...stored.students] : [];
  if (students.some((student) => normalize(student.name) === 'zac c')) return;

  students.push({
    id: `driver-zac-c-${Date.now()}`,
    name: 'Zac C',
    active: true
  });

  await firestoreModule.setDoc(championshipRef, {
    students,
    updatedAt: new Date().toISOString()
  }, { merge: true });
}

authModule.onAuthStateChanged(auth, (user) => {
  ensureZacC(user).catch((error) => console.error('Could not add Zac C:', error));
});
