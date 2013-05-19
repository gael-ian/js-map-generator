/*
 * map.draw.bidimensional.proportional
 */
map.draw.projection.bidimensional.proportional = function(drawer) {
  this.drawer = drawer;
  
  this.x = function(location) {
    var range_longitude = (location.point.context.max_longitude - location.point.context.min_longitude)
      , delta_longitude = (location.point.longitude - location.point.context.min_longitude)
      ;
    return delta_longitude * this.drawer.width / range_longitude;
  };

  this.y = function(location) {
    var range_latitude = (location.point.context.max_latitude - location.point.context.min_latitude)
      , delta_latitude = (location.point.context.max_latitude - location.point.latitude)
      ;
    return delta_latitude * this.drawer.height / range_latitude;
  };
};