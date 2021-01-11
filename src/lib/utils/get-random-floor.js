import getRandomNumberInRange from './get-random-number-in-range.js';

/**
 * @param {number} start
 * @param {number} end
 */
const getRandomFloor = (start, end) => {
  return Math.floor(getRandomNumberInRange(start, end));
};

export default getRandomFloor;
