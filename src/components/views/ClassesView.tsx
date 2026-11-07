import React, { useState } from 'react';
import { useTenant } from '../../context/TenantContext';
import { Dumbbell, Clock, MapPin, Plus, X } from 'lucide-react';

export const ClassesView: React.FC = () => {
  const { classes, coaches } = useTenant();
  const [showAddModal, setShowAddModal] = useState(false);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-white/[0.06]">
        <div>
          <h1 className="text-lg font-semibold text-white tracking-tight">Group Classes & Timetable</h1>
          <p className="text-[13px] text-zinc-400 mt-0.5">
            Manage group timetables, room capacity thresholds, and instructor allocations.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="btn-primary px-3.5 py-2 rounded-lg text-xs flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Class</span>
        </button>
      </div>

      {/* Classes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {classes.map(cls => {
          const fillPct = Math.round((cls.bookedCount / cls.capacity) * 100);
          const isFull = cls.bookedCount >= cls.capacity;

          return (
            <div key={cls.id} className="card p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="badge-neutral px-2 py-0.5 rounded text-[10px] font-mono font-medium">
                    {cls.category}
                  </span>
                  <span className="text-[11px] font-mono text-zinc-500">
                    {cls.intensity}
                  </span>
                </div>

                <h3 className="text-sm font-semibold text-white mb-2">{cls.name}</h3>
                
                <div className="space-y-1.5 text-xs text-zinc-400 mb-4">
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-zinc-500" />
                    <span>{cls.startTime} – {cls.endTime} (60 min)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-zinc-500" />
                    <span>{cls.room}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Dumbbell className="w-3.5 h-3.5 text-zinc-500" />
                    <span>Instructor: <strong className="text-zinc-200">{cls.coachName}</strong></span>
                  </div>
                </div>
              </div>

              {/* Capacity meter */}
              <div className="pt-3 border-t border-white/[0.04] space-y-1.5">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-zinc-500 text-[11px]">Roster Attendance</span>
                  <span className="text-zinc-300 tabular-nums text-xs">
                    {cls.bookedCount} / {cls.capacity} booked ({fillPct}%)
                  </span>
                </div>
                <div className="progress-track">
                  <div 
                    className={`progress-fill ${isFull ? 'progress-fill-warn' : ''}`}
                    style={{ width: `${Math.min(fillPct, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Class Modal Simulation */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-overlay">
          <div className="modal-panel w-full max-w-md rounded-xl p-6 relative space-y-4">
            <button
              onClick={() => setShowAddModal(false)}
              className="text-zinc-500 hover:text-white absolute top-4 right-4"
            >
              <X className="w-4 h-4" />
            </button>

            <div>
              <h3 className="font-semibold text-white text-sm">Add Group Fitness Class</h3>
              <p className="text-xs text-zinc-500 mt-0.5">Define room, instructor assignment, and fire-code cap.</p>
            </div>

            <form onSubmit={e => { e.preventDefault(); setShowAddModal(false); }} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-medium text-zinc-400 mb-1">Class Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Olympic Barbell Fundamentals"
                  className="w-full input px-3 py-2 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-zinc-400 mb-1">Coach</label>
                  <select className="w-full input px-3 py-2 text-xs">
                    {coaches.map(c => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-zinc-400 mb-1">Max Capacity</label>
                  <input
                    type="number"
                    defaultValue={18}
                    className="w-full input px-3 py-2 text-xs font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-zinc-400 mb-1">Start Time</label>
                  <input
                    type="time"
                    defaultValue="09:00"
                    className="w-full input px-3 py-2 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-zinc-400 mb-1">End Time</label>
                  <input
                    type="time"
                    defaultValue="10:00"
                    className="w-full input px-3 py-2 text-xs font-mono"
                  />
                </div>
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
                  Save Class
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
