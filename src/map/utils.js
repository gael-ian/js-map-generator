/*
 * map.utils
 * Utility functions
 */
map.utils.merge = function(a, b) {
  var b_keys = Object.keys(b);
  
  for(var i in b_keys){
    if (a[b_keys[i]] == null) {
      a[b_keys[i]] = b[b_keys[i]];
    }
  }
  return a;
};

map.utils.shuffle = function(o) {
    for(var j, x, i = o.length; i; j = parseInt(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
    return o;
};

map.utils.matrix = function(w, h) {
  var matrix = []
    , line   = []
    ;
  for (var i = 0; i < w; i++, line = []) {
    for (var j = 0; j < h; j++) {
      line.push(null);
    }
    matrix.push(line);
  }
  return matrix;
};

// Based on http://code.google.com/p/closure-library/source/browse/trunk/closure/goog/base.js
map.utils.inherits = function(child_constructor, parent_constructor) {
  /** @constructor */
  function temp_constructor() {};
  temp_constructor.prototype = parent_constructor.prototype;
  child_constructor.superClass_ = parent_constructor.prototype;
  child_constructor.prototype = new temp_constructor();
  /** @override */
  child_constructor.prototype.constructor = child_constructor;
};

