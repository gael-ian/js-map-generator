map.build.shape.base.chains = function(builder, options) {

  this.builder = builder;
  this.options = map.utils.merge( (options || {}), this.defaultOptions());

  this.mountains = [];
  this.trenches  = [];
};

map.build.shape.base.chains.prototype.defaultOptions = function() {
  return {
      ceil:  9000
    , noise: function(x, elevation) {
        return (elevation + 0.2 * Math.sin(x) * elevation);
      }
    , easing: 'cubicBezier'
    , easing_options: { a: { x: 0.3, y: 0.4 }, b: { x: 0.7, y: 0.6 } }
  };
};

map.build.shape.base.chains.prototype.chains = function(n, matcher) {
  var chains = []
    , limits = undefined
    , size   = 0
    , points = this.builder.centers.select(matcher).samples(n)
    ;
  
  points = points.sort(function(a, b) {
    var c = a.point.latitude
      , d = b.point.latitude
      ;
    return ((c > d) ? 1 : ((c < d) ? -1 : 0));
  });

  while(   0 != (size = Math.min(3, points.length))
        && undefined !== (limits = points.splice(0, size))) {
    if (limits.length == 1) {
      chains.push([limits[0]]);
    } else if (limits.length != 0) {
      chains.push(limits[0].pathTo(limits.splice(1, limits.length - 1)));
    }
  }
  return chains;
};

map.build.shape.base.chains.prototype.elevation = function(c) {
  var find_nearest = function(nearest, center) {
        if (null == nearest) return center;
        if (center.point.distanceFrom(c.point) < nearest.point.distanceFrom(c.point)) return center;
        return nearest;
      }
    , nearest_mountain  = this.mountains.reduce(find_nearest, null)
    , nearest_trench    = this.trenches.reduce(find_nearest, null)
    , trench_distance   = nearest_trench.point.distanceFrom(c.point)
    , mountain_distance = nearest_mountain.point.distanceFrom(c.point)
    , scale             = map.core.easing[this.options.easing](
        { x: 0, y: nearest_trench.elevation },
        { x: trench_distance + mountain_distance, y: nearest_mountain.elevation },
        this.options.easing_options
      )
    ;

  return this.options.noise(trench_distance, scale(trench_distance));
};

map.build.shape.base.chains.prototype.level = function(centers) {
  var sum = centers.reduce(function(m, c) {
        c.elevation = this.elevation(c);
        return m + c.elevation;
      }, this, 0)
    , avg = sum / centers.length()
    ;
      
  centers.each(function(c, i) {
    c.elevation = this.options.noise(i, avg);
  }, this);
};

map.build.shape.base.chains.prototype.interpolate = function() {
  var queue_start  = []
    , smooth_start = []
    , borders      = []
    ;
    
  if (this.builder.max_latitude == 90) borders.push('north');
  if (this.builder.min_latitude == -90) borders.push('south');
  
  borders.forEach(function(border) {
    var b = this.builder.centers.select(function(c) { return c.border(border); })
    this.level(b);
    b.each(function(c) { 
      queue_start.push(c);
      smooth_start.push(c);
    }, this);
  }, this);

  if (this.builder.max_longitude == 180 && this.builder.min_longitude == -180) {
    var west_border = this.builder.centers.select(function(c) { return c.border('west'); })
      , east_border = this.builder.centers.select(function(c) { return c.border('east'); })
      , main_border = (west_border.length() > east_border.length() ? west_border : east_border)
      ;
    
    west_border.each(function(c) {
      c.elevation = this.elevation(c);
      queue_start.push(c);
      smooth_start.push(c);
    }, this);
    
    east_border.each(function(c) {
      c.elevation = this.elevation(c);
      queue_start.push(c);
      smooth_start.push(c);
    }, this);
    
    main_border.each(function(c) {
      var o = c.opposite();
      if (Math.abs(c.elevation) > Math.abs(o.elevation)) {
        c.elevation = o.elevation;
      } else {
        o.elevation = c.elevation;
      }    
    }, this);
    
    west_border.each(function(c) {
      var adjacents = c.neighbors.select(function(n) { return n.border(); }, this);
      c.elevation = adjacents.reduce(function(s, n) { return s + n.elevation; }, this, 0) / adjacents.length();
      queue_start.push(c);
      smooth_start.push(c);
    }, this);
    
    east_border.each(function(c) {
      var adjacents = c.neighbors.select(function(n) { return n.border(); }, this);
      c.elevation = adjacents.reduce(function(s, n) { return s + n.elevation; }, this, 0) / adjacents.length();
      queue_start.push(c);
      smooth_start.push(c);
    }, this);
  }
  
  this.builder.centers.asQueue(function(c, queue, queued) {
    if (null == c.elevation) c.elevation = this.elevation(c);
    
    if (c.elevation > (0.5 * this.options.ceil)) this.mountains.push(c);
    if (c.elevation < (0.5 * -this.options.ceil)) this.trenches.push(c);
    if (c.elevation <= 0) c.water = true;

    c.neighbors.each(function(n) {
      if (0 > queued.indexOf(n) && 0 > queue.indexOf(n)) queue.push(n);
    });
  }, this, queue_start);
  
  this.builder.centers.asQueue(function(c, queue, queued) {
    
    if (!c.border()) {
      c.elevation = c.neighbors.reduce(function(s, n) { return s + n.elevation; }, this, 0) / c.neighbors.length();
    }
    
    c.neighbors.each(function(n) {
      if (0 > queued.indexOf(n) && 0 > queue.indexOf(n)) queue.push(n);
    });
  }, this, smooth_start);
};

map.build.shape.base.chains.prototype.matrix = function(width, height) {
  var matrix = map.utils.matrix(width, height);
  for (var i = 0; i < width; i++) {
    for (var j = 0; j < height; j++) {
      matrix[i][j] = ['trenches', 'mountains'][Math.floor(this.builder.prng.nextRange(0, 2))];
    }
  }
  return matrix;
};

map.build.shape.base.chains.prototype.apply = function() {
  var shape           = this
    , latitude_range  = (this.builder.max_latitude - this.builder.min_latitude)
    , longitude_range = (this.builder.max_longitude - this.builder.min_longitude)
    , width           = Math.round(this.builder.prng.nextRange(8, 12))
    , height          = Math.round(this.builder.prng.nextRange(8, 12))
    , matrix          = this.matrix(width, height)
    , dx              = Math.ceil(longitude_range/width)
    , dy              = Math.ceil(latitude_range/height)
    ;

  for (var i = 0, x = this.builder.min_longitude; i < width; x += dx, i++) {
    for (var j = 0, y = this.builder.max_latitude; j < height; y -= dy, j++) {
      
      var pool       = matrix[i][j]
        , collection = this[pool]
        , elevation  = (pool == 'trenches' ? -this.options.ceil : this.options.ceil)
        , elevations = [elevation, elevation/3, elevation, elevation/5]
        , pits       = Math.round(this.builder.prng.nextRange(1, 3))
        , chains     = this.chains(pits, function(c) {
            return (
                 c.point.longitude >= x && c.point.longitude <= x + dx
              && c.point.latitude <= y && c.point.latitude >= y - dy
              );
          }, this.builder)
        ;
      chains.forEach(function(chain) {
        elevation = elevations[Math.floor(this.builder.prng.nextRange(0, elevations.length - 1))];
        chain.forEach(function(c) {
          c.elevation = elevation;
          collection.push(c);
        }, this);
      }, this);
      
    }
  }

  this.interpolate();
};