import { firebaseConfig, adminEmail } from './firebase-config.js';
const $ = (id) => document.getElementById(id);
const els = {
connectionBadge: $('connectionBadge'),
adminButton: $('adminButton'),
adminTabButton: $('adminTabButton'),
standingsHead: $('standingsHead'),
standingsBody: $('standingsBody'),
emptyStandings: $('emptyStandings'),
leaderCard: $('leaderCard'),
calendarGrid: $('calendarGrid'),
resultsGrid: $('resultsGrid'),
raceMeta: $('raceMeta'),
raceDisplay: $('raceDisplay'),
emptyRace: $('emptyRace'),
attendanceList: $('attendanceList'),
raceFormat: $('raceFormat'),
heatSizeWrap: $('heatSizeWrap'),
heatSize: $('heatSize'),
raceWeek: $('raceWeek'),
generateRaceButton: $('generateRaceButton'),
clearRaceButton: $('clearRaceButton'),
adminClearRaceButton: $('adminClearRaceButton'),
addStudentForm: $('addStudentForm'),
studentName: $('studentName'),
studentAdminList: $('studentAdminList'),
resultWeek: $('resultWeek'),
resultEntryList: $('resultEntryList'),
scoringText: $('scoringText'),
saveResultsButton: $('saveResultsButton'),
signOutButton: $('signOutButton'),
loginModal: $('loginModal'),
closeLoginModal: $('closeLoginModal'),
googleSignInButton: $('googleSignInButton'),
loginMessage: $('loginMessage'),
setupNotice: $('setupNotice'),
toast: $('toast')
};
let data = null;
let isAdmin = false;
let firebaseReady = false;
let auth = null;
let provider = null;
let docRef = null;
let firebaseFns = null;
let attendance = new Set();
let toastTimer = null;
const clone = (value) => JSON.parse(JSON.stringify(value));
const esc = (value) => String(value ?? '')
.replaceAll('&', '&amp;')
.replaceAll('<', '&lt;')
.replaceAll('>', '&gt;')
.replaceAll('"', '&quot;')
.replaceAll("'", '&#039;');
const firebaseConfigured = () => {
const values = Object.values(firebaseConfig || {});
return values.length > 0 && values.every((value) => value && !String(value).includes('PASTE_'))
&& adminEmail && !adminEmail.includes('PASTE_');
};
function showToast(message, error = false) {
clearTimeout(toastTimer);
els.toast.textContent = message;
els.toast.classList.toggle('error', error);
els.toast.classList.remove('hidden');
toastTimer = setTimeout(() => els.toast.classList.add('hidden'), 3600);
}
function encodeForFirestore(source) {
const payload = clone(source);
payload.currentRaceJson = payload.currentRace ? JSON.stringify(payload.currentRace) : null;
delete payload.currentRace;
return payload;
}
function decodeFromFirestore(source) {
const restored = clone(source || {});
if (typeof restored.currentRaceJson === 'string' && restored.currentRaceJson) {
try {
restored.currentRace = JSON.parse(restored.currentRaceJson);
} catch (error) {
console.error('Could not restore race draw:', error);
restored.currentRace = null;
}
} else if (!Object.prototype.hasOwnProperty.call(restored, 'currentRace')) {
restored.currentRace = null;
}
delete restored.currentRaceJson;
return restored;
}
function driverName(id) {
if (!id) return 'TBD';
return data.students.find((student) => student.id === id)?.name || 'Unknown driver';
}
function medalFor(position) {
return position === 1 ? '🥇' : position === 2 ? '🥈' : position === 3 ? '🥉' : String(position);
}
function pointsFor(studentId) {
return data.weeks.reduce((sum, week) => sum + Number(week.points?.[studentId] || 0), 0);
}
function winsFor(studentId) {
return data.weeks.reduce((sum, week) => sum + (Number(week.places?.[studentId]) === 1 ? 1 : 0), 0);
}
function standings() {
return data.students
.map((student) => ({ ...student, total: pointsFor(student.id), wins: winsFor(student.id) }))
.sort((a, b) => b.total - a.total || b.wins - a.wins || a.name.localeCompare(b.name));
}
function activeStudents() {
return data.students.filter((student) => student.active !== false);
}
function setActiveTab(tabId) {
document.querySelectorAll('.tab-panel').forEach((panel) => panel.classList.toggle('active', panel.id === tabId));
document.querySelectorAll('.tab[data-tab]').forEach((button) => button.classList.toggle('active', button.dataset.tab === tabId));
window.scrollTo({ top: 0, behavior: 'smooth' });
}
function renderStandings() {
const rows = standings();
const weekHeads = data.weeks.map((week) => `<th title="${esc(week.event)}">W${week.number}</th>`).join('');
els.standingsHead.innerHTML = `<tr><th>Pos</th><th>Driver</th>${weekHeads}<th>Wins</th><th>Total</th></tr>`;
els.emptyStandings.classList.toggle('hidden', rows.length !== 0);
els.standingsBody.innerHTML = rows.map((student, index) => {
const pos = index + 1;
const weekly = data.weeks.map((week) => {
const value = week.points?.[student.id];
return `<td class="week-points">${value === undefined ? '—' : esc(value)}</td>`;
}).join('');
return `<tr class="${pos <= 3 ? `medal-row-${pos}` : ''}">
<td class="position">${medalFor(pos)}</td>
<td class="driver-name">${esc(student.name)}${student.active === false ? ' <span class="muted small">(inactive)</span>' : ''}</td>
${weekly}<td>${student.wins}</td><td class="total-points">${student.total}</td>
</tr>`;
}).join('');
if (!rows.length) {
els.leaderCard.innerHTML = '<strong>🏆 Championship awaits</strong><span>Add the drivers to get started.</span>';
} else {
const leader = rows[0];
els.leaderCard.innerHTML = `<strong>🏆 ${esc(leader.name)}</strong><span>Championship leader • ${leader.total} pts</span>`;
}
}
function renderCalendar() {
els.calendarGrid.innerHTML = data.weeks.map((week) => `
<article class="calendar-card">
<div class="calendar-card-top"><strong>WEEK ${week.number}</strong><span>${esc(week.date)}</span></div>
<div class="calendar-card-body"><h3>${esc(week.event)}</h3><p class="calendar-tagline">${esc(week.tagline)}</p><p class="calendar-details">${esc(week.details)}</p></div>
</article>`).join('');
}
function renderResults() {
els.resultsGrid.innerHTML = data.weeks.map((week) => {
const placed = Object.entries(week.places || {})
.map(([id, place]) => ({ id, place: Number(place), points: Number(week.points?.[id] || 0) }))
.filter((entry) => Number.isFinite(entry.place))
.sort((a, b) => a.place - b.place);

const pointOnly = Object.entries(week.points || {})
.map(([id, points]) => ({ id, points: Number(points || 0) }))
.filter((entry) => Number.isFinite(entry.points))
.sort((a, b) => b.points - a.points || driverName(a.id).localeCompare(driverName(b.id)));

if (Number(week.number) === 4) {
const liveWeek4 = data.currentRace?.type === 'week4-seeded-head-to-head' && Number(data.currentRace?.week) === 4
? data.currentRace
: null;
const week4Ids = [...new Set([
...(liveWeek4?.present || []),
...pointOnly.map((entry) => entry.id)
])];
const week4Rows = week4Ids
.map((id) => {
const points = Number(week.points?.[id] || 0);
return { id, points, wins: points / 2 };
})
.sort((a, b) => b.wins - a.wins || b.points - a.points || driverName(a.id).localeCompare(driverName(b.id)));

const table = week4Rows.length
? `<div class="table-wrap" style="margin-top:12px;"><table class="standings-table"><thead><tr><th>Driver</th><th>Head-to-head wins</th><th>Week 4 points</th></tr></thead><tbody>${week4Rows.map((entry) => `<tr><td class="driver-name">${esc(driverName(entry.id))}</td><td><strong>${entry.wins}</strong></td><td class="total-points"><strong>${entry.points}</strong></td></tr>`).join('')}</tbody></table></div>`
: '<span class="muted small">Results not entered yet.</span>';

return `<article class="result-round"><div class="result-round-head"><div><h3>Week ${week.number} — ${esc(week.event)}</h3><div class="muted small">${esc(week.date)}</div></div></div>${table}<div class="muted small" style="margin-top:8px;">Each Week 4 head-to-head win was worth 2 championship points.</div></article>`;
}

let chips = '<span class="muted small">Results not entered yet.</span>';
let note = '';

if (placed.length) {
chips = placed.map((entry) => `<span class="podium-chip">${medalFor(entry.place)} ${esc(driverName(entry.id))} • ${entry.points} pts</span>`).join('');
} else if (pointOnly.length) {
chips = pointOnly.map((entry) => `<span class="podium-chip">🏁 ${esc(driverName(entry.id))} • ${entry.points} pts</span>`).join('');
note = '<div class="muted small" style="margin-top:8px;">Points earned during this round are shown directly because this event did not use one overall finishing position.</div>';
}

return `<article class="result-round"><div class="result-round-head"><div><h3>Week ${week.number} — ${esc(week.event)}</h3><div class="muted small">${esc(week.date)}</div></div></div><div class="result-podium">${chips}</div>${note}</article>`;
}).join('');
}
function renderStudentAdmin() {
const students = [...data.students].sort((a, b) => a.name.localeCompare(b.name));
els.studentAdminList.innerHTML = students.length ? students.map((student) => `
<div class="student-row ${student.active === false ? 'inactive' : ''}">
<strong>${esc(student.name)}</strong>
<button class="pill-button ${student.active === false ? 'inactive' : 'active'}" data-toggle-student="${esc(student.id)}">${student.active === false ? 'Inactive' : 'Active'}</button>
<button class="icon-button" title="Delete driver" data-delete-student="${esc(student.id)}">×</button>
</div>`).join('') : '<div class="muted small">No drivers added yet.</div>';
document.querySelectorAll('[data-toggle-student]').forEach((button) => {
button.addEventListener('click', async () => {
const student = data.students.find((item) => item.id === button.dataset.toggleStudent);
if (!student) return;
student.active = student.active === false;
await saveData('Driver status updated.');
});
});
document.querySelectorAll('[data-delete-student]').forEach((button) => {
button.addEventListener('click', async () => {
const id = button.dataset.deleteStudent;
const student = data.students.find((item) => item.id === id);
if (!student) return;
const hasResults = data.weeks.some((week) => week.points?.[id] !== undefined || week.places?.[id] !== undefined);
const message = hasResults ? `${student.name} already has championship results. Delete them and all of their results?` : `Delete ${student.name}?`;
if (!window.confirm(message)) return;
data.students = data.students.filter((item) => item.id !== id);
data.weeks.forEach((week) => { delete week.points?.[id]; delete week.places?.[id]; });
attendance.delete(id);
await saveData('Driver deleted.');
});
});
}
function renderAttendance() {
const students = activeStudents().sort((a, b) => a.name.localeCompare(b.name));
for (const id of [...attendance]) {
if (!students.some((student) => student.id === id)) attendance.delete(id);
}
els.attendanceList.innerHTML = students.length ? students.map((student) => `
<label class="attendance-item"><input type="checkbox" data-attendance="${esc(student.id)}" ${attendance.has(student.id) ? 'checked' : ''} /><span>${esc(student.name)}</span></label>`).join('')
: '<div class="muted small">Add drivers in the Admin section first.</div>';
document.querySelectorAll('[data-attendance]').forEach((checkbox) => {
checkbox.addEventListener('change', () => {
checkbox.checked ? attendance.add(checkbox.dataset.attendance) : attendance.delete(checkbox.dataset.attendance);
});
});
}
function populateWeekSelects() {
const options = data.weeks.map((week) => `<option value="${week.number}">Week ${week.number} — ${esc(week.event)}</option>`).join('');
const previousRace = els.raceWeek.value;
const previousResult = els.resultWeek.value;
els.raceWeek.innerHTML = options;
els.resultWeek.innerHTML = options;
if (previousRace) els.raceWeek.value = previousRace;
if (previousResult) els.resultWeek.value = previousResult;
}
function renderResultEntry() {
if (!isAdmin) return;
const weekNumber = Number(els.resultWeek.value || 1);
const week = data.weeks.find((item) => item.number === weekNumber) || data.weeks[0];
const students = activeStudents().sort((a, b) => a.name.localeCompare(b.name));
const maxPlace = Math.max(students.length, data.scoring.length);
const positionOptions = (selected) => {
let html = '<option value="">Not placed</option>';
for (let place = 1; place <= maxPlace; place += 1) {
const pts = data.scoring[place - 1] ?? 0;
html += `<option value="${place}" ${Number(selected) === place ? 'selected' : ''}>${place}${place === 1 ? 'st' : place === 2 ? 'nd' : place === 3 ? 'rd' : 'th'} — ${pts} pts</option>`;
}
return html;
};
els.scoringText.textContent = `Points: ${data.scoring.map((pts, index) => `${index + 1}${index === 0 ? 'st' : index === 1 ? 'nd' : index === 2 ? 'rd' : 'th'} ${pts}`).join(' • ')}`;
els.resultEntryList.innerHTML = students.length ? students.map((student) => `
<label class="result-entry-row"><strong>${esc(student.name)}</strong><select class="input" data-result-student="${esc(student.id)}">${positionOptions(week.places?.[student.id])}</select></label>`).join('')
: '<div class="muted small">No active drivers.</div>';
}
function renderAdminVisibility() {
document.querySelectorAll('.admin-only').forEach((element) => element.classList.toggle('hidden', !isAdmin));
els.adminButton.textContent = isAdmin ? '⚙️ Admin' : '🔒 Teacher Admin';
if (!isAdmin && document.getElementById('admin').classList.contains('active')) setActiveTab('championship');
}
function shuffle(array) {
const output = [...array];
for (let i = output.length - 1; i > 0; i -= 1) {
const j = Math.floor(Math.random() * (i + 1));
[output[i], output[j]] = [output[j], output[i]];
}
return output;
}
function groupsOfTwoWithOneTriple(ids) {
const ordered = [...ids];
const groups = [];
if (ordered.length % 2 === 1 && ordered.length >= 3) groups.push(ordered.splice(0, 3));
while (ordered.length) groups.push(ordered.splice(0, 2));
return groups;
}
function seededPairGroups(ids) {
const ranked = standings().filter((student) => ids.includes(student.id)).map((student) => student.id);
const groups = [];
while (ranked.length > 3) groups.push([ranked.shift(), ranked.pop()]);
if (ranked.length === 3) groups.push([ranked.shift(), ranked.pop(), ranked.shift()]);
else if (ranked.length) groups.push([...ranked]);
return groups;
}
function makeKnockoutRound(ids, seeded) {
const groups = seeded ? seededPairGroups(ids) : groupsOfTwoWithOneTriple(shuffle(ids));
return groups.map((drivers) => ({ drivers, winner: null, resolved: false }));
}
function createKnockout(ids, seeded = false) {
return {
type: 'knockout',
seeded,
rounds: [makeKnockoutRound(ids, seeded)]
};
}
function knockoutRoundComplete(round) {
return round.length > 0 && round.every((match) => match.resolved && match.winner);
}
function advanceKnockout(race, roundIndex) {
const round = race.rounds[roundIndex];
if (!knockoutRoundComplete(round)) return;
const winners = round.map((match) => match.winner);
if (winners.length <= 1) return;
const existingNext = race.rounds[roundIndex + 1];
const oldWinnerIds = existingNext?.flatMap((match) => match.drivers || []).sort().join('|');
const newWinnerIds = [...winners].sort().join('|');
if (existingNext && oldWinnerIds === newWinnerIds) return;
race.rounds = race.rounds.slice(0, roundIndex + 1);
race.rounds.push(makeKnockoutRound(winners, race.seeded));
}
function migrateLegacyKnockout(race) {
if (race?.type !== 'knockout' || !Array.isArray(race.rounds)) return race;
const hasLegacy = race.rounds.some((round) => round.some((match) => !Array.isArray(match.drivers)));
if (!hasLegacy) return race;
race.rounds = race.rounds.map((round) => round.map((match) => {
const drivers = [match.a, match.b].filter(Boolean);
return { drivers, winner: match.winner || null, resolved: Boolean(match.resolved) };
}));
while (race.rounds.length > 1 && race.rounds.at(-1).every((match) => (match.drivers || []).length === 0)) {
race.rounds.pop();
}
return race;
}
function renderKnockout(race) {
migrateLegacyKnockout(race);
const lastRoundIndex = race.rounds.length - 1;
const columns = race.rounds.map((round, roundIndex) => {
const isFinal = roundIndex === lastRoundIndex && round.length === 1;
const title = isFinal ? 'Final' : `Round ${roundIndex + 1}`;
return `<div class="round-column"><div class="bracket-round-title">${title}</div><div class="bracket-round">
${round.map((match, matchIndex) => renderKnockoutMatch(match, roundIndex, matchIndex)).join('')}
</div></div>`;
}).join('');
const finalMatch = race.rounds.at(-1)?.[0];
const champion = race.rounds.at(-1)?.length === 1 && finalMatch?.resolved && finalMatch?.winner
? `<div class="champion-banner">🏆 ${esc(driverName(finalMatch.winner))} wins the draw!</div>` : '';
return `<div class="bracket">${columns}</div>${champion}`;
}
function renderKnockoutMatch(match, roundIndex, matchIndex) {
const drivers = match.drivers || [];
const heading = drivers.length === 3 ? `Race ${matchIndex + 1} — 3-way race` : `Race ${matchIndex + 1}`;
if (match.resolved) {
return `<div class="race-card"><h4>${heading}</h4>${drivers.map((id) => `<div class="driver-slot ${match.winner === id ? 'winner' : ''}">${esc(driverName(id))}${match.winner === id ? ' ✓' : ''}</div>`).join('')}</div>`;
}
if (isAdmin) {
return `<div class="race-card"><h4>${heading} — choose winner</h4>${drivers.map((id) => `<button class="winner-button" data-knockout-winner="${roundIndex}|${matchIndex}|${esc(id)}">🏎️ ${esc(driverName(id))}</button>`).join('')}</div>`;
}
return `<div class="race-card"><h4>${heading}</h4>${drivers.map((id) => `<div class="driver-slot">${esc(driverName(id))}</div>`).join('')}</div>`;
}
function generateHeats(ids, heatSize, balanced) {
if (heatSize === 2) {
if (!balanced) return groupsOfTwoWithOneTriple(shuffle(ids));
const ranked = standings().filter((student) => ids.includes(student.id)).map((student) => student.id);
return seededPairGroups(ranked);
}
const count = Math.ceil(ids.length / heatSize);
const groups = Array.from({ length: count }, () => []);
const ordered = balanced
? standings().filter((student) => ids.includes(student.id)).map((student) => student.id)
: shuffle(ids);
if (!balanced) {
ordered.forEach((id, index) => groups[Math.floor(index / heatSize)].push(id));
return groups.filter((group) => group.length);
}
ordered.forEach((id, index) => {
const row = Math.floor(index / count);
const position = index % count;
const groupIndex = row % 2 === 0 ? position : count - 1 - position;
groups[groupIndex].push(id);
});
return groups.filter((group) => group.length);
}
function generateTeams(ids) {
const ordered = shuffle(ids);
const count = Math.ceil(ordered.length / 3);
const groups = Array.from({ length: count }, () => []);
ordered.forEach((id, index) => groups[index % count].push(id));
return groups;
}
function renderRace() {
const race = data.currentRace;
els.emptyRace.classList.toggle('hidden', Boolean(race));
els.raceDisplay.innerHTML = '';
els.raceMeta.textContent = '';
if (!race) return;
const week = data.weeks.find((item) => item.number === Number(race.week));
els.raceMeta.textContent = `${week ? `Week ${week.number} • ${week.event}` : ''}${race.createdAt ? ` • Drawn ${new Date(race.createdAt).toLocaleDateString()}` : ''}`;
let content = '';
if (race.type === 'knockout') {
content = renderKnockout(race);
} else if (race.type === 'heats') {
content = `<div class="race-grid">${race.groups.map((group, index) => `<div class="race-card"><h4>${group.length === 3 && Number(race.heatSize) === 2 ? `Heat ${index + 1} — 3-way race` : `Heat ${index + 1}`}</h4>${group.map((id) => `<div class="driver-slot">${esc(driverName(id))}</div>`).join('')}</div>`).join('')}</div>`;
} else if (race.type === 'teams') {
content = `<div class="race-grid">${race.groups.map((group, index) => `<div class="race-card"><h4>Team ${index + 1}</h4>${group.map((id) => `<div class="driver-slot">${esc(driverName(id))}</div>`).join('')}</div>`).join('')}</div>`;
}
els.raceDisplay.innerHTML = `<div class="race-title"><h3>${esc(race.label)}</h3><span class="muted small">${race.present?.length || 0} drivers</span></div>${content}`;
document.querySelectorAll('[data-knockout-winner]').forEach((button) => {
button.addEventListener('click', async () => {
const [roundIndexText, matchIndexText, winnerId] = button.dataset.knockoutWinner.split('|');
const roundIndex = Number(roundIndexText);
const matchIndex = Number(matchIndexText);
const match = data.currentRace?.rounds?.[roundIndex]?.[matchIndex];
if (!match || !(match.drivers || []).includes(winnerId)) return;
match.winner = winnerId;
match.resolved = true;
advanceKnockout(data.currentRace, roundIndex);
await saveData(`${driverName(winnerId)} advanced.`);
});
});
}
function renderAll() {
if (!data) return;
renderStandings();
renderCalendar();
renderResults();
populateWeekSelects();
renderRace();
renderAdminVisibility();
if (isAdmin) {
renderStudentAdmin();
renderAttendance();
renderResultEntry();
}
}
async function generateRace() {
const present = [...attendance];
if (present.length < 2) {
showToast('Select at least two students who are present.', true);
return;
}
const format = els.raceFormat.value;
const week = Number(els.raceWeek.value || 1);
let race;
if (format.startsWith('knockout')) {
const seeded = format === 'knockout-seeded';
const knockout = createKnockout(present, seeded);
race = {
...knockout,
label: seeded ? 'Seeded Knockout' : 'Random Knockout',
week,
present,
createdAt: new Date().toISOString()
};
} else if (format.startsWith('heats')) {
const balanced = format === 'heats-balanced';
const heatSize = Number(els.heatSize.value || 4);
race = {
type: 'heats',
label: balanced ? 'Balanced Heats' : 'Random Heats',
heatSize,
week,
present,
createdAt: new Date().toISOString(),
groups: generateHeats(present, heatSize, balanced)
};
} else {
race = {
type: 'teams',
label: 'Team Relay — Teams of 3',
week,
present,
createdAt: new Date().toISOString(),
groups: generateTeams(present)
};
}
data.currentRace = race;
const saved = await saveData('Race draw generated.');
if (saved) setActiveTab('race-day');
}
async function clearRace() {
if (!data.currentRace) return;
if (!window.confirm('Clear the current race draw?')) return;
data.currentRace = null;
await saveData('Race draw cleared.');
}
async function saveRoundResults() {
const weekNumber = Number(els.resultWeek.value || 1);
const week = data.weeks.find((item) => item.number === weekNumber);
if (!week) return;
const entries = [...document.querySelectorAll('[data-result-student]')].map((select) => ({
id: select.dataset.resultStudent,
place: select.value ? Number(select.value) : null
}));
const selectedPlaces = entries.filter((entry) => entry.place !== null).map((entry) => entry.place);
if (new Set(selectedPlaces).size !== selectedPlaces.length) {
showToast('Each finishing position can only be used once.', true);
return;
}
week.points = week.points || {};
week.places = week.places || {};
entries.forEach(({ id, place }) => {
if (place === null) {
delete week.points[id];
delete week.places[id];
} else {
week.places[id] = place;
week.points[id] = Number(data.scoring[place - 1] ?? 0);
}
});
await saveData(`Week ${weekNumber} results saved.`);
}
async function saveData(successMessage) {
if (!isAdmin || !firebaseReady || !docRef) {
showToast('Secure admin storage is not configured yet.', true);
renderAll();
return false;
}
data.updatedAt = new Date().toISOString();
try {
await firebaseFns.setDoc(docRef, encodeForFirestore(data));
if (successMessage) showToast(successMessage);
return true;
} catch (error) {
console.error('Firestore save failed:', error);
const code = error?.code ? ` (${error.code})` : '';
showToast(`Could not save the update${code}.`, true);
return false;
}
}
async function setupFirebase() {
if (!firebaseConfigured()) {
els.connectionBadge.textContent = '⚠ Secure setup needed';
els.setupNotice.innerHTML = '<strong>Admin setup is not finished yet.</strong><br>The public championship page is ready, but Firebase must be connected before teacher-only editing can be enabled.';
els.setupNotice.classList.remove('hidden');
return;
}
try {
const appModule = await import('https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js');
const authModule = await import('https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js');
const firestoreModule = await import('https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js');
const app = appModule.initializeApp(firebaseConfig);
auth = authModule.getAuth(app);
provider = new authModule.GoogleAuthProvider();
const db = firestoreModule.getFirestore(app);
docRef = firestoreModule.doc(db, 'rcClub', 'data');
firebaseFns = {
setDoc: firestoreModule.setDoc,
getDoc: firestoreModule.getDoc,
onSnapshot: firestoreModule.onSnapshot,
signInWithPopup: authModule.signInWithPopup,
signOut: authModule.signOut,
onAuthStateChanged: authModule.onAuthStateChanged
};
firebaseReady = true;
els.connectionBadge.textContent = '● Live championship';
firebaseFns.onSnapshot(docRef, (snapshot) => {
if (snapshot.exists()) {
data = decodeFromFirestore(snapshot.data());
if (data.currentRace?.type === 'knockout') migrateLegacyKnockout(data.currentRace);
attendance = new Set([...attendance].filter((id) => activeStudents().some((student) => student.id === id)));
renderAll();
}
}, (error) => {
console.error(error);
els.connectionBadge.textContent = '⚠ Connection issue';
});
firebaseFns.onAuthStateChanged(auth, async (user) => {
if (!user) {
isAdmin = false;
renderAll();
return;
}
const allowed = String(user.email || '').toLowerCase() === String(adminEmail).toLowerCase();
if (!allowed) {
showToast('That Google account is not authorised for RC Club admin.', true);
await firebaseFns.signOut(auth);
return;
}
isAdmin = true;
els.loginModal.classList.add('hidden');
const snapshot = await firebaseFns.getDoc(docRef);
if (!snapshot.exists()) await firebaseFns.setDoc(docRef, encodeForFirestore(data));
renderAll();
showToast('Teacher admin unlocked.');
});
} catch (error) {
console.error(error);
els.connectionBadge.textContent = '⚠ Firebase unavailable';
els.setupNotice.textContent = 'Firebase could not be loaded. The public page will remain read-only until the connection is fixed.';
els.setupNotice.classList.remove('hidden');
}
}
async function signIn() {
if (!firebaseReady || !auth || !provider) {
els.setupNotice.classList.remove('hidden');
showToast('Firebase admin setup is still required.', true);
return;
}
try {
await firebaseFns.signInWithPopup(auth, provider);
} catch (error) {
console.error(error);
if (error?.code !== 'auth/popup-closed-by-user') showToast('Google sign-in did not complete.', true);
}
}
function bindEvents() {
document.querySelectorAll('.tab[data-tab]').forEach((button) => {
button.addEventListener('click', () => {
if (button.dataset.tab === 'admin' && !isAdmin) return;
setActiveTab(button.dataset.tab);
});
});
els.adminButton.addEventListener('click', () => {
if (isAdmin) setActiveTab('admin');
else els.loginModal.classList.remove('hidden');
});
els.closeLoginModal.addEventListener('click', () => els.loginModal.classList.add('hidden'));
els.loginModal.addEventListener('click', (event) => { if (event.target === els.loginModal) els.loginModal.classList.add('hidden'); });
els.googleSignInButton.addEventListener('click', signIn);
els.signOutButton.addEventListener('click', async () => {
if (firebaseReady && auth) await firebaseFns.signOut(auth);
setActiveTab('championship');
});
els.raceFormat.addEventListener('change', () => {
els.heatSizeWrap.classList.toggle('hidden', !els.raceFormat.value.startsWith('heats'));
});
els.generateRaceButton.addEventListener('click', generateRace);
els.clearRaceButton.addEventListener('click', clearRace);
els.adminClearRaceButton.addEventListener('click', clearRace);
els.addStudentForm.addEventListener('submit', async (event) => {
event.preventDefault();
const name = els.studentName.value.trim();
if (!name) return;
if (data.students.some((student) => student.name.toLowerCase() === name.toLowerCase())) {
showToast('That driver is already on the list.', true);
return;
}
const id = `driver-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
data.students.push({ id, name, active: true });
attendance.add(id);
els.studentName.value = '';
await saveData(`${name} added.`);
});
els.resultWeek.addEventListener('change', renderResultEntry);
els.saveResultsButton.addEventListener('click', saveRoundResults);
}
async function init() {
bindEvents();
els.heatSizeWrap.classList.add('hidden');
try {
const response = await fetch('./data.json', { cache: 'no-store' });
if (!response.ok) throw new Error('Could not load data.json');
data = await response.json();
} catch (error) {
console.error(error);
data = { title: "St Peter's RC Club Winter Championship 2026", scoring: [10,8,6,5,4,3,2,1], students: [], weeks: [], currentRace: null };
}
attendance = new Set(activeStudents().map((student) => student.id));
renderAll();
await setupFirebase();
}
init();
