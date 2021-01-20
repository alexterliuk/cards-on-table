import { strictEqual as equal } from 'assert';
import getRandomNumberInRange from '../../../src/lib/utils/get-random-number-in-range';

describe(`getRandomNumberInRange`, () => {
  describe(`returns 0`, () => {
    it(`if got not number as 1st and/or 2nd arg`, () => {
      // @ts-expect-error: expected 2 arguments
      equal(getRandomNumberInRange(), 0);
      // @ts-expect-error: expected 2 arguments
      equal(getRandomNumberInRange(true), 0);
      // @ts-expect-error: expected only numbers
      equal(getRandomNumberInRange(14, ''), 0);
    });
  });

  describe(`returns random floating number`, () => {
    it(`within given range between num1 and num2
        (excluding num1 and num2; automatically finds which num is min, and which is max)`, () => {
      const r11 = getRandomNumberInRange(0, 1);
      const r12 = getRandomNumberInRange(0, 1);
      const r13 = getRandomNumberInRange(0, 1);
      const r14 = getRandomNumberInRange(0, 1);
      const r15 = getRandomNumberInRange(0, 1);
      equal(r11 > 0 && r11 < 1, true);
      equal(r12 > 0 && r12 < 1, true);
      equal(r13 > 0 && r13 < 1, true);
      equal(r14 > 0 && r14 < 1, true);
      equal(r15 > 0 && r15 < 1, true);

      const r21 = getRandomNumberInRange(-1, 1);
      const r22 = getRandomNumberInRange(-1, 1);
      const r23 = getRandomNumberInRange(-1, 1);
      const r24 = getRandomNumberInRange(-1, 1);
      const r25 = getRandomNumberInRange(-1, 1);
      equal(r21 > -1 && r21 < 1, true);
      equal(r22 > -1 && r22 < 1, true);
      equal(r23 > -1 && r23 < 1, true);
      equal(r24 > -1 && r24 < 1, true);
      equal(r25 > -1 && r25 < 1, true);

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
            if (i !== y) return r === q;
          }).length
      );
      // let maximum coincidences of the same floating number be 2,
      // though it is unlikely that even one coincidence might happen
      const sameFloatingNumberCoincidences = equals.filter(
        coincidences => coincidences > 0
      );
      // if one coincidence, arr is [1, 1], if more - length will be bigger
      equal(sameFloatingNumberCoincidences.length < 3, true);
    });
  });
});
