import fs from 'node:fs/promises';
import path from 'node:path';
import { spawn } from 'node:child_process';

const manifest = JSON.parse(await fs.readFile('demo/manifest.json', 'utf8'));
const segmentDir = path.resolve('demo/segments');
await fs.mkdir(segmentDir, { recursive: true });

function run(binary, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(binary, args, { windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'] });
    let tail = '';
    child.stderr.on('data', (chunk) => { tail = (tail + chunk.toString()).slice(-6000); });
    child.on('exit', (code) => code === 0 ? resolve() : reject(new Error(`${binary} exited ${code}\n${tail}`)));
  });
}

const pad = 0.7;
const clipPaths = [];
for (let index = 0; index < manifest.length; index++) {
  const scene = manifest[index];
  const output = path.join(segmentDir, `${String(index + 1).padStart(2, '0')}.mp4`);
  const total = scene.duration + pad;
  const perFrame = total / scene.frames.length;
  const args = ['-y', '-hide_banner', '-loglevel', 'error'];
  for (const frame of scene.frames) {
    args.push('-loop', '1', '-framerate', '25', '-t', perFrame.toFixed(3), '-i', path.resolve('demo/frames', `${frame}.jpg`));
  }
  args.push('-i', path.resolve(scene.file));
  const filters = [];
  for (let i = 0; i < scene.frames.length; i++) {
    const direction = (index + i) % 2 === 0 ? 0.3 : 0.7;
    filters.push(`[${i}:v]scale=1600:900,zoompan=z='min(1+on*0.00012,1.04)':x='(iw-iw/zoom)*${direction}':y='(ih-ih/zoom)*0.35':d=1:s=1600x900:fps=25,trim=duration=${perFrame.toFixed(3)},setpts=PTS-STARTPTS[v${i}]`);
  }
  filters.push(`${scene.frames.map((_, i) => `[v${i}]`).join('')}concat=n=${scene.frames.length}:v=1:a=0[vc]`);
  const label = `${String(index + 1).padStart(2, '0')}  /  ${scene.title.toUpperCase()}`;
  filters.push(`[vc]drawbox=x=252:y=825:w=650:h=50:color=0x07131f@0.88:t=fill:enable='between(t,0,3.8)',drawtext=fontfile='C\\:/Windows/Fonts/arial.ttf':text='${label}':fontsize=20:fontcolor=white:x=271:y=837:enable='between(t,0,3.8)',format=yuv420p[vout]`);
  filters.push(`[${scene.frames.length}:a]aresample=48000,aformat=channel_layouts=stereo,apad=pad_dur=${pad}[aout]`);
  args.push('-filter_complex', filters.join(';'), '-map', '[vout]', '-map', '[aout]', '-t', total.toFixed(3), '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '20', '-profile:v', 'high', '-pix_fmt', 'yuv420p', '-r', '25', '-c:a', 'aac', '-b:a', '192k', '-ar', '48000', '-movflags', '+faststart', output);
  console.log(`Rendering ${index + 1}/${manifest.length}: ${scene.title}`);
  await run('ffmpeg', args);
  clipPaths.push(output);
}

const concatPath = path.resolve('demo/segments/concat.txt');
await fs.writeFile(concatPath, clipPaths.map((file) => `file '${file.replaceAll("'", "'\\''")}'`).join('\n') + '\n');
const finalPath = path.resolve('HOLDPOINT-demo.mp4');
await run('ffmpeg', ['-y', '-hide_banner', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', concatPath, '-c', 'copy', '-movflags', '+faststart', finalPath]);

function stamp(seconds) {
  const ms = Math.round(seconds * 1000);
  const h = Math.floor(ms / 3600000);
  const m = Math.floor(ms / 60000) % 60;
  const s = Math.floor(ms / 1000) % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')},${String(ms % 1000).padStart(3, '0')}`;
}
let offset = 0;
let number = 1;
const captions = [];
for (const scene of manifest) {
  const words = scene.text.split(/\s+/);
  const chunks = [];
  for (let i = 0; i < words.length; i += 11) chunks.push(words.slice(i, i + 11).join(' '));
  const weight = chunks.map((chunk) => chunk.split(/\s+/).length);
  const totalWeight = weight.reduce((sum, count) => sum + count, 0);
  let position = 0;
  for (let i = 0; i < chunks.length; i++) {
    const start = offset + (position / totalWeight) * scene.duration;
    position += weight[i];
    const end = offset + (position / totalWeight) * scene.duration;
    captions.push(`${number++}\n${stamp(start)} --> ${stamp(end)}\n${chunks[i]}\n`);
  }
  offset += scene.duration + pad;
}
await fs.writeFile('HOLDPOINT-demo.srt', captions.join('\n'));
await fs.writeFile('demo/transcript.md', `# HOLDPOINT demo narration\n\n${manifest.map((scene, i) => `## ${i + 1}. ${scene.title}\n\n${scene.text}`).join('\n\n')}\n`);
console.log(`Done: ${finalPath} (${offset.toFixed(1)} seconds)`);
