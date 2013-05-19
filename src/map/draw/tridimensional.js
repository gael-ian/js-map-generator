 /*
 * map.drawer
 * Draw the map define by the builder onto canvas
 */
map.draw.tridimensional = function(canvas) {
  map.draw.base.call(this, canvas);
  
  this.projection_namespace = map.draw.projection.tridimensional;
};
map.utils.inherits(map.draw.tridimensional, map.draw.base);

map.draw.tridimensional.prototype.reset = function(canvas) {
  this.context = this.canvas.getContext('webgl');
  this.clear();
};
      
map.draw.tridimensional.prototype.clear = function() {
  this.context.clearColor(255, 255, 255, 1.0);
  this.context.enable(this.context.DEPTH_TEST);
  this.context.depthFunc(this.context.LEQUAL);
  this.context.clear(this.context.COLOR_BUFFER_BIT|this.context.DEPTH_BUFFER_BIT); 
};

map.draw.tridimensional.prototype.x = function(location) {
  return this.projection.x(location);
};

map.draw.tridimensional.prototype.y = function(location) {
  return this.projection.y(location);
};

map.draw.tridimensional.prototype.z = function(location) {
  return this.projection.z(location);
};
      
map.draw.tridimensional.prototype.defaultSteps = function() {
        
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
