map.build.biome.temperate_broadleaf_forest = function() {

  map.build.biome.archtype.base.call(this);

  this.min_latitude = 45;
  this.max_latitude = 60;

  this.frequency    = 5;
  this.remanence    = 16;
  
};
map.utils.inherits(map.build.biome.temperate_broadleaf_forest, map.build.biome.archtype.base);