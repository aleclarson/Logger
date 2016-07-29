var emptyFunction, methods, phases, values,
  indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

require("isNodeJS");

emptyFunction = require("emptyFunction");

module.exports = function(type) {
  type.defineValues(values);
  type.defineMethods(methods);
  return type.initInstance(phases.initInstance);
};

values = {
  isQuiet: false,
  isVerbose: {
    value: false,
    didSet: function(isVerbose) {
      return this._verbose = isVerbose ? this : emptyFunction;
    }
  },
  isDebug: {
    value: false,
    didSet: function(isDebug) {
      return this._debug = isDebug ? this : emptyFunction;
    }
  },
  _verbose: emptyFunction,
  _debug: emptyFunction
};

methods = {
  verbose: function() {
    return this._verbose.apply(this, arguments);
  },
  debug: function() {
    return this._debug.apply(this, arguments);
  }
};

phases = {
  initInstance: function(options) {
    if (isNodeJS) {
      this.isDebug = (indexOf.call(process.argv, "--debug") >= 0) || (process.env.DEBUG === "true");
      return this.isVerbose = (indexOf.call(process.argv, "--verbose") >= 0) || (process.env.VERBOSE === "true");
    }
  }
};

//# sourceMappingURL=map/Env.map
