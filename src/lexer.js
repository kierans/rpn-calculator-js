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
const evalWith = require("crocks/State/evalWith");
const fst = require("crocks/Pair/fst");
const liftA2 = require("crocks/helpers/liftA2");
const map = require("crocks/pointfree/map");
const mreduce = require("crocks/helpers/mreduce");
const objOf = require("crocks/helpers/objOf");
const option = require("crocks/pointfree/option");
const reduce = require("crocks/pointfree/reduce");
const resultToMaybe = require("crocks/Maybe/resultToMaybe");
const snd = require("crocks/Pair/snd");
const substitution = require("crocks/combinators/substitution");
const tryCatch = require("crocks/Result/tryCatch");
const valueOf = require("crocks/pointfree/valueOf");

const { add } = require("@epistemology-factory/crocks-ext/math");
const { applyFunctor } = require("@epistemology-factory/crocks-ext/helpers");
const { length, split }  = require("@epistemology-factory/crocks-ext/String");
const { pluck } = require("@epistemology-factory/crocks-ext/Record");

const { Types, commandFromValue, operatorFromValue } = require("./tokens");
const { newBigDecimal } = require("./decimal");

// newPair :: a -> b -> Pair a b
const newPair = binary(Pair);

// emptyTokenStack :: Pair Sum [Token]
const emptyTokenStack = Pair(Sum(1), [])

// tokenType :: String -> Object
const tokenType = objOf("type")

// parseNumber :: a -> Maybe BigDecimal
const parseNumber = resultToMaybe(tryCatch(newBigDecimal))

// parseNumberToken :: String -> Maybe Object
const parseNumberToken = compose(map(objOf("number")), parseNumber)

// isCommandToken :: String -> Maybe Object
const isCommandToken =
	compose(map(constant(tokenType(Types.COMMAND))), commandFromValue)

// isNumberToken :: String -> Maybe Object
const isNumberToken =
	compose(map(assign(tokenType(Types.NUMBER))), parseNumberToken)

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

// matchFirstTokenTypeForWord :: String -> Object
const matchFirstTokenTypeForWord =
	compose(option(tokenType(Types.INVALID_INPUT)), matchFirstTokenType)

// matchFirstTokenTypeForInput :: Object -> Object
const matchFirstTokenTypeForInput = compose(matchFirstTokenTypeForWord, pluck("input"))

// determineTokenType :: Object -> Token
const determineTokenType = substitution(assign, matchFirstTokenTypeForInput)

// newToken :: String -> Number -> Token
const newToken = curry((input, position) =>
	determineTokenType({
		input,
		position
	})
)

// wordLength :: String -> Number
const wordLength =
	// add one to cater for the ' '
	compose(add(1), length)

// currentPosInStream :: Pair Sum [Token] -> Number
const currentPosInStream = compose(valueOf, fst)

// getWordLength :: String -> State (Pair Sum [Token]) Number
const getWordLength = compose(State.get, constant, wordLength)

// getTokenFromWord :: String -> State (Pair Sum [Token]) Token
const getTokenFromWord = (word) =>
	State.get(compose(newToken(word), currentPosInStream))

// matchWord :: String -> State (Pair Sum [Token]) (Pair Number Token)
const matchWord = converge(liftA2(newPair), getWordLength, getTokenFromWord)

// pushToken :: Pair Number Token -> State (Pair Sum [Token]) Pair Sum [Token]
const pushToken = compose(State.get, concat, bimap(Sum, Array.of))

// createTokenFromWord :: String -> State (Pair Sum [Token]) (Pair Sum [Token])
const createTokenFromWord = composeK(pushToken, matchWord)

// tokeniseWord :: Pair Sum [Token] -> String -> Pair Sum [Token]
const tokeniseWord = curry(compose(contramap(createTokenFromWord), evalWith))

// tokeniseWords :: [String] -> [Token]
const tokeniseWords = compose(snd, reduce(tokeniseWord, emptyTokenStack))

// splitIntoWords :: String -> [String]
const splitIntoWords = split(" ")

// tokenise :: String -> Result Unit [Token]
const tokenise = compose(Result.Ok, tokeniseWords, splitIntoWords)

module.exports = {
	tokenise
}
