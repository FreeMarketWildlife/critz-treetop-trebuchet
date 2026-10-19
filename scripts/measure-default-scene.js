import {PhysicalHookScene} from '../src/hook-experiment.js';
import {profiles} from '../src/species.js';
import {load,waitForContact,measureSnapshot} from './measure-hook.js';
const settings={releaseHardware:'channel',stoppedSplitPouch:true,pouchPanelMass:.5,mechanicalWinding:true,initialArm:-3,counterMass:100,longArm:3,shortArm:.8,sling:2.5,hookAngle:3.4,channelLength:.22};
const rows=[];
for(const profile of profiles){const s=new PhysicalHookScene(settings,profile.id);s.startWinding(.6);for(let i=0;i<7200&&s.phase==='winding';i++)s.step();const loaded=load(s),contact=waitForContact(s),status=s.loadingStatus();rows.push({species:profile.id,mass:profile.totalMass,loaded,contact,status,launch:loaded&&status.contacting?measureSnapshot(s.snapshot(),s.p,profile.id,1/600):null});}
console.log(JSON.stringify({scope:'Prototype UI initial hardware held fixed for all11 species; poor launches retained. No species tuning or gameplay encounters. Motor and finite hand loading are physical.',settings,rows},null,2));
