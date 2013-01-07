map.build.shape.circle = function(builder, options) {

  this.builder = builder;
  this.options = map.utils.merge( (options || {}), {
    radius: 0.8
  });

  this.init = function() {
  };

  this.isLand  = function(location) {
    return ((location.point.distanceFromCenter() / (this.builder.shorter_dimension / 2)) < this.options.radius);
  };
};