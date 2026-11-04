'use client';
/* Gerado por tools/convert.py a partir do canvas. Ajustes de produção ficam em tools/convert.py e lib/prod.js. */
import React from 'react';
import { prodVals, prodMethods } from '../lib/prod';

function nhRand(a) {
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    var t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function nhHash(i, j, k) {
  var h = (i * 374761393 + j * 668265263 + k * 2147483647) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}
function nhSeg(px, py, ax, ay, bx, by, out) {
  var vx = bx - ax, vy = by - ay, L = vx * vx + vy * vy || 1;
  var u = ((px - ax) * vx + (py - ay) * vy) / L;
  u = u < 0 ? 0 : u > 1 ? 1 : u;
  var dx = px - (ax + u * vx), dy = py - (ay + u * vy);
  if (out) out.u = u;
  return Math.sqrt(dx * dx + dy * dy);
}
var NH_PRESETS = {
  hero: { webs: [[0.7, 0.3, 0.3], [1.06, 1.02, 0.2], [-0.02, 1.02, 0.14]], links: [[0, 1], [0, 2]], seed: 7, ink: '245,241,232', acc: '232,100,63', lab: '27,24,21', k: 0.7, labels: false, spiders: 4 },
  bg: { webs: [[0.5, 0.52, 0.36], [0.06, 0.06, 0.2], [0.04, 1.02, 0.18], [1.0, 0.0, 0.2], [0.98, 1.04, 0.2]], links: [[0, 1], [0, 2], [0, 3], [0, 4], [1, 2]], seed: 13, ink: '26,24,20', acc: '200,67,30', lab: '245,241,232', k: 0.62 }
};
var NH_POOL = ['+55 14 9····-2481', 'ld_2481', 'qui 17:30', 'status=agendado', 'origem=instagram', 'crm.etapa 3', '22:47', 'follow-up 24h', 'agenda.ok', 'lead.qualificado', 'sáb 10:00', 'pipeline → proposta', 'lgpd ✓', 'ticket #318', 'resposta 4s', 'pedido #10442', 'lembrete enviado', 'handoff=false'];
function nhBuild(W, H, P) {
  var cw = 10, ch = 18, cols = Math.ceil(W / cw), rows = Math.ceil(H / ch), n = cols * rows;
  var rnd = nhRand(P.seed), S = Math.max(W, H);
  var webs = P.webs.map(function (w) {
    var cx = w[0] * W, cy = w[1] * H, R = w[2] * S;
    var N = 13 + Math.floor(rnd() * 5), K = 8 + Math.floor(rnd() * 4), ang = [], rr = [], vx = [], vy = [];
    for (var m = 0; m < N; m++) ang.push((m / N) * Math.PI * 2 + (rnd() - 0.5) * 0.22);
    for (var k = 1; k <= K; k++) rr.push(R * Math.pow(k / K, 1.2));
    for (var k2 = 0; k2 < K; k2++) {
      vx.push([]); vy.push([]);
      for (var m2 = 0; m2 < N; m2++) {
        var r = rr[k2] * (1 + (rnd() - 0.5) * 0.08);
        vx[k2].push(cx + Math.cos(ang[m2]) * r);
        vy[k2].push(cy + Math.sin(ang[m2]) * r * 0.9);
      }
    }
    return { cx: cx, cy: cy, R: R, N: N, K: K, rr: rr, vx: vx, vy: vy };
  });
  var links = P.links.map(function (l) { var a = webs[l[0]], b = webs[l[1]]; return { ax: a.cx, ay: a.cy, bx: b.cx, by: b.cy }; });
  var base = new Float32Array(n), kind = new Int8Array(n), wid = new Int8Array(n), rad = new Int16Array(n), dr = new Float32Array(n), rv = new Float32Array(n);
  var o = { u: 0 }, th = ch * 0.62, thL = ch * 0.5;
  for (var j = 0; j < rows; j++) {
    for (var i = 0; i < cols; i++) {
      var idx = j * cols + i, px = i * cw + cw / 2, py = j * ch + ch / 2, best = 0;
      for (var wi = 0; wi < webs.length; wi++) {
        var w = webs[wi], dx = px - w.cx, dy = (py - w.cy) / 0.9, r2 = Math.sqrt(dx * dx + dy * dy);
        if (r2 > w.R * 1.12) continue;
        var dRad = 1e9, bm = 0;
        for (var m3 = 0; m3 < w.N; m3++) {
          var d = nhSeg(px, py, w.cx, w.cy, w.vx[w.K - 1][m3], w.vy[w.K - 1][m3]);
          if (d < dRad) { dRad = d; bm = m3; }
        }
        var dRing = 1e9;
        for (var k3 = 0; k3 < w.K; k3++) {
          if (Math.abs(r2 - w.rr[k3]) > ch * 3) continue;
          for (var m4 = 0; m4 < w.N; m4++) {
            var m5 = (m4 + 1) % w.N;
            var d2 = nhSeg(px, py, w.vx[k3][m4], w.vy[k3][m4], w.vx[k3][m5], w.vy[k3][m5]);
            if (d2 < dRing) dRing = d2;
          }
        }
        var dd = Math.min(dRad, dRing), v = 1 - dd / th;
        if (v <= 0) continue;
        v *= 1 - (r2 / w.R) * 0.4;
        if (v > best) { best = v; kind[idx] = 1; wid[idx] = wi; rad[idx] = bm; dr[idx] = dRad; rv[idx] = r2; }
      }
      for (var li = 0; li < links.length; li++) {
        var L = links[li], d3 = nhSeg(px, py, L.ax, L.ay, L.bx, L.by, o), v2 = (1 - d3 / thL) * 0.7;
        if (v2 > best) { best = v2; kind[idx] = 2; wid[idx] = li; rv[idx] = o.u; }
      }
      base[idx] = best;
    }
  }
  var anchors = [];
  if (P.labels !== false) webs.forEach(function (w) {
    for (var a = 0; a < 3; a++) {
      var k = Math.min(w.K - 1, Math.floor(w.K * 0.35 + rnd() * w.K * 0.6)), m = Math.floor(rnd() * w.N);
      var x = w.vx[k][m], y = w.vy[k][m];
      if (x < 20 || y < 20 || x > W - 140 || y > H - 40) continue;
      anchors.push({ x: x, y: y, s: NH_POOL[Math.floor(rnd() * NH_POOL.length)], h: rnd() });
    }
  });
  return { P: P, W: W, H: H, cw: cw, ch: ch, cols: cols, rows: rows, webs: webs, links: links, base: base, kind: kind, wid: wid, rad: rad, dr: dr, rv: rv, anchors: anchors, seed: P.seed };
}
var NH_PHOTOS = { clin: '/media/seg-clin.jpg', imob: '/media/seg-imob.jpg', ecom: '/media/seg-ecom.jpg', b2b: '/media/seg-b2b.jpg' };
var NH_TL = [['Diagnóstico', 0, 18], ['Página', 20, 28], ['Agente', 32, 34], ['Automação', 50, 20], ['Dados', 68, 32]];
var NH_STEP = 640;
var NH_RAMP = ' .·:-=+*#%@';
var NH_HOT = '0123456789<>/{}+';
function nhDraw(ctx, g, t, mouse) {
  ctx.clearRect(0, 0, g.W, g.H);
  ctx.font = "13px 'Geist Mono', ui-monospace, monospace";
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  var webs = g.webs, pw = [], ww = [];
  for (var wi = 0; wi < webs.length; wi++) {
    var w = webs[wi], ps = [];
    for (var p = 0; p < 6; p++) {
      var sp = 0.12 + nhHash(p, wi, g.seed) * 0.1, ph = (t * sp + nhHash(p, 9 + wi, g.seed)) % 1;
      ps.push([Math.floor(nhHash(p, 1 + wi, g.seed) * w.N), w.R * 1.1 * (1 - ph)]);
    }
    pw.push(ps);
    ww.push(((t * 0.3 + wi * 0.37) % 1) * w.R * 1.1);
  }
  var lp = [];
  for (var li = 0; li < g.links.length; li++) lp.push([(t * 0.11 + nhHash(li, 3, g.seed)) % 1, 1 - ((t * 0.09 + nhHash(li, 7, g.seed)) % 1)]);
  var flick = Math.floor(t * 8), cols = g.cols, low = [], hot = [];
  var mx = mouse && mouse.on ? mouse.x : -1e5, my = mouse && mouse.on ? mouse.y : -1e5;
  var w0 = g.webs[0], revR = t < 3.2 ? (t / 3.2) * Math.max(g.W, g.H) * 1.25 : 1e9, K = g.P.k;
  for (var j = 0; j < g.rows; j++) {
    for (var i = 0; i < cols; i++) {
      var idx = j * cols + i, v = g.base[idx], px = i * g.cw + g.cw / 2, py = j * g.ch + g.ch / 2;
      if (revR < 1e8) { var rx = px - w0.cx, ry = py - w0.cy; if (rx * rx + ry * ry > revR * revR) continue; }
      var mdx = px - mx, mdy = py - my, md = Math.sqrt(mdx * mdx + mdy * mdy);
      if (v < 0.05) {
        if (md < 70 && nhHash(i, j, flick) < 0.22) hot.push(px, py, 0.35 * (1 - md / 70), NH_HOT[Math.floor(nhHash(j, i, flick) * NH_HOT.length)]);
        else if (nhHash(i, j, 5) < 0.012) low.push(px, py, 0.1, '·');
        continue;
      }
      var boost = 0, k = g.kind[idx];
      if (k === 1) {
        var ps2 = pw[g.wid[idx]];
        if (g.dr[idx] < g.ch * 0.9) {
          for (var q = 0; q < ps2.length; q++) {
            if (ps2[q][0] === g.rad[idx]) { var d = Math.abs(g.rv[idx] - ps2[q][1]); if (d < 44) boost = Math.max(boost, 1 - d / 44); }
          }
        }
        var wd = Math.abs(g.rv[idx] - ww[g.wid[idx]]);
        if (wd < 16) boost = Math.max(boost, (1 - wd / 16) * 0.5);
      } else if (k === 2) {
        var L = lp[g.wid[idx]], u = g.rv[idx], e1 = Math.abs(u - L[0]), e2 = Math.abs(u - L[1]);
        if (e1 < 0.035) boost = Math.max(boost, 1 - e1 / 0.035);
        if (e2 < 0.035) boost = Math.max(boost, 1 - e2 / 0.035);
      }
      if (md < 130) boost = Math.max(boost, (1 - md / 130) * 0.95);
      if (k === 1 && g.wid[idx] === 0 && g.P.spiders && g.dr[idx] < g.ch * 0.9) {
        for (var sp2 = 0; sp2 < g.P.spiders; sp2++) {
          var S2 = nhSpider(g, sp2, t);
          if (S2.carry && S2.m === g.rad[idx] && g.rv[idx] > S2.r && g.rv[idx] < S2.r + 90) boost = Math.max(boost, 0.5 * (1 - (g.rv[idx] - S2.r) / 90));
        }
      }
      if (boost > 0.35) hot.push(px, py, 0.5 + boost * 0.5, NH_HOT[Math.floor(nhHash(i, j, flick) * NH_HOT.length)]);
      else { var val = Math.min(1, v + boost * 0.6); low.push(px, py, 0.12 + val * 0.5, NH_RAMP[Math.min(NH_RAMP.length - 1, 1 + Math.floor(val * (NH_RAMP.length - 1)))]); }
    }
  }
  for (var a = 0; a < low.length; a += 4) { ctx.fillStyle = 'rgba(' + g.P.ink + ',' + (low[a + 2] * K).toFixed(3) + ')'; ctx.fillText(low[a + 3], low[a], low[a + 1]); }
  for (var b = 0; b < hot.length; b += 4) { ctx.fillStyle = 'rgba(' + g.P.acc + ',' + (hot[b + 2] * Math.min(1, K + 0.25)).toFixed(3) + ')'; ctx.fillText(hot[b + 3], hot[b], hot[b + 1]); }
  ctx.font = "11px 'Geist Mono', ui-monospace, monospace";
  ctx.textAlign = 'left';
  if (g.P.spiders) nhSpiders(ctx, g, t);
  for (var c = 0; c < g.anchors.length; c++) {
    var an = g.anchors[c], ph2 = (t * 0.08 + an.h) % 1;
    if (ph2 > 0.42) continue;
    var al = Math.sin((ph2 / 0.42) * Math.PI);
    ctx.fillStyle = 'rgba(' + g.P.acc + ',' + (al * 0.95).toFixed(3) + ')';
    ctx.fillRect(an.x - 3, an.y - 3, 6, 6);
    ctx.fillStyle = 'rgba(' + g.P.lab + ',' + (al * 0.9).toFixed(3) + ')';
    var tw = ctx.measureText(an.s).width;
    ctx.fillRect(an.x + 8, an.y - 9, tw + 10, 18);
    ctx.fillStyle = 'rgba(' + g.P.ink + ',' + (al * 0.9).toFixed(3) + ')';
    ctx.fillText(an.s, an.x + 13, an.y + 1);
  }
}


var NH_SPEED = 64;
function nhSpider(g, i, t) {
  var w = g.webs[0], R = w.R * 1.02, leg = R / NH_SPEED, cyc = leg * 2 + 0.6;
  var tt = t + i * (cyc / g.P.spiders);
  var n = Math.floor(tt / cyc), ph = tt - n * cyc;
  var m = Math.floor(nhHash(i, n, 31) * w.N);
  var out = ph < leg, u = out ? ph / leg : (ph < leg * 2 ? 1 - (ph - leg) / leg : 0);
  var ex = w.vx[w.K - 1][m], ey = w.vy[w.K - 1][m];
  return { m: m, u: u, r: u * R, x: w.cx + (ex - w.cx) * u, y: w.cy + (ey - w.cy) * u, carry: !out && ph < leg * 2, out: out, ex: ex, ey: ey, since: ph - leg * 2, n: n };
}
function nhSpiders(ctx, g, t) {
  var w = g.webs[0];
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillStyle = 'rgba(232,100,63,1)';
  ctx.beginPath(); ctx.moveTo(w.cx, w.cy - 8); ctx.lineTo(w.cx + 8, w.cy); ctx.lineTo(w.cx, w.cy + 8); ctx.lineTo(w.cx - 8, w.cy); ctx.closePath(); ctx.fill();
  ctx.font = "500 11px 'Geist Mono', ui-monospace, monospace";
  ctx.fillStyle = 'rgba(245,241,232,.85)';
  ctx.fillText('seu negócio', w.cx, w.cy + 22);
  for (var i = 0; i < g.P.spiders; i++) {
    var s = nhSpider(g, i, t);
    if (s.out) {
      var pulse = 0.6 + 0.4 * Math.sin(t * 6 + i);
      ctx.font = "600 15px 'Geist Mono', ui-monospace, monospace";
      ctx.fillStyle = 'rgba(232,100,63,' + pulse.toFixed(2) + ')';
      ctx.fillText('$', s.ex, s.ey);
    }
    if (s.since >= 0 && s.since < 1.4) {
      var a = 1 - s.since / 1.4;
      ctx.font = "500 12px 'Geist Mono', ui-monospace, monospace";
      ctx.fillStyle = 'rgba(232,100,63,' + a.toFixed(2) + ')';
      ctx.fillText('+1 cliente', w.cx + (i % 2 ? 46 : -46), w.cy - 16 - s.since * 26);
    }
    var frame = Math.floor(t * 5 + i) % 2;
    var body = s.carry ? (frame ? '/\\(^.^)/\\' : '\\/(^.^)\\/') : (frame ? '/\\(o.o)/\\' : '\\/(o.o)\\/');
    ctx.font = "600 13px 'Geist Mono', ui-monospace, monospace";
    var tw = ctx.measureText(body).width;
    ctx.fillStyle = 'rgba(27,24,21,.85)';
    ctx.fillRect(s.x - tw / 2 - 4, s.y - 10, tw + 8 + (s.carry ? 16 : 0), 20);
    ctx.fillStyle = 'rgba(245,241,232,1)';
    ctx.fillText(body, s.x, s.y);
    if (s.carry) { ctx.fillStyle = 'rgba(232,100,63,1)'; ctx.font = "700 14px 'Geist Mono', ui-monospace, monospace"; ctx.fillText('$', s.x + tw / 2 + 8, s.y); }
  }
}


var NH_SRC = [
  ['instagram', ['vi seu post!', 'qual o valor?', 'tem horário?']],
  ['google', ['atende sábado?', 'onde fica?', 'orçamento?']],
  ['site', ['quero agendar', 'vaga amanhã?']],
  ['indicação', ['a Ana indicou', 'quero saber +']],
  ['whatsapp', ['oi, tudo bem?', 'tem hoje?']]
];
var NH_OUT = ['agenda', 'follow-up', 'equipe'];
function nhLineChar(p, c, n) {
  var dx1 = p ? Math.sign(c[0] - p[0]) : 1, dy1 = p ? Math.sign(c[1] - p[1]) : 0;
  var dx2 = n ? Math.sign(n[0] - c[0]) : dx1, dy2 = n ? Math.sign(n[1] - c[1]) : dy1;
  if (dy1 === 0 && dy2 === 0) return '─';
  if (dx1 === 0 && dx2 === 0) return '│';
  if (dx1 === 1 && dy2 === 1) return '╮';
  if (dx1 === 1 && dy2 === -1) return '╯';
  if (dy1 === 1 && dx2 === 1) return '╰';
  if (dy1 === -1 && dx2 === 1) return '╭';
  return '┼';
}
function nhFlowBuild(W, H) {
  var cw = 9, ch = 18, cols = Math.floor(W / cw), rows = Math.floor(H / ch);
  var bw = 13, nr = Math.round(rows * 0.47);
  var bx0 = Math.max(16, Math.round(cols * 0.5) - 6);
  var split = Math.max(bx0 + bw + 3, cols - 15);
  var merge = bx0 - 3;
  var srcs = NH_SRC.map(function (s, i) {
    var r = Math.round(rows * (0.2 + i * 0.135)), cells = [];
    for (var c = 11; c <= merge; c++) cells.push([c, r]);
    var dir = nr > r ? 1 : -1;
    for (var rr = r + dir; dir > 0 ? rr <= nr : rr >= nr; rr += dir) cells.push([merge, rr]);
    for (var c2 = merge + 1; c2 < bx0; c2++) cells.push([c2, nr]);
    return { name: s[0], msgs: s[1], r: r, cells: cells };
  });
  var outs = NH_OUT.map(function (o, i) {
    var br = Math.max(3, Math.min(rows - 4, nr + (i - 1) * 7)), cells = [];
    for (var c = bx0 + bw; c <= split; c++) cells.push([c, nr]);
    var dir = br > nr ? 1 : -1;
    if (br !== nr) for (var rr = nr + dir; dir > 0 ? rr <= br : rr >= br; rr += dir) cells.push([split, rr]);
    for (var c2 = split + 1; c2 <= split + 3; c2++) cells.push([c2, br]);
    return { name: o, r: br, cells: cells };
  });
  var line = {};
  function mark(cells) {
    for (var k = 0; k < cells.length; k++) {
      var key = cells[k][0] + ',' + cells[k][1];
      var ch2 = nhLineChar(cells[k - 1], cells[k], cells[k + 1]);
      if (line[key] && line[key] !== ch2) ch2 = (line[key] === '│' || ch2 === '│') ? '┤' : ch2;
      line[key] = ch2;
    }
  }
  srcs.forEach(function (s) { mark(s.cells); });
  outs.forEach(function (o) { mark(o.cells); });
  return { W: W, H: H, cw: cw, ch: ch, cols: cols, rows: rows, bw: bw, nr: nr, bx0: bx0, split: split, srcs: srcs, outs: outs, line: line };
}
function nhFlowDraw(ctx, g, t, mouse) {
  var cw = g.cw, ch = g.ch;
  ctx.clearRect(0, 0, g.W, g.H);
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  var mx = mouse && mouse.on ? mouse.x : -1e5, my = mouse && mouse.on ? mouse.y : -1e5;
  var X = function (c) { return c * cw + cw / 2; }, Y = function (r) { return r * ch + ch / 2; };
  var flick = Math.floor(t * 6);
  ctx.font = "13px 'Geist Mono', ui-monospace, monospace";
  for (var r = 0; r < g.rows; r++) {
    for (var c = 0; c < g.cols; c++) {
      if (g.line[c + ',' + r]) continue;
      var h = nhHash(c, r, 3);
      var dx = X(c) - mx, dy = Y(r) - my, md = Math.sqrt(dx * dx + dy * dy);
      if (md < 90 && nhHash(c, r, flick) < 0.35) { ctx.fillStyle = 'rgba(232,100,63,' + (0.55 * (1 - md / 90)).toFixed(2) + ')'; ctx.fillText(String(Math.floor(nhHash(r, c, flick) * 10)), X(c), Y(r)); }
      else if (h < 0.045) { ctx.fillStyle = 'rgba(245,241,232,' + (0.05 + 0.08 * nhHash(c, r, flick >> 1)).toFixed(3) + ')'; ctx.fillText(h < 0.02 ? String(Math.floor(nhHash(c, r, flick >> 2) * 10)) : '·', X(c), Y(r)); }
    }
  }
  var PER = 1.05, SPD = 16, active = [], boxHot = 0, outHot = [0, 0, 0], plus = [];
  var TOK = ['✓ agendado', '↻ follow-up', '→ equipe'];
  var kNow = Math.floor(t / PER);
  for (var k = kNow; k > kNow - 14 && k >= 0; k--) {
    var src = g.srcs[Math.floor(nhHash(k, 1, 9) * g.srcs.length)];
    var hb = nhHash(k, 2, 9), oi = hb < 0.55 ? 0 : hb < 0.82 ? 1 : 2;
    var out = g.outs[oi], txt = src.msgs[Math.floor(nhHash(k, 3, 9) * src.msgs.length)];
    var path = src.cells.concat(out.cells), boxAt = src.cells.length;
    var head = (t - k * PER) * SPD;
    if (head > path.length + txt.length + 2) { if (head < path.length + txt.length + 2 + SPD * 1.3) { var age = (head - path.length - txt.length - 2) / (SPD * 1.3); plus.push([oi, age]); } continue; }
    active.push({ path: path, head: head, txt: head >= boxAt + 1 ? TOK[oi] : txt, boxAt: boxAt });
    if (head > boxAt - 1 && head < boxAt + 2) boxHot = 1;
    if (head > path.length - 1 && head < path.length + 3) outHot[oi] = 1;
  }
  var lit = {};
  active.forEach(function (p) {
    var hi = Math.floor(p.head);
    for (var j = 0; j <= p.txt.length; j++) {
      var idx = hi - j;
      if (idx < 0 || idx >= p.path.length) continue;
      var vert = (p.path[idx - 1] && p.path[idx - 1][0] === p.path[idx][0]) || (p.path[idx + 1] && p.path[idx + 1][0] === p.path[idx][0]);
      lit[p.path[idx][0] + ',' + p.path[idx][1]] = j === 0 ? '●' : (vert ? (j < 4 ? '┃' : null) : p.txt[p.txt.length - j]);
    }
  });
  for (var key in g.line) {
    var pc = key.split(','), cx = +pc[0], cy = +pc[1];
    var dx2 = X(cx) - mx, dy2 = Y(cy) - my, md2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);
    if (lit[key] === null) lit[key] = undefined;
    if (lit[key]) {
      ctx.fillStyle = (lit[key] === '●' || lit[key] === '┃') ? 'rgba(232,100,63,1)' : 'rgba(245,241,232,.95)';
      ctx.fillText(lit[key], X(cx), Y(cy));
    } else {
      ctx.fillStyle = 'rgba(245,241,232,' + (md2 < 120 ? 0.22 + 0.3 * (1 - md2 / 120) : 0.2).toFixed(2) + ')';
      ctx.fillText(g.line[key], X(cx), Y(cy));
    }
  }
  ctx.textAlign = 'left';
  ctx.font = "500 12px 'Geist Mono', ui-monospace, monospace";
  g.srcs.forEach(function (s) { ctx.fillStyle = 'rgba(207,198,184,.9)'; ctx.fillText(s.name, X(1) - cw / 2, Y(s.r)); });
  var bx = X(g.bx0) - cw / 2, by = Y(g.nr - 1) - ch / 2, bwpx = g.bw * cw, bhpx = ch * 3;
  ctx.fillStyle = boxHot ? 'rgba(232,100,63,1)' : 'rgba(43,38,33,1)';
  ctx.fillRect(bx, by, bwpx, bhpx);
  ctx.strokeStyle = boxHot ? 'rgba(232,100,63,1)' : 'rgba(245,241,232,.55)';
  ctx.lineWidth = 1; ctx.strokeRect(bx + 0.5, by + 0.5, bwpx - 1, bhpx - 1);
  ctx.textAlign = 'center';
  ctx.font = "600 12px 'Geist Mono', ui-monospace, monospace";
  ctx.fillStyle = boxHot ? 'rgba(27,24,21,1)' : 'rgba(245,241,232,1)';
  ctx.fillText('AGENTE IA', bx + bwpx / 2, Y(g.nr) - 3);
  ctx.font = "10px 'Geist Mono', ui-monospace, monospace";
  ctx.fillStyle = boxHot ? 'rgba(27,24,21,.8)' : 'rgba(160,151,138,1)';
  ctx.fillText(boxHot ? 'qualificando…' : 'online 24h', bx + bwpx / 2, Y(g.nr) + 11);
  ctx.textAlign = 'left';
  g.outs.forEach(function (o, i) {
    var lx = X(g.split + 4) - cw / 2, ly = Y(o.r);
    ctx.font = "600 12px 'Geist Mono', ui-monospace, monospace";
    ctx.fillStyle = outHot[i] ? 'rgba(232,100,63,1)' : 'rgba(245,241,232,.92)';
    ctx.fillText('▸ ' + o.name, lx, ly);
  });
  plus.forEach(function (p) {
    var o = g.outs[p[0]];
    ctx.font = "500 11px 'Geist Mono', ui-monospace, monospace";
    ctx.fillStyle = 'rgba(232,100,63,' + (1 - p[1]).toFixed(2) + ')';
    ctx.fillText(p[0] === 0 ? '+1 agendado' : p[0] === 1 ? '+1 retomado' : '+1 com a equipe', X(g.split + 4) - cw / 2, Y(o.r) - 14 - p[1] * 18);
  });
  ctx.font = "500 11px 'Geist Mono', ui-monospace, monospace";
  ctx.fillStyle = 'rgba(160,151,138,1)';
  ctx.fillText('NHANDU · CAPTAÇÃO AO VIVO', X(1) - cw / 2, Y(1));
  ctx.textAlign = 'right';
  ctx.fillStyle = 'rgba(127,211,163,' + (0.6 + 0.4 * Math.sin(t * 3)).toFixed(2) + ')';
  ctx.fillText('● online', g.W - cw, Y(1));
}


