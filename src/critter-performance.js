/** Discrete, held cartoon cels. This presentation state never changes a body,
 * hitbox, velocity, gravity, contact or reward. Timers use simulation time so
 * Pause and slow motion also pause/slow the performance. */
export function createCritterPerformance(){
 let owner=null,seq=0,hits=0,lastHit=-Infinity,impactAngle=0,impactKind='bonk-a',heldAngle=0,cel=-1;
 const contacts=new Map();
 function update(sim){
  if(owner!==sim){owner=sim;seq=0;hits=0;lastHit=-Infinity;heldAngle=0;cel=-1;contacts.clear();}
  const time=sim.time??0,p=sim.real(sim.shot),released=!!sim.release;
  for(const hit of sim.contactEvents??[]){
   if(hit.seq<=seq)continue;seq=hit.seq;
   // Capsule fixtures can report the same collision twice. Resting contact
   // chatter must never pile on funny injuries or restart the impact cel.
   if(!released||hit.strength<.12||hit.time-(contacts.get(hit.id)??-Infinity)<.28)continue;
   contacts.set(hit.id,hit.time);hits++;lastHit=hit.time;
   impactKind=hits%2?'bonk-a':'bonk-b';impactAngle=hits%2?-.3:.28;
  }
  const age=time-lastHit,tier=hits>=5?3:hits>=3?2:hits?1:0;
  let pose=!released?'ready':sim.phase==='finished'&&hits?'dazed':age<.23?impactKind:age<.62?'stars':tier>1?'dazed':'flying';
  const frame=Math.floor(time*8);
  if(frame!==cel){cel=frame;heldAngle=released?Math.round(-Math.atan2(p.vy??0,p.vx??1)/(Math.PI/12))*(Math.PI/12):0;}
  // The visual cel faces along travel, rather than spinning continuously with
  // the capsule collider. A new impact swaps to a strongly readable fixed pose.
  const angle=pose.startsWith('bonk')?impactAngle:pose==='stars'?impactAngle*.5:heldAngle;
  return {pose,tier,hits,angle,frame,impactAge:age};
 }
 return {update};
}
export const critterPoseName=p=>({ready:'Ready to fly',flying:'Wheee!', 'bonk-a':'BONK!', 'bonk-b':'OOF!',stars:'Seeing stars',dazed:p.tier>=3?'Still smiling!':'A little dazed'}[p.pose]??'Wheee!');
