/*
 * map.draw.bidimensional.mercator
 * Mercator projection
 * See http://fr.wikipedia.org/wiki/Projection_de_Mercator
 * 
 * TODO: allow this to render correctly partial maps
 */
map.draw.projection.bidimensional.mercator = function(drawer) {
  this.drawer = drawer;
  
  this.x = function(location) {
    return this.drawer.width * ((location.point.longitude + 180) / 360);
  };

  this.y = function(location) {
    return (
        (this.drawer.height / 2)
      - ( Math.log(Math.tan((Math.PI / 4) + (location.point.r_latitude / 2)))
        * (this.drawer.width / (Math.PI * 2))
        )
      );
  };
};