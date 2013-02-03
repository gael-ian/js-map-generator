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

map.build.shape.base.chains.prototype.interpolate = function(easing, easing_options) {
  this.builder.centers.asQueue(function(c, queue, queued) {
    var find_nearest      = function(nearest, center) {
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

    if (null == c.elevation) c.elevation = this.options.noise(trench_distance, scale(trench_distance));
    if (c.elevation > (0.9 * this.options.ceil)) this.mountains.push(c);
    if (c.elevation < (-0.9 * this.options.ceil)) this.trenches.push(c);
    if (c.elevation <= 0) c.water = true;

    c.neighbors.each(function(n) {
      if (0 > queued.indexOf(n) && 0 > queue.indexOf(n)) queue.push(n);
    });
  }, this);
};

map.build.shape.base.chains.prototype.smooth = function() {
  this.builder.centers.each(function(c) {
    c.elevation = c.neighbors.reduce(function(s, n) { return s + n.elevation; }, this, 0) / c.neighbors.length();
    if (c.elevation <= 0) c.water = true;
  });
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
  var shape  = this
    , width  = Math.round(this.prng.nextRange(8, 12))
    , height = Math.round(this.prng.nextRange(8, 12))
    , matrix = this.matrix(width, height)
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