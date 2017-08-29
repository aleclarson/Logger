
emptyFunction = require "emptyFunction"
isNodeJS = require "isNodeJS"
Type = require "Type"

mixin = Type.Mixin()

mixin.defineValues

  isQuiet: no

  _verbose: emptyFunction

  _debug: emptyFunction

mixin.defineProperties

  isVerbose:
    value: no
    didSet: (isVerbose) ->
      @_verbose =
        if isVerbose
        then this
        else emptyFunction
      return

  isDebug:
    value: no
    didSet: (isDebug) ->
      @_debug =
        if isDebug
        then this
        else emptyFunction
      return

mixin.defineMethods

  verbose: ->
    @_verbose.apply this, arguments

  debug: ->
    @_debug.apply this, arguments

isNodeJS and mixin.initInstance (options) ->
  @isDebug = ("--debug" in process.argv) or (process.env.DEBUG is "true")
  @isVerbose = ("--verbose" in process.argv) or (process.env.VERBOSE is "true")

module.exports = mixin.apply
