import {escapeAltitude} from './space-policy.js?v=35';
import {mapLevels,gravityScaleAt} from './grove-map.js?v=35';

const clamp=(v,lo,hi)=>Math.max(lo,Math.min(hi,v));
const metres=v=>`${Math.abs(v)>=1e7?v.toExponential(1):Math.round(v).toLocaleString('en-US')} m`;
/** A schematic Y-only chart: forest/tree detail is expanded and sky compressed.
 * Fractions run from the top of the strip. Never infer escape from altitude.
 * The simulation must explicitly supply spaceState === 'escaped'. */
export function altitudeStripState({map,altitude,animal,spaceState='bound',gravityFactor}={}){
 if(!map?.tree||!map?.launch)throw Error('An authored Grove map is required.');
 const treeCenter=map.tree.height/2,spaceStart=mapLevels(map).find(l=>l.id==='space').low;
 // Old custom maps can put a tall tree above the start of starlight. Keep the
 // tree centre in the middle and move the compression break above that crown.
 const skyBreak=Math.max(spaceStart,map.tree.height),top=escapeAltitude(map);
 const anchors=map.version===4?[{altitude:0,fraction:.94},{altitude:treeCenter,fraction:.5},{altitude:map.tree.height,fraction:.26},{altitude:spaceStart,fraction:.18},{altitude:top,fraction:.065}]:[{altitude:0,fraction:.94},{altitude:treeCenter,fraction:.5},{altitude:skyBreak,fraction:.24},{altitude:top,fraction:.065}];
 const fractionAt=y=>{
  if(y<=0)return anchors[0].fraction;if(y>=top)return anchors.at(-1).fraction;
  for(let i=1;i<anchors.length;i++)if(y<=anchors[i].altitude){const a=anchors[i-1],b=anchors[i],t=(y-a.altitude)/(b.altitude-a.altitude);return a.fraction+(b.fraction-a.fraction)*t;}
 };
 const known=typeof altitude==='number'&&!Number.isNaN(altitude),escaped=spaceState==='escaped';
 const edge=!known?'unknown':altitude<0?'below':altitude>top?'above':'inside';
 // Prepared volunteers still use ordinary gravity; only the released body
 // receives the map's altitude field. Prefer an explicit actual solver factor.
 const actualGravity=Number.isFinite(gravityFactor)&&gravityFactor>=0&&gravityFactor<=1?gravityFactor:null;
 const gravity=known?(actualGravity??gravityScaleAt(altitude,map)):null;
 const status=!known?'Height unknown':escaped?'Free drift':gravity<.999?'Low gravity':'In the grove';
 const altitudeLabel=!known?'Altitude unavailable':!Number.isFinite(altitude)?(altitude>0?'Above map':'Below floor'):metres(altitude);
 const displayLabel=edge==='above'?`${metres(top)}+`:edge==='below'?'Below 0 m':altitudeLabel;
 const name=animal?.name??'Critter';
 const landmarks={floor:{altitude:0,fraction:fractionAt(0)},tree:{altitude:treeCenter,fraction:fractionAt(treeCenter)},crown:{altitude:map.tree.height,fraction:fractionAt(map.tree.height)},space:{altitude:spaceStart,fraction:fractionAt(spaceStart)},top:{altitude:top,fraction:fractionAt(top)}};
 const label=`${name}: ${altitudeLabel}. ${status}${!escaped&&known?`; gravity ${Math.round(gravity*100)} percent`:''}. Height only; horizontal distance is not shown. Nonlinear scale: upper sky compressed. Forest floor 0 m; Grandfather Tree centre ${metres(treeCenter)}, crown ${metres(map.tree.height)}; starlight ${metres(spaceStart)}; free-drift boundary ${metres(top)}.${edge==='below'?' Marker is pinned below the floor.':edge==='above'?' Marker is pinned above the map.':''}`;
 return{altitude,altitudeLabel,displayLabel,animalId:animal?.id??'',spaceState:escaped?'escaped':'bound',status,gravityFactor:gravity,fraction:known?fractionAt(altitude):null,edge,anchors,landmarks,label};
}
const line=(c,points,color,width=1)=>{c.beginPath();c.moveTo(...points[0]);for(const p of points.slice(1))c.lineTo(...p);c.strokeStyle=color;c.lineWidth=width;c.stroke();};
const oval=(c,x,y,rx,ry,fill)=>{c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);c.fillStyle=fill;c.fill();};
/** Draw in CSS pixels; caller owns canvas backing scale, layout and ARIA label.
 * Pass the existing drawCritter function as drawMarker to reuse every species.
 * Stateless drawing follows pause/retry/resize without an animation clock. */
