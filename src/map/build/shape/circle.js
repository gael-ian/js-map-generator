map.build.shape.circle = function(builder, options) {

  this.builder = builder;
  this.options = map.utils.merge( (options || {}), {
      radius: 0.8
    , ceil:   5000
  });

  this.apply = function() {
    var shape       = this
      , scale       = map.core.easing.linear(
          { x: 0, y: shape.options.ceil },
          { x: (this.builder.latitudinal_circ / 2) * this.options.radius, y: 0 }
        )
      ;

    this.builder.centers.asQueue(function(c, queue, queued) {
      c.elevation = scale(c.point.distanceFromCenter());
      
      if (c.elevation <= 0) c.water = true;
      c.neighbors.each(function(n) {
        if (0 > queued.indexOf(n) && 0 > queue.indexOf(n)) queue.push(n);
      });
    }, this.builder);
  };
};