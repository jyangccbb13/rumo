import { makeProject } from '@motion-canvas/core';
import intro from './scenes/intro?scene';
import onboarding from './scenes/onboarding?scene';
import timeline from './scenes/timeline?scene';
import explore from './scenes/explore?scene';
import outro from './scenes/outro?scene';

export default makeProject({
  scenes: [intro, onboarding, timeline, explore, outro],
});
