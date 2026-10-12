import { doneTint, mixOklab, routineTint } from '../color';

it('returns the endpoints at 100% and 0%', () => {
  expect(mixOklab('#FFD66B', 1, '#FFFFFF')).toBe('#FFD66B');
  expect(mixOklab('#FFD66B', 0, '#FFF6EA')).toBe('#FFF6EA');
});

it('produces tints between the routine color and the ground', () => {
  const tint = routineTint('#C7A8FF');
  expect(tint).toMatch(/^#[0-9A-F]{6}$/);
  expect(tint).not.toBe('#FFF6EA');
  expect(doneTint('#8FE3B8')).toMatch(/^#[0-9A-F]{6}$/);
});
