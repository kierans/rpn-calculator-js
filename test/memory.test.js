"use strict";

const { identity } = require("crocks");

const { assertThat, is, hasItem } = require("hamjest");
const { throwContents, throwResult } = require("@epistemology-factory/crocks-ext/utils");

const { Operators, evaluateTokens, Commands } = require("../src/tokens");
const { opValue } = require("../src/operation");
const { push } = require("../src/memory");

const {
	givenCommandToken,
	givenInvalidInput,
	givenNumberToken,
	givenOperatorToken,
	givenToken
} = require("./token-factory");
const {
	illegalStateError,
	insufficientOperatorParametersError,
	invalidInputError,
	withIntValue
} = require("./matchers");

describe("Memory", function() {
	it("should return error when calculator can not process token", function() {
		const type = "foo";
		const result = push(givenToken(type)("bar"))([]).either(identity, throwResult);

		assertThat(result.fst(), is(illegalStateError(`Can't handle token of type ${type}`)));
	});

	it('should return error when operator has insufficient parameters', function() {
		const op = Operators.ADDITION;
		const token = givenOperatorToken(op);
		const result = push(token)([]).either(identity, throwResult);

		assertThat(
			result.fst(),
			is(insufficientOperatorParametersError(`Insufficient operands to operator ${op}`, token))
		);
	});

	it("should return error when invalid input pushed", function() {
		const token = givenInvalidInput();
		const result = push(token)([]).either(identity, throwResult);

		assertThat(
			result.fst(),
			is(invalidInputError(`Invalid input: ${token.input}`, token))
		);
	});

	it("should accept number token", function() {
		const value = 92;
		const result = push(givenNumberToken(value))([]).either(throwContents, identity);

		assertThat(result, hasItem(withIntValue(value)));
	});

	it("should clear calculator", function() {
		const tokens = [
			givenNumberToken(12),
			givenCommandToken(Commands.CLEAR)
		];

		const result = evaluate(tokens).either(throwContents, identity);

		assertThat(result.length, is(0));
	});

	it("should undo simple push", function() {
		const tokens = [
			givenNumberToken(12),
			givenNumberToken(23),
			givenCommandToken(Commands.UNDO)
		];

		const result = evaluate(tokens).either(throwContents, identity);
		const nums = result.map(opValue);

		assertThat(nums.length, is(1));
		assertThat(nums[0].intValue(), is(12));
	});

	it("should undo composite operations", function() {
		const tokens = [
			givenNumberToken(5),
			givenNumberToken(4),
			givenOperatorToken(Operators.MULTIPLICATION),
			givenNumberToken(5),
			givenOperatorToken(Operators.MULTIPLICATION),
			givenCommandToken(Commands.UNDO)
		];

		const result = evaluate(tokens).either(throwContents, identity);
		const nums = result.map(opValue);

		assertThat(nums.length, is(2));
		assertThat(nums[0].intValue(), is(5));
		assertThat(nums[1].intValue(), is(20));
	});

	it("should ignore undo on empty stack", function() {
		const token = givenCommandToken(Commands.UNDO);
		const result = push(token)([]).either(throwContents, identity);

		assertThat(result.length, is(0));
	});

	it("should undo illegal operation", function() {
		const tokens = [
			givenNumberToken(1),
			givenNumberToken(0),
			givenOperatorToken(Operators.DIVISION)
		];

		const result = evaluate(tokens).either(identity, throwResult);
		const nums = result.snd().map(opValue);

		assertThat(nums.length, is(2));
		assertThat(nums[0].intValue(), is(0));
		assertThat(nums[1].intValue(), is(1));
	});
});

// evaluate :: [Token] -> CalculationResult
const evaluate = evaluateTokens(push)([]);
