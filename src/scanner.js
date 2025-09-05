"use strict";

/*
 * Mimics the java.util.Scanner for easier comparison
 */
const readline = require('node:readline');

const Async = require("crocks/Async");

// readLineAsync :: InterfaceConstructor -> () -> Async Error String
const readLineAsync = (input) => () =>
	Async((reject, resolve) => {
		input.once("line", resolve);
	})

// nextLine :: Readable -> () -> Async Error String
const nextLine = (input) =>
	readLineAsync(readline.createInterface({ input }));

module.exports = {
	nextLine
}
