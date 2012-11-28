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

map.graph.point.prototype.distanceFrom = function(point) {
  var x = (this.x - point.x)
    , y = (this.y - point.y)
    ;
  return Math.sqrt(x*x + y*y);
};

map.graph.point.prototype.radiantFrom = function(point) {
  var x = (this.x - point.x)
    , y = (this.y - point.y)
    ;
  return Math.atan2(y, x);
};