import { strictEqual as equal, throws } from 'assert';
import Suit from '../../../src/game/inventory/suit.js';

describe(`Suit`, () => {
  describe(`new Suit('diamonds', [['ace', 11, 8], ['ten', 10, 7]])`, () => {
    it(`creates diamonds suit with only two cards`, () => {
      const suit = new Suit('diamonds', [
        ['ace', 11, 8],
        ['ten', 10, 7],
      ]);
      equal(suit.name, 'diamonds');
      equal(suit.cards.length, 2);
      equal(suit.cards[0].name, 'ace');
      equal(suit.cards[1].name, 'ten');
    });
  });

  describe(`new Suit is not created with invalid name param`, () => {
    it(`it throws`, () => {
      throws(() => new Suit());
      throws(() => new Suit(14));
    });
  });
});