var NH_PHR = ['tem horário?', 'qual o valor?', 'atende sábado?', 'quero agendar', 'vaga amanhã?', 'oi, tudo bem?', 'faz orçamento?', 'onde fica?', 'a Ana indicou', 'ainda dá hoje?', 'aceita cartão?', 'quero remarcar'];
function nhSigBuild(W, H, o) {
  var cw = 10, ch = 18;
  return { W: W, H: H, cw: cw, ch: ch, cols: Math.ceil(W / cw), rows: Math.ceil(H / ch), ex: o.ex * W, ey: o.ey * H, o: o };
}
function nhSigDraw(ctx, g, t, mouse) {
  var o = g.o, cw = g.cw, ch = g.ch;
  ctx.clearRect(0, 0, g.W, g.H);
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.font = "13px 'Geist Mono', ui-monospace, monospace";
  var mx = mouse && mouse.on ? mouse.x : -1e5, my = mouse && mouse.on ? mouse.y : -1e5;
  var RAMP = ' .·:-=+*';
  var maxD = Math.sqrt(g.W * g.W + g.H * g.H);
  var flick = Math.floor(t * 6);
  var arrive = 0;
  var P = o.phrases || 8, LIFE = o.life || 7;
  var ph = [];
  for (var i = 0; i < P; i++) {
    var cyc = LIFE + nhHash(i, 1, 5) * 3, tt = t + i * (cyc / P), n = Math.floor(tt / cyc), u = (tt - n * cyc) / cyc;
    var ang = nhHash(i, n, 7) * Math.PI * 2, rad = maxD * 0.62;
    var sx = g.ex + Math.cos(ang) * rad, sy = g.ey + Math.sin(ang) * rad * 0.8;
    var e = u * u * (3 - 2 * u);
    var x = sx + (g.ex - sx) * e, y = sy + (g.ey - sy) * e;
    if (u > 0.94) arrive = Math.max(arrive, (u - 0.94) / 0.06);
    ph.push({ x: x, y: y, u: u, s: NH_PHR[Math.floor(nhHash(i, n, 3) * NH_PHR.length)] });
  }
  if (o.rings) {
    for (var r = 0; r < g.rows; r++) {
      for (var c = 0; c < g.cols; c++) {
        var px = c * cw + cw / 2, py = r * ch + ch / 2;
        var dx = px - g.ex, dy = (py - g.ey) * 1.15, d = Math.sqrt(dx * dx + dy * dy);
        var w = ((t * 70 - d) / 120) % 1; if (w < 0) w += 1;
        var ring = Math.max(0, 1 - Math.abs(w - 0.5) * 6) * Math.max(0, 1 - d / (maxD * 0.75));
        var mdx = px - mx, mdy = py - my, md = Math.sqrt(mdx * mdx + mdy * mdy);
        var mb = md < 110 ? 1 - md / 110 : 0;
        var noise = nhHash(c, r, 9) < 0.02 ? 0.25 : 0;
        var v = Math.max(ring * 0.9, noise, mb * 0.8);
        if (v < 0.08) continue;
        var hot = mb > 0.35 && nhHash(c, r, flick) < 0.5;
        ctx.fillStyle = hot ? 'rgba(' + o.acc + ',' + (0.4 + mb * 0.5).toFixed(2) + ')' : 'rgba(' + o.ink + ',' + (v * o.k).toFixed(3) + ')';
        ctx.fillText(hot ? String(Math.floor(nhHash(r, c, flick) * 10)) : RAMP[Math.min(RAMP.length - 1, 1 + Math.floor(v * (RAMP.length - 1)))], px, py);
      }
    }
  }
  if (o.rain) {
    ctx.font = "13px 'Geist Mono', ui-monospace, monospace";
    for (var cc = 0; cc < g.cols; cc++) {
      if (nhHash(cc, 0, 77) > 0.07) continue;
      var sp = 4 + nhHash(cc, 1, 77) * 5, head = (t * sp + nhHash(cc, 2, 77) * g.rows) % (g.rows + 12);
      for (var j = 0; j < 8; j++) {
        var rr2 = Math.floor(head) - j;
        if (rr2 < 0 || rr2 >= g.rows) continue;
        var al = (j === 0 ? 0.55 : 0.32 * (1 - j / 8)) * o.k;
        ctx.fillStyle = j === 0 ? 'rgba(' + o.acc + ',' + (al * 1.4).toFixed(3) + ')' : 'rgba(' + o.ink + ',' + al.toFixed(3) + ')';
        ctx.fillText(String(Math.floor(nhHash(cc, rr2, flick) * 10)), cc * cw + cw / 2, rr2 * ch + ch / 2);
      }
    }
  }
  if (mouse && mouse.on) {
    var mf = (t * 0.9) % 1;
    ctx.strokeStyle = 'rgba(' + o.acc + ',' + ((1 - mf) * 0.5).toFixed(2) + ')';
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(mx, my, 10 + mf * 70, 0, Math.PI * 2); ctx.stroke();
  }
  ctx.font = (o.big ? '14px' : '12px') + " 'Geist Mono', ui-monospace, monospace";
  ph.forEach(function (p) {
    var a = Math.sin(Math.min(1, p.u / 0.9) * Math.PI) * o.pk;
    if (a <= 0.01) return;
    ctx.fillStyle = 'rgba(' + o.ink + ',' + a.toFixed(3) + ')';
    ctx.fillText(p.s, p.x, p.y);
    if (o.rings) { ctx.fillStyle = 'rgba(' + o.acc + ',' + Math.min(1, a * 1.4).toFixed(2) + ')'; ctx.fillRect(p.x - 2, p.y - 13, 4, 4); }
  });
  if (o.rings && arrive > 0) {
    ctx.strokeStyle = 'rgba(' + o.acc + ',' + (1 - arrive).toFixed(2) + ')';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(g.ex, g.ey, 30 + arrive * 120, 0, Math.PI * 2); ctx.stroke();
  }
}

class NhanduPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    this._boot = setTimeout(() => this.boot(), 80);
    this._cvT = setInterval(() => {
      if (this.isStill() || (this._hold && Date.now() < this._hold)) return;
      this.setState({ cv: (((this.state || {}).cv || 0) + 1) % 4 });
    }, 9000);
  }
  componentDidUpdate(prev) {
    if ((prev.motion ?? true) !== (this.props.motion ?? true)) { this.stopWebs(); this.boot(); }
  }
  componentWillUnmount() {
    clearTimeout(this._boot);
    clearInterval(this._cvT);
    this.stopWebs();
    if (this._onScroll) window.removeEventListener('scroll', this._onScroll);
    if (this._onAnchor && this.rootEl) this.rootEl.removeEventListener('click', this._onAnchor);
    if (this._setVh) window.removeEventListener('resize', this._setVh);
  }
  isStill() {
    var reduce = false;
    try { reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}
    return reduce || (this.props.motion ?? true) === false;
  }
  boot() {
    var root = this.rootEl;
    if (!root) { this._boot = setTimeout(() => this.boot(), 120); return; }
    var still = this.isStill();
    if (!this._setVh) {
      this._setVh = () => { if (this.rootEl) this.rootEl.style.setProperty('--vh', Math.min(1200, Math.max(400, window.innerHeight)) + 'px'); if (this._onScroll) this._onScroll(); };
      window.addEventListener('resize', this._setVh);
    }
    this._setVh();
    this._webs = [];
    var self = this;
    root.querySelectorAll('canvas[data-web]').forEach(function (cv) {
      var st = { cv: cv, g: null, vis: false, raf: 0, last: 0, t0: performance.now(), mouse: { on: false, x: 0, y: 0 } };
      var size = function () {
        var r = cv.getBoundingClientRect(), W = Math.max(50, Math.round(r.width)), H = Math.max(50, Math.round(r.height));
        if (st.g && st.g.W === W && st.g.H === H) return;
        var dpr = Math.min(2, window.devicePixelRatio || 1);
        cv.width = W * dpr; cv.height = H * dpr;
        var ctx = cv.getContext('2d'); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        var kind = cv.getAttribute('data-web');
        if (kind === 'sig') { st.draw = nhSigDraw; st.g = nhSigBuild(W, H, { ex: W < 500 ? 0.4 : 0.27, ey: 0.56, ink: '245,241,232', acc: '232,100,63', k: 0.55, pk: 0.75, rings: true, phrases: 9, life: 6.5 }); }
        else if (kind === 'soft') {
          st.draw = nhSigDraw;
          var ex = 0.72, ey = 0.5, ph = root.querySelector('.phone');
          if (ph) { var pr = ph.getBoundingClientRect(); ex = (pr.left + pr.width / 2 - r.left) / W; ey = (pr.top + pr.height * 0.42 - r.top) / H; }
          st.g = nhSigBuild(W, H, { ex: ex, ey: ey, ink: '26,24,20', acc: '200,67,30', k: 0.5, pk: 0.62, rings: true, rain: true, phrases: 13, life: 8, big: true });
        }
        else if (kind === 'flow') { st.draw = nhFlowDraw; st.g = nhFlowBuild(W, H); }
        else { st.draw = nhDraw; st.g = nhBuild(W, H, NH_PRESETS[kind] || NH_PRESETS.hero); }
        st.ctx = ctx;
        if (still) st.draw(ctx, st.g, 9, null);
      };
      size();
      st.ro = new ResizeObserver(function () { clearTimeout(st.rt); st.rt = setTimeout(size, 150); });
      st.ro.observe(cv);
      var mhost = cv.closest('[data-web-host]') || cv.parentElement;
      st.onMove = function (e) { var r = cv.getBoundingClientRect(); st.mouse.on = true; st.mouse.x = e.clientX - r.left; st.mouse.y = e.clientY - r.top; };
      st.onLeave = function () { st.mouse.on = false; };
      mhost.addEventListener('pointermove', st.onMove);
      mhost.addEventListener('pointerleave', st.onLeave);
      st.mhost = mhost;
      if (!still) {
        var loop = function (now) {
          st.raf = requestAnimationFrame(loop);
          if (!st.vis || !st.g || now - st.last < 33) return;
          st.last = now;
          st.draw(st.ctx, st.g, (now - st.t0) / 1000, st.mouse);
        };
        st.io = new IntersectionObserver(function (es) { es.forEach(function (e) { st.vis = e.isIntersecting; }); }, { rootMargin: '100px' });
        st.io.observe(cv);
        st.raf = requestAnimationFrame(loop);
      }
      self._webs.push(st);
    });
    if (!this._onAnchor) {
      this._onAnchor = (e) => {
        var a = e.target && e.target.closest ? e.target.closest('a[href^="#"]') : null;
        if (!a) return;
        var id = a.getAttribute('href').slice(1);
        var el = id && this.rootEl.querySelector('[id="' + id + '"]');
        if (!el) return;
        e.preventDefault();
        var hdr = this.rootEl.querySelector('.hdr');
        var off = (hdr ? hdr.getBoundingClientRect().height : 68) + 16;
        var y = window.scrollY + el.getBoundingClientRect().top - off;
        window.scrollTo({ top: Math.max(0, y), behavior: this.isStill() ? 'auto' : 'smooth' });
      };
      root.addEventListener('click', this._onAnchor);
    }
    if (!this._onScroll) {
      var ticking = false;
      this._onScroll = () => {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(() => {
          ticking = false;
          this.measurePortal();
          var tr = this.rootEl && this.rootEl.querySelector('.track');
          var sk = tr && tr.querySelector('.sticky');
          if (!tr || !sk) return;
          var stk = getComputedStyle(sk).position !== 'sticky';
          if (stk !== !!(this.state || {}).stacked) this.setState({ stacked: stk });
          if (stk) return;
          var top = tr.getBoundingClientRect().top - 68;
          var s = Math.max(0, Math.min(4, Math.floor(-top / NH_STEP)));
          if (s !== ((this.state || {}).step || 0)) this.setState({ step: s });
        });
      };
      window.addEventListener('scroll', this._onScroll, { passive: true });
      this._onScroll();
    }
    if (this.demoEl) {
      this.demoEl.muted = true;
      if (still) { this.demoEl.pause(); this.setState({ demoPaused: true }); }
      else { var pr = this.demoEl.play(); if (pr && pr.catch) pr.catch(() => this.setState({ demoPaused: true })); }
    }
  }
  measurePortal() {
    var root = this.rootEl;
    if (!root) return;
    var w = root.querySelector('.calc-wrap'), sk = root.querySelector('.calc-stick'), res = root.querySelector('.calc-stick .res'), po = root.querySelector('.portal');
    if (!w || !sk || !res || !po) return;
    var wr = w.getBoundingClientRect(), prog = -wr.top / Math.max(1, wr.height - window.innerHeight);
    if (prog > 0.52) return;
    var a = sk.getBoundingClientRect(), r = res.getBoundingClientRect();
    po.style.setProperty('--pt', Math.max(0, r.top - a.top) + 'px');
    po.style.setProperty('--pl', Math.max(0, r.left - a.left) + 'px');
    po.style.setProperty('--pr', Math.max(0, a.right - r.right) + 'px');
    po.style.setProperty('--pb', Math.max(0, a.bottom - r.bottom) + 'px');
  }
  stopWebs() {
    (this._webs || []).forEach(function (st) {
      cancelAnimationFrame(st.raf);
      if (st.io) st.io.disconnect();
      if (st.ro) st.ro.disconnect();
      if (st.mhost) { st.mhost.removeEventListener('pointermove', st.onMove); st.mhost.removeEventListener('pointerleave', st.onLeave); }
    });
    this._webs = [];
  }
  goStep(i) {
    var root = this.rootEl;
    if (!root) return;
    var tr = root.querySelector('.track');
    var sk = tr && tr.querySelector('.sticky');
    if (tr && sk && getComputedStyle(sk).position === 'sticky') {
      var y = window.scrollY + tr.getBoundingClientRect().top - 68 + i * NH_STEP + 24;
      window.scrollTo({ top: y, behavior: this.isStill() ? 'auto' : 'smooth' });
    }
    this.setState({ step: i });
  }
  toggleDemo() {
    var v = this.demoEl;
    if (!v) return;
    if (v.paused) { v.muted = true; var p = v.play(); if (p && p.catch) p.catch(() => {}); this.setState({ demoPaused: false }); }
    else { v.pause(); this.setState({ demoPaused: true }); }
  }
  getSteps() {
    return [
      { n: '01', k: 'Diagnóstico', title: 'Entender antes de construir', desc: 'Analisamos como os contatos chegam hoje, quanto tempo esperam pela primeira resposta e em que ponto desistem.', how: [['Conversa inicial', 'Como o atendimento funciona hoje'], ['Leitura dos dados', 'Conversas e agenda de uma semana'], ['Raio-x entregue', 'Gargalos e o que fazer primeiro']], co: ['JORNADA MAPEADA', 'GARGALO'] },
      { n: '02', k: 'Página', title: 'Atrair com uma única ação', desc: 'Construímos uma landing page rápida, escrita para levar o visitante direto à conversa, com a origem de cada contato registrada.', how: [['Roteiro da página', 'Oferta, público e texto'], ['Design e construção', 'Rápida e pensada para celular'], ['No ar', 'No seu domínio, com origem rastreada']], co: ['SUA PÁGINA', 'EM CONSTRUÇÃO'] },
      { n: '03', k: 'Agente no WhatsApp', title: 'Responder na hora, a qualquer hora', desc: 'O agente atende pela API oficial do WhatsApp, qualifica com o roteiro aprovado por você e passa para a equipe quando precisa.', how: [['Roteiro do agente', 'Perguntas, respostas e limites'], ['Treino', 'Com as respostas reais da equipe'], ['Ativação', 'No número oficial da empresa']], co: ['AGENTE 24/7', 'WHATSAPP OFICIAL'] },
      { n: '04', k: 'Automação', title: 'Conectar agenda, CRM e follow-up', desc: 'Cada conversa vira registro: horário reservado, lead na etapa certa do funil e lembretes enviados sem ninguém copiar e colar.', how: [['Agenda', 'Horários reais, sem conflito'], ['CRM', 'Cada lead na etapa certa'], ['Follow-up', 'Lembretes e retomadas automáticas']], co: ['AGENDA → CRM', 'FOLLOW-UP'] },
      { n: '05', k: 'Dados', title: 'Medir e melhorar toda semana', desc: 'Os eventos ficam registrados no nome da sua empresa, conforme a LGPD, e viram um relatório semanal com o que entrou, fechou e travou.', how: [['Painel', 'Tudo o que entrou e saiu'], ['Relatório', 'Toda semana, no seu WhatsApp'], ['Ajustes', 'O roteiro melhora com os dados']], co: ['RELATÓRIO SEMANAL', 'LGPD'] }
    ];
  }
  getSegs() {
    return [
      { key: 'clin', tab: 'Clínicas e consultórios', desc: 'O agente acolhe o paciente, entende o procedimento, confere a agenda e confirma o horário. Quando precisa de gente, passa para a recepção.', b1: 'Qualificação comercial, nunca orientação clínica', b2: 'Agendamento e reagendamento automáticos', b3: 'Lembretes que reduzem faltas' },
      { key: 'imob', tab: 'Imobiliárias', desc: 'O agente descobre se é para morar ou investir, a faixa de valor, o crédito e o bairro, envia imóveis e marca a visita com o corretor certo.', b1: 'Triagem de perfil, crédito e faixa de valor', b2: 'Imóveis enviados na própria conversa', b3: 'Visitas na agenda de cada corretor' },
      { key: 'ecom', tab: 'E-commerce', desc: 'O agente recupera carrinhos, responde dúvidas de frete, troca e prazo, e envia o link de pagamento na própria conversa.', b1: 'Recuperação de carrinho pelo WhatsApp', b2: 'Frete, prazo e troca respondidos na hora', b3: 'Link de pagamento dentro da conversa' },
      { key: 'b2b', tab: 'Serviços e B2B', desc: 'O agente entende o tamanho da operação, a ferramenta atual e a urgência, e entrega ao comercial uma reunião marcada com o resumo pronto.', b1: 'Qualificação por volume e urgência', b2: 'Oportunidade criada no funil', b3: 'Reunião na agenda do comercial' }
    ];
  }
  renderVals() {
    const st = this.state || {};
    if (!this._setRoot) {
      this._setRoot = (el) => { if (el) this.rootEl = el; };
      this._setDemo = (el) => { if (el) this.demoEl = el; };
      this._toggleDemo = () => this.toggleDemo();
    }
    if (!this._calc) {
      const num = (v, lo, hi) => { const n = parseFloat(v); return isNaN(n) ? lo : Math.max(lo, Math.min(hi, n)); };
      this._calc = {
        onCm: (e) => this.setState({ cm: num(e.target.value, 50, 2000) }),
        onCp: (e) => this.setState({ cp: num(e.target.value, 5, 70) }),
        onCc: (e) => this.setState({ cc: num(e.target.value, 1, 8) }),
        onCt: (e) => this.setState({ ct: num(e.target.value, 0, 1000000) })
      };
    }
    const cm = st.cm ?? 300, cp = st.cp ?? 35, cc = st.cc ?? 2, ct = st.ct ?? 400;
    const offN = Math.round(cm * cp / 100), inN = cm - offN, lostN = Math.round(offN * cc / 10);
    const brl = (v) => { try { return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(v); } catch (e) { return 'R$ ' + Math.round(v); } };
    const intf = (v) => { try { return new Intl.NumberFormat('pt-BR').format(v); } catch (e) { return String(v); } };
    const cv = st.cv || 0;
    const cvTabs = ['Clínica', 'Imobiliária', 'Loja virtual', 'Serviços'].map((l, k) => ({ label: l, cls: k === cv ? 'on' : '', pressed: k === cv ? 'true' : 'false', pick: () => { this._hold = Date.now() + 30000; this.setState({ cv: k }); } }));
    const step = typeof st.step === 'number' ? st.step : 0;
    const stacked = !!st.stacked;
    const segKey = st.seg || 'clin';
    const stepsRaw = this.getSteps();
    const steps = stepsRaw.map((s, i) => ({
      n: s.n, k: s.k, title: s.title, desc: s.desc,
      how: s.how.map((h, j) => ({ n: '0' + (j + 1), t: h[0], d: h[1] })),
      rows: NH_TL.map((r, j) => ({ k: r[0], l: r[1], w: r[2], cls: j === i ? 'tl2-r on' : 'tl2-r' })),
      v0: i === 0 && (stacked || i === step), v1: i === 1 && (stacked || i === step), v2: i === 2 && (stacked || i === step), v3: i === 3 && (stacked || i === step), v4: i === 4 && (stacked || i === step),
      cls: i === step ? 'st on' : 'st',
      go: () => this.goStep(i)
    }));
    const gap = 86, lift = 28;
    const z = [0, 1, 2, 3, 4].map((i) => (4 - i) * gap + (i === step ? lift : 0));
    const pl = {
      p1: step === 0 ? 'pl on' : 'pl', p2: step === 1 ? 'pl on' : 'pl', p3: step === 2 ? 'pl on' : 'pl', p4: step === 3 ? 'pl on' : 'pl', p5: step === 4 ? 'pl on' : 'pl',
      z1: z[0], z2: z[1], z3: z[2], z4: z[3], z5: z[4],
      coTop: Math.round(-0.866 * z[step] - 9),
      coR: stepsRaw[step].co[0], coL: stepsRaw[step].co[1]
    };
    const segs = this.getSegs().map((s) => ({
      tab: s.tab, desc: s.desc, b1: s.b1, b2: s.b2, b3: s.b3,
      cls: s.key === segKey ? 'acc-item on' : 'acc-item',
      expanded: s.key === segKey ? 'true' : 'false',
      sign: s.key === segKey ? '−' : '+',
      pick: () => this.setState({ seg: s.key })
    }));
    const demoPaused = !!st.demoPaused;
    const motion = this.props.motion ?? true;
    return {
      accent: this.props.accent ?? '#C8431E',
      rootClass: motion ? '' : 'still',
      setRoot: this._setRoot,
      setDemo: this._setDemo,
      toggleDemo: this._toggleDemo,
      demoSrc: '/media/demo.mp4',
      demoPoster: '/media/demo-poster.jpg',
      demoPaused: demoPaused,
      demoPlaying: !demoPaused,
      demoLabel: demoPaused ? 'Reproduzir a demonstração' : 'Pausar a demonstração',
      cmV: cm, cpV: cp, ccV: cc, ctV: ct,
      onCm: this._calc.onCm, onCp: this._calc.onCp, onCc: this._calc.onCc, onCt: this._calc.onCt,
      offTxt: intf(offN), inTxt: intf(inN), lostTxt: intf(lostN),
      moneyTxt: brl(lostN * ct), yearTxt: brl(lostN * ct * 12),
      resCls: 'res ' + (lostN * ct < 3000 ? 'lv1' : lostN * ct < 15000 ? 'lv2' : 'lv3'),
      lvlTxt: lostN * ct < 3000 ? 'vazamento leve' : lostN * ct < 15000 ? 'vazamento médio' : 'vazamento alto',
      sayTxt: lostN * ct < 3000 ? 'Parece pouco, mas sai todo mês. Em um ano são ' + brl(lostN * ct * 12) + '.' : lostN * ct < 15000 ? 'São ' + intf(lostN) + ' clientes por mês procurando outro lugar porque ninguém respondeu a tempo.' : 'Dá para montar outra unidade com isso. São ' + intf(lostN) + ' clientes por mês indo para a concorrência.',
      meterW: Math.min(100, Math.round(Math.sqrt(lostN * ct / 40000) * 100)),
      pulseCls: 'res-v ' + ((Math.round(lostN * ct) / 10) % 2 ? 'pa' : 'pb'),
      inW: 100 - cp, offW: cp,
      cv0: cv === 0, cv1: cv === 1, cv2: cv === 2, cv3: cv === 3, cvTabs: cvTabs,
      steps: steps,
      pl: pl,
      segs: segs,
      hasPhoto: !!NH_PHOTOS[segKey],
      artCls: NH_PHOTOS[segKey] ? 'sol-art off' : 'sol-art',
      photo: NH_PHOTOS[segKey] || '',
      isClin: segKey === 'clin',
      isImob: segKey === 'imob',
      isEcom: segKey === 'ecom',
      isB2b: segKey === 'b2b'
    };
  }
  render() {
    const v = Object.assign(this.renderVals(), prodVals(this));
    const { accent, artCls, ccV, cmV, cnpjTxt, cpV, ctV, cv0, cv1, cv2, cv3, cvTabs, demoLabel, demoPaused, demoPlaying, demoPoster, demoSrc, formBtn, formBusy, formMsg, hasPhoto, inTxt, inW, isB2b, isClin, isEcom, isImob, lostTxt, lvlTxt, meterW, moneyTxt, offTxt, offW, onCc, onCm, onCp, onCt, photo, pl, pulseCls, resCls, rootClass, sayTxt, segs, setDemo, setRoot, steps, submitDiag, toggleDemo, waLink, waTarget, yearTxt } = v;
    return (
<div className={`nh ${rootClass}`} style={{"--acc": `${accent}`}} ref={setRoot}>
<a className={"skip"} href={"#conteudo"}>Pular para o conteúdo</a>

<header className={"hdr"}>
<div className={"wrap hdr-in"}>
<a className={"brand"} href={"#topo"} aria-label={"Nhandu, início"}><svg width={"28"} height={"28"} viewBox={"0 0 64 64"} aria-hidden={"true"}><circle className={"gd"} cx={"32"} cy={"16"} r={"3.2"}></circle><circle className={"gd"} cx={"16"} cy={"32"} r={"3.2"}></circle><circle className={"gd"} cx={"32"} cy={"32"} r={"3.2"}></circle><circle className={"gd"} cx={"48"} cy={"32"} r={"3.2"}></circle><circle className={"gd"} cx={"32"} cy={"48"} r={"3.2"}></circle><path className={"tr"} pathLength={"1"} d={"M16 48V16L48 48V16"} fill={"none"} stroke={"currentColor"} strokeWidth={"5.5"} strokeLinecap={"round"} strokeLinejoin={"round"}></path><circle cx={"48"} cy={"16"} r={"6.5"} style={{fill: "var(--a2)"}}></circle></svg>Nhandu</a>
<nav className={"nav"} aria-label={"Principal"}>
<a href={"#camadas"}>Como funciona</a>
<a href={"#solucoes"}>Soluções</a>
<a href={"#produtos"}>Produtos</a>
<a href={"#time"}>Quem somos</a>
<a href={"#faq"}>Perguntas</a>
</nav>
<div className={"hdr-cta"}>
<a className={"btn btn-line"} href={waLink} target={waTarget} rel={"noopener"}>Falar com o agente</a>
<a className={"btn btn-solid"} href={"#form-diag"}>Quero meu diagnóstico</a>
</div>
</div>
</header>

<main id={"conteudo"}>

<section className={"hero"} id={"topo"} data-web-host={"bg"}>
<div className={"hero-bg"} aria-hidden={"true"}><canvas className={"webcv"} data-web={"soft"}></canvas></div>
<div className={"wrap hero-in"}>
<div>
<a className={"pill"} href={"#solucoes"}><b>PARA QUEM</b>Clínicas, imobiliárias, lojas e serviços que vendem pelo WhatsApp</a>
<h1 className={"h1"}><span>Nenhum cliente sem resposta.</span><span>Nem às 22h de domingo.</span></h1>
<p className={"hero-p"}>Em até 14 dias, instalamos no seu negócio um agente de IA que atende, qualifica e agenda pelo WhatsApp 24 horas, uma página que converte e as automações que levam cada contato até a agenda e o CRM.</p>
<div className={"offer"} aria-label={"O que a Nhandu instala"}>
<span><svg width={"18"} height={"18"} viewBox={"0 0 22 22"} aria-hidden={"true"}><rect x={"2.5"} y={"3.5"} width={"17"} height={"15"} rx={"2"} fill={"none"} stroke={"currentColor"} strokeWidth={"1.5"}></rect><path d={"M2.5 7.5h17"} stroke={"currentColor"} strokeWidth={"1.5"}></path></svg>Página de conversão</span>
<span><svg width={"18"} height={"18"} viewBox={"0 0 22 22"} aria-hidden={"true"}><path d={"M4 17l1.2-3.6A7.5 7.5 0 1 1 8 17.8z"} fill={"none"} stroke={"currentColor"} strokeWidth={"1.5"}></path></svg>Agente de IA no WhatsApp</span>
<span><svg width={"18"} height={"18"} viewBox={"0 0 22 22"} aria-hidden={"true"}><rect x={"2.5"} y={"3"} width={"6"} height={"5"} fill={"none"} stroke={"currentColor"} strokeWidth={"1.5"}></rect><rect x={"13.5"} y={"14"} width={"6"} height={"5"} fill={"none"} stroke={"currentColor"} strokeWidth={"1.5"}></rect><path d={"M8.5 5.5H11v11h2.5"} fill={"none"} stroke={"currentColor"} strokeWidth={"1.5"}></path></svg>Automação e CRM</span>
</div>
<div className={"cta-row"}>
<a className={"btn btn-solid"} href={"#comecar"}>Quero meu diagnóstico <span className={"arr"} aria-hidden={"true"}>→</span></a>
<a className={"btn btn-line"} href={waLink} target={waTarget} rel={"noopener"}>Testar o agente no WhatsApp</a>
</div>
<div className={"proof"}><span>No ar em até 14 dias</span><span>Piloto de 30 dias com resultado medido</span><span>Número e dados no seu nome</span></div>
<a className={"fmini"} href={"#time"}><span><img src={"/media/andrick.jpg"} alt={""} /><img src={"/media/felipe.jpg"} alt={""} /><img src={"/media/leonan.jpg"} alt={""} /></span>Você fala direto com os sócios, do diagnóstico ao suporte</a>
</div>
<div className={"panel"} data-web-host={"hero"} role={"img"} aria-label={"Demonstração: perguntas de clientes chegam de todos os lados até o celular; no WhatsApp, o agente agenda uma paciente às 17h30 de quinta e o horário aparece na agenda; no WhatsApp, o agente agenda uma paciente às 17h30 de quinta e o horário aparece na agenda da recepção."}>

{(cv0) && (<>
<div className={"phone"} aria-hidden={"true"}><div className={"screen"}>
<div className={"sbar"}><span>22:47</span><i className={"isl"}></i><span className={"sic"}><svg width={"16"} height={"10"} viewBox={"0 0 16 10"}><path d={"M1 9h2V7H1zM5 9h2V5H5zM9 9h2V3H9zM13 9h2V1h-2z"} fill={"currentColor"}></path></svg><svg width={"22"} height={"10"} viewBox={"0 0 22 10"}><rect x={".5"} y={".5"} width={"18"} height={"9"} rx={"2.5"} fill={"none"} stroke={"currentColor"}></rect><rect x={"2"} y={"2"} width={"13"} height={"6"} rx={"1.5"} fill={"currentColor"}></rect><path d={"M20 3.5v3"} stroke={"currentColor"} strokeWidth={"1.4"} strokeLinecap={"round"}></path></svg></span></div>
<div className={"chat-hd"}><svg width={"10"} height={"16"} viewBox={"0 0 10 16"}><path d={"M8 1L2 8l6 7"} fill={"none"} stroke={"currentColor"} strokeWidth={"2"} strokeLinecap={"round"} strokeLinejoin={"round"}></path></svg><div className={"av"}>A</div><div className={"who"}><div className={"nm"}>Clínica Aurora<svg width={"13"} height={"13"} viewBox={"0 0 16 16"}><circle cx={"8"} cy={"8"} r={"7"} fill={"#3FA86F"}></circle><path d={"M4.8 8.2l2.2 2.2 4.2-4.6"} fill={"none"} stroke={"#fff"} strokeWidth={"1.6"}></path></svg></div><div className={"st"}>Agente Nhandu · online</div></div></div>
<div className={"chat"}><div className={"b b-in"}>Oi! Vocês fazem clareamento?<span className={"tm"}>22:47</span></div><div className={"b b-out"}>Fazemos, sim. Você prefere manhã ou tarde?<span className={"tm"}>22:47<svg className={"tk"} width={"15"} height={"9"} viewBox={"0 0 15 9"}><path d={"M1 5l2.5 2.5L9 1.5M6 7.5L12.5 1"} fill={"none"} stroke={"currentColor"} strokeWidth={"1.4"} strokeLinecap={"round"}></path></svg></span></div><div className={"b b-in"}>Tarde, depois das 17h<span className={"tm"}>22:47</span></div><div className={"b b-out"}>Tenho quinta, 17h30, com a Dra. Helena. Posso reservar?<span className={"tm"}>22:47<svg className={"tk"} width={"15"} height={"9"} viewBox={"0 0 15 9"}><path d={"M1 5l2.5 2.5L9 1.5M6 7.5L12.5 1"} fill={"none"} stroke={"currentColor"} strokeWidth={"1.4"} strokeLinecap={"round"}></path></svg></span></div><div className={"b b-in"}>Pode!<span className={"tm"}>22:47</span></div><div className={"typing"}><i></i><i></i><i></i></div><div className={"b b-out"}>Reservado. Um lembrete chega na véspera.<span className={"tm"}>22:47<svg className={"tk"} width={"15"} height={"9"} viewBox={"0 0 15 9"}><path d={"M1 5l2.5 2.5L9 1.5M6 7.5L12.5 1"} fill={"none"} stroke={"currentColor"} strokeWidth={"1.4"} strokeLinecap={"round"}></path></svg></span></div></div>
<div className={"ibar"}><span className={"inp"}>Mensagem</span><span className={"mic"}><svg width={"14"} height={"16"} viewBox={"0 0 14 16"}><rect x={"4"} y={"1"} width={"6"} height={"9"} rx={"3"} fill={"currentColor"}></rect><path d={"M1.5 7.5a5.5 5.5 0 0011 0M7 13v2"} fill={"none"} stroke={"currentColor"} strokeWidth={"1.4"} strokeLinecap={"round"}></path></svg></span></div>
</div></div>
<div className={"toast"} aria-hidden={"true"}><span className={"app"}><svg width={"18"} height={"18"} viewBox={"0 0 22 22"}><path d={"M4 17l1.2-3.6A7.5 7.5 0 1 1 8 17.8z"} fill={"#fff"}></path></svg></span><div><small><b>Mensagens</b> · agora</small><strong>Clínica Aurora</strong>Agente respondeu em 4 segundos</div></div>
<div className={"agc"} aria-hidden={"true"}><div className={"agc-h"}><span>AGENDA · QUI 12</span><b>sincronizada</b></div><div className={"sl"}><span>14:00</span><span>Retorno · Pedro A.</span></div><div className={"sl free"}><span>15:30</span><span>livre</span></div><div className={"sl new"}><span>17:30</span><span>Clareamento · #2481<small>via agente no WhatsApp</small></span></div><div className={"sl free"}><span>18:30</span><span>livre</span></div></div>
</>)}
{(cv1) && (<>
<div className={"phone"} aria-hidden={"true"}><div className={"screen"}>
<div className={"sbar"}><span>07:10</span><i className={"isl"}></i><span className={"sic"}><svg width={"16"} height={"10"} viewBox={"0 0 16 10"}><path d={"M1 9h2V7H1zM5 9h2V5H5zM9 9h2V3H9zM13 9h2V1h-2z"} fill={"currentColor"}></path></svg><svg width={"22"} height={"10"} viewBox={"0 0 22 10"}><rect x={".5"} y={".5"} width={"18"} height={"9"} rx={"2.5"} fill={"none"} stroke={"currentColor"}></rect><rect x={"2"} y={"2"} width={"13"} height={"6"} rx={"1.5"} fill={"currentColor"}></rect><path d={"M20 3.5v3"} stroke={"currentColor"} strokeWidth={"1.4"} strokeLinecap={"round"}></path></svg></span></div>
<div className={"chat-hd"}><svg width={"10"} height={"16"} viewBox={"0 0 10 16"}><path d={"M8 1L2 8l6 7"} fill={"none"} stroke={"currentColor"} strokeWidth={"2"} strokeLinecap={"round"} strokeLinejoin={"round"}></path></svg><div className={"av"}>H</div><div className={"who"}><div className={"nm"}>Imobiliária Horizonte<svg width={"13"} height={"13"} viewBox={"0 0 16 16"}><circle cx={"8"} cy={"8"} r={"7"} fill={"#3FA86F"}></circle><path d={"M4.8 8.2l2.2 2.2 4.2-4.6"} fill={"none"} stroke={"#fff"} strokeWidth={"1.6"}></path></svg></div><div className={"st"}>Agente Nhandu · online</div></div></div>
<div className={"chat"}><div className={"b b-in"}>O apê de 2 quartos do centro ainda está disponível?<span className={"tm"}>07:10</span></div><div className={"b b-out"}>Está sim! É para morar ou investir?<span className={"tm"}>07:10<svg className={"tk"} width={"15"} height={"9"} viewBox={"0 0 15 9"}><path d={"M1 5l2.5 2.5L9 1.5M6 7.5L12.5 1"} fill={"none"} stroke={"currentColor"} strokeWidth={"1.4"} strokeLinecap={"round"}></path></svg></span></div><div className={"b b-in"}>Morar. Tenho crédito aprovado.<span className={"tm"}>07:10</span></div><div className={"b b-out"}>Ótimo. Posso marcar a visita com o Paulo no sábado, 10h?<span className={"tm"}>07:10<svg className={"tk"} width={"15"} height={"9"} viewBox={"0 0 15 9"}><path d={"M1 5l2.5 2.5L9 1.5M6 7.5L12.5 1"} fill={"none"} stroke={"currentColor"} strokeWidth={"1.4"} strokeLinecap={"round"}></path></svg></span></div><div className={"b b-in"}>Pode sim<span className={"tm"}>07:10</span></div><div className={"typing"}><i></i><i></i><i></i></div><div className={"b b-out"}>Visita confirmada. Te mando a localização.<span className={"tm"}>07:10<svg className={"tk"} width={"15"} height={"9"} viewBox={"0 0 15 9"}><path d={"M1 5l2.5 2.5L9 1.5M6 7.5L12.5 1"} fill={"none"} stroke={"currentColor"} strokeWidth={"1.4"} strokeLinecap={"round"}></path></svg></span></div></div>
<div className={"ibar"}><span className={"inp"}>Mensagem</span><span className={"mic"}><svg width={"14"} height={"16"} viewBox={"0 0 14 16"}><rect x={"4"} y={"1"} width={"6"} height={"9"} rx={"3"} fill={"currentColor"}></rect><path d={"M1.5 7.5a5.5 5.5 0 0011 0M7 13v2"} fill={"none"} stroke={"currentColor"} strokeWidth={"1.4"} strokeLinecap={"round"}></path></svg></span></div>
</div></div>
<div className={"toast"} aria-hidden={"true"}><span className={"app"}><svg width={"18"} height={"18"} viewBox={"0 0 22 22"}><path d={"M4 17l1.2-3.6A7.5 7.5 0 1 1 8 17.8z"} fill={"#fff"}></path></svg></span><div><small><b>Mensagens</b> · agora</small><strong>Imobiliária Horizonte</strong>Visita marcada pelo agente</div></div>
<div className={"agc"} aria-hidden={"true"}><div className={"agc-h"}><span>VISITAS · SÁB 14</span><b>sincronizada</b></div><div className={"sl"}><span>09:00</span><span>Casa · Jd. Europa</span></div><div className={"sl new"}><span>10:00</span><span>Apto Centro · lead #0917<small>via agente no WhatsApp</small></span></div><div className={"sl free"}><span>11:30</span><span>livre</span></div><div className={"sl"}><span>14:00</span><span>Sala comercial</span></div></div>
</>)}
{(cv2) && (<>
<div className={"phone"} aria-hidden={"true"}><div className={"screen"}>
<div className={"sbar"}><span>23:58</span><i className={"isl"}></i><span className={"sic"}><svg width={"16"} height={"10"} viewBox={"0 0 16 10"}><path d={"M1 9h2V7H1zM5 9h2V5H5zM9 9h2V3H9zM13 9h2V1h-2z"} fill={"currentColor"}></path></svg><svg width={"22"} height={"10"} viewBox={"0 0 22 10"}><rect x={".5"} y={".5"} width={"18"} height={"9"} rx={"2.5"} fill={"none"} stroke={"currentColor"}></rect><rect x={"2"} y={"2"} width={"13"} height={"6"} rx={"1.5"} fill={"currentColor"}></rect><path d={"M20 3.5v3"} stroke={"currentColor"} strokeWidth={"1.4"} strokeLinecap={"round"}></path></svg></span></div>
<div className={"chat-hd"}><svg width={"10"} height={"16"} viewBox={"0 0 10 16"}><path d={"M8 1L2 8l6 7"} fill={"none"} stroke={"currentColor"} strokeWidth={"2"} strokeLinecap={"round"} strokeLinejoin={"round"}></path></svg><div className={"av"}>T</div><div className={"who"}><div className={"nm"}>Loja Trilha<svg width={"13"} height={"13"} viewBox={"0 0 16 16"}><circle cx={"8"} cy={"8"} r={"7"} fill={"#3FA86F"}></circle><path d={"M4.8 8.2l2.2 2.2 4.2-4.6"} fill={"none"} stroke={"#fff"} strokeWidth={"1.6"}></path></svg></div><div className={"st"}>Agente Nhandu · online</div></div></div>
<div className={"chat"}><div className={"b b-out"}>Oi, Marina! Seu carrinho ficou salvo: Tênis Trilha 37.<span className={"tm"}>23:58<svg className={"tk"} width={"15"} height={"9"} viewBox={"0 0 15 9"}><path d={"M1 5l2.5 2.5L9 1.5M6 7.5L12.5 1"} fill={"none"} stroke={"currentColor"} strokeWidth={"1.4"} strokeLinecap={"round"}></path></svg></span></div><div className={"b b-in"}>Vi, mas fiquei na dúvida do frete<span className={"tm"}>23:58</span></div><div className={"b b-out"}>Para o seu CEP chega em 3 dias úteis. Quer o link?<span className={"tm"}>23:58<svg className={"tk"} width={"15"} height={"9"} viewBox={"0 0 15 9"}><path d={"M1 5l2.5 2.5L9 1.5M6 7.5L12.5 1"} fill={"none"} stroke={"currentColor"} strokeWidth={"1.4"} strokeLinecap={"round"}></path></svg></span></div><div className={"b b-in"}>Quero!<span className={"tm"}>23:58</span></div><div className={"b b-out"}>Aqui está. O link vale por 24h.<span className={"tm"}>23:58<svg className={"tk"} width={"15"} height={"9"} viewBox={"0 0 15 9"}><path d={"M1 5l2.5 2.5L9 1.5M6 7.5L12.5 1"} fill={"none"} stroke={"currentColor"} strokeWidth={"1.4"} strokeLinecap={"round"}></path></svg></span></div><div className={"b b-in"}>Paguei!<span className={"tm"}>23:58</span></div></div>
<div className={"ibar"}><span className={"inp"}>Mensagem</span><span className={"mic"}><svg width={"14"} height={"16"} viewBox={"0 0 14 16"}><rect x={"4"} y={"1"} width={"6"} height={"9"} rx={"3"} fill={"currentColor"}></rect><path d={"M1.5 7.5a5.5 5.5 0 0011 0M7 13v2"} fill={"none"} stroke={"currentColor"} strokeWidth={"1.4"} strokeLinecap={"round"}></path></svg></span></div>
</div></div>
<div className={"toast"} aria-hidden={"true"}><span className={"app"}><svg width={"18"} height={"18"} viewBox={"0 0 22 22"}><path d={"M4 17l1.2-3.6A7.5 7.5 0 1 1 8 17.8z"} fill={"#fff"}></path></svg></span><div><small><b>Mensagens</b> · agora</small><strong>Loja Trilha</strong>Carrinho recuperado na conversa</div></div>
<div className={"agc"} aria-hidden={"true"}><div className={"agc-h"}><span>PEDIDOS · HOJE</span><b>sincronizada</b></div><div className={"sl"}><span>#10440</span><span>enviado</span></div><div className={"sl"}><span>#10441</span><span>separando</span></div><div className={"sl new"}><span>#10442</span><span>recuperado · Marina<small>via agente no WhatsApp</small></span></div><div className={"sl"}><span>#10443</span><span>pago</span></div></div>
</>)}
{(cv3) && (<>
<div className={"phone"} aria-hidden={"true"}><div className={"screen"}>
<div className={"sbar"}><span>19:30</span><i className={"isl"}></i><span className={"sic"}><svg width={"16"} height={"10"} viewBox={"0 0 16 10"}><path d={"M1 9h2V7H1zM5 9h2V5H5zM9 9h2V3H9zM13 9h2V1h-2z"} fill={"currentColor"}></path></svg><svg width={"22"} height={"10"} viewBox={"0 0 22 10"}><rect x={".5"} y={".5"} width={"18"} height={"9"} rx={"2.5"} fill={"none"} stroke={"currentColor"}></rect><rect x={"2"} y={"2"} width={"13"} height={"6"} rx={"1.5"} fill={"currentColor"}></rect><path d={"M20 3.5v3"} stroke={"currentColor"} strokeWidth={"1.4"} strokeLinecap={"round"}></path></svg></span></div>
<div className={"chat-hd"}><svg width={"10"} height={"16"} viewBox={"0 0 10 16"}><path d={"M8 1L2 8l6 7"} fill={"none"} stroke={"currentColor"} strokeWidth={"2"} strokeLinecap={"round"} strokeLinejoin={"round"}></path></svg><div className={"av"}>L</div><div className={"who"}><div className={"nm"}>Contábil Lima<svg width={"13"} height={"13"} viewBox={"0 0 16 16"}><circle cx={"8"} cy={"8"} r={"7"} fill={"#3FA86F"}></circle><path d={"M4.8 8.2l2.2 2.2 4.2-4.6"} fill={"none"} stroke={"#fff"} strokeWidth={"1.6"}></path></svg></div><div className={"st"}>Agente Nhandu · online</div></div></div>
<div className={"chat"}><div className={"b b-in"}>Queremos terceirizar a contabilidade<span className={"tm"}>19:30</span></div><div className={"b b-out"}>Claro! Quantas notas vocês emitem por mês?<span className={"tm"}>19:30<svg className={"tk"} width={"15"} height={"9"} viewBox={"0 0 15 9"}><path d={"M1 5l2.5 2.5L9 1.5M6 7.5L12.5 1"} fill={"none"} stroke={"currentColor"} strokeWidth={"1.4"} strokeLinecap={"round"}></path></svg></span></div><div className={"b b-in"}>Umas 300<span className={"tm"}>19:30</span></div><div className={"b b-out"}>E hoje usam algum sistema?<span className={"tm"}>19:30<svg className={"tk"} width={"15"} height={"9"} viewBox={"0 0 15 9"}><path d={"M1 5l2.5 2.5L9 1.5M6 7.5L12.5 1"} fill={"none"} stroke={"currentColor"} strokeWidth={"1.4"} strokeLinecap={"round"}></path></svg></span></div><div className={"b b-in"}>Planilha mesmo<span className={"tm"}>19:30</span></div><div className={"typing"}><i></i><i></i><i></i></div><div className={"b b-out"}>Marquei uma conversa na terça, 10h. Até lá!<span className={"tm"}>19:30<svg className={"tk"} width={"15"} height={"9"} viewBox={"0 0 15 9"}><path d={"M1 5l2.5 2.5L9 1.5M6 7.5L12.5 1"} fill={"none"} stroke={"currentColor"} strokeWidth={"1.4"} strokeLinecap={"round"}></path></svg></span></div></div>
<div className={"ibar"}><span className={"inp"}>Mensagem</span><span className={"mic"}><svg width={"14"} height={"16"} viewBox={"0 0 14 16"}><rect x={"4"} y={"1"} width={"6"} height={"9"} rx={"3"} fill={"currentColor"}></rect><path d={"M1.5 7.5a5.5 5.5 0 0011 0M7 13v2"} fill={"none"} stroke={"currentColor"} strokeWidth={"1.4"} strokeLinecap={"round"}></path></svg></span></div>
</div></div>
<div className={"toast"} aria-hidden={"true"}><span className={"app"}><svg width={"18"} height={"18"} viewBox={"0 0 22 22"}><path d={"M4 17l1.2-3.6A7.5 7.5 0 1 1 8 17.8z"} fill={"#fff"}></path></svg></span><div><small><b>Mensagens</b> · agora</small><strong>Contábil Lima</strong>Reunião marcada pelo agente</div></div>
<div className={"agc"} aria-hidden={"true"}><div className={"agc-h"}><span>FUNIL · ESTA SEMANA</span><b>sincronizada</b></div><div className={"sl"}><span>novo</span><span>Studio Vale</span></div><div className={"sl"}><span>quali.</span><span>Ótica Leme</span></div><div className={"sl new"}><span>reunião</span><span>Contábil Lima · ter 10h<small>via agente no WhatsApp</small></span></div><div className={"sl"}><span>proposta</span><span>Escola Ápice</span></div></div>
</>)}
<div className={"ptabs"} role={"group"} aria-label={"Ver exemplos de conversa"}>{(cvTabs || []).map((c, $index) => (<React.Fragment key={$index}><button type={"button"} className={c.cls} aria-pressed={c.pressed} onClick={c.pick}>{c.label}</button></React.Fragment>))}</div>
</div>
</div>
</section>

<section className={"strip"} aria-label={"Segmentos atendidos"}>
<div className={"wrap strip-in"}>
<p>Para negócios que vendem pelo WhatsApp</p>
<div className={"mq"}><div className={"mq-track"}>
<span>Clínicas</span><span>Odontologia</span><span>Estética</span><span>Imobiliárias</span><span>E-commerce</span><span>Escritórios</span><span>Serviços B2B</span>
<span aria-hidden={"true"}>Clínicas</span><span aria-hidden={"true"}>Odontologia</span><span aria-hidden={"true"}>Estética</span><span aria-hidden={"true"}>Imobiliárias</span><span aria-hidden={"true"}>E-commerce</span><span aria-hidden={"true"}>Escritórios</span><span aria-hidden={"true"}>Serviços B2B</span>
</div></div>
</div>
</section>

<section className={"calc-wrap"} id={"calculadora"} aria-label={"Quanto o atendimento perdido custa"}>
<div className={"calc-stick"}>
<div className={"calc-in"}>
<div className={"wrap cx"}>
<div className={"cx-l"}>
<div className={"cx-art"} aria-hidden={"true"}><svg className={"maze maze-l draw"} viewBox={"0 0 48 48"} aria-hidden={"true"}>
<path className={"w"} pathLength={"1"} d={"M32.04 4.6L15.96 4.6L4.6 15.96L4.6 32.04L15.96 43.4L32.04 43.4L43.4 32.04L43.4 15.96M38.78 17.88L30.12 9.22L17.88 9.22L9.22 17.88M9.22 30.12L17.88 38.78L30.12 38.78L38.78 30.12L38.78 17.88M34.16 19.79L28.21 13.84L19.79 13.84L13.84 19.79L13.84 28.21L19.79 34.16L28.21 34.16M34.16 28.21L34.16 19.79M29.54 21.7L26.3 18.46M21.7 18.46L18.46 21.7L18.46 26.3L21.7 29.54L26.3 29.54L29.54 26.3L29.54 21.7"}></path>
<path className={"t"} pathLength={"1"} d={"M40.01 7.99L36.09 11.91L31.08 6.91L16.92 6.91L6.91 16.92L6.91 24.0L11.53 24.0L11.53 29.17L18.83 36.47L29.17 36.47L32.82 32.82L29.55 29.55L31.85 27.25L31.85 20.75L27.25 16.15L24.0 16.15L24 24"}></path>
</svg><span className={"cx-tag"}>o caminho que o cliente faz até desistir</span></div>

<h2 className={"h2"}>Quanto o labirinto do atendimento <em>custa para você?</em></h2>
<p className={"lead"} style={{marginTop: "18px"}}>Toda mensagem que fica sem resposta é um cliente indo para o concorrente. Coloque os números do seu negócio e veja quanto está em jogo todo mês.</p>
<ul className={"pains2"}>
<li>Mensagem às 22h, resposta no dia seguinte</li>
<li>Orçamentos que ninguém retoma</li>
<li>Agenda, planilha e WhatsApp separados</li>
</ul>
</div>
<div className={"calc rv"}>
<div className={"cr"}>
<label htmlFor={"c-msgs"}>Novos contatos no WhatsApp por mês</label>
<output htmlFor={"c-msgs"}>{cmV}</output>
<input id={"c-msgs"} type={"range"} min={"50"} max={"2000"} step={"10"} value={cmV} onChange={onCm} />
</div>
<div className={"cr"}>
<label htmlFor={"c-off"}>Quantos chegam fora do horário</label>
<output htmlFor={"c-off"}>{cpV}%</output>
<input id={"c-off"} type={"range"} min={"5"} max={"70"} step={"1"} value={cpV} onChange={onCp} />
</div>
<div className={"cr"}>
<label htmlFor={"c-conv"}>De cada 10 bem atendidos, quantos fecham</label>
<output htmlFor={"c-conv"}>{ccV} de 10</output>
<input id={"c-conv"} type={"range"} min={"1"} max={"8"} step={"1"} value={ccV} onChange={onCc} />
</div>
<div className={"cr"}>
<label htmlFor={"c-ticket"}>Valor médio de um cliente</label>
<div className={"money-in"}><span>R$</span><input id={"c-ticket"} type={"number"} min={"0"} step={"50"} value={ctV} onChange={onCt} /></div>
</div>
<div className={resCls} aria-live={"polite"}>
<div className={"res-top"}><span className={"res-k"}>Receita em jogo por mês</span><span className={"lvl"}>{lvlTxt}</span></div>
<div className={pulseCls}>{moneyTxt}</div>
<div className={"meter"} aria-hidden={"true"}><i style={{width: `${meterW}%`}}></i></div>
<p className={"res-say"}>{sayTxt}</p>
<span className={"res-y"}>{yearTxt} por ano</span>
<div className={"res-bar"} aria-hidden={"true"}><i style={{width: `${inW}%`}}></i><b style={{width: `${offW}%`}}></b></div>
<div className={"res-l"}><span><i></i>{inTxt} no horário</span><span><b></b>{offTxt} fora do horário · {lostTxt} clientes possíveis</span></div>
</div>
<a className={"btn btn-acc cta-big"} href={"#form-diag"}>Quero recuperar {moneyTxt} por mês <span className={"arr"} aria-hidden={"true"}>→</span></a>
<p className={"cta-sub"}>Diagnóstico sem compromisso: você vê o raio-x antes de qualquer proposta.</p>
<small className={"calc-n"}>Estimativa simples: considera só os contatos que chegam fora do horário e a sua própria taxa de fechamento.</small>
</div>
</div>
</div>
<div className={"portal"} aria-hidden={"true"}><p className={"portal-t"}>Agora, veja como fechamos esse vazamento.</p></div>
</div>
<div className={"calc-space"} aria-hidden={"true"}></div>
</section>

<section className={"dk"} id={"camadas"} style={{marginTop: "-1px"}} aria-label={"Como funciona, camada por camada"}>
<div className={"wrap layers-intro"}>
<h2 className={"h2 words"}><span className={"wd"} style={{animationRange: "entry 0% cover 26%"}}>Infraestrutura</span> <span className={"wd"} style={{animationRange: "entry 12% cover 32%"}}>de</span> <span className={"wd"} style={{animationRange: "entry 24% cover 38%"}}>atendimento</span> <span className={"wd"} style={{animationRange: "entry 36% cover 44%"}}>construída</span> <span className={"wd"} style={{animationRange: "entry 48% cover 50%"}}>em</span> <em className={"wd"} style={{animationRange: "entry 65% cover 60%"}}>camadas.</em></h2>
<p className={"lead wd"} style={{animationRange: "entry 70% cover 66%"}}>Começamos pela análise do seu negócio e subimos camada por camada até os dados. Role para ver cada parte se encaixar, do primeiro contato ao relatório da semana.</p>
</div>
<div className={"track"}>
<div className={"sticky"}>
<div className={"sticky-l"}>
<div className={"mprog"} aria-hidden={"true"}>{(steps || []).map((s, $index) => (<React.Fragment key={$index}><i className={s.cls}><b>{s.n}</b></i></React.Fragment>))}</div>
<div className={"steps"}>
<div className={"rail"} aria-hidden={"true"}></div>
{(steps || []).map((s, $index) => (<React.Fragment key={$index}>
<div className={s.cls}>
<span className={"st-dot"} aria-hidden={"true"}></span>
<div className={"st-full"}>
<div className={"st-num"}>{s.n}<b>{s.k}</b></div>
<h3>{s.title}</h3>
<p>{s.desc}</p>
{(s.v0) && (<>
<div className={"lv lv0"}>
<div className={"lv-h"}><b>Raio-x da operação</b><span>Clínica Aurora · exemplo</span></div>
<div className={"lv0-g"}>
<div className={"jr0"}>
<div className={"jrow"} style={{animationDelay: ".1s"}}><span>Anúncio → WhatsApp</span><em>40s</em></div>
<div className={"jrow bad"} style={{animationDelay: ".25s"}}><span>Até a 1ª resposta</span><em>2h14</em></div>
<div className={"jrow bad"} style={{animationDelay: ".4s"}}><span>Mensagens de fim de semana</span><em>sem resposta</em></div>
<div className={"jrow bad"} style={{animationDelay: ".55s"}}><span>Orçamento → retorno</span><em>nenhum</em></div>
<div className={"jrow"} style={{animationDelay: ".7s"}}><span>Agenda</span><em>manual</em></div>
</div>
<div className={"gauge"}>
<svg viewBox={"0 0 100 100"} width={"118"} height={"118"} aria-hidden={"true"}><circle cx={"50"} cy={"50"} r={"42"} fill={"none"} stroke={"#36302A"} strokeWidth={"8"}></circle><circle className={"gv"} cx={"50"} cy={"50"} r={"42"} fill={"none"} stroke={"#E8643F"} strokeWidth={"8"} strokeLinecap={"round"} pathLength={"100"} strokeDasharray={"54 100"} transform={"rotate(-90 50 50)"}></circle></svg>
<b>54</b><small>nota do atendimento</small>
</div>
</div>
<div className={"prio"}><span className={"p1"}>P1 · Agente fora do horário</span><span className={"p2"}>P2 · Retomar orçamentos</span><span className={"p3"}>P3 · Agenda integrada</span></div>
<i className={"scan"}></i>
</div>
</>)}
{(s.v1) && (<>
<div className={"lv lv1"}>
<div className={"lv-h"}><b>Revisão da página</b><span>rodada 2 de 2</span></div>
<div className={"lv1-g"}>
<div className={"wf"}><i style={{width: "70%"}}></i><i style={{width: "46%"}}></i><i className={"h"} style={{height: "46px"}}></i><div className={"wf3"}><i></i><i></i><i></i></div><small>rascunho</small></div>
<span className={"to"}>→</span>
<div className={"fin"}><div className={"fin-n"}><b>Clínica Aurora</b><span></span></div><div className={"fin-h"}>Seu sorriso, sem fila de espera.</div><span className={"fin-b"}>Falar no WhatsApp</span><div className={"fin-img"}></div><span className={"pin"} style={{left: "70%", top: "52%"}}>1</span><span className={"pin"} style={{left: "22%", top: "60%"}}>2</span><small>aprovada</small></div>
</div>
<div className={"cm-list"}><span className={"ok"} style={{animationDelay: ".5s"}}>1 · Foto principal trocada</span><span className={"ok"} style={{animationDelay: ".8s"}}>2 · Botão do WhatsApp em destaque</span><span className={"stamp"}>Aprovada pela clínica · publicar</span></div>
</div>
</>)}
{(s.v2) && (<>
<div className={"lv lv2"}>
<div className={"lv-h"}><b>Roteiro do agente</b><span>versão 1.2</span></div>
<div className={"intent"} style={{animationDelay: ".1s"}}><span className={"q"}>Quer agendar</span><span className={"ar"}></span><span className={"a"}>Oferece só horários livres</span><em className={"au"}>agente</em></div>
<div className={"intent"} style={{animationDelay: ".25s"}}><span className={"q"}>Pergunta o preço</span><span className={"ar"}></span><span className={"a"}>Explica e convida para a avaliação</span><em className={"au"}>agente</em></div>
<div className={"intent"} style={{animationDelay: ".4s"}}><span className={"q"}>Dúvida clínica</span><span className={"ar"}></span><span className={"a"}>Passa para a equipe com o resumo</span><em className={"hu"}>equipe</em></div>
<div className={"intent"} style={{animationDelay: ".55s"}}><span className={"q"}>Reclamação</span><span className={"ar"}></span><span className={"a"}>Prioridade para a gerência</span><em className={"hu"}>equipe</em></div>
<div className={"tested"}>Testado em conversas simuladas antes de ir para o número oficial</div>
<span className={"seal"}>APROVADO<br />PELA CLÍNICA</span>
</div>
</>)}
{(s.v3) && (<>
<div className={"lv lv3"}>
<div className={"lv-h"}><b>Integrações</b><span>4 de 4 conectadas</span></div>
<div className={"hubmap"}>
<svg className={"hm-lines"} viewBox={"0 0 520 190"} preserveAspectRatio={"none"} aria-hidden={"true"}><path d={"M260 95L70 34"}></path><path d={"M260 95L450 34"}></path><path d={"M260 95L70 156"}></path><path d={"M260 95L450 156"}></path></svg>
<div className={"hn2 c"}><b>Nhandu</b><small>orquestra</small></div>
<div className={"hn2"} style={{left: "2%", top: "4%", animationDelay: ".3s"}}><b>WhatsApp</b><small className={"okk"}>conectado</small></div>
<div className={"hn2"} style={{right: "2%", top: "4%", animationDelay: ".5s"}}><b>Agenda</b><small className={"okk"}>conectado</small></div>
<div className={"hn2"} style={{left: "2%", bottom: "4%", animationDelay: ".7s"}}><b>CRM</b><small className={"okk"}>conectado</small></div>
<div className={"hn2"} style={{right: "2%", bottom: "4%", animationDelay: ".9s"}}><b>E-mail e planilha</b><small className={"okk"}>conectado</small></div>
</div>
<div className={"ticker"}><span>lead.agendado</span><i></i><span>crm.etapa = agendado</span><i></i><span>lembrete em 24h</span></div>
</div>
</>)}
{(s.v4) && (<>
<div className={"lv lv4"}>
<div className={"lv-h"}><b>Relatório da semana</b><span>chega toda segunda · exemplo</span></div>
<div className={"lv4-g"}>
<div className={"msg"}>
<div className={"msg-h"}><span className={"av2"}>N</span><div><b>Nhandu</b><small>seg 08:00</small></div></div>
<div className={"msg-b"}><b>Semana 46 · Clínica Aurora</b>
<svg viewBox={"0 0 200 50"} width={"100%"} height={"50"} aria-hidden={"true"}><path className={"spark"} pathLength={"1"} d={"M0 40L28 34L56 38L84 24L112 28L140 14L168 18L200 6"} fill={"none"} stroke={"#E8643F"} strokeWidth={"2.4"} strokeLinecap={"round"} strokeLinejoin={"round"}></path></svg>
<ul><li>38 conversas atendidas</li><li>12 consultas agendadas</li><li>5 retomadas pelo follow-up</li><li>Pico de mensagens: domingo, 21h</li></ul>
</div>
</div>
<div className={"side4"}>
<div className={"s4"}><span className={"i4"}><svg width={"18"} height={"18"} viewBox={"0 0 22 22"}><rect x={"3"} y={"4.5"} width={"16"} height={"14"} rx={"1.5"} fill={"none"} stroke={"currentColor"} strokeWidth={"1.5"}></rect><path d={"M3 9h16M7 2.5v4M15 2.5v4"} fill={"none"} stroke={"currentColor"} strokeWidth={"1.5"}></path></svg></span><div><b>Reunião mensal</b><small>ajustes do roteiro com os dados</small></div></div>
<div className={"s4"}><span className={"i4"}><svg width={"18"} height={"18"} viewBox={"0 0 22 22"}><rect x={"3"} y={"9"} width={"16"} height={"11"} rx={"2"} fill={"none"} stroke={"currentColor"} strokeWidth={"1.5"}></rect><path d={"M7 9V6a4 4 0 018 0v3"} fill={"none"} stroke={"currentColor"} strokeWidth={"1.5"}></path></svg></span><div><b>Dados no seu nome</b><small>registros auditáveis, LGPD</small></div></div>
</div>
</div>
</div>
</>)}

</div>
<button type={"button"} className={"st-mini"} onClick={s.go}>{s.n}<b>{s.k}</b></button>
</div>
</React.Fragment>))}
</div>
</div>
<div className={"sticky-r"} aria-hidden={"true"}>
<div className={"iso"}><div className={"stagec"}>

<div className={pl.p5} style={{"--z": `${pl.z5}px`}}>
<svg viewBox={"0 0 312 312"}>
<rect className={"s"} x={"0"} y={"0"} width={"312"} height={"312"} rx={"6"}></rect>
<text x={"14"} y={"24"}>RELATÓRIO · SEMANA 46</text>
<path className={"s"} d={"M14 36H298"}></path>
<rect className={"f"} x={"18"} y={"150"} width={"26"} height={"60"}></rect><rect className={"f"} x={"54"} y={"120"} width={"26"} height={"90"}></rect><rect className={"f"} x={"90"} y={"134"} width={"26"} height={"76"}></rect><rect className={"f"} x={"126"} y={"96"} width={"26"} height={"114"}></rect>
<rect className={"af"} x={"162"} y={"70"} width={"26"} height={"140"}></rect>
<path className={"a"} d={"M18 120L62 96L102 106L140 70L176 48"}></path>
<path className={"s"} d={"M14 214H196"}></path>
<path className={"s"} d={"M232 58l34 12v22c0 22-14 36-34 44-20-8-34-22-34-44V70z"}></path>
<path className={"a"} d={"M218 92l10 10 20-22"}></path>
<text x={"210"} y={"160"}>LGPD</text>
<path className={"s"} d={"M14 246h1M20 246h3M27 246h1M32 246h4M40 246h1M45 246h2M51 246h1M56 246h4M64 246h1M69 246h2M75 246h1M80 246h3M87 246h1M92 246h4M100 246h1M105 246h2M111 246h1M116 246h3M123 246h1"} style={{strokeWidth: "26px"}}></path>
<text x={"14"} y={"290"}>LOGS AUDITÁVEIS · DADOS NO SEU NOME</text>
</svg>
<span className={"lbl"}>05 DADOS</span>
</div>

<div className={pl.p4} style={{"--z": `${pl.z4}px`}}>
<svg viewBox={"0 0 312 312"}>
<rect className={"s"} x={"0"} y={"0"} width={"312"} height={"312"} rx={"6"}></rect>
<rect className={"s"} x={"16"} y={"22"} width={"84"} height={"74"} rx={"8"}></rect>
<path className={"s"} d={"M16 44h84M36 14v14M80 14v14"}></path>
<rect className={"af"} x={"48"} y={"56"} width={"20"} height={"18"} rx={"3"}></rect>
<text x={"24"} y={"114"}>AGENDA</text>
<rect className={"s"} x={"200"} y={"22"} width={"96"} height={"74"} rx={"8"}></rect>
<rect className={"f"} x={"210"} y={"34"} width={"20"} height={"50"} rx={"3"}></rect><rect className={"f"} x={"238"} y={"34"} width={"20"} height={"34"} rx={"3"}></rect><rect className={"af"} x={"266"} y={"34"} width={"20"} height={"22"} rx={"3"}></rect>
<text x={"216"} y={"114"}>CRM</text>
<rect className={"s"} x={"108"} y={"178"} width={"96"} height={"74"} rx={"8"}></rect>
<path className={"s"} d={"M156 196c-12 0-18 9-18 20v12l-6 8h48l-6-8v-12c0-11-6-20-18-20zM150 240c2 6 10 6 12 0"}></path>
<text x={"114"} y={"272"}>FOLLOW-UP</text>
<path className={"a"} d={"M100 59H200"} strokeDasharray={"6 6"}></path>
<path className={"a"} d={"M58 96v40c0 20 20 42 50 42"} strokeDasharray={"6 6"}></path>
<path className={"a"} d={"M248 96v40c0 20-20 42-44 42"} strokeDasharray={"6 6"}></path>
</svg>
<span className={"lbl"}>04 AUTOMAÇÃO</span>
</div>

<div className={pl.p3} style={{"--z": `${pl.z3}px`}}>
<svg viewBox={"0 0 312 312"}>
<rect className={"s"} x={"0"} y={"0"} width={"312"} height={"312"} rx={"6"}></rect>
<rect className={"s"} x={"22"} y={"34"} width={"96"} height={"84"} rx={"22"}></rect>
<path className={"s"} d={"M70 34V16"}></path><circle className={"af"} cx={"70"} cy={"13"} r={"5"}></circle>
<circle className={"af"} cx={"52"} cy={"72"} r={"7"}></circle><circle className={"af"} cx={"88"} cy={"72"} r={"7"}></circle>
<path className={"s"} d={"M54 98h32"}></path>
<path className={"s"} d={"M140 40h150a12 12 0 0 1 12 12v22a12 12 0 0 1-12 12H160l-14 12V52a12 12 0 0 1 12-12z"} transform={"translate(-6 0)"}></path>
<path className={"s"} d={"M150 58h110M150 70h70"}></path>
<rect className={"f"} x={"22"} y={"140"} width={"190"} height={"36"} rx={"12"}></rect>
<rect className={"s"} x={"96"} y={"188"} width={"196"} height={"36"} rx={"12"}></rect>
<rect className={"af"} x={"22"} y={"236"} width={"150"} height={"36"} rx={"12"}></rect>
<text x={"190"} y={"292"}>24/7 · API OFICIAL</text>
</svg>
<span className={"lbl"}>03 AGENTE NO WHATSAPP</span>
</div>

<div className={pl.p2} style={{"--z": `${pl.z2}px`}}>
<svg viewBox={"0 0 312 312"}>
<rect className={"s"} x={"0"} y={"0"} width={"312"} height={"312"} rx={"6"}></rect>
<path className={"s"} d={"M0 28H312"}></path><circle className={"f"} cx={"16"} cy={"14"} r={"5"}></circle><circle className={"f"} cx={"32"} cy={"14"} r={"5"}></circle><circle className={"f"} cx={"48"} cy={"14"} r={"5"}></circle>
<rect className={"s"} x={"18"} y={"44"} width={"170"} height={"20"} rx={"4"}></rect>
<rect className={"f"} x={"18"} y={"74"} width={"130"} height={"12"} rx={"3"}></rect>
<rect className={"af"} x={"18"} y={"100"} width={"96"} height={"24"} rx={"12"}></rect>
<rect className={"s"} x={"204"} y={"44"} width={"90"} height={"80"} rx={"6"} strokeDasharray={"5 5"}></rect>
<path className={"s"} d={"M204 44l90 80M294 44l-90 80"} style={{opacity: ".5"}}></path>
<rect className={"s"} x={"18"} y={"146"} width={"84"} height={"64"} rx={"6"}></rect><rect className={"s"} x={"114"} y={"146"} width={"84"} height={"64"} rx={"6"}></rect><rect className={"s"} x={"210"} y={"146"} width={"84"} height={"64"} rx={"6"} strokeDasharray={"5 5"}></rect>
<rect className={"f"} x={"18"} y={"226"} width={"276"} height={"10"} rx={"3"}></rect>
<rect className={"s"} x={"18"} y={"250"} width={"276"} height={"10"} rx={"3"} strokeDasharray={"5 5"}></rect>
<path className={"a"} d={"M232 176l18 44 8-16 16-6z"}></path>
<text x={"18"} y={"292"}>CONSTRUINDO · 68%</text>
</svg>
<span className={"lbl"}>02 PÁGINA</span>
</div>

<div className={pl.p1} style={{"--z": `${pl.z1}px`}}>
<svg viewBox={"0 0 312 312"}>
<rect className={"s"} x={"0"} y={"0"} width={"312"} height={"312"} rx={"6"}></rect>
<text x={"14"} y={"24"}>JORNADA DO CONTATO</text>
<circle className={"s"} cx={"34"} cy={"80"} r={"16"}></circle><circle className={"s"} cx={"112"} cy={"80"} r={"16"}></circle><circle className={"s"} cx={"190"} cy={"80"} r={"16"}></circle><circle className={"af"} cx={"268"} cy={"80"} r={"16"}></circle>
<path className={"s"} d={"M50 80h46M128 80h46M206 80h46"} strokeDasharray={"4 5"}></path>
<text x={"16"} y={"118"}>ANÚNCIO</text><text x={"92"} y={"118"}>WHATS</text><text x={"168"} y={"118"}>ESPERA</text><text x={"244"} y={"118"}>PERDEU</text>
<circle className={"a"} cx={"196"} cy={"186"} r={"44"}></circle>
<path className={"a"} d={"M228 218l38 38"}></path>
<text x={"168"} y={"182"}>2h 14min</text><text x={"160"} y={"198"}>sem resposta</text>
<rect className={"f"} x={"14"} y={"150"} width={"110"} height={"14"} rx={"3"}></rect><rect className={"f"} x={"14"} y={"172"} width={"86"} height={"14"} rx={"3"}></rect><rect className={"f"} x={"14"} y={"194"} width={"58"} height={"14"} rx={"3"}></rect><rect className={"af"} x={"14"} y={"216"} width={"30"} height={"14"} rx={"3"}></rect>
<text x={"14"} y={"292"}>GARGALO ENCONTRADO</text>
</svg>
<span className={"lbl"}>01 DIAGNÓSTICO</span>
</div>

<div className={"axis"}></div>
<div className={"packet"}></div>
<div className={"co r"} style={{top: `${pl.coTop}px`}}><span className={"ln"}></span><span className={"pt"}></span>{pl.coR}</div>
<div className={"co l"} style={{top: `${pl.coTop}px`}}><span className={"ln"}></span><span className={"pt"}></span>{pl.coL}</div>
</div></div>
</div>
</div>
</div>
</section>

<div className={"dk-shell"}>
<section className={"sec lift"} id={"pratica"}>
<div className={"wrap"}>
<div className={"head2 rv"}>
<h2 className={"h2"}>Do primeiro “oi” à agenda, <em>sem ninguém digitar.</em></h2>
<p className={"lead"}>A conversa acontece no WhatsApp. Ao mesmo tempo, a ficha se preenche e o horário aparece na agenda da recepção, com o resumo pronto para a equipe.</p>
</div>
<figure className={"vframe rv"}>
<video ref={setDemo} src={demoSrc} poster={demoPoster} muted={true} loop={true} playsInline={true} autoPlay={true} preload={"metadata"} aria-hidden={"true"}></video>
<figcaption className={"sr"}>Demonstração: a paciente pergunta sobre clareamento, o agente oferece quinta às 17h30, a ficha passa de novo contato para qualificado e agendado, e o horário aparece na agenda da recepção.</figcaption>
<button type={"button"} className={"vbtn"} aria-label={demoLabel} onClick={toggleDemo}>
{(demoPaused) && (<><svg width={"16"} height={"16"} viewBox={"0 0 16 16"} aria-hidden={"true"}><path d={"M4 2.5v11l9-5.5z"} fill={"currentColor"}></path></svg></>)}
{(demoPlaying) && (<><svg width={"16"} height={"16"} viewBox={"0 0 16 16"} aria-hidden={"true"}><rect x={"3.5"} y={"2.5"} width={"3"} height={"11"} fill={"currentColor"}></rect><rect x={"9.5"} y={"2.5"} width={"3"} height={"11"} fill={"currentColor"}></rect></svg></>)}
</button>
</figure>
</div>
</section>
</div>

<section className={"sol split"} id={"solucoes"} aria-label={"Soluções por segmento"}>
<div className={"sol-l"}>
<h2 className={"h2"}>Desenhado para quem <em>vive de atendimento.</em></h2>
<div className={"acc-list"}>
{(segs || []).map((g, $index) => (<React.Fragment key={$index}>
<div className={g.cls}>
<button type={"button"} className={"acc-btn"} aria-expanded={g.expanded} onClick={g.pick}>{g.tab}<span className={"pm"} aria-hidden={"true"}>{g.sign}</span></button>
<div className={"acc-body"}>
<p>{g.desc}</p>
<ul className={"feat"}>
<li><svg width={"18"} height={"18"} viewBox={"0 0 18 18"} aria-hidden={"true"}><circle cx={"9"} cy={"9"} r={"7.5"} fill={"none"} stroke={"currentColor"} strokeWidth={"1.4"}></circle><path d={"M5.5 9.2l2.3 2.3 4.7-5"} fill={"none"} stroke={"currentColor"} strokeWidth={"1.4"}></path></svg>{g.b1}</li>
<li><svg width={"18"} height={"18"} viewBox={"0 0 18 18"} aria-hidden={"true"}><circle cx={"9"} cy={"9"} r={"7.5"} fill={"none"} stroke={"currentColor"} strokeWidth={"1.4"}></circle><path d={"M5.5 9.2l2.3 2.3 4.7-5"} fill={"none"} stroke={"currentColor"} strokeWidth={"1.4"}></path></svg>{g.b2}</li>
<li><svg width={"18"} height={"18"} viewBox={"0 0 18 18"} aria-hidden={"true"}><circle cx={"9"} cy={"9"} r={"7.5"} fill={"none"} stroke={"currentColor"} strokeWidth={"1.4"}></circle><path d={"M5.5 9.2l2.3 2.3 4.7-5"} fill={"none"} stroke={"currentColor"} strokeWidth={"1.4"}></path></svg>{g.b3}</li>
</ul>
<a className={"btn btn-line"} href={"#comecar"}>Diagnosticar meu atendimento</a>
</div>
</div>
</React.Fragment>))}
</div>
</div>
<div className={"sol-r dk"}>
{(hasPhoto) && (<><img className={"sol-photo"} src={photo} alt={""} /><span className={"sol-shade"}></span></>)}
<svg className={artCls} viewBox={"0 0 48 48"} preserveAspectRatio={"xMidYMid slice"} aria-hidden={"true"}><g fill={"none"} stroke={"#4A433B"} strokeWidth={".12"}><path d={"M29.54 21.7L26.3 18.46L21.7 18.46L18.46 21.7L18.46 26.3L21.7 29.54L26.3 29.54L29.54 26.3ZM34.16 19.79L28.21 13.84L19.79 13.84L13.84 19.79L13.84 28.21L19.79 34.16L28.21 34.16L34.16 28.21ZM38.78 17.88L30.12 9.22L17.88 9.22L9.22 17.88L9.22 30.12L17.88 38.78L30.12 38.78L38.78 30.12ZM43.4 15.96L32.04 4.6L15.96 4.6L4.6 15.96L4.6 32.04L15.96 43.4L32.04 43.4L43.4 32.04ZM24 24L43.4 15.96M24 24L32.04 4.6M24 24L15.96 4.6M24 24L4.6 15.96M24 24L4.6 32.04M24 24L15.96 43.4M24 24L32.04 43.4M24 24L43.4 32.04"}></path></g></svg>

{(isClin) && (<>
<div className={"scene"}>
<div className={"scard"}>
<div className={"sh"}><span><b>CLÍNICA AURORA</b> · agenda da semana</span><span className={"badge"}>sincronizada</span></div>
<div className={"cal"}>
<span></span><span className={"hd"}>QUA 11</span><span className={"hd"}>QUI 12</span><span className={"hd"}>SEX 13</span>
<span className={"tm"}>09:00</span><div className={"ev"}>Limpeza<small>Marcos S.</small></div><div className={"ev"}>Avaliação<small>Júlia R.</small></div><div className={"ev x"}></div>
<span className={"tm"}>14:00</span><div className={"ev x"}></div><div className={"ev"}>Retorno<small>Pedro A.</small></div><div className={"ev"}>Canal<small>Lia M.</small></div>
<span className={"tm"}>17:30</span><div className={"ev"}>Faceta<small>Ana P.</small></div><div className={"ev n"}>Clareamento<small>via WhatsApp · agora</small></div><div className={"ev x"}></div>
<span className={"tm"}>18:30</span><div className={"ev x"}></div><div className={"ev x"}></div><div className={"ev"}>Avaliação<small>Rui T.</small></div>
</div>
</div>
<div className={"scard"}>
<div className={"rem"}><span className={"ic"}><svg width={"18"} height={"18"} viewBox={"0 0 22 22"} aria-hidden={"true"}><path d={"M11 3c-3.5 0-5.5 2.6-5.5 6v4l-1.8 2.5h14.6L16.5 13V9c0-3.4-2-6-5.5-6zM9 18c.5 1.5 3.5 1.5 4 0"} fill={"none"} stroke={"currentColor"} strokeWidth={"1.5"}></path></svg></span><div>Lembretes de amanhã enviados<small>6 pacientes confirmaram pelo WhatsApp</small></div></div>
</div>
</div>
</>)}

{(isImob) && (<>
<div className={"scene"}>
<div className={"scard"}>
<div className={"sh"}><span><b>IMOBILIÁRIA HORIZONTE</b> · lead #0917</span><span className={"badge"}>qualificado</span></div>
<div className={"prop"}>
<svg className={"plan"} viewBox={"0 0 150 120"} width={"150"} height={"120"} aria-hidden={"true"}><g fill={"none"} stroke={"#6E675E"} strokeWidth={"1.2"}><rect x={"8"} y={"8"} width={"134"} height={"104"}></rect><path d={"M70 8v52M8 60h96M104 60v52M70 60v-14M104 86h38"}></path><path d={"M30 60a14 14 0 0 1 14-14"} strokeDasharray={"2 2"}></path></g><g fontFamily={"Geist Mono, monospace"} fontSize={"7"} fill={"#6E675E"}><text x={"18"} y={"34"}>SALA</text><text x={"80"} y={"34"}>QUARTO 1</text><text x={"18"} y={"90"}>COZINHA</text><text x={"74"} y={"90"}>BWC</text><text x={"110"} y={"78"}>QUARTO 2</text></g><circle cx={"122"} cy={"100"} r={"4"} fill={"#C8431E"}></circle></svg>
<div className={"pinfo"}><strong>Apto 2 quartos</strong><span>Centro · 68 m² · 1 vaga</span><div className={"price"}>R$ 430.000</div></div>
</div>
<ul className={"qual"}>
<li><i><svg width={"9"} height={"9"} viewBox={"0 0 12 12"} aria-hidden={"true"}><path d={"M2.5 6.2l2.2 2.2 4.8-5"} fill={"none"} stroke={"#fff"} strokeWidth={"2"}></path></svg></i>Para morar</li>
<li><i><svg width={"9"} height={"9"} viewBox={"0 0 12 12"} aria-hidden={"true"}><path d={"M2.5 6.2l2.2 2.2 4.8-5"} fill={"none"} stroke={"#fff"} strokeWidth={"2"}></path></svg></i>Crédito aprovado</li>
<li><i><svg width={"9"} height={"9"} viewBox={"0 0 12 12"} aria-hidden={"true"}><path d={"M2.5 6.2l2.2 2.2 4.8-5"} fill={"none"} stroke={"#fff"} strokeWidth={"2"}></path></svg></i>Até R$ 450 mil</li>
<li><i><svg width={"9"} height={"9"} viewBox={"0 0 12 12"} aria-hidden={"true"}><path d={"M2.5 6.2l2.2 2.2 4.8-5"} fill={"none"} stroke={"#fff"} strokeWidth={"2"}></path></svg></i>Região central</li>
</ul>
</div>
<div className={"scard"}>
<div className={"visit"}><div>Visita marcada com o corretor Paulo<br /><span style={{color: "#6E675E", fontSize: "13px"}}>3 imóveis enviados pelo agente</span></div><strong>Sáb · 10:00</strong></div>
</div>
</div>
</>)}

{(isEcom) && (<>
<div className={"scene"}>
<div className={"scard"}>
<div className={"sh"}><span><b>LOJA TRILHA</b> · pedido #10442</span><span className={"badge"}>recuperado</span></div>
<div className={"item"}><span className={"thumb"}><svg width={"34"} height={"22"} viewBox={"0 0 34 22"} aria-hidden={"true"}><path d={"M2 18h30v-3c0-2-2-3-5-3.5L19 10l-4-6H8L5 8 2 9z"} fill={"none"} stroke={"currentColor"} strokeWidth={"1.4"}></path><path d={"M2 18v2h30v-2"} fill={"none"} stroke={"currentColor"} strokeWidth={"1.4"}></path></svg></span><div><strong>Tênis Trilha</strong><span>Tamanho 37 · cor areia</span></div><span className={"v"}>R$ 289,90</span></div>
<ul className={"tl"}>
<li className={"d"}>Carrinho abandonado<span>14:02</span></li>
<li className={"d"}>Lembrete com o carrinho salvo<span>15:02</span></li>
<li className={"d"}>Dúvida de frete respondida<span>15:05</span></li>
<li className={"u"}>Pagamento confirmado<span>15:09</span></li>
</ul>
</div>
<div className={"scard"}>
<div className={"visit"}><div>Venda recuperada pela conversa<br /><span style={{color: "#6E675E", fontSize: "13px"}}>link de pagamento enviado no WhatsApp</span></div><span className={"big2"}>+1 pedido</span></div>
</div>
</div>
</>)}

{(isB2b) && (<>
<div className={"scene"}>
<div className={"scard"}>
<div className={"sh"}><span><b>PIPELINE COMERCIAL</b> · esta semana</span><span className={"badge u"}>movido agora</span></div>
<div className={"kan"}>
<div className={"col"}><h6>NOVO<span>3</span></h6><div className={"kc"}>Studio Vale<small>site</small></div><div className={"kc"}>Clínica Sol<small>WhatsApp</small></div><div className={"kc"}>Auto Peças RJ<small>indicação</small></div></div>
<div className={"col"}><h6>QUALIFICADO<span>2</span></h6><div className={"kc ghost"}>Contábil Lima</div><div className={"kc"}>Ótica Leme<small>IA · alto</small></div></div>
<div className={"col"}><h6>DIAGNÓSTICO<span>2</span></h6><div className={"kc hot"}>Contábil Lima<small>ter · 10:00</small></div><div className={"kc"}>Pet Mais<small>qua · 15:00</small></div></div>
<div className={"col"}><h6>PROPOSTA<span>1</span></h6><div className={"kc"}>Escola Ápice<small>enviada</small></div></div>
</div>
</div>
<div className={"scard"}>
<div className={"rem"}><span className={"ic"}><svg width={"18"} height={"18"} viewBox={"0 0 22 22"} aria-hidden={"true"}><rect x={"3"} y={"4.5"} width={"16"} height={"14"} rx={"1.5"} fill={"none"} stroke={"currentColor"} strokeWidth={"1.5"}></rect><path d={"M3 9h16M7 2.5v4M15 2.5v4"} fill={"none"} stroke={"currentColor"} strokeWidth={"1.5"}></path></svg></span><div>Reunião na agenda do comercial<small>resumo da conversa anexado à oportunidade</small></div></div>
</div>
</div>
</>)}
</div>
</section>

<section className={"sec fold"} id={"produtos"}>
<div className={"wrap"}>
<div className={"head2 rv"} style={{marginBottom: "0"}}>
<h2 className={"h2"}>Tudo o que a Nhandu <em>instala.</em></h2>
<p className={"lead"}>Você contrata o sistema inteiro ou começa pela parte que mais dói. Tudo conversa entre si.</p>
</div>
<div className={"bento"}>
<div className={"bx w2 rv"}><span className={"cat"}>Captação</span><h3>Landing pages de conversão</h3><p>Uma página feita para o seu negócio, rápida no celular, com um único objetivo: levar o visitante para a conversa no WhatsApp.</p>
<div className={"art lp-art"} aria-hidden={"true"}>
<div className={"lp"}>
<div className={"lp-nav"}><b>Clínica Aurora</b><span>Tratamentos</span><span>Equipe</span><span>Contato</span></div>
<div className={"lp-hero"}>
<div><div className={"lp-h"}>Seu sorriso, sem fila de espera.</div><div className={"lp-s"}>Avaliação com horário marcado em minutos, direto pelo WhatsApp.</div><span className={"lp-btn"}>Falar no WhatsApp</span></div>
<div className={"lp-img"}></div>
</div>
<div className={"lp-row"}><span>Clareamento</span><span>Implantes</span><span>Ortodontia</span></div>
<svg className={"lp-cur"} width={"18"} height={"18"} viewBox={"0 0 18 18"}><path d={"M3 2l11 6-5 1.5L7 15z"} fill={"#1A1814"} stroke={"#fff"} strokeWidth={"1.2"}></path></svg>
<div className={"lp-toast"}><i></i><div><small>WhatsApp · agora</small>Olá! Sou o agente da Clínica Aurora. Como posso ajudar?</div></div>
</div>
<div className={"lp-tags"}><span>100% pensada para celular</span><span>origem de cada visita registrada</span><span>uma ação por página</span></div>
</div></div>

<div className={"bx h2r rv"}><span className={"cat"}>Atendimento</span><h3>Agente de IA no WhatsApp</h3><p>Atende 24 horas com o tom da sua marca, segue o roteiro aprovado por você e agenda.</p>
<div className={"art ag2"} aria-hidden={"true"}>
<div className={"ag-phone"}>
<div className={"ag-top"}><span className={"rb"}><svg width={"18"} height={"18"} viewBox={"0 0 22 22"}><rect x={"3"} y={"6"} width={"16"} height={"12"} rx={"4"} fill={"none"} stroke={"currentColor"} strokeWidth={"1.5"}></rect><path d={"M11 6V3"} stroke={"currentColor"} strokeWidth={"1.5"}></path><circle cx={"8"} cy={"12"} r={"1.5"} fill={"currentColor"}></circle><circle cx={"14"} cy={"12"} r={"1.5"} fill={"currentColor"}></circle></svg></span><div><b>Agente Nhandu</b><small><span className={"live"}></span>online agora</small></div></div>
<div className={"ag-chat"}>
<div className={"cb in"} style={{animationDelay: "0s"}}>Vocês atendem sábado?</div>
<div className={"cb out"} style={{animationDelay: ".9s"}}>Atendemos, das 8h às 12h. É avaliação ou retorno?</div>
<div className={"cb in"} style={{animationDelay: "1.8s"}}>Avaliação. Pode ser às 10h?</div>
<div className={"cb out"} style={{animationDelay: "2.7s"}}>Reservado: sábado, 10h. Te mando um lembrete na sexta.</div>
</div>
</div>
<div className={"ag-script"}><small>Roteiro aprovado por você</small>
<div className={"sc on"}>Entende o que a pessoa procura</div>
<div className={"sc on"}>Oferece só horários livres</div>
<div className={"sc on"}>Confirma e agenda o lembrete</div>
<div className={"sc hu"}>Saiu do roteiro? Chama a equipe</div>
</div>
</div></div>

<div className={"bx rv"}><span className={"cat"}>Atendimento</span><h3>Agendamento automático</h3><p>Horários reais, confirmação e lembrete.</p>
<div className={"art"} aria-hidden={"true"}><div className={"mcal"}><b>SEG</b><b>TER</b><b>QUA</b><b>QUI</b><b>SEX</b><i className={"f"}>09:00</i><i></i><i className={"f"}>09:00</i><i className={"f"}>10:30</i><i></i><i></i><i className={"f"}>14:00</i><i className={"n"}>17:30</i><i></i><i className={"f"}>15:00</i><i className={"f"}>18:00</i><i></i><i className={"f"}>16:30</i><i></i><i className={"f"}>17:00</i></div><div className={"mini-note"}><span className={"live"}></span>Lembrete enviado na véspera</div></div></div>

<div className={"bx rv"}><span className={"cat"}>Automação</span><h3>CRM e pipeline</h3><p>Cada lead entra na etapa certa, com o resumo da conversa.</p>
<div className={"art"} aria-hidden={"true"}><div className={"crm"}>
<div className={"ccol"}><h6>Novo <i>4</i></h6><span className={"kk mv"}>Marina R.<small>clareamento · IA: alta</small></span><span className={"kk"}>João P.<small>avaliação</small></span><span className={"kk"}>Lia M.<small>orçamento</small></span></div>
<div className={"ccol"}><h6>Qualificado <i>2</i></h6><span className={"kk"}>Rui T.<small>implante</small></span></div>
<div className={"ccol"}><h6>Agendado <i>3</i></h6><span className={"kk"}>Ana P.<small>qui 09:00</small></span><span className={"kk"}>Pedro A.<small>sex 14:00</small></span></div>
</div></div></div>

<div className={"bx rv"}><span className={"cat"}>Automação</span><h3>Follow-up automático</h3><p>Quem parou de responder recebe o próximo passo, no tempo certo.</p>
<div className={"art fu2"} aria-hidden={"true"}>
<div className={"fm"} style={{animationDelay: "0s"}}><span>0h</span><p>Oi, Marina! Ficou alguma dúvida sobre o clareamento?</p></div>
<div className={"fm"} style={{animationDelay: "1.4s"}}><span>24h</span><p>Ainda temos quinta às 17h30. Quer que eu reserve?</p></div>
<div className={"fm ok"} style={{animationDelay: "2.8s"}}><span>✓</span><p>Marina respondeu e agendou</p></div>
</div></div>

<div className={"bx rv"}><span className={"cat"}>Dados</span><h3>Relatório semanal</h3><p>O que entrou, o que fechou e onde travou.</p>
<div className={"art rep"} aria-hidden={"true"}><div className={"rep-h"}><span>Agendamentos pelo agente</span><b>semana 46</b></div><div className={"bars"}><i style={{height: "40%", animationDelay: "0s"}}></i><i style={{height: "62%", animationDelay: ".2s"}}></i><i style={{height: "50%", animationDelay: ".4s"}}></i><i style={{height: "78%", animationDelay: ".6s"}}></i><i className={"a"} style={{height: "92%", animationDelay: ".8s"}}></i></div><div className={"rep-x"}><span>seg</span><span>ter</span><span>qua</span><span>qui</span><span>sex</span></div></div></div>

<div className={"bx rv"}><span className={"cat"}>Captação</span><h3>Rastreamento de origem</h3><p>Saiba de qual anúncio ou rede veio cada contato.</p>
<div className={"art"} aria-hidden={"true"}><div className={"org"}><span className={"chipx"} style={{left: "0", top: "10px"}}>Instagram</span><span className={"chipx"} style={{left: "20px", top: "58px"}}>Google</span><span className={"chipx"} style={{left: "0", top: "106px"}}>Indicação</span><span className={"hub"}>CRM</span>
<span className={"pk"} style={{left: "80px", top: "22px", "--dx": "150px", "--dy": "48px"}}></span><span className={"pk"} style={{left: "86px", top: "70px", "--dx": "144px", "--dy": "0px", animationDelay: "1s"}}></span><span className={"pk"} style={{left: "84px", top: "118px", "--dx": "146px", "--dy": "-48px", animationDelay: "2s"}}></span></div></div></div>

<div className={"bx rv"}><span className={"cat"}>Atendimento</span><h3>Transferência para humano</h3><p>A equipe assume com o resumo pronto.</p>
<div className={"art"} aria-hidden={"true"}><div className={"hand"}><div className={"face"}><div className={"r1"}><svg width={"26"} height={"26"} viewBox={"0 0 22 22"}><rect x={"3"} y={"6"} width={"16"} height={"12"} rx={"4"} fill={"none"} stroke={"currentColor"} strokeWidth={"1.5"}></rect><circle cx={"8"} cy={"12"} r={"1.5"} fill={"currentColor"}></circle><circle cx={"14"} cy={"12"} r={"1.5"} fill={"currentColor"}></circle></svg></div><div className={"r2"}><svg width={"26"} height={"26"} viewBox={"0 0 22 22"}><circle cx={"11"} cy={"8"} r={"3.5"} fill={"none"} stroke={"currentColor"} strokeWidth={"1.5"}></circle><path d={"M4 19c1-4 3.5-6 7-6s6 2 7 6"} fill={"none"} stroke={"currentColor"} strokeWidth={"1.5"}></path></svg></div></div><p className={"note2"}>“Vou chamar a Carla, da recepção. Ela já tem o resumo.”</p></div></div></div>

<div className={"bx w2 rv"}><span className={"cat"}>Diagnóstico</span><h3>Diagnóstico de operação</h3><p>Lemos as conversas e a agenda de uma semana real e mostramos onde o seu atendimento perde clientes, e o que resolver primeiro.</p>
<div className={"art dg2"} aria-hidden={"true"}>
<div className={"dg-chart"}>
<div className={"dg-h"}><b>Mensagens por horário</b><span>exemplo · 1 semana</span></div>
<div className={"hb"}><div className={"hc z"}><div className={"stk"}><i className={"lost"} style={{height: "20%", animationDelay: "0.00s"}}></i><i className={"okb"} style={{height: "5%", animationDelay: "0.00s"}}></i></div><span>06h</span></div><div className={"hc"}><div className={"stk"}><i className={"lost"} style={{height: "4%", animationDelay: "0.08s"}}></i><i className={"okb"} style={{height: "40%", animationDelay: "0.08s"}}></i></div><span>08h</span></div><div className={"hc"}><div className={"stk"}><i className={"lost"} style={{height: "3%", animationDelay: "0.16s"}}></i><i className={"okb"} style={{height: "62%", animationDelay: "0.16s"}}></i></div><span>10h</span></div><div className={"hc"}><div className={"stk"}><i className={"lost"} style={{height: "6%", animationDelay: "0.24s"}}></i><i className={"okb"} style={{height: "48%", animationDelay: "0.24s"}}></i></div><span>12h</span></div><div className={"hc"}><div className={"stk"}><i className={"lost"} style={{height: "4%", animationDelay: "0.32s"}}></i><i className={"okb"} style={{height: "58%", animationDelay: "0.32s"}}></i></div><span>14h</span></div><div className={"hc"}><div className={"stk"}><i className={"lost"} style={{height: "6%", animationDelay: "0.40s"}}></i><i className={"okb"} style={{height: "52%", animationDelay: "0.40s"}}></i></div><span>16h</span></div><div className={"hc z"}><div className={"stk"}><i className={"lost"} style={{height: "22%", animationDelay: "0.48s"}}></i><i className={"okb"} style={{height: "30%", animationDelay: "0.48s"}}></i></div><span>18h</span></div><div className={"hc z"}><div className={"stk"}><i className={"lost"} style={{height: "48%", animationDelay: "0.56s"}}></i><i className={"okb"} style={{height: "6%", animationDelay: "0.56s"}}></i></div><span>20h</span></div><div className={"hc z"}><div className={"stk"}><i className={"lost"} style={{height: "38%", animationDelay: "0.64s"}}></i><i className={"okb"} style={{height: "3%", animationDelay: "0.64s"}}></i></div><span>22h</span></div><div className={"hc z"}><div className={"stk"}><i className={"lost"} style={{height: "14%", animationDelay: "0.72s"}}></i><i className={"okb"} style={{height: "0%", animationDelay: "0.72s"}}></i></div><span>00h</span></div></div>
<div className={"legend"}><span><i className={"okb"}></i>respondidas</span><span><i className={"lost"}></i>sem resposta</span><span><i className={"zz"}></i>fora do horário</span></div>
</div>
<div className={"dg-rep"}>
<div className={"dg-h"}><b>Raio-x</b><span>exemplo</span></div>
<div className={"kpis2"}><div><b>2h14</b><span>até a 1ª resposta</span></div><div><b className={"r"}>1 em 3</b><span>conversas sem retorno</span></div></div>
<div className={"dg-i"}><i className={"r"}></i>Noite e fim de semana sem resposta</div>
<div className={"dg-i"}><i className={"r"}></i>Orçamentos sem retomada</div>
<div className={"dg-i"}><i className={"y"}></i>Agenda preenchida à mão</div>
<div className={"dg-p"}>Prioridade 1 · agente fora do horário</div>
</div>
</div></div>
</div>
</div>
</section>

<section className={"dk circ"} id={"comecar"} aria-label={"Comece pelo diagnóstico"}>
<div className={"start"}>
<div className={"start-l"}>
<h2 className={"h2"}>Comece pelo <em>diagnóstico.</em></h2>
<ul className={"checks"}>
<li><span className={"ck"}><svg width={"12"} height={"12"} viewBox={"0 0 12 12"} aria-hidden={"true"}><path d={"M2.5 6.2l2.2 2.2 4.8-5"} fill={"none"} stroke={"#1B1815"} strokeWidth={"1.8"}></path></svg></span><div><strong>Análise da operação atual</strong><span>Como os contatos chegam e quanto esperam.</span></div></li>
<li><span className={"ck"}><svg width={"12"} height={"12"} viewBox={"0 0 12 12"} aria-hidden={"true"}><path d={"M2.5 6.2l2.2 2.2 4.8-5"} fill={"none"} stroke={"#1B1815"} strokeWidth={"1.8"}></path></svg></span><div><strong>Mapa de onde os clientes se perdem</strong><span>Os pontos exatos em que a venda escapa.</span></div></li>
<li><span className={"ck"}><svg width={"12"} height={"12"} viewBox={"0 0 12 12"} aria-hidden={"true"}><path d={"M2.5 6.2l2.2 2.2 4.8-5"} fill={"none"} stroke={"#1B1815"} strokeWidth={"1.8"}></path></svg></span><div><strong>Plano do que automatizar primeiro</strong><span>Começando pelo que traz resultado mais rápido.</span></div></li>
<li><span className={"ck"}><svg width={"12"} height={"12"} viewBox={"0 0 12 12"} aria-hidden={"true"}><path d={"M2.5 6.2l2.2 2.2 4.8-5"} fill={"none"} stroke={"#1B1815"} strokeWidth={"1.8"}></path></svg></span><div><strong>Investimento definido depois da análise</strong><span>Sem pacote fechado às cegas.</span></div></li>
<li><span className={"ck"}><svg width={"12"} height={"12"} viewBox={"0 0 12 12"} aria-hidden={"true"}><path d={"M2.5 6.2l2.2 2.2 4.8-5"} fill={"none"} stroke={"#1B1815"} strokeWidth={"1.8"}></path></svg></span><div><strong>No ar em até 14 dias</strong><span>Depois da aprovação do roteiro de atendimento.</span></div></li>
</ul>
<div className={"cta-row"} style={{animation: "none"}}>
<a className={"btn btn-solid"} href={"#form-diag"}>Quero meu diagnóstico <span className={"arr"} aria-hidden={"true"}>→</span></a>
<a className={"btn btn-line"} href={waLink} target={waTarget} rel={"noopener"}>Falar com o agente</a>
</div>
</div>
<div className={"start-r"}>
<form className={"term"} id={"form-diag"} aria-label={"Solicitar diagnóstico"} onSubmit={submitDiag}>
<div className={"term-h"}><span>SOLICITAR DIAGNÓSTICO</span><span style={{color: "var(--ok)"}}>ONLINE</span></div>
<div className={"frow"}>
<div className={"fld"}><label htmlFor={"f-nome"}>Nome</label><input id={"f-nome"} name={"nome"} required={true} type={"text"} placeholder={"Seu nome"} autoComplete={"name"} /></div>
<div className={"fld"}><label htmlFor={"f-emp"}>Empresa</label><input id={"f-emp"} name={"empresa"} required={true} type={"text"} placeholder={"Nome da empresa"} autoComplete={"organization"} /></div>
</div>
<div className={"frow"}>
<div className={"fld"}><label htmlFor={"f-wa"}>WhatsApp</label><input id={"f-wa"} name={"whatsapp"} required={true} type={"tel"} placeholder={"(00) 00000-0000"} autoComplete={"tel"} /></div>
<div className={"fld"}><label htmlFor={"f-seg"}>Segmento</label><select id={"f-seg"} name={"segmento"}><option>Clínica ou consultório</option><option>Imobiliária</option><option>E-commerce</option><option>Serviços B2B</option><option>Outro</option></select></div>
</div>
<button type={"submit"} className={"btn btn-acc"} disabled={formBusy}>{formBtn}</button>
<p className={"form-msg"} role={"status"}>{formMsg}</p>
<small>Usamos estes dados só para marcar a conversa, conforme a nossa política de privacidade.</small>
</form>
<div className={"term"}><details><summary><span>O QUE VOCÊ RECEBE</span><span className={"pm"} aria-hidden={"true"}>+</span></summary><ul><li>raio-x da operação</li><li>gargalos priorizados</li><li>plano de implantação em fases</li><li>proposta com investimento</li></ul></details></div>
<div className={"term"}><details><summary><span>COMO FUNCIONA DEPOIS</span><span className={"pm"} aria-hidden={"true"}>+</span></summary><ul><li>aprovação do roteiro</li><li>implantação em até 14 dias</li><li>piloto de 30 dias medido</li><li>operação contínua com suporte</li></ul></details></div>
</div>
</div>
<div className={"wrap fast"}>
<h2 className={"h2"} style={{fontSize: "clamp(32px, 3.4vw, 46px)"}}>Feito para <em>começar rápido.</em></h2>
<div className={"fcards"}>
<a className={"fcard"} href={"#form-diag"}><span className={"t"}>Diagnóstico<svg width={"18"} height={"18"} viewBox={"0 0 18 18"} aria-hidden={"true"}><path d={"M5 13L13 5M6 5h7v7"} fill={"none"} stroke={"currentColor"} strokeWidth={"1.4"}></path></svg></span><p>Entendemos a operação antes de propor qualquer coisa.</p></a>
<a className={"fcard"} href={"#camadas"}><span className={"t"}>Piloto de 30 dias<svg width={"18"} height={"18"} viewBox={"0 0 18 18"} aria-hidden={"true"}><path d={"M5 13L13 5M6 5h7v7"} fill={"none"} stroke={"currentColor"} strokeWidth={"1.4"}></path></svg></span><p>Implantação em até 14 dias e resultado medido no fim do ciclo.</p></a>
<a className={"fcard"} href={"#compromissos"}><span className={"t"}>Segurança e LGPD<svg width={"18"} height={"18"} viewBox={"0 0 18 18"} aria-hidden={"true"}><path d={"M5 13L13 5M6 5h7v7"} fill={"none"} stroke={"currentColor"} strokeWidth={"1.4"}></path></svg></span><p>Dados no seu nome, acordo de tratamento e registros auditáveis.</p></a>
<a className={"fcard"} href={"#faq"}><span className={"t"}>Suporte<svg width={"18"} height={"18"} viewBox={"0 0 18 18"} aria-hidden={"true"}><path d={"M5 13L13 5M6 5h7v7"} fill={"none"} stroke={"currentColor"} strokeWidth={"1.4"}></path></svg></span><p>Ajustes de roteiro e tempo de resposta definido em contrato.</p></a>
</div>
</div>
</section>

<section className={"sec fold"} id={"compromissos"}>
<div className={"wrap"}>
<h2 className={"h2 rv"}>Compromissos que vão <em>para o contrato.</em></h2>
<div className={"commit"}>
<div className={"cm rv"}><span className={"ic"}><svg width={"20"} height={"20"} viewBox={"0 0 22 22"} aria-hidden={"true"}><path d={"M11 2l7 3v5c0 5-3 8-7 10-4-2-7-5-7-10V5z"} fill={"none"} stroke={"currentColor"} strokeWidth={"1.5"}></path></svg></span><h4>LGPD de ponta a ponta</h4><p>Acordo de tratamento de dados: a sua empresa é a controladora.</p></div>
<div className={"cm rv"}><span className={"ic"}><svg width={"20"} height={"20"} viewBox={"0 0 22 22"} aria-hidden={"true"}><circle cx={"11"} cy={"7"} r={"4"} fill={"none"} stroke={"currentColor"} strokeWidth={"1.5"}></circle><path d={"M3 20c1-4 4-6 8-6s7 2 8 6"} fill={"none"} stroke={"currentColor"} strokeWidth={"1.5"}></path></svg></span><h4>Humano no controle</h4><p>A equipe assume a conversa a qualquer momento.</p></div>
<div className={"cm rv"}><span className={"ic"}><svg width={"20"} height={"20"} viewBox={"0 0 22 22"} aria-hidden={"true"}><rect x={"3"} y={"9"} width={"16"} height={"11"} rx={"2"} fill={"none"} stroke={"currentColor"} strokeWidth={"1.5"}></rect><path d={"M7 9V6a4 4 0 018 0v3"} fill={"none"} stroke={"currentColor"} strokeWidth={"1.5"}></path></svg></span><h4>Tudo no seu nome</h4><p>Número, conta, domínio e dados ficam com a sua empresa.</p></div>
<div className={"cm rv"}><span className={"ic"}><svg width={"20"} height={"20"} viewBox={"0 0 22 22"} aria-hidden={"true"}><path d={"M4 4h14M4 9h14M4 14h9M4 19h6"} fill={"none"} stroke={"currentColor"} strokeWidth={"1.5"} strokeLinecap={"round"}></path></svg></span><h4>Logs auditáveis</h4><p>Cada decisão do agente fica registrada e pode ser revista.</p></div>
<div className={"cm rv"}><span className={"ic"}><svg width={"20"} height={"20"} viewBox={"0 0 22 22"} aria-hidden={"true"}><circle cx={"11"} cy={"11"} r={"8.5"} fill={"none"} stroke={"currentColor"} strokeWidth={"1.5"}></circle><path d={"M5 17L17 5"} stroke={"currentColor"} strokeWidth={"1.5"}></path></svg></span><h4>Limites claros</h4><p>A IA qualifica e agenda. Não faz diagnóstico clínico nem promessa.</p></div>
<div className={"cm rv"}><span className={"ic"}><svg width={"20"} height={"20"} viewBox={"0 0 22 22"} aria-hidden={"true"}><circle cx={"11"} cy={"11"} r={"8.5"} fill={"none"} stroke={"currentColor"} strokeWidth={"1.5"}></circle><path d={"M11 6v5l3 2"} fill={"none"} stroke={"currentColor"} strokeWidth={"1.5"} strokeLinecap={"round"}></path></svg></span><h4>Suporte com prazo</h4><p>Tempo de resposta técnica definido em contrato.</p></div>
</div>
</div>
</section>

<section className={"sec fold"} id={"time"}>
<div className={"wrap"}>
<div className={"head2 rv"}>
<h2 className={"h2"}>Quem está <em>por trás.</em></h2>
<p className={"lead"}>Somos três sócios. Você fala direto com quem constrói o seu sistema, do diagnóstico ao suporte, sem intermediário.</p>
</div>
<div className={"team"}>
<article className={"tmc rv"}>
<img src={"/media/andrick.jpg"} alt={"Andrick, sorrindo, de moletom cinza em um estúdio com fundo azul."} />
<div className={"tb"}><span className={"role"}>Idealizador e desenvolvedor</span><h3>Andrick</h3><p>Criou a Nhandu e desenha o produto: a arquitetura dos agentes de IA, os roteiros de conversa e o código por trás de cada camada.</p><div className={"tchips"}><span>Produto</span><span>Agentes de IA</span><span>Arquitetura</span></div></div>
</article>
<article className={"tmc rv"}>
<img src={"/media/felipe.jpg"} alt={"Felipe Torres, de blusa azul-marinho, com a Tower Bridge de Londres ao fundo."} />
<div className={"tb"}><span className={"role"}>Desenvolvedor e orquestração</span><h3>Felipe Torres</h3><p>Conecta tudo: integrações com WhatsApp, agenda e CRM, as automações e a infraestrutura que mantém o sistema no ar. Lidera a implantação e o suporte técnico.</p><div className={"tchips"}><span>Integrações</span><span>Automação</span><span>Implantação e suporte</span></div></div>
</article>
<article className={"tmc rv"}>
<img src={"/media/leonan.jpg"} alt={"Leonan Berriel, de camisa branca, em uma praia à noite com luzes ao fundo."} />
<div className={"tb"}><span className={"role"}>Marketing e operações</span><h3>Leonan Berriel</h3><p>Cuida da marca, das páginas e do conteúdo que traz clientes, e da relação com quem contrata: diagnóstico, proposta e acompanhamento dos resultados.</p><div className={"tchips"}><span>Marketing</span><span>Comercial</span><span>Sucesso do cliente</span></div></div>
</article>
</div>
</div>
</section>

<section className={"sec"} id={"faq"} style={{paddingTop: "24px"}}>
<div className={"wrap faqw"}>
<h2 className={"h2 rv"}>Perguntas <em>frequentes.</em></h2>
<div className={"faq"}>
<details><summary>Quanto custa?<span className={"pm"} aria-hidden={"true"}>+</span></summary><p>Depende do tamanho da operação e do que vamos instalar. O valor sai no diagnóstico, por escrito, antes de qualquer compromisso: implantação mais uma mensalidade com suporte.</p></details>
<details><summary>A IA pode falar algo errado com o meu cliente?<span className={"pm"} aria-hidden={"true"}>+</span></summary><p>Ela segue um roteiro aprovado por você, só qualifica e agenda, e transfere para a sua equipe sempre que a conversa sai do roteiro. Tudo fica registrado para revisão.</p></details>
<details><summary>Preciso trocar o número do WhatsApp?<span className={"pm"} aria-hidden={"true"}>+</span></summary><p>Usamos a API oficial do WhatsApp com o número da sua empresa. No diagnóstico verificamos se o número atual pode ser migrado ou se vale usar um novo.</p></details>
<details><summary>Quanto tempo até estar funcionando?<span className={"pm"} aria-hidden={"true"}>+</span></summary><p>Até 14 dias depois do diagnóstico e da aprovação do roteiro de atendimento.</p></details>
<details><summary>Funciona para o meu segmento?<span className={"pm"} aria-hidden={"true"}>+</span></summary><p>Atendemos clínicas, imobiliárias, lojas virtuais e serviços. O diagnóstico mostra se faz sentido para o seu caso antes de qualquer contratação.</p></details>
<details><summary>E se eu quiser cancelar?<span className={"pm"} aria-hidden={"true"}>+</span></summary><p>Número, conta, domínio e dados continuam no nome da sua empresa. Você leva tudo, sem amarras.</p></details>
</div>
</div>
</section>

<section className={"dk open final"} aria-label={"Chamada final"}>
<div className={"nf"} aria-hidden={"true"}><div className={"nfc"}><div className={"nt"}><i></i><div><b>Marina<small>22:47</small></b>Oi! Vocês fazem clareamento?</div></div><div className={"nt"}><i></i><div><b>Pedro<small>13:05</small></b>O apartamento do centro ainda está disponível?</div></div><div className={"nt"}><i></i><div><b>Rafael<small>06:40</small></b>Vocês atendem sábado?</div></div><div className={"nt"}><i></i><div><b>Carlos<small>07:12</small></b>Tem horário amanhã cedo?</div></div><div className={"nt"}><i></i><div><b>Lúcia<small>19:22</small></b>Quero remarcar minha consulta</div></div><div className={"nt"}><i></i><div><b>Juliana<small>21:30</small></b>Qual o valor da avaliação?</div></div><div className={"nt"}><i></i><div><b>Bruno<small>10:15</small></b>Consegue me mandar um orçamento?</div></div><div className={"nt"}><i></i><div><b>Ana<small>23:58</small></b>Meu pedido chega até sexta?</div></div><div className={"nt"}><i></i><div><b>Marina<small>22:47</small></b>Oi! Vocês fazem clareamento?</div></div><div className={"nt"}><i></i><div><b>Pedro<small>13:05</small></b>O apartamento do centro ainda está disponível?</div></div><div className={"nt"}><i></i><div><b>Rafael<small>06:40</small></b>Vocês atendem sábado?</div></div><div className={"nt"}><i></i><div><b>Carlos<small>07:12</small></b>Tem horário amanhã cedo?</div></div><div className={"nt"}><i></i><div><b>Lúcia<small>19:22</small></b>Quero remarcar minha consulta</div></div><div className={"nt"}><i></i><div><b>Juliana<small>21:30</small></b>Qual o valor da avaliação?</div></div><div className={"nt"}><i></i><div><b>Bruno<small>10:15</small></b>Consegue me mandar um orçamento?</div></div><div className={"nt"}><i></i><div><b>Ana<small>23:58</small></b>Meu pedido chega até sexta?</div></div></div><div className={"nfc"}><div className={"nt"}><i></i><div><b>Juliana<small>21:30</small></b>Qual o valor da avaliação?</div></div><div className={"nt"}><i></i><div><b>Bruno<small>10:15</small></b>Consegue me mandar um orçamento?</div></div><div className={"nt"}><i></i><div><b>Marina<small>22:47</small></b>Oi! Vocês fazem clareamento?</div></div><div className={"nt"}><i></i><div><b>Ana<small>23:58</small></b>Meu pedido chega até sexta?</div></div><div className={"nt"}><i></i><div><b>Carlos<small>07:12</small></b>Tem horário amanhã cedo?</div></div><div className={"nt"}><i></i><div><b>Rafael<small>06:40</small></b>Vocês atendem sábado?</div></div><div className={"nt"}><i></i><div><b>Pedro<small>13:05</small></b>O apartamento do centro ainda está disponível?</div></div><div className={"nt"}><i></i><div><b>Lúcia<small>19:22</small></b>Quero remarcar minha consulta</div></div><div className={"nt"}><i></i><div><b>Juliana<small>21:30</small></b>Qual o valor da avaliação?</div></div><div className={"nt"}><i></i><div><b>Bruno<small>10:15</small></b>Consegue me mandar um orçamento?</div></div><div className={"nt"}><i></i><div><b>Marina<small>22:47</small></b>Oi! Vocês fazem clareamento?</div></div><div className={"nt"}><i></i><div><b>Ana<small>23:58</small></b>Meu pedido chega até sexta?</div></div><div className={"nt"}><i></i><div><b>Carlos<small>07:12</small></b>Tem horário amanhã cedo?</div></div><div className={"nt"}><i></i><div><b>Rafael<small>06:40</small></b>Vocês atendem sábado?</div></div><div className={"nt"}><i></i><div><b>Pedro<small>13:05</small></b>O apartamento do centro ainda está disponível?</div></div><div className={"nt"}><i></i><div><b>Lúcia<small>19:22</small></b>Quero remarcar minha consulta</div></div></div><div className={"nfc"}><div className={"nt"}><i></i><div><b>Rafael<small>06:40</small></b>Vocês atendem sábado?</div></div><div className={"nt"}><i></i><div><b>Carlos<small>07:12</small></b>Tem horário amanhã cedo?</div></div><div className={"nt"}><i></i><div><b>Lúcia<small>19:22</small></b>Quero remarcar minha consulta</div></div><div className={"nt"}><i></i><div><b>Pedro<small>13:05</small></b>O apartamento do centro ainda está disponível?</div></div><div className={"nt"}><i></i><div><b>Marina<small>22:47</small></b>Oi! Vocês fazem clareamento?</div></div><div className={"nt"}><i></i><div><b>Ana<small>23:58</small></b>Meu pedido chega até sexta?</div></div><div className={"nt"}><i></i><div><b>Juliana<small>21:30</small></b>Qual o valor da avaliação?</div></div><div className={"nt"}><i></i><div><b>Bruno<small>10:15</small></b>Consegue me mandar um orçamento?</div></div><div className={"nt"}><i></i><div><b>Rafael<small>06:40</small></b>Vocês atendem sábado?</div></div><div className={"nt"}><i></i><div><b>Carlos<small>07:12</small></b>Tem horário amanhã cedo?</div></div><div className={"nt"}><i></i><div><b>Lúcia<small>19:22</small></b>Quero remarcar minha consulta</div></div><div className={"nt"}><i></i><div><b>Pedro<small>13:05</small></b>O apartamento do centro ainda está disponível?</div></div><div className={"nt"}><i></i><div><b>Marina<small>22:47</small></b>Oi! Vocês fazem clareamento?</div></div><div className={"nt"}><i></i><div><b>Ana<small>23:58</small></b>Meu pedido chega até sexta?</div></div><div className={"nt"}><i></i><div><b>Juliana<small>21:30</small></b>Qual o valor da avaliação?</div></div><div className={"nt"}><i></i><div><b>Bruno<small>10:15</small></b>Consegue me mandar um orçamento?</div></div></div></div>
<div className={"final-v2"} aria-hidden={"true"}></div>
<div className={"wrap"} style={{position: "relative"}}>
<h2 className={"h2"}>Seu próximo cliente pode estar mandando mensagem <em>agora.</em></h2>
<div className={"cta-row"}>
<a className={"btn btn-solid"} href={"#form-diag"}>Quero meu diagnóstico <span className={"arr"} aria-hidden={"true"}>→</span></a>
<a className={"btn btn-line"} href={"#calculadora"}>Calcular quanto estou perdendo</a>
</div>
</div>
</section>

</main>

<footer className={"foot dk"}>
<div className={"wrap"}>
<div className={"foot-grid"}>
<div>
<a className={"brand"} href={"#topo"} aria-label={"Nhandu, voltar ao topo"} style={{color: "#F5F1E8"}}><svg width={"28"} height={"28"} viewBox={"0 0 64 64"} aria-hidden={"true"}><circle className={"gd"} cx={"32"} cy={"16"} r={"3.2"}></circle><circle className={"gd"} cx={"16"} cy={"32"} r={"3.2"}></circle><circle className={"gd"} cx={"32"} cy={"32"} r={"3.2"}></circle><circle className={"gd"} cx={"48"} cy={"32"} r={"3.2"}></circle><circle className={"gd"} cx={"32"} cy={"48"} r={"3.2"}></circle><path className={"tr"} pathLength={"1"} d={"M16 48V16L48 48V16"} fill={"none"} stroke={"currentColor"} strokeWidth={"5.5"} strokeLinecap={"round"} strokeLinejoin={"round"}></path><circle cx={"48"} cy={"16"} r={"6.5"} style={{fill: "var(--a2)"}}></circle></svg>Nhandu</a>
<p className={"legal-t"}>Nhandu é a palavra tupi-guarani para aranha. Como uma teia, conectamos página, WhatsApp, agenda e CRM para que nenhum contato se perca.</p>
<p className={"legal-t"}>Nhandu Tecnologia · {cnpjTxt}. Tratamento de dados conforme a Lei Geral de Proteção de Dados (Lei 13.709/2018).</p>
</div>
<div><h5>Soluções</h5><ul><li><a href={"#solucoes"}>Clínicas</a></li><li><a href={"#solucoes"}>Imobiliárias</a></li><li><a href={"#solucoes"}>E-commerce</a></li><li><a href={"#solucoes"}>Serviços B2B</a></li></ul></div>
<div><h5>Produtos</h5><ul><li><a href={"#produtos"}>Landing pages</a></li><li><a href={"#produtos"}>Agente no WhatsApp</a></li><li><a href={"#produtos"}>Automação e CRM</a></li><li><a href={"#produtos"}>Relatórios</a></li></ul></div>
<div><h5>Políticas</h5><ul><li><a href={"/privacidade"}>Privacidade</a></li><li><a href={"/termos"}>Termos de uso</a></li><li><a href={"/privacidade#dados"}>Tratamento de dados</a></li></ul></div>
<div><h5>Contato</h5><ul><li><a href={"#form-diag"}>Diagnóstico</a></li><li><a href={waLink} target={waTarget} rel={"noopener"}>WhatsApp</a></li></ul>
<h5 style={{marginTop: "24px"}}>Redes</h5>
<div className={"social"}>
<a href={"#topo"} aria-label={"Instagram da Nhandu"}><svg width={"18"} height={"18"} viewBox={"0 0 18 18"} aria-hidden={"true"}><rect x={"2"} y={"2"} width={"14"} height={"14"} rx={"4"} fill={"none"} stroke={"currentColor"} strokeWidth={"1.3"}></rect><circle cx={"9"} cy={"9"} r={"3.2"} fill={"none"} stroke={"currentColor"} strokeWidth={"1.3"}></circle><circle cx={"13.2"} cy={"4.8"} r={".8"} fill={"currentColor"}></circle></svg></a>
<a href={"#topo"} aria-label={"LinkedIn da Nhandu"}><svg width={"18"} height={"18"} viewBox={"0 0 18 18"} aria-hidden={"true"}><rect x={"2"} y={"2"} width={"14"} height={"14"} rx={"2"} fill={"none"} stroke={"currentColor"} strokeWidth={"1.3"}></rect><path d={"M5.5 8v5M5.5 5.3v.1M8.5 13V8M8.5 10c0-1.4 1-2.1 2-2.1s2 .6 2 2.1v3"} fill={"none"} stroke={"currentColor"} strokeWidth={"1.3"}></path></svg></a>
</div>
</div>
</div>
<div className={"bottom"}><span>© 2026 Nhandu</span><span>Ourinhos, São Paulo, Brasil</span></div>
</div>
</footer>
<a className={"mcta"} href={"#form-diag"}>Quero meu diagnóstico</a>
</div>
    );
  }
}

Object.assign(NhanduPage.prototype, prodMethods);
export default NhanduPage;
