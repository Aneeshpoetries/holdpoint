import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const profile = await fs.mkdtemp(path.join(os.tmpdir(), 'holdpoint-demo-chrome-'));
const output = path.resolve('demo/frames');
await fs.mkdir(output, { recursive: true });
const browser = spawn(chromePath, [
  '--headless=new', '--disable-gpu', '--no-first-run', '--no-default-browser-check',
  '--hide-scrollbars', '--force-device-scale-factor=1', '--window-size=1600,900',
  '--remote-debugging-port=0', `--user-data-dir=${profile}`,
  'http://127.0.0.1:3000/'
], { stdio: 'ignore', windowsHide: true });

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
let port;
for (let i = 0; i < 100; i++) {
  try {
    port = Number((await fs.readFile(path.join(profile, 'DevToolsActivePort'), 'utf8')).split('\n')[0]);
    break;
  } catch { await sleep(100); }
}
if (!port) throw new Error('Chrome remote debugging port not found');
let target;
for (let i = 0; i < 50; i++) {
  const list = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
  target = list.find((item) => item.type === 'page' && item.url.includes('127.0.0.1:3000'));
  if (target) break;
  await sleep(100);
}
if (!target) throw new Error('Prototype tab not found');
const ws = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((resolve, reject) => { ws.onopen = resolve; ws.onerror = reject; });
let id = 0;
const requests = new Map();
ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  if (!message.id || !requests.has(message.id)) return;
  const { resolve, reject } = requests.get(message.id);
  requests.delete(message.id);
  message.error ? reject(new Error(message.error.message)) : resolve(message.result);
};
function send(method, params = {}) {
  const current = ++id;
  return new Promise((resolve, reject) => {
    requests.set(current, { resolve, reject });
    ws.send(JSON.stringify({ id: current, method, params }));
  });
}
async function evalJS(expression) {
  const result = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
  if (result.exceptionDetails) throw new Error(result.exceptionDetails.text);
  return result.result.value;
}
async function clickText(text, selector = 'button') {
  const found = await evalJS(`(() => { const e=[...document.querySelectorAll(${JSON.stringify(selector)})].find(x=>x.textContent.trim().includes(${JSON.stringify(text)})); if(e){ e.click(); return e.textContent.trim().slice(0,90); } return null; })()`);
  if (!found) throw new Error(`Could not click ${text}`);
  await sleep(850);
  console.log('click', found);
}
async function clickSelector(selector) {
  const found = await evalJS(`(() => { const e=document.querySelector(${JSON.stringify(selector)}); if(e){e.click();return true;} return false;})()`);
  if (!found) throw new Error(`Could not click ${selector}`);
  await sleep(800);
}
async function screenshot(name, pause = 600) {
  await sleep(pause);
  const result = await send('Page.captureScreenshot', { format: 'jpeg', quality: 90, captureBeyondViewport: false });
  await fs.writeFile(path.join(output, `${name}.jpg`), Buffer.from(result.data, 'base64'));
  console.log('saved', name);
}
async function scroll(y) {
  await evalJS(`window.scrollTo({top:${y},behavior:'instant'})`);
  await sleep(900);
}

try {
  await send('Page.enable');
  await send('Runtime.enable');
  await sleep(2500);
  await screenshot('01-hero');
  await scroll(760);
  await screenshot('02-landing-rail');
  await scroll(1500);
  await screenshot('03-policy-graph');
  await scroll(2500);
  await screenshot('04-sequence');
  await evalJS(`window.scrollTo({top:0,behavior:'instant'})`);
  await clickText('Enter the control room');
  await screenshot('05-aisha-overview');
  await clickSelector('.cr-picker-trigger');
  await screenshot('06-persona-menu');
  await clickText('Meera', '.cr-picker-option');
  await screenshot('07-meera-overview');
  await clickText('Enterprise', '.cr-mode-switch button');
  await screenshot('08-priya-overview');
  await clickSelector('.cr-picker-trigger');
  await clickText('Arjun', '.cr-picker-option');
  await screenshot('09-arjun-overview');
  await clickText('Consumer', '.cr-mode-switch button');
  await clickSelector('.cr-picker-trigger');
  await clickText('Aisha', '.cr-picker-option');
  await clickText('Agent workspace', '.cr-nav-item');
  await screenshot('10-agent-workspace');
  await clickText('Wipe Originals', 'button');
  await screenshot('11-harmful-request', 400);
  await clickText('Draft & Bridge');
  await screenshot('11b-inspected-draft', 2500);
  await clickText('Approval inbox', '.cr-nav-item');
  await clickText('Stage Sample Wire ($18.5k)');
  await screenshot('12-approval-inbox');
  await clickText('Policy studio', '.cr-nav-item');
  await screenshot('13-policy-studio');
  await clickText('Route coverage', '.cr-nav-item');
  await screenshot('14-route-coverage');
  await clickText('Recovery', '.cr-nav-item');
  await screenshot('15-recovery');
  await clickText('Evidence ledger', '.cr-nav-item');
  await screenshot('16-evidence-ledger');
  await clickText('Acceptance lab', '.cr-nav-item');
  await screenshot('17-acceptance-before');
  await clickText('Run All 28 Tests Live');
  await screenshot('18-acceptance-after', 2500);
  await clickText('Overview', '.cr-nav-item');
  await clickSelector('.cr-icon-control');
  await screenshot('19-theme-menu');
  await clickText('Aubergine', '.cr-theme-option');
  await screenshot('20-aubergine-overview');
  await clickText('Back to site', '.cr-site-link');
  await screenshot('21-final-hero', 1700);
} finally {
  ws.close();
  browser.kill();
  console.log('Capture complete');
}
