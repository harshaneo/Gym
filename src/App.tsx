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

  // If staff mode is selected, default to kiosk if current tab is restricted
  useEffect(() => {
    if (currentRole === 'FRONT_DESK_STAFF') {
      if (['overview', 'crm', 'promotions', 'members', 'settings'].includes(currentTab)) {
        setCurrentTab('kiosk');
      }
    }
  }, [currentRole, currentTab]);

  // View: Separated Platform Super-Admin Control Plane
  if (currentRole === 'PLATFORM_SUPER_ADMIN') {
    return (
      <div className="min-h-screen bg-[#07080a] flex flex-col text-zinc-100">
        <SubdomainSwitcherBar />
        <main className="flex-1 p-4 md:p-8 overflow-y-auto">
          <PlatformControlPlaneView />
        </main>
      </div>
    );
  }

  // View: Public Member Web Portal
  if (viewMode === 'PUBLIC_MEMBER_PORTAL') {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col text-zinc-100">
        <SubdomainSwitcherBar />
        <PublicPortalPreview />
      </div>
    );
  }

  // View: Gym Tenant Workspace (Owner / Staff)
  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col text-zinc-100">
      {/* Top Bar with Gym Name & Subdomain */}
      <SubdomainSwitcherBar onOpenMobileDrawer={() => setMobileDrawerOpen(true)} />

      {/* Slide-Over Drawer for Mobile */}
      <MobileDrawer
        isOpen={mobileDrawerOpen}
        onClose={() => setMobileDrawerOpen(false)}
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
      />

      {/* Main Workspace Body */}
      <div className="flex flex-1">
        {/* Desktop Workspace Sidebar */}
        <Sidebar currentTab={currentTab} onSelectTab={setCurrentTab} />

        {/* View Content Area with Mobile Safe Bottom Padding */}
        <main className="flex-1 p-4 md:p-8 overflow-y-auto max-h-[calc(100vh-56px)] pb-24 md:pb-8">
          {currentTab === 'overview' && <OverviewView onNavigate={setCurrentTab} />}
          {currentTab === 'kiosk' && <KioskCheckInView />}
          {currentTab === 'appointments' && <AppointmentsView />}
          {currentTab === 'promotions' && <PromotionsView />}
          {currentTab === 'crm' && <CRMLeadsView />}
          {currentTab === 'members' && <MembersView />}
          {currentTab === 'classes' && <ClassesView />}
          {currentTab === 'settings' && <GymSettingsView />}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar (Thumb Friendly Linear/Mindbody UX) */}
      <nav 
        className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-[#090a0c]/95 backdrop-blur border-t border-white/[0.08] px-2 py-1 flex items-center justify-around select-none"
        aria-label="Mobile Navigation"
      >
        {currentRole === 'GYM_OWNER' ? (
          <>
            <button
              onClick={() => setCurrentTab('overview')}
              className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-lg text-[10px] font-medium transition-colors ${
                currentTab === 'overview' ? 'text-white' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <LayoutDashboard className={`w-5 h-5 mb-1 ${currentTab === 'overview' ? 'text-white' : 'text-zinc-400'}`} />
              <span>Overview</span>
            </button>

            <button
              onClick={() => setCurrentTab('kiosk')}
              className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-lg text-[10px] font-medium transition-colors ${
                currentTab === 'kiosk' ? 'text-white' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <UserCheck className={`w-5 h-5 mb-1 ${currentTab === 'kiosk' ? 'text-white' : 'text-zinc-400'}`} />
              <span>Check-In</span>
            </button>

            <button
              onClick={() => setCurrentTab('appointments')}
              className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-lg text-[10px] font-medium transition-colors ${
                currentTab === 'appointments' ? 'text-white' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <CalendarClock className={`w-5 h-5 mb-1 ${currentTab === 'appointments' ? 'text-white' : 'text-zinc-400'}`} />
              <span>Schedule</span>
            </button>

            <button
              onClick={() => setCurrentTab('classes')}
              className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-lg text-[10px] font-medium transition-colors ${
                currentTab === 'classes' ? 'text-white' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <CalendarRange className={`w-5 h-5 mb-1 ${currentTab === 'classes' ? 'text-white' : 'text-zinc-400'}`} />
              <span>Classes</span>
            </button>

            <button
              onClick={() => setMobileDrawerOpen(true)}
              className="flex flex-col items-center justify-center py-1.5 px-3 rounded-lg text-[10px] font-medium text-zinc-400 hover:text-zinc-200 transition-colors"
            >
              <MoreHorizontal className="w-5 h-5 mb-1 text-zinc-400" />
              <span>More</span>
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => setCurrentTab('kiosk')}
              className={`flex flex-col items-center justify-center py-1.5 px-4 rounded-lg text-[10px] font-medium transition-colors ${
                currentTab === 'kiosk' ? 'text-white' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <UserCheck className={`w-5 h-5 mb-1 ${currentTab === 'kiosk' ? 'text-white' : 'text-zinc-400'}`} />
              <span>Check-In Terminal</span>
            </button>

            <button
              onClick={() => setCurrentTab('classes')}
              className={`flex flex-col items-center justify-center py-1.5 px-4 rounded-lg text-[10px] font-medium transition-colors ${
                currentTab === 'classes' ? 'text-white' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <CalendarRange className={`w-5 h-5 mb-1 ${currentTab === 'classes' ? 'text-white' : 'text-zinc-400'}`} />
              <span>Class Timetable</span>
            </button>

            <button
              onClick={() => setCurrentTab('appointments')}
              className={`flex flex-col items-center justify-center py-1.5 px-4 rounded-lg text-[10px] font-medium transition-colors ${
                currentTab === 'appointments' ? 'text-white' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <CalendarClock className={`w-5 h-5 mb-1 ${currentTab === 'appointments' ? 'text-white' : 'text-zinc-400'}`} />
              <span>Sessions</span>
            </button>

            <button
              onClick={() => setMobileDrawerOpen(true)}
              className="flex flex-col items-center justify-center py-1.5 px-4 rounded-lg text-[10px] font-medium text-zinc-400 hover:text-zinc-200 transition-colors"
            >
              <MoreHorizontal className="w-5 h-5 mb-1 text-zinc-400" />
              <span>Shift Menu</span>
            </button>
          </>
        )}
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
