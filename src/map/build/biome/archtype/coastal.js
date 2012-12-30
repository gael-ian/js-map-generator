 map.build.biome.archtype.coastal = function() {
  map.build.biome.archtype.base.call(this);
};
map.build.biome.archtype.coastal.prototype = new map.build.biome.archtype.base();

map.build.biome.archtype.coastal.prototype.include = function(location) {
  var latitude = Math.abs(location.point.latitude());
  return (location.coast && (latitude >= (this.min_latitude * 1.10) && latitude <= (this.max_latitude * 0.90)));
};