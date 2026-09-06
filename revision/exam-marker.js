/* Year 10 Exam Practice marker
   Mirrors the feedback workflow used by the Year 11 Particle Physics revision site:
   automatic key-idea marking, progressive hints, and delayed model answers. */

const Y10_EXAM_TESTS = {
  atoms: [
    [
      [["13","proton"],["protons","13"]],
      [["14","neutron"],["27","13","14"]],
      [["10","electron"],["electrons","10"]],
      [["lost","3","electron"],["3+","lost","electron"],["positive","lost","electron"]]
    ],
    [
      [["more","shell"],["outer","electron","further","nucleus"]],
      [["shield"]],
      [["weaker","attraction"],["less","attraction","nucleus","electron"]],
      [["electron","easier","lose"],["lost","more","easily"],["easier","remove","electron"]]
    ],
    [
      [["sodium","lose","electron"],["na","lose","electron"],["na+","lose"]],
      [["chlorine","gain","electron"],["cl","gain","electron"],["cl-","gain"]],
      [["full","outer","shell"],["stable","electron","arrangement"]],
      [["opposite","charge","attract"],["electrostatic","attract"],["ionic","bond"]]
    ],
    [
      [["4al","3o2","2al2o3"],["4","al","3","o2","2","al2o3"]],
      [["4","al","6","o","both"],["4","aluminium","6","oxygen","each","side"]],
      [["coefficient","number","particle"],["coefficient","number","molecule"],["coefficient","not","subscript"],["formula","not","change"]]
    ]
  ],
  forces: [
    [
      [["2400","n","forward"],["3600","1200","2400"]],
      [["f","m","a"],["force","mass","acceleration"]],
      [["2400","1200"],["2400/1200"]],
      [["2","m/s2"],["2.0","m/s2"],["2","m s-2"]]
    ],
    [
      [["weight","down"]],
      [["weight","greater","air","resistance"],["weight",">","drag"],["resultant","down"]],
      [["accelerat"],["speed","increase"],["speeds","up"]],
      [["air","resistance","increase","speed"],["drag","increase","speed"]],
      [["air","resistance","equal","weight"],["drag","equal","weight"],["resultant","0","constant","speed"],["terminal","velocity","constant"]]
    ],
    [
      [["mass","balance"],["weigh","balance"]],
      [["initial","water","volume"],["starting","water","volume"],["measuring","cylinder","water"]],
      [["submerge","fully"],["fully","under","water"],["completely","submerged"]],
      [["change","water","volume","stone","volume"],["final","minus","initial","volume"],["displacement","volume"]],
      [["density","mass","volume"],["mass/volume"],["g/cm3"],["kg/m3"]]
    ],
    [
      [["18","6","4"],["12","4"]],
      [["3","m/s2"],["3","m s-2"]],
      [["constant","speed"],["18","m/s","5","s"]],
      [["acceleration","0"],["zero","acceleration"]]
    ]
  ],
  acids: [
    [
      [["hydrochloric","acid","sodium","hydroxide","sodium","chloride","water"],["hcl","naoh","nacl","h2o"]],
      [["h+","oh-","h2o"],["hydrogen","ion","hydroxide","ion","water"]],
      [["chloride","hydrochloric"],["chloride","salt"]],
      [["neutralis","salt","water"],["acid","base","salt","water"]]
    ],
    [
      [["fizz"],["bubble"]],
      [["magnesium","dissolv"],["temperature","rise"],["warm"]],
      [["hydrogen"]],
      [["lit","splint","squeaky","pop"],["squeaky","pop"]]
    ],
    [
      [["limewater"]],
      [["limewater","cloud"],["limewater","milk"]],
      [["calcium","carbonate","hydrochloric","acid","calcium","chloride","carbon","dioxide","water"],["caco3","hcl","cacl2","co2","h2o"]],
      [["fizz"],["bubble"]]
    ],
    [
      [["strength","ionis"],["strong","degree","ionis"]],
      [["strong","complete","ionis"],["strong","fully","ionis"],["weak","partial","ionis"],["weak","partly","ionis"]],
      [["concentration","amount","volume"],["concentration","particles","volume"],["concentration","solute","volume"]],
      [["higher","concentration","more","particle"],["more","reactant","particle","volume"]],
      [["more","frequent","collision"],["more","successful","collision"],["collision","rate","increase"]]
    ]
  ],
  genetics: [
    [
      [["dna","genetic","information"],["dna","information"]],
      [["chromosome","dna"],["chromosome","coiled","dna"],["chromosome","long","dna"]],
      [["gene","section","dna"],["gene","part","dna"]],
      [["allele","version","gene"],["allele","alternative","gene"]],
      [["phenotype"],["trait","allele"],["characteristic","gene"]]
    ],
    [
      [["heterozygous","parent"],["tt x tt"]],
      [["offspring","tt","tt"],["possible","genotype"]],
      [["1 2 1"],["1:2:1"]],
      [["short","tt"],["recessive","tt"]],
      [["25%"],["1/4"],["quarter"]]
    ],
    [
      [["inherited","variation","colour"],["genetic","variation","colour"]],
      [["dark","camouflage"],["pale","predat"],["birds","see","pale"]],
      [["dark","survive","more"],["dark","more","likely","survive"]],
      [["reproduce","more"],["more","offspring"]],
      [["pass","allele","offspring"],["inherit","dark","allele"]],
      [["dark","more","common","generation"],["allele","frequency","dark","increase"],["population","darker","generation"]]
    ],
    [
      [["kiwi"],["kakapo"],["kākāpō"],["tuatara"],["kea"],["weta"],["wētā"],["takahe"],["takahē"],["endemic"]],
      [["adapt"],["beak"],["camouflage"],["nocturnal"],["flightless"],["feather"],["claw"],["burrow"],["nostril"]],
      [["environment"],["forest"],["bush"],["night"],["ground"],["island"],["predator"],["cold"],["leaf","litter"]],
      [["surviv"],["reproduc"],["food"],["avoid","predator"],["find","mate"]]
    ]
  ]
};

