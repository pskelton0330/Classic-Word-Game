# Classic Words — Playtest Findings

- **Game:** Classic Words, a Scrabble-style word game
- **Live site:** https://pskelton0330.github.io/Classic-Word-Game/
- **Repo:** https://github.com/pskelton0330/Classic-Word-Game
- **Reviewed commit:** `b27d974` ("Add Pat and Laura browser favicon", 2026-11-17)
- **Reviewer:** Muse, at Pat's request
- **Playtest:** 2026-11-17, 21:34–21:40 EST, live browser, 2-player Pass N Play as Pat vs. Laura
- **Source inspection:** 2026-11-18, live site source (`src.js`, `engine.js`, `index.html`, `style.css`, `words.txt`, `.github/workflows/pages.yml`) and a read-only clone of commit `b27d974`
- **Status of this file:** Findings only. No code was changed. Nothing in this file has been applied to the game.

## Verdict

The game is genuinely playable end to end and looks good. The core loop, scoring, word list, turn passing, and hidden-rack privacy screens all worked in the playtest. The findings below are mostly feedback and polish, not a broken game. The one item Pat has already decided on is F1's preview behaviour — see that finding, and do not change the preview without Pat.

## What was tested and worked

- Home page loaded cleanly, with the "Pat ♥ Laura Classic Words" banner and a single "Create New Game" button. No broken images or loading errors.
- Created a 2-player Pass N Play game, renamed the players Pat and Laura, and used the "I'm ready" privacy screens between turns.
- Pat played AXE across the centre star (A left of centre, X on the star, E right of it). Preview showed 20 points, which is correct: (1 + 8 + 1) × 2 for the centre Double Word. Play scored 20, the rack refilled to 7 tiles, and the turn passed to Laura.
- Laura played XU (U under the X). Preview 9, scored 9. Score after two plays: Pat 20, Laura 9.
- Tile-bag count was consistent: "Exchange 83" after the first 3-tile play and 82 after the second 1-tile play, from a 100-tile bag.
- Dictionary search: ENABLE and HELLO were found in the ENABLE game word list. XYZQ, QUIZZIFY, and IU were "Not found in either list".
- Shuffle reordered Laura's rack (E-O-R-A-O-Y-O became O-R-O-O-E-A-Y). Recall returned staged tiles to the rack. Pass ended Pat's turn immediately and passed to Laura.
- The 15×15 board uses the classic premium layout (TW / DW / DL / TL and the centre star), is colourful and easy to read, and has + / Fit / − zoom controls on the right edge.
- The last-played tile keeps its score badge (20 on AXE's E, 9 on XU's U). Status messages such as "Pat passed" and "Laura scored 9" are clear.

## Verified as correct in the source

- Tile values and counts in `engine.js` are the standard set and sum to 100 tiles, including 2 blanks (`?`, value 0).
- Premium-square coordinates in `engine.js` match the classic layout, including the centre star at index 112.
- `scoreMove()` in `engine.js` applies letter premiums (DL ×2, TL ×3) only to newly placed tiles, applies word premiums (DW ×2, TW ×3) per word, and adds +50 for using all 7 tiles.
- `validateMove()` in `engine.js` checks, in order: at least one tile placed, tiles in one row or column, no gap, first word covers the centre star, later words connect to a tile already on the board, and every word of length > 1 formed by the play is in the lexicon. Its rejection reasons include: "Place at least one tile.", "Place tiles in one row or column.", "There is a gap in the word.", "The first word must cover the center star.", "Connect your play to a tile already on the board.", and ""{WORD}" is not in this word list."
- The full word list does load. `src.js` fetches `./words.txt` (ENABLE, filtered on load to 2–15 letters) and supplements it with the 107-word NWL2023 two-letter list. The file itself contains 172,823 entries; see F9.
- QUIZZIFY returning "not found" in the Dictionary is correct: it is not in `words.txt` / ENABLE. That is not a word-list gap.
- AI is a valid NWL2023 two-letter word. The AI play in the playtest was rejected because of the cross-word it created, IU, not because AI itself is invalid. See F1.

## Findings

### F1 — Invalid-play feedback: preview shows a potential score, Play rejects with a native alert

- **Severity:** Medium — the main finding. **Status:** Partly Pat-decided, see below.
- **Observed in playtest:** Two invalid plays were correctly not accepted, but clicking Play appeared to do nothing in the automated browser: no error, no toast, no shake, tiles just stayed staged.
  - G placed above the E of AXE, forming GE. Preview showed 5 points.
  - I placed below the A of AXE, forming AI, but creating the cross-word IU. Preview showed 6 points.
