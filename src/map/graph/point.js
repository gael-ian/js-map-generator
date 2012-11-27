/*
 * map.graph.point
 * Base unit for the graph
 */
map.graph.point = function(x, y) {
  
  this.x  = x;
  this.y  = y;

  this._s = [x, y].join(':');
};

map.graph.point.prototype.toString = function() {
  return this._s;
};

map.graph.point.prototype.length = function() {
  return Math.sqrt(this.x*this.x + this.y*this.y);
};