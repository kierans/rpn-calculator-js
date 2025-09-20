"use strict";

const converge = require("crocks/combinators/converge");
const curry = require("crocks/helpers/curry");
const setProp = require("crocks/helpers/setProp");

const { BigDecimal } = require("bigdecimal");

// bigDecimal :: String -> BigDecimal
const bigDecimal = (value) => new BigDecimal(value)

// givenToken :: String -> Token
const givenToken = curry((type, value) => ({
	type,
	input: value,
	position: -1
}))

// givenNumberToken :: String -> NumberToken
const givenNumberToken =
	converge(
		setProp("number"),
		bigDecimal,
		givenToken("NumberToken")
	)

// givenOperatorToken = String -> OperatorToken
const givenOperatorToken = givenToken("OperatorToken")

module.exports = {
	givenNumberToken,
	givenOperatorToken
}
