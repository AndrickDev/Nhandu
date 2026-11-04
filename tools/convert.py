"""Converte o artboard .dc.html do canvas em um componente React (Next.js).

Uso: python3 tools/convert.py <Main.dc.html> <saida_dir>
Gera: components/NhanduPage.jsx e app/globals.css (a partir do <helmet>).
"""
import sys, re, json
from html.parser import HTMLParser

SRC, OUT = sys.argv[1], sys.argv[2]
raw = open(SRC, encoding='utf-8').read()
tpl = raw[raw.index('<x-dc>') + 6: raw.index('</x-dc>')]
helmet = re.search(r'<helmet>(.*?)</helmet>', tpl, re.S).group(1)
tpl = re.sub(r'<helmet>.*?</helmet>', '', tpl, flags=re.S)
script = re.search(r"data-dc-script data-props='[^']*'>(.*?)</script>", raw, re.S).group(1)
css = re.search(r'<style>(.*?)</style>', helmet, re.S).group(1)

# ---------- ajustes de produção no template ----------
BLOBS = {
    '760434933d95773434388d4831b79614': '/media/andrick.jpg', 'cf0fc926781e91bfecef42b8b0724ae2': '/media/felipe.jpg',
    '0d8c61b757abdd0f20ca7a34bd02ac8b': '/media/leonan.jpg', 'cb89b901801d2ffbf209a551c3a197cf': '/media/seg-clin.jpg',
    '5ccf35b4ec6bd48af61416384bde2abf': '/media/seg-imob.jpg', 'd3126fe7e6b2161b1ddf79564b1b1719': '/media/seg-ecom.jpg',
    'b9f5a2a6320b571a67487e8880f206a1': '/media/seg-b2b.jpg', '3bab3772381e6c5c1dc629f11d7cca64': '/media/demo.mp4',
    'fbb17da733715c13647d120181fb0835': '/media/demo-poster.jpg',
}
def blob(s):
    def r(m):
        if m.group(1) not in BLOBS: raise SystemExit('asset desconhecido: ' + m.group(1))
        return BLOBS[m.group(1)]
    return re.sub(r'/_blob/([0-9a-f]{32})', r, s)
tpl, script = blob(tpl), blob(script)

def must(a, b):
    global tpl
    if a not in tpl: raise SystemExit('trecho não encontrado: ' + a[:80])
    tpl = tpl.replace(a, b)

# WhatsApp nos botões de agente
must('<a class="btn btn-line" href="#comecar">Falar com o agente</a>', '<a class="btn btn-line" href="{{waLink}}" target="{{waTarget}}" rel="noopener">Falar com o agente</a>')
must('<a class="btn btn-line" href="#comecar">Testar o agente no WhatsApp</a>', '<a class="btn btn-line" href="{{waLink}}" target="{{waTarget}}" rel="noopener">Testar o agente no WhatsApp</a>')
must('<a class="btn btn-line" href="#form-diag">Falar com o agente</a>', '<a class="btn btn-line" href="{{waLink}}" target="{{waTarget}}" rel="noopener">Falar com o agente</a>')
must('<li><a href="#form-diag">WhatsApp</a></li>', '<li><a href="{{waLink}}" target="{{waTarget}}" rel="noopener">WhatsApp</a></li>')
# formulário de diagnóstico de verdade
must('<form class="term" id="form-diag" aria-label="Solicitar diagnóstico">', '<form class="term" id="form-diag" aria-label="Solicitar diagnóstico" onSubmit="{{submitDiag}}">')
for fid, nm in [('f-nome', 'nome'), ('f-emp', 'empresa'), ('f-wa', 'whatsapp')]:
    must(f'<input id="{fid}" type=', f'<input id="{fid}" name="{nm}" required="required" type=')
must('<select id="f-seg">', '<select id="f-seg" name="segmento">')
a = tpl.index('<form class="term" id="form-diag"'); b = tpl.index('</form>', a)
seg = tpl[a:b]
seg2 = seg.replace('<button type="button" class="btn btn-acc">Quero meu diagnóstico <span class="arr" aria-hidden="true">→</span>', '<button type="submit" class="btn btn-acc" disabled="{{formBusy}}">{{formBtn}}', 1)
seg2 = seg2.replace('<small>Usamos estes dados', '<p class="form-msg" role="status">{{formMsg}}</p>\n<small>Usamos estes dados', 1)
if seg2 == seg: raise SystemExit('botão do formulário não encontrado')
tpl = tpl[:a] + seg2 + tpl[b:]
# rodapé: páginas legais e CNPJ
must('<li><a href="#compromissos">Privacidade</a></li><li><a href="#compromissos">Termos de uso</a></li><li><a href="#compromissos">Tratamento de dados</a></li><li><a href="#compromissos">Status do sistema</a></li>',
     '<li><a href="/privacidade">Privacidade</a></li><li><a href="/termos">Termos de uso</a></li><li><a href="/privacidade#dados">Tratamento de dados</a></li>')
must('CNPJ [CNPJ]', '{{cnpjTxt}}')

# ---------- conversão HTML -> JSX ----------
# o HTMLParser põe atributos em minúsculas; recupera a grafia original (onClick, viewBox, playsInline...)
CASE = {m.lower(): m for m in re.findall(r'\s([a-z]+[A-Z][A-Za-z]*)=', tpl)}
VOID = {'input', 'img', 'br', 'hr', 'meta', 'link', 'source', 'area', 'col', 'wbr'}
RENAME = {'class': 'className', 'for': 'htmlFor', 'autocomplete': 'autoComplete', 'tabindex': 'tabIndex', 'readonly': 'readOnly', 'maxlength': 'maxLength'}
HOLE = re.compile(r'\{\{\s*([^}]+?)\s*\}\}')
aliases, used = set(), set()