const Y10_EXAM_MODELS = {
  atoms: [
    "Aluminium has atomic number 13, so the ion has 13 protons. Its neutron number is 27 − 13 = 14. A neutral aluminium atom has 13 electrons, but Al³⁺ has lost three electrons, so it has 10 electrons.",
    "Down Group 1 there are more occupied electron shells. The outer electron is further from the nucleus and is more shielded by inner electrons, so the attraction between the nucleus and the outer electron is weaker. The outer electron is therefore lost more easily, so reactivity increases.",
    "Sodium has one outer electron and loses it to form Na⁺. Chlorine has seven outer electrons and gains one electron to form Cl⁻. Both ions then have full outer shells. The oppositely charged ions attract by strong electrostatic forces, forming an ionic bond in sodium chloride.",
    "The balanced equation is 4Al + 3O₂ → 2Al₂O₃. This gives 4 aluminium atoms and 6 oxygen atoms on each side. The coefficients change the number of particles taking part; the subscripts in the chemical formulae are not changed."
  ],
  forces: [
    "The resultant force is 3600 − 1200 = 2400 N forwards. Using F = ma, a = F/m = 2400/1200 = 2.0 m/s².",
    "Weight acts downward throughout the fall. At first weight is greater than air resistance, so there is a downward resultant force and the skydiver accelerates. As speed increases, air resistance increases. At terminal velocity air resistance equals weight, so the resultant force is zero and the skydiver continues at constant speed.",
    "Measure the stone's mass using a balance. Record the initial water volume in a measuring cylinder, then fully submerge the stone and record the final volume. The increase in water volume is the volume of the stone. Calculate density using density = mass ÷ volume and give an appropriate unit such as g/cm³.",
    "The acceleration is (18 − 6) ÷ 4 = 3 m/s². During the middle 5 s the cyclist travels at a constant speed of 18 m/s, so the acceleration during that section is 0 m/s²."
  ],
  acids: [
    "hydrochloric acid + sodium hydroxide → sodium chloride + water. The ionic equation is H⁺ + OH⁻ → H₂O. Hydrochloric acid forms a chloride salt, and neutralisation produces a salt and water.",
    "The student would see fizzing or bubbles and the magnesium would gradually dissolve; the mixture may also warm. The gas is hydrogen. A lit splint placed at the gas gives a squeaky pop.",
    "Pass the gas produced through limewater. Carbon dioxide turns limewater cloudy or milky. The word equation is calcium carbonate + hydrochloric acid → calcium chloride + carbon dioxide + water. Fizzing is also observed as the gas is produced.",
    "Acid strength describes the degree of ionisation: a strong acid ionises completely or nearly completely in water, whereas a weak acid ionises only partly. Concentration describes how much acid is present per unit volume. A higher concentration gives more reactant particles in the same volume, causing more frequent successful collisions and therefore a faster reaction."
  ],
  genetics: [
    "DNA carries genetic information. Chromosomes are long, coiled DNA molecules. A gene is a section of DNA that can influence a characteristic. Alleles are alternative versions of the same gene, and different alleles can contribute to differences in phenotype.",
    "The parents are Tt × Tt. The possible offspring genotypes are TT, Tt, Tt and tt, giving a genotype ratio of 1:2:1. Only tt is short, so the probability of a short offspring is 1/4 or 25%.",
    "There is inherited variation in insect colour. On dark bark, darker insects are better camouflaged, while pale insects are more likely to be eaten by birds. Darker insects therefore survive and reproduce more successfully and pass alleles for darker colour to their offspring. Over many generations those alleles become more common, so the population becomes darker.",
    "For example, kiwi have nostrils near the tip of a long beak. This helps them detect invertebrates beneath leaf litter while foraging on the forest floor, including at night. Finding food more effectively improves their chances of survival and reproduction."
  ]
};

