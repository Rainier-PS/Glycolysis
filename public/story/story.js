(function () {
  'use strict';

  var BG = 0x090B0F;
  var PREFERS_REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var IS_MOBILE = window.innerWidth <= 768 || /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

  var sceneToken = 0;
  var narrationSeqToken = 0;
  var firstSceneReady = false;
  var currentSceneIndex = -1;
  var transitioning = false;
  var countdownTimer = null;
  var countdownValue = 0;
  var onCountdownFire = null;
  var autoAdvanceActive = true;
  var rotating = !IS_MOBILE;
  var hydrogens = false;
  var currentMolKey = null;
  var narrationEnabled = true;
  var narrationVolume = .8;
  var currentUtterance = null;
  var molTransitionSeq = 0;
  var storyPaused = false;
  var pauseStart = 0;

  var quizAnswers = {};
  var quizLocked = {};
  var quizScore = 0;
  var quizCompleted = 0;
  var quizActive = false;

  var QUESTIONS = window.GLYCOLYSIS_QUESTIONS || [];

  function wait(ms) {
    return new Promise(function (resolve) {
      var remaining = ms;
      var lastTime = Date.now();
      var timer = null;
      function check() {
        var now = Date.now();
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
    var ls = document.getElementById('loadingScreen');
    if (ls) {
      ls.classList.add('hidden');
      setTimeout(function () {
        ls.remove();
      }, 900);
    }
    showUI(['navControls', 'narrationControls']);
  }

  var MOL = {
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

  var sdfCache = {};
  var sdfLoading = {};
  var sdfFailed = {};

  function loadSDF(key) {
    if (sdfCache[key]) return Promise.resolve(sdfCache[key]);
    if (sdfLoading[key]) return sdfLoading[key];
    var mol = MOL[key];
    if (!mol) return Promise.resolve(null);
    var p = fetch(mol.path)
      .then(function (r) {
        if (!r.ok) throw new Error(r.status);
        return r.text();
      })
      .then(function (t) {
        sdfCache[key] = t;
        delete sdfLoading[key];
        return t;
      })
      .catch(function () {
        delete sdfLoading[key];
        sdfFailed[key] = true;
        return null;
      });
    sdfLoading[key] = p;
    return p;
  }

  function preload(keys) {
    keys.forEach(function (k) {
      if (!sdfCache[k] && !sdfLoading[k] && !sdfFailed[k]) loadSDF(k);
    });
  }

  function cap(text, duration, deep) {
    return { text: text, duration: duration || 3000, deep: deep || null };
  }

  var scenes = [
    {
      id: 'cell',
      phase: 'intro',
      molecule: null,
      camera: null,
      captions: [
        cap('Every living cell needs a continuous supply of usable energy.', 4500, 'Cells perform thousands of chemical reactions that require energy. Without a constant supply, cellular function would cease.')
      ],
      enzyme: null,
      reaction: null,
      accounting: null,
      preloads: ['glucose', 'atp'],
      atmosphere: 'cell',
      autoAdvanceDelay: 5000,
      quiz: null
    },
    {
      id: 'cytosol',
      phase: 'intro',
      molecule: null,
      camera: null,
      captions: [
        cap('Glycolysis takes place in the cytosol, the fluid portion of the cell outside the organelles.', 5000, 'The cytosol is where all ten reactions of glycolysis occur.'),
        cap('Glycolysis is a ten-reaction pathway that breaks down glucose and captures some of its chemical energy.', 5500, 'The pathway converts one six-carbon glucose molecule into two three-carbon pyruvate molecules.')
      ],
      enzyme: null,
      reaction: null,
      accounting: null,
      atmosphere: 'cytosol',
      autoAdvanceDelay: 5000,
      quiz: null
    },
    {
      id: 'glucose',
      phase: 'intro',
      molecule: 'glucose',
      camera: { zoom: .85, speed: .25 },
      captions: [
        cap('This is glucose. A six-carbon sugar and an important fuel molecule for cells.', 5000, 'The structure shown is \u03B2-D-glucopyranose, a cyclic form of glucose. Glucose is one of the most important energy sources for living cells.'),
        cap('ATP is a molecule cells use to transfer usable chemical energy.', 4500, 'ATP stands for adenosine triphosphate. It has three phosphate groups. Cells use ATP to drive reactions that would otherwise be energetically unfavorable.')
      ],
      enzyme: null,
      reaction: null,
      accounting: null,
      preloads: ['g6p', 'adp', 'fbp'],
      atmosphere: null,
      autoAdvanceDelay: 5000,
      quiz: QUESTIONS[0] ? QUESTIONS[0].id : null
    },
    {
      id: 'investment',
      phase: 'investment',
      molecule: 'g6p',
      camera: { zoom: .82, speed: .15 },
      captions: [
        cap('Early in glycolysis, the cell uses ATP to add phosphate groups to the glucose pathway.', 5500, 'ATP donates a phosphoryl group to glucose. This is catalyzed by hexokinase. The phosphate helps prepare the molecule for the steps that follow.'),
        cap('Glucose becomes glucose-6-phosphate. Then it is rearranged and phosphorylated again, using a second ATP.', 6000, 'The six-carbon molecule is rearranged into fructose-6-phosphate, then receives another phosphate group to become fructose-1,6-bisphosphate. Two ATP have now been invested.')
      ],
      enzyme: null,
      reaction: null,
      accounting: null,
      preloads: ['f6p', 'dhap', 'g3p'],
      atmosphere: null,
      autoAdvanceDelay: 5000,
      quiz: QUESTIONS[1] ? QUESTIONS[1].id : null
    },
    {
      id: 'split',
      phase: 'investment',
      molecule: 'fbp',
      camera: { zoom: .7, speed: .1 },
      captions: [
        cap('The six-carbon molecule splits into two three-carbon molecules.', 4500, 'Fructose-1,6-bisphosphate is cleaved into two three-carbon fragments: DHAP and glyceraldehyde-3-phosphate (G3P).'),
        cap('DHAP is converted into G3P, leaving two G3P molecules to continue through the pathway.', 5000, 'From this point onward, the reactions of glycolysis happen twice for every original glucose molecule. This is critical for understanding why later outputs are doubled.')
      ],
      enzyme: null,
      reaction: null,
      accounting: null,
      preloads: ['nad', 'nadh', 'bpg13'],
      atmosphere: null,
      autoAdvanceDelay: 5000,
      quiz: QUESTIONS[2] ? QUESTIONS[2].id : null
    },
    {
      id: 'nad-phase',
      phase: 'payoff',
      molecule: 'g3p',
      camera: { zoom: .85, speed: .15 },
      captions: [
        cap('The three-carbon molecule is processed in a reaction that transfers energy-rich electrons to NAD+.', 5500, 'NAD+ accepts electrons and is reduced to NADH. NADH is the reduced form of NAD+ and carries high-energy electrons that can be used in later cellular processes.'),
        cap('Because there are two G3P molecules, two NAD+ become two NADH.', 4000, 'Each G3P donates electrons to one NAD+ molecule. Two G3P per glucose means two NADH produced.')
      ],
      enzyme: null,
      reaction: null,
      accounting: null,
      preloads: ['pg3', 'pg2', 'pep', 'pyruvate'],
      atmosphere: null,
      autoAdvanceDelay: 5000,
      quiz: QUESTIONS[3] ? QUESTIONS[3].id : null
    },
    {
      id: 'payoff',
      phase: 'payoff',
      molecule: 'bpg13',
      camera: { zoom: .85, speed: .15 },
      captions: [
        cap('Later reactions transfer phosphate groups to ADP, forming ATP.', 5000, 'Substrate-level phosphorylation: phosphate groups are transferred directly from metabolic intermediates to ADP, producing ATP.'),
        cap('Because there are two three-carbon pathways, ATP generation happens twice. Four ATP are produced during the payoff phase.', 6000, 'Two ATP were invested at the beginning. Four ATP are produced now. The net gain is two ATP per glucose.')
      ],
      enzyme: null,
      reaction: null,
      accounting: null,
      atmosphere: null,
      autoAdvanceDelay: 5000,
      quiz: QUESTIONS[4] ? QUESTIONS[4].id : null
    },
    {
      id: 'pyruvate',
      phase: 'accounting',
      molecule: 'pyruvate',
      camera: { zoom: .88, speed: .15 },
      captions: [
        cap('After the remaining rearrangements and energy-capturing reactions, each three-carbon pathway ends as pyruvate.', 5500, 'One glucose produces two pyruvate molecules. The carbon skeleton is conserved: a six-carbon glucose becomes two three-carbon pyruvate molecules.')
      ],
      enzyme: null,
      reaction: null,
      accounting: null,
      atmosphere: null,
      autoAdvanceDelay: 5000,
      quiz: null
    },
    {
      id: 'accounting',
      phase: 'accounting',
      molecule: null,
      camera: null,
      captions: [
        cap('For every glucose molecule that enters glycolysis, the pathway produces two pyruvate, two NADH, and a net gain of two ATP.', 6500, 'ATP invested: 2. ATP produced: 4. Net ATP: +2. NADH produced: +2. Pyruvate produced: 2.')
      ],
      enzyme: null,
      reaction: null,
      accounting: { invested: 2, produced: 4, nadh: 2, showNet: true },
      atmosphere: null,
      autoAdvanceDelay: 5000,
      showEquation: true,
      quiz: null
    },
    {
      id: 'finale',
      phase: 'finale',
      molecule: null,
      camera: null,
      captions: [
        cap('Glycolysis is only one part of cellular metabolism.', 3500),
        cap('But in just ten reactions, a cell has transformed one six-carbon glucose molecule into two three-carbon pyruvate molecules while capturing energy as ATP and NADH.', 7000),
        cap('Pyruvate and NADH can participate in later metabolic processes.', 4000)
      ],
      enzyme: null,
      reaction: null,
      accounting: null,
      atmosphere: 'cytosol',
      fadeToBlack: true,
      autoAdvanceDelay: 6000,
      quiz: null
    }
  ];

  var atmosphereCanvas = document.getElementById('atmosphere');
  var actx = atmosphereCanvas.getContext('2d');
  var atmosphereState = null, atmosphereAlpha = 0, atmosphereTargetAlpha = 0, particles = [], atmosphereAnimating = false;
  var atmosphereWidth = 0, atmosphereHeight = 0;

  function resizeAtmosphere() {
    var width = window.innerWidth;
    var height = window.innerHeight;
    if (width === atmosphereWidth && height === atmosphereHeight) return;
    atmosphereWidth = width;
    atmosphereHeight = height;
    atmosphereCanvas.width = width;
    atmosphereCanvas.height = height;
  }

  function initParticles() {
    particles = [];
    var c = PREFERS_REDUCED ? 10 : (IS_MOBILE ? 15 : 45);
    for (var i = 0; i < c; i++)
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
    var w = atmosphereCanvas.width, h = atmosphereCanvas.height;
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
    var cx = w / 2, cy = h / 2, cellR = Math.min(w, h) * .35;
    var zoom = 1;
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
    ].forEach(function (m) {
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

    var t = (time || 0) * .001;
    particles.forEach(function (p) {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0) p.x = w;
      if (p.x > w) p.x = 0;
      if (p.y < 0) p.y = h;
      if (p.y > h) p.y = 0;
      actx.fillStyle = 'rgba(180,210,240,' + (p.alpha * (.5 + .5 * Math.sin(t + p.pulse))) + ')';
      actx.beginPath();
      actx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      actx.fill();
    });
    actx.restore();
    if (atmosphereAnimating) requestAnimationFrame(drawAtmosphere);
  }

  function startAtmosphereAnimation() {
    if (!atmosphereAnimating) {
      atmosphereAnimating = true;
      requestAnimationFrame(drawAtmosphere);
    }
  }

  var viewer = null;

  function initViewer() {
    try {
      viewer = $3Dmol.createViewer('molViewer', { backgroundColor: BG, antialias: !IS_MOBILE, disableFog: true });
    } catch (e) {
      viewer = null;
    }
  }

  function ensureViewer() {
    if (viewer) return Promise.resolve(viewer);
    var delays = [200, 400, 800];
    var attempt = 0;
    return new Promise(function (resolve) {
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
    var retryDiv = document.createElement('div');
    retryDiv.id = 'viewerRetryOverlay';
    retryDiv.setAttribute('role', 'alert');
    retryDiv.setAttribute('aria-label', '3D viewer failed to load');
    retryDiv.innerHTML = '<div style="position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;background:rgba(9,11,15,.95)"><div style="text-align:center;color:#c8cdd0;font-family:var(--display,Space Grotesk,sans-serif)"><p style="font-size:16px;margin-bottom:12px">The 3D molecular viewer could not initialize.</p><button id="viewerRetryBtn" style="padding:10px 24px;border:1px solid rgba(200,205,208,.25);border-radius:6px;background:rgba(200,205,208,.08);color:#c8cdd0;font-size:13px;font-family:inherit;cursor:pointer">RETRY</button></div></div>';
    document.body.appendChild(retryDiv);
    document.getElementById('viewerRetryBtn').addEventListener('click', function () {
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

  var molFade = document.getElementById('molFade');
  var molFallback = document.getElementById('molFallback');
  var molFallbackText = document.getElementById('molFallbackText');

  function showMolecule(key) {
    if (!viewer) return ensureViewer().then(function () { return showMolecule(key); });
    return new Promise(function (resolve) {
      if (!viewer || currentMolKey === key) {
        resolve();
        return;
      }
      var mol = MOL[key];
      if (!mol) {
        resolve();
        return;
      }
      var myMolSeq = ++molTransitionSeq;
      var afterLoad = function (text) {
        if (myMolSeq !== molTransitionSeq) {
          resolve();
          return;
        }
        document.getElementById('loadingIndicator').classList.remove('visible');
        if (text) {
          try {
            if (myMolSeq !== molTransitionSeq) { resolve(); return; }
            molFade.style.opacity = '1';
            if (myMolSeq !== molTransitionSeq) { molFade.style.opacity = '0'; resolve(); return; }
            viewer.removeAllModels();
            if (myMolSeq !== molTransitionSeq) { molFade.style.opacity = '0'; resolve(); return; }
            viewer.addModel(text, 'sdf');
            if (myMolSeq !== molTransitionSeq) { molFade.style.opacity = '0'; resolve(); return; }
            applyStyle();
            viewer.zoomTo();
            viewer.zoom(.92);
            viewer.render();
            setTimeout(function () {
              if (myMolSeq !== molTransitionSeq) return;
              molFade.style.opacity = '0';
              if (rotating) try { viewer.spin('y', .25); } catch (e) {}
              currentMolKey = key;
              el.molFallback.classList.remove('show');
              updateMolAria(key);
            }, PREFERS_REDUCED ? 10 : 300);
          } catch (e) {
            if (myMolSeq !== molTransitionSeq) { resolve(); return; }
            molFade.style.opacity = '0';
            showMolFallback(mol);
            currentMolKey = key;
            updateMolAria(key);
          }
        } else {
          if (myMolSeq !== molTransitionSeq) { resolve(); return; }
          molFade.style.opacity = '0';
          showMolFallback(mol);
          currentMolKey = key;
          updateMolAria(key);
        }
        resolve();
      };
      var sdfText = sdfCache[key];
      if (!sdfText) {
        document.getElementById('loadingIndicator').classList.add('visible');
        loadSDF(key).then(afterLoad);
        return;
      }
      afterLoad(sdfText);
    });
  }

  function updateMolAria(key) {
    var d = el.srMolDesc;
    if (!d) return;
    if (!key || !MOL[key]) {
      d.textContent = '';
      return;
    }
    var m = MOL[key];
    d.textContent = m.name + '. ' + m.formula + '. ' + (m.desc || '') + ' 3D molecular visualization. ' + (m.cid ? 'PubChem CID ' + m.cid + '.' : '');
  }

  function showMolFallback(mol) {
    molFallbackText.textContent = '';
    var nameDiv = document.createElement('div');
    nameDiv.className = 'fb-name';
    nameDiv.textContent = mol.name;
    molFallbackText.appendChild(nameDiv);
    var formulaDiv = document.createElement('div');
    formulaDiv.textContent = mol.formula;
    molFallbackText.appendChild(formulaDiv);
    if (mol.desc) {
      var descDiv = document.createElement('div');
      descDiv.style.marginTop = '8px';
      descDiv.style.fontSize = '12px';
      descDiv.textContent = mol.desc + ' Molecular structure unavailable. Reaction information remains available.';
      molFallbackText.appendChild(descDiv);
    }
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

  var el = {};
  [
    'viewport', 'atmosphere', 'caption', 'captionText', 'sceneControls', 'countdownText', 'navRow',
    'stepCounter', 'sceneLabel', 'molLabel', 'molLabelName', 'molLabelFormula',
    'enzymeLabel', 'enzymeName', 'enzymeReaction', 'accounting', 'legend',
    'fadeOverlay', 'loadingIndicator', 'srLive', 'btnPrev', 'btnNext', 'btnStay', 'btnPause',
    'btnRotate', 'btnHydrogen', 'btnReset', 'viewerToolbar',
    'navControls', 'narrationControls', 'btnNarration', 'btnHome', 'btnRestart', 'mobileToolsToggle', 'deepDetail', 'deepDetailText', 'overallEquation', 'molFallback', 'srMolDesc',
    'quizOverlay', 'quizContainer', 'quizQuestionText', 'quizOptions', 'quizFeedback', 'quizFeedbackText',
    'quizContinue', 'quizProgress', 'quizProgressText',
    'resultsOverlay', 'resultsScore', 'resultsPercentage', 'resultsReview', 'resultsStoryBtn', 'resultsQuestionsBtn', 'resultsEmailBtn', 'emailOverlay', 'emailForm', 'emailTeacherName', 'emailTeacherEmail', 'emailStudentName', 'emailSend', 'emailCancel', 'emailNote', 'emailError'
  ].forEach(function (id) {
    el[id] = document.getElementById(id);
  });

  function showUI(ids) {
    ids.forEach(function (id) {
      if (el[id]) el[id].classList.add('visible');
    });
  }

  function hideUI(ids) {
    ids.forEach(function (id) {
      if (el[id]) el[id].classList.remove('visible');
    });
  }

  function pickNarratorVoice() {
    if (!('speechSynthesis' in window)) return null;
    var v = speechSynthesis.getVoices();
    var p = ['Google UK English Female', 'Google UK English Male', 'Samantha', 'Karen', 'Daniel', 'Microsoft Zira', 'Microsoft David'];
    for (var i = 0; i < p.length; i++) {
      var x = v.find(function (w) { return w.name.includes(p[i]); });
      if (x) return x;
    }
    return v.find(function (w) { return w.lang.startsWith('en'); }) || null;
  }

  var cachedVoice = null;

  function getNarratorVoice() {
    if (!cachedVoice) cachedVoice = pickNarratorVoice();
    return cachedVoice;
  }

  if ('speechSynthesis' in window) {
    speechSynthesis.onvoiceschanged = function () {
      cachedVoice = pickNarratorVoice();
    };
    speechSynthesis.getVoices();
  }

  var isNarratingSpeech = false;

  function speakNarration(text, onEnd, seq) {
    if (!('speechSynthesis' in window) || !narrationEnabled) {
      isNarratingSpeech = false;
      if (onEnd) onEnd();
      return;
    }
    if (currentUtterance) {
      try { speechSynthesis.cancel(); } catch (e) {}
    }
    var u = new SpeechSynthesisUtterance(text);
    var voice = getNarratorVoice();
    if (voice) u.voice = voice;
    u.rate = .88;
    u.pitch = 1.0;
    u.volume = narrationVolume;
    u.lang = 'en-US';
    currentUtterance = u;
    isNarratingSpeech = true;
    u.onend = function () {
      currentUtterance = null;
      isNarratingSpeech = false;
      if (seq === narrationSeqToken && !storyPaused && onEnd) onEnd();
    };
    u.onerror = function () {
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
      try { speechSynthesis.cancel(); } catch (e) {}
      currentUtterance = null;
      isNarratingSpeech = false;
    }
    narrationSeqToken++;
  }

  function setupNarrationControls() {
    el.btnNarration.addEventListener('click', function () {
      narrationEnabled = !narrationEnabled;
      el.btnNarration.setAttribute('aria-pressed', String(narrationEnabled));
      el.btnNarration.classList.toggle('active', narrationEnabled);
      el.btnNarration.textContent = narrationEnabled ? 'NARRATION' : 'NARRATION OFF';
      if (!narrationEnabled) {
        stopNarration();
      } else if (!storyPaused && !captionsComplete && currentCaptionIndex >= 0 && activeCaptions && activeCaptions[currentCaptionIndex]) {
        var c = activeCaptions[currentCaptionIndex];
        var seq = ++narrationSeqToken;
        speakNarration(c.text, function () {
          if (seq !== narrationSeqToken || storyPaused) return;
          el.captionText.classList.remove('show');
          if (el.deepDetail) el.deepDetail.classList.remove('show');
          captionTimer = setTimeout(function () {
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

  var activeCaptions = [];
  var currentCaptionIndex = -1;
  var captionsComplete = false;
  var captionTimer = null;

  function clearCaptions() {
    if (captionTimer) {
      clearTimeout(captionTimer);
      captionTimer = null;
    }
    activeCaptions = [];
    currentCaptionIndex = -1;
    captionsComplete = false;
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
    var currentCaptionSeq = seq;
    var currentCaptionOnDone = onDone;
    if (!activeCaptions || activeCaptions.length === 0) {
      captionsComplete = true;
      if (onDone) onDone();
      return;
    }
    showCaptionAtIndex(0);

    function showCaptionAtIndex(idx) {
      if (currentCaptionSeq !== narrationSeqToken || sceneToken !== parseInt(el.stepCounter.dataset.token || '0')) return;
      if (idx >= activeCaptions.length) {
        captionsComplete = true;
        if (el.deepDetail) el.deepDetail.classList.remove('show');
        if (currentCaptionOnDone) currentCaptionOnDone();
        return;
      }
      currentCaptionIndex = idx;
      var c = activeCaptions[idx];
      el.captionText.textContent = c.text;
      el.captionText.classList.add('show');
      if (el.srLive) el.srLive.textContent = c.text;
      if (c.deep) {
        el.deepDetailText.textContent = c.deep;
        el.deepDetail.classList.add('show');
      } else if (el.deepDetail) {
        el.deepDetail.classList.remove('show');
      }

      var dur = (c.duration || 3500) + 350;

      if (storyPaused) return;

      var useSpeech = narrationEnabled && 'speechSynthesis' in window;
      if (useSpeech) {
        speakNarration(c.text, function () {
          if (currentCaptionSeq !== narrationSeqToken || sceneToken !== parseInt(el.stepCounter.dataset.token || '0')) return;
          if (storyPaused) return;
          el.captionText.classList.remove('show');
          if (el.deepDetail) el.deepDetail.classList.remove('show');
          captionTimer = setTimeout(function () {
            captionTimer = null;
            if (storyPaused || currentCaptionSeq !== narrationSeqToken) return;
            showCaptionAtIndex(idx + 1);
          }, 400);
        }, currentCaptionSeq);
      } else {
        captionTimer = setTimeout(function () {
          captionTimer = null;
          if (currentCaptionSeq !== narrationSeqToken || sceneToken !== parseInt(el.stepCounter.dataset.token || '0')) return;
          if (storyPaused) return;
          el.captionText.classList.remove('show');
          if (el.deepDetail) el.deepDetail.classList.remove('show');
          captionTimer = setTimeout(function () {
            captionTimer = null;
            if (storyPaused || currentCaptionSeq !== narrationSeqToken) return;
            showCaptionAtIndex(idx + 1);
          }, 300);
        }, dur);
      }
    }

    window._showCaptionAtIndex = showCaptionAtIndex;
  }

  function showAccounting(acc) {
    if (!acc) {
      el.accounting.classList.remove('visible');
      el.accounting.textContent = '';
      return;
    }
    el.accounting.textContent = '';
    var net = acc.produced - acc.invested;
    var section = document.createElement('div');
    section.className = 'acc-section';
    section.textContent = 'Pathway total';
    el.accounting.appendChild(section);

    var items = [
      { label: 'ATP invested', value: '\u2212' + acc.invested, cls: 'negative' },
      { label: 'ATP produced', value: '+' + acc.produced, cls: 'positive' }
    ];
    if (acc.showNet) items.push({ label: 'Net ATP', value: (net >= 0 ? '+' : '') + net, cls: net >= 0 ? 'positive' : 'negative' });
    items.push({ label: 'NADH', value: '+' + acc.nadh, cls: 'positive' });

    items.forEach(function (item) {
      var div = document.createElement('div');
      div.className = 'acc-item';
      var labelSpan = document.createElement('span');
      labelSpan.textContent = item.label;
      var valSpan = document.createElement('span');
      valSpan.className = 'acc-val ' + item.cls;
      valSpan.textContent = item.value;
      div.appendChild(labelSpan);
      div.appendChild(valSpan);
      el.accounting.appendChild(div);
    });

    el.accounting.classList.add('visible');
  }

  function showOverallEquation() {
    el.overallEquation.textContent = '';
    el.overallEquation.textContent = 'Glucose + 2 NAD\u207A + 2 ADP + 2 P\u1D62 \u2192 2 Pyruvate + 2 NADH + 2 ATP + 2 H\u207A + 2 H\u2082O';
    var note = document.createElement('span');
    note.className = 'eq-note';
    note.textContent = 'Exact proton and water terms vary between biochemical conventions. The key net products are 2 pyruvate, 2 ATP, and 2 NADH per glucose.';
    el.overallEquation.appendChild(note);
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
        var vp = el.viewport;
        vp.style.transition = 'transform ' + (PREFERS_REDUCED ? .01 : 1.8) + 's var(--ease-in-out)';
        vp.style.transform = 'scale(' + config.zoom + ')';
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
    var s = Math.ceil(delay / 1000);
    countdownValue = s;
    onCountdownFire = onFire;
    el.countdownText.textContent = 'NEXT SCENE IN ' + countdownValue;
    countdownTimer = setInterval(function () {
      countdownValue--;
      if (countdownValue <= 0) {
        cancelCountdown();
        onFire();
      } else {
        el.countdownText.textContent = 'NEXT SCENE IN ' + countdownValue;
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
    countdownTimer = setInterval(function () {
      countdownValue--;
      if (countdownValue <= 0) {
        cancelCountdown();
        if (onCountdownFire) onCountdownFire();
      } else {
        el.countdownText.textContent = 'NEXT SCENE IN ' + countdownValue;
      }
    }, 1000);
  }

  function pauseStory() {
    if (storyPaused) return;
    if (quizActive) return;
    storyPaused = true;
    pauseStart = Date.now();
    pauseCountdown();
    if ('speechSynthesis' in window) {
      try { speechSynthesis.cancel(); } catch (e) {}
    }
    currentUtterance = null;
    isNarratingSpeech = false;
    if (captionTimer) {
      clearTimeout(captionTimer);
      captionTimer = null;
    }
    if (viewer && rotating) {
      try { viewer.spin(false); } catch (e) {}
    }
    atmosphereAnimating = false;
    el.countdownText.textContent = 'PAUSED';
    el.btnPause.querySelector('span').textContent = 'PLAY';
    el.btnPause.querySelector('path').setAttribute('d', 'M8 5l11 7-11 7z');
    el.btnPause.classList.add('paused-state');
    el.btnPause.setAttribute('aria-pressed', 'true');
    el.btnPause.setAttribute('aria-label', 'Resume story (P)');
    if (el.srLive) el.srLive.textContent = 'Story paused';
  }

  function resumeStory() {
    if (!storyPaused) return;
    storyPaused = false;
    if (countdownValue > 0) {
      resumeCountdown();
      el.countdownText.textContent = 'NEXT SCENE IN ' + countdownValue;
    } else {
      el.countdownText.textContent = '';
      if (!captionsComplete && currentCaptionIndex >= 0 && activeCaptions && currentCaptionIndex < activeCaptions.length) {
        var c = activeCaptions[currentCaptionIndex];
        el.captionText.textContent = c.text;
        el.captionText.classList.add('show');
        if (c.deep && el.deepDetail) {
          el.deepDetailText.textContent = c.deep;
          el.deepDetail.classList.add('show');
        }
        var useSpeech = narrationEnabled && 'speechSynthesis' in window;
        if (useSpeech) {
          var seq = ++narrationSeqToken;
          speakNarration(c.text, function () {
            if (seq !== narrationSeqToken || storyPaused) return;
            el.captionText.classList.remove('show');
            if (el.deepDetail) el.deepDetail.classList.remove('show');
            captionTimer = setTimeout(function () {
              captionTimer = null;
              if (storyPaused || seq !== narrationSeqToken) return;
              if (window._showCaptionAtIndex) window._showCaptionAtIndex(currentCaptionIndex + 1);
            }, 400);
          }, seq);
        } else {
          var dur = (c.duration || 3500) + 350;
          captionTimer = setTimeout(function () {
            captionTimer = null;
            if (storyPaused) return;
            el.captionText.classList.remove('show');
            if (el.deepDetail) el.deepDetail.classList.remove('show');
            captionTimer = setTimeout(function () {
              captionTimer = null;
              if (storyPaused) return;
              if (window._showCaptionAtIndex) window._showCaptionAtIndex(currentCaptionIndex + 1);
            }, 300);
          }, dur);
        }
      }
    }
    if (viewer && rotating) {
      try { viewer.spin('y', .25); } catch (e) {}
    }
    if (currentSceneIndex >= 0 && scenes[currentSceneIndex] && scenes[currentSceneIndex].atmosphere) {
      startAtmosphereAnimation();
    }
    el.btnPause.querySelector('span').textContent = 'PAUSE';
    el.btnPause.querySelector('path').setAttribute('d', 'M7 5v14M17 5v14');
    el.btnPause.classList.remove('paused-state');
    el.btnPause.setAttribute('aria-pressed', 'false');
    el.btnPause.setAttribute('aria-label', 'Pause story (P)');
    if (el.srLive) el.srLive.textContent = 'Story resumed';
  }

  function togglePause() {
    if (storyPaused) resumeStory();
    else pauseStory();
  }

  function showQuiz(questionId) {
    var q = QUESTIONS.find(function (x) { return x.id === questionId; });
    if (!q) return Promise.resolve();
    quizActive = true;
    cancelCountdown();
    clearCaptions();
    stopNarration();
    hideUI(['sceneControls']);

    el.quizQuestionText.textContent = q.question;
    el.quizOptions.textContent = '';
    el.quizContainer.classList.remove('submitted');
    el.quizFeedback.classList.remove('show');
    el.quizFeedbackText.textContent = '';
    el.quizContinue.classList.remove('visible');
    var oldContinue = el.quizFeedback.querySelector('.quiz-continue-btn');
    if (oldContinue) oldContinue.remove();

    q.options.forEach(function (opt, i) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'quiz-option';
      btn.setAttribute('role', 'radio');
      btn.setAttribute('aria-checked', 'false');
      btn.setAttribute('data-index', String(i));

      var letterSpan = document.createElement('span');
      letterSpan.className = 'quiz-option-letter';
      letterSpan.textContent = String.fromCharCode(65 + i);

      var textSpan = document.createElement('span');
      textSpan.className = 'quiz-option-text';
      textSpan.textContent = opt;

      btn.appendChild(letterSpan);
      btn.appendChild(textSpan);

      btn.addEventListener('click', function () {
        if (quizLocked[q.id]) return;
        var idx = parseInt(btn.getAttribute('data-index'));
        quizAnswers[q.id] = idx;
        var allOptions = el.quizOptions.querySelectorAll('.quiz-option');
        allOptions.forEach(function (o) { o.setAttribute('aria-checked', 'false'); });
        btn.setAttribute('aria-checked', 'true');
        el.quizContinue.classList.add('visible');
        el.quizContinue.focus();
      });

      el.quizOptions.appendChild(btn);
    });

    var totalQuestions = QUESTIONS.length;
    el.quizProgressText.textContent = 'CHECKPOINT ' + (q.checkpoint) + ' OF ' + totalQuestions;
    el.quizOverlay.classList.add('visible');
    el.quizOverlay.focus();
    el.srLive.textContent = 'Quiz checkpoint: ' + q.question;

    return new Promise(function (resolve) {
      el.quizContinue.onclick = function () {
        if (quizAnswers[q.id] === undefined) return;
        quizLocked[q.id] = true;
        var isCorrect = quizAnswers[q.id] === q.correctAnswer;
        if (isCorrect) quizScore++;
        quizCompleted++;

        var allOptions = el.quizOptions.querySelectorAll('.quiz-option');
        allOptions.forEach(function (o, i) {
          o.style.pointerEvents = 'none';
          if (i === q.correctAnswer) o.classList.add('correct');
          if (i === quizAnswers[q.id] && !isCorrect) o.classList.add('incorrect');
        });

        el.quizFeedbackText.textContent = (isCorrect ? 'Correct. ' : 'Not quite. ') + q.explanation;
        el.quizContainer.classList.add('submitted');
        el.quizFeedback.classList.add('show');
        el.quizContinue.classList.remove('visible');
        el.srLive.textContent = (isCorrect ? 'Correct. ' : 'Incorrect. ') + q.explanation;

        var continueBtn = document.createElement('button');
        continueBtn.type = 'button';
        continueBtn.className = 'quiz-continue-btn';
        continueBtn.classList.add('visible');
        continueBtn.textContent = 'CONTINUE STORY';
        continueBtn.addEventListener('click', function () {
          el.quizOverlay.classList.remove('visible');
          quizActive = false;
          resolve();
        });
        el.quizFeedback.appendChild(continueBtn);
        continueBtn.focus();
      };
    });
  }

  function showResults() {
    var total = QUESTIONS.length;
    var pct = total > 0 ? Math.round((quizScore / total) * 100) : 0;
    el.resultsScore.textContent = quizScore + ' / ' + total;
    el.resultsPercentage.textContent = pct + '%';
    el.resultsReview.textContent = '';

    QUESTIONS.forEach(function (q, i) {
      var div = document.createElement('div');
      div.className = 'results-question';

      var qText = document.createElement('div');
      qText.className = 'results-q-text';
      qText.textContent = (i + 1) + '. ' + q.question;

      var answerRow = document.createElement('div');
      answerRow.className = 'results-q-answers';

      var userAnswer = quizAnswers[q.id];
      var userLabel = userAnswer !== undefined ? String.fromCharCode(65 + userAnswer) + '. ' + q.options[userAnswer] : 'Not answered';
      var correctLabel = String.fromCharCode(65 + q.correctAnswer) + '. ' + q.options[q.correctAnswer];

      var wasCorrect = userAnswer === q.correctAnswer;

      var userDiv = document.createElement('div');
      userDiv.className = 'results-q-user ' + (wasCorrect ? 'correct' : 'incorrect');
      var yourLabel = document.createElement('span');
      yourLabel.className = 'results-q-label';
      yourLabel.textContent = 'Your answer: ';
      var yourValue = document.createElement('span');
      yourValue.textContent = userLabel;
      userDiv.appendChild(yourLabel);
      userDiv.appendChild(yourValue);

      if (!wasCorrect) {
        var correctDiv = document.createElement('div');
        correctDiv.className = 'results-q-correct';
        var correctLabelSpan = document.createElement('span');
        correctLabelSpan.className = 'results-q-label';
        correctLabelSpan.textContent = 'Correct answer: ';
        var correctValueSpan = document.createElement('span');
        correctValueSpan.textContent = correctLabel;
        correctDiv.appendChild(correctLabelSpan);
        correctDiv.appendChild(correctValueSpan);
        answerRow.appendChild(userDiv);
        answerRow.appendChild(correctDiv);
      } else {
        answerRow.appendChild(userDiv);
      }

      var explDiv = document.createElement('div');
      explDiv.className = 'results-q-explanation';
      explDiv.textContent = q.explanation;

      div.appendChild(qText);
      div.appendChild(answerRow);
      div.appendChild(explDiv);
      el.resultsReview.appendChild(div);
    });

    el.resultsOverlay.classList.add('visible');
    el.resultsOverlay.focus();
    el.srLive.textContent = 'Story complete. You scored ' + quizScore + ' out of ' + total + ', ' + pct + ' percent.';
  }

  function sanitizeInput(str) {
    return (str || '').replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '').trim().substring(0, 200);
  }

  function escapeHtml(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function openEmailResults() {
    el.emailOverlay.classList.add('visible');
    el.emailOverlay.focus();
    el.emailError.textContent = '';
    el.emailTeacherName.value = '';
    el.emailTeacherEmail.value = '';
    el.emailStudentName.value = '';
    el.emailSend.disabled = false;
    el.emailSend.textContent = 'SEND RESULTS';
  }

  function closeEmailResults() {
    el.emailOverlay.classList.remove('visible');
  }

  function buildEmailBody() {
    var total = QUESTIONS.length;
    var pct = total > 0 ? Math.round((quizScore / total) * 100) : 0;
    var studentName = sanitizeInput(el.emailStudentName.value);
    var teacherName = sanitizeInput(el.emailTeacherName.value);
    var lines = [];
    lines.push('Glycolysis Interactive - Quiz Results');
    lines.push('');
    lines.push('Teacher: ' + teacherName);
    if (studentName) lines.push('Student: ' + studentName);
    lines.push('Score: ' + quizScore + ' / ' + total + ' (' + pct + '%)');
    lines.push('');
    QUESTIONS.forEach(function (q, i) {
      var userAnswer = quizAnswers[q.id];
      var userLabel = userAnswer !== undefined ? String.fromCharCode(65 + userAnswer) + '. ' + q.options[userAnswer] : 'Not answered';
      var correctLabel = String.fromCharCode(65 + q.correctAnswer) + '. ' + q.options[q.correctAnswer];
      var wasCorrect = userAnswer === q.correctAnswer;
      lines.push((i + 1) + '. ' + q.question);
      lines.push('   Your answer: ' + userLabel + (wasCorrect ? ' (Correct)' : ' (Incorrect)'));
      if (!wasCorrect) lines.push('   Correct answer: ' + correctLabel);
      lines.push('');
    });
    lines.push('Generated by Glycolysis Interactive');
    return lines.join('\n');
  }

  var EMAIL_API = '/api/send-email';

  function sendEmailToBackend(teacherName, teacherEmail, studentName, subject, body) {
    if (!EMAIL_API) {
      return Promise.reject(new Error('Email service not configured. Please contact your teacher.'));
    }
    return fetch(EMAIL_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        teacherName: teacherName,
        teacherEmail: teacherEmail,
        studentName: studentName,
        subject: subject,
        message: body
      })
    }).then(function (res) {
      return res.json().then(function (data) {
        if (!res.ok || !data.success) throw new Error(data.error || 'Failed to send email.');
        return data;
      });
    });
  }

  function sendEmailResults() {
    var teacherName = sanitizeInput(el.emailTeacherName.value);
    var teacherEmail = sanitizeInput(el.emailTeacherEmail.value);
    var studentName = sanitizeInput(el.emailStudentName.value);

    el.emailError.textContent = '';

    if (!teacherName) {
      el.emailError.textContent = 'Please enter your teacher\'s name.';
      el.emailTeacherName.focus();
      return;
    }
    if (!teacherEmail) {
      el.emailError.textContent = 'Please enter your teacher\'s email address.';
      el.emailTeacherEmail.focus();
      return;
    }
    if (!isValidEmail(teacherEmail)) {
      el.emailError.textContent = 'Please enter a valid email address.';
      el.emailTeacherEmail.focus();
      return;
    }
    if (!studentName) {
      el.emailError.textContent = 'Please enter your name.';
      el.emailStudentName.focus();
      return;
    }

    el.emailSend.disabled = true;
    el.emailSend.textContent = 'SENDING...';

    var total = QUESTIONS.length;
    var pct = total > 0 ? Math.round((quizScore / total) * 100) : 0;
    var subject = 'Glycolysis Quiz Results - ' + studentName;
    var body = buildEmailBody();

    sendEmailToBackend(teacherName, teacherEmail, studentName, subject, body)
      .then(function () {
        el.emailError.textContent = '';
        el.emailSend.textContent = 'SENT SUCCESSFULLY';
        el.emailSend.disabled = true;
        setTimeout(closeEmailResults, 1500);
      })
      .catch(function (err) {
        var msg = err.message || 'Could not send email.';
        if (msg.indexOf('Failed to fetch') !== -1 || msg.indexOf('NetworkError') !== -1) {
          msg = 'Network error. Please check your connection and try again.';
        }
        el.emailError.textContent = msg;
        el.emailSend.disabled = false;
        el.emailSend.textContent = 'SEND RESULTS';
      });
  }

  async function transitionToScene(index, immediate) {
    if (transitioning && !immediate) return;
    if (index < 0 || index >= scenes.length) return;
    if (index === currentSceneIndex && !immediate) return;
    if (storyPaused) resumeStory();
    transitioning = true;
    var token = ++sceneToken;
    el.stepCounter.dataset.token = String(token);
    var scene = scenes[index];
    var prevScene = currentSceneIndex >= 0 ? scenes[currentSceneIndex] : null;
    cancelCountdown();
    clearCaptions();
    stopNarration();
    hideUI(['sceneControls']);

    var needsFade = scene.phase !== (prevScene && prevScene.phase) || scene.id === 'finale' || (prevScene && prevScene.id === 'finale');
    if (needsFade && !immediate && !PREFERS_REDUCED) {
      el.fadeOverlay.classList.add('active');
      await wait(600);
    }
    if (token !== sceneToken) {
      transitioning = false;
      return;
    }
    currentSceneIndex = index;
    el.stepCounter.textContent = 'GLYCOLYSIS';
    el.stepCounter.classList.add('visible');
    var phaseLabels = {
      intro: 'INTRODUCTION',
      investment: 'ENERGY INVESTMENT',
      payoff: 'ENERGY PAYOFF',
      accounting: 'ACCOUNTING',
      finale: 'FINALE'
    };
    var label = phaseLabels[scene.phase] || '';
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
      el.enzymeReaction.textContent = scene.reaction || '';
      el.enzymeLabel.classList.add('visible');
    } else {
      el.enzymeLabel.classList.remove('visible');
    }
    if (scene.accounting) showAccounting(scene.accounting);
    else {
      el.accounting.classList.remove('visible');
      el.accounting.textContent = '';
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
    var seq = ++narrationSeqToken;
    el.btnStay.classList.remove('stay-active');
    autoAdvanceActive = true;
    playCaptions(scene.captions, function () {
      if (seq !== narrationSeqToken || token !== sceneToken) return;

      if (scene.quiz && !quizLocked[scene.quiz]) {
        showUI(['sceneControls']);
        showQuiz(scene.quiz).then(function () {
          if (token !== sceneToken) return;
          showUI(['sceneControls']);
          if (!autoAdvanceActive) return;
          var delay = scene.autoAdvanceDelay || 5000;
          startCountdown(delay, function () {
            if (token !== sceneToken) return;
            if (currentSceneIndex < scenes.length - 1) transitionToScene(currentSceneIndex + 1);
          });
        });
        return;
      }

      if (scene.id === 'finale') {
        showUI(['sceneControls']);
        showResults();
        return;
      }

      showUI(['sceneControls']);
      if (!autoAdvanceActive) return;
      var delay = scene.autoAdvanceDelay || 5000;
      startCountdown(delay, function () {
        if (token !== sceneToken) return;
        if (currentSceneIndex < scenes.length - 1) transitionToScene(currentSceneIndex + 1);
      });
    }, seq);
    transitioning = false;
  }

  function setupControls() {
    el.btnRotate.setAttribute('aria-pressed', String(rotating));
    el.btnRotate.classList.toggle('active', rotating);

    el.btnPrev.addEventListener('click', function () {
      if (currentSceneIndex > 0) transitionToScene(currentSceneIndex - 1);
    });
    el.btnNext.addEventListener('click', function () {
      cancelCountdown();
      if (currentSceneIndex < scenes.length - 1) transitionToScene(currentSceneIndex + 1);
    });
    el.btnStay.addEventListener('click', function () {
      if (autoAdvanceActive) {
        cancelCountdown();
        autoAdvanceActive = false;
        el.btnStay.classList.add('stay-active');
        el.countdownText.textContent = 'AUTO ADVANCE OFF';
        setTimeout(function () {
          if (!autoAdvanceActive && !storyPaused && countdownValue <= 0) el.countdownText.textContent = '';
        }, 2000);
      } else {
        autoAdvanceActive = true;
        el.btnStay.classList.remove('stay-active');
        if (captionsComplete && currentSceneIndex >= 0) {
          var d = scenes[currentSceneIndex].autoAdvanceDelay || 5000;
          startCountdown(d, function () {
            if (currentSceneIndex < scenes.length - 1) transitionToScene(currentSceneIndex + 1);
          });
        }
      }
    });
    el.btnPause.addEventListener('click', togglePause);
    el.btnRestart.addEventListener('click', function () {
      cancelCountdown();
      clearCaptions();
      stopNarration();
      quizAnswers = {};
      quizLocked = {};
      quizScore = 0;
      quizCompleted = 0;
      quizActive = false;
      transitioning = false;
      autoAdvanceActive = true;
      if (storyPaused) {
        storyPaused = false;
        el.btnPause.querySelector('span').textContent = 'PAUSE';
        el.btnPause.querySelector('path').setAttribute('d', 'M7 5v14M17 5v14');
        el.btnPause.classList.remove('paused-state');
        el.btnPause.setAttribute('aria-pressed', 'false');
        el.btnPause.setAttribute('aria-label', 'Pause story (P)');
      }
      el.resultsOverlay.classList.remove('visible');
      el.emailOverlay.classList.remove('visible');
      el.quizOverlay.classList.remove('visible');
      if (currentMolKey) clearMolecule();
      el.viewport.style.opacity = '1';
      el.viewport.style.transform = '';
      transitionToScene(0, true);
    });
    el.btnHome.addEventListener('click', function () {
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
        try { viewer.render(); } catch (e) {}
      }
    });
    el.btnReset.addEventListener('click', function () {
      if (!viewer || !currentMolKey) return;
      try {
        viewer.spin(false);
        viewer.zoomTo();
        viewer.zoom(.92);
        viewer.render();
        if (rotating) setTimeout(function () {
          try { viewer.spin('y', .25); } catch (e) {}
        }, 100);
      } catch (e) {}
      el.srLive.textContent = 'Camera view reset';
    });
    el.mobileToolsToggle.addEventListener('click', function () {
      var isOpen = document.body.classList.toggle('mobile-tools-open');
      el.mobileToolsToggle.setAttribute('aria-expanded', String(isOpen));
      el.mobileToolsToggle.lastElementChild.textContent = isOpen ? '\u00d7' : '+';
    });
    document.addEventListener('keydown', function (e) {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if (el.emailOverlay.classList.contains('visible')) {
        if (e.key === 'Escape') { closeEmailResults(); e.preventDefault(); }
        return;
      }
      if (el.resultsOverlay.classList.contains('visible')) {
        if (e.key === 'Escape') { el.resultsOverlay.classList.remove('visible'); e.preventDefault(); }
        return;
      }
      if (quizActive) return;
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

    if (el.resultsStoryBtn) {
      el.resultsStoryBtn.addEventListener('click', function () {
        el.resultsOverlay.classList.remove('visible');
        transitionToScene(0, true);
      });
    }
    if (el.resultsQuestionsBtn) {
      el.resultsQuestionsBtn.addEventListener('click', function () {
        el.resultsOverlay.classList.remove('visible');
        var reviewDiv = document.createElement('div');
        reviewDiv.className = 'quiz-review-inline';
        reviewDiv.setAttribute('role', 'region');
        reviewDiv.setAttribute('aria-label', 'Question review');
        QUESTIONS.forEach(function (q, i) {
          var item = document.createElement('div');
          item.className = 'quiz-review-item';
          var qText = document.createElement('div');
          qText.className = 'quiz-review-q';
          qText.textContent = (i + 1) + '. ' + q.question;
          var userAnswer = quizAnswers[q.id];
          var userLabel = userAnswer !== undefined ? String.fromCharCode(65 + userAnswer) + '. ' + q.options[userAnswer] : 'Not answered';
          var correctLabel = String.fromCharCode(65 + q.correctAnswer) + '. ' + q.options[q.correctAnswer];
          var wasCorrect = userAnswer === q.correctAnswer;
          var ansDiv = document.createElement('div');
          ansDiv.className = 'quiz-review-ans ' + (wasCorrect ? 'correct' : 'incorrect');
          ansDiv.textContent = 'Your answer: ' + userLabel;
          if (!wasCorrect) {
            var corDiv = document.createElement('div');
            corDiv.className = 'quiz-review-cor';
            corDiv.textContent = 'Correct: ' + correctLabel;
            item.appendChild(qText);
            item.appendChild(ansDiv);
            item.appendChild(corDiv);
          } else {
            item.appendChild(qText);
            item.appendChild(ansDiv);
          }
          var explDiv = document.createElement('div');
          explDiv.className = 'quiz-review-expl';
          explDiv.textContent = q.explanation;
          item.appendChild(explDiv);
          reviewDiv.appendChild(item);
        });
        var backBtn = document.createElement('button');
        backBtn.type = 'button';
        backBtn.className = 'quiz-review-back';
        backBtn.textContent = 'BACK TO RESULTS';
        backBtn.addEventListener('click', function () {
          reviewDiv.remove();
          el.resultsOverlay.classList.add('visible');
        });
        reviewDiv.appendChild(backBtn);
        document.body.appendChild(reviewDiv);
        reviewDiv.focus();
      });
    }
    if (el.resultsEmailBtn) {
      el.resultsEmailBtn.addEventListener('click', openEmailResults);
    }
    if (el.emailCancel) {
      el.emailCancel.addEventListener('click', closeEmailResults);
    }
    if (el.emailForm) {
      el.emailForm.addEventListener('submit', function (e) {
        e.preventDefault();
        sendEmailResults();
      });
    }
    if (el.emailSend) {
      el.emailSend.addEventListener('click', sendEmailResults);
    }
  }

  document.addEventListener('visibilitychange', function () {
    if (document.hidden) {
      atmosphereAnimating = false;
      try {
        if (viewer) viewer.spin(false);
      } catch (e) {}
    } else {
      if (!storyPaused && !quizActive) {
        if (currentSceneIndex >= 0 && scenes[currentSceneIndex] && scenes[currentSceneIndex].atmosphere) {
          startAtmosphereAnimation();
        }
        if (viewer && rotating) try { viewer.spin('y', .25); } catch (e) {}
      }
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
    preload(['glucose', 'atp', 'adp', 'g6p', 'fbp', 'dhap', 'g3p']);
    await wait(800);
    transitionToScene(0, true);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

})();
