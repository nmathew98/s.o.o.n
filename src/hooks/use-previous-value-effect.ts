import React from 'react';

export const usePreviousValueEffect = (f: PreviousValueEffect, deps?: React.DependencyList) => {
    const previousDeps = React.useRef(deps);
    
    React.useEffect(() => {
        const cleanup = f(previousDeps.current, deps);

        return cleanup;
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, deps);
}

export type PreviousValueEffect = (from: React.DependencyList | undefined, to: React.DependencyList | undefined) => void | (() => void);