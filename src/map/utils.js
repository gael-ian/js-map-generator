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