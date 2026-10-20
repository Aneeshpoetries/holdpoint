import React, { useState } from 'react';
import { useHoldpoint } from '../engine/store';
import {
  Activity,
  ShieldAlert,
  CheckCircle2,
  Clock,
  ArrowRight,
  GitCommit,
  GitBranch,
  Shield,
  AlertTriangle,
  RotateCcw,
  Play,
  Pause,
  StepForward,
  Cpu,
  Layers,
  Zap
} from 'lucide-react';
import { PipelineStageName } from '../engine/executionLoop';

export const TimelineView: React.FC = () => {
  const {
    actionsList,
    triggerKillSwitch,
    sendAgentTask,
    isLoopRunning,
    loopTickRate,
    currentStageEvent,
    pendingQueueLength,
    pauseLoop,
    resumeLoop,
    stepLoop,
    setLoopTickRate,
    enqueueAction
  } = useHoldpoint();

  const [killSwitchMessage, setKillSwitchMessage] = useState<string | null>(null);

  // Exact 8 Stages from Dossier Page 10
  const DOSSIER_8_STAGES: { id: PipelineStageName; name: string; desc: string; stageNum: number }[] = [
    { id: 'normalize', name: '1. Normalize', desc: 'Resolve stable IDs, reject duplicate/ambiguous fields', stageNum: 1 },
    { id: 'authority', name: '2. Authority', desc: 'Authenticate actor, tenant, task & delegation chain', stageNum: 2 },
    { id: 'coverage', name: '3. Coverage', desc: 'Run PII/secret detectors, record omitted parts/OCR gap', stageNum: 3 },
    { id: 'impact', name: '4. Impact', desc: 'Calculate target set, cumulative budget & reversibility', stageNum: 4 },
    { id: 'decide_reserve', name: '5. Decide & Reserve', desc: 'Deterministic policy rule decision & atomic reservation', stageNum: 5 },
    { id: 'dispatch', name: '6. Dispatch', desc: 'Recheck revocation, idempotency key & execute destination', stageNum: 6 },
    { id: 'reconcile', name: '7. Reconcile', desc: 'Verify actual destination mutation, state & version', stageNum: 7 },
    { id: 'close_recover', name: '8. Close / Recover', desc: 'Record hash-chained evidence, release locks & prepare restore', stageNum: 8 },
  ];

  const handleKillParent = (parentActionId: string) => {
    const res = triggerKillSwitch(parentActionId);
    setKillSwitchMessage(`Emergency stop triggered: ${res.cancelledCount} queued actions cancelled, ${res.reconciledCount} in-flight actions reconciled.`);
  };

  const handleSpawnRunawayAgent = async () => {
    await sendAgentTask('Run batch reconciliation across multiple worker nodes', 'G12');
  };

  const handleEnqueueSample = () => {
    enqueueAction({
      actorId: 'priya@holdpoint.internal',
      destination: 'code_repo',
      actionType: 'build_staging_artifacts',
      resourceId: 'repo-holdpoint-core',
      impact: 'low',
      reversibility: 'reversible',
      payload: { branch: `test-run-${Date.now().toString(36)}` }
    });
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto py-2">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200 dark:border-neutral-800">
        <div>
          <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
            Execution Contract (Dossier Page 10)
          </div>
          <h1 className="text-xl font-bold tracking-tight text-neutral-950 dark:text-white mt-1">
            Core Agent Execution Loop & Workflow Pipeline
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Active event loop evaluating pending actions across the 8 typed contract stages with deterministic bounds
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleEnqueueSample}
            className="px-3 py-1.5 text-xs font-semibold text-neutral-700 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            <span>Enqueue Action</span>
          </button>

          <button
            onClick={handleSpawnRunawayAgent}
            className="px-3.5 py-1.5 text-xs font-semibold text-neutral-900 dark:text-white bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <GitBranch className="w-3.5 h-3.5" />
            <span>Simulate Child Delegation (G12)</span>
          </button>
        </div>
      </div>

      {killSwitchMessage && (
        <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-rose-500 shrink-0" />
          <span>{killSwitchMessage}</span>
        </div>
      )}

      {/* CORE AGENT EXECUTION LOOP CONTROLLER */}
      <div className="p-5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center gap-2.5">
            <Cpu className="w-5 h-5 text-indigo-500" />
            <div>
              <h2 className="text-sm font-bold text-neutral-950 dark:text-white">
                Holdpoint Agent Execution Loop Worker
              </h2>
              <div className="text-[11px] text-neutral-500 flex items-center gap-2">
                <span>Worker Status:</span>
                <span className={`font-semibold font-mono uppercase ${isLoopRunning ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-500'}`}>
                  {isLoopRunning ? 'Active (Processing Queue)' : 'Paused (Manual Step Ready)'}
                </span>
                <span>·</span>
                <span>Queue Depth: <strong className="tabular-nums font-mono text-neutral-800 dark:text-neutral-200">{pendingQueueLength}</strong> actions</span>
              </div>
            </div>
          </div>

          {/* Loop Controls */}
          <div className="flex items-center gap-2">
            {isLoopRunning ? (
              <button
                onClick={pauseLoop}
                className="px-3 py-1.5 text-xs font-semibold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-900 rounded-lg hover:bg-amber-100 transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Pause className="w-3.5 h-3.5" />
                <span>Pause Worker</span>
              </button>
            ) : (
              <button
                onClick={resumeLoop}
                className="px-3 py-1.5 text-xs font-semibold text-white bg-neutral-900 dark:bg-neutral-100 dark:text-neutral-900 rounded-lg hover:bg-neutral-800 transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Play className="w-3.5 h-3.5" />
                <span>Resume Worker</span>
              </button>
            )}

            <button
              onClick={stepLoop}
              disabled={isLoopRunning || pendingQueueLength === 0}
              className="px-3 py-1.5 text-xs font-semibold text-neutral-700 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg hover:bg-neutral-200 transition-colors cursor-pointer disabled:opacity-40 flex items-center gap-1.5"
              title="Process next queued action one stage at a time"
            >
              <StepForward className="w-3.5 h-3.5" />
              <span>Step One Action</span>
            </button>

            {/* Speed Selector */}
            <select
              value={loopTickRate}
              onChange={(e) => setLoopTickRate(Number(e.target.value))}
              className="bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg px-2.5 py-1 text-xs text-neutral-800 dark:text-neutral-200 focus:outline-hidden cursor-pointer"
            >
              <option value={200}>Fast (200ms)</option>
              <option value={400}>Normal (400ms)</option>
              <option value={800}>Deliberate (800ms)</option>
            </select>
          </div>
        </div>

        {/* 8-Stage Execution Contract Visualizer */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-neutral-500 uppercase tracking-wider">
            <span>The 8-Stage Typed Action Contract Pipeline</span>
            {currentStageEvent && (
              <span className="font-mono text-indigo-600 dark:text-indigo-400 font-semibold animate-pulse">
                In-Flight: Stage {currentStageEvent.stageNumber} ({currentStageEvent.stage})
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 text-center text-xs">
            {DOSSIER_8_STAGES.map((s) => {
              const isActive = currentStageEvent?.stage === s.id;
              return (
                <div
                  key={s.id}
                  className={`p-3 rounded-lg border flex flex-col justify-between transition-all duration-200 ${
                    isActive
                      ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-400 dark:border-indigo-600 ring-2 ring-indigo-400/40 shadow-xs'
                      : 'bg-neutral-50 dark:bg-neutral-800/60 border-neutral-200 dark:border-neutral-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] text-neutral-400 font-semibold">
                      0{s.stageNum}
                    </span>
                    {isActive && (
                      <span className="w-2 h-2 rounded-full bg-indigo-500 animate-ping" />
                    )}
                  </div>
                  <div className="font-bold text-neutral-900 dark:text-neutral-100 my-1 text-[11px]">
                    {s.name}
                  </div>
                  <div className="text-[10px] text-neutral-500 leading-tight">
                    {s.desc}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Active Stage Transition Callout */}
          {currentStageEvent && (
            <div className="p-2.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs font-mono flex items-center justify-between gap-3 text-neutral-800 dark:text-neutral-200">
              <div className="flex items-center gap-2">
                <span className="px-1.5 py-0.5 rounded bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 font-bold uppercase text-[10px]">
                  Stage {currentStageEvent.stageNumber}: {currentStageEvent.stage}
                </span>
                <span className="truncate">{currentStageEvent.details}</span>
              </div>
              <span className="text-[10px] text-neutral-400 shrink-0 tabular-nums">
                Action: {currentStageEvent.actionId}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Live Action Pipeline Records */}
      <div className="space-y-4">
        <h2 className="text-sm font-semibold text-neutral-950 dark:text-white">
          Evaluated Action Lifecycle Records ({actionsList.length})
        </h2>

        {actionsList.length === 0 ? (
          <div className="p-12 text-center rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-xs text-neutral-400">
            No pipeline events recorded yet. Dispatch an action from the Agent Workspace or click "Enqueue Action".
          </div>
        ) : (
          actionsList.map((action) => {
            const isParent = !action.contract.parentActionId;

            return (
              <div
                key={action.contract.actionId}
                className="p-5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-neutral-950 dark:text-white">
                      {action.contract.actionId}
                    </span>
                    <span className="font-mono text-xs text-neutral-500">
                      [{action.contract.actionType}]
                    </span>
                    {action.contract.delegationDepth > 0 && (
                      <span className="text-[11px] font-mono px-1.5 py-0.2 rounded bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                        Child Depth: {action.contract.delegationDepth}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-neutral-500 font-mono">
                      Actor: {action.contract.actorId}
                    </span>
                    <span className="text-neutral-300 dark:text-neutral-700">·</span>
                    <span className="text-xs font-semibold capitalize font-mono text-neutral-700 dark:text-neutral-300">
                      Status: {action.status}
                    </span>
                  </div>
                </div>

                {/* Parameters & Destination */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs bg-neutral-50 dark:bg-neutral-800/70 p-2.5 rounded-lg border border-neutral-200 dark:border-neutral-700/80 font-mono">
                  <div>
                    <span className="text-[10px] text-neutral-500 dark:text-neutral-400 block uppercase">Destination Resource</span>
                    <span className="text-neutral-900 dark:text-neutral-100 font-medium">{action.contract.destination} / {action.contract.resourceId}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-neutral-500 dark:text-neutral-400 block uppercase">Idempotency Key</span>
                    <span className="truncate block text-neutral-800 dark:text-neutral-200">{action.contract.idempotencyKey}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-neutral-500 dark:text-neutral-400 block uppercase">Reversibility / Impact</span>
                    <span className="uppercase text-neutral-900 dark:text-neutral-100 font-semibold">{action.contract.reversibility} · {action.contract.impact}</span>
                  </div>
                </div>

                {/* Kill Switch Trigger for Parent Actions */}
                {isParent && (
                  <div className="flex items-center justify-between pt-2 border-t border-neutral-100 dark:border-neutral-800/80">
                    <span className="text-xs text-neutral-500">
                      Parent agent controlling workflow execution
                    </span>
                    <button
                      onClick={() => handleKillParent(action.contract.actionId)}
                      className="px-3 py-1 text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded hover:bg-rose-100 transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <ShieldAlert className="w-3.5 h-3.5" />
                      <span>Trigger Kill Switch for this Tree</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
