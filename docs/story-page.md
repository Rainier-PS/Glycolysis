# Glycolysis Story Page - Implementation Documentation

## File Locations

- **HTML**: `story/index.html`
- **CSS**: `story/story.css`
- **JavaScript**: `story/story.js`
- **Quiz Data**: `story/questions.js`
- **Shared 3Dmol**: `../vendor/3dmol/3Dmol-min.js`
- **Shared molecules**: `../molecules/`

See `project.md` for overall project architecture and `MASTER.md` for the canonical comprehensive reference.

## Story Structure

10 conceptual beats defined in the `scenes` array in `story.js`. Each scene has:
- `id` - unique identifier
- `phase` - intro, investment, payoff, accounting, finale
- `molecule` - which molecule to display (or null)
- `camera` - zoom/spin configuration
- `captions` - array of `{text, duration, deep}` objects
- `atmosphere` - cell visualization state
- `preloads` - molecules to preload
- `autoAdvanceDelay` - auto-advance timing
- `quiz` - quiz question ID to trigger after this beat (or null)
- `accounting` - summary accounting display
- `showEquation` - whether to show overall equation

### Beat Sequence

1. `cell` - Every living cell needs energy
2. `cytosol` - Glycolysis in the cytosol
3. `glucose` - Glucose and ATP introduction (Quiz Q1)
4. `investment` - ATP investment; glucose → G6P → F6P → FBP (Quiz Q2)
5. `split` - Six-carbon split into two G3P (Quiz Q3)
6. `nad-phase` - NAD+ → NADH electron transfer (Quiz Q4)
7. `payoff` - ATP generation (Quiz Q5)
8. `pyruvate` - Two pyruvate molecules
9. `accounting` - Net yield summary
10. `finale` - Broader context; triggers results screen

## Quiz System

### Data Architecture
- Questions defined in `story/questions.js` as `window.GLYCOLYSIS_QUESTIONS` array
- Each question has: `id`, `checkpoint`, `question`, `options`, `correctAnswer`, `explanation`, `knowledgeBoundary`, `difficulty`
- Rendering logic is in `story/story.js`

### Quiz Flow
1. After scene captions complete, if scene has a `quiz` property and it hasn't been answered yet
2. Narration stops; auto-advance pauses
3. Quiz overlay appears with question and 4 radio-button options
4. Learner selects answer; answer highlights
5. CONTINUE STORY button appears and receives focus
6. On continue: answer locks, correct/incorrect shown, explanation displayed
7. Learner reads explanation and clicks CONTINUE STORY to return to story

### State
- `quizAnswers` - object keyed by question ID, values are selected option indices
- `quizLocked` - object keyed by question ID, boolean whether answer is locked
- `quizScore` - number of correct answers
- `quizCompleted` - number of questions answered
- `quizActive` - whether quiz overlay is currently visible

## Results Screen

After the final beat (`finale`), the results screen shows:
- Score (e.g., "4 / 5")
- Percentage (e.g., "80%")
- Question-by-question review showing:
 - Question text
 - Learner's selected answer (green if correct, red if incorrect)
 - Correct answer (if wrong)
 - Explanation
- Actions: REVIEW STORY, REVIEW QUESTIONS, DOWNLOAD RESULTS, EMAIL RESULTS TO TEACHER

Downloaded results are generated from a server-signed record. The HTML file is editable presentation data; teachers should use its verification link or code as the authoritative result.

### Review Questions Flow
- Shows all questions inline with answers and explanations
- BACK TO RESULTS button returns to results screen

## Teacher Email

### Flow
1. EMAIL RESULTS TO TEACHER button opens email form overlay
2. Form collects: teacher name (required), teacher email (required), student name (required)
3. On submit: validates inputs, creates a signed result through the Worker, and opens the local email app with a prefilled `mailto:` message
4. The message includes the score, date, answer summary, verification code, and verification link
5. The student may attach the downloaded HTML report manually

### Input Handling
- All inputs trimmed, length-limited (200 chars name, 254 chars email)
- All fields required (teacher name, teacher email, student name)
- Control characters/newlines rejected via regex
- Email validated with /^[^\s@]+@[^\s@]+\.[^\s@]+$/
- textContent used for DOM insertion (no innerHTML for user input)
- Submit button shows an opening-email state during result creation
- Errors displayed via `#emailError` (role="alert")
- Network errors handled with user-friendly messages

### Anti-Cheat System

Signed result model prevents score edits from appearing valid:
- The Worker computes correctness from its fixed answer key
- Result records are signed with `RESULT_SIGNING_SECRET` and stored in Cloudflare KV
- Result creation and verification have separate rate limits
- Result records expire after one year
- The downloaded file and mailto message are editable; the online verification record is authoritative

### Tab Change Detection

Browser tab focus is monitored for academic integrity:
- Initial warning overlay explains monitoring rules before story begins
- Warning overlay appears when student leaves tab
- Reason input modal appears when student returns after 5+ seconds away
- Auto-restart if student away for more than 5 minutes
- All tab changes logged with timestamps, duration, and reasons
- The current mailto message includes the verification link; it does not send tab logs through a server email provider

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
- Quiz checkpoints intentionally pause narration

## Scene Transitions

`transitionToScene(index, immediate)` handles:
- Phase-based fade overlay
- Molecule loading with token protection
- Scene-token guard after `await showMolecule()`
- Camera transitions
- Caption/narration sequencing
- Auto-advance countdown
- Quiz trigger after captions complete
- Results screen trigger on finale beat

## Controls

### Keyboard
| Key | Action |
|---|---|
| Arrow Right / Space | Next scene |
| Arrow Left | Previous scene |
| N | Toggle narration |
| R | Toggle auto-rotation |
| H | Toggle hydrogen atoms |
| S | Stay on scene (cancel auto-advance) |
| P | Pause/resume story |
| Escape | Stop narration |

Keyboard shortcuts are disabled during quiz, results, or email overlays.

### Buttons
- HOME: Return to main page
- RESTART: Restart story from beginning (resets quiz state)
- NARRATION: Toggle voice narration
- PAUSE/PLAY: Pause/resume story
- AUTO: Toggle auto-rotation
- H: Toggle hydrogen visibility
- RESET: Reset camera view
- BACK/NEXT/STAY: Scene navigation

## Accessibility

- Skip link to `#mainContent`
- `#srLive` (aria-live="polite") for caption and quiz announcements
- `#srMolDesc` (role="img") for molecular viewer description
- Quiz options use radiogroup semantics
- Quiz feedback uses aria-live
- Results use semantic structure
- Email form has labels, validation errors announced via role="alert"
- Focus management: quiz continue button receives focus, email form manages focus
- No keyboard traps
- Reduced motion support