export function drawAltitudeStrip(c,{width=44,height=420,map,altitude,animal,spaceState='bound',gravityFactor,drawMarker}={}){
 if(!Number.isFinite(width)||!Number.isFinite(height)||width<=0||height<=0)throw Error('Finite positive strip dimensions required.');
 const state=altitudeStripState({map,altitude,animal,spaceState,gravityFactor}),cx=width/2,left=2,right=width-2,w=right-left;
 c.save();c.clearRect(0,0,width,height);c.lineJoin='round';c.lineCap='round';
 c.beginPath();c.roundRect(left,1,w,height-2,Math.min(12,w/2));c.clip();
 const sky=c.createLinearGradient(0,0,0,height);sky.addColorStop(0,'#212846');sky.addColorStop(.23,'#626c9a');sky.addColorStop(.43,'#b1c7aa');sky.addColorStop(.78,'#4f765b');sky.addColorStop(1,'#4e4031');c.fillStyle=sky;c.fillRect(left,1,w,height-2);
 // Fixed star/planet shapes never animate while paused or suggest X movement.
 for(const [x,y,r]of[[.22,.095,.8],[.76,.145,1],[.65,.045,.6],[.29,.19,.6]])oval(c,width*x,height*y,r,r,'#fff1c2');
 oval(c,cx,height*.1,Math.min(7,w*.2),Math.min(7,w*.2),'#d7d5b8');oval(c,cx+3,height*.1-2,Math.min(6,w*.17),Math.min(6,w*.17),'#535f7b');
 // Roots and crown span their actual model altitudes on the nonlinear chart.
 const floorY=height*state.landmarks.floor.fraction,treeY=height*state.landmarks.tree.fraction,crownY=height*state.landmarks.crown.fraction;
 c.fillStyle='#785335';c.fillRect(cx-2.8,crownY+4,5.6,floorY-crownY);
 line(c,[[cx-2,floorY-5],[cx-10,floorY+2]],'#bd9760',2);line(c,[[cx+2,floorY-5],[cx+10,floorY+3]],'#bd9760',2);
 line(c,[[cx,treeY+20],[cx-10,treeY+9]],'#bd9760',2);line(c,[[cx,treeY+7],[cx+10,treeY-4]],'#bd9760',2);
 oval(c,cx-5,crownY+7,Math.min(10,w*.3),11,'#355c47');oval(c,cx+5,crownY+8,Math.min(10,w*.3),12,'#557d50');oval(c,cx,crownY,Math.min(11,w*.32),10,'#86a76b');
 c.fillStyle='#b79560';c.fillRect(left,floorY+3,w,height-floorY);line(c,[[left,floorY+3],[right,floorY+3]],'#e3d5a1',1);
 // Unequal band spacings and this visible break/caption make compression explicit.
 const breakY=height*.24;line(c,[[left+3,breakY-3],[left+8,breakY+1],[left+13,breakY-3],[left+18,breakY+1]],'#f0e9c7',1);
 c.textAlign='center';c.textBaseline='middle';c.font=`bold ${width<42?6.8:7.4}px sans-serif`;c.fillStyle='#fff2d0';
 c.fillText(state.spaceState==='escaped'?'DRIFT':'SPACE',cx,height*.033);
 c.fillText('SKY',cx,height*.175);c.fillText('COMP.',cx,height*.198);
 c.fillStyle='#e8edc9';c.fillText('TREE',cx,treeY-8);c.fillText(metres(state.landmarks.tree.altitude),cx,treeY+2);
 c.fillStyle='#f6edcc';c.fillText('0 m',cx,Math.min(height-7,floorY+13));
 c.restore();
 // Outline and marker are outside the clipped background: arrows remain clear.
 c.save();c.beginPath();c.roundRect(left,1,w,height-2,Math.min(12,w/2));c.strokeStyle='#e4dfb9';c.lineWidth=1;c.stroke();
 if(state.fraction!==null){
  const y=clamp(height*state.fraction,13,height-18),radius=Math.min(13,w*.35);
  oval(c,cx,y,radius,radius,'#fff0ba');c.beginPath();c.ellipse(cx,y,radius,radius,0,0,Math.PI*2);c.strokeStyle='#293b36';c.lineWidth=1.5;c.stroke();
  if(drawMarker&&animal)drawMarker(c,animal,cx,y,Math.min(23,w*.68),0,false);
  else{c.font='bold 10px sans-serif';c.textAlign='center';c.textBaseline='middle';c.fillStyle='#293b36';c.fillText((animal?.name??'?').slice(0,1),cx,y);}
  if(state.edge==='above'||state.edge==='below'){const d=state.edge==='above'?-1:1,ay=y+d*(radius+3);line(c,[[cx-3,ay-d*3],[cx,ay],[cx+3,ay-d*3]],'#fff4c9',2);}
  const textY=y>height-48?y-radius-8:y+radius+8;c.font=`bold ${width<42?7:7.6}px sans-serif`;c.textAlign='center';c.textBaseline='middle';
  c.fillStyle='#293c39';c.fillRect(left+1,textY-5,w-2,10);c.fillStyle='#fff3cd';c.fillText(state.displayLabel,cx,textY,w-4);
 }
 c.restore();return state;
}