def note(expr):
    expr = expr.strip()
    if expr in ('true', 'false') or re.match(r'^-?\d', expr): return expr
    head = expr.split('.')[0]
    if head not in aliases and head != '$index': used.add(head)
    return expr

def camel(n):
    if n.startswith(('aria-', 'data-')) or n in ('viewBox',): return n
    return re.sub(r'-([a-z])', lambda m: m.group(1).upper(), n)

def tval(v):
    parts, last = [], 0
    for m in HOLE.finditer(v):
        parts.append(v[last:m.start()].replace('\\', '\\\\').replace('`', '\\`').replace('${', '\\${'))
        parts.append('${' + note(m.group(1)) + '}')
        last = m.end()
    parts.append(v[last:].replace('\\', '\\\\').replace('`', '\\`').replace('${', '\\${'))
    return '`' + ''.join(parts) + '`'

def attr_val(v):
    if v is None: return '{true}'
    m = HOLE.fullmatch(v.strip())
    if m: return '{' + note(m.group(1)) + '}'
    if HOLE.search(v): return '{' + tval(v) + '}'
    return '{' + json.dumps(v, ensure_ascii=False) + '}'

def style_obj(v):
    out = []
    for decl in v.split(';'):
        if ':' not in decl: continue
        k, val = decl.split(':', 1)
        k, val = k.strip(), val.strip()
        key = json.dumps(k) if k.startswith('--') else camel(k)
        out.append(f'{key}: ' + (tval(val) if HOLE.search(val) else json.dumps(val, ensure_ascii=False)))
    return '{{' + ', '.join(out) + '}}'

class Conv(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=False)
        self.o = []
        self.stack = []
    def attrs(self, attrs):
        res = []
        for n, v in attrs:
            if n.startswith('hint-'): continue
            if n == 'style': res.append('style=' + style_obj(v)); continue
            if n in ('required', 'disabled') and v in (n, '', None):
                res.append(n + '={true}'); continue
            n = CASE.get(n, n)
            res.append(RENAME.get(n, camel(n)) + '=' + attr_val(v))
        return (' ' + ' '.join(res)) if res else ''
    def handle_starttag(self, tag, attrs):
        d = dict(attrs)
        if tag == 'sc-if':
            expr = note(HOLE.fullmatch(d['value'].strip()).group(1))
            self.o.append('{(' + expr + ') && (<>'); self.stack.append(tag); return
        if tag == 'sc-for':
            lst = note(HOLE.fullmatch(d['list'].strip()).group(1)); al = d['as']
            aliases.add(al)
            self.o.append('{(' + lst + ' || []).map((' + al + ', $index) => (<React.Fragment key={$index}>'); self.stack.append(tag); return
        if tag in VOID:
            self.o.append('<' + tag + self.attrs(attrs) + ' />'); return
        self.o.append('<' + tag + self.attrs(attrs) + '>'); self.stack.append(tag)
    def handle_startendtag(self, tag, attrs):
        self.o.append('<' + tag + self.attrs(attrs) + ' />')
    def handle_endtag(self, tag):
        if tag in VOID: return
        t = self.stack.pop()
        if t != tag: raise SystemExit(f'tags desencontradas: {t} / {tag}')
        if tag == 'sc-if': self.o.append('</>)}'); return
        if tag == 'sc-for': self.o.append('</React.Fragment>))}'); return
        self.o.append('</' + tag + '>')
    def handle_data(self, data):
        out, last = [], 0
        for m in HOLE.finditer(data):
            out.append(self.esc(data[last:m.start()])); out.append('{' + note(m.group(1)) + '}'); last = m.end()
        out.append(self.esc(data[last:]))
        self.o.append(''.join(out))
    def esc(self, t):
        return t.replace('{', "{'{'}").replace('}', "{'}'}").replace('>', '&gt;')
    def handle_entityref(self, name): self.o.append('&' + name + ';')
    def handle_charref(self, name): self.o.append('&#' + name + ';')
    def handle_comment(self, data): pass

c = Conv(); c.feed(tpl); c.close()
if c.stack: raise SystemExit('tags abertas: ' + str(c.stack))
jsx = ''.join(c.o).strip()

cls = script.replace('class Component extends DCLogic {', 'class NhanduPage extends React.Component {\n  constructor(props) {\n    super(props);\n    this.state = {};\n  }\n', 1)
if cls == script: raise SystemExit('classe não encontrada')
render = '  render() {\n    const { ' + ', '.join(sorted(used)) + ' } = this.renderVals();\n    return (\n' + jsx + '\n    );\n  }\n'
i = cls.rindex('}')
cls = cls[:i] + render + cls[i:]
header = "'use client';\n/* Gerado por tools/convert.py a partir do canvas. Ajustes de produção ficam em tools/convert.py e lib/prod.js. */\nimport React from 'react';\nimport { prodVals, prodMethods } from '../lib/prod';\n"
cls = cls.replace("    const { ", "    const v = Object.assign(this.renderVals(), prodVals(this));\n    const { ", 1).replace("} = this.renderVals();\n    return (", "} = v;\n    return (", 1)
footer = '\nObject.assign(NhanduPage.prototype, prodMethods);\nexport default NhanduPage;\n'
open(OUT + '/components/NhanduPage.jsx', 'w', encoding='utf-8').write(header + cls + footer)
open(OUT + '/app/page.css', 'w', encoding='utf-8').write(css)
print('ok: jsx', len(jsx), 'chars; ids usados', len(used))
