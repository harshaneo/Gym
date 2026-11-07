import React, { useState } from 'react';
import { useTenant } from '../../context/TenantContext';
import { 
  Users, 
  Award, 
  CheckCircle2, 
  Plus, 
  FileText, 
  ArrowUpRight, 
  Landmark, 
  Percent, 
  X, 
  Clock 
} from 'lucide-react';
import { TrainerPayrollRecord } from '../../types';

export const TrainerPayrollView: React.FC = () => {
  const { 
    payrollRecords, 
    salaryAdvances, 
    addSalaryAdvance, 
    approvePayrollRecord, 
    disbursePayrollRecord, 
    openWhatsAppModal 
  } = useTenant();

  const [epfEnabled, setEpfEnabled] = useState(true);
  const [showAdvanceModal, setShowAdvanceModal] = useState(false);
  const [showDisburseModal, setShowDisburseModal] = useState<TrainerPayrollRecord | null>(null);

  // Advance Modal State
  const [advanceCoachId, setAdvanceCoachId] = useState(payrollRecords[0]?.coachId || '');
  const [advanceAmountLKR, setAdvanceAmountLKR] = useState('');
  const [advanceReason, setAdvanceReason] = useState('');

  // Disburse Modal State
  const [disburseMethod, setDisburseMethod] = useState<'COMMERCIAL_BANK_TRANSFER' | 'SAMPATH_VISHWA' | 'CASH_ENVELOPE'>('COMMERCIAL_BANK_TRANSFER');
  const [disburseRef, setDisburseRef] = useState('');

  // Calculations
  const totalBaseLiability = payrollRecords.reduce((sum, r) => sum + r.baseSalaryLKR, 0);
  const totalPtCommission = payrollRecords.reduce((sum, r) => sum + r.ptTotalCommissionLKR, 0);
  const totalAdvances = payrollRecords.reduce((sum, r) => sum + r.salaryAdvancesDeductedLKR, 0);
  const totalNetPayable = payrollRecords.reduce((sum, r) => {
    const epf = epfEnabled ? r.epfDeductionLKR : 0;
    const net = (r.baseSalaryLKR + r.ptTotalCommissionLKR + (r.groupClassesTaught * r.groupClassRateLKR)) - r.salaryAdvancesDeductedLKR - epf;
    return sum + Math.max(0, net);
  }, 0);

  const handleCreateAdvance = (e: React.FormEvent) => {
    e.preventDefault();
    const coach = payrollRecords.find(r => r.coachId === advanceCoachId);
    if (!coach || !advanceAmountLKR) return;

    addSalaryAdvance({
      coachId: coach.coachId,
      coachName: coach.coachName,
      amountLKR: parseInt(advanceAmountLKR, 10),
      reason: advanceReason || 'Mid-month personal advance',
    });

    setAdvanceAmountLKR('');
    setAdvanceReason('');
    setShowAdvanceModal(false);
  };

  const handleDisburseConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!showDisburseModal) return;
    disbursePayrollRecord(
      showDisburseModal.id,
      disburseMethod,
      disburseRef || `SLIP-${Date.now().toString().slice(-6)}`
    );
    setShowDisburseModal(null);
  };

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.06]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl font-bold tracking-tight text-white">Trainer Payroll & Commissions</h1>
            <span className="badge-neutral px-2 py-0.5 rounded text-[10px] font-mono">
              Sri Lanka Hybrid Pay
            </span>
          </div>
          <p className="text-xs text-zinc-400">
            Monthly floor salary, 1-on-1 personal training splits, class bounties, and mid-month advance deductions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* EPF / ETF Toggle */}
          <button
            onClick={() => setEpfEnabled(!epfEnabled)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md border text-xs font-mono transition-colors ${
              epfEnabled 
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                : 'bg-zinc-900 border-white/[0.06] text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Percent className="w-3.5 h-3.5" />
            <span>EPF (8%) {epfEnabled ? 'Applied' : 'Exempt'}</span>
          </button>

          <button
            onClick={() => setShowAdvanceModal(true)}
            className="btn-secondary flex items-center gap-1.5 text-xs py-1.5 px-3"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Record Advance</span>
          </button>
        </div>
      </div>

      {/* High-Level Financial Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="card-ambient p-4 rounded-xl border border-white/[0.06]">
          <div className="text-[11px] font-mono uppercase text-zinc-500 mb-1 flex items-center gap-1.5">
            <Landmark className="w-3.5 h-3.5 text-zinc-400" />
            <span>Base Salary Pool</span>
          </div>
          <div className="text-xl font-bold font-mono text-zinc-100">
            LKR {totalBaseLiability.toLocaleString()}
          </div>
          <div className="text-[10px] text-zinc-500 mt-1">Fixed floor monthly coverage</div>
        </div>

        <div className="card-ambient p-4 rounded-xl border border-white/[0.06]">
          <div className="text-[11px] font-mono uppercase text-zinc-500 mb-1 flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5 text-amber-400" />
            <span>PT Commission Pool</span>
          </div>
          <div className="text-xl font-bold font-mono text-amber-400">
            LKR {totalPtCommission.toLocaleString()}
          </div>
          <div className="text-[10px] text-zinc-500 mt-1">93 total 1-on-1 sessions logged</div>
        </div>

        <div className="card-ambient p-4 rounded-xl border border-white/[0.06]">
          <div className="text-[11px] font-mono uppercase text-zinc-500 mb-1 flex items-center gap-1.5">
            <ArrowUpRight className="w-3.5 h-3.5 text-rose-400" />
            <span>Salary Advances Given</span>
          </div>
          <div className="text-xl font-bold font-mono text-rose-400">
            -LKR {totalAdvances.toLocaleString()}
          </div>
          <div className="text-[10px] text-zinc-500 mt-1">{salaryAdvances.length} mid-month advance payouts</div>
        </div>

        <div className="card-ambient p-4 rounded-xl border border-emerald-500/20 bg-emerald-950/10">
          <div className="text-[11px] font-mono uppercase text-emerald-400 mb-1 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Net Payable (Nov 2026)</span>
          </div>
          <div className="text-2xl font-bold font-mono text-white">
            LKR {totalNetPayable.toLocaleString()}
          </div>
          <div className="text-[10px] text-zinc-400 mt-1">Ready for Commercial Bank export</div>
        </div>
      </div>

      {/* Main Trainers Roster Table */}
      <div className="card-ambient rounded-xl border border-white/[0.06] overflow-hidden">
        <div className="p-4 border-b border-white/[0.06] flex items-center justify-between bg-[#111317]">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-zinc-400" />
            <h2 className="text-sm font-semibold text-white">Trainer Monthly Compensation Ledger</h2>
          </div>
          <span className="text-[11px] font-mono text-zinc-500">Pay Period: November 2026</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-white/[0.06] bg-[#0e1014] text-[11px] font-mono text-zinc-400 uppercase tracking-wider">
                <th className="py-3 px-4">Trainer & Role</th>
                <th className="py-3 px-3">Base Pay</th>
                <th className="py-3 px-3">PT Sessions & Comm.</th>
                <th className="py-3 px-3">Classes</th>
                <th className="py-3 px-3">Advances</th>
                {epfEnabled && <th className="py-3 px-3">EPF (8%)</th>}
                <th className="py-3 px-4 font-bold text-zinc-200">Net Payable</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {payrollRecords.map(record => {
                const epf = epfEnabled ? record.epfDeductionLKR : 0;
                const gross = record.baseSalaryLKR + record.ptTotalCommissionLKR + (record.groupClassesTaught * record.groupClassRateLKR);
                const computedNet = Math.max(0, gross - record.salaryAdvancesDeductedLKR - epf);

                return (
                  <tr key={record.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-zinc-800 border border-white/10 flex items-center justify-center font-bold text-white text-xs">
                          {record.coachName.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <div className="font-semibold text-white text-xs">{record.coachName}</div>
                          <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-mono mt-0.5 ${
                            record.role === 'HEAD_COACH' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                            record.role === 'PERSONAL_TRAINER' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                            'bg-zinc-800 text-zinc-400'
                          }`}>
                            {record.role.replace(/_/g, ' ')}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-3 font-mono text-zinc-300">
                      LKR {record.baseSalaryLKR.toLocaleString()}
                    </td>

                    <td className="py-3.5 px-3 font-mono">
                      <div className="text-white font-medium">LKR {record.ptTotalCommissionLKR.toLocaleString()}</div>
                      <div className="text-[10px] text-zinc-500">
                        {record.ptSessionsCompleted} sessions @ LKR {record.ptCommissionRateLKR.toLocaleString()}
                      </div>
                    </td>

                    <td className="py-3.5 px-3 font-mono">
                      <div className="text-zinc-300">
                        LKR {(record.groupClassesTaught * record.groupClassRateLKR).toLocaleString()}
                      </div>
                      <div className="text-[10px] text-zinc-500">
                        {record.groupClassesTaught} classes
                      </div>
                    </td>

                    <td className="py-3.5 px-3 font-mono">
                      {record.salaryAdvancesDeductedLKR > 0 ? (
                        <span className="text-rose-400 font-medium">
                          -LKR {record.salaryAdvancesDeductedLKR.toLocaleString()}
                        </span>
                      ) : (
                        <span className="text-zinc-600">—</span>
                      )}
                    </td>

                    {epfEnabled && (
                      <td className="py-3.5 px-3 font-mono text-zinc-400 text-[11px]">
                        -LKR {record.epfDeductionLKR.toLocaleString()}
                      </td>
                    )}

                    <td className="py-3.5 px-4 font-mono font-bold text-white text-sm">
                      LKR {computedNet.toLocaleString()}
                    </td>

                    <td className="py-3.5 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-medium ${
                        record.status === 'DISBURSED' ? 'badge-success' :
                        record.status === 'APPROVED' ? 'badge-primary' :
                        'badge-warning'
                      }`}>
                        {record.status}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {record.status === 'DRAFT' && (
                          <button
                            onClick={() => approvePayrollRecord(record.id)}
                            className="px-2.5 py-1 rounded bg-white/[0.08] hover:bg-white/[0.15] text-white text-[11px] font-medium transition-colors"
                          >
                            Approve
                          </button>
                        )}
                        {record.status === 'APPROVED' && (
                          <button
                            onClick={() => setShowDisburseModal(record)}
                            className="px-2.5 py-1 rounded bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-[11px] font-semibold transition-colors shadow-sm"
                          >
                            Disburse Pay
                          </button>
                        )}
                        {record.status === 'DISBURSED' && (
                          <span className="text-[11px] font-mono text-zinc-500 flex items-center gap-1 justify-end">
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                            <span>Paid</span>
                          </span>
                        )}
                        <button
                          onClick={() => openWhatsAppModal(
                            '+94 77 123 4567',
                            record.coachName,
                            `Hi ${record.coachName}, your IronPulse payroll statement for November 2026 is ready.\n\n` +
                            `• Base Pay: LKR ${record.baseSalaryLKR.toLocaleString()}\n` +
                            `• PT Commission (${record.ptSessionsCompleted} sessions): LKR ${record.ptTotalCommissionLKR.toLocaleString()}\n` +
                            `• Class Bounties: LKR ${(record.groupClassesTaught * record.groupClassRateLKR).toLocaleString()}\n` +
                            (record.salaryAdvancesDeductedLKR > 0 ? `• Advances Deducted: -LKR ${record.salaryAdvancesDeductedLKR.toLocaleString()}\n` : '') +
                            (epfEnabled ? `• EPF (8%): -LKR ${record.epfDeductionLKR.toLocaleString()}\n` : '') +
                            `\n👉 NET PAYABLE: LKR ${computedNet.toLocaleString()}\n\nStatus: ${record.status}. Settle query with front desk if needed.`
                          )}
                          className="p-1 rounded text-zinc-400 hover:text-emerald-400 hover:bg-white/[0.06] transition-colors"
                          title="Send Payslip on WhatsApp"
                        >
                          <FileText className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Salary Advances History Ledger */}
      <div className="card-ambient rounded-xl border border-white/[0.06] p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-zinc-400" />
            <h3 className="text-xs font-semibold text-white">Recent Mid-Month Salary Advances</h3>
          </div>
          <span className="text-[10px] font-mono text-zinc-500">Auto-deducted at monthly settlement</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {salaryAdvances.map(adv => (
            <div key={adv.id} className="p-3 rounded-lg bg-[#111317] border border-white/[0.04] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-xs font-semibold text-white mb-1">
                  <span>{adv.coachName}</span>
                  <span className="font-mono text-rose-400">LKR {adv.amountLKR.toLocaleString()}</span>
                </div>
                <p className="text-[11px] text-zinc-400 leading-tight mb-2">{adv.reason}</p>
              </div>
              <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500 pt-2 border-t border-white/[0.04]">
                <span>{adv.date}</span>
                <span className="text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Deducted
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal: Record Salary Advance */}
      {showAdvanceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#0e1014] border border-white/[0.08] rounded-xl shadow-2xl p-5" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.06] mb-4">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-emerald-400" />
                Record Mid-Month Salary Advance
              </h3>
              <button onClick={() => setShowAdvanceModal(false)} className="text-zinc-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateAdvance} className="space-y-4 text-xs">
              <div>
                <label className="block text-zinc-400 mb-1">Select Coach / Trainer</label>
                <select
                  value={advanceCoachId}
                  onChange={e => setAdvanceCoachId(e.target.value)}
                  className="w-full bg-[#16181d] border border-white/[0.08] rounded-md px-3 py-2 text-white text-xs"
                >
                  {payrollRecords.map(r => (
                    <option key={r.coachId} value={r.coachId}>{r.coachName} ({r.role.replace(/_/g, ' ')})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Advance Amount (LKR)</label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 5000 or 10000"
                  value={advanceAmountLKR}
                  onChange={e => setAdvanceAmountLKR(e.target.value)}
                  className="w-full bg-[#16181d] border border-white/[0.08] rounded-md px-3 py-2 text-white font-mono text-xs"
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Reason / Note</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Vehicle repair, medical, boarding advance"
                  value={advanceReason}
                  onChange={e => setAdvanceReason(e.target.value)}
                  className="w-full bg-[#16181d] border border-white/[0.08] rounded-md px-3 py-2 text-white text-xs"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAdvanceModal(false)}
                  className="px-3 py-1.5 rounded text-zinc-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold shadow-sm"
                >
                  Save & Apply Deduction
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Disburse Pay */}
      {showDisburseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#0e1014] border border-white/[0.08] rounded-xl shadow-2xl p-5" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.06] mb-4">
              <h3 className="text-sm font-semibold text-white">Disburse Payroll Payment</h3>
              <button onClick={() => setShowDisburseModal(null)} className="text-zinc-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleDisburseConfirm} className="space-y-4 text-xs">
              <div className="p-3 rounded-lg bg-[#16181d] border border-white/[0.04]">
                <div className="text-zinc-400 text-[11px]">Payee</div>
                <div className="text-white font-semibold text-sm">{showDisburseModal.coachName}</div>
                <div className="font-mono text-emerald-400 font-bold text-base mt-1">
                  LKR {showDisburseModal.netPayableLKR.toLocaleString()}
                </div>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Disbursement Method</label>
                <select
                  value={disburseMethod}
                  onChange={e => setDisburseMethod(e.target.value as any)}
                  className="w-full bg-[#16181d] border border-white/[0.08] rounded-md px-3 py-2 text-white text-xs"
                >
                  <option value="COMMERCIAL_BANK_TRANSFER">Commercial Bank Direct Transfer</option>
                  <option value="SAMPATH_VISHWA">Sampath Vishwa Transfer</option>
                  <option value="CASH_ENVELOPE">Cash in Hand (Desk Envelope)</option>
                </select>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Bank Reference / Voucher No.</label>
                <input
                  type="text"
                  placeholder="e.g. SLIP-CB-9941"
                  value={disburseRef}
                  onChange={e => setDisburseRef(e.target.value)}
                  className="w-full bg-[#16181d] border border-white/[0.08] rounded-md px-3 py-2 text-white font-mono text-xs"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowDisburseModal(null)}
                  className="px-3 py-1.5 rounded text-zinc-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold"
                >
                  Confirm & Mark Paid
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
