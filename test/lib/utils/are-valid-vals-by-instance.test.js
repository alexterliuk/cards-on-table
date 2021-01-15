import { strictEqual as equal } from 'assert';
import Card from '../../../src/game/inventory/card.js';
import areValidValsByInstance from '../../../src/lib/utils/are-valid-vals-by-instance.js';

describe(`areValidValsByInstance`, () => {
  describe(`returns undefined`, () => {
    it(`if got not array as arr, or/and not function as klass`, () => {
      equal(areValidValsByInstance(''), undefined);
      equal(areValidValsByInstance([], null), undefined);
    });
  });

  describe(`returns true`, () => {
    it(`if arr is empty and allowEmptyArr is truthy`, () => {
      // prettier-ignore
      equal(areValidValsByInstance([], () => {}, true), true);
    });

    it(`if all values in arr belong to the same class`, () => {
      const card1 = new Card('ace', 11, 'spades', 100);
      const card2 = new Card('king', 10, 'hearts', 90);
      const card3 = new Card('four', 4, 'clubs', 10);
      equal(areValidValsByInstance([card1, card2, card3], Card), true);
    });
  });

  describe(`returns false`, () => {
    it(`if arr is empty and allowEmptyArr is falsy`, () => {
      // prettier-ignore
      equal(areValidValsByInstance([], () => {}), false);
    });

    it(`if any value doesn't belong to the same class as other values belong`, () => {
      const card1 = new Card('ace', 11, 'spades', 100);
      const card2 = new Card('king', 10, 'hearts', 90);
      const card3 = new Card('four', 4, 'clubs', 10);
      equal(areValidValsByInstance([card1, card2, {}, card3], Card), false);
    });
  });
});
