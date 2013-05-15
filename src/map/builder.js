/*
 * map.builder
 * Process buildSteps to construct a new random map representation
 */
map.builder = function() {
  
  this.radius        =  5000;
  
  this.max_latitude  =  90;
  this.min_latitude  = -90;

  this.max_longitude =  180;
  this.min_longitude = -180;
  
  this.resolution    =  0.05;

  
  this.prng  = new PRNG();
  this.seed  = Math.floor(Math.random() * ((new Date()).getTime() % this.radius));
  
  this.shape = null;
  
  
  this.steps = new map.core.stack();

  this.reset();
  
  /*
  this.biomes = new map.core.dictionary();

  [
      'desert'
    , 'flooded_grassland'
    , 'mangrove'
    , 'mediterranean_forest'
    , 'montane_grassland'
    , 'taiga'
    , 'temperate_broadleaf_forest'
    , 'temperate_coniferous_forest'
    , 'temperate_grassland'
    , 'tropical_broadleaf_forest'
    , 'tropical_coniferous_forest'
    , 'tropical_grassland'
    , 'tropical_rainforest'
    , 'tundra'
  ].forEach(function(name) {
    this.biomes[name] = new map.build.biome[name]();
  }, this);
  */
};

map.builder.prototype.reset = function() {
  this.points    = [];
  
  this.centers   = new map.core.dictionary();
  this.edges     = new map.core.dictionary();
  this.corners   = new map.core.dictionary();
  
  this.prng.seed = this.seed;
};

map.builder.prototype.setShape = function(shape_class, shape_options) {
  this.shape = new shape_class(this, shape_options);
};

map.builder.prototype.setRadius = function(radius) {
  if (radius < 0) {
    throw new RangeError('Radius must be a positive number');
  }
  this.radius = radius;
};

['min_latitude', 'max_latitude', 'min_longitude', 'max_longitude'].forEach(function(name) {
  var camelized_name = name.replace (/(?:^|[-_])(\w)/g, function (_, c) {
        return c ? c.toUpperCase () : '';
      })
    , max = (name.match(/longitude/) ? 180 : 90)
    ; 
  
  map.builder.prototype['set' + camelized_name] = function(limit) {
    limit = parseInt(limit, 10);
    if (limit > max || limit < -max) {
      throw new RangeError('Invalid ' + camelized_name + ': must be included in -' + max + '..' + max);
    }
    this[name] = limit;
  };
});

map.builder.prototype.setSeed = function(seed) {
  this.seed = seed;
};

map.builder.prototype.setPrng = function(prng) {
  this.prng = prng;
};

map.builder.prototype.build = function() {
  if (this.steps.length == 0) {
    this.steps = this.defaultSteps();
  }
  this.steps.run(this);
};
      
