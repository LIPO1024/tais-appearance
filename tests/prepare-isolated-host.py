"""Prepare a separate Zotero profile/data directory with sync disabled. Never use the personal profile."""
from pathlib import Path
import json,zipfile,shutil,os
from reportlab.pdfgen import canvas
root=Path(__file__).resolve().parent.parent
qa=root/'qa-local';profile=qa/'profile';data=qa/'data';extensions=profile/'extensions'
if profile.exists():raise SystemExit('Isolated profile already exists; inspect before reuse')
extensions.mkdir(parents=True);data.mkdir()
fixture=qa/'original-reader-fixture.pdf'
c=canvas.Canvas(str(fixture),pagesize=(600,800),invariant=1);c.setTitle('TAIS original reader acceptance fixture')
c.setFont('Helvetica-Bold',18);c.drawString(48,744,'TAIS Appearance: original reading fixture');c.setFont('Helvetica',12)
for i,t in enumerate(['This document contains only original test material.','Selection marker: TAIS-DPI-ORIGINAL-20261114.','Zoom must be controlled by Zotero and PDF.js.','A display transition must not edit the document.','Text selection, annotation placement and readability need separate checks.']):c.drawString(48,704-i*24,t)
c.rect(48,420,180,100);c.setFont('Helvetica',10);c.drawString(56,466,'100 pt high reference rectangle');c.showPage();c.save()
prefs={'extensions.zotero.dataDir':str(data),'extensions.zotero.useDataDir':True,'extensions.zotero.sync.autoSync':False,'extensions.zotero.httpServer.enabled':False,'extensions.zotero.firstRun2':False,'extensions.autoDisableScopes':0,'extensions.enabledScopes':15,'extensions.startupScanScopes':15,'extensions.update.enabled':False,'app.update.auto':False,'app.update.enabled':False,'extensions.zotero.automaticScraperUpdates':False,'browser.shell.checkDefaultBrowser':False}
(profile/'user.js').write_text('\n'.join('user_pref('+json.dumps(k)+','+json.dumps(v)+');' for k,v in prefs.items()),encoding='utf-8')
shutil.copy2(root/'dist/TAIS_Appearance-2.5.0beta1.xpi',extensions/'tais-zotero-glass@tais.local.xpi')
manifest={'manifest_version':2,'name':'TAIS isolated acceptance probe','version':'1.0','applications':{'zotero':{'id':'tais-display-probe@tais.local','strict_min_version':'10.0','strict_max_version':'10.0.*'}}}
moves=json.loads(os.environ.get('TAIS_TEST_MOVE_POINTS','[[50,50]]'))
if not isinstance(moves,list) or not 1<=len(moves)<=8 or any(not isinstance(p,list) or len(p)!=2 or any(not isinstance(n,(int,float)) or not -16000<=n<=16000 for n in p) for p in moves):raise SystemExit('Invalid move points')
js=(root/'tests/isolated-host-probe.js').read_text(encoding='utf-8').replace('MOVE_POINTS',json.dumps(moves))
js=js.replace('EXPECTED_DATA',json.dumps(str(data))).replace('OUTPUT_PATH',json.dumps(str(qa/'host-result.json'))).replace('FIXTURE_PATH',json.dumps(str(fixture)))+'\nstartup();\n'
src=root/'dist/TAIS_Appearance-2.5.0beta1.xpi'
with zipfile.ZipFile(src) as z: files={n:z.read(n) for n in z.namelist()}
b=files['bootstrap.js'].decode();anchor='  await Zotero.TAISZoteroGlass.hooks.onStartup();';assert anchor in b
b=b.replace(anchor,anchor+'\n  Services.scriptloader.loadSubScript(baseURI+"qa-host-probe.js",{Zotero,Services,ChromeUtils,Ci:Components.interfaces,Cu:Components.utils});')
files['bootstrap.js']=b.encode();files['qa-host-probe.js']=js.encode()
with zipfile.ZipFile(extensions/'tais-zotero-glass@tais.local.xpi','w',zipfile.ZIP_DEFLATED) as z:
 for n,b in files.items():z.writestr(n,b)
print(json.dumps({'profile':str(profile),'data':str(data),'result':str(qa/'host-result.json'),'instrumentedTestCopy':True},indent=2))
