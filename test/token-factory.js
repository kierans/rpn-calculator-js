"use strict";

const converge = require("crocks/combinators/converge");
const curry = require("crocks/helpers/curry");
const setProp = require("crocks/helpers/setProp");

const { BigDecimal } = require("bigdecimal");

const { Types } = require("../src/tokens");

// bigDecimal :: String -> BigDecimal
const bigDecimal = (value) => new BigDecimal(value)

// givenToken :: String -> String -> Token
const givenToken = curry((type, value) => ({
	type,
	input: value,
	position: -1
}))

// givenCommandToken :: String -> CommandToken
const givenCommandToken = givenToken(Types.COMMAND)

// givenInvalidInput :: () -> InvalidInputToken
const givenInvalidInput = () => givenToken(Types.INVALID_INPUT)("foo")

// givenNumberToken :: String -> NumberToken
const givenNumberToken =
	converge(
		setProp("number"),
		bigDecimal,
		givenToken(Types.NUMBER)
	)

// givenOperatorToken = String -> OperatorToken
const givenOperatorToken = givenToken(Types.OPERATOR)

module.exports = {
	givenCommandToken,
	givenInvalidInput,
	givenNumberToken,
	givenOperatorToken,
	givenToken
}
