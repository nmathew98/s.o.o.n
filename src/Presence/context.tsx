import React from "react";

interface PresenceContext {
	registerPresence: (id: string) => void;
	isExiting: (id?: string) => void;
	isDoneExiting: (id?: string) => void;
	currentState: (id?: string) => boolean | null;
}

export const PresenceContext = React.createContext<PresenceContext>(
	Object.create(null),
);

export const PresenceProvider: React.FC<React.PropsWithChildren> = ({
	children,
}) => {
	const states = React.useRef(new Map<string, boolean>());

	const context = React.useMemo(
		() => ({
			registerPresence: (id: string) => states.current.set(id, false),
			isExiting: (id?: string) => {
				if (id) {
					states.current.set(id, true);
				}
			},
			isDoneExiting: (id?: string) => {
				if (id) {
					states.current.set(id, false);
				}
			},
			currentState: (id?: string) =>
				id && states.current.has(id) ? Boolean(states.current.get(id)) : null,
		}),
		[],
	);

	return (
		<PresenceContext.Provider value={context}>
			{children}
		</PresenceContext.Provider>
	);
};
