map.build.shape.circle = function(builder, options) {

  this.builder = builder;
  this.options = map.utils.merge( (options || {}), {
      radius: 0.8
    , ceil:   5000
  });

  this.apply = function() {
    var shape       = this
      , max_radius  = (this.options.radius * (this.builder.shorter_dimension / 2))
      , center      = this.builder.centers.reduce(function(m, c) {
          if (null == m || (null != m && c.point.distanceFromCenter() < m.point.distanceFromCenter())) {
            m = c;
          }
          return m;
        }, this.builder)
      , scale = map.core.easing.linear({ x: 0, y: shape.options.ceil }, { x: max_radius, y: 0 })
      ;

    center.mountain  = true;
    center.elevation = this.options.ceil;

    this.builder.centers.asQueue(function(c, queue, queued) {
      c.elevation = scale(c.point.distanceFromCenter());
      
      if (c.elevation <= 0) c.water = true;
      c.neighbors.each(function(n) {
        if (0 > queued.indexOf(n) && 0 > queue.indexOf(n)) queue.push(n);
      });
    }, this.builder, [center]);
  };
};