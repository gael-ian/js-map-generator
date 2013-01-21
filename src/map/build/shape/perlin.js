map.build.shape.perlin = function(builder, options) {

  this.builder = builder;
  this.options = map.utils.merge( (options || {}), {
    seed:      Math.floor(Math.random() * ((new Date()).getTime() % this.builder.width)),
    width:     128,
    height:    128,
    base_x:    64,
    base_y:    64,
    ceil:      5000,
    sea_level: 3000
  });
  
  this.apply = function() {
    var shape      = this
      , bitmap     = new BitmapData(this.options.width, this.options.height)
      , x_coeff    = this.options.width / this.builder.width
      , y_coeff    = this.options.height / this.builder.height
      , blue_scale = map.core.easing.easeInOutSine({ x: 0, y: 0 }, { x: 255, y: (2 * this.options.ceil) })
      ;
      
    bitmap.perlinNoise(this.options.base_x, this.options.base_y, this.options.seed, BitmapDataChannel.BLUE, false);

    this.builder.centers.asQueue(function(c, queue, queued) {

      var bx     = Math.round(c.point.x * x_coeff)
        , by     = Math.round(c.point.y * y_coeff)
        , blue   = bitmap.getPixel(bx, by)
        ;

      c.elevation = blue_scale(blue) - shape.options.sea_level;

      if (c.elevation <= 0) c.water = true;
      c.neighbors.each(function(n) {
        if (0 > queued.indexOf(n) && 0 > queue.indexOf(n)) queue.push(n);
      });
    }, this.builder);
  };
};