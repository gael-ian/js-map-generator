map.build.biome.desert = function() {
  
  map.build.biome.archtype.base.call(this);

  this.min_latitude = 0;
  this.max_latitude = 50;

  this.frequency    = 5;
  this.remanence    = 19;
  
};
map.utils.inherits(map.build.biome.desert, map.build.biome.archtype.base);