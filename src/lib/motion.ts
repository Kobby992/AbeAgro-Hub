// JS counterparts of the motion tokens in src/styles/tokens.css.
export const DURATION = { fast: 0.15, base: 0.25, reveal: 0.45, fly: 0.7 } as const;

export const EASE_OUT: [number, number, number, number] = [0.2, 0.8, 0.2, 1];

// Rises before it falls, which bends the path of the thumbnail flying to the quote list.
export const EASE_FLY_ARC: [number, number, number, number] = [0.45, -0.35, 0.8, 0.6];