- **Root cause, confirmed in source (`src.js`, `scorePreview()`):** the preview calls `validateMove(before, placed, isFirst, {has: () => true})` — a fake lexicon that always says yes. It therefore never checks the dictionary, and returns a preview score whenever placement / geometry passes. A geometrically invalid placement shows no preview at all, which makes a dictionary-invalid play look valid by comparison.
- **Correction to the playtest:** `play()` in `src.js` *does* call `validateMove(before, placed, isFirst, dict)` with the real dictionary, and on failure does `return alert(v.reason)` — a native browser alert, with staged tiles left in place, no score, and the turn not advanced. That alert may have been suppressed / not surfaced in the automated playtest browser. Do **not** report the game as silent on all devices; on a real phone Pat / Laura may see the alert. Even so, a native alert is poor feedback: it disappears, leaves no in-page message, and the preview had already shown points.
- **No in-page feedback exists:** `toast`, `shake`, and `@keyframes` do not occur in `src.js` or `style.css`. The only `.error` style in `style.css` is used on the home screen when `words.txt` fails to load. All other failures in `src.js` use native `alert()` / `prompt()` (4 alerts, 1 prompt — see F6).
- **Pat's decision, 2026-11-18:** Pat does **not** mind the preview showing a score even for an invalid word. While building a word, the player gets an idea of what the score might be, and if it is not a valid word, Play simply does not finalize the move. **Do not change the preview to hide the score or mark invalid words without Pat changing this decision.**
- **Open question for the reviewing agent:** should `play()` replace `alert(v.reason)` with a persistent in-page error under the board (keeping staged tiles in place, plus an optional board shake), or should the native alert stay as is? Pat was asked this on 2026-11-18 and had not answered when this file was written.
- **Suggested fix if Pat chooses the in-page route:** in `play()`, render `v.reason` in a persistent `.error` area under the board, keep staged tiles, add a `.shake` keyframes animation in `style.css`. Verify after: stage GE and AI — preview still shows the potential score (per Pat), Play shows in-page ""GE" is not in this word list." / ""IU" is not in this word list." with tiles staged; a valid AXE across the centre still scores 20 and advances.

### F2 — No how-to-play anywhere

- **Severity:** Medium.
- **Observed:** Nothing on the home page, setup modal, or board explains how to place a tile, that the first word must cover the centre star, how the blank tile works, or what Exchange does. The only hint is the rack label "drag to rearrange and build a word", which says drag — but the playtest placed tiles by clicking a rack tile, then a board square, which worked reliably. A new player has to guess.
- **Confirmed in source:** "How to" / "how to" does not occur in `src.js`. No How to Play text exists in `src.js`.
- **Suggested fix:** a short How to Play screen / note, for example: tap a rack tile then a board square to place it; the first word must cover the centre star; later words must connect to tiles already on the board; words must be in the word list; Play scores letter values with DL / TL and DW / TW premiums, +50 for using all 7 tiles; Pass ends your turn without scoring.

### F3 — Dictionary is easy to misread

- **Severity:** Low–medium.
- **Observed:** the browseable Dictionary list is only two-letter words, with no word count or browseable longer words, so a casual user could conclude only two-letter words are in the game. The full ENABLE list is only reachable through the search box.
- **Confirmed in source (`src.js`, `dictionary()`):** the browseable groups are built from `NWL_TWO_LETTER` only, labelled "All 107 official NWL 2023 two-letter words. Tap a letter to filter." The search box checks `NWL_TWO_SET` first, then `enableDict`, and otherwise reports "{WORD} was not found in either game word list."
- **Suggested fix:** label the browseable list clearly as two-letter words only, and add a line / count stating the full game list size (ENABLE words loaded, 2–15 letters), so the search box is not the only evidence the full list exists.

### F4 — Pass has no confirmation

- **Severity:** Low–medium.
- **Observed:** Pat passed immediately on one click; the turn went to Laura. One accidental click ends your turn.
- **Confirmed in source (`src.js`, action handler):** `case 'pass': if (state.staged.length) recall(); state.scoreless++; state.history.push(...) ; advance();` — no confirmation dialog. Staged tiles are silently recalled first. `confirm(` does not occur anywhere in `src.js`.
- **Suggested fix (optional):** confirm "Pass your turn? Any staged tiles will be recalled." before passing.

### F5 — Leave has no confirmation, but the game is resumable

- **Severity:** Low / observation only, not a bug.
- **Observed:** not tested in the playtest.
- **Confirmed in source:** the "Leave" button is `data-action="home"`, handled as `case 'home': home();`. State is saved to `localStorage` under key `classic-game-v2`, and `home()` shows an "Active Games" / resume option when `state.started && !state.over`. Leaving therefore should not lose a game in progress. The reviewing agent should confirm this in a live test before adding a confirmation dialog, if one is wanted at all.

### F6 — Native `alert()` / `prompt()` used for all in-game feedback

- **Severity:** Low–medium, UX / mobile.
- **Confirmed in source (`src.js`):** 4 `alert(` calls and 1 `prompt(` call, no `confirm(`:
  - `start()`: "Select at least two players."
  - `place()`: "That square is already occupied. Choose an empty square."
  - `play()`: `alert(v.reason)` — see F1.
  - `exchange()`: "You need at least seven tiles in the bag to exchange."
  - `place()` for a blank tile (`?`): `prompt('Choose a letter for your blank (A?Z)')` — if the player cancels or enters a non-letter, the function returns and the rack tile is left in place, which is correct behaviour, but the prompt itself is a native dialog with no in-game explanation of how blanks work.
