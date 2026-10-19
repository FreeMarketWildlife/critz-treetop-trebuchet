// SI units, x right, y up. Angles measured counterclockwise from +x.
// First bounded model: fixed axle and rigidly attached counterweight; massless taut sling.
export const defaults = Object.freeze({ longArm: 3, shortArm: 0.8, sling: 2.5,
  counterMass: 100, projectileMass: 1, beamLinearDensity: 8 / 3.8, releasePinAngle: 1.45, gravity: 9.81,
  pivotHeight: 300, initialArm: -2.5, initialSling: -Math.PI / 2 });
export function config(overrides = {}) {
  const p = { ...defaults, ...overrides };
  for (const key of Object.keys(defaults)) if (!Number.isFinite(p[key])) throw new Error(`Invalid ${key}`);
  for (const key of ['longArm','shortArm','sling','counterMass','projectileMass','beamLinearDensity','gravity'])
    if (p[key] <= 0) throw new Error(`Positive ${key} required`);
  return p;
}
export const initialState = p => [p.initialArm, p.initialSling, 0, 0];
function terms(p) {
  const {longArm:a, shortArm:b, sling:l, counterMass:M, projectileMass:m, beamLinearDensity:density}=p;
  const mb=density*(a+b), c=(a-b)/2;
  return {a,b,l,M,m,mb,c,I:mb*((a+b)**2/12+c*c)};
}
export function derivative(s,p) {
  const [t,f,w,v]=s, {a,b,l,M,m,mb,c,I}=terms(p), d=t-f;
  const A=I+M*b*b+m*a*a, B=m*a*l*Math.cos(d), C=m*l*l;
  const R=-m*a*l*Math.sin(d)*v*v-p.gravity*(m*a+mb*c-M*b)*Math.cos(t);
  const S=m*a*l*Math.sin(d)*w*w-m*p.gravity*l*Math.cos(f);
  const det=A*C-B*B;
  return [w,v,(R*C-B*S)/det,(A*S-B*R)/det];
}
export function step(s,p,dt=1/1000) {
  if (!(dt>0 && dt<=0.02)) throw new Error('Use a positive timestep <= 0.02 s');
  const add=(k,h)=>s.map((v,i)=>v+h*k[i]);
  const k1=derivative(s,p), k2=derivative(add(k1,dt/2),p),k3=derivative(add(k2,dt/2),p),k4=derivative(add(k3,dt),p);
  return s.map((v,i)=>v+dt/6*(k1[i]+2*k2[i]+2*k3[i]+k4[i]));
}
export function geometry(s,p) {
  const [t,f,w,v]=s,{a,b,l}=terms(p);
  const tip={x:a*Math.cos(t),y:p.pivotHeight+a*Math.sin(t)};
  return {tip,counter:{x:-b*Math.cos(t),y:p.pivotHeight-b*Math.sin(t)},
    projectile:{x:tip.x+l*Math.cos(f),y:tip.y+l*Math.sin(f),
      vx:-a*Math.sin(t)*w-l*Math.sin(f)*v,vy:a*Math.cos(t)*w+l*Math.cos(f)*v}};
}
export function energy(s,p) {
  const [t,f,w,v]=s,{a,b,l,M,m,mb,c,I}=terms(p);
  return .5*(I+M*b*b+m*a*a)*w*w+.5*m*l*l*v*v+m*a*l*Math.cos(t-f)*w*v+
    p.gravity*((m*a+mb*c-M*b)*Math.sin(t)+m*l*Math.sin(f));
}
export function tension(s,p) {
  const [t,f,w,v]=s,acc=derivative(s,p)[2];
  return p.projectileMass*(p.sling*v*v+p.longArm*w*w*Math.cos(t-f)-p.longArm*acc*Math.sin(f-t)-p.gravity*Math.sin(f));
}
export function ballistic(release,time,g=9.81) {
  return {x:release.x+release.vx*time,y:release.y+release.vy*time-.5*g*time*time,
    vx:release.vx,vy:release.vy-g*time};
}
// Idealized release pin: ring opens on the falling relative sling/beam angle.
// This geometric event is not a target trajectory or a full ring/contact simulation.
export function simulate(overrides={},dt=1/1000) {
  const p=config(overrides); if (!(dt>0 && dt<=0.02)) throw new Error('Use timestep <= 0.02 s');
  let s=initialState(p), previous=s[1]-s[0]; const frames=[];
  for(let i=0;i*dt<5;i++) {
    const time=i*dt, geo=geometry(s,p), shot=geo.projectile, relative=s[1]-s[0];
    frames.push({time,state:[...s],...geo});
    const slack=tension(s,p)<0;
    const pin=previous>p.releasePinAngle && relative<=p.releasePinAngle;
    if(slack || pin) return {p,frames,release:{...shot},reason:slack?'slack':'release pin',time};
    previous=relative; s=step(s,p,dt);
  }
  return {p,frames,release:null,reason:'timeout'};
}
// Read-only dry run of the same solver; short free-flight hint, no collision forecast.
export function predict(overrides={}) {
  const result=simulate({...overrides});
  return {release:result.release?{...result.release}:null,reason:result.reason,
    points:result.release?Array.from({length:17},(_,i)=>ballistic(result.release,i*.05,result.p.gravity)):[]};
}
