import { isArray, isFunction } from './value-checkers';

/**
 * @param {array} arr
 * @param {function} klass - class to check whether val is instance of it
 * @param {boolean} allowEmptyArr - should empty arr be evaluated to true
 * @returns {undefined|boolean}
 */
const areValidValsByInstance = (arr, klass, allowEmptyArr) => {
  if (!isArray(arr) || !isFunction(klass)) return;
  if (allowEmptyArr && !arr.length) return true;
  if (arr.length) {
    return arr.every(c => c instanceof klass);
  }
  // in case if arr is empty array
  return false;
};

export default areValidValsByInstance;
