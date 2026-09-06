# Glycolysis Story Page — Implementation Documentation

## File Locations

- **HTML**: `story/index.html`
- **CSS**: `story/story.css`
- **JavaScript**: `story/story.js`
- **Shared 3Dmol**: `../vendor/3dmol/3Dmol-min.js`
- **Shared molecules**: `../molecules/`

See `project.md` for overall project architecture and `MASTER.md` for the canonical comprehensive reference.

## Scene System

27 scenes defined in the `scenes` array in `story.js`. Each scene has:
- `id` — unique identifier
- `phase` — intro, investment, payoff, accounting, downstream, finale
- `molecule` — which molecule to display (or null)
- `camera` — zoom/spin configuration
- `captions` — array of `{text, duration, deep}` objects
- `enzyme` / `reaction` — displayed during reaction scenes
- `perReaction` / `timesPerGlucose` — accounting data
- `accounting` — summary accounting display
- `atmosphere` — cell visualization state
- `preloads` — molecules to preload
- `autoAdvanceDelay` — auto-advance timing

Scene controls (countdown + BACK/STAY/NEXT) appear after captions complete on every scene, including non-molecule scenes.

## Molecular Viewer

- `MOL` object defines 15 molecules with name, formula, path, cid, desc
- `showMolecule(key)` loads SDF, fades in via `#molFade`, renders ball-and-stick
- `molTransitionSeq` token prevents stale callbacks from modifying newer state
- `updateMolAria(key)` populates `#srMolDesc` for screen readers
- `#viewport` has `aria-describedby="srMolDesc"`
- Hydrogen toggle via H button/key
- Rotation toggle via AUTO button/R key
- Reset via RESET button

## Narration

- Web Speech API with English voice preference
- `narrationSeqToken` incremented on each `stopNarration()`
- `speakNarration(text, onEnd, seq)` verifies token in onend, onerror, and try/catch
- Toggle via NARRATION button or N key
- Captions: sequential `{text, duration, deep}` per scene

## Scene Transitions

`transitionToScene(index, immediate)` handles:
- Phase-based fade overlay
- Molecule loading with token protection
- Scene-token guard after `await showMolecule()`
- Camera transitions (zoom scale reset on non-molecule scenes so previous scene zoom does not leak)
- Caption/narration sequencing
- Auto-advance countdown

## Controls

| Control | Button | Keyboard |
|---------|--------|----------|
| Next | NEXT | ArrowRight, Space |
| Previous | BACK | ArrowLeft |
| Stay | STAY | S |
| Narration | NARRATION | N |
| Rotation | AUTO | R |
| Hydrogens | H | H |
| Stop narration | — | Escape |

Letter shortcuts are ignored when Ctrl, Meta, or Alt is held.

## Accessibility

- `#srLive` (aria-live="polite"): narrative announcements
- `#srMolDesc` (role="img"): dynamic molecule description
- `#countdownText` (role="timer"): no screen-reader spam
- All buttons have aria-label
- Skip link visible on focus
- `--muted` (`#98A1AD`) is the minimum-contrast text color; `--faint` is aliased to it so no UI text falls below 4.5:1
- Hidden-until-active toolbars toggle `visibility` together with `opacity`, so off-screen controls are never keyboard-reachable while invisible
- Touch targets minimum 44px on primary controls (`.sctrl`, `.nar-btn`); small auxiliary buttons (`.vtb`) are keyboard-operable

## Responsive

`@media (max-width: 768px)` adjusts positions and sizes. Safe-area insets for notched devices.

## Performance

- SDF caching with deduplication
- `visibilitychange` stops narration/rotation when hidden
- Demand-driven atmosphere animation
- Molecule cache for instant transitions
- Failed SDF loads are retried on the next attempt instead of being permanently poisoned

## Loading/Failure

- Loading screen with animated dots
- `#molFallback` for failed molecule loads
- SDF retry on next attempt
- Documentary continues even if molecule fails

## Navigation

- Back to main viewer: "VIEWER" link in narration controls
- Uses `<a href="../index.html">`

## Known Limitations

1. Speech synthesis varies by browser
2. Linear documentary flow (no click-to-jump)
3. Atmosphere is 2D canvas overlay
4. Browser validation not yet performed

## Maintenance

### Adding a Molecule
1. Place SDF in `molecules/<key>/<key>.sdf`
2. Add entry to `MOL` in `story.js`
3. Reference key in scene `molecule` property

### Modifying Narration
Edit `captions` array in scene objects.

### Modifying Scenes
Edit `scenes` array. Do not change scientific content or reaction sequence.
