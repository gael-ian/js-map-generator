/*
 * map.graph.location
 */
map.graph.location = function(point) {
  
  this.point     = point;
  
  this.elevation = 0;
  this.length    = 0;
  
  this.water     = false;
  this.ocean     = false;
  this.coast     = false;
  this.biome     = null;
  this.moisture  = 0;
};

map.graph.location.prototype.key = function() {
  return map.utils.genKey(this.point.x, this.point.y);
};

map.graph.location.prototype.toString = function() {
  return this.point.toString();
};