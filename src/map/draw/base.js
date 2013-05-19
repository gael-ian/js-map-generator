/*
 * map.draw.base
 * Draw the map define by the builder onto canvas
 */
map.draw.base = function(canvas) {
  
  this.steps    = new map.core.stack();

  this.width    = canvas.clientWidth;
  this.height   = canvas.clientHeight;
  
  this.canvas   = canvas;
  
  this.projection_namespace = null;
  this.projection = null;

  this.reset();
};

map.draw.base.prototype.setProjection = function(projection_class) {
  this.projection = new this.projection_namespace[projection_class](this);
};

map.draw.base.prototype.reset = function() {};

map.draw.base.prototype.draw = function(builder) {
  if (this.steps.length == 0) {
    this.steps = this.defaultSteps();
  }
  this.steps.run(builder, this.context, this);
};