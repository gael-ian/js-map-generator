map.build.shape.square = function(builder, options) {

  this.builder = builder;
  this.options = map.utils.merge( (options || {}), {
    ceil: 5000
  });

  this.apply = function() {
    var shape = this;
    this.builder.centers.each(function(c) {
      c.water = c.border();
      c.elevation = (c.water ? -1 : 1) * shape.options.ceil;
    });
  };
}; 
