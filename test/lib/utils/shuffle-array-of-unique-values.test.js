import { strictEqual as equal } from 'assert';
import shuffleArrayOfUniqueValues from '../../../src/lib/shuffle-array-of-unique-values.js';

describe(`shuffleArrayOfUniqueValues`, () => {
  describe(`returns empty array`, () => {
    it(`if got not array or empty array`, () => {
      equal(shuffleArrayOfUniqueValues([]).length, 0);
      equal(shuffleArrayOfUniqueValues().length, 0);
    });
  });

  describe(`shuffles`, () => {
    it(`if got array with values`, () => {
      const arr = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
      const r1 = shuffleArrayOfUniqueValues(arr);
      const r2 = shuffleArrayOfUniqueValues(arr);
      const r3 = shuffleArrayOfUniqueValues(arr);
      const r4 = shuffleArrayOfUniqueValues(arr);
      const r5 = shuffleArrayOfUniqueValues(arr);

      const lengths = [r1, r2, r3, r4, r5].map(r => r.length);
      equal(lengths.filter(len => len !== 10).length, 0);

      const coincidencesOfValsByIndices = [];
      // compare vals in arrays by same idx
      [r1, r2, r3, r4, r5].forEach(res => {
        res.forEach((n, i) => {
          [r1, r2, r3, r4, r5].forEach(_res => {
            // do not compare same arrays
            if (res !== _res) {
              // this block is entered 200 times
              if (n === _res[i]) {
                coincidencesOfValsByIndices.push(n);
              }
            }
          });
        });
      });

      // let's believe it shuffles bad if there are > 50 coincidences,
      // though maximum only 32 coincidences was noticed ever while testing
      equal(coincidencesOfValsByIndices.length < 50, true);
    });
  });
});
