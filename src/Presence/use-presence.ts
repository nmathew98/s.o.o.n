import React from "react";
import { PresenceContext } from "./context";

export const useRegisterPresence = () => {
	const id = React.useId();
	const { registerPresence } = React.useContext(PresenceContext);

	registerPresence(id);

	return {
		id,
	};
};

export const usePresence = (id: string) => {
	const { currentState } = React.useContext(PresenceContext);

	return {
		get isExiting() {
			return currentState(id);
		},
	};
};
