map.build.biome.taiga = function() {

  map.build.biome.archtype.base.call(this);

  this.min_latitude = 45;
  this.max_latitude = 70;

  this.frequency    = 40;
  this.remanence    = 19;
  
};

map.build.biome.taiga.prototype = new map.build.biome.archtype.base();