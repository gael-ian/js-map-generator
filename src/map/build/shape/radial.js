map.build.shape.radial = function(builder, options) {

  this.builder = builder;
  this.options = map.utils.merge( (options || {}), {
    ceil: 5000
  });

  this.apply = function() {
    var shape      = this
      , radiuses   = [this.builder.longitudinal_circ, this.builder.latitudinal_circ]
      , max_radius = (radiuses[Math.round(this.builder.prng.nextRange(0, 1))] / 2)
      , bumps      = this.builder.prng.nextRange(1, 6)
      , start_a    = this.builder.prng.nextRange(0, 2 * Math.PI)
      , start_b    = this.builder.prng.nextRange(0, 2 * Math.PI)
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
    }, this.builder);
  };
};