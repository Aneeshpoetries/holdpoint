import React, { useState, useEffect, useMemo } from 'react';
import { useHoldpoint } from '../engine/store';
import {
  Clock,
  ShieldCheck,
  AlertTriangle,
  CheckCircle,
  Lock,
  UserCheck,
  ShieldAlert,
  FastForward,
  RotateCcw,
  PlusCircle,
  Flame,
  Filter,
  ArrowUpDown,
  Sliders,
  ChevronDown,
  ChevronUp,
  Hash,
  Shield,
  X,
  RefreshCw
} from 'lucide-react';

export const ApprovalInbox: React.FC = () => {
  const {
    pendingApprovals,
    actionsList,
    currentPersona,
    approveAction,
    rejectApproval,
    expireApproval,
    adjustApprovalTTL,
    seedTestStagedAction,
    setActiveScreen
  } = useHoldpoint();

  // Live ticking clock for accurate second-by-second countdown
  const [currentTime, setCurrentTime] = useState<number>(Date.now());
  const [tamperRecipient, setTamperRecipient] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<{
    type: 'success' | 'error' | 'warning';
    text: string;
  } | null>(null);
  const [filterMode, setFilterMode] = useState<'all' | 'approaching' | 'critical'>('all');
  const [sortBy, setSortBy] = useState<'ttl' | 'amount' | 'newest'>('ttl');
  const [showSimControls, setShowSimControls] = useState(false);
  const [expandedDetails, setExpandedDetails] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Compute status metrics for all pending approvals
  const enrichedApprovals = useMemo(() => {
    return pendingApprovals.map((approval) => {
      const remainingMs = Math.max(0, approval.expiresAt - currentTime);
      const remainingSec = Math.ceil(remainingMs / 1000);
      const totalWindowSec = 300; // 5 min standard baseline
      const percentRemaining = Math.max(0, Math.min(100, (remainingSec / totalWindowSec) * 100));

      const isExpired = remainingSec <= 0 || approval.status === 'expired';
      const isCritical = !isExpired && remainingSec <= 45; // Critical threshold: <= 45s
      const isWarning = !isExpired && remainingSec <= 120 && remainingSec > 45; // Warning threshold: <= 2m
      const isSafe = !isExpired && remainingSec > 120;

      const action = actionsList.find((a) => a.contract.actionId === approval.actionId);

      return {
        ...approval,
        remainingMs,
        remainingSec,
        percentRemaining,
        isExpired,
        isCritical,
        isWarning,
        isSafe,
        action
      };
    });
  }, [pendingApprovals, currentTime, actionsList]);

  // Handle automatic expiration synchronization when items reach 0
  useEffect(() => {
    enrichedApprovals.forEach((appr) => {
      if (appr.remainingSec <= 0 && appr.status === 'pending') {
        expireApproval(appr.approvalId);
      }
    });
  }, [enrichedApprovals, expireApproval]);

  // Aggregate alert counts
  const criticalCount = enrichedApprovals.filter((a) => a.isCritical).length;
  const warningCount = enrichedApprovals.filter((a) => a.isWarning).length;
  const approachingCount = criticalCount + warningCount;

  // Filter and sort items
  const displayApprovals = useMemo(() => {
    let list = [...enrichedApprovals];

    if (filterMode === 'critical') {
      list = list.filter((a) => a.isCritical);
    } else if (filterMode === 'approaching') {
      list = list.filter((a) => a.isCritical || a.isWarning);
    }

    list.sort((a, b) => {
      if (sortBy === 'ttl') {
        // Active critical items first, then by ascending remaining seconds
        if (a.isExpired !== b.isExpired) return a.isExpired ? 1 : -1;
        return a.remainingSec - b.remainingSec;
      }
      if (sortBy === 'amount') {
        const amtA = a.action?.contract.financialAmount || 0;
        const amtB = b.action?.contract.financialAmount || 0;
        return amtB - amtA;
      }
      if (sortBy === 'newest') {
        const timeA = a.action?.contract.createdAt || 0;
        const timeB = b.action?.contract.createdAt || 0;
        return timeB - timeA;
      }
      return 0;
    });

    return list;
  }, [enrichedApprovals, filterMode, sortBy]);

  const toggleDetails = (approvalId: string) => {
    setExpandedDetails((prev) => ({
      ...prev,
      [approvalId]: !prev[approvalId]
    }));
  };

  const handleApprove = (approvalId: string, actionId: string) => {
    setFeedbackMessage(null);
    const action = actionsList.find((a) => a.contract.actionId === actionId);
    let candidateParams: Record<string, any> | undefined = undefined;

    if (tamperRecipient && action) {
      candidateParams = {
        ...action.contract.canonicalParameters,
        recipient: 'Attacker Malicious Offshore Account',
        recipientAccount: 'ROBBERY-888-EXPLOIT'
      };
    }

    const res = approveAction(approvalId, currentPersona.name, candidateParams);
    if (!res.success) {
      setFeedbackMessage({ type: 'error', text: res.error || 'Approval rejected by governance policy.' });
    } else {
      setFeedbackMessage({
        type: 'success',
        text: `Action #${actionId} authorized and cryptographically dispatched to destination.`
      });
    }
  };

  const handleReject = (approvalId: string) => {
    setFeedbackMessage(null);
    rejectApproval(approvalId);
    setFeedbackMessage({
      type: 'warning',
      text: `Approval #${approvalId} rejected. Action denied and logged to immutable ledger.`
    });
  };

  const handleExpireManual = (approvalId: string) => {
    setFeedbackMessage(null);
    expireApproval(approvalId);
    setFeedbackMessage({
      type: 'warning',
      text: `Approval #${approvalId} forcibly expired. Action marked stale and prevented from execution.`
    });
  };

  const handleSimulateTTL = (seconds: number) => {
    const target = displayApprovals[0]?.approvalId || pendingApprovals[0]?.approvalId;
    if (target) {
      adjustApprovalTTL(target, seconds);
      setFeedbackMessage({
        type: 'warning',
        text: `TTL updated to ${seconds}s on Token #${target}. Observing countdown and threshold alerts.`
      });
    }
  };

  // Helper to format remaining time MM:SS
  const formatTTL = (sec: number) => {
    if (sec <= 0) return '00:00';
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const formatActionTitle = (actionType: string) => {
    switch (actionType) {
      case 'wire_transfer':
        return 'Treasury Wire Transfer';
      case 'cluster_redeploy':
        return 'Production Cluster Redeployment';
      case 'password_reset_override':
        return 'Account Recovery Override';
      case 'bulk_photo_delete':
        return 'Bulk Archive Deletion';
      default:
        return actionType
          .split('_')
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(' ');
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 py-2 px-1">
      {/* 1. CLEAN EDITORIAL HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200 dark:border-neutral-800">
        <div>
          <div className="flex items-center gap-2 text-xs text-neutral-500 font-medium">
            <span>Dual-Control Governance</span>
            <span aria-hidden="true">·</span>
            <span>Cryptographic Bounds</span>
            <span aria-hidden="true">·</span>
            <span className="flex items-center gap-1 text-neutral-700 dark:text-neutral-300">
              <Clock className="w-3.5 h-3.5 text-neutral-400" /> 5-Min TTL Invariant
            </span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-neutral-950 dark:text-white mt-1">
            Pending Approvals
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Deterministic holdpoint queue. Actions require dual sign-off before expiring out of safety bounds.
          </p>
        </div>

        {/* Current Reviewer Stamp & QA Trigger */}
        <div className="flex items-center gap-3">
          <div className="px-3 py-2 rounded-lg bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 flex items-center gap-2 text-xs">
            <UserCheck className="w-4 h-4 text-emerald-500 shrink-0" />
            <div className="leading-tight">
              <span className="text-[10px] text-neutral-500 dark:text-neutral-400 block">Reviewer</span>
              <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                {currentPersona.name} ({currentPersona.title})
              </span>
            </div>
          </div>

          <button
            onClick={() => setShowSimControls(!showSimControls)}
            className={`p-2 rounded-lg border text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
              showSimControls || tamperRecipient
                ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 border-neutral-900 dark:border-white shadow-sm'
                : 'bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 border-neutral-200 dark:border-neutral-800 hover:text-neutral-900 dark:hover:text-white'
            }`}
            title="Toggle QA & TTL Simulation station"
          >
            <Sliders className="w-4 h-4" />
            <span className="hidden sm:inline">QA Tools</span>
            {tamperRecipient && (
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            )}
          </button>
        </div>
      </div>

      {/* 2. DISMISSABLE TOAST / FEEDBACK MESSAGE */}
      {feedbackMessage && (
        <div
          className={`p-3 rounded-lg text-xs font-medium flex items-center justify-between gap-3 transition-all ${
            feedbackMessage.type === 'error'
              ? 'bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-200'
              : feedbackMessage.type === 'warning'
              ? 'bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-amber-800 dark:text-amber-200'
              : 'bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-emerald-800 dark:text-emerald-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedbackMessage.type === 'error' ? (
              <ShieldAlert className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
            ) : feedbackMessage.type === 'warning' ? (
              <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400" />
            ) : (
              <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
            )}
            <span>{feedbackMessage.text}</span>
          </div>
          <button
            onClick={() => setFeedbackMessage(null)}
            className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 p-0.5 cursor-pointer"
            aria-label="Close notification"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 3. COLLAPSIBLE QA & SIMULATION DRAWER (Keeps UI uncluttered unless needed) */}
      {showSimControls && (
        <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700/80 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-neutral-200 dark:border-neutral-700/80">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-neutral-500" />
              <span className="text-xs font-semibold text-neutral-900 dark:text-neutral-100">
                Testing Station: TTL Thresholds & Adversarial Invariants
              </span>
            </div>
            <span className="text-[11px] text-neutral-500">
              Fast-forward live timers without waiting 5 minutes
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
            {/* Countdown Speed Controls */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider block">
                Simulate TTL Expiration
              </span>
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  onClick={() => handleSimulateTTL(30)}
                  disabled={displayApprovals.length === 0}
                  className="px-2.5 py-1 text-xs rounded font-medium bg-rose-100 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-300 hover:bg-rose-200 dark:hover:bg-rose-900/80 transition-colors cursor-pointer flex items-center gap-1 disabled:opacity-40"
                  title="Set top item TTL to 30s to trigger Critical alert state"
                >
                  <Flame className="w-3 h-3 text-rose-600" />
                  <span>Critical (30s)</span>
                </button>
                <button
                  onClick={() => handleSimulateTTL(90)}
                  disabled={displayApprovals.length === 0}
                  className="px-2.5 py-1 text-xs rounded font-medium bg-amber-100 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-900 text-amber-800 dark:text-amber-300 hover:bg-amber-200 dark:hover:bg-amber-900/80 transition-colors cursor-pointer flex items-center gap-1 disabled:opacity-40"
                  title="Set top item TTL to 90s to trigger Warning alert state"
                >
                  <FastForward className="w-3 h-3 text-amber-600" />
                  <span>Warning (90s)</span>
                </button>
                <button
                  onClick={() => handleSimulateTTL(300)}
                  disabled={displayApprovals.length === 0}
                  className="px-2.5 py-1 text-xs rounded font-medium bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 transition-colors cursor-pointer flex items-center gap-1 disabled:opacity-40"
                  title="Reset TTL back to 5 minutes"
                >
                  <RotateCcw className="w-3 h-3 text-neutral-400" />
                  <span>Reset (5m)</span>
                </button>
              </div>
            </div>

            {/* Quick Staging Controls */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider block">
                Stage Sample Actions
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => seedTestStagedAction('finance')}
                  className="px-2.5 py-1 text-xs rounded font-semibold bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors cursor-pointer flex items-center gap-1"
                >
                  <PlusCircle className="w-3 h-3" />
                  <span>+ Wire ($18.5k)</span>
                </button>
                <button
                  onClick={() => seedTestStagedAction('deploy')}
                  className="px-2.5 py-1 text-xs rounded font-medium bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 transition-colors cursor-pointer"
                >
                  + Deploy Cluster
                </button>
              </div>
            </div>

            {/* Adversarial Tampering Switch */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider block">
                Adversarial Hash Attack Test
              </span>
              <button
                onClick={() => setTamperRecipient(!tamperRecipient)}
                className={`w-full px-2.5 py-1 text-xs rounded font-medium border text-left transition-colors cursor-pointer flex items-center justify-between gap-2 ${
                  tamperRecipient
                    ? 'bg-amber-600 text-white border-amber-600 font-semibold'
                    : 'bg-white dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100'
                }`}
              >
                <span>{tamperRecipient ? 'Tampering Active (Hash Mismatch)' : 'Simulate Parameter Tampering'}</span>
                <span
                  className={`w-2 h-2 rounded-full ${
                    tamperRecipient ? 'bg-white animate-ping' : 'bg-neutral-400'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. INTEGRATED FILTER & SORT COMMAND BAR (Clean, unboxed segmented control) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-2 bg-neutral-100/80 dark:bg-neutral-800/80 rounded-xl border border-neutral-200 dark:border-neutral-700/80 text-xs">
        {/* Segmented Filter Control */}
        <div className="flex items-center gap-1 p-0.5 bg-neutral-200/60 dark:bg-neutral-900 rounded-lg">
          <button
            onClick={() => setFilterMode('all')}
            className={`px-3 py-1.5 rounded-md font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
              filterMode === 'all'
                ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-xs font-semibold'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <span>All Approvals</span>
            <span className="text-[11px] opacity-75 font-mono">({enrichedApprovals.length})</span>
          </button>

          <button
            onClick={() => setFilterMode('approaching')}
            className={`px-3 py-1.5 rounded-md font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
              filterMode === 'approaching'
                ? 'bg-amber-500 text-white shadow-xs font-semibold'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            {warningCount > 0 && (
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            )}
            <span>Expiring Soon</span>
            <span className="text-[11px] opacity-80 font-mono">({approachingCount})</span>
          </button>

          <button
            onClick={() => setFilterMode('critical')}
            className={`px-3 py-1.5 rounded-md font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
              filterMode === 'critical'
                ? 'bg-rose-600 text-white shadow-xs font-semibold'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            {criticalCount > 0 && (
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
            )}
            <span>Critical (&lt;45s)</span>
            <span className="text-[11px] opacity-80 font-mono">({criticalCount})</span>
          </button>
        </div>

        {/* Dynamic Contextual Alert Line or Empty Status */}
        <div className="flex items-center gap-3 self-end sm:self-center">
          {criticalCount > 0 ? (
            <div className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400 font-medium">
              <Clock className="w-3.5 h-3.5 animate-spin" />
              <span>
                {criticalCount} {criticalCount === 1 ? 'action' : 'actions'} nearing auto-lock
              </span>
            </div>
          ) : warningCount > 0 ? (
            <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-medium">
              <Clock className="w-3.5 h-3.5" />
              <span>
                {warningCount} {warningCount === 1 ? 'token' : 'tokens'} within 2-min window
              </span>
            </div>
          ) : null}

          {/* Sort Menu */}
          <div className="flex items-center gap-1.5 text-neutral-500">
            <ArrowUpDown className="w-3.5 h-3.5 shrink-0" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="py-1 px-2 rounded-md bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100 text-xs font-medium focus:outline-hidden cursor-pointer"
            >
              <option value="ttl">Sort: Soonest Expiration</option>
              <option value="amount">Sort: Financial Amount</option>
              <option value="newest">Sort: Newest First</option>
            </select>
          </div>
        </div>
      </div>

      {/* 5. APPROVAL CARDS LIST */}
      {displayApprovals.length === 0 ? (
        <div className="p-12 text-center rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-3">
          <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
              {pendingApprovals.length === 0
                ? 'Approval Queue Clear'
                : 'No approvals match active filter'}
            </h2>
            <p className="text-xs text-neutral-500 max-w-sm mx-auto mt-1">
              {pendingApprovals.length === 0
                ? 'High-consequence actions requiring dual-control authority will queue here with deterministic time-to-live countdowns.'
                : 'Try switching the filter back to "All Approvals" or stage a sample action.'}
            </p>
          </div>

          <div className="flex items-center justify-center gap-2 pt-2">
            <button
              onClick={() => seedTestStagedAction('finance')}
              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-neutral-900 dark:bg-neutral-100 dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-200 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Stage Sample Wire ($18.5k)</span>
            </button>
            <button
              onClick={() => setActiveScreen('workspace')}
              className="px-3.5 py-1.5 text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors cursor-pointer"
            >
              Agent Workspace
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-3.5">
          {displayApprovals.map((appr) => {
            const { action, isCritical, isWarning, isExpired, remainingSec, percentRemaining } = appr;
            if (!action) return null;

            const isProposerSameAsReviewer = action.contract.actorId.includes(currentPersona.id);
            const isExpanded = !!expandedDetails[appr.approvalId];

            return (
              <div
                key={appr.approvalId}
                className={`rounded-xl border transition-all ${
                  isExpired
                    ? 'border-neutral-200 dark:border-neutral-800 bg-neutral-50/60 dark:bg-neutral-900/40 opacity-75'
                    : isCritical
                    ? 'border-rose-400 dark:border-rose-700 bg-rose-50/20 dark:bg-rose-950/20 shadow-xs'
                    : isWarning
                    ? 'border-amber-300 dark:border-amber-700/80 bg-white dark:bg-neutral-900 shadow-xs'
                    : 'border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs'
                }`}
              >
                {/* CARD MAIN SECTION */}
                <div className="p-4 sm:p-5 space-y-4">
                  {/* Top Bar: Title, Financial Amount, & Live Countdown Widget */}
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="text-sm sm:text-base font-bold text-neutral-950 dark:text-white">
                          {formatActionTitle(action.contract.actionType)}
                        </h2>
                        {action.contract.financialAmount && (
                          <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                            ${action.contract.financialAmount.toLocaleString()} USD
                          </span>
                        )}
                      </div>

                      {/* Clean metadata without pill clutter */}
                      <div className="flex items-center gap-2 text-xs text-neutral-500 font-mono">
                        <span>Token #{appr.approvalId}</span>
                        <span aria-hidden="true">·</span>
                        <span>Destination: {action.contract.destination}</span>
                        <span aria-hidden="true">·</span>
                        <span>Policy: {appr.policyVersion}</span>
                      </div>
                    </div>

                    {/* TTL COUNTDOWN PILL & PROGRESS GAUGE */}
                    <div className="flex flex-col items-start sm:items-end gap-1.5 shrink-0">
                      <div
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-mono text-xs font-bold border transition-all ${
                          isExpired
                            ? 'bg-neutral-100 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700 text-neutral-500'
                            : isCritical
                            ? 'bg-rose-600 text-white border-rose-600 shadow-xs animate-pulse'
                            : isWarning
                            ? 'bg-amber-100 dark:bg-amber-950/60 border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200'
                            : 'bg-neutral-100 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 text-neutral-800 dark:text-neutral-200'
                        }`}
                      >
                        <Clock
                          className={`w-3.5 h-3.5 ${
                            isExpired
                              ? 'text-neutral-400'
                              : isCritical
                              ? 'text-white'
                              : isWarning
                              ? 'text-amber-600 dark:text-amber-400'
                              : 'text-emerald-600 dark:text-emerald-400'
                          }`}
                        />
                        <span className="tabular-nums">TTL: {formatTTL(remainingSec)}</span>
                        <span className="text-[10px] font-normal uppercase tracking-wider opacity-85">
                          {isExpired
                            ? 'Expired'
                            : isCritical
                            ? 'Critical'
                            : isWarning
                            ? 'Expiring Soon'
                            : 'Healthy'}
                        </span>
                      </div>

                      {/* Micro Progress Bar */}
                      <div className="w-full sm:w-36 bg-neutral-200 dark:bg-neutral-800 h-1 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-1000 ${
                            isExpired
                              ? 'bg-neutral-400 w-0'
                              : isCritical
                              ? 'bg-rose-500'
                              : isWarning
                              ? 'bg-amber-500'
                              : 'bg-emerald-500'
                          }`}
                          style={{ width: `${percentRemaining}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Structured Core Parameters (Clean 3-column data grid) */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 rounded-lg bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700/80 text-xs">
                    <div>
                      <span className="text-[10px] uppercase font-semibold text-neutral-400 block tracking-wider">
                        Proposing Actor
                      </span>
                      <span className="font-medium text-neutral-900 dark:text-neutral-100 mt-0.5 block">
                        {action.contract.actorId}
                      </span>
                      <span className="text-[11px] text-neutral-500">
                        Role: {action.contract.actorRole}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] uppercase font-semibold text-neutral-400 block tracking-wider">
                        Target & Parameters
                      </span>
                      <span className="font-medium text-neutral-900 dark:text-neutral-100 mt-0.5 block truncate">
                        {action.contract.canonicalParameters.recipient ||
                          action.contract.resourceId ||
                          'Configured Target'}
                      </span>
                      <span className="text-[11px] text-neutral-500">
                        Resource: {appr.boundResourceId} (v{appr.boundResourceVersion})
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] uppercase font-semibold text-neutral-400 block tracking-wider">
                        Risk & Invariants
                      </span>
                      <span className="font-medium text-neutral-900 dark:text-neutral-100 mt-0.5 block uppercase">
                        {action.contract.impact} Impact · {action.contract.reversibility}
                      </span>
                      <span className="text-[11px] text-neutral-500 truncate block">
                        Dual control required
                      </span>
                    </div>
                  </div>

                  {/* Inline Alert Banners (Only when critical, warning, expired, or self-approval) */}
                  {isCritical && (
                    <div className="p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-800 dark:text-rose-200 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Flame className="w-4 h-4 text-rose-600 shrink-0" />
                        <span>
                          <strong>Imminent Expiration Warning:</strong> Authorization required within{' '}
                          <span className="font-mono font-bold">{remainingSec}s</span> before deterministic lockout.
                        </span>
                      </div>
                      <span className="text-[10px] font-mono uppercase text-rose-700 dark:text-rose-300">
                        &lt; 45s threshold
                      </span>
                    </div>
                  )}

                  {isExpired && (
                    <div className="p-2.5 rounded-lg bg-neutral-200/70 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 text-xs text-neutral-700 dark:text-neutral-300 flex items-center gap-2">
                      <Lock className="w-4 h-4 text-neutral-500 shrink-0" />
                      <span>
                        <strong>Token Expired:</strong> TTL window elapsed. Deterministic control plane has locked this token to prevent stale execution.
                      </span>
                    </div>
                  )}

                  {isProposerSameAsReviewer && !isExpired && (
                    <div className="p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-xs text-amber-800 dark:text-amber-200 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>
                        <strong>Self-Approval Lockout:</strong> You proposed this action as{' '}
                        <code>{action.contract.actorId}</code>. Dual-control policy mandates authorization by an independent reviewer (Arjun or CISO).
                      </span>
                    </div>
                  )}

                  {/* Expandable Cryptographic Bounds & Hash */}
                  <div>
                    <button
                      onClick={() => toggleDetails(appr.approvalId)}
                      className="text-[11px] font-medium text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 cursor-pointer flex items-center gap-1"
                    >
                      {isExpanded ? (
                        <>
                          <ChevronUp className="w-3.5 h-3.5" />
                          <span>Hide Cryptographic Bounds & Hash</span>
                        </>
                      ) : (
                        <>
                          <ChevronDown className="w-3.5 h-3.5" />
                          <span>View Cryptographic Proof (SHA-256 Hash, Nonce, Target Policy)</span>
                        </>
                      )}
                    </button>

                    {isExpanded && (
                      <div className="mt-2 p-3 rounded-lg bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 font-mono text-[11px] text-neutral-700 dark:text-neutral-300 space-y-1">
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-neutral-500 dark:text-neutral-400">Canonical Parameters Hash:</span>
                          <span className="truncate" title={appr.boundCanonicalHash}>
                            {appr.boundCanonicalHash}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-neutral-500 dark:text-neutral-400">Deterministic Nonce:</span>
                          <span>{appr.nonce}</span>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-neutral-500 dark:text-neutral-400">Resource Invariant Bound:</span>
                          <span>
                            {appr.boundResourceId} (version {appr.boundResourceVersion})
                          </span>
                        </div>
                        {appr.boundMaxAmount && (
                          <div className="flex items-center justify-between gap-4">
                            <span className="text-neutral-500 dark:text-neutral-400">Ceiling Constraint:</span>
                            <span>${appr.boundMaxAmount.toLocaleString()} USD</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* CARD FOOTER: ACTIONS */}
                <div className="px-4 py-3 sm:px-5 bg-neutral-50/70 dark:bg-neutral-800/50 border-t border-neutral-200 dark:border-neutral-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 rounded-b-xl">
                  {/* Left: Rejection and Force-Expire */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleReject(appr.approvalId)}
                      className="px-3 py-1.5 text-xs font-medium text-neutral-600 dark:text-neutral-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-neutral-200/60 dark:hover:bg-neutral-800 rounded-md transition-colors cursor-pointer"
                    >
                      Reject Action
                    </button>

                    {!isExpired && (
                      <button
                        onClick={() => handleExpireManual(appr.approvalId)}
                        className="px-2 py-1.5 text-[11px] text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors cursor-pointer"
                        title="Force trigger expiration invariant"
                      >
                        Force Expire
                      </button>
                    )}
                  </div>

                  {/* Right: Authorize Button or Locked State */}
                  <div>
                    {isExpired ? (
                      <button
                        disabled
                        className="px-4 py-1.5 text-xs font-semibold text-neutral-400 dark:text-neutral-500 bg-neutral-200 dark:bg-neutral-800 rounded-lg cursor-not-allowed flex items-center gap-1.5"
                      >
                        <Lock className="w-3.5 h-3.5" />
                        <span>Locked (Token Expired)</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleApprove(appr.approvalId, action.contract.actionId)}
                        disabled={isProposerSameAsReviewer}
                        className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
                          isProposerSameAsReviewer
                            ? 'bg-neutral-200 dark:bg-neutral-800 text-neutral-400 cursor-not-allowed'
                            : isCritical
                            ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-xs font-bold cursor-pointer'
                            : isWarning
                            ? 'bg-amber-600 hover:bg-amber-700 text-white shadow-xs cursor-pointer'
                            : 'bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-100 shadow-xs cursor-pointer'
                        }`}
                        title={
                          isProposerSameAsReviewer
                            ? 'Cannot approve: Proposer and reviewer must be distinct actors.'
                            : undefined
                        }
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Authorize & Dispatch</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
