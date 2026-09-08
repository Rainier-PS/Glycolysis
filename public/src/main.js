(function () {
  'use strict';


  const MOLECULE_ASSETS = [
    { key: 'glucose', name: 'β-D-glucopyranose', formula: 'C₆H₁₂O₆', cid: 64689 },
    { key: 'glucose-6-phosphate', name: 'β-D-glucose 6-phosphate(2−)', formula: 'C₆H₁₁O₉P²⁻', cid: 21604865 },
    { key: 'fructose-6-phosphate', name: 'β-D-fructofuranose 6-phosphate(2−)', formula: 'C₆H₁₁O₉P²⁻', cid: 21604863 },
    { key: 'fructose-1-6-bisphosphate', name: 'D-fructose-1,6-bisphosphate', formula: 'C₆H₁₄O₁₂P₂', cid: 172313 },
    { key: 'dhap', name: 'Dihydroxyacetone phosphate', formula: 'C₃H₇O₆P', cid: 668 },
    { key: 'glyceraldehyde-3-phosphate', name: 'D-glyceraldehyde 3-phosphate(2−)', formula: 'C₃H₅O₆P²⁻', cid: 24794350 },
    { key: '1-3-bisphosphoglycerate', name: 'D-1,3-bisphosphoglycerate', formula: 'C₃H₆O₁₀P₂²⁻', cid: 44472828 },
    { key: '3-phosphoglycerate', name: '3-phosphoglycerate', formula: 'C₃H₇O₇P', cid: 724 },
    { key: '2-phosphoglycerate', name: '2-phosphoglycerate', formula: 'C₃H₇O₇P', cid: 59 },
    { key: 'phosphoenolpyruvate', name: 'Phosphoenolpyruvate', formula: 'C₃H₅O₆P', cid: 1005 },
    { key: 'pyruvate', name: 'Pyruvate(−)', formula: 'C₃H₃O₃⁻', cid: 107735 },
    { key: 'atp', name: 'ATP(4−)', formula: 'C₁₀H₁₂N₅O₁₃P₃⁴⁻', cid: 5461108 },
    { key: 'adp', name: 'ADP(3−)', formula: 'C₁₀H₁₂N₅O₁₀P₂³⁻', cid: 7058055 },
    { key: 'nad-plus', name: 'β-NAD⁺', formula: 'C₂₁H₂₇N₇O₁₄P₂⁺', cid: 925 },
    { key: 'nadh', name: 'NADH', formula: 'C₂₁H₂₉N₇O₁₄P₂', cid: 439153 }
  ];

  const PATHWAY_STEPS = [
    {
      step: 1,
      title: 'Phosphorylation',
      enzyme: 'Hexokinase',
      enzymeNote: 'EC 2.7.1.1',
      reaction: 'Glucose + ATP → Glucose-6-phosphate + ADP',
      reactionShort: ['Glucose + ATP', 'G6P + ADP'],
      type: 'Phosphoryl transfer',
      atpChange: -1, nadhChange: 0,
      molecules: { substrates: ['glucose', 'atp'], products: ['glucose-6-phosphate', 'adp'] },
      phase: 1,
      explanation: 'Hexokinase phosphorylates glucose at carbon 6 using ATP. The terminal phosphate of ATP is transferred to the hydroxyl group on C6, producing glucose-6-phosphate and ADP. This phosphorylation helps retain the sugar inside the cell and raises its free-energy state, preparing it for subsequent metabolic transformations.',
      whyItMatters: 'This is the first irreversible step and the entry point of glucose into the pathway. Phosphorylation effectively traps glucose within the cell, because phosphorylated sugars cannot cross the plasma membrane.',
      irreversibility: 'Effectively irreversible under cellular conditions.'
    },
    {
      step: 2,
      title: 'Isomerization',
      enzyme: 'Phosphoglucose isomerase',
      enzymeNote: 'EC 5.3.1.9',
      reaction: 'Glucose-6-phosphate ⇌ Fructose-6-phosphate',
      reactionShort: ['G6P', 'F6P'],
      type: 'Aldose-ketose isomerization',
      atpChange: 0, nadhChange: 0,
      molecules: { substrates: ['glucose-6-phosphate'], products: ['fructose-6-phosphate'] },
      phase: 1,
      explanation: 'Phosphoglucose isomerase converts glucose-6-phosphate, an aldose, into fructose-6-phosphate, a ketose. The carbonyl position shifts from C1 to C2 through ring opening and an open-chain intermediate. The phosphate remains at C6 throughout.',
      whyItMatters: 'This rearrangement is essential for the next phosphorylation at C1 and the eventual symmetrical cleavage into two three-carbon fragments.',
      irreversibility: 'Reversible under cellular conditions.'
    },
    {
      step: 3,
      title: 'Second Phosphorylation',
      enzyme: 'Phosphofructokinase-1 (PFK-1)',
      enzymeNote: 'EC 2.7.1.11',
      reaction: 'Fructose-6-phosphate + ATP → Fructose-1,6-bisphosphate + ADP',
      reactionShort: ['F6P + ATP', 'FBP + ADP'],
      type: 'Phosphoryl transfer',
      atpChange: -1, nadhChange: 0,
      molecules: { substrates: ['fructose-6-phosphate', 'atp'], products: ['fructose-1-6-bisphosphate', 'adp'] },
      phase: 1,
      explanation: 'PFK-1 transfers a second phosphate from ATP to carbon 1 of fructose-6-phosphate, producing fructose-1,6-bisphosphate. This is the major committed and rate-controlling step of glycolysis, subject to extensive allosteric regulation.',
      whyItMatters: 'PFK-1 is inhibited by high ATP and citrate, and activated by AMP, ADP, and fructose-2,6-bisphosphate. This makes it the primary control point for glycolytic flux.',
      irreversibility: 'Strongly irreversible — the committed step of glycolysis.'
    },
    {
      step: 4,
      title: 'Cleavage',
      enzyme: 'Aldolase',
      enzymeNote: 'EC 4.1.2.13',
      reaction: 'Fructose-1,6-bisphosphate ⇌ DHAP + G3P',
      reactionShort: ['FBP', 'DHAP + G3P'],
      type: 'Aldol cleavage',
      atpChange: 0, nadhChange: 0,
      molecules: { substrates: ['fructose-1-6-bisphosphate'], products: ['dhap', 'glyceraldehyde-3-phosphate'] },
      phase: 1,
      explanation: 'Aldolase cleaves the six-carbon fructose-1,6-bisphosphate into two three-carbon triose phosphates: dihydroxyacetone phosphate (DHAP) and glyceraldehyde-3-phosphate (G3P). The carbon–carbon bond between C3 and C4 is broken.',
      whyItMatters: 'This is the key cleavage step that converts a single six-carbon intermediate into two three-carbon molecules. However, only G3P can continue directly through the payoff phase.',
      irreversibility: 'Reversible under cellular conditions.'
    },
    {
      step: 5,
      title: 'Isomerization',
      enzyme: 'Triose phosphate isomerase',
      enzymeNote: 'EC 5.3.1.1',
      reaction: 'DHAP ⇌ G3P',
      reactionShort: ['DHAP', 'G3P'],
      type: 'Triose phosphate isomerization',
      atpChange: 0, nadhChange: 0,
      molecules: { substrates: ['dhap'], products: ['glyceraldehyde-3-phosphate'] },
      phase: 1,
      explanation: 'Triose phosphate isomerase converts DHAP into G3P so that both three-carbon fragments from the cleavage step can proceed through the same payoff pathway. After this step, two molecules of G3P are present per original glucose.',
      whyItMatters: 'This completes the energy investment phase. From this point, every downstream reaction occurs twice per glucose molecule.',
      irreversibility: 'Reversible under cellular conditions.'
    },
    {
      step: 6,
      title: 'Oxidation + Phosphorylation',
      enzyme: 'Glyceraldehyde-3-phosphate dehydrogenase',
      enzymeNote: 'EC 1.2.1.12',
      reaction: 'G3P + Pi + NAD⁺ ⇌ 1,3-BPG + NADH + H⁺',
      reactionShort: ['G3P + NAD⁺ + Pᵢ', '1,3-BPG + NADH'],
      type: 'Oxidation coupled to phosphorylation',
      atpChange: 0, nadhChange: 1,
      molecules: { substrates: ['glyceraldehyde-3-phosphate', 'nad-plus'], products: ['1-3-bisphosphoglycerate', 'nadh'] },
      phase: 2,
      explanation: 'G3P dehydrogenase oxidizes the aldehyde group of G3P. NAD⁺ accepts reducing equivalents and is reduced to NADH, while inorganic phosphate is incorporated into the substrate. The product, 1,3-bisphosphoglycerate, contains a high-energy acyl phosphate at C1.',
      whyItMatters: 'This is the oxidation step of glycolysis. Because two G3P molecules proceed per glucose, this step produces 2 NADH per glucose. The high-energy acyl phosphate drives ATP synthesis in the next step.',
      irreversibility: 'Reversible under cellular conditions.'
    },
    {
      step: 7,
      title: 'First Substrate-Level Phosphorylation',
      enzyme: 'Phosphoglycerate kinase',
      enzymeNote: 'EC 2.7.2.3',
      reaction: '1,3-BPG + ADP ⇌ 3-Phosphoglycerate + ATP',
      reactionShort: ['1,3-BPG + ADP', '3-PG + ATP'],
      type: 'Substrate-level phosphorylation',
      atpChange: 1, nadhChange: 0,
      molecules: { substrates: ['1-3-bisphosphoglycerate', 'adp'], products: ['3-phosphoglycerate', 'atp'] },
      phase: 2,
      explanation: 'Phosphoglycerate kinase transfers the high-energy acyl phosphate from C1 of 1,3-bisphosphoglycerate to ADP, producing ATP and 3-phosphoglycerate. This is substrate-level phosphorylation — direct transfer of a phosphoryl group to ADP without involvement of the electron transport chain.',
      whyItMatters: 'Two ATP are produced per glucose at this step, beginning to repay the ATP investment of the preparatory phase.',
      irreversibility: 'Reversible under cellular conditions.'
    },
    {
      step: 8,
      title: 'Phosphate Shift',
      enzyme: 'Phosphoglycerate mutase',
      enzymeNote: 'EC 5.4.2.11',
      reaction: '3-Phosphoglycerate ⇌ 2-Phosphoglycerate',
      reactionShort: ['3-PG', '2-PG'],
      type: 'Intramolecular phosphate transfer',
      atpChange: 0, nadhChange: 0,
      molecules: { substrates: ['3-phosphoglycerate'], products: ['2-phosphoglycerate'] },
      phase: 2,
      explanation: 'Phosphoglycerate mutase relocates the phosphate group from carbon 3 to carbon 2. No ATP is consumed or produced. The reaction proceeds through a 2,3-bisphosphoglycerate intermediate.',
      whyItMatters: 'Repositioning the phosphate prepares the molecule for dehydration in the next step, which will create a high-energy enol phosphate.',
      irreversibility: 'Reversible under cellular conditions.'
    },
    {
      step: 9,
      title: 'Dehydration',
      enzyme: 'Enolase',
      enzymeNote: 'EC 4.2.1.11',
      reaction: '2-Phosphoglycerate ⇌ PEP + H₂O',
      reactionShort: ['2-PG', 'PEP + H₂O'],
      type: 'Dehydration',
      atpChange: 0, nadhChange: 0,
      molecules: { substrates: ['2-phosphoglycerate'], products: ['phosphoenolpyruvate'] },
      phase: 2,
      explanation: 'Enolase catalyzes the removal of water from 2-phosphoglycerate, creating a carbon–carbon double bond. The product, phosphoenolpyruvate (PEP), contains an enol phosphate with exceptionally high phosphoryl-transfer potential.',
      whyItMatters: 'Dehydration redistributes energy within the molecule, converting a relatively low-energy phosphate ester into a high-energy enol phosphate capable of driving ATP synthesis.',
      irreversibility: 'Reversible under cellular conditions. Requires Mg²⁺.'
    },
    {
      step: 10,
      title: 'Second Substrate-Level Phosphorylation',
      enzyme: 'Pyruvate kinase',
      enzymeNote: 'EC 2.7.1.40',
      reaction: 'PEP + ADP → Pyruvate + ATP',
      reactionShort: ['PEP + ADP', 'Pyruvate + ATP'],
      type: 'Substrate-level phosphorylation',
      atpChange: 1, nadhChange: 0,
      molecules: { substrates: ['phosphoenolpyruvate', 'adp'], products: ['pyruvate', 'atp'] },
      phase: 2,
      explanation: 'Pyruvate kinase transfers the phosphoryl group from PEP to ADP, producing ATP. The resulting enol form of pyruvate spontaneously tautomerizes to the more stable keto form, helping drive the reaction forward. Two pyruvate molecules are produced per glucose.',
      whyItMatters: 'This is the final ATP-producing step. Two ATP are generated per glucose. The tautomerization of enol pyruvate to keto pyruvate provides a thermodynamic pull that makes this step effectively irreversible.',
      irreversibility: 'Strongly irreversible under cellular conditions.'
    }
  ];

  const NET_EQUATION = 'Glucose + 2 NAD⁺ + 2 ADP + 2 Pᵢ → 2 Pyruvate + 2 NADH + 2 H⁺ + 2 ATP + 2 H₂O';

  const MolViewer = {
    viewers: {},
    sdfCache: {},
    reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,

    init() {
      if (this.reducedMotion) {
        document.body.classList.add('reduced-motion');
      }
    },

    async loadSDF(key) {
      if (this.sdfCache[key]) return this.sdfCache[key];
      try {
        const resp = await fetch(`molecules/${key}/${key}.sdf`);
        if (!resp.ok) throw new Error(`SDF not found: ${key}`);
        const text = await resp.text();
        this.sdfCache[key] = text;
        return text;
      } catch (e) {
        console.error(`Failed to load SDF for ${key}:`, e);
        return null;
      }
    },

    create(containerId) {
      const container = document.getElementById(containerId);
      if (!container) return null;
      if (this.viewers[containerId]) return this.viewers[containerId];
      if (typeof $3Dmol === 'undefined') {
        console.error('3Dmol.js not loaded');
        container.innerHTML = '<div class="mol-error" role="alert"><p>Molecular renderer unavailable. 3Dmol.js failed to load.</p></div>';
        return null;
      }

      const viewer = $3Dmol.createViewer(container, {
        backgroundColor: 0x090B0F,
        antialias: true,
        disableFog: true
      });

      const state = {
        viewer,
        container,
        currentMolecule: null,
        showHydrogens: false,
        autoRotate: !this.reducedMotion,
        sdfLoaded: false
      };

      this.viewers[containerId] = state;
      return state;
    },

    applyStyle(state) {
      const v = state.viewer;
      v.setStyle({ elem: 'C' }, {
        sphere: { scale: 0.28, colorscheme: 'Jmol' },
        stick: { radius: 0.07, colorscheme: 'Jmol' }
      });
      v.setStyle({ elem: 'O' }, {
        sphere: { scale: 0.32, colorscheme: 'Jmol' },
        stick: { radius: 0.07, colorscheme: 'Jmol' }
      });
      v.setStyle({ elem: 'N' }, {
        sphere: { scale: 0.30, colorscheme: 'Jmol' },
        stick: { radius: 0.07, colorscheme: 'Jmol' }
      });
      v.setStyle({ elem: 'P' }, {
        sphere: { scale: 0.36, colorscheme: 'Jmol' },
        stick: { radius: 0.08, colorscheme: 'Jmol' }
      });
      if (state.showHydrogens) {
        v.setStyle({ elem: 'H' }, {
          sphere: { scale: 0.22, colorscheme: 'Jmol' }
        });
      } else {
        v.setStyle({ elem: 'H' }, { hidden: true });
      }
    },

    async display(containerId, moleculeKey) {
      const state = this.viewers[containerId];
      if (!state) return false;

      const sdf = await this.loadSDF(moleculeKey);
      if (!sdf) {
        state.container.innerHTML = `
          <div class="mol-error" role="alert">
            <p style="font-size:14px;font-weight:500">Molecular structure unavailable</p>
            <p style="font-size:13px;margin-top:4px">Could not load ${moleculeKey}</p>
          </div>`;
        return false;
      }

      state.viewer.removeAllModels();
      state.viewer.addModel(sdf, 'sdf');
      this.applyStyle(state);
      state.viewer.zoomTo();
      state.viewer.zoom(0.92);
      state.viewer.render();

      if (state.autoRotate && !this.reducedMotion) {
        state.viewer.spin('y', 0.25);
      } else {
        state.viewer.spin(false);
      }

      state.currentMolecule = moleculeKey;
      state.sdfLoaded = true;
      return true;
    },

    toggleHydrogens(containerId) {
      const state = this.viewers[containerId];
      if (!state || !state.sdfLoaded) return;
      state.showHydrogens = !state.showHydrogens;
      this.applyStyle(state);
      state.viewer.render();
      return state.showHydrogens;
    },

    toggleAutoRotate(containerId) {
      const state = this.viewers[containerId];
      if (!state) return;
      state.autoRotate = !state.autoRotate;
      if (state.autoRotate) {
        state.viewer.spin('y', 0.25);
      } else {
        state.viewer.spin(false);
      }
      return state.autoRotate;
    },

    resetView(containerId) {
      const state = this.viewers[containerId];
      if (!state || !state.sdfLoaded) return;
      state.viewer.spin(false);
      state.viewer.zoomTo();
      state.viewer.zoom(0.92);
      state.viewer.render();
      if (state.autoRotate) {
        state.viewer.spin('y', 0.25);
      }
    },

    pauseRotation(containerId) {
      const state = this.viewers[containerId];
      if (state) state.viewer.spin(false);
    },

    resumeRotation(containerId) {
      const state = this.viewers[containerId];
      if (state && state.autoRotate) state.viewer.spin('y', 0.25);
    }
  };


  const App = {
    activeReaction: 0,
    pathwayObserver: null,
    scrollAnimations: [],

    init() {
      MolViewer.init();
      this.buildPathwayNav();
      this.setupScrollAnimations();
      this.setupIntersectionObservers();
      this.setupKeyboardNav();
      this.buildReactionScenes();
      this.buildEnergyAccounting();
      this.initStandaloneViewers();
    },

    setupScrollAnimations() {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

      document.querySelectorAll('.fade-in, .fade-in-left, .fade-in-right').forEach(el => {
        observer.observe(el);
      });
    },

    buildReactionScenes() {
      const container = document.getElementById('reactionScenes');
      if (!container) return;

      PATHWAY_STEPS.forEach((step, i) => {
        const isPhase1 = step.phase === 1;
        const prevPhase = i > 0 ? PATHWAY_STEPS[i - 1].phase : 0;
      const showPhaseDivider = i > 0 && step.phase !== prevPhase;

        if (showPhaseDivider) {
          const divider = document.createElement('div');
          divider.className = 'phase-divider';
          divider.innerHTML = `
            <div class="center-layout fade-in">
              <div class="phase-label">Phase ${step.phase === 2 ? 'II' : 'I'}</div>
              <div class="phase-title">${step.phase === 2 ? 'Energy Payoff' : 'Energy Investment'}</div>
              <div class="phase-subtitle">${step.phase === 2
                ? 'Four ATP are produced. Two NADH are formed. The investment is repaid with interest.'
                : 'Two ATP are consumed to activate glucose and prepare it for cleavage.'}</div>
            </div>`;
          container.appendChild(divider);
        }

        const scene = document.createElement('section');
        scene.className = 'reaction-scene';
        scene.id = `reaction-${i}`;
        scene.dataset.reactionIndex = i;
        scene.setAttribute('aria-labelledby', `rxn-title-${i}`);

        const molecules = this.getMoleculeDescription(step);

        scene.innerHTML = `
          <div class="reaction-info-side" style="max-width:800px;margin:0 auto;padding:120px 40px">
            <div class="reaction-step-num fade-in">Step ${String(step.step).padStart(2, '0')} / 10</div>
            <div class="reaction-type-badge fade-in">${step.type}</div>
            <h2 class="reaction-title fade-in" id="rxn-title-${i}">${step.title}</h2>
            <div class="reaction-enzyme fade-in">
              <strong>${step.enzyme}</strong><br>
              <span style="font-size:12px;color:var(--text-muted)">${step.enzymeNote}</span>
            </div>
            <div class="reaction-equation fade-in" aria-label="Reaction equation">
              ${step.reaction}
            </div>
            <div class="reaction-explanation fade-in">${step.explanation}</div>
            <div class="reaction-why fade-in">
              <strong>Why it matters:</strong> ${step.whyItMatters}
            </div>
            ${step.irreversibility ? `<div class="reaction-why fade-in" style="margin-top:8px"><strong>Reversibility:</strong> ${step.irreversibility}</div>` : ''}
            <div class="reaction-energy fade-in">
              ${step.atpChange !== 0 ? `<div class="reaction-energy-item">ATP: <span class="value">${step.atpChange > 0 ? '+' : ''}${step.atpChange}</span></div>` : ''}
              ${step.nadhChange !== 0 ? `<div class="reaction-energy-item">NADH: <span class="value">+${step.nadhChange}</span></div>` : ''}
            </div>
            <div class="sr-only" aria-live="polite">
              Step ${step.step}: ${step.enzyme}. ${step.reaction}. ${step.explanation}
            </div>
          </div>`;

        container.appendChild(scene);
      });
    },

    getMoleculeDescription(step) {
      const sub = step.molecules.substrates.map(k => MOLECULE_ASSETS.find(a => a.key === k)?.name || k);
      const prod = step.molecules.products.map(k => MOLECULE_ASSETS.find(a => a.key === k)?.name || k);
      return { substrates: sub, products: prod };
    },

    setupKeyboardNav() {
      document.addEventListener('keydown', (e) => {
        const nav = document.getElementById('pathwayNav');
        if (nav && nav.classList.contains('visible')) {
          if (e.key === 'ArrowDown' || e.key === 'j') {
            e.preventDefault();
            const next = Math.min(this.activeReaction + 1, PATHWAY_STEPS.length - 1);
            this.scrollToReaction(next);
          } else if (e.key === 'ArrowUp' || e.key === 'k') {
            e.preventDefault();
            const prev = Math.max(this.activeReaction - 1, 0);
            this.scrollToReaction(prev);
          }
        }
      });
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => App.init());
  } else {
    App.init();
  }

  window.GlycolysisApp = App;
  window.MolViewer = MolViewer;

})();
