/*
 * map.core.easing
 * Interpolation functions generators
 */
map.core.easing = {};

// simple linear tweening - no easing, no acceleration
map.core.easing.linear = function (start, end) {
  var c = end.y - start.y
    , d = end.x - start.x
    , b = start.y - (c/d) * start.x
    ;
  return function(x) {
    return c*x/d + b;
  };
};

// quadratic easing in - accelerating from zero velocity
map.core.easing.easeInQuad = function (start, end) {
  var c = end.y - start.y
    , d = end.x - start.x
    , b = start.y - (c/d) * start.x
    ;
  return function(x) {
    x /= d;
    return c*x*x + b;
  };
};

// quadratic easing out - decelerating to zero velocity
map.core.easing.easeOutQuad = function (start, end) {
  var c = end.y - start.y
    , d = end.x - start.x
    , b = start.y - (c/d) * start.x
    ;
  return function(x) {
    x /= d;
    return -c * x * (x-2) + b;
  };
};

// quadratic easing in/out - acceleration until halfway, then deceleration
map.core.easing.easeInOutQuad = function (start, end) {
  var c = end.y - start.y
    , d = end.x - start.x
    , b = start.y - (c/d) * start.x
    ;
  return function(x) {
    x /= d/2;
    if (x < 1) return c/2*x*x + b;
    x--;
    return -c/2 * (x*(x-2) - 1) + b;
  }
};

// cubic easing in - accelerating from zero velocity
map.core.easing.easeInCubic = function (start, end) {
  var c = end.y - start.y
    , d = end.x - start.x
    , b = start.y - (c/d) * start.x
    ;
  return function(x) {
    x /= d;
    return c*x*x*x + b;
  }
};

// cubic easing out - decelerating to zero velocity
map.core.easing.easeOutCubic = function (start, end) {
  var c = end.y - start.y
    , d = end.x - start.x
    , b = start.y - (c/d) * start.x
    ;
  return function(x) {
    x /= d;
    x--;
    return c*(x*x*x + 1) + b;
  }
};

// cubic easing in/out - acceleration until halfway, then deceleration
map.core.easing.easeInOutCubic = function (start, end) {
  var c = end.y - start.y
    , d = end.x - start.x
    , b = start.y - (c/d) * start.x
    ;
  return function(x) {
    x /= d/2;
    if (x < 1) return c/2*x*x*x + b;
    x -= 2;
    return c/2*(x*x*x + 2) + b;
  };
};

// quartic easing in - accelerating from zero velocity
map.core.easing.easeInQuart = function (start, end) {
  var c = end.y - start.y
    , d = end.x - start.x
    , b = start.y - (c/d) * start.x
    ;
  return function(x) {
    x /= d;
    return c*x*x*x*x + b;
  };
};

// quartic easing out - decelerating to zero velocity
map.core.easing.easeOutQuart = function (start, end) {
  var c = end.y - start.y
    , d = end.x - start.x
    , b = start.y - (c/d) * start.x
    ;
  return function(x) {
    x /= d;
    x--;
    return -c * (x*x*x*x - 1) + b;
  };
};

// quartic easing in/out - acceleration until halfway, then deceleration
map.core.easing.easeInOutQuart = function (start, end) {
  var c = end.y - start.y
    , d = end.x - start.x
    , b = start.y - (c/d) * start.x
    ;
  return function(x) {
    x /= d/2;
    if (x < 1) return c/2*x*x*x*x + b;
    x -= 2;
    return -c/2 * (x*x*x*x - 2) + b;
  };
};

// quintic easing in - accelerating from zero velocity
map.core.easing.easeInQuint = function (start, end) {
  var c = end.y - start.y
    , d = end.x - start.x
    , b = start.y - (c/d) * start.x
    ;
  return function(x) {
    x /= d;
    return c*x*x*x*x*x + b;
  };
};

// quintic easing out - decelerating to zero velocity
map.core.easing.easeOutQuint = function (start, end) {
  var c = end.y - start.y
    , d = end.x - start.x
    , b = start.y - (c/d) * start.x
    ;
  return function(x) {
    x /= d;
    x--;
    return c*(x*x*x*x*x + 1) + b;
  };
};

// quintic easing in/out - acceleration until halfway, then deceleration
map.core.easing.easeInOutQuint = function (start, end) {
  var c = end.y - start.y
    , d = end.x - start.x
    , b = start.y - (c/d) * start.x
    ;
  return function(x) {
    x /= d/2;
    if (x < 1) return c/2*x*x*x*x*x + b;
    x -= 2;
    return c/2*(x*x*x*x*x + 2) + b;
  };
};

// sinusoidal easing in - accelerating from zero velocity
map.core.easing.easeInSine = function (start, end) {
  var c = end.y - start.y
    , d = end.x - start.x
    , b = start.y - (c/d) * start.x
    ;
  return function(x) {
    return -c * Math.cos(x/d * (Math.PI/2)) + c + b;
  };
};

