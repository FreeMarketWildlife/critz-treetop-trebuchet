/** Read-only diagnostic for pinned Planck1.5.1. The post-position world manifold
 * can rotate after velocity constraints were solved. Use the cached solver normal
 * to reconstruct the impulse actually applied, retaining the old estimate for comparison.
 * Private fields are version guarded; this is never imported by gameplay code. */
export function contactImpulseOnBody(contact,impulse,body){
 const a=contact.getFixtureA().getBody(),b=contact.getFixtureB().getBody();if(body!==a&&body!==b)throw Error('Body is not in contact');
 const n=contact.v_normal,count=contact.v_pointCount,m=contact.getWorldManifold();if(!n||!m||![n.x,n.y,m.normal.x,m.normal.y].every(Number.isFinite)||!Number.isInteger(count)||count<1||count>2)throw Error('Unsupported Planck constraint diagnostics');
 const N=impulse.normalImpulses.slice(0,count).reduce((a,b)=>a+b,0),T=impulse.tangentImpulses.slice(0,count).reduce((a,b)=>a+b,0),sign=body===a?-1:1;
 return {x:sign*(n.x*N+n.y*T),y:sign*(n.y*N-n.x*T),postPositionX:sign*(m.normal.x*N+m.normal.y*T),postPositionY:sign*(m.normal.y*N-m.normal.x*T),N,T,solverNormal:{x:n.x,y:n.y},postPositionNormal:{x:m.normal.x,y:m.normal.y},pointCount:count};
}
