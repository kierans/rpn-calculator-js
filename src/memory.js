"use strict";

const Pair = require("crocks/Pair");
const Result = require("crocks/Result");

const applyTo = require("crocks/combinators/applyTo");
const bichain = require("crocks/pointfree/bichain");
const binary = require("crocks/helpers/binary");
const chain = require("crocks/pointfree/chain");
const coalesce = require("crocks/pointfree/coalesce");
const compose = require("crocks/helpers/compose");
const composeB = require("crocks/combinators/composeB");
const concat = require("crocks/pointfree/concat");
const constant = require("crocks/combinators/constant");
const contramap = require("crocks/pointfree/contramap");
const curry = require("crocks/helpers/curry");
const either = require("crocks/pointfree/either");
const flip = require("crocks/combinators/flip");
const identity = require("crocks/combinators/identity");
const map = require("crocks/pointfree/map");
const merge = require("crocks/pointfree/merge");
const pipe = require("crocks/helpers/pipe");
const promap = require("crocks/pointfree/promap");
const substitution = require("crocks/combinators/substitution");

const { getProp } = require("@epistemology-factory/crocks-ext/Result");
const { pluck } = require("@epistemology-factory/crocks-ext/Record");
const { take } = require("@epistemology-factory/crocks-ext/helpers/lists");

const { Operators, Types, Commands } = require("./tokens");
const { illegalStateError, insufficientOperatorParametersError, invalidInputError } = require("./errors");
const { arithmeticOperation, pushNumberOperation } = require("./operations");
const { opUndo } = require("./operation");
const { pop } = require("./array");

/*
 * Adds operations to the stack by adding (unshift) to the top (front) of the array.
 * When operations are taken (shift) from the stack, they are in the correct order for
 * evaluation as left-right they represent the order the operations were added to the
 * stack.
 */
// pushOperation :: [Operation] -> Operation -> Result Unit [Operation]
const pushOperation = compose(promap(Array.of, Result.Ok), concat)

// calculatorErrorToCalculation :: CalculatorError -> Calculation
const calculatorErrorToCalculation = binary(compose(Result.Err, Pair))

/*
 * Returns a Calculation that allows the undoing of the illegal arithmetic operation.
 */
// illegalArithmeticOperationErrorToCalculation :: IllegalArithmeticOperationError -> Calculation
const illegalArithmeticOperationErrorToCalculation =
	substitution(compose(contramap, concat, pluck("operands")), calculatorErrorToCalculation)

 // insufficientOperatorParametersResult :: Token -> Calculation
const insufficientOperatorParametersResult =
	compose(calculatorErrorToCalculation, insufficientOperatorParametersError)

// lookupInTable :: (a -> IllegalStateError) -> Table b -> String -> Result (a -> IllegalStateError) b
const lookupInTable = compose(flip, getProp, constant)

// lookupErrorToCalculation :: (a -> CalculatorError) -> a -> Calculation
const lookupErrorToCalculation = composeB(calculatorErrorToCalculation)

// lookupResultToCalculation :: (Result (Token -> IllegalStateError) (Token -> Calculation)) -> (Token -> Calculation)
const lookupResultToCalculation = either(lookupErrorToCalculation, identity)

// lookupCalculationForToken :: (Token -> Result (Token -> IllegalStateError) (Token -> Calculation)) -> Token -> Calculation
const lookupCalculationForToken =
	compose(substitution(applyTo), composeB(lookupResultToCalculation))

// arithmeticOperationResultToCalculation :: (Result IllegalArithmeticOperationError Operation) -> Calculation
const arithmeticOperationResultToCalculation =
	either(illegalArithmeticOperationErrorToCalculation, flip(pushOperation))

// doArithmeticOperation :: OperatorToken -> Calculation
const doArithmeticOperation =
	compose(map(arithmeticOperationResultToCalculation), arithmeticOperation)

