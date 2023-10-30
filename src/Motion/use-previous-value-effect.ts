import React from "react";

export const usePreviousValueEffect = (
	f: PreviousValueEffect,
	deps?: React.DependencyList,
) => {
	const previousDeps = React.useRef(deps);

	React.useEffect(() => {
		const cleanup = f(previousDeps.current, deps);

		previousDeps.current = deps;

		return cleanup;
	}, [f, deps]);
};

export type PreviousValueEffect = (
	from: React.DependencyList | undefined,
	to: React.DependencyList | undefined,
) => void | (() => void);
