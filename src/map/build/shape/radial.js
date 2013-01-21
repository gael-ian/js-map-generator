map.build.shape.radial = function(builder, options) {

  this.builder = builder;
  this.options = map.utils.merge( (options || {}), {
      seed: Math.floor(Math.random() * ((new Date()).getTime() % this.builder.width))
    , ceil: 5000
  });

  this.apply = function() {
    var shape = this
      , prng  = new PRNG()
      ;
      
    prng.seed = this.options.seed;

    var max_radius = ([this.builder.height, this.builder.width][Math.round(prng.nextRange(0, 1))] / 2)
      , center     = this.builder.centers.reduce(function(m, c) {
          if (null == m || (null != m && c.point.distanceFromCenter() < m.point.distanceFromCenter())) {
            m = c;
          }
          return m;
        }, this.builder)
      , bumps      = prng.nextRange(1, 6)
      , start_a    = prng.nextRange(0, 2 * Math.PI)
      , start_b    = prng.nextRange(0, 2 * Math.PI)
      ;

    this.builder.centers.asQueue(function(c, queue, queued) {
      var a      = c.point.radiantFromCenter()
        , c1     = 0.9 + 0.2*Math.sin(start_a + a*bumps + Math.cos((bumps+3)*a))
        , c2     = 0.7 + 0.3*Math.sin(start_b + a*bumps - Math.sin((bumps+3)*a))
        , r      = (c.point.distanceFromCenter() * c1) / (max_radius * c2)
        ;

      c.elevation = (1 - r) * shape.options.ceil;
      
      if (c.elevation <= 0) c.water = true;
      c.neighbors.each(function(n) {
        if (0 > queued.indexOf(n) && 0 > queue.indexOf(n)) queue.push(n);
      });
    }, this.builder, [center]);
  };
};