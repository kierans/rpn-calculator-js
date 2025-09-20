"use strict";

const { allOf, hasProperty } = require("hamjest");
const { ERROR_TYPES } = require("../src/errors");

const error = (type) =>
	hasProperty("type", type)

const withMessage = (message) =>
	hasProperty("message", message)

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

module.exports = {
	illegalArithmeticOperationError,
	illegalStateError
}
