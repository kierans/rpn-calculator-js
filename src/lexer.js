"use strict";

const First = require("crocks/First");
const Pair = require("crocks/Pair");
const Result = require("crocks/Result");
const State = require("crocks/State");
const Sum = require("crocks/Sum");

const assign = require("crocks/helpers/assign");
const bimap = require("crocks/pointfree/bimap");
const compose = require("crocks/helpers/compose");
const concat = require("crocks/pointfree/concat");
const constant = require("crocks/combinators/constant");
const contramap = require("crocks/pointfree/contramap");
const curry = require("crocks/helpers/curry");
const evalWith = require("crocks/State/evalWith");
const fst = require("crocks/Pair/fst");
const map = require("crocks/pointfree/map");
const mreduce = require("crocks/helpers/mreduce");
const objOf = require("crocks/helpers/objOf");
const option = require("crocks/pointfree/option");
const partial = require("crocks/helpers/partial");
const pipe = require("crocks/helpers/pipe");
const pipeK = require("crocks/helpers/pipeK");
const reduce = require("crocks/pointfree/reduce");
const resultToMaybe = require("crocks/Maybe/resultToMaybe");
const snd = require("crocks/Pair/snd");
const tryCatch = require("crocks/Result/tryCatch");
const valueOf = require("crocks/pointfree/valueOf");

const { BigDecimal } = require("bigdecimal");

const { add } = require("@epistemology-factory/crocks-ext/math");
const { applyFunctor } = require("@epistemology-factory/crocks-ext/helpers");
const { length } = require("@epistemology-factory/crocks-ext/helpers/lists");
const { split }  = require("@epistemology-factory/crocks-ext/String");

const { Types, commandFromValue, operatorFromValue } = require("./tokens");

// emptyTokenStack :: Pair Sum [Token]
const emptyTokenStack = Pair(Sum(1), [])

// tokenType :: String -> Object
const tokenType = objOf("type")

// newBigDecimal :: a -> BigDecimal
const newBigDecimal = (a) => new BigDecimal(a)

// parseNumber :: a -> Maybe BigDecimal
const parseNumber =
	resultToMaybe(tryCatch(newBigDecimal))

// isCommandToken :: String -> Maybe Object
const isCommandToken =
	compose(map(constant(tokenType(Types.COMMAND))), commandFromValue)

// isNumberToken :: String -> Maybe Object
const isNumberToken =
	pipe(
		parseNumber,
		map(compose(assign(tokenType(Types.NUMBER)), objOf("number")))
	)

// isOperatorToken :: String -> Maybe Object
const isOperatorToken =
	compose(map(constant(tokenType(Types.OPERATOR))), operatorFromValue)

// determineTokenType :: String -> Object
const determineTokenType =
	pipe(
		compose(mreduce(First), applyFunctor([
			isCommandToken,
			isOperatorToken,
			isNumberToken
		])),
		option(tokenType(Types.INVALID_INPUT))
	)

// newToken :: String -> Number -> Token
const newToken = curry((token, pos) =>
	assign(determineTokenType(token), {
		input: token,
		position: pos
	})
)

// wordLength :: String -> Number
const wordLength =
	// add one to cater for the ' '
	compose(add(1), length)

// wordPos :: Pair Sum [Token] -> Number
const wordPos =
	compose(valueOf, fst)

// consumeWord :: String -> State (Pair Sum [Token]) (Pair Number Token)
const consumeWord = (word) =>
	State.get(pipe(
		compose(newToken(word), wordPos),
		partial(Pair, wordLength(word))
	))

// pushToken :: Pair Number Token -> State (Pair Sum [Token])
const pushToken =
	compose(State.get, concat, bimap(Sum, Array.of))

// lexToken :: String -> State (Pair Sum [Token])
const lexToken =
	pipeK(
		consumeWord,
		pushToken
	)

// tokeniseWord :: Pair Sum [Token] -> String -> Pair Sum [Token]
const tokeniseWord =
	curry(compose(contramap(lexToken), evalWith))

// tokeniseWords :: [String] -> [Token]
const tokeniseWords =
	compose(snd, reduce(tokeniseWord, emptyTokenStack))

// splitIntoWords :: String -> [String]
const splitIntoWords = split(" ")

// tokenise :: String -> Result [Token]
const tokenise =
	compose(Result.Ok, tokeniseWords, splitIntoWords)

module.exports = {
	tokenise
}
