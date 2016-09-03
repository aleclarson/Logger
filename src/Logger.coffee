
require "isNodeJS"

emptyFunction = require "emptyFunction"
assertType = require "assertType"
Formatter = require "Formatter"
stripAnsi = require "strip-ansi"
Promise = require "Promise"
Event = require "Event"
Type = require "Type"

concatArgs = require "./helpers/concatArgs"
Line = require "./helpers/Line"

type = Type "Logger"

type.defineOptions
  print: Function.withDefault emptyFunction

type.defineFunction ->
  @_log.apply this, arguments

type.addMixins [
  require "./mixins/Indent"
  require "./mixins/Color"
  require "./mixins/Env"
]

type.defineValues

  ln: if isNodeJS then require("os").EOL else "\n"

  lines: -> [ new Line 0 ]

  didPrint: -> Event()

  _print: ({ print }) ->
    queue = Promise()
    return (message) ->
      queue = queue.then ->
        print message
      queue.done()
      return

  _format: ->
    Formatter { colors: @color }

type.defineProperties

  _line:
    value: 0
    didSet: (newValue) ->
      assertType newValue, Number
      if not @lines[newValue]
        throw Error "Invalid line: " + newValue

type.initInstance (options) ->
  unless options.process or options.print
    throw Error "Must provide 'options.process' or 'options.print'!"

#
# Prototype
#

type.defineGetters

  line: -> @lines[@_line]

type.defineMethods

  it: ->
    @moat 0
    @apply null, arguments
    @moat 0
    return

  moat: (width) ->
    assertType width, Number
    emptyLines = @_countEmptyLines @_line
    @_printNewLine() while width >= emptyLines++
    return

  format: (value, options) ->
    @_log @_format value, options
    @moat 0
    return

  ansi: (code) ->
    return unless isNodeJS
    @_print "\x1b[#{code}"
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
    @lines = [ new Line 0 ]
    @_line = 0
    return

  clearLine: (line) ->

    line = @lines[line or @_line]
    if not line
      throw Error "Invalid line: " + line

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

  _log: ->
    return unless @_canLog()
    args = [] # Must not leak arguments object!
    args.push value for value in arguments
    @_logArgs args

  _logArgs: (args) ->
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

  _countEmptyLines: ->

    count = 0
    index = @_line

    while line = @lines[index]

      break if stripAnsi(line.contents).trim().length
      count += 1

      break if index is 0
      index -= 1

    return count

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

module.exports = type.build()
