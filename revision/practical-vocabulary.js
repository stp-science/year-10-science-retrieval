(() => {
  'use strict';

  const panel = document.getElementById('content-panel');
  if (!panel || typeof videoCard !== 'function') return;

  const VIDEO_MAP = {
    'Variables & fair tests': {
      id:'nKbUbfadxRU', title:'Independent, dependent and control variables', provider:'Freesciencelessons',
      desc:'Explains the three types of variable and how they are used to plan a fair investigation.'
    },
    'Planning a method': {
      id:'nKbUbfadxRU', title:'Independent, dependent and control variables', provider:'Freesciencelessons',
      desc:'A clear school-level recap of variables before students plan a valid method.'
    },
    'Measurements, accuracy & precision': {
      id:'u2qmId_Ha2g', title:'Accuracy and precision', provider:'The EverLearner',
      desc:'A short school-level explanation of the difference between accurate and precise measurements.'
    },
    'Repeats, means & anomalies': {
      id:'UO7S57qUoK4', title:'Repeatability and reproducibility', provider:'Freesciencelessons',
      desc:'Explains repeatability and reproducibility using practical results.'
    },
    'Results tables & graphs': {
      id:'FKp0pJ4bF-Q', title:'Drawing science graphs', provider:'Oxford Education',
      desc:'Shows how to choose scales, label axes, plot data and draw an appropriate best-fit line or curve.'
    },
    'Conclusions from data': {
      id:'n9pDUdNTzBY', title:'Analysing science graphs', provider:'Oxford Education',
      desc:'Supports reading patterns and trends from graphs and using data as evidence.'
    },
    'Evaluation & improvements': {
      id:'evIa9edpJ6k', title:'Random errors and improving measurements', provider:'Freesciencelessons',
      desc:'Explains common sources of random error and how practical measurements can be improved.'
    }
  };

  const TERMS = {
    'Variables & fair tests': [
      ['Hypothesis','A testable scientific explanation or prediction that can be investigated.'],
      ['Independent variable','The variable deliberately changed by the investigator.'],
      ['Dependent variable','The variable measured or observed as the outcome.'],
      ['Control variable','A variable kept constant because it could affect the dependent variable.'],
      ['Valid investigation','An investigation designed so the results can answer the question being tested, with relevant variables controlled.']
    ],
    'Planning a method': [
      ['Range','The difference between the highest and lowest values tested or measured.'],
      ['Interval','The step between successive values of the independent variable.'],
      ['Sample','The organisms, objects or measurements selected for an investigation.'],
      ['Representative sample','A sample that reflects the wider population being investigated.'],
      ['Hazard','Something with the potential to cause harm.'],
      ['Risk','The likelihood and possible severity of harm from a hazard.'],
      ['Control measure','An action taken to reduce a risk.']
    ],
    'Measurements, accuracy & precision': [
      ['Accuracy','How close a measured value is to the true value.'],
      ['Precision','How close repeated measurements are to one another.'],
      ['Resolution','The smallest change in a quantity that a measuring instrument can show.'],
      ['Uncertainty','The interval within which the true value of a measurement is expected to lie.'],
      ['Zero error','A systematic error caused when an instrument does not read zero when the true value is zero.'],
      ['Parallax error','A reading error caused by viewing a scale from the wrong angle.']
    ],
    'Repeats, means & anomalies': [
      ['Repeatability','Similar results are obtained when the same person repeats the measurement using the same method and equipment.'],
      ['Reproducibility','Similar results are obtained by a different person or using different equipment or methods.'],
      ['Random error','Unpredictable variation from one measurement to the next. Its effect can be reduced by taking more measurements and calculating a mean.'],
      ['Systematic error','An error that shifts measurements away from the true value by a consistent amount. Simple repeats do not remove it.'],
      ['Anomaly','A result judged not to fit the pattern of the other results.'],
      ['Mean','The total of the valid values divided by the number of valid values.']
    ],
    'Results tables & graphs': [
      ['Mean','The total of the valid values divided by the number of valid values.'],
      ['Range','The highest value minus the lowest value.'],
      ['Correlation','A relationship between two variables. A correlation does not by itself prove that one variable causes the other.'],
      ['Line of best fit','A straight line or smooth curve that represents the overall trend in plotted data.'],
      ['Significant figures','Digits used to show the appropriate precision of a numerical value.']
    ],
    'Conclusions from data': [
      ['Trend','The overall pattern or direction shown by the data.'],
      ['Correlation','A relationship between two variables. It may be positive, negative or absent.'],
      ['Evidence','Results or observations used to support a scientific conclusion.'],
      ['Conclusion','A statement that answers the investigation question using the pattern and evidence in the results.']
    ],
    'Evaluation & improvements': [
      ['Validity','How well the method allows the investigation question to be tested and a sound conclusion to be drawn.'],
      ['Limitation','A specific feature of the method or data that reduces the quality of the evidence.'],
      ['Random error','Unpredictable variation between readings; its effect can be reduced by repeats and a mean.'],
      ['Systematic error','A consistent bias in measurements; changing or recalibrating the method or equipment may be needed.'],
      ['Uncertainty','The unavoidable range around a measurement within which the true value is expected to lie.'],
      ['Improvement','A specific change that directly addresses an identified limitation.']
    ]
  };

  function glossary(title) {
    const terms = TERMS[title] || [];
    if (!terms.length) return '';
    return `
      <section class="source-box practical-vocab" data-section="${title}" style="margin-top:18px;">
        <strong>Practical skills key terms</strong>
        <div class="concept-grid" style="margin-top:10px;">
          ${terms.map(([term, definition]) => `<div class="concept"><strong>${term}</strong><p>${definition}</p></div>`).join('')}
        </div>
      </section>`;
  }

  let scheduled = false;
  function schedulePatch() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => { scheduled = false; patchPractical(); });
  }

  function patchPractical() {
    const headings = [...panel.querySelectorAll('h3')];
    const heading = headings.find(h => VIDEO_MAP[h.textContent.trim()]);
    if (!heading) return;

    const title = heading.textContent.trim();
    const item = VIDEO_MAP[title];
    const card = heading.closest('.lesson-card') || heading.closest('article') || heading.parentElement;
    if (!card) return;

    const oldVideo = card.querySelector('.video-card.embedded-video');
    if (oldVideo && oldVideo.dataset.year10Video !== item.id) {
      const holder = document.createElement('div');
      holder.innerHTML = videoCard(item.id, item.title, item.provider, item.desc).trim();
      const replacement = holder.firstElementChild;
      replacement.dataset.year10Video = item.id;
      oldVideo.replaceWith(replacement);
    }

    card.querySelectorAll('.practical-vocab').forEach(el => {
      if (el.dataset.section !== title) el.remove();
    });
    if (!card.querySelector(`.practical-vocab[data-section="${CSS.escape(title)}"]`)) {
      card.insertAdjacentHTML('beforeend', glossary(title));
    }
  }

  new MutationObserver(schedulePatch).observe(panel, {childList:true, subtree:true});
  schedulePatch();
})();