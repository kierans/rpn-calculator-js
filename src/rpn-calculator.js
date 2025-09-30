"use strict";

const process = require("node:process");

const IO = require("crocks/IO");

const compose = require("crocks/helpers/compose");
const constant = require("crocks/combinators/constant");
const curry = require("crocks/helpers/curry");
const fst = require("crocks/Pair/fst");
const read = require("crocks/Writer/read");
const snd = require("crocks/Pair/snd");
const substitution = require("crocks/combinators/substitution");

const { calculate } = require("./calculator");
const { nextLine } = require("./scanner");
const { printlns } = require("./printer");

// log :: (List String -> Unit) -> Writer (List String) a -> a
const log = (output) =>
	compose(substitution(compose(constant, snd), compose(output, fst)), read)

// readLoop :: (() -> Async Error String) -> (List String -> Unit) -> [Operation] -> Unit
const readLoop = curry((input, output, stack) =>
	input()
		.map(compose(log(output), calculate(stack)))
		.fork(
			// unrecoverable error
			(e) => { throw e },
			readLoop(input)(output)
		)
)

// main :: (Readable, Writable) -> IO Unit
const main = (input, output) =>
	IO(() => readLoop(nextLine(input))(printlns(output))([]))

main(process.stdin, process.stdout).run();
