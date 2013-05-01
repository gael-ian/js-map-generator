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
  this.steps.run(builder, this.context, this);
};
      
map.drawer.prototype.clear = function(color) {
  this.context.fillStyle = (color || "white");
  this.context.fillRect(0, 0, this.width, this.height);
};

map.drawer.prototype.fillRegion = function(center, color) {
  var moved = false
    ;
  center.corners.clockwise(function(co, i) {
    if (!moved) {
      this.context.beginPath();
      this.context.moveTo(co.point.x, co.point.y);
    } else {
      this.context.lineTo(co.point.x, co.point.y);
    }
    moved = true;
  }, this);
  this.context.closePath();

  this.context.strokeStyle = color;
  this.context.fillStyle   = color;
  this.context.stroke();
  this.context.fill();
};
      
map.drawer.prototype.defaultSteps = function() {
        
  var steps = new map.core.stack();

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
        context.strokeStyle = 'red';
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

  steps.push({
    name:     'Draw biomes',
    callback: function(context) {
      var colors = {
              desert:                       ['#FFF4CF', '#BFA753'] // #E0CD8B
            , flooded_grassland:            ['#AFD0FF', '#4584DF'] // #80B3FF
            , mangrove:                     ['#EF59D3', '#AF008F'] // #D400AA
            , mediterranean_forest:         ['#EF9E68', '#AF4C0A'] // #C87137
            , montane_grassland:            ['#F5EFFF', '#9774CF'] // #C6AFE9
            , taiga:                        ['#5FBF85', '#0F7F3B'] // #2CA05A
            , temperate_broadleaf_forest:   ['#9FEF68', '#4DAF0A'] // #71C837
            , temperate_coniferous_forest:  ['#368F35', '#005500'] // #005500
            , temperate_grassland:          ['#F6FFCF', '#AABF53'] // #CDDE87
            , tropical_broadleaf_forest:    ['#FFDF5F', '#BF9800'] // #D4AA00
            , tropical_coniferous_forest:   ['#A0FF5F', '#4DBF00'] // #66FF00
            , tropical_grassland:           ['#FFE57F', '#BF9D17'] // #FFDD55
            , tropical_rainforest:          ['#6A9F45', '#2A5F06'] // #447821
            , tundra:                       ['#CFFFF5', '#53BFA9'] // #87DECD
            , ice:                          ['#FFFFFF', '#BFBFBF'] // #FFFFFF
          }
        , gradients = {}
        , elevation = this.centers.reduce(function(m, c) {
            if (c.elevation > m.max) m.max = c.elevation;
            if (c.elevation < m.min) m.min = c.elevation;
            return m;
          }, this, { min: 0, max: 0 })
        , scale     = map.core.easing.linear({ x: 0, y: 0 }, { x: elevation.max, y: 100 })
        ;

      for (var biome in colors) {
        var gradient  = context.createLinearGradient(0, 0, 0, 100);
        gradient.addColorStop(0, colors[biome][0]);
        gradient.addColorStop(1, colors[biome][1]);

        context.fillStyle = gradient;
        context.fillRect(0, 0, 1, 100);

        gradients[biome] = context.getImageData(0, 0, 1, 100).data;
      }

      
      this.centers.each(function(c) {
        if (c.water) return;
        var biome    = c.biome || 'ice'
          , gradient = gradients[biome]
          , offset   = scale(c.elevation)
          , pos      = Math.floor(offset - offset % 4)
          , color    = 'rgb(' + gradient[pos] + ',' + gradient[pos+1] + ',' + gradient[pos+2] + ')'
          ;
        drawer.fillRegion(c, color);
      }, this);
    }
  });

  steps.push({
    name:     'Draw equator & tropics',
    callback: function(context) {
      var tropic_latitude = 23.26
        , tropics         = []
        ;

      // Draw origin meridian
      context.beginPath();
      context.moveTo(this.center.x, 0);
      context.lineTo(this.center.x, this.height);
      context.strokeStyle = '#ccc';
      context.stroke();

      // Draw equator
      context.beginPath();
      context.moveTo(0, this.center.y);
      context.lineTo(this.width, this.center.y);
      context.strokeStyle = '#000';
      context.stroke();
      
      // Draw tropics
      if (this.max_latitude > tropic_latitude) {
        tropics.push(this.center.y - ((this.center.y * tropic_latitude) / this.max_latitude ));
      }
      if (this.min_latitude < -tropic_latitude) {
        tropics.push(this.center.y + ((this.center.y * -tropic_latitude) / this.min_latitude ));
      }

      tropics.forEach(function(y) {
        context.beginPath();
        context.moveTo(0, y);
        context.lineTo(this.width, y);
        context.strokeStyle = '#ccc';
        context.stroke();
      }, this);
    }
  });

  return steps;
};