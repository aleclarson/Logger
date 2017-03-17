// Generated by CoffeeScript 1.12.4
var Style, Type, cloneObject, defaultPalette, isNodeJS, mixin, stripAnsi;

cloneObject = require("cloneObject");

stripAnsi = require("strip-ansi");

isNodeJS = require("isNodeJS");

Type = require("Type");

Style = require("../helpers/Style");

mixin = Type.Mixin();

mixin.defineValues({
  isColorful: false,
  color: function() {
    return {};
  }
});

mixin.initInstance(function(options) {
  var colors, defineAttributes, palette;
  palette = options.palette || cloneObject(defaultPalette);
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
      if (!_this.isColorful) {
        lines = lines.map(stripAnsi);
      }
      return _this._printLines(lines);
    };
  })(this));
  return defineAttributes(this.color, (function(_this) {
    return function(lines) {
      if (!_this.isColorful) {
        lines = lines.map(stripAnsi);
      }
      return lines.join(_this.ln);
    };
  })(this));
});

module.exports = mixin.apply;

defaultPalette = {
  bright: {
    red: [5, 0, 0],
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
