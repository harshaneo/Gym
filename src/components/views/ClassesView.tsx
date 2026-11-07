import React from 'react';
import { useTenant } from '../../context/TenantContext';
import { Dumbbell, Clock, MapPin, Plus } from 'lucide-react';

export const ClassesView: React.FC = () => {
  const { classes } = useTenant();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Group Classes & Timetable</h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Manage group timetables, room capacity thresholds, and instructor allocations.
          </p>
        </div>

        <button
          className="px-3.5 py-2 rounded-lg font-medium text-xs bg-white hover:bg-zinc-200 text-zinc-950 tactile-btn flex items-center gap-1.5 self-start sm:self-auto"
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
            <div key={cls.id} className="bg-[#111317] rounded-xl p-5 border border-white/[0.08] hover:border-white/[0.14] transition-colors flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-white/[0.06] text-zinc-300">
                    {cls.category}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono text-zinc-500">
                    {cls.intensity}
                  </span>
                </div>

                <h3 className="text-sm font-semibold text-white mb-2">{cls.name}</h3>
                
                <div className="space-y-1.5 text-xs text-zinc-400 mb-4">
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-zinc-500" />
                    <span>{cls.startTime} – {cls.endTime} (60 mins)</span>
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
                  <span className="text-zinc-200 font-semibold text-xs">
                    {cls.bookedCount} / {cls.capacity} booked ({fillPct}%)
                  </span>
                </div>
                <div className="w-full bg-zinc-800 rounded-full h-1 overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-300 ${
                      isFull ? 'bg-amber-400' : 'bg-white'
                    }`}
                    style={{ width: `${Math.min(fillPct, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
