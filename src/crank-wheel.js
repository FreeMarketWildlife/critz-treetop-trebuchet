/** A massless winding transmission: the wheel follows beam travel, never adds
 * launch energy. Positive screen angles are clockwise. All points are metres. */
import {part} from './build-catalog.js?v=11';
export function crankGeometry(sim){
 const c=sim.c,p=part(c.winch),radius=Math.min(c.pivotHeight,c.baseWidth*1.65)*p.radiusRatio,drumRadius=radius*p.drumRatio;
 const local={x:c.baseWidth*.44,y:radius+c.pivotHeight*.055};
 const world=sim.frame.getWorldPoint({x:local.x/sim.L,y:local.y/sim.L});
 const center={x:world.x*sim.L,y:world.y*sim.L},sectorRadius=Math.min(c.longArm*.08,c.pivotHeight*.12);
 return{center,local,radius,drumRadius,sectorRadius,gearing:p.gearing,spokes:p.spokes,color:p.color,frameAngle:sim.frame.getAngle()};
}
export function crankState(sim){
 const g=crankGeometry(sim),rest=Math.PI-.4,travel=sim.release?0:Math.max(0,Math.atan2(Math.sin(sim.arm.getAngle()-rest),Math.cos(sim.arm.getAngle()-rest))),cable=travel*g.sectorRadius;
 return{...g,angle:cable/g.drumRadius*g.gearing,paidOut:travel===0&&sim.phase!=='ready',cable,loaded:sim.loading?.loaded??true};
}
export function drawCrankWheel(ctx,sim,project,scale){
 const s=crankState(sim),p=project(s.center),r=s.radius*scale,dr=s.drumRadius*scale,pivot=project(sim.pivot()),sr=s.sectorRadius*scale;
 const stroke=(points,color,width)=>{ctx.beginPath();points.forEach((p,i)=>i?ctx.lineTo(...p):ctx.moveTo(...p));ctx.strokeStyle=color;ctx.lineWidth=width;ctx.stroke();};
 const disk=(x,y,r,fill,outline='#302e25',width=2.6)=>{ctx.beginPath();ctx.arc(x,y,Math.max(.3,r),0,Math.PI*2);ctx.fillStyle=fill;ctx.fill();ctx.strokeStyle=outline;ctx.lineWidth=width;ctx.stroke();};
 ctx.save();ctx.lineCap='round';ctx.lineJoin='round';
 // A winding quadrant is bolted to the arm axle. Its cable winds onto the front
 // drum; the latch withdraws on release and the same cable runs freely out.
 disk(...pivot,sr,'#80603b','#302e25',2.7);
 ctx.save();ctx.translate(...pivot);ctx.rotate(-sim.arm.getAngle());
 for(let i=0;i<3;i++){const a=i*Math.PI*2/3;stroke([[0,0],[Math.cos(a)*sr*.78,Math.sin(a)*sr*.78]],'#cba66a',Math.max(1,sr*.13));}ctx.restore();
 const a=[pivot[0]+sr*.75,pivot[1]+sr*.65],b=[p[0],p[1]-dr];
 ctx.beginPath();ctx.moveTo(...a);
 if(s.paidOut){const sag=Math.min(sr*1.8,r*1.8);ctx.quadraticCurveTo((a[0]+b[0])/2,(a[1]+b[1])/2+sag,...b);}else ctx.lineTo(...b);
 ctx.strokeStyle='#302e25';ctx.lineWidth=4;ctx.stroke();ctx.strokeStyle='#e9c589';ctx.lineWidth=2;ctx.stroke();
 // Front bearing pedestal shares the frame transform on rolling/rocking rigs.
 const support=[-.6,0,.6].map(offset=>{if(offset===0)return p;const q=sim.frame.getWorldPoint({x:(s.local.x+s.radius*offset)/sim.L,y:sim.c.pivotHeight*.025/sim.L});return project({x:q.x*sim.L,y:q.y*sim.L});});
 stroke(support,'#302e25',Math.max(5,r*.24));stroke(support,'#ac713c',Math.max(2,r*.13));
 disk(...p,dr*1.3,'#68442d');
 ctx.save();ctx.translate(...p);ctx.rotate(s.angle);
 // Open spokes, thick ink, warm bevel and steel hoops match the game timber.
 for(let i=0;i<s.spokes;i++){const a=i*Math.PI*2/s.spokes,tip=[Math.cos(a)*r*.82,Math.sin(a)*r*.82];stroke([[0,0],tip],'#302e25',Math.max(4,r*.15));stroke([[0,0],tip],s.color,Math.max(2,r*.095));}
 ctx.beginPath();ctx.arc(0,0,r*.88,0,Math.PI*2);ctx.strokeStyle='#302e25';ctx.lineWidth=Math.max(5,r*.26);ctx.stroke();ctx.strokeStyle=s.color;ctx.lineWidth=Math.max(3,r*.16);ctx.stroke();
 ctx.beginPath();ctx.arc(0,0,r*.9,Math.PI*1.04,Math.PI*1.85);ctx.strokeStyle='#f4cf83';ctx.lineWidth=Math.max(1,r*.045);ctx.stroke();
 for(let i=0;i<s.spokes;i++){const a=i*Math.PI*2/s.spokes;disk(Math.cos(a)*r*.88,Math.sin(a)*r*.88,Math.max(1,r*.045),'#81978f','#302e25',1);}
 // An off-center brass cap makes direction readable even at small screen sizes.
 stroke([[0,0],[r*.59,0]],'#302e25',Math.max(4,r*.13));stroke([[0,0],[r*.59,0]],'#8ca59b',Math.max(2,r*.07));disk(r*.59,0,Math.max(2,r*.12),'#edb954');disk(0,0,Math.max(2,r*.16),'#b8c8b7');ctx.restore();
 // Ratchet pawl lifts clear while the counterweight drives the return.
 const released=sim.phase!=='ready',pawl=[p[0]+r*.8,p[1]-r*(released?1.15:.7)];stroke([[p[0]+r*1.1,p[1]-r*.85],pawl],'#302e25',4);stroke([[p[0]+r*1.1,p[1]-r*.85],pawl],'#b7c0a3',2);
 ctx.restore();return s;
}
