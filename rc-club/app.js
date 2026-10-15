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
let notice = $('raceControlNotice');
if (!notice) { notice = document.createElement('p'); notice.id = 'raceControlNotice'; notice.setAttribute('role','status'); els.generateRaceButton.after(notice); }
notice.textContent = message;
notice.classList.toggle('error',error);
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
...(week.participants || []),
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
if (week.week10Results) note = renderWeek10(week.week10Results,false);
if (week.grandPrixResults) {
const saved = week.grandPrixResults;
const groupTable = (ids, results) => '<div class="table-wrap"><table class="standings-table"><thead><tr><th>Driver</th><th>Laps</th><th>Total time (s)</th></tr></thead><tbody>' + gpRank(ids,results).map(r => `<tr><td>${esc(driverName(r.id))}</td><td>${r.laps ?? '—'}</td><td>${r.time ?? '—'}</td></tr>`).join('') + '</tbody></table></div>';
note = saved.groups.map((g,i) => '<h4>Qualifying race ' + (i+1) + '</h4>' + groupTable(g,saved.qualifying)).join('') + '<h4>Final — double points</h4>' + groupTable(gpFinalists(saved),saved.finalResults);
}

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
if (els.raceFormat.value === 'week10-grand-prix') els.raceWeek.value = '10';
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
const pts = (weekNumber === 8 || weekNumber === 10) ? ([20,16,12,10,4,3,2,1][place - 1] ?? 0) : (data.scoring[place - 1] ?? 0);
html += `<option value="${place}" ${Number(selected) === place ? 'selected' : ''}>${place}${place === 1 ? 'st' : place === 2 ? 'nd' : place === 3 ? 'rd' : 'th'} — ${pts} pts</option>`;
}
return html;
};
els.scoringText.textContent = `Points: ${((weekNumber === 8 || weekNumber === 10) ? [20,16,12,10,4,3,2,1] : data.scoring).map((pts, index) => `${index + 1}${index === 0 ? 'st' : index === 1 ? 'nd' : index === 2 ? 'rd' : 'th'} ${pts}`).join(' • ')}`;
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

