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
  Activity,
  X,
  Shield,
  Briefcase
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
  const { currentTenant, leads, appointments, currentRole, setRole } = useTenant();

  const occupancyRatio = (currentTenant.currentOccupancy / currentTenant.fireCodeMaxCapacity) * 100;

  const todayApptsCount = appointments.filter(a => a.date === '2026-11-07').length;
  const activeLeadsCount = leads.filter(l => l.stage !== 'WON_MEMBER' && l.stage !== 'LOST').length;

  const allNavItems = [
    { id: 'overview' as NavTab, label: 'Dashboard', icon: LayoutDashboard, roles: ['GYM_OWNER'] },
    { id: 'kiosk' as NavTab, label: 'Check-In', icon: UserCheck, roles: ['GYM_OWNER', 'FRONT_DESK_STAFF'] },
    { id: 'appointments' as NavTab, label: 'Appointments', icon: CalendarClock, count: todayApptsCount, roles: ['GYM_OWNER', 'FRONT_DESK_STAFF'] },
    { id: 'classes' as NavTab, label: 'Classes & Timetable', icon: CalendarRange, roles: ['GYM_OWNER', 'FRONT_DESK_STAFF'] },
    { id: 'crm' as NavTab, label: 'CRM & Pipeline', icon: Target, count: activeLeadsCount, roles: ['GYM_OWNER'] },
    { id: 'promotions' as NavTab, label: 'Promotions', icon: Ticket, roles: ['GYM_OWNER'] },
    { id: 'members' as NavTab, label: 'Members', icon: Users2, roles: ['GYM_OWNER'] },
    { id: 'settings' as NavTab, label: 'Settings', icon: Settings, roles: ['GYM_OWNER'] },
  ];

  const visibleItems = allNavItems.filter(item => item.roles.includes(currentRole));

  return (
    <aside className="hidden md:flex w-60 bg-[#090a0c] border-r border-white/[0.08] flex-col justify-between shrink-0 h-[calc(100vh-56px)] sticky top-14 select-none">
      <div className="p-3 flex flex-col flex-1 overflow-y-auto">
        {/* Role Perspective Switcher Pill */}
        <div className="mb-3 px-1">
          <div className="bg-[#111317] border border-white/[0.06] rounded-lg p-1 flex items-center gap-1">
            <button
              onClick={() => setRole('GYM_OWNER')}
              className={`flex-1 py-1.5 px-2 rounded-md text-[11px] font-medium flex items-center justify-center gap-1.5 transition-colors ${
                currentRole === 'GYM_OWNER'
                  ? 'bg-white text-zinc-950 font-semibold shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Briefcase className="w-3 h-3" />
              <span>Owner</span>
            </button>
            <button
              onClick={() => setRole('FRONT_DESK_STAFF')}
              className={`flex-1 py-1.5 px-2 rounded-md text-[11px] font-medium flex items-center justify-center gap-1.5 transition-colors ${
                currentRole === 'FRONT_DESK_STAFF'
                  ? 'bg-white text-zinc-950 font-semibold shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Shield className="w-3 h-3" />
              <span>Staff Shift</span>
            </button>
          </div>
        </div>

        {/* Section Label */}
        <div className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 px-3 py-1.5 flex items-center justify-between">
          <span>{currentRole === 'FRONT_DESK_STAFF' ? 'Shift Terminal' : 'Management'}</span>
          {currentRole === 'FRONT_DESK_STAFF' && (
            <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-amber-950/60 text-amber-300 border border-amber-500/20">
              Staff Mode
            </span>
          )}
        </div>

        <nav className="space-y-0.5 mt-1">
          {visibleItems.map(item => {
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

export const MobileDrawer: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
}> = ({ isOpen, onClose, currentTab, onSelectTab }) => {
  const { currentTenant, leads, appointments, currentRole, setRole, setViewMode } = useTenant();

  if (!isOpen) return null;

  const occupancyRatio = (currentTenant.currentOccupancy / currentTenant.fireCodeMaxCapacity) * 100;
  const todayApptsCount = appointments.filter(a => a.date === '2026-11-07').length;
  const activeLeadsCount = leads.filter(l => l.stage !== 'WON_MEMBER' && l.stage !== 'LOST').length;

  const allNavItems = [
    { id: 'overview' as NavTab, label: 'Dashboard', icon: LayoutDashboard, roles: ['GYM_OWNER'] },
    { id: 'kiosk' as NavTab, label: 'Check-In Terminal', icon: UserCheck, roles: ['GYM_OWNER', 'FRONT_DESK_STAFF'] },
    { id: 'appointments' as NavTab, label: 'Appointments', icon: CalendarClock, count: todayApptsCount, roles: ['GYM_OWNER', 'FRONT_DESK_STAFF'] },
    { id: 'classes' as NavTab, label: 'Classes & Timetable', icon: CalendarRange, roles: ['GYM_OWNER', 'FRONT_DESK_STAFF'] },
    { id: 'crm' as NavTab, label: 'CRM & Pipeline', icon: Target, count: activeLeadsCount, roles: ['GYM_OWNER'] },
    { id: 'promotions' as NavTab, label: 'Promotions', icon: Ticket, roles: ['GYM_OWNER'] },
    { id: 'members' as NavTab, label: 'Members', icon: Users2, roles: ['GYM_OWNER'] },
    { id: 'settings' as NavTab, label: 'Settings', icon: Settings, roles: ['GYM_OWNER'] },
  ];

  const visibleItems = allNavItems.filter(item => item.roles.includes(currentRole));

  return (
    <div className="fixed inset-0 z-50 md:hidden flex">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/80 backdrop-blur-sm animate-in fade-in"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="relative w-72 max-w-[80vw] bg-[#090a0c] border-r border-white/[0.08] flex flex-col justify-between h-full z-10 shadow-2xl animate-in slide-in-from-left duration-200">
        <div className="p-4 flex flex-col flex-1 overflow-y-auto">
          {/* Top Brand & Close */}
          <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
            <div className="flex flex-col">
              <span className="font-semibold text-xs text-white flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full dot-approved" />
                {currentTenant.name}
              </span>
              <span className="font-mono text-[10px] text-zinc-400 mt-0.5">
                {currentTenant.subdomain}
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-zinc-900 border border-white/[0.08] text-zinc-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Role Perspective Switcher */}
          <div className="mt-4 bg-[#111317] border border-white/[0.06] rounded-lg p-1 flex items-center gap-1">
            <button
              onClick={() => setRole('GYM_OWNER')}
              className={`flex-1 py-1.5 px-2 rounded-md text-[11px] font-medium flex items-center justify-center gap-1.5 transition-colors ${
                currentRole === 'GYM_OWNER'
                  ? 'bg-white text-zinc-950 font-semibold shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Briefcase className="w-3 h-3" />
              <span>Owner</span>
            </button>
            <button
              onClick={() => setRole('FRONT_DESK_STAFF')}
              className={`flex-1 py-1.5 px-2 rounded-md text-[11px] font-medium flex items-center justify-center gap-1.5 transition-colors ${
                currentRole === 'FRONT_DESK_STAFF'
                  ? 'bg-white text-zinc-950 font-semibold shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Shield className="w-3 h-3" />
              <span>Staff Shift</span>
            </button>
          </div>

          {/* Navigation Links */}
          <div className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 px-2 pt-4 pb-1.5">
            Navigation
          </div>

          <nav className="space-y-1">
            {visibleItems.map(item => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelectTab(item.id);
                    onClose();
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-white text-zinc-950 font-semibold shadow-sm'
                      : 'text-zinc-300 hover:text-white hover:bg-white/[0.04]'
                  }`}
                >
                  <div className="flex items-center gap-3">
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

          {/* Public Portal Switcher */}
          <div className="mt-4 pt-4 border-t border-white/[0.08]">
            <button
              onClick={() => {
                setViewMode('PUBLIC_MEMBER_PORTAL');
                onClose();
              }}
              className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-white/[0.08] text-xs text-zinc-300 font-medium"
            >
              <span>View Member Portal</span>
              <span className="text-[10px] font-mono text-zinc-400">Public</span>
            </button>
          </div>
        </div>

        {/* Bottom Occupancy */}
        <div className="p-4 border-t border-white/[0.08] bg-[#090a0c]">
          <div className="bg-[#111317] border border-white/[0.06] rounded-lg p-3">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-zinc-400 flex items-center gap-1.5 font-medium text-[11px]">
                <Activity className="w-3.5 h-3.5 text-zinc-400" />
                Attendance
              </span>
              <span className="font-mono text-zinc-200 text-xs font-semibold">
                {currentTenant.currentOccupancy} / {currentTenant.fireCodeMaxCapacity}
              </span>
            </div>

            <div className="w-full bg-zinc-800 rounded-full h-1.5 overflow-hidden">
              <div 
                className="h-full bg-white transition-all duration-300 rounded-full"
                style={{ width: `${Math.min(occupancyRatio, 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
