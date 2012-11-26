/*
 * map.graph.point
 * Base unit for the graph
 */
map.graph.point = function(x, y) {
  
  this.x = x;
  this.y = y;
};

map.graph.point.prototype.length = function() {
  return Math.sqrt(this.x*this.x + this.y*this.y);
};