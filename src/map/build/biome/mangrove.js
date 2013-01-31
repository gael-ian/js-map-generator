map.build.biome.mangrove = function() {

  map.build.biome.archtype.coastal.call(this);

  this.min_latitude = 0;
  this.max_latitude = 30;

  this.frequency    = 70;
  this.remanence    = 0;
};
map.utils.inherits(map.build.biome.mangrove, map.build.biome.archtype.coastal);