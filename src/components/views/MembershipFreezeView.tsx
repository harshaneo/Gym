import React, { useState } from 'react';
import { useTenant } from '../../context/TenantContext';
import { 
  Snowflake, 
  Calendar, 
  CheckCircle2, 
  Plus, 
  MessageSquare, 
  X, 
  GraduationCap, 
  Activity, 
  Plane, 
  Moon 
} from 'lucide-react';
import { MembershipFreeze } from '../../types';

export const MembershipFreezeView: React.FC = () => {
  const { 
    membershipFreezes, 
    applyMembershipFreeze, 
    resumeMembershipEarly, 
    members, 
    currentTenant, 
    openWhatsAppModal 
  } = useTenant();

  const [showApplyModal, setShowApplyModal] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState(members[0]?.id || '');
  const [freezeDays, setFreezeDays] = useState<number>(14);
  const [freezeReason, setFreezeReason] = useState<MembershipFreeze['reason']>('AL_EXAMS');
  const [freezeNotes, setFreezeNotes] = useState('');

  const activeFreezes = membershipFreezes.filter(f => f.status === 'ACTIVE_FREEZE');
  const resumedFreezes = membershipFreezes.filter(f => f.status === 'RESUMED');
  const totalDaysExtended = membershipFreezes.reduce((sum, f) => sum + f.daysFrozen, 0);

  const targetMember = members.find(m => m.id === selectedMemberId);

  const handleApplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMemberId) return;

    applyMembershipFreeze({
      memberId: selectedMemberId,
      reason: freezeReason,
      days: freezeDays,
      notes: freezeNotes,
    });

    const memberObj = members.find(m => m.id === selectedMemberId);
    if (memberObj) {
      openWhatsAppModal(
        memberObj.phone || '+94 77 123 4567',
        memberObj.fullName,
        `Hi ${memberObj.fullName}, your ${freezeDays}-day membership hold for ${formatReason(freezeReason)} has been approved at ${currentTenant.name}.\n\n` +
        `Your membership expiration date has been moved forward to accommodate your hold period. Best of luck and see you back on the floor! ❄️`
      );
    }

    setShowApplyModal(false);
    setFreezeNotes('');
  };

  const formatReason = (reason: MembershipFreeze['reason']) => {
    switch (reason) {
      case 'AL_EXAMS': return 'A/L Examination Revision';
      case 'UNIVERSITY_MIDTERMS': return 'University Exams';
      case 'MEDICAL_DENGUE': return 'Dengue / Medical Recovery';
      case 'RAMADAN_FASTING': return 'Ramadan Fasting';
      case 'OVERSEAS_TRAVEL': return 'Overseas Travel';
      case 'WORK_ROTATION': return 'Outstation Work Rotation';
      default: return reason;
    }
  };

  const getReasonIcon = (reason: MembershipFreeze['reason']) => {
    switch (reason) {
      case 'AL_EXAMS':
      case 'UNIVERSITY_MIDTERMS':
        return <GraduationCap className="w-3.5 h-3.5 text-blue-400" />;
      case 'MEDICAL_DENGUE':
        return <Activity className="w-3.5 h-3.5 text-rose-400" />;
      case 'RAMADAN_FASTING':
        return <Moon className="w-3.5 h-3.5 text-amber-400" />;
      case 'OVERSEAS_TRAVEL':
        return <Plane className="w-3.5 h-3.5 text-emerald-400" />;
      default:
        return <Snowflake className="w-3.5 h-3.5 text-cyan-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.06]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl font-bold tracking-tight text-white">Membership Freezes & Holds</h1>
            <span className="badge-primary px-2 py-0.5 rounded text-[10px] font-mono">
              Sri Lanka Seasonality
            </span>
          </div>
          <p className="text-xs text-zinc-400">
            Formal hold management for A/L exams, university midterms, medical/dengue recovery, and seasonal travel. Auto-extends expiration dates.
          </p>
        </div>

        <button
          onClick={() => setShowApplyModal(true)}
          className="btn-primary flex items-center gap-1.5 text-xs py-1.5 px-3"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Apply Membership Hold</span>
        </button>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="card-ambient p-4 rounded-xl border border-cyan-500/20 bg-cyan-950/10 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-mono uppercase text-cyan-400">Currently On Hold</div>
            <div className="text-2xl font-bold font-mono text-white mt-0.5">{activeFreezes.length} Members</div>
            <div className="text-[10px] text-zinc-400 mt-1">Check-in temporarily paused</div>
          </div>
          <Snowflake className="w-8 h-8 text-cyan-400/40" />
        </div>

        <div className="card-ambient p-4 rounded-xl border border-white/[0.06] flex items-center justify-between">
          <div>
            <div className="text-[11px] font-mono uppercase text-zinc-400">Total Days Extended</div>
            <div className="text-2xl font-bold font-mono text-white mt-0.5">+{totalDaysExtended} Days</div>
            <div className="text-[10px] text-zinc-400 mt-1">Across all membership tiers</div>
          </div>
          <Calendar className="w-8 h-8 text-zinc-600" />
        </div>

        <div className="card-ambient p-4 rounded-xl border border-emerald-500/20 bg-emerald-950/10 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-mono uppercase text-emerald-400">Resumed & Retained</div>
            <div className="text-2xl font-bold font-mono text-white mt-0.5">{resumedFreezes.length} Members</div>
            <div className="text-[10px] text-zinc-400 mt-1">Returned post-exam / recovery</div>
          </div>
          <CheckCircle2 className="w-8 h-8 text-emerald-400/40" />
        </div>
      </div>

      {/* Freezes Ledger Table */}
      <div className="card-ambient rounded-xl border border-white/[0.06] overflow-hidden">
        <div className="p-4 border-b border-white/[0.06] flex items-center justify-between bg-[#111317]">
          <div className="flex items-center gap-2">
            <Snowflake className="w-4 h-4 text-cyan-400" />
            <h2 className="text-sm font-semibold text-white">Active & Concluded Hold Periods</h2>
          </div>
          <span className="text-[11px] font-mono text-zinc-500">Auto-pushing renewal deadlines</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-white/[0.06] bg-[#0e1014] text-[11px] font-mono text-zinc-400 uppercase tracking-wider">
                <th className="py-3 px-4">Member Name</th>
                <th className="py-3 px-3">Reason Category</th>
                <th className="py-3 px-3">Freeze Window</th>
                <th className="py-3 px-3">Days Frozen</th>
                <th className="py-3 px-3">Expiration Shift</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {membershipFreezes.map(frz => (
                <tr key={frz.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-3 px-4">
                    <div className="font-semibold text-white text-xs">{frz.memberName}</div>
                    <div className="text-[10px] text-zinc-500 font-mono">
                      {frz.membershipTier.replace(/_/g, ' ')}
                    </div>
                  </td>

                  <td className="py-3 px-3">
                    <div className="flex items-center gap-1.5 text-zinc-200">
                      {getReasonIcon(frz.reason)}
                      <span className="font-medium text-[11px]">{formatReason(frz.reason)}</span>
                    </div>
                    {frz.notes && (
                      <p className="text-[10px] text-zinc-500 truncate max-w-xs mt-0.5">{frz.notes}</p>
                    )}
                  </td>

                  <td className="py-3 px-3 font-mono text-zinc-400 text-[11px]">
                    <div>{frz.startDate} ➔ {frz.scheduledResumeDate}</div>
                    {frz.actualResumeDate && (
                      <div className="text-[10px] text-emerald-400">Resumed: {frz.actualResumeDate}</div>
                    )}
                  </td>

                  <td className="py-3 px-3 font-mono font-bold text-cyan-400 text-xs">
                    +{frz.daysFrozen} Days
                  </td>

                  <td className="py-3 px-3 font-mono text-[11px]">
                    <div className="text-zinc-500 line-through">{frz.oldExpiryDate}</div>
                    <div className="text-emerald-400 font-semibold">{frz.newExpiryDate}</div>
                  </td>

                  <td className="py-3 px-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-medium ${
                      frz.status === 'ACTIVE_FREEZE' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' :
                      'badge-success'
                    }`}>
                      {frz.status === 'ACTIVE_FREEZE' ? 'ON HOLD' : 'RESUMED'}
                    </span>
                  </td>

                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {frz.status === 'ACTIVE_FREEZE' && (
                        <button
                          type="button"
                          onClick={() => resumeMembershipEarly(frz.id)}
                          className="px-2.5 py-1 rounded bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-[11px] transition-colors shadow-sm"
                        >
                          Resume Today
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => openWhatsAppModal(
                          '+94 77 123 4567',
                          frz.memberName,
                          `Hi ${frz.memberName}, this is ${currentTenant.name} regarding your membership hold (${formatReason(frz.reason)}).`
                        )}
                        className="p-1 rounded text-zinc-400 hover:text-emerald-400 transition-colors"
                        title="Message on WhatsApp"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Apply Membership Freeze */}
      {showApplyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#0e1014] border border-white/[0.08] rounded-xl shadow-2xl p-5" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.06] mb-4">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Snowflake className="w-4 h-4 text-cyan-400" />
                Apply Membership Freeze / Hold
              </h3>
              <button onClick={() => setShowApplyModal(false)} className="text-zinc-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleApplySubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-zinc-400 mb-1">Select Member</label>
                <select
                  value={selectedMemberId}
                  onChange={e => setSelectedMemberId(e.target.value)}
                  className="w-full bg-[#16181d] border border-white/[0.08] rounded-md px-3 py-2 text-white text-xs"
                >
                  {members.map(m => (
                    <option key={m.id} value={m.id}>
                      {m.fullName} ({m.membershipTier.replace(/_/g, ' ')}) · Current Exp: {m.renewalDate}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Reason for Hold</label>
                <select
                  value={freezeReason}
                  onChange={e => setFreezeReason(e.target.value as any)}
                  className="w-full bg-[#16181d] border border-white/[0.08] rounded-md px-3 py-2 text-white text-xs"
                >
                  <option value="AL_EXAMS">A/L Examination Revision Period</option>
                  <option value="UNIVERSITY_MIDTERMS">University Midterms / Finals</option>
                  <option value="MEDICAL_DENGUE">Medical / Dengue Fever Recovery</option>
                  <option value="RAMADAN_FASTING">Ramadan Fasting Period</option>
                  <option value="OVERSEAS_TRAVEL">Overseas Travel / Vacation</option>
                  <option value="WORK_ROTATION">Outstation Work Rotation</option>
                </select>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Freeze Duration (Days)</label>
                <div className="grid grid-cols-4 gap-1.5 mb-2">
                  {[7, 14, 21, 30].map(d => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setFreezeDays(d)}
                      className={`py-1.5 rounded text-xs font-mono border transition-colors ${
                        freezeDays === d 
                          ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40 font-bold'
                          : 'bg-[#16181d] border-white/[0.06] text-zinc-400 hover:text-white'
                      }`}
                    >
                      {d} Days
                    </button>
                  ))}
                </div>
              </div>

              {/* Automatic Calculation Preview */}
              {targetMember && (
                <div className="p-3 rounded-lg bg-[#111317] border border-cyan-500/20 font-mono text-[11px] space-y-1">
                  <div className="text-zinc-400 flex items-center justify-between">
                    <span>Current Expiration:</span>
                    <span className="text-zinc-300">{targetMember.renewalDate}</span>
                  </div>
                  <div className="text-cyan-400 font-bold flex items-center justify-between pt-1 border-t border-white/[0.04]">
                    <span>New Extended Expiry:</span>
                    <span>
                      {(() => {
                        const d = new Date(targetMember.renewalDate || new Date());
                        d.setDate(d.getDate() + freezeDays);
                        return d.toISOString().substring(0, 10);
                      })()}
                    </span>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-zinc-400 mb-1">Notes / Documentation</label>
                <input
                  type="text"
                  placeholder="e.g. Exam timetable presented at reception desk"
                  value={freezeNotes}
                  onChange={e => setFreezeNotes(e.target.value)}
                  className="w-full bg-[#16181d] border border-white/[0.08] rounded-md px-3 py-2 text-white text-xs"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowApplyModal(false)}
                  className="px-3 py-1.5 rounded text-zinc-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-bold shadow-sm"
                >
                  Confirm Hold & Notify Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
