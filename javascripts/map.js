map = {
  core:  {},
  graph: {},
  utils: {}
};

/*
 * map.utils
 * Utility functions
 */
map.utils.genKey = function(x, y) {
  return ['', Math.round(x), Math.round(y)].join('_');
};

/*
 * map.core.dictionnary
 * Object with easier iteration
 */
map.core.dictionary = function() {
  Object.apply(this, arguments);
};
map.core.dictionary.prototype = new Object();
  
map.core.dictionary.prototype.length = function() {
  return Object.keys(this).length;
};
  
map.core.dictionary.prototype.each = function(iterator, scope) {
  var keys = Object.keys(this);
  for(var i in keys){
    iterator.call(scope, this[keys[i]], i, this);
  }
};
  
map.core.dictionary.prototype.clockwise = function(iterator, scope) {
  var clock = []
    , x     = 0
    , y     = 0;
  
  for(var i in keys = Object.keys(this)) {
    var item = this[keys[i]];
    
    clock.push(item);
    x += item.point.x;
    y += item.point.y;
  }
  x = x / keys.length;
  y = y / keys.length;
  
  var center = new map.graph.point(x, y)
    , angle = function(p) {
        return Math.atan2((p.point.y - center.y), (p.point.x - center.x));
      }
    ;
  
  clock.sort(function(a, b) {
    return (angle(a) - angle(b));
  });
  
  clock.forEach(function(item, i) {
    iterator.call(scope, item, i, this);
  }, this);
};

/*
 * map.core.stack
 * Self executing function array
 */
map.core.stack = function() {
  Array.apply(this, arguments);
}
map.core.stack.prototype = new Array();


map.core.stack.prototype.removeBefore = function(name) {
  var found = false;
  this.forEach(function(step, i) {
    if (step.name == name) found = true;
    if (!found) delete this[i];
  }, this);
};

map.core.stack.prototype.removeAfter = function(name) {
  var found = false;
  this.forEach(function(step, i) {
    if (found) delete this[i];
    if (step.name == name) found = true;
  }, this);
};

map.core.stack.prototype.run = function(scope) {
  var begin = 0;
  this.forEach(function(step, i) {
    begin = (new Date()).getTime();
    step.callback.apply(this);
    console.log(step.name + ': ' + ((new Date()).getTime() - begin) + 'ms');
  }, scope);
};

/*
 * map.graph.point
 * Base unit for the graph
 */
map.graph.point = function(x, y) {
  
  this.x = x;
  this.y = y;
};

map.graph.point.prototype.length = function() {
  return Math.sqrt(this.x*this.x + this.y*this.y);
}

/*
 * map.graph.location
 */
map.graph.location = function(point) {
  
  this.point     = point;
  
  this.elevation = 0;
  this.length    = 0;
  
  this.water     = false;
  this.ocean     = false;
  this.coast     = false;
  this.biome     = null;
  this.moisture  = 0;
};

map.graph.location.prototype.key = function() {
  return map.utils.genKey(this.point.x, this.point.y);
}

/*
 * map.graph.center
 * Center of Voronoï polygons
 */
map.graph.center = function(point) {
  map.graph.location.call(this, point);
  
  this.neighbors  = new map.core.dictionary();
  this.edges      = new map.core.dictionary();
  this.corners    = new map.core.dictionary();
  
};
map.graph.center.prototype = new map.graph.location();
  
map.graph.center.prototype.border = function(context) {
  if (undefined === this._border) {
    this._border = false;
    this.corners.each(function(c) {
      if (c.border(context)) {
        this._border = true;
      }
    }, this);
  }
  return this._border;
};

/*
 * map.graph.corner
 * Corner of Voronoï polygons
 */
map.graph.corner = function(point) {
  map.graph.location.call(this, point);
  
  this.adjacents  = new map.core.dictionary();
  this.centers    = new map.core.dictionary();
  this.edges      = new map.core.dictionary();
};
map.graph.corner.prototype = new map.graph.location();
  
map.graph.corner.prototype.border = function(context) {
    return (this.point.x <= (context.width * 0.02) || this.point.y <= (context.height * 0.02) || this.point.x >= (context.width * 0.98) || this.point.y >= (context.height * 0.98))
};

/*
 * map.graph.edge
 * Edge of Voronoï polygons
 */
