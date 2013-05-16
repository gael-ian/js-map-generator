map.build.shape.island_sea = function(builder, options) {
  map.build.shape.base.chains.call(this, builder, options);
};
map.utils.inherits(map.build.shape.island_sea, map.build.shape.base.chains);


map.build.shape.island_sea.prototype.defaultOptions = function() {
  return {
      ceil:  9000
    , noise: function(x, elevation) {
        return (elevation); // + 0.2 * Math.sin(bump * x) * elevation);
      }
    , easing: 'cubicBezier'
    , easing_options: { a: { x: 0.2, y: 0.4 }, b: { x: 0.8, y: 0.6 } }
  };
};

map.build.shape.island_sea.prototype.matrix = function(width, height) {
  var matrix     = map.utils.matrix(width, height)
    , ri         = (width-1)/2
    , rj         = (height-1)/2
    , pool       = []
    ;
  for (var i = 0; i < width; i++) {
    for (var j = 0; j < height; j++) {

      switch(true) {
          
        case (i >= Math.floor(0.8 * ri) && i <= Math.ceil(1.2 * ri))
          && (j >= Math.floor(0.8 * rj) && j <= Math.ceil(1.2 * rj)) :
          pool = ['trenches'];
          break;

        case (i > Math.floor(0.4 * ri) && i < Math.ceil(1.6 * ri))
          && (j > Math.floor(0.4 * rj) && j < Math.ceil(1.6 * rj)) :
          pool = ['trenches', 'mountains'];
          break;

        default:
          pool = ['mountains'];
          break;
      }
      matrix[i][j] = pool[Math.round(this.builder.prng.nextRange(0, pool.length - 1))];

    }
  }
  return matrix;
};