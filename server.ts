/**
 * HOLDPOINT Backend Server (Express + Vite middlewares + Gemini API)
 * Implements the deterministic control layer on the server,
 * hosting REST APIs for chat with AI persona assistants, typed action pipeline,
 * bounded approvals, restore drills, and the 28 acceptance tests.
 */

import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { fileURLToPath } from 'url';

import { ExecutionEngine } from './src/engine/executionEngine';
import { DestinationRegistry } from './src/engine/destinations';
import { PolicyEngine } from './src/engine/policyEngine';
import { ACCEPTANCE_SCENARIOS, runAcceptanceScenario } from './src/engine/scenarios';
import { CONSUMER_PERSONAS, ENTERPRISE_EMPLOYEES } from './src/engine/personas';
import { aiChatHandler } from './src/engine/chat';
import { DraftActionContract } from './src/engine/types';
import { runStressTestSuite } from './src/engine/stressTestEngine';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const isProd = process.env.NODE_ENV === 'production';
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Initialize Gemini Client
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;
if (apiKey && apiKey !== 'MY_GEMINI_API_KEY' && apiKey.length > 5) {
  ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
  aiChatHandler.setGeminiClient(ai);
}

const engine = ExecutionEngine.getInstance();
const destinationRegistry = DestinationRegistry.getInstance();
const policyEngine = PolicyEngine.getInstance();

// Helper: Get persona profile
function getPersona(id: string) {
  return (
    CONSUMER_PERSONAS.find(p => p.id === id) ||
    ENTERPRISE_EMPLOYEES.find(p => p.id === id) ||
    CONSUMER_PERSONAS[0]
  );
}

// ----------------------------------------------------
// Health check endpoint
// ----------------------------------------------------
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), uptime: process.uptime() });
});

// ----------------------------------------------------
// 1. AI Chat Assistant & Action Proposer Endpoint
// ----------------------------------------------------
app.post('/api/chat', async (req, res) => {
  try {
    const { personaId, prompt, presetScenarioId, history } = req.body;
    const persona = getPersona(personaId);

    const chatResult = await aiChatHandler.processUserChat(prompt, persona, presetScenarioId, history);

    return res.json({
      reply: chatResult.chatResponse,
      actionState: chatResult.queuedState,
      draftContract: chatResult.draft,
      isHarmfulAttempt: chatResult.isHarmfulAttempt,
      usedGemini: chatResult.usedGemini
    });
  } catch (err: any) {
    console.error('Chat error:', err);
    res.status(500).json({ error: err.message || 'Server error processing chat action' });
  }
});

