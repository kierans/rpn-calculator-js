"use strict";

const { allOf, hasProperty } = require("hamjest");
const { ERROR_TYPES } = require("../src/errors");

const error = (type) =>
	hasProperty("type", type)

const withMessage = (message) =>
	hasProperty("message", message)

const withToken = (token) =>
	hasProperty("token", token)

const illegalArithmeticOperationError = (message) =>
	allOf(
		error(ERROR_TYPES.ILLEGAL_ARITHMETIC_OPERATION_ERROR),
		withMessage(message)
	)

const illegalStateError = (message) =>
	allOf(
		error(ERROR_TYPES.ILLEGAL_STATE_ERROR),
		withMessage(message)
	)

const insufficientOperatorParametersError = (message, token) =>
	allOf(
		error(ERROR_TYPES.INSUFFICIENT_OPERATOR_PARAMETERS_ERROR),
		withMessage(message),
		withToken(token)
	)

const invalidInputError = (message, token) =>
	allOf(
		error(ERROR_TYPES.INVALID_INPUT_ERROR),
		withMessage(message),
		withToken(token)
	)

const withIntValue = (value) =>
	({
		matches: (actual) => actual.value().intValue() === value,
		describeTo: (description) =>
			description
				.append('An Operation with value ')
				.appendValue(value),
		describeMismatch: (actual, description) =>
			description
				.append('was ')
				.appendValue(actual.value().intValue())
	})

module.exports = {
	illegalArithmeticOperationError,
	illegalStateError,
	insufficientOperatorParametersError,
	invalidInputError,
	withIntValue
}