function gpRank(group, results) {
return group.map(id => ({ id, ...(results?.[id] || {}) }))
.sort((a,b) => b.laps - a.laps || a.time - b.time);
}
function gpComplete(group, results) {
return group.length > 0 && group.every(id => Number.isInteger(results?.[id]?.laps) && results[id].laps >= 0 && Number.isFinite(results[id].time) && results[id].time > 0);
}
function gpFinalists(race) {
if (!race.groups.every(g => gpComplete(g, race.qualifying))) return [];
const ranked = race.groups.map(g => gpRank(g, race.qualifying));
if (ranked.some(g => g.length > 1 && g[0].laps === g[1].laps && g[0].time === g[1].time)) return [];
const seconds = ranked.map(g => g[1]).filter(Boolean).sort((a,b) => b.laps-a.laps || a.time-b.time);
if (seconds.length > 1 && seconds[0].laps === seconds[1].laps && seconds[0].time === seconds[1].time) return [];
return [...ranked.map(g => g[0].id), seconds[0]?.id].filter(Boolean);
}
function renderGrandPrix(race) {
const finalists = gpFinalists(race);
const table = (group, results, key) => {
const complete = gpComplete(group, results);
const rows = complete ? gpRank(group, results).map(r => r.id) : group;
return '<div class="table-wrap"><table class="standings-table race-result-table"><thead><tr><th>Pos</th><th>Driver</th><th>Laps completed</th><th>Total time (seconds)</th></tr></thead><tbody>' + rows.map((id,i) =>
`<tr><td>${complete ? i+1 : '—'}</td><td>${esc(driverName(id))}</td><td>${isAdmin ? `<input class="input" type="number" min="0" step="1" data-gp-laps="${esc(id)}" data-gp-stage="${key}" value="${results?.[id]?.laps ?? ''}" aria-label="Laps for ${esc(driverName(id))}">` : results?.[id]?.laps ?? '—'}</td><td>${isAdmin ? `<input class="input" type="number" min="0.001" step="0.001" data-gp-time="${esc(id)}" value="${results?.[id]?.time ?? ''}" aria-label="Total time for ${esc(driverName(id))}">` : results?.[id]?.time ?? '—'}</td></tr>`).join('') + '</tbody></table></div>';
};
return `<p>Friday 16th October — three qualifying races, maximum four drivers per race. Each winner and the fastest runner-up qualify for the final.</p>
<p class="muted small">Use the same race distance or duration for all three qualifiers. Rank by most completed laps, then lowest total time for equal laps. Exact ties affecting qualification must be settled by a rerun; update the tied results before continuing. Qualifiers award no points.</p>
<div class="race-grid">${race.groups.map((g,i) => `<div class="race-card"><h4>Qualifying race ${i+1}</h4>${table(g,race.qualifying,'qualifying')}${isAdmin ? `<button class="btn btn-primary" data-gp-save="${i}">Save qualifying race ${i+1}</button>` : ''}</div>`).join('')}</div>
<div class="race-card"><h4>🏁 Grand Prix final — double points</h4><p>1st: 20 pts • 2nd: 16 pts • 3rd: 12 pts • 4th: 10 pts</p>
${finalists.length === 4 ? table(finalists,race.finalResults,'finalResults') + (isAdmin ? '<button class="btn btn-primary" data-gp-save="final">Save final results</button> <button class="btn btn-primary" id="gpAward">Award double championship points</button>' : '') : '<p>Complete all three qualifying races and resolve any qualifying ties to reveal the four finalists.</p>'}
${race.finalizedAt ? '<p>✓ Final championship points saved.</p>' : ''}</div>`;
}
function bindGrandPrix(race) {
document.querySelectorAll('[data-gp-save]').forEach(button => button.addEventListener('click', async () => {
const final = button.dataset.gpSave === 'final';
const group = final ? gpFinalists(race) : race.groups[Number(button.dataset.gpSave)];
const key = final ? 'finalResults' : 'qualifying';
const entries = {};
for (const id of group) {
const lapInput = document.querySelector('[data-gp-laps="' + CSS.escape(id) + '"]');
const timeInput = document.querySelector('[data-gp-time="' + CSS.escape(id) + '"]');
const laps = Number(lapInput.value), time = Number(timeInput.value);
if (!lapInput.value || !timeInput.value || !Number.isInteger(laps) || laps < 0 || !Number.isFinite(time) || time <= 0) return showToast('Enter whole laps (0 or more) and a positive total time for every driver in this race.', true);
entries[id] = {laps,time};
}
const oldFinalists = gpFinalists(race).join('|');
race[key] = {...race[key], ...entries};
if (!final && oldFinalists !== gpFinalists(race).join('|')) { race.finalResults = {}; delete race.finalizedAt; }
delete race.finalizedAt;
await saveData('Race results saved.');
}));
$('gpAward')?.addEventListener('click', async () => {
const finalists = gpFinalists(race);
if (finalists.length !== 4 || !gpComplete(finalists,race.finalResults)) return showToast('Save complete results for all four finalists first.',true);
const ranked = gpRank(finalists,race.finalResults);
if (ranked.some((r,i) => i && r.laps === ranked[i-1].laps && r.time === ranked[i-1].time)) return showToast('Resolve tied final positions with a rerun before awarding points.',true);
const week = data.weeks.find(w => Number(w.number) === Number(race.week));
if (!week) return;
if (!window.confirm('Save the final result and award 20, 16, 12 and 10 championship points?')) return;
week.places = {}; week.points = {};
ranked.forEach((r,i) => { week.places[r.id] = i+1; week.points[r.id] = [20,16,12,10][i]; });
race.finalizedAt = new Date().toISOString();
week.grandPrixResults = clone(race);
await saveData('Grand Prix final and double championship points saved.');
});
}


