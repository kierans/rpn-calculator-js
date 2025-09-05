"use strict";

const { Readable } = require("node:stream");

const { assertThat, equalTo, is } = require("hamjest");

const { nextLine } = require("../src/scanner");

describe("Scanner", function() {
	describe("nextLine", function() {
		const line = "Hello World";
		let reader;

		beforeEach(function() {
			reader = nextLine(newReader(line));
		});

		it("should read line from stream", async function() {
			const result = await reader().toPromise();

			assertThat(result, is(equalTo(line)));
		})
	});
});


const newReader = (data) =>
	new Readable({
		read() {
			this.push(data);
			this.push("\n");
			this.push(null);
		}
	})
