# Motion for React

Simple wrappers around [Motion One](https://motion.dev) for React

Loosely based on the API for Solid, have taken liberties

## Usage

### Motion

Renders an animatable HTML or SVG element

Wrap a component in `Motion` to enable animations on them

#### Props

- `animate`
  - A target of values to animate to
  - On initial render, `animate` does not run
  - On subsequent renders, `animate` runs if its options changes
- `initial`
  - If options are provided, a target of values to animate to when the element is first rendered
  - If `true` animates to `animate` on initial render
- `exit`
  - A target of values to animate to when an element is hidden
  - The element must be a direct child of `Presence`
- `hover`
  - A target of values to animate from when the element receives a hover event
- `press`
  - A target of values to animate to from when the element receives a press event
- `transition`
  - Default transitions for all animations to use
- `inView`
  - If `true` uses default `inView` options from `motion`, otherwise specify options
- `scroll`
  - If `true` uses default `scroll` options from `motion`, otherwise specify options

### Presence

Perform exit animations

All direct children of `Presence` should be `Motion` and should specify a `key`, direct children of `Presence` which are not `Motion` are filtered out

#### Props

- `initial`
  - Disable initial animations on all children
- `exitBeforeEnter`
  - If true waits until all exiting children to animate out before animating in new children, otherwise new children are animated in as exiting children animate out

## Contributions

- Contributions are welcome, just make a pull request

## License

See `LICENSE`

**_"Let's make something, out of nothing"_**
