export const resolveInSequence = (promises: Promise<unknown>[]) =>
	promises.reduce(
		(sequence, promise) => sequence.then(() => promise),
		Promise.resolve(),
	);
