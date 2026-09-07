(function () {
  'use strict';

  const BG = 0x090B0F;
  const PREFERS_REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const IS_MOBILE = window.innerWidth <= 768 || /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

  let sceneToken = 0;
  let narrationSeqToken = 0;
  let firstSceneReady = false;
  let currentSceneIndex = -1;
  let transitioning = false;
  let countdownTimer = null;
  let countdownValue = 0;
  let countdownTotal = 0;
  let onCountdownFire = null;
  let autoAdvanceActive = true;
  let rotating = !IS_MOBILE;
  let hydrogens = false;
  let currentMolKey = null;
  let narrationEnabled = true;
  let narrationVolume = .8;
  let currentUtterance = null;
  let molTransitionSeq = 0;
  let storyPaused = false;
  let pauseStart = 0;

  function wait(ms) {
    return new Promise(resolve => {
      let remaining = ms;
      let lastTime = Date.now();
      let timer = null;
      function check() {
        const now = Date.now();
        if (!storyPaused) {
          remaining -= (now - lastTime);
        }
        lastTime = now;
        if (remaining <= 0) {
          resolve();
          return;
        }
        timer = setTimeout(check, 40);
      }
      timer = setTimeout(check, Math.min(40, remaining));
    });
  }

  function dismissLoadingScreen() {
    const ls = document.getElementById('loadingScreen');
    if (ls) {
      ls.classList.add('hidden');
      setTimeout(() => {
        ls.remove();
      }, 900);
    }
    showUI(['navControls', 'narrationControls']);
  }

  const MOL = {
    glucose: {
      name: '\u03B2-D-Glucopyranose',
      formula: 'C\u2086H\u2081\u2082O\u2086',
      path: '../molecules/glucose/glucose.sdf',
      cid: 64689,
      desc: 'Six-carbon substrate entering glycolysis.'
    },
    g6p: {
      name: 'Glucose-6-phosphate',
      formula: 'C\u2086H\u2081\u2081O\u2089P\u00B2\u207B',
      path: '../molecules/glucose-6-phosphate/glucose-6-phosphate.sdf',
      cid: 21604865,
      desc: 'Six-carbon phosphorylated intermediate of glycolysis.'
    },
    f6p: {
      name: 'Fructose-6-phosphate',
      formula: 'C\u2086H\u2081\u2081O\u2089P\u00B2\u207B',
      path: '../molecules/fructose-6-phosphate/fructose-6-phosphate.sdf',
      cid: 21604863,
      desc: 'Six-carbon isomer of glucose-6-phosphate.'
    },
    fbp: {
      name: 'Fructose-1,6-bisphosphate',
      formula: 'C\u2086H\u2081\u2084O\u2081\u2082P\u2082',
      path: '../molecules/fructose-1-6-bisphosphate/fructose-1-6-bisphosphate.sdf',
      cid: 172313,
      desc: 'Bisphosphorylated six-carbon intermediate.'
    },
    dhap: {
      name: 'DHAP',
      formula: 'C\u2083H\u2087O\u2086P',
      path: '../molecules/dhap/dhap.sdf',
      cid: 668,
      desc: 'Three-carbon triose phosphate.'
    },
    g3p: {
      name: 'Glyceraldehyde-3-P',
      formula: 'C\u2083H\u2085O\u2086P\u00B2\u207B',
      path: '../molecules/glyceraldehyde-3-phosphate/glyceraldehyde-3-phosphate.sdf',
      cid: 24794350,
      desc: 'Three-carbon sugar phosphate entering the payoff phase.'
    },
    bpg13: {
      name: '1,3-Bisphosphoglycerate',
      formula: 'C\u2083H\u2086O\u2081\u2080P\u2082\u00B2\u207B',
      path: '../molecules/1-3-bisphosphoglycerate/1-3-bisphosphoglycerate.sdf',
      cid: 44472828,
      desc: 'High-energy acyl phosphate intermediate.'
    },
    pg3: {
      name: '3-Phosphoglycerate',
      formula: 'C\u2083H\u2087O\u2087P',
      path: '../molecules/3-phosphoglycerate/3-phosphoglycerate.sdf',
      cid: 724,
      desc: 'Three-carbon glycolytic intermediate.'
    },
    pg2: {
      name: '2-Phosphoglycerate',
      formula: 'C\u2083H\u2087O\u2087P',
      path: '../molecules/2-phosphoglycerate/2-phosphoglycerate.sdf',
      cid: 59,
      desc: 'Three-carbon glycolytic intermediate.'
    },
    pep: {
      name: 'Phosphoenolpyruvate',
      formula: 'C\u2083H\u2085O\u2086P',
      path: '../molecules/phosphoenolpyruvate/phosphoenolpyruvate.sdf',
      cid: 1005,
      desc: 'Enol phosphate with very high phosphoryl-transfer potential.'
    },
    pyruvate: {
      name: 'Pyruvate',
      formula: 'C\u2083H\u2083O\u2083\u207B',
      path: '../molecules/pyruvate/pyruvate.sdf',
      cid: 107735,
      desc: 'Three-carbon alpha-keto acid, end product of glycolysis.'
    },
    atp: {
      name: 'ATP',
      formula: 'C\u2081\u2080H\u2081\u2082N\u2085O\u2081\u2083P\u2083\u2074\u207B',
      path: '../molecules/atp/atp.sdf',
      cid: 5461108,
      desc: 'Central energy-transfer molecule of the cell.'
    },
    adp: {
      name: 'ADP',
      formula: 'C\u2081\u2080H\u2081\u2082N\u2085O\u2081\u2080P\u2082\u00B3\u207B',
      path: '../molecules/adp/adp.sdf',
      cid: 7058055,
      desc: 'Product of ATP phosphoryl-group donation.'
    },
    nad: {
      name: '\u03B2-NAD\u207A',
      formula: 'C\u2082\u2081H\u2082\u2087N\u2087O\u2081\u2084P\u2082\u207A',
      path: '../molecules/nad-plus/nad-plus.sdf',
      cid: 925,
      desc: 'Oxidized electron carrier; accepts electrons in reaction 6.'
    },
    nadh: {
      name: 'NADH',
      formula: 'C\u2082\u2081H\u2082\u2089N\u2087O\u2081\u2084P\u2082',
      path: '../molecules/nadh/nadh.sdf',
      cid: 439153,
      desc: 'Reduced electron carrier carrying high-energy electrons.'
    }
  };

  const sdfCache = {};
  const sdfLoading = {};
  const sdfFailed = {};

  async function loadSDF(key) {
    if (sdfCache[key]) return sdfCache[key];
    if (sdfLoading[key]) return sdfLoading[key];
    const mol = MOL[key];
    if (!mol) return null;
    const p = fetch(mol.path)
      .then(r => {
        if (!r.ok) throw new Error(r.status);
        return r.text();
      })
      .then(t => {
        sdfCache[key] = t;
        delete sdfLoading[key];
        return t;
      })
      .catch(() => {
        delete sdfLoading[key];
        sdfFailed[key] = true;
        return null;
      });
    sdfLoading[key] = p;
    return p;
  }

  function preload(keys) {
    keys.forEach(k => {
      if (!sdfCache[k] && !sdfLoading[k] && !sdfFailed[k]) loadSDF(k);
    });
  }

  function cap(text, duration, deep) {
    return { text: text, duration: duration || 3000, deep: deep || null };
  }

  const scenes = [
    {
      id: 'cell',
      phase: 'intro',
      molecule: null,
      camera: null,
      captions: [
        cap('Every living cell needs a continuous supply of usable energy.', 4000, 'Cells perform thousands of chemical reactions that require energy. Without a constant supply, cellular function would cease.')
      ],
      enzyme: null,
      reaction: null,
      accounting: null,
      preloads: ['glucose', 'atp'],
      atmosphere: 'cell',
      autoAdvanceDelay: 4500
    },
    {
      id: 'cell-approach',
      phase: 'intro',
      molecule: null,
      camera: null,
      captions: [
        cap('Much of that energy begins in food molecules, such as glucose.', 4000, 'Glucose is a six-carbon sugar. Cells can extract chemical energy from glucose through metabolic pathways.')
      ],
      enzyme: null,
      reaction: null,
      accounting: null,
      atmosphere: 'approach'
    },
    {
      id: 'membrane',
      phase: 'intro',
      molecule: null,
      camera: null,
      captions: [
        cap('Inside the cell, glucose can be phosphorylated by hexokinase, helping retain it for metabolism.', 4200, 'The phosphorylation adds a negative charge, making the molecule less able to cross the plasma membrane.')
      ],
      enzyme: null,
      reaction: null,
      accounting: null,
      atmosphere: 'membrane'
    },
    {
      id: 'cytosol',
      phase: 'intro',
      molecule: null,
      camera: null,
      captions: [
        cap('Glycolysis takes place in the cytosol.', 3500, 'The cytosol is the fluid portion of the cytoplasm, outside the organelles. This is where all ten reactions of glycolysis occur.')
      ],
      enzyme: null,
      reaction: null,
      accounting: null,
      atmosphere: 'cytosol'
    },
    {
      id: 'glycolysis-overview',
      phase: 'intro',
      molecule: null,
      camera: null,
      captions: [
        cap('Glycolysis is a pathway of ten enzyme-catalyzed reactions.', 3500),
        cap('It converts one six-carbon glucose molecule into two three-carbon pyruvate molecules.', 5000, 'Along the way, some of the chemical free energy of glucose is captured in ATP and NADH.')
      ],
      enzyme: null,
      reaction: null,
      accounting: null,
      atmosphere: 'cytosol'
    },
    {
      id: 'atp-explain',
      phase: 'intro',
      molecule: 'atp',
      camera: { zoom: .85, speed: .2 },
      captions: [
        cap('ATP is a central chemical energy-transfer molecule used throughout the cell.', 5000, 'ATP stands for adenosine triphosphate. It has three phosphate groups. Cells use ATP to drive reactions that would otherwise be energetically unfavorable.'),
        cap('In glycolysis, ATP can donate a phosphoryl group to an intermediate, helping drive the pathway forward.', 5500, 'This is not ATP hydrolysis producing energy directly. Instead, ATP donates phosphoryl groups to specific carbon positions on the sugar substrate.')
      ],
      enzyme: null,
      reaction: 'ATP + H\u2082O \u2192 ADP + P\u1D62 (general ATP hydrolysis concept, not a glycolysis reaction)',
      accounting: null,
      preloads: ['adp', 'glucose', 'g6p'],
      atmosphere: null
    },
    {
      id: 'glucose-explain',
      phase: 'intro',
      molecule: 'glucose',
      camera: { zoom: .85, speed: .25 },
      captions: [
        cap('This is glucose. A six-carbon sugar.', 2500, 'The structure shown is \u03B2-D-glucopyranose, a cyclic form of glucose.'),
        cap('Glucose is a six-carbon fuel molecule that cells can progressively break down and oxidize.', 5000)
      ],
      enzyme: null,
      reaction: null,
      accounting: null,
      preloads: ['f6p', 'fbp'],
      atmosphere: null
    },
    {
      id: 'two-phases',
      phase: 'intro',
      molecule: 'glucose',
      camera: { zoom: 1.0 },
      captions: [
        cap('Glycolysis has two phases.', 2000),
        cap('First, the energy investment phase. The cell spends two ATP to prepare glucose for splitting.', 5000, 'Reactions 1 through 5: the six-carbon sugar is phosphorylated and rearranged, then cleaved into two three-carbon molecules.'),
        cap('Then, the energy payoff phase. Energy is captured as ATP and NADH.', 4500, 'Reactions 6 through 10 occur twice for every original glucose molecule, because one glucose yields two three-carbon intermediates.')
      ],
      enzyme: null,
      reaction: null,
      accounting: null,
      atmosphere: null
    },
    {
      id: 'step1',
      phase: 'investment',
      molecule: 'glucose',
      reactionNumber: 1,
      camera: { zoom: .82, speed: .15 },
      captions: [
        cap('Reaction 1. Hexokinase.', 2500),
        cap('ATP donates a phosphoryl group to glucose.', 3500, 'A phosphoryl group is a phosphate group transferred as part of a chemical reaction. Hexokinase catalyzes this transfer.'),
        cap('Glucose becomes glucose-6-phosphate.', 3000, 'The added phosphate group carries a negative charge. This helps retain the molecule inside the cell, since charged molecules cross membranes less readily.'),
        cap('One ATP has been spent.', 2000)
      ],
      enzyme: 'Hexokinase',
      reaction: 'Glucose + ATP \u2192 Glucose-6-phosphate + ADP',
      perReaction: { ATP: -1, NADH: 0 },
      timesPerGlucose: 1,
      preloads: ['dhap', 'g3p'],
      atmosphere: null
    },
    {
      id: 'step2',
      phase: 'investment',
      molecule: 'g6p',
      reactionNumber: 2,
      camera: { zoom: .85, speed: .2 },
      captions: [
        cap('Reaction 2. Phosphoglucose isomerase.', 2500),
        cap('The molecule is rearranged into a different form.', 3000),
        cap('The atoms are still the same. Their arrangement changes.', 3500, 'This is isomerisation. Glucose-6-phosphate, an aldose, is converted to fructose-6-phosphate, a ketose. No atoms are gained or lost. This rearrangement prepares the molecule for the later symmetrical cleavage.')
      ],
      enzyme: 'Phosphoglucose isomerase',
      reaction: 'Glucose-6-P \u21CC Fructose-6-P',
      perReaction: { ATP: 0, NADH: 0 },
      timesPerGlucose: 1,
      preloads: ['bpg13', 'nad', 'nadh'],
      atmosphere: null
    },
    {
      id: 'step3',
      phase: 'investment',
      molecule: 'f6p',
      reactionNumber: 3,
      camera: { zoom: .82, speed: .15 },
      captions: [
        cap('Reaction 3. Phosphofructokinase-1.', 3000),
        cap('A second phosphoryl group is added. This costs another ATP.', 4000),
        cap('This is the main committed step of glycolysis.', 3500, 'After this reaction, the molecule is committed to continuing through glycolysis under normal cellular conditions. PFK-1 is the key regulatory enzyme of the pathway.')
      ],
      enzyme: 'Phosphofructokinase-1',
      reaction: 'Fructose-6-P + ATP \u2192 Fructose-1,6-BP + ADP',
      perReaction: { ATP: -1, NADH: 0 },
      timesPerGlucose: 1,
      preloads: ['pg3', 'adp', 'atp'],
      atmosphere: null
    },
    {
      id: 'investment-summary',
      phase: 'investment',
      molecule: 'fbp',
      reactionNumber: null,
      camera: { zoom: 1.0 },
      captions: [
        cap('Two ATP have now been invested.', 2500),
        cap('The six-carbon sugar is prepared for the crucial split.', 3500)
      ],
      enzyme: null,
      reaction: null,
      perReaction: null,
      timesPerGlucose: 0,
      accounting: null,
      atmosphere: null
    },
    {
      id: 'step4',
      phase: 'investment',
      molecule: 'fbp',
      reactionNumber: 4,
      camera: { zoom: .7, speed: .1 },
      captions: [
        cap('Reaction 4. Aldolase.', 2500),
        cap('The six-carbon molecule is split into two three-carbon molecules.', 4000, 'Fructose-1,6-bisphosphate is cleaved into dihydroxyacetone phosphate (DHAP) and glyceraldehyde-3-phosphate (G3P). This is the central cleavage of glycolysis. The two products are not yet identical.')
      ],
      enzyme: 'Aldolase',
      reaction: 'Fructose-1,6-BP \u21CC DHAP + G3P',
      perReaction: { ATP: 0, NADH: 0 },
      timesPerGlucose: 1,
      atmosphere: null
    },
    {
      id: 'step5',
      phase: 'investment',
      molecule: 'g3p',
      reactionNumber: 5,
      camera: { zoom: .88, speed: .2 },
      captions: [
        cap('Reaction 5. Triose phosphate isomerase.', 3000),
        cap('One of the two three-carbon molecules is rearranged into the other form.', 4000, 'DHAP is converted to glyceraldehyde-3-phosphate. Only G3P continues directly through the payoff phase.'),
        cap('Now there are two molecules of glyceraldehyde-3-phosphate.', 3500),
        cap('From this point, every reaction occurs twice for each original glucose.', 4000, 'This is one of the most important ideas in glycolysis. One glucose yields two G3P, so reactions 6 through 10 each happen twice.')
      ],
      enzyme: 'Triose Phosphate Isomerase',
      reaction: 'DHAP \u21CC G3P',
      perReaction: { ATP: 0, NADH: 0 },
      timesPerGlucose: 1,
      preloads: ['pg2', 'pep', 'pyruvate'],
      atmosphere: null
    },
    {
      id: 'step6',
      phase: 'payoff',
      molecule: 'g3p',
      reactionNumber: 6,
      camera: { zoom: .85, speed: .15 },
      captions: [
        cap('Reaction 6. Glyceraldehyde-3-phosphate dehydrogenase.', 3500),
        cap('The carbon molecule is oxidized. NAD\u207A accepts electrons and is reduced to NADH.', 3500, 'Oxidation means the loss of electrons or reducing equivalents. Here, the aldehyde group of G3P is oxidized. NAD\u207A accepts those electrons and is reduced to NADH, a reduced electron carrier that carries high-energy electrons for subsequent metabolic reactions.'),
        cap('An inorganic phosphate is added directly from solution. No ATP is used.', 3500, 'The inorganic phosphate (P\u1D62) is incorporated without ATP. This produces 1,3-bisphosphoglycerate, an intermediate with high phosphoryl-transfer potential.')
      ],
      enzyme: 'Glyceraldehyde-3-phosphate dehydrogenase',
      reaction: 'G3P + NAD\u207A + P\u1D62 \u21CC 1,3-BPG + NADH + H\u207A',
      perReaction: { ATP: 0, NADH: 1 },
      timesPerGlucose: 2,
      atmosphere: null
    },
    {
      id: 'step7',
      phase: 'payoff',
      molecule: 'bpg13',
      reactionNumber: 7,
      camera: { zoom: .88, speed: .2 },
      captions: [
        cap('Reaction 7. Phosphoglycerate kinase.', 3000),
        cap('A phosphoryl group is transferred from 1,3-bisphosphoglycerate to ADP.', 4000),
        cap('ADP becomes ATP. This is substrate-level phosphorylation.', 3500, 'Substrate-level phosphorylation means ATP is made directly by transferring a phosphoryl group from a metabolic intermediate to ADP. This is distinct from oxidative phosphorylation.')
      ],
      enzyme: 'Phosphoglycerate kinase',
      reaction: '1,3-BPG + ADP \u21CC 3-PG + ATP',
      perReaction: { ATP: 1, NADH: 0 },
      timesPerGlucose: 2,
      atmosphere: null
    },
    {
      id: 'step8',
      phase: 'payoff',
      molecule: 'pg3',
      reactionNumber: 8,
      camera: { zoom: .88, speed: .2 },
      captions: [
        cap('Reaction 8. Phosphoglycerate mutase.', 3000),
        cap('The phosphoryl group is moved to a different position on the molecule.', 4000, '3-phosphoglycerate is rearranged to 2-phosphoglycerate. The same phosphate group is relocated. This prepares the molecule for dehydration.')
      ],
      enzyme: 'Phosphoglycerate mutase',
      reaction: '3-PG \u21CC 2-PG',
      perReaction: { ATP: 0, NADH: 0 },
      timesPerGlucose: 2,
      atmosphere: null
    },
    {
      id: 'step9',
      phase: 'payoff',
      molecule: 'pg2',
      reactionNumber: 9,
      camera: { zoom: .82, speed: .15 },
      captions: [
        cap('Reaction 9. Enolase.', 2500),
        cap('Water is removed from the molecule.', 3000),
        cap('This rearranges the molecule into phosphoenolpyruvate, or PEP.', 4000, 'Dehydration produces PEP. Its structure gives it very high phosphoryl-transfer potential, meaning PEP can transfer its phosphoryl group to ADP very effectively.')
      ],
      enzyme: 'Enolase',
      reaction: '2-PG \u21CC PEP + H\u2082O',
      perReaction: { ATP: 0, NADH: 0 },
      timesPerGlucose: 2,
      atmosphere: null
    },
    {
      id: 'step10',
      phase: 'payoff',
      molecule: 'pep',
      reactionNumber: 10,
      camera: { zoom: .82, speed: .15 },
      captions: [
        cap('Reaction 10. Pyruvate kinase.', 3000),
        cap('The phosphoryl group is transferred from PEP to ADP.', 3500),
        cap('ADP becomes ATP. The carbon skeleton becomes pyruvate.', 4000, 'This is the second substrate-level phosphorylation of glycolysis. Because there are two PEP molecules per glucose, two ATP are produced here.'),
        cap('The six-carbon glucose has become two three-carbon pyruvate molecules.', 5000)
      ],
      enzyme: 'Pyruvate kinase',
      reaction: 'PEP + ADP \u2192 Pyruvate + ATP',
      perReaction: { ATP: 1, NADH: 0 },
      timesPerGlucose: 2,
      atmosphere: null
    },
    {
      id: 'pyruvate',
      phase: 'accounting',
      molecule: 'pyruvate',
      reactionNumber: null,
      camera: { zoom: .9, speed: .15 },
      captions: [
        cap('Two pyruvate molecules remain.', 2500)
      ],
      enzyme: null,
      reaction: null,
      perReaction: null,
      timesPerGlucose: 0,
      accounting: { invested: 2, produced: 4, nadh: 2, showNet: false },
      atmosphere: null
    },
    {
      id: 'atp-accounting',
      phase: 'accounting',
      molecule: 'pyruvate',
      reactionNumber: null,
      camera: { zoom: 1.1 },
      captions: [
        cap('ATP accounting.', 2000),
        cap('Two ATP were invested in the early reactions.', 3000),
        cap('Four ATP were produced in the payoff phase.', 3000),
        cap('The net gain is two ATP per glucose.', 3000)
      ],
      enzyme: null,
      reaction: null,
      perReaction: null,
      timesPerGlucose: 0,
      accounting: { invested: 2, produced: 4, nadh: 2, showNet: true },
      atmosphere: null
    },
    {
      id: 'nadh-accounting',
      phase: 'accounting',
      molecule: 'pyruvate',
      reactionNumber: null,
      camera: { zoom: 1.0 },
      captions: [
        cap('Two NAD\u207A were reduced to two NADH.', 3500, 'NADH is a reduced electron carrier. Its electrons can ultimately contribute to oxidative metabolism, with cytosolic reducing equivalents transferred through cellular shuttle systems.'),
        cap('NAD\u207A must be regenerated for glycolysis to continue.', 4000, 'Reaction 6 requires NAD\u207A. Without regeneration, glycolysis would stop. In aerobic cells, NADH donates electrons to mitochondrial respiration. When oxygen is unavailable, fermentation regenerates NAD\u207A.')
      ],
      enzyme: null,
      reaction: null,
      perReaction: null,
      timesPerGlucose: 0,
      accounting: { invested: 2, produced: 4, nadh: 2, showNet: true },
      atmosphere: null
    },
    {
      id: 'carbon-accounting',
      phase: 'accounting',
      molecule: 'pyruvate',
      reactionNumber: null,
      camera: { zoom: 1.0 },
      captions: [
        cap('Carbon accounting.', 2000),
        cap('One six-carbon glucose has become two three-carbon pyruvate molecules.', 4500),
        cap('No carbon atoms are lost. The carbon skeleton is conserved.', 3500)
      ],
      enzyme: null,
      reaction: null,
      perReaction: null,
      timesPerGlucose: 0,
      accounting: { invested: 2, produced: 4, nadh: 2, showNet: true },
      atmosphere: null,
      showEquation: true
    },
    {
      id: 'oxygen',
      phase: 'downstream',
      molecule: 'pyruvate',
      reactionNumber: null,
      camera: { zoom: 1.0 },
      captions: [
        cap('Glycolysis itself does not directly require molecular oxygen.', 4000),
        cap('It can occur when oxygen is available or unavailable.', 3500),
        cap('However, the NADH produced must ultimately be reoxidized to NAD\u207A for glycolysis to continue.', 5000, 'Under aerobic conditions, NADH can contribute electrons to mitochondrial oxidative metabolism. When oxygen is unavailable, cells use fermentation pathways to regenerate NAD\u207A.')
      ],
      enzyme: null,
      reaction: null,
      perReaction: null,
      timesPerGlucose: 0,
      accounting: null,
      atmosphere: null
    },
    {
      id: 'fermentation',
      phase: 'downstream',
      molecule: 'pyruvate',
      reactionNumber: null,
      camera: { zoom: 1.1 },
      captions: [
        cap('In aerobic cells, NADH can contribute electrons to mitochondrial respiration.', 4500),
        cap('When oxygen is unavailable, fermentation pathways regenerate NAD\u207A.', 4000, 'In lactic acid fermentation, pyruvate is reduced to lactate while NADH is oxidized back to NAD\u207A. This allows glycolysis to continue. Fermentation does not generate additional ATP beyond glycolysis.'),
        cap('The ATP yield of glycolysis itself remains two ATP net per glucose.', 4000)
      ],
      enzyme: null,
      reaction: null,
      perReaction: null,
      timesPerGlucose: 0,
      accounting: null,
      atmosphere: null
    },
    {
      id: 'why-matters',
      phase: 'downstream',
      molecule: 'pyruvate',
      reactionNumber: null,
      camera: { zoom: 1.0 },
      captions: [
        cap('Why does glycolysis matter?', 2000),
        cap('It can generate ATP rapidly without directly consuming molecular oxygen.', 3500),
        cap('It generates NADH for later energy extraction.', 3000),
        cap('It supplies intermediates that connect to other metabolic pathways.', 4000)
      ],
      enzyme: null,
      reaction: null,
      perReaction: null,
      timesPerGlucose: 0,
      accounting: null,
      atmosphere: null
    },
    {
      id: 'finale',
      phase: 'finale',
      molecule: null,
      camera: null,
      reactionNumber: null,
      captions: [
        cap('One glucose.', 1500),
        cap('Ten reactions.', 1500),
        cap('Two pyruvate.', 1500),
        cap('Two net ATP.', 1500),
        cap('Two NADH.', 1500),
        cap('Glycolysis is one of the most widespread metabolic pathways in biology.', 5000)
      ],
      enzyme: null,
      reaction: null,
      perReaction: null,
      timesPerGlucose: 0,
      accounting: null,
      atmosphere: 'cytosol',
      fadeToBlack: true,
      autoAdvanceDelay: 8000
    }
  ];

  const atmosphereCanvas = document.getElementById('atmosphere');
  const actx = atmosphereCanvas.getContext('2d');
  let atmosphereState = null, atmosphereAlpha = 0, atmosphereTargetAlpha = 0, particles = [], atmosphereAnimating = false;
  let atmosphereWidth = 0, atmosphereHeight = 0;

  function resizeAtmosphere() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    if (width === atmosphereWidth && height === atmosphereHeight) return;
    atmosphereWidth = width;
    atmosphereHeight = height;
    atmosphereCanvas.width = width;
    atmosphereCanvas.height = height;
  }

  function initParticles() {
    particles = [];
    const c = PREFERS_REDUCED ? 10 : (IS_MOBILE ? 15 : 45);
    for (let i = 0; i < c; i++)
      particles.push({
        x: Math.random() * innerWidth,
        y: Math.random() * innerHeight,
        r: Math.random() * 1.5 + .3,
        vx: (Math.random() - .5) * .25,
        vy: (Math.random() - .5) * .18,
        alpha: Math.random() * .25 + .05,
        pulse: Math.random() * Math.PI * 2
      });
  }

  function drawAtmosphere(time) {
    if (PREFERS_REDUCED || !atmosphereAnimating) return;
    const w = atmosphereCanvas.width, h = atmosphereCanvas.height;
    actx.clearRect(0, 0, w, h);
    atmosphereAlpha += (atmosphereTargetAlpha - atmosphereAlpha) * .05;
    if (atmosphereAlpha < .005 && atmosphereTargetAlpha === 0) {
      atmosphereAlpha = 0;
      atmosphereCanvas.classList.remove('visible');
      atmosphereAnimating = false;
      return;
    }
    atmosphereCanvas.style.opacity = atmosphereAlpha;
    if (!atmosphereState) {
      if (atmosphereAnimating) requestAnimationFrame(drawAtmosphere);
      return;
    }
    const cx = w / 2, cy = h / 2, cellR = Math.min(w, h) * .35;
    let zoom = 1;
    if (atmosphereState === 'approach') zoom = 1.3;
    if (atmosphereState === 'membrane') zoom = 2.5;
    if (atmosphereState === 'cytosol') zoom = 4.0;
    actx.save();
    actx.translate(cx, cy);
    actx.scale(zoom, zoom);
    actx.translate(-cx, -cy);

    actx.fillStyle = 'rgba(140,180,220,0.06)';
    actx.beginPath();
    actx.arc(cx, cy, cellR * 1.05, 0, Math.PI * 2);
    actx.fill();

    actx.strokeStyle = 'rgba(140,180,220,0.15)';
    actx.lineWidth = 1.5;
    actx.beginPath();
    actx.arc(cx, cy, cellR, 0, Math.PI * 2);
    actx.stroke();

    actx.fillStyle = 'rgba(100,150,200,0.03)';
    actx.beginPath();
    actx.arc(cx, cy, cellR * .8, 0, Math.PI * 2);
    actx.fill();

    actx.strokeStyle = 'rgba(160,200,240,0.1)';
    actx.lineWidth = 1;
    actx.beginPath();
    actx.arc(cx + cellR * .02, cy - cellR * .05, cellR * .22, 0, Math.PI * 2);
    actx.stroke();

    actx.fillStyle = 'rgba(140,180,240,0.04)';
    actx.fill();

    [
      { x: cx - cellR * .35, y: cy - cellR * .25, a: .4, w: cellR * .16, h: cellR * .06 },
      { x: cx + cellR * .3, y: cy - cellR * .2, a: -.5, w: cellR * .14, h: cellR * .05 },
      { x: cx + cellR * .2, y: cy + cellR * .3, a: .3, w: cellR * .15, h: cellR * .055 },
      { x: cx - cellR * .25, y: cy + cellR * .28, a: -.3, w: cellR * .13, h: cellR * .05 }
    ].forEach(m => {
      actx.save();
      actx.translate(m.x, m.y);
      actx.rotate(m.a);
      actx.strokeStyle = 'rgba(215,255,95,0.12)';
      actx.lineWidth = 1;
      actx.beginPath();
      actx.ellipse(0, 0, m.w, m.h, 0, 0, Math.PI * 2);
      actx.stroke();
      actx.restore();
    });

    const t = (time || 0) * .001;
    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0) p.x = w;
      if (p.x > w) p.x = 0;
      if (p.y < 0) p.y = h;
      if (p.y > h) p.y = 0;
      actx.fillStyle = `rgba(180,210,240,${p.alpha * (.5 + .5 * Math.sin(t + p.pulse))})`;
      actx.beginPath();
      actx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      actx.fill();
    });
    actx.restore();
    if (atmosphereAnimating) requestAnimationFrame(drawAtmosphere);
  }

  function startAtmosphereAnimation() {
    if (IS_MOBILE) return;
    if (!atmosphereAnimating) {
      atmosphereAnimating = true;
      requestAnimationFrame(drawAtmosphere);
    }
  }

  let viewer = null;

  function initViewer() {
    try {
      viewer = $3Dmol.createViewer('molViewer', { backgroundColor: BG, antialias: !IS_MOBILE, disableFog: true });
    } catch (e) {
      viewer = null;
    }
  }

  function ensureViewer() {
    if (viewer) return Promise.resolve(viewer);
    const delays = [200, 400, 800];
    let attempt = 0;
    return new Promise(resolve => {
      function tryCreate() {
        if (viewer) { resolve(viewer); return; }
        if (attempt >= delays.length) {
          showViewerRetryButton();
          resolve(null);
          return;
        }
        try {
          viewer = $3Dmol.createViewer('molViewer', { backgroundColor: BG, antialias: !IS_MOBILE, disableFog: true });
          if (viewer) { resolve(viewer); return; }
        } catch (e) {}
        attempt++;
        setTimeout(tryCreate, delays[attempt - 1]);
      }
      tryCreate();
    });
  }

  function showViewerRetryButton() {
    const retryDiv = document.createElement('div');
    retryDiv.id = 'viewerRetryOverlay';
    retryDiv.setAttribute('role', 'alert');
    retryDiv.setAttribute('aria-label', '3D viewer failed to load');
    retryDiv.innerHTML = '<div style="position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;background:rgba(9,11,15,.95)"><div style="text-align:center;color:#c8cdd0;font-family:var(--display,Space Grotesk,sans-serif)"><p style="font-size:16px;margin-bottom:12px">The 3D molecular viewer could not initialize.</p><button id="viewerRetryBtn" style="padding:10px 24px;border:1px solid rgba(200,205,208,.25);border-radius:6px;background:rgba(200,205,208,.08);color:#c8cdd0;font-size:13px;font-family:inherit;cursor:pointer">RETRY</button></div></div>';
    document.body.appendChild(retryDiv);
    document.getElementById('viewerRetryBtn').addEventListener('click', () => {
      retryDiv.remove();
      viewer = null;
      ensureViewer();
    });
  }

  function applyStyle() {
    if (!viewer) return;
    try {
      viewer.setStyle({ elem: 'C' }, { sphere: { scale: .28, colorscheme: 'Jmol' }, stick: { radius: .07, colorscheme: 'Jmol' } });
      viewer.setStyle({ elem: 'O' }, { sphere: { scale: .32, colorscheme: 'Jmol' }, stick: { radius: .07, colorscheme: 'Jmol' } });
      viewer.setStyle({ elem: 'N' }, { sphere: { scale: .30, colorscheme: 'Jmol' }, stick: { radius: .07, colorscheme: 'Jmol' } });
      viewer.setStyle({ elem: 'P' }, { sphere: { scale: .36, colorscheme: 'Jmol' }, stick: { radius: .08, colorscheme: 'Jmol' } });
      if (hydrogens)
        viewer.setStyle({ elem: 'H' }, { sphere: { scale: .22, colorscheme: 'Jmol' }, stick: { radius: .06, colorscheme: 'Jmol' } });
      else
        viewer.setStyle({ elem: 'H' }, { hidden: true });
    } catch (e) {}
  }

  const molFade = document.getElementById('molFade');
  const molFallback = document.getElementById('molFallback');
  const molFallbackText = document.getElementById('molFallbackText');

  async function showMolecule(key) {
    if (!viewer) await ensureViewer();
    return new Promise(resolve => {
      if (!viewer || currentMolKey === key) {
        resolve();
        return;
      }
      const mol = MOL[key];
      if (!mol) {
        resolve();
        return;
      }
      const myMolSeq = ++molTransitionSeq;
      const afterLoad = text => {
        if (myMolSeq !== molTransitionSeq) {
          resolve();
          return;
        }
        document.getElementById('loadingIndicator').classList.remove('visible');
        if (text) {
          try {
            if (myMolSeq !== molTransitionSeq) {
              resolve();
              return;
            }
            molFade.style.opacity = '1';
            if (myMolSeq !== molTransitionSeq) {
              molFade.style.opacity = '0';
              resolve();
              return;
            }
            viewer.removeAllModels();
            if (myMolSeq !== molTransitionSeq) {
              molFade.style.opacity = '0';
              resolve();
              return;
            }
            viewer.addModel(text, 'sdf');
            if (myMolSeq !== molTransitionSeq) {
              molFade.style.opacity = '0';
              resolve();
              return;
            }
            applyStyle();
            viewer.zoomTo();
            viewer.zoom(.92);
            viewer.render();
            setTimeout(() => {
              if (myMolSeq !== molTransitionSeq) return;
              molFade.style.opacity = '0';
              if (rotating) try { viewer.spin('y', .25); } catch (e) {}
              currentMolKey = key;
              el.molFallback.classList.remove('show');
              updateMolAria(key);
            }, PREFERS_REDUCED ? 10 : 300);
          } catch (e) {
            if (myMolSeq !== molTransitionSeq) {
              resolve();
              return;
            }
            molFade.style.opacity = '0';
            showMolFallback(mol);
            currentMolKey = key;
            updateMolAria(key);
          }
        } else {
          if (myMolSeq !== molTransitionSeq) {
            resolve();
            return;
          }
          molFade.style.opacity = '0';
          showMolFallback(mol);
          currentMolKey = key;
          updateMolAria(key);
        }
        resolve();
      };
      const sdfText = sdfCache[key];
      if (!sdfText) {
        document.getElementById('loadingIndicator').classList.add('visible');
        loadSDF(key).then(afterLoad);
        return;
      }
      afterLoad(sdfText);
    });
  }

  function updateMolAria(key) {
    const d = el.srMolDesc;
    if (!d) return;
    if (!key || !MOL[key]) {
      d.textContent = '';
      return;
    }
    const m = MOL[key];
    d.textContent = m.name + '. ' + m.formula + '. ' + (m.desc || '') + ' 3D molecular visualization. ' + (m.cid ? 'PubChem CID ' + m.cid + '.' : '');
  }

  function showMolFallback(mol) {
    molFallbackText.innerHTML = `<div class="fb-name">${mol.name}</div><div>${mol.formula}</div><div style="margin-top:8px;font-size:12px">${mol.desc || 'Molecular structure unavailable. Reaction information remains available.'}</div>`;
    molFallback.classList.add('show');
  }

  function clearMolecule() {
    if (!viewer) return;
    try {
      viewer.removeAllModels();
      viewer.spin(false);
      viewer.render();
    } catch (e) {}
    currentMolKey = null;
    el.molFallback.classList.remove('show');
    updateMolAria(null);
  }

  const el = {};
  [
    'viewport', 'atmosphere', 'caption', 'captionText', 'sceneControls', 'countdownText', 'navRow',
    'stepCounter', 'sceneLabel', 'molLabel', 'molLabelName', 'molLabelFormula',
    'enzymeLabel', 'enzymeName', 'enzymeReaction', 'accounting', 'legend',
    'fadeOverlay', 'loadingIndicator', 'srLive', 'btnPrev', 'btnNext', 'btnStay', 'btnPause',
    'btnRotate', 'btnHydrogen', 'btnReset', 'viewerToolbar',
    'navControls', 'narrationControls', 'btnNarration', 'btnHome', 'btnRestart', 'deepDetail', 'deepDetailText', 'overallEquation', 'molFallback', 'srMolDesc'
  ].forEach(id => {
    el[id] = document.getElementById(id);
  });

  function showUI(ids) {
    ids.forEach(id => {
      if (el[id]) el[id].classList.add('visible');
    });
  }

  function hideUI(ids) {
    ids.forEach(id => {
      if (el[id]) el[id].classList.remove('visible');
    });
  }

  function pickNarratorVoice() {
    if (!('speechSynthesis' in window)) return null;
    const v = speechSynthesis.getVoices();
    const p = ['Google UK English Female', 'Google UK English Male', 'Samantha', 'Karen', 'Daniel', 'Microsoft Zira', 'Microsoft David'];
    for (const n of p) {
      const x = v.find(w => w.name.includes(n));
      if (x) return x;
    }
    return v.find(w => w.lang.startsWith('en')) || null;
  }

  let cachedVoice = null;

  function getNarratorVoice() {
    if (!cachedVoice) cachedVoice = pickNarratorVoice();
    return cachedVoice;
  }

  if ('speechSynthesis' in window) {
    speechSynthesis.onvoiceschanged = () => {
      cachedVoice = pickNarratorVoice();
    };
    speechSynthesis.getVoices();
  }

  let onSpeechEnd = null;
  let isNarratingSpeech = false;

  function speakNarration(text, onEnd, seq) {
    if (!('speechSynthesis' in window) || !narrationEnabled) {
      isNarratingSpeech = false;
      if (onEnd) onEnd();
      return;
    }
    if (currentUtterance) {
      try {
        speechSynthesis.cancel();
      } catch (e) {}
    }
    const u = new SpeechSynthesisUtterance(text);
    const voice = getNarratorVoice();
    if (voice) u.voice = voice;
    u.rate = .88;
    u.pitch = 1.0;
    u.volume = narrationVolume;
    u.lang = 'en-US';
    currentUtterance = u;
    isNarratingSpeech = true;
    u.onend = () => {
      currentUtterance = null;
      isNarratingSpeech = false;
      if (seq === narrationSeqToken && !storyPaused && onEnd) onEnd();
    };
    u.onerror = () => {
      currentUtterance = null;
      isNarratingSpeech = false;
      if (seq === narrationSeqToken && !storyPaused && onEnd) onEnd();
    };
    try {
      speechSynthesis.speak(u);
    } catch (e) {
      currentUtterance = null;
      isNarratingSpeech = false;
      if (seq === narrationSeqToken && !storyPaused && onEnd) onEnd();
    }
  }

  function stopNarration() {
    if ('speechSynthesis' in window) {
      try {
        speechSynthesis.cancel();
      } catch (e) {}
      currentUtterance = null;
      isNarratingSpeech = false;
    }
    narrationSeqToken++;
  }

  function setupNarrationControls() {
    el.btnNarration.addEventListener('click', () => {
      narrationEnabled = !narrationEnabled;
      el.btnNarration.setAttribute('aria-pressed', String(narrationEnabled));
      el.btnNarration.classList.toggle('active', narrationEnabled);
      el.btnNarration.textContent = narrationEnabled ? 'NARRATION' : 'NARRATION OFF';
      if (!narrationEnabled) {
        stopNarration();
      } else if (!storyPaused && !captionsComplete && currentCaptionIndex >= 0 && activeCaptions && activeCaptions[currentCaptionIndex]) {
        const c = activeCaptions[currentCaptionIndex];
        const seq = ++narrationSeqToken;
        speakNarration(c.text, () => {
          if (seq !== narrationSeqToken || storyPaused) return;
          el.captionText.classList.remove('show');
          if (el.deepDetail) el.deepDetail.classList.remove('show');
          captionTimer = setTimeout(() => {
            captionTimer = null;
            if (storyPaused) return;
            showCaptionAtIndex(currentCaptionIndex + 1);
          }, 400);
        }, seq);
      }
      el.srLive.textContent = narrationEnabled ? 'Narration enabled' : 'Narration disabled';
    });
    el.btnNarration.classList.add('active');
  }

  let activeCaptions = [];
  let currentCaptionIndex = -1;
  let captionsComplete = false;
  let captionTimer = null;
  let captionStartTime = 0;
  let captionDurationMs = 0;
  let captionRemainingMs = 0;
  let currentCaptionSeq = 0;
  let currentCaptionOnDone = null;

  function clearCaptions() {
    if (captionTimer) {
      clearTimeout(captionTimer);
      captionTimer = null;
    }
    activeCaptions = [];
    currentCaptionIndex = -1;
    captionsComplete = false;
    captionStartTime = 0;
    captionDurationMs = 0;
    captionRemainingMs = 0;
    currentCaptionOnDone = null;
    isNarratingSpeech = false;
    if (el.captionText) {
      el.captionText.classList.remove('show');
      el.captionText.textContent = '';
    }
    if (el.deepDetail) {
      el.deepDetail.classList.remove('show');
    }
    if (el.deepDetailText) {
      el.deepDetailText.textContent = '';
    }
  }

  function playCaptions(captions, onDone, seq) {
    clearCaptions();
    activeCaptions = captions || [];
    currentCaptionSeq = seq;
    currentCaptionOnDone = onDone;
    if (!activeCaptions || activeCaptions.length === 0) {
      captionsComplete = true;
      if (onDone) onDone();
      return;
    }
    showCaptionAtIndex(0);
  }

  function showCaptionAtIndex(idx) {
    if (currentCaptionSeq !== narrationSeqToken || sceneToken !== parseInt(el.stepCounter.dataset.token || '0')) return;
    if (idx >= activeCaptions.length) {
      captionsComplete = true;
      if (el.deepDetail) el.deepDetail.classList.remove('show');
      if (currentCaptionOnDone) currentCaptionOnDone();
      return;
    }
    currentCaptionIndex = idx;
    const c = activeCaptions[idx];
    el.captionText.textContent = c.text;
    el.captionText.classList.add('show');
    if (el.srLive) el.srLive.textContent = c.text;
    if (c.deep) {
      el.deepDetailText.textContent = c.deep;
      el.deepDetail.classList.add('show');
    } else if (el.deepDetail) {
      el.deepDetail.classList.remove('show');
    }

    const dur = (c.duration || 3500) + 350;
    captionDurationMs = dur;
    captionStartTime = Date.now();
    captionRemainingMs = dur;

    if (storyPaused) {
      return;
    }

    const useSpeech = narrationEnabled && 'speechSynthesis' in window;
    if (useSpeech) {
      speakNarration(c.text, () => {
        if (currentCaptionSeq !== narrationSeqToken || sceneToken !== parseInt(el.stepCounter.dataset.token || '0')) return;
        if (storyPaused) return;
        el.captionText.classList.remove('show');
        if (el.deepDetail) el.deepDetail.classList.remove('show');
        captionTimer = setTimeout(() => {
          captionTimer = null;
          if (storyPaused || currentCaptionSeq !== narrationSeqToken) return;
          showCaptionAtIndex(idx + 1);
        }, 400);
      }, currentCaptionSeq);
    } else {
      captionTimer = setTimeout(() => {
        captionTimer = null;
        if (currentCaptionSeq !== narrationSeqToken || sceneToken !== parseInt(el.stepCounter.dataset.token || '0')) return;
        if (storyPaused) return;
        el.captionText.classList.remove('show');
        if (el.deepDetail) el.deepDetail.classList.remove('show');
        captionTimer = setTimeout(() => {
          captionTimer = null;
          if (storyPaused || currentCaptionSeq !== narrationSeqToken) return;
          showCaptionAtIndex(idx + 1);
        }, 300);
      }, dur);
    }
  }

  function showAccounting(acc) {
    if (!acc) {
      el.accounting.classList.remove('visible');
      el.accounting.innerHTML = '';
      return;
    }
    const net = acc.produced - acc.invested;
    let html = '<div class="acc-section">Pathway total</div>';
    html += `<div class="acc-item"><span>ATP invested</span><span class="acc-val negative">\u2212${acc.invested}</span></div>`;
    html += `<div class="acc-item"><span>ATP produced</span><span class="acc-val positive">+${acc.produced}</span></div>`;
    if (acc.showNet) html += `<div class="acc-item"><span>Net ATP</span><span class="acc-val ${net >= 0 ? 'positive' : 'negative'}">${net >= 0 ? '+' : ''}${net}</span></div>`;
    html += `<div class="acc-item"><span>NADH</span><span class="acc-val positive">+${acc.nadh}</span></div>`;
    el.accounting.innerHTML = html;
    el.accounting.classList.add('visible');
  }

  function showReactionAccounting(pr, times) {
    if (!pr) return;
    el.accounting.innerHTML = '';
    let html = '<div class="acc-section">This reaction</div>';
    let any = false;
    if (pr.ATP !== 0) {
      any = true;
      html += `<div class="acc-item"><span>ATP</span><span class="acc-val ${pr.ATP > 0 ? 'positive' : 'negative'}">${pr.ATP > 0 ? '+' : ''}${pr.ATP}</span></div>`;
    }
    if (pr.NADH !== 0) {
      any = true;
      html += `<div class="acc-item"><span>NADH</span><span class="acc-val positive">+${pr.NADH}</span></div>`;
    }
    if (!any) html += `<div class="acc-item"><span>ATP</span><span class="acc-val" style="color:var(--faint)">0</span></div>`;
    if (times > 1) html += `<div class="acc-item" style="font-size:9px;color:var(--faint)">x${times} per glucose</div>`;
    el.accounting.innerHTML = html;
    el.accounting.classList.add('visible');
  }

  function showOverallEquation() {
    el.overallEquation.innerHTML = 'Glucose + 2 NAD\u207A + 2 ADP + 2 P<sub>i</sub> \u2192 2 Pyruvate + 2 NADH + 2 ATP + 2 H\u207A + 2 H\u2082O<span class="eq-note">Exact proton and water terms vary between biochemical conventions. The key net products are 2 pyruvate, 2 ATP, and 2 NADH per glucose.</span>';
    el.overallEquation.classList.add('visible');
  }

  function transitionCamera(config) {
    if (!config) return;
    if (config.spin !== undefined && viewer) {
      try {
        if (config.spin) viewer.spin('y', config.speed || (IS_MOBILE ? .18 : .2));
        else viewer.spin(false);
      } catch (e) {}
    }
    if (config.zoom !== undefined) {
      if (viewer && currentMolKey) {
        try {
          viewer.zoomTo();
          viewer.zoom(config.zoom * 0.92);
          viewer.render();
        } catch (e) {}
      } else if (!IS_MOBILE) {
        const vp = el.viewport;
        vp.style.transition = `transform ${PREFERS_REDUCED ? .01 : 1.8}s var(--ease-in-out)`;
        vp.style.transform = `scale(${config.zoom})`;
      }
    }
  }

  function cancelCountdown() {
    if (countdownTimer) {
      clearInterval(countdownTimer);
      countdownTimer = null;
    }
    countdownValue = 0;
    el.countdownText.textContent = '';
  }

  function startCountdown(delay, onFire) {
    cancelCountdown();
    autoAdvanceActive = true;
    const s = Math.ceil(delay / 1000);
    countdownValue = s;
    countdownTotal = s;
    onCountdownFire = onFire;
    el.countdownText.textContent = `NEXT SCENE IN ${countdownValue}`;
    countdownTimer = setInterval(() => {
      countdownValue--;
      if (countdownValue <= 0) {
        cancelCountdown();
        onFire();
      } else {
        el.countdownText.textContent = `NEXT SCENE IN ${countdownValue}`;
      }
    }, 1000);
  }

  function pauseCountdown() {
    if (!countdownTimer) return;
    clearInterval(countdownTimer);
    countdownTimer = null;
  }

  function resumeCountdown() {
    if (countdownTimer || countdownValue <= 0) return;
    countdownTimer = setInterval(() => {
      countdownValue--;
      if (countdownValue <= 0) {
        cancelCountdown();
        if (onCountdownFire) onCountdownFire();
      } else {
        el.countdownText.textContent = `NEXT SCENE IN ${countdownValue}`;
      }
    }, 1000);
  }

  function pauseStory() {
    if (storyPaused) return;
    storyPaused = true;
    pauseStart = Date.now();
    pauseCountdown();

    // 1. Cancel speech synthesis immediately to prevent browser speech queue deadlock
    if ('speechSynthesis' in window) {
      try {
        speechSynthesis.cancel();
      } catch (e) {}
    }
    currentUtterance = null;
    isNarratingSpeech = false;

    // 2. Pause caption timer and record remaining ms
    if (captionTimer) {
      clearTimeout(captionTimer);
      captionTimer = null;
    }
    if (captionStartTime > 0 && captionDurationMs > 0) {
      const elapsed = Date.now() - captionStartTime;
      captionRemainingMs = Math.max(1000, captionDurationMs - elapsed);
    }

    // 3. Pause 3D viewer rotation & atmosphere animation
    if (viewer && rotating) {
      try {
        viewer.spin(false);
      } catch (e) {}
    }
    atmosphereAnimating = false;

    // 4. Update UI
    el.countdownText.textContent = 'PAUSED';
    el.btnPause.textContent = 'PLAY';
    el.btnPause.classList.add('paused-state');
    el.btnPause.setAttribute('aria-pressed', 'true');
    el.btnPause.setAttribute('aria-label', 'Resume story (P)');
    if (el.srLive) el.srLive.textContent = 'Story paused';
  }

  function resumeStory() {
    if (!storyPaused) return;
    storyPaused = false;

    // 1. Resume countdown if in transition countdown
    if (countdownValue > 0) {
      resumeCountdown();
      el.countdownText.textContent = `NEXT SCENE IN ${countdownValue}`;
    } else {
      el.countdownText.textContent = '';
      
      // 2. Resume caption playback if scene is in progress
      if (!captionsComplete && currentCaptionIndex >= 0 && activeCaptions && currentCaptionIndex < activeCaptions.length) {
        const c = activeCaptions[currentCaptionIndex];
        el.captionText.textContent = c.text;
        el.captionText.classList.add('show');
        if (c.deep && el.deepDetail) {
          el.deepDetailText.textContent = c.deep;
          el.deepDetail.classList.add('show');
        }

        const useSpeech = narrationEnabled && 'speechSynthesis' in window;
        if (useSpeech) {
          const seq = ++narrationSeqToken;
          currentCaptionSeq = seq;
          speakNarration(c.text, () => {
            if (seq !== narrationSeqToken || storyPaused) return;
            el.captionText.classList.remove('show');
            if (el.deepDetail) el.deepDetail.classList.remove('show');
            captionTimer = setTimeout(() => {
              captionTimer = null;
              if (storyPaused || seq !== narrationSeqToken) return;
              showCaptionAtIndex(currentCaptionIndex + 1);
            }, 400);
          }, seq);
        } else {
          captionStartTime = Date.now();
          const dur = captionRemainingMs > 0 ? captionRemainingMs : ((c.duration || 3500) + 350);
          captionDurationMs = dur;
          captionTimer = setTimeout(() => {
            captionTimer = null;
            if (storyPaused) return;
            el.captionText.classList.remove('show');
            if (el.deepDetail) el.deepDetail.classList.remove('show');
            captionTimer = setTimeout(() => {
              captionTimer = null;
              if (storyPaused) return;
              showCaptionAtIndex(currentCaptionIndex + 1);
            }, 300);
          }, dur);
        }
      }
    }

    // 3. Resume 3D viewer rotation
    if (viewer && rotating) {
      try {
        viewer.spin('y', .25);
      } catch (e) {}
    }

    // 4. Resume atmosphere animation
    if (currentSceneIndex >= 0 && scenes[currentSceneIndex] && scenes[currentSceneIndex].atmosphere) {
      startAtmosphereAnimation();
    }

    // 5. Update UI
    el.btnPause.textContent = 'PAUSE';
    el.btnPause.classList.remove('paused-state');
    el.btnPause.setAttribute('aria-pressed', 'false');
    el.btnPause.setAttribute('aria-label', 'Pause story (P)');
    if (el.srLive) el.srLive.textContent = 'Story resumed';
  }

  function togglePause() {
    if (storyPaused) resumeStory();
    else pauseStory();
  }

  async function transitionToScene(index, immediate) {
    if (transitioning && !immediate) return;
    if (index < 0 || index >= scenes.length) return;
    if (index === currentSceneIndex && !immediate) return;
    if (storyPaused) resumeStory();
    transitioning = true;
    const token = ++sceneToken;
    el.stepCounter.dataset.token = String(token);
    const scene = scenes[index];
    const prevScene = currentSceneIndex >= 0 ? scenes[currentSceneIndex] : null;
    cancelCountdown();
    clearCaptions();
    stopNarration();
    hideUI(['sceneControls']);
    const needsFade = scene.phase !== (prevScene && prevScene.phase) || scene.id === 'finale' || (prevScene && prevScene.id === 'finale');
    if (needsFade && !immediate && !PREFERS_REDUCED) {
      el.fadeOverlay.classList.add('active');
      await wait(600);
    }
    if (token !== sceneToken) {
      transitioning = false;
      return;
    }
    currentSceneIndex = index;
    if (scene.reactionNumber) {
      el.stepCounter.textContent = `REACTION ${String(scene.reactionNumber).padStart(2, '0')} / 10`;
    } else {
      el.stepCounter.textContent = 'GLYCOLYSIS';
    }
    el.stepCounter.classList.add('visible');
    const phaseLabels = {
      intro: 'INTRODUCTION',
      investment: 'ENERGY INVESTMENT \u00B7 REACTIONS 1\u20135',
      payoff: 'ENERGY PAYOFF \u00B7 REACTIONS 6\u201310',
      accounting: 'ACCOUNTING',
      downstream: 'DOWNSTREAM',
      finale: 'FINALE'
    };
    const label = phaseLabels[scene.phase] || '';
    el.sceneLabel.textContent = label;
    if (label) el.sceneLabel.classList.add('visible');
    else el.sceneLabel.classList.remove('visible');
    if (scene.molecule && MOL[scene.molecule]) {
      el.molLabelName.textContent = MOL[scene.molecule].name;
      el.molLabelFormula.textContent = MOL[scene.molecule].formula;
      el.molLabel.classList.add('visible');
      updateMolAria(scene.molecule);
    } else {
      el.molLabel.classList.remove('visible');
      updateMolAria(null);
    }
    if (scene.enzyme) {
      el.enzymeName.textContent = scene.enzyme;
      el.enzymeReaction.innerHTML = scene.reaction || '';
      el.enzymeLabel.classList.add('visible');
    } else {
      el.enzymeLabel.classList.remove('visible');
    }
    if (scene.accounting) showAccounting(scene.accounting);
    else if (scene.perReaction) showReactionAccounting(scene.perReaction, scene.timesPerGlucose);
    else {
      el.accounting.classList.remove('visible');
      el.accounting.innerHTML = '';
    }
    if (scene.showEquation) showOverallEquation();
    else {
      el.overallEquation.classList.remove('visible');
    }
    if (scene.atmosphere) {
      atmosphereState = scene.atmosphere;
      atmosphereTargetAlpha = 1;
      el.atmosphere.classList.add('visible');
      startAtmosphereAnimation();
    } else {
      atmosphereTargetAlpha = 0;
      atmosphereAlpha = 0;
      atmosphereState = null;
      actx.clearRect(0, 0, atmosphereCanvas.width, atmosphereCanvas.height);
      atmosphereCanvas.style.opacity = '0';
      atmosphereCanvas.classList.remove('visible');
      atmosphereAnimating = false;
    }
    if (scene.molecule) {
      await showMolecule(scene.molecule);
      if (token !== sceneToken) {
        transitioning = false;
        return;
      }
      el.viewport.style.opacity = '1';
    } else {
      if (!scene.atmosphere) clearMolecule();
      el.viewport.style.opacity = '1';
      el.viewport.style.transform = '';
    }
    transitionCamera(scene.camera);
    if (scene.molecule) showUI(['molLabel', 'legend', 'viewerToolbar']);
    else hideUI(['molLabel', 'legend', 'viewerToolbar']);
    if (scene.enzyme) showUI(['enzymeLabel']);
    else hideUI(['enzymeLabel']);
    if (scene.molecule) showUI(['molecularCaveat']);
    else hideUI(['molecularCaveat']);
    if (needsFade && !immediate && !PREFERS_REDUCED) {
      await wait(200);
      el.fadeOverlay.classList.remove('active');
    }
    el.btnPrev.disabled = index <= 0;
    el.btnNext.disabled = index >= scenes.length - 1;
    if (scene.preloads) preload(scene.preloads);
    if (index === 0 && !firstSceneReady) {
      dismissLoadingScreen();
      firstSceneReady = true;
      await wait(1000);
    }
    if (token !== sceneToken) {
      transitioning = false;
      return;
    }
    await wait(300);
    if (token !== sceneToken) {
      transitioning = false;
      return;
    }
    const seq = ++narrationSeqToken;
    el.btnStay.classList.remove('stay-active');
    autoAdvanceActive = true;
    playCaptions(scene.captions, () => {
      if (seq !== narrationSeqToken || token !== sceneToken) return;
      showUI(['sceneControls']);
      if (!autoAdvanceActive) return;
      const delay = scene.autoAdvanceDelay || 5000;
      startCountdown(delay, () => {
        if (token !== sceneToken) return;
        if (currentSceneIndex < scenes.length - 1) transitionToScene(currentSceneIndex + 1);
      });
      if (storyPaused) {
        el.countdownText.textContent = 'PAUSED';
        pauseCountdown();
      }
    }, seq);
    transitioning = false;
  }

  function setupControls() {
    el.btnRotate.setAttribute('aria-pressed', String(rotating));
    el.btnRotate.classList.toggle('active', rotating);

    el.btnPrev.addEventListener('click', () => {
      if (currentSceneIndex > 0) transitionToScene(currentSceneIndex - 1);
    });
    el.btnNext.addEventListener('click', () => {
      cancelCountdown();
      if (currentSceneIndex < scenes.length - 1) transitionToScene(currentSceneIndex + 1);
    });
    el.btnStay.addEventListener('click', () => {
      if (autoAdvanceActive) {
        cancelCountdown();
        autoAdvanceActive = false;
        el.btnStay.classList.add('stay-active');
        el.countdownText.textContent = 'AUTO ADVANCE OFF';
        setTimeout(() => {
          if (!autoAdvanceActive && !storyPaused && countdownValue <= 0) el.countdownText.textContent = '';
        }, 2000);
      } else {
        autoAdvanceActive = true;
        el.btnStay.classList.remove('stay-active');
        if (captionsComplete && currentSceneIndex >= 0) {
          const delay = scenes[currentSceneIndex].autoAdvanceDelay || 5000;
          startCountdown(delay, () => {
            if (currentSceneIndex < scenes.length - 1) transitionToScene(currentSceneIndex + 1);
          });
        }
      }
    });
    el.btnPause.addEventListener('click', togglePause);
    el.btnRestart.addEventListener('click', () => {
      cancelCountdown();
      clearCaptions();
      stopNarration();
      transitionToScene(0, true);
    });
    el.btnHome.addEventListener('click', () => {
      window.location.href = '../index.html';
    });
    el.btnRotate.addEventListener('click', function () {
      rotating = !rotating;
      this.setAttribute('aria-pressed', String(rotating));
      this.classList.toggle('active', rotating);
      try {
        if (viewer) {
          if (rotating) viewer.spin('y', .25);
          else viewer.spin(false);
        }
      } catch (e) {}
    });
    el.btnHydrogen.addEventListener('click', function () {
      hydrogens = !hydrogens;
      this.setAttribute('aria-pressed', String(hydrogens));
      if (currentMolKey) {
        applyStyle();
        try {
          viewer.render();
        } catch (e) {}
      }
    });
    el.btnReset.addEventListener('click', () => {
      if (!viewer || !currentMolKey) return;
      try {
        viewer.spin(false);
        viewer.zoomTo();
        viewer.zoom(.92);
        viewer.render();
        if (rotating) setTimeout(() => {
          try {
            viewer.spin('y', .25);
          } catch (e) {}
        }, 100);
      } catch (e) {}
      el.srLive.textContent = 'Camera view reset';
    });
    document.addEventListener('keydown', e => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      switch (e.key) {
        case 'ArrowRight':
        case ' ':
          e.preventDefault();
          cancelCountdown();
          if (currentSceneIndex < scenes.length - 1) transitionToScene(currentSceneIndex + 1);
          break;
        case 'ArrowLeft':
          e.preventDefault();
          if (currentSceneIndex > 0) transitionToScene(currentSceneIndex - 1);
          break;
        case 'n':
        case 'N':
          if (!e.ctrlKey && !e.metaKey && !e.altKey) el.btnNarration.click();
          break;
        case 'r':
        case 'R':
          if (!e.ctrlKey && !e.metaKey && !e.altKey) el.btnRotate.click();
          break;
        case 'h':
        case 'H':
          if (!e.ctrlKey && !e.metaKey && !e.altKey) el.btnHydrogen.click();
          break;
        case 's':
        case 'S':
          if (!e.ctrlKey && !e.metaKey && !e.altKey) el.btnStay.click();
          break;
        case 'p':
        case 'P':
          if (!e.ctrlKey && !e.metaKey && !e.altKey) togglePause();
          break;
        case 'Escape':
          stopNarration();
          break;
      }
    });
  }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      stopNarration();
      atmosphereAnimating = false;
      try {
        if (viewer) viewer.spin(false);
      } catch (e) {}
    } else {
      if (viewer && rotating) try { viewer.spin('y', .25); } catch (e) {}
    }
  });

  async function init() {
    resizeAtmosphere();
    window.addEventListener('resize', resizeAtmosphere);
    initParticles();
    initViewer();
    if (!viewer) await ensureViewer();
    setupControls();
    setupNarrationControls();
    preload(['glucose', 'atp', 'adp', 'g6p', 'f6p', 'fbp', 'dhap', 'g3p']);
    await wait(800);
    transitionToScene(0, true);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

})();
