var Palette, Property, Shape, Style, Type, ansi, concatArgs, emptyFunction, sync, type;

Shape = require("type-utils").Shape;

emptyFunction = require("emptyFunction");

Property = require("Property");

ansi = require("ansi-256-colors");

sync = require("sync");

Type = require("Type");

concatArgs = require("./concatArgs");

Palette = Shape("Palette", {
  bright: Object,
  dim: Object
});

type = Type("Logger_Style", function() {
  var args, colors, i, index, len, lines, value;
  args = [];
  for (index = i = 0, len = arguments.length; i < len; index = ++i) {
    value = arguments[index];
    args[index] = value;
  }
  colors = this.palette[this.isDim ? "dim" : "bright"];
  lines = concatArgs(args);
  lines = lines.split("\n");
  return this._transform(sync.map(lines, (function(_this) {
    return function(line) {
      var color;
      if (_this.isBold) {
        line = "\x1b[1m" + line + "\x1b[22m";
      }
      color = _this.fg && colors[_this.fg];
      if (color) {
        color = ansi.fg.getRgb.apply(null, color);
        line = color + line + ansi.reset;
      }
      return line;
    };
  })(this)));
});

type.optionTypes = {
  palette: Palette,
  transform: Function
};

type.optionDefaults = {
  transform: emptyFunction.thatReturnsArgument
};

type.defineValues({
  palette: function(options) {
    return options.palette;
  },
  fg: null,
  isDim: false,
  isBold: false,
  _transform: function(options) {
    return options.transform;
  }
});

type.initInstance(function() {
  var attributes, colors, key, prop;
  colors = Object.keys(this.palette.bright);
  attributes = Style.createAttributes(colors, function(key, value) {
    this[key] = value;
    return this;
  });
  for (key in attributes) {
    prop = attributes[key];
    prop.define(this, key);
  }
});

type.defineStatics({
  createAttributes: function(colors, setAttribute) {
    var attributes;
    attributes = {
      dim: Property({
        get: function() {
          return setAttribute.call(this, "isDim", true);
        }
      }),
      bold: Property({
        get: function() {
          return setAttribute.call(this, "isBold", true);
        }
      })
    };
    sync.each(colors, function(key) {
      return attributes[key] = Property({
        get: function() {
          return setAttribute.call(this, "fg", key);
        }
      });
    });
    return attributes;
  }
});

module.exports = Style = type.build();

//# sourceMappingURL=../../../map/src/helpers/Style.map
