map.build.shape.radial = function(builder, options) {

  this.builder = builder;
  this.options = map.utils.merge( (options || {}), {
    seed: Math.floor(Math.random() * ((new Date()).getTime() % this.builder.width))
  });

  this._prng = new PRNG();
  this._prng.seed = this.options.seed;

  this._max_radius = ([this.builder.height, this.builder.width][Math.round(this._prng.nextRange(0, 1))] / 2);
  this._bumps      = this._prng.nextRange(1, 6);
  this._start_a    = this._prng.nextRange(0, 2 * Math.PI);
  this._start_b    = this._prng.nextRange(0, 2 * Math.PI);

  this.is_land  = function(location) {
    var a      = location.point.radiantFrom(this.builder.center)
      , r      = location.point.distanceFrom(this.builder.center) / this._max_radius
      , r1     = 0.4 + 0.30*Math.sin(this._start_a + a*this._bumps + Math.cos((this._bumps+3)*a))
      , r2     = 0.7 + 0.30*Math.sin(this._start_b + a*this._bumps - Math.sin((this._bumps+3)*a))
      ;
    return (r < r1 || (r > r1 * 1.3 && r < r2));
  };
};