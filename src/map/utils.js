/*
 * map.utils
 * Utility functions
 */
map.utils.genKey = function(x, y) {
  return ['', Math.round(x), Math.round(y)].join('_');
};