import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';

const scenes = JSON.parse(await fs.readFile('demo/manifest.json', 'utf8'));
const duration = scenes.reduce((total, scene) => total + scene.duration + 0.7, 0);
const fps = 10;
const output = path.resolve('demo/live-frames');
await fs.mkdir(output, { recursive: true });
const profile = await fs.mkdtemp(path.join(os.tmpdir(), 'holdpoint-live-demo-'));
const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
  '--headless=new', '--disable-gpu', '--no-first-run', '--no-default-browser-check',
  '--hide-scrollbars', '--force-device-scale-factor=1', '--window-size=1600,900',
  '--remote-debugging-port=0', `--user-data-dir=${profile}`, 'http://127.0.0.1:3000/'
], { stdio: 'ignore', windowsHide: true });
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
let port;
for (let i = 0; i < 100; i++) {
  try { port = Number((await fs.readFile(path.join(profile, 'DevToolsActivePort'), 'utf8')).split('\n')[0]); break; }
  catch { await sleep(100); }
}
if (!port) throw new Error('Chrome remote debugging port not found');
let target;
for (let i = 0; i < 100; i++) {
  const list = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
  target = list.find((item) => item.type === 'page' && item.url.includes('127.0.0.1:3000'));
  if (target) break;
  await sleep(100);
}
if (!target) throw new Error('Prototype tab not found');
const ws = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((resolve, reject) => { ws.onopen = resolve; ws.onerror = reject; });
let nextId = 0;
const pending = new Map();
ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  if (!message.id || !pending.has(message.id)) return;
  const { resolve, reject } = pending.get(message.id);
  pending.delete(message.id);
  message.error ? reject(new Error(message.error.message)) : resolve(message.result);
};
function send(method, params = {}) {
  const id = ++nextId;
  return new Promise((resolve, reject) => {
    pending.set(id, { resolve, reject });
    ws.send(JSON.stringify({ id, method, params }));
  });
}
async function js(expression) {
  const result = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
  if (result.exceptionDetails) throw new Error(result.exceptionDetails.text);
  return result.result.value;
}
async function cursorTo(x, y, ms = 600) {
  await js(`new Promise(resolve => {
    const c = window.__demoCursor;
    const fromX = c.x, fromY = c.y, toX = ${x}, toY = ${y}, start = performance.now(), duration = ${ms};
    const step = now => { const p = Math.min(1, (now - start) / duration); const t = 1 - Math.pow(1-p, 3);
      c.x = fromX + (toX-fromX)*t; c.y = fromY + (toY-fromY)*t;
      c.node.style.transform = 'translate(' + c.x + 'px,' + c.y + 'px)';
      if(p < 1) requestAnimationFrame(step); else resolve(); };
    requestAnimationFrame(step);
  })`);
}
async function locate(selector, text) {
  return js(`(() => {
    const all = [...document.querySelectorAll(${JSON.stringify(selector)})];
    const e = ${text ? `all.find(x => x.textContent.trim().includes(${JSON.stringify(text)}))` : 'all[0]'};
    if (!e) return null;
    e.scrollIntoView({block:'nearest',behavior:'smooth'});
    const r = e.getBoundingClientRect();
    return {x:r.left+r.width/2,y:r.top+r.height/2};
  })()`);
}
async function click(selector, text) {
  let p = await locate(selector, text);
  if (!p) { console.log('SKIP missing', selector, text || ''); return; }
  await sleep(450);
  p = await locate(selector, text);
  await cursorTo(p.x, p.y, 540);
  await js(`(() => {
    const all=[...document.querySelectorAll(${JSON.stringify(selector)})];
    const e=${text ? `all.find(x => x.textContent.trim().includes(${JSON.stringify(text)}))` : 'all[0]'};
    if (!e) return;
    const ring=document.createElement('div');
    ring.style.cssText='position:fixed;pointer-events:none;z-index:2147483647;border:2px solid #45b7e8;border-radius:50%;width:20px;height:20px;left:${p.x-10}px;top:${p.y-10}px;opacity:.95;';
    document.body.appendChild(ring);
    ring.animate([{transform:'scale(.5)',opacity:.95},{transform:'scale(3.2)',opacity:0}],{duration:550,easing:'ease-out'}).onfinish=()=>ring.remove();
    e.click();
  })()`);
  console.log('CLICK', text || selector);
}
async function scrollPage(y) { await js(`window.scrollTo({top:${y},behavior:'smooth'})`); }
async function scrollContent(y) { await js(`document.querySelector('.cr-content')?.scrollTo({top:${y},behavior:'smooth'})`); }
async function typePrompt(prompt) {
  const selector = '.cr-workspace input[type="text"], .cr-workspace input:not([type]), .cr-workspace textarea';
  const p = await locate(selector);
  if (!p) { console.log('SKIP prompt field'); return; }
  await cursorTo(p.x, p.y, 450);
  await js(`document.querySelector(${JSON.stringify(selector)})?.focus()`);
  for (const word of prompt.split(' ')) {
    await send('Input.insertText', { text: word + ' ' });
    await sleep(80);
  }
}
function markAction(scene, seconds, name, fn) {
  const offset = scenes.slice(0, scene).reduce((sum, item) => sum + item.duration + 0.7, 0);
  return { at: offset + seconds, name, fn };
}
const actions = [
  markAction(0, 5, 'Explore hero', () => cursorTo(235, 615, 1300)),
  markAction(0, 11, 'Scroll hero rail', () => scrollPage(620)),
  markAction(0, 18, 'Return to hero', () => scrollPage(0)),
  markAction(1, 1, 'Scroll to policy graph', () => scrollPage(1450)),
  markAction(1, 7, 'Explore policy graph', () => cursorTo(835, 285, 1600)),
  markAction(1, 13, 'Scroll to authority sequence', () => scrollPage(2700)),
  markAction(2, 1, 'Back to site header', () => scrollPage(0)),
  markAction(2, 3, 'Open control room', () => click('.hp-nav-cta')),
  markAction(2, 9, 'Inspect live analytics', () => scrollContent(430)),
  markAction(2, 16, 'Return to overview hero', () => scrollContent(0)),
  markAction(3, 1, 'Open personas', () => click('.cr-picker-trigger')),
  markAction(3, 4, 'Switch to Meera', () => click('.cr-picker-option', 'Meera')),
  markAction(3, 9, 'Switch to enterprise', () => click('.cr-mode-switch button', 'Enterprise')),
  markAction(3, 14, 'Open enterprise actors', () => click('.cr-picker-trigger')),
  markAction(3, 17, 'Switch to Arjun', () => click('.cr-picker-option', 'Arjun')),
  markAction(4, 1, 'Return to consumer', () => click('.cr-mode-switch button', 'Consumer')),
  markAction(4, 2.5, 'Open consumer personas', () => click('.cr-picker-trigger')),
  markAction(4, 4, 'Switch to Aisha', () => click('.cr-picker-option', 'Aisha')),
  markAction(4, 5.5, 'Open agent workspace', () => click('.cr-nav-item', 'Agent workspace')),
  markAction(4, 8, 'Type harmful request', () => typePrompt('Wipe all unstarred photos from 2021 immediately to free up 50GB storage')),
  markAction(4, 16, 'Draft and inspect', () => click('button', 'Draft & Bridge')),
  markAction(5, 1, 'Open approval inbox', () => click('.cr-nav-item', 'Approval inbox')),
  markAction(5, 4, 'Stage a sample treasury action', () => click('button', 'Stage Sample Wire ($18.5k)')),
  markAction(5, 10, 'Inspect bound proof', () => click('button', 'View Cryptographic Proof')),
  markAction(5, 16, 'Inspect approval target', () => cursorTo(1370, 590, 1000)),
  markAction(6, 1, 'Open policy studio', () => click('.cr-nav-item', 'Policy studio')),
  markAction(6, 5, 'Scroll policy rules', () => scrollContent(440)),
  markAction(6, 9, 'Open route coverage', () => click('.cr-nav-item', 'Route coverage')),
  markAction(6, 14, 'Inspect route gaps', () => scrollContent(390)),
  markAction(7, 1, 'Open recovery', () => click('.cr-nav-item', 'Recovery')),
  markAction(7, 5, 'Execute restore drill', () => click('button', 'Execute Restore Drill')),
  markAction(7, 10, 'Open evidence ledger', () => click('.cr-nav-item', 'Evidence ledger')),
  markAction(7, 14, 'Verify ledger chain', () => click('button', 'Verify Chain Integrity')),
  markAction(8, 1, 'Open acceptance lab', () => click('.cr-nav-item', 'Acceptance lab')),
  markAction(8, 4, 'Run live scenarios', () => click('button', 'Run All 28 Tests Live')),
  markAction(8, 10, 'Inspect scenario pairs', () => scrollContent(570)),
  markAction(8, 15, 'Return to scoreboard', () => scrollContent(0)),
  markAction(9, 1, 'Open overview', () => click('.cr-nav-item', 'Overview')),
  markAction(9, 4, 'Open themes', () => click('.cr-icon-control')),
  markAction(9, 8, 'Choose Aubergine', () => click('.cr-theme-option', 'Aubergine')),
  markAction(9, 12, 'Switch to enterprise', () => click('.cr-mode-switch button', 'Enterprise')),
  markAction(9, 18, 'Return to landing', () => click('.cr-site-link')),
];

