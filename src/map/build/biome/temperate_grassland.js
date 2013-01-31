map.build.biome.temperate_grassland = function() {

  map.build.biome.archtype.base.call(this);

  this.min_latitude = 45;
  this.max_latitude = 60;

  this.frequency    = 5;
  this.remanence    = 16;
  
};
map.utils.inherits(map.build.biome.temperate_grassland, map.build.biome.archtype.base);