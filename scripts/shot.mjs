// Headless screenshots via Chrome DevTools Protocol (no deps).
// usage: node scripts/shot.mjs <outDir> <width> <light|dark> <hashPath> [hashPath...]
// Requires the dev server on http://localhost:5173 (the orchestrator keeps one running) and Google Chrome.
// Writes full-page JPEG segments (<name>_p0.jpg, _p1 …) and reports horizontal overflow + console errors.
import { spawn } from 'node:child_process';
import { writeFileSync, mkdirSync } from 'node:fs';

const [outDir, width, scheme, ...paths] = process.argv.slice(2);
mkdirSync(outDir, { recursive: true });
const port = 9333 + Math.floor(Math.random() * 500);
const chrome = spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', [
  '--headless=new', `--remote-debugging-port=${port}`, '--disable-gpu', '--hide-scrollbars',
  `--user-data-dir=/tmp/claude-503/chrome-shot-${port}`, 'about:blank',
], { stdio: 'ignore' });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let wsUrl;
for (let i = 0; i < 50 && !wsUrl; i++) {
  await sleep(200);
  try {
    const list = await (await fetch(`http://127.0.0.1:${port}/json`)).json();
    wsUrl = list.find((t) => t.type === 'page')?.webSocketDebuggerUrl;
  } catch {}
}
const ws = new WebSocket(wsUrl);
await new Promise((r) => (ws.onopen = r));
let id = 0; const pending = new Map(); const errors = [];
ws.onmessage = (m) => {
  const msg = JSON.parse(m.data);
  if (msg.id && pending.has(msg.id)) { pending.get(msg.id)(msg.result); pending.delete(msg.id); }
  if (msg.method === 'Runtime.exceptionThrown') errors.push(msg.params.exceptionDetails.exception?.description ?? msg.params.exceptionDetails.text);
  if (msg.method === 'Runtime.consoleAPICalled' && msg.params.type === 'error') errors.push(msg.params.args.map((a) => a.value ?? a.description).join(' '));
};
const send = (method, params = {}) => new Promise((r) => { const i = ++id; pending.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });

const w = Number(width);
const mobile = w < 768;
await send('Runtime.enable');
await send('Emulation.setDeviceMetricsOverride', { width: w, height: mobile ? 812 : 900, deviceScaleFactor: mobile ? 2 : 1, mobile });
await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-color-scheme', value: scheme }, { name: 'prefers-reduced-motion', value: 'reduce' }] });

for (const p of paths) {
  await send('Page.navigate', { url: `http://localhost:5173/#${p}` });
  await sleep(1800);
  const { result } = await send('Runtime.evaluate', { expression: 'JSON.stringify({h: document.documentElement.scrollHeight, sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth})', returnByValue: true });
  const dims = JSON.parse(result.value);
  const h = Math.min(dims.h, 12000);
  await send('Emulation.setDeviceMetricsOverride', { width: w, height: h, deviceScaleFactor: mobile ? 2 : 1, mobile });
  await sleep(Number(process.env.SHOT_WAIT ?? 500));
  const seg = mobile ? 1100 : 1400;
  const base = (p.replace(/[^a-z0-9]+/gi, '_') || 'root') + `_${w}_${scheme}`;
  const files = [];
  for (let y = 0, n = 0; y < h; y += seg, n++) {
    const shot = await send('Page.captureScreenshot', { format: 'jpeg', quality: 70, clip: { x: 0, y, width: w, height: Math.min(seg, h - y), scale: mobile ? 1 : 0.8 } });
    const name = `${base}_p${n}.jpg`;
    writeFileSync(`${outDir}/${name}`, Buffer.from(shot.data, 'base64'));
    files.push(name);
  }
  console.log(`${base} h=${dims.h} overflowX=${dims.sw > dims.cw ? 'YES ' + dims.sw : 'no'} parts=${files.length}`);
  await send('Emulation.setDeviceMetricsOverride', { width: w, height: mobile ? 812 : 900, deviceScaleFactor: mobile ? 2 : 1, mobile });
}
if (errors.length) console.log('CONSOLE ERRORS:\n' + [...new Set(errors)].join('\n'));
ws.close(); chrome.kill();
process.exit(0);