map.builder.prototype.defaultSteps = function() {
        
  var steps = new map.core.stack();

  steps.push({
    name:     'Compute relative dimensions',
    callback: function() {
      var lat = this.min_latitude + ((this.max_latitude - this.min_latitude) / 2)
        , lng = this.min_longitude + ((this.max_longitude - this.min_longitude) / 2)
        ;
      this.center = new map.graph.point(lat, lng);
      
      this.longitudinal_circ = (this.max_longitude - this.min_longitude) * (Math.PI / 180) * this.radius;
      this.latitudinal_circ  = (this.max_latitude - this.min_latitude) * (Math.PI / 180) * this.radius;
    }
  });

  steps.push({
    name:     'Generate random points',
    callback: function() {
      var latitude_range  = (this.max_latitude - this.min_latitude)
        , longitude_range = (this.max_longitude - this.min_longitude)
        , num_points      = (latitude_range * longitude_range * this.resolution)
        ;
      
      this.points = [];
      for (var i = 0; i <= num_points; i++) {
        this.points.push({
          x: this.prng.nextRange(0, this.max_longitude - this.min_longitude)
        , y: this.prng.nextRange(0, this.max_latitude  - this.min_latitude )
        });
      }
    }
  });

  steps.push({
    name:     'Improve random points',
    callback: function() {
      var llyod_passes        = 3
        , self                = this
        , improveRandomPoints = function(points) {
          var _voronoi = new Voronoi()
            , diagram  = _voronoi.compute(points, {
                  xl: 0
                , xr: (self.max_longitude - self.min_longitude)
                , yt: 0
                , yb: (self.max_latitude - self.min_latitude)
              })
            , _points  = []
            ;

          diagram.cells.forEach(function(cell) {
            var x = 0
              , y = 0
              , l = (cell.halfedges.length * 2)
              ;

            cell.halfedges.forEach(function(halfedge) {
              x += (halfedge.getStartpoint().x / l) + (halfedge.getEndpoint().x / l);
              y += (halfedge.getStartpoint().y / l) + (halfedge.getEndpoint().y / l);
            });

            _points.push({ x: x, y: y });
          });

          return _points;
        };

      for (var i = 0; i <= llyod_passes; i++) {
        this.points = improveRandomPoints(this.points);
      }
    }
  });

  steps.push({
    name:     'Build graph',
    callback: function() {

      var voronoi = new Voronoi()
        , diagram = voronoi.compute(this.points, {
              xl: 0
            , xr: (this.max_longitude - this.min_longitude)
            , yt: 0
            , yb: (this.max_latitude - this.min_latitude)
          })
        ;

      // Associates edges and corners
      diagram.edges.forEach(function(_e) {

        var a_lng = _e.va.x + this.min_longitude
          , a_lat = _e.va.y - this.max_latitude
          , b_lng = _e.vb.x + this.min_longitude
          , b_lat = _e.vb.y - this.max_latitude

          , e     = new map.graph.point((a_lat + b_lat) / 2, (a_lng + b_lng) / 2, this)
          , a     = new map.graph.point(a_lat, a_lng, this)
          , b     = new map.graph.point(b_lat, b_lng, this)

          , edge  = new map.graph.edge(e)
          , ca    = (this.corners[a.toString()] || new map.graph.corner(a))
          , cb    = (this.corners[b.toString()] || new map.graph.corner(b))
          ;

        ca.edges[edge.toString()] = edge;
        cb.edges[edge.toString()] = edge;

        edge.corners[ca.toString()] = ca;
        edge.corners[cb.toString()] = cb;

        [_e.lSite, _e.rSite].forEach(function(site) {
          if (site) {
            var s    = new map.graph.point(site.y - this.max_latitude, site.x + this.min_longitude, this)
              , c    = (this.centers[s.toString()] || new map.graph.center(s))
              ;

            this.centers[s.toString()] = c;

            edge.centers[c.toString()] = c;
            ca.centers[c.toString()] = c;
            cb.centers[c.toString()] = c;

            c.edges[edge.toString()] = edge;
            c.corners[ca.toString()] = ca;
            c.corners[cb.toString()] = cb;
          }
        }, this);

        this.edges[edge.toString()] = edge;
        this.corners[ca.toString()] = ca;
        this.corners[cb.toString()] = cb;

      }, this);

      // Compute neighbors
      this.centers.each(function(c) {
        c.edges.each(function (e) {
          e.centers.each(function(n) {
            if (c.toString() != n.toString()) c.neighbors[n.toString()] = n;
          });
        });
      });

      // Compute adjacents
      this.corners.each(function(c) {
        c.edges.each(function (e) {
          e.corners.each(function(a) {
            if (c.toString() != a.toString()) c.adjacents[a.toString()] = a;
          });
        });
      });
    }
  });
  
  steps.push({
    name:     'Apply shape',
    callback: function() {
      this.shape.apply();
    }
  });

  /*
  steps.push({
    name:     'Assign corner elevation',
    callback: function() {
      this.corners.each(function(c) {
        c.elevation = (c.centers.reduce(function(m, ce) { return m + ce.elevation; }, this, 0) / c.centers.length());
      }, this);
    }
  });

  steps.push({
    name:     'Assign coast',
    callback: function() {
      this.centers.select(function(c) { return c.water; }).each(function(c) {
        c.neighbors.each(function(n) {
          if (!n.water) n.coast = true;
        });
      }, this);
    }
  });

  steps.push({
    name:     'Assign biomes',
    callback: function() {

      var self = this;

      // Assign biomes
      this.centers.asQueue(function(c, queue, queued) {

        var biomes = this.biomes.select(function(b) { return b.include(c); }).keys();
        c.neighbors.each(function(n) {
          if (undefined != n.biome && self.biomes[n.biome].tolerate(c)) {
            for(var i = 0, r = self.biomes[n.biome].remanence; i < r; i++) { biomes.push(n.biome); }
          }
        }, this);

        c.biome = biomes[Math.floor(Math.random() * biomes.length)];
        
        c.neighbors.each(function(n) {
          if (0 > queued.indexOf(n) && 0 > queue.indexOf(n) && !n.water) queue.push(n);
        });
      }, this, this.centers.select(function(c) { return c.coast; }).toArray());
    }
  });
  */

  return steps;
};