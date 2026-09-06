(function () {
  'use strict';

  var MOLECULES = [
    { key: 'glucose', name: '\u03B2-D-glucopyranose', formula: 'C\u2086H\u2081\u2082O\u2086', category: 'substrate' },
    { key: 'glucose-6-phosphate', name: '\u03B2-D-glucose 6-phosphate(2\u2212)', formula: 'C\u2086H\u2081\u2081O\u2089P\u00B2\u2212', category: 'substrate' },
    { key: 'fructose-6-phosphate', name: '\u03B2-D-fructofuranose 6-phosphate', formula: 'C\u2086H\u2081\u2081O\u2089P\u00B2\u2212', category: 'substrate' },
    { key: 'fructose-1-6-bisphosphate', name: 'D-fructose-1,6-bisphosphate', formula: 'C\u2086H\u2081\u2084O\u2081\u2082P\u2082', category: 'substrate' },
    { key: 'dhap', name: 'Dihydroxyacetone phosphate', formula: 'C\u2083H\u2087O\u2086P', category: 'substrate' },
    { key: 'glyceraldehyde-3-phosphate', name: 'D-glyceraldehyde 3-phosphate', formula: 'C\u2083H\u2085O\u2086P\u00B2\u2212', category: 'substrate' },
    { key: '1-3-bisphosphoglycerate', name: 'D-1,3-bisphosphoglycerate', formula: 'C\u2083H\u2086O\u2081\u2080P\u2082\u00B2\u2212', category: 'substrate' },
    { key: '3-phosphoglycerate', name: '3-phosphoglycerate', formula: 'C\u2083H\u2087O\u2087P', category: 'substrate' },
    { key: '2-phosphoglycerate', name: '2-phosphoglycerate', formula: 'C\u2083H\u2087O\u2087P', category: 'substrate' },
    { key: 'phosphoenolpyruvate', name: 'Phosphoenolpyruvate', formula: 'C\u2083H\u2085O\u2086P', category: 'substrate' },
    { key: 'pyruvate', name: 'Pyruvate(\u2212)', formula: 'C\u2083H\u2083O\u2083\u2212', category: 'substrate' },
    { key: 'atp', name: 'ATP(4\u2212)', formula: 'C\u2081\u2080H\u2081\u2082N\u2085O\u2081\u2083P\u2083\u2074\u2212', category: 'cofactor' },
    { key: 'adp', name: 'ADP(3\u2212)', formula: 'C\u2081\u2080H\u2081\u2082N\u2085O\u2081\u2080P\u2082\u00B3\u2212', category: 'cofactor' },
    { key: 'nad-plus', name: '\u03B2-NAD\u207A', formula: 'C\u2082\u2081H\u2082\u2087N\u2087O\u2081\u2084P\u2082\u207A', category: 'cofactor' },
    { key: 'nadh', name: 'NADH', formula: 'C\u2082\u2081H\u2082\u2089N\u2087O\u2081\u2084P\u2082', category: 'cofactor' }
  ];

  var MOLECULE_MAP = {};
  MOLECULES.forEach(function (m) { MOLECULE_MAP[m.key] = m; });

  var sdfCache = {};
  var sdfPending = {};

  function loadSDF(key) {
    if (sdfCache[key]) return Promise.resolve(sdfCache[key]);
    if (sdfPending[key]) return sdfPending[key];
    var p = fetch('molecules/' + key + '/' + key + '.sdf')
      .then(function (r) { if (!r.ok) throw new Error('SDF fetch failed: ' + key); return r.text(); })
      .then(function (t) { sdfCache[key] = t; delete sdfPending[key]; return t; })
      .catch(function () { delete sdfPending[key]; return null; });
    sdfPending[key] = p;
    return p;
  }

  var viewer = null;
  var container = null;
  var currentKey = null;
  var showHydrogens = false;
  var autoRotate = true;
  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function applyStyle() {
    if (!viewer) return;
    try {
      viewer.setStyle({ elem: 'C' }, { sphere: { scale: 0.28, colorscheme: 'Jmol' }, stick: { radius: 0.07, colorscheme: 'Jmol' } });
      viewer.setStyle({ elem: 'O' }, { sphere: { scale: 0.32, colorscheme: 'Jmol' }, stick: { radius: 0.07, colorscheme: 'Jmol' } });
      viewer.setStyle({ elem: 'N' }, { sphere: { scale: 0.30, colorscheme: 'Jmol' }, stick: { radius: 0.07, colorscheme: 'Jmol' } });
      viewer.setStyle({ elem: 'P' }, { sphere: { scale: 0.36, colorscheme: 'Jmol' }, stick: { radius: 0.08, colorscheme: 'Jmol' } });
      viewer.setStyle({ elem: 'H' }, showHydrogens
        ? { sphere: { scale: 0.22, colorscheme: 'Jmol' }, stick: { radius: 0.06, colorscheme: 'Jmol' } }
        : { hidden: true });
    } catch (e) { }
  }

  function init(containerId) {
    container = document.getElementById(containerId);
    if (!container) return false;
    if (typeof $3Dmol === 'undefined') {
      container.innerHTML = '<div class="mol-viewer-error" role="alert"><p>Molecular renderer unavailable.</p></div>';
      return false;
    }
    viewer = $3Dmol.createViewer(container, { backgroundColor: 0x050709, antialias: true, disableFog: true });
    return true;
  }

  function display(key) {
    if (!viewer || !MOLECULE_MAP[key]) return Promise.resolve(false);
    return loadSDF(key).then(function (sdf) {
      if (!sdf || currentKey === key) return !!sdf;
      try {
        viewer.removeAllModels();
        viewer.addModel(sdf, 'sdf');
        applyStyle();
        viewer.zoomTo();
        viewer.zoom(0.92);
        viewer.render();
        if (autoRotate && !reducedMotion) viewer.spin('y', 0.25);
        else viewer.spin(false);
        currentKey = key;
        return true;
      } catch (e) { return false; }
    });
  }

  function toggleHydrogens() {
    showHydrogens = !showHydrogens;
    applyStyle();
    if (viewer) viewer.render();
    return showHydrogens;
  }

  function toggleAutoRotate() {
    autoRotate = !autoRotate;
    if (viewer) {
      if (autoRotate && !reducedMotion) viewer.spin('y', 0.25);
      else viewer.spin(false);
    }
    return autoRotate;
  }

  function resetView() {
    if (!viewer) return;
    viewer.spin(false);
    viewer.zoomTo();
    viewer.zoom(0.92);
    viewer.render();
    if (autoRotate && !reducedMotion) viewer.spin('y', 0.25);
  }

  function getCurrentMolecule() {
    return currentKey ? MOLECULE_MAP[currentKey] : null;
  }

  window.GlycolysisViewer = {
    MOLECULES: MOLECULES,
    MOLECULE_MAP: MOLECULE_MAP,
    init: init,
    display: display,
    toggleHydrogens: toggleHydrogens,
    toggleAutoRotate: toggleAutoRotate,
    resetView: resetView,
    getCurrentMolecule: getCurrentMolecule
  };

})();
