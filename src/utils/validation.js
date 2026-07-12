import { SOURCES } from './constants.js';

const SOURCE_VALUES = Object.values(SOURCES);

export function getSourceNames() {
  return SOURCE_VALUES;
}

export function isValidSource(source) {
  return SOURCE_VALUES.includes(source);
}

export function invalidSourceMessage() {
  return `Invalid source. Use: ${SOURCE_VALUES.join(', ')}`;
}