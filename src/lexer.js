"use strict";

const First = require("crocks/First");
const Pair = require("crocks/Pair");
const Result = require("crocks/Result");
const State = require("crocks/State");
const Sum = require("crocks/Sum");

const assign = require("crocks/helpers/assign");
const bimap = require("crocks/pointfree/bimap");
const binary = require("crocks/helpers/binary");
const compose = require("crocks/helpers/compose");
const composeK = require("crocks/helpers/composeK");
const concat = require("crocks/pointfree/concat");
const constant = require("crocks/combinators/constant");
const contramap = require("crocks/pointfree/contramap");
const converge = require("crocks/combinators/converge");
const curry = require("crocks/helpers/curry");
const execWith = require("crocks/State/execWith");
const fst = require("crocks/Pair/fst");
const liftA2 = require("crocks/helpers/liftA2");
const map = require("crocks/pointfree/map");
const mreduce = require("crocks/helpers/mreduce");
const objOf = require("crocks/helpers/objOf");
const option = require("crocks/pointfree/option");
const pipe = require("crocks/helpers/pipe");
const reduce = require("crocks/pointfree/reduce");
const resultToMaybe = require("crocks/Maybe/resultToMaybe");
const snd = require("crocks/Pair/snd");
const tryCatch = require("crocks/Result/tryCatch");
const valueOf = require("crocks/pointfree/valueOf");

const { BigDecimal } = require("bigdecimal");

const { add } = require("@epistemology-factory/crocks-ext/math");
const { applyFunctor } = require("@epistemology-factory/crocks-ext/helpers");
const { length, split }  = require("@epistemology-factory/crocks-ext/String");

const { Types, commandFromValue, operatorFromValue } = require("./tokens");

// emptyTokenStack :: Pair Sum [Token]
const emptyTokenStack = Pair(Sum(1), [])

// tokenType :: String -> Object
const tokenType = objOf("type")

// newBigDecimal :: a -> BigDecimal
const newBigDecimal = (a) => new BigDecimal(a)

// parseNumber :: a -> Maybe BigDecimal
const parseNumber = resultToMaybe(tryCatch(newBigDecimal))

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

// matchFirstTokenType :: String -> Maybe Object
const matchFirstTokenType =
	compose(mreduce(First), applyFunctor([
		isCommandToken,
		isOperatorToken,
		isNumberToken
	]))

// determineTokenType :: String -> Object
const determineTokenType =
	compose(option(tokenType(Types.INVALID_INPUT)), matchFirstTokenType)

// newToken :: String -> Number -> Token
const newToken = curry((token, pos) =>
	assign(determineTokenType(token), {
		input: token,
		position: pos
	})
)

// wordLengthInStream :: String -> Number
const wordLengthInStream =
	// add one to cater for the ' '
	compose(add(1), length)

// currentPosInStream :: Pair Sum [Token] -> Number
const currentPosInStream = compose(valueOf, fst)

// getWordLengthInStream :: String -> State (Pair Sum [Token]) Number
const getWordLengthInStream = compose(State.get, constant, wordLengthInStream)

// getTokenFromWord :: String -> State (Pair Sum [Token]) Token
const getTokenFromWord = (word) =>
	State.get(compose(newToken(word), currentPosInStream))

// consumeWord :: String -> State (Pair Sum [Token]) (Pair Number Token)
const consumeWord =
	converge(liftA2(binary(Pair)), getWordLengthInStream, getTokenFromWord)

// pushToken :: Pair Number Token -> State (Pair Sum [Token]) Unit
const pushToken = compose(State.modify, concat, bimap(Sum, Array.of))

// lexToken :: String -> State (Pair Sum [Token]) Unit
const lexToken = composeK(pushToken, consumeWord)

// tokeniseWord :: Pair Sum [Token] -> String -> Pair Sum [Token]
const tokeniseWord = curry(compose(contramap(lexToken), execWith))

// tokeniseWords :: [String] -> [Token]
const tokeniseWords = compose(snd, reduce(tokeniseWord, emptyTokenStack))

// splitIntoWords :: String -> [String]
const splitIntoWords = split(" ")

// tokenise :: String -> Result [Token]
const tokenise = compose(Result.Ok, tokeniseWords, splitIntoWords)

module.exports = {
	tokenise
}