// doOperandOperation :: Integer -> OperatorToken -> Calculation
const doOperandOperation = curry((n, token) =>
	pipe(
		take(n), // -> Result [Operation] (Pair [Operation] [Operation])
		map(map(doArithmeticOperation(token))), // -> Result [Operation] (Pair [Operation] Calculation)
		bichain(insufficientOperatorParametersResult(token), merge(applyTo)) // -> Result CalculationError [Operation]
	)
)

// doUniOperandOperation :: OperatorToken -> Calculation
const doUniOperandOperation = doOperandOperation(1)

// doBiOperandOperation :: OperatorToken -> Calculation
const doBiOperandOperation = doOperandOperation(2)

/*
 * operations :: {
 * 	[Operator]: OperatorToken -> Calculation
 * }
 */
const operations = {
	[Operators.SQUARE_ROOT]: doUniOperandOperation,
	[Operators.ADDITION]: doBiOperandOperation,
	[Operators.SUBTRACTION]: doBiOperandOperation,
	[Operators.MULTIPLICATION]: doBiOperandOperation,
	[Operators.DIVISION]: doBiOperandOperation
}

// operationLookupError :: Token -> IllegalStateError
const operationLookupError = ({ input }) => illegalStateError(`Can't handle operator '${input}'`)

// lookupOperationForOperator :: OperatorToken -> Result (Token -> IllegalStateError) (Token -> Calculation)
const lookupOperationForOperator =
	compose(lookupInTable(operationLookupError)(operations), pluck("input"))

// clearStack :: CommandToken -> Calculation
const clearStack = constant(constant(Result.Ok([])))

// undoOperation :: CommandToken -> Calculation
const undoOperation = constant(pipe(
	take(1), // -> Result [Operation] (Pair [Operation] [Operation])
	coalesce(identity, compose(merge(concat), map(compose(opUndo, pop)))) // -> Result Unit [Operation]
))

/*
 * commands :: {
 * 	[Command]: CommandToken -> Calculation
 * }
 */
const commands = {
	[Commands.CLEAR]: clearStack,
	[Commands.UNDO]: undoOperation
}

// commandLookupError :: Token -> IllegalStateError
const commandLookupError = ({ input }) => illegalStateError(`Can't handle command '${input}'`)

// lookupCommandForOperator :: CommandToken -> Result (Token -> IllegalStateError) (Token -> Calculation)
const lookupCommandForOperator =
	compose(lookupInTable(commandLookupError)(commands), pluck("input"))

// pushCommandToken :: CommandToken -> Calculation
const pushCommandToken = lookupCalculationForToken(lookupCommandForOperator)

// pushCommandToken :: InvalidInputToken -> Calculation
const pushInvalidInputToken = compose(calculatorErrorToCalculation, invalidInputError)

// pushNumberToken :: NumberToken -> Calculation
const pushNumberToken = curry((token, stack) =>
	chain(pushOperation(stack), pushNumberOperation(token))
)

// pushOperatorToken :: OperatorToken -> Calculation
const pushOperatorToken = lookupCalculationForToken(lookupOperationForOperator)

/*
 * tokens :: {
 * 	[Type]: Token -> Calculation
 * }
 */
const tokens = {
	[Types.COMMAND]: pushCommandToken,
	[Types.INVALID_INPUT]: pushInvalidInputToken,
	[Types.NUMBER]: pushNumberToken,
	[Types.OPERATOR]: pushOperatorToken,
}

// tokenLookupError :: Token -> IllegalStateError
const tokenLookupError = ({ type }) => illegalStateError(`Can't handle token of type ${type}`)

// lookupCalculationForTokenType :: Token -> Result (Token -> IllegalStateError) (Token -> Calculation)
const lookupCalculationForTokenType = compose(lookupInTable(tokenLookupError)(tokens), pluck("type"))

// push :: Token -> Calculation
const push = lookupCalculationForToken(lookupCalculationForTokenType)

module.exports = {
	push
}
