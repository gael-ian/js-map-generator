map.build.biome.tropical_coniferous_forest = function() {

  map.build.biome.archtype.base.call(this);

  this.min_latitude = 5;
  this.max_latitude = 35;

  this.frequency    = 1;
  this.remanence    = 0;
  
};

map.build.biome.tropical_coniferous_forest.prototype = new map.build.biome.archtype.base();