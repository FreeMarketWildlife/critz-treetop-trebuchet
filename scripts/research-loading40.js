// Explicit Node-only preload for the evaluated, NOT adopted, loading policy.
// Example: node --import ./scripts/research-loading40.js scripts/measure-natural29.js <new-output-path>
import{CritterScene}from'../src/articulated.js';
const step=CritterScene.prototype.step;
CritterScene.prototype.step=function(dt){if(this.phase==='loading')this.p.loadingConstraintSubsteps=true;return step.call(this,dt);};
