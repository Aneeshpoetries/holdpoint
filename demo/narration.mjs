import fs from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config({ path: '.env', quiet: true });
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const scenes = [
  {
    title: 'Authority before impact',
    frames: ['01-hero'],
    text: 'An AI assistant can organize your photos, move money, or deploy software in seconds. But a helpful instruction can also become an irreversible action. The real question is not whether an agent sounds confident. It is who gave it authority, for exactly what, before the impact happens.'
  },
  {
    title: 'The control layer',
    frames: ['02-landing-rail', '03-policy-graph', '04-sequence'],
    text: 'This is HOLDPOINT: a control layer between an AI agent’s intent and a consequential destination. It captures the request as a typed action, checks policy and scope, calls for an independent signature when needed, and records the effect. The agent cannot rewrite those rules in a chat message.'
  },
  {
    title: 'Live control room',
    frames: ['05-aisha-overview'],
    text: 'Let’s open the working prototype. Aisha’s desk is built around her photo archive: fourteen thousand indexed images, with originals treated as protected assets. Right below, the live status shows held approvals, route coverage, recovery copies, and evidence events. This is an operating view, not a decorative dashboard.'
  },
  {
    title: 'Role-specific workspaces',
    frames: ['06-persona-menu', '07-meera-overview', '08-priya-overview', '09-arjun-overview'],
    text: 'The same boundary adapts to different people. Meera sees household services and spending authority. Priya sees a production release path that calls for a second signature. Arjun sees the enforcement perimeter and route gaps. Each persona has its own context, protected surface, and suggested actions, so the first screen tells you whose work you are doing.'
  },
  {
    title: 'Inspect intent',
    frames: ['10-agent-workspace', '11-harmful-request', '11b-inspected-draft'],
    text: 'Here is the core interaction. We ask the assistant to wipe original photos. HOLDPOINT does not treat that sentence as permission. It drafts a structured contract, identifies the photo vault and irreversible impact, then quarantines the proposal before it can enter the execution pipeline. You can inspect the exact parameters and the reason for rejection.'
  },
  {
    title: 'Independent approval',
    frames: ['12-approval-inbox'],
    text: 'For an action that is allowed only with dual control, the approval inbox shows the proposed actor, target, amount, risk, policy, and an expiring authorization token. A reviewer signs the specific action, not a vague blanket request. The destination remains unchanged while that decision is pending.'
  },
  {
    title: 'Policy and coverage',
    frames: ['13-policy-studio', '14-route-coverage'],
    text: 'Policy lives outside the agent’s prose. The studio turns a proposed rule into a typed, conflict-checked control. Route coverage then maps which paths actually pass through the broker and which are exposed gaps. That separation matters: seeing traffic is not the same as enforcing a boundary.'
  },
  {
    title: 'Recovery and evidence',
    frames: ['15-recovery', '16-evidence-ledger'],
    text: 'Before a high-impact change, HOLDPOINT can inspect independent recovery snapshots and run a restore drill. After a decision, the evidence ledger links the intent, policy check, approval, dispatch, and receipt. Operators can trace what was requested, what was authorized, and what actually happened.'
  },
  {
    title: 'Demonstrated behavior',
    frames: ['17-acceptance-before', '18-acceptance-after'],
    text: 'The acceptance lab makes the behavior testable. We run twenty-eight paired scenarios against the engine and destination state: a harmful action should be stopped, while its legitimate control should still work. The result here is twenty-eight verified pairs, including the actual decisions and side effects.'
  },
  {
    title: 'A distinct product',
    frames: ['19-theme-menu', '20-aubergine-overview', '21-final-hero'],
    text: 'There are six visual themes and ten role-specific desks, but the real originality is architectural. HOLDPOINT is not another warning above a chatbot. It is a checkpoint in the path to effect: intent becomes a contract, authority becomes explicit, and every consequential outcome has an accountable trail. Authority before impact.'
  }
];

await fs.mkdir('demo/audio', { recursive: true });
const manifest = [];
for (let index = 0; index < scenes.length; index++) {
  const scene = scenes[index];
  const file = `demo/audio/${String(index + 1).padStart(2, '0')}.wav`;
  try { await fs.access(file); } catch {
    console.log(`Generating ${index + 1}/${scenes.length}: ${scene.title}`);
    const interaction = await ai.interactions.create({
      model: 'gemini-3.8-flash-tts',
      input: [{ type: 'user_input', content: [{
        type: 'text', text: scene.text,
        annotations: [{ type: 'speech_metadata', style: 'Speak as a thoughtful human founder giving a live product walkthrough. Warm, clear, direct, and conversational. Natural breathing and varied emphasis; slightly energized when showing a result, measured when explaining risk. Medium pace. Avoid a commercial announcer or synthetic cadence.' }]
      }] }],
      response_format: { type: 'audio' },
      generation_config: { speech_config: [{ voice: 'Kore' }] }
    });
    await fs.writeFile(file, Buffer.from(interaction.output_audio.data, 'base64'));
  }
  const probe = spawnSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'default=nw=1:nk=1', file], { encoding: 'utf8' });
  if (probe.status !== 0) throw new Error(`Cannot inspect audio: ${file}`);
  const duration = Number(probe.stdout.trim());
  manifest.push({ ...scene, file, duration });
  console.log(`${scene.title}: ${duration.toFixed(1)} s`);
}
await fs.writeFile('demo/manifest.json', JSON.stringify(manifest, null, 2));
console.log('Total narration:', manifest.reduce((total, item) => total + item.duration, 0).toFixed(1), 'seconds');
