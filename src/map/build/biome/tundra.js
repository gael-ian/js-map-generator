map.build.biome.tundra = function() {

  map.build.biome.archtype.base.call(this);

  this.min_latitude = 55;
  this.max_latitude = 85;

  this.frequency    = 80;
  this.remanence    = 5;
  
};
map.utils.inherits(map.build.biome.tundra, map.build.biome.archtype.base);