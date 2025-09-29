"use strict";

const binary = require("crocks/helpers/binary");
const compose = require("crocks/helpers/compose");
const map = require("crocks/pointfree/map");
const tryCatch = require("crocks/Result/tryCatch");

const { BigDecimal } = require("bigdecimal");

// addition :: BigDecimal -> BigDecimal -> Result IllegalArithmeticOperationError BigDecimal
const addition = binary(tryCatch((a, b) => b.add(a)))

// decimalToDouble :: BigDecimal -> Double
const decimalToDouble = (a) => a.doubleValue()

// decimalToString :: BigDecimal -> String
const decimalToString = (a) => a.toString()

// division :: BigDecimal -> BigDecimal -> Result IllegalArithmeticOperationError BigDecimal
const division = binary(tryCatch((a, b) => b.divide(a)))

// multiplication :: BigDecimal -> BigDecimal -> Result IllegalArithmeticOperationError BigDecimal
const multiplication = binary(tryCatch((a, b) => b.multiply(a)))

// newBigDecimal :: a -> BigDecimal
const newBigDecimal = (a) => new BigDecimal(a)

// squareRoot :: BigDecimal -> Result IllegalArithmeticOperationError BigDecimal
const squareRoot = compose(map(newBigDecimal), tryCatch(Math.sqrt), decimalToDouble)

// subtraction :: BigDecimal -> BigDecimal -> Result IllegalArithmeticOperationError BigDecimal
const subtraction = binary(tryCatch((a, b) => b.subtract(a)))

module.exports = {
	addition,
	decimalToDouble,
	decimalToString,
	division,
	multiplication,
	newBigDecimal,
	squareRoot,
	subtraction
}
