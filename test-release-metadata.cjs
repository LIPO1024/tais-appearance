const fs=require('fs'),assert=require('assert'),path=require('path');
const root=__dirname,manifest=JSON.parse(fs.readFileSync(path.join(root,'source/manifest.json'),'utf8')),updates=JSON.parse(fs.readFileSync(path.join(root,'updates.json'),'utf8')),version=manifest.version,id=manifest.applications.zotero.id,registry=JSON.parse(fs.readFileSync(path.join(root,'source/adapter-registry.json'),'utf8'));
const plan=fs.existsSync(path.join(root,'release-plan.json'))?JSON.parse(fs.readFileSync(path.join(root,'release-plan.json'),'utf8')):null;
const publicVersion=plan?.publicVersion||version;
if(plan){assert.equal(plan.sourceVersion,version);assert.equal(plan.stage,'development');assert(/beta/.test(version));}
const entry=updates.addons[id]?.updates?.[0];
assert(entry,'Update manifest must contain the TAIS add-on entry');
assert.equal(entry.version,publicVersion,'Stable feed must match the declared public version, not an unpublished candidate');
assert.equal(registry.version,version,'Adapter registry version must match the manifest');
assert.equal(entry.update_link,'https://github.com/LIPO1024/tais-appearance/releases/download/v'+publicVersion+'/TAIS_Appearance-'+publicVersion+'.xpi','Update URL must point to the matching public release asset');
assert.equal(manifest.applications.zotero.update_url,'https://raw.githubusercontent.com/LIPO1024/tais-appearance/main/updates.json','Packaged manifest must use the public update feed, never localhost');
assert.equal(manifest.homepage_url,'https://lipo1024.github.io/tais-appearance/','Packaged manifest must expose the public product homepage');
assert.equal(manifest.applications.zotero.strict_min_version,entry.applications.zotero.strict_min_version);
assert.equal(manifest.applications.zotero.strict_max_version,entry.applications.zotero.strict_max_version);
for(const file of ['source/content/integration.js','source/content/studio.js','source/content/workbench.js'])assert(fs.readFileSync(path.join(root,file),'utf8').includes(version),file+' must expose the current runtime version');
for(const file of ['README.md','README.en-US.md','README.zh-CN.md','README.ja-JP.md','README.ko-KR.md','README.fr-FR.md','index.html','showcase/index.html']){
 const content=fs.readFileSync(path.join(root,file),'utf8');
 assert(content.includes(publicVersion),file+' must advertise only the public stable version');
 assert(!content.includes('2.4.0'),file+' must not retain stale 2.4.0 release references');
}
for(const file of ['README.md','README.en-US.md','README.zh-CN.md','README.ja-JP.md','README.ko-KR.md','README.fr-FR.md','docs/USER_GUIDE.zh-CN.md','docs/USER_GUIDE.en-US.md','docs/USER_GUIDE.ja-JP.md','docs/USER_GUIDE.ko-KR.md','docs/USER_GUIDE.fr-FR.md']){
 const source=fs.readFileSync(path.join(root,file),'utf8');
 for(const match of source.matchAll(/\[[^\]]+\]\(([^)]+)\)/g)){
  const target=match[1].split('#')[0];
  if(!target||/^(https?:|mailto:|#)/i.test(target))continue;
  assert(fs.existsSync(path.resolve(root,path.dirname(file),target)),file+' has a broken local link: '+target);
 }
}
assert(!fs.readFileSync(path.join(root,'source/manifest.json'),'utf8').includes('localhost'),'Source manifest must never point to localhost');
console.log('Release metadata, localized links, and public version references: passed ('+version+')');
