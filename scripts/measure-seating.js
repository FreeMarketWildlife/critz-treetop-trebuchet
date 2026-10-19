import {PhysicalHookScene} from '../src/hook-experiment.js';
import {writeFileSync} from 'node:fs';
const rows=[];
for(const species of ['lizard','turtle','armadillo']){
 const initial=new PhysicalHookScene({releaseHardware:'channel',stoppedSplitPouch:true,pouchPanelMass:.5,mechanicalWinding:true,initialArm:-3},species);initial.startWinding(.2);for(let i=0;i<7200&&initial.phase==='winding';i++)initial.step();for(let i=0;i<600;i++)initial.step();const saved=initial.snapshot();
 for(const offset of [-.2,0,.2])for(const above of [.45,.85]){
 const s=new PhysicalHookScene(initial.p,species,saved),part=s.parts.find(b=>b.getUserData().id==='torso')??s.parts[0];s.grab(part.getWorldPoint({x:part.getLocalCenter().x+.045,y:part.getLocalCenter().y}));
 for(let i=0;i<600;i++){s.move({x:-4.3,y:297});s.step();}for(let i=0;i<1200;i++){s.move({x:s.pouch.getPosition().x+offset,y:s.pouch.getPosition().y+above});s.step();}s.drop();let contacted=false,firstReady=null,readyDuration=0,maxReadyDuration=0,quietDuration=0,maxQuietDuration=0,readySnapshot=null;
 for(let i=0;i<2100;i++){s.step();const q=s.loadingStatus();contacted ||=q.contacting;const ready=q.contacting&&q.withinEnvelope;readyDuration=ready?readyDuration+1/600:0;quietDuration=ready&&q.relativeSpeed<.35?quietDuration+1/600:0;maxReadyDuration=Math.max(maxReadyDuration,readyDuration);maxQuietDuration=Math.max(maxQuietDuration,quietDuration);if(quietDuration>=.1&&!readySnapshot)readySnapshot=s.snapshot();if(ready&&firstReady===null)firstReady=i/600;}
 let earlyLaunch=null;if(readySnapshot){const trial=new PhysicalHookScene(s.p,species,readySnapshot);trial.unlatch();for(let i=0;i<3000&&!trial.release;i++)trial.step();earlyLaunch={released:!!trial.release,center:trial.release?.center??null};}
 rows.push({earlyLaunch,species,offset,above,firstReady,maxReadyDuration,maxQuietDuration,contacted,end:s.loadingStatus(),center:s.center(),cup:{...s.pouch.getPosition()},hardwareEscaped:s.hardwareHasEscaped(),handWork:s.handWork});
 }
}
writeFileSync('docs/reviews/iteration-9/seating.json',JSON.stringify({protocol:'Actual motor low winding0.2; identical canonical post-wind snapshot per species; finite offset torso grip; shared1s lift plus2s cup-relative hold; free3.5s observation. A transient valid contact is distinct from sustained seating.',rows},null,2)+'\n');console.table(rows.map(({species,offset,above,firstReady,contacted,end,hardwareEscaped})=>({species,offset,above,firstReady,contacted,endReady:end.contacting&&end.withinEnvelope,hardwareEscaped})));
