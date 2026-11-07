import React from 'react';
import { useTenant } from '../context/TenantContext';
import { 
  LayoutDashboard, 
  UserCheck, 
  CalendarClock, 
  Ticket, 
  Target, 
  Users2, 
  CalendarRange, 
  Settings,
  Activity
} from 'lucide-react';

export type NavTab = 
  | 'overview' 
  | 'kiosk' 
  | 'appointments' 
  | 'promotions' 
  | 'crm' 
  | 'members' 
  | 'classes' 
  | 'settings';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, onSelectTab }) => {
  const { currentTenant, leads, appointments } = useTenant();

  const occupancyRatio = (currentTenant.currentOccupancy / currentTenant.fireCodeMaxCapacity) * 100;

  const todayApptsCount = appointments.filter(a => a.date === '2026-11-07').length;
  const activeLeadsCount = leads.filter(l => l.stage !== 'WON_MEMBER' && l.stage !== 'LOST').length;

  const navItems = [
    { id: 'overview' as NavTab, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'kiosk' as NavTab, label: 'Check-In', icon: UserCheck },
    { id: 'appointments' as NavTab, label: 'Appointments', icon: CalendarClock, count: todayApptsCount },
    { id: 'classes' as NavTab, label: 'Classes & Timetable', icon: CalendarRange },
    { id: 'crm' as NavTab, label: 'CRM & Pipeline', icon: Target, count: activeLeadsCount },
    { id: 'promotions' as NavTab, label: 'Promotions', icon: Ticket },
    { id: 'members' as NavTab, label: 'Members', icon: Users2 },
    { id: 'settings' as NavTab, label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-60 bg-[#090a0c] border-r border-white/[0.08] flex flex-col justify-between shrink-0 h-[calc(100vh-44px)] sticky top-[44px]">
      <div className="p-3 flex flex-col flex-1 overflow-y-auto">
        {/* Navigation Items */}
        <div className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 px-3 py-2">
          Management
        </div>
        <nav className="space-y-0.5">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-white text-zinc-950 font-semibold shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-zinc-950' : 'text-zinc-400'}`} />
                  <span>{item.label}</span>
                </div>
                {typeof item.count === 'number' && item.count > 0 && (
                  <span className={`px-1.5 py-0.2 rounded text-[10px] font-mono ${
                    isActive ? 'bg-zinc-200 text-zinc-900 font-bold' : 'bg-white/[0.08] text-zinc-400'
                  }`}>
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Facility Attendance Indicator */}
      <div className="p-3 border-t border-white/[0.08] bg-[#090a0c]">
        <div className="bg-[#111317] border border-white/[0.06] rounded-lg p-3">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-zinc-400 flex items-center gap-1.5 font-medium text-[11px]">
              <Activity className="w-3.5 h-3.5 text-zinc-400" />
              Attendance
            </span>
            <span className="font-mono text-zinc-200 text-xs font-semibold">
              {currentTenant.currentOccupancy} <span className="text-zinc-400 font-normal">/ {currentTenant.fireCodeMaxCapacity}</span>
            </span>
          </div>

          <div className="w-full bg-zinc-800 rounded-full h-1.5 overflow-hidden">
            <div 
              className="h-full bg-white transition-all duration-300 rounded-full"
              style={{ width: `${Math.min(occupancyRatio, 100)}%` }}
            />
          </div>

          <div className="flex items-center justify-between mt-2 text-[10px] text-zinc-400 font-mono">
            <span>{Math.round(occupancyRatio)}% capacity</span>
            <span className="text-zinc-400">Within Limit</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
