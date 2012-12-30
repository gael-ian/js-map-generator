map.build.biome.archtype.base = function() {

  this.min_latitude = 0;
  this.max_latitude = 0;
  
};

map.build.biome.archtype.base.prototype.include = function(location) {
  var latitude = Math.abs(location.point.latitude());
  return (latitude >= (this.min_latitude * 1.10) && latitude <= (this.max_latitude * 0.90));
};

map.build.biome.archtype.base.prototype.tolerate = function(location) {
  var latitude = Math.abs(location.point.latitude());
  return (latitude >= this.min_latitude && latitude <= this.max_latitude);
};