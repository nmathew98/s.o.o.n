export interface PresenceProps {
	initial?: boolean;
	exitBeforeEnter?: boolean;
}

export type ReactElementWithKey = React.ReactElement & {
	key: string;
};
