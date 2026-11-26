/**
 * Product configuration and the seed question bank.
 *
 * Everything here is data, not behaviour. Keeping it separate makes it easy
 * to swap the seed bank for a real content API later without touching UI code.
 */

export const EXAMS = {
  jee:    { name: 'JEE',    full: 'JEE Main + Advanced', subjects: ['Physics', 'Chemistry', 'Maths'],          pop: 1200000, label: 'Est. AIR' },
  neet:   { name: 'NEET',   full: 'NEET UG',              subjects: ['Physics', 'Chemistry', 'Biology'],       pop: 2200000, label: 'Est. AIR' },
  boards: { name: 'Boards', full: 'Class 12 Boards',      subjects: ['Physics', 'Chemistry', 'Maths', 'Biology'], pop: 1500000, label: 'Est. board rank' }
};

export const ALL_EXAMS = ['jee', 'neet', 'boards'];
export const DIFFICULTY = { E: 'Easy', M: 'Medium', H: 'Hard' };
export const SUBJECTS = ['Physics', 'Chemistry', 'Maths', 'Biology'];

/**
 * Exam-specific voice. JEE leans into a maths-lab feel, NEET into a clinical
 * recall feel, Boards into a revision desk. Kept as data so it is testable.
 */
export const EXAM_COPY = {
  jee: {
    kicker: 'MATHS LAB / JEE',
    daily: 'Maths problem of the day',
    focus: 'Weak chapters',
    stripTitle: 'Formula strip',
    strip: [
      { k: 'Roots', v: 'x² − 5x + 6 = 0 → sum 5, product 6' },
      { k: 'Derivative', v: 'd/dx (x³) = 3x²' },
      { k: 'Integral', v: '∫₀^π sin x dx = 2' },
      { k: 'Probability', v: 'n(S) = 36 for two dice' }
    ],
    note: 'Work the steps before you check the answer. Marks reward method, not speed.'
  },
  neet: {
    kicker: 'CLINICAL NOTE / NEET',
    daily: 'Case of the day',
    focus: 'Weak systems',
    stripTitle: 'Quick recall',
    strip: [
      { k: 'Gamete', v: '23 chromosomes · haploid' },
      { k: 'Light reaction', v: 'Thylakoid membrane' },
      { k: 'Ligase', v: 'Seals Okazaki fragments' },
      { k: 'Pineal', v: 'Melatonin · sleep cycle' }
    ],
    note: 'Read the stem twice. Most NEET errors are misread keywords, not missing facts.'
  },
  boards: {
    kicker: 'REVISION DESK / BOARDS',
    daily: 'Revision question of the day',
    focus: 'Weak topics',
    stripTitle: 'Exam notes',
    strip: [
      { k: 'KE', v: '½mv²' },
      { k: 'pH', v: '−log[H⁺]' },
      { k: 'Moles', v: 'mass ÷ molar mass' },
      { k: 'Power', v: '1 / f (metres)' }
    ],
    note: 'Board marks reward neat steps and correct units. Write them out once.'
  }
};