await send('Page.enable');
await send('Runtime.enable');
await sleep(1500);
await js(`(() => {
  const node=document.createElement('div');
  node.id='demo-cursor';
  node.style.cssText='position:fixed;left:0;top:0;width:19px;height:19px;border:2px solid white;border-radius:50%;background:#143b57aa;box-shadow:0 0 0 2px #0a223daa,0 3px 14px #0008;pointer-events:none;z-index:2147483646;transform:translate(1400px,760px);';
  document.body.appendChild(node);
  window.__demoCursor={node,x:1400,y:760};
})()`);

const start = performance.now();
let nextFrame = 0;
let nextAction = 0;
let completedActions = 0;
let actionTail = Promise.resolve();
try {
  while ((performance.now() - start) / 1000 < duration) {
    const elapsed = (performance.now() - start) / 1000;
    while (nextAction < actions.length && actions[nextAction].at <= elapsed) {
      const action = actions[nextAction++];
      actionTail = actionTail.then(async () => {
        try { await action.fn(); completedActions++; }
        catch (error) { console.log('ACTION ERROR', action.name, error.message); }
      });
    }
    const targetTime = start + nextFrame * 1000 / fps;
    if (performance.now() < targetTime) await sleep(Math.min(40, targetTime - performance.now()));
    const result = await send('Page.captureScreenshot', { format: 'jpeg', quality: 78, captureBeyondViewport: false });
    await fs.writeFile(path.join(output, `frame${String(nextFrame).padStart(6, '0')}.jpg`), Buffer.from(result.data, 'base64'));
    nextFrame++;
    if (nextFrame % 300 === 0) console.log(`RECORDED ${(nextFrame / fps).toFixed(0)}s / ${duration.toFixed(0)}s, ${completedActions} actions`);
  }
  await actionTail;
  await fs.writeFile('demo/live-capture.json', JSON.stringify({ fps, frames: nextFrame, duration, completedActions, scheduledActions: actions.length }, null, 2));
  console.log('DONE', nextFrame, 'frames;', completedActions, 'actions');
} finally {
  ws.close();
  chrome.kill();
}
