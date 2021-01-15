import { isArray } from './utils/value-checkers.js'
import getRandomElementFromArray from './utils/get-random-element-from-array.js';

const shuffleArrayOfUniqueValues = arr => {
  if (!isArray(arr)) return [];
  const shuffled = [];

  while (arr.length) {
    const item = getRandomElementFromArray(arr);
    shuffled.push(item);
    arr = arr.filter(c => c !== item);
  }

  return shuffled;
};

export default shuffleArrayOfUniqueValues;
