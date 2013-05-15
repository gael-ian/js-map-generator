/*
 * map.graph.point
 * Base unit for the graph
 */
map.graph.point = function(latitude, longitude, context) {
  
  this.latitude  = latitude;
  this.longitude = longitude;
  
  this.r_latitude  = this.latitude * (Math.PI / 180);
  this.r_longitude = this.longitude * (Math.PI / 180);

  this.context = (context || null);

  this._s = [latitude, longitude].join(':');
};

map.graph.point.prototype.toString = function() {
  return this._s;
};

map.graph.point.prototype.setContext = function(context) {
  this.context = context;
};

// Use the great-circle approximation
// See http://en.wikipedia.org/wiki/Great-circle_distance
map.graph.point.prototype.distanceFrom = function(point) {
  if (null == this.context) {
    throw new TypeError('context not set for ' + this);
  }
  var cos =   (Math.sin(this.r_latitude) * Math.sin(point.r_latitude))
            + (Math.cos(this.r_latitude) * Math.cos(point.r_latitude) * Math.cos(this.r_longitude - point.r_longitude))
    ;
  return Math.acos(cos) * this.context.radius;
};

map.graph.point.prototype.distanceFromCenter = function() {
  if (null == this.context) {
    throw new TypeError('context not set for ' + this);
  }
  return this.distanceFrom(this.context.center);
};

map.graph.point.prototype.radiantFrom = function(point) {
  var d_lat = (this.latitude - point.latitude)
    , d_lng = (this.longitude - point.longitude)
    ;
  return Math.atan2(d_lat, d_lng);
};

map.graph.point.prototype.radiantFromCenter = function() {
  if (null == this.context) {
    throw new TypeError('context not set for ' + this);
  }
  return this.radiantFrom(this.context.center);
};

map.graph.point.prototype.border = function(side) {
  if (null == this.context) {
    throw new TypeError('context not set for ' + this);
  }
  switch(side) {
    case 'west':
      return (this.longitude == this.context.min_longitude);
      
    case 'east':
      return (this.longitude == this.context.max_longitude);
      
    case 'north':
      return (this.latitude == this.context.max_latitude);
      
    case 'south':
      return (this.latitude == this.context.min_latitude);
      
    default:
      return (this.border('north') || this.border('east') || this.border('south') || this.border('west'));
  }
};