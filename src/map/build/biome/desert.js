map.build.biome.desert = function() {
  
  map.build.biome.archtype.base.call(this);

  this.min_latitude = 0;
  this.max_latitude = 50;

  this.frequency    = 5;
  this.remanence    = 19;
  
};

map.build.biome.desert.prototype = new map.build.biome.archtype.base();