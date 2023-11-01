# Motion for React

Simple wrappers around [Motion One](https://motion.dev) for React

Loosely based on the API for Solid, have taken liberties

## Usage

### Motion

Renders an animatable HTML or SVG element

Wrap a component in `Motion` to enable animations on them

```JSX
<Motion.div>{children}</Motion.div>
```

#### Props

- `animate`
  - A target of values to animate to
  - On initial render, `animate` does not run if `initial` is `false` or if options are not provided
  - On subsequent renders, `animate` runs if its options changes
- `initial`
  - If options are provided, a target of values to animate to when the element is first rendered
  - If `true` animates to `animate` on initial render
- `exit`
  - A target of values to animate to when an element is hidden
  - The element must be a direct child of `Presence`
- `hover`
  - A target of values to animate to from `animate` when the element receives a hover event
  - When the element is not hovered anymore, it animates to `animate`
- `press`
  - A target of values to animate to from `animate` when the element receives a click event
  - When the element is not pressed anymore, it animates to `animate`
- `transition`
  - Default transitions for all animations to use
  - Animations can specify their own `transition` to override the defaults
- `inView`
  - If `true` uses default `inView` options from `motion`, otherwise specify options
  - Only triggers for initial animations
- `scroll`
  - If `true` uses default `scroll` options from `motion`, otherwise specify options
  - Only triggers for initial animations

### Presence

Perform exit animations

All direct children of `Presence` should be `Motion` and should specify a `key`, direct children of `Presence` which are not `Motion` are filtered out

Exit animations are triggered on children when they are no longer rendered

```JSX
<Presence>
    {show && <Motion.div key="s.o.o.n">{children}</Motion.div>}
</Presence>
```

or

```JSX
<PresenceProvider>
  <Parent>
    <Presence>{children}</Presence>
    <Presence>{children}</Presence>
  <Parent>
<PresenceProvider>
```

#### Props

- `id`
  - An id for the component
  - Should be used with the hooks `useRegisterPresence` and `usePresence`
  - If the parent component needs to know when all exit animations are finished then `onExitEnd` will trigger a rerender and `usePresence` stores the exit animation state
- `initial`
  - Disable initial animations on all children
- `exitBeforeEnter`
  - If `true` waits until all exiting children animate out before animating in new children
  - Otherwise new children are animated in as exiting children animate out
- `onExitEnd`
  - Callback when all exit animations have finished

## Contributions

- Contributions are welcome, just make a pull request

## License

See `LICENSE`

**_"Let's make something, out of nothing"_**
