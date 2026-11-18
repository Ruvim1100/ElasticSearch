import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';
const roadmap=JSON.parse(await readFile('site/data/roadmap.json','utf8'));
const catalog=JSON.parse(await readFile('site/data/catalog.json','utf8'));
test('roadmap and catalog describe same modules',()=>{assert.equal(catalog.modules.length,roadmap.modules.length);assert.equal(catalog.planned,roadmap.totalPlannedLessons)});
test('all published lessons are accessible and uniquely identified',async()=>{
 const seen=new Set();
 for(const mod of catalog.modules){
  assert.equal(mod.planned,roadmap.modules.find(x=>x.id===mod.id).lessons);
  for(const lesson of mod.lessons){
   assert.ok(!seen.has(lesson.id));seen.add(lesson.id);
   assert.equal(lesson.moduleId,mod.id);
   assert.ok(lesson.href.startsWith('lessons/'+lesson.id+'/'));
   await stat('site/'+lesson.href);
  }
 }
});
test('offline script includes the generated catalog',async()=>{
 const script=await readFile('site/data/catalog.js','utf8');
 assert.ok(script.startsWith('window.ACADEMY_CATALOG = '));
 assert.deepEqual(JSON.parse(script.replace(/^window\.ACADEMY_CATALOG = /,'').trim().replace(/;$/,'')),catalog);
});