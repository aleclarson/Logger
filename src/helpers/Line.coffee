
{ isType } = require "type-utils"

Type = require "Type"

type = Type "Logger_Line"

type.optionTypes =
  index: Number
  contents: String

type.optionDefaults =
  contents: ""

type.createArguments (args) ->

  if isType args[0], Number
    args[0] = { index: args[0] }

  return args

type.defineValues

  index: (options) -> options.index

  contents: (options) -> options.contents

  length: (options) -> options.contents.length

module.exports = type.build()
