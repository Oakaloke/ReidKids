"""Generate progressive-enhancement HTML. Run from repository root; no site build needed.
Only add collections after all their real assets are reviewed. Missing files abort output.
"""
from pathlib import Path
from html import escape as e
import json

root=Path(__file__).resolve().parents[1]
data=json.loads((root/'printables/collections.json').read_text())
collections=data['collections']; designs=data['designs']
assert collections and collections[0]['id']=='genesis'
assert len({c['id'] for c in collections})==len(collections)
assert len(designs)==6

def path(c,name):
    value=f"printables/{c['id']}/{name}"
    assert (root/value).is_file(),f'Missing final asset: {value}'
    return e(value,quote=True)

def pdf(c,suffix): return path(c,c['prefix']+'_'+suffix)
def preview(c,d,side): return path(c,d['id']+'-'+side+'.png')
def filename(c,suffix): return e(c['prefix']+'_'+suffix)
def alt(c,d,side):
    return e(f"{d['title']} design, {c['firstReference']} " + ('reference front' if side=='front' else 'verse back: '+c['firstVerse']),quote=True)

def render_collection(c,n):
    cid=e(c['id']); title=e(c['title']); first=designs[0]
    buttons=[]; downloads=[]
    for i,d in enumerate(designs):
        buttons.append(f'''<button class="design-option" type="button" data-theme="{e(d['id'])}" data-title="{e(d['title'])}" data-description="{e(d['description'])}" data-pdf="{pdf(c,d['suffix'])}" data-front="{preview(c,d,'front')}" data-back="{preview(c,d,'back')}" data-front-alt="{alt(c,d,'front')}" data-back-alt="{alt(c,d,'back')}" aria-pressed="{str(i==0).lower()}"><img src="{preview(c,d,'front')}" width="702" height="432" alt="" loading="lazy"><span>{e(d['title'])}</span><span class="selected-mark" aria-hidden="true">✓</span></button>''')
        downloads.append(f'''<li><a href="{pdf(c,d['suffix'])}" download>{e(d['title'])} cards <span>2-page PDF ↓</span><small>{filename(c,d['suffix'])}</small></a></li>''')
    downloads.append(f'''<li><a href="{pdf(c,'Color_Cards.pdf')}" download>All five color designs <span>10-page PDF ↓</span><small>{filename(c,'Color_Cards.pdf')}</small></a></li>''')
    verses=''.join(f"<li><strong>{e(v['reference'])}</strong> {e(v['topic'])}</li>" for v in c['verses'])
    assert len(c['verses'])==8
    resources=[]
    for suffix,label,caption,pages,icon in [('Parent_Guide.pdf','Parent guide','Printing, lamination & learning prompts',c.get('parentPages',2),'↗'),('Alignment_Test.pdf','Alignment test','Check your printer before the real set',2,'⊞'),('Card_Holder.pdf','Foldable card holder','Print one-sided at 100%, then cut & fold',1,'▱')]:
        resources.append(f'''<a href="{pdf(c,suffix)}" download><span class="resource-icon" aria-hidden="true">{icon}</span><strong>{label}</strong><span>{caption}</span><small>{pages}-page PDF ↓</small><span class="resource-filename">{filename(c,suffix)}</span></a>''')
    context=f"<p>{e(c['context'])}</p>" if c.get('context') else ''
    return f'''<section class="collection-section container" id="{cid}" data-collection="{cid}" aria-labelledby="{cid}-title">
<div class="set-heading"><div><p class="print-eyebrow">{e(c['group'].upper())} · {title.upper()}</p><h2 id="{cid}-title">{e(c['heading'])}</h2><p>{e(c['description'])}</p></div><span class="set-number" aria-hidden="true">{n:02d}</span></div>
<noscript><p class="no-script-note">The preview controls need JavaScript. Every PDF is available in <a href="#{cid}-downloads">All {title} downloads</a> and the guide links below.</p></noscript>
<div class="design-workspace"><div class="design-preview"><div class="preview-cards"><figure><img class="preview-front" src="{preview(c,first,'front')}" width="702" height="432" alt="{alt(c,first,'front')}" loading="lazy"><figcaption>Reference front</figcaption></figure><figure><img class="preview-back" src="{preview(c,first,'back')}" width="702" height="432" alt="{alt(c,first,'back')}" loading="lazy"><figcaption>Full verse back</figcaption></figure></div><p class="preview-caption">A closer look at card 01. Each download includes all eight cards.</p></div>
<div class="design-controls"><p class="step-label">2 · PICK A DESIGN</p><h3 class="selected-title">Rainbows</h3><p class="selected-description">{e(first['description'])}</p><div class="design-options" role="group" aria-label="Preview a {title} card design">{''.join(buttons)}</div><p class="design-note">Every design is for every child. Pick a favorite.</p><a class="btn btn--royal download-main selected-download" href="{pdf(c,first['suffix'])}" download>Download Rainbows PDF <span aria-hidden="true">↓</span></a><p class="download-meta">Free · 2 pages · Eight double-sided cards</p><p class="download-filename">{filename(c,first['suffix'])}</p><p class="print-first">First time? <a href="#print-help">Read the print tips below.</a></p><p class="visually-hidden design-status" role="status" aria-live="polite"></p></div></div>
<details class="all-downloads" id="{cid}-downloads"><summary>All {title} downloads</summary><div class="download-list-wrap"><ul class="download-list">{''.join(downloads)}</ul><p>The combined PDF includes five color designs, two pages per design. Print just your favorite pair, or use its separate PDF above. Every design repeats the same eight verses.</p></div></details>
<details class="verse-details"><summary>Which eight verses are included?</summary><div><ul class="verse-list">{verses}</ul><p>These are complete, unabridged verses from the <a href="https://ebible.org/eng-web/">World English Bible Classic</a>, a <a href="https://ebible.org/eng-web/copyright.htm">public-domain translation</a>. “Yahweh” is God’s name, often shown as “LORD” in other translations. The parent guide includes short discussion prompts and the surrounding passages to read together.</p>{context}<p>Designs are decorative themes, not illustrations of the Bible passages.</p></div></details>
<div class="collection-resources" aria-labelledby="{cid}-resources-title"><h3 id="{cid}-resources-title">Print & learn: {title}</h3><div class="help-downloads">{''.join(resources)}</div><p class="combined-guide"><a href="{pdf(c,'Print_Guide.pdf')}" download>Download the complete {c.get('guidePages',6)}-page print guide ↓</a><span>{e(c.get('guideDescription','Includes instructions, holder, a deliberate blank page, and the two-page alignment test.'))}</span><span class="resource-filename">{filename(c,'Print_Guide.pdf')}</span></p></div>
</section>'''