const y10ExamSelection = {};

function markerNormalise(text) {
  return String(text || '')
    .replace(/[₀]/g,'0').replace(/[₁]/g,'1').replace(/[₂]/g,'2').replace(/[₃]/g,'3').replace(/[₄]/g,'4')
    .replace(/[₅]/g,'5').replace(/[₆]/g,'6').replace(/[₇]/g,'7').replace(/[₈]/g,'8').replace(/[₉]/g,'9')
    .replace(/[⁺]/g,'+').replace(/[⁻−–—]/g,'-')
    .replace(/[×*]/g,' x ')
    .replace(/[→⇒]/g,' ')
    .toLowerCase()
    .replace(/[,()=:;]/g,' ')
    .replace(/\s+/g,' ')
    .trim();
}

function markerPointHit(raw, answer, tests, topic, questionIndex, pointIndex) {
  if (topic === 'genetics' && questionIndex === 1) {
    if (pointIndex === 0) {
      return (/\bTt\b[\s\S]*\bTt\b/.test(raw) || (answer.includes('heterozygous') && answer.includes('parent')));
    }
    if (pointIndex === 1) {
      return /\bTT\b/.test(raw) && /\bTt\b/.test(raw) && /\btt\b/.test(raw);
    }
    if (pointIndex === 3) {
      return /\btt\b/.test(raw) && (answer.includes('short') || answer.includes('recessive'));
    }
  }
  return (tests || []).some(test => test.every(term => answer.includes(markerNormalise(term))));
}