- **Suggested fix:** replace these with in-page messages / pickers over time, starting with F1 if Pat chooses it. This is a polish item, not a correctness bug.

### F7 — Minor Dictionary / board-zoom glitch, observed once

- **Severity:** Low.
- **Observed in playtest:** on first opening the Dictionary, the search box still showed an earlier search term. Closing it once left the board briefly scrolled / zoomed so the top row was cut off; it recovered.
- **Status:** observed once in the automated browser, not reproduced or confirmed in source. Do not treat as a confirmed bug without a live reproduction. The playtest also initially mis-placed the E of AXE one square to the right when clicking by element reference; placing it again by clicking the visible square worked, so that was the tester's clicking error, not a game bug.

### F8 — Scoreless-turn / end-of-game threshold — question, not a confirmed bug

- **Severity:** Low / question for the reviewing agent.
- **Confirmed in source (`src.js`, `advance()`):** the game ends when `state.scoreless >= players().length * 2`. For a 2-player game that is 4 consecutive scoreless turns. Both Pass and Exchange increment `scoreless`; a successful play resets it to 0.
- **Question:** is 4 scoreless turns (2-player) the intended rule? Standard Scrabble ends after 6 consecutive scoreless turns. If 4 is intentional for a faster casual game, no change is needed — just confirm it is deliberate. If it is not, the threshold should be revisited.
- **Related, confirmed:** `finishGame()` deducts each player's leftover rack tiles from their score and awards the total to the player who emptied their rack, which is the standard end-of-game adjustment.

### F9 — `words.txt` is larger than the list the game loads

- **Severity:** Informational.
- **Confirmed:** `words.txt` contains 172,823 entries, with lengths from 2 to 28 letters. `src.js` loads it with the filter `/^[a-z]{2,15}$/i`, so only 2–15-letter words enter `enableDict`. Longer entries in the file are therefore unused by the game. Not a bug — just a note if the file is ever trimmed or the length limit is ever revisited.

### F10 — Duplicate GitHub Pages workflows

- **Severity:** Low / deployment hygiene.
- **Observed:** every push triggers both the custom `.github/workflows/pages.yml` ("Deploy website to GitHub Pages") and the built-in "pages build and deployment" workflow, both deploying the same site.
- **Incident, 2026-11-17:** the custom deploy run 44165681699 for commit `c8a52cc` ("Personalize Classic Words home banner") failed in 9 seconds; only `actions/deploy-pages@v4` failed, with "No artifacts named 'github-pages' were found" / "Fetching artifact metadata failed… Please re-run the deployment at a later time." The previous four runs had succeeded, and the same commit's built-in pages build and deploy both succeeded. The live site already showed the new "Pat ♥ Laura Classic Words" banner, so no code change was needed and the failure looked transient.
- **Do not delete either workflow without Pat's say-so.** Pat was asked on 2026-11-17 whether to investigate the duplication and had not answered when this file was written. The re-run link for the failed run is https://github.com/pskelton0330/Classic-Word-Game/actions/runs/44165681699

### F11 — Mobile viewport disables OS pinch zoom

- **Severity:** Low / accessibility consideration.
- **Confirmed in `index.html`:** `<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no,viewport-fit=cover">`. `maximum-scale=1, user-scalable=no` prevents the browser's own pinch zoom. The game provides its own + / Fit / − board zoom controls, so this may be intentional, but it is worth a deliberate decision rather than a default.

## Not tested

The following were **not** tested in the playtest and are not covered by the findings above:

- Dragging tiles (click-to-place was used; drag code exists in `src.js`: `beginDrag`, `moveGhost`, `dropAt`, etc.)
- Exchange (button and `completeExchange()` exist; the bag-count check in `exchange()` was not exercised)
- The blank tile (`?`) in a live game (the `prompt()` path in `place()` was not exercised)
- Leave, 3–4 player games, board zoom buttons, the Moves List tab in the Dictionary, end-of-game scoring in a live game, or mobile / small-screen layout

## Suggested order, if Pat wants changes

1. Decide F1's open question: keep the native alert, or replace it with a persistent in-page error. Do not change the preview (Pat's decision).
2. Add a short How to Play (F2).
3. Add a Pass confirmation (F4), and clarify the Dictionary browse list (F3).
4. Confirm whether the scoreless-turn threshold (F8) and the `user-scalable=no` viewport (F11) are intentional.
5. Leave the duplicate Pages workflows alone (F10) unless Pat asks.

## How to verify a fix

- Stage GE and AI in a test game. Preview should still show the potential score (per Pat). Play should show in-page ""GE" is not in this word list." / ""IU" is not in this word list." (or the native alert, if that is kept) and leave the tiles staged.
- Play a valid AXE across the centre star. It should still score 20 and advance to the next player.
- Check the live site after deploy shows the change.
