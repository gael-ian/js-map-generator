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
map.graph.corner.prototype = new map.graph.location();
  
map.graph.corner.prototype.border = function() {
  return this.point.border();
};