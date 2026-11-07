from pathlib import Path
from lxml import html
from urllib.parse import urlsplit,unquote
import fitz,hashlib,subprocess,json
root=Path('.').resolve()
soup=html.fromstring((root/'printables.html').read_text())
errors=[]
for el in soup.xpath('//*[@href or @src]'):
 val=el.get('href') or el.get('src')
 u=urlsplit(val)
 if u.scheme or u.netloc: continue
 f=root/unquote(u.path) if u.path else root/'printables.html'
 if f.is_dir(): f=f/'index.html'
 if not f.exists(): errors.append(f'Missing {val}'); continue
 if u.fragment:
  dest=html.fromstring(f.read_text()) if f.suffix=='.html' else soup
  if not dest.xpath('//*[@id=$id]',id=u.fragment): errors.append(f'Missing anchor {val}')
assert not errors, errors
assert len(soup.xpath('//*[@class="design-option"]'))==6
assert len(soup.xpath('//*[@class="design-option" and @aria-pressed="true"]'))==1
assert len(soup.xpath('//h1'))==1
checksums=json.loads((root/'qa-printables/pdf-sha256.json').read_text())
expected={'Color_Cards':10,'Print_Guide':6,'Card_Holder':1,'Parent_Guide':2,'Alignment_Test':2}
for pdf in (root/'printables/genesis').glob('*.pdf'):
 doc=fitz.open(pdf); key=pdf.stem.removeprefix('ReidKids_Genesis_')
 assert len(doc)==expected.get(key,2),(pdf,len(doc))
 assert all(tuple(page.rect)==(0,0,612,792) for page in doc),pdf
 assert hashlib.sha256(pdf.read_bytes()).hexdigest()==checksums[pdf.name], pdf
 print(f'PASS {pdf.name}: {len(doc)} US Letter pages; frozen-source SHA256 {hashlib.sha256(pdf.read_bytes()).hexdigest()}')
for name in ['snake.html','snake.js','snake-engine.js','manna.html','manna.js','manna-engine.js','checkers.html','studio/app.js']:
 before=subprocess.check_output(['git','show','HEAD:'+name])
 assert (root/name).read_bytes()==before,name
print('PASS all page asset and anchor links, 6 design choices, accessible heading, frozen PDF integrity, game and studio source preservation')
