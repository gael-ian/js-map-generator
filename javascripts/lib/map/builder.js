/*
 * map.builder
 * Process buildSteps to construct a new random map representation
 */
map.builder = function(canvas) {
  
  this.context = canvas.getContext('2d');
  this.width   = canvas.clientWidth;
  this.height  = canvas.clientHeight;
    
  this.points       = [];
  
  this.steps   = new map.core.stack();
        
  this.centers = new map.core.dictionary();
  this.edges   = new map.core.dictionary();
  this.corners = new map.core.dictionary();
    
  this.reset = function() {
      
    this.points  = [];
    this.steps   = new map.core.stack();
        
    this.centers = new map.core.dictionary();
    this.edges   = new map.core.dictionary();
    this.corners = new map.core.dictionary();
  };
      
  this.defaultSteps = function() {
        
    var steps = new map.core.stack();
      
    steps.push({
      name:     'Generate random points',
      callback: function() {          
        this.points = [];
        for (var i = 0, num_points = Math.round((this.width * this.height) / 500); i <= num_points; i++) {
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
        
        // Build centers
        this.points.forEach(function(p) {
          var c = new map.graph.center(new map.graph.point(Math.round(p.x), Math.round(p.y)));
          this.centers[c.key()] = c;
        }, this);
        
        // Associates edges and corners
        diagram.edges.forEach(function(e) {
          
          var a_x     = Math.round(e.va.x)
            , a_y     = Math.round(e.va.y)
            , b_x     = Math.round(e.vb.x)
            , b_y     = Math.round(e.vb.y)
            
            , point = new map.graph.point(Math.round((a_x + b_x) / 2), Math.round((a_y + b_y) / 2))
            , edge  = new map.graph.edge(point)
            , ca    = (this.corners[map.utils.genKey(a_x, a_y)] || new map.graph.corner(new map.graph.point(a_x, a_y)))
            , cb    = (this.corners[map.utils.genKey(b_x, b_y)] || new map.graph.corner(new map.graph.point(b_x, b_y)))
            ;
          
          ca.edges[edge.key()] = cb.edges[edge.key()] = edge;
          
          edge.corners[ca.key()] = ca;
          edge.corners[cb.key()] = cb;
          
          [e.lSite, e.rSite].forEach(function(site) {
            if (site) {
              var c = this.centers[map.utils.genKey(Math.round(site.x), Math.round(site.y))];
              
              edge.centers[c.key()] = ca.centers[c.key()] = cb.centers[c.key()] = c;
              c.edges[edge.key()] = edge;
              c.corners[ca.key()] = ca;
              c.corners[cb.key()] = cb;
            }
          }, this);
          
          this.edges[edge.key()] = edge;
          this.corners[ca.key()] = ca;
          this.corners[cb.key()] = cb;
          
        }, this);
        
        // Compute neighbors
        this.centers.each(function(c) {
          c.edges.each(function (e) {
            e.centers.each(function(n) {
              if (c.key() != n.key()) c.neighbors[n.key()] = n;
            });
          });
        });
        
        // Compute adjacents
        this.corners.each(function(c) {
          c.edges.each(function (e) {
            e.corners.each(function(a) {
              if (c.key() != a.key()) c.adjacents[a.key()] = a;
            });
          });
        });
      }
    });
    
    steps.push({
      name:     'Assign water',
      callback: function() {
        
        var queue       = []
          , self        = this
          , is_land     = this.island_builders('perlin')
          ;
        
        // Assign water to corners
        this.corners.each(function(c) {
          c.water = !is_land(c);
        }, this);
        
        // Compute water on centers
        this.centers.each(function(c) {
          c.water = (c.corners.select(function(co) { return co.water; }).length() == c.corners.length());
        });
        
        // Separate ocean and lake
        this.centers.as_queue(function(c, queue, queued) {
          
          c.ocean = c.ocean || (c.water && (c.border(self) || (null != c.neighbors.detect(function(n) { return n.ocean; }))));
          
          c.neighbors.each(function(n) {
            if (0 > queued.indexOf(n) && 0 > queue.indexOf(n)) queue.push(n);
          });
          /*
          // In some edge case (near coast), we need a second pass.
          if (c.neighbors.select(function(n) { return (0 > queued.indexOf(n)); }).length() > 0 && c.water && !c.ocean) {
            queue.push(c);
            queued.splice(queued.indexOf(c), 1);
          }
          */
        }, this, this.centers.select(function(c) { return c.border(self); }).reduce([], function(m, i) {
          m.push(i);
          return m;          
        }));
        
      }
    });
      
    return steps;
  };
  
  this.island_builders = function(strategy) {
    
    var self = this;
      
    switch(strategy) {
      case 'square':
        return function(location) {
          return !location.border(self);
        };
        
      case 'circle':
        var r_max = Math.min(self.height/2, self.width/2);
        
        return function(location) {
          var circ_x = (location.point.x - self.width/2)
            , circ_y = (location.point.y - self.height/2)
            , r      = Math.sqrt((circ_x*circ_x) + (circ_y*circ_y)) / r_max
            ;
          return (r < 0.8);
        };
        
      case 'radial':
        var prng  = new PRNG();
        
        prng.seed = self.seed;
        
        var r_max    = [self.height/2, self.width/2][Math.round(prng.nextRange(0, 1))]
          , bumps    = prng.nextRange(1, 6)
          , start_a  = prng.nextRange(0, 2*Math.PI)
          , start_b  = prng.nextRange(0, 2*Math.PI)
          ;
        
        return function(location) {
          var circ_x = (location.point.x - self.width/2)
            , circ_y = (location.point.y - self.height/2)
            , a      = Math.atan2(circ_y, circ_x)
            , r      = Math.sqrt((circ_x*circ_x) + (circ_y*circ_y)) / r_max
            , r1     = 0.4 + 0.30*Math.sin(start_a + a*bumps + Math.cos((bumps+3)*a))
            , r2     = 0.7 + 0.30*Math.sin(start_b + a*bumps - Math.sin((bumps+3)*a))
            ;
          return (r < r1 || (r > r1 * 1.3 && r < r2));
        };
        
      case 'perlin':
        var bitmap  = new BitmapData(64, 64)
          , coeff_x = (64 / self.width)
          , coeff_y = (64 / self.height)
          , diag    = Math.sqrt((self.height * self.height) + (self.width * self.width))
          ;
        bitmap.perlinNoise(32, 32, self.seed, BitmapDataChannel.BLUE, false);
        
        return function(location) {
          var blue = (bitmap.getPixel(Math.round(location.point.x * coeff_x), Math.round(location.point.y * coeff_y)) / 255)
            , dist_x = (location.point.x - self.width/2)
            , dist_y = (location.point.y - self.height/2)
            ;
          return (blue > 0.3 + 0.3 * (Math.sqrt((dist_x*dist_x) + (dist_y*dist_y)) / diag) * (Math.sqrt((dist_x*dist_x) + (dist_y*dist_y)) / diag));
        };
        
      default:
        return function(location) {
          return false;
        };
    }
  }
    
  this.build = function(seed) {
    
    if (undefined == seed) {
      this.seed = Math.floor(Math.random() * ((new Date()).getTime() % this.width));
    }
    
    if (this.steps.length == 0) {
      this.steps = this.defaultSteps();
    }
    
    this.steps.run(this);
  };
};