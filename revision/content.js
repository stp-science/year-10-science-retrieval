
const STORAGE_KEY='stp-y10-revision-v1';
const THEME_KEY='stp-y10-revision-theme';
const games={atoms:{name:'Space Defender',icon:'🚀'},forces:{name:'Breakout',icon:'🧱'},acids:{name:'Snake',icon:'🐍'},genetics:{name:'Pong',icon:'🏓'}};

const modules={
  atoms:{name:'Atoms, Ions & the Periodic Table',short:'Atoms & Ions',number:'01',icon:'⚛',colour:'#6554c0',soft:'#eeeaff',subtitle:'Matter, atomic structure, groups, ions and equations',intro:'Build from atoms and formulae to electron arrangements, periodic trends, ion formation, ionic compounds and balanced equations.',lessons:[
    {title:'Matter, elements, compounds & formulae',body:()=>`
      ${diagram('particles')}
      <p><strong>Matter</strong> has mass and takes up space. All matter is made from atoms.</p>
      <div class="concept-grid"><div class="concept"><strong>Element</strong><p>A substance made from only one type of atom. Each element has its own chemical symbol.</p></div><div class="concept"><strong>Compound</strong><p>Two or more different elements chemically bonded together.</p></div><div class="concept"><strong>Molecule</strong><p>A group of atoms chemically bonded together that behaves as one particle.</p></div></div>
      <p>In a chemical formula, the <strong>symbol</strong> identifies the element, a <strong>subscript</strong> tells you how many atoms of that element are present, and a <strong>coefficient</strong> tells you how many whole formula units or molecules there are.</p>
      <div class="worked"><strong>Example: 2Na₂SO₄</strong><p>There are 4 Na atoms, 2 S atoms and 8 O atoms altogether. The coefficient 2 multiplies every atom count in Na₂SO₄.</p></div>
      <div class="mistake"><strong>Common mistake:</strong> Na is one element symbol. The lowercase letter is part of the symbol; it does not mean a second element.</div>`},
    {title:'Atomic structure & subatomic particles',body:()=>`
      ${diagram('atom')}
      <p>Atoms contain a tiny central <strong>nucleus</strong> made of protons and neutrons, with electrons arranged in shells around the nucleus.</p>
      <table class="mini-table"><thead><tr><th>Particle</th><th>Charge</th><th>Relative mass</th><th>Location</th></tr></thead><tbody><tr><td>Proton</td><td>+1</td><td>1</td><td>Nucleus</td></tr><tr><td>Neutron</td><td>0</td><td>1</td><td>Nucleus</td></tr><tr><td>Electron</td><td>−1</td><td>Very small</td><td>Shells</td></tr></tbody></table>
      <div class="equation">atomic number = number of protons &nbsp;&nbsp;&nbsp; | &nbsp;&nbsp;&nbsp; mass number = protons + neutrons</div>
      <p>For a neutral atom, <strong>number of electrons = number of protons</strong>. To find neutrons: mass number − atomic number.</p>
      <div class="worked"><strong>Example</strong><p>Chlorine-35 has atomic number 17: 17 protons, 17 electrons and 35 − 17 = 18 neutrons.</p></div>
      ${videoCard('ihuCYM5hR_s','GCSE Chemistry: electronic structure','BBC Bitesize','A useful reinforcement of electron shells and electronic structure.')}
      <div class="source-box"><strong>BBC Bitesize reinforcement:</strong> the BBC GCSE atomic-structure material uses the same core model: protons and neutrons in the nucleus, electrons in shells, atomic number from protons and mass number from protons + neutrons.</div>`},
    {title:'Electron configuration',body:()=>`
      ${diagram('shells')}
      <p>For the first 20 elements, fill electrons into the lowest available shells first.</p>
      <ul><li>First shell: maximum 2 electrons.</li><li>Second shell: maximum 8 electrons.</li><li>Third shell: use up to 8 electrons for the first 20 elements.</li><li>Fourth shell begins at potassium.</li></ul>
      <div class="worked"><strong>Examples</strong><p>Oxygen (8): 2,6 &nbsp; • &nbsp; Sodium (11): 2,8,1 &nbsp; • &nbsp; Calcium (20): 2,8,8,2.</p></div>
      <p>The <strong>period</strong> tells you the number of occupied electron shells. For the main groups studied here, the <strong>group</strong> links to the number of outer-shell electrons.</p>
      <div class="exam-tip"><strong>Exam tip:</strong> When drawing an electron arrangement, show the correct number of electrons on each shell and make the total equal the atomic number for a neutral atom.</div>`},
    {title:'Periodic table groups & reactivity',body:()=>`
      ${diagram('periodic')}
      <p>The periodic table is arranged in order of increasing <strong>atomic number</strong>. Vertical columns are <strong>groups</strong>; horizontal rows are <strong>periods</strong>.</p>
      <div class="concept-grid"><div class="concept"><strong>Group 1</strong><p>Alkali metals. One outer electron. Reactivity increases down the group because the outer electron is further from the nucleus and easier to lose.</p></div><div class="concept"><strong>Group 2</strong><p>Two outer electrons. They form 2+ ions by losing two electrons.</p></div><div class="concept"><strong>Group 17</strong><p>Halogens. Seven outer electrons. Reactivity decreases down the group because gaining an electron becomes harder as the outer shell gets further from the nucleus.</p></div></div>
      <p>Group 18 noble gases have full outer shells, so they are very unreactive.</p>
      <div class="mistake"><strong>Common mistake:</strong> Do not say Group 1 gets more reactive because atoms are simply “bigger”. Link the trend to distance/shielding and how easily the outer electron is lost.</div>`},
    {title:'Ion formation & ionic compounds',body:()=>`
      ${diagram('ions')}
      <p>An <strong>ion</strong> is a charged particle formed when an atom gains or loses electrons.</p>
      <ul><li>Metals usually <strong>lose</strong> electrons and form positive ions (cations).</li><li>Non-metals usually <strong>gain</strong> electrons and form negative ions (anions).</li><li>Oppositely charged ions attract strongly. This electrostatic attraction is an <strong>ionic bond</strong>.</li></ul>
      <div class="worked"><strong>Example: sodium chloride</strong><p>Sodium (2,8,1) loses one electron to form Na⁺. Chlorine (2,8,7) gains one electron to form Cl⁻. The ions then attract.</p></div>
      <p>Ionic compounds form giant ionic lattices. They usually have high melting points. When molten or dissolved in water they can conduct electricity because the ions are free to move.</p>
      <div class="source-box"><strong>BBC Bitesize link used in your lesson:</strong> <a href="https://www.bbc.co.uk/bitesize/guides/zyydng8/revision/3" target="_blank" rel="noopener">Ionic compounds revision</a>.</div>`},
    {title:'History of the atom',body:()=>`
      ${diagram('atomhistory')}
      <p>Scientific models change when new evidence cannot be explained by the old model.</p>
      <table class="mini-table"><thead><tr><th>Scientist/model</th><th>Main idea</th></tr></thead><tbody><tr><td>Dalton</td><td>Atoms pictured as tiny solid spheres.</td></tr><tr><td>J. J. Thomson</td><td>Discovered electrons; proposed the plum-pudding model.</td></tr><tr><td>Rutherford</td><td>Alpha scattering showed a tiny positive nucleus and mostly empty space.</td></tr><tr><td>Bohr</td><td>Electrons occupy fixed energy levels/shells.</td></tr><tr><td>Chadwick</td><td>Evidence for neutrons in the nucleus.</td></tr></tbody></table>
      <div class="exam-tip"><strong>Key scientific-practice idea:</strong> models do not become “true”; they become better explanations of the available evidence.</div>`},
    {title:'Balancing equations',body:()=>`
      ${diagram('balance')}
      <p>Chemical reactions rearrange atoms. Atoms are not created or destroyed, so a symbol equation must contain the same number of each type of atom on both sides.</p>
      <div class="worked"><strong>Method</strong><ol><li>Write the correct chemical formulae.</li><li>Count each element on both sides.</li><li>Add <strong>big numbers in front</strong> of formulae (coefficients) to balance the atoms.</li><li>Check again.</li></ol></div>
      <div class="equation">2Mg + O₂ → 2MgO</div>
      <div class="mistake"><strong>Never change a subscript to balance an equation.</strong> Changing a subscript changes the substance itself.</div>`}
  ]},
  forces:{name:'Forces & Motion',short:'Forces & Motion',number:'02',icon:'➜',colour:'#2f78b7',soft:'#e7f2fb',subtitle:'Forces, Newton’s laws, density and motion graphs',intro:'Explain how forces change motion, calculate weight and acceleration, understand drag and friction, use density, and interpret motion graphs.',lessons:[
    {title:'Forces, contact & non-contact',body:()=>`
      ${diagram('forceintro')}
      <p>A <strong>force</strong> is a push or pull acting on an object because it is interacting with something else. Forces are measured in <strong>newtons (N)</strong>.</p>
      <p>Forces can change an object's speed, direction or shape.</p>
      <div class="concept-grid"><div class="concept"><strong>Contact forces</strong><p>Friction, air resistance, water resistance, tension, normal contact force, upthrust, thrust/push/pull.</p></div><div class="concept"><strong>Non-contact forces</strong><p>Gravitational (weight), magnetic and electrostatic forces.</p></div><div class="concept"><strong>Direction matters</strong><p>Forces are vectors, so arrows show both size (magnitude) and direction.</p></div></div>`},
    {title:'Free-body diagrams & resultant force',body:()=>`
      ${diagram('freebody')}
      <p>A free-body diagram shows all the forces acting on one object. Arrow direction shows force direction and arrow length should represent force size.</p>
      <p>The <strong>resultant force</strong> is the overall force after all forces are combined.</p>
      <ul><li>Balanced forces → resultant force = 0 N → no acceleration.</li><li>Unbalanced forces → resultant force ≠ 0 N → the object accelerates in the direction of the resultant force.</li></ul>
      <div class="worked"><strong>Example</strong><p>A car has 900 N driving force forwards and 650 N resistive force backwards. Resultant = 900 − 650 = 250 N forwards.</p></div>`},
    {title:'Mass, weight & gravity',body:()=>`
      ${diagram('weight')}
      <p><strong>Mass</strong> is the amount of matter in an object and is measured in kilograms (kg). <strong>Weight</strong> is the gravitational force acting on an object and is measured in newtons (N).</p>
      <div class="equation">W = m × g</div>
      <p>On Earth your course uses <strong>g = 10 N/kg</strong> unless a question gives a different value.</p>
      <div class="worked"><strong>Example</strong><p>A 60 kg student has weight = 60 × 10 = 600 N on Earth.</p></div>
      <div class="exam-tip"><strong>Moon hammer/feather idea:</strong> With no air resistance, different masses fall with the same gravitational acceleration. On Earth, the feather is affected much more by air resistance.</div>`},
    {title:'Friction, drag & terminal velocity',body:()=>`
      ${diagram('terminal')}
      <p><strong>Friction</strong> acts between surfaces in contact and opposes motion or attempted motion. <strong>Drag</strong> opposes motion through a fluid such as air or water.</p>
      <ul><li>Drag increases as speed increases.</li><li>A larger surface area generally produces more drag.</li><li>Streamlined shapes reduce drag.</li></ul>
      <p>For a falling skydiver, weight is initially greater than air resistance, so the skydiver accelerates. As speed rises, air resistance increases. At <strong>terminal velocity</strong>, air resistance = weight, so resultant force = 0 and speed is constant.</p>
      <div class="mistake"><strong>Common mistake:</strong> Terminal velocity does not mean no forces are acting. It means the forces are balanced.</div>`},
    {title:'Newton’s laws & F = ma',body:()=>`
      ${diagram('newton')}
      <p><strong>Newton’s first law:</strong> an object remains stationary or moves at constant velocity unless acted on by a resultant force.</p>
      <p><strong>Newton’s second law:</strong> acceleration depends on resultant force and mass.</p>
      <div class="equation">F = m × a</div>
      <div class="worked"><strong>Example</strong><p>A 4 kg trolley has a resultant force of 10 N. a = F/m = 10/4 = 2.5 m/s².</p></div>
      <p>For the same force, a smaller mass accelerates more. For the same mass, a larger resultant force produces more acceleration.</p>`},
    {title:'Density & measuring volume',body:()=>`
      ${diagram('density')}
      <p><strong>Density</strong> is the amount of mass in a given volume.</p>
      <div class="equation">density = mass ÷ volume &nbsp;&nbsp; (ρ = m/V)</div>
      <div class="worked"><strong>Regular object</strong><p>Measure mass with a balance. Calculate volume from dimensions, e.g. length × width × height. Then use ρ = m/V.</p></div>
      <div class="worked"><strong>Irregular object</strong><p>Measure mass with a balance. Find volume by water displacement. The rise in water volume equals the object's volume.</p></div>
      <p>Common units are g/cm³ or kg/m³. Keep units consistent before calculating.</p>`},
    {title:'Speed & distance–time graphs',body:()=>`
      ${diagram('distancegraph')}
      <div class="equation">speed = distance ÷ time</div>
      <p>On a distance–time graph, the <strong>gradient represents speed</strong>.</p>
      <ul><li>Steeper straight line → faster constant speed.</li><li>Horizontal line → stationary.</li><li>To calculate speed from part of a graph, use change in distance ÷ change in time.</li></ul>
      <div class="worked"><strong>Example</strong><p>An object travels 250 m between 20 s and 25 s. Speed = 250/5 = 50 m/s.</p></div>`},
    {title:'Speed–time graphs & acceleration',body:()=>`
      ${diagram('speedgraph')}
      <p>On a speed–time graph, the <strong>gradient represents acceleration</strong>.</p>
      <div class="equation">acceleration = (final speed − initial speed) ÷ time</div>
      <ul><li>Positive gradient → speeding up.</li><li>Horizontal line → constant speed; acceleration = 0.</li><li>Negative gradient → slowing down (negative acceleration).</li><li>The <strong>area under a speed–time graph</strong> gives distance travelled.</li></ul>
      <div class="worked"><strong>Example</strong><p>Speed increases from 5 m/s to 25 m/s in 4 s. a = (25 − 5)/4 = 5 m/s².</p></div>`}
  ]},
  acids:{name:'Acids & Bases',short:'Acids & Bases',number:'03',icon:'🧪',colour:'#d35766',soft:'#fdecef',subtitle:'pH, neutralisation, reactions, concentration and strength',intro:'Use pH and indicators, write acid reactions, test gases, distinguish concentration from strength and explain reaction rate using collisions.',lessons:[
    {title:'Acids, bases, alkalis & pH',body:()=>`
      ${diagram('ph')}
      <p>Acids produce <strong>H⁺ ions</strong> in water. Alkalis are soluble bases that produce <strong>OH⁻ ions</strong> in water.</p>
      <ul><li>pH below 7 → acidic.</li><li>pH 7 → neutral.</li><li>pH above 7 → alkaline.</li></ul>
      <p>A pH probe gives a numerical value and is the most accurate method taught here. Universal indicator gives an approximate pH by colour. Litmus tells you whether a solution is acidic or alkaline but not its exact pH.</p>
      <div class="worked"><strong>Key lab acids</strong><p>Hydrochloric acid (HCl), sulfuric acid (H₂SO₄) and nitric acid (HNO₃).</p></div>
      <div class="source-box"><strong>BBC Bitesize reinforcement:</strong> <a href="https://bam.files.bbci.co.uk/bam/live/content/zg8f9ty/transcript" target="_blank" rel="noopener">The pH scale transcript</a> reinforces H⁺/OH⁻ ions, pH 0–14 and neutralisation.</div>`},
    {title:'Neutralisation',body:()=>`
      ${diagram('neutral')}
      <p>A neutralisation reaction occurs when an acid reacts with a base.</p>
      <div class="equation">acid + base → salt + water</div>
      <div class="equation">H⁺(aq) + OH⁻(aq) → H₂O(l)</div>
      <p>The acid determines the salt name:</p>
      <table class="mini-table"><tbody><tr><th>Hydrochloric acid</th><td>chloride salt</td></tr><tr><th>Sulfuric acid</th><td>sulfate salt</td></tr><tr><th>Nitric acid</th><td>nitrate salt</td></tr></tbody></table>
      <p>Neutralisation is useful in antacids, treating acidic soils and wastewater treatment.</p>`},
    {title:'Metals + acids',body:()=>`
      ${diagram('hydrogen')}
      <div class="equation">metal + acid → salt + hydrogen</div>
      <p>Typical observations include fizzing/bubbles, the metal dissolving and a temperature change.</p>
      <div class="worked"><strong>Gas test for hydrogen</strong><p>Collect the gas and place a lit splint at the mouth of the test tube. A positive result is a <strong>squeaky pop</strong>.</p></div>
      <div class="worked"><strong>Example</strong><p>magnesium + hydrochloric acid → magnesium chloride + hydrogen</p></div>`},
    {title:'Metal carbonates + acids',body:()=>`
      ${diagram('co2')}
      <div class="equation">metal carbonate + acid → salt + carbon dioxide + water</div>
      <div class="worked"><strong>Gas test for carbon dioxide</strong><p>Bubble the gas through limewater. A positive result turns limewater <strong>milky/cloudy</strong>.</p></div>
      <p>Example: sodium carbonate + hydrochloric acid → sodium chloride + carbon dioxide + water.</p>`},
    {title:'Concentration & reaction rate',body:()=>`
      ${diagram('concentration')}
      <p><strong>Concentration</strong> tells us how much solute is present in a given volume of solution.</p>
      <div class="concept-grid"><div class="concept"><strong>Dilute</strong><p>Less solute per unit volume.</p></div><div class="concept"><strong>Concentrated</strong><p>More solute per unit volume.</p></div><div class="concept"><strong>Rate link</strong><p>Higher concentration usually means more frequent successful collisions, so a faster reaction.</p></div></div>
      <div class="exam-tip"><strong>GCSE explanation:</strong> increasing concentration gives more reacting particles in the same volume, causing more frequent collisions and therefore more successful collisions each second.</div>`},
    {title:'Strong vs weak acids',body:()=>`
      ${diagram('strength')}
      <p><strong>Strength</strong> is about how completely an acid ionises in water. It is not the same as concentration.</p>
      <ul><li>Strong acid → (nearly) all acid particles ionise.</li><li>Weak acid → only some acid particles ionise.</li><li>A strong acid can be dilute, and a weak acid can be concentrated.</li></ul>
      <div class="mistake"><strong>Common mistake:</strong> “Strong” does not simply mean “there is lots of acid”. That describes concentration.</div>
      <p>At the same concentration, a strong acid has a greater concentration of H⁺ ions than a weak acid.</p>`},
    {title:'Pulling the reactions together',body:()=>`
      <table class="mini-table"><thead><tr><th>Reactants</th><th>Products</th><th>Gas test</th></tr></thead><tbody><tr><td>acid + base/hydroxide</td><td>salt + water</td><td>none</td></tr><tr><td>acid + metal</td><td>salt + hydrogen</td><td>lit splint → squeaky pop</td></tr><tr><td>acid + metal carbonate</td><td>salt + water + carbon dioxide</td><td>limewater → cloudy</td></tr></tbody></table>
      <div class="worked"><strong>Salt-name rule</strong><p>HCl → chloride &nbsp; • &nbsp; H₂SO₄ → sulfate &nbsp; • &nbsp; HNO₃ → nitrate.</p></div>
      <div class="exam-tip"><strong>Exam tip:</strong> If asked for evidence of a chemical reaction, use an observation: bubbles/fizzing, temperature change, colour change, solid disappearing or a new precipitate—not just “a reaction happened”.</div>`}
  ]},
  genetics:{name:'Genetics, Evolution & Adaptation',short:'Genetics & Evolution',number:'04',icon:'🧬',colour:'#2f8a65',soft:'#e7f6ef',subtitle:'Variation, DNA, inheritance, selection and NZ species',intro:'Connect variation and DNA to genes and inheritance, then explain how mutations, selection pressures and natural selection drive evolution and adaptation.',lessons:[
    {title:'Variation',body:()=>`
      ${diagram('variation')}
      <p><strong>Variation</strong> means differences between individuals of the same species.</p>
      <div class="concept-grid"><div class="concept"><strong>Genetic causes</strong><p>Different alleles inherited from parents and new mutations.</p></div><div class="concept"><strong>Environmental causes</strong><p>Diet, climate, exercise, accidents and other surroundings.</p></div><div class="concept"><strong>Both</strong><p>Many traits are influenced by both genes and environment.</p></div></div>
      <p><strong>Continuous variation</strong> has a range of values (e.g. height). <strong>Discontinuous variation</strong> falls into distinct categories (e.g. many simple blood-group categories).</p>`},
    {title:'DNA structure',body:()=>`
      ${diagram('dna')}
      <p>DNA carries genetic information. Its shape is a <strong>double helix</strong>.</p>
      <p>DNA is built from repeating units called <strong>nucleotides</strong>. Each nucleotide contains a sugar, phosphate and a base.</p>
      <div class="equation">A pairs with T &nbsp;&nbsp;&nbsp; | &nbsp;&nbsp;&nbsp; C pairs with G</div>
      <p>The order of bases stores information. Complementary base pairing holds the two DNA strands together.</p>
      ${videoCard('fy2F8yFxqOI','GCSE Biology: DNA, chromosomes & genes','Cognito','Clear GCSE-level reinforcement of DNA, chromosomes and genes.')}`},
    {title:'Chromosomes, genes, alleles & phenotype',body:()=>`
      ${diagram('gene')}
      <ul><li><strong>Chromosome:</strong> a long coiled DNA molecule carrying many genes.</li><li><strong>Gene:</strong> a section of DNA associated with a characteristic/protein.</li><li><strong>Allele:</strong> an alternative version of a gene.</li><li><strong>Genotype:</strong> the allele combination an organism has.</li><li><strong>Phenotype:</strong> the observable characteristic produced by genotype and environment.</li></ul>
      <p>A <strong>dominant</strong> allele is expressed when at least one copy is present. A <strong>recessive</strong> phenotype usually requires two recessive alleles.</p>
      <div class="worked"><strong>Example</strong><p>If B is dominant and b is recessive: BB and Bb show the dominant phenotype; bb shows the recessive phenotype.</p></div>`},
    {title:'Inheritance & Punnett squares',body:()=>`
      ${diagram('punnett')}
      <p><strong>Inheritance</strong> is the passing of genetic information from parents to offspring. Punnett squares predict possible allele combinations and their probabilities.</p>
      <div class="worked"><strong>Method</strong><ol><li>Write parent genotypes.</li><li>Place one parent's possible alleles across the top and the other's down the side.</li><li>Combine alleles in each box.</li><li>Count genotypes/phenotypes and convert to probability.</li></ol></div>
      <p>Your course applies this to dominant and recessive inherited conditions, including examples such as cystic fibrosis, sickle cell disease, polydactyly and Huntington's disease.</p>
      <div class="mistake"><strong>Probability is not certainty:</strong> a 25% probability does not mean exactly one in every four children in a family must have the trait.</div>`},
    {title:'Mutations',body:()=>`
      ${diagram('mutation')}
      <p>A <strong>mutation</strong> is a change in DNA. Mutations can occur spontaneously or be caused by mutagens such as some types of radiation or chemicals.</p>
      <p>A mutation may:</p><ul><li>have no noticeable effect,</li><li>change the phenotype,</li><li>be harmful, helpful or neutral depending on the environment.</li></ul>
      <p>Mutations create new genetic variation. That variation is essential for natural selection.</p>`},
    {title:'Natural selection, selection pressures & evolution',body:()=>`
      ${diagram('selection')}
      <p><strong>Natural selection</strong> changes the frequency of inherited traits in a population over generations.</p>
      <ol><li>Individuals show variation.</li><li>There is competition because not all organisms survive and reproduce.</li><li>A <strong>selection pressure</strong> makes some inherited traits advantageous.</li><li>Individuals with advantageous traits are more likely to survive and reproduce.</li><li>They pass the advantageous alleles to offspring.</li><li>Over many generations, those alleles become more common.</li></ol>
      <p><strong>Evolution</strong> is change in inherited characteristics of a population over generations, driven here by natural selection.</p>
      <div class="exam-tip"><strong>Selection pressures</strong> can include predators, disease, competition, climate, food availability and human activity.</div>`},
    {title:'Adaptations & NZ endemic species',body:()=>`
      ${diagram('adaptation')}
      <p>An <strong>adaptation</strong> is a feature that increases an organism's chance of surviving and reproducing in its environment.</p>
      <div class="concept-grid"><div class="concept"><strong>Structural</strong><p>Physical features, e.g. body shape, colour, beak shape.</p></div><div class="concept"><strong>Physiological</strong><p>Internal processes, e.g. venom production or water conservation.</p></div><div class="concept"><strong>Behavioural</strong><p>Actions, e.g. nocturnal activity, migration or courtship.</p></div></div>
      <p><strong>Endemic</strong> means naturally found in one geographic area and nowhere else. NZ endemic species provide excellent examples of adaptations to local environments.</p>
      <div class="exam-tip"><strong>Strong explanation:</strong> name the adaptation, describe what it does, then explain why that gives a survival/reproductive advantage in that specific environment.</div>`}
  ]}
};

