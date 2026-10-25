import {cp,mkdir,readFile,writeFile,rm} from 'node:fs/promises';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';

const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
export const AUTHOR_ASSETS=Object.freeze(['editor.html','editor.css','world-workshop.css','src/map-editor.js','src/editor-entry.js','src/world-workshop.js','src/grove-editor-tools.js']);
export async function packagePublic(target){
 target=resolve(target);
 const manifest=JSON.parse(await readFile(resolve(root,'.openai/hosting.json'),'utf8'));
 const existing=JSON.parse(await readFile(resolve(target,'.openai/hosting.json'),'utf8'));
 if(existing.project_id!==manifest.project_id)throw Error('Publication checkout belongs to another Site.');
 const dist=resolve(target,'dist');await rm(dist,{recursive:true,force:true});await mkdir(dist,{recursive:true});
 for(const name of ['index.html','editor.html','editor.css','world-workshop.css','scale.html','scale.css','workshop.css','exchange.css','mobile.css','weapons.css','clean-play.css','assets','mechanism-lab.html','atlas.html','src','vendor']){
  await cp(resolve(root,name),resolve(dist,name),{recursive:true});
 }
 // The explicit developer route shares this same runtime. It remains unlinked
 // from ordinary Play; its browser-local edits do not publish the world.
 for(const name of ['index.html','scale.html','mechanism-lab.html']){
  const file=resolve(dist,name),html=(await readFile(file,'utf8')).replace('data-author-tools="local"','data-author-tools="explicit"').replace(/<a href="editor\.html">[^<]*<\/a>(?: · )?/g,'');
  await writeFile(file,html);
 }
 await mkdir(resolve(dist,'docs/custom-workshop'),{recursive:true});
 await cp(resolve(root,'docs/custom-workshop/research.html'),resolve(dist,'docs/custom-workshop/research.html'));
 await cp(resolve(root,'docs/world-scale'),resolve(dist,'docs/world-scale'),{recursive:true});
 for(const folder of ['user-generated-item-ideas','trebuchet-parts','mouse-model','natural-oak'])await cp(resolve(root,'docs',folder),resolve(dist,'docs',folder),{recursive:true,filter:source=>!source.endsWith('.tar.gz')});
 const githubCommit=execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).trim();
 await writeFile(resolve(dist,'release-source.json'),JSON.stringify({repository:'FreeMarketWildlife/critz-treetop-trebuchet',githubCommit,authorTools:'explicit-entry',authorEntry:'/editor.html',authorAccess:'unlinked, not authenticated; browser-local maps only'},null,2)+'\n');
 await writeFile(resolve(target,'.openai/hosting.json'),JSON.stringify({...existing,static:{...existing.static,directory:'dist'}},null,2)+'\n');
 return {dist,githubCommit};
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const result=await packagePublic(resolve(root,process.argv[2]??'sites/treetop-trebuchet'));
 console.log(JSON.stringify({message:'Player runtime, scale guide and explicit developer entry copied; Site identity retained.',...result}));
}
