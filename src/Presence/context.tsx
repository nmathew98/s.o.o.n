import React from "react";

export const PresenceContext = React.createContext(Object.create(null));

export const PresenceProvider: React.FC<React.PropsWithChildren> = ({
	children,
}) => {
	const [areChildrenExiting, setAreChildrenExiting] = React.useState(false);

	const context = React.useMemo(
		() => ({
			areChildrenExiting,
			isExiting: () => setAreChildrenExiting(true),
			doneExiting: () => setAreChildrenExiting(false),
		}),
		[areChildrenExiting, setAreChildrenExiting],
	);

	return (
		<PresenceContext.Provider value={context}>
			{children}
		</PresenceContext.Provider>
	);
};
