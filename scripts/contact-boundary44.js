import{installJointPolicy}from'./joint-policy42.js';import{advanceBoundaryInterval}from'./boundary-policy43.js';import{imminentPartContacts}from'./contact-onset44.js';

/** Contact objects are pooled. Cache stable fixture/child pairs, not recycled identities. */
export function createFixturePairCache(){
 const pairs=new WeakMap();
 function keys(c){return[c.getFixtureA(),c.getFixtureB(),c.getChildIndexA(),c.getChildIndexB()];}
 return{has(c){const[a,b,ia,ib]=keys(c);return Boolean(pairs.get(a)?.get(b)?.has(`${ia}:${ib}`)||pairs.get(b)?.get(a)?.has(`${ib}:${ia}`));},add(c){const[a,b,ia,ib]=keys(c);let other=pairs.get(a);if(!other){other=new WeakMap();pairs.set(a,other);}let children=other.get(b);if(!children){children=new Set();other.set(b,children);}children.add(`${ia}:${ib}`);}};
}

/** Explicit research composition: contact reaction has reserved work, original forces are unchanged. */
export function installContactBoundary(scene,{reserveContact=1,extraBudget=8,contactEnabled=true}={}){
 if(!Number.isInteger(extraBudget)||extraBudget<0||extraBudget>8||!Number.isInteger(reserveContact)||reserveContact<0||reserveContact>extraBudget)throw Error('Outside contact-work research domain');
 const originalIntegrate=scene.integrate.bind(scene),union=installJointPolicy(scene,8),baseStep=scene.step.bind(scene),stats={outerSteps:0,actualIntegrations:0,extraIntegrations:0,contactSplits:0,contactQueries:0,contactBudgetMisses:0,angularFallbacks:0,reservationFallbacks:0,maxOuterActual:0,maxOuterBase:0,union};
 let active=false,remainingExtra=0,reserved=0,actual=0,bases=0,handled=createFixturePairCache();
 const advance=dt=>{actual++;stats.actualIntegrations++;return originalIntegrate(dt);};
 function angular(dt){const available=Math.max(0,remainingExtra-reserved),result=advanceBoundaryInterval(scene,dt,{budget:Math.min(8,available+1),leadIn:true,settle:2,integrate:advance}),extra=result.steps.length-1;remainingExtra-=extra;stats.extraIntegrations+=extra;if(result.budgetFallback){stats.angularFallbacks++;if(reserved)stats.reservationFallbacks++;}}
 scene.integrate=dt=>{
  if(!active||scene.phase!=='flight')return advance(dt);bases++;
  const ready=[];if(contactEnabled){stats.contactQueries++;imminentPartContacts(scene,{distance:1e-8,onTrigger:(contact,record)=>{if(!handled.has(contact))ready.push({contact,record});}});}
  if(ready.length&&remainingExtra>0){remainingExtra--;stats.extraIntegrations++;stats.contactSplits++;reserved=Math.max(0,reserved-1);for(const r of ready)handled.add(r.contact);angular(dt/2);angular(dt/2);}
  else{if(ready.length)stats.contactBudgetMisses++;angular(dt);}
 };
 scene.step=(dt=1/600)=>{
  if(!(dt>0&&dt<=1/600)||active)throw Error('Outside whole-step contact research domain');active=true;remainingExtra=extraBudget;reserved=contactEnabled?Math.min(reserveContact,extraBudget):0;actual=0;bases=0;handled=createFixturePairCache();stats.outerSteps++;
  try{return baseStep(dt);}finally{active=false;stats.maxOuterActual=Math.max(stats.maxOuterActual,actual);stats.maxOuterBase=Math.max(stats.maxOuterBase,bases);if(actual>16||remainingExtra<0)throw Error('Contact/boundary work cap exceeded');}
 };return stats;
}
