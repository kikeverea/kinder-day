import { completion, rate } from '../progress';
import { morning } from './fixtures';

describe('rate', () => {
  it.each([
    [100, 50, 'good'],
    [99, 50, 'regular'],
    [50, 50, 'regular'],
    [49, 50, 'bad'],
    [0, 0, 'regular'],
  ] as const)('%i%% with threshold %i → %s', (pct, min, out) => expect(rate(pct, min)).toBe(out));
});

it('completion ignores done ids of deleted steps', () => {
  expect(completion(morning, { morning: ['wake', 'gone'] })).toEqual({
    done: 1,
    total: 3,
    left: 2,
    pct: 33,
  });
});

it('completion of an empty routine is 0%', () => {
  expect(completion({ ...morning, steps: [] }, {}).pct).toBe(0);
});
