import { areNumbers } from './value-checkers';

/**
 * Creates a number within specified range.
 * Automatically defines which num is min, and which is max.
 *   @returns {number} - floating number from min to max (excluding min and max), or 0.
 */
function getRandomNumberInRange(num1, num2) {
  if (!areNumbers(num1, num2)) return 0;

  let min = Math.min(num1, num2),
    max = min === num1 ? num2 : num1;
  let range = max - min;

  return min + Math.random() * range;
}

export default getRandomNumberInRange;
