// Explicit research preload only; ordinary game entry points do not import this.
import{PhysicalHookScene}from'../src/hook-experiment.js';
import{mechanismRegion}from'./rig-policy41.js';
const step=PhysicalHookScene.prototype.step;
PhysicalHookScene.prototype.step=function(dt=1/600){const count=mechanismRegion(this,dt,true)?8:1;for(let i=0;i<count;i++)step.call(this,dt/count);};
