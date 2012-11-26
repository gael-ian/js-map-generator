/*
 * map.graph.edge
 * Edge of Voronoï polygons
 */
map.graph.edge = function(point) {
  map.graph.location.call(this, point);
  
  this.centers    = new map.core.dictionary();
  this.corners    = new map.core.dictionary();
};
map.graph.edge.prototype = new map.graph.location();