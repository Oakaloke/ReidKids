"""Import reviewed new collections without changing published asset bytes.

The source and sanitized catalog are explicit authoring inputs. This helper is
never used at deployment time; review and freeze the artifacts before running it.
"""
import argparse
import hashlib
import json
import shutil
from pathlib import Path

parser = argparse.ArgumentParser()
parser.add_argument('--source', required=True, type=Path, help='Reviewed output directory')
parser.add_argument('--catalog', required=True, type=Path, help='Sanitized approved full catalog')
parser.add_argument('--manifest', required=True, type=Path, help='Frozen reviewed output manifest')
parser.add_argument('--collections', nargs='+', required=True, help='New collection IDs to import')
args = parser.parse_args()
root = Path(__file__).resolve().parents[1]
data = json.loads(args.catalog.read_text())
existing = json.loads((root / 'printables/collections.json').read_text())
old = {c['id']: c for c in existing['collections']}
new = {c['id']: c for c in data['collections']}
selected = set(args.collections)
reviewed = {book['slug']: book for book in json.loads(args.manifest.read_text())}
assert set(reviewed) == selected, 'Review manifest must identify exactly the new collections'
approved_hashes = {}
for slug, book in reviewed.items():
    for item in book['files'] + book['preview_files']:
        approved_hashes[args.source / slug / item['name']] = item['sha256']
assert len(new) == len(data['collections']), 'Duplicate collection IDs'
assert data['collections'][0]['id'] == 'genesis'
assert existing['designs'] == data['designs'], 'Keep published design definitions unchanged'
assert set(new) == set(old) | selected, 'Catalog must retain every existing collection'
for slug, collection in old.items():
    assert new[slug] == collection, f'Existing metadata changed: {slug}'
assert not selected & set(old), 'Only import new collections; published assets are immutable'
assert all(new[slug].get('parentPages') == 3 and new[slug].get('guidePages') == 8 for slug in selected)
for collection in data['collections']:
    assert len(collection['verses']) == 8, collection['id']
serialized = json.dumps(data, ensure_ascii=False, indent=2) + '\n'
assert not any(value in serialized for value in ['/workspace/', '/tmp/', 'source_file', 'brief_file', 'transcript_evidence'])
plan = []
for collection in data['collections']:
    slug = collection['id']
    if slug not in selected:
        continue
    source = args.source / slug
    suffixes = [design['suffix'] for design in data['designs']]
    suffixes += ['Color_Cards.pdf', 'Parent_Guide.pdf', 'Print_Guide.pdf', 'Alignment_Test.pdf', 'Card_Holder.pdf']
    for suffix in suffixes:
        name = collection['prefix'] + '_' + suffix
        plan.append((source / name, root / 'printables' / slug / name))
    for design in data['designs']:
        for side in ['front', 'back']:
            name = design['id'] + '-' + side + '.png'
            plan.append((source / 'previews' / (slug + '-' + name), root / 'printables' / slug / name))
for source, destination in plan:
    assert source.is_file(), f'Missing reviewed asset: {source}'
    assert source in approved_hashes, f'Asset is absent from the reviewed manifest: {source}'
    assert hashlib.sha256(source.read_bytes()).hexdigest() == approved_hashes[source], f'Asset changed since review: {source}'
    assert not destination.exists(), f'Refusing to replace an existing asset: {destination}'
manifest_path = root / 'qa-printables/collection-assets-sha256.json'
manifest = json.loads(manifest_path.read_text()) if manifest_path.exists() else {}
for relative, sha in manifest.items():
    assert hashlib.sha256((root / relative).read_bytes()).hexdigest() == sha, relative
for source, destination in plan:
    destination.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(source, destination)
    sha = hashlib.sha256(source.read_bytes()).hexdigest()
    assert sha == hashlib.sha256(destination.read_bytes()).hexdigest()
    manifest[str(destination.relative_to(root))] = sha
(root / 'printables/collections.json').write_text(serialized)
manifest_path.write_text(json.dumps(manifest, indent=2) + '\n')
print(f'Copied and byte-verified {len(plan)} reviewed new assets; retained existing assets and metadata. Run the generator and all QA before publishing.')
