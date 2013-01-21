map.build.shape.pangea = function(builder, options) {

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
    var shape          = this
      , radius         = this.builder.larger_dimension * 0.4
      , trenches       = this.chains(12, function(c) {
          var d = c.point.distanceFromCenter();
          return (d >= (radius * 0.9) && d <= (radius * 1.1));
        })
      , mountains      = this.chains(8, function(c) {
          var d = c.point.distanceFromCenter();
          return (d <= (radius * 0.5));
        })
      , all_mountains  = []
      , all_trenches   = []
      ;

    mountains.forEach(function(mountain) {
      mountain.each(function(c) {
        c.elevation = shape.options.ceil;
        all_mountains.push(c);
      });
      
    });
    trenches.forEach(function(trench) {
      trench.each(function(c) {
        c.elevation = -shape.options.ceil;
        all_trenches.push(c);
      });
    });

    this.builder.centers.asQueue(function(c, queue, queued) {
      var find_nearest     = function(nearest, center) {
            if (null == nearest) return center;
            if (center.point.distanceFrom(c.point) < nearest.point.distanceFrom(c.point)) return center;
            return nearest;
          }
        , nearest_mountain  = all_mountains.reduce(find_nearest, null)
        , nearest_trench    = all_trenches.reduce(find_nearest, null)
        , trench_distance   = nearest_trench.point.distanceFrom(c.point)
        , mountain_distance = nearest_mountain.point.distanceFrom(c.point)
        , scale             = map.core.easing.linear(
            { x: 0, y: nearest_trench.elevation },
            { x: trench_distance + mountain_distance,   y: nearest_mountain.elevation   }
          )
        ;

      if (0 == c.elevation) c.elevation = scale(trench_distance);
      if (c.elevation <= 0) c.water = true;
                                 
      c.neighbors.each(function(n) {
        if (0 > queued.indexOf(n) && 0 > queue.indexOf(n)) queue.push(n);
      });
    }, this.builder);
  };

  this.chains = function(n, matcher) {
    var chains = []
      , points = this.builder.centers.select(matcher).samples(n).sort(function(a, b) {
          var c = a.point.radiantFromCenter()
            , d = b.point.radiantFromCenter()
            ;
          return ((c > d) ? 1 : ((c < d) ? -1 : 0));
        })
      ;

    while(undefined !== (limits = points.splice(0, 2)) && limits.length == 2) {
      chains.push(limits[0].pathTo(limits[1]));
    }
    return chains;
  };
};