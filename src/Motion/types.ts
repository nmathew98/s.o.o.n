import {
	type AnimationControls,
	type AnimationOptionsWithOverrides,
	type CSSStyleDeclarationWithTransform,
	type ValueKeyframe,
	type InViewOptions,
	type ScrollOptions,
} from "motion";

export type MotionExport = {
	[K in keyof React.JSX.IntrinsicElements]: React.FC<
		Omit<PolymorphicMotionProps<K>, "as">
	>;
};

export type MotionProps<T extends keyof React.JSX.IntrinsicElements> = {
	as: T;
};

export type PolymorphicMotionProps<
	T extends keyof React.JSX.IntrinsicElements,
> = {
	as: T;
	ref?: React.Ref<PolymorphicMotionHandles>;
	initial?: boolean | KeyframesDefinition;
	animate?: KeyframesDefinition;
	hover?: KeyframesDefinition;
	press?: KeyframesDefinition;
	exit?: KeyframesDefinition;
	transition?: AnimationOptionsWithOverrides;
	inView?: boolean | InViewOptions;
	scroll?: boolean | ScrollOptions;
	onMotionStart?: (controls: AnimationControls) => void;
	onMotionEnd?: (controls: AnimationControls) => void;
	onHoverStart?: React.MouseEventHandler<T>;
	onHoverEnd?: React.MouseEventHandler<T>;
	onPressStart?: React.MouseEventHandler<T>;
	onPressEnd?: React.MouseEventHandler<T>;
} & Omit<React.DetailedHTMLProps<React.HTMLAttributes<T>, T>, "ref">;

export type KeyframesDefinition = {
	[K in keyof CSSStyleDeclarationWithTransform]?: ValueKeyframe;
} & { transition?: AnimationOptionsWithOverrides };

export interface PolymorphicMotionHandles {
	animateExit: () => Promise<void>;
}
