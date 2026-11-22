// Dev-only: ?fast=1 runs game timers 10x faster
export const SPEED = typeof location !== 'undefined' && new URLSearchParams(location.search).get('fast') === '1' ? 10 : 1
