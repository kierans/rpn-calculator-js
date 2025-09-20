"use strict";

const Result = require("crocks/Result");

const compose = require("crocks/helpers/compose");
const constant = require("crocks/combinators/constant");
const curry = require("crocks/helpers/curry");
const map = require("crocks/pointfree/map");

const { joinPair, join } = require("@epistemology-factory/crocks-ext/String");

const { decimalToString } = require("./decimal");
const { illegalArithmeticOperationError } = require("./errors");

/**
 * Records the details of an operation in the calculator.
 *
 * This uses the concept of a Protocol or Interface to define the type as a mandatory collection
 * of named functions (methods). Each instance (implementation) of the Protocol must implement
 * all the functions defined in the Protocol. This allows many different Operations to be defined
 * while allowing functions to be applied to them in a type-safe manner.
 *
 * Operation :: {
 *   value :: () -> BigDecimal
 *   undo :: () -> [Operation]
 *   asExpression :: () -> String
 * }
 */

// opValue :: Operation -> BigDecimal
const opValue = (operation) => operation.value()

// opValueAsString :: Operation -> String
const opValueAsString = compose(decimalToString, opValue)

// operandsToExpression :: [Operation] -> String
const operandsToExpression = compose(join(" "), map(opValueAsString))

// tokenToExpression :: Token -> String
const tokenToExpression = ({ input }) => input

// toIllegalArithmeticOperationError :: e -> [Operation] -> String -> Result IllegalArithmeticOperationError Unit
const toIllegalArithmeticOperationError = constant(constant((expression) =>
	Result.Err(illegalArithmeticOperationError(`'${expression}' is an illegal arithmetic operation`))
))

// toOperation :: BigDecimal -> [Operation] -> String -> Result Unit Operation
const toOperation = curry((value, operands, expression) =>
	Result.Ok({
		value: constant(value),
		undo: constant(operands),
		asExpression: constant(expression)
	})
)

// toOperationExpression :: Token -> [Operation] -> String
const toOperationExpression = curry((token, operands) =>
	joinPair(" ", operandsToExpression(operands), tokenToExpression(token))
)

module.exports = {
	opValue,
	opValueAsString,
	toIllegalArithmeticOperationError,
	toOperation,
	toOperationExpression
}
