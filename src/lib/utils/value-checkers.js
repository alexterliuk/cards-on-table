/**
 * Collection of helper functions to check values.
 */

export const isNull = v => v === null;

export const isArray = v => Array.isArray(v);

export const isObject = v =>
  typeof v === 'object' && !isNull(val) && !isArray(val) && !isRegExp(val);

export const isRegExp = v =>
  typeof v !== 'undefined' && !isNull(v) && v.constructor.name === 'RegExp';

export const isError = v => isObject(v) && v.constructor.name === 'Error';

export const isString = v => typeof v === 'string';

export const areStrings = (...vals) =>
  !!vals.length && vals.every(v => isString(v));

export const isNumber = v => typeof v === 'number';

export const areNumbers = (...vals) =>
  !!vals.length && vals.every(v => isNumber(v));

export const isNaN = v => Number.isNaN(v);

export const isInfinity = v =>
  isNumber(v) && !isNaN(v) ? !Number.isFinite(v) : false;

export const isBoolean = v => typeof v === 'boolean';

export const isFunction = v => typeof v === 'function';

export const getType = v =>
  isNull(v)
    ? 'null'
    : isArray(v)
    ? 'array'
    : isNaN(v)
    ? 'NaN'
    : isInfinity(v)
    ? 'Infinity'
    : isRegExp(v)
    ? 'regexp'
    : typeof v;

export const getPositiveIntegerOrZero = v =>
  isNumber(v) && !isNaN(v) && Number.isFinite(v) && v >= 0 ? Math.floor(v) : 0;
