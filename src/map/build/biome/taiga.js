map.build.biome.taiga = function() {

  map.build.biome.archtype.base.call(this);

  this.min_latitude = 45;
  this.max_latitude = 70;

  this.frequency    = 20;
  this.remanence    = 39;
  
};
map.utils.inherits(map.build.biome.taiga, map.build.biome.archtype.base);