map.graph.edge = function(point) {
  map.graph.location.call(this, point);
  
  this.centers    = new map.core.dictionary();
  this.corners    = new map.core.dictionary();
};
map.graph.edge.prototype = new map.graph.location();

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
              
            diagram.cells.forEach(function(cell, i) {
              var x = 0
                , y = 0
                , l = (cell.halfedges.length * 2)
                ;
                
              cell.halfedges.forEach(function(halfedge, i) {
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
          var c = new map.graph.center(p);
          this.centers[c.key()] = c;
        }, this);
        
        // Associates edges and corners
        diagram.edges.forEach(function(e, i) {
          
          var point = new map.graph.point(((e.va.x + e.vb.x) / 2), ((e.va.y + e.vb.y) / 2))
            , edge  = new map.graph.edge(point)
            , ca    = (this.corners[map.utils.genKey(e.va.x, e.va.y)] || new map.graph.corner(new map.graph.point(e.va.x, e.va.y)))
            , cb    = (this.corners[map.utils.genKey(e.vb.x, e.vb.y)] || new map.graph.corner(new map.graph.point(e.vb.x, e.vb.y)))
            ;
          
          ca.edges[edge.key()] = cb.edges[edge.key()] = edge;
          
          edge.corners[ca.key()] = ca;
          edge.corners[cb.key()] = cb;
          
          [e.lSite, e.rSite].forEach(function(site) {
            if (site) {
              var c = this.centers[map.utils.genKey(site.x, site.y)];
              
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
          , is_land     = this.island_builders('radial')
          ;
        
        this.centers.each(function(ce) {
          ce.water = !is_land(ce);
        }, this);
        
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
            , r2     = 0.7 + 0.25*Math.sin(start_b + a*bumps - Math.sin((bumps+3)*a))
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

/*
 * map.drawer
 * Draw the map define by the builder onto canvas
 */
map.drawer = function() {
  
  this.steps   = new map.core.stack();
      
  this.clear = function(builder) {
    builder.context.fillStyle = "white";
    builder.context.fillRect(0, 0, builder.width, builder.height);
  };
      
  this.defaultSteps = function() {
        
    var steps = new map.core.stack();
    
    steps.push({
      name:     'Draw water',
      callback: function() {
        this.centers.each(function(c) {
          if (!c.water) return;
          
          var moved = false;
          c.corners.clockwise(function(co, i) {
            if (!moved) {
              this.context.beginPath();
              this.context.moveTo(co.point.x, co.point.y);
            } else {
              this.context.lineTo(co.point.x, co.point.y);
            }
            moved = true;
          }, this);
          this.context.closePath();
          this.context.fillStyle = '#4D4A89';
          this.context.fill();
          
        }, this);
      }
    });
    
    steps.push({
      name:     'Draw edges',
      callback: function() {
        
        this.edges.each(function(e) {          
          this.context.beginPath();
          var moved = false;
          
          e.corners.each(function(c) {
            if (!moved) {
              this.context.moveTo(c.point.x, c.point.y);
            } else {
              this.context.lineTo(c.point.x, c.point.y);
            }
            moved = true;
          }, this);
          
          this.context.strokeStyle = 'black';
          this.context.stroke();
        }, this);
        
      }
    });
    
    steps.push({
      name:     'Draw neighborhood',
      callback: function() {
        var queue      = []
          , self       = this
          , draw_time  = (new Date()).getTime()
          ;
        
        this.centers.each(function(c) {
          if (c.border(self)) {
            queue.push(c);
          }
        }, this);
        
        while(queue.length != 0) {
          var c = queue.shift();
          if (c.drawedNeighbors != draw_time) {
            c.neighbors.each(function(n) {
              this.context.beginPath();
              this.context.moveTo(c.point.x, c.point.y);
              this.context.lineTo(n.point.x, n.point.y);
              this.context.strokeStyle = '#894E57';
              this.context.stroke();
              
              if (n.drawedNeighbors != draw_time) {
                queue.push(n);
              }
            }, this);
            
            c.drawedNeighbors = draw_time;
          }
        }
      }
    });
    
    steps.push({
      name:     'Draw centers',
      callback: function() {
        this.centers.each(function(c) {
          this.context.beginPath();
          this.context.arc(c.point.x, c.point.y, 1, 0, 2 * Math.PI, true);
          this.context.strokeStyle = (c.water ? 'blue' : 'red');
          this.context.stroke();
        }, this);
      }
    });
    
    steps.push({
      name:     'Draw corners',
      callback: function() {
        this.corners.each(function(c) {
          this.context.beginPath();
          this.context.arc(c.point.x, c.point.y, 1, 0, 2 * Math.PI, true);
          this.context.strokeStyle = '#525252';
          this.context.stroke();
        }, this);
      }
    });
    
    steps.push({
      name:     'Draw grid',
      callback: function() {
        for (var i = 50; i <= (this.width - 50); i = i + 50) {
          this.context.beginPath();
          this.context.moveTo(i, 0);
          this.context.lineTo(i, this.height);
          this.context.strokeStyle = '#ccc';
          this.context.stroke();
        } 
        for (var i = 50; i <= (this.height - 50); i = i + 50) {
          this.context.beginPath();
          this.context.moveTo(0, i);
          this.context.lineTo(this.width, i);
          this.context.strokeStyle = '#ccc';
          this.context.stroke();
        }
      }
    });
      
    return steps;
  };
    
  this.draw = function(builder) {
    
    if (this.steps.length == 0) {
      this.steps = this.defaultSteps();
    }
    
    this.steps.run(builder);
  };
  
};