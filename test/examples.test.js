"use strict";

const { identity } = require("crocks");

const { calculate } = require("../src/calculator");
const { assertThat, hasItem } = require("hamjest");

describe("Examples", function() {
	it("example1", function() {
		const [ log, _ ] = calc([])("5 2");

		assertThat(log, hasItem("stack: 5 2"));
	});

	it("example2", function() {
		let [ log, stack ] = calc([])("2 sqrt");
		assertThat(log, hasItem("stack: 1.4142135624"));

		[ log ] = calc(stack)("clear 9 sqrt");
		assertThat(log, hasItem("stack: 3"));
	});

	it("example3", () => {
		let [ log, stack ] = calc([])("5 2 -");
		assertThat(log, hasItem("stack: 3"));

		[ log, stack ] = calc(stack)("3 -");
		assertThat(log, hasItem("stack: 0"));

		[ log ] = calc(stack)("clear");
		assertThat(log, hasItem("stack: "));
	});

	it("example4", () => {
		let [ log, stack ] = calc([])("5 4 3 2");
		assertThat(log, hasItem("stack: 5 4 3 2"));

		[ log, stack ] = calc(stack)("undo undo *");
		assertThat(log, hasItem("stack: 20"));

		[ log, stack ] = calc(stack)("5 *");
		assertThat(log, hasItem("stack: 100"));

		[ log ] = calc(stack)("undo");
		assertThat(log, hasItem("stack: 20 5"));
	});

	it("example5", () => {
		let [ log, stack ] = calc([])("7 12 2 /");
		assertThat(log, hasItem("stack: 7 6"));

		[ log, stack ] = calc(stack)("*");
		assertThat(log, hasItem("stack: 42"));

		[ log ] = calc(stack)("4 /");
		assertThat(log, hasItem("stack: 10.5"));
	});

	it("example6", () => {
		let [ log, stack ] = calc([])("1 2 3 4 5");
		assertThat(log, hasItem("stack: 1 2 3 4 5"));

		[ log, stack ] = calc(stack)("*");
		assertThat(log, hasItem("stack: 1 2 3 20"));

		[ log ] = calc(stack)("clear 3 4 -");
		assertThat(log, hasItem("stack: -1"));
	});

	it("example7", () => {
		let [ log, stack ] = calc([])("1 2 3 4 5");
		assertThat(log, hasItem("stack: 1 2 3 4 5"));

		[ log ] = calc(stack)("* * * *");
		assertThat(log, hasItem("stack: 120"));
	});

	it("example8", () => {
		const [ log ] = calc([])("1 2 3 * 5 + * * 6 5");
		assertThat(log, hasItem("operator * (position: 15): insufficient parameters"));

		// the 6 and 5 were not pushed on to the stack due to the error
		assertThat(log, hasItem("stack: 11"));
	});

	// calc :: [Operation] -> String -> [ [String], [Operation] ]
	const calc = (stack) => (input) =>
		calculate(stack)(input)
			.read()
			.bimap((a) => a.toArray(), identity)
			.toArray();
});
