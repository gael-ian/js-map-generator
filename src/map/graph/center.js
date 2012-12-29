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