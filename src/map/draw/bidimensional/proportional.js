/*
 * map.draw.bidimensional.proportional
 */
map.draw.bidimensional.proportional = function(canvas) {
  map.draw.bidimensional.base.call(this, canvas);
};
map.utils.inherits(map.draw.bidimensional.proportional, map.draw.bidimensional.base);

map.draw.bidimensional.proportional.prototype.x = function(point) {
  var range_longitude = (point.context.max_longitude - point.context.min_longitude)
    , delta_longitude = (point.longitude - point.context.min_longitude)
    ;
  return delta_longitude * this.width / range_longitude;
}

map.draw.bidimensional.proportional.prototype.y = function(point) {
  var range_latitude = (point.context.max_latitude - point.context.min_latitude)
    , delta_latitude = (point.context.max_latitude - point.latitude)
    ;
  return delta_latitude * this.height / range_latitude;
} 
