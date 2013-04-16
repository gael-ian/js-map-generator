map.build.shape.base.chains = function(builder, options) {

  this.builder = builder;
  this.options = map.utils.merge( (options || {}), this.defaultOptions());

  this.prng      = new PRNG();
  this.prng.seed = this.options.seed;

  this.mountains = [];
  this.trenches  = [];
};

map.build.shape.base.chains.prototype.defaultOptions = function() {
  return {
      seed:  Math.floor(Math.random() * ((new Date()).getTime() % this.builder.width))
    , ceil:  9000
    , noise: function(x, elevation) {
        return (elevation); // + 0.2 * Math.sin(bump * x) * elevation);
      }
    , easing: 'cubicBezier'
    , easing_options: { a: { x: 0.3, y: 0.4 }, b: { x: 0.7, y: 0.6 } }
  };
};

map.build.shape.base.chains.prototype.chains = function(n, matcher) {
  var chains = []
    , limits = undefined
    , size   = 0
    , points = this.builder.centers.select(matcher).samples(n).sort(function(a, b) {
        var c = a.point.latitude()
          , d = b.point.latitude()
          ;
        return ((c > d) ? 1 : ((c < d) ? -1 : 0));
      })
    ;

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

map.build.shape.base.chains.prototype.smooth = function() {
  this.builder.centers.each(function(c) {
    c.elevation = c.neighbors.reduce(function(s, n) { return s + n.elevation; }, this, 0) / c.neighbors.length();
    if (c.elevation <= 0) c.water = true;
  });
};

map.build.shape.base.chains.prototype.matchLimits = function(limit_a, limit_b) {
  var model = (limit_a.length() > limit_b.length() ? limit_a : limit_b)
    
  model.each(function(c) {
    var o = c.opposite()
      , d = c.point.y + (this.builder.width - o.point.y)
      ;
    if (o.elevation > c.elevation) {
      c.elevation = this.options.noise(d, o.elevation);
    } else {
      o.elevation = this.options.noise(d, c.elevation);
    }
    
    if (c.elevation > 0) this.mountains.push(c);
    if (c.elevation <= 0) this.trenches.push(c);
    
    if (o.elevation > 0) this.mountains.push(o);
    if (o.elevation <= 0) this.trenches.push(o);
    
  }, this);
};

map.build.shape.base.chains.prototype.interpolate = function() {
  var queue_start = []
    , elevation   = function(c) {
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
              { x: trench_distance + mountain_distance,   y: nearest_mountain.elevation   },
              this.options.easing_options
            )
          ;

        return this.options.noise(trench_distance, scale(trench_distance));
      }
    ;
  
  if (this.builder.max_longitude == 180 && this.builder.min_longitude == -180) {
    var west_border = this.builder.centers.select(function(c) { return c.border('west'); })
      , east_border = this.builder.centers.select(function(c) { return c.border('east'); })
      ;
    
    west_border.each(function(c) { c.elevation = elevation.call(this, c); }, this);
    east_border.each(function(c) { c.elevation = elevation.call(this, c); }, this);
    
    this.matchLimits(west_border, east_border);
  }
  
  if (this.builder.max_latitude == 90) {
    var north_border = this.builder.centers.select(function(c) { return c.border('north'); })
      , nw_border    = north_border.select(function(c) { return c.point.x < this.builder.center.x; }, this)
      , ne_border    = north_border.select(function(c) { return c.point.x >= this.builder.center.x; }, this)
      ;
    
    north_border.each(function(c) { c.elevation = elevation.call(this, c); }, this);
    this.matchLimits(nw_border, ne_border);
  }
  
  if (this.builder.min_latitude == -90) {
    var south_border = this.builder.centers.select(function(c) { return c.border('south'); })
      , sw_border    = south_border.select(function(c) { return c.point.x < this.builder.center.x; }, this)
      , se_border    = south_border.select(function(c) { return c.point.x >= this.builder.center.x; }, this)
      ;
      
    south_border.each(function(c) { c.elevation = elevation.call(this, c); }, this);
    this.matchLimits(sw_border, se_border);
  }
  
  this.builder.centers.asQueue(function(c, queue, queued) {
    if (null == c.elevation) c.elevation = elevation.call(this, c);
    
    if (c.elevation > (0.9 * this.options.ceil)) this.mountains.push(c);
    if (c.elevation < (-0.9 * this.options.ceil)) this.trenches.push(c);
    if (c.elevation <= 0) c.water = true;

    c.neighbors.each(function(n) {
      if (0 > queued.indexOf(n) && 0 > queue.indexOf(n)) queue.push(n);
    });
  }, this, queue_start);
};

map.build.shape.base.chains.prototype.matrix = function(width, height) {
  var matrix = map.utils.matrix(width, height);
  for (var i = 0; i < width; i++) {
    for (var j = 0; j < height; j++) {
      matrix[i][j] = ['trenches', 'mountains'][Math.round(this.prng.nextRange(0, 2))];
    }
  }
  return matrix;
};

map.build.shape.base.chains.prototype.apply = function() {
  var shape           = this
    , latitude_range  = (this.builder.max_latitude - this.builder.min_latitude)
    , longitude_range = (this.builder.max_longitude - this.builder.min_longitude)
    , width           = Math.round(this.prng.nextRange(longitude_range/24, longitude_range/18))
    , height          = Math.round(this.prng.nextRange(latitude_range/24, latitude_range/18))
    , matrix          = this.matrix(width, height)
    ;

  for (var x = 0, i = 0, dx = Math.ceil(this.builder.width/width); x < this.builder.width; x += dx, i++) {
    for (var y = 0, j = 0, dy = Math.ceil(this.builder.height/height); y < this.builder.height; y += dy, j++) {
      
      var pool       = matrix[i][j]
        , collection = this[pool]
        , elevation  = (pool == 'trenches' ? -this.options.ceil : this.options.ceil)
        , elevation  = [elevation, elevation/3, elevation, elevation/5][Math.round(this.prng.nextRange(0, 3))]
        , pits       = Math.round(this.prng.nextRange(1, 3))
        , chains     = this.chains(pits, function(c) {
            return (c.point.x >= x && c.point.x <= x + dx && c.point.y >= y && c.point.y <= y + dy);
          }, this.builder)
        ;
      chains.forEach(function(chain) {
        chain.forEach(function(c) {
          c.elevation = this.options.noise(c.point.x, elevation);
          collection.push(c);
        }, this);
      }, this);
      
    }
  }

  this.interpolate();
  this.smooth();
};