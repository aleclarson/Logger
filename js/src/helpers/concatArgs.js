var AddableType, Nan, Null, concatArgs, isType;

isType = require("isType");

Null = require("Null");

Nan = require("Nan");

AddableType = [String, Number, Boolean, Nan, Null];

concatArgs = function(args) {
  var arg, i, len, result;
  result = [];
  for (i = 0, len = args.length; i < len; i++) {
    arg = args[i];
    if (arg === void 0) {
      continue;
    }
    if (Array.isArray(arg)) {
      result.push(concatArgs(arg));
    } else if (isType(arg, AddableType)) {
      result.push(arg);
    }
  }
  return result.join("");
};

module.exports = concatArgs;

//# sourceMappingURL=../../../map/src/helpers/concatArgs.map
