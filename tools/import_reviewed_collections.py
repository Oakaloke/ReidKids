"""Copy a reviewed three-collection asset freeze, then generate the complete library.
Requires an explicit source directory and sanitized catalog. Never runs at deploy time.
"""
import argparse,hashlib,json,shutil
from pathlib import Path

parser=argparse.ArgumentParser()
parser.add_argument('--source',required=True,type=Path,help='Reviewed output directory')
parser.add_argument('--catalog',required=True,type=Path,help='Sanitized approved four-collection catalog')
args=parser.parse_args()
root=Path(__file__).resolve().parents[1]
data=json.loads(args.catalog.read_text())
expected={'genesis','spiritual-armor','fruit-of-the-spirit','exodus'}
assert {c['id'] for c in data['collections']}==expected
assert data['collections'][0]['id']=='genesis'
plan=[]
for c in data['collections']:
    if c['id']=='genesis': continue
    slug=c['id']; src=args.source/slug
    for suffix in [d['suffix'] for d in data['designs']]+['Color_Cards.pdf','Parent_Guide.pdf','Print_Guide.pdf','Alignment_Test.pdf','Card_Holder.pdf']:
        name=c['prefix']+'_'+suffix
        plan.append((src/name,root/'printables'/slug/name))
    for d in data['designs']:
        for side in ['front','back']:
            name=d['id']+'-'+side+'.png'
            plan.append((src/'previews'/(slug+'-'+name),root/'printables'/slug/name))
for src,dest in plan: assert src.is_file(),f'Missing approved asset {src}'
manifest={}
for src,dest in plan:
    dest.parent.mkdir(parents=True,exist_ok=True)
    shutil.copy2(src,dest)
    sha=hashlib.sha256(src.read_bytes()).hexdigest()
    assert sha==hashlib.sha256(dest.read_bytes()).hexdigest()
    manifest[str(dest.relative_to(root))]=sha
(root/'printables/collections.json').write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n')
(root/'qa-printables/collection-assets-sha256.json').write_text(json.dumps(manifest,indent=2)+'\n')
print(f'Copied and byte-verified {len(plan)} reviewed assets. Run tools/build_printables.py and all QA before publishing.')
