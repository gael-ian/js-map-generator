/*
 * map.builder
 * Process buildSteps to construct a new random map representation
 */
map.builder = function(canvas) {
  
  this.shape  = null;
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

  this.max_latitude  =  90;
  this.min_latitude  = -90;

  this.max_longitude =  90;
  this.min_longitude = -90;
  
  this.steps = new map.core.stack();

  this.setCanvas(canvas);
};

map.builder.prototype.reset = function() {

  this.center  = null;
  this.points  = [];

  this.centers = new map.core.dictionary();
  this.edges   = new map.core.dictionary();
  this.corners = new map.core.dictionary();
};

map.builder.prototype.setCanvas = function(canvas) {

  this.canvas  = canvas;

  this.width   = canvas.clientWidth;
  this.height  = canvas.clientHeight;

  this.reset();
};

map.builder.prototype.setShape = function(shape_class, shape_options) {
  this.shape = new shape_class(this, shape_options);
};

['min_latitude', 'max_latitude', 'min_longitude', 'max_longitude'].forEach(function(name) {
  var camelized_name = name.replace (/(?:^|[-_])(\w)/g, function (_, c) {
    return c ? c.toUpperCase () : '';
  });
  
  map.builder.prototype['set' + camelized_name] = function(limit) {
    limit = parseInt(limit, 10);
    if (limit > 90 || limit < -90) {
      throw new RangeError('Invalid limit');
    }
    this[name] = limit;
  };
});

map.builder.prototype.build = function() {
  if (this.steps.length == 0) {
    this.steps = this.defaultSteps();
  }
  this.steps.run(this);
};
      
map.builder.prototype.defaultSteps = function() {
        
  var steps = new map.core.stack();

  steps.push({
    name:     'Set center',
    callback: function() {
      var x = Math.round((this.max_longitude * -1) / ((this.min_longitude - this.max_longitude) / this.width))
        , y = Math.round((this.max_latitude * -1) / ((this.min_latitude - this.max_latitude) / this.height))
        ;
      this.center = new map.graph.point(x, y);

      this.shorter_dimension = (x > y ? y : x) * 2;
      this.larger_dimension  = (x > y ? x : y) * 2;
    }
  });

  steps.push({
    name:     'Generate random points',
    callback: function() {
      this.points = [];
      for (var i = 0, num_points = Math.round((this.width * this.height) / 200); i <= num_points; i++) {
        var x = Math.round(Math.random() * this.width)
          , y = Math.round(Math.random() * this.height)
          ;

        this.points.push(new map.graph.point(x, y));
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
            , diagram  = _voronoi.compute(points, { xl: 0, xr: self.width, yt: 0, yb: self.height })
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

            _points.push(new map.graph.point(Math.round(x), Math.round(y)));
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
        , diagram = voronoi.compute(this.points, { xl: 0, xr: this.width, yt: 0, yb: this.height })
        ;

      // Associates edges and corners
      diagram.edges.forEach(function(_e) {

        var index   = null
          , a_x     = Math.round(_e.va.x)
          , a_y     = Math.round(_e.va.y)
          , b_x     = Math.round(_e.vb.x)
          , b_y     = Math.round(_e.vb.y)

          , e       = new map.graph.point(Math.round((a_x + b_x) / 2), Math.round((a_y + b_y) / 2), this)
          , a       = new map.graph.point(a_x, a_y, this)
          , b       = new map.graph.point(b_x, b_y, this)

          , edge    = new map.graph.edge(e)
          , ca      = (this.corners[a.toString()] || new map.graph.corner(a))
          , cb      = (this.corners[b.toString()] || new map.graph.corner(b))
          ;

        ca.edges[edge.toString()] = edge;
        cb.edges[edge.toString()] = edge;

        edge.corners[ca.toString()] = ca;
        edge.corners[cb.toString()] = cb;

        [_e.lSite, _e.rSite].forEach(function(site) {
          if (site) {
            var s    = new map.graph.point(Math.round(site.x), Math.round(site.y), this)
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
    name:     'Assign water',
    callback: function() {

      var self = this;

      // Assign water
      this.corners.each(function(c) {
        c.water = !this.shape.isLand(c);
      }, this);
      
      this.centers.each(function(c) {
        c.water = !c.corners.detect(function(co) { return !co.water });
      }, this);

      // Separate ocean and lake
      this.centers.asQueue(function(c, queue, queued) {
        c.ocean = true;
        c.neighbors.each(function(n) {
          if (0 > queued.indexOf(n) && 0 > queue.indexOf(n) && n.water) queue.push(n);
        });
      }, this, this.centers.select(function(c) { return (c.border() && c.water); }).toArray());

      // Assign coast
      this.centers.asQueue(function(c, queue, queued) {
        c.neighbors.each(function(n) {
          if (!n.water) n.coast = true;
          if (0 > queued.indexOf(n) && 0 > queue.indexOf(n) && n.water) queue.push(n);
        });
      }, this, this.centers.select(function(c) { return c.ocean; }).toArray());

    }
  });

  steps.push({
    name:     'Assign biomes',
    callback: function() {

      var self = this;

      // Assign biomes
      this.centers.asQueue(function(c, queue, queued) {

        var biomes = this.biomes.select(function(b) { return b.include(c); }).keys().reduce(function(memo, name) {
            for(var i = 0, f = self.biomes[name].frequency; i < f; i++) { memo.push(name); }
            return memo;
          }, []);
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

  return steps;
};