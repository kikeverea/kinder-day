import { ALL_DAYS, WEEKDAYS } from './constants';
import { uid } from './ids';
import type { Routine, Settings, Step, StepMode } from './types';

const step = (emoji: string, label: string, mins: number, mode: StepMode = 'max'): Step => ({
  id: uid(),
  emoji,
  label,
  mins,
  mode,
});

export const createSeedRoutines = (): Routine[] => [
  {
    id: 'morning',
    name: 'Morning',
    emoji: '🌅',
    color: '#FFD66B',
    days: [...ALL_DAYS],
    steps: [
      step('⏰', 'Wake up', 2),
      step('🚽', 'Go pee', 3),
      step('🪥', 'Brush my teeth', 2, 'exact'),
      step('👕', 'Put on my clothes', 5),
      step('👟', 'Put on my shoes', 3),
      step('📅', 'Check my day', 2),
      step('🎒', 'Pack my backpack', 4),
    ],
  },
  {
    id: 'school',
    name: 'After school',
    emoji: '🏫',
    color: '#8FE3B8',
    days: [...WEEKDAYS],
    steps: [
      step('🧼', 'Wash my hands', 2),
      step('🍎', 'Have a snack', 10),
      step('🎒', 'Empty my backpack', 3),
      step('📚', 'Homework time', 20),
    ],
  },
  {
    id: 'bed',
    name: 'Bedtime',
    emoji: '🌙',
    color: '#C7A8FF',
    days: [...ALL_DAYS],
    steps: [
      step('🛁', 'Bath time', 15),
      step('👚', 'Pajamas on', 3),
      step('🪥', 'Brush my teeth', 2, 'exact'),
      step('📖', 'Story time', 10),
      step('🛏️', 'Lights out', 1),
    ],
  },
];

export const DEFAULT_SETTINGS: Settings = { kidName: 'Mia', graceMins: 5, confetti: true };
