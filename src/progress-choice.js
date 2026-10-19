import {createEconomyState,validateState} from './economy.js';
const SAVE='critz-prototype-economy-v1',BACKUP='critz-prototype-economy-backup-v1';
const copy=s=>JSON.parse(JSON.stringify(validateState(s)));
export function sameProgress(a,b){return JSON.stringify(copy(a))===JSON.stringify(copy(b));}
export function hasProgress(s){return !sameProgress(s,createEconomyState());}
export function inspectProgressChoice(storage,current){
 if(!storage)throw new Error('Device storage unavailable');
 const raw=storage.getItem(SAVE),previous=raw===null?null:copy(JSON.parse(raw));
 return {previous,conflict:!!previous&&hasProgress(current)&&!sameProgress(current,previous)};
}
export function readProgressBackup(storage){
 const raw=storage?.getItem(BACKUP);if(raw===null||raw===undefined)return null;
 const envelope=JSON.parse(raw);if(envelope?.version!==1)throw new Error('Invalid recovery version');
 const active=copy(envelope.active),backup=copy(envelope.backup),primaryRaw=storage.getItem(SAVE);
 const primary=primaryRaw===null?null:copy(JSON.parse(primaryRaw));
 // Interrupted replacement: primary still holds the old alternative. Expose the
 // intended active version, otherwise Restore would just load primary again.
 return primary&&sameProgress(primary,backup)&&!sameProgress(active,backup)?active:backup;
}
// One recovery write contains BOTH versions before replacing the primary save.
// A quota/write failure never replaces the caller's in-memory economy. Even a
// failed primary write leaves both alternatives recoverable in this envelope.
export function commitProgressChoice(storage,current,previous,choice){
 if(!storage)throw new Error('Device storage unavailable');
 if(!['current','previous'].includes(choice))throw new RangeError('Choose progress to keep');
 const selected=copy(choice==='current'?current:previous),other=previous?copy(choice==='current'?previous:current):null;
 if(other&&!sameProgress(selected,other))storage.setItem(BACKUP,JSON.stringify({version:1,active:selected,backup:other}));
 storage.setItem(SAVE,JSON.stringify(selected));return selected;
}
export function swapProgressBackup(storage,current){const backup=readProgressBackup(storage);if(!backup)throw new Error('No backup available');return commitProgressChoice(storage,current,backup,'previous');}
