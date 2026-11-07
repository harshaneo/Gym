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
  Briefcase,
  Globe,
  ShoppingBag,
  TrendingDown,
  Wrench,
  Landmark,
  QrCode,
  Dumbbell,
  Snowflake
} from 'lucide-react';
import { NavTab } from '../types';

export type { NavTab };

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, onSelectTab }) => {
  const { currentTenant, leads, appointments, bankSlips, currentRole, setRole } = useTenant();

  const occupancyRatio = (currentTenant.currentOccupancy / currentTenant.fireCodeMaxCapacity) * 100;
  const todayApptsCount = appointments.filter(a => a.date === '2026-11-07').length;
  const activeLeadsCount = leads.filter(l => l.stage !== 'WON_MEMBER' && l.stage !== 'LOST').length;
  const pendingSlipsCount = bankSlips?.filter(s => s.status === 'PENDING_VERIFICATION').length || 0;

  const allNavItems = [
    { id: 'overview' as NavTab, label: 'Overview', icon: LayoutDashboard, roles: ['GYM_OWNER'] },
    { id: 'kiosk' as NavTab, label: 'Check-In', icon: UserCheck, roles: ['GYM_OWNER', 'FRONT_DESK_STAFF'] },
    { id: 'bank-slips' as NavTab, label: 'Bank Slips & QR', icon: QrCode, count: pendingSlipsCount, roles: ['GYM_OWNER', 'FRONT_DESK_STAFF'] },
    { id: 'pt-punch' as NavTab, label: 'PT Packages', icon: Dumbbell, roles: ['GYM_OWNER', 'FRONT_DESK_STAFF'] },
    { id: 'appointments' as NavTab, label: 'Appointments', icon: CalendarClock, count: todayApptsCount, roles: ['GYM_OWNER', 'FRONT_DESK_STAFF'] },
    { id: 'classes' as NavTab, label: 'Classes', icon: CalendarRange, roles: ['GYM_OWNER', 'FRONT_DESK_STAFF'] },
    { id: 'pos' as NavTab, label: 'Retail & POS', icon: ShoppingBag, roles: ['GYM_OWNER', 'FRONT_DESK_STAFF'] },
    { id: 'payroll' as NavTab, label: 'Trainer Payroll', icon: Landmark, roles: ['GYM_OWNER'] },
    { id: 'freezes' as NavTab, label: 'Member Freezes', icon: Snowflake, roles: ['GYM_OWNER'] },
    { id: 'crm' as NavTab, label: 'Pipeline', icon: Target, count: activeLeadsCount, roles: ['GYM_OWNER'] },
    { id: 'retention' as NavTab, label: 'Retention Radar', icon: TrendingDown, roles: ['GYM_OWNER'] },
    { id: 'members' as NavTab, label: 'Members', icon: Users2, roles: ['GYM_OWNER'] },
    { id: 'equipment' as NavTab, label: 'Equipment & Ops', icon: Wrench, roles: ['GYM_OWNER'] },
    { id: 'promotions' as NavTab, label: 'Promotions', icon: Ticket, roles: ['GYM_OWNER'] },
    { id: 'settings' as NavTab, label: 'Settings', icon: Settings, roles: ['GYM_OWNER'] },
  ];

  const visibleItems = allNavItems.filter(item => item.roles.includes(currentRole));

  return (
    <aside className="hidden md:flex w-56 bg-[#08090b] border-r border-white/[0.06] flex-col justify-between shrink-0 h-[calc(100vh-48px)] sticky top-12 select-none">
      <div className="p-2.5 flex flex-col flex-1 overflow-y-auto">
        {/* Role Switcher */}
        <div className="mb-2 px-0.5">
          <div className="segmented-control flex items-center gap-0.5">
            <button
              onClick={() => setRole('GYM_OWNER')}
              className={`segmented-tab flex-1 flex items-center justify-center gap-1.5 text-[11px] ${
                currentRole === 'GYM_OWNER' ? 'segmented-tab-active' : ''
              }`}
            >
              <Briefcase className="w-3 h-3" />
              Owner
            </button>
            <button
              onClick={() => setRole('FRONT_DESK_STAFF')}
              className={`segmented-tab flex-1 flex items-center justify-center gap-1.5 text-[11px] ${
                currentRole === 'FRONT_DESK_STAFF' ? 'segmented-tab-active' : ''
              }`}
            >
              <Shield className="w-3 h-3" />
              Staff
            </button>
          </div>
        </div>

        {/* Section Label */}
        <div className="text-[10px] font-mono uppercase tracking-wider text-zinc-600 px-2.5 py-2 flex items-center justify-between">
          <span>{currentRole === 'FRONT_DESK_STAFF' ? 'Shift Terminal' : 'Management'}</span>
          {currentRole === 'FRONT_DESK_STAFF' && (
            <span className="badge-warning px-1.5 py-0.5 rounded text-[9px] font-mono font-medium">
              Staff
            </span>
          )}
        </div>

        <nav className="space-y-0.5">
          {visibleItems.map(item => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-2.5 py-[7px] rounded-md text-[12px] font-medium transition-colors ${
                  isActive
                    ? 'bg-white text-zinc-950 font-semibold'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.03]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-zinc-950' : 'text-zinc-500'}`} />
                  <span>{item.label}</span>
                </div>
                {typeof item.count === 'number' && item.count > 0 && (
                  <span className={`px-1.5 py-px rounded text-[10px] font-mono tabular-nums ${
                    isActive ? 'bg-zinc-200 text-zinc-800' : 'bg-white/[0.06] text-zinc-500'
                  }`}>
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom: Occupancy */}
      <div className="p-2.5 border-t border-white/[0.06]">
        <div className="bg-[#0e1014] border border-white/[0.04] rounded-lg p-2.5">
          <div className="flex items-center justify-between text-[11px] mb-2">
            <span className="text-zinc-500 flex items-center gap-1.5 font-medium">
              <Activity className="w-3 h-3 text-zinc-600" />
              Attendance
            </span>
            <span className="font-mono text-zinc-300 tabular-nums text-[11px]">
              {currentTenant.currentOccupancy}<span className="text-zinc-600">/{currentTenant.fireCodeMaxCapacity}</span>
            </span>
          </div>
          <div className="progress-track">
            <div 
              className={`progress-fill ${occupancyRatio > 85 ? 'progress-fill-warn' : ''}`}
              style={{ width: `${Math.min(occupancyRatio, 100)}%` }}
            />
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
  const { currentTenant, leads, appointments, bankSlips, currentRole, setRole, setViewMode } = useTenant();

  if (!isOpen) return null;

  const occupancyRatio = (currentTenant.currentOccupancy / currentTenant.fireCodeMaxCapacity) * 100;
  const todayApptsCount = appointments.filter(a => a.date === '2026-11-07').length;
  const activeLeadsCount = leads.filter(l => l.stage !== 'WON_MEMBER' && l.stage !== 'LOST').length;
  const pendingSlipsCount = bankSlips?.filter(s => s.status === 'PENDING_VERIFICATION').length || 0;

  const allNavItems = [
    { id: 'overview' as NavTab, label: 'Overview', icon: LayoutDashboard, roles: ['GYM_OWNER'] },
    { id: 'kiosk' as NavTab, label: 'Check-In', icon: UserCheck, roles: ['GYM_OWNER', 'FRONT_DESK_STAFF'] },
    { id: 'bank-slips' as NavTab, label: 'Bank Slips & QR', icon: QrCode, count: pendingSlipsCount, roles: ['GYM_OWNER', 'FRONT_DESK_STAFF'] },
    { id: 'pt-punch' as NavTab, label: 'PT Packages', icon: Dumbbell, roles: ['GYM_OWNER', 'FRONT_DESK_STAFF'] },
    { id: 'appointments' as NavTab, label: 'Appointments', icon: CalendarClock, count: todayApptsCount, roles: ['GYM_OWNER', 'FRONT_DESK_STAFF'] },
    { id: 'classes' as NavTab, label: 'Classes', icon: CalendarRange, roles: ['GYM_OWNER', 'FRONT_DESK_STAFF'] },
    { id: 'pos' as NavTab, label: 'Retail & POS', icon: ShoppingBag, roles: ['GYM_OWNER', 'FRONT_DESK_STAFF'] },
    { id: 'payroll' as NavTab, label: 'Trainer Payroll', icon: Landmark, roles: ['GYM_OWNER'] },
    { id: 'freezes' as NavTab, label: 'Member Freezes', icon: Snowflake, roles: ['GYM_OWNER'] },
    { id: 'crm' as NavTab, label: 'Pipeline', icon: Target, count: activeLeadsCount, roles: ['GYM_OWNER'] },
    { id: 'retention' as NavTab, label: 'Retention Radar', icon: TrendingDown, roles: ['GYM_OWNER'] },
    { id: 'members' as NavTab, label: 'Members', icon: Users2, roles: ['GYM_OWNER'] },
    { id: 'equipment' as NavTab, label: 'Equipment & Ops', icon: Wrench, roles: ['GYM_OWNER'] },
    { id: 'promotions' as NavTab, label: 'Promotions', icon: Ticket, roles: ['GYM_OWNER'] },
    { id: 'settings' as NavTab, label: 'Settings', icon: Settings, roles: ['GYM_OWNER'] },
  ];

  const visibleItems = allNavItems.filter(item => item.roles.includes(currentRole));

  return (
    <div className="fixed inset-0 z-50 md:hidden flex">
      <div 
        className="fixed inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative w-64 max-w-[80vw] bg-[#08090b] border-r border-white/[0.06] flex flex-col justify-between h-full z-10 shadow-2xl">
        <div className="p-3.5 flex flex-col flex-1 overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/[0.06]">
            <div className="flex flex-col">
              <span className="font-medium text-[12px] text-white flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full dot-live" />
                {currentTenant.name}
              </span>
              <span className="font-mono text-[10px] text-zinc-500 mt-px pl-3">
                {currentTenant.subdomain}
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-md text-zinc-500 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Role Switcher */}
          <div className="segmented-control flex items-center gap-0.5 mb-3">
            <button
              onClick={() => setRole('GYM_OWNER')}
              className={`segmented-tab flex-1 flex items-center justify-center gap-1.5 text-[11px] ${
                currentRole === 'GYM_OWNER' ? 'segmented-tab-active' : ''
              }`}
            >
              <Briefcase className="w-3 h-3" />
              Owner
            </button>
            <button
              onClick={() => setRole('FRONT_DESK_STAFF')}
              className={`segmented-tab flex-1 flex items-center justify-center gap-1.5 text-[11px] ${
                currentRole === 'FRONT_DESK_STAFF' ? 'segmented-tab-active' : ''
              }`}
            >
              <Shield className="w-3 h-3" />
              Staff
            </button>
          </div>

          {/* Nav */}
          <nav className="space-y-0.5">
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
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded-md text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-white text-zinc-950 font-semibold'
                      : 'text-zinc-400 hover:text-white hover:bg-white/[0.03]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-zinc-950' : 'text-zinc-500'}`} />
                    <span>{item.label}</span>
                  </div>
                  {typeof item.count === 'number' && item.count > 0 && (
                    <span className={`px-1.5 py-px rounded text-[10px] font-mono ${
                      isActive ? 'bg-zinc-200 text-zinc-800' : 'bg-white/[0.06] text-zinc-500'
                    }`}>
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Portal Link */}
          <div className="mt-4 pt-3 border-t border-white/[0.06]">
            <button
              onClick={() => {
                setViewMode('PUBLIC_MEMBER_PORTAL');
                onClose();
              }}
              className="w-full flex items-center justify-between px-2.5 py-2 rounded-md btn-secondary text-xs"
            >
              <span className="flex items-center gap-2">
                <Globe className="w-3.5 h-3.5" />
                View Member Portal
              </span>
            </button>
          </div>
        </div>

        {/* Occupancy */}
        <div className="p-3.5 border-t border-white/[0.06]">
          <div className="bg-[#0e1014] border border-white/[0.04] rounded-lg p-2.5">
            <div className="flex items-center justify-between text-[11px] mb-2">
              <span className="text-zinc-500 flex items-center gap-1.5">
                <Activity className="w-3 h-3 text-zinc-600" />
                Attendance
              </span>
              <span className="font-mono text-zinc-300 tabular-nums text-[11px]">
                {currentTenant.currentOccupancy}<span className="text-zinc-600">/{currentTenant.fireCodeMaxCapacity}</span>
              </span>
            </div>
            <div className="progress-track">
              <div 
                className={`progress-fill ${occupancyRatio > 85 ? 'progress-fill-warn' : ''}`}
                style={{ width: `${Math.min(occupancyRatio, 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
