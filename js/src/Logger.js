var Event, Formatter, Line, Logger, Type, Void, assert, assertType, concatArgs, emptyFunction, stripAnsi, sync, type;

require("isNodeJS");

emptyFunction = require("emptyFunction");

assertType = require("assertType");

stripAnsi = require("strip-ansi");

assert = require("assert");

Event = require("event");

Void = require("Void");

Type = require("Type");

sync = require("sync");

concatArgs = require("./helpers/concatArgs");

Formatter = require("./helpers/Formatter");

Line = require("./helpers/Line");

type = Type("Logger", function() {
  var args, i, len, value;
  if (!this._canLog()) {
    return;
  }
  args = [];
  for (i = 0, len = arguments.length; i < len; i++) {
    value = arguments[i];
    args.push(value);
  }
  this._log(args);
});

type.optionTypes = {
  print: Function
};

type.optionDefaults = {
  print: emptyFunction
};

type.defineProperties({
  line: {
    get: function() {
      return this.lines[this._line];
    }
  },
  _line: {
    value: 0,
    didSet: function(newValue) {
      assertType(newValue, Number);
      return assert(this.lines[newValue], "Invalid line: " + newValue);
    }
  }
});

type.defineValues({
  ln: isNodeJS ? require("os").EOL : "\n",
  lines: function() {
    return [new Line(0)];
  },
  didPrint: function() {
    return Event();
  },
  _print: function(options) {
    return options.print;
  }
});

type.initInstance(function(options) {
  return assert(options.process || options.print, {
    reason: "Must provide 'options.process' or 'options.print'!"
  });
});

type.addMixins([require("./mixins/Indent"), require("./mixins/Color"), require("./mixins/Env")]);

type.defineValues({
  format: function() {
    return Formatter(this);
  }
});

type.defineStatics({
  Line: Line
});

type.defineMethods({
  it: function() {
    this.moat(0);
    this.apply(null, arguments);
    this.moat(0);
  },
  ansi: function(code) {
    if (!isNodeJS) {
      return;
    }
    this._print("\x1b[" + code);
  },
  moat: function(width) {
    var _width;
    assertType(width, Number);
    _width = this._computeMoatFrom(this._line);
    while (_width++ < width) {
      this._printNewLine();
    }
  },
  withLabel: function(label, message) {
    this.moat(1);
    this(label);
    this(": ");
    this(message);
    this.moat(1);
  },
  clear: function() {
    this.__willClear();
    this.lines = [new Line(0)];
    this._line = 0;
  },
  clearLine: function(line) {
    line = this.lines[line || this._line];
    assert(line, "Invalid line: " + line);
    this.__willClearLine(line);
    line.contents = "";
    line.length = 0;
  },
  deleteLine: function() {
    this.lines.pop();
    if (this._process) {
      this.ansi("2K");
      this.cursor.y--;
    } else {
      this._line--;
    }
  },
  __willClear: emptyFunction,
  __willClearLine: emptyFunction,
  _canLog: function() {
    if (this.isQuiet) {
      return false;
    }
    return true;
  },
  _log: function(args) {
    assertType(args, Array);
    args = concatArgs(args);
    if (args.length === 0) {
      return false;
    }
    this._printLines(args.split(this.ln));
    return true;
  },
  _printLines: function(lines) {
    var i, lastLine, len, line;
    assertType(lines, Array);
    lastLine = lines.pop();
    for (i = 0, len = lines.length; i < len; i++) {
      line = lines[i];
      this._printToChunk(line);
      this._printNewLine();
    }
    this._printToChunk(lastLine);
  },
  _computeMoatFrom: function(line) {
    var width;
    width = -1;
    while (true) {
      if (this.lines[line].length === 0) {
        width++;
      } else {
        break;
      }
      if (line-- === 0) {
        break;
      }
    }
    return width;
  },
  _printToChunk: function(message, chunk) {
    if (chunk == null) {
      chunk = {};
    }
    chunk.message = message;
    if (chunk.line == null) {
      chunk.line = this._line;
    }
    if (chunk.length == null) {
      chunk.length = stripAnsi(chunk.message).length;
    }
    return this._printChunk(chunk);
  },
  _printChunk: function(chunk) {
    var line;
    assertType(chunk, Object);
    assertType(chunk.message, String);
    assertType(chunk.length, Number);
    if (chunk.length === 0) {
      return false;
    }
    if (chunk.silent !== true) {
      if (isNodeJS) {
        this._print(chunk.message);
      }
      this.didPrint.emit(chunk);
      if (chunk.hidden !== true) {
        line = this.line;
        this.line.contents += chunk.message;
        this.line.length += chunk.length;
      }
    }
    return true;
  },
  _printNewLine: function() {
    var line;
    if (this._line === this.lines.length - 1) {
      if (!isNodeJS) {
        this._print(this.line.contents);
      }
      this._printToChunk(this.ln, {
        hidden: true
      });
      line = Line(this.lines.length);
      this.lines.push(line);
      return this._line = line.index;
    } else if (!isNodeJS) {
      throw Error("Changing a Logger's `_line` property is unsupported outside of NodeJS.");
    } else {
      return this._printToChunk(this.ln, {
        silent: true
      });
    }
  }
});

module.exports = Logger = type.build();

//# sourceMappingURL=../../map/src/Logger.map