// sinusoidal easing out - decelerating to zero velocity
map.core.easing.easeOutSine = function (start, end) {
  var c = end.y - start.y
    , d = end.x - start.x
    , b = start.y - (c/d) * start.x
    ;
  return function(x) {
    return c * Math.sin(x/d * (Math.PI/2)) + b;
  };
};

// sinusoidal easing in/out - accelerating until halfway, then decelerating
map.core.easing.easeInOutSine = function (start, end) {
  var c = end.y - start.y
    , d = end.x - start.x
    , b = start.y - (c/d) * start.x
    ;
  return function(x) {
    return -c/2 * (Math.cos(Math.PI*x/d) - 1) + b;
  };
};

// exponential easing in - accelerating from zero velocity
map.core.easing.easeInExpo = function (start, end) {
  var c = end.y - start.y
    , d = end.x - start.x
    , b = start.y - (c/d) * start.x
    ;
  return function(x) {
    return c * Math.pow( 2, 10 * (x/d - 1) ) + b;
  };
};

// exponential easing out - decelerating to zero velocity
map.core.easing.easeOutExpo = function (start, end) {
  var c = end.y - start.y
    , d = end.x - start.x
    , b = start.y - (c/d) * start.x
    ;
  return function(x) {
    return c * ( -Math.pow( 2, -10 * x/d ) + 1 ) + b;
  };
};

// exponential easing in/out - accelerating until halfway, then decelerating
map.core.easing.easeInOutExpo = function (start, end) {
  var c = end.y - start.y
    , d = end.x - start.x
    , b = start.y - (c/d) * start.x
    ;
  return function(x) {
    x /= d/2;
    if (x < 1) return c/2 * Math.pow( 2, 10 * (x - 1) ) + b;
    x--;
    return c/2 * ( -Math.pow( 2, -10 * x) + 2 ) + b;
  };
};

// circular easing in - accelerating from zero velocity
map.core.easing.easeInCirc = function (start, end) {
  var c = end.y - start.y
    , d = end.x - start.x
    , b = start.y - (c/d) * start.x
    ;
  return function(x) {
    x /= d;
    return -c * (Math.sqrt(1 - x*x) - 1) + b;
  }
};

// circular easing out - decelerating to zero velocity
map.core.easing.easeOutCirc = function (start, end) {
  var c = end.y - start.y
    , d = end.x - start.x
    , b = start.y - (c/d) * start.x
    ;
  return function(x) {
    x /= d;
    x--;
    return c * Math.sqrt(1 - x*x) + b;
  };
};

// circular easing in/out - acceleration until halfway, then deceleration
map.core.easing.easeInOutCirc = function (start, end) {
  var c = end.y - start.y
    , d = end.x - start.x
    , b = start.y - (c/d) * start.x
    ;
  return function(x) {
    x /= d/2;
    if (x < 1) return -c/2 * (Math.sqrt(1 - x*x) - 1) + b;
    x -= 2;
    return c/2 * (Math.sqrt(1 - x*x) + 1) + b;
  };
};

// circular easing in/out - acceleration until halfway, then deceleration
map.core.easing.cubicBezier = function (start, end, options) {
  var c = end.y - start.y
    , d = end.x - start.x
    , b = start.y - (c/d) * start.x
      // Based on http://blog.greweb.fr/2012/02/bezier-curve-based-easing-functions-from-concept-to-implementation/
    , f = (function (a, b) {

        function A(aA1, aA2) { return 1.0 - 3.0 * aA2 + 3.0 * aA1; }
        function B(aA1, aA2) { return 3.0 * aA2 - 6.0 * aA1; }
        function C(aA1) { return 3.0 * aA1; }

        // Returns x(t) given t, x1, and x2, or y(t) given t, y1, and y2.
        function CalcBezier(aT, aA1, aA2) {
          return ((A(aA1, aA2)*aT + B(aA1, aA2))*aT + C(aA1))*aT;
        }

        // Returns dx/dt given t, x1, and x2, or dy/dt given t, y1, and y2.
        function GetSlope(aT, aA1, aA2) {
          return 3.0 * A(aA1, aA2)*aT*aT + 2.0 * B(aA1, aA2) * aT + C(aA1);
        }

        function GetTForX(aX) {
          // Newton raphson iteration
          var aGuessT = aX;
          for (var i = 0; i < 4; ++i) {
            var currentSlope = GetSlope(aGuessT, a.x, b.x);
            if (currentSlope == 0.0) return aGuessT;
            var currentX = CalcBezier(aGuessT, a.x, b.x) - aX;
            aGuessT -= currentX / currentSlope;
          }
          return aGuessT;
        }

        return function(x) {
          if (a.x == a.y && b.x == b.y) return x; // linear
          return CalcBezier(GetTForX(x), a.y, b.y);
        }
      })(options.a, options.b)
    ;
  return function(x) {
    return c * f(x/d) + b;
  };
};

;
