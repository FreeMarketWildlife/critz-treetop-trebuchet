// Arcade preparation balance, separate from the Coulomb friction coefficient.
// Better rolling support permits a faster comfortable crank rate. This raises
// the same gravitational load; it supplies no launch impulse or range bonus.
export const BEARING_WINDING_SECONDS=Object.freeze({woodAxle:3.6,bronze:3,bearings:2.4,precision:2});
export function windingMinimum(build,{loaded=true}={}){
 if(!loaded)return 1.65; // Preserve the existing non-loading solver/lab API.
 const seconds=BEARING_WINDING_SECONDS[build.bearing];
 if(!Number.isFinite(seconds))throw Error('Unknown winding bearing.');
 return seconds;
}
