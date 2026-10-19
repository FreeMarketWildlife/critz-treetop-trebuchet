// Original, static trim below the real contact plane. Never adds a platform,
// changes collision bounds, or hides actors. Coordinates are panel-local pixels.
export function drawSurfaceTrim(ctx,{x1,x2,y,width,height,ground=false}){
 if(![x1,x2,y,width,height].every(Number.isFinite)||width<=0||height<=0||y< -14||y>height)return;
 const left=Math.max(0,Math.min(x1,x2)),right=Math.min(width,Math.max(x1,x2));if(right<=left)return;
 ctx.save();ctx.beginPath();ctx.rect(left,y+2,right-left,Math.max(0,height-y-2));ctx.clip();
 ctx.fillStyle=ground?'#987957':'#806342';ctx.fillRect(left,y+2,right-left,ground?Math.max(0,height-y-2):8);
 // A fixed bounded rhythm of soil flecks / hanging leaves; no per-frame jitter.
 const step=Math.max(32,(right-left)/24);for(let x=left+12;x<right;x+=step){
  ctx.fillStyle=ground?'#b69b70':'#61804d';ctx.beginPath();ctx.ellipse(x,y+(ground?9:12),ground?4:7,ground?1.5:3,ground?0:.35,0,Math.PI*2);ctx.fill();
 }
 ctx.restore();
}
