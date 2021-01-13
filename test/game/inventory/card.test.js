import { strictEqual as equal, throws } from 'assert';
import Card from '../../../src/game/inventory/card.js';

describe(`Card`, () => {
  describe(`Card('ace', 11, 'spades', 8)`, () => {
    it(`creates a card { name: 'ace', value: 11, suit: 'spades', rank: 8, opened: false }`, () => {
      const card = new Card('ace', 11, 'spades', 8);
      equal(card.name, 'ace');
      equal(card.value, 11);
      equal(card.suit, 'spades');
      equal(card.rank, 8);
      equal(card.opened, false);
      equal(Object.keys(card).length, 5);
    });
  });

  describe(`new Card is not created with invalid params`, () => {
    it(`it throws`, function () {
      throws(() => new Card());
      throws(() => new Card(14));
      throws(() => new Card('ace', 'f'));
      throws(() => new Card('ace', 11, 'spades', false));
    });
  });
});
