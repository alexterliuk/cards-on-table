import getRandomElementFromArray from './utils/get-random-element-from-array.js';

const shuffleArrayOfUniqueValues = arr => {
  const shuffled = [];

  while (arr.length) {
    const item = getRandomElementFromArray(arr);
    shuffled.push(item);
    arr = arr.filter(c => c !== item);
  }

  return shuffled;
};

export default shuffleArrayOfUniqueValues;
