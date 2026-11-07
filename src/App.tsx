import React, { useState, useEffect } from 'react';
import { TenantProvider, useTenant } from './context/TenantContext';
import { SubdomainSwitcherBar } from './components/SubdomainSwitcherBar';
import { Sidebar, MobileDrawer, NavTab } from './components/Sidebar';
import { OverviewView } from './components/views/OverviewView';
import { KioskCheckInView } from './components/views/KioskCheckInView';
import { AppointmentsView } from './components/views/AppointmentsView';
import { PromotionsView } from './components/views/PromotionsView';
import { CRMLeadsView } from './components/views/CRMLeadsView';
import { MembersView } from './components/views/MembersView';
import { ClassesView } from './components/views/ClassesView';
import { GymSettingsView } from './components/views/GymSettingsView';
import { RetailPOSView } from './components/views/RetailPOSView';
import { RetentionRadarView } from './components/views/RetentionRadarView';
import { EquipmentTrackerView } from './components/views/EquipmentTrackerView';
import { TrainerPayrollView } from './components/views/TrainerPayrollView';
import { BankSlipPaymentsView } from './components/views/BankSlipPaymentsView';
import { PTPunchCardView } from './components/views/PTPunchCardView';
import { MembershipFreezeView } from './components/views/MembershipFreezeView';
import { WhatsAppDispatchModal } from './components/WhatsAppDispatchModal';
import { PublicPortalPreview } from './components/views/PublicPortalPreview';
import { PlatformControlPlaneView } from './components/views/PlatformControlPlaneView';
import { 
  LayoutDashboard, 
  UserCheck, 
  CalendarClock, 
  CalendarRange, 
  MoreHorizontal 
} from 'lucide-react';

const MainLayout: React.FC = () => {
  const { viewMode, currentRole } = useTenant();
  const [currentTab, setCurrentTab] = useState<NavTab>('overview');
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  useEffect(() => {
    if (currentRole === 'FRONT_DESK_STAFF') {
      if (['overview', 'crm', 'promotions', 'members', 'settings'].includes(currentTab)) {
        setCurrentTab('kiosk');
      }
    }
  }, [currentRole, currentTab]);

  if (currentRole === 'PLATFORM_SUPER_ADMIN') {
    return (
      <div className="min-h-screen bg-[#08090b] flex flex-col text-zinc-100">
        <SubdomainSwitcherBar />
        <main className="flex-1 p-4 md:p-8 overflow-y-auto">
          <PlatformControlPlaneView />
        </main>
      </div>
    );
  }

  if (viewMode === 'PUBLIC_MEMBER_PORTAL') {
    return (
      <div className="min-h-screen bg-[#08090b] flex flex-col text-zinc-100">
        <SubdomainSwitcherBar />
        <PublicPortalPreview />
      </div>
    );
  }

  const ownerTabs = [
    { id: 'overview' as NavTab, icon: LayoutDashboard, label: 'Overview' },
    { id: 'kiosk' as NavTab, icon: UserCheck, label: 'Check-In' },
    { id: 'appointments' as NavTab, icon: CalendarClock, label: 'Schedule' },
    { id: 'classes' as NavTab, icon: CalendarRange, label: 'Classes' },
  ];

  const staffTabs = [
    { id: 'kiosk' as NavTab, icon: UserCheck, label: 'Check-In' },
    { id: 'classes' as NavTab, icon: CalendarRange, label: 'Timetable' },
    { id: 'appointments' as NavTab, icon: CalendarClock, label: 'Sessions' },
  ];

  const mobileTabs = currentRole === 'GYM_OWNER' ? ownerTabs : staffTabs;

  return (
    <div className="min-h-screen bg-[#08090b] flex flex-col text-zinc-100">
      <SubdomainSwitcherBar onOpenMobileDrawer={() => setMobileDrawerOpen(true)} />

      <MobileDrawer
        isOpen={mobileDrawerOpen}
        onClose={() => setMobileDrawerOpen(false)}
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
      />

      <div className="flex flex-1">
        <Sidebar currentTab={currentTab} onSelectTab={setCurrentTab} />

        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto max-h-[calc(100vh-56px)] pb-20 md:pb-8">
          {currentTab === 'overview' && <OverviewView onNavigate={setCurrentTab} />}
          {currentTab === 'kiosk' && <KioskCheckInView />}
          {currentTab === 'appointments' && <AppointmentsView />}
          {currentTab === 'promotions' && <PromotionsView />}
          {currentTab === 'crm' && <CRMLeadsView />}
          {currentTab === 'members' && <MembersView />}
          {currentTab === 'classes' && <ClassesView />}
          {currentTab === 'pos' && <RetailPOSView />}
          {currentTab === 'retention' && <RetentionRadarView />}
          {currentTab === 'equipment' && <EquipmentTrackerView />}
          {currentTab === 'payroll' && <TrainerPayrollView />}
          {currentTab === 'bank-slips' && <BankSlipPaymentsView />}
          {currentTab === 'pt-punch' && <PTPunchCardView />}
          {currentTab === 'freezes' && <MembershipFreezeView />}
          {currentTab === 'settings' && <GymSettingsView />}
        </main>
      </div>

      <WhatsAppDispatchModal />

      {/* Mobile Bottom Navigation */}
      <nav 
        className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-[#08090b]/95 backdrop-blur-lg border-t border-white/[0.06] px-2 flex items-stretch justify-around select-none"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 4px)' }}
        aria-label="Mobile Navigation"
      >
        {mobileTabs.map(tab => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setCurrentTab(tab.id)}
              className={`relative flex flex-col items-center justify-center py-2 px-3 text-[10px] font-medium transition-colors ${
                isActive ? 'text-white' : 'text-zinc-500'
              }`}
            >
              {isActive && <span className="nav-indicator" />}
              <Icon className="w-5 h-5 mb-0.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}

        <button
          onClick={() => setMobileDrawerOpen(true)}
          className="relative flex flex-col items-center justify-center py-2 px-3 text-[10px] font-medium text-zinc-500"
        >
          <MoreHorizontal className="w-5 h-5 mb-0.5" />
          <span>More</span>
        </button>
      </nav>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <TenantProvider>
      <MainLayout />
    </TenantProvider>
  );
};

export default App;
