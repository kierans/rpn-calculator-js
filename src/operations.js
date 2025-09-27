"use strict";

const Result = require("crocks/Result");
const State = require("crocks/State");

const ap = require("crocks/pointfree/ap");
const applyTo = require("crocks/combinators/applyTo");
const chain = require("crocks/pointfree/chain");
const compose = require("crocks/helpers/compose");
const constant = require("crocks/combinators/constant");
const curry = require("crocks/helpers/curry");
const either = require("crocks/pointfree/either");
const identity = require("crocks/combinators/identity");
const flip = require("crocks/combinators/flip");
const liftA3 = require("crocks/helpers/liftA3");
const map = require("crocks/pointfree/map");
const mapReduce = require("crocks/helpers/mapReduce");
const promap = require("crocks/pointfree/promap");
const substitution = require("crocks/combinators/substitution");

const { evalUsing } = require("@epistemology-factory/crocks-ext/State");
const { getProp } = require("@epistemology-factory/crocks-ext/Result");
const { pluck } = require("@epistemology-factory/crocks-ext/Record");

const { Operators } = require("./tokens");
const {
	addition,
	division,
	multiplication,
	squareRoot,
	subtraction
} = require("./decimal");
const { illegalStateError } = require("./errors");
const {
	opValue,
	toIllegalArithmeticOperationError,
	toOperation,
	toOperationExpression
} = require("./operation");

/*
 * operators :: {
 * 	[Operator]: * -> Result IllegalArithmeticOperationError BigDecimal
 * }
 */
const operators = {
	[Operators.SQUARE_ROOT]: squareRoot,
	[Operators.ADDITION]: addition,
	[Operators.DIVISION]: division,
	[Operators.MULTIPLICATION]: multiplication,
	[Operators.SUBTRACTION]: subtraction
}

// pa :: Applicative m => m (a -> b) -> m a -> m b
const pa = flip(ap)

// unwrap :: Chainable m => m (m a) -> m a
const unwrap = chain(identity)

/*
 * Based on the computation result, return a function that will return the final operation result.
 */
// computationResultToOperationResult :: Result a BigDecimal -> [Operation] -> String -> Result IllegalArithmeticOperationError Operation
const computationResultToOperationResult = either(toIllegalArithmeticOperationError, toOperation)

// lookupInTable :: (String -> IllegalStateError) -> Table a -> String -> Result IllegalStateError a
const lookupInTable = compose(flip, getProp)

// operatorsLookupError :: String -> IllegalStateError
const operatorsLookupError = (input) => illegalStateError(`Can't operate on op '${input}'`)

// lookupInOperatorsTableForToken :: Token -> Result IllegalStateError (* -> Result IllegalArithmeticOperationError BigDecimal)
const lookupInOperatorsTableForToken =
	compose(lookupInTable(operatorsLookupError)(operators), pluck("input"))

// computeValue :: (* -> Result IllegalArithmeticOperationError BigDecimal) -> State [Operation] Result CalculatorError BigDecimal
const computeValue = compose(State.get, mapReduce(opValue, flip(applyTo)))

// getOperands :: Token -> State [Operation]
const getOperands = constant(State.get())

// getOperationExpression :: Token -> State [Operation] String
const getOperationExpression = compose(State.get, toOperationExpression)

// doOperation :: Token -> (* -> Result IllegalArithmeticOperationError BigDecimal) -> ([Operation] -> Result IllegalArithmeticOperationError BigDecimal)
const doOperation = curry((token, op) =>
	evalUsing(liftA3(
		computationResultToOperationResult,
		computeValue(op),
		getOperands(token),
		getOperationExpression(token)
	))
)

// lookupOperatorForToken :: Token -> Result IllegalStateError ([Operation] -> Result IllegalArithmeticOperationError BigDecimal)
const lookupOperatorForToken =
	substitution(compose(map, doOperation), lookupInOperatorsTableForToken)

// arithmeticOperation :: OperatorToken -> [Operation] -> Result CalculatorError Operation
const arithmeticOperation =
	// need to unwrap the inner Result
	compose(promap(Result.Ok, unwrap), pa, lookupOperatorForToken)

// pushNumberOperation :: NumberToken -> Result CalculatorError Operation
const pushNumberOperation = ({ input, number }) =>
	toOperation(number, [], input)

module.exports = {
	arithmeticOperation,
	pushNumberOperation
}
