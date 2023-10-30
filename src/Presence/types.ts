export interface PresenceProps {
	id?: string;
	initial?: boolean;
	exitBeforeEnter?: boolean;
	onExitEnd?: () => boolean;
}

export type ReactElementWithKey = React.ReactElement & {
	key: string;
};