/** 27 hand-written sample questions used for the prototype. */
export const SEED_QUESTIONS = [
  {id:'p1',t:'Kinetic Energy of a Moving Mass',d:'E',s:'Physics',x:ALL_EXAMS,tp:'Work, energy and power',q:'A body of mass 2 kg moves at 3 m/s. What is its kinetic energy?',o:['3 J','6 J','9 J','18 J'],a:2,e:'KE = ½mv² = ½ × 2 × 3² = 9 J.',m:18},
  {id:'p2',t:'Parallel Resistors',d:'E',s:'Physics',x:ALL_EXAMS,tp:'Current electricity',q:'A 6 Ω and a 3 Ω resistor are connected in parallel. What is the equivalent resistance?',o:['9 Ω','4.5 Ω','2 Ω','18 Ω'],a:2,e:'1/R = 1/6 + 1/3 = 1/2, so R = 2 Ω.',m:22},
  {id:'p3',t:'Pendulum with g = π²',d:'M',s:'Physics',x:['jee','boards'],tp:'Oscillations',q:'A simple pendulum of length 1 m is at a place where g = π² m/s². Its time period is:',o:['1 s','2 s','π s','2π s'],a:1,e:'T = 2π√(L/g) = 2π√(1/π²) = 2 s.',m:35},
  {id:'p4',t:'Power of a Convex Lens',d:'E',s:'Physics',x:ALL_EXAMS,tp:'Ray optics',q:'A convex lens has focal length 25 cm. Its power is:',o:['+4 D','−4 D','+0.25 D','+25 D'],a:0,e:'P = 1/f with f in metres: 1/0.25 = +4 D. A convex lens has positive power.',m:20},
  {id:'p5',t:'Energy in a Charged Capacitor',d:'M',s:'Physics',x:['jee','boards'],tp:'Capacitance',q:'A 10 µF capacitor is charged to 100 V. The energy stored is:',o:['0.05 J','0.5 J','0.1 J','0.01 J'],a:0,e:'U = ½CV² = ½ × 10×10⁻⁶ × 100² = 0.05 J.',m:30},
  {id:'p6',t:'Photon Energy at 500 nm',d:'M',s:'Physics',x:ALL_EXAMS,tp:'Dual nature of radiation',q:'The energy of a photon of wavelength 500 nm is closest to:',o:['1.24 eV','2.48 eV','4.96 eV','0.62 eV'],a:1,e:'E (eV) ≈ 1240 / λ (nm) = 1240 / 500 = 2.48 eV.',m:28},
  {id:'c1',t:'Hybridisation in Ethene',d:'E',s:'Chemistry',x:ALL_EXAMS,tp:'Hybridisation',q:'The hybridisation of each carbon atom in ethene (C₂H₄) is:',o:['sp','sp²','sp³','sp³d'],a:1,e:'Each carbon forms three sigma bonds (two C–H, one C–C) and one pi bond, so it is sp² hybridised.',m:20},
  {id:'c2',t:'pH of Dilute HCl',d:'E',s:'Chemistry',x:ALL_EXAMS,tp:'Ionic equilibrium',q:'What is the pH of a 0.001 M HCl solution at 25 °C?',o:['1','2','3','11'],a:2,e:'HCl dissociates fully, so [H⁺] = 10⁻³ M and pH = 3.',m:25},
  {id:'c3',t:'Most Electronegative Element',d:'E',s:'Chemistry',x:ALL_EXAMS,tp:'Periodic properties',q:'Which element has the highest electronegativity?',o:['Chlorine','Fluorine','Oxygen','Nitrogen'],a:1,e:'Fluorine is the most electronegative element (4.0 on the Pauling scale).',m:12},
  {id:'c4',t:'Molar Mass of Calcium Carbonate',d:'E',s:'Chemistry',x:ALL_EXAMS,tp:'Mole concept',q:'The molar mass of CaCO₃ is:',o:['84 g/mol','100 g/mol','116 g/mol','56 g/mol'],a:1,e:'40 + 12 + 3 × 16 = 100 g/mol.',m:22},
  {id:'c5',t:'Moles in 36 g of Water',d:'E',s:'Chemistry',x:ALL_EXAMS,tp:'Mole concept',q:'How many moles are present in 36 g of water?',o:['1','2','3','4'],a:1,e:'Molar mass of H₂O is 18 g/mol, so n = 36 / 18 = 2 mol.',m:20},
  {id:'c6',t:'Half-life of a First-order Reaction',d:'H',s:'Chemistry',x:['jee','boards'],tp:'Chemical kinetics',q:'A first-order reaction has k = 0.0693 min⁻¹. Its half-life is:',o:['1 min','10 min','100 min','0.693 min'],a:1,e:'t½ = 0.693 / k = 0.693 / 0.0693 = 10 min.',m:40},
  {id:'c7',t:'Shape of Ammonia',d:'E',s:'Chemistry',x:ALL_EXAMS,tp:'Chemical bonding',q:'The shape of the NH₃ molecule is:',o:['Linear','Trigonal planar','Trigonal pyramidal','Tetrahedral'],a:2,e:'NH₃ has three bond pairs and one lone pair. The electron geometry is tetrahedral and the molecular shape is trigonal pyramidal.',m:18},
  {id:'m1',t:'Integral of sin x',d:'M',s:'Maths',x:['jee','boards'],tp:'Definite integrals',q:'The value of ∫₀^π sin x dx is:',o:['0','1','2','π'],a:2,e:'∫₀^π sin x dx = [−cos x] from 0 to π = −cos π + cos 0 = 1 + 1 = 2.',m:40},
  {id:'m2',t:'Sum of Roots',d:'E',s:'Maths',x:['jee','boards'],tp:'Quadratic equations',q:'The sum of the roots of x² − 5x + 6 = 0 is:',o:['5','6','−5','1'],a:0,e:'Sum of roots = −b/a = 5. (The roots are 2 and 3.)',m:18},
  {id:'m3',t:'Determinant Scaling',d:'M',s:'Maths',x:['jee','boards'],tp:'Determinants',q:'If A is a 2×2 matrix with det A = 3, then det(2A) equals:',o:['6','12','9','3'],a:1,e:'det(kA) = kⁿ det A for an n×n matrix. Here 2² × 3 = 12.',m:30},
  {id:'m4',t:'Limit of sin 3x over x',d:'M',s:'Maths',x:['jee','boards'],tp:'Limits',q:'lim (x→0) sin(3x) / x equals:',o:['0','1','3','∞'],a:2,e:'sin(3x)/x = 3 · sin(3x)/(3x), and sin(u)/u → 1, so the limit is 3.',m:28},
  {id:'m5',t:'Arrangements of LEVEL',d:'H',s:'Maths',x:['jee'],tp:'Permutations',q:'In how many distinct ways can the letters of the word LEVEL be arranged?',o:['30','60','120','15'],a:0,e:'5 letters with L repeated twice and E repeated twice: 5! / (2! × 2!) = 30.',m:45},
  {id:'m6',t:'Tangent Slope of x Cubed',d:'M',s:'Maths',x:['jee','boards'],tp:'Application of derivatives',q:'The slope of the tangent to y = x³ at x = 2 is:',o:['6','8','12','4'],a:2,e:'dy/dx = 3x², which is 12 at x = 2.',m:30},
  {id:'m7',t:'Dice Sum of Seven',d:'M',s:'Maths',x:['jee','boards'],tp:'Probability',q:'Two fair dice are thrown. The probability that the sum is 7 is:',o:['1/12','1/6','1/9','5/36'],a:1,e:'Six of the 36 outcomes sum to 7: (1,6), (2,5), (3,4), (4,3), (5,2), (6,1). So 6/36 = 1/6.',m:32},
  {id:'b1',t:'Joining Okazaki Fragments',d:'M',s:'Biology',x:['neet','boards'],tp:'Molecular basis of inheritance',q:'Which enzyme joins the Okazaki fragments on the lagging strand?',o:['DNA polymerase','DNA ligase','Helicase','Primase'],a:1,e:'DNA ligase seals the nicks between Okazaki fragments.',m:20},
  {id:'b2',t:'Site of the Light Reaction',d:'E',s:'Biology',x:['neet','boards'],tp:'Photosynthesis',q:'The light reaction of photosynthesis takes place in the:',o:['Stroma','Thylakoid membrane','Mitochondrial matrix','Cytoplasm'],a:1,e:'Light reactions occur on the thylakoid membranes of the grana. The Calvin cycle runs in the stroma.',m:18},
  {id:'b3',t:'Gamete Chromosome Number',d:'E',s:'Biology',x:['neet','boards'],tp:'Human reproduction',q:'How many chromosomes does a human gamete contain?',o:['46','23','24','22'],a:1,e:'Gametes are haploid, so 46 / 2 = 23 chromosomes.',m:10},
  {id:'b4',t:'Pineal Gland Hormone',d:'E',s:'Biology',x:['neet','boards'],tp:'Chemical coordination',q:'Which hormone is secreted by the pineal gland?',o:['Thyroxine','Insulin','Melatonin','Cortisol'],a:2,e:'The pineal gland secretes melatonin, which helps regulate the sleep–wake cycle.',m:10},
  {id:'b5',t:'Double Fertilisation',d:'E',s:'Biology',x:['neet','boards'],tp:'Sexual reproduction in plants',q:'Double fertilisation is a characteristic feature of:',o:['Gymnosperms','Angiosperms','Pteridophytes','Bryophytes'],a:1,e:'Syngamy plus triple fusion (double fertilisation) occurs only in angiosperms.',m:14},
  {id:'b6',t:'Universal Donor',d:'E',s:'Biology',x:['neet','boards'],tp:'Body fluids and circulation',q:'Which blood group is called the universal donor?',o:['AB positive','O negative','A positive','B negative'],a:1,e:'O-negative red cells carry no A, B or Rh antigens, so they can be given to almost any recipient.',m:12},
  {id:'b7',t:'Sex Determination in Humans',d:'E',s:'Biology',x:['neet','boards'],tp:'Principles of inheritance',q:'In humans, the sex of a child is determined by:',o:['The mother\'s egg','The father\'s sperm','Temperature during development','The autosomes'],a:1,e:'The egg always carries X. The sperm carries either X (girl) or Y (boy).',m:14}
];

