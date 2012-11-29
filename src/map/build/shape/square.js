map.build.shape.square = function(builder, options) {

  this.builder = builder;

  this.isLand  = function(location) {
    return !location.border(this.builder);
  };
}; 
