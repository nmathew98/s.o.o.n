import React from "react";

export const PresenceContext = React.createContext(Object.create(null));

export const PresenceProvider: React.FC<React.PropsWithChildren> = ({
	children,
}) => {
	const areChildrenExiting = React.useRef(false);

	const context = React.useMemo(
		() => ({
			areChildrenExiting: areChildrenExiting.current,
		}),
		[],
	);

	return (
		<PresenceContext.Provider value={context}>
			{children}
		</PresenceContext.Provider>
	);
};
