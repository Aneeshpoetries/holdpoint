import React from 'react';
import { useHoldpoint } from '../engine/store';
import { AlertTriangle, ShieldCheck, Radio, XCircle } from 'lucide-react';

export const CoverageView: React.FC = () => {
  const { routesList } = useHoldpoint();
  const enforcedCount = routesList.filter((route) => route.enforcementStatus === 'enforced').length;
  const gapCount = routesList.length - enforcedCount;
  const maxTraffic = Math.max(1, ...routesList.map((route) => route.trafficCount));

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'enforced':
        return (
          <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium text-xs">
            <ShieldCheck className="w-3.5 h-3.5" />
            Enforced & Mediated
          </span>
        );
      case 'observed':
        return (
          <span className="inline-flex items-center gap-1 text-amber-500 font-medium text-xs">
            <Radio className="w-3.5 h-3.5" />
            Observed (No Prevention)
          </span>
        );
      case 'unconnected':
        return (
          <span className="inline-flex items-center gap-1 text-rose-600 dark:text-rose-400 font-medium text-xs">
            <XCircle className="w-3.5 h-3.5" />
            Unconnected / Gap Identified
          </span>
        );
      default:
        return <span className="text-xs text-neutral-500 capitalize">{status}</span>;
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto py-2">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200 dark:border-neutral-800">
        <div>
          <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
            Coverage Honesty & Route Inventory
          </div>
          <h1 className="text-xl font-bold tracking-tight text-neutral-950 dark:text-white mt-1">
            System Route Inventory & Exposure Gaps
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Holdpoint distinguishes mediated routes from unmediated bypass paths. Observed routes never claim prevention.
          </p>
        </div>
      </div>

      <section className="cr-route-analytics" aria-label="Route analytics">
        <div className="cr-route-analytics-heading"><div><span className="cr-overline">ROUTE TOPOLOGY / LIVE INVENTORY</span><h2>Where the boundary holds.</h2><p>Traffic volume is observed calls, not proof of prevention. Gaps remain visible even at zero traffic.</p></div><div className="cr-route-totals"><strong>{enforcedCount}<small> mediated</small></strong><strong>{gapCount}<small> gaps</small></strong></div></div>
        <div className="cr-route-chart">{routesList.map((route) => <div className="cr-route-chart-row" key={route.id}><span title={route.name}>{route.name}</span><div className="cr-route-track" role="img" aria-label={`${route.name}: ${route.trafficCount} observed calls, ${route.enforcementStatus}`}><i className={route.enforcementStatus === 'enforced' ? 'is-enforced' : 'is-gap'} style={{ width: `${Math.max(2, (route.trafficCount / maxTraffic) * 100)}%` }} /></div><b>{route.trafficCount}</b><em className={route.enforcementStatus === 'enforced' ? 'is-enforced' : 'is-gap'}>{route.enforcementStatus}</em></div>)}</div>
        <div className="cr-route-chart-foot">Observed traffic per discovered route <span>ENFORCED <b className="is-enforced" /> &nbsp; GAP <b className="is-gap" /></span></div>
      </section>

      {/* Honest Warning Box */}
      <div className="p-4 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/60 text-xs text-amber-900 dark:text-amber-200 space-y-1">
        <div className="flex items-center gap-2 font-semibold">
          <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
          <span>Real Route Gaps Active: Direct Console UI & Legacy API Key</span>
        </div>
        <p className="text-amber-800 dark:text-amber-300">
          Any action executed outside Holdpoint's mediated tool wrappers (such as an engineer logging into the legacy AWS/GCP console directly, or invoking a raw API key) bypasses policy enforcement. Holdpoint explicitly maps and reports these as <strong>unconnected gaps</strong> rather than falsely claiming 100% coverage.
        </p>
      </div>

      {/* Route List */}
      <div className="space-y-4">
        {routesList.map((route) => (
          <div
            key={route.id}
            className={`p-5 rounded-xl border space-y-3 transition-colors ${
              route.enforcementStatus === 'unconnected'
                ? 'bg-rose-50/30 dark:bg-rose-950/15 border-rose-200 dark:border-rose-900/60'
                : 'bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm text-neutral-950 dark:text-white">
                    {route.name}
                  </span>
                  <span className="font-mono text-xs text-neutral-400">({route.id})</span>
                </div>
                <div className="text-xs text-neutral-500 font-mono">
                  Destination: {route.destination} · Route Type: {route.type}
                </div>
              </div>

              <div>{getStatusBadge(route.enforcementStatus)}</div>
            </div>

            <p className="text-xs text-neutral-600 dark:text-neutral-400">
              {route.description}
            </p>

            {route.gapNotice && (
              <div className="p-2.5 rounded bg-rose-100/70 dark:bg-rose-900/30 border border-rose-200 dark:border-rose-800 text-[11px] font-mono text-rose-800 dark:text-rose-300 flex items-center gap-2">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                <span>{route.gapNotice}</span>
              </div>
            )}

            <div className="flex items-center justify-between pt-2 border-t border-neutral-100 dark:border-neutral-800/80 text-[11px] font-mono text-neutral-500">
              <span>Mediated Wrapper Installed: {route.hasWrapper ? 'Yes (Strict Contract)' : 'No (Direct Bypass)'}</span>
              <span>Monitored Traffic: {route.trafficCount} calls</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
