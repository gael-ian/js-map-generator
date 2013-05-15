/*
 * map.core.dictionnary
 * Object with easier iteration
 */
map.core.dictionary = function() {
  Object.apply(this, arguments);
};
map.utils.inherits(map.core.dictionary, Object);

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

map.core.dictionary.prototype.reduce = function(callback, scope, source) {
  var keys   = Object.keys(this)
    , scope  = (scope || this)
    , source = (source || null)
    ;

  for(var i in keys) {
    source = callback.call(scope, source, this[keys[i]]);
  }
  return source;
};

map.core.dictionary.prototype.sample = function() {
  var keys   = Object.keys(this);
  return this[keys[Math.floor(Math.random() * keys.length)]];
};

map.core.dictionary.prototype.samples = function(n) {
  var keys    = Object.keys(this)
    , samples = []
    , sample
    ;
  
  if (this.length() <= n) return this.toArray();

  while (samples.length < n) {
    sample = this.sample();
    if (-1 == samples.indexOf(sample)) {
      samples.push(sample);
    }
  }
  return samples;
};

map.core.dictionary.prototype.toArray = function() {
  return this.reduce(function(m, i) { m.push(i); return m; }, this, []);
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
  var clock     = []
    , longitude = 0
    , latitude  = 0;

  for(var i in keys = Object.keys(this)) {
    var item = this[keys[i]];

    clock.push(item);
    longitude += item.point.longitude;
    latitude  += item.point.latitude;
  }
  longitude = longitude / keys.length;
  latitude  = latitude / keys.length;

  var center = new map.graph.point(latitude, longitude)
    , angle  = function(p) {
        var d_lat = (p.point.latitude - center.latitude)
          , d_lng = (p.point.longitude - center.longitude)
          ;
        return Math.atan2(d_lat, d_lng);
      }
    ;

  clock.sort(function(a, b) {
    return (angle(a) - angle(b));
  });

  clock.forEach(function(item, i) {
    iterator.call(scope, item, i, this);
  }, this);
};