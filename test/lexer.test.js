"use strict";

const { BigDecimal } = require("bigdecimal");
const { curry, identity } = require("crocks");
const { allOf, assertThat, equalTo, hasItem, hasProperty, is } = require("hamjest");

const { join } = require("@epistemology-factory/crocks-ext/String");
const { throwContents } = require("@epistemology-factory/crocks-ext/utils");

const { Types } = require("../src/tokens");
const { tokenise } = require("../src/lexer");

describe("Lexer", function() {
	it("should parse number token", function() {
		const value = "45"

		const tokens = lex([ value ]);

		assertThat(tokens, hasItem(isNumberToken(new BigDecimal(value), value, 1)));
	});

	it("should parse command tokens", function() {
		const commands = [ "undo", "clear" ];

		commands.forEach((command) => {
			const tokens = lex([ command ]);

			assertThat(tokens, hasItem(isCommandToken(command, 1)));
		});
	});

	it("should parse operator tokens", function() {
		const operators = [ "sqrt", "+", "-", "*", "/" ];

		operators.forEach((operator) => {
			const tokens = lex([ operator ]);

			assertThat(tokens, hasItem(isOperatorToken(operator, 1)));
		});
	});

	it("should create invalid input token for other input", function() {
		const input = "foo";

		const tokens = lex([ input ]);

		assertThat(tokens, hasItem(withInvalidInputToken(input, 1)));
	});

	/*
   * We only need to test that we can parse a sequence of tokens, we don't have to test every combination here.
   */
	it("should parse stream of tokens", function() {
		const input = [ "clear", "4", "+" ];

		const tokens = lex(input)

		assertThat(tokens.length, is(3));
		assertThat(tokens[0], isCommandToken(input[0], 1));
		assertThat(tokens[1], isNumberToken(new BigDecimal("4"), input[1], 7));
		assertThat(tokens[2], isOperatorToken(input[2], 9));
	});
});

// lex :: [String] -> [Token]
const lex = (input) =>
	tokenise(join(" ", input)).either(throwContents, identity)

// isToken :: String -> String -> Number -> Matcher
const isToken = curry((type, tokenValue, tokenPos) =>
	allOf(
		hasProperty("type", type),
		hasProperty("input", equalTo(tokenValue)),
		hasProperty("position", equalTo(tokenPos))
	)
)

// isCommandToken :: String -> Number -> Matcher
const isCommandToken = isToken(Types.COMMAND)

// isNumberToken :: Number -> String -> Number -> Matcher
const isNumberToken = curry((number, tokenValue, tokenPos) =>
	allOf(
		isToken(Types.NUMBER, tokenValue, tokenPos),
		hasProperty("number", equalTo(number))
	)
)

// isOperatorToken :: String -> Number -> Matcher
const isOperatorToken = isToken(Types.OPERATOR)

// withInvalidInputToken :: String -> Number -> Matcher
const withInvalidInputToken = isToken(Types.INVALID_INPUT);
