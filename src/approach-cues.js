/** Read-only linear approach estimate for already-existing physical encounters.
 * It never spawns, moves or changes collision bounds. Conservative payload radius
 * can warn about near misses; acceleration/rotation make this advisory, not a hit prediction.
 */
export function approachCues(player,encounters,{camera,width,height,scale,horizon=1.2,payloadRadius=1.5}={}){
 if(!player||!camera||![player.x,player.y,player.vx,player.vy,camera.x,camera.y,width,height,scale,horizon,payloadRadius].every(Number.isFinite)||width<100||height<120||scale<=0||horizon<=0||payloadRadius<0)return [];
 const project=p=>({x:width/2+(p.x-camera.x)*scale,y:height/2-(p.y-camera.y)*scale}),origin=project(player),cues=[];
 for(const e of encounters){if(![e.x,e.y,e.vx,e.vy,e.radius].every(Number.isFinite)||e.radius<=0)continue;
  const dx=e.x-player.x,dy=e.y-player.y,vx=player.vx-e.vx,vy=player.vy-e.vy,speed2=vx*vx+vy*vy;
  if(speed2<1)continue;const time=(dx*vx+dy*vy)/speed2;
  if(time<=0||time>horizon||Math.hypot(dx-vx*time,dy-vy*time)>e.radius+payloadRadius)continue;
  const p=project(e),r=e.radius*scale;
  if(p.x+r>=0&&p.x-r<=width&&p.y+r>=0&&p.y-r<=height)continue;
  const ex=p.x-origin.x,ey=p.y-origin.y;
  const limits=[ex>0?(width-24-origin.x)/ex:ex<0?(24-origin.x)/ex:Infinity,ey>0?(height-24-origin.y)/ey:ey<0?(80-origin.y)/ey:Infinity];
  const t=Math.max(0,Math.min(1,...limits)),x=origin.x+ex*t,y=origin.y+ey*t;
  if(Math.hypot(x-origin.x,y-origin.y)<44)continue;
  cues.push({id:e.id,kind:e.kind,x,y,angle:Math.atan2(ey,ex),time});
 }
 return cues.sort((a,b)=>a.time-b.time||String(a.id).localeCompare(String(b.id))).slice(0,3);
}
