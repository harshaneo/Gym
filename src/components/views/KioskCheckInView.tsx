import React, { useState } from 'react';
import { useTenant } from '../../context/TenantContext';
import { Member } from '../../types';
import { 
  Search, 
  Check, 
  AlertCircle, 
  XCircle, 
  Phone,
  LogIn,
  LogOut,
  CreditCard,
  ShieldCheck,
  PlusCircle
} from 'lucide-react';

export const KioskCheckInView: React.FC = () => {
  const { 
    currentTenant, 
    processCheckIn, 
    checkInLogs,
    settlePastDue,
    supervisorOverride,
    refillPunchPass
  } = useTenant();

  const [inputVal, setInputVal] = useState('');
  const [checkMode, setCheckMode] = useState<'CHECK_IN' | 'CHECK_OUT'>('CHECK_IN');
  const [lastResult, setLastResult] = useState<{
    success: boolean;
    status: 'GRANTED' | 'WARNING_LOW_CREDITS' | 'DENIED_PAST_DUE' | 'NOT_FOUND';
    message: string;
    member?: Member;
    classCheckedIn?: string;
  } | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim()) return;
    const res = processCheckIn(inputVal, checkMode);
    setLastResult(res);
    setInputVal('');
  };

  const handleQuickLookup = (pinOrPhone: string) => {
    const res = processCheckIn(pinOrPhone, checkMode);
    setLastResult(res);
    setInputVal('');
  };

  const handleSettle = (member: Member) => {
    settlePastDue(member.id);
    setLastResult({
      success: true,
      status: 'GRANTED',
      message: `Account balance settled ($199.00) via Front Desk Cashier. Access granted!`,
      member: { ...member, status: 'ACTIVE', isInsideFacility: true },
    });
  };

  const handleOverride = (member: Member, reason: string) => {
    supervisorOverride(member.id, reason);
    setLastResult({
      success: true,
      status: 'WARNING_LOW_CREDITS',
      message: `Supervisor override recorded: "${reason}". Access granted for this visit.`,
      member: { ...member, isInsideFacility: true },
    });
  };

  const handleRefill = (member: Member, passCount: number) => {
    refillPunchPass(member.id, passCount);
    const updatedCredits = (member.remainingCredits ?? 0) + passCount - 1;
    setLastResult({
      success: true,
      status: 'GRANTED',
      message: `10-Punch Refill sold ($180.00). 1 pass redeemed for today. ${updatedCredits} passes remaining.`,
      member: { ...member, remainingCredits: updatedCredits, isInsideFacility: true },
    });
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Member Check-In & Access</h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Turnstile reader, barcode scan, and reception verification terminal.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Mode Switcher */}
          <div className="flex items-center p-1 bg-[#111317] border border-white/[0.08] rounded-lg">
            <button
              type="button"
              onClick={() => setCheckMode('CHECK_IN')}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 ${
                checkMode === 'CHECK_IN'
                  ? 'bg-white text-zinc-950 font-semibold shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              Check-In Mode
            </button>
            <button
              type="button"
              onClick={() => setCheckMode('CHECK_OUT')}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 ${
                checkMode === 'CHECK_OUT'
                  ? 'bg-zinc-800 text-white font-semibold shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <LogOut className="w-3.5 h-3.5" />
              Check-Out Mode
            </button>
          </div>

          <div className="bg-[#111317] border border-white/[0.08] px-3 py-1.5 rounded-lg flex items-center gap-2 text-xs">
            <span className="text-zinc-400">Occupancy:</span>
            <span className="font-mono font-semibold text-white">
              {currentTenant.currentOccupancy} <span className="text-zinc-500 font-normal">/ {currentTenant.fireCodeMaxCapacity}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Main Search Panel */}
      <div className="bg-[#111317] border border-white/[0.08] rounded-xl p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">
              Member Identification (Barcode / PIN / Phone / Name)
            </label>
            <div className="relative flex items-center">
              <input
                type="text"
                autoFocus
                placeholder={
                  checkMode === 'CHECK_IN' 
                    ? "Scan pass or enter identifier (e.g. 419203 or Rachel)..." 
                    : "Scan pass or enter identifier to record exit..."
                }
                value={inputVal}
                onChange={e => setInputVal(e.target.value)}
                className="w-full pro-input rounded-lg px-4 py-3 text-sm text-white placeholder:text-zinc-600 font-mono"
              />
              <button
                type="submit"
                className="absolute right-2 px-4 py-1.5 rounded-md text-xs font-medium bg-white hover:bg-zinc-200 text-zinc-950 tactile-btn flex items-center gap-1.5"
              >
                <Search className="w-3.5 h-3.5" />
                <span>{checkMode === 'CHECK_IN' ? 'Verify Entry' : 'Record Exit'}</span>
              </button>
            </div>
          </div>

          {/* Quick Lookup Samples */}
          <div className="pt-2 flex flex-wrap items-center gap-2 text-xs text-zinc-400">
            <span className="text-zinc-500 text-[11px]">Quick verification shortcuts:</span>
            <button
              type="button"
              onClick={() => handleQuickLookup('419203')}
              className="px-2.5 py-1 rounded bg-[#16191f] hover:bg-[#1f232b] text-zinc-300 border border-white/[0.06] transition-colors font-mono text-[11px]"
            >
              Rachel Morales (PIN: 419203)
            </button>
            <button
              type="button"
              onClick={() => handleQuickLookup('772109')}
              className="px-2.5 py-1 rounded bg-[#16191f] hover:bg-[#1f232b] text-zinc-300 border border-white/[0.06] transition-colors font-mono text-[11px]"
            >
              Tyler Knox (PIN: 772109 - Past Due)
            </button>
            <button
              type="button"
              onClick={() => handleQuickLookup('318902')}
              className="px-2.5 py-1 rounded bg-[#16191f] hover:bg-[#1f232b] text-zinc-300 border border-white/[0.06] transition-colors font-mono text-[11px]"
            >
              Jessica Huang (PIN: 318902 - Punch Pass)
            </button>
          </div>
        </form>

        {/* Access Verification Result */}
        {lastResult && (
          <div className={`mt-5 rounded-lg p-5 border transition-all ${
            lastResult.status === 'GRANTED'
              ? 'bg-[#0d1612] border-[#1b382b] text-zinc-100'
              : lastResult.status === 'WARNING_LOW_CREDITS'
              ? 'bg-[#18140c] border-[#382b15] text-zinc-100'
              : lastResult.status === 'DENIED_PAST_DUE'
              ? 'bg-[#180d0f] border-[#3d1a1e] text-zinc-100'
              : 'bg-zinc-900 border-zinc-700 text-zinc-300'
          }`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className={`w-9 h-9 rounded-md flex items-center justify-center shrink-0 border ${
                  lastResult.status === 'GRANTED' ? 'bg-[#132d20] border-[#1f4a33] text-[#4ade80]' :
                  lastResult.status === 'WARNING_LOW_CREDITS' ? 'bg-[#291e0d] border-[#453114] text-[#fcd34d]' :
                  'bg-[#2d1216] border-[#4a1f24] text-[#fda4af]'
                }`}>
                  {lastResult.status === 'GRANTED' && <Check className="w-4 h-4" />}
                  {lastResult.status === 'WARNING_LOW_CREDITS' && <AlertCircle className="w-4 h-4" />}
                  {lastResult.status === 'DENIED_PAST_DUE' && <XCircle className="w-4 h-4" />}
                  {lastResult.status === 'NOT_FOUND' && <Search className="w-4 h-4" />}
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className={`text-[10px] font-mono uppercase tracking-wider font-semibold px-2 py-0.5 rounded-[4px] ${
                      lastResult.status === 'GRANTED' ? 'badge-status-approved' : 
                      lastResult.status === 'WARNING_LOW_CREDITS' ? 'badge-status-warning' : 
                      lastResult.status === 'DENIED_PAST_DUE' ? 'badge-status-denied' : 'badge-status-neutral'
                    }`}>
                      {lastResult.status === 'GRANTED' ? (checkMode === 'CHECK_OUT' ? 'Exit Recorded' : 'Access Approved') : 
                       lastResult.status === 'WARNING_LOW_CREDITS' ? 'Pass Balance Low' : 
                       lastResult.status === 'DENIED_PAST_DUE' ? 'Payment Required' : 'Not Found'}
                    </span>
                    {lastResult.member && (
                      <span className="text-xs font-mono text-zinc-400">ID: {lastResult.member.barcodePin}</span>
                    )}
                  </div>
                  <h3 className="text-sm font-semibold text-white tracking-tight">
                    {lastResult.member ? lastResult.member.fullName : 'Scan Result'}
                  </h3>
                  <p className="text-xs text-zinc-400 mt-0.5">{lastResult.message}</p>

                  {lastResult.classCheckedIn && (
                    <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-[4px] badge-status-approved text-xs font-medium">
                      <Check className="w-3.5 h-3.5 text-[#4ade80]" />
                      <span>{lastResult.classCheckedIn}</span>
                    </div>
                  )}
                </div>
              </div>

              {lastResult.member && (
                <div className="text-right text-xs space-y-1 sm:border-l sm:border-white/[0.08] sm:pl-4">
                  <div className="text-zinc-400 text-[11px]">Membership:</div>
                  <div className="font-medium text-white font-mono">
                    {lastResult.member.membershipTier.replace(/_/g, ' ')}
                  </div>
                  {typeof lastResult.member.remainingCredits === 'number' && (
                    <div className="text-amber-300 font-mono font-medium">
                      {lastResult.member.remainingCredits} passes remaining
                    </div>
                  )}
                  <div className="text-zinc-400 text-[11px] flex items-center gap-1 sm:justify-end mt-1">
                    <Phone className="w-3 h-3 text-zinc-500" />
                    <span>{lastResult.member.phone}</span>
                  </div>
                </div>
              )}
            </div>

            {/* High-Velocity Front Desk Remediation Actions */}
            {lastResult.status === 'DENIED_PAST_DUE' && lastResult.member && (
              <div className="mt-4 pt-3.5 border-t border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="text-xs text-zinc-300">
                  Past due balance: <strong className="font-mono text-white tabular-nums">$199.00</strong>. Card expired on file. Settle now to grant access.
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleSettle(lastResult.member!)}
                    className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-white hover:bg-zinc-200 text-zinc-950 flex items-center gap-1.5 transition-colors shadow-sm tactile-btn"
                  >
                    <CreditCard className="w-3.5 h-3.5" />
                    Collect $199 & Settle
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOverride(lastResult.member!, 'Supervisor Courtesy One-Time Entry')}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-white/[0.08] flex items-center gap-1.5 transition-colors tactile-btn"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-zinc-400" />
                    1-Visit Override
                  </button>
                </div>
              </div>
            )}

            {lastResult.status === 'WARNING_LOW_CREDITS' && lastResult.member && (
              <div className="mt-4 pt-3.5 border-t border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="text-xs text-zinc-300">
                  Punch pass balance is low. Refill directly into member account.
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleRefill(lastResult.member!, 10)}
                    className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-white hover:bg-zinc-200 text-zinc-950 flex items-center gap-1.5 transition-colors shadow-sm tactile-btn"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    Sell 10-Punch Refill ($180)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOverride(lastResult.member!, 'Pass Refill Pending Post-Workout')}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-white/[0.08] flex items-center gap-1.5 transition-colors tactile-btn"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-zinc-400" />
                    1-Visit Courtesy
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Attendance Audit Table */}
      <div className="bg-[#111317] border border-white/[0.08] rounded-xl overflow-hidden">
        <div className="px-5 py-3.5 border-b border-white/[0.08] flex items-center justify-between">
          <h3 className="font-medium text-xs text-white uppercase tracking-wider font-mono">
            Today's Check-In & Exit Records
          </h3>
          <span className="text-xs font-mono text-zinc-400">{checkInLogs.length} verified events</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/[0.06] text-zinc-400 font-mono text-[11px]">
                <th className="px-5 py-2.5 font-medium">Timestamp</th>
                <th className="px-5 py-2.5 font-medium">Member</th>
                <th className="px-5 py-2.5 font-medium">Pass Tier</th>
                <th className="px-5 py-2.5 font-medium">Status</th>
                <th className="px-5 py-2.5 font-medium text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {checkInLogs.map(log => (
                <tr key={log.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-5 py-3 font-mono text-zinc-400">{log.timestamp}</td>
                  <td className="px-5 py-3 font-medium text-white">{log.memberName}</td>
                  <td className="px-5 py-3 font-mono text-zinc-400">{log.tier.replace(/_/g, ' ')}</td>
                  <td className="px-5 py-3">
                    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[4px] text-[11px] font-medium leading-none ${
                      log.status === 'GRANTED' ? 'badge-status-approved' :
                      log.status === 'WARNING_LOW_CREDITS' ? 'badge-status-warning' :
                      'badge-status-denied'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        log.status === 'GRANTED' ? 'dot-approved' :
                        log.status === 'WARNING_LOW_CREDITS' ? 'dot-warning' : 'dot-denied'
                      }`} />
                      {log.status === 'GRANTED' ? 'Approved' :
                       log.status === 'WARNING_LOW_CREDITS' ? 'Pass Warning' : 'Declined'}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right text-zinc-400 text-[11px] truncate max-w-xs">{log.message}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
