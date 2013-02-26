/*
 * map.graph.point
 * Base unit for the graph
 */
map.graph.point = function(x, y, context) {
  
  this.x  = x;
  this.y  = y;

  this.context = (context || null);

  this._s = [x, y].join(':');
};

map.graph.point.prototype.toString = function() {
  return this._s;
};

map.graph.point.prototype.setContext = function(context) {
  this.context = context;
};

map.graph.point.prototype.border = function(side) {
  if (null == this.context) {
    throw new TypeError('context not set for ' + this);
  }
  switch(side) {
    case 'west':
      return (this.x == 0);
      
    case 'east':
      return (this.x == this.context.width);
      
    case 'north':
      return (this.y == 0);
      
    case 'south':
      return (this.y == this.context.height);
      
    default:
      return (this.x == 0 || this.y == 0 || this.x == this.context.width || this.y == this.context.height);
  }
}

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

map.graph.point.prototype.distanceFromCenter = function() {
  if (null == this.context) {
    throw new TypeError('context not set for ' + this);
  }
  var x = (this.x - this.context.center.x)
    , y = (this.y - this.context.center.y)
    ;
  return Math.sqrt(x*x + y*y);
};

map.graph.point.prototype.radiantFromCenter = function() {
  if (null == this.context) {
    throw new TypeError('context not set for ' + this);
  }
  var x = (this.x - this.context.center.x)
    , y = (this.y - this.context.center.y)
    ;
  return Math.atan2(y, x);
};

map.graph.point.prototype.latitude = function() {
  if (null == this.context) {
    throw new TypeError('context not set for ' + this);
  }

  var y_dist = Math.abs(this.context.center.y - this.y)
    , y_max  = ((this.y < this.context.center.y)
        ? this.context.center.y
        : (this.context.height - this.context.center.y)
        )
    , l_max  = ((this.y < this.context.center.y)
        ? this.context.max_latitude
        : this.context.min_latitude
        )
    ;
  return ((y_dist * l_max) / y_max);
};

map.graph.point.prototype.longitude = function() {
  if (null == this.context) {
    throw new TypeError('context not set for ' + this);
  }

  var x_dist = Math.abs(this.context.center.x - this.x)
    , x_max  = ((this.x < this.context.center.x)
        ? this.context.center.x
        : (this.context.width - this.context.center.x)
        )
    , l_max  = ((this.x < this.context.center.x)
        ? this.context.max_longitude
        : this.context.min_longitude
        )
    ;
  return ((x_dist * l_max) / x_max);
};