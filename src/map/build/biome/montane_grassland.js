map.build.biome.montane_grassland = function() {

  map.build.biome.archtype.montane.call(this);

  this.min_latitude = 0;
  this.max_latitude = 55;

  this.frequency    = 5;
  this.remanence    = 2;
  
};

map.build.biome.montane_grassland.prototype = new map.build.biome.archtype.montane();