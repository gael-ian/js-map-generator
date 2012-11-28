map.build.shape.circle = function(builder, options) {

  this.builder = builder;
  this.options = map.utils.merge( (options || {}), {
    radius: 0.8
  });

  this.is_land  = function(location) {
    return ((location.point.distanceFrom(this.builder.center) / (this.builder.shorter_dimension / 2)) < this.options.radius);
  };
};