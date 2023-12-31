import type { MotionExport } from "./types";
import { PolymorphicMotionFactory } from "./factory";

export const Motion: MotionExport = new Proxy(Object.create(null), {
	get: <T extends keyof React.JSX.IntrinsicElements>(_: never, as: T) =>
		PolymorphicMotionFactory({ as }),
});
