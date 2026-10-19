/** Read-only mechanism annotations. All marks refer to actual bodies/anchors. */
export function drawMechanismDetails(ctx,scene,project,{labels=true}={}){
 if(!scene.p||!scene.arm?.getWorldPoint||!Array.isArray(scene.ropes))return;
 const weight=project(scene.arm.getWorldPoint({x:-scene.p.shortArm,y:0}));ctx.save();ctx.strokeStyle='#f0d69b';ctx.fillStyle='#d0b35e';ctx.lineWidth=1.2;ctx.beginPath();ctx.arc(...weight,4.5,0,Math.PI*2);ctx.fill();ctx.stroke();
 if(labels){const labelX=Math.max(12,Math.min(370,weight[0]+16)),labelY=Math.max(46,weight[1]-15);ctx.beginPath();ctx.moveTo(...weight);ctx.lineTo(labelX,labelY+3);ctx.stroke();ctx.font='12px system-ui';ctx.fillStyle='#243b30';ctx.fillText(`${scene.p.counterMass} kg fixed weight`,labelX,labelY);}
 for(const [i,rope]of scene.ropes.entries()){const a=rope.getAnchorA(),b=rope.getAnchorB(),p=project(a),q=project(b),slack=Math.max(0,rope.getMaxLength()-Math.hypot(a.x-b.x,a.y-b.y));ctx.strokeStyle=i?'#294f72':'#275e50';ctx.lineWidth=3;ctx.setLineDash(slack>.02?[5,3]:[]);ctx.beginPath();ctx.moveTo(...p);ctx.lineTo(...q);ctx.stroke();ctx.setLineDash([]);ctx.beginPath();ctx.arc(...p,2.5,0,Math.PI*2);ctx.stroke();ctx.beginPath();ctx.arc(...q,2.5,0,Math.PI*2);ctx.fillStyle=i?'#8cbed7':'#b3d7b4';ctx.fill();if(labels&&i===0){ctx.fillStyle='#243b30';ctx.fillText(slack>.02?`Sling slack ${slack.toFixed(2)} m`:'Sling taut',Math.max(12,Math.min(380,(p[0]+q[0])/2+12)),Math.max(65,(p[1]+q[1])/2));}}
 ctx.restore();
}
