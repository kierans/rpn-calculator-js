"use strict";

const Result = require("crocks/Result");

const compose = require("crocks/helpers/compose");
const compose2 = require("crocks/combinators/compose2");
const constant = require("crocks/combinators/constant");
const curry = require("crocks/helpers/curry");
const ifElse = require("crocks/logic/ifElse");
const flip = require("crocks/combinators/flip");
const option = require("crocks/pointfree/option");

const { isGreaterThan } = require("@epistemology-factory/crocks-ext/predicates");
const { joinPair } = require("@epistemology-factory/crocks-ext/String");
const { length } = require("@epistemology-factory/crocks-ext/helpers/lists");
const { mapCollectRight } = require("@epistemology-factory/crocks-ext/pointfree/collect");

const { decimalToString } = require("./decimal");
const { illegalArithmeticOperationError } = require("./errors");
const { pop } = require("./array");

/**
 * Records the details of an operation in the calculator.
 *
 * This uses the concept of a Protocol or Interface to define the type as a mandatory collection
 * of named functions (methods). Each instance (implementation) of the Protocol must implement
 * all the functions defined in the Protocol. This allows many different Operations to be defined
 * while allowing functions to be applied to them in a type-safe manner.
 *
 * Operation :: {
 *   value :: () -> Decimal
 *   undo :: () -> [Operation]
 *   asExpression :: () -> String
 * }
 */

// opUndo :: Operation -> [Operation]
const opUndo = (operation) => operation.undo()

// opValue :: Operation -> Decimal
const opValue = (operation) => operation.value()

// opValueAsString :: Operation -> String
const opValueAsString = compose(decimalToString, opValue)

// operandsToExpression :: [Operation] -> String
const operandsToExpression =
	ifElse(
		compose(isGreaterThan(1), length),
		compose(option(""), mapCollectRight(opValueAsString, joinPair(" "))),
		compose(opValueAsString, pop)
	)

// tokenToExpression :: Token -> String
const tokenToExpression = ({ input }) => input

// toIllegalArithmeticOperationError :: e -> [Operation] -> String -> Result IllegalArithmeticOperationError Unit
const toIllegalArithmeticOperationError = constant((operands) => (expression) =>
	Result.Err(illegalArithmeticOperationError(expression)(operands))
)

// toOperation :: Decimal -> [Operation] -> String -> Result Unit Operation
const toOperation = curry((value, operands, expression) =>
	Result.Ok({
		value: constant(value),
		undo: constant(operands),
		asExpression: constant(expression)
	})
)

// toOperationExpression :: Token -> [Operation] -> String
const toOperationExpression =
	compose2(flip(joinPair(" ")))(tokenToExpression)(operandsToExpression)

module.exports = {
	opUndo,
	opValue,
	opValueAsString,
	toIllegalArithmeticOperationError,
	toOperation,
	toOperationExpression
}
