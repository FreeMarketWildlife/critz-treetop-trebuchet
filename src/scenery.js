/** Original decorative vectors, deliberately pale/distant so collider strokes remain readable.
 * Draw inside the caller's clipped viewport; width/height are viewport pixels.
 * camera:{x,y} is its centre in world metres, scale pixels/metre (y up).
 * All scenery is fixed authored decoration; time affects only a tiny atmospheric drift.
 * None of these silhouettes represents a collision surface.
 */
const palettes={tree:['#b8d2cb','#e6eacb','#547b68'],sky:['#a9d4ed','#eef6e8','#699ab1'],canopy:['#98bca2','#d5dfb4','#447a62'],floor:['#aab893','#e0d1a8','#637a4e']};
function biome(region){const r=String(region??'').toLowerCase();return r.includes('floor')||r==='ground'?'floor':r.includes('canopy')||r.includes('jungle')?'canopy':r.includes('sky')||r.includes('air')?'sky':'tree';}
function ellipse(ctx,x,y,rx,ry,color,angle=0){ctx.beginPath();ctx.ellipse(x,y,rx,ry,angle,0,Math.PI*2);ctx.fillStyle=color;ctx.fill();}
export function drawScenery(ctx,{width,height,region,camera={x:0,y:300},scale=24,reducedMotion=false,time=0}={}){
 if(!ctx||![width,height,scale,camera.x,camera.y,time].every(Number.isFinite)||width<=0||height<=0||scale<=0)return;
 const key=biome(region),p=palettes[key],drift=reducedMotion?0:Math.sin(time*.12)*2;
 ctx.save();ctx.beginPath();ctx.rect(0,0,width,height);ctx.clip();
 const gradient=ctx.createLinearGradient(0,0,0,height);gradient.addColorStop(0,p[0]);gradient.addColorStop(1,p[1]);ctx.fillStyle=gradient;ctx.fillRect(0,0,width,height);
 // Clouds use authored world x positions and distant parallax; never regenerate on movement.
 ctx.globalAlpha=.26;
 for(let i=0;i<7;i++){const x=width*.5+(i*95-240-camera.x*.15)*Math.min(scale,30)/24,y=height*.14+((i*47)%85)+drift;
  ellipse(ctx,x,y,50+(i%3)*14,12+(i%2)*4,'#ffffff');ellipse(ctx,x-20,y-7,25,14,'#ffffff');}
 // Fixed distant tree forms: soft background, rather than sharp walkable platforms.
 ctx.globalAlpha=key==='sky'?.06:.18;ctx.strokeStyle=p[2];ctx.lineCap='round';
 for(let i=0;i<5;i++){
  const x=width*.5+(i*150-320-camera.x*.08)*Math.min(scale,30)/24;
  ctx.lineWidth=24+(i%2)*11;ctx.beginPath();ctx.moveTo(x,height+30);ctx.bezierCurveTo(x-25,height*.65,x+35,height*.3,x+8,-50);ctx.stroke();
  ctx.lineWidth=9;ctx.beginPath();ctx.moveTo(x+5,height*.36);ctx.bezierCurveTo(x+40,height*.28,x+60,height*.22,x+100,height*.17);ctx.moveTo(x,height*.66);ctx.bezierCurveTo(x-35,height*.58,x-70,height*.57,x-115,height*.48);ctx.stroke();
 }
 if(key!=='sky'){
  ctx.globalAlpha=.14;
  for(let i=0;i<22;i++){
   const x=(i*89%Math.ceil(width+120))-60-camera.x*.015,y=key==='floor'?height-10-(i*23%70):(i*67%Math.ceil(height+80))-40;
   ellipse(ctx,x,y,20+(i%4)*6,7+(i%3)*2,p[2],(i%5-2)*.4);
  }
 }
 // Haze panel has no hard outline or collider-like boundary.
 ctx.globalAlpha=.16;ctx.fillStyle='#fff8db';ctx.fillRect(0,height*.73,width,height*.27);
 ctx.restore();
}
/** Face-only detail for original articulated shapes. Call at each head body's screen
 * position; angle is canvas-clockwise radians and size is head radius in pixels.
 * No body geometry or physics dependency. Species IDs match species.js.
 */
