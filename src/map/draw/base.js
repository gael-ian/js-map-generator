/*
 * map.draw.base
 * Draw the map define by the builder onto canvas
 */
map.draw.base = function(canvas) {
  
  this.steps   = new map.core.stack();

  this.width   = canvas.clientWidth;
  this.height  = canvas.clientHeight;
  
  this.canvas  = canvas;

  this.reset();
};

map.draw.base.prototype.reset = function(canvas) {
  this.context = this.canvas.getContext('2d');
};

map.draw.base.prototype.draw = function(builder) {
  if (this.steps.length == 0) {
    this.steps = this.defaultSteps();
  }
  this.steps.run(builder, this.context, this);
};