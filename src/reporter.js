"use strict";

const compose = require("crocks/helpers/compose");
const constant = require("crocks/combinators/constant");
const isSame = require("crocks/predicates/isSame");
const option = require("crocks/pointfree/option");

const { choose, otherwise, when } = require("@epistemology-factory/crocks-ext/logic/choice");
const { length } = require("@epistemology-factory/crocks-ext/helpers/lists");
const { mapCollectRight } = require("@epistemology-factory/crocks-ext/pointfree/collect");
const { pluck } = require("@epistemology-factory/crocks-ext/Record");
const { prepend } = require("@epistemology-factory/crocks-ext/helpers");

const { ERROR_TYPES } = require("./errors");
const { opValue } = require("./operation");
const { joinPair } = require("@epistemology-factory/crocks-ext/String");
const { pop } = require("./array");

// lengthIs :: Number -> [a] -> Boolean
const lengthIs = (n) =>
	compose(isSame(n), length)

// isCalculatorError :: String -> CalculatorError -> Boolean
const isCalculatorError = (type) => compose(isSame(type), pluck("type"))

// isIllegalArithmeticOperationError :: CalculatorError -> Boolean
const isIllegalArithmeticOperationError = isCalculatorError(ERROR_TYPES.ILLEGAL_ARITHMETIC_OPERATION_ERROR)

// isInsufficientOperatorParametersError :: CalculatorError -> Boolean
const isInsufficientOperatorParametersError = isCalculatorError(ERROR_TYPES.INSUFFICIENT_OPERATOR_PARAMETERS_ERROR)

// isInvalidInputError :: CalculatorError -> Boolean
const isInvalidInputError = isCalculatorError(ERROR_TYPES.INVALID_INPUT_ERROR)

// formatCalculatorError :: CalculatorError -> String
const formatCalculatorError = ({ type, message }) => `ERROR: [${type}]: ${message}`

// formatIllegalArithmeticOperationError :: IllegalArithmeticOperationError -> String
const formatIllegalArithmeticOperationError = ({ expression }) =>
	`operation '${expression}' is illegal`

// formatInsufficientOperatorParametersError :: InsufficientOperatorParametersError -> String
const formatInsufficientOperatorParametersError = ({ token }) =>
	`operator ${token.input} (position: ${token.position}): insufficient parameters`

// formatInvalidInputError :: InvalidInputError -> String
const formatInvalidInputError = ({ token }) =>
	`invalid input (position: ${token.position}): '${token.input}'`

// formatDecimal :: Decimal -> String
const formatDecimal = (a) => a.toDecimalPlaces(10).toString()

// formatError :: CalculatorError -> String
const formatError = choose(
	when(isIllegalArithmeticOperationError, formatIllegalArithmeticOperationError),
	when(isInsufficientOperatorParametersError, formatInsufficientOperatorParametersError),
	when(isInvalidInputError, formatInvalidInputError),
	otherwise(formatCalculatorError)
)

// formatOperationValue :: Operation -> String
const formatOperationValue = compose(formatDecimal, opValue)

// formatOperations :: [Operation] -> String
const formatOperations = choose(
	when(lengthIs(0), constant("")),
	when(lengthIs(1), compose(formatOperationValue, pop)),
	otherwise(compose(option(""), mapCollectRight(formatOperationValue, joinPair(" "))))
)

// formatStack :: [Operation] -> String
const formatStack = compose(prepend("stack: "), formatOperations)

module.exports = {
	formatDecimal,
	formatError,
	formatStack
}
