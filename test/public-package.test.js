import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,mkdir,writeFile,readFile,access,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join,dirname,resolve} from 'node:path';
import {packagePublic,AUTHOR_ASSETS} from '../scripts/package-public.mjs';
const manifest=JSON.parse(await readFile(new URL('../.openai/hosting.json',import.meta.url),'utf8'));
test('public package retains Site identity and the complete player dependency graph with a working explicit developer entry',async()=>{
 const target=await mkdtemp(join(tmpdir(),'treetop-public-test-'));
 try{
  await mkdir(join(target,'.openai'));await writeFile(join(target,'.openai/hosting.json'),JSON.stringify({...manifest,description:'retained'}));
  await mkdir(join(target,'dist/src'),{recursive:true});await writeFile(join(target,'dist/editor.html'),'old author entry');await writeFile(join(target,'dist/src/world-workshop.js'),'old author module');
  const result=await packagePublic(target),index=await readFile(join(result.dist,'index.html'),'utf8');
  assert.match(index,/data-author-tools="explicit"/);assert.doesNotMatch(index,/id="worldEdit"|href="editor.html"/);
  for(const file of [...AUTHOR_ASSETS,'docs/user-generated-item-ideas/guillotine.html','docs/trebuchet-parts/default-trebuchet.svg'])await access(join(result.dist,file));const editor=await readFile(join(result.dist,'editor.html'),'utf8');assert.match(editor,/src\/editor-entry\.js/);assert.match(editor,/not access-controlled/);
  const visited=new Set();async function visit(file){if(visited.has(file))return;visited.add(file);const content=await readFile(file,'utf8');
   if(file.endsWith('.js'))for(const m of content.matchAll(/(?:^|\n)\s*(?:import|export)\s+(?:[^;\n]*?\s+from\s*)?['"]([^'"]+)['"]/g)){if(!m[1].startsWith('.'))continue;await visit(resolve(dirname(file),m[1].split('?')[0]));}
   if(file.endsWith('.html'))for(const m of content.matchAll(/(?:src|href)="([^"#]+\.(?:js|css)(?:\?[^" ]*)?)"/g))await visit(resolve(dirname(file),m[1].split('?')[0]));
  }
  await visit(join(result.dist,'index.html'));await visit(join(result.dist,'scale.html'));await visit(join(result.dist,'editor.html'));assert.ok(visited.size>40);assert.ok(![...visited].some(x=>x.endsWith('/map-editor.js')));
  for(const file of AUTHOR_ASSETS.filter(x=>x.endsWith('.js')))await visit(join(result.dist,file));assert.ok([...visited].some(x=>x.endsWith('/map-editor.js')));assert.ok([...visited].some(x=>x.endsWith('/grove-editor-tools.js')));
  const current=JSON.parse(await readFile(join(target,'.openai/hosting.json'),'utf8'));assert.equal(current.project_id,manifest.project_id);assert.equal(current.description,'retained');
  const release=JSON.parse(await readFile(join(result.dist,'release-source.json'),'utf8'));assert.equal(release.githubCommit,result.githubCommit);assert.equal(release.authorTools,'explicit-entry');assert.equal(release.authorEntry,'/editor.html');
 }finally{await rm(target,{recursive:true,force:true});}
});
test('public packaging refuses a different Site before copying files',async()=>{
 const target=await mkdtemp(join(tmpdir(),'treetop-public-wrong-'));try{await mkdir(join(target,'.openai'));await writeFile(join(target,'.openai/hosting.json'),JSON.stringify({project_id:'different'}));await assert.rejects(packagePublic(target),/another Site/);await assert.rejects(access(join(target,'dist')));}finally{await rm(target,{recursive:true,force:true});}
});
