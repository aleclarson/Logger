
require "isNodeJS"

emptyFunction = require "emptyFunction"
assertType = require "assertType"
stripAnsi = require "strip-ansi"
assert = require "assert"
Event = require "event"
Void = require "Void"
Type = require "Type"
sync = require "sync"

concatArgs = require "./helpers/concatArgs"
Formatter = require "./helpers/Formatter"
Line = require "./helpers/Line"

type = Type "Logger", ->
  return unless @_canLog()
  args = [] # Must not leak arguments object!
  args.push value for value in arguments
  @_log args
  return

type.optionTypes =
  print: Function

type.optionDefaults =
  print: emptyFunction

type.defineProperties

  line: get: ->
    @lines[@_line]

  _line:
    value: 0
    didSet: (newValue) ->
      assertType newValue, Number
      assert @lines[newValue], "Invalid line: " + newValue

type.defineValues

  ln: if isNodeJS then require("os").EOL else "\n"

  lines: -> [ new Line 0 ]

  didPrint: -> Event()

  _print: (options) -> options.print

type.initInstance (options) ->
  assert options.process or options.print,
    reason: "Must provide 'options.process' or 'options.print'!"

type.addMixins [
  require "./mixins/Indent"
  require "./mixins/Color"
  require "./mixins/Env"
]

type.defineValues { format: -> Formatter this }

type.defineStatics { Line }

type.defineMethods

  it: ->
    @moat 0
    @apply null, arguments
    @moat 0
    return

  ansi: (code) ->
    return unless isNodeJS
    @_print "\x1b[#{code}"
    return

  moat: (width) ->

    assertType width, Number

    # Calculate the required newlines to match the specified moat width.
    _width = @_computeMoatFrom @_line

    # Print the required newlines.
    @_printNewLine() while _width++ < width

    return

  withLabel: (label, message) ->
    @moat 1
    @ label
    @ ": "
    @ message
    @moat 1
    return

  clear: ->
    @__willClear()
    @lines = [new Line 0]
    @_line = 0
    return

  clearLine: (line) ->

    line = @lines[line or @_line]
    assert line, "Invalid line: " + line

    @__willClearLine line
    line.contents = ""
    line.length = 0
    return

  deleteLine: ->
    @lines.pop()
    if @_process # TODO: Move this into the MainLogger
      @ansi "2K"
      @cursor.y--
    else
      @_line--
    return

  __willClear: emptyFunction

  __willClearLine: emptyFunction

  _canLog: ->
    return no if @isQuiet
    return yes

  _log: (args) ->
    assertType args, Array
    args = concatArgs args
    return no if args.length is 0
    @_printLines args.split @ln
    return yes

  _printLines: (lines) ->
    assertType lines, Array
    lastLine = lines.pop()
    for line in lines
      @_printToChunk line
      @_printNewLine()
    @_printToChunk lastLine
    return

  # Calculates the number of new-lines to print before a moat is full.
  _computeMoatFrom: (line) ->
    width = -1
    loop
      if @lines[line].length is 0
        width++
      else
        break
      if line-- is 0
        break
    width # If this equals -1, the current line has a length greater than zero.

  _printToChunk: (message, chunk = {}) ->
    chunk.message = message
    chunk.line ?= @_line
    chunk.length ?= stripAnsi(chunk.message).length
    @_printChunk chunk

  _printChunk: (chunk) ->

    assertType chunk, Object
    assertType chunk.message, String
    assertType chunk.length, Number

    return no if chunk.length is 0

    if chunk.silent isnt yes

      # Outside of NodeJS, messages are buffered because `console.log` must be used.
      @_print chunk.message if isNodeJS

      @didPrint.emit chunk

      # Newlines are marked as `hidden` so they're not added to the `line.contents`.
      if chunk.hidden isnt yes
        line = @line
        @line.contents += chunk.message
        @line.length += chunk.length

    return yes

  _printNewLine: ->

    # Push a new Line onto `log.lines` if currently on the last line.
    if @_line is @lines.length - 1

      # Outside of NodeJS, messages are buffered because `console.log` must be used.
      @_print @line.contents unless isNodeJS

      @_printToChunk @ln, hidden: yes

      line = Line @lines.length
      @lines.push line
      @_line = line.index

    else unless isNodeJS
      throw Error "Changing a Logger's `_line` property is unsupported outside of NodeJS."

    # Since line splicing is not yet supported, just move the cursor down and overwrite existing lines.
    else
      @_printToChunk @ln, silent: yes

module.exports = Logger = type.build()
