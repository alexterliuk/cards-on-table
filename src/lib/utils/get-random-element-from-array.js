import { isArray } from './value-checkers';
import getRandomFloor from './get-random-floor';

const getRandomElementFromArray = arr => {
  if (!isArray(arr)) return;

  const idx = getRandomFloor(0, arr.length);
  return arr[idx];
};

export default getRandomElementFromArray;
