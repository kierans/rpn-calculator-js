"use strict";

const Result = require("crocks/Result");

const binary = require("crocks/helpers/binary");
const ifElse = require("crocks/logic/ifElse");
const tryCatch = require("crocks/Result/tryCatch");

const { Decimal } = require("decimal.js");

// isInfinity :: Decimal -> Boolean
const isInfinity = (a) => !a.isFinite()

// checkForInfinity :: Decimal -> Result Error Decimal
const checkForInfinity =
	ifElse(isInfinity, () => Result.Err(new Error("Infinity result returned")), Result.Ok)

// addition :: Decimal -> Decimal -> Result IllegalArithmeticOperationError Decimal
const addition = binary(tryCatch((a, b) => b.add(a)))

// decimalToString :: Decimal -> String
const decimalToString = (a) => a.toString()

// division :: Decimal -> Decimal -> Result Error Decimal
const division = binary((a, b) => checkForInfinity(b.div(a)))

// multiplication :: Decimal -> Decimal -> Result Error Decimal
const multiplication = binary(tryCatch((a, b) => b.times(a)))

// newDecimal :: a -> Decimal
const newDecimal = (a) => new Decimal(a)

// squareRoot :: Decimal -> Result Error Decimal
const squareRoot = tryCatch((a) => a.sqrt())

// subtraction :: Decimal -> Decimal -> Result Error Decimal
const subtraction = binary(tryCatch((a, b) => b.minus(a)))

module.exports = {
	addition,
	decimalToString,
	division,
	multiplication,
	newDecimal,
	squareRoot,
	subtraction
}
