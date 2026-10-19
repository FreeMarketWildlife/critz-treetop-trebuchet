// One authored layout. All dimensions are provisional prototype meters, not lore.
export const world = Object.freeze({ launchHeight:300, canopyTop:120, ground:0,
  regions:Object.freeze(['Grandfather Tree branches/leaves → open-air freefall','Long jungle-canopy descent','Ground travel while horizontal momentum remains']) });
export function regionAt(y) { return y>world.canopyTop?'Branches / open air':y>world.ground?'Jungle canopy':'Ground'; }
