import { MOVE_DURATION } from '@eternaltwin/labrute-core/constants';
import { AttemptHitStep } from '@eternaltwin/labrute-core/types';

import fightersEqual from './fightersEqual.js';
import { AnimationFighter } from './findFighter.js';
import iddle from './iddle.js';

const attemptHit = (
  setFighters: React.Dispatch<React.SetStateAction<AnimationFighter[]>>,
  step: AttemptHitStep,
) => {
  // Set hitting animation for fighters
  setFighters((prevFighters) => prevFighters.map((fighter) => {
    if (fightersEqual(step.fighter, fighter)) {
      return {
        ...fighter,
        animation: 'attack',
      };
    }
    if (fightersEqual(step.target, fighter)) {
      return {
        ...fighter,
        animation: 'hit',
      };
    }

    return fighter;
  }));

  // Return hit fighter to iddle animation
  iddle(setFighters, step.target, MOVE_DURATION);
};

export default attemptHit;