const checks={
 atoms:[
  q('Which statement defines an element?',['A mixture of different atoms','A substance made from one type of atom','Two elements chemically bonded','A charged particle'],1,'An element contains only one type of atom.'),
  q('How many oxygen atoms are present in 3CO₂?',['2','3','5','6'],3,'Each CO₂ has 2 oxygen atoms; 3 × 2 = 6.'),
  q('An atom has atomic number 12 and mass number 24. How many neutrons?',['12','24','36','10'],0,'Neutrons = mass number − atomic number = 24 − 12 = 12.'),
  q('What is the electron arrangement of sodium (atomic number 11)?',['2,9','2,8,1','8,3','2,7,2'],1,'The first shell fills to 2, the second to 8, leaving 1.'),
  q('Why does Group 1 become more reactive down the group?',['Atoms gain electrons more easily','The outer electron is easier to lose','Nuclei have fewer protons','The atoms have fewer shells'],1,'The outer electron is further from the nucleus and more shielded, so it is easier to lose.'),
  q('Which ion does magnesium form?',['Mg⁺','Mg²⁺','Mg⁻','Mg²⁻'],1,'Group 2 magnesium loses two outer electrons to form Mg²⁺.'),
  q('What happens when chlorine forms a chloride ion?',['It loses one electron','It gains one electron','It gains a proton','It loses a neutron'],1,'Chlorine gains one electron to achieve a full outer shell.'),
  q('Which statement about ionic compounds is correct?',['They contain neutral atoms only','Oppositely charged ions attract','Electrons are shared in pairs','They always have low melting points'],1,'Ionic bonding is the strong electrostatic attraction between oppositely charged ions.'),
  q('What evidence caused Rutherford to propose a tiny nucleus?',['All alpha particles stopped','Most alpha particles passed straight through but a few were strongly deflected','Electrons changed colour','Atoms emitted sound'],1,'The scattering pattern showed atoms are mostly empty space with concentrated positive charge.'),
  q('Which equation is balanced?',['Mg + O₂ → MgO','2Mg + O₂ → 2MgO','Mg₂ + O → MgO','Mg + 2O → MgO₂'],1,'There are 2 Mg and 2 O atoms on both sides.')
 ],
 forces:[
  q('Which is a non-contact force?',['Friction','Tension','Weight','Normal contact'],2,'Weight is the gravitational force and acts without surfaces touching.'),
  q('A car has 700 N forwards and 500 N backwards. Resultant force?',['200 N forwards','200 N backwards','1200 N forwards','0 N'],0,'700 − 500 = 200 N forwards.'),
  q('What is the weight of a 75 kg person on Earth using g = 10 N/kg?',['7.5 N','75 N','750 N','7500 N'],2,'W = mg = 75 × 10 = 750 N.'),
  q('At terminal velocity a falling object has…',['no forces acting','weight greater than drag','drag greater than weight','balanced weight and drag'],3,'At terminal velocity resultant force is zero, so speed is constant.'),
  q('A 5 kg object has a resultant force of 20 N. Its acceleration is…',['4 m/s²','25 m/s²','100 m/s²','0.25 m/s²'],0,'a = F/m = 20/5 = 4 m/s².'),
  q('Density is…',['mass × volume','mass ÷ volume','volume ÷ mass','distance ÷ time'],1,'Density = mass/volume.'),
  q('How do you find the volume of an irregular rock?',['Use W = mg','Use a ruler only','Use water displacement','Use a newton meter'],2,'The increase in water volume equals the rock volume.'),
  q('What does the gradient of a distance–time graph show?',['Acceleration','Force','Speed','Density'],2,'Gradient = change in distance/change in time = speed.'),
  q('What does a horizontal line on a speed–time graph show?',['Stationary only','Constant speed','Constant acceleration','Increasing speed'],1,'A horizontal speed–time line means speed is constant; acceleration is zero.'),
  q('Speed changes from 4 m/s to 16 m/s in 3 s. Acceleration?',['4 m/s²','6 m/s²','12 m/s²','20 m/s²'],0,'a = (16 − 4)/3 = 4 m/s².')
 ],
 acids:[
  q('Which ion makes a solution acidic?',['OH⁻','H⁺','Na⁺','Cl⁻'],1,'Acids produce hydrogen ions, H⁺, in water.'),
  q('Which pH is neutral?',['0','5','7','14'],2,'Neutral solutions have pH 7.'),
  q('Which method gives the most accurate numerical pH?',['Blue litmus','Red litmus','Universal indicator','pH probe'],3,'A calibrated pH probe gives a numerical pH value.'),
  q('Complete: acid + base →',['salt + hydrogen','salt + water','water + carbon dioxide','metal + water'],1,'Neutralisation produces a salt and water.'),
  q('Hydrochloric acid forms which type of salt?',['Sulfate','Nitrate','Chloride','Carbonate'],2,'Hydrochloric acid forms chloride salts.'),
  q('What gas forms when a metal reacts with an acid?',['Oxygen','Hydrogen','Carbon dioxide','Chlorine'],1,'Metal + acid → salt + hydrogen.'),
  q('Positive test for hydrogen?',['Limewater cloudy','Glowing splint relights','Squeaky pop with a lit splint','Indicator turns purple'],2,'Hydrogen burns with a squeaky pop.'),
  q('Acid + metal carbonate produces…',['salt + hydrogen','salt + water only','salt + CO₂ + water','metal oxide + water'],2,'Metal carbonate + acid → salt + CO₂ + water.'),
  q('Why can higher concentration increase reaction rate?',['Particles become larger','More frequent successful collisions','The acid becomes strong','The products disappear'],1,'More reactant particles per volume causes more frequent collisions.'),
  q('What makes an acid strong?',['It is always concentrated','It completely/mostly ionises in water','It has a large volume','It contains no H⁺ ions'],1,'Strength describes degree of ionisation, not concentration.')
 ],
 genetics:[
  q('Variation means…',['differences between individuals of the same species','changes in weather','all individuals being identical','only genetic disease'],0,'Variation is the differences among individuals in a population/species.'),
  q('Which is an example of continuous variation?',['Blood group','Height','Biological sex categories','Tongue-rolling category'],1,'Height can take many values across a range.'),
  q('Which bases pair in DNA?',['A–C and T–G','A–T and C–G','A–G and C–T','A–A and C–C'],1,'Complementary base pairing is A–T and C–G.'),
  q('A gene is…',['a whole cell','a section of DNA','an environmental factor','a type of protein only'],1,'A gene is a section of DNA.'),
  q('An allele is…',['an alternative version of a gene','a chromosome pair','a mutation only','a phenotype'],0,'Alleles are alternative versions of the same gene.'),
  q('If B is dominant, which genotype definitely gives the recessive phenotype?',['BB','Bb','bb','B'],2,'A recessive phenotype requires two recessive alleles: bb.'),
  q('A Punnett square is used to…',['prove exactly which child will inherit a trait','predict possible allele combinations and probabilities','measure DNA length','cause mutations'],1,'It predicts possible offspring genotypes and their probabilities.'),
  q('Why are mutations important in evolution?',['They remove all variation','They create new genetic variation','They always improve organisms','They stop reproduction'],1,'Mutation is a source of new alleles/variation.'),
  q('A selection pressure is…',['a force measured in newtons','an environmental factor affecting survival/reproduction','a type of gene','a guaranteed mutation'],1,'Selection pressures make some inherited traits more advantageous than others.'),
  q('An endemic species is…',['found naturally everywhere','found naturally in one geographic area only','always endangered','always introduced by humans'],1,'Endemic means naturally restricted to a particular region.')
 ]
};

