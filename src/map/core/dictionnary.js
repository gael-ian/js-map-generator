/*
 * map.core.dictionnary
 * Object with easier iteration
 */
map.core.dictionary = function() {
  Object.apply(this, arguments);
};
map.core.dictionary.prototype = new Object();

map.core.dictionary.prototype.length = function() {
  return Object.keys(this).length;
};

map.core.dictionary.prototype.keys = function() {
  return Object.keys(this);
};

map.core.dictionary.prototype.each = function(iterator, scope) {
  var keys  = Object.keys(this)
    , scope = (scope || this)
    ;

  for(var i in keys){
    iterator.call(scope, this[keys[i]], i, this);
  }
};

map.core.dictionary.prototype.select = function(matcher, scope) {
  var o     = new map.core.dictionary()
    , keys  = Object.keys(this)
    , scope = (scope || this)
    ;

  for(var i in keys) {
    if (matcher.call(scope, this[keys[i]])) {
      o[keys[i]] = this[keys[i]];
    }
  }
  return o;
};

map.core.dictionary.prototype.detect = function(matcher, scope) {
  var keys  = Object.keys(this)
    , scope = (scope || this)
    ;

  for(var i in keys) {
    if (matcher.call(scope, this[keys[i]])) {
      return this[keys[i]];
    }
  }
  return null;
};

map.core.dictionary.prototype.reduce = function(source, callback, scope) {
  var keys  = Object.keys(this)
    , scope = (scope || this)
    ;

  for(var i in keys) {
    source = callback.call(scope, source, this[keys[i]]);
  }
  return source;
};

map.core.dictionary.prototype.toArray = function() {
  return this.reduce([], function(m, i) { m.push(i); return m; });
};

map.core.dictionary.prototype.asQueue = function(callback, scope, queue) {
  var queue  = queue || []
    , queued = []
    , keys   = Object.keys(this);

  if (queue.length == 0) {
    queue.push(this[keys[0]]);
  }

  while(queue.length != 0) {
    var item = queue.shift();
    if (!(item in queued)) {
      queued.push(item);
      callback.call(scope, item, queue, queued);
    }
  }
};

map.core.dictionary.prototype.clockwise = function(iterator, scope) {
  var clock = []
    , x     = 0
    , y     = 0;

  for(var i in keys = Object.keys(this)) {
    var item = this[keys[i]];

    clock.push(item);
    x += item.point.x;
    y += item.point.y;
  }
  x = x / keys.length;
  y = y / keys.length;

  var center = new map.graph.point(x, y)
    , angle  = function(p) { return Math.atan2((p.point.y - center.y), (p.point.x - center.x)); }
    ;

  clock.sort(function(a, b) {
    return (angle(a) - angle(b));
  });

  clock.forEach(function(item, i) {
    iterator.call(scope, item, i, this);
  }, this);
};