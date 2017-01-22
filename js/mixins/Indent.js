var Type, assertType, mixin, repeatString;

repeatString = require("repeat-string");

assertType = require("assertType");

Type = require("Type");

mixin = Type.Mixin();

mixin.defineValues({
  _indent: "",
  _indentStack: function() {
    return [];
  }
});

mixin.defineProperties({
  indent: {
    value: 0,
    didSet: function(newValue, oldValue) {
      assertType(newValue, Number);
      return this._indent = repeatString(this.indentString, newValue);
    }
  },
  indentString: {
    value: " ",
    didSet: function(newValue) {
      assertType(newValue, String);
      return this._indent = repeatString(newValue, this.indent);
    }
  }
});

mixin.defineMethods({
  plusIndent: function(indent) {
    return this.pushIndent(indent + this.indent);
  },
  pushIndent: function(indent) {
    this._indentStack.push(this.indent);
    this.indent = indent;
  },
  popIndent: function(n) {
    var indent;
    if (n == null) {
      n = 1;
    }
    while (n-- > 0) {
      indent = this._indentStack.pop();
      if (indent != null) {
        this.indent = indent;
      } else {
        this.indent = 0;
        break;
      }
    }
  },
  withIndent: function(indent, fn) {
    this.pushIndent(indent);
    fn();
    this.popIndent();
  }
});

mixin.initInstance((function() {
  var willPrint;
  willPrint = function(chunk) {
    if (this.line.length > 0) {
      return;
    }
    if (chunk.indent === true) {
      chunk.message = this._indent;
      chunk.length = this._indent.length;
      return;
    }
    if (!((chunk.length === 0) || (chunk.message === this.ln))) {
      chunk.message = this._indent + chunk.message;
      chunk.length += this._indent.length;
    }
  };
  return function() {
    var listener;
    listener = willPrint.bind(this);
    return this.willPrint(listener).start();
  };
})());

module.exports = mixin.apply;

//# sourceMappingURL=map/Indent.map
