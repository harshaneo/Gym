import React, { useState } from 'react';
import { useTenant } from '../../context/TenantContext';
import { SessionType, AppointmentStatus } from '../../types';
import { 
  CalendarClock, 
  Plus, 
  User, 
  Clock, 
  CheckCircle2, 
  Play, 
  Filter,
  X,
  Calendar,
  List,
  DollarSign,
  Download,
  AlertTriangle,
  UserX
} from 'lucide-react';

const TIME_SLOTS = [
  '07:00', '08:00', '09:00', '10:00', '11:00', '12:00',
  '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00'
];

export const AppointmentsView: React.FC = () => {
  const { currentTenant, appointments, coaches, addAppointment, updateAppointmentStatus } = useTenant();

  const [activeTab, setActiveTab] = useState<'GRID' | 'ROSTER' | 'PAYROLL'>('GRID');
  const [selectedCoachId, setSelectedCoachId] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [showAddModal, setShowAddModal] = useState(false);

  // Form states
  const [formCoachId, setFormCoachId] = useState(coaches[0]?.id || '');
  const [formMemberName, setFormMemberName] = useState('');
  const [formMemberPhone, setFormMemberPhone] = useState('');
  const [formSessionType, setFormSessionType] = useState<SessionType>('PERSONAL_TRAINING');
  const [formDate, setFormDate] = useState('2026-11-07');
  const [formStartTime, setFormStartTime] = useState('11:00');
  const [formDurationMin, setFormDurationMin] = useState(60);
  const [formNotes, setFormNotes] = useState('');

  // Calculations
  const filteredAppointments = appointments.filter(a => {
    if (selectedCoachId !== 'ALL' && a.coachId !== selectedCoachId) return false;
    if (selectedStatus !== 'ALL' && a.status !== selectedStatus) return false;
    return true;
  });

  const totalPtGross = appointments
    .filter(a => a.status !== 'CANCELLED')
    .reduce((sum, a) => sum + a.priceCents, 0) / 100;

  const totalCoachPayouts = appointments
    .filter(a => a.status !== 'CANCELLED')
    .reduce((sum, a) => sum + a.coachPayoutCents, 0) / 100;

  const gymNetPtMargin = totalPtGross - totalCoachPayouts;

  const handleOpenAddWithPrefill = (coachId: string, time: string) => {
    setFormCoachId(coachId);
    setFormStartTime(time);
    setShowAddModal(true);
  };

  const handleCreateAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    const coach = coaches.find(c => c.id === formCoachId) || coaches[0];
    const priceCents = coach ? coach.hourlyRateCents : 9500;
    const coachPayoutCents = coach ? Math.round(priceCents * (coach.commissionRatePct / 100)) : 6650;

    const [h, m] = formStartTime.split(':').map(Number);
    const endH = String(h + Math.floor((m + formDurationMin) / 60)).padStart(2, '0');
    const endM = String((m + formDurationMin) % 60).padStart(2, '0');

    addAppointment({
      coachId: coach.id,
      coachName: coach.name,
      memberId: `mem-${Date.now().toString().slice(-4)}`,
      memberName: formMemberName,
      memberPhone: formMemberPhone,
      sessionType: formSessionType,
      date: formDate,
      startTime: formStartTime,
      endTime: `${endH}:${endM}`,
      status: 'CONFIRMED',
      priceCents,
      coachPayoutCents,
      notes: formNotes,
    });

    setShowAddModal(false);
    setFormMemberName('');
    setFormMemberPhone('');
    setFormNotes('');
  };

  const handleExportPayrollCSV = () => {
    const headers = ['Coach Name', 'Specialty', 'Hourly Rate ($)', 'Commission %', 'Billable Sessions', 'Gross Bookings ($)', 'Coach Payout ($)', 'Gym Net Margin ($)'];
    const rows = coaches.map(coach => {
      const coachAppts = appointments.filter(a => a.coachId === coach.id && a.status !== 'CANCELLED');
      const gross = coachAppts.reduce((sum, a) => sum + a.priceCents, 0) / 100;
      const payout = coachAppts.reduce((sum, a) => sum + a.coachPayoutCents, 0) / 100;
      const margin = gross - payout;
      return [
        `"${coach.name}"`,
        `"${coach.specialty}"`,
        (coach.hourlyRateCents / 100).toFixed(2),
        `${coach.commissionRatePct}%`,
        coachAppts.length,
        gross.toFixed(2),
        payout.toFixed(2),
        margin.toFixed(2)
      ];
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `pt-payroll-${currentTenant.slug}-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusBadge = (status: AppointmentStatus) => {
    switch (status) {
      case 'IN_PROGRESS':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">In Progress</span>;
      case 'COMPLETED':
        return <span className="badge-status-neutral px-2 py-0.5 rounded-[4px] text-[10px] font-mono font-medium leading-none">Completed</span>;
      case 'NO_SHOW':
        return <span className="badge-status-warning px-2 py-0.5 rounded-[4px] text-[10px] font-mono font-medium leading-none">No Show</span>;
      case 'LATE_CANCEL':
        return <span className="px-2 py-0.5 rounded-[4px] text-[10px] font-mono font-medium bg-purple-500/10 text-purple-300 border border-purple-500/20 leading-none">Late Cancel</span>;
      case 'CANCELLED':
        return <span className="badge-status-denied px-2 py-0.5 rounded-[4px] text-[10px] font-mono font-medium leading-none">Cancelled</span>;
      default:
        return <span className="badge-status-neutral px-2 py-0.5 rounded-[4px] text-[10px] font-mono font-medium leading-none">Confirmed</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Appointments & Personal Training</h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Trainer timetables, resource allocation, and commission payroll accounting.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Sub-view switcher */}
          <div className="flex items-center p-1 bg-[#111317] border border-white/[0.08] rounded-lg">
            <button
              onClick={() => setActiveTab('GRID')}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 ${
                activeTab === 'GRID' ? 'bg-white text-zinc-950 font-semibold' : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Timeline Grid</span>
            </button>
            <button
              onClick={() => setActiveTab('ROSTER')}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 ${
                activeTab === 'ROSTER' ? 'bg-white text-zinc-950 font-semibold' : 'text-zinc-400 hover:text-white'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>Roster List</span>
            </button>
            <button
              onClick={() => setActiveTab('PAYROLL')}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 ${
                activeTab === 'PAYROLL' ? 'bg-white text-zinc-950 font-semibold' : 'text-zinc-400 hover:text-white'
              }`}
            >
              <DollarSign className="w-3.5 h-3.5" />
              <span>Trainer Payroll</span>
            </button>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-3.5 py-2 rounded-lg font-medium text-xs bg-white hover:bg-zinc-200 text-zinc-950 tactile-btn flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Schedule Session</span>
          </button>
        </div>
      </div>

      {/* Financial Summary Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#111317] border border-white/[0.08] rounded-xl p-4">
          <span className="text-xs text-zinc-400 font-medium">Gross PT Bookings</span>
          <div className="text-xl font-bold text-white font-mono mt-1">
            ${totalPtGross.toFixed(2)}
          </div>
          <span className="text-[11px] text-zinc-500 font-mono">{appointments.filter(a => a.status !== 'CANCELLED').length} active billable sessions</span>
        </div>

        <div className="bg-[#111317] border border-white/[0.08] rounded-xl p-4">
          <span className="text-xs text-zinc-400 font-medium">Coach Commission Payouts</span>
          <div className="text-xl font-bold text-zinc-200 font-mono mt-1">
            ${totalCoachPayouts.toFixed(2)}
          </div>
          <span className="text-[11px] text-zinc-500 font-mono">Disbursed to certified trainers</span>
        </div>

        <div className="bg-[#111317] border border-white/[0.08] rounded-xl p-4">
          <span className="text-xs text-zinc-400 font-medium">Facility Net Margin</span>
          <div className="text-xl font-semibold text-white tracking-tight tabular-nums mt-1">
            ${gymNetPtMargin.toFixed(2)}
          </div>
          <span className="text-[11px] text-zinc-500 font-mono">Retained facility profit ({totalPtGross > 0 ? Math.round((gymNetPtMargin / totalPtGross) * 100) : 0}%)</span>
        </div>
      </div>

      {/* VIEW 1: Resource Timeline Grid */}
      {activeTab === 'GRID' && (
        <div className="bg-[#111317] border border-white/[0.08] rounded-xl overflow-hidden">
          <div className="px-5 py-3 border-b border-white/[0.08] flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-xs text-white uppercase tracking-wider font-mono">
                Coach Resource Grid — {formDate}
              </h3>
              <p className="text-[11px] text-zinc-400">Click empty slot to schedule trainer</p>
            </div>
            <span className="text-xs font-mono text-zinc-500">{coaches.length} active coaches</span>
          </div>

          <div className="overflow-x-auto">
            <div className="min-w-[800px]">
              {/* Header row: Coaches */}
              <div className="grid grid-cols-[80px_repeat(auto-fit,minmax(220px,1fr))] border-b border-white/[0.08] bg-[#0d0f12]">
                <div className="p-3 text-center text-[11px] font-mono text-zinc-500 border-r border-white/[0.06]">
                  Time
                </div>
                {coaches.map(coach => (
                  <div key={coach.id} className="p-3 border-r border-white/[0.06] last:border-r-0">
                    <div className="font-semibold text-xs text-white flex items-center justify-between">
                      <span>{coach.name}</span>
                      <span className="text-[10px] font-mono text-zinc-400">${coach.hourlyRateCents / 100}/hr</span>
                    </div>
                    <div className="text-[10px] text-zinc-400 truncate">{coach.specialty}</div>
                  </div>
                ))}
              </div>

              {/* Time Slot Rows */}
              <div className="divide-y divide-white/[0.04]">
                {TIME_SLOTS.map(slotTime => {
                  return (
                    <div key={slotTime} className="grid grid-cols-[80px_repeat(auto-fit,minmax(220px,1fr))] min-h-[58px]">
                      {/* Time Column */}
                      <div className="p-2 text-center text-xs font-mono text-zinc-500 bg-[#0e1014] border-r border-white/[0.06] flex items-center justify-center">
                        {slotTime}
                      </div>

                      {/* Coach Slot Cells */}
                      {coaches.map(coach => {
                        const appt = appointments.find(a => 
                          a.coachId === coach.id && 
                          a.startTime.startsWith(slotTime.slice(0, 2)) &&
                          a.status !== 'CANCELLED'
                        );

                        return (
                          <div 
                            key={coach.id} 
                            className="p-1.5 border-r border-white/[0.06] last:border-r-0 relative group hover:bg-white/[0.02] transition-colors"
                          >
                            {appt ? (
                              <div className={`h-full rounded-lg p-2 text-xs flex flex-col justify-between border transition-all ${
                                appt.status === 'IN_PROGRESS' ? 'bg-blue-950/40 border-blue-500/40 text-blue-200' :
                                appt.status === 'COMPLETED' ? 'bg-zinc-900/60 border-white/10 text-zinc-300' :
                                appt.status === 'NO_SHOW' ? 'bg-[#18140c] border-[#382b15] text-[#fcd34d]' :
                                appt.status === 'LATE_CANCEL' ? 'bg-purple-950/40 border-purple-500/30 text-purple-200' :
                                'bg-[#181c24] border-white/10 text-white'
                              }`}>
                                <div className="flex items-start justify-between gap-1">
                                  <div className="truncate">
                                    <div className="font-semibold truncate">{appt.memberName}</div>
                                    <div className="text-[10px] font-mono opacity-75">{appt.sessionType.replace(/_/g, ' ')}</div>
                                  </div>
                                  <div className="shrink-0">{getStatusBadge(appt.status)}</div>
                                </div>

                                <div className="flex items-center justify-between text-[10px] font-mono pt-1 mt-1 border-t border-white/5 opacity-80">
                                  <span>{appt.startTime} – {appt.endTime}</span>
                                  <span>${(appt.priceCents / 100).toFixed(0)}</span>
                                </div>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleOpenAddWithPrefill(coach.id, slotTime)}
                                className="w-full h-full rounded-lg border border-transparent hover:border-dashed hover:border-white/20 flex items-center justify-center text-[11px] text-transparent hover:text-zinc-400 transition-colors"
                              >
                                + Book {slotTime}
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: Roster List */}
      {activeTab === 'ROSTER' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-[#111317] p-3 rounded-xl border border-white/[0.08]">
            <div className="flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-zinc-400" />
              <span className="text-xs text-zinc-400">Filter:</span>

              <select
                value={selectedCoachId}
                onChange={e => setSelectedCoachId(e.target.value)}
                className="bg-[#181b21] border border-white/[0.08] rounded-md px-2.5 py-1 text-xs text-zinc-200 focus:outline-none"
              >
                <option value="ALL">All Coaches</option>
                {coaches.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>

              <select
                value={selectedStatus}
                onChange={e => setSelectedStatus(e.target.value)}
                className="bg-[#181b21] border border-white/[0.08] rounded-md px-2.5 py-1 text-xs text-zinc-200 focus:outline-none"
              >
                <option value="ALL">All Statuses</option>
                <option value="CONFIRMED">Confirmed</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
                <option value="NO_SHOW">No Show</option>
                <option value="LATE_CANCEL">Late Cancel</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>

            <span className="text-xs font-mono text-zinc-500">
              Showing {filteredAppointments.length} sessions
            </span>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredAppointments.map(appt => {
              const isOngoing = appt.status === 'IN_PROGRESS';

              return (
                <div 
                  key={appt.id} 
                  className={`bg-[#111317] rounded-xl p-5 border transition-all ${
                    isOngoing ? 'border-zinc-500 bg-[#161920]' : 'border-white/[0.08] hover:border-white/[0.15]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-white/[0.06] text-zinc-300">
                          {appt.sessionType.replace(/_/g, ' ')}
                        </span>
                        {getStatusBadge(appt.status)}
                      </div>
                      <h3 className="font-semibold text-sm text-white">{appt.memberName}</h3>
                      <div className="text-xs text-zinc-400 flex items-center gap-1.5 mt-0.5">
                        <User className="w-3.5 h-3.5 text-zinc-500" />
                        Trainer: <span className="text-zinc-200">{appt.coachName}</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="font-mono text-sm font-bold text-white">${(appt.priceCents / 100).toFixed(2)}</div>
                      <div className="text-[10px] font-mono text-zinc-500">
                        Payout: ${(appt.coachPayoutCents / 100).toFixed(2)}
                      </div>
                    </div>
                  </div>

                  {/* Time Slot Details */}
                  <div className="bg-[#16191f] rounded-lg p-3 text-xs space-y-1.5 mb-3 border border-white/[0.04]">
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-400 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-zinc-500" />
                        Schedule:
                      </span>
                      <span className="font-mono text-zinc-300">
                        {appt.date} • {appt.startTime} – {appt.endTime}
                      </span>
                    </div>
                    {appt.notes && (
                      <div className="text-[11px] text-zinc-400 italic pt-1 border-t border-white/[0.04]">
                        "{appt.notes}"
                      </div>
                    )}
                  </div>

                  {/* Full Lifecycle Action Buttons */}
                  <div className="flex flex-wrap items-center justify-end gap-1.5 pt-2 border-t border-white/[0.06]">
                    {appt.status === 'CONFIRMED' && (
                      <>
                        <button
                          onClick={() => updateAppointmentStatus(appt.id, 'IN_PROGRESS')}
                          className="px-2.5 py-1 rounded text-xs font-medium bg-white hover:bg-zinc-200 text-zinc-950 flex items-center gap-1"
                        >
                          <Play className="w-3 h-3" />
                          Start
                        </button>
                        <button
                          onClick={() => updateAppointmentStatus(appt.id, 'NO_SHOW')}
                          className="px-2.5 py-1 rounded text-xs font-medium text-amber-300 hover:bg-amber-500/10 border border-amber-500/20 flex items-center gap-1"
                        >
                          <UserX className="w-3 h-3" />
                          No Show
                        </button>
                        <button
                          onClick={() => updateAppointmentStatus(appt.id, 'LATE_CANCEL')}
                          className="px-2.5 py-1 rounded text-xs font-medium text-purple-300 hover:bg-purple-500/10 border border-purple-500/20 flex items-center gap-1"
                        >
                          <AlertTriangle className="w-3 h-3" />
                          Late Cancel
                        </button>
                      </>
                    )}

                    {appt.status === 'IN_PROGRESS' && (
                      <button
                        onClick={() => updateAppointmentStatus(appt.id, 'COMPLETED')}
                        className="px-3 py-1.5 rounded-md text-xs font-semibold bg-white hover:bg-zinc-200 text-zinc-950 flex items-center gap-1 shadow-sm tactile-btn"
                      >
                        <CheckCircle2 className="w-3 h-3" />
                        Mark Completed
                      </button>
                    )}

                    {appt.status !== 'CANCELLED' && appt.status !== 'COMPLETED' && (
                      <button
                        onClick={() => updateAppointmentStatus(appt.id, 'CANCELLED')}
                        className="px-2 py-1 rounded text-xs text-zinc-500 hover:text-red-400"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW 3: Trainer Commission Payroll Ledger */}
      {activeTab === 'PAYROLL' && (
        <div className="bg-[#111317] border border-white/[0.08] rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-white/[0.08] flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-xs text-white uppercase tracking-wider font-mono">
                Coach Commission & Payout Accounting Ledger
              </h3>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                Computed from billable completed, confirmed, and late-canceled 1-on-1 sessions.
              </p>
            </div>

            <button
              onClick={handleExportPayrollCSV}
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-[#1a1d24] hover:bg-[#232731] text-zinc-200 border border-white/10 flex items-center gap-1.5 transition-colors tactile-btn"
            >
              <Download className="w-3.5 h-3.5 text-zinc-400" />
              <span>Export CSV</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/[0.06] text-zinc-400 font-mono text-[11px] bg-[#0d0f12]">
                  <th className="px-5 py-3 font-medium">Coach</th>
                  <th className="px-5 py-3 font-medium">Specialty</th>
                  <th className="px-5 py-3 font-medium">Hourly Base</th>
                  <th className="px-5 py-3 font-medium">Commission %</th>
                  <th className="px-5 py-3 font-medium">Sessions</th>
                  <th className="px-5 py-3 font-medium">Gross Booked</th>
                  <th className="px-5 py-3 font-medium text-zinc-300">Coach Payout</th>
                  <th className="px-5 py-3 font-medium text-right text-zinc-200">Facility Margin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {coaches.map(coach => {
                  const coachAppts = appointments.filter(a => a.coachId === coach.id && a.status !== 'CANCELLED');
                  const gross = coachAppts.reduce((sum, a) => sum + a.priceCents, 0) / 100;
                  const payout = coachAppts.reduce((sum, a) => sum + a.coachPayoutCents, 0) / 100;
                  const margin = gross - payout;

                  return (
                    <tr key={coach.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-5 py-3.5 font-medium text-white flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-zinc-800 text-zinc-300 font-bold text-[10px] flex items-center justify-center">
                          {coach.name.charAt(0)}
                        </div>
                        <span>{coach.name}</span>
                      </td>
                      <td className="px-5 py-3.5 text-zinc-400">{coach.specialty}</td>
                      <td className="px-5 py-3.5 font-mono text-zinc-300 tabular-nums">${(coach.hourlyRateCents / 100).toFixed(2)}</td>
                      <td className="px-5 py-3.5 font-mono text-zinc-300 tabular-nums">{coach.commissionRatePct}%</td>
                      <td className="px-5 py-3.5 font-mono text-zinc-300 tabular-nums">{coachAppts.length}</td>
                      <td className="px-5 py-3.5 font-mono text-white font-semibold tabular-nums">${gross.toFixed(2)}</td>
                      <td className="px-5 py-3.5 font-mono text-zinc-200 font-medium tabular-nums">${payout.toFixed(2)}</td>
                      <td className="px-5 py-3.5 font-mono text-right text-zinc-300 font-medium tabular-nums">${margin.toFixed(2)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Book Appointment Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="glass-panel w-full max-w-lg rounded-2xl p-6 shadow-2xl relative">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400">
                <CalendarClock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-white text-base">Schedule 1-on-1 Session</h3>
                <p className="text-xs text-zinc-400">Assign trainer, allocate slot & calculate commission</p>
              </div>
            </div>

            <form onSubmit={handleCreateAppointment} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">Select Coach</label>
                  <select
                    value={formCoachId}
                    onChange={e => setFormCoachId(e.target.value)}
                    className="w-full bg-zinc-900 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-orange-500"
                  >
                    {coaches.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name} (${(c.hourlyRateCents / 100)}/hr)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">Session Type</label>
                  <select
                    value={formSessionType}
                    onChange={e => setFormSessionType(e.target.value as SessionType)}
                    className="w-full bg-zinc-900 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-orange-500"
                  >
                    <option value="PERSONAL_TRAINING">Personal Training 60m</option>
                    <option value="FITNESS_ASSESSMENT">Movement & InBody Assessment</option>
                    <option value="BOXING_PADWORK">Boxing / Padwork Conditioning</option>
                    <option value="NUTRITION_CONSULT">Nutrition & Macro Consult</option>
                    <option value="REHAB_RECOVERY">Rehab & Mobility Protocol</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">Member Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. David Vance"
                    value={formMemberName}
                    onChange={e => setFormMemberName(e.target.value)}
                    className="w-full bg-zinc-900 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">Member Phone</label>
                  <input
                    type="tel"
                    required
                    placeholder="+1 (512) 555-0182"
                    value={formMemberPhone}
                    onChange={e => setFormMemberPhone(e.target.value)}
                    className="w-full bg-zinc-900 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-orange-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={formDate}
                    onChange={e => setFormDate(e.target.value)}
                    className="w-full bg-zinc-900 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-orange-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">Start Time</label>
                  <input
                    type="time"
                    required
                    value={formStartTime}
                    onChange={e => setFormStartTime(e.target.value)}
                    className="w-full bg-zinc-900 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-orange-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">Duration (Min)</label>
                  <input
                    type="number"
                    value={formDurationMin}
                    onChange={e => setFormDurationMin(Number(e.target.value))}
                    className="w-full bg-zinc-900 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-orange-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">Session Notes / Client Target</label>
                <textarea
                  rows={2}
                  placeholder="Squat mechanics, knee tracking, barbell load progression..."
                  value={formNotes}
                  onChange={e => setFormNotes(e.target.value)}
                  className="w-full bg-zinc-900 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-white/[0.06]">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-2 rounded-lg text-xs font-medium text-zinc-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg text-xs font-medium bg-white hover:bg-zinc-200 text-zinc-950 tactile-btn"
                >
                  Book Session
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
