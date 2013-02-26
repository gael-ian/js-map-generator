map.build.shape.pangea = function(builder, options) {
  map.build.shape.base.chains.call(this, builder, options);
};
map.utils.inherits(map.build.shape.pangea, map.build.shape.base.chains);

map.build.shape.pangea.prototype.matrix = function(width, height) {
  var matrix = map.utils.matrix(width, height)
    , pool   = []
    ;
  for (var i = 0; i < width; i++) {
    for (var j = 0; j < height; j++) {
      
      switch(true) {

        case (i == 0 || i == (width - 1)):
          pool = ['trenches'];
          break;

        case (j == 0 || j == (height - 1)):
          pool = ['trenches', 'mountains'];
          break;

        default:
          pool = ['trenches', 'mountains', 'mountains', 'mountains', 'mountains'];
          break;
      }
      matrix[i][j] = pool[Math.round(this.prng.nextRange(0, pool.length - 1))];
      
    }
  }  
  return matrix;
};