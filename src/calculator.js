"use strict";

const List = require("crocks/List");
const Writer = require("crocks/Writer");

const bimap = require("crocks/pointfree/bimap");
const binary = require("crocks/helpers/binary");
const compose = require("crocks/helpers/compose");
const composeB = require("crocks/combinators/composeB");
const composeK = require("crocks/helpers/composeK");
const either = require("crocks/pointfree/either");
const flip = require("crocks/combinators/flip");
const identity = require("crocks/combinators/identity");
const merge = require("crocks/pointfree/merge");
const substitution = require("crocks/combinators/substitution");

const { evaluateTokens } = require("./tokens");
const { formatError, formatStack } = require("./reporter");
const { push } = require("./memory");
const { tokenise } = require("./lexer");

/**
 * CalculationError :: Pair CalculatorError [Operation]
 *
 * CalculationResult :: Result CalculationError [Operation]
 *
 * Calculation :: [Operation] -> CalculationResult
 */

// ListWriter :: Writer (List a) b
const ListWriter = Writer(List);

// newListWriter :: a -> b -> Writer (List a) b
const newListWriter = binary(ListWriter);

// reportStack :: [Operation] -> Writer (List String) [Operation]
const reportStack =
	substitution(flip(newListWriter), formatStack)

// reportError :: Pair CalculatorError [Operation] -> Writer (List String) [Operation]
const reportError =
	compose(merge(newListWriter), bimap(formatError, identity))

// evaluateString :: [Operation] -> String -> CalculationResult
const evaluateString = (stack) =>
	composeK(evaluateTokens(push)(stack), tokenise)

// report :: CalculationResult -> Writer (List String) [Operation]
const report = either(composeK(reportStack, reportError), reportStack)

// calculate :: [Operation] -> String -> Writer (List String) [Operation]
const calculate = composeB(composeB(report), evaluateString)

module.exports = {
	calculate
}
