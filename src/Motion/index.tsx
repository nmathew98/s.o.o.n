import React from "react";

export type Motion = {
  [K in keyof JSX.IntrinsicElements]: React.FC<JSX.IntrinsicElements[K]>;
};

export const Motion: Motion = new Proxy(Object.create(null), {
  get:
    <T extends keyof JSX.IntrinsicElements>(_: never, as: T) =>
    (props: JSX.IntrinsicElements[T]) =>
      PolymorphicMotion({
        as,
        ...props,
      } as unknown as PolymorphicMotionProps<T>),
});

type PolymorphicMotionProps<T extends keyof JSX.IntrinsicElements> = {
  as: T;
} & JSX.IntrinsicElements[T];

const PolymorphicMotion = <T extends keyof JSX.IntrinsicElements>({
  as,
  ...rest
}: PolymorphicMotionProps<T>) => {
  const Component = as as string;

  return <Component {...rest} />;
};
