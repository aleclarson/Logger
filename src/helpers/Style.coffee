
emptyFunction = require "emptyFunction"
Property = require "Property"
Shape = require "Shape"
ansi = require "ansi-256-colors"
sync = require "sync"
Type = require "Type"

concatArgs = require "./concatArgs"

Palette = Shape "Palette", { bright: Object, dim: Object }

type = Type "Logger_Style"

type.defineArgs ->
  types: {palette: Palette, transform: Function}
  defaults: {transform: emptyFunction.thatReturnsArgument}
  required: {palette: yes}

type.defineFunction ->

  args = [] # Must not leak arguments object!
  args[index] = value for value, index in arguments

  colors = @palette[if @isDim then "dim" else "bright"]

  lines = concatArgs args
  lines = lines.split "\n"

  @_transform sync.map lines, (line) =>

    if @isBold
      line = "\x1b[1m" + line + "\x1b[22m"

    color = @fg and colors[@fg]
    if color
      color = ansi.fg.getRgb.apply null, color
      line = color + line + ansi.reset

    return line

type.defineValues

  palette: (options) -> options.palette

  fg: null

  isDim: no

  isBold: no

  _transform: (options) -> options.transform

type.initInstance ->

  colors = Object.keys @palette.bright

  attributes = Style.createAttributes colors, (key, value) ->
    this[key] = value
    this

  for key, prop of attributes
    prop.define this, key

  return

type.defineStatics

  createAttributes: (colors, setAttribute) ->

    attributes =

      dim: Property
        get: -> setAttribute.call this, "isDim", yes

      bold: Property
        get: -> setAttribute.call this, "isBold", yes

    sync.each colors, (key) ->
      attributes[key] = Property
        get: -> setAttribute.call this, "fg", key

    return attributes

module.exports = Style = type.build()
