map.build.shape.pangea = function(builder, options) {
  map.build.shape.base.chains.call(this, builder, options);
};
map.utils.inherits(map.build.shape.pangea, map.build.shape.base.chains);

map.build.shape.pangea.prototype.matrix = function(width, height) {
  var matrix     = map.utils.matrix(width, height)
    , ri         = (width-1)/2
    , rj         = (height-1)/2
    , pool       = []
    ;
  for (var i = 0; i < width; i++) {
    for (var j = 0; j < height; j++) {

      switch(true) {
          
        case (i >= Math.floor(0.7 * ri) && i <= Math.ceil(1.3 * ri))
          && (j >= Math.floor(0.7 * rj) && j <= Math.ceil(1.3 * rj)) :
          pool = ['mountains'];
          pool = ['trenches', 'mountains', 'mountains', 'mountains'];
          break;

        case (i > Math.floor(0.2 * ri) && i < Math.ceil(1.8 * ri))
          && (j > Math.floor(0.2 * rj) && j < Math.ceil(1.8 * rj)) :
          pool = ['trenches', 'mountains', 'mountains'];
          break;

        default:
          pool = ['trenches', 'trenches', 'mountains'];
          break;
      }
      matrix[i][j] = pool[Math.round(this.prng.nextRange(0, pool.length - 1))];

    }
  }
  return matrix;
};