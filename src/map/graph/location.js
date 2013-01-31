/*
 * map.graph.location
 */
map.graph.location = function(point) {
  
  this.point     = point;
  
  this.elevation = null;
  this.water     = false;
  
  this.mountain  = false;
  this.trench    = false;
  this.coast     = false;
  
  this.biome     = null;
  this.moisture  = 0;
};

map.graph.location.prototype.toString = function() {
  return this.point.toString();
};