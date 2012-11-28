map.build.shape.square = function(builder, options) {

  this.builder = builder;

  this.is_land  = function(location) {
    return !location.border(this.builder);
  };
}; 
