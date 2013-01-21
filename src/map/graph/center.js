/*
 * map.graph.center
 * Center of Voronoï polygons
 */
map.graph.center = function(point) {
  map.graph.location.call(this, point);
  
  this.neighbors  = new map.core.dictionary();
  this.edges      = new map.core.dictionary();
  this.corners    = new map.core.dictionary();
  
};
map.graph.center.prototype = new map.graph.location();
  
map.graph.center.prototype.border = function() {
  if (undefined === this._border) {
    this._border = (null !== this.corners.detect(function(c) { return c.border() }));
  }
  return this._border;
};

map.graph.center.prototype.pathTo = function(location) {
  var path      = new map.core.dictionary()
    , distance  = this.point.distanceFrom(location.point)
    , point     = this
    , next      = null
    ;
  
  path[this.toString()] = this;

  do {
    next = point.neighbors.reduce(function(m, n) {
      var d = n.point.distanceFrom(location.point);
      if (d < distance) {
        distance = d;
        return n;
      }
      return m;
    });
    if (null != next) {
      path[next.toString()] = next;
      point = next;
      distance = next.point.distanceFrom(location.point);
    }
  } while(null !== next);
  return path;
};