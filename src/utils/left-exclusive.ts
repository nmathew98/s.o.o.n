export const leftExclusive = (
  a: React.ReactElement[],
  b: React.ReactElement[]
) =>
  a
    .map((x, idx) => ({ idx, el: x }))
    .filter((x, idx) => b.at(idx)?.key !== x.el.key);
