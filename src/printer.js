"use strict";

const reduce = require("crocks/pointfree/reduce");

// printlns :: Writable -> List String -> Unit
const printlns = (output) =>
	reduce((_, line) => output.write(`${line}\n`), null)

module.exports = {
	printlns,
}
