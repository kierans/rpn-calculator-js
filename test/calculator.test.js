"use strict";

const { assertThat, equalTo, hasItem, is } = require("hamjest");

const { calculate } = require("../src/calculator");

describe("Calculator", function() {
	it("should return stack contents", function() {
		const result = calculate([])("1 2 +").log().toArray();

		assertThat(result.length, is(1));
		assertThat(result, hasItem(equalTo("stack: 3")));
	});

	it("should return error and stack contents", function() {
		const data = "1 0 /";
		const result = calculate([])(data).log().toArray();

		assertThat(result.length, is(2));
		assertThat(result, hasItem(equalTo(`operation '${data}' is illegal`)));
		assertThat(result, hasItem(equalTo("stack: 1 0")));
	});
});
