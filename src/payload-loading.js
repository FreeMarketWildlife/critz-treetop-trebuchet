/** Deliberate critter placement before quasi-static winding. Pointer movement
 * never enters the solver as velocity. Cancel returns the critter to its mat. */
export function createPayloadLoading(sim){
 const home=()=>{const c=sim.c,x=c.baseWidth*.5+c.pivotHeight*.43;return{x,y:sim.supportHeight(x)+sim.payloadRadius+.025*sim.L};};
 let dragging=false,loaded=false,position=home(),angle=0;
 const place=p=>{position={...p};sim.shot.setTransform({x:p.x/sim.L,y:p.y/sim.L},angle);};
 const target=()=>sim.loadingPosition(sim.tip());
 const api={
  get loaded(){return loaded;},get dragging(){return dragging;},get position(){return{...position};},get angle(){return angle;},target,home,
  begin(){if(sim.phase!=='ready')return false;loaded=false;dragging=true;return true;},
  move(p){if(!dragging||![p.x,p.y].every(Number.isFinite))return;const previous=position;angle=Math.max(-.65,Math.min(.65,(p.x-previous.x)*1.8));place(p);},
  drop(tolerance=0){if(!dragging)return false;dragging=false;const t=target();loaded=Math.hypot(position.x-t.x,position.y-t.y)<=Math.max(sim.c.pouchWidth*.65,sim.animal.length*.55,tolerance);angle=0;place(loaded?t:home());return loaded;},
  cancel(){if(!dragging)return;dragging=false;loaded=false;angle=0;place(home());},
  reset(){dragging=false;loaded=false;angle=0;place(home());},
 };
 api.reset();return api;
}
