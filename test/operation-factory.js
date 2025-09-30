"use strict";

const constant = require("crocks/combinators/constant");

const { newDecimal } = require("../src/decimal");

// givenNumberOperation :: String -> Operation
const givenNumberOperation = (value) => ({
	value: constant(newDecimal(value)),
	undo: constant([]),
	asExpression: constant(value)
})

module.exports = {
	givenNumberOperation
}
