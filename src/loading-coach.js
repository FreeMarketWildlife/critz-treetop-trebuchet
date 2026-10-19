/** Observes real contact/motion; never changes a pose or imposes a settling timer. */
export function createLoadingCoach(){let touched=false;return {update(scene,{fraction=.6,held=false}={}){
 if(scene.phase==='wind-stalled')return {reason:'The motor did not reach its target. Retry this volunteer at medium winding or adjust hardware.',retry:true};
 if(scene.phase!=='loading')return {reason:'',retry:false};
 const q=scene.loadingStatus(),c=scene.center(),cup=scene.pouch.getPosition();touched ||=q.contacting;
 if(scene.hardwareHasEscaped?.())return {reason:'The release bead has left its rail while loading. Retry this volunteer; compare rail or sling settings.',retry:true};
 if(held)return {reason:scene.forceCapped?'Grip force cap reached. Move gently, lower over the cradle, then release.':'Lower the volunteer over the cradle, then release your grip.',retry:false};
 if(touched&&!q.contacting&&(c.y<cup.y-.5||Math.abs(c.x-cup.x)>1.4))return {reason:`Contact was lost; the volunteer is ${c.y<cup.y-.5?'below':'beside'} the cradle. Re-grip from the branch or retry at medium winding.`,retry:true};
 if(q.contacting&&q.withinEnvelope)return {reason:q.relativeSpeed>.35||q.maxPartRelativeSpeed>.35?`Contact ready, but the load is moving (${q.relativeSpeed.toFixed(1)} m/s relative). Unlatch is available; waiting changes the shot.`:'Contact ready. Unlatch when you want to test this pose.',retry:false};
 if(q.withinEnvelope)return {reason:'Near the cradle, without supporting contact. Let gravity lower the volunteer into it.',retry:false};
 if(fraction<.3)return {reason:`Low winding; cradle moving ${q.cradleSpeed.toFixed(1)} m/s. Lift over its center. A brief contact window may be usable; medium winding is easier to retry.`,retry:true};
 return {reason:'Lift the volunteer above the green cradle and release gently so gravity seats it.',retry:false};
 }};}
