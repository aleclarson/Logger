
isType = require "isType"
Type = require "Type"

type = Type "Logger_Line"

type.defineArgs ->

  create: (args) ->
    if isType args[0], Number
      args[0] = index: args[0]
    return args

  types: {index: Number, contents: String}
  defaults: {contents: ""}
  required: {index: yes}

type.defineValues (options) ->

  index: options.index

  contents: options.contents

  length: options.contents.length

module.exports = type.build()