function w10Best(race) {
const best = {};
for (const id of race.present) {
const attempts = [race.qualifyingRounds[0][id], race.qualifyingRounds[1][id]];
if (!attempts.every(r => r && Number.isInteger(r.laps) && r.laps >= 0 && Number.isFinite(r.time) && r.time > 0)) return null;
best[id] = [...attempts].sort((a,b) => b.laps-a.laps || a.time-b.time)[0];
}
return best;
}
function w10Finals(race) {
const best = w10Best(race);
if (!best) return [];
const overall = gpRank(race.present,best);
if (overall.some((r,i) => i && r.laps === overall[i-1].laps && r.time === overall[i-1].time)) return [];
const heats = race.groups.map(g => gpRank(g,best));
const winners = heats.map(g => g[0].id);
const runner = heats.map(g => g[1]).filter(Boolean).sort((a,b) => b.laps-a.laps || a.time-b.time)[0].id;
const first = [...winners,runner];
const rest = overall.map(r => r.id).filter(id => !first.includes(id));
return [first,rest.slice(0,4),rest.slice(4)];
}
function w10Table(ids, results, stage, editable) {
return '<div class="table-wrap"><table class="standings-table race-result-table"><thead><tr><th>Driver</th><th>Laps</th><th>Total time (s)</th></tr></thead><tbody>' + ids.map(id =>
`<tr><td>${esc(driverName(id))}</td><td>${editable ? `<input class="input" type="number" min="0" step="1" data-w10-laps="${esc(stage+'|'+id)}" value="${results?.[id]?.laps ?? ''}" aria-label="Laps for ${esc(driverName(id))}">` : results?.[id]?.laps ?? '—'}</td><td>${editable ? `<input class="input" type="number" min="0.001" step="0.001" data-w10-time="${esc(stage+'|'+id)}" value="${results?.[id]?.time ?? ''}" aria-label="Time for ${esc(driverName(id))}">` : results?.[id]?.time ?? '—'}</td></tr>`).join('')+'</tbody></table></div>';
}
function renderWeek10(race, editable = isAdmin) {
const finals = w10Finals(race), best = w10Best(race);
return `<p>Week 10: each driver completes two qualifying races in their heat, with a maximum of four cars racing together. Heats are balanced using championship positions, spreading the leading drivers across the three heats. Use the same distance or duration for every qualifier. Each driver's best result counts: most laps, then lowest total time.</p><p>Final 1: the best driver from each of the three heats plus the fastest runner-up. Final 2: the next four in the overall list. Final 3: the remaining drivers. Resolve exact qualifying ties with a rerun before finals are allocated.</p>
${[0,1].map(round => `<h3>Qualifying round ${round+1}</h3><div class="race-grid">${race.groups.map((g,i) => `<div class="race-card"><h4>Heat ${i+1}</h4>${w10Table(g,race.qualifyingRounds[round],'q'+round,editable)}${editable ? `<button class="btn btn-primary" data-w10-save="q${round}|${i}">Save round ${round+1}, heat ${i+1}</button>` : ''}</div>`).join('')}</div>`).join('')}
${best ? '<h3>Overall qualifying order — best of two</h3>'+w10Table(gpRank(race.present,best).map(r=>r.id),best,'best',false) : '<p>Save both qualifying results for every driver to calculate the overall order.</p>'}
${finals.length ? finals.map((g,i) => `<div class="race-card"><h3>Final ${i+1}${i===0 ? ' — 20, 16, 12, 10 points' : i===1 ? ' — overall places 5–8' : ' — overall places 9–12'}</h3>${w10Table(g,race.finalResults,'f'+i,editable)}${editable && g.length ? `<button class="btn btn-primary" data-w10-save="f${i}|${i}">Save Final ${i+1}</button>` : ''}</div>`).join('') + (editable ? '<button class="btn btn-primary" id="w10Award">Finish Week 10 and award points</button>' : '') : '<p>Finals pending complete qualifiers and resolved ties.</p>'}
${race.finalizedAt ? '<p>✓ Week 10 results and championship points saved.</p>' : ''}`;
}
function bindWeek10(race) {
document.querySelectorAll('[data-w10-save]').forEach(button => button.addEventListener('click',async () => {
const [stage,index] = button.dataset.w10Save.split('|');
const qualifying = stage[0] === 'q', round = Number(stage[1]);
const ids = qualifying ? race.groups[Number(index)] : w10Finals(race)[Number(index)];
const entries = {};
for (const id of ids) {
const selector = CSS.escape(stage+'|'+id);
const l = document.querySelector('[data-w10-laps="'+selector+'"]');
const t = document.querySelector('[data-w10-time="'+selector+'"]');
const laps = Number(l.value), time = Number(t.value);
if (!l.value || !t.value || !Number.isInteger(laps) || laps < 0 || !Number.isFinite(time) || time <= 0) return showToast('Enter whole laps and a positive total time for each driver.',true);
entries[id] = {laps,time};
}
const before = JSON.stringify(w10Finals(race));
if (qualifying) {
race.qualifyingRounds[round] = {...race.qualifyingRounds[round],...entries};
if (before !== JSON.stringify(w10Finals(race))) race.finalResults = {};
} else race.finalResults = {...race.finalResults,...entries};
delete race.finalizedAt;
await saveData('Week 10 race results saved.');
}));
$('w10Award')?.addEventListener('click',async () => {
const finals = w10Finals(race);
if (finals.length !== 3 || !gpComplete(race.present,race.finalResults)) return showToast('Save all three final results first.',true);
const ranks = finals.map(g => gpRank(g,race.finalResults));
if (ranks.some(g => g.some((r,i) => i && r.laps===g[i-1].laps && r.time===g[i-1].time))) return showToast('Resolve tied final positions before awarding points.',true);
if (!window.confirm('Save all three finals? Final 1 earns 20, 16, 12, 10 points; Final 2 earns the usual 5th–8th points (4, 3, 2, 1); Final 3 earns 0 points.')) return;
const week = data.weeks.find(w => Number(w.number)===10);
week.places={};week.points={};
ranks.flat().forEach((r,i) => {week.places[r.id]=i+1;week.points[r.id]=[20,16,12,10,4,3,2,1][i] ?? 0;});
race.finalizedAt=new Date().toISOString();week.week10Results=clone(race);
await saveData('Week 10 finals and championship points saved.');
});
}
function ensureWeek10() {
if (!data.weeks.some(w => Number(w.number) === 10)) data.weeks.push({number:10,date:'16th October 2026',event:'Grand Prix — Two Qualifying Rounds / Three Finals',tagline:'Two chances to qualify. A final for everyone.',details:'Two qualifying races per driver, three heats of up to four. Heat winners and fastest runner-up enter Final 1; remaining drivers enter Finals 2 and 3 by best qualifying result.',points:{},places:{}});
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
if (race.type === 'week10-grand-prix') {
content = renderWeek10(race);
} else if (race.type === 'grand-prix') {
content = renderGrandPrix(race);
} else if (race.type === 'knockout') {
content = renderKnockout(race);
} else if (race.type === 'heats') {
content = `<div class="race-grid">${race.groups.map((group, index) => `<div class="race-card"><h4>${group.length === 3 && Number(race.heatSize) === 2 ? `Heat ${index + 1} — 3-way race` : `Heat ${index + 1}`}</h4>${group.map((id) => `<div class="driver-slot">${esc(driverName(id))}</div>`).join('')}</div>`).join('')}</div>`;
} else if (race.type === 'teams') {
content = `<div class="race-grid">${race.groups.map((group, index) => `<div class="race-card"><h4>Team ${index + 1}</h4>${group.map((id) => `<div class="driver-slot">${esc(driverName(id))}</div>`).join('')}</div>`).join('')}</div>`;
}
els.raceDisplay.innerHTML = `<div class="race-title"><h3>${esc(race.label)}</h3><span class="muted small">${race.present?.length || 0} drivers</span></div>${content}`;
if (race.type === 'week10-grand-prix' && isAdmin) bindWeek10(race);
if (race.type === 'grand-prix' && isAdmin) bindGrandPrix(race);
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
function applyHeat2Swap() {
const race = data.currentRace;
if (race?.type !== 'week10-grand-prix' || Number(race.week) !== 10 ||
    !(Date.parse(race.createdAt) >= Date.parse('2026-10-15T11:00:00Z') && Date.parse(race.createdAt) < Date.parse('2026-10-16T11:00:00Z')) || race.finalizedAt ||
    race.heat2RileyZacSwap === '20261016') return false;
const normalise = value => String(value || '').trim().toLowerCase().replace(/\\s+/g,' ');
const riley = data.students.find(s => normalise(s.name) === 'riley c');
const zac = data.students.find(s => normalise(s.name) === 'zac c');
if (!riley || !zac || !race.groups?.[1]?.includes(riley.id) ||
    !race.groups?.[2]?.includes(zac.id)) return false;
race.groups = race.groups.map(group => group.map(id => id === riley.id ? zac.id : id === zac.id ? riley.id : id));
race.heat2RileyZacSwap = '20261016';
return true;
}
function renderAll() {
if (!data) return;
ensureWeek10();
applyHeat2Swap();
if (isAdmin && data.currentRace?.heat2RileyZacSwap === '20261016' && !data.currentRace.heat2RileyZacSwapSaved) {
data.currentRace.heat2RileyZacSwapSaved = true;
void saveData('Heat 2 updated: Zac C swapped with Riley C.').then(saved => { if (!saved && data.currentRace) delete data.currentRace.heat2RileyZacSwapSaved; });
}
for (const student of data.students) {
if (String(student.name || '').trim().toLowerCase().replace(/\s+/g,' ').replace(/\.$/,'') === 'dylan e') {
student.active = false;
attendance.delete(student.id);
}
}
const finale = data.weeks.find(w => Number(w.number) === 8);
if (finale) { finale.date = '16th October 2026'; finale.details = 'Three qualifying races with up to four drivers each. Three winners and the fastest runner-up reach the final. Final points: 20, 16, 12, 10.'; }
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
const present = [...document.querySelectorAll('[data-attendance]:checked')].map(c => c.dataset.attendance);
attendance = new Set(present);
if (present.length < 2) {
showToast('Select at least two students who are present.', true);
return;
}
const format = els.raceFormat.value;
const week = format === 'week10-grand-prix' ? 10 : Number(els.raceWeek.value || 1);
let race;
if (format === 'week10-grand-prix') {
if (present.length < 6 || present.length > 12) return showToast('Select 6–12 drivers for three qualifying heats (maximum four per heat). Selected: ' + present.length + '.',true);
const groups = generateHeats(present, 4, true);
// Exactly three balanced heats, including when fewer than nine attend.
if (groups.length !== 3) {
groups.splice(0, groups.length, [], [], []);
standings().filter(s => present.includes(s.id)).forEach((s,i) => {
const row = Math.floor(i / 3), pos = i % 3;
groups[row % 2 === 0 ? pos : 2-pos].push(s.id);
});
}
race={type:'week10-grand-prix',label:'Week 10 Grand Prix — Two Qualifying Rounds / Three Finals',week:10,present,groups,qualifyingRounds:[{},{}],finalResults:{},createdAt:new Date().toISOString()};
} else if (format === 'grand-prix') {
if (present.length < 6 || present.length > 12) {
showToast('Three qualifying races need 6–12 drivers, with 2–4 in each race.', true); return;
}
const groups = [[],[],[]];
shuffle(present).forEach((id,i) => groups[i % 3].push(id));
race = {type:'grand-prix', label:'Championship Grand Prix — 3 qualifiers + final', week, present, groups, qualifying:{}, finalResults:{}, createdAt:new Date().toISOString()};
} else if (format.startsWith('knockout')) {
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
if (saved) { renderAll(); setActiveTab('race-day'); }
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
week.points[id] = Number((weekNumber === 8 || weekNumber === 10) ? ([20,16,12,10,4,3,2,1][place - 1] ?? 0) : (data.scoring[place - 1] ?? 0));
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
els.raceWeek.addEventListener('change', () => {
if (els.raceWeek.value === '10') { els.raceFormat.value = 'week10-grand-prix'; els.raceFormat.dispatchEvent(new Event('change')); }
});
els.raceFormat.addEventListener('change', () => {
if (els.raceFormat.value === 'week10-grand-prix') { els.raceWeek.value = '10'; els.raceWeek.disabled = false; }
els.heatSizeWrap.classList.toggle('hidden', !els.raceFormat.value.startsWith('heats'));
});
els.generateRaceButton.addEventListener('click', async () => {
els.generateRaceButton.disabled = true;
try { await generateRace(); }
catch (error) { console.error('Race generation failed:',error); showToast('Could not generate races: ' + (error.message || 'unknown error'),true); }
finally { els.generateRaceButton.disabled = false; }
});
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
