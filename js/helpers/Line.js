var Type, isType, type;

isType = require("isType");

Type = require("Type");

type = Type("Logger_Line");

type.initArgs(function(args) {
  if (isType(args[0], Number)) {
    args[0] = {
      index: args[0]
    };
  }
});

type.defineOptions({
  index: Number.isRequired,
  contents: String.withDefault("")
});

type.defineValues(function(options) {
  return {
    index: options.index,
    contents: options.contents,
    length: options.contents.length
  };
});

module.exports = type.build();

//# sourceMappingURL=map/Line.map
