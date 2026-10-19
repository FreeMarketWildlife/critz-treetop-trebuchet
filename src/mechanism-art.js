/** Read-only mechanism annotations. All marks refer to actual bodies/anchors. */
export function drawMechanismDetails(ctx,scene,project,{labels=true}={}){
 if(!scene.p||!scene.arm?.getWorldPoint||!Array.isArray(scene.ropes))return;
 const weight=project(scene.arm.getWorldPoint({x:-scene.p.shortArm,y:0}));ctx.save();ctx.strokeStyle='#f0d69b';ctx.fillStyle='#d0b35e';ctx.lineWidth=1.2;ctx.beginPath();ctx.arc(...weight,4.5,0,Math.PI*2);ctx.fill();ctx.stroke();
 if(labels){const x=Math.max(12,Math.min(370,weight[0]+16)),y=Math.max(46,weight[1]-15);ctx.beginPath();ctx.moveTo(...weight);ctx.lineTo(x,y+3);ctx.stroke();ctx.font='12px system-ui';ctx.fillStyle='#243b30';ctx.fillText(`${scene.p.counterMass} kg fixed weight`,x,y);}
 const strands=scene.ropes.map((rope,i)=>{const a=rope.getAnchorA(),b=rope.getAnchorB();return {p:project(a),q:project(b),name:i?'free':'fixed',slack:Math.max(0,rope.getMaxLength()-Math.hypot(a.x-b.x,a.y-b.y))};});
 for(const [i,{p,q,slack}]of strands.entries()){ctx.strokeStyle=i?'#294f72':'#275e50';ctx.lineWidth=3;ctx.setLineDash(slack>.02?[5,3]:[]);ctx.beginPath();ctx.moveTo(...p);ctx.lineTo(...q);ctx.stroke();ctx.setLineDash([]);ctx.beginPath();ctx.arc(...p,2.5,0,Math.PI*2);ctx.stroke();ctx.beginPath();ctx.arc(...q,2.5,0,Math.PI*2);ctx.fillStyle=i?'#8cbed7':'#b3d7b4';ctx.fill();}
 if(labels&&strands.length){const {p,q}=strands[0];ctx.fillStyle='#243b30';ctx.font='12px system-ui';const descriptions=strands.map(s=>`${s.name} ${s.slack>.02?`slack ${s.slack.toFixed(2)} m`:'taut'}`);ctx.fillText(`Sling: ${descriptions.join(' / ')}`,Math.max(12,Math.min(180,(p[0]+q[0])/2)),Math.max(65,(p[1]+q[1])/2));}
 ctx.restore();
}
