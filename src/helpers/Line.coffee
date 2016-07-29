
isType = require "isType"
Type = require "Type"

type = Type "Logger_Line"

type.defineOptions
  index: Number.isRequired
  contents: String.withDefault ""

type.createArguments (args) ->

  if isType args[0], Number
    args[0] = { index: args[0] }

  return args

type.defineValues

  index: (options) -> options.index

  contents: (options) -> options.contents

  length: (options) -> options.contents.length

module.exports = type.build()
