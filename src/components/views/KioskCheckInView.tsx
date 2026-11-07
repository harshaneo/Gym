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
  PlusCircle,
  Clock
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
      message: `Account balance settled ($199.00) via Front Desk Cashier. Access granted.`,
      member: { ...member, status: 'ACTIVE', isInsideFacility: true },
    });
  };

  const handleOverride = (member: Member, reason: string) => {
    supervisorOverride(member.id, reason);
    setLastResult({
      success: true,
      status: 'WARNING_LOW_CREDITS',
      message: `Supervisor override: "${reason}". Access granted for this visit.`,
      member: { ...member, isInsideFacility: true },
    });
  };

  const handleRefill = (member: Member, passCount: number) => {
    refillPunchPass(member.id, passCount);
    const updatedCredits = (member.remainingCredits ?? 0) + passCount - 1;
    setLastResult({
      success: true,
      status: 'GRANTED',
      message: `10-Punch Refill processed ($180.00). 1 pass redeemed today. ${updatedCredits} remaining.`,
      member: { ...member, remainingCredits: updatedCredits, isInsideFacility: true },
    });
  };

  const occupancyRatio = Math.round((currentTenant.currentOccupancy / currentTenant.fireCodeMaxCapacity) * 100);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-white/[0.06]">
        <div>
          <h1 className="text-lg font-semibold text-white tracking-tight">Check-In Terminal</h1>
          <p className="text-[13px] text-zinc-400 mt-0.5">
            Turnstile gate verification, barcode scanning, and reception desk overrides.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="segmented-control inline-flex">
            <button
              type="button"
              onClick={() => setCheckMode('CHECK_IN')}
              className={`segmented-tab flex items-center gap-1.5 ${checkMode === 'CHECK_IN' ? 'segmented-tab-active' : ''}`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Check-In</span>
            </button>
            <button
              type="button"
              onClick={() => setCheckMode('CHECK_OUT')}
              className={`segmented-tab flex items-center gap-1.5 ${checkMode === 'CHECK_OUT' ? 'segmented-tab-active' : ''}`}
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Check-Out</span>
            </button>
          </div>

          <div className="card px-3 py-1.5 text-xs flex items-center gap-2">
            <span className="text-zinc-500 font-mono text-[11px]">Floor:</span>
            <span className="font-mono font-medium text-white tabular-nums">
              {currentTenant.currentOccupancy}<span className="text-zinc-600">/{currentTenant.fireCodeMaxCapacity}</span>
            </span>
            <span className="text-zinc-600">·</span>
            <span className="text-[11px] text-zinc-400 font-mono">{occupancyRatio}%</span>
          </div>
        </div>
      </div>

      {/* Main Terminal Input Card */}
      <div className="card p-5 sm:p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">
              Member Barcode PIN / Phone / Name
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                autoFocus
                placeholder={
                  checkMode === 'CHECK_IN' 
                    ? "Scan barcode or enter PIN (e.g. 419203 or Rachel)..." 
                    : "Scan barcode or enter PIN to record departure..."
                }
                value={inputVal}
                onChange={e => setInputVal(e.target.value)}
                className="w-full input px-4 py-2.5 text-sm font-mono"
              />
              <button
                type="submit"
                className="btn-primary px-5 py-2.5 rounded-lg text-xs flex items-center justify-center gap-1.5 shrink-0"
              >
                <Search className="w-3.5 h-3.5" />
                <span>{checkMode === 'CHECK_IN' ? 'Verify Entry' : 'Record Exit'}</span>
              </button>
            </div>
          </div>

          {/* Quick Lookup Chips */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="text-[11px] text-zinc-500">Quick test presets:</span>
            <button
              type="button"
              onClick={() => handleQuickLookup('419203')}
              className="btn-secondary px-2.5 py-1 rounded-md text-[11px] font-mono"
            >
              Rachel Morales (419203 · Active)
            </button>
            <button
              type="button"
              onClick={() => handleQuickLookup('772109')}
              className="btn-secondary px-2.5 py-1 rounded-md text-[11px] font-mono text-red-300 hover:text-red-200"
            >
              Tyler Knox (772109 · Past Due)
            </button>
            <button
              type="button"
              onClick={() => handleQuickLookup('318902')}
              className="btn-secondary px-2.5 py-1 rounded-md text-[11px] font-mono text-amber-300 hover:text-amber-200"
            >
              Jessica Huang (318902 · Punch Pass)
            </button>
          </div>
        </form>

        {/* Verification Feedback Banner */}
        {lastResult && (
          <div className={`mt-5 rounded-lg p-4 border transition-all ${
            lastResult.status === 'GRANTED' ? 'region-success' :
            lastResult.status === 'WARNING_LOW_CREDITS' ? 'region-warning' :
            lastResult.status === 'DENIED_PAST_DUE' ? 'region-danger' : 'region-neutral'
          }`}>
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${
                  lastResult.status === 'GRANTED' ? 'bg-emerald-950/60 border-emerald-500/30 text-emerald-400' :
                  lastResult.status === 'WARNING_LOW_CREDITS' ? 'bg-amber-950/60 border-amber-500/30 text-amber-300' :
                  'bg-red-950/60 border-red-500/30 text-red-300'
                }`}>
                  {lastResult.status === 'GRANTED' && <Check className="w-4 h-4" />}
                  {lastResult.status === 'WARNING_LOW_CREDITS' && <AlertCircle className="w-4 h-4" />}
                  {lastResult.status === 'DENIED_PAST_DUE' && <XCircle className="w-4 h-4" />}
                  {lastResult.status === 'NOT_FOUND' && <Search className="w-4 h-4" />}
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-medium leading-none ${
                      lastResult.status === 'GRANTED' ? 'badge-success' :
                      lastResult.status === 'WARNING_LOW_CREDITS' ? 'badge-warning' :
                      lastResult.status === 'DENIED_PAST_DUE' ? 'badge-danger' : 'badge-neutral'
                    }`}>
                      {lastResult.status === 'GRANTED' ? (checkMode === 'CHECK_OUT' ? 'Exit Logged' : 'Access Approved') :
                       lastResult.status === 'WARNING_LOW_CREDITS' ? 'Low Punch Credits' :
                       lastResult.status === 'DENIED_PAST_DUE' ? 'Card Past Due' : 'Not Found'}
                    </span>
                    {lastResult.member && (
                      <span className="text-[11px] font-mono text-zinc-400">PIN: {lastResult.member.barcodePin}</span>
                    )}
                  </div>

                  <h3 className="font-semibold text-sm text-white">
                    {lastResult.member ? lastResult.member.fullName : 'Scan Result'}
                  </h3>
                  <p className="text-xs text-zinc-300 mt-0.5">{lastResult.message}</p>

                  {lastResult.classCheckedIn && (
                    <div className="mt-2 inline-flex items-center gap-1.5 badge-success px-2.5 py-0.5 rounded text-xs font-medium">
                      <Clock className="w-3 h-3" />
                      <span>{lastResult.classCheckedIn}</span>
                    </div>
                  )}
                </div>
              </div>

              {lastResult.member && (
                <div className="text-right text-xs space-y-1 sm:border-l sm:border-white/[0.06] sm:pl-4">
                  <div className="text-zinc-500 text-[10px] uppercase font-mono">Membership</div>
                  <div className="font-medium text-white font-mono text-xs">
                    {lastResult.member.membershipTier.replace(/_/g, ' ')}
                  </div>
                  {typeof lastResult.member.remainingCredits === 'number' && (
                    <div className="text-amber-300 font-mono text-xs font-medium">
                      {lastResult.member.remainingCredits} passes remaining
                    </div>
                  )}
                  <div className="text-zinc-400 text-[11px] flex items-center gap-1 sm:justify-end mt-1 font-mono">
                    <Phone className="w-3 h-3 text-zinc-500" />
                    <span>{lastResult.member.phone}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Front Desk Cashier / Override Actions */}
            {lastResult.status === 'DENIED_PAST_DUE' && lastResult.member && (
              <div className="mt-3.5 pt-3 border-t border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="text-xs text-zinc-300">
                  Unpaid dues: <strong className="font-mono text-white tabular-nums">$199.00</strong>. Card expired. Settle now to restore gate access.
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleSettle(lastResult.member!)}
                    className="btn-primary px-3.5 py-1.5 rounded-lg text-xs flex items-center gap-1.5"
                  >
                    <CreditCard className="w-3.5 h-3.5" />
                    Collect $199 & Settle
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOverride(lastResult.member!, 'Supervisor Courtesy Visit')}
                    className="btn-secondary px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    1-Visit Pass
                  </button>
                </div>
              </div>
            )}

            {lastResult.status === 'WARNING_LOW_CREDITS' && lastResult.member && (
              <div className="mt-3.5 pt-3 border-t border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="text-xs text-zinc-300">
                  Punch pass balance low. Refill directly to account.
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleRefill(lastResult.member!, 10)}
                    className="btn-primary px-3.5 py-1.5 rounded-lg text-xs flex items-center gap-1.5"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    Sell 10-Punch Pack ($180)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOverride(lastResult.member!, 'Punch Pass Post-Workout Purchase')}
                    className="btn-secondary px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Courtesy Pass
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Access Log Stream */}
      <div className="card overflow-hidden">
        <div className="px-5 py-3 border-b border-white/[0.06] flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-xs text-white uppercase tracking-wider font-mono">
              Gate Access Stream
            </h3>
            <p className="text-[11px] text-zinc-500 mt-0.5">Real-time gate and turnstile authentication log</p>
          </div>
          <span className="text-xs font-mono text-zinc-500 tabular-nums">{checkInLogs.length} events today</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="table-header">
                <th className="px-5 py-2.5">Time</th>
                <th className="px-5 py-2.5">Member</th>
                <th className="px-5 py-2.5">Tier</th>
                <th className="px-5 py-2.5">Status</th>
                <th className="px-5 py-2.5 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {checkInLogs.map(log => (
                <tr key={log.id} className="table-row">
                  <td className="px-5 py-2.5 font-mono text-zinc-500">{log.timestamp}</td>
                  <td className="px-5 py-2.5 font-medium text-white">{log.memberName}</td>
                  <td className="px-5 py-2.5 font-mono text-zinc-400">{log.tier.replace(/_/g, ' ')}</td>
                  <td className="px-5 py-2.5">
                    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono font-medium leading-none ${
                      log.status === 'GRANTED' ? 'badge-success' :
                      log.status === 'WARNING_LOW_CREDITS' ? 'badge-warning' : 'badge-danger'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        log.status === 'GRANTED' ? 'dot-live' :
                        log.status === 'WARNING_LOW_CREDITS' ? 'dot-warn' : 'dot-error'
                      }`} />
                      {log.status === 'GRANTED' ? 'Granted' :
                       log.status === 'WARNING_LOW_CREDITS' ? 'Low Pass' : 'Declined'}
                    </span>
                  </td>
                  <td className="px-5 py-2.5 text-right text-zinc-500 text-[11px] truncate max-w-xs">{log.message}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
