var map = {
  core:  {},
  graph: {},
  utils: {}
};

map.utils.genKey = function(x, y) {
  return ['_', Math.round(x), Math.round(y)].join('_');
}

map.core.point = function(x, y) {
  this.x = x;
  this.y = y;
};

map.graph.center = function(point) {
  
  this.point      = point;
  this.neightbors = {};
  this.edges      = {};
  this.corners    = {};
  
  this.key = function() {
    return map.utils.genKey(this.point.x, this.point.y);
  }
  
};

map.graph.corner = function(point) {
  
  this.point      = point;
  this.centers    = {};
  this.edges      = {};
  
  this.key = function() {
    return map.utils.genKey(this.point.x, this.point.y);
  }
  
};

map.graph.edge = function(point) {
  
  this.point      = point;
  this.centers    = {};
  this.corners    = {};
  
  this.key = function() {
    return map.utils.genKey(this.point.x, this.point.y);
  }
  
};

map.builder = function(canvas) {

  this.LLOYD_PASSES = 3;
  
  this.context      = canvas.getContext('2d');
  this.width        = canvas.clientWidth;
  this.height       = canvas.clientHeight;
    
  this.points       = [];
  this.buildSteps   = [];
        
  this.centers = {};
  this.edges   = {};
  this.corners = {};
    
  this.reset = function() {
      
    this.points     = [];
    this.buildSteps = [];
        
    this.centers = {};
    this.edges   = {};
    this.corners = {};
      
    this.clearCanvas();
  };
      
  this.clearCanvas = function() {
    this.context.clearRect(0, 0, this.widht, this.height);
  };
      
  this.defaultBuildSteps = function() {
        
    var steps = [];
      
    steps.push({
      name:     'Generate random points',
      callback: function() {
          
        this.points = [];
        var num_points = Math.round((this.width * this.height) / 500);
        for (var i = 0; i <= num_points; i++) {
          var x = Math.floor(Math.random() * (this.width  - 10))
            , y = Math.floor(Math.random() * (this.height - 10));
            
          this.points.push(new map.core.point(x, y));
        }
      }
    });
      
    steps.push({
      name:     'Improve random points',
      callback: function() {
        for (var i = 0; i <= this.LLOYD_PASSES; i++) {
          this.points = this.improveRandomPoints(this.points);
        }
      }
    });
      
    steps.push({
      name:     'Build graph',
      callback: function() {
        
        var voronoi = new Voronoi()
          , diagram = voronoi.compute(this.points, { xl: 0, xr: this.width, yt: 0, yb: this.height })
          , self    = this
          ;
        
        // Build centers
        this.points.forEach(function(p) {
          var c = new map.graph.center(p);
          self.centers[c.key()] = c;
        });
        
        // Associates edges and corners
        diagram.edges.forEach(function(e, i) {
          
          var point = new map.core.point(((e.va.x + e.vb.x) / 2), ((e.va.y + e.vb.y) / 2))
            , edge  = new map.graph.edge(point)
            , ca    = (self.corners[map.utils.genKey(e.va.x, e.va.y)] || new map.graph.corner(new map.core.point(e.va.x, e.va.y)))
            , cb    = (self.corners[map.utils.genKey(e.vb.x, e.vb.y)] || new map.graph.corner(new map.core.point(e.vb.x, e.vb.y)))
            ;
          
          ca.edges[edge.key()] = cb.edges[edge.key()] = edge;
          
          edge.corners[ca.key()] = ca;
          edge.corners[cb.key()] = cb;
          
          [e.lSite, e.rSite].forEach(function(site) {
            if (site) {
              var c = self.centers[map.utils.genKey(site.x, site.y)];
              
              edge.centers[c.key()] = ca.centers[c.key()] = cb.centers[c.key()] = c;
              c.edges[edge.key()] = edge;
              c.corners[ca.key()] = ca;
              c.corners[cb.key()] = cb;
            }
          });
          
          self.edges[edge.key()] = edge;
          self.corners[ca.key()] = ca;
          self.corners[cb.key()] = cb;
          
        });
        
        // Compute neightbors
        for (var c_key in this.centers) {
          var c = this.centers[c_key];
          for (var e_key in c.edges) {
            var e = c.edges[e_key];
            for (var _c_key in e.centers) {
              var _c = e.centers[_c_key];
              
              if (c.key() != _c.key()) c.neightbors[_c.key()] = _c;
            }
          }
        }
        
      }
    });
    
    steps.push({
      name:     'Draw edges',
      callback: function() {
        
        var self = this;
        
        for (var e_k in this.edges) {
          var e = this.edges[e_k]
            , moved = false
            ;
          
          self.context.beginPath();
          
          for (var k in e.corners) {
            var c = e.corners[k];
            if (!moved) {
              self.context.moveTo(c.point.x, c.point.y);
              moved = true;
            } else {
              self.context.lineTo(c.point.x, c.point.y);
            }
          }
          
          self.context.strokeStyle = 'black';
          self.context.stroke();
        }
        
      }
    });
    
    steps.push({
      name:     'Draw neighborhood',
      callback: function() {
        
        var self = this;
        
        for (var k in this.centers) {
          var c = this.centers[k];
          
          for (var nk in c.neightbors) {
            var n = c.neightbors[nk];
          
            self.context.beginPath();
            self.context.moveTo(c.point.x, c.point.y);
            self.context.lineTo(n.point.x, n.point.y);
            self.context.strokeStyle = 'grey';
            self.context.stroke();
          }
        }
        
      }
    });
    
    steps.push({
      name:     'Draw centers',
      callback: function() {
        
        var self = this;
        
        for (var k in this.centers) {
          var c = this.centers[k];
          
          self.context.beginPath();
          self.context.arc(c.point.x, c.point.y, 1, 0, 2 * Math.PI, true);
          self.context.strokeStyle = 'blue';
          self.context.stroke();
        }
      }
    });
    
    steps.push({
      name:     'Draw corners',
      callback: function() {
        
        var self = this;
        
        for (var k in this.corners) {
          var c = this.corners[k];
          
          self.context.beginPath();
          self.context.arc(c.point.x, c.point.y, 1, 0, 2 * Math.PI, true);
          self.context.strokeStyle = 'red';
          self.context.stroke();
        }
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
    
  this.generate = function() {
      var begin = 0,
        self = this;
    
    if (this.buildSteps.length == 0) {
      this.buildSteps = this.defaultBuildSteps();
    }
    
    this.buildSteps.forEach(function(step) {
      begin = (new Date()).getTime();
      step.callback.apply(self);
      console.log(step.name + ': ' + ((new Date()).getTime() - begin) + 'ms');
    });
  };
      
  this.improveRandomPoints = function(points) {
    var voronoi = new Voronoi()
      , diagram = voronoi.compute(points, { xl: 0, xr: this.width, yt: 0, yb: this.height })
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
    
      _points.push(new map.core.point(Math.round(x), Math.round(y)));
    });
    
    return _points;
  };
};