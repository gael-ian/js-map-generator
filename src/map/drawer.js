/*
 * map.drawer
 * Draw the map define by the builder onto canvas
 */
map.drawer = function() {
  this.steps   = new map.core.stack();
};

map.drawer.prototype.draw = function(builder) {
  if (this.steps.length == 0) {
    this.steps = this.defaultSteps();
  }
  this.steps.run(builder);
};
      
map.drawer.prototype.clear = function(builder) {
  builder.context.fillStyle = "white";
  builder.context.fillRect(0, 0, builder.width, builder.height);
};
      
map.drawer.prototype.defaultSteps = function() {
        
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
        this.context.fillStyle =  (c.ocean ? '#4D4A89' : '#4D86CC');
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

      this.centers.as_queue(function(c, queue, queued) {
        c.neighbors.each(function(n) {
          this.context.beginPath();
          this.context.moveTo(c.point.x, c.point.y);
          this.context.lineTo(n.point.x, n.point.y);
          this.context.strokeStyle = '#894E57';
          this.context.stroke();

          if (0 > queued.indexOf(n) && 0 > queue.indexOf(n)) queue.push(n);
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