function broadYear10Hint(item) {
  if (currentModule === 'atoms') {
    if (/calculation|balanc/i.test(item.title)) return 'Show the numerical or symbolic steps clearly, then explain what the numbers mean in terms of particles or subatomic particles.';
    if (/trend/i.test(item.title)) return 'Link the trend to electron shells, shielding, attraction to the nucleus and how easily the outer electron is lost.';
    return 'Track electron transfer carefully and use the correct ion charges and bonding language.';
  }
  if (currentModule === 'forces') {
    if (/resultant|motion graph/i.test(item.title)) return 'Write the correct equation, substitute the values with units and then interpret the motion.';
    if (/density/i.test(item.title)) return 'Describe the measurements in a sensible practical order, explain how volume is found, and finish with the density calculation.';
    return 'Explain the changing balance of forces and connect resultant force to acceleration or constant speed.';
  }
  if (currentModule === 'acids') {
    if (/strength/i.test(item.title)) return 'Keep strength and concentration separate, then use particle collision ideas to explain reaction rate.';
    return 'Use the correct reaction products, observations and gas tests. Include equations where the question asks for them.';
  }
  if (/punnett/i.test(item.title)) return 'State the parent genotypes, list the possible offspring genotypes, then give the required probability.';
  if (/natural selection/i.test(item.title)) return 'Use the full sequence: inherited variation → selection pressure → differential survival/reproduction → allele passed on → change over generations.';
  if (/adaptation/i.test(item.title)) return 'Name a specific NZ endemic organism and adaptation, explain how the adaptation works, link it to the environment, and state the survival or reproductive advantage.';
  return 'Use the vocabulary precisely and explain how DNA, chromosomes, genes, alleles and phenotype are related.';
}

function targetedYear10Hints(item, hits) {
  return item.scheme
    .filter((_, i) => !hits[i])
    .slice(0, 2)
    .map(label => `Think about this missing idea: ${label.charAt(0).toLowerCase()}${label.slice(1)}.`);
}

function examMarkerStyles() {
  return `<style id="y10-exam-marker-styles">
    .y10-exam-picker{display:flex;flex-wrap:wrap;gap:8px;margin:14px 0 18px}.y10-exam-picker button{border:1px solid var(--line);background:var(--card);color:var(--ink);border-radius:999px;padding:9px 12px;font-weight:800;cursor:pointer}.y10-exam-picker button.active{background:var(--module);border-color:var(--module);color:#fff}.y10-exam-picker button.mastered:not(.active){border-color:#55a276;background:#edf9f2;color:#246b48}.y10-exam-answer{width:100%;min-height:150px;border:1px solid var(--line);border-radius:13px;padding:13px;background:var(--card);color:var(--ink);resize:vertical;font:inherit}.y10-marker-actions{display:flex;gap:9px;flex-wrap:wrap;margin-top:10px}.y10-marker-result{margin-top:16px}.y10-score-line{display:flex;align-items:center;justify-content:space-between;gap:12px;border:1px solid var(--line);border-radius:13px;padding:11px 13px;margin-bottom:10px}.y10-score-line strong{font-size:1.15rem}.y10-feedback{padding:13px 15px;border-radius:13px;background:#fff7e8;border-left:5px solid #d69a24;margin:10px 0}.y10-feedback.good{background:#edf9f2;border-left-color:#4b9b70}.y10-hints{display:grid;gap:8px;margin:10px 0}.y10-hint{padding:10px 12px;border-radius:12px;background:#f2f6fb;border:1px solid var(--line)}.y10-mark-points{display:grid;gap:7px;margin:12px 0}.y10-mark-point{display:flex;gap:8px;align-items:flex-start;border:1px solid var(--line);border-radius:11px;padding:9px 11px}.y10-mark-point.hit{background:#edf9f2;border-color:#7ab391}.y10-model{padding:14px 15px;border-radius:13px;background:color-mix(in srgb,var(--module) 7%,#fff);border:1px solid color-mix(in srgb,var(--module) 30%,var(--line));margin:12px 0}.y10-model strong{display:block;margin-bottom:5px}.y10-provisional{color:var(--muted);font-size:.86rem}.y10-exam-counter{font-size:.84rem;color:var(--muted);font-weight:800}body.dark .y10-exam-picker button,body.dark .y10-exam-answer,body.dark .y10-score-line,body.dark .y10-mark-point{background:#102033}body.dark .y10-feedback{background:#332a17}body.dark .y10-feedback.good,body.dark .y10-mark-point.hit{background:#173326}body.dark .y10-hint{background:#102033}
  </style>`;
}

