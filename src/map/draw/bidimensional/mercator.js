/*
 * map.draw.bidimensional.mercator
 * Mercator projection
 * See http://fr.wikipedia.org/wiki/Projection_de_Mercator
 * 
 * TODO: allow this to render correctly partial maps
 */
map.draw.bidimensional.mercator = function(canvas) {
  map.draw.bidimensional.base.call(this, canvas);
};
map.utils.inherits(map.draw.bidimensional.mercator, map.draw.bidimensional.base);

map.draw.bidimensional.mercator.prototype.x = function(point) {
  return this.width * ((point.longitude + 180) / 360);
}

map.draw.bidimensional.mercator.prototype.y = function(point) {
   return (this.height / 2) - Math.log(Math.tan((Math.PI / 4) + (point.r_latitude / 2))) * (this.width / (Math.PI * 2));
}