"use strict";

const Result = require("crocks/Result");

const chain = require("crocks/pointfree/chain");
const compose = require("crocks/helpers/compose");
const constant = require("crocks/combinators/constant");
const curry = require("crocks/helpers/curry");
const either = require("crocks/pointfree/either");
const isSame = require("crocks/predicates/isSame");
const find = require("crocks/Maybe/find");
const flip = require("crocks/combinators/flip");
const fst = require("crocks/Pair/fst");
const map = require("crocks/pointfree/map");
const snd = require("crocks/Pair/snd");
const toPairs = require("crocks/Pair/toPairs");

const { reduceWhile } = require("@epistemology-factory/crocks-ext/pointfree/reduce");

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
	INVALID_INPUT: "InvalidInputToken",
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

// evaluateTokens :: (Token -> Calculation) -> [Operation] -> [Token] -> CalculationResult
const evaluateTokens = curry((fn, stack) =>
	reduceWhile(
		compose(constant, either(constant(false), constant(true))),
		flip(compose(chain, fn)),
		Result.Ok(stack)
	)
)

module.exports = {
	Operators: operators,
	Commands: commands,
	Types: types,

	commandFromValue,
	evaluateTokens,
	operatorFromValue
}
