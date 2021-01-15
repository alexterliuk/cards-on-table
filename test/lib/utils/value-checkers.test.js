import { strictEqual as equal, throws } from 'assert';
import {
  isObject,
  isRegExp,
  areStrings,
  areNumbers,
  isInfinity,
  getType,
  getPositiveIntegerOrZero,
} from '../../../src/lib/utils/value-checkers.js';

const areAllValsFalse = (func, vals) => {
  return !vals.map(v => func(v)).filter(v => v).length;
};

describe(`Value checkers`, () => {
  describe(`isObject`, () => {
    it(`returns true if got an object`, () => {
      equal(isObject({}), true);
    });

    it(`returns false if got smth else`, () => {
      // prettier-ignore
      const smthElse = [null, 1, [], /ff/, '', () => {}, 1n, false, true, undefined];
      equal(areAllValsFalse(isObject, smthElse), true);
    });
  });

  describe(`isRegExp`, () => {
    it(`returns true if got RegExp`, () => {
      equal(isRegExp(/a/), true);
    });

    it(`returns false if got smth else`, () => {
      // prettier-ignore
      const smthElse = [null, 1, [], {}, '', () => {}, 1n, false, true, undefined];
      equal(areAllValsFalse(isRegExp, smthElse), true);
    });
  });

  describe(`areStrings`, () => {
    it(`returns true if got strings only`, () => {
      equal(areStrings('', 'ff', String(4)), true);
    });

    // prettier-ignore
    it(`returns false if got smth else`, () => {  
      const res1 = areStrings(null, 1, [], {}, /f/, () => {}, 1n, false, true, undefined);
      equal(res1, false);
      const res2 = areStrings([null, 1, [], {}, /f/, () => {}, 1n, false, true, undefined]);
      equal(res2, false);
    });
  });

  describe(`areNumbers`, () => {
    it(`returns true if got numbers only`, () => {
      equal(areNumbers(1, 0, Number('14'), Infinity), true);
    });

    // prettier-ignore
    it(`returns false if got smth else`, () => {  
      const res1 = areNumbers(null, 1, [], {}, /f/, () => {}, 1n, false, true, undefined);
      equal(res1, false);
      const res2 = areNumbers([null, 1, [], {}, /f/, () => {}, 1n, false, true, undefined]);
      equal(res2, false);
    });
  });

  describe(`isInfinity`, () => {
    it(`returns true if got Infinity`, () => {
      equal(isInfinity(Infinity), true);
    });

    it(`returns false if got smth else`, () => {
      // prettier-ignore
      const smthElse = [null, 1, [], {}, '', () => {}, 1n, false, true, undefined];
      equal(areAllValsFalse(isInfinity, smthElse), true);
    });
  });

  describe(`getType`, () => {
    it(`returns correct types for values, namely such types:
        'object', 'array', 'number', 'Infinity', 'string', 'regexp', 'function', 'boolean', 'undefined`, () => {
      equal(getType({}), 'object');
      equal(getType([]), 'array');
      equal(getType(0), 'number');
      equal(getType(Infinity), 'Infinity');
      equal(getType('f'), 'string');
      equal(getType(/o/), 'regexp');
      equal(
        getType(() => {}),
        'function'
      );
      equal(getType(false), 'boolean');
      equal(getType(undefined), 'undefined');
      equal(getType(), 'undefined');
    });
  });

  describe(`getPositiveIntegerOrZero`, () => {
    it(`returns positive integer if got floating number above 0 (rounded by floor)`, () => {
      equal(getPositiveIntegerOrZero(2.3), 2);
      equal(getPositiveIntegerOrZero(1.3), 1);
      equal(getPositiveIntegerOrZero(5.00001), 5);
      equal(getPositiveIntegerOrZero(7.99993), 7);
    });

    it(`returns the same positive integer if got it`, () => {
      equal(getPositiveIntegerOrZero(2), 2);
      equal(getPositiveIntegerOrZero(143), 143);
      equal(getPositiveIntegerOrZero(174825), 174825);
    });

    it(`returns 0 if got negative number`, () => {
      equal(getPositiveIntegerOrZero(-2.3), 0);
      equal(getPositiveIntegerOrZero(-1.3), 0);
      equal(getPositiveIntegerOrZero(-5.00001), 0);
    });

    it(`returns 0 if got -0`, () => {
      equal(getPositiveIntegerOrZero(-0), 0);
    });
  });
});
