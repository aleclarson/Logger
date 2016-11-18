
emptyFunction = require "emptyFunction"
isNodeJS = require "isNodeJS"

module.exports = (type) ->

  type.defineValues values

  type.defineMethods methods

  type.initInstance phases.initInstance

values =

  isQuiet: no

  isVerbose:
    value: no
    didSet: (isVerbose) ->
      @_verbose = if isVerbose then this else emptyFunction

  isDebug:
    value: no
    didSet: (isDebug) ->
      @_debug = if isDebug then this else emptyFunction

  _verbose: emptyFunction

  _debug: emptyFunction

methods =

  verbose: ->
    @_verbose.apply this, arguments

  debug: ->
    @_debug.apply this, arguments

phases =

  initInstance: (options) ->

    if isNodeJS
      @isDebug = ("--debug" in process.argv) or (process.env.DEBUG is "true")
      @isVerbose = ("--verbose" in process.argv) or (process.env.VERBOSE is "true")
