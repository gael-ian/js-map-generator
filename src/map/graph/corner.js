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
  
map.graph.corner.prototype.border = function(context) {
  return (this.point.x == 0 || this.point.y == 0 || this.point.x == context.width || this.point.y == context.height)
};