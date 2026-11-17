import test from 'node:test';
import assert from 'node:assert/strict';
import { COUNTS, VALUES, newBag, validateMove, scoreMove } from '../engine.js';

const lexicon = new Set(['AT', 'CAT', 'TO', 'IT']);
const tile = (letter) => ({ letter, value: VALUES[letter] });
const playTile = (index, letter) => ({ index, tile: tile(letter) });
const emptyBoard = () => Array(225).fill(null);

test('new bag has the standard 100 tiles and expected distribution', () => {
  const bag = newBag(() => 0.5);
  assert.equal(bag.length, 100);
  for (const [face, count] of Object.entries(COUNTS)) {
    assert.equal(bag.filter((t) => t.face === face).length, count, face);
  }
});

test('first play must cover the center and form a valid word', () => {
  const board = emptyBoard();
  assert.equal(
    validateMove(board, [playTile(112, 'A'), playTile(113, 'T')], true, lexicon).ok,
    true,
  );
  assert.equal(
    validateMove(board, [playTile(111, 'A'), playTile(112, 'T')], true, lexicon).reason,
    'The first word must cover the center star.',
  );
});

test('rejects invalid words, gaps, diagonal plays, and duplicate squares', () => {
  const board = emptyBoard();
  assert.equal(
    validateMove(board, [playTile(112, 'A'), playTile(113, 'Z')], true, lexicon).ok,
    false,
  );
  assert.equal(
    validateMove(board, [playTile(112, 'A'), playTile(114, 'T')], true, lexicon).reason,
    'There is a gap in the word.',
  );
  assert.equal(
    validateMove(board, [playTile(97, 'A'), playTile(113, 'T')], true, lexicon).reason,
    'Place tiles in one row or column.',
  );
  assert.equal(
    validateMove(board, [playTile(112, 'A'), playTile(112, 'T')], true, lexicon).ok,
    false,
  );
});

test('later plays must connect to the existing board', () => {
  const board = emptyBoard();
  board[112] = tile('A');
  assert.equal(validateMove(board, [playTile(113, 'T')], false, lexicon).ok, true);
  assert.equal(
    validateMove(board, [playTile(80, 'T')], false, lexicon).reason,
    'Connect your play to a tile already on the board.',
  );
});

test('checks every word created by a crossing play', () => {
  const board = emptyBoard();
  board[112] = tile('A');
  board[98] = tile('C');
  board[128] = tile('T');
  const result = validateMove(board, [playTile(113, 'T')], false, lexicon);
  assert.equal(result.ok, false);
  assert.match(result.reason, /CTT/);
});

test('scores double letter, double word, and triple word premiums', () => {
  const board = emptyBoard();
  const dl = [playTile(3, 'A'), playTile(4, 'T')];
  assert.equal(scoreMove(board, dl, [{ cells: [3, 4] }]), 3);

  const dw = [playTile(112, 'A'), playTile(113, 'T')];
  assert.equal(scoreMove(board, dw, [{ cells: [112, 113] }]), 4);

  const tw = [playTile(7, 'A'), playTile(8, 'T')];
  assert.equal(scoreMove(board, tw, [{ cells: [7, 8] }]), 6);
});

test('adds the 50 point bonus when all seven rack tiles are played', () => {
  const board = emptyBoard();
  const placements = Array.from({ length: 7 }, (_, i) => playTile(106 + i, 'A'));
  assert.equal(scoreMove(board, placements, [{ cells: placements.map((p) => p.index) }]), 71);
});
