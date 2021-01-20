import { strictEqual as equal, throws } from 'assert';
import Suit from '../../../src/game/inventory/suit';
import { SuitData } from '../../../src/game/data/deck-cards-data';

describe(`Suit`, () => {
  describe(`new Suit is created with valid data`, () => {
    it(`creates diamonds suit with only two cards`, () => {
      const suitData: SuitData = {
        name: 'diamonds',
        cardsData: [
          ['ace', 11, 8],
          ['ten', 10, 7],
        ],
      };
      const suit = new Suit(suitData);

      equal(suit.name, 'diamonds');
      equal(suit.cards.length, 2);
      equal(suit.cards[0].name, 'ace');
      equal(suit.cards[1].name, 'ten');
    });
  });

  describe(`new Suit is not created with invalid data`, () => {
    it(`it throws`, () => {
      // @ts-expect-error: expected 1 argument
      throws(() => new Suit());
      // @ts-expect-error: expected 1 valid argument
      throws(() => new Suit(14));
    });
  });
});
