import fs from 'node:fs/promises';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config({ path: '.env' });
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const interaction = await ai.interactions.create({
  model: 'gemini-3.8-flash-tts',
  input: [{ type: 'user_input', content: [{ type: 'text', text: 'Imagine asking an AI to help organize your photos, and knowing it cannot delete an original without your approval.', annotations: [{ type: 'speech_metadata', style: 'Warm, confident, conversational product presenter. Natural human rhythm, varied emphasis, relaxed pace, subtle smile. No announcer affectation.' }] }] }],
  response_format: { type: 'audio' },
  generation_config: { speech_config: [{ voice: 'Kore' }] },
});
await fs.mkdir('demo/audio', { recursive: true });
await fs.writeFile('demo/audio/voice-test.wav', Buffer.from(interaction.output_audio.data, 'base64'));
console.log('Wrote demo/audio/voice-test.wav');
