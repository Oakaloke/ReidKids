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
data=json.loads((root/'printables/collections.json').read_text())
assert len(soup.xpath('//*[@class="design-option"]'))==6*len(data['collections'])
assert len(soup.xpath('//*[@class="design-option" and @aria-pressed="true"]'))==len(data['collections'])
ids=soup.xpath('//@id')
assert len(ids)==len(set(ids)), 'Duplicate DOM IDs'
assert not soup.xpath('//*[@data-collection and @hidden]'), 'No-JavaScript fallback must show every collection'
assert len(soup.xpath('//*[@data-select-collection]'))==len(data['collections'])
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
print('PASS all page asset and anchor links, collection choices, six designs each, unique IDs, no-JavaScript HTML fallback, frozen Genesis PDF integrity, game and studio preservation')

# Every new published asset matches the imported, reviewed source bytes.
new_manifest=root/'qa-printables/collection-assets-sha256.json'
if new_manifest.exists():
 for rel,sha in json.loads(new_manifest.read_text()).items():
  assert hashlib.sha256((root/rel).read_bytes()).hexdigest()==sha,rel
 for c in data['collections']:
  directory=root/'printables'/c['id']
  counts={'Color_Cards':10,'Print_Guide':c.get('guidePages',6),'Card_Holder':1,'Parent_Guide':c.get('parentPages',2),'Alignment_Test':2}
  pdfs=list(directory.glob('*.pdf')); assert len(pdfs)==11,(c['id'],len(pdfs))
  for pdf in pdfs:
   doc=fitz.open(pdf); key=pdf.stem.removeprefix(c['prefix']+'_')
   assert len(doc)==counts.get(key,2),(pdf,len(doc))
   assert all(tuple(page.rect)==(0,0,612,792) for page in doc),pdf
   assert soup.xpath('//a[@href=$path]',path=str(pdf.relative_to(root))),pdf
  for d in data['designs']:
   for side in ['front','back']:
    image=directory/(d['id']+'-'+side+'.png')
    pix=fitz.Pixmap(str(image)); assert (pix.width,pix.height)==(702,432),image
 # The data model and generated page are public, so never include local source metadata.
 for file in ['printables/collections.json','printables.html','printables.js']:
  content=(root/file).read_text()
  assert not any(x in content for x in ['/workspace/','/tmp/','source_file','brief_file','transcript_evidence']),file
 print(f"PASS all {len(data['collections']) * 11} PDFs: real direct links, correct page counts and US Letter dimensions; {len(data['collections']) * 12} preview images; {len(json.loads(new_manifest.read_text()))} frozen asset hashes; sanitized catalog")

# Every already published PDF and preview remains byte-identical.
published = subprocess.check_output(['git', 'ls-tree', '-r', '--name-only', 'HEAD', 'printables']).decode().splitlines()
for relative in published:
 if Path(relative).suffix not in ['.pdf', '.png']: continue
 assert (root/relative).read_bytes() == subprocess.check_output(['git', 'show', 'HEAD:'+relative]), relative
book_order = ['genesis', 'exodus', 'leviticus', 'numbers', 'deuteronomy']
assert [c['id'] for c in data['collections'] if c['group']=='Books'] == book_order
assert [c['id'] for c in data['collections'] if c['group']=='Themes'] == ['spiritual-armor', 'fruit-of-the-spirit']
assert all(c['parentPages']==3 and c['guidePages']==8 for c in data['collections'] if c['id'] in book_order[2:])
print('PASS canonical book order, two completed themes, new guide page counts, and byte preservation of all published printable assets')
