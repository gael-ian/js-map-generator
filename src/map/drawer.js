/*
 * map.drawer
 * Draw the map define by the builder onto canvas
 */
map.drawer = function(canvas, context_type) {
  
  this.steps        = new map.core.stack();
  this.context_type = (context_type || '2d');

  this.setCanvas(canvas);
};

map.drawer.prototype.setCanvas = function(canvas) {
  
  this.canvas = canvas;

  this.width   = canvas.clientWidth;
  this.height  = canvas.clientHeight;
  
  this.context = this.canvas.getContext(this.context_type);
};

map.drawer.prototype.draw = function(builder) {
  if (this.steps.length == 0) {
    this.steps = this.defaultSteps();
  }
  this.steps.run(builder, this.context);
};
      
map.drawer.prototype.clear = function(color) {
  this.context.fillStyle = (color || "white");
  this.context.fillRect(0, 0, this.width, this.height);
};
      
map.drawer.prototype.defaultSteps = function() {
        
  var steps = new map.core.stack();

  steps.push({
    name:     'Draw water',
    callback: function() {
      var context = arguments[0];
      
      this.centers.each(function(c) {
        if (!c.water) return;

        var moved = false
          , color = (c.ocean ? '#4D4A89' : '#4D86CC')
          ;
        c.corners.clockwise(function(co, i) {
          if (!moved) {
            context.beginPath();
            context.moveTo(co.point.x, co.point.y);
          } else {
            context.lineTo(co.point.x, co.point.y);
          }
          moved = true;
        }, this);
        context.closePath();
        
        context.strokeStyle = color;
        context.fillStyle   = color;
        context.stroke();
        context.fill();

      }, this);
    }
  });

  steps.push({
    name:     'Draw biomes',
    callback: function() {
      var context = arguments[0];

      this.centers.each(function(c) {
        if (c.water) return;

        var moved = false
          , color = '#FFFFFF'
          ;
        c.corners.clockwise(function(co, i) {
          if (!moved) {
            context.beginPath();
            context.moveTo(co.point.x, co.point.y);
          } else {
            context.lineTo(co.point.x, co.point.y);
          }
          moved = true;
        }, this);
        context.closePath();

        switch (c.biome) {
          case 'desert':
            color = '#E0CD8B';
            break;

          case 'flooded_grassland':
            color = '#80B3FF';
            break;

          case 'mangrove':
            color = '#D400AA';
            break;

          case 'mediterranean_forest':
            color = '#C87137';
            break;

          case 'montane_grassland':
            color = '#C6AFE9';
            break;

          case 'taiga':
            color = '#2CA05A';
            break;

          case 'temperate_broadleaf_forest':
            color = '#71C837';
            break;

          case 'temperate_coniferous_forest':
            color = '#005500';
            break;

          case 'temperate_grassland':
            color = '#CDDE87';
            break;

          case 'tropical_broadleaf_forest':
            color = '#D4AA00';
            break;

          case 'tropical_coniferous_forest':
            color = '#66FF00';
            break;

          case 'tropical_grassland':
            color = '#FFDD55';
            break;

          case 'tropical_rainforest':
            color = '#447821';
            break;

          case 'tundra':
            color = '#87DECD';
            break;

          default:
            color = '#FFFFFF';
            break;
        }
        context.strokeStyle = color;
        context.fillStyle   = color;
        context.stroke();
        context.fill();

      }, this);
    }
  });

  steps.push({
    name:     'Draw edges',
    callback: function() {
      var context = arguments[0];

      this.edges.each(function(e) {
        context.beginPath();
        var moved = false;

        e.corners.each(function(c) {
          if (!moved) {
            context.moveTo(c.point.x, c.point.y);
          } else {
            context.lineTo(c.point.x, c.point.y);
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
    callback: function() {
      var context    = arguments[0]
        , queue      = []
        , self       = this
        , draw_time  = (new Date()).getTime()
        ;

      this.centers.asQueue(function(c, queue, queued) {
        c.neighbors.each(function(n) {
          context.beginPath();
          context.moveTo(c.point.x, c.point.y);
          context.lineTo(n.point.x, n.point.y);
          context.strokeStyle = '#894E57';
          context.stroke();

          if (0 > queued.indexOf(n) && 0 > queue.indexOf(n)) queue.push(n);
        }, this);
      }, this);

    }
  });

  steps.push({
    name:     'Draw centers',
    callback: function() {
      var context = arguments[0];
      
      this.centers.each(function(c) {
        context.beginPath();
        context.arc(c.point.x, c.point.y, 1, 0, 2 * Math.PI, true);
        context.strokeStyle = (c.water ? 'blue' : 'red');
        context.stroke();
      }, this);
    }
  });

  steps.push({
    name:     'Draw corners',
    callback: function() {
      var context = arguments[0];
      
      this.corners.each(function(c) {
        context.beginPath();
        context.arc(c.point.x, c.point.y, 1, 0, 2 * Math.PI, true);
        context.strokeStyle = '#525252';
        context.stroke();
      }, this);
    }
  });

  steps.push({
    name:     'Draw grid',
    callback: function() {
      var context = arguments[0];
      
      for (var i = 50; i <= (this.width - 50); i = i + 50) {
        context.beginPath();
        context.moveTo(i, 0);
        context.lineTo(i, this.height);
        context.strokeStyle = '#ccc';
        context.stroke();
      }
      for (var i = 50; i <= (this.height - 50); i = i + 50) {
        context.beginPath();
        context.moveTo(0, i);
        context.lineTo(this.width, i);
        context.strokeStyle = '#ccc';
        context.stroke();
      }
    }
  });

  return steps;
};