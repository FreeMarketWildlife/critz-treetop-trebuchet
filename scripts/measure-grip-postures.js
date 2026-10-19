import {PhysicalHookScene} from '../src/hook-experiment.js';
import * as protocol from './measure-hook.js';
const {physicalMatrix,waitForContact,measureSnapshot}=protocol;
const stopped=process.argv.includes('--stopped'),massIndex=process.argv.indexOf('--panel-mass'),panelMass=massIndex<0?undefined:Number(process.argv[massIndex+1]),rows=[];
const matrix=stopped?protocol.stoppedMatrix:physicalMatrix;if(!matrix)throw new Error('Stopped matrix not yet defined');
for(const entry of matrix)for(const grabbed of ['torso','head']){
 const s=new PhysicalHookScene({...entry.parameters,...(panelMass===undefined?{}:{pouchPanelMass:panelMass}),stoppedSplitPouch:stopped,mechanicalWinding:true,initialArm:-3},entry.species);s.startWinding(.6);for(let i=0;i<7200&&s.phase==='winding';i++)s.step();for(let i=0;i<600;i++)s.step();
 const part=s.parts.find(b=>b.getUserData().id===grabbed);if(!part){rows.push({class:entry.class,grabbed,error:'No requested body'});continue;}
 s.grab(part.getWorldCenter());for(let i=0;i<600;i++){s.move({x:-4.3,y:297});s.step();}for(let i=0;i<1200;i++){s.move({x:s.pouch.getPosition().x,y:s.pouch.getPosition().y+.85});s.step();}s.drop();for(let i=0;i<300;i++)s.step();
 const contact=waitForContact(s),initial=s.loadingStatus();const result=s.isLoaded()?measureSnapshot(s.snapshot(),s.p,entry.species,1/600):null;rows.push({class:entry.class,species:entry.species,parameters:s.p,grabbed,contact,initial,result});
}
console.log(JSON.stringify({scope:'Torso/head physical grip targets with unchanged finite-force path and actual winding. Includes failures. No body pose assignments, rescue, random force or automatic tuning. Stopped split pouch is an unpromoted research model.',stopped,panelMass,rows},null,2));
