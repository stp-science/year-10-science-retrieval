(() => {
  "use strict";

  // One deliberately chosen support video for every Learn section. The
  // selections below were checked against the actual Year 10 lesson content.
  // Repeated videos are intentional where one video directly supports more
  // than one closely related section.
  const SECTION_VIDEOS = {
    atoms: [
      [{id:"E15yF8dNGr8", title:"Compounds, molecules and mixtures", provider:"Cognito", desc:"Supports elements, compounds, molecules, mixtures and reading chemical formulae at GCSE level."}],
      [{id:"KwOHJbE4Tro", title:"Atomic structure, isotopes and electron shells", provider:"Cognito", desc:"Supports protons, neutrons, electrons, atomic number, mass number and the basic structure of the atom."}],
      [{id:"kvTzdD1eGUQ", title:"Electronic structure", provider:"Cognito", desc:"Matches the section on filling electron shells and writing electron arrangements for the first 20 elements."}],
      [{id:"jQGUkJc7_04", title:"Groups of the periodic table", provider:"Khan Academy", desc:"Uses the modern 1–18 group numbering, so it matches the NZ/IUPAC convention used on this site."}],
      [{id:"MdU44WeiLps", title:"Ionic bonding: formation and dot-and-cross diagrams", provider:"Cognito", desc:"Supports ion formation, electron transfer, full outer shells and electrostatic attraction between oppositely charged ions."}],
      [{id:"9WNFwOqb_24", title:"The history of the atom: models and theories", provider:"Cognito", desc:"Matches the development from early atomic models through Thomson, Rutherford, Bohr and Chadwick."}],
      [{id:"oQalH_mfOfg", title:"Balancing equations: word and symbol equations", provider:"Cognito", desc:"Reinforces conservation of atoms, coefficients and why subscripts must not be changed when balancing."}]
    ],
    forces: [
      [{id:"WCPTKRaScgE", title:"Contact and non-contact forces", provider:"Cognito", desc:"Matches the lesson examples of friction, drag, tension, normal contact, gravitational, magnetic and electrostatic forces."}],
      [{id:"YGGxf6cp3Lo", title:"Resultant forces and free-body diagrams", provider:"Cognito", desc:"Supports force arrows, free-body diagrams, balanced and unbalanced forces and calculating resultant force."}],
      [{id:"U78NOo-oxOY", title:"Weight, force, mass and gravity", provider:"FuseSchool", desc:"Supports the distinction between mass and weight and the link W = mg. For St Peter's questions, continue to use g = 10 N/kg unless another value is given."}],
      [{id:"cCDfNkcGhDM", title:"Terminal velocity", provider:"Cognito", desc:"Directly supports drag, changing air resistance, resultant force, acceleration and terminal velocity."}],
      [{id:"i5PtaCJJFjw", title:"Newton's first and second laws", provider:"Cognito", desc:"Matches Newton's first law, Newton's second law and F = ma used in this section."}],
      [{id:"pgGzVdau1Bw", title:"Density of materials", provider:"Cognito", desc:"Supports density = mass ÷ volume and measuring the volume of regular and irregular objects."}],
      [{id:"RM02SnuJ0MY", title:"Distance–time graphs", provider:"Cognito", desc:"Shows how to interpret distance–time graphs and use gradient to determine speed."}],
      [{id:"b0VKlpetP9A", title:"Velocity–time graphs", provider:"Cognito", desc:"Supports acceleration from gradient, constant speed, deceleration and distance from the area under the graph."}]
    ],
    acids: [
      [{id:"Yrf3Z_TQu_k", title:"Acids, alkalis and the pH scale", provider:"Cognito", desc:"Supports H⁺ and OH⁻ ions, acids, alkalis, indicators, pH and the idea of neutralisation."}],
      [{id:"vcxlISVJ6Os", title:"Neutralisation reactions and reactions of acids", provider:"Cognito", desc:"Matches acid + base reactions, salt formation and acid reactions with metal oxides, hydroxides and carbonates."}],
      [{id:"tPkBIdRQ45s", title:"Acid + metal", provider:"Tassomai", desc:"Directly supports metal + acid → salt + hydrogen and the products formed in this reaction."}],
      [{id:"POROhCcnUsI", title:"Making salts from acids and metal carbonates", provider:"Dr Roe Chemistry", desc:"Supports acid + metal carbonate reactions, carbon dioxide production and salt formation."}],
      [{id:"JK7yPzO9POU", title:"Factors affecting reaction rate: concentration", provider:"Cognito", desc:"Matches the collision-theory explanation for why increasing concentration increases reaction rate."}],
      [{id:"FOgZgMBbnXM", title:"Strong acids and weak acids", provider:"Cognito", desc:"Directly distinguishes acid strength from concentration and explains complete versus partial ionisation."}],
      [{id:"POROhCcnUsI", title:"Acid reactions recap: salts, metals and carbonates", provider:"Dr Roe Chemistry", desc:"A useful recap of the main acid reaction patterns before students move into exam practice."}]
    ],
    genetics: [
      [{id:"eWn1mO8rNwQ", title:"Variation", provider:"Cognito", desc:"Matches genetic and environmental causes of variation and continuous versus discontinuous variation."}],
      [{id:"T6_wKPAbf2k", title:"What is DNA? Structure and function of DNA", provider:"Cognito", desc:"Supports the double helix, nucleotides, bases and complementary base pairing."}],
      [{id:"zNEtVaNQ0s8", title:"Genes, alleles, genotype and phenotype", provider:"Cognito", desc:"Matches chromosomes, genes, alleles, dominant/recessive alleles, genotype and phenotype."}],
      [{id:"BtPo9F-nkho", title:"Genetic diagrams and Punnett squares", provider:"Cognito", desc:"Supports setting up Punnett squares, predicting genotypes and working out probabilities."}],
      [{id:"3jwDl7nYBPM", title:"What are DNA mutations?", provider:"Cognito", desc:"Directly supports mutations as DNA changes and their neutral, harmful or beneficial effects."}],
      [{id:"4PtOgToaKP8", title:"Variation and evolution", provider:"Cognito", desc:"Matches selection pressures, natural selection, inheritance of advantageous alleles and evolution over generations."}],
      [{id:"DycQKyb5IP4", title:"Adaptations", provider:"Cognito", desc:"Supports structural, behavioural and functional/physiological adaptations and linking a feature to survival in an environment."}]
    ]
  };

  function sectionSupportVideos(moduleKey, lessonIndex) {
    const items = SECTION_VIDEOS[moduleKey]?.[lessonIndex] || [];
    return items.map(item => videoCard(item.id, item.title, item.provider, item.desc)).join("");
  }

  // Keep sourced images/diagrams separate from videos. Previously some videos
  // were tied to diagram keys, which meant many lessons received no video and
  // others could receive duplicates.
  diagram = function(type) {
    return BBC_VISUALS[type] ? sourceVisualCard(BBC_VISUALS[type]) : "";
  };

  // Replace the Learn renderer so every section gets its deliberately selected
  // support video. Any older video embedded directly in content.js is removed
  // first, preventing duplicate players.
  renderLearn = function() {
    const m = modules[currentModule];
    currentLesson = Math.max(0, Math.min(currentLesson, m.lessons.length - 1));

    panel.innerHTML = hero() + `
      <section aria-label="Choose revision section" style="background:var(--card);border:1px solid var(--line);border-radius:18px;padding:16px 18px;margin:0 0 16px;box-shadow:0 8px 24px rgba(24,45,79,.05);">
        <label for="lesson-select" style="display:block;font-size:.78rem;font-weight:900;letter-spacing:.09em;text-transform:uppercase;color:var(--muted);margin-bottom:7px;">Choose section</label>
        <select id="lesson-select" style="width:100%;min-height:46px;border:1px solid var(--line);border-radius:12px;padding:10px 40px 10px 12px;background:var(--card);color:var(--ink);font:inherit;font-weight:750;">
          ${m.lessons.map((l,i) => `<option value="${i}">${i + 1}. ${l.title}</option>`).join('')}
        </select>
        <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;margin-top:12px;">
          <button class="check-btn" id="prev-lesson" type="button">← Previous</button>
          <strong id="lesson-count" style="color:var(--muted);font-size:.88rem;"></strong>
          <button class="check-btn" id="next-lesson" type="button">Next →</button>
        </div>
      </section>
      <article class="lesson-card" id="lesson-card"></article>`;

    const select = document.getElementById('lesson-select');
    const card = document.getElementById('lesson-card');
    const count = document.getElementById('lesson-count');
    const prev = document.getElementById('prev-lesson');
    const next = document.getElementById('next-lesson');

    function showLesson(index) {
      currentLesson = Math.max(0, Math.min(Number(index), m.lessons.length - 1));
      const lesson = m.lessons[currentLesson];
      select.value = String(currentLesson);
      count.textContent = `Section ${currentLesson + 1} of ${m.lessons.length}`;
      prev.disabled = currentLesson === 0;
      next.disabled = currentLesson === m.lessons.length - 1;

      card.innerHTML = `<h3>${lesson.title}</h3>${lesson.body()}`;

      // Remove legacy embedded players from individual lesson bodies. The
      // audited section map below is the single source of truth for videos.
      card.querySelectorAll('.video-card.embedded-video').forEach(el => el.remove());

      const support = sectionSupportVideos(currentModule, currentLesson);
      if (support) {
        card.insertAdjacentHTML('beforeend', `
          <div class="section-video-support" style="margin-top:22px;">
            <div style="font-size:.78rem;font-weight:900;letter-spacing:.09em;text-transform:uppercase;color:var(--muted);margin-bottom:9px;">Support video</div>
            ${support}
          </div>`);
      }
    }

    select.addEventListener('change', () => showLesson(select.value));
    prev.addEventListener('click', () => showLesson(currentLesson - 1));
    next.addEventListener('click', () => showLesson(currentLesson + 1));
    showLesson(currentLesson);
  };

  // core.js renders once before this audit layer loads, so refresh the Learn
  // panel once to apply the audited video mapping immediately.
  if (view === 'learn') render();
})();
