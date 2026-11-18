import { readdir, readFile, writeFile, stat } from 'node:fs/promises';
import { join, resolve } from 'node:path';

const root = resolve('site');
const roadmap = JSON.parse(await readFile(join(root, 'data/roadmap.json'), 'utf8'));
const modules = roadmap.modules;
if (!Array.isArray(modules) || !modules.length) throw Error('Roadmap is empty');
const ids = new Set(), lessons = [];
for (const directory of (await readdir(join(root, 'lessons'), {withFileTypes:true})).filter(x=>x.isDirectory())) {
  const dir = join(root, 'lessons', directory.name);
  const path = join(dir, 'lesson.json');
  let metadata;
  try { metadata=JSON.parse(await readFile(path,'utf8')); } catch(e) { throw Error('Invalid lesson metadata: '+path+' '+e.message); }
  const {id,moduleId,title,durationMinutes}=metadata;
  if(!/^M\d{2}-L\d{2}$/.test(id) || id !== directory.name) throw Error('Lesson ID/path mismatch: '+id);
  if(ids.has(id)) throw Error('Duplicate lesson ID: '+id);
  ids.add(id);
  if(!modules.some(x=>x.id===moduleId)) throw Error('Unknown module: '+moduleId);
  const planned=modules.find(x=>x.id===moduleId).topics;
  if(!planned.some(x=>x.id===id)) throw Error('Lesson absent from roadmap: '+id);
  if(!title || !Number.isFinite(durationMinutes) || durationMinutes < 5) throw Error('Incomplete lesson metadata: '+id);
  await stat(join(dir,'index.html'));
  lessons.push({...metadata,href:'lessons/'+id+'/index.html'});
}
lessons.sort((a,b)=>a.id.localeCompare(b.id));
const catalog={version:roadmap.version,builtAt:roadmap.updatedAt+'T00:00:00.000Z',planned:roadmap.totalPlannedLessons,modules:modules.map(({id,title,track,lessons:count,topics})=>({id,title,track,planned:count,topics,lessons:lessons.filter(x=>x.moduleId===id)}))};
await writeFile(join(root,'data/catalog.json'),JSON.stringify(catalog,null,2)+'\n','utf8');
await writeFile(join(root,'data/catalog.js'),'window.ACADEMY_CATALOG = '+JSON.stringify(catalog)+';\n','utf8');
console.log('Catalog built: '+modules.length+' modules · '+lessons.length+'/'+catalog.planned+' published lessons');
