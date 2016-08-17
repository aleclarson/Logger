
isType = require "isType"
Type = require "Type"

type = Type "Logger_Line"

type.initArgs (args) ->
  if isType args[0], Number
    args[0] = index: args[0]
  return

type.defineOptions
  index: Number.isRequired
  contents: String.withDefault ""

type.defineValues (options) ->

  index: options.index

  contents: options.contents

  length: options.contents.length

module.exports = type.build()
