
require "isNodeJS"

{ isType, setType, Shape } = require "type-utils"

LazyVar = require "lazy-var"
combine = require "combine"

Style = require "../helpers/Style"

module.exports = (type) ->

  type.defineValues values

  type.initInstance phases.initInstance

values =

  color: -> {}

  isColorful: (options) ->
    return no unless isNodeJS
    return @process?.stdout?.isTTY is yes

methods =

  _shouldColorize: ->
    return no unless isNodeJS
    return no if log.isQuiet
    return log.isColorful

phases =

  initInstance: (options) ->

    palette = options.palette or combine {}, defaultPalette
    colors = Object.keys palette.bright

    defineAttributes = (target, transform) =>

      attributes = Style.createAttributes colors, (key, value) ->
        style = Style { palette, transform }
        style[key] = value
        style

      for key, prop of attributes
        prop.define this, key
      return

    defineAttributes this, (lines) =>
      @_log lines.join @ln

    defineAttributes @color, (lines) =>
      lines.join @ln

defaultPalette =

  bright:
    red: [4, 0, 0]
    blue: [0, 1, 5]
    green: [0, 5, 1]
    cyan: [0, 3, 4]
    white: [5, 5, 5]
    gray: [2, 2, 2]
    yellow: [5, 5, 0]
    pink: [5, 0, 4]
    black: [0, 0, 0]

  dim:
    red: [2, 0, 0]
    blue: [0, 0, 2]
    green: [0, 2, 1]
    cyan: [0, 1, 2]
    white: [3, 3, 3]
    gray: [1, 1, 1]
    yellow: [2, 2, 0]
    pink: [3, 0, 1]
    black: [0, 0, 0]
