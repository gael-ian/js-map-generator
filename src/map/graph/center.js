/*
 * map.graph.center
 * Center of Voronoï polygons
 */
map.graph.center = function(point) {
  map.graph.location.call(this, point);
  
  this.neighbors  = new map.core.dictionary();
  this.edges      = new map.core.dictionary();
  this.corners    = new map.core.dictionary();
  
  this._border    = {};
  this._opposites = undefined;
  
};
map.utils.inherits(map.graph.center, map.graph.location);

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

map.graph.center.prototype.border = function(side) {
  var side = side || 'any';
  if (undefined === this._border[side]) {
    this._border[side] = (null !== this.corners.detect(function(c) { return c.border(side) }));
  }
  return this._border[side];
};

/*
map.graph.center.prototype.opposite = function() {
  if (undefined === this._opposite) {
    var y = this.point.y
      , x = this.point.context.center.x + (this.point.context.center.x - this.point.x)
      , p = new map.graph.point(x, y, this.point.context)
      ;
    this._opposite = this.point.context.centers.reduce(function(o, c) {
      if (null === o) return c;
      if (c.point.distanceFrom(p) < o.point.distanceFrom(p)) return c;
      return o;
    }, this, null);
  }
  return this._opposite;
};
*/