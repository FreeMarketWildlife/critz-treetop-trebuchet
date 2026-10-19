import{readFileSync,writeFileSync}from'node:fs';import{createRig}from'../src/species.js';
const rows=[];
for(let group=0;group<3;group++){
 const frames=JSON.parse(readFileSync(`docs/reviews/iteration-38/angular-frames-group${group}.json`)).frames,reg=JSON.parse(readFileSync(`docs/reviews/iteration-38/regression-group${group}.json`));
 for(const f of frames){
  const rig=createRig(f.species),joint=rig.joints.find(j=>j.a===f.worst.bodyA.id&&j.b===f.worst.bodyB.id),body=f.pose.bodies.find(b=>b.tag?.role==='part'&&b.tag.id===f.worst.bodyB.id);
  if(!joint||!body){rows.push({id:f.id,notPayloadJoint:true});continue;}
  const a=joint.anchorB,c=Math.cos(body.angle),s=Math.sin(body.angle),anchor={x:body.position.x+c*a.x-s*a.y,y:body.position.y+s*a.x+c*a.y},distance=p=>Math.hypot(p.x-anchor.x,p.y-anchor.y);let lever=0;
  for(const shape of body.fixtures)lever=Math.max(lever,shape.type==='circle'?distance(shape.center)+shape.radius:Math.max(...shape.vertices.map(distance))+.01);
  const r=reg.rows.find(r=>r.id===f.id),scale=(f.pose.phase==='flight'?42:45)*374/480,angleChord=2*lever*Math.sin(f.worst.value/2);
  rows.push({id:f.id,part:body.tag.id,angleExcessRadians:f.worst.value,leverMetres:lever,angleOnlyCssPixelBound:angleChord*scale,withIndependentWholeCaseAnchorGapCssPixelBound:(angleChord+r.diagnostics.maxHingeAnchorError)*scale,longestAngularThresholdSeconds:Math.max(...r.diagnostics.phases.flatMap(p=>Object.values(p)).map(p=>p.longestAngularSeconds))});
 }
}
writeFileSync('docs/reviews/iteration-38/angular-severity.json',JSON.stringify({protocol:'Read-only single affected body chord bound from actual maximum-error frozen poses and authored local hinge anchor. Polygon skin0.01m included.374CSSpx portrait canvas. Combined bound adds independent whole-case maximum hinge-anchor gap; not a measured image difference, downstream-chain bound or continuous human perception test. No corrected pose constructed.',rows},null,2)+'\n');
