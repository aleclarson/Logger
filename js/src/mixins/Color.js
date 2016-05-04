var LazyVar, Shape, Style, combine, defaultPalette, isType, methods, phases, ref, setType, values;

require("isNodeJS");

ref = require("type-utils"), isType = ref.isType, setType = ref.setType, Shape = ref.Shape;

LazyVar = require("lazy-var");

combine = require("combine");

Style = require("../helpers/Style");

module.exports = function(type) {
  type.defineValues(values);
  return type.initInstance(phases.initInstance);
};

values = {
  isColorful: false,
  color: function() {
    return {};
  }
};

methods = {
  _shouldColorize: function() {
    if (!isNodeJS) {
      return false;
    }
    if (log.isQuiet) {
      return false;
    }
    return log.isColorful;
  }
};

phases = {
  initInstance: function(options) {
    var colors, defineAttributes, palette;
    palette = options.palette || combine({}, defaultPalette);
    colors = Object.keys(palette.bright);
    defineAttributes = (function(_this) {
      return function(target, transform) {
        var attributes, key, prop;
        attributes = Style.createAttributes(colors, function(key, value) {
          var style;
          style = Style({
            palette: palette,
            transform: transform
          });
          style[key] = value;
          return style;
        });
        for (key in attributes) {
          prop = attributes[key];
          prop.define(target, key);
        }
      };
    })(this);
    defineAttributes(this, (function(_this) {
      return function(lines) {
        return _this._printLines(lines);
      };
    })(this));
    return defineAttributes(this.color, (function(_this) {
      return function(lines) {
        return lines.join(_this.ln);
      };
    })(this));
  }
};

defaultPalette = {
  bright: {
    red: [4, 0, 0],
    blue: [0, 1, 5],
    green: [0, 5, 1],
    cyan: [0, 3, 4],
    white: [5, 5, 5],
    gray: [2, 2, 2],
    yellow: [5, 5, 0],
    pink: [5, 0, 4],
    black: [0, 0, 0]
  },
  dim: {
    red: [2, 0, 0],
    blue: [0, 0, 2],
    green: [0, 2, 1],
    cyan: [0, 1, 2],
    white: [3, 3, 3],
    gray: [1, 1, 1],
    yellow: [2, 2, 0],
    pink: [3, 0, 1],
    black: [0, 0, 0]
  }
};

//# sourceMappingURL=../../../map/src/mixins/Color.map
