import React, { useState } from 'react';
import { TenantProvider, useTenant } from './context/TenantContext';
import { SubdomainSwitcherBar } from './components/SubdomainSwitcherBar';
import { Sidebar, NavTab } from './components/Sidebar';
import { OverviewView } from './components/views/OverviewView';
import { KioskCheckInView } from './components/views/KioskCheckInView';
import { AppointmentsView } from './components/views/AppointmentsView';
import { PromotionsView } from './components/views/PromotionsView';
import { CRMLeadsView } from './components/views/CRMLeadsView';
import { MembersView } from './components/views/MembersView';
import { ClassesView } from './components/views/ClassesView';
import { GymSettingsView } from './components/views/GymSettingsView';
import { PublicPortalPreview } from './components/views/PublicPortalPreview';

const MainLayout: React.FC = () => {
  const { viewMode } = useTenant();
  const [currentTab, setCurrentTab] = useState<NavTab>('overview');

  if (viewMode === 'PUBLIC_MEMBER_PORTAL') {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col">
        <SubdomainSwitcherBar />
        <PublicPortalPreview />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col text-zinc-100">
      {/* Top Subdomain & Multi-Tenant Switcher Bar */}
      <SubdomainSwitcherBar />

      {/* Main Workspace Body */}
      <div className="flex flex-1">
        {/* Workspace Sidebar */}
        <Sidebar currentTab={currentTab} onSelectTab={setCurrentTab} />

        {/* View Content Area */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto max-h-[calc(100vh-41px)]">
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
