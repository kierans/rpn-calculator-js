"use strict";

const assign = require("crocks/helpers/assign");
const curry = require("crocks/helpers/curry");

/**
 * CalculatorError :: {
 *   type :: String
 *   message :: String
 * }
 *
 * IllegalArithmeticOperationError :: {
 *   type :: "illegal-arithmetic-operation-error"
 *   message :: String
 *   operands: [Operation]
 * }
 *
 * IllegalStateError :: {
 *   type :: "illegal-state-error"
 *   message :: String
 * }
 */

const ERROR_TYPES = {
	ILLEGAL_ARITHMETIC_OPERATION_ERROR: "illegal-arithmetic-operation-error",
	ILLEGAL_STATE_ERROR: "illegal-state-error",
}

// error :: String -> String -> CalculatorError
const error = curry((type, message) => ({
	type,
	message
}))

// illegalArithmeticOperationError :: String -> [Operation] -> IllegalArithmeticOperationError
const illegalArithmeticOperationError = curry((message, operands) =>
	assign(error(ERROR_TYPES.ILLEGAL_ARITHMETIC_OPERATION_ERROR)(message), { operands })
)

// illegalStateError :: String -> IllegalStateError
const illegalStateError = error(ERROR_TYPES.ILLEGAL_STATE_ERROR)

module.exports = {
	ERROR_TYPES,
	illegalArithmeticOperationError,
	illegalStateError,
}
