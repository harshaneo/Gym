import React, { useState } from 'react';
import { useTenant } from '../../context/TenantContext';
import { 
  Dumbbell, 
  CheckCircle2, 
  Plus, 
  AlertCircle, 
  MessageSquare, 
  History, 
  X, 
  ArrowRight
} from 'lucide-react';
import { PTPackage } from '../../types';

export const PTPunchCardView: React.FC = () => {
  const { 
    ptPackages, 
    punchPTSession, 
    enrollPTPackage, 
    members, 
    coaches, 
    currentTenant, 
    openWhatsAppModal 
  } = useTenant();

  const [selectedPackage, setSelectedPackage] = useState<PTPackage | null>(null);
  const [showPunchModal, setShowPunchModal] = useState<PTPackage | null>(null);
  const [showEnrollModal, setShowEnrollModal] = useState(false);

  // Punch modal state
  const [punchFocus, setPunchFocus] = useState('Strength & Hypertrophy');
  const [punchNotes, setPunchNotes] = useState('');

  // Enroll modal state
  const [enrollMemberId, setEnrollMemberId] = useState(members[0]?.id || '');
  const [enrollCoachId, setEnrollCoachId] = useState(coaches[0]?.id || '');
  const [enrollSessions, setEnrollSessions] = useState<number>(12);
  const [enrollPriceLKR, setEnrollPriceLKR] = useState<number>(36000);
  const [enrollCommissionLKR, setEnrollCommissionLKR] = useState<number>(1500);

  const lowBalanceCount = ptPackages.filter(p => p.status === 'LOW_BALANCE').length;

  const handlePunchConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!showPunchModal) return;
    punchPTSession(
      showPunchModal.id,
      punchFocus,
      punchNotes,
      showPunchModal.assignedCoachName
    );
    setShowPunchModal(null);
    setPunchNotes('');
  };

  const handleEnrollSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const member = members.find(m => m.id === enrollMemberId) || {
      id: `m-custom-${Date.now()}`,
      fullName: 'New PT Member',
      phone: '+94 77 000 0000'
    };
    const coach = coaches.find(c => c.id === enrollCoachId) || {
      id: 'c-1',
      name: 'Kasun Fernando'
    };

    const costPerSession = Math.round(enrollPriceLKR / enrollSessions);

    enrollPTPackage({
      memberId: member.id,
      memberName: member.fullName,
      memberPhone: (member as any).phone || '+94 77 123 4567',
      assignedCoachId: coach.id,
      assignedCoachName: coach.name,
      packageName: `${enrollSessions}-Session Dedicated Coaching Block`,
      totalSessions: enrollSessions,
      priceLKR: enrollPriceLKR,
      costPerSessionLKR: costPerSession,
      coachCommissionPerSessionLKR: enrollCommissionLKR,
      durationDays: 45
    });

    setShowEnrollModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.06]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl font-bold tracking-tight text-white">PT Punch-Cards & Session Balances</h1>
            <span className="badge-primary px-2 py-0.5 rounded text-[10px] font-mono">
              Coaching Ledger
            </span>
          </div>
          <p className="text-xs text-zinc-400">
            Digital 10 & 12-session punch tracking. Punching a session auto-deducts the client’s balance and credits trainer commission.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {lowBalanceCount > 0 && (
            <span className="px-2.5 py-1 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-mono flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>{lowBalanceCount} Low Balances</span>
            </span>
          )}

          <button
            onClick={() => setShowEnrollModal(true)}
            className="btn-primary flex items-center gap-1.5 text-xs py-1.5 px-3"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Enroll New PT Pack</span>
          </button>
        </div>
      </div>

      {/* PT Packages Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {ptPackages.map(pkg => {
          const isLow = pkg.remainingSessions <= 2 && pkg.remainingSessions > 0;
          const isDepleted = pkg.remainingSessions === 0;

          return (
            <div 
              key={pkg.id} 
              className={`card-ambient rounded-xl border p-4 flex flex-col justify-between transition-all ${
                isLow ? 'border-amber-500/30 bg-amber-950/5' :
                isDepleted ? 'border-zinc-800 opacity-60' :
                'border-white/[0.06]'
              }`}
            >
              <div>
                {/* Card Top Pill */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-white/[0.06] border border-white/10 flex items-center justify-center text-white">
                      <Dumbbell className="w-3.5 h-3.5 text-amber-400" />
                    </div>
                    <div>
                      <h3 className="text-xs font-semibold text-white leading-tight">{pkg.memberName}</h3>
                      <span className="text-[10px] text-zinc-400 font-mono">Coach: {pkg.assignedCoachName}</span>
                    </div>
                  </div>

                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-medium ${
                    isDepleted ? 'bg-zinc-800 text-zinc-400' :
                    isLow ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                    'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  }`}>
                    {pkg.remainingSessions} / {pkg.totalSessions} Left
                  </span>
                </div>

                <div className="text-[11px] font-medium text-zinc-300 mb-2 truncate">
                  {pkg.packageName}
                </div>

                {/* Tactile Punch-Hole Visual Grid */}
                <div className="p-3 bg-[#0a0b0e] rounded-lg border border-white/[0.04] mb-3">
                  <div className="text-[9px] font-mono uppercase text-zinc-500 mb-2 flex items-center justify-between">
                    <span>Punch Holes ({pkg.completedSessions} Punched)</span>
                    <span>Expires: {pkg.expiryDate}</span>
                  </div>
                  <div className="grid grid-cols-6 gap-2">
                    {Array.from({ length: pkg.totalSessions }).map((_, idx) => {
                      const isPunched = idx < pkg.completedSessions;
                      return (
                        <div
                          key={idx}
                          className={`aspect-square rounded-full flex items-center justify-center text-[10px] font-mono font-bold transition-all ${
                            isPunched
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-sm'
                              : 'bg-zinc-900 border border-dashed border-zinc-700 text-zinc-600'
                          }`}
                          title={isPunched ? `Session #${idx + 1} Completed` : `Session #${idx + 1} Remaining`}
                        >
                          {isPunched ? <CheckCircle2 className="w-3.5 h-3.5" /> : idx + 1}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Financial Summary */}
                <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-zinc-400 mb-3 pt-2 border-t border-white/[0.04]">
                  <div>
                    <span className="text-zinc-500 block">Package Price</span>
                    <span className="text-white font-medium">LKR {pkg.priceLKR.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block">Trainer Cut / Session</span>
                    <span className="text-amber-400 font-medium">LKR {pkg.coachCommissionPerSessionLKR.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedPackage(pkg)}
                  className="px-2.5 py-1.5 rounded bg-white/[0.06] hover:bg-white/[0.12] text-zinc-300 text-xs font-medium flex items-center gap-1 transition-colors"
                >
                  <History className="w-3 h-3 text-zinc-400" />
                  <span>Log ({pkg.sessionPunches.length})</span>
                </button>

                <div className="flex items-center gap-1.5">
                  {isLow && (
                    <button
                      type="button"
                      onClick={() => openWhatsAppModal(
                        pkg.memberPhone,
                        pkg.memberName,
                        `Hi ${pkg.memberName}, you have only ${pkg.remainingSessions} PT session(s) left in your coaching pack with Coach ${pkg.assignedCoachName} at ${currentTenant.name}.\n\n` +
                        `Would you like to lock in your spot for next month with a 10 or 12-session top-up? Reply here and we will arrange your renewal invoice!`
                      )}
                      className="px-2.5 py-1.5 rounded bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 text-xs font-medium border border-amber-500/20 flex items-center gap-1"
                      title="Send Renewal WhatsApp"
                    >
                      <MessageSquare className="w-3 h-3" />
                      <span>Renew</span>
                    </button>
                  )}

                  {!isDepleted ? (
                    <button
                      type="button"
                      onClick={() => setShowPunchModal(pkg)}
                      className="px-3 py-1.5 rounded bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs flex items-center gap-1 shadow-sm transition-all active:scale-97"
                    >
                      <span>Punch # {pkg.completedSessions + 1}</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  ) : (
                    <span className="text-[11px] font-mono text-zinc-500 italic">Depleted</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal: Punch Session */}
      {showPunchModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#0e1014] border border-white/[0.08] rounded-xl shadow-2xl p-5" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.06] mb-4">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Dumbbell className="w-4 h-4 text-emerald-400" />
                Punch Session #{showPunchModal.completedSessions + 1} of {showPunchModal.totalSessions}
              </h3>
              <button onClick={() => setShowPunchModal(null)} className="text-zinc-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handlePunchConfirm} className="space-y-4 text-xs">
              <div className="p-3 rounded-lg bg-[#16181d] border border-white/[0.04]">
                <div className="text-white font-medium text-xs">{showPunchModal.memberName}</div>
                <div className="text-zinc-400 text-[11px]">Assigned Coach: {showPunchModal.assignedCoachName}</div>
                <div className="text-emerald-400 font-mono text-[11px] mt-1">
                  Commission Credit to Coach: +LKR {showPunchModal.coachCommissionPerSessionLKR.toLocaleString()}
                </div>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Workout Focus</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Legs & Core - Barbell Squat 110kg 4x5, Walking Lunges"
                  value={punchFocus}
                  onChange={e => setPunchFocus(e.target.value)}
                  className="w-full bg-[#16181d] border border-white/[0.08] rounded-md px-3 py-2 text-white text-xs"
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Coach Notes / Member Progression</label>
                <textarea
                  rows={3}
                  placeholder="e.g. Great depth on squat, no back rounding. Form check passed."
                  value={punchNotes}
                  onChange={e => setPunchNotes(e.target.value)}
                  className="w-full bg-[#16181d] border border-white/[0.08] rounded-md p-2.5 text-white text-xs"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowPunchModal(null)}
                  className="px-3 py-1.5 rounded text-zinc-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold shadow-sm"
                >
                  Confirm Punch & Credit Coach
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Enroll New PT Package */}
      {showEnrollModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#0e1014] border border-white/[0.08] rounded-xl shadow-2xl p-5" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.06] mb-4">
              <h3 className="text-sm font-semibold text-white">Enroll Member in PT Package</h3>
              <button onClick={() => setShowEnrollModal(false)} className="text-zinc-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleEnrollSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-zinc-400 mb-1">Select Member</label>
                <select
                  value={enrollMemberId}
                  onChange={e => setEnrollMemberId(e.target.value)}
                  className="w-full bg-[#16181d] border border-white/[0.08] rounded-md px-3 py-2 text-white text-xs"
                >
                  {members.map(m => (
                    <option key={m.id} value={m.id}>{m.fullName} ({m.membershipTier.replace(/_/g, ' ')})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Assigned Personal Trainer</label>
                <select
                  value={enrollCoachId}
                  onChange={e => setEnrollCoachId(e.target.value)}
                  className="w-full bg-[#16181d] border border-white/[0.08] rounded-md px-3 py-2 text-white text-xs"
                >
                  {coaches.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.specialty})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 mb-1">Session Count</label>
                  <select
                    value={enrollSessions}
                    onChange={e => {
                      const count = parseInt(e.target.value, 10);
                      setEnrollSessions(count);
                      setEnrollPriceLKR(count * 3000);
                      setEnrollCommissionLKR(1500);
                    }}
                    className="w-full bg-[#16181d] border border-white/[0.08] rounded-md px-3 py-2 text-white text-xs font-mono"
                  >
                    <option value={10}>10 Sessions</option>
                    <option value={12}>12 Sessions</option>
                    <option value={20}>20 Sessions</option>
                  </select>
                </div>

                <div>
                  <label className="block text-zinc-400 mb-1">Total Fee (LKR)</label>
                  <input
                    type="number"
                    value={enrollPriceLKR}
                    onChange={e => setEnrollPriceLKR(parseInt(e.target.value, 10) || 0)}
                    className="w-full bg-[#16181d] border border-white/[0.08] rounded-md px-3 py-2 text-white font-mono text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Trainer Commission per Session (LKR)</label>
                <input
                  type="number"
                  value={enrollCommissionLKR}
                  onChange={e => setEnrollCommissionLKR(parseInt(e.target.value, 10) || 0)}
                  className="w-full bg-[#16181d] border border-white/[0.08] rounded-md px-3 py-2 text-amber-400 font-mono text-xs"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowEnrollModal(false)}
                  className="px-3 py-1.5 rounded text-zinc-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold"
                >
                  Activate Package
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: View Package Punch History */}
      {selectedPackage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-[#0e1014] border border-white/[0.08] rounded-xl shadow-2xl p-5" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.06] mb-4">
              <div>
                <h3 className="text-sm font-semibold text-white">{selectedPackage.memberName} — Session Punch History</h3>
                <span className="text-[11px] font-mono text-zinc-400">{selectedPackage.packageName}</span>
              </div>
              <button onClick={() => setSelectedPackage(null)} className="text-zinc-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="max-h-72 overflow-y-auto space-y-2.5 pr-1">
              {selectedPackage.sessionPunches.length === 0 ? (
                <div className="text-center py-8 text-zinc-500 text-xs">No sessions punched yet for this package.</div>
              ) : (
                selectedPackage.sessionPunches.map((punch, idx) => (
                  <div key={punch.id} className="p-3 rounded-lg bg-[#16181d] border border-white/[0.04] text-xs">
                    <div className="flex items-center justify-between font-mono text-zinc-400 text-[10px] mb-1">
                      <span>Session #{selectedPackage.sessionPunches.length - idx}</span>
                      <span>{punch.date} · {punch.time}</span>
                    </div>
                    <div className="text-white font-medium text-xs mb-1">{punch.workoutFocus}</div>
                    {punch.coachNotes && (
                      <p className="text-[11px] text-zinc-400 italic">"{punch.coachNotes}"</p>
                    )}
                    <div className="text-[10px] text-zinc-500 mt-1">Punched by: {punch.punchedBy}</div>
                  </div>
                ))
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-white/[0.06] flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedPackage(null)}
                className="px-4 py-1.5 rounded bg-white/[0.06] hover:bg-white/[0.12] text-zinc-200 text-xs font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
