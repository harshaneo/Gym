import React, { useState } from 'react';
import { useTenant } from '../../context/TenantContext';
import { 
  TrendingDown, 
  Phone, 
  Send, 
  Check, 
  Activity,
  CreditCard,
  MessageSquare
} from 'lucide-react';

export const RetentionRadarView: React.FC = () => {
  const { churnRisks, dispatchRetentionAction, openWhatsAppModal, currentTenant } = useTenant();

  const [activeTab, setActiveTab] = useState<'ALL' | 'STEEP_DROP' | 'FAILED_BILLING'>('ALL');
  const [actionSuccessNotice, setActionSuccessNotice] = useState<string | null>(null);

  const filteredRisks = churnRisks.filter(r => {
    if (activeTab === 'STEEP_DROP') return r.attendanceTrend === 'STEEP_DROP';
    if (activeTab === 'FAILED_BILLING') return r.attendanceTrend === 'FAILED_BILLING';
    return true;
  });

  const handleTriggerAction = (riskId: string, memberName: string, actionNote: string) => {
    dispatchRetentionAction(riskId, actionNote);
    setActionSuccessNotice(`Outreach dispatched for ${memberName}: "${actionNote}"`);
    setTimeout(() => setActionSuccessNotice(null), 3000);
  };

  const totalAtRiskMrr = churnRisks.reduce((sum, r) => sum + r.monthlyDuesCents, 0) / 100;
  const highRiskCount = churnRisks.filter(r => r.riskScorePct >= 70).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-white/[0.06]">
        <div>
          <h1 className="text-lg font-semibold text-white tracking-tight">Retention Radar & Churn Prevention</h1>
          <p className="text-[13px] text-zinc-400 mt-0.5">
            Identify members at risk of cancellation based on attendance drop-offs and failed payment retries.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="card px-3 py-1.5 text-xs flex items-center gap-2">
            <span className="text-zinc-500 font-mono text-[11px]">At-Risk MRR:</span>
            <span className="font-mono font-medium text-amber-300 tabular-nums">${totalAtRiskMrr.toFixed(2)}/mo</span>
            <span className="text-zinc-600">·</span>
            <span className="text-zinc-400 font-mono text-[11px]">{highRiskCount} critical</span>
          </div>
        </div>
      </div>

      {actionSuccessNotice && (
        <div className="region-success rounded-lg p-3.5 flex items-center justify-between text-xs text-zinc-200 animate-in fade-in">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{actionSuccessNotice}</span>
          </div>
          <button onClick={() => setActionSuccessNotice(null)} className="text-zinc-500 hover:text-white">✕</button>
        </div>
      )}

      {/* Metric Cards Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="card p-4">
          <div className="flex items-center justify-between text-zinc-400 mb-2 text-xs">
            <span className="text-[11px] font-medium uppercase font-mono">Members At Risk</span>
            <TrendingDown className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-semibold text-white tabular-nums">{churnRisks.length}</div>
          <p className="text-[11px] text-zinc-500 mt-1">Zero facility check-ins in 10+ days</p>
        </div>

        <div className="card p-4">
          <div className="flex items-center justify-between text-zinc-400 mb-2 text-xs">
            <span className="text-[11px] font-medium uppercase font-mono">At-Risk Recurring Dues</span>
            <CreditCard className="w-4 h-4 text-zinc-500" />
          </div>
          <div className="text-2xl font-semibold text-white font-mono tabular-nums">${totalAtRiskMrr.toFixed(0)}</div>
          <p className="text-[11px] text-zinc-500 mt-1">Monthly dues subject to cancellation risk</p>
        </div>

        <div className="card p-4">
          <div className="flex items-center justify-between text-zinc-400 mb-2 text-xs">
            <span className="text-[11px] font-medium uppercase font-mono">Retention Intervention Success</span>
            <Activity className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-semibold text-white font-mono tabular-nums">71.4%</div>
          <p className="text-[11px] text-zinc-500 mt-1">Re-engaged via 1-on-1 coach technique check-ins</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2">
        <div className="segmented-control inline-flex">
          <button
            onClick={() => setActiveTab('ALL')}
            className={`segmented-tab ${activeTab === 'ALL' ? 'segmented-tab-active' : ''}`}
          >
            All At-Risk ({churnRisks.length})
          </button>
          <button
            onClick={() => setActiveTab('STEEP_DROP')}
            className={`segmented-tab ${activeTab === 'STEEP_DROP' ? 'segmented-tab-active' : ''}`}
          >
            Attendance Drop-Off
          </button>
          <button
            onClick={() => setActiveTab('FAILED_BILLING')}
            className={`segmented-tab ${activeTab === 'FAILED_BILLING' ? 'segmented-tab-active' : ''}`}
          >
            Billing Retries Failed
          </button>
        </div>
      </div>

      {/* Radar Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {filteredRisks.map(risk => {
          const isCritical = risk.riskScorePct >= 75;

          return (
            <div key={risk.id} className="card p-5 flex flex-col justify-between">
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-medium ${
                        isCritical ? 'badge-danger' : 'badge-warning'
                      }`}>
                        {risk.riskScorePct}% Churn Risk
                      </span>
                      <span className="text-[10px] font-mono text-zinc-500">
                        {risk.attendanceTrend.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <h3 className="font-semibold text-sm text-white">{risk.memberName}</h3>
                    <div className="text-xs text-zinc-400 font-mono mt-0.5">
                      {risk.membershipTier.replace(/_/g, ' ')} · ${(risk.monthlyDuesCents / 100).toFixed(0)}/mo
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] font-mono text-zinc-500 block">Absent</span>
                    <span className="font-mono text-sm font-bold text-amber-300 tabular-nums">
                      {risk.daysSinceLastVisit}d
                    </span>
                  </div>
                </div>

                {/* Contact details */}
                <div className="bg-[#0e1014] rounded-lg p-2.5 text-xs font-mono space-y-1 text-zinc-400 border border-white/[0.04] mb-3">
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-600">Last visit:</span>
                    <span className="text-zinc-300">{risk.lastVisitDate}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-600">Phone:</span>
                    <span className="text-zinc-300">{risk.phone}</span>
                  </div>
                  <div className="flex items-center justify-between truncate">
                    <span className="text-zinc-600">Email:</span>
                    <span className="text-zinc-300 truncate max-w-[170px]">{risk.email}</span>
                  </div>
                </div>

                {/* Suggested Action Box */}
                <div className="p-2.5 rounded-lg region-warning text-xs text-zinc-300 mb-4">
                  <span className="text-[10px] font-mono uppercase text-amber-400 block font-semibold mb-0.5">
                    Recommended Intervention:
                  </span>
                  {risk.suggestedAction}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-white/[0.04] flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => openWhatsAppModal(
                    risk.phone,
                    risk.memberName,
                    `Aayubowan ${risk.memberName}! We noticed you haven’t checked in at ${currentTenant.name} for ${risk.daysSinceLastVisit} days.\n\n` +
                    `Our head coach is on the floor today and we have reserved a complimentary recovery/mobility pass for you this week. Would love to see you back!`
                  )}
                  className="px-2.5 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 text-xs font-medium flex items-center gap-1.5 transition-colors"
                  title="Direct WhatsApp Re-engagement"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleTriggerAction(risk.id, risk.memberName, 'Dispatched automated SMS pass incentive')}
                  className="btn-primary flex-1 py-1.5 rounded-lg text-xs flex items-center justify-center gap-1.5"
                >
                  <Send className="w-3 h-3" />
                  <span>Send Offer</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleTriggerAction(risk.id, risk.memberName, 'Assigned phone call task to Marcus')}
                  className="btn-secondary px-2.5 py-1.5 rounded-lg text-xs"
                  title="Assign Coach Call"
                >
                  <Phone className="w-3.5 h-3.5 text-zinc-400" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
