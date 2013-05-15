/*
 * map.graph.corner
 * Corner of Voronoï polygons
 */
map.graph.corner = function(point) {
  map.graph.location.call(this, point);
  
  this.adjacents  = new map.core.dictionary();
  this.centers    = new map.core.dictionary();
  this.edges      = new map.core.dictionary();
};
map.utils.inherits(map.graph.corner, map.graph.location);

map.graph.corner.prototype.border = function(side) {
  return this.point.border(side);
};