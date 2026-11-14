"""Reproducible local/release build. Public builds require explicit, valid hosting configuration."""
from pathlib import Path
import argparse,json,zipfile,hashlib,subprocess,sys,xml.etree.ElementTree as ET
from urllib.parse import urlparse
import tinycss2
W=Path(__file__).resolve().parent;R=W/'source';m=json.loads((R/'manifest.json').read_text(encoding='utf8'));V=m['version']
parser=argparse.ArgumentParser();parser.add_argument('--public',action='store_true');parser.add_argument('--config',type=Path);parser.add_argument('--out',type=Path,default=W.parent/'release');args=parser.parse_args()
assert isinstance(V,str) and V.strip()
if args.public:
 if not args.config:raise SystemExit('PUBLIC BUILD BLOCKED: provide --config with reviewed publication URLs.')
 c=json.loads(args.config.read_text(encoding='utf8'))
 for key in ['homepage_url','update_url','source_url','support_url']:
  u=urlparse(c.get(key) or '')
  if u.scheme!='https' or not u.hostname or u.hostname in ['localhost','127.0.0.1','example.com'] or u.hostname.endswith(('.invalid','.local')):raise SystemExit('PUBLIC BUILD BLOCKED: missing real HTTPS '+key)
 if c.get('license_reviewed') is not True or c.get('release_approved') is not True:raise SystemExit('PUBLIC BUILD BLOCKED: license and release approval required.')
 m['homepage_url']=c['homepage_url'];m['applications']['zotero']['update_url']=c['update_url']
for p in R.rglob('*.js'):
 result=subprocess.run(['node','--check',str(p)],capture_output=True,text=True)
 if result.returncode:raise RuntimeError(str(p)+'\n'+result.stderr)
def csscheck(rules):
 for r in rules:
  if r.type=='error':raise ValueError(r.message)
  if r.type=='qualified-rule':
   for d in tinycss2.parse_declaration_list(r.content,skip_comments=True,skip_whitespace=True):
    if d.type=='error':raise ValueError(d.message)
  elif r.type=='at-rule' and r.content is not None:csscheck(tinycss2.parse_rule_list(r.content,skip_comments=True,skip_whitespace=True))
for p in R.rglob('*.css'):csscheck(tinycss2.parse_stylesheet(p.read_text(encoding='utf8'),skip_comments=True,skip_whitespace=True))
ET.fromstring('<root xmlns:html="http://www.w3.org/1999/xhtml" xmlns="http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul">'+(R/'content/preferences.xhtml').read_text(encoding='utf8')+'</root>')
for test in ['contract-test.cjs','paper-test.cjs','test-dark.cjs','test-appearance.cjs','test-ui-2.2.cjs','test-reliability-2.2.cjs','test-brand.cjs','test-i18n.cjs','test-showcase.cjs','test-reader-safety.cjs']:
 p=W/test
 if not p.exists():raise FileNotFoundError('Required test suite missing: '+test)
 if p.exists():
  result=subprocess.run(['node',str(p)],capture_output=True,text=True)
  if result.returncode:raise RuntimeError(result.stdout+'\n'+result.stderr)
  print(result.stdout[-600:])
files={p.relative_to(R).as_posix():p.read_bytes() for p in R.rglob('*') if p.is_file() and not p.name.startswith(('CHANGELOG-','ARCHIVE-'))}
files['manifest.json']=(json.dumps(m,ensure_ascii=False,indent=2)+'\n').encode('utf8')
for required in ['LICENSE','NOTICE','content/tool-surfaces.js','content/tool-surfaces.css']:assert required in files
args.out.mkdir(parents=True,exist_ok=True);target=args.out/f'TAIS_Appearance-{V}.xpi'
def make(dest):
 with zipfile.ZipFile(dest,'w',zipfile.ZIP_DEFLATED,compresslevel=9)as z:
  for name,content in sorted(files.items()):
   info=zipfile.ZipInfo(name,date_time=(2026,11,12,0,0,0));info.compress_type=zipfile.ZIP_DEFLATED;info.external_attr=0o644<<16;z.writestr(info,content,compress_type=zipfile.ZIP_DEFLATED,compresslevel=9)
make(target);verify=W/'reproducibility-check.xpi';make(verify)
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
assert sha(target)==sha(verify);verify.unlink()
with zipfile.ZipFile(target)as z:assert z.testzip() is None
report={'version':V,'publicBuild':args.public,'package':str(target),'bytes':target.stat().st_size,'sha256':sha(target),'files':len(files),'reproducibleInEnvironment':True,'javascriptFiles':len(list(R.rglob('*.js'))),'cssFiles':len(list(R.rglob('*.css'))),'releaseBlockers':[] if args.public else ['local update URL','public repository/support URLs not configured','release and licensing review pending','cross-machine beta acceptance pending']}
(W/'build-result.json').write_text(json.dumps(report,indent=2),encoding='utf8');print(json.dumps(report,indent=2))
