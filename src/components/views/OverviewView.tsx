import React from 'react';
import { useTenant } from '../../context/TenantContext';
import { 
  Users, 
  DollarSign, 
  CalendarClock, 
  Target, 
  ArrowUpRight, 
  Clock
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
      {/* Workspace Banner */}
      <div className="bg-[#111317] border border-white/[0.08] rounded-xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">{currentTenant.name}</h1>
          <div className="font-mono text-xs text-zinc-400 mt-0.5 tracking-tight flex items-center gap-1.5">
            <span className="text-zinc-500">Workspace:</span>
            <span className="text-zinc-300 font-medium">{currentTenant.subdomain}</span>
          </div>
          <p className="text-xs text-zinc-400 mt-1 max-w-xl">{currentTenant.tagline}</p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => onNavigate('kiosk')}
            className="px-3.5 py-2 rounded-lg text-xs font-medium bg-white hover:bg-zinc-200 text-zinc-950 tactile-btn"
          >
            Open Check-In
          </button>
          <button
            onClick={() => onNavigate('appointments')}
            className="px-3.5 py-2 rounded-lg text-xs font-medium bg-[#1a1d24] hover:bg-[#222630] text-zinc-200 border border-white/[0.08] tactile-btn"
          >
            Schedule PT
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Live Occupancy */}
        <div className="bg-[#111317] border border-white/[0.08] rounded-xl p-4">
          <div className="flex items-center justify-between text-zinc-400 mb-2 text-xs">
            <span>Facility Attendance</span>
            <Users className="w-4 h-4 text-zinc-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-semibold text-white tracking-tight tabular-nums">{currentTenant.currentOccupancy}</span>
            <span className="text-xs text-zinc-500 font-mono">/ {currentTenant.fireCodeMaxCapacity} max</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-zinc-400">
            <span className="text-zinc-300 font-mono font-medium">{occupancyPct}% Occupancy</span>
            <span className="text-zinc-500">Normal Range</span>
          </div>
        </div>

        {/* Metric 2: Monthly Recurring Revenue */}
        <div className="bg-[#111317] border border-white/[0.08] rounded-xl p-4">
          <div className="flex items-center justify-between text-zinc-400 mb-2 text-xs">
            <span>Monthly Revenue (MRR)</span>
            <DollarSign className="w-4 h-4 text-zinc-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-semibold text-white tracking-tight tabular-nums">${currentTenant.mrr.toLocaleString()}</span>
            <span className="text-[10px] font-medium font-mono text-[#86efac] bg-[#12241b] px-1.5 py-0.5 rounded border border-[#1f4a33] leading-none">+8.4%</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-zinc-400">
            <span>Auto-renewing passes</span>
            <span className="text-zinc-500">98% Collection</span>
          </div>
        </div>

        {/* Metric 3: Today's Appointments */}
        <div className="bg-[#111317] border border-white/[0.08] rounded-xl p-4">
          <div className="flex items-center justify-between text-zinc-400 mb-2 text-xs">
            <span>Today's Sessions</span>
            <CalendarClock className="w-4 h-4 text-zinc-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white font-mono">{appointments.length}</span>
            <span className="text-xs text-zinc-500 font-mono">booked</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-zinc-400">
            <span className="text-zinc-300 font-medium">1 In Session</span>
            <span className="text-zinc-500">100% Filled</span>
          </div>
        </div>

        {/* Metric 4: CRM Pipeline */}
        <div className="bg-[#111317] border border-white/[0.08] rounded-xl p-4">
          <div className="flex items-center justify-between text-zinc-400 mb-2 text-xs">
            <span>Active Pipeline</span>
            <Target className="w-4 h-4 text-zinc-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white font-mono">${Math.round(totalPipelineValue).toLocaleString()}</span>
            <span className="text-xs text-zinc-500 font-mono">value</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-zinc-400">
            <span className="text-zinc-300 font-medium">{leads.length} Active Leads</span>
            <span className="text-zinc-500">Trial Stage</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Class Schedule + Check-In Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Classes Column (2 cols) */}
        <div className="lg:col-span-2 bg-[#111317] border border-white/[0.08] rounded-xl p-5">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/[0.06]">
            <div>
              <h3 className="font-semibold text-white text-xs uppercase tracking-wider font-mono">
                Today's Class Schedule
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">Studio capacity and trainer assignments</p>
            </div>
            <button
              onClick={() => onNavigate('classes')}
              className="text-xs text-zinc-300 hover:text-white flex items-center gap-1 font-medium transition-colors"
            >
              <span>View Timetable</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5">
            {classes.map(cls => {
              const fillPct = Math.round((cls.bookedCount / cls.capacity) * 100);
              const isFull = cls.bookedCount >= cls.capacity;
              return (
                <div 
                  key={cls.id}
                  className="bg-[#16191f] border border-white/[0.06] rounded-lg p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-md bg-[#0d0f12] border border-white/[0.08] flex flex-col items-center justify-center shrink-0">
                      <Clock className="w-3.5 h-3.5 text-zinc-500 mb-0.5" />
                      <span className="font-mono text-[10px] font-medium text-zinc-300">{cls.startTime}</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-xs text-white">{cls.name}</h4>
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-mono text-zinc-400 bg-white/[0.04]">
                          {cls.category}
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-400 mt-0.5">
                        Trainer: <span className="text-zinc-200">{cls.coachName}</span> • Room: {cls.room}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 sm:justify-end">
                    <div className="text-right">
                      <div className="font-mono text-xs text-zinc-200">
                        {cls.bookedCount} / {cls.capacity} booked
                      </div>
                      <div className="w-20 bg-zinc-800 rounded-full h-1 mt-1 overflow-hidden">
                        <div 
                          className={`h-full ${isFull ? 'bg-amber-400' : 'bg-white'}`}
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

        {/* Turnstile Check-In Stream (1 col) */}
        <div className="bg-[#111317] border border-white/[0.08] rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/[0.06]">
              <div>
                <h3 className="font-semibold text-white text-xs uppercase tracking-wider font-mono">
                  Recent Check-Ins
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">Gate event records</p>
              </div>
              <button
                onClick={() => onNavigate('kiosk')}
                className="text-xs text-zinc-300 hover:text-white flex items-center gap-1 font-medium transition-colors"
              >
                <span>Check-In</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2">
              {checkInLogs.slice(0, 5).map(log => (
                <div key={log.id} className="bg-[#16191f] border border-white/[0.04] rounded-lg p-2.5 text-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-white">{log.memberName}</span>
                    <span className="font-mono text-[10px] text-zinc-500">{log.timestamp}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-zinc-500 font-mono">
                      {log.tier.replace(/_/g, ' ')}
                    </span>
                    <span className={`px-1.5 py-0.5 rounded-[4px] font-mono text-[10px] leading-none ${
                      log.status === 'GRANTED' ? 'badge-status-approved' : 
                      log.status === 'WARNING_LOW_CREDITS' ? 'badge-status-warning' : 'badge-status-denied'
                    }`}>
                      {log.status === 'GRANTED' ? 'Approved' : log.status === 'WARNING_LOW_CREDITS' ? 'Low Pass' : 'Declined'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
