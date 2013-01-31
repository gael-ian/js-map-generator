map.build.biome.mediterranean_forest = function() {

  map.build.biome.archtype.coastal.call(this);

  this.min_latitude = 30;
  this.max_latitude = 45;

  this.frequency    = 40;
  this.remanence    = 10;
  
};
map.utils.inherits(map.build.biome.mediterranean_forest, map.build.biome.archtype.coastal);