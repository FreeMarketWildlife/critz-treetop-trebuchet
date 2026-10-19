import {PhysicalHookScene} from '../src/hook-experiment.js';
import * as protocol from './measure-hook.js';
const {physicalMatrix,load,waitForContact,measureSnapshot}=protocol;
const stopped=process.argv.includes('--stopped'),massIndex=process.argv.indexOf('--panel-mass'),panelMass=massIndex<0?undefined:Number(process.argv[massIndex+1]);
const rows=[];
for(const setup of (stopped?protocol.stoppedMatrix:physicalMatrix))for(const delay of [0,.2,.5]){
 const s=new PhysicalHookScene({...setup.parameters,...(stopped?{stoppedSplitPouch:true}:{}),...(panelMass===undefined?{}:{pouchPanelMass:panelMass}),mechanicalWinding:true,initialArm:-3},setup.species);s.startWinding(.6);for(let i=0;i<7200&&s.phase==='winding';i++)s.step();const loaded=load(s);waitForContact(s);for(let i=0;i<Math.round(delay*600);i++)s.step();const ready=waitForContact(s),result=measureSnapshot(s.snapshot(),s.p,setup.species,1/600);
 rows.push({class:setup.class,parameters:s.p,delay,loaded,ready,result});
}
console.log(JSON.stringify({scope:'Honest additional unheld waiting changes physical load state; no state reset or force. These are motor-wound, contact-settled setups, not arbitrary manual load coverage.',rows},null,2));
