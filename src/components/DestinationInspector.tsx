import React, { useState } from 'react';
import { useHoldpoint } from '../engine/store';
import {
  Image,
  Server,
  GitBranch,
  DollarSign,
  Mail,
  UserCheck,
  ShieldCheck,
  ShieldAlert,
  Database,
  CheckCircle2
} from 'lucide-react';
import { DestinationId } from '../engine/types';

export const DestinationInspector: React.FC = () => {
  const { destinations } = useHoldpoint();
  const [activeTab, setActiveTab] = useState<DestinationId>('photo_vault');

  const tabs: { id: DestinationId; label: string; icon: any }[] = [
    { id: 'photo_vault', label: 'Photo Vault', icon: Image },
    { id: 'cloud_infra', label: 'Cloud Infrastructure', icon: Server },
    { id: 'code_repo', label: 'Code Repository', icon: GitBranch },
    { id: 'bank_payments', label: 'Treasury & Bank', icon: DollarSign },
    { id: 'email_crm', label: 'Email & CRM', icon: Mail },
    { id: 'user_identity', label: 'Identity & Security', icon: UserCheck },
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto py-2">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200 dark:border-neutral-800">
        <div>
          <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
            Deterministic State Inspector
          </div>
          <h1 className="text-xl font-bold tracking-tight text-neutral-950 dark:text-white mt-1">
            Destination Systems Real State
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Inspect the underlying state of all 6 mock services to verify whether actions mutated destination state or were prevented
          </p>
        </div>
      </div>

      {/* Destination Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto p-1 bg-neutral-100 dark:bg-neutral-850 rounded-xl border border-neutral-200 dark:border-neutral-800">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isSelected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap flex items-center gap-2 ${
                isSelected
                  ? 'bg-white dark:bg-neutral-700 text-neutral-950 dark:text-white shadow-xs'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: Photo Vault */}
      {activeTab === 'photo_vault' && (
        <div className="p-5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-neutral-950 dark:text-white">
                Aisha's Photo Vault Service State
              </h2>
              <p className="text-xs text-neutral-500">
                14,000 photos stored · Originals marked protected · Duplicates marked prune-eligible
              </p>
            </div>
            <div className="text-xs font-mono text-neutral-500">
              Active Photos: {destinations.photos.filter(p => !p.deleted).length} / {destinations.photos.length}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-neutral-200 dark:border-neutral-800 text-[11px] text-neutral-500 uppercase">
                  <th className="py-2 px-3">Photo ID</th>
                  <th className="py-2 px-3">Filename</th>
                  <th className="py-2 px-3">Album</th>
                  <th className="py-2 px-3">Duplicate?</th>
                  <th className="py-2 px-3">Original Protected?</th>
                  <th className="py-2 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-850">
                {destinations.photos.slice(0, 10).map((photo) => (
                  <tr key={photo.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-850/50">
                    <td className="py-2 px-3 text-neutral-400">{photo.id}</td>
                    <td className="py-2 px-3 font-medium text-neutral-900 dark:text-neutral-100 font-sans">
                      {photo.name}
                    </td>
                    <td className="py-2 px-3 text-neutral-500">{photo.album}</td>
                    <td className="py-2 px-3">
                      {photo.isDuplicate ? (
                        <span className="text-amber-600 dark:text-amber-400 font-semibold">Yes (Duplicate)</span>
                      ) : (
                        <span className="text-neutral-400">No</span>
                      )}
                    </td>
                    <td className="py-2 px-3">
                      {photo.isOriginalProtected ? (
                        <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                          <ShieldCheck className="w-3.5 h-3.5" /> Locked
                        </span>
                      ) : (
                        <span className="text-neutral-400">Unlocked</span>
                      )}
                    </td>
                    <td className="py-2 px-3">
                      {photo.deleted ? (
                        <span className="text-rose-600 dark:text-rose-400">PRUNED (Deleted)</span>
                      ) : (
                        <span className="text-emerald-600 dark:text-emerald-400">ACTIVE IN VAULT</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: Cloud Infrastructure */}
      {activeTab === 'cloud_infra' && (
        <div className="p-5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-neutral-950 dark:text-white">
                Platform Cloud Resources (Karan Mehta Custody)
              </h2>
              <p className="text-xs text-neutral-500">
                Managed RDS Aurora PostgreSQL cluster, IAM keys, and S3 evidence vaults
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {destinations.cloudResources.map((res) => (
              <div
                key={res.id}
                className="p-4 rounded-lg bg-neutral-50 dark:bg-neutral-800/70 border border-neutral-200 dark:border-neutral-800 space-y-2 text-xs font-mono"
              >
                <div className="flex items-center justify-between font-sans">
                  <div className="flex items-center gap-2">
                    <Server className="w-4 h-4 text-indigo-500" />
                    <span className="font-bold text-neutral-900 dark:text-neutral-100">{res.name}</span>
                    <span className="text-neutral-400">({res.id})</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-neutral-200 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 font-semibold uppercase text-[10px]">
                      Status: {res.status}
                    </span>
                    <span className="text-neutral-500">v{res.version}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] text-neutral-600 dark:text-neutral-400 pt-1">
                  <div>Type: {res.type} · Env: {res.environment}</div>
                  <div>Deletion Protection: {res.deletionProtected ? 'ENABLED' : 'DISABLED'}</div>
                  <div className="truncate">Key Fingerprint: {res.activeKeyFingerprint}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: Code Repository */}
      {activeTab === 'code_repo' && (
        <div className="p-5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-neutral-950 dark:text-white">
                {destinations.repo.repoName} (Priya Nair Custody)
              </h2>
              <p className="text-xs text-neutral-500">
                Default Branch: {destinations.repo.defaultBranch} · Production Release Tag:{' '}
                <strong>{destinations.repo.productionReleaseVersion}</strong>
              </p>
            </div>
          </div>

          <div className="space-y-2 text-xs">
            <span className="font-semibold text-neutral-600 dark:text-neutral-400">Production Commit Ledger:</span>
            <div className="divide-y divide-neutral-200 dark:divide-neutral-800 font-mono">
              {destinations.repo.commits.map((c) => (
                <div key={c.id} className="py-2 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-neutral-400">{c.id}</span>
                    <span className="text-neutral-900 dark:text-neutral-100 font-sans">{c.message}</span>
                  </div>
                  <div className="text-neutral-400 text-[11px]">
                    {c.author} · {new Date(c.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Bank & Treasury Payments */}
      {activeTab === 'bank_payments' && (
        <div className="p-5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-neutral-950 dark:text-white">
                Treasury Settlement & Bank Ledger (Neha Roy)
              </h2>
              <p className="text-xs text-neutral-500">
                Current Vault Balance: <strong>${destinations.bankBalance.toLocaleString()}</strong> · Today's Spend:{' '}
                <strong>${destinations.dailyBudgetUsed.toLocaleString()}</strong> / ${destinations.dailyBudgetCap.toLocaleString()}
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-neutral-200 dark:border-neutral-800 text-[11px] text-neutral-500 uppercase">
                  <th className="py-2 px-3">TX ID</th>
                  <th className="py-2 px-3">Recipient</th>
                  <th className="py-2 px-3">Account</th>
                  <th className="py-2 px-3">Amount</th>
                  <th className="py-2 px-3">Status</th>
                  <th className="py-2 px-3">Idempotency Key</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-850">
                {destinations.payments.map((tx) => (
                  <tr key={tx.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-850/50">
                    <td className="py-2 px-3 text-neutral-400">{tx.id}</td>
                    <td className="py-2 px-3 font-medium text-neutral-900 dark:text-neutral-100 font-sans">
                      {tx.recipient}
                    </td>
                    <td className="py-2 px-3 text-neutral-500">{tx.recipientAccount}</td>
                    <td className="py-2 px-3 font-semibold text-neutral-900 dark:text-neutral-100">
                      ${tx.amount.toLocaleString()} {tx.currency}
                    </td>
                    <td className="py-2 px-3">
                      <span className="text-emerald-600 dark:text-emerald-400 uppercase font-semibold text-[10px]">
                        {tx.status}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-neutral-400 text-[11px] truncate max-w-[120px]">
                      {tx.idempotencyKey}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: Email & CRM */}
      {activeTab === 'email_crm' && (
        <div className="p-5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-neutral-950 dark:text-white">
                Customer Records & Refund Ledger (Sana & Vikram)
              </h2>
              <p className="text-xs text-neutral-500">
                Outbound emails dispatched and customer refund ledger
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {Object.values(destinations.customers).map((cust) => (
              <div key={cust.customerId} className="p-3.5 rounded bg-neutral-50 dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-800 text-xs font-mono space-y-1">
                <div className="flex items-center justify-between font-sans">
                  <span className="font-bold text-neutral-900 dark:text-neutral-100">{cust.name}</span>
                  <span className="text-neutral-500">Tier: {cust.tier}</span>
                </div>
                <div className="text-neutral-500">Email: {cust.email} · Refund YTD: ${cust.refundTotalYtd}</div>
                <div className="text-neutral-500">Outbound Sent: {cust.sentEmails.length} messages</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: User Identity & Security */}
      {activeTab === 'user_identity' && (
        <div className="p-5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-neutral-950 dark:text-white">
                User Security & Anti-Scam Lock (Dev Sharma)
              </h2>
              <p className="text-xs text-neutral-500">
                Account recovery locks, trusted emergency contacts, and active session limits
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {Object.values(destinations.userSecurity).map((user) => (
              <div key={user.userId} className="p-4 rounded-lg bg-neutral-50 dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-800 text-xs font-mono space-y-2">
                <div className="flex items-center justify-between font-sans">
                  <span className="font-bold text-neutral-900 dark:text-neutral-100">{user.name}</span>
                  {user.recoveryLocked ? (
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" /> RECOVERY LOCKED (Protected from Scams)
                    </span>
                  ) : (
                    <span className="text-amber-500 font-semibold">Standard Recovery</span>
                  )}
                </div>
                <div className="text-neutral-600 dark:text-neutral-400">
                  Primary Email: {user.primaryEmail} · Recovery Email: {user.recoveryEmail}
                </div>
                <div className="text-neutral-600 dark:text-neutral-400">
                  Recovery Phone: {user.recoveryPhone} · Trusted Contact: {user.trustedContacts.join(', ')}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
