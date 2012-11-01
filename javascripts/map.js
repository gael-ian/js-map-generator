map = {
  core:  {},
  graph: {},
  utils: {}
};

map.utils.genKey = function(x, y) {
  return ['', Math.round(x), Math.round(y)].join('_');
};

map.core.dictionary = function() {
  Object.apply(this, arguments);
};
map.core.dictionary.prototype = new Object();
  
map.core.dictionary.prototype.each = function(iterator, scope) {
  var keys = Object.keys(this);
  for(var i in keys){
    iterator.call(scope, this[keys[i]], i, this);
  }
};

map.core.point = function(x, y) {
  this.x = x;
  this.y = y;
};

map.graph.location = function(point) {
  this.point = point;
};

map.graph.location.prototype.key = function() {
  return map.utils.genKey(this.point.x, this.point.y);
}

map.graph.center = function(point) {
  map.graph.location.call(this, point);
  
  this.neighbors  = new map.core.dictionary();
  this.edges      = new map.core.dictionary();
  this.corners    = new map.core.dictionary();
  
};
map.graph.center.prototype = new map.graph.location();

map.graph.corner = function(point) {
  map.graph.location.call(this, point);
  
  this.centers    = new map.core.dictionary();
  this.edges      = new map.core.dictionary();
};
map.graph.corner.prototype = new map.graph.location();
  
map.graph.corner.prototype.border = function() {
    return (this.point.x == 0 || this.point.y == 0)
};

map.graph.edge = function(point) {
  map.graph.location.call(this, point);
  
  this.centers    = new map.core.dictionary();
  this.corners    = new map.core.dictionary();
};
map.graph.edge.prototype = new map.graph.location();

map.builder = function(canvas) {

  this.LLOYD_PASSES = 3;
  
  this.context      = canvas.getContext('2d');
  this.width        = canvas.clientWidth;
  this.height       = canvas.clientHeight;
    
  this.points       = [];
  this.buildSteps   = [];
        
  this.centers = new map.core.dictionary();
  this.edges   = new map.core.dictionary();
  this.corners = new map.core.dictionary();
    
  this.reset = function() {
      
    this.points     = [];
    this.buildSteps = [];
        
    this.centers = new map.core.dictionary();
    this.edges   = new map.core.dictionary();
    this.corners = new map.core.dictionary();
      
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
        for (var i = 0, num_points = Math.round((this.width * this.height) / 500); i <= num_points; i++) {
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
          ;
        
        // Build centers
        this.points.forEach(function(p) {
          var c = new map.graph.center(p);
          this.centers[c.key()] = c;
        }, this);
        
        // Associates edges and corners
        diagram.edges.forEach(function(e, i) {
          
          var point = new map.core.point(((e.va.x + e.vb.x) / 2), ((e.va.y + e.vb.y) / 2))
            , edge  = new map.graph.edge(point)
            , ca    = (this.corners[map.utils.genKey(e.va.x, e.va.y)] || new map.graph.corner(new map.core.point(e.va.x, e.va.y)))
            , cb    = (this.corners[map.utils.genKey(e.vb.x, e.vb.y)] || new map.graph.corner(new map.core.point(e.vb.x, e.vb.y)))
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
        this.centers.each(function(c) {
          c.neighbors.each(function(n) {
            this.context.beginPath();
            this.context.moveTo(c.point.x, c.point.y);
            this.context.lineTo(n.point.x, n.point.y);
            this.context.strokeStyle = 'grey';
            this.context.stroke();
          }, this);
        }, this);
      }
    });
    
    steps.push({
      name:     'Draw centers',
      callback: function() {
        this.centers.each(function(c) {
          this.context.beginPath();
          this.context.arc(c.point.x, c.point.y, 1, 0, 2 * Math.PI, true);
          this.context.strokeStyle = 'red';
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
          this.context.strokeStyle = 'blue';
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