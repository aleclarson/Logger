var Event, Formatter, Line, Promise, Type, assertType, concatArgs, emptyFunction, stripAnsi, type;

require("isNodeJS");

emptyFunction = require("emptyFunction");

assertType = require("assertType");

Formatter = require("Formatter");

stripAnsi = require("strip-ansi");

Promise = require("Promise");

Event = require("Event");

Type = require("Type");

concatArgs = require("./helpers/concatArgs");

Line = require("./helpers/Line");

type = Type("Logger");

type.defineOptions({
  print: Function.withDefault(emptyFunction)
});

type.defineFunction(function() {
  return this._log.apply(this, arguments);
});

type.addMixins([require("./mixins/Indent"), require("./mixins/Color"), require("./mixins/Env")]);

type.defineValues({
  ln: isNodeJS ? require("os").EOL : "\n",
  lines: function() {
    return [new Line(0)];
  },
  didPrint: function() {
    return Event();
  },
  _print: function(arg) {
    var print, queue;
    print = arg.print;
    queue = Promise();
    return function(message) {
      queue = queue.then(function() {
        return print(message);
      });
      queue.done();
    };
  },
  _format: function() {
    return Formatter({
      colors: this.color
    });
  }
});

type.defineProperties({
  _line: {
    value: 0,
    didSet: function(newValue) {
      assertType(newValue, Number);
      if (!this.lines[newValue]) {
        throw Error("Invalid line: " + newValue);
      }
    }
  }
});

type.initInstance(function(options) {
  if (!(options.process || options.print)) {
    throw Error("Must provide 'options.process' or 'options.print'!");
  }
});

type.defineGetters({
  line: function() {
    return this.lines[this._line];
  }
});

type.defineMethods({
  it: function() {
    this.moat(0);
    this.apply(null, arguments);
    this.moat(0);
  },
  moat: function(width) {
    var emptyLines;
    assertType(width, Number);
    emptyLines = this._countEmptyLines(this._line);
    while (width >= emptyLines++) {
      this._printNewLine();
    }
  },
  format: function(value, options) {
    this._log(this._format(value, options));
    this.moat(0);
  },
  ansi: function(code) {
    if (!isNodeJS) {
      return;
    }
    this._print("\x1b[" + code);
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
    if (!line) {
      throw Error("Invalid line: " + line);
    }
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
  _log: function() {
    var args, i, len, value;
    if (!this._canLog()) {
      return;
    }
    args = [];
    for (i = 0, len = arguments.length; i < len; i++) {
      value = arguments[i];
      args.push(value);
    }
    return this._logArgs(args);
  },
  _logArgs: function(args) {
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
  _countEmptyLines: function() {
    var count, index, line;
    count = 0;
    index = this._line;
    while (line = this.lines[index]) {
      if (stripAnsi(line.contents).trim().length) {
        break;
      }
      count += 1;
      if (index === 0) {
        break;
      }
      index -= 1;
    }
    return count;
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

module.exports = type.build();

//# sourceMappingURL=map/Logger.map
