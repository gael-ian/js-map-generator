map.build.biome.temperate_coniferous_forest = function() {

  map.build.biome.archtype.montane.call(this);

  this.min_latitude = 25;
  this.max_latitude = 70;

  this.frequency    = 5;
  this.remanence    = 1;
  
};

map.build.biome.temperate_coniferous_forest.prototype = new map.build.biome.archtype.montane();