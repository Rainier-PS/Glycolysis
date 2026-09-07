(function () {
  'use strict';
  var V = window.GlycolysisViewer;
  if (!V) return;
  var grid = document.getElementById('molGrid');
  var buttons = [];

  function setActive(key) {
    buttons.forEach(function (b) {
      var active = b.getAttribute('data-key') === key;
      b.setAttribute('aria-checked', String(active));
      b.tabIndex = active ? 0 : -1;
    });
  }

  var btnH = document.getElementById('btnToggleH');
  var btnSpin = document.getElementById('btnToggleSpin');
  var btnReset = document.getElementById('btnReset');
  var nameEl = document.getElementById('viewerName');
  var formulaEl = document.getElementById('viewerFormula');
  var placeholder = document.getElementById('viewerPlaceholder');
  var initialized = false;
  var viewerGate = document.getElementById('viewerGate');
  var viewerContent = document.getElementById('viewerContent');
  var smallScreen = window.matchMedia('(max-width: 1024px)').matches;
  var isMobile = window.innerWidth <= 768 || /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  var rendererPromise = null;
  var initializationPromise = null;

  function loadRenderer() {
    if (rendererPromise) return rendererPromise;
    if (typeof $3Dmol !== 'undefined') return Promise.resolve();
    rendererPromise = new Promise(function (resolve, reject) {
      var script = document.createElement('script');
      script.src = 'vendor/3dmol/3Dmol-min.js';
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
    return rendererPromise;
  }

  async function selectMolecule(key) {
    if (!initialized) {
      if (!initializationPromise) {
        initializationPromise = loadRenderer().then(function () {
          V.init('viewer3d');
          initialized = true;
          if (isMobile) {
            btnSpin.setAttribute('aria-pressed', 'false');
          }
        });
      }
      await initializationPromise;
    }
    setActive(key);
    var mol = V.MOLECULE_MAP[key];
    if (mol) {
      placeholder.hidden = true;
      nameEl.hidden = false;
      formulaEl.hidden = false;
      nameEl.textContent = mol.name;
      formulaEl.textContent = mol.formula;
    }
    V.display(key);
  }

  function showViewer() {
    viewerGate.hidden = true;
    viewerContent.hidden = false;
    selectMolecule('glucose');
  }

  if (smallScreen) {
    viewerGate.hidden = false;
    viewerContent.hidden = true;
    document.getElementById('viewerContinue').addEventListener('click', showViewer);
    document.getElementById('viewerBack').addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  } else {
    showViewer();
  }

  V.MOLECULES.forEach(function (mol) {
    var btn = document.createElement('button');
    btn.className = 'mol-btn';
    btn.type = 'button';
    btn.setAttribute('role', 'radio');
    btn.setAttribute('aria-checked', 'false');
    btn.setAttribute('aria-label', mol.name + ', ' + mol.formula);
    btn.setAttribute('data-key', mol.key);
    btn.tabIndex = -1;
    btn.textContent = mol.name;
    var formula = document.createElement('span');
    formula.className = 'mol-btn-formula';
    formula.textContent = mol.formula;
    btn.appendChild(formula);
    btn.addEventListener('click', function () { selectMolecule(mol.key); });
    grid.appendChild(btn);
    buttons.push(btn);
  });

  btnH.addEventListener('click', function () {
    var on = V.toggleHydrogens();
    btnH.setAttribute('aria-pressed', String(on));
  });
  btnSpin.addEventListener('click', function () {
    var on = V.toggleAutoRotate();
    btnSpin.setAttribute('aria-pressed', String(on));
  });
  btnReset.addEventListener('click', function () { V.resetView(); });

  grid.addEventListener('keydown', function (e) {
    var idx = buttons.indexOf(document.activeElement);
    if (idx < 0) return;
    var next = -1;
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight' || e.key === 'j') { next = Math.min(idx + 1, buttons.length - 1); }
    else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft' || e.key === 'k') { next = Math.max(idx - 1, 0); }
    else if (e.key === 'Home') { next = 0; }
    else if (e.key === 'End') { next = buttons.length - 1; }
    if (next >= 0) {
      e.preventDefault();
      buttons[next].focus();
      buttons[next].click();
    }
  });

})();
