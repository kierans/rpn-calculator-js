"use strict";

const constant = require("crocks/combinators/constant");

const { BigDecimal } = require("bigdecimal");

// givenNumberOperation :: String -> Operation
const givenNumberOperation = (value) => ({
	value: constant(new BigDecimal(value)),
	undo: constant([]),
	asExpression: constant(value)
})

module.exports = {
	givenNumberOperation
}
