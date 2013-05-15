map.build.shape.perlin = function(builder, options) {

  this.builder = builder;
  this.options = map.utils.merge( (options || {}), {
    width:     128,
    height:    128,
    base_x:    64,
    base_y:    64,
    ceil:      5000,
    sea_level: 3000
  });

  this.x = function(point) {
    var range_longitude = (this.builder.max_longitude - this.builder.min_longitude)
      , delta_longitude = (point.longitude - this.builder.min_longitude)
      ;
    return Math.round(delta_longitude * this.options.width / range_longitude);
  };

  this.y = function(point) {
    var range_latitude = (this.builder.max_latitude - this.builder.min_latitude)
      , delta_latitude = (this.builder.max_latitude - point.latitude)
      ;
    return Math.round(delta_latitude * this.options.height / range_latitude);
  };
  
  this.apply = function() {
    var shape      = this
      , bitmap     = new BitmapData(this.options.width, this.options.height)
      , blue_scale = map.core.easing.easeInOutSine({ x: 0, y: 0 }, { x: 255, y: (2 * this.options.ceil) })
      ;
      
    bitmap.perlinNoise(this.options.base_x, this.options.base_y, this.builder.seed, BitmapDataChannel.BLUE, false);

    this.builder.centers.asQueue(function(c, queue, queued) {
      c.elevation = blue_scale(bitmap.getPixel(shape.x(c.point), shape.y(c.point))) - shape.options.sea_level;

      if (c.elevation <= 0) c.water = true;
      c.neighbors.each(function(n) {
        if (0 > queued.indexOf(n) && 0 > queue.indexOf(n)) queue.push(n);
      });
    }, this.builder);
  };
};