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

map.core.stack.prototype.run = function() {
  var begin = 0
    , args  = Array.prototype.slice.call(arguments)
    , scope = args.shift()
    ;
    
  this.forEach(function(step, i) {
    begin = (new Date()).getTime();
    step.callback.apply(this, args);
    console.log(step.name + ': ' + ((new Date()).getTime() - begin) + 'ms');
  }, scope);
};
