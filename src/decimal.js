"use strict";

const { BigDecimal } = require("bigdecimal");

// newBigDecimal :: a -> BigDecimal
const newBigDecimal = (a) => new BigDecimal(a)

module.exports = {
	newBigDecimal
}