function renderExam() {
  ensure();
  state.examAttempts ||= {};
  state.examAttempts[currentModule] ||= {};

  const es = exams[currentModule];
  const saved = state.exam[currentModule] || {};
  let current = Number(y10ExamSelection[currentModule] ?? 0);
  current = Math.max(0, Math.min(current, es.length - 1));
  y10ExamSelection[currentModule] = current;
  const item = es[current];
  const earned = Object.values(saved).reduce((sum, v) => sum + (v?.auto ? Number(v.mark || 0) : 0), 0);
  const total = es.reduce((sum, q) => sum + q.marks, 0);

  panel.innerHTML = hero() + examMarkerStyles() + `
    <section class="exam-card">
      <div class="exam-top">
        <div><h3>GCSE-style Exam Practice</h3><p>Write a complete answer and improve it through feedback. Hints become more detailed after repeated attempts.</p></div>
        <span class="score-pill">${earned}/${total} marks banked</span>
      </div>
      <div class="y10-exam-picker" aria-label="Choose exam question">
        ${es.map((q,i) => {
          const done = saved[i]?.auto && Number(saved[i].mark || 0) >= q.marks;
          return `<button type="button" data-exam-index="${i}" class="${i===current?'active':''} ${done?'mastered':''}">${done?'✓ ':''}Question ${i+1}</button>`;
        }).join('')}
      </div>
      <article class="question-card">
        <div class="question-meta"><span class="exam-command">${item.title}</span><span class="marks">[${item.marks} marks]</span></div>
        <div class="question-text">${item.prompt}</div>
        <textarea class="y10-exam-answer" id="exam-answer" placeholder="Write your answer here..." aria-label="Your exam answer"></textarea>
        <div class="y10-marker-actions">
          <button class="check-btn" id="mark-answer" type="button">Check my answer</button>
          <button class="reset-btn" id="clear-answer" type="button">Clear</button>
          <span class="y10-exam-counter">Question ${current+1} of ${es.length}</span>
        </div>
        <div id="marker-output"></div>
      </article>
      <p class="y10-provisional">The marker checks for the key science ideas in the question. The model answer stays hidden at first: use the feedback, improve your response and try again.</p>
      <button class="reset-btn" id="reset-exam" type="button">Reset exam progress for this topic</button>
    </section>`;

  panel.querySelectorAll('[data-exam-index]').forEach(button => button.addEventListener('click', () => {
    y10ExamSelection[currentModule] = Number(button.dataset.examIndex);
    renderExam();
  }));

  document.getElementById('mark-answer').addEventListener('click', () => markYear10Exam(item, current));
  document.getElementById('clear-answer').addEventListener('click', () => {
    document.getElementById('exam-answer').value = '';
    document.getElementById('marker-output').innerHTML = '';
  });
  document.getElementById('reset-exam').addEventListener('click', () => {
    if (confirm('Reset all automatically marked Exam Practice progress for this topic?')) {
      state.exam[currentModule] = {};
      state.examAttempts[currentModule] = {};
      saveState();
      renderExam();
    }
  });
}

