"use strict";

const { Writable } = require("node:stream");

const arrayToList = require("crocks/List/arrayToList");

const { assertThat, equalTo } = require("hamjest");

const { printlns } = require("../src/printer");

describe("Printer", function() {
	describe("printlns", function() {
		const lines = [
			"Hello",
			"World"
		]

		let stream
		let writer;

		beforeEach(function() {
			stream = new CollectorStream();
			writer = printlns(stream);
		})

		it("should write lines to stream", function() {
			writer(arrayToList(lines));

			assertThat(stream.lines, equalTo(addNewLine(lines)));
		})
	});
});

// addNewLine :: [String] -> [String]
const addNewLine = (lines) => lines.map((line) => `${line}\n`);

class CollectorStream extends Writable {
	constructor() {
		super({
			defaultEncoding: "utf8",
			decodeStrings: false,
		});

		this.lines = [];
	}

	_write(chunk, encoding, callback) {
		this.lines.push(chunk);

		callback();
	}
}
