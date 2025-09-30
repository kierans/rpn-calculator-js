"use strict";

const { pipe } = require("crocks");

const Decimal = require("decimal.js");

const { assertThat, is } = require("hamjest");

const { Operators } = require("../src/tokens");
const { formatDecimal, formatError, formatStack } = require("../src/reporter");
const {
	illegalArithmeticOperationError,
	illegalStateError,
	insufficientOperatorParametersError,
	invalidInputError, ERROR_TYPES
} = require("../src/errors");

const { givenOperatorToken, givenInvalidInput } = require("./token-factory");
const { newDecimal } = require("../src/decimal");

describe("Reporter", function() {
	it("should format numbers to ten decimal places", function() {
		assertThat(formatDecimal(new Decimal("4")), is("4"));
		assertThat(formatDecimal(new Decimal("4.00")), is("4"));
		assertThat(formatDecimal(new Decimal("3.141592653589793")), is("3.1415926536"));

		// check rounding around the 10th digit
		assertThat(formatDecimal(new Decimal("3.141592653559793")), is("3.1415926536"));
		assertThat(formatDecimal(new Decimal("3.141592653549793")), is("3.1415926535"));
	});

	it("should format operator exception", function() {
		const error = insufficientOperatorParametersError(givenOperatorToken(Operators.MULTIPLICATION));
		const message = formatError(error);

		assertThat(message, is("operator * (position: -1): insufficient parameters"));
	});

	it("should format illegal arithmetic operation", function() {
		const expression = "1 0 /";
		const error = illegalArithmeticOperationError(expression)([]);
		const message = formatError(error);

		assertThat(message, is(`operation '${expression}' is illegal`));
	});

	it("should format invalid input exception", function() {
		const error = invalidInputError(givenInvalidInput());
		const message = formatError(error);

		assertThat(message, is("invalid input (position: -1): 'foo'"));
	});

	/*
	 * Given we don't have runtime exceptions, we need a base formatter for
	 * calculator errors. This is unlike in Java where unrecoverable exceptions (errors)
	 * are thrown and end the program.
	 */
	it("should format calculator error", function() {
		const errorMessage = "something bad has happened";
		const error = illegalStateError(errorMessage);
		const message = formatError(error);

		assertThat(message, is(`ERROR: [${ERROR_TYPES.ILLEGAL_STATE_ERROR}]: ${errorMessage}`));
	});

	it("should format calculator state", function() {
		const stack = [ givenOperation("3.141"), givenOperation("42") ];
		const message = formatStack(stack);

		assertThat(message, is("stack: 42 3.141"));
	});

	// givenOperation :: String -> Operation
	const givenOperation =
		pipe(
			newDecimal,
			(value) => ({
				value: () => value,
				undo: () => [],
				asExpression: () => value.toString()
			})
		)
});
