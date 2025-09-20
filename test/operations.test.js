"use strict";

const { identity } = require("crocks");

const { assertThat, is, equalTo } = require("hamjest");
const { throwContents, throwResult } = require("@epistemology-factory/crocks-ext/utils");

const { Operators } = require("../src/tokens");
const { arithmeticOperation, pushNumberOperation } = require("../src/operations");

const { givenNumberToken, givenOperatorToken } = require("./token-factory");
const { givenNumberOperation } = require("./operation-factory");

const { illegalArithmeticOperationError, illegalStateError } = require("./matchers");

describe("Operations", function() {
	describe("push number operation", function() {
		const input = "42";
		const token = givenNumberToken(input);

		const operation = pushNumberOperation(token)
			.either(
				throwContents,
				identity
			);

		it("should return token value", function() {
			assertThat(operation.value(), is(token.number));
		});

		it("should return empty list to undo operation", function() {
			assertThat(operation.undo(), is([]));
		});

		it("should return token value as expression", function() {
			assertThat(operation.asExpression(), is(input));
		});
	});

	describe("arithmetic operations", function() {
		it("should return error if unrecognised operator", function() {
			const operator = "foo";
			const result =
				arithmeticOperation(givenOperatorToken(operator))([]).either(identity, throwResult);

			assertThat(result, is(illegalStateError(`Can't operate on op '${operator}'`)))
		});

		describe("unioperand", function() {
			const value = "4";
			const operand = givenNumberOperation(value);

			describe("square root", function() {
				const operator = givenOperatorToken(Operators.SQUARE_ROOT);

				const operation =
					arithmeticOperation(operator)([ operand ]).either(throwContents, identity);

				it("should perform square root", function() {
					assertThat(operation.value().intValue(), is(equalTo(2)));
				});

				it("should return operand when undoing operation", function() {
					assertThat(operation.undo(), is([ operand ]));
				});

				it("should return operation as expression", function() {
					assertThat(operation.asExpression(), is(`${value} ${Operators.SQUARE_ROOT}`));
				});
			});
		});

		describe("bioperand", function() {
			const a = givenNumberOperation("2");
			const b = givenNumberOperation("1");

			describe("addition", function() {
				const operator = givenOperatorToken(Operators.ADDITION);

				const operation =
					arithmeticOperation(operator)([ a, b ]).either(throwContents, identity);

				operationTests("addition", 3, operator, operation);
			});

			describe("subtraction", function() {
				const operator = givenOperatorToken(Operators.SUBTRACTION);

				const operation =
					arithmeticOperation(operator)([ a, b ]).either(throwContents, identity);

				operationTests("subtraction", 1, operator, operation);
			});

			describe("multiplication", function() {
				const operator = givenOperatorToken(Operators.MULTIPLICATION);

				const operation =
					arithmeticOperation(operator)([ a, b ]).either(throwContents, identity);

				operationTests("multiplication", 2, operator, operation);
			});

			describe("division", function() {
				const operator = givenOperatorToken(Operators.DIVISION);

				const operation =
					arithmeticOperation(operator)([ a, b ]).either(throwContents, identity);

				operationTests("division", 2, operator, operation);

				it("should handle division by zero", function() {
					const operation =
						arithmeticOperation(operator)([ a, givenNumberOperation("0") ]).either(identity, throwResult);

					assertThat(operation, is(illegalArithmeticOperationError("'2 0 /' is an illegal arithmetic operation")));
				});
			});

			function operationTests(type, expectedValue, operator, operation) {
				it(`should perform ${type}`, function() {
					assertThat(operation.value().intValue(), is(equalTo(expectedValue)));
				});

				it("should return operands when undoing operation", function() {
					assertThat(operation.undo(), is([ a, b ]));
				});

				it("should return operation as expression", function() {
					assertThat(operation.asExpression(), is(`${a.asExpression()} ${b.asExpression()} ${operator.input}`));
				});
			}
		});
	});
});
