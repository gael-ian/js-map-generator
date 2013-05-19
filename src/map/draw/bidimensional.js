/*
 * map.drawer
 * Draw the map define by the builder onto canvas
 */
map.draw.bidimensional = function(canvas) {
  map.draw.base.call(this, canvas);
  
  this.projection_namespace = map.draw.projection.bidimensional;
};
map.utils.inherits(map.draw.bidimensional, map.draw.base);

map.draw.bidimensional.prototype.reset = function(canvas) {
  this.context = this.canvas.getContext('2d');
  this.clear();
};
      
map.draw.bidimensional.prototype.clear = function(color) {
  this.context.fillStyle = (color || "white");
  this.context.fillRect(0, 0, this.width, this.height);
};

map.draw.bidimensional.prototype.x = function(location) {
  return this.projection.x(location);
};

map.draw.bidimensional.prototype.y = function(location) {
  return this.projection.y(location);
};

map.draw.bidimensional.prototype.fillRegion = function(center, color) {
  var moved = false;
  
  center.corners.clockwise(function(co, i) {
    if (!moved) {
      this.context.beginPath();
      this.context.moveTo(this.x(co), this.y(co));
    } else {
      this.context.lineTo(this.x(co), this.y(co));
    }
    moved = true;
  }, this);
  this.context.closePath();

  this.context.strokeStyle = color;
  this.context.fillStyle   = color;
  this.context.stroke();
  this.context.fill();
};
      
map.draw.bidimensional.prototype.defaultSteps = function() {
        
  var steps = new map.core.stack();

  steps.push({
    name:     'Draw edges',
    callback: function(context, drawer) {
      this.edges.each(function(e) {
        context.beginPath();
        var moved = false;

        e.corners.each(function(c) {
          if (!moved) {
            context.moveTo(drawer.x(c), drawer.y(c));
          } else {
            context.lineTo(drawer.x(c), drawer.y(c));
          }
          moved = true;
        }, this);

        context.strokeStyle = 'black';
        context.stroke();
      }, this);
    }
  });

  steps.push({
    name:     'Draw neighborhood',
    callback: function(context, drawer) {
      this.centers.asQueue(function(c, queue, queued) {
        c.neighbors.each(function(n) {
          context.beginPath();
          context.moveTo(drawer.x(c), drawer.y(c));
          context.lineTo(drawer.x(n), drawer.y(n));
          context.strokeStyle = '#894E57';
          context.stroke();

          if (0 > queued.indexOf(n) && 0 > queue.indexOf(n)) queue.push(n);
        }, this);
      }, this);
    }
  });

  steps.push({
    name:     'Draw centers',
    callback: function(context, drawer) {
      this.centers.each(function(c) {
        context.beginPath();
        context.arc(drawer.x(c), drawer.y(c), 1, 0, 2 * Math.PI, true);
        context.strokeStyle = 'red';
        context.stroke();
      }, this);
    }
  });

  steps.push({
    name:     'Draw corners',
    callback: function(context, drawer) {
      this.corners.each(function(c) {
        context.beginPath();
        context.arc(drawer.x(c), drawer.y(c), 1, 0, 2 * Math.PI, true);
        context.strokeStyle = '#525252';
        context.stroke();
      }, this);
    }
  });
  
  steps.push({
    name:     'Draw elevation',
    callback: function(context, drawer) {
      var elevation = this.centers.reduce(function(m, c) {
            if (c.elevation > m.max) m.max = c.elevation;
            if (c.elevation < m.min) m.min = c.elevation;
            return m;
          }, this, { min: 0, max: 0 })
        , scale     = map.core.easing.linear({ x: elevation.min, y: 0 }, { x: elevation.max, y: 99 })
        , gradient  = context.createLinearGradient(0, 0, 0, 100)
        ;

      gradient.addColorStop(0,   '#106783');
      gradient.addColorStop((scale(0) / 100),   '#82dbdb');
      gradient.addColorStop((scale(1) / 100),   '#316626');
      gradient.addColorStop((scale(elevation.max * 0.45) / 100), '#f1c457');
      gradient.addColorStop((scale(elevation.max * 0.90) / 100), '#53402a');
      gradient.addColorStop(1,   '#FFFFFF');

      context.fillStyle = gradient;
      context.fillRect(0, 0, 100, 100);
      
      var colors      = context.getImageData(0, 0, 1, 100).data
        , color_scale = []
        ;
      for (var pos = 0; pos < 100; pos++) {
        color_scale.push('rgb(' + colors[pos*4] + ',' + colors[pos*4+1] + ',' + colors[pos*4+2] + ')');
      }

      this.centers.each(function(c) {
        drawer.fillRegion(c, color_scale[Math.floor(scale(c.elevation))]);
      }, this);
    }
  });

  return steps;
}; 
