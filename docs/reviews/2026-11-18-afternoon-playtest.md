# Classic Words — Afternoon Playtest Findings, 2026-11-18

- **Game:** Classic Words, a Scrabble-style word game
- **Live site:** https://pskelton0330.github.io/Classic-Word-Game/
- **Repo:** https://github.com/pskelton0330/Classic-Word-Game
- **Reviewed head:** `eb49deb`, 13:40 EST 2026-11-18 — 8 commits on main since `147d845`
- **Reviewer:** Muse, at Pat's request ("Check my classic game again", 2026-11-18)
- **Playtest:** 2026-11-18, 14:10–14:17 EST, live browser, 2-player Pass N Play as Pat vs. Laura (test browser only; Pat's own device game untouched)
- **Status of this file:** Findings only. No code was changed. Nothing in this file has been applied to the game. Draft prepared for Pat to approve before submitting as a note for the other agent, in the same way as PR #1.

## Verdict

The game is in good shape, and the new sign-in / shared features do not get in the way of just playing. The earlier invalid-play fix is verified live and behaves exactly as Pat wanted. The main new thing to know is a design warning, not a bug: the game keeps only one saved game, so starting a new game overwrites the one in progress.

## What changed since the morning check

- Shared dictionary via Supabase: custom words now sync across devices. `supabase/setup.sql` creates `shared_words` and `game_results` tables with row-level security. Anyone can read; only signed-in users can add words or remove their own.
- Shared scoreboards and game results: finished games now show a results screen (winner, final scores, scoring turns, best turn), and the home screen shows High Scores and Highest Point Scores leaderboards.
- Sign-in on the home screen: email + password, session remembered on the device, plus a set/change password option once signed in. The README says sign-ups are turned off and only invited accounts can write shared words.
- Two-letter word filter now matches a letter in either position.
- New iPhone home-screen icon.
- The `codex/engine-tests` branch exists with engine tests, but it has not been merged into main.

## Verified live in this playtest

- Home screen: sign-in card is present (email + password) but non-blocking — you can play without signing in. Leaderboards read "No scores yet. Finish a game while signed in to add one."
- New game, Pat vs. Laura: handoff screens worked every turn. TONED across the centre star scored 12, correct. FEE through the E scored 11, correct. Racks refilled to 7; bag count fell as expected.
- Invalid play: staging LC showed a preview of 16 while building it, then Play showed a persistent in-game message — `"LC" is not in this word list.` — with the tiles staying on the board. Recall cleared it. This is exactly the behaviour Pat wanted: the preview still shows a potential score for an invalid word, and Play simply does not finalize it.
- How to Play loads and matches how the game actually behaves.
- Dictionary: HELLO found in ENABLE, XYZQ not found. The two-letter list now filters by a letter in either position (Q gives just QI).
- Pass, Shuffle, and Recall all worked. Zoom controls work on desktop.

## New findings

### N1 — Only one saved game; starting a new game overwrites the in-progress one

- **Severity:** Medium — design warning, not a crash.
- **Observed / confirmed:** The game keeps a single saved game. Starting a new game overwrites whatever is in progress. Worth knowing before tapping Create New Game mid-game.
- **Note:** The test only overwrote the copy in the test browser, not Pat's game on his own device.
- **Question for the reviewing agent:** Is one saved game intentional, or should starting a new game warn / confirm when a game is in progress, or keep more than one saved game?

### N2 — Adding a custom word now requires signing in

- **Severity:** Low–medium — behaviour change to confirm.
- **Observed in code:** Adding a new custom word now requires sign-in; you cannot add one just locally any more, though words already added on a device still work.
- **Question:** Is that the intended trade-off for the shared dictionary, or should a local-only add still be possible when signed out?

### N3 — Leftover unused `sendHomeMagicLink` function

- **Severity:** Cosmetic.
- **Observed in code:** There is a leftover unused `sendHomeMagicLink` function on the home screen, since sign-in there is password-only now. Not a bug.

### N4 — Last play's score badge lingers on the board until the next play

- **Severity:** Cosmetic.
- **Observed in playtest:** The score badge from the last play stays visible on the board until the next play.

### N5 — At default zoom the board can be slightly taller than the window

- **Severity:** Cosmetic.
- **Observed in playtest:** At default zoom the board can be slightly taller than the window until the player scrolls or uses Fit.

## Not a bug yet — unverified

The playtest reported "Moves" and "Options" header buttons disappearing mid-session, and a "Create one" sign-up link on the home screen. Neither exists in `src.js` at head `eb49deb`, so that part does not line up with the code read. Treat it as unverified, not a confirmed bug, unless Pat sees it himself on his own device.

## Suggested order, if Pat wants changes

1. Decide N1: warn before overwriting an in-progress game, or keep one saved game as intentional.
2. Confirm N2: custom-word add requires sign-in — intentional for the shared dictionary, or restore a local-only path.
3. Remove the unused `sendHomeMagicLink` (N3) and clear the lingering score badge (N4) in a polish pass.
4. Leave the board-height point (N5) unless it reproduces on a phone.

## How to verify

- Play TONED across the centre star (should score 12) and FEE through the E (should score 11).
- Stage LC: preview should still show 16 while building; Play should show `"LC" is not in this word list.` in the game, with tiles staged.
- Start a game, leave it mid-game, then start another and confirm whether the first is overwritten.
