
repeatString = require "repeat-string"
assertType = require "assertType"
Type = require "Type"

mixin = Type.Mixin()

mixin.defineValues

  _indent: ""

  _indentStack: -> []

mixin.defineProperties

  indent:
    value: 0
    didSet: (newValue, oldValue) ->
      assertType newValue, Number
      @_indent = repeatString @indentString, newValue

  indentString:
    value: " "
    didSet: (newValue) ->
      assertType newValue, String
      @_indent = repeatString newValue, @indent

mixin.defineMethods

  plusIndent: (indent) ->
    @pushIndent indent + @indent

  pushIndent: (indent) ->
    @_indentStack.push @indent
    @indent = indent
    return

  popIndent: (n = 1) ->
    while n-- > 0
      indent = @_indentStack.pop()
      if indent?
        @indent = indent
      else
        @indent = 0
        break
    return

  withIndent: (indent, fn) ->
    @pushIndent indent
    fn()
    @popIndent()
    return

mixin.initInstance do ->

  willPrint = (chunk) ->

    # Only indent empty lines!
    return if @line.length > 0

    # The chunk is an indent string.
    if chunk.indent is yes
      chunk.message = @_indent
      chunk.length = @_indent.length
      return

    # Avoid indenting empty chunks and line-break chunks.
    unless (chunk.length is 0) or (chunk.message is @ln)
      chunk.message = @_indent + chunk.message
      chunk.length += @_indent.length
      return

  return ->
    @willPrint willPrint.bind this

module.exports = mixin.apply
