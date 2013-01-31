map.build.biome.tropical_rainforest = function() {

  map.build.biome.archtype.base.call(this);

  this.min_latitude = 0;
  this.max_latitude = 30;

  this.frequency    = 5;
  this.remanence    = 21;
  
};
map.utils.inherits(map.build.biome.tropical_rainforest, map.build.biome.archtype.base);