// Draft Contract endpoints: create, validate, and promote
app.post('/api/drafts/generate', async (req, res) => {
  try {
    const { personaId, prompt, presetScenarioId, history } = req.body;
    const persona = getPersona(personaId);
    const result = await aiChatHandler.generateDraftContract(prompt, persona, { presetScenarioId, history });
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/drafts/validate', (req, res) => {
  try {
    const { draft, personaId } = req.body;
    const persona = personaId ? getPersona(personaId) : undefined;
    const validation = aiChatHandler.validateDraftContract(draft, persona);
    res.json({ validation });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/drafts/promote', async (req, res) => {
  try {
    const { draft } = req.body;
    const result = await aiChatHandler.promoteAndQueueDraft(draft);
    if (!result.success) {
      return res.status(422).json({ error: result.error });
    }
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Comprehensive Backend Stress Test Suite (All 10 Personas across 39 Scenarios)
app.get('/api/test/stress-suite', async (req, res) => {
  try {
    const report = await runStressTestSuite();
    res.json(report);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Stress test failed' });
  }
});

// ----------------------------------------------------
// 2. Action Pipeline & Approvals Endpoints
// ----------------------------------------------------
app.get('/api/actions', (req, res) => {
  res.json({
    actions: Array.from(engine.actions.values()).reverse(),
    pendingApprovals: Array.from(engine.approvals.values()).filter(a => a.status === 'pending').reverse()
  });
});

app.post('/api/actions/submit', async (req, res) => {
  try {
    const actionState = await engine.submitAction(req.body);
    res.json({ actionState });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/approvals/:id/authorize', (req, res) => {
  const { id } = req.params;
  const { approverId, tamperedParams } = req.body;
  const result = engine.authorizeApproval(id, approverId || 'Independent Reviewer', tamperedParams);
  res.json(result);
});

app.post('/api/approvals/:id/reject', (req, res) => {
  const { id } = req.params;
  const appr = engine.approvals.get(id);
  if (appr) {
    appr.status = 'rejected';
    const act = engine.actions.get(appr.actionId);
    if (act) act.status = 'denied';
    engine.recordEvidence(appr.actionId, 'approval', 'reviewer', appr.boundDestination, `Approval #${id} rejected by user`, {});
    return res.json({ success: true, rejected: true });
  }
  res.status(404).json({ success: false, error: 'Approval not found' });
});

app.post('/api/approvals/:id/expire', (req, res) => {
  const { id } = req.params;
  const result = engine.expireApproval(id);
  res.json(result);
});

app.post('/api/approvals/:id/adjust-ttl', (req, res) => {
  const { id } = req.params;
  const { remainingSeconds } = req.body;
  const success = engine.adjustApprovalTTL(id, typeof remainingSeconds === 'number' ? remainingSeconds : 60);
  res.json({ success });
});

// ----------------------------------------------------
// 3. Kill Switch & Restore Drills
// ----------------------------------------------------
app.post('/api/kill-switch', (req, res) => {
  const { parentActionId } = req.body;
  const result = engine.triggerKillSwitch(parentActionId || 'global-halt-tree');
  res.json(result);
});

app.post('/api/restore-drill', (req, res) => {
  const { snapshotId } = req.body;
  const targetId = (snapshotId && destinationRegistry.snapshots.has(snapshotId))
    ? snapshotId
    : Array.from(destinationRegistry.snapshots.keys())[0];
  const result = destinationRegistry.performRestoreDrill(targetId);
  engine.recordEvidence(
    `drill-${Date.now().toString(36)}`,
    'recovery',
    'security-custodian',
    'cloud_infra',
    `Server-side restore drill executed for snapshot ${targetId}. Key & IAM permissions verified.`,
    { result }
  );
  res.json(result);
});

// ----------------------------------------------------
// 4. Acceptance Scenarios Runner (G01 - G28)
// ----------------------------------------------------
app.post('/api/scenarios/run', async (req, res) => {
  const { scenarioId } = req.body;
  if (scenarioId) {
    const scen = ACCEPTANCE_SCENARIOS.find(s => s.id === scenarioId);
    if (!scen) return res.status(404).json({ error: 'Scenario not found' });
    const harmfulRes = await runAcceptanceScenario(scen, 'harmful');
    const controlRes = await runAcceptanceScenario(scen, 'control');
    return res.json({
      scenarioId,
      title: scen.title,
      harmfulPassed: harmfulRes.passed,
      harmfulStatus: harmfulRes.actualStatus,
      controlPassed: controlRes.passed,
      controlStatus: controlRes.actualStatus,
      details: harmfulRes.reasons[0] || 'Evaluated against destination state'
    });
  }

  // Run all 28 scenarios
  const results: Record<string, any> = {};
  for (const scen of ACCEPTANCE_SCENARIOS) {
    const harmfulRes = await runAcceptanceScenario(scen, 'harmful');
    const controlRes = await runAcceptanceScenario(scen, 'control');
    results[scen.id] = {
      scenarioId: scen.id,
      title: scen.title,
      harmfulPassed: harmfulRes.passed,
      harmfulStatus: harmfulRes.actualStatus,
      controlPassed: controlRes.passed,
      controlStatus: controlRes.actualStatus,
      details: harmfulRes.reasons[0] || 'Evaluated against destination state'
    };
  }
  res.json({ results });
});

// ----------------------------------------------------
// 5. Evidence & Ledger Verification
// ----------------------------------------------------
app.get('/api/ledger', (req, res) => {
  res.json({
    ledger: [...engine.evidenceChain].reverse(),
    routes: engine.routes
  });
});

app.post('/api/ledger/tamper', (req, res) => {
  const tampered = engine.simulateLedgerTamper(1);
  res.json({ tampered });
});

app.get('/api/ledger/verify', (req, res) => {
  const result = engine.verifyLedgerIntegrity();
  res.json(result);
});

// ----------------------------------------------------
// 6. Reset Engine State
// ----------------------------------------------------
app.post('/api/reset', (req, res) => {
  engine.resetDemo();
  res.json({ success: true, message: 'All in-memory engine and destination state reset to defaults.' });
});

// ----------------------------------------------------
// Mount Frontend (Vite in dev, static files in prod)
// ----------------------------------------------------
async function startServer() {
  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist/index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`HOLDPOINT server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
