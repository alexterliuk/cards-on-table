import { strictEqual as equal } from 'assert';
import flatArrays from '../../../src/lib/utils/flat-arrays';

describe(`flatArrays`, () => {
  it(`flats one level of nesting if no toLevel param given`, () => {
    const arr1 = [14];
    const arr2 = [1, [2]];
    const arr3 = [['a', ['b']]];
    const [one, two, three] = flatArrays(null, arr1, arr2, arr3);

    equal(one.length, 1);
    equal(one[0], 14);
    equal(two.length, 2);
    equal(two[0], 1);
    equal(two[1], 2);
    equal(three.length, 2);
    equal(three[0], 'a');
    equal(Array.isArray(three[1]), true);
  });

  // prettier-ignore
  it(`flats desired qty of nesting levels if toLevel param given`, () => {
    const arr1 = [
      ['a',
        ['b'],
        [['c']],
      ],
    ];
    const [one] = flatArrays(2, arr1);

    equal(one.length, 3);
    equal(one[0], 'a');
    equal(one[1], 'b');
    equal(Array.isArray(one[2]), true);

    const arr2 = [
      [
        [[[[['a']]]]],
        [[[[[[[[[[[[[[[[[[[['b']]]]]]]]]]]]]]]]]]]],
      ],
    ];
    const [two] = flatArrays(100, arr2);

    equal(two.length, 2);
    equal(two[0], 'a');
    equal(two[1], 'b');
  });
});
