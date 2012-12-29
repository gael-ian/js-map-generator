map.build.biome.flooded_grassland = function() {

  map.build.biome.archtype.base.call(this);

  this.min_latitude = 0;
  this.max_latitude = 50;

  this.frequency    = 1;
  this.remanence    = 0;
  
};

map.build.biome.flooded_grassland.prototype = new map.build.biome.archtype.base();