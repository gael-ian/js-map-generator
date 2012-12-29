map.build.biome.mangrove = function() {

  map.build.biome.archtype.coastal.call(this);

  this.min_latitude = 0;
  this.max_latitude = 30;

  this.frequency    = 70;
  this.remanence    = 0;
};

map.build.biome.mangrove.prototype = new map.build.biome.archtype.coastal();