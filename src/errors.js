"use strict";

const assign = require("crocks/helpers/assign");
const compose = require("crocks/helpers/compose");
const converge = require("crocks/combinators/converge");
const curry = require("crocks/helpers/curry");
const objOf = require("crocks/helpers/objOf");

/**
 * CalculatorError :: {
 *   type :: String
 *   message :: String
 * }
 *
 * IllegalArithmeticOperationError :: {
 *   type :: "illegal-arithmetic-operation-error"
 *   message :: String
 *   expression: String,
 *   operands: [Operation]
 * }
 *
 * IllegalStateError :: {
 *   type :: "illegal-state-error"
 *   message :: String
 * }
 *
 * InsufficientOperatorParametersError :: {
 *   type :: "insufficient-operator-parameters-error",
 *   message :: String,
 *   token :: OperatorToken
 * }
 *
 * InvalidInputError :: {
 *   type :: "invalid-input-error",
 *   message :: String,
 *   token :: Token
 * }
 */

const ERROR_TYPES = {
	ILLEGAL_ARITHMETIC_OPERATION_ERROR: "illegal-arithmetic-operation-error",
	ILLEGAL_STATE_ERROR: "illegal-state-error",
	INSUFFICIENT_OPERATOR_PARAMETERS_ERROR: "insufficient-operator-parameters-error",
	INVALID_INPUT_ERROR: "invalid-input-error"
}

// error :: String -> String -> CalculatorError
const error = curry((type, message) => ({
	type,
	message
}))

// errorWithToken :: String -> (Token -> String) -> Token -> CalculatorError
const errorWithToken = curry((type, message) =>
	converge(assign, compose(error(type), message), objOf("token"))
)

// illegalArithmeticOperationError :: String -> [Operation] -> IllegalArithmeticOperationError
const illegalArithmeticOperationError = curry((expression, operands) =>
	assign
		(error
			(ERROR_TYPES.ILLEGAL_ARITHMETIC_OPERATION_ERROR)
			(`'${expression}' is an illegal arithmetic operation`))
		({ expression, operands })
)

// illegalStateError :: String -> IllegalStateError
const illegalStateError = error(ERROR_TYPES.ILLEGAL_STATE_ERROR)

// tokenToInsufficientOperatorParametersErrorMessage :: OperatorToken -> String
const tokenToInsufficientOperatorParametersErrorMessage = ({ input }) =>
	`Insufficient operands to operator ${input}`

// tokenToInvalidInputErrorMessage :: OperatorToken -> String
const tokenToInvalidInputErrorMessage = ({ input }) =>
	`Invalid input: ${input}`

// insufficientOperatorParametersError :: OperatorToken -> InsufficientOperatorParametersError
const insufficientOperatorParametersError =
	errorWithToken
		(ERROR_TYPES.INSUFFICIENT_OPERATOR_PARAMETERS_ERROR)
		(tokenToInsufficientOperatorParametersErrorMessage)

// invalidInputError :: InvalidInputToken -> InvalidInputError
const invalidInputError =
	errorWithToken(ERROR_TYPES.INVALID_INPUT_ERROR)(tokenToInvalidInputErrorMessage)

module.exports = {
	ERROR_TYPES,
	illegalArithmeticOperationError,
	illegalStateError,
	insufficientOperatorParametersError,
	invalidInputError
}
