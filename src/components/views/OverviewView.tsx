import React from 'react';
import { useTenant } from '../../context/TenantContext';
import { 
  Users, 
  DollarSign, 
  CalendarClock, 
  Target, 
  ArrowUpRight, 
  Clock,
  TrendingUp
} from 'lucide-react';
import { NavTab } from '../Sidebar';

interface OverviewViewProps {
  onNavigate: (tab: NavTab) => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({ onNavigate }) => {
  const { currentTenant, leads, appointments, classes, checkInLogs } = useTenant();

  const occupancyPct = Math.round((currentTenant.currentOccupancy / currentTenant.fireCodeMaxCapacity) * 100);
  const totalPipelineValue = leads
    .filter(l => l.stage !== 'LOST')
    .reduce((sum, l) => sum + l.estimatedValueCents, 0) / 100;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-lg font-semibold text-white tracking-tight">{currentTenant.name}</h1>
          <p className="text-[13px] text-zinc-400 mt-0.5">
            <span className="font-mono text-zinc-500">{currentTenant.subdomain}</span>
            <span className="mx-2 text-zinc-600">·</span>
            {currentTenant.tagline}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => onNavigate('kiosk')}
            className="btn-primary px-3.5 py-2 rounded-lg text-xs flex items-center gap-1.5"
          >
            Open Check-In
          </button>
          <button
            onClick={() => onNavigate('appointments')}
            className="btn-secondary px-3.5 py-2 rounded-lg text-xs flex items-center gap-1.5"
          >
            Schedule Session
          </button>
        </div>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Occupancy */}
        <div className="card p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider">Facility</span>
            <Users className="w-4 h-4 text-zinc-600" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-semibold text-white tabular-nums">{currentTenant.currentOccupancy}</span>
            <span className="text-xs text-zinc-500 font-mono">/ {currentTenant.fireCodeMaxCapacity}</span>
          </div>
          <div className="mt-3">
            <div className="progress-track">
              <div
                className={`progress-fill ${occupancyPct > 85 ? 'progress-fill-warn' : ''}`}
                style={{ width: `${Math.min(occupancyPct, 100)}%` }}
              />
            </div>
            <div className="flex items-center justify-between mt-1.5 text-[10px] text-zinc-500 font-mono">
              <span>{occupancyPct}% occupied</span>
              <span>Normal</span>
            </div>
          </div>
        </div>

        {/* MRR */}
        <div className="card p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider">MRR</span>
            <DollarSign className="w-4 h-4 text-zinc-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-semibold text-white tabular-nums">${currentTenant.mrr.toLocaleString()}</span>
            <span className="badge-success px-1.5 py-0.5 rounded text-[10px] font-mono font-medium leading-none">
              <TrendingUp className="w-2.5 h-2.5 inline mr-0.5 -mt-px" />
              8.4%
            </span>
          </div>
          <p className="mt-2 text-[11px] text-zinc-500">98% auto-renewal collection rate</p>
        </div>

        {/* Sessions */}
        <div className="card p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider">Sessions</span>
            <CalendarClock className="w-4 h-4 text-zinc-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-semibold text-white tabular-nums">{appointments.length}</span>
            <span className="text-xs text-zinc-500">booked today</span>
          </div>
          <p className="mt-2 text-[11px] text-zinc-500">
            <span className="text-zinc-300 font-medium">1 in progress</span>
            <span className="mx-1.5 text-zinc-600">·</span>
            100% utilization
          </p>
        </div>

        {/* Pipeline */}
        <div className="card p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider">Pipeline</span>
            <Target className="w-4 h-4 text-zinc-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-semibold text-white tabular-nums">${Math.round(totalPipelineValue).toLocaleString()}</span>
          </div>
          <p className="mt-2 text-[11px] text-zinc-500">
            <span className="text-zinc-300 font-medium">{leads.length} active leads</span>
            <span className="mx-1.5 text-zinc-600">·</span>
            Trial stage
          </p>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* Class Schedule — 3 cols */}
        <div className="lg:col-span-3 card overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/[0.06]">
            <div>
              <h3 className="font-semibold text-[13px] text-white">Today's Classes</h3>
              <p className="text-[11px] text-zinc-500 mt-0.5">Studio capacity and trainer assignments</p>
            </div>
            <button
              onClick={() => onNavigate('classes')}
              className="text-xs text-zinc-400 hover:text-white flex items-center gap-1 font-medium transition-colors"
            >
              Timetable
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-white/[0.04]">
            {classes.map(cls => {
              const fillPct = Math.round((cls.bookedCount / cls.capacity) * 100);
              const isFull = cls.bookedCount >= cls.capacity;
              return (
                <div 
                  key={cls.id}
                  className="px-5 py-3 flex items-center justify-between gap-4 hover:bg-white/[0.015] transition-colors"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-10 h-10 rounded-lg bg-[#0e1014] border border-white/[0.06] flex flex-col items-center justify-center shrink-0">
                      <Clock className="w-3 h-3 text-zinc-500 mb-0.5" />
                      <span className="font-mono text-[10px] font-medium text-zinc-300">{cls.startTime}</span>
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-[13px] text-white truncate">{cls.name}</h4>
                        <span className="badge-neutral px-1.5 py-0.5 rounded text-[9px] font-mono shrink-0">
                          {cls.category}
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-500 mt-0.5 truncate">
                        {cls.coachName} · {cls.room}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <div className="font-mono text-xs text-zinc-300 tabular-nums">
                        {cls.bookedCount}/{cls.capacity}
                      </div>
                    </div>
                    <div className="w-16">
                      <div className="progress-track">
                        <div 
                          className={`progress-fill ${isFull ? 'progress-fill-warn' : ''}`}
                          style={{ width: `${Math.min(fillPct, 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Check-In Feed — 2 cols */}
        <div className="lg:col-span-2 card overflow-hidden flex flex-col">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/[0.06]">
            <div>
              <h3 className="font-semibold text-[13px] text-white">Recent Check-Ins</h3>
              <p className="text-[11px] text-zinc-500 mt-0.5">Gate access events</p>
            </div>
            <button
              onClick={() => onNavigate('kiosk')}
              className="text-xs text-zinc-400 hover:text-white flex items-center gap-1 font-medium transition-colors"
            >
              Terminal
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-white/[0.04] flex-1">
            {checkInLogs.slice(0, 6).map(log => (
              <div key={log.id} className="px-5 py-2.5 flex items-center justify-between gap-3 hover:bg-white/[0.015] transition-colors">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                      log.status === 'GRANTED' ? 'dot-live' :
                      log.status === 'WARNING_LOW_CREDITS' ? 'dot-warn' : 'dot-error'
                    }`} />
                    <span className="font-medium text-xs text-white truncate">{log.memberName}</span>
                  </div>
                  <span className="text-[10px] text-zinc-500 font-mono ml-3.5 mt-0.5 block">
                    {log.tier.replace(/_/g, ' ')}
                  </span>
                </div>
                <div className="text-right shrink-0">
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-medium leading-none ${
                    log.status === 'GRANTED' ? 'badge-success' : 
                    log.status === 'WARNING_LOW_CREDITS' ? 'badge-warning' : 'badge-danger'
                  }`}>
                    {log.status === 'GRANTED' ? 'OK' : log.status === 'WARNING_LOW_CREDITS' ? 'Low' : 'Denied'}
                  </span>
                  <div className="font-mono text-[10px] text-zinc-600 mt-1">{log.timestamp}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
