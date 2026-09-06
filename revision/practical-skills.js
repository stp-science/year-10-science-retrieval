(() => {
  'use strict';

  const practicalButton = document.getElementById('practical-skills-button');
  const panel = document.getElementById('content-panel');
  if (!practicalButton || !panel) return;

  const PRACTICAL_KEY = 'stp-y10-practical-skills-v1';
  let practicalView = 'learn';
  let practicalSection = 0;
  let practicalState = loadPracticalState();

  const sections = [
    {
      title: 'Variables & fair tests',
      video: ['J9kCgWAuB0Y', 'Variables in science', 'BioMan Biology', 'Independent, dependent and control variables, and why controlling variables matters.'],
      body: `
        <p>Most investigations test how changing one factor affects another. To make the test valid, identify the variables before writing the method.</p>
        <div class="concept-grid">
          <div class="concept"><strong>Independent variable</strong><p>The factor you deliberately change.</p></div>
          <div class="concept"><strong>Dependent variable</strong><p>The factor you measure or observe.</p></div>
          <div class="concept"><strong>Control variables</strong><p>Factors kept the same because they could affect the result.</p></div>
        </div>
        <div class="worked"><strong>Example: effect of temperature on reaction rate</strong><p>Independent variable = temperature. Dependent variable = reaction time or rate. Controls could include concentration, volume and total amount of reactants.</p></div>
        <div class="exam-tip"><strong>Fair test:</strong> change one independent variable, measure the dependent variable and keep relevant control variables constant.</div>`
    },
    {
      title: 'Planning a method',
      video: ['J9kCgWAuB0Y', 'Planning a fair investigation', 'BioMan Biology', 'A useful reminder of variables and experimental design before writing a method.'],
      body: `
        <p>A good method should be detailed enough for another student to repeat it and collect comparable data.</p>
        <div class="worked"><strong>Include:</strong><ol>
          <li>the independent variable and the values you will test</li>
          <li>the dependent variable and exactly how it will be measured</li>
          <li>important control variables and how they will be kept constant</li>
          <li>appropriate equipment, including sizes or ranges where relevant</li>
          <li>a sensible range and intervals for the independent variable</li>
          <li>repeats and how the results will be processed</li>
          <li>hazards, risks and control measures</li>
        </ol></div>
        <div class="mistake"><strong>Avoid vague methods.</strong> “Measure the temperature” is weaker than “measure the temperature using a digital thermometer and record it in °C”.</div>`
    },
    {
      title: 'Measurements, accuracy & precision',
      video: ['uQLM-j0aQ7I', 'Scientific measurement, accuracy and precision', 'Michael Evans', 'Supports choosing measurements carefully and distinguishing accuracy from precision.'],
      body: `
        <p>Choose equipment that gives measurements with suitable <strong>resolution</strong> for the investigation.</p>
        <div class="concept-grid">
          <div class="concept"><strong>Accuracy</strong><p>How close a measurement is to the true or accepted value.</p></div>
          <div class="concept"><strong>Precision</strong><p>How close repeated measurements are to each other.</p></div>
          <div class="concept"><strong>Resolution</strong><p>The smallest change that an instrument can show.</p></div>
        </div>
        <ul><li>Read scales at eye level where appropriate.</li><li>Use the correct unit in every measurement.</li><li>Use equipment suited to the size of the measurement.</li><li>Check for zero errors before collecting data.</li></ul>
        <div class="worked"><strong>Example</strong><p>For 23 cm³ of liquid, a measuring cylinder is more suitable than estimating the volume in a beaker.</p></div>`
    },
    {
      title: 'Repeats, means & anomalies',
      video: ['uQLM-j0aQ7I', 'Improving measurement quality', 'Michael Evans', 'Reinforces why repeated measurements and careful measurement improve the quality of data.'],
      body: `
        <p>Repeating measurements helps you identify unusual results and reduces the influence of random variation.</p>
        <div class="equation">mean = total of valid repeat values ÷ number of valid repeat values</div>
        <p>An <strong>anomaly</strong> is a result that does not fit the pattern of the other data. Do not automatically delete it: check the method, repeat the measurement and only exclude it from a mean when there is a clear reason.</p>
        <div class="worked"><strong>Example</strong><p>Times of 18.2 s, 18.4 s and 29.7 s suggest 29.7 s may be anomalous. Repeat the measurement before deciding what to do with it.</p></div>
        <div class="mistake"><strong>Repeats do not remove systematic error.</strong> If an instrument is incorrectly calibrated, repeating the same measurement may reproduce the same biased result.</div>`
    },
    {
      title: 'Results tables & graphs',
      video: ['ELrELW3Q0dk', 'Collecting results and plotting graphs', 'Burrows Physics', 'Supports clear results tables, graph scales, plotting and lines of best fit.'],
      body: `
        <p>Organise raw data before deciding how to display it.</p>
        <div class="concept-grid">
          <div class="concept"><strong>Results tables</strong><p>Put the variable name and unit in the heading. Keep measurements to a consistent number of decimal places where appropriate.</p></div>
          <div class="concept"><strong>Line graph</strong><p>Usually used when the independent variable is continuous, such as time, temperature or concentration.</p></div>
          <div class="concept"><strong>Bar chart</strong><p>Used for categories or discrete groups.</p></div>
        </div>
        <ul><li>Independent variable on the x-axis.</li><li>Dependent variable on the y-axis.</li><li>Label both axes with quantity and unit.</li><li>Use a simple, even scale that fills most of the graph area.</li><li>Plot points accurately.</li><li>Draw a suitable line or curve of best fit where appropriate rather than automatically joining dot-to-dot.</li></ul>`
    },
    {
      title: 'Conclusions from data',
      video: ['ELrELW3Q0dk', 'Using graphs to interpret results', 'Burrows Physics', 'Supports identifying trends from data and using graphs as evidence.'],
      body: `
        <p>A conclusion should answer the investigation question using the evidence collected.</p>
        <div class="worked"><strong>Strong conclusion structure</strong><ol>
          <li>State the overall relationship or trend.</li>
          <li>Support it with values from the results or graph.</li>
          <li>Use science ideas to explain the pattern when the question asks you to explain.</li>
        </ol></div>
        <div class="worked"><strong>Example</strong><p>“As concentration increased, reaction time decreased. At 0.5 mol/L the reaction took 80 s, but at 1.0 mol/L it took 39 s. A higher concentration gives more reacting particles in the same volume, so collisions occur more frequently.”</p></div>
        <div class="mistake"><strong>Do not just say “it increased”.</strong> Name both variables and describe the relationship between them.</div>`
    },
    {
      title: 'Evaluation & improvements',
      video: ['uQLM-j0aQ7I', 'Measurement quality and experimental error', 'Michael Evans', 'Useful background for evaluating data quality and suggesting specific improvements.'],
      body: `
        <p>Evaluation means identifying a genuine limitation and explaining how it affects the data. An improvement should directly address that limitation.</p>
        <table class="mini-table"><thead><tr><th>Weak evaluation</th><th>Stronger evaluation</th></tr></thead><tbody>
          <tr><td>“Human error.”</td><td>“Starting and stopping the stopwatch by hand introduces reaction-time variation.”</td></tr>
          <tr><td>“Use better equipment.”</td><td>“Use a light gate instead of a handheld stopwatch to reduce reaction-time uncertainty.”</td></tr>
          <tr><td>“Do more.”</td><td>“Repeat each value at least three times and calculate a mean to reduce the effect of random variation.”</td></tr>
        </tbody></table>
        <p>Also consider whether the range was wide enough, intervals were sensible, variables were controlled, sample size was large enough and the measuring equipment had suitable resolution.</p>
        <div class="exam-tip"><strong>Safety:</strong> identify the hazard, describe the risk and state a specific control measure. For example, “dilute acid can irritate eyes, so wear safety glasses.”</div>`
    }
  ];

  const quickChecks = [
    {q:'A student changes the temperature of a reaction and measures the time taken. What is the independent variable?',o:['Reaction time','Temperature','Volume of gas','Type of stopwatch'],a:1,e:'The independent variable is the factor deliberately changed.'},
    {q:'In the same investigation, what is the dependent variable?',o:['Temperature','Reaction time','Volume of acid used only','Room number'],a:1,e:'The dependent variable is what is measured in response to the change.'},
    {q:'Why are control variables kept constant?',o:['To make the graph look better','So only the independent variable should cause changes in the dependent variable','To increase the number of results','To remove the need for repeats'],a:1,e:'Controlling other relevant factors makes the comparison valid.'},
    {q:'Why are measurements repeated?',o:['To guarantee the accepted value','To identify anomalies and reduce the influence of random variation','To remove all systematic error','To change the independent variable'],a:1,e:'Repeats help reveal unusual values and allow a mean to be calculated.'},
    {q:'Which result is most likely anomalous: 12.1, 12.3, 19.8, 12.2?',o:['12.1','12.3','19.8','12.2'],a:2,e:'19.8 is far from the cluster of the other three values.'},
    {q:'Which variable normally goes on the x-axis of a graph?',o:['Dependent variable','Independent variable','Control variable','Any variable'],a:1,e:'The independent variable normally goes on the x-axis.'},
    {q:'Which display is usually most suitable for continuous temperature data?',o:['Line graph','Pie chart','Pictogram','Bar chart with unrelated categories'],a:0,e:'A line graph is normally used when the independent variable is continuous.'},
    {q:'What does the resolution of an instrument describe?',o:['How close it is to the true value','The smallest change it can show','How many repeats are taken','How safe it is'],a:1,e:'Resolution is the smallest change that can be distinguished by the instrument.'},
    {q:'Which is the strongest suggested improvement?',o:['Be more careful','Avoid human error','Repeat each value three times and calculate a mean','Get better results'],a:2,e:'A good improvement is specific and explains exactly what should change.'},
    {q:'Which statement is the best conclusion?',o:['The results changed','As temperature increased, reaction time decreased from 80 s to 41 s','The graph was good','My hypothesis was correct'],a:1,e:'A strong conclusion names the variables, states the trend and supports it with evidence.'}
  ];

  const applied = [
    {
      title:'Planning an investigation', marks:6,
      prompt:`A student wants to investigate how temperature affects the time taken for amylase to break down starch. Describe how the student could plan a valid investigation.`,
      hint:'Think about what is changed, what is measured, what must be kept the same, how the data will be made dependable and how the practical will be carried out safely.',
      points:[
        {label:'identifies temperature as the independent variable', tests:[['temperature','independent'],['change','temperature']]},
        {label:'identifies reaction time as the dependent variable', tests:[['time','dependent'],['measure','time']]},
        {label:'states at least one suitable control variable', tests:[['control','ph'],['same','ph'],['control','concentration'],['same','concentration'],['same','volume']]},
        {label:'uses a controlled way to set temperature', tests:[['water bath'],['temperature','controlled']]},
        {label:'repeats measurements and calculates a mean', tests:[['repeat','mean'],['repeat','average']]},
        {label:'includes a relevant safety control', tests:[['safety','glasses'],['goggles'],['hot','water','care'],['eye','protection']]}
      ],
      model:'Change the temperature using water baths while keeping pH, enzyme concentration, starch concentration and volumes constant. Measure the time taken for starch to disappear using the same endpoint each time. Repeat each temperature at least three times and calculate a mean. Use suitable eye protection and take care with hot water.'
    },
    {
      title:'Tables, graphs & anomalies', marks:5,
      prompt:`A student measures reaction rate at concentrations of 0.2, 0.4, 0.6, 0.8 and 1.0 mol/L. They repeat each concentration three times. Explain how the student should organise and display the results, including what to do if one repeat is very different from the others.`,
      hint:'Think about table headings, units, repeats, mean values, axes and unusual results.',
      points:[
        {label:'table headings include quantity and units', tests:[['table','unit'],['heading','unit']]},
        {label:'records repeats and calculates a mean', tests:[['repeat','mean'],['three','mean'],['average']]},
        {label:'places concentration on the x-axis', tests:[['concentration','x-axis'],['independent','x-axis']]},
        {label:'places rate on the y-axis and uses a suitable scale/line of best fit', tests:[['rate','y-axis'],['dependent','y-axis'],['line of best fit'],['suitable','scale']]},
        {label:'recognises the unusual value as an anomaly and repeats/checks it', tests:[['anomal','repeat'],['anomal','check'],['outlier','repeat']]}
      ],
      model:'Use a results table with concentration (mol/L), the three repeat rate values and a mean. Plot concentration on the x-axis and mean reaction rate on the y-axis with labelled units and a sensible scale, then draw a suitable line or curve of best fit. If one repeat is very different, treat it as a possible anomaly and repeat or check that measurement before deciding whether to exclude it from the mean.'
    },
    {
      title:'Improving measurement quality', marks:5,
      prompt:`A student measures 25 cm³ of water using a 100 cm³ beaker, then times a reaction using a handheld stopwatch. Suggest improvements that would produce better quality data and explain why they would help.`,
      hint:'Match each limitation to a specific piece of equipment or method change.',
      points:[
        {label:'uses a measuring cylinder or other more suitable volume apparatus', tests:[['measuring cylinder'],['pipette'],['burette']]},
        {label:'links the new apparatus to better resolution or more precise volume measurement', tests:[['resolution'],['precise','volume'],['more precise'],['smaller','scale']]},
        {label:'reduces timing reaction-time error with an automated method where possible', tests:[['light gate'],['sensor'],['automatic','timing'],['data logger']]},
        {label:'takes repeats', tests:[['repeat']]},
        {label:'calculates a mean or uses repeats to identify anomalies', tests:[['mean'],['average'],['anomal']]}
      ],
      model:'Measure 25 cm³ using a measuring cylinder or other suitable volumetric apparatus rather than a beaker because it has finer graduations and better resolution. Where possible use an automated sensor or timing system to reduce reaction-time variation. Repeat each measurement and calculate a mean, checking any anomalous values.'
    },
    {
      title:'Conclusion & evaluation', marks:5,
      prompt:`A student finds that increasing concentration makes a reaction finish more quickly. At 0.4 mol/L the reaction takes 92 s and at 1.0 mol/L it takes 36 s. Write a strong conclusion and give one specific evaluation point with an improvement.`,
      hint:'Your conclusion needs the relationship, evidence and a scientific explanation. Your evaluation needs a named limitation and a matched improvement.',
      points:[
        {label:'states that higher concentration gives a shorter reaction time or faster rate', tests:[['concentration','increase','time','decrease'],['higher','concentration','faster'],['higher','concentration','shorter','time']]},
        {label:'quotes evidence from the data', tests:[['0.4','92'],['1.0','36'],['92','36']]},
        {label:'explains the trend using more particles and more frequent collisions', tests:[['more','particle','collision'],['more frequent','collision'],['collision','frequency']]},
        {label:'identifies a specific limitation', tests:[['stopwatch'],['temperature','change'],['few','repeat'],['resolution'],['reaction time']]},
        {label:'suggests a matching specific improvement', tests:[['repeat'],['water bath'],['sensor'],['light gate'],['higher resolution'],['digital']]}
      ],
      model:'As concentration increases, reaction time decreases, so the reaction rate increases. For example, the time falls from 92 s at 0.4 mol/L to 36 s at 1.0 mol/L. A higher concentration contains more reacting particles in the same volume, so collisions occur more frequently. One limitation could be judging the endpoint by eye; using a sensor or another objective endpoint would reduce this subjectivity.'
    }
  ];

  injectStyles();

  practicalButton.addEventListener('click', () => {
    practicalButton.classList.add('active');
    document.querySelectorAll('#module-buttons .module-button').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.mode-tab').forEach(b => b.classList.remove('active'));
    renderPractical();
  });

  const moduleButtons = document.getElementById('module-buttons');
  if (moduleButtons) moduleButtons.addEventListener('click', () => practicalButton.classList.remove('active'));
  document.querySelectorAll('.mode-tab').forEach(b => b.addEventListener('click', () => practicalButton.classList.remove('active')));

  function loadPracticalState() {
    try { return JSON.parse(localStorage.getItem(PRACTICAL_KEY)) || {checks:{},exam:{}}; }
    catch { return {checks:{},exam:{}}; }
  }

  function savePracticalState() {
    try { localStorage.setItem(PRACTICAL_KEY, JSON.stringify(practicalState)); } catch {}
  }

  function injectStyles() {
    const style = document.createElement('style');
    style.textContent = `
      .practical-special{margin-top:10px;width:100%;}
      .practical-inner-tabs{display:flex;gap:8px;flex-wrap:wrap;margin:0 0 16px}
      .practical-inner-tabs button{border:1px solid var(--line);background:var(--card);color:var(--ink);padding:10px 14px;border-radius:999px;font-weight:800;cursor:pointer}
      .practical-inner-tabs button.active{background:#17785c;color:white;border-color:#17785c}
      .practical-question{background:var(--card);border:1px solid var(--line);border-radius:16px;padding:16px;margin:12px 0}
      .practical-question textarea{width:100%;min-height:150px;box-sizing:border-box;border:1px solid var(--line);background:var(--card);color:var(--ink);border-radius:12px;padding:12px;font:inherit;margin:10px 0}
      .practical-feedback{margin-top:10px;padding:12px;border-radius:12px;background:var(--soft-bg,#f3f7fb)}
      .practical-feedback.good{background:#e9f8f0}.practical-feedback.bad{background:#fff2ed}
      .practical-score{font-weight:900;color:#17785c}
      .practical-picker{display:flex;gap:8px;flex-wrap:wrap;margin:12px 0}
      .practical-picker button{border:1px solid var(--line);background:var(--card);color:var(--ink);padding:8px 12px;border-radius:10px;cursor:pointer;font-weight:800}
      .practical-picker button.active{background:#17785c;color:#fff;border-color:#17785c}
    `;
    document.head.appendChild(style);
  }

  function hero() {
    return `<section class="module-hero" style="--module:#17785c"><span class="module-number">PRACTICAL SKILLS</span><h2>Working Scientifically</h2><p>Plan investigations, collect high-quality measurements, process data, draw evidence-based conclusions and evaluate methods.</p></section>`;
  }

  function tabs() {
    return `<div class="practical-inner-tabs" aria-label="Practical skills modes">
      <button data-pview="learn" class="${practicalView==='learn'?'active':''}">Learn</button>
      <button data-pview="check" class="${practicalView==='check'?'active':''}">Quick Check</button>
      <button data-pview="apply" class="${practicalView==='apply'?'active':''}">Practice Questions</button>
    </div>`;
  }

  function renderPractical() {
    panel.style.setProperty('--module', '#17785c');
    panel.innerHTML = hero() + tabs() + `<div id="practical-body"></div>`;
    panel.querySelectorAll('[data-pview]').forEach(b => b.addEventListener('click', () => {
      practicalView = b.dataset.pview;
      renderPractical();
    }));
    if (practicalView === 'learn') renderLearn();
    if (practicalView === 'check') renderCheck();
    if (practicalView === 'apply') renderApply();
    window.scrollTo({top:Math.max(0, document.querySelector('.mode-tabs').offsetTop - 90), behavior:'smooth'});
  }

  function renderLearn() {
    practicalSection = Math.max(0, Math.min(practicalSection, sections.length - 1));
    const body = document.getElementById('practical-body');
    body.innerHTML = `
      <section style="background:var(--card);border:1px solid var(--line);border-radius:18px;padding:16px 18px;margin-bottom:16px;">
        <label for="practical-section-select" style="display:block;font-size:.78rem;font-weight:900;letter-spacing:.09em;text-transform:uppercase;color:var(--muted);margin-bottom:7px;">Choose section</label>
        <select id="practical-section-select" style="width:100%;min-height:46px;border:1px solid var(--line);border-radius:12px;padding:10px 12px;background:var(--card);color:var(--ink);font:inherit;font-weight:750;">
          ${sections.map((s,i)=>`<option value="${i}">${i+1}. ${s.title}</option>`).join('')}
        </select>
        <div style="display:flex;justify-content:space-between;align-items:center;gap:10px;margin-top:12px;flex-wrap:wrap;">
          <button class="check-btn" id="practical-prev">← Previous</button>
          <strong id="practical-count" style="color:var(--muted);font-size:.88rem"></strong>
          <button class="check-btn" id="practical-next">Next →</button>
        </div>
      </section>
      <article class="lesson-card" id="practical-lesson"></article>`;
    const select = document.getElementById('practical-section-select');
    const card = document.getElementById('practical-lesson');
    const count = document.getElementById('practical-count');
    const prev = document.getElementById('practical-prev');
    const next = document.getElementById('practical-next');
    const show = (i) => {
      practicalSection = Math.max(0, Math.min(Number(i), sections.length-1));
      const s = sections[practicalSection];
      select.value = String(practicalSection);
      count.textContent = `Section ${practicalSection+1} of ${sections.length}`;
      prev.disabled = practicalSection === 0;
      next.disabled = practicalSection === sections.length-1;
      card.innerHTML = `<h3>${s.title}</h3>${s.body}${videoCard(...s.video)}`;
    };
    select.addEventListener('change',()=>show(select.value));
    prev.addEventListener('click',()=>show(practicalSection-1));
    next.addEventListener('click',()=>show(practicalSection+1));
    show(practicalSection);
  }

  function renderCheck() {
    const body = document.getElementById('practical-body');
    const correct = Object.values(practicalState.checks || {}).filter(v=>v.correct).length;
    body.innerHTML = `<section class="quiz-card"><div class="quiz-top"><div><h3>Practical Skills Quick Check</h3><p>Answer from memory, then check each response.</p></div><span class="score-pill">${correct}/${quickChecks.length} correct</span></div>${quickChecks.map((q,i)=>quickHTML(q,i)).join('')}<button class="reset-btn" id="practical-reset-check">Reset</button></section>`;
    body.querySelectorAll('[data-pq-option]').forEach(b=>b.addEventListener('click',()=>{
      const i=Number(b.dataset.i), j=Number(b.dataset.j);
      practicalState.checks[i]={selected:j,checked:false,correct:false}; savePracticalState(); renderCheck();
    }));
    body.querySelectorAll('[data-pq-check]').forEach(b=>b.addEventListener('click',()=>{
      const i=Number(b.dataset.i), saved=practicalState.checks[i];
      if (!saved || saved.selected === undefined) return;
      saved.checked=true; saved.correct=saved.selected===quickChecks[i].a; savePracticalState(); renderCheck();
    }));
    document.getElementById('practical-reset-check').addEventListener('click',()=>{practicalState.checks={};savePracticalState();renderCheck();});
  }

  function quickHTML(q,i) {
    const s=practicalState.checks?.[i];
    return `<div class="practical-question"><div class="question-meta"><span>Question ${i+1}</span><span>1 mark</span></div><div class="question-text">${q.q}</div><div class="options">${q.o.map((op,j)=>`<button type="button" class="option ${s?.selected===j?'picked':''} ${s?.checked?(j===q.a?'correct':(j===s.selected?'wrong':'')):''}" data-pq-option data-i="${i}" data-j="${j}" ${s?.checked?'disabled':''}><span><strong>${String.fromCharCode(65+j)}.</strong> ${op}</span></button>`).join('')}</div><button class="check-btn" data-pq-check data-i="${i}" ${s?.checked?'disabled':''}>${s?.checked?'Checked':'Check answer'}</button>${s?.checked?`<div class="feedback ${s.correct?'good':'bad'}">${s.correct?'Correct.':'Not quite.'} ${q.e}</div>`:''}</div>`;
  }

  function normalise(t) {
    return String(t||'').toLowerCase().replace(/[–—−]/g,'-').replace(/[^a-z0-9%./+\- ]/g,' ').replace(/\s+/g,' ').trim();
  }

  function pointHit(answer, point) {
    return point.tests.some(group => group.every(term => answer.includes(normalise(term))));
  }

  function renderApply() {
    const body=document.getElementById('practical-body');
    body.innerHTML=`<section class="exam-card"><div class="exam-top"><div><h3>Practical Skills Practice Questions</h3><p>Write a full answer before checking. Support is released gradually if you need it.</p></div></div><div class="practical-picker">${applied.map((q,i)=>`<button data-apick="${i}" class="${(practicalState.selected||0)===i?'active':''}">${i+1}. ${q.title}</button>`).join('')}</div><div id="practical-apply-question"></div><button class="reset-btn" id="practical-reset-exam">Reset practice progress</button></section>`;
    body.querySelectorAll('[data-apick]').forEach(b=>b.addEventListener('click',()=>{practicalState.selected=Number(b.dataset.apick);savePracticalState();renderApply();}));
    document.getElementById('practical-reset-exam').addEventListener('click',()=>{practicalState.exam={};practicalState.selected=0;savePracticalState();renderApply();});
    renderAppliedQuestion(Number(practicalState.selected||0));
  }

  function renderAppliedQuestion(i) {
    const q=applied[i], saved=practicalState.exam?.[i]||{attempts:0,best:0,text:''};
    const slot=document.getElementById('practical-apply-question');
    const reveal=saved.attempts>=3;
    slot.innerHTML=`<div class="practical-question"><div class="question-meta"><span class="exam-command">${q.title}</span><span class="marks">[${q.marks} marks]</span></div><div class="question-text">${q.prompt}</div><textarea id="practical-answer" placeholder="Write your answer here...">${esc(saved.text||'')}</textarea><button class="check-btn" id="practical-check-written">Check my answer</button>${saved.feedback||''}${reveal?`<div class="mark-scheme open"><strong>Marking points:</strong><ul>${q.points.map(p=>`<li>${p.label}</li>`).join('')}</ul><strong>Model answer:</strong><p>${q.model}</p></div>`:''}</div>`;
    document.getElementById('practical-check-written').addEventListener('click',()=>markApplied(i));
  }

  function esc(v){return String(v||'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');}

  function markApplied(i) {
    const q=applied[i];
    const raw=document.getElementById('practical-answer').value;
    if (!raw.trim()) return;
    const answer=normalise(raw);
    const hits=q.points.map(p=>pointHit(answer,p));
    const mark=hits.filter(Boolean).length;
    const prev=practicalState.exam?.[i]||{attempts:0,best:0};
    const attempts=(prev.attempts||0)+1;
    const best=Math.max(prev.best||0,mark);
    let feedback='';
    if(mark===q.marks){
      feedback=`<div class="practical-feedback good"><span class="practical-score">${mark}/${q.marks}</span> — Full marks. This question is mastered.</div>`;
    } else if(attempts===1){
      feedback=`<div class="practical-feedback bad"><span class="practical-score">${mark}/${q.marks}</span><p>${q.hint}</p><p>Improve your answer and try again.</p></div>`;
    } else if(attempts===2){
      const missing=q.points.filter((_,n)=>!hits[n]).slice(0,2).map(p=>`<li>Think about: ${p.label}.</li>`).join('');
      feedback=`<div class="practical-feedback bad"><span class="practical-score">${mark}/${q.marks}</span><p>You are still missing some key ideas:</p><ul>${missing}</ul><p>Improve the same answer and try again.</p></div>`;
    } else {
      feedback=`<div class="practical-feedback ${mark===q.marks?'good':'bad'}"><span class="practical-score">${mark}/${q.marks}</span><p>The marking points and model answer are now shown below. Use them to improve your response, then resubmit.</p></div>`;
    }
    practicalState.exam ||= {};
    practicalState.exam[i]={attempts,best,text:raw,feedback};
    savePracticalState();
    renderAppliedQuestion(i);
  }
})();