groups=[]
for group in ['Books','Themes']:
    links=[]
    for c in collections:
        if c['group']==group:
            links.append(f'''<a class="collection-option" href="#{e(c['id'])}" data-select-collection="{e(c['id'])}"><span>{e(c['title'])}</span><small>8 verse cards · 6 designs</small><span class="collection-selected" aria-hidden="true">Selected ✓</span></a>''')
    if links: groups.append(f'''<div class="collection-group"><h3>{group}</h3><div class="collection-options">{''.join(links)}</div></div>''')
chooser=f'''<section class="collection-chooser container" id="collections" aria-labelledby="collections-title"><p class="step-label">1 · CHOOSE A COLLECTION</p><h2 id="collections-title">Find your next verse.</h2><p>Choose a book or a theme, then pick a design. Every collection has eight pocket cards and its own parent guide.</p><nav class="collection-groups" aria-label="Bible printable collections">{''.join(groups)}</nav><p class="visually-hidden" id="collection-status" role="status" aria-live="polite"></p></section>'''
body=chooser+'\n'+ '\n'.join(render_collection(c,i+1) for i,c in enumerate(collections))
# Preserve the original Genesis all-downloads fragment as an alias.
body=body.replace('<details class="all-downloads" id="genesis-downloads">','<span id="all-downloads"></span><details class="all-downloads" id="genesis-downloads">')
output=(root/'tools/printables-template.html').read_text().replace('{{COLLECTIONS}}',body)
(root/'printables.html').write_text(output)
print('Generated printables.html for '+', '.join(c['title'] for c in collections))
