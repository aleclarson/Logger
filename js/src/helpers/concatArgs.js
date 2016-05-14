var AddableType, Nan, Null, concatArgs, isType, sync;

isType = require("isType");

Null = require("Null");

sync = require("sync");

Nan = require("Nan");

AddableType = [String, Number, Boolean, Nan, Null];

module.exports = concatArgs = function(args) {
  var result;
  result = "";
  sync.each(args, (function(_this) {
    return function(arg) {
      if (arg === void 0) {
        return;
      }
      if (Array.isArray(arg)) {
        result += concatArgs(arg);
      } else if (isType(arg, AddableType)) {
        result += arg;
      }
    };
  })(this));
  return result;
};

//# sourceMappingURL=../../../map/src/helpers/concatArgs.map
