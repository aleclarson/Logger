
emptyFunction = require "emptyFunction"
cloneObject = require "cloneObject"
assertType = require "assertType"
Formatter = require "Formatter"
stripAnsi = require "strip-ansi"
cloneArgs = require "cloneArgs"
isNodeJS = require "isNodeJS"
Promise = require "Promise"
Event = require "eve"
Type = require "Type"

concatArgs = require "./helpers/concatArgs"
Line = require "./helpers/Line"

type = Type "Logger"

type.defineArgs ->
  types: {print: Function}
  defaults: {print: emptyFunction}

type.defineFunction ->
  @_log.apply this, arguments

type.defineValues (options) ->

  lines: [new Line 0]

  willPrint: Event()

  didPrint: Event {async: yes}

  didFlush: Event {async: yes}

  _queue: []

  _flushing: null

  _print: options.print

  _format: Formatter {colors: @color}

type.defineProperties

  _line:
    value: 0
    didSet: (newValue) ->
      assertType newValue, Number
      if not @lines[newValue]
        throw Error "Invalid line: " + newValue

#
# Prototype
#

type.defineGetters

  line: -> @lines[@_line]

type.definePrototype

  ln: if isNodeJS then require("os").EOL else "\n"

type.defineBoundMethods

  _flushAsync: ->

    chunk = @_queue.shift()
    return if not chunk

    @_print chunk.message
    @didPrint.emit chunk

    if @_queue.length
      @_flushing = Promise.try @_flushAsync
      return

    @_flushing = null
    @didFlush.emit()
    return

type.defineMethods

  it: ->
    @moat 0
    @apply null, arguments
    @moat 0
    return

  moat: (width) ->
    assertType width, Number
    emptyLines = @_countEmptyLines()
    @_printNewLine() while width >= emptyLines++
    return

  format: (value, options) ->
    @_log @_format value, options
    @moat 0
    return

  warn: (message) ->
    if isNodeJS
      @moat 1
      @yellow "Warning: "
      @white message
      @moat 1
    else
      console.warn message
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

  flush: ->

    return if not @_flushing
    for chunk in @_queue
      @_print chunk.message
      @didPrint.emit chunk

    @_queue.length = 0
    @_flushing = null
    @didFlush.emit()
    return

  onceFlushed: (callback) ->
    if @_flushing isnt null
    then @didFlush.once callback
    else Promise.try callback

  _log: ->
    return if @isQuiet
    args = cloneArgs arguments
    return @_logArgs args

  _logArgs: (args) ->
    assertType args, Array
    args = concatArgs args
    return no if args.length is 0
    @_printLines args.split @ln
    return yes

  _enqueue: (chunk) ->
    @_queue.push cloneObject chunk
    @_flushing ?= Promise.try @_flushAsync
    return

  _initChunk: (chunk) ->
    chunk.line ?= @_line
    chunk.length ?= stripAnsi(chunk.message).length
    return chunk

  _printToChunk: (message, chunk) ->
    if chunk
    then chunk.message = message
    else chunk = {message}
    @_initChunk chunk
    @_printChunk chunk

  _printChunk: (chunk) ->
    assertType chunk, Object, "chunk"

    # Allow listeners to edit the chunk before it's validated.
    @willPrint.emit chunk

    assertType chunk.message, String, "chunk.message"
    assertType chunk.length, Number, "chunk.length"

    # Empty chunks are never printed.
    return no if chunk.length is 0

    # Marking a chunk as "silent" is useful when nothing should be printed.
    if chunk.silent isnt yes

      # Outside of NodeJS, messages are buffered because `console.log` must be used.
      isNodeJS and @_enqueue chunk

      # Marking a chunk as "hidden" is useful when `@line` should not be changed.
      if chunk.hidden isnt yes
        {line} = this
        line.contents += chunk.message
        line.length += chunk.length

    return yes

  _printNewLine: ->

    # Push a new Line onto `log.lines` if currently on the last line.
    if @_line is @lines.length - 1

      # Outside of NodeJS, messages are buffered because `console.log` must be used.
      isNodeJS or @_enqueue @_initChunk {message: @line.contents}

      @_printToChunk @ln, {hidden: yes}

      line = Line @lines.length
      @lines.push line
      @_line = line.index
      return

    # Since line splicing is not yet supported, just move the cursor down and overwrite existing lines.
    if isNodeJS
      @_printToChunk @ln, {silent: yes}
      return

    throw Error "Changing a Logger's `_line` property is unsupported outside of NodeJS."

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

type.addMixins [
  require "./mixins/Indent"
  require "./mixins/Color"
  require "./mixins/Env"
]

module.exports = type.build()
