// Gera o vídeo vertical da demo para celular:
//   public/media/demo-mobile.mp4         (H.264 High, 1080x1920, 30 fps, 15 s, sem áudio)
//   public/media/demo-mobile-poster.jpg  (estado final da história, 720x1280)
//
// Uso (na raiz do repositório):  node tools/demo-mobile/render.mjs
//   --preview <pasta>   só salva PNGs de alguns instantes, para conferir o desenho
//   --bitrate <bps>     taxa alvo do vídeo (padrão 450000)
//
// Como funciona, sem ffmpeg: o Google Chrome instalado abre tools/demo-mobile/demo-mobile.html, cada quadro é
// posicionado com window.seek(ms) e capturado; os quadros passam pelo VideoEncoder (WebCodecs, H.264) do próprio
// Chrome e este arquivo escreve o MP4 (não fragmentado, com o moov no início). Precisa do Google Chrome
// (o Chromium do Playwright não codifica H.264) e de @playwright/test, que já é dependência de desenvolvimento.
// O texto, os tempos e o desenho ficam em demo-mobile.html.

import { createServer } from 'node:http';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { extname, join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const W = 360;
const H = 640;
const SCALE = 3; // 1080x1920
const FPS = 30;
const POSTER_AT = 12200;
const POSTER_SCALE = 2;

const arg = (name, fallback) => {
  const i = process.argv.indexOf(name);
  return i > -1 ? process.argv[i + 1] : fallback;
};
const BITRATE = Number(arg('--bitrate', 450000));
const PREVIEW = arg('--preview', null);

/* ---------- servidor estático da raiz do repositório ---------- */

const TYPES = { '.html': 'text/html; charset=utf-8', '.woff2': 'font/woff2', '.js': 'text/javascript', '.css': 'text/css' };
const server = createServer(async (req, res) => {
  try {
    const path = join(ROOT, decodeURIComponent(new URL(req.url, 'http://x').pathname));
    if (!path.startsWith(ROOT)) throw new Error('fora da raiz');
    const data = await readFile(path);
    res.writeHead(200, { 'content-type': TYPES[extname(path)] || 'application/octet-stream' });
    res.end(data);
  } catch {
    res.writeHead(404);
    res.end();
  }
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const base = `http://127.0.0.1:${server.address().port}`;

/* ---------- MP4 mínimo: uma trilha de vídeo H.264, sem B-frames ---------- */

const u32 = (n) => Buffer.from([(n >>> 24) & 255, (n >>> 16) & 255, (n >>> 8) & 255, n & 255]);
const u16 = (n) => Buffer.from([(n >>> 8) & 255, n & 255]);
const box = (type, ...parts) => {
  const body = Buffer.concat(parts);
  return Buffer.concat([u32(body.length + 8), Buffer.from(type, 'latin1'), body]);
};
const full = (type, version, flags, ...parts) => box(type, Buffer.from([version, (flags >> 16) & 255, (flags >> 8) & 255, flags & 255]), ...parts);
const MATRIX = Buffer.concat([0x10000, 0, 0, 0, 0x10000, 0, 0, 0, 0x40000000].map(u32));

function mp4({ width, height, fps, samples, avcC }) {
  const timescale = fps * 512;
  const delta = 512;
  const duration = samples.length * delta;
  const movieTs = 1000;
  const movieDur = Math.round((samples.length * 1000) / fps);
  const sync = samples.flatMap((s, i) => (s.key ? [i + 1] : []));

  const ftyp = box('ftyp', Buffer.from('isom', 'latin1'), u32(512), Buffer.from('isomiso2avc1mp41', 'latin1'));
  const moov = (chunkOffset) =>
    box(
      'moov',
      full('mvhd', 0, 0, u32(0), u32(0), u32(movieTs), u32(movieDur), u32(0x10000), u16(0x100), Buffer.alloc(10), MATRIX, Buffer.alloc(24), u32(2)),
      box(
        'trak',
        full('tkhd', 0, 3, u32(0), u32(0), u32(1), u32(0), u32(movieDur), Buffer.alloc(8), u16(0), u16(0), u16(0), u16(0), MATRIX, u32(width << 16), u32(height << 16)),
        box(
          'mdia',
          full('mdhd', 0, 0, u32(0), u32(0), u32(timescale), u32(duration), u16(0x55c4), u16(0)),
          full('hdlr', 0, 0, u32(0), Buffer.from('vide', 'latin1'), Buffer.alloc(12), Buffer.from('VideoHandler\0', 'latin1')),
          box(
            'minf',
            full('vmhd', 0, 1, Buffer.alloc(8)),
            box('dinf', full('dref', 0, 0, u32(1), full('url ', 0, 1))),
            box(
              'stbl',
              full(
                'stsd', 0, 0, u32(1),
                box(
                  'avc1',
                  Buffer.alloc(6), u16(1), Buffer.alloc(16), u16(width), u16(height), u32(0x480000), u32(0x480000), u32(0), u16(1), Buffer.alloc(32), u16(24), u16(0xffff),
                  box('avcC', avcC),
                  // BT.709, faixa limitada: é o que o VideoEncoder produz a partir de quadros RGB.
                  box('colr', Buffer.from('nclx', 'latin1'), u16(1), u16(1), u16(1), Buffer.from([0])),
                  box('pasp', u32(1), u32(1)),
                ),
              ),
              full('stts', 0, 0, u32(1), u32(samples.length), u32(delta)),
              full('stss', 0, 0, u32(sync.length), ...sync.map(u32)),
              full('stsc', 0, 0, u32(1), u32(1), u32(samples.length), u32(1)),
              full('stsz', 0, 0, u32(0), u32(samples.length), ...samples.map((s) => u32(s.data.length))),
              full('stco', 0, 0, u32(1), u32(chunkOffset)),
            ),
          ),
        ),
      ),
    );
  const offset = ftyp.length + moov(0).length + 8;
  return Buffer.concat([ftyp, moov(offset), box('mdat', ...samples.map((s) => s.data))]);
}

/* ---------- captura e codificação ---------- */

const browser = await chromium.launch({ channel: 'chrome' });
try {
  const ctx = await browser.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: SCALE });
  const page = await ctx.newPage();
  await page.goto(`${base}/tools/demo-mobile/demo-mobile.html`);
  await page.evaluate(() => window.ready);
  const durationMs = await page.evaluate(() => window.DURATION);
  const total = Math.round((durationMs / 1000) * FPS);
  const seek = async (ms) => {
    await page.evaluate(async (t) => {
      window.seek(t);
      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
    }, ms);
  };

  if (PREVIEW) {
    await mkdir(PREVIEW, { recursive: true });
    for (const ms of [0, 600, 1200, 2000, 3000, 4200, 5400, 6500, 7600, 8600, 9900, 10300, 11000, 12200, 12700, 13400, 14000, 14600, 14900]) {
      await seek(ms);
      await page.screenshot({ path: join(PREVIEW, `t${String(ms).padStart(5, '0')}.png`) });
    }
    console.log('prévia em', PREVIEW);
  } else {
    // Página separada para o codificador (WebCodecs exige contexto seguro; 127.0.0.1 serve).
    const enc = await ctx.newPage();
    await enc.goto(`${base}/tools/demo-mobile/demo-mobile.html`);
    await enc.evaluate(
      async ({ width, height, fps, bitrate }) => {
        const config = { codec: 'avc1.640028', width, height, framerate: fps, bitrate, bitrateMode: 'variable', latencyMode: 'quality', avc: { format: 'avc' } };
        const support = await VideoEncoder.isConfigSupported(config);
        if (!support.supported) throw new Error('H.264 não suportado pelo VideoEncoder deste navegador');
        window.chunks = [];
        window.encError = null;
        window.encoder = new VideoEncoder({
          output: (chunk, meta) => {
            const data = new Uint8Array(chunk.byteLength);
            chunk.copyTo(data);
            if (meta && meta.decoderConfig && meta.decoderConfig.description) window.avcC = new Uint8Array(meta.decoderConfig.description);
            window.chunks.push({ key: chunk.type === 'key', ts: chunk.timestamp, data });
          },
          error: (e) => { window.encError = String(e); },
        });
        window.encoder.configure(config);
        window.b64 = (u8) => { let s = ''; for (let i = 0; i < u8.length; i += 0x8000) s += String.fromCharCode.apply(null, u8.subarray(i, i + 0x8000)); return btoa(s); };
        window.push = async (png, i) => {
          const bin = atob(png);
          const u8 = new Uint8Array(bin.length);
          for (let k = 0; k < bin.length; k++) u8[k] = bin.charCodeAt(k);
          const bmp = await createImageBitmap(new Blob([u8], { type: 'image/png' }));
          const frame = new VideoFrame(bmp, { timestamp: Math.round((i * 1e6) / fps), duration: Math.round(1e6 / fps) });
          window.encoder.encode(frame, { keyFrame: i % fps === 0 });
          frame.close();
          bmp.close();
          while (window.encoder.encodeQueueSize > 4) await new Promise((r) => setTimeout(r, 5));
          if (window.encError) throw new Error(window.encError);
        };
      },
      { width: W * SCALE, height: H * SCALE, fps: FPS, bitrate: BITRATE },
    );

    for (let i = 0; i < total; i++) {
      await seek((i * 1000) / FPS);
      const png = await page.screenshot({ type: 'png' });
      await enc.evaluate(([b, n]) => window.push(b, n), [png.toString('base64'), i]);
      if (i % FPS === 0) process.stdout.write(`\rquadro ${i}/${total}`);
    }
    const out = await enc.evaluate(async () => {
      await window.encoder.flush();
      if (window.encError) throw new Error(window.encError);
      return { avcC: window.b64(window.avcC), chunks: window.chunks.map((c) => ({ key: c.key, ts: c.ts, data: window.b64(c.data) })) };
    });
    const samples = out.chunks.map((c) => ({ key: c.key, ts: c.ts, data: Buffer.from(c.data, 'base64') }));
    if (samples.length !== total) throw new Error(`esperava ${total} quadros, o codificador devolveu ${samples.length}`);
    // Este MP4 não escreve ctts: a ordem de decodificação tem de ser a de exibição (sem B-frames).
    samples.forEach((s, i) => {
      if (i && s.ts <= samples[i - 1].ts) throw new Error('quadros fora de ordem (B-frames): o MP4 simples não cobre esse caso');
    });
    if (!samples[0].key) throw new Error('o primeiro quadro não é um keyframe');
    const file = mp4({ width: W * SCALE, height: H * SCALE, fps: FPS, samples, avcC: Buffer.from(out.avcC, 'base64') });
    await writeFile(join(ROOT, 'public/media/demo-mobile.mp4'), file);
    console.log(`\npublic/media/demo-mobile.mp4: ${(file.length / 1024).toFixed(0)} KB, ${total} quadros, ${W * SCALE}x${H * SCALE}`);

    // Poster: o estado final (tudo agendado), que também é o que aparece com movimento reduzido.
    const pctx = await browser.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: POSTER_SCALE });
    const pp = await pctx.newPage();
    await pp.goto(`${base}/tools/demo-mobile/demo-mobile.html`);
    await pp.evaluate(() => window.ready);
    await pp.evaluate(async (t) => {
      window.seek(t);
      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
    }, POSTER_AT);
    const jpg = await pp.screenshot({ type: 'jpeg', quality: 82 });
    await writeFile(join(ROOT, 'public/media/demo-mobile-poster.jpg'), jpg);
    console.log(`public/media/demo-mobile-poster.jpg: ${(jpg.length / 1024).toFixed(0)} KB`);
  }
} finally {
  await browser.close();
  server.close();
}
