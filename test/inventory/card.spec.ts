import { strictEqual as equal, throws } from 'assert';
import Card from '../../src/inventory/card';

describe(`Card`, () => {
  describe(`new Card('ace', 11, 'spades', 8)`, () => {
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
    it(`it throws`, () => {
      // @ts-expect-error: expected 4 arguments
      throws(() => new Card());
      // @ts-expect-error: expected 4 arguments
      throws(() => new Card(14));
      // @ts-expect-error: expected 4 arguments
      throws(() => new Card('ace', 'f'));
      // @ts-expect-error: expected 4 valid arguments
      throws(() => new Card('ace', 11, 'spades', false));
    });
  });

  describe(`opens, closes card`, () => {
    const card = new Card('ten', 10, 'clubs', 7);
    it(`opens`, () => {
      equal(card.opened, false);
      card.open();
      equal(card.opened, true);
    });

    it(`closes`, () => {
      equal(card.opened, true);
      card.close();
      equal(card.opened, false);
    });
  });
});
