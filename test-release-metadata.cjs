const fs=require('fs'),assert=require('assert'),path=require('path');
const root=__dirname,manifest=JSON.parse(fs.readFileSync(path.join(root,'source/manifest.json'),'utf8')),updates=JSON.parse(fs.readFileSync(path.join(root,'updates.json'),'utf8')),version=manifest.version,id=manifest.applications.zotero.id;
const entry=updates.addons[id]?.updates?.[0];
assert(entry,'Update manifest must contain the TAIS add-on entry');
assert.equal(entry.version,version,'Manifest and update-feed versions must match');
assert.equal(entry.update_link,'https://github.com/LIPO1024/tais-appearance/releases/download/v'+version+'/TAIS_Appearance-'+version+'.xpi','Update URL must point to the matching public release asset');
assert.equal(manifest.applications.zotero.update_url,'https://raw.githubusercontent.com/LIPO1024/tais-appearance/main/updates.json','Packaged manifest must use the public update feed, never localhost');
assert.equal(manifest.homepage_url,'https://lipo1024.github.io/tais-appearance/','Packaged manifest must expose the public product homepage');
assert.equal(manifest.applications.zotero.strict_min_version,entry.applications.zotero.strict_min_version);
assert.equal(manifest.applications.zotero.strict_max_version,entry.applications.zotero.strict_max_version);
for(const file of ['README.md','README.en-US.md','README.zh-CN.md','README.ja-JP.md','README.ko-KR.md','README.fr-FR.md','index.html','showcase/index.html']){
 const content=fs.readFileSync(path.join(root,file),'utf8');
 assert(content.includes(version),file+' must advertise the current manifest version');
 assert(!content.includes('2.4.0'),file+' must not retain stale 2.4.0 release references');
}
assert(!fs.readFileSync(path.join(root,'source/manifest.json'),'utf8').includes('localhost'),'Source manifest must never point to localhost');
console.log('Release metadata and public version references: passed ('+version+')');
