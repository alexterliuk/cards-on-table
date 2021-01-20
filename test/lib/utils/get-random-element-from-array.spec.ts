import { strictEqual as equal } from 'assert';
import getRandomElementFromArray from '../../../src/lib/utils/get-random-element-from-array';

describe(`getRandomElementFromArray`, () => {
  describe(`returns undefined`, () => {
    it(`if got neither array, nor empty array`, () => {
      // @ts-expect-error: expected 1 argument
      equal(getRandomElementFromArray(), undefined);
      // @ts-expect-error: expected array
      equal(getRandomElementFromArray(true), undefined);
      equal(getRandomElementFromArray([]), undefined);
    });
  });

  describe(`returns random element`, () => {
    it(`if got not empty array`, () => {
      const arr = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
      const r1 = getRandomElementFromArray(arr);
      const r2 = getRandomElementFromArray(arr);
      const r3 = getRandomElementFromArray(arr);
      const r4 = getRandomElementFromArray(arr);
      const r5 = getRandomElementFromArray(arr);
      const results = [r1 !== r2, r2 !== r3, r3 !== r4, r4 !== r5, r5 !== r1];
      equal(results.includes(true), true);
    });
  });
});
