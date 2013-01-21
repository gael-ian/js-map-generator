map.build.biome.archtype.montane = function() {
  map.build.biome.archtype.base.call(this);
};
map.build.biome.archtype.montane.prototype = new map.build.biome.archtype.base();

map.build.biome.archtype.montane.prototype.include = function(location) {
  var latitude = Math.abs(location.point.latitude());
  return ((location.elevation > 3000) && (latitude >= (this.min_latitude * 1.10) && latitude <= (this.max_latitude * 0.90)));
};