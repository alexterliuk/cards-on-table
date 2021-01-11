import { isArray } from './value-checkers.js';
import getRandomFloor from './get-random-floor.js';

const getRandomElementFromArray = arr => {
  if (!isArray(arr)) return;

  const idx = getRandomFloor(0, arr.length);
  return arr[idx];
};

export default getRandomElementFromArray;
