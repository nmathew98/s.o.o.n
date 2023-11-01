import type { KeyframesDefinition } from "../types";
import { describe, it } from "node:test";
import { merge } from ".";
import { deepEqual, strictEqual } from "node:assert";

describe("merge", () => {
	describe("should handle either parameters being undefined", () => {
		it("if `initial` is undefined, it should return `final`", () => {
			const final = Object.create(null);

			const result = merge(undefined, final);

			strictEqual(result, final);
		});

		it("if `final` is undefined, it should return `initial`", () => {
			const initial = Object.create(null);

			const result = merge(initial);

			strictEqual(result, initial);
		});

		it("if `initial` and `final` are undefined, it should return an empty object", () => {
			const result = merge();

			strictEqual(Object.keys(result).length, 0);
		});
	});

	describe("should merge arrays", () => {
		it("if `initial` and `final` both have arrays for the same key", () => {
			const a: KeyframesDefinition = {
				x: [0, 1],
			};
			const b: KeyframesDefinition = {
				x: [1, 0],
			};

			const result = merge(a, b);

			deepEqual(result.x, [0, 1, 1, 0]);
		});

		it("if `initial` or `final` have an array for the same key", () => {
			const a: KeyframesDefinition = {
				x: 0,
			};
			const b: KeyframesDefinition = {
				x: [0.2, 0.4, 0.6, 1],
			};

			const mergedAandB = merge(a, b);
			const mergedBandA = merge(b, a);

			deepEqual(mergedAandB.x, [0, 0.2, 0.4, 0.6, 1]);
			deepEqual(mergedBandA.x, [0.2, 0.4, 0.6, 1, 0]);
		});
	});

	it("should merge objects", () => {
		const a: Record<string, any> = {
			a: {
				b: 0,
			},
		};
		const b: Record<string, any> = {
			a: {
				b: [0.5, 1],
			},
		};

		const result = merge(a, b);

		deepEqual(result.a.b, [0, 0.5, 1]);
	});

	it("if `initial` and `final` have scalars for the same key", () => {
		const a: KeyframesDefinition = {
			x: 0,
		};
		const b: KeyframesDefinition = {
			x: 1,
		};

		const result = merge(a, b);

		deepEqual(result.x, [0, 1]);
	});

	it("if only either `initial` or `final` have a key defined", () => {
		const a: KeyframesDefinition = {
			x: 0,
		};
		const b: KeyframesDefinition = Object.create(null);

		const result = merge(a, b);

		deepEqual(result.x, 0);
	});

	it("should preserve keys which exist in `initial` but not `final`", () => {
		const a: KeyframesDefinition = {
			x: 0,
			y: 0,
		};
		const b: KeyframesDefinition = {
			y: 1,
		};

		const result = merge(a, b);

		strictEqual(result.x, 0);
	});
});
