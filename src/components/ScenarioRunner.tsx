import React, { useState } from 'react';
import { useHoldpoint } from '../engine/store';
import { ACCEPTANCE_SCENARIOS } from '../engine/scenarios';
import {
  CheckCircle,
  XCircle,
  Play,
  RotateCw,
  Search,
  Filter,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Zap
} from 'lucide-react';

export const ScenarioRunner: React.FC = () => {
  const {
    scenarioResults,
    isRunningScenarios,
    runScenarioById,
    runAllScenarios
  } = useHoldpoint();

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [runningIndividualId, setRunningIndividualId] = useState<string | null>(null);

  const categories = Array.from(new Set(ACCEPTANCE_SCENARIOS.map(s => s.category)));

  const filteredScenarios = ACCEPTANCE_SCENARIOS.filter(s => {
    const matchSearch =
      s.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCat = categoryFilter === 'all' || s.category === categoryFilter;
    return matchSearch && matchCat;
  });

  const totalExecuted = Object.keys(scenarioResults).length;
  const totalPassed = Object.values(scenarioResults).filter(r => r.harmfulPassed && r.controlPassed).length;

  const handleRunSingle = async (id: string) => {
    setRunningIndividualId(id);
    await runScenarioById(id);
    setRunningIndividualId(null);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto py-2">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-neutral-200 dark:border-neutral-800">
        <div>
          <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
            Acceptance Test Suite (G01 – G28)
          </div>
          <h1 className="text-xl font-bold tracking-tight text-neutral-950 dark:text-white mt-1">
            28 Scenarios: Harmful Test vs Legitimate Control
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Every test is evaluated live against actual engine and destination state. Zero hardcoded results.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={runAllScenarios}
            disabled={isRunningScenarios}
            className="px-4 py-2 text-xs font-semibold text-white bg-neutral-900 dark:bg-neutral-100 dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-200 rounded-lg transition-colors cursor-pointer flex items-center gap-2 disabled:opacity-50"
          >
            {isRunningScenarios ? (
              <>
                <RotateCw className="w-3.5 h-3.5 animate-spin" />
                <span>Running Test Suite...</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5" />
                <span>Run All 28 Tests Live</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Real Computed Scoreboard */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-1">
          <span className="text-xs text-neutral-500 font-medium">Scenarios Verified</span>
          <div className="text-2xl font-bold text-neutral-950 dark:text-white tabular-nums">
            {totalPassed} / {ACCEPTANCE_SCENARIOS.length}
          </div>
          <p className="text-[11px] text-neutral-400">Harmful prevented AND control allowed</p>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-1">
          <span className="text-xs text-neutral-500 font-medium">Suite Coverage</span>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
            {totalExecuted > 0 ? Math.round((totalPassed / totalExecuted) * 100) : 0}% Pass Rate
          </div>
          <p className="text-[11px] text-neutral-400">
            {totalExecuted} evaluated on real destination state
          </p>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-1">
          <span className="text-xs text-neutral-500 font-medium">Evaluation Standard</span>
          <div className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 mt-1">
            Deterministic Engine
          </div>
          <p className="text-[11px] text-neutral-400">
            Pass requires matching policy decision & verified side-effects
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-neutral-100 dark:bg-neutral-850 p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 text-xs">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Search className="w-4 h-4 text-neutral-400 ml-1" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search scenarios by ID, keyword..."
            className="bg-transparent border-none text-xs text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none w-48 sm:w-64"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <span className="text-neutral-500 text-[11px]">Category:</span>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg px-2.5 py-1 text-xs text-neutral-900 dark:text-neutral-100 focus:outline-hidden cursor-pointer"
          >
            <option value="all">All Categories ({ACCEPTANCE_SCENARIOS.length})</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Scenario Cards */}
      <div className="space-y-4">
        {filteredScenarios.map((scen) => {
          const res = scenarioResults[scen.id];
          const isPending = !res;
          const isPassed = res && res.harmfulPassed && res.controlPassed;
          const isRunningThis = runningIndividualId === scen.id || isRunningScenarios;

          return (
            <div
              key={scen.id}
              className={`p-5 rounded-xl border transition-colors space-y-3.5 ${
                res
                  ? isPassed
                    ? 'bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800'
                    : 'bg-rose-50/20 dark:bg-rose-950/20 border-rose-300 dark:border-rose-900'
                  : 'bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100">
                    {scen.id}
                  </span>
                  <span className="font-semibold text-sm text-neutral-950 dark:text-white">
                    {scen.title}
                  </span>
                  <span className="text-neutral-400">·</span>
                  <span className="text-xs text-neutral-500">{scen.category}</span>
                </div>

                <div className="flex items-center gap-3">
                  {res ? (
                    isPassed ? (
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                        <CheckCircle className="w-4 h-4" />
                        PASS (Verified)
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400">
                        <XCircle className="w-4 h-4" />
                        FAIL (State Mismatch)
                      </span>
                    )
                  ) : (
                    <span className="text-xs text-neutral-400 font-mono">Unexecuted</span>
                  )}

                  <button
                    onClick={() => handleRunSingle(scen.id)}
                    disabled={isRunningThis}
                    className="px-3 py-1 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-900 dark:text-white text-xs font-semibold rounded-md transition-colors cursor-pointer flex items-center gap-1 disabled:opacity-50"
                  >
                    {isRunningThis ? (
                      <RotateCw className="w-3 h-3 animate-spin" />
                    ) : (
                      <Play className="w-3 h-3" />
                    )}
                    <span>Run</span>
                  </button>
                </div>
              </div>

              <p className="text-xs text-neutral-600 dark:text-neutral-400">
                {scen.description}
              </p>

              {/* Harmful vs Control Dual Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1 text-xs font-mono">
                {/* Harmful Case */}
                <div className="p-3 rounded-lg bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/60 space-y-1.5">
                  <div className="flex items-center justify-between text-rose-800 dark:text-rose-300 font-semibold font-sans">
                    <span className="flex items-center gap-1">
                      <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />
                      1. Harmful Test Case
                    </span>
                    <span className="text-[10px] font-mono uppercase">
                      Expected: {scen.harmfulCase.expectedDecision}
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-700 dark:text-neutral-300 font-sans">
                    {scen.harmfulCase.description}
                  </p>
                  {res && (
                    <div className="text-[11px] pt-1 text-rose-900 dark:text-rose-200 flex items-center justify-between">
                      <span>Result: <strong>{res.harmfulStatus}</strong></span>
                      <span>{res.harmfulPassed ? '✓ Blocked / Safeguarded' : '✗ Failed'}</span>
                    </div>
                  )}
                </div>

                {/* Control Case */}
                <div className="p-3 rounded-lg bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/60 space-y-1.5">
                  <div className="flex items-center justify-between text-emerald-800 dark:text-emerald-300 font-semibold font-sans">
                    <span className="flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                      2. Legitimate Control
                    </span>
                    <span className="text-[10px] font-mono uppercase">
                      Expected: {scen.controlCase.expectedDecision}
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-700 dark:text-neutral-300 font-sans">
                    {scen.controlCase.description}
                  </p>
                  {res && (
                    <div className="text-[11px] pt-1 text-emerald-900 dark:text-emerald-200 flex items-center justify-between">
                      <span>Result: <strong>{res.controlStatus}</strong></span>
                      <span>{res.controlPassed ? '✓ Executed & Reconciled' : '✗ Failed'}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
