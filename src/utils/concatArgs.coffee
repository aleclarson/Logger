
isType = require "isType"
Null = require "Null"
Nan = require "Nan"

AddableType = String.or(Number, Boolean, Nan, Null)

# Transforms an array of arguments into a single string.
concatArgs = (args) ->

  result = []

  for arg in args

    continue if arg is undefined

    if Array.isArray arg
      result.push concatArgs arg

    else if isType arg, AddableType
      result.push arg

  return result.join ""

module.exports = concatArgs
