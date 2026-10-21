import {PARTS,CRITTERS,STARTER,PREVIOUS_STARTER,LEGACY_STARTER,STARTER_PARTS,STARTER_ANIMALS,SLOTS,part,critter,validateBuild} from './build-catalog.js?v=30';
import {VOUCHERS,validateShop} from './build-shop.js?v=30';
export const SAVE_KEY='treetop-custom-workshop-v1';
export function newProgress(){return{version:1,starterRevision:5,vouchers:[],shop:null,bells:0,points:0,best:0,launches:0,owned:[...STARTER_PARTS],animals:[...STARTER_ANIMALS],build:{...STARTER},blueprints:[],history:[],claimed:[]};}
export function canBuild(state,build,creative=false){validateBuild(build);if(creative)return true;if(build.wind!==0||build.drag!==1)throw Error('Adventure uses calm air with air resistance. Reset Creative atmosphere settings first.');for(const[slot]of SLOTS)if(!state.owned.includes(build[slot]))throw Error(`Buy ${part(build[slot]).name} first.`);if(!state.animals.includes(build.animal))throw Error('Invite this volunteer in the shop first.');return true;}
export function buy(state,id,animal=false){const product=animal?critter(id):part(id),key=animal?'animals':'owned';if(state[key].includes(id))throw Error('Already owned.');if(state.bells<product.price)throw Error('More Bells needed.');return {...state,bells:state.bells-product.price,[key]:[...state[key],id]};}
export function rewards({distance=0,height=0,release,grams=25,failure=''}){
 if(!Number.isFinite(distance)||distance<0||!Number.isFinite(height)||height<0||!Number.isFinite(grams)||grams<=0)throw Error('Invalid shot result.');
 const d=Math.min(distance,20000),massBonus=Math.min(20,Math.max(0,Math.log10(grams/25))*3);
 return{bells:Math.floor(8+Math.sqrt(d)*7+(release?massBonus:0)),points:Math.round(d*10+Math.min(height,10000)*2),distance:d,height,release:!!release,failure};
}
export function bank(state,shotId,result,creative=false){if(creative||state.claimed.includes(shotId))return state;const reward=rewards(result);return{...state,bells:state.bells+reward.bells,points:state.points+reward.points,best:Math.max(state.best,reward.distance),launches:state.launches+1,history:[{...reward,animal:result.animal??'mouse',id:shotId},...state.history].slice(0,12),claimed:[...state.claimed,shotId].slice(-100)};}
export function validateProgress(raw){
 if(!raw||raw.version!==1)throw Error('Unsupported save.');
 for(const k of ['bells','points','launches'])if(!Number.isSafeInteger(raw[k])||raw[k]<0)throw Error('Invalid progress totals.');
 if(!Number.isFinite(raw.best)||raw.best<0||raw.best>20000)throw Error('Invalid best distance.');
 if(!Array.isArray(raw.owned)||!Array.isArray(raw.animals)||!Array.isArray(raw.blueprints)||!Array.isArray(raw.claimed)||!Array.isArray(raw.history))throw Error('Invalid save collections.');
 if(raw.owned.length>PARTS.length||raw.animals.length>CRITTERS.length||raw.blueprints.length>20||raw.claimed.length>100||raw.history.length>12)throw Error('Oversized save.');
 raw.owned.forEach(part);raw.animals.forEach(critter);if(new Set(raw.owned).size!==raw.owned.length||new Set(raw.animals).size!==raw.animals.length)throw Error('Duplicate ownership entries.');
 for(const h of raw.history){critter(h.animal);for(const k of ['distance','height','bells','points'])if(!Number.isFinite(h[k])||h[k]<0)throw Error('Invalid launch history.');if(typeof h.failure!=='string'||h.failure.length>300)throw Error('Invalid launch notes.');}
 if(!raw.animals.includes('mouse'))throw Error('Starter volunteer missing.');
 for(const id of raw.claimed)if(typeof id!=='string'||id.length>120)throw Error('Invalid shot id.');
 const vouchers=raw.vouchers??[];
 if(!Array.isArray(vouchers)||vouchers.length>VOUCHERS.length||new Set(vouchers).size!==vouchers.length||vouchers.some(id=>!VOUCHERS.some(v=>v.id===id)))throw Error('Invalid shop upgrades.');
 // Grant the complete new kit once. Migrate only the untouched old recipe;
 // preserve custom geometry, earned Bells, volunteers, history and blueprints.
 const upgraded=!raw.starterRevision;
 const wheelRevision=!raw.starterRevision||raw.starterRevision<3;
 const compactRevision=!raw.starterRevision||raw.starterRevision<5;
 const untouchedTower=compactRevision&&Object.entries(PREVIOUS_STARTER).every(([key,value])=>['name','animal','winch'].includes(key)||raw.build?.[key]===value);
 const legacy=upgraded&&Object.entries(LEGACY_STARTER).every(([key,value])=>['name','animal'].includes(key)||raw.build?.[key]===value);
 const owned=upgraded?[...new Set([...raw.owned,...STARTER_PARTS])]:raw.owned;
 const build=legacy||untouchedTower?{...STARTER,...(untouchedTower?{winch:raw.build.winch}:{}),name:raw.build.name,animal:raw.build.animal}:raw.build;
 const animals=wheelRevision?[...new Set([...raw.animals,...STARTER_ANIMALS])]:raw.animals;
 const s={...raw,starterRevision:5,owned,animals,vouchers,shop:validateShop(raw.shop,raw.launches),build:validateBuild(build),blueprints:raw.blueprints.map(validateBuild)};canBuild(s,s.build);return s;
}
export function saveProgress(storage,state){storage.setItem(SAVE_KEY,JSON.stringify(validateProgress(state)));}
export function loadProgress(storage){const data=storage.getItem(SAVE_KEY);return data?validateProgress(JSON.parse(data)):newProgress();}
