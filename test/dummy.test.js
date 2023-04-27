"use strict";

const { assertThat, is } = require("hamjest");

describe("Dummy test", function() {
	it("should pass", function() {
		assertThat(true, is(true));
	});
});