/** Escape untrusted text before it is placed into innerHTML. */
export function escapeHTML(value){
  return String(value == null ? '' : value)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

/**
 * Validate and sanitise an externally supplied question.
 * Returns null for anything malformed so a bad import cannot break the app.
 */
export function normalizeQuestion(raw, existingIds){
  if(!raw || typeof raw.id !== 'string' || !/^[A-Za-z0-9]+$/.test(raw.id)) return null;
  if(!Array.isArray(raw.o) || raw.o.length !== 4) return null;
  if(!(raw.a >= 0 && raw.a < 4)) return null;
  if(SUBJECTS.indexOf(raw.s) < 0 || !Array.isArray(raw.x)) return null;
  if(existingIds.has(raw.id)) return null;
  const exams = raw.x.filter(e => ALL_EXAMS.indexOf(e) > -1);
  if(!exams.length) return null;
  return {
    id: raw.id,
    t: escapeHTML(raw.t || raw.id),
    d: (typeof raw.d === 'string' && raw.d.length === 1 && 'EMH'.indexOf(raw.d) > -1) ? raw.d : 'M',
    s: raw.s,
    x: exams,
    tp: escapeHTML(raw.tp || raw.s),
    q: escapeHTML(raw.q),
    o: raw.o.map(escapeHTML),
    a: raw.a | 0,
    e: escapeHTML(raw.e || 'No worked solution is included in the source dataset.'),
    m: Math.max(5, +raw.m || 120),
    src: raw.src ? escapeHTML(raw.src) : ''
  };
}

/** Build the full question bank from seeds plus any generated questions.js file. */
export function buildQuestionBank(extra){
  const questions = SEED_QUESTIONS.slice();
  const ids = new Set(questions.map(q => q.id));
  if(Array.isArray(extra)){
    extra.forEach(raw => {
      const q = normalizeQuestion(raw, ids);
      if(q){ questions.push(q); ids.add(q.id); }
    });
  }
  return questions;
}
