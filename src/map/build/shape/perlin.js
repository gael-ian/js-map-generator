map.build.shape.perlin = function(builder, options) {

  this.builder = builder;
  this.options = map.utils.merge( (options || {}), {
    seed:   Math.floor(Math.random() * ((new Date()).getTime() % this.builder.width)),
    width:  128,
    height: 128,
    base_x: 32,
    base_y: 32
  });

  this._bitmap  = new BitmapData(this.options.width, this.options.height);
  this._x_coeff = this.options.width / this.builder.width;
  this._y_coeff = this.options.height / this.builder.height;
  this._diag    = Math.sqrt((this.builder.height * this.builder.height) + (this.builder.width * this.builder.width));
  
  this._bitmap.perlinNoise(this.options.base_x, this.options.base_y, this.options.seed, BitmapDataChannel.BLUE, false);

  this.isLand  = function(location) {
    var blue   = (this._bitmap.getPixel(Math.round(location.point.x * this._x_coeff), Math.round(location.point.y * this._y_coeff)) / 255)
      , d      = location.point.distanceFrom(this.builder.center)
      ;
    return (blue > 0.3 + 0.3 * (d / this._diag) * (d / this._diag));
  };
};