export function drawFace(ctx,{x,y,angle=0,size=7,species='mouse',color='#b6b0a9'}={}){
 if(!ctx||![x,y,angle,size].every(Number.isFinite)||size<=0)return;
 ctx.save();ctx.translate(x,y);ctx.rotate(angle);const s=size;
 ctx.lineWidth=Math.max(.6,s*.1);ctx.lineCap='round';
 if(['mouse','small-marsupial','chipmunk','flying-squirrel'].includes(species)){
  ellipse(ctx,-s*.45,-s*.85,s*.34,s*.38,color);ellipse(ctx,-s*.45,-s*.85,s*.18,s*.23,'#e9b9aa');
 }
 if(species==='tiny-primate'){
  ellipse(ctx,-s*.75,0,s*.4,s*.58,'#e6d7b8');ellipse(ctx,s*.2,-s*.65,s*.38,s*.4,'#e6d7b8');
 }
 if(species==='frog')ellipse(ctx,s*.15,-s*.65,s*.3,s*.3,'#9bc77b');
 if(species==='salamander')for(let i=0;i<3;i++)ellipse(ctx,-s*.6+i*s*.35,-s*.4,s*.09,s*.1,'#704e58');
 if(species==='lizard'||species==='snake'){
  ctx.strokeStyle='#5d7750';ctx.beginPath();ctx.moveTo(-s*.8,-s*.35);ctx.lineTo(-s*.3,-s*.75);ctx.lineTo(0,-s*.38);ctx.stroke();
 }
 if(species==='armadillo'){
  ctx.strokeStyle='#695e59';ctx.beginPath();ctx.moveTo(-s*.7,-s*.6);ctx.lineTo(-s*.5,s*.65);ctx.moveTo(-s*.35,-s*.7);ctx.lineTo(-s*.2,s*.68);ctx.stroke();
 }
 if(species==='turtle'){ellipse(ctx,s*.25,s*.35,s*.5,s*.3,'#b9c786');}
 // Single near-side eye reads at tiny simulation scale, with a soft snout and smile.
 ellipse(ctx,s*.35,-s*.25,s*.20,s*.24,'#fff9e9');ellipse(ctx,s*.43,-s*.24,s*.095,s*.13,'#293d37');
 ellipse(ctx,s*.76,s*.13,s*.10,s*.08,'#4d5146');ctx.strokeStyle='#596258';ctx.beginPath();ctx.arc(s*.25,s*.21,s*.28,.1,1.5);ctx.stroke();
 if(species==='chipmunk'){
  ctx.strokeStyle='#f6dfb1';ctx.beginPath();ctx.moveTo(-s*.8,s*.04);ctx.lineTo(-s*.15,s*.1);ctx.stroke();
 }
 ctx.restore();
}
/** Optional encounter markings within the caller's circular collision silhouette.
 * x/y,size are screen coordinates/radius; shapes are readable original visual cues,
 * not extra collision geometry. No animation, health or injury state.
 */
export function drawEncounterDetails(ctx,{x,y,size=12,shape='circle',color='#ad8059',angle=0}={}){
 if(!ctx||![x,y,size,angle].every(Number.isFinite)||size<=0)return;
 ctx.save();ctx.translate(x,y);ctx.rotate(angle);const s=size;
 ctx.strokeStyle='#394d43';ctx.lineWidth=Math.max(.7,s*.07);ctx.lineCap='round';
 if(shape==='wings'){
  ellipse(ctx,-s*.35,0,s*.35,s*.65,'#f4e8e6',-.35);ellipse(ctx,s*.35,0,s*.35,s*.65,'#f4e8e6',.35);ellipse(ctx,0,0,s*.12,s*.6,color);
 }else if(shape==='leaf'){
  ctx.beginPath();ctx.moveTo(-s*.7,s*.4);ctx.quadraticCurveTo(-s*.7,-s*.7,s*.65,-s*.5);ctx.quadraticCurveTo(s*.6,s*.55,-s*.7,s*.4);ctx.fillStyle='#c9dda0';ctx.fill();ctx.stroke();ctx.beginPath();ctx.moveTo(-s*.6,s*.35);ctx.lineTo(s*.5,-s*.4);ctx.stroke();
 }else if(shape==='cap'){
  ellipse(ctx,0,-s*.15,s*.8,s*.45,'#f5d9c4');for(const dx of [-.4,.15,.5])ellipse(ctx,s*dx,-s*.25,s*.09,s*.08,color);ctx.fillStyle='#f1e0b9';ctx.fillRect(-s*.15,s*.1,s*.3,s*.55);
 }else if(shape==='pod'){
  for(const dx of [-.35,0,.35]){ctx.beginPath();ctx.moveTo(dx*s,-s*.65);ctx.quadraticCurveTo((dx+.25)*s,0,dx*s,s*.65);ctx.stroke();}
 }else {
  ctx.beginPath();ctx.moveTo(0,-s*.7);ctx.lineTo(0,s*.7);ctx.stroke();ellipse(ctx,-s*.38,-s*.08,s*.12,s*.18,'#e5c894');ellipse(ctx,s*.38,-s*.08,s*.12,s*.18,'#e5c894');
 }
 ellipse(ctx,-s*.22,-s*.32,s*.09,s*.12,'#2e4438');ellipse(ctx,s*.22,-s*.32,s*.09,s*.12,'#2e4438');ctx.beginPath();ctx.arc(0,-s*.08,s*.17,.15,Math.PI-.15);ctx.stroke();ctx.restore();
}
