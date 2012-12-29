map.build.biome.tropical_broadleaf_forest = function() {

  map.build.biome.archtype.base.call(this);

  this.min_latitude = 0;
  this.max_latitude = 30;

  this.frequency    = 4;
  this.remanence    = 1;
  
};

map.build.biome.tropical_broadleaf_forest.prototype = new map.build.biome.archtype.base();