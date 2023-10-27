export const rightExclusive = (
  a: React.ReactElement[],
  b: React.ReactElement[]
) =>
  b
    .map((x, idx) => ({ idx, el: x }))
    .filter((x, idx) => a.at(idx)?.key !== x.el.key);
