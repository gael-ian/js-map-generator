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
map.utils.inherits(map.graph.center, map.graph.location);
  
map.graph.center.prototype.border = function() {
  if (undefined === this._border) {
    this._border = (null !== this.corners.detect(function(c) { return c.border() }));
  }
  return this._border;
};

map.graph.center.prototype.pathTo = function(locations) {
  var path   = [this]
    , origin = this
    ;
  locations.sort(function(a, b) {
    var c = a.point.distanceFrom(origin.point)
      , d = b.point.distanceFrom(origin.point)
      ;
    return ((c > d) ? 1 : ((c < d) ? -1 : 0));
  }).forEach(function(l) {
    var distance = origin.point.distanceFrom(l.point)
      , current  = origin
      ;
    while(null !== (next = current.neighbors.reduce(function(m, n) {
        var d = n.point.distanceFrom(l.point);
        if (d < distance) {
          distance = d;
          return n;
        }
        return m;
      }))) {
      path.push(next);
      current = next;
    }
    origin = l;
  });
  return path;
};