map.build.shape.square = function(builder, options) {

  this.builder = builder;
  this.options = map.utils.merge( (options || {}), {});

  this.init = function() {
  };

  this.isLand  = function(location) {
    return !location.border(this.builder);
  };
}; 
