import React, { useState } from 'react';
import { useTenant } from '../../context/TenantContext';
import { SessionType, AppointmentStatus } from '../../types';
import { 
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
        return <span className="badge-info px-2 py-0.5 rounded text-[10px] font-mono font-medium">In Progress</span>;
      case 'COMPLETED':
        return <span className="badge-neutral px-2 py-0.5 rounded text-[10px] font-mono font-medium">Completed</span>;
      case 'NO_SHOW':
        return <span className="badge-warning px-2 py-0.5 rounded text-[10px] font-mono font-medium">No Show</span>;
      case 'LATE_CANCEL':
        return <span className="badge-warning px-2 py-0.5 rounded text-[10px] font-mono font-medium">Late Cancel</span>;
      case 'CANCELLED':
        return <span className="badge-danger px-2 py-0.5 rounded text-[10px] font-mono font-medium">Cancelled</span>;
      default:
        return <span className="badge-neutral px-2 py-0.5 rounded text-[10px] font-mono font-medium">Confirmed</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-white/[0.06]">
        <div>
          <h1 className="text-lg font-semibold text-white tracking-tight">Appointments & PT Sessions</h1>
          <p className="text-[13px] text-zinc-400 mt-0.5">
            1-on-1 coach timetables, resource allocation, and direct commission payroll accounting.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="segmented-control inline-flex">
            <button
              onClick={() => setActiveTab('GRID')}
              className={`segmented-tab flex items-center gap-1.5 ${activeTab === 'GRID' ? 'segmented-tab-active' : ''}`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Timeline</span>
            </button>
            <button
              onClick={() => setActiveTab('ROSTER')}
              className={`segmented-tab flex items-center gap-1.5 ${activeTab === 'ROSTER' ? 'segmented-tab-active' : ''}`}
            >
              <List className="w-3.5 h-3.5" />
              <span>Roster</span>
            </button>
            <button
              onClick={() => setActiveTab('PAYROLL')}
              className={`segmented-tab flex items-center gap-1.5 ${activeTab === 'PAYROLL' ? 'segmented-tab-active' : ''}`}
            >
              <DollarSign className="w-3.5 h-3.5" />
              <span>Payroll</span>
            </button>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="btn-primary px-3.5 py-2 rounded-lg text-xs flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Schedule Session</span>
          </button>
        </div>
      </div>

      {/* Financial Summary Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="card p-4">
          <span className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider">Gross PT Bookings</span>
          <div className="text-xl font-semibold text-white font-mono tabular-nums mt-1.5">
            ${totalPtGross.toFixed(2)}
          </div>
          <span className="text-[11px] text-zinc-500 font-mono mt-0.5 block">
            {appointments.filter(a => a.status !== 'CANCELLED').length} active billable sessions
          </span>
        </div>

        <div className="card p-4">
          <span className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider">Coach Commissions</span>
          <div className="text-xl font-semibold text-zinc-200 font-mono tabular-nums mt-1.5">
            ${totalCoachPayouts.toFixed(2)}
          </div>
          <span className="text-[11px] text-zinc-500 font-mono mt-0.5 block">Disbursed to certified trainers</span>
        </div>

        <div className="card p-4">
          <span className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider">Facility Net Margin</span>
          <div className="text-xl font-semibold text-white font-mono tabular-nums mt-1.5">
            ${gymNetPtMargin.toFixed(2)}
          </div>
          <span className="text-[11px] text-zinc-500 font-mono mt-0.5 block">
            Retained facility profit ({totalPtGross > 0 ? Math.round((gymNetPtMargin / totalPtGross) * 100) : 0}%)
          </span>
        </div>
      </div>

      {/* VIEW 1: Resource Timeline Grid */}
      {activeTab === 'GRID' && (
        <div className="card overflow-hidden">
          <div className="px-5 py-3 border-b border-white/[0.06] flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-xs text-white uppercase tracking-wider font-mono">
                Coach Resource Timeline — {formDate}
              </h3>
              <p className="text-[11px] text-zinc-500 mt-0.5">Click any open slot to schedule trainer</p>
            </div>
            <span className="text-xs font-mono text-zinc-500 tabular-nums">{coaches.length} certified coaches</span>
          </div>

          <div className="overflow-x-auto">
            <div className="min-w-[800px]">
              {/* Header row: Coaches */}
              <div className="grid grid-cols-[70px_repeat(auto-fit,minmax(200px,1fr))] border-b border-white/[0.06] bg-[#0e1014]">
                <div className="p-3 text-center text-[10px] font-mono text-zinc-500 border-r border-white/[0.04]">
                  Time
                </div>
                {coaches.map(coach => (
                  <div key={coach.id} className="p-3 border-r border-white/[0.04] last:border-r-0">
                    <div className="font-semibold text-xs text-white flex items-center justify-between">
                      <span>{coach.name}</span>
                      <span className="text-[10px] font-mono text-zinc-400">${coach.hourlyRateCents / 100}/hr</span>
                    </div>
                    <div className="text-[10px] text-zinc-500 truncate mt-0.5">{coach.specialty}</div>
                  </div>
                ))}
              </div>

              {/* Time Slot Rows */}
              <div className="divide-y divide-white/[0.04]">
                {TIME_SLOTS.map(slotTime => (
                  <div key={slotTime} className="grid grid-cols-[70px_repeat(auto-fit,minmax(200px,1fr))] min-h-[52px]">
                    <div className="p-2 text-center text-[11px] font-mono text-zinc-500 bg-[#0c0d10] border-r border-white/[0.04] flex items-center justify-center">
                      {slotTime}
                    </div>

                    {coaches.map(coach => {
                      const appt = appointments.find(a => 
                        a.coachId === coach.id && 
                        a.startTime.startsWith(slotTime.slice(0, 2)) &&
                        a.status !== 'CANCELLED'
                      );

                      return (
                        <div 
                          key={coach.id} 
                          className="p-1 border-r border-white/[0.04] last:border-r-0 relative group hover:bg-white/[0.015] transition-colors"
                        >
                          {appt ? (
                            <div className={`h-full rounded-md p-2 text-xs flex flex-col justify-between border ${
                              appt.status === 'IN_PROGRESS' ? 'bg-blue-950/30 border-blue-500/30 text-blue-200' :
                              appt.status === 'COMPLETED' ? 'bg-[#0e1014] border-white/[0.06] text-zinc-300' :
                              appt.status === 'NO_SHOW' ? 'region-warning text-amber-200' :
                              'bg-[#111317] border-white/[0.08] text-white'
                            }`}>
                              <div className="flex items-start justify-between gap-1">
                                <div className="truncate">
                                  <div className="font-medium text-[12px] truncate">{appt.memberName}</div>
                                  <div className="text-[10px] font-mono text-zinc-500 truncate">{appt.sessionType.replace(/_/g, ' ')}</div>
                                </div>
                                <div className="shrink-0">{getStatusBadge(appt.status)}</div>
                              </div>

                              <div className="flex items-center justify-between text-[10px] font-mono pt-1 mt-1 border-t border-white/[0.04] text-zinc-400">
                                <span>{appt.startTime}–{appt.endTime}</span>
                                <span className="tabular-nums">${(appt.priceCents / 100).toFixed(0)}</span>
                              </div>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleOpenAddWithPrefill(coach.id, slotTime)}
                              className="w-full h-full rounded-md border border-transparent hover:border-dashed hover:border-white/[0.15] flex items-center justify-center text-[11px] text-transparent hover:text-zinc-500 transition-colors"
                            >
                              + Book
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: Roster List */}
      {activeTab === 'ROSTER' && (
        <div className="space-y-4">
          <div className="card p-3 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-zinc-500" />
              <select
                value={selectedCoachId}
                onChange={e => setSelectedCoachId(e.target.value)}
                className="input px-2.5 py-1 text-xs"
              >
                <option value="ALL">All Coaches</option>
                {coaches.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>

              <select
                value={selectedStatus}
                onChange={e => setSelectedStatus(e.target.value)}
                className="input px-2.5 py-1 text-xs"
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

            <span className="text-xs font-mono text-zinc-500 tabular-nums">
              Showing {filteredAppointments.length} sessions
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {filteredAppointments.map(appt => (
              <div key={appt.id} className="card p-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2.5">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="badge-neutral px-2 py-0.5 rounded text-[10px] font-mono">
                          {appt.sessionType.replace(/_/g, ' ')}
                        </span>
                        {getStatusBadge(appt.status)}
                      </div>
                      <h3 className="font-semibold text-[13px] text-white">{appt.memberName}</h3>
                      <div className="text-[11px] text-zinc-400 flex items-center gap-1.5 mt-0.5">
                        <User className="w-3.5 h-3.5 text-zinc-500" />
                        <span>Trainer: <strong className="text-zinc-200">{appt.coachName}</strong></span>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="font-mono text-sm font-semibold text-white tabular-nums">${(appt.priceCents / 100).toFixed(2)}</div>
                      <div className="text-[10px] font-mono text-zinc-500 tabular-nums">
                        Payout: ${(appt.coachPayoutCents / 100).toFixed(2)}
                      </div>
                    </div>
                  </div>

                  <div className="bg-[#0e1014] rounded-lg p-2.5 text-xs space-y-1 mb-3 border border-white/[0.04]">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-zinc-500 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-zinc-600" />
                        Time Slot:
                      </span>
                      <span className="font-mono text-zinc-300">
                        {appt.date} · {appt.startTime}–{appt.endTime}
                      </span>
                    </div>
                    {appt.notes && (
                      <div className="text-[11px] text-zinc-400 italic pt-1 border-t border-white/[0.04]">
                        "{appt.notes}"
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-end gap-1.5 pt-2 border-t border-white/[0.04]">
                  {appt.status === 'CONFIRMED' && (
                    <>
                      <button
                        onClick={() => updateAppointmentStatus(appt.id, 'IN_PROGRESS')}
                        className="btn-primary px-2.5 py-1 rounded text-xs flex items-center gap-1"
                      >
                        <Play className="w-3 h-3" />
                        Start
                      </button>
                      <button
                        onClick={() => updateAppointmentStatus(appt.id, 'NO_SHOW')}
                        className="btn-secondary px-2.5 py-1 rounded text-xs text-amber-300"
                      >
                        <UserX className="w-3 h-3 inline mr-1" />
                        No Show
                      </button>
                      <button
                        onClick={() => updateAppointmentStatus(appt.id, 'LATE_CANCEL')}
                        className="btn-secondary px-2.5 py-1 rounded text-xs text-purple-300"
                      >
                        <AlertTriangle className="w-3 h-3 inline mr-1" />
                        Late Cancel
                      </button>
                    </>
                  )}

                  {appt.status === 'IN_PROGRESS' && (
                    <button
                      onClick={() => updateAppointmentStatus(appt.id, 'COMPLETED')}
                      className="btn-primary px-3 py-1.5 rounded-lg text-xs flex items-center gap-1"
                    >
                      <CheckCircle2 className="w-3 h-3" />
                      Mark Completed
                    </button>
                  )}

                  {appt.status !== 'CANCELLED' && appt.status !== 'COMPLETED' && (
                    <button
                      onClick={() => updateAppointmentStatus(appt.id, 'CANCELLED')}
                      className="px-2 py-1 text-xs text-zinc-500 hover:text-red-400 transition-colors"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW 3: Trainer Payroll Accounting Ledger */}
      {activeTab === 'PAYROLL' && (
        <div className="card overflow-hidden">
          <div className="px-5 py-3.5 border-b border-white/[0.06] flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-xs text-white uppercase tracking-wider font-mono">
                Coach Commission & Payout Accounting Ledger
              </h3>
              <p className="text-[11px] text-zinc-500 mt-0.5">
                Computed from billable completed, confirmed, and late-cancelled sessions.
              </p>
            </div>

            <button
              onClick={handleExportPayrollCSV}
              className="btn-secondary px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5 text-zinc-400" />
              <span>Export CSV</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="table-header">
                  <th className="px-5 py-2.5">Coach</th>
                  <th className="px-5 py-2.5">Specialty</th>
                  <th className="px-5 py-2.5">Hourly Base</th>
                  <th className="px-5 py-2.5">Commission</th>
                  <th className="px-5 py-2.5">Sessions</th>
                  <th className="px-5 py-2.5">Gross Booked</th>
                  <th className="px-5 py-2.5">Coach Payout</th>
                  <th className="px-5 py-2.5 text-right">Facility Margin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {coaches.map(coach => {
                  const coachAppts = appointments.filter(a => a.coachId === coach.id && a.status !== 'CANCELLED');
                  const gross = coachAppts.reduce((sum, a) => sum + a.priceCents, 0) / 100;
                  const payout = coachAppts.reduce((sum, a) => sum + a.coachPayoutCents, 0) / 100;
                  const margin = gross - payout;

                  return (
                    <tr key={coach.id} className="table-row">
                      <td className="px-5 py-3 font-medium text-white flex items-center gap-2">
                        <div className="w-6 h-6 rounded-md bg-[#0e1014] text-zinc-300 font-bold text-[10px] flex items-center justify-center border border-white/[0.06]">
                          {coach.name.charAt(0)}
                        </div>
                        <span>{coach.name}</span>
                      </td>
                      <td className="px-5 py-3 text-zinc-400">{coach.specialty}</td>
                      <td className="px-5 py-3 font-mono text-zinc-300 tabular-nums">${(coach.hourlyRateCents / 100).toFixed(2)}</td>
                      <td className="px-5 py-3 font-mono text-zinc-400 tabular-nums">{coach.commissionRatePct}%</td>
                      <td className="px-5 py-3 font-mono text-zinc-300 tabular-nums">{coachAppts.length}</td>
                      <td className="px-5 py-3 font-mono text-white font-medium tabular-nums">${gross.toFixed(2)}</td>
                      <td className="px-5 py-3 font-mono text-zinc-300 tabular-nums">${payout.toFixed(2)}</td>
                      <td className="px-5 py-3 font-mono text-right text-emerald-400 font-medium tabular-nums">${margin.toFixed(2)}</td>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-overlay">
          <div className="modal-panel w-full max-w-lg rounded-xl p-6 relative space-y-4">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div>
              <h3 className="font-semibold text-white text-sm">Schedule 1-on-1 Session</h3>
              <p className="text-xs text-zinc-500 mt-0.5">Assign trainer, allocate slot & calculate commission rate.</p>
            </div>

            <form onSubmit={handleCreateAppointment} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-zinc-400 mb-1">Select Coach</label>
                  <select
                    value={formCoachId}
                    onChange={e => setFormCoachId(e.target.value)}
                    className="w-full input px-3 py-2 text-xs"
                  >
                    {coaches.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name} (${(c.hourlyRateCents / 100)}/hr)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-zinc-400 mb-1">Session Type</label>
                  <select
                    value={formSessionType}
                    onChange={e => setFormSessionType(e.target.value as SessionType)}
                    className="w-full input px-3 py-2 text-xs"
                  >
                    <option value="PERSONAL_TRAINING">Personal Training 60m</option>
                    <option value="FITNESS_ASSESSMENT">Movement & InBody Screen</option>
                    <option value="BOXING_PADWORK">Boxing / Padwork Conditioning</option>
                    <option value="NUTRITION_CONSULT">Nutrition & Macro Consult</option>
                    <option value="REHAB_RECOVERY">Rehab & Mobility Protocol</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-zinc-400 mb-1">Member Name</label>
                  <input
                    type="text"
                    required
                    placeholder="David Vance"
                    value={formMemberName}
                    onChange={e => setFormMemberName(e.target.value)}
                    className="w-full input px-3 py-2 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-zinc-400 mb-1">Member Phone</label>
                  <input
                    type="tel"
                    required
                    placeholder="+1 (512) 555-0182"
                    value={formMemberPhone}
                    onChange={e => setFormMemberPhone(e.target.value)}
                    className="w-full input px-3 py-2 text-xs font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-zinc-400 mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={formDate}
                    onChange={e => setFormDate(e.target.value)}
                    className="w-full input px-3 py-2 text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-zinc-400 mb-1">Start Time</label>
                  <input
                    type="time"
                    required
                    value={formStartTime}
                    onChange={e => setFormStartTime(e.target.value)}
                    className="w-full input px-3 py-2 text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-zinc-400 mb-1">Duration (Min)</label>
                  <input
                    type="number"
                    value={formDurationMin}
                    onChange={e => setFormDurationMin(Number(e.target.value))}
                    className="w-full input px-3 py-2 text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-zinc-400 mb-1">Client Goals / Session Notes</label>
                <textarea
                  rows={2}
                  placeholder="Barbell mechanics, knee tracking, loading progression..."
                  value={formNotes}
                  onChange={e => setFormNotes(e.target.value)}
                  className="w-full input px-3 py-2 text-xs"
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
                  className="btn-primary px-4 py-2 rounded-lg text-xs"
                >
                  Confirm Booking
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
