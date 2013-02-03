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
          pool = ['trenches', 'trenches', 'mountains'];
          break;

        default:
          pool = ['trenches', 'mountains', 'mountains'];
          break;
      }
      matrix[i][j] = pool[Math.round(this.prng.nextRange(0, pool.length - 1))];
      
    }
  }
  
  if (this.builder.min_longitude == -180 && this.builder.max_longitude == 180) {
    var east = matrix[0]
      , west = matrix[width - 1]
      ;
    east.forEach(function(east_terrain, i) {
      if (west[i] !== east_terrain) west[i] = east_terrain;
    });
  }
  
  return matrix;
};