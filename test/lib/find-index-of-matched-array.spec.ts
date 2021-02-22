import { strictEqual as equal } from 'assert';
import findIndexOfMatchedArray from '../../src/lib/find-index-of-matched-array';

const findIdx = findIndexOfMatchedArray;

describe(`findIndexOfMatchedArray`, () => {
  it(`returns -1 if got two empty arrays`, () => {
    equal(findIdx([], []), -1);
  });

  it(`finds matched array - i.e. searchIn array has array with same values and same length
      as in arrToFind, order is not important - and returns index of that matched array;
      NB: each arr should not contain duplicate values`, () => {
    const arr1 = [
      [14, 29, 36],
      [true, false],
      ['bla', 'wla'],
    ];
    equal(findIdx(arr1, [true, false]), 1);
    equal(findIdx(arr1, [false, true]), 1);

    const arr2 = [
      [14, 29, 36],
      [true, false],
      [{ x: 'x' }, { y: 'y' }],
    ];
    equal(findIdx(arr2, [{ x: 'x' }, { y: 'y' }]), -1);
    equal(findIdx(arr2, [{ y: 'y' }, { x: 'x' }]), -1);

    const x = { x: 'x' };
    const y = { y: 'y' };
    const arr3 = [
      [14, 29, 36],
      [true, false],
      [x, y],
    ];
    equal(findIdx(arr3, [x, y]), 2);
    equal(findIdx(arr3, [y, x]), 2);
    equal(findIdx(arr3, [y]), -1);
  });
});
