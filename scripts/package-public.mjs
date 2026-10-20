import {cp,mkdir,readFile,writeFile} from 'node:fs/promises';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';

const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const target=resolve(root,process.argv[2]??'sites/treetop-trebuchet');
const manifest=JSON.parse(await readFile(resolve(root,'.openai/hosting.json'),'utf8'));
const existing=JSON.parse(await readFile(resolve(target,'.openai/hosting.json'),'utf8'));
if(existing.project_id!==manifest.project_id)throw Error('Publication checkout belongs to another Site.');
const dist=resolve(target,'dist');await mkdir(dist,{recursive:true});
for(const name of ['index.html','editor.html','editor.css','workshop.css','mobile.css','mechanism-lab.html','atlas.html','src','vendor']){
 await cp(resolve(root,name),resolve(dist,name),{recursive:true});
}
await mkdir(resolve(dist,'docs/custom-workshop'),{recursive:true});
await cp(resolve(root,'docs/custom-workshop/research.html'),resolve(dist,'docs/custom-workshop/research.html'));
await writeFile(resolve(target,'.openai/hosting.json'),JSON.stringify({...existing,static:{directory:'dist'}},null,2)+'\n');
console.log('Public runtime and editor copied; existing Site identity retained.');
