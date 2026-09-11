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
  var quizFinished = false;

  var storyStarted = false;
  var tabChangeLog = [];
  var tabLeftAt = 0;
  var awayDuration = 0;
  var awayReason = '';
  var cheatingDetected = false;
  var TAB_WARNING_THRESHOLD_MS = 5000;
  var TAB_AUTO_RESTART_MS = 300000;

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
      id: 'cell', phase: 'intro', molecule: null, camera: null,
      captions: [
        cap('Every living cell needs a continuous supply of usable energy.', 4500, 'Cells perform thousands of chemical reactions that require energy. Without a constant supply, cellular function would cease.')
      ],
      enzyme: null, reaction: null, accounting: null,
      preloads: ['glucose', 'atp'], atmosphere: 'cell', autoAdvanceDelay: 5000, quiz: null
    },
    {
      id: 'cytosol', phase: 'intro', molecule: null, camera: null,
      captions: [
        cap('Glycolysis is the process of breaking down glucose and capturing some of its energy.', 5000, 'Glycolysis is the first stage of both aerobic and anaerobic respiration.'),
        cap('It happens in the cytosol, the fluid part of the cell, and it takes ten reactions to get from glucose to pyruvate.', 5500, 'The cytosol is where all ten reactions of glycolysis occur.')
      ],
      enzyme: null, reaction: null, accounting: null,
      atmosphere: 'cytosol', autoAdvanceDelay: 5000, quiz: null
    },
    {
      id: 'glucose', phase: 'intro', molecule: 'glucose', camera: { zoom: .85, speed: .25 },
      captions: [
        cap('This is glucose. It is a six-carbon sugar and an important fuel molecule for cells.', 5000, 'The glucose shown is \u03B2-D-glucopyranose, a cyclic form of glucose. The important thing to remember is that one glucose molecule starts glycolysis with six carbon atoms.'),
        cap('ATP is a molecule cells use to transfer energy between chemical reactions.', 4500, 'ATP stands for adenosine triphosphate. It has three phosphate groups and can transfer energy to help drive cellular reactions.')
      ],
      enzyme: null, reaction: null, accounting: null,
      preloads: ['g6p', 'adp', 'fbp'], atmosphere: null, autoAdvanceDelay: 5000,
      quiz: QUESTIONS[0] ? QUESTIONS[0].id : null
    },
    {
      id: 'investment', phase: 'investment', molecule: 'g6p', camera: { zoom: .82, speed: .15 },
      captions: [
        cap('At the start, the cell has to spend some energy to get the reaction going.', 5000, 'ATP donates a phosphoryl group to glucose. This is catalyzed by hexokinase.'),
        cap('It uses ATP to add phosphate groups to the glucose-derived molecule. Two ATP are invested here.', 6000, 'Glucose is first changed into glucose-6-phosphate. It is then rearranged into fructose-6-phosphate and receives another phosphate group to become fructose-1,6-bisphosphate. That means two ATP have been invested before the pathway reaches the payoff stage.')
      ],
      enzyme: null, reaction: null, accounting: null,
      preloads: ['f6p', 'dhap', 'g3p'], atmosphere: null, autoAdvanceDelay: 5000,
      quiz: QUESTIONS[1] ? QUESTIONS[1].id : null
    },
    {
      id: 'split', phase: 'investment', molecule: 'fbp', camera: { zoom: .7, speed: .1 },
      captions: [
        cap('Now the fructose-1,6-bisphosphate is split into two three-carbon molecules.', 5000, 'Fructose-1,6-bisphosphate is split into DHAP and glyceraldehyde-3-phosphate, also called G3P.'),
        cap('One of them is DHAP, and DHAP is changed into G3P. So from now on, we have two G3P molecules going through the pathway.', 6000, 'DHAP is then converted into G3P. This leaves two G3P molecules continuing through glycolysis.')
      ],
      enzyme: null, reaction: null, accounting: null,
      preloads: ['nad', 'nadh', 'bpg13'], atmosphere: null, autoAdvanceDelay: 5000,
      quiz: QUESTIONS[2] ? QUESTIONS[2].id : null
    },
    {
      id: 'counting', phase: 'investment', molecule: null, camera: null,
      captions: [
        cap('This changes how we count the rest of the reactions.', 4000, 'We started with one glucose, but we now have two three-carbon molecules.'),
        cap('We started with one glucose, but we now have two three-carbon molecules. That means the reactions after the split happen twice for every original glucose molecule.', 6500, 'This is why we get two NADH and two pyruvate later.')
      ],
      enzyme: null, reaction: null, accounting: null,
      atmosphere: null, autoAdvanceDelay: 5000,
      quiz: QUESTIONS[3] ? QUESTIONS[3].id : null
    },
    {
      id: 'payoff', phase: 'payoff', molecule: 'g3p', camera: { zoom: .85, speed: .15 },
      captions: [
        cap('Now the two G3P molecules go through the rest of glycolysis.', 5000, 'The sequence of the main intermediates is G3P, 1,3-bisphosphoglycerate, 3-phosphoglycerate, 2-phosphoglycerate, PEP, and finally pyruvate.'),
        cap('They are changed several more times, eventually becoming pyruvate. The important part is that both three-carbon molecules go through the pathway.', 5500, 'Show that the sequence occurs for BOTH three-carbon molecules.')
      ],
      enzyme: null, reaction: null, accounting: null,
      preloads: ['pg3', 'pg2', 'pep', 'pyruvate'], atmosphere: null, autoAdvanceDelay: 5000,
      quiz: QUESTIONS[4] ? QUESTIONS[4].id : null
    },
    {
      id: 'nad-phase', phase: 'payoff', molecule: 'nad', camera: { zoom: .85, speed: .15 },
      captions: [
        cap('As G3P is processed, some of its energy is transferred to NAD+.', 5000, 'NAD+ accepts electrons and hydrogen during the oxidation of G3P and is reduced to NADH, also called reduced NAD.'),
        cap('NAD+ is a carrier molecule. When NAD+ accepts electrons, it is reduced to NADH.', 5000, 'NAD+ accepts electrons from the reaction and is reduced to NADH.'),
        cap('Because we have two G3P molecules, this happens twice, producing two NADH.', 4000, 'Each G3P donates electrons to one NAD+ molecule. Two G3P per glucose means two NADH produced.')
      ],
      enzyme: null, reaction: null, accounting: null,
      preloads: ['bpg13'], atmosphere: null, autoAdvanceDelay: 5000,
      quiz: QUESTIONS[5] ? QUESTIONS[5].id : null
    },
    {
      id: 'payoff-atp', phase: 'payoff', molecule: 'bpg13', camera: { zoom: .85, speed: .15 },
      captions: [
        cap('Now we start to get some energy back from the pathway.', 4000, 'Substrate-level phosphorylation: phosphate groups are transferred directly from metabolic intermediates to ADP, producing ATP.'),
        cap('Phosphate groups are transferred to ADP to make ATP. This happens for both three-carbon molecules, so four ATP are produced.', 6000, 'Two ATP were invested at the beginning. Four ATP are produced now. The net gain is two ATP.'),
        cap('We spent two ATP at the start and made four later, so the net gain is two ATP.', 5000, 'ATP invested: 2. ATP produced: 4. Net ATP: +2. NADH produced: +2. Pyruvate produced: 2.')
      ],
      enzyme: null, reaction: null,
      accounting: { invested: 2, produced: 4, nadh: 2, showNet: true },
      atmosphere: null, autoAdvanceDelay: 5000,
      quiz: QUESTIONS[6] ? QUESTIONS[6].id : null
    },
    {
      id: 'pyruvate', phase: 'accounting', molecule: 'pyruvate', camera: { zoom: .88, speed: .15 },
      captions: [
        cap('After the final reactions, each three-carbon molecule becomes pyruvate.', 5000, 'One glucose produces two pyruvate molecules. The carbon skeleton is conserved.'),
        cap('We have two three-carbon molecules, so one glucose gives us two pyruvate molecules.', 5000, 'One glucose molecule contains six carbon atoms, while each pyruvate contains three carbon atoms. This is why one glucose produces two pyruvate molecules.'),
        cap('Remember: one six-carbon glucose becomes two three-carbon pyruvate molecules.', 4500, null)
      ],
      enzyme: null, reaction: null, accounting: null,
      preloads: [], atmosphere: null, autoAdvanceDelay: 5000,
      quiz: QUESTIONS[7] ? QUESTIONS[7].id : null
    },
    {
      id: 'oxygen', phase: 'accounting', molecule: null, camera: null,
      captions: [
        cap('One useful thing to know is that glycolysis itself does not directly use oxygen.', 4500, 'Glycolysis can happen whether oxygen is available or not.'),
        cap('That means glycolysis can happen whether oxygen is available or not.', 4500, null),
        cap('When oxygen is available, pyruvate can go on to the next stages of aerobic respiration. Without oxygen, cells can use different pathways that allow glycolysis to keep going.', 6000, 'Glycolysis is therefore part of both aerobic and anaerobic respiration.')
      ],
      enzyme: null, reaction: null, accounting: null,
      atmosphere: 'cytosol', autoAdvanceDelay: 5000, showEquation: true, quiz: null
    },
    {
      id: 'finale', phase: 'finale', molecule: null, camera: null,
      captions: [
        cap('In conclusion, glucose enters glycolysis as a six-carbon molecule, and two ATP are invested to make it more reactive and prepare it for the reactions that follow.', 7000, null),
        cap('The molecule is then split into two three-carbon molecules, which are processed to produce two NADH and four ATP. Each three-carbon molecule becomes pyruvate, giving two pyruvate in total.', 8000, 'Glycolysis takes place in the cytosol and does not directly require molecular oxygen. Per glucose molecule, it produces two pyruvate, two NADH, and a net gain of two ATP.'),
        cap('Since two ATP were invested at the beginning, the overall net gain is two ATP.', 5000, null)
      ],
      enzyme: null, reaction: null, accounting: null,
      atmosphere: 'cytosol', fadeToBlack: true, autoAdvanceDelay: 6000, quiz: null
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
    'resultsOverlay', 'resultsScore', 'resultsPercentage', 'resultsReview', 'resultsStoryBtn', 'resultsQuestionsBtn', 'resultsDownloadBtn', 'resultsEmailBtn', 'resultsHomeBtn', 'resultsRestartBtn', 'emailOverlay', 'emailForm', 'emailTeacherName', 'emailTeacherEmail', 'emailStudentName', 'emailSend', 'emailCancel', 'emailNote', 'emailError', 'downloadOverlay', 'downloadForm', 'downloadStudentName', 'downloadSubmit', 'downloadCancel', 'downloadError'
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

    if (q.type === 'single') {
      renderSingleQuestion(q);
    } else if (q.type === 'multi') {
      renderMultiQuestion(q);
    } else if (q.type === 'matching') {
      renderMatchingQuestion(q);
    }

    var totalQuestions = QUESTIONS.length;
    var questionNumber = QUESTIONS.indexOf(q) + 1;
    el.quizProgressText.textContent = 'QUESTION ' + questionNumber + ' OF ' + totalQuestions;
    el.quizOverlay.classList.add('visible');
    el.quizOverlay.focus();
    el.srLive.textContent = 'Quiz checkpoint: ' + q.question;

    return new Promise(function (resolve) {
      el.quizContinue.onclick = function () {
        if (q.type === 'single') {
          if (quizAnswers[q.id] === undefined) return;
          quizLocked[q.id] = true;
          var isCorrect = quizAnswers[q.id] === q.correctAnswer;
          if (isCorrect) quizScore++;
          quizCompleted++;
          var allOptions = el.quizOptions.querySelectorAll('.quiz-option');
          allOptions.forEach(function (o) {
            o.style.pointerEvents = 'none';
            var optId = o.getAttribute('data-option-id');
            if (optId === q.correctAnswer) o.classList.add('correct');
            if (optId === quizAnswers[q.id] && !isCorrect) o.classList.add('incorrect');
          });
          showFeedback(isCorrect, q.explanation, resolve, 'CONTINUE STORY');
        } else if (q.type === 'multi') {
          var selected = quizAnswers[q.id] || [];
          if (selected.length === 0) return;
          quizLocked[q.id] = true;
          var correctSet = q.correctAnswers.slice().sort().join(',');
          var selectedSet = selected.slice().sort().join(',');
          var multiCorrect = correctSet === selectedSet;
          if (multiCorrect) quizScore++;
          quizCompleted++;
          var allBtns = el.quizOptions.querySelectorAll('.quiz-option');
          allBtns.forEach(function (btn) {
            btn.style.pointerEvents = 'none';
            var oid = btn.getAttribute('data-option-id');
            var isSelected = selected.indexOf(oid) !== -1;
            var isCorrectOpt = q.correctAnswers.indexOf(oid) !== -1;
            if (isCorrectOpt) btn.classList.add('correct');
            else if (isSelected && !isCorrectOpt) btn.classList.add('incorrect');
          });
          showFeedback(multiCorrect, q.explanation, resolve, 'CONTINUE STORY');
        } else if (q.type === 'matching') {
          var matches = quizAnswers[q.id] || {};
          var allMatched = q.pairs.every(function (p) { return matches[p.leftId]; });
          if (!allMatched) return;
          quizLocked[q.id] = true;
          var allCorrect = true;
          q.pairs.forEach(function (p) {
            if (matches[p.leftId] !== p.rightId) allCorrect = false;
          });
          if (allCorrect) quizScore++;
          quizCompleted++;
          var selects = el.quizOptions.querySelectorAll('.match-select');
          selects.forEach(function (sel) {
            sel.disabled = true;
            var lid = sel.getAttribute('data-left-id');
            var matchedRight = matches[lid];
            if (matchedRight === q.correctMatches[lid]) sel.classList.add('correct');
            else sel.classList.add('incorrect');
          });
          showFeedback(allCorrect, q.explanation, resolve, 'CONTINUE STORY');
        }
      };
    });
  }

  function playFeedbackSound(correct) {
    try {
      var ctx = new (window.AudioContext || window.webkitAudioContext)();
      var osc = ctx.createOscillator();
      var gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      if (correct) {
        osc.frequency.value = 600;
        gain.gain.value = 0.08;
      } else {
        osc.frequency.value = 300;
        gain.gain.value = 0.08;
      }
      osc.start();
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      osc.stop(ctx.currentTime + 0.3);
    } catch (e) {}
  }

  function showFeedback(isCorrect, explanation, resolve, btnText) {
    playFeedbackSound(isCorrect);
    el.quizFeedbackText.textContent = (isCorrect ? '\u2713 Correct. ' : '\u2717 Not quite. ') + explanation;
    el.quizContainer.classList.add('submitted');
    el.quizFeedback.classList.add('show');
    el.quizContinue.classList.remove('visible');
    el.srLive.textContent = (isCorrect ? 'Correct. ' : 'Incorrect. ') + explanation;

    var continueBtn = document.createElement('button');
    continueBtn.type = 'button';
    continueBtn.className = 'quiz-continue-btn';
    continueBtn.classList.add('visible');
    continueBtn.textContent = btnText || 'CONTINUE';
    continueBtn.addEventListener('click', function () {
      el.quizOverlay.classList.remove('visible');
      quizActive = false;
      resolve();
    });
    el.quizFeedback.appendChild(continueBtn);
    continueBtn.focus();
  }

  function renderSingleQuestion(q) {
    el.quizOptions.setAttribute('role', 'radiogroup');
    el.quizOptions.setAttribute('aria-label', q.question);
    q.options.forEach(function (opt, i) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'quiz-option';
      btn.setAttribute('role', 'radio');
      btn.setAttribute('aria-checked', 'false');
      btn.setAttribute('data-index', String(i));
      btn.setAttribute('data-option-id', opt.id);
      btn.setAttribute('tabindex', i === 0 ? '0' : '-1');
      var letterSpan = document.createElement('span');
      letterSpan.className = 'quiz-option-letter';
      letterSpan.textContent = String.fromCharCode(65 + i);
      var textSpan = document.createElement('span');
      textSpan.className = 'quiz-option-text';
      textSpan.textContent = opt.text;
      btn.appendChild(letterSpan);
      btn.appendChild(textSpan);
      btn.addEventListener('click', function () {
        if (quizLocked[q.id]) return;
        quizAnswers[q.id] = opt.id;
        var allOptions = el.quizOptions.querySelectorAll('.quiz-option');
        allOptions.forEach(function (o, j) {
          o.setAttribute('aria-checked', 'false');
          o.setAttribute('tabindex', j === i ? '0' : '-1');
        });
        btn.setAttribute('aria-checked', 'true');
        btn.setAttribute('tabindex', '0');
        btn.focus();
        el.quizContinue.classList.add('visible');
        el.srLive.textContent = 'Selected: ' + opt.text;
      });
      btn.addEventListener('keydown', function (e) {
        if (quizLocked[q.id]) return;
        var allOptions = el.quizOptions.querySelectorAll('.quiz-option');
        var currentIdx = parseInt(btn.getAttribute('data-index'));
        var nextIdx = -1;
        if (e.key === 'ArrowDown' || e.key === 'ArrowRight') { e.preventDefault(); nextIdx = (currentIdx + 1) % allOptions.length; }
        else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') { e.preventDefault(); nextIdx = (currentIdx - 1 + allOptions.length) % allOptions.length; }
        else if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); btn.click(); return; }
        else if (e.key === 'Home') { e.preventDefault(); nextIdx = 0; }
        else if (e.key === 'End') { e.preventDefault(); nextIdx = allOptions.length - 1; }
        if (nextIdx >= 0) {
          allOptions.forEach(function (o) { o.setAttribute('tabindex', '-1'); });
          allOptions[nextIdx].setAttribute('tabindex', '0');
          allOptions[nextIdx].focus();
        }
      });
      el.quizOptions.appendChild(btn);
    });
  }

  function renderMultiQuestion(q) {
    el.quizOptions.setAttribute('role', 'group');
    el.quizOptions.setAttribute('aria-label', q.question + '. Select all that apply.');
    var selected = [];
    q.options.forEach(function (opt, i) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'quiz-option quiz-option-multi';
      btn.setAttribute('role', 'checkbox');
      btn.setAttribute('aria-checked', 'false');
      btn.setAttribute('data-option-id', opt.id);
      btn.setAttribute('data-index', String(i));
      btn.setAttribute('tabindex', i === 0 ? '0' : '-1');
      var checkSpan = document.createElement('span');
      checkSpan.className = 'quiz-option-check';
      checkSpan.textContent = '\u2610';
      var textSpan = document.createElement('span');
      textSpan.className = 'quiz-option-text';
      textSpan.textContent = opt.text;
      btn.appendChild(checkSpan);
      btn.appendChild(textSpan);
      btn.addEventListener('click', function () {
        if (quizLocked[q.id]) return;
        var idx = selected.indexOf(opt.id);
        if (idx === -1) { selected.push(opt.id); btn.setAttribute('aria-checked', 'true'); btn.classList.add('selected'); checkSpan.textContent = '\u2611'; }
        else { selected.splice(idx, 1); btn.setAttribute('aria-checked', 'false'); btn.classList.remove('selected'); checkSpan.textContent = '\u2610'; }
        quizAnswers[q.id] = selected.slice();
        el.quizContinue.classList.toggle('visible', selected.length > 0);
        el.srLive.textContent = selected.length + ' option' + (selected.length !== 1 ? 's' : '') + ' selected';
      });
      btn.addEventListener('keydown', function (e) {
        if (quizLocked[q.id]) return;
        var allBtns = el.quizOptions.querySelectorAll('.quiz-option');
        var ci = parseInt(btn.getAttribute('data-index'));
        var ni = -1;
        if (e.key === 'ArrowDown' || e.key === 'ArrowRight') { e.preventDefault(); ni = (ci + 1) % allBtns.length; }
        else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') { e.preventDefault(); ni = (ci - 1 + allBtns.length) % allBtns.length; }
        else if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); btn.click(); return; }
        else if (e.key === 'Home') { e.preventDefault(); ni = 0; }
        else if (e.key === 'End') { e.preventDefault(); ni = allBtns.length - 1; }
        if (ni >= 0) { allBtns.forEach(function (b) { b.setAttribute('tabindex', '-1'); }); allBtns[ni].setAttribute('tabindex', '0'); allBtns[ni].focus(); }
      });
      el.quizOptions.appendChild(btn);
    });
  }

  function renderMatchingQuestion(q) {
    el.quizOptions.setAttribute('role', 'group');
    el.quizOptions.setAttribute('aria-label', q.question);
    var matches = {};

    q.pairs.forEach(function (p) {
      var row = document.createElement('div');
      row.className = 'match-row';

      var label = document.createElement('span');
      label.className = 'match-row-label';
      label.textContent = p.left;

      var arrow = document.createElement('span');
      arrow.className = 'match-row-arrow';
      arrow.textContent = '\u2192';

      var select = document.createElement('select');
      select.className = 'match-select';
      select.setAttribute('data-left-id', p.leftId);
      select.setAttribute('aria-label', 'Match for ' + p.left);

      var placeholder = document.createElement('option');
      placeholder.value = '';
      placeholder.textContent = 'Choose...';
      placeholder.disabled = true;
      placeholder.selected = true;
      select.appendChild(placeholder);

      var shuffledOptions = q.pairs.map(function (x) { return { id: x.rightId, text: x.right }; });
      for (var i = shuffledOptions.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var tmp = shuffledOptions[i]; shuffledOptions[i] = shuffledOptions[j]; shuffledOptions[j] = tmp;
      }
      shuffledOptions.forEach(function (opt) {
        var option = document.createElement('option');
        option.value = opt.id;
        option.textContent = opt.text;
        select.appendChild(option);
      });

      select.addEventListener('change', function () {
        if (quizLocked[q.id]) return;
        if (select.value) {
          matches[p.leftId] = select.value;
        } else {
          delete matches[p.leftId];
        }
        quizAnswers[q.id] = Object.assign({}, matches);
        var allMatched = q.pairs.every(function (x) { return matches[x.leftId]; });
        el.quizContinue.classList.toggle('visible', allMatched);
      });

      row.appendChild(label);
      row.appendChild(arrow);
      row.appendChild(select);
      el.quizOptions.appendChild(row);
    });
  }

  var wrapUpActive = false;

  function showWrapUp() {
    wrapUpActive = true;
    hideUI(['sceneControls']);
    cancelCountdown();
    var wrapQuestions = QUESTIONS.filter(function (q) { return !q.checkpoint; });
    if (wrapQuestions.length === 0) { wrapUpActive = false; showResults(); return; }
    var idx = 0;
    function showNext() {
      if (idx >= wrapQuestions.length) { wrapUpActive = false; showResults(); return; }
      hideUI(['sceneControls']);
      showQuiz(wrapQuestions[idx].id).then(function () {
        idx++;
        showNext();
      });
    }
    showNext();
  }

  function showResults() {
    quizFinished = true;
    hideTabWarning();
    var total = QUESTIONS.length;
    var pct = total > 0 ? Math.round((quizScore / total) * 100) : 0;
    el.resultsScore.textContent = quizScore + ' / ' + total;
    el.resultsPercentage.textContent = pct + '%';
    el.resultsReview.textContent = '';
    var correctCountEl = document.getElementById('resultsCorrectCount');
    var incorrectCountEl = document.getElementById('resultsIncorrectCount');
    if (correctCountEl) correctCountEl.textContent = quizScore;
    if (incorrectCountEl) incorrectCountEl.textContent = total - quizScore;

    QUESTIONS.forEach(function (q, i) {
      var div = document.createElement('div');
      div.className = 'results-question';
      var wasCorrect = false;

      var qText = document.createElement('div');
      qText.className = 'results-q-text';
      qText.textContent = (i + 1) + '. ' + q.question;
      div.appendChild(qText);

      var answerRow = document.createElement('div');
      answerRow.className = 'results-q-answers';

      if (q.type === 'single') {
        var userOptId = quizAnswers[q.id];
        var userOpt = q.options.find(function (o) { return o.id === userOptId; });
        var correctOpt = q.options.find(function (o) { return o.id === q.correctAnswer; });
        wasCorrect = userOptId === q.correctAnswer;
        var userDiv = document.createElement('div');
        userDiv.className = 'results-q-user ' + (wasCorrect ? 'correct' : 'incorrect');
        userDiv.textContent = 'Your answer: ' + (userOpt ? userOpt.text : 'Not answered');
        answerRow.appendChild(userDiv);
        if (!wasCorrect && correctOpt) {
          var correctDiv = document.createElement('div');
          correctDiv.className = 'results-q-correct';
          correctDiv.textContent = 'Correct answer: ' + correctOpt.text;
          answerRow.appendChild(correctDiv);
        }
      } else if (q.type === 'multi') {
        var selectedIds = quizAnswers[q.id] || [];
        var correctIds = q.correctAnswers.slice().sort().join(',');
        var selectedSorted = selectedIds.slice().sort().join(',');
        wasCorrect = correctIds === selectedSorted;
        var userDiv2 = document.createElement('div');
        userDiv2.className = 'results-q-user ' + (wasCorrect ? 'correct' : 'incorrect');
        var selectedTexts = selectedIds.map(function (sid) { var o = q.options.find(function (x) { return x.id === sid; }); return o ? o.text : sid; });
        userDiv2.textContent = 'Your answers: ' + (selectedTexts.length > 0 ? selectedTexts.join(', ') : 'None selected');
        answerRow.appendChild(userDiv2);
        if (!wasCorrect) {
          var correctDiv2 = document.createElement('div');
          correctDiv2.className = 'results-q-correct';
          var correctTexts = q.correctAnswers.map(function (cid) { var o = q.options.find(function (x) { return x.id === cid; }); return o ? o.text : cid; });
          correctDiv2.textContent = 'Correct answers: ' + correctTexts.join(', ');
          answerRow.appendChild(correctDiv2);
        }
      } else if (q.type === 'matching') {
        var userMatches = quizAnswers[q.id] || {};
        wasCorrect = true;
        q.pairs.forEach(function (p) {
          var matchDiv = document.createElement('div');
          var matchedRight = userMatches[p.leftId];
          var rightOpt = q.pairs.find(function (x) { return x.id === matchedRight; });
          var isMatchCorrect = matchedRight === p.rightId;
          if (!isMatchCorrect) wasCorrect = false;
          matchDiv.className = 'results-q-user ' + (isMatchCorrect ? 'correct' : 'incorrect');
          matchDiv.textContent = p.left + ' \u2192 ' + (rightOpt ? rightOpt.text : 'Not matched') + (isMatchCorrect ? ' \u2713' : ' \u2717');
          answerRow.appendChild(matchDiv);
        });
        if (!wasCorrect) {
          var correctDiv3 = document.createElement('div');
          correctDiv3.className = 'results-q-correct';
          var correctMatches = q.pairs.map(function (p) { return p.left + ' \u2192 ' + p.right; }).join('; ');
          correctDiv3.textContent = 'Correct matches: ' + correctMatches;
          answerRow.appendChild(correctDiv3);
        }
      }

      if (wasCorrect) div.classList.add('results-question-correct');
      else div.classList.add('results-question-incorrect');

      var explDiv = document.createElement('div');
      explDiv.className = 'results-q-explanation';
      explDiv.textContent = q.explanation;
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

  function formatDuration(ms) {
    var seconds = Math.floor(ms / 1000);
    if (seconds < 60) return seconds + ' second' + (seconds !== 1 ? 's' : '');
    var minutes = Math.floor(seconds / 60);
    var remainSec = seconds % 60;
    return minutes + ' minute' + (minutes !== 1 ? 's' : '') + (remainSec > 0 ? ' ' + remainSec + ' second' + (remainSec !== 1 ? 's' : '') : '');
  }

  function createTabWarningOverlay() {
    var overlay = document.createElement('div');
    overlay.id = 'tabWarningOverlay';
    overlay.className = 'tab-overlay';
    overlay.setAttribute('role', 'alert');
    overlay.setAttribute('aria-modal', 'true');
    overlay.innerHTML = '<div class="tab-overlay-content">' +
      '<div class="tab-overlay-icon" aria-hidden="true">!</div>' +
      '<div class="tab-overlay-title">TAB CHANGE DETECTED</div>' +
      '<div class="tab-overlay-text">You have left the quiz. Tab changes are being monitored and logged.</div>' +
      '<div class="tab-overlay-subtext" id="tabAwayTimer"></div>' +
      '<div class="tab-overlay-warning">Returning after more than 5 minutes will restart the quiz.</div>' +
      '</div>';
    document.body.appendChild(overlay);
    return overlay;
  }

  function createReasonModal() {
    var overlay = document.createElement('div');
    overlay.id = 'reasonModal';
    overlay.className = 'tab-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', 'Explain your absence');
    overlay.innerHTML = '<div class="tab-overlay-content">' +
      '<div class="tab-overlay-title">YOU WERE AWAY</div>' +
      '<div class="tab-overlay-text" id="reasonAwayDuration"></div>' +
      '<div class="tab-overlay-subtext">Please explain or justify why you were away:</div>' +
      '<textarea id="reasonInput" class="reason-input" rows="3" maxlength="500" placeholder="Enter your reason here..." aria-label="Reason for absence"></textarea>' +
      '<div class="reason-error" id="reasonError" role="alert"></div>' +
      '<div class="tab-overlay-actions">' +
      '<button type="button" id="reasonSubmit" class="tab-overlay-btn">SUBMIT REASON</button>' +
      '</div>' +
      '</div>';
    document.body.appendChild(overlay);
    return overlay;
  }

  function createStartWarning() {
    var overlay = document.createElement('div');
    overlay.id = 'startWarningOverlay';
    overlay.className = 'tab-overlay';
    overlay.setAttribute('role', 'alertdialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', 'Quiz integrity notice');
    overlay.innerHTML = '<div class="tab-overlay-content">' +
      '<div class="tab-overlay-icon" aria-hidden="true">!</div>' +
      '<div class="tab-overlay-title">QUIZ INTEGRITY NOTICE</div>' +
      '<div class="tab-overlay-text">This quiz monitors tab and window focus to ensure academic integrity.</div>' +
      '<div class="tab-overlay-rules">' +
      '<div class="tab-overlay-rule">Tab changes are logged with timestamps and duration</div>' +
      '<div class="tab-overlay-rule">Being away for more than 5 minutes will auto-restart the quiz</div>' +
      '<div class="tab-overlay-rule">You may be asked to explain any absence</div>' +
      '<div class="tab-overlay-rule">All activity is included in the results sent to your teacher</div>' +
      '</div>' +
      '<div class="tab-overlay-actions">' +
      '<button type="button" id="startWarningAcknowledge" class="tab-overlay-btn">I UNDERSTAND</button>' +
      '</div>' +
      '</div>';
    document.body.appendChild(overlay);
    return overlay;
  }

  var tabWarningOverlay = null;
  var tabAwayTimerInterval = null;

  function showTabWarning() {
    if (!tabWarningOverlay) tabWarningOverlay = createTabWarningOverlay();
    tabWarningOverlay.classList.add('visible');
    var timerEl = document.getElementById('tabAwayTimer');
    if (timerEl) timerEl.textContent = '';
    if (tabAwayTimerInterval) clearInterval(tabAwayTimerInterval);
    tabAwayTimerInterval = setInterval(function () {
      if (tabLeftAt > 0 && timerEl) {
        var elapsed = Date.now() - tabLeftAt;
        timerEl.textContent = 'Away for: ' + formatDuration(elapsed);
        if (elapsed >= TAB_AUTO_RESTART_MS) {
          clearInterval(tabAwayTimerInterval);
          tabAwayTimerInterval = null;
          handleAutoRestart();
        }
      }
    }, 1000);
  }

  function hideTabWarning() {
    if (tabWarningOverlay) tabWarningOverlay.classList.remove('visible');
    if (tabAwayTimerInterval) {
      clearInterval(tabAwayTimerInterval);
      tabAwayTimerInterval = null;
    }
  }

  var reasonModal = null;
  var reasonSubmitHandler = null;

  function showReasonModal(duration) {
    return new Promise(function (resolve) {
      if (!reasonModal) reasonModal = createReasonModal();
      var durationEl = document.getElementById('reasonAwayDuration');
      var inputEl = document.getElementById('reasonInput');
      var errorEl = document.getElementById('reasonError');
      var submitEl = document.getElementById('reasonSubmit');
      if (durationEl) durationEl.textContent = 'You were away for ' + formatDuration(duration) + '.';
      if (inputEl) inputEl.value = '';
      if (errorEl) errorEl.textContent = '';
      reasonModal.classList.add('visible');
      if (inputEl) inputEl.focus();
      if (reasonSubmitHandler) submitEl.removeEventListener('click', reasonSubmitHandler);
      reasonSubmitHandler = function () {
        var reason = (inputEl ? inputEl.value : '').trim();
        if (!reason) {
          if (errorEl) errorEl.textContent = 'Please enter a reason before submitting.';
          if (inputEl) inputEl.focus();
          return;
        }
        reasonModal.classList.remove('visible');
        resolve(reason);
      };
      submitEl.addEventListener('click', reasonSubmitHandler);
    });
  }

  function handleAutoRestart() {
    cheatingDetected = true;
    hideTabWarning();
    tabChangeLog.push({ type: 'auto-restart', timestamp: new Date().toISOString(), duration: TAB_AUTO_RESTART_MS, message: 'Quiz auto-restarted due to absence exceeding 5 minutes' });
    cancelCountdown();
    clearCaptions();
    stopNarration();
    quizAnswers = {};
    quizLocked = {};
    quizScore = 0;
    quizCompleted = 0;
    quizActive = false;
    wrapUpActive = false;
    transitioning = false;
    autoAdvanceActive = true;
    storyStarted = false;
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
    tabLeftAt = 0;
    showAutoRestartMessage();
  }

  function showAutoRestartMessage() {
    var overlay = document.createElement('div');
    overlay.id = 'autoRestartOverlay';
    overlay.className = 'tab-overlay';
    overlay.setAttribute('role', 'alertdialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.innerHTML = '<div class="tab-overlay-content">' +
      '<div class="tab-overlay-icon" aria-hidden="true">!</div>' +
      '<div class="tab-overlay-title">QUIZ RESTARTED</div>' +
      '<div class="tab-overlay-text">You were away for more than 5 minutes. The quiz has been restarted from the beginning.</div>' +
      '<div class="tab-overlay-subtext">This incident has been logged.</div>' +
      '<div class="tab-overlay-actions">' +
      '<button type="button" id="autoRestartAcknowledge" class="tab-overlay-btn">RESTART QUIZ</button>' +
      '</div>' +
      '</div>';
    document.body.appendChild(overlay);
    overlay.classList.add('visible');
    document.getElementById('autoRestartAcknowledge').addEventListener('click', function () {
      overlay.remove();
      transitionToScene(0, true);
    });
  }

  var visibilityChangeCount = 0;

  document.addEventListener('visibilitychange', function () {
    if (document.hidden) {
      if (!storyStarted || quizActive || quizFinished || el.resultsOverlay.classList.contains('visible') || el.emailOverlay.classList.contains('visible')) return;
      tabLeftAt = Date.now();
      showTabWarning();
      if (el.srLive) el.srLive.textContent = 'You have left the quiz tab. Tab changes are being monitored.';
    } else {
      var leftAt = tabLeftAt;
      tabLeftAt = 0;
      hideTabWarning();
      if (!storyStarted || quizActive || quizFinished || el.resultsOverlay.classList.contains('visible') || el.emailOverlay.classList.contains('visible')) return;
      if (leftAt > 0) {
        awayDuration = Date.now() - leftAt;
        visibilityChangeCount++;
        var logEntry = { type: 'tab-return', timestamp: new Date().toISOString(), duration: awayDuration, index: visibilityChangeCount };
        if (awayDuration >= TAB_AUTO_RESTART_MS) {
          logEntry.type = 'auto-restart-trigger';
          tabChangeLog.push(logEntry);
          handleAutoRestart();
          return;
        }
        if (awayDuration >= TAB_WARNING_THRESHOLD_MS) {
          showReasonModal(awayDuration).then(function (reason) {
            awayReason = reason;
            logEntry.reason = reason;
            tabChangeLog.push(logEntry);
            if (el.srLive) el.srLive.textContent = 'Reason recorded. You may continue the quiz.';
          });
        } else {
          logEntry.reason = 'Brief absence (under 5 seconds)';
          tabChangeLog.push(logEntry);
        }
      }
    }
  });

  var lastFocusedElement = null;

  function openEmailResults() {
    hideTabWarning();
    lastFocusedElement = document.activeElement;
    el.emailOverlay.classList.add('visible');
    el.emailError.textContent = '';
    el.emailTeacherName.value = '';
    el.emailTeacherEmail.value = '';
    el.emailStudentName.value = '';
    el.emailSend.disabled = false;
    el.emailSend.textContent = 'OPEN EMAIL APP';
    setTimeout(function () { el.emailTeacherName.focus(); }, 100);
  }

  function closeEmailResults() {
    el.emailOverlay.classList.remove('visible');
    if (lastFocusedElement) lastFocusedElement.focus();
  }

  var RESULT_API = '/api/create-result';

  function readApiResponse(res, fallbackMessage) {
    return res.text().then(function (text) {
      var data;
      try {
        data = text ? JSON.parse(text) : {};
      } catch (e) {
        throw new Error('The quiz server returned an HTML page instead of JSON. Please open the quiz through the deployed worker URL, not a static file server.');
      }
      if (!res.ok) throw new Error(data.error || fallbackMessage);
      return data;
    });
  }

  function createVerifiedResult(studentName) {
    var answers = QUESTIONS.map(function (q, index) {
      if (q.type === 'single') {
        var selectedIdx = q.options.findIndex(function (o) { return o.id === quizAnswers[q.id]; });
        return { questionIndex: index, answerIndex: selectedIdx >= 0 ? selectedIdx : -1, questionId: q.id, type: 'single', selectedId: quizAnswers[q.id] || null };
      } else if (q.type === 'multi') {
        var selectedIds = quizAnswers[q.id] || [];
        return { questionIndex: index, answerIndex: -1, questionId: q.id, type: 'multi', selectedIds: selectedIds };
      } else if (q.type === 'matching') {
        var userMatches = quizAnswers[q.id] || {};
        return { questionIndex: index, answerIndex: -1, questionId: q.id, type: 'matching', matches: userMatches };
      }
      return { questionIndex: index, answerIndex: -1, questionId: q.id };
    });
    return fetch(RESULT_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentName: studentName, answers: answers })
    }).then(function (res) {
      return readApiResponse(res, 'Could not create verified results.');
    });
  }

  function getResultData(studentName) {
    var total = QUESTIONS.length;
    var pct = total > 0 ? Math.round((quizScore / total) * 100) : 0;
    var answerLines = QUESTIONS.map(function (q, i) {
      var userAnswer = quizAnswers[q.id];
      var answerText = '';
      var isCorrect = false;
      if (q.type === 'single') {
        var opt = q.options.find(function (o) { return o.id === userAnswer; });
        answerText = opt ? opt.text : 'Not answered';
        isCorrect = userAnswer === q.correctAnswer;
      } else if (q.type === 'multi') {
        var selected = userAnswer || [];
        var texts = selected.map(function (sid) { var o = q.options.find(function (x) { return x.id === sid; }); return o ? o.text : sid; });
        answerText = texts.length > 0 ? texts.join(', ') : 'None selected';
        var correctSet = q.correctAnswers.slice().sort().join(',');
        var selectedSet = selected.slice().sort().join(',');
        isCorrect = correctSet === selectedSet;
      } else if (q.type === 'matching') {
        var matches = userAnswer || {};
        var matchTexts = q.pairs.map(function (p) {
          var rightOpt = q.pairs.find(function (x) { return x.id === matches[p.leftId]; });
          return p.left + ' \u2192 ' + (rightOpt ? rightOpt.text : 'Not matched');
        });
        answerText = matchTexts.join('; ');
        isCorrect = q.pairs.every(function (p) { return matches[p.leftId] === p.rightId; });
      }
      return { question: q, answerText: answerText, isCorrect: isCorrect, index: i };
    });
    return { studentName: studentName, score: quizScore, total: total, pct: pct, answers: answerLines, completedAt: new Date().toISOString() };
  }

  function createResultDownload() {
    var studentName = sanitizeInput(el.downloadStudentName.value);
    el.downloadError.textContent = '';
    if (!studentName) {
      el.downloadError.textContent = 'Please enter your name.';
      el.downloadStudentName.focus();
      return;
    }
    el.downloadSubmit.disabled = true;
    el.downloadSubmit.textContent = 'PREPARING...';
    createVerifiedResult(studentName).then(function (data) {
      var result = getResultData(studentName);
      var answerRows = result.answers.map(function (a) {
        return '<tr><td>' + (a.index + 1) + '</td><td>' + escapeHtml(a.question.question) + '</td><td>' + escapeHtml(a.answerText) + '</td><td class="' + (a.isCorrect ? 'correct' : 'incorrect') + '">' + (a.isCorrect ? 'Correct' : 'Incorrect') + '</td></tr>';
      }).join('');
      var verifyUrl = data.verifyUrl;
      var qrUrl = 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=' + encodeURIComponent(verifyUrl);
      var documentText = '<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Glycolysis Results - ' + escapeHtml(studentName) + '</title><style>body{font-family:Arial,sans-serif;max-width:900px;margin:40px auto;padding:0 20px;color:#17202a}h1{margin-bottom:4px}p{line-height:1.5}.score{font-size:32px;font-weight:700;margin:24px 0}table{border-collapse:collapse;width:100%;margin-top:24px}th,td{border:1px solid #c9d0d6;padding:10px;text-align:left;vertical-align:top}th{background:#eef2f4}.correct{color:#D7FF5F;font-weight:700}.incorrect{color:#a33a2e;font-weight:700}.verify{margin-top:28px;padding:16px;background:#f1f5f5;border-left:4px solid #D7FF5F}.code{font:700 20px monospace;letter-spacing:1px}.qr{margin:16px 0}img{max-width:150px}</style></head><body><h1>Glycolysis Quiz Results</h1><p>Student: ' + escapeHtml(studentName) + '</p><div class="score">Score: ' + data.score + ' / ' + data.total + ' (' + result.pct + '%)</div><p>Completed: ' + escapeHtml(new Date(data.completedAt).toLocaleString()) + '</p><table><thead><tr><th>#</th><th>Question</th><th>Answer</th><th>Result</th></tr></thead><tbody>' + answerRows + '</tbody></table><div class="verify"><strong>Verification code</strong><div class="code">' + escapeHtml(data.verificationCode) + '</div><div class="qr"><img src="' + qrUrl + '" alt="QR code linking to verification page"></div><p>Verify this result online: <a href="' + escapeHtml(verifyUrl) + '">' + escapeHtml(verifyUrl) + '</a></p><p>The online verification record is authoritative. Changes to this file will not change the server-verified result.</p></div></body></html>';
      var blob = new Blob([documentText], { type: 'text/html;charset=utf-8' });
      var link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = data.resultId.toLowerCase() + '-results.html';
      document.body.appendChild(link);
      link.click();
      URL.revokeObjectURL(link.href);
      link.remove();
      el.downloadSubmit.disabled = false;
      el.downloadSubmit.textContent = 'DOWNLOAD FILE';
      el.downloadOverlay.classList.remove('visible');
      if (lastFocusedElement) lastFocusedElement.focus();
    }).catch(function (err) {
      el.downloadError.textContent = err.message || 'Could not create verified results.';
      el.downloadSubmit.disabled = false;
      el.downloadSubmit.textContent = 'DOWNLOAD FILE';
    });
  }

  function openDownloadResults() {
    hideTabWarning();
    lastFocusedElement = document.activeElement;
    el.downloadOverlay.classList.add('visible');
    el.downloadError.textContent = '';
    el.downloadStudentName.value = '';
    el.downloadSubmit.disabled = false;
    el.downloadSubmit.textContent = 'DOWNLOAD FILE';
    setTimeout(function () { el.downloadStudentName.focus(); }, 100);
  }

  function closeDownloadResults() {
    el.downloadOverlay.classList.remove('visible');
    if (lastFocusedElement) lastFocusedElement.focus();
  }

  function sendEmailResults() {
    var teacherName = sanitizeInput(el.emailTeacherName.value);
    var teacherEmail = sanitizeInput(el.emailTeacherEmail.value);
    var studentName = sanitizeInput(el.emailStudentName.value);
    el.emailError.textContent = '';
    if (!teacherName) { el.emailError.textContent = "Please enter your teacher's name."; el.emailTeacherName.focus(); return; }
    if (!teacherEmail) { el.emailError.textContent = 'Please enter your teacher\'s email address.'; el.emailTeacherEmail.focus(); return; }
    if (!isValidEmail(teacherEmail)) { el.emailError.textContent = 'Please enter a valid email address.'; el.emailTeacherEmail.focus(); return; }
    if (!studentName) { el.emailError.textContent = 'Please enter your name.'; el.emailStudentName.focus(); return; }
    el.emailSend.disabled = true;
    el.emailSend.textContent = 'OPENING EMAIL...';
    createVerifiedResult(studentName).then(function (data) {
      var result = getResultData(studentName);
      var answerLines = result.answers.map(function (a) {
        return (a.index + 1) + '. ' + a.answerText + (a.isCorrect ? ' (Correct)' : ' (Incorrect)');
      }).join('\n');
      var body = 'Hello ' + teacherName + ',\n\n' +
        studentName + ' completed the Glycolysis quiz.\n\n' +
        'Score: ' + data.score + ' / ' + data.total + ' (' + result.pct + '%)\n' +
        'Completed: ' + new Date(data.completedAt).toLocaleString() + '\n' +
        'Verification code: ' + data.verificationCode + '\n' +
        'Verify this result: ' + data.verifyUrl + '\n\n' +
        'Answer summary:\n' + answerLines + '\n\n' +
        'The verification link is the authoritative record. The student may attach the downloaded results file separately.\n\n' +
        'Regards,\n' + studentName;
      window.location.href = 'mailto:' + encodeURIComponent(teacherEmail) +
        '?subject=' + encodeURIComponent('Glycolysis Quiz Results - ' + studentName) +
        '&body=' + encodeURIComponent(body);
      el.emailError.textContent = '';
      el.emailSend.textContent = 'EMAIL APP OPENED';
      el.emailSend.disabled = false;
      setTimeout(closeEmailResults, 1200);
    }).catch(function (err) {
      var msg = err.message || 'Could not send email.';
      if (msg.indexOf('Failed to fetch') !== -1 || msg.indexOf('NetworkError') !== -1) {
        msg = 'Network error. Please check your connection and try again.';
      }
      el.emailError.textContent = msg;
      el.emailSend.disabled = false;
      el.emailSend.textContent = 'OPEN EMAIL APP';
    });
  }

  async function transitionToScene(index, immediate) {
    if (quizActive) return;
    if (el.quizOverlay && el.quizOverlay.classList.contains('visible')) return;
    var currentScene = currentSceneIndex >= 0 ? scenes[currentSceneIndex] : null;
    if (currentScene && currentScene.quiz && !quizLocked[currentScene.quiz]) return;
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
    if (token !== sceneToken) { transitioning = false; return; }
    currentSceneIndex = index;
    el.stepCounter.textContent = 'GLYCOLYSIS';
    el.stepCounter.classList.add('visible');
    var phaseLabels = { intro: 'INTRODUCTION', investment: 'ENERGY INVESTMENT', payoff: 'ENERGY PAYOFF', accounting: 'SUMMARY', finale: 'FINALE' };
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
    if (scene.enzyme) { el.enzymeName.textContent = scene.enzyme; el.enzymeReaction.textContent = scene.reaction || ''; el.enzymeLabel.classList.add('visible'); }
    else { el.enzymeLabel.classList.remove('visible'); }
    if (scene.accounting) showAccounting(scene.accounting);
    else { el.accounting.classList.remove('visible'); el.accounting.textContent = ''; }
    if (scene.showEquation) showOverallEquation();
    else { el.overallEquation.classList.remove('visible'); }
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
      if (token !== sceneToken) { transitioning = false; return; }
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
    if (token !== sceneToken) { transitioning = false; return; }
    await wait(300);
    if (token !== sceneToken) { transitioning = false; return; }
    var seq = ++narrationSeqToken;
    el.btnStay.classList.remove('stay-active');
    autoAdvanceActive = true;
    playCaptions(scene.captions, function () {
      if (seq !== narrationSeqToken || token !== sceneToken) return;

      if (scene.quiz && !quizLocked[scene.quiz]) {
        showUI(['sceneControls']);
        showQuiz(scene.quiz).then(function () {
          if (token !== sceneToken) return;
          if (wrapUpActive) return;
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
        showWrapUp();
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
      quizFinished = false;
      wrapUpActive = false;
      transitioning = false;
      autoAdvanceActive = true;
      tabChangeLog = [];
      tabLeftAt = 0;
      awayDuration = 0;
      awayReason = '';
      cheatingDetected = false;
      visibilityChangeCount = 0;
      storyStarted = false;
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
      if (el.quizOverlay && el.quizOverlay.classList.contains('visible')) return;
      if (quizActive) return;
      switch (e.key) {
        case 'ArrowRight': case ' ':
          e.preventDefault(); cancelCountdown();
          if (currentSceneIndex < scenes.length - 1) transitionToScene(currentSceneIndex + 1);
          break;
        case 'ArrowLeft':
          e.preventDefault();
          if (currentSceneIndex > 0) transitionToScene(currentSceneIndex - 1);
          break;
        case 'n': case 'N': if (!e.ctrlKey && !e.metaKey && !e.altKey) el.btnNarration.click(); break;
        case 'r': case 'R': if (!e.ctrlKey && !e.metaKey && !e.altKey) el.btnRotate.click(); break;
        case 'h': case 'H': if (!e.ctrlKey && !e.metaKey && !e.altKey) el.btnHydrogen.click(); break;
        case 's': case 'S': if (!e.ctrlKey && !e.metaKey && !e.altKey) el.btnStay.click(); break;
        case 'p': case 'P': if (!e.ctrlKey && !e.metaKey && !e.altKey) togglePause(); break;
        case 'Escape': stopNarration(); break;
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
          item.appendChild(qText);
          var userAnswer = quizAnswers[q.id];
          var wasCorrect = false;
          if (q.type === 'single') {
            var opt = q.options.find(function (o) { return o.id === userAnswer; });
            wasCorrect = userAnswer === q.correctAnswer;
            var ansDiv = document.createElement('div');
            ansDiv.className = 'quiz-review-ans ' + (wasCorrect ? 'correct' : 'incorrect');
            ansDiv.textContent = 'Your answer: ' + (opt ? opt.text : 'Not answered');
            item.appendChild(ansDiv);
            if (!wasCorrect) {
              var corOpt = q.options.find(function (o) { return o.id === q.correctAnswer; });
              var corDiv = document.createElement('div');
              corDiv.className = 'quiz-review-cor';
              corDiv.textContent = 'Correct: ' + (corOpt ? corOpt.text : '');
              item.appendChild(corDiv);
            }
          } else if (q.type === 'multi') {
            var sel = userAnswer || [];
            var texts = sel.map(function (sid) { var o = q.options.find(function (x) { return x.id === sid; }); return o ? o.text : sid; });
            var correctSet = q.correctAnswers.slice().sort().join(',');
            var selSet = sel.slice().sort().join(',');
            wasCorrect = correctSet === selSet;
            var ansDiv2 = document.createElement('div');
            ansDiv2.className = 'quiz-review-ans ' + (wasCorrect ? 'correct' : 'incorrect');
            ansDiv2.textContent = 'Your answers: ' + (texts.length > 0 ? texts.join(', ') : 'None selected');
            item.appendChild(ansDiv2);
          } else if (q.type === 'matching') {
            var matches = userAnswer || {};
            wasCorrect = q.pairs.every(function (p) { return matches[p.leftId] === p.rightId; });
            q.pairs.forEach(function (p) {
          var rightOpt = q.pairs.find(function (x) { return x.id === matches[p.leftId]; });
          var isMatchCorrect = matches[p.leftId] === p.rightId;
          var matchDiv = document.createElement('div');
          matchDiv.className = 'quiz-review-ans ' + (isMatchCorrect ? 'correct' : 'incorrect');
          matchDiv.textContent = p.left + ' \u2192 ' + (rightOpt ? rightOpt.text : 'Not matched');
              item.appendChild(matchDiv);
            });
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
    if (el.resultsHomeBtn) {
      el.resultsHomeBtn.addEventListener('click', function () {
        window.location.href = '../index.html';
      });
    }
    if (el.resultsRestartBtn) {
      el.resultsRestartBtn.addEventListener('click', function () {
        el.resultsOverlay.classList.remove('visible');
        cancelCountdown();
        clearCaptions();
        stopNarration();
        quizAnswers = {};
        quizLocked = {};
        quizScore = 0;
        quizCompleted = 0;
        quizActive = false;
        quizFinished = false;
        wrapUpActive = false;
        transitioning = false;
        autoAdvanceActive = true;
        storyStarted = false;
        if (storyPaused) {
          storyPaused = false;
          el.btnPause.querySelector('span').textContent = 'PAUSE';
          el.btnPause.querySelector('path').setAttribute('d', 'M7 5v14M17 5v14');
          el.btnPause.classList.remove('paused-state');
          el.btnPause.setAttribute('aria-pressed', 'false');
          el.btnPause.setAttribute('aria-label', 'Pause story (P)');
        }
        el.emailOverlay.classList.remove('visible');
        el.quizOverlay.classList.remove('visible');
        if (currentMolKey) clearMolecule();
        el.viewport.style.opacity = '1';
        el.viewport.style.transform = '';
        transitionToScene(0, true);
      });
    }
    if (el.resultsEmailBtn) {
      el.resultsEmailBtn.addEventListener('click', openEmailResults);
    }
    if (el.resultsDownloadBtn) {
      el.resultsDownloadBtn.addEventListener('click', openDownloadResults);
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
    if (el.downloadCancel) {
      el.downloadCancel.addEventListener('click', closeDownloadResults);
    }
    if (el.downloadForm) {
      el.downloadForm.addEventListener('submit', function (e) {
        e.preventDefault();
        createResultDownload();
      });
    }
  }

  document.addEventListener('visibilitychange', function () {
    if (document.hidden) {
      atmosphereAnimating = false;
      try { if (viewer) viewer.spin(false); } catch (e) {}
    } else {
      if (!storyPaused && !quizActive) {
        if (currentSceneIndex >= 0 && scenes[currentSceneIndex] && scenes[currentSceneIndex].atmosphere) {
          startAtmosphereAnimation();
        }
        if (viewer && rotating) try { viewer.spin('y', .25); } catch (e) {}
      }
    }
  });

  async function showStartWarning() {
    return new Promise(function (resolve) {
      var overlay = createStartWarning();
      overlay.classList.add('visible');
      document.getElementById('startWarningAcknowledge').addEventListener('click', function () {
        overlay.classList.remove('visible');
        setTimeout(function () { overlay.remove(); }, 500);
        resolve();
      });
    });
  }

  function setupScrollbar() {
    var isMobile = window.innerWidth <= 768;
    var progressEl = null;
    var scrollbarEl = null;
    var thumbEl = null;
    if (isMobile) {
      progressEl = document.createElement('div');
      progressEl.className = 'scroll-progress';
      progressEl.setAttribute('aria-hidden', 'true');
      document.body.appendChild(progressEl);
    } else {
      scrollbarEl = document.createElement('div');
      scrollbarEl.className = 'custom-scrollbar';
      scrollbarEl.setAttribute('aria-hidden', 'true');
      thumbEl = document.createElement('div');
      thumbEl.className = 'custom-scrollbar-thumb';
      scrollbarEl.appendChild(thumbEl);
      document.body.appendChild(scrollbarEl);
    }
    function updateProgress() {
      var scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      var docHeight = document.documentElement.scrollHeight - window.innerHeight;
      var pct = docHeight > 0 ? Math.min(scrollTop / docHeight, 1) : 0;
      if (progressEl) {
        progressEl.style.width = (pct * 100) + '%';
      }
      if (thumbEl && scrollbarEl) {
        var barHeight = scrollbarEl.offsetHeight;
        var thumbHeight = thumbEl.offsetHeight;
        var maxTop = barHeight - thumbHeight;
        thumbEl.style.top = (pct * maxTop) + 'px';
      }
    }
    window.addEventListener('scroll', updateProgress, { passive: true });
    updateProgress();
  }

  async function init() {
    resizeAtmosphere();
    window.addEventListener('resize', resizeAtmosphere);
    initParticles();
    initViewer();
    if (!viewer) await ensureViewer();
    setupControls();
    setupNarrationControls();
    setupScrollbar();
    preload(['glucose', 'atp', 'adp', 'g6p', 'fbp', 'dhap', 'g3p']);
    await wait(800);
    await showStartWarning();
    storyStarted = true;
    transitionToScene(0, true);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

})();
