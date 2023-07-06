"use strict";

const compose = require("crocks/helpers/compose");
const isSame = require("crocks/predicates/isSame");
const find = require("crocks/Maybe/find");
const flip = require("crocks/combinators/flip");
const fst = require("crocks/Pair/fst");
const map = require("crocks/pointfree/map");
const snd = require("crocks/Pair/snd");
const toPairs = require("crocks/Pair/toPairs");

/**
 * TODO: Work out how to do "extends" in HM
 *
 * Token :: {
 *   type :: string
 *
 *   // The parsed input of the token
 *   input :: String
 *
 *   // The position in the input the token is
 *   position :: Integer
 * }
 *
 * CommandToken :: {
 *   type :: 'CommandToken'
 * }
 *
 * NumberToken :: {
 *   type :: 'NumberToken'
 *   number :: BigDecimal
 * }
 *
 * OperatorToken :: {
 *   type :: 'OperatorToken'
 * }
 */

/**
 * operators :: Operators
 * Operators :: {
 *   [String] :: String
 * }
 */
const operators = {
	SQUARE_ROOT: "sqrt",
	ADDITION: "+",
	SUBTRACTION: "-",
	MULTIPLICATION: "*",
	DIVISION: "/"
}

/**
 * commands :: Commands
 * Commands :: {
 *   [String] :: String
 * }
 */
const commands = {
	UNDO: "undo",
	CLEAR: "clear"
}

/**
 * types :: Types
 * Types :: {
 *   [String] :: String
 * }
 */
const types = {
	COMMAND: "CommandToken",
	INVALID_INPUT: "InvalidToken",
	NUMBER: "NumberToken",
	OPERATOR: "OperatorToken",
}

// isValueSame :: String -> Pair String -> Boolean
const isValueSame = (str) =>
	compose(isSame(str), snd)

// fromValue :: Object -> String -> Maybe String
const fromValue = flip((token) =>
	compose(map(fst), find(isValueSame(token)), toPairs)
)

// commandFromValue :: String -> Maybe String
const commandFromValue = fromValue(commands)

// operatorFromValue :: String -> Maybe String
const operatorFromValue = fromValue(operators)

module.exports = {
	Operators: operators,
	Commands: commands,
	Types: types,

	commandFromValue,
	operatorFromValue
}
