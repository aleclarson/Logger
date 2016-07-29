var Type, isType, type;

isType = require("isType");

Type = require("Type");

type = Type("Logger_Line");

type.defineOptions({
  index: Number.isRequired,
  contents: String.withDefault("")
});

type.createArguments(function(args) {
  if (isType(args[0], Number)) {
    args[0] = {
      index: args[0]
    };
  }
  return args;
});

type.defineValues({
  index: function(options) {
    return options.index;
  },
  contents: function(options) {
    return options.contents;
  },
  length: function(options) {
    return options.contents.length;
  }
});

module.exports = type.build();

//# sourceMappingURL=map/Line.map