const exams={
 atoms:[
  e('Atomic structure calculation',4,'An ion of aluminium has mass number 27, atomic number 13 and a 3+ charge. State the number of protons, neutrons and electrons, and explain the electron number.',['13 protons','14 neutrons (27 − 13)','10 electrons','3+ means the atom has lost 3 electrons']),
  e('Explain a periodic trend',4,'Explain why Group 1 elements become more reactive as you move down the group.',['More electron shells / outer electron further from nucleus','More shielding from inner electrons','Attraction between nucleus and outer electron is weaker','Outer electron is lost more easily']),
  e('Ion formation',4,'Explain how sodium and chlorine form sodium chloride. Include electron arrangements or electron transfer and the type of bonding.',['Na loses one electron to form Na⁺','Cl gains one electron to form Cl⁻','Both achieve full outer shells','Oppositely charged ions attract strongly / ionic bond']),
  e('Balancing',3,'Balance the equation and explain what the coefficients mean:  ___Al + ___O₂ → ___Al₂O₃',['4Al + 3O₂ → 2Al₂O₃','4 Al atoms and 6 O atoms on each side','Coefficients change numbers of particles, not the formula itself'])
 ],
 forces:[
  e('Resultant force and acceleration',4,'A 1200 kg car has a driving force of 3600 N and resistive forces of 1200 N. Calculate the resultant force and acceleration.',['Resultant = 3600 − 1200 = 2400 N forwards','Use F = ma','a = 2400/1200','a = 2.0 m/s²']),
  e('Terminal velocity',5,'Explain how the forces and motion of a skydiver change from just after leaving a plane until terminal velocity is reached.',['Weight acts downward','At first weight > air resistance so there is a downward resultant force','Skydiver accelerates / speeds up','Air resistance increases as speed increases','At terminal velocity air resistance = weight, resultant = 0, speed constant']),
  e('Density practical',5,'Describe how to determine the density of an irregular stone in the laboratory.',['Measure mass using a balance','Record initial water volume in measuring cylinder / displacement can','Submerge stone fully','Change in water volume = stone volume','Density = mass/volume with suitable units']),
  e('Motion graph',4,'A cyclist increases speed from 6 m/s to 18 m/s in 4 s, travels at 18 m/s for 5 s, then slows to 0 m/s in 3 s. Calculate the acceleration during the first 4 s and describe the middle section.',['a = (18 − 6)/4','a = 3 m/s²','Middle section is constant speed','Acceleration in middle section = 0'])
 ],
 acids:[
  e('Neutralisation',4,'Write the word equation for hydrochloric acid reacting with sodium hydroxide and give the ionic equation for neutralisation.',['hydrochloric acid + sodium hydroxide → sodium chloride + water','H⁺ + OH⁻ → H₂O','Product salt is a chloride because hydrochloric acid is used','Neutralisation forms salt + water']),
  e('Metal + acid',4,'A student adds magnesium to dilute hydrochloric acid. State two observations, name the gas produced and describe its test.',['Fizzing/bubbles','Magnesium dissolves / temperature may rise','Hydrogen gas','Lit splint gives a squeaky pop']),
  e('Carbonate reaction',4,'Describe how you could show that carbon dioxide is produced when calcium carbonate reacts with hydrochloric acid, and write the word equation.',['Collect/pass gas into limewater','Limewater turns cloudy/milky','calcium carbonate + hydrochloric acid → calcium chloride + carbon dioxide + water','Fizzing is an observation consistent with gas production']),
  e('Strength vs concentration',5,'A student says “a strong acid is the same as a concentrated acid.” Explain why this is incorrect and explain why increasing concentration can increase reaction rate.',['Strength = degree of ionisation','Strong acid ionises completely/nearly completely; weak only partly','Concentration = amount of solute/acid per unit volume','Higher concentration gives more reactant particles per volume','More frequent successful collisions → faster rate'])
 ],
 genetics:[
  e('DNA and genetic vocabulary',5,'Explain the relationship between DNA, chromosomes, genes and alleles.',['DNA carries genetic information','Chromosomes are long/coiled DNA molecules','Genes are sections of DNA','Alleles are alternative versions of a gene','Genes/alleles can influence phenotype']),
  e('Punnett square',5,'In a plant, tall (T) is dominant to short (t). Two heterozygous plants are crossed. State the parent genotypes, the possible offspring genotypes and the probability of a short offspring.',['Parents Tt × Tt','Offspring TT, Tt, Tt, tt','Genotype ratio 1:2:1','Short phenotype is tt','Probability short = 1/4 = 25%']),
  e('Natural selection',6,'A population of insects varies in colour. Birds more easily see pale insects on dark tree bark. Explain how the population could become darker over many generations.',['There is inherited variation in colour','Dark insects are better camouflaged / pale insects face stronger predation','Dark insects survive more often','They reproduce more successfully','They pass alleles for darker colour to offspring','Dark alleles/phenotype become more common over generations']),
  e('Adaptation',4,'Choose a New Zealand endemic organism you know and explain one adaptation that helps it survive in its environment.',['Names a valid adaptation','Describes how the feature/process/behaviour works','Links it to a feature of the organism’s environment','Explains the survival or reproductive advantage'])
 ]
};

function q(text,options,answer,explanation){return{text,options,answer,explanation};}
function e(title,marks,prompt,scheme){return{title,marks,prompt,scheme};}
