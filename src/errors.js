"use strict";

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

// illegalArithmeticOperationError :: String -> IllegalArithmeticOperationError
const illegalArithmeticOperationError = error(ERROR_TYPES.ILLEGAL_ARITHMETIC_OPERATION_ERROR)

// illegalStateError :: String -> IllegalStateError
const illegalStateError = error(ERROR_TYPES.ILLEGAL_STATE_ERROR)

module.exports = {
	ERROR_TYPES,
	illegalArithmeticOperationError,
	illegalStateError,
}
