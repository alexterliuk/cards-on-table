import { strictEqual as equal } from 'assert';
import getRandomNumberInRange from '../../../src/lib/utils/get-random-number-in-range.js';

describe(`getRandomNumberInRange`, () => {
  describe(`returns 0`, () => {
    it(`if got not number as 1st and/or 2nd arg`, () => {
      equal(getRandomNumberInRange(), 0);
      equal(getRandomNumberInRange(true), 0);
      equal(getRandomNumberInRange(14, ''), 0);
    });
  });

  describe(`returns random floating number`, () => {
    it(`within given range between num1 and num2 (automatically finds which num is min, and which is max)`, () => {
      const r1 = getRandomNumberInRange(0, 1);
      equal(r1 >= 0 && r1 <= 1, true);

      const r2 = getRandomNumberInRange(-1, 1);
      equal(r2 >= -1 && r2 <= 1, true);

      const r3 = getRandomNumberInRange(-10, 10);
      equal(r3 >= -10 && r3 <= 10, true);

      const q1 = getRandomNumberInRange(1, 2);
      const q2 = getRandomNumberInRange(1, 2);
      const q3 = getRandomNumberInRange(1, 2);
      const q4 = getRandomNumberInRange(1, 2);
      const q5 = getRandomNumberInRange(1, 2);

      const results = [q1, q2, q3, q4, q5];
      const equals = results.map(
        (r, i) =>
          results.filter((q, y) => {
            // prevent comparing value with itself
            if (i !== y) return q === r;
          }).length
      );
      // let maximum coincidences of the same floating numbers be 2,
      // though it is unlikely that even one coincidence might happen
      const sameFloatingNumbersCoincidences = equals.filter(
        coincidences => coincidences > 0
      );
      // if one coincidence, arr is [1, 1], if more - length will be bigger
      equal(sameFloatingNumbersCoincidences.length < 3, true);
    });
  });
});
