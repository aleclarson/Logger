var Type, isType, type;

isType = require("type-utils").isType;

Type = require("Type");

type = Type("Logger_Line");

type.optionTypes = {
  index: Number,
  contents: String
};

type.optionDefaults = {
  contents: ""
};

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

//# sourceMappingURL=../../../map/src/helpers/Line.map
