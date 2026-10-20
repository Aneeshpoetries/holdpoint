import React, { useState } from 'react';
import { useHoldpoint } from '../engine/store';
import {
  Users,
  SplitSquareVertical,
  Send,
  CheckCircle,
  ShieldAlert,
  Clock,
  ArrowRight,
  ExternalLink
} from 'lucide-react';

export const MultiUserView: React.FC = () => {
  const {
    actionsList,
    pendingApprovals,
    sendAgentTask,
    approveAction,
    rejectApproval,
    setActiveScreen
  } = useHoldpoint();

  const [leftEmployee, setLeftEmployee] = useState<'priya' | 'neha'>('priya');
  const [taskPrompt, setTaskPrompt] = useState('');

  const handleProposeFromLeft = async (prompt: string) => {
    await sendAgentTask(prompt);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto py-2">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200 dark:border-neutral-800">
        <div>
          <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
            Live Synchronous Co-Presence
          </div>
          <h1 className="text-xl font-bold tracking-tight text-neutral-950 dark:text-white mt-1">
            Enterprise Multi-User Live Split View
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Demonstrates shared in-memory state: actions initiated by Priya or Neha populate Arjun's (CISO) approval inbox live.
          </p>
        </div>
      </div>

      {/* Split Console Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Console: Proposing Actor (Priya or Neha) */}
        <div className="p-5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-200 dark:border-neutral-800">
            <div>
              <div className="text-[10px] uppercase font-semibold text-neutral-500">
                Console A · Proposer
              </div>
              <h2 className="text-base font-bold text-neutral-950 dark:text-white">
                {leftEmployee === 'priya' ? 'Priya Nair (Engineering Lead)' : 'Neha Roy (Finance Controller)'}
              </h2>
            </div>

            <div className="flex items-center gap-1 bg-neutral-100 dark:bg-neutral-800 p-1 rounded-lg text-xs">
              <button
                onClick={() => setLeftEmployee('priya')}
                className={`px-2.5 py-1 rounded font-medium transition-colors cursor-pointer ${
                  leftEmployee === 'priya'
                    ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-xs'
                    : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200'
                }`}
              >
                Priya
              </button>
              <button
                onClick={() => setLeftEmployee('neha')}
                className={`px-2.5 py-1 rounded font-medium transition-colors cursor-pointer ${
                  leftEmployee === 'neha'
                    ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-xs'
                    : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200'
                }`}
              >
                Neha
              </button>
            </div>
          </div>

          <p className="text-xs text-neutral-500">
            {leftEmployee === 'priya'
              ? 'Propose a production release deployment. Holdpoint policies require independent CISO dual sign-off.'
              : 'Propose a vendor disbursement. Disbursements exceeding $2,500 are held for dual-control authorization.'}
          </p>

          {/* Quick Action Dispatchers */}
          <div className="space-y-2">
            <span className="text-[11px] font-semibold text-neutral-600 dark:text-neutral-400">
              1-Click Propose Action:
            </span>
            {leftEmployee === 'priya' ? (
              <button
                onClick={() => handleProposeFromLeft('Deploy tag v2.5.0 to production cluster')}
                className="w-full p-2.5 text-xs text-left font-medium rounded-lg bg-neutral-50 dark:bg-neutral-800/70 hover:bg-neutral-100 dark:hover:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100 transition-colors cursor-pointer flex items-center justify-between"
              >
                <span>Propose: Deploy release v2.5.0 to production</span>
                <Send className="w-3.5 h-3.5 text-neutral-400" />
              </button>
            ) : (
              <button
                onClick={() => handleProposeFromLeft('Disburse $8,500 to Apex Infrastructure Ltd for quarterly hosting')}
                className="w-full p-2.5 text-xs text-left font-medium rounded-lg bg-neutral-50 dark:bg-neutral-800/70 hover:bg-neutral-100 dark:hover:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100 transition-colors cursor-pointer flex items-center justify-between"
              >
                <span>Propose: Disburse $8,500 to Apex Infrastructure Ltd</span>
                <Send className="w-3.5 h-3.5 text-neutral-400" />
              </button>
            )}
          </div>

          {/* Proposer's View of Recent Actions */}
          <div className="space-y-2 pt-2">
            <span className="text-[11px] font-semibold text-neutral-600 dark:text-neutral-400">
              Recent Actions Dispatched:
            </span>
            <div className="divide-y divide-neutral-200 dark:divide-neutral-800 text-xs">
              {actionsList.slice(0, 3).map((act) => (
                <div key={act.contract.actionId} className="py-2 flex items-center justify-between font-mono">
                  <div>
                    <span className="text-neutral-900 dark:text-neutral-100 font-sans font-medium">
                      {act.contract.actionType}
                    </span>
                    <span className="text-neutral-400 text-[10px] block">
                      {act.contract.actionId} · {act.contract.destination}
                    </span>
                  </div>
                  <span className="text-[10px] uppercase font-bold text-neutral-600 dark:text-neutral-300">
                    {act.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Console: Reviewer & Gatekeeper (Arjun Sen, CISO) */}
        <div className="p-5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-200 dark:border-neutral-800">
            <div>
              <div className="text-[10px] uppercase font-semibold text-neutral-500">
                Console B · Independent Approver
              </div>
              <h2 className="text-base font-bold text-neutral-950 dark:text-white">
                Arjun Sen (CISO)
              </h2>
            </div>
            <span className="px-2 py-0.5 rounded bg-sky-100 dark:bg-sky-950 text-sky-800 dark:text-sky-300 text-xs font-semibold font-mono">
              Dual Control Active
            </span>
          </div>

          <p className="text-xs text-neutral-500">
            Arjun receives bounded cryptographic approval tokens created when Console A proposes consequential actions.
          </p>

          {/* Pending Approvals in Arjun's Queue */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-neutral-600 dark:text-neutral-400">
                Arjun's Live Approval Queue ({pendingApprovals.length}):
              </span>
              <button
                onClick={() => setActiveScreen('approvals')}
                className="text-xs text-neutral-500 hover:text-neutral-900 dark:hover:text-white flex items-center gap-1 cursor-pointer"
              >
                <span>Full Inbox</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>

            {pendingApprovals.length === 0 ? (
              <div className="p-6 text-center rounded-lg bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-800 text-xs text-neutral-500 dark:text-neutral-400">
                Arjun's queue is empty. Propose an action from Console A to see it appear here immediately!
              </div>
            ) : (
              pendingApprovals.map((appr) => {
                const act = actionsList.find(a => a.contract.actionId === appr.actionId);
                return (
                  <div
                    key={appr.approvalId}
                    className="p-3.5 rounded-lg bg-neutral-50 dark:bg-neutral-800/70 border border-neutral-200 dark:border-neutral-800 space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between font-mono">
                      <span className="font-bold text-neutral-900 dark:text-neutral-100">
                        {act?.contract.actionType}
                      </span>
                      <span className="text-[10px] text-amber-600 dark:text-amber-400">
                        Token #{appr.approvalId}
                      </span>
                    </div>

                    <div className="text-[11px] text-neutral-600 dark:text-neutral-400">
                      Proposer: <strong>{act?.contract.actorId}</strong> · Destination: <strong>{act?.contract.destination}</strong>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <button
                        onClick={() => rejectApproval(appr.approvalId)}
                        className="px-2.5 py-1 text-xs text-neutral-500 hover:text-rose-600 transition-colors cursor-pointer"
                      >
                        Reject
                      </button>

                      <button
                        onClick={() => approveAction(appr.approvalId, 'Arjun Sen')}
                        className="px-3 py-1 bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 text-xs font-semibold rounded hover:bg-neutral-800 transition-colors cursor-pointer flex items-center gap-1"
                      >
                        <CheckCircle className="w-3 h-3" />
                        <span>Arjun Approves</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