function markYear10Exam(item, questionIndex) {
  const input = document.getElementById('exam-answer');
  const raw = input.value.trim();
  if (raw.length < 8) {
    input.focus();
    document.getElementById('marker-output').innerHTML = '<div class="y10-feedback">Write a fuller answer before checking.</div>';
    return;
  }

  state.examAttempts ||= {};
  state.examAttempts[currentModule] ||= {};
  state.exam[currentModule] ||= {};

  const answer = markerNormalise(raw);
  const tests = Y10_EXAM_TESTS[currentModule]?.[questionIndex] || [];
  const hits = item.scheme.map((_, pointIndex) => markerPointHit(raw, answer, tests[pointIndex], currentModule, questionIndex, pointIndex));
  const score = Math.min(item.marks, hits.filter(Boolean).length);
  const previous = state.exam[currentModule][questionIndex];
  const old = previous?.auto ? Number(previous.mark || 0) : 0;
  const wasMastered = old >= item.marks;
  const attempt = Number(state.examAttempts[currentModule][questionIndex] || 0) + 1;
  state.examAttempts[currentModule][questionIndex] = attempt;

  const best = Math.max(old, score);
  state.exam[currentModule][questionIndex] = {mark:Math.min(item.marks, best), auto:true};
  if (score > old) state.xp += (score - old) * 5;
  saveState();

  const mastered = Number(state.exam[currentModule][questionIndex].mark || 0) >= item.marks;
  const model = Y10_EXAM_MODELS[currentModule]?.[questionIndex] || item.scheme.join('. ') + '.';

  let feedback = '';
  if (mastered) {
    feedback = `
      <div class="y10-feedback good"><strong>Full marks — mastered</strong><br>You have included all of the required science ideas.</div>
      <div class="y10-model"><strong>Model answer</strong>${model}</div>`;
  } else if (attempt === 1) {
    feedback = `
      <div class="y10-feedback"><strong>Attempt 1 — improve and try again</strong><br>You have included <strong>${score} of ${item.marks}</strong> key ideas. ${broadYear10Hint(item)}</div>
      <p class="y10-provisional">The marking points and model answer are still hidden.</p>`;
  } else if (attempt === 2) {
    const hints = targetedYear10Hints(item, hits);
    feedback = `
      <div class="y10-feedback"><strong>Attempt 2 — targeted hints</strong><br>You have included <strong>${score} of ${item.marks}</strong> key ideas.</div>
      <div class="y10-hints">${hints.map(h => `<div class="y10-hint">💡 ${h}</div>`).join('')}</div>
      <p class="y10-provisional">The full answer is still hidden. Use the hints and try again.</p>`;
  } else {
    feedback = `
      <div class="y10-feedback"><strong>Attempt ${attempt} — worked support unlocked</strong><br>You have had several attempts, so the marking points and model answer are now shown. Study them, then rewrite the answer yourself and submit again for mastery.</div>
      <div class="y10-mark-points">${item.scheme.map((point,i) => `<div class="y10-mark-point ${hits[i]?'hit':''}"><span aria-hidden="true">${hits[i]?'✓':'○'}</span><span>${point}</span></div>`).join('')}</div>
      <div class="y10-model"><strong>Model answer</strong>${model}</div>
      <p class="y10-provisional"><strong>This is not yet mastered.</strong> You still need to submit a full-mark answer yourself.</p>`;
  }

  const status = mastered ? '✓ mastered' : `attempt ${attempt}`;
  document.getElementById('marker-output').innerHTML = `
    <div class="y10-marker-result">
      <div class="y10-score-line"><strong>${score} / ${item.marks}</strong><span class="y10-provisional">${status}</span></div>
      ${feedback}
    </div>`;

  if (mastered && !wasMastered) {
    document.getElementById('marker-output').scrollIntoView({behavior:'smooth', block:'nearest'});
  }
}

function moduleStats(id) {
  const c = state.checks?.[id] || {};
  const qs = checks[id].length;
  const correct = Object.values(c).filter(v => v.correct).length;
  const checkPct = correct / qs * 100;
  const eSaved = state.exam?.[id] || {};
  const earned = Object.values(eSaved).reduce((sum,v) => sum + (v?.auto ? Number(v.mark || 0) : 0), 0);
  const total = exams[id].reduce((sum,v) => sum + v.marks, 0);
  const examPct = total ? earned / total * 100 : 0;
  const mastery = Math.round((checkPct + examPct) / 2);
  const unlocked = correct >= Math.ceil(qs * .7) && earned >= Math.ceil(total * .5);
  return {correct, qs, earned, total, mastery, unlocked};
}
