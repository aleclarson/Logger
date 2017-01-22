var Event, Formatter, Line, Promise, Type, assertType, cloneArgs, cloneObject, concatArgs, emptyFunction, isNodeJS, stripAnsi, type;

emptyFunction = require("emptyFunction");

cloneObject = require("cloneObject");

assertType = require("assertType");

Formatter = require("Formatter");

stripAnsi = require("strip-ansi");

cloneArgs = require("cloneArgs");

isNodeJS = require("isNodeJS");

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

type.defineValues(function(options) {
  return {
    lines: [new Line(0)],
    willPrint: Event(),
    didPrint: Event({
      async: true
    }),
    didFlush: Event({
      async: true
    }),
    _queue: [],
    _flushing: null,
    _print: options.print,
    _format: Formatter({
      colors: this.color
    })
  };
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

type.defineGetters({
  line: function() {
    return this.lines[this._line];
  }
});

type.definePrototype({
  ln: isNodeJS ? require("os").EOL : "\n"
});

type.defineBoundMethods({
  _flushAsync: function() {
    var chunk;
    chunk = this._queue.shift();
    if (!chunk) {
      return;
    }
    this._print(chunk.message);
    this.didPrint.emit(chunk);
    if (this._queue.length) {
      this._flushing = Promise["try"](this._flushAsync);
      return;
    }
    this._flushing = null;
    this.didFlush.emit();
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
    emptyLines = this._countEmptyLines();
    while (width >= emptyLines++) {
      this._printNewLine();
    }
  },
  format: function(value, options) {
    this._log(this._format(value, options));
    this.moat(0);
  },
  warn: function(message) {
    if (isNodeJS) {
      this.moat(1);
      this.yellow("Warning: ");
      this.white(message);
      this.moat(1);
    } else {
      console.warn(message);
    }
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
  flush: function() {
    var chunk, i, len, ref;
    if (!this._flushing) {
      return;
    }
    ref = this._queue;
    for (i = 0, len = ref.length; i < len; i++) {
      chunk = ref[i];
      this._print(chunk.message);
      this.didPrint.emit(chunk);
    }
    this._queue.length = 0;
    this._flushing = null;
    this.didFlush.emit();
  },
  onceFlushed: function(callback) {
    if (this._flushing !== null) {
      return this.didFlush(1, callback).start();
    }
    return Promise["try"](callback);
  },
  _log: function() {
    var args;
    if (this.isQuiet) {
      return;
    }
    args = cloneArgs(arguments);
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
  _enqueue: function(chunk) {
    this._queue.push(cloneObject(chunk));
    if (this._flushing == null) {
      this._flushing = Promise["try"](this._flushAsync);
    }
  },
  _initChunk: function(chunk) {
    if (chunk.line == null) {
      chunk.line = this._line;
    }
    if (chunk.length == null) {
      chunk.length = stripAnsi(chunk.message).length;
    }
    return chunk;
  },
  _printToChunk: function(message, chunk) {
    if (chunk) {
      chunk.message = message;
    } else {
      chunk = {
        message: message
      };
    }
    this._initChunk(chunk);
    return this._printChunk(chunk);
  },
  _printChunk: function(chunk) {
    var line;
    assertType(chunk, Object, "chunk");
    this.willPrint.emit(chunk);
    assertType(chunk.message, String, "chunk.message");
    assertType(chunk.length, Number, "chunk.length");
    if (chunk.length === 0) {
      return false;
    }
    if (chunk.silent !== true) {
      isNodeJS && this._enqueue(chunk);
      if (chunk.hidden !== true) {
        line = this.line;
        line.contents += chunk.message;
        line.length += chunk.length;
      }
    }
    return true;
  },
  _printNewLine: function() {
    var line;
    if (this._line === this.lines.length - 1) {
      isNodeJS || this._enqueue(this._initChunk({
        message: this.line.contents
      }));
      this._printToChunk(this.ln, {
        hidden: true
      });
      line = Line(this.lines.length);
      this.lines.push(line);
      this._line = line.index;
      return;
    }
    if (isNodeJS) {
      this._printToChunk(this.ln, {
        silent: true
      });
      return;
    }
    throw Error("Changing a Logger's `_line` property is unsupported outside of NodeJS.");
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
  }
});

type.addMixins([require("./mixins/Indent"), require("./mixins/Color"), require("./mixins/Env")]);

module.exports = type.build();

//# sourceMappingURL=map/Logger.map
