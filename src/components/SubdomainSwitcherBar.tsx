import React, { useState } from 'react';
import { useTenant } from '../context/TenantContext';
import { ChevronDown, Plus, ExternalLink, Check, Menu, ShieldCheck } from 'lucide-react';

interface SubdomainSwitcherBarProps {
  onOpenMobileDrawer?: () => void;
}

export const SubdomainSwitcherBar: React.FC<SubdomainSwitcherBarProps> = ({ onOpenMobileDrawer }) => {
  const { 
    currentTenant, 
    allTenants, 
    switchTenant, 
    createNewTenant, 
    viewMode, 
    setViewMode,
    currentRole,
    setRole
  } = useTenant();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showNewModal, setShowNewModal] = useState(false);

  // New gym form
  const [newGymName, setNewGymName] = useState('');
  const [newSlug, setNewSlug] = useState('');
  const [newTagline, setNewTagline] = useState('');
  const [newCapacity, setNewCapacity] = useState('120');

  const handleCreateGym = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGymName || !newSlug) return;
    const cleanSlug = newSlug.toLowerCase().replace(/[^a-z0-9-]/g, '');
    createNewTenant({
      name: newGymName,
      slug: cleanSlug,
      subdomain: `${cleanSlug}.ironpulse.app`,
      tagline: newTagline || 'High-performance training and dedicated coaching.',
      primaryColor: '#f4f5f6',
      secondaryColor: '#9aa0a6',
      address: '100 Fitness Way, Austin TX',
      phone: '+1 (512) 555-0100',
      email: `contact@${cleanSlug}.com`,
      fireCodeMaxCapacity: parseInt(newCapacity) || 100,
      currency: 'USD',
    });
    setNewGymName('');
    setNewSlug('');
    setNewTagline('');
    setShowNewModal(false);
    setDropdownOpen(false);
  };

  const isPlatformControl = currentRole === 'PLATFORM_SUPER_ADMIN';

  return (
    <>
      <header className="h-14 bg-[#090a0c] border-b border-white/[0.08] px-3 md:px-6 flex items-center justify-between sticky top-0 z-40 select-none">
        {/* Left: Hamburger (mobile) + Logo + Gym Name over Subdomain URL */}
        <div className="flex items-center gap-2.5 sm:gap-4 min-w-0">
          {/* Mobile hamburger menu */}
          <button
            onClick={onOpenMobileDrawer}
            className="md:hidden p-2 rounded-lg bg-[#111317] border border-white/[0.08] text-zinc-300 hover:text-white shrink-0 active:scale-95 transition-transform"
            aria-label="Open Menu"
          >
            <Menu className="w-4 h-4" />
          </button>

          {/* Platform Brand Mark */}
          <div className="flex items-center gap-2 pr-2 sm:pr-3 border-r border-white/[0.08] shrink-0">
            <div className="w-7 h-7 rounded-lg bg-white text-zinc-950 font-extrabold flex items-center justify-center text-xs tracking-tighter shadow-sm">
              IP
            </div>
            <span className="font-bold text-white text-xs tracking-tight hidden lg:inline">IRONPULSE</span>
          </div>

          {/* Workspace Switcher: Primary Anchor = Gym Name, Subdomain URL underneath */}
          <div className="relative min-w-0">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg bg-[#111317] hover:bg-[#16191f] text-left border border-white/[0.08] transition-all tactile-btn max-w-[210px] sm:max-w-xs"
            >
              <div className="flex flex-col min-w-0">
                <span className="font-semibold text-xs text-white leading-tight flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full dot-approved shrink-0" />
                  <span className="truncate">{currentTenant.name}</span>
                </span>
                <span className="font-mono text-[10px] text-zinc-400 leading-tight mt-0.5 truncate">
                  {currentTenant.subdomain}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-zinc-400 shrink-0 ml-0.5" />
            </button>

            {dropdownOpen && (
              <div className="absolute left-0 top-full mt-1.5 w-72 bg-[#111317] border border-white/[0.1] rounded-xl shadow-2xl py-1 z-50 animate-in fade-in-50 zoom-in-95">
                <div className="px-3.5 py-2 text-[10px] font-mono uppercase tracking-wider text-zinc-400 border-b border-white/[0.06]">
                  Select Workspace
                </div>
                <div className="py-1 max-h-64 overflow-y-auto">
                  {allTenants.map(t => (
                    <button
                      key={t.id}
                      onClick={() => {
                        switchTenant(t.slug);
                        setDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3.5 py-2.5 flex items-center justify-between text-xs transition-colors ${
                        t.slug === currentTenant.slug ? 'bg-white/[0.06] text-white' : 'text-zinc-400 hover:text-white hover:bg-white/[0.03]'
                      }`}
                    >
                      <div className="flex flex-col min-w-0">
                        <span className="font-medium text-white text-xs truncate">{t.name}</span>
                        <span className="font-mono text-[10px] text-zinc-400 mt-0.5 truncate">{t.subdomain}</span>
                      </div>
                      {t.slug === currentTenant.slug && <Check className="w-3.5 h-3.5 text-zinc-200 shrink-0 ml-2" />}
                    </button>
                  ))}
                </div>

                <div className="pt-1 border-t border-white/[0.06]">
                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      setShowNewModal(true);
                    }}
                    className="w-full text-left px-3.5 py-2.5 text-xs text-zinc-300 hover:text-white hover:bg-white/[0.04] flex items-center gap-2 font-medium"
                  >
                    <Plus className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Create Gym Workspace...</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Public Member Portal Toggle + Isolated Platform Control Plane Button */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Member Portal Button */}
          <button
            onClick={() => setViewMode(viewMode === 'PUBLIC_MEMBER_PORTAL' ? 'ADMIN_WORKSPACE' : 'PUBLIC_MEMBER_PORTAL')}
            className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 border transition-all tactile-btn ${
              viewMode === 'PUBLIC_MEMBER_PORTAL'
                ? 'bg-white text-zinc-950 font-semibold border-white shadow-sm'
                : 'bg-[#111317] text-zinc-300 border-white/[0.08] hover:text-white'
            }`}
          >
            <span className="hidden sm:inline">
              {viewMode === 'PUBLIC_MEMBER_PORTAL' ? 'Exit Portal' : 'Member Portal'}
            </span>
            <span className="sm:hidden">
              {viewMode === 'PUBLIC_MEMBER_PORTAL' ? 'Exit' : 'Portal'}
            </span>
            <ExternalLink className="w-3 h-3 opacity-70" />
          </button>

          {/* Discrete Platform Control Plane Access */}
          <button
            onClick={() => {
              if (isPlatformControl) {
                setRole('GYM_OWNER');
              } else {
                setRole('PLATFORM_SUPER_ADMIN');
              }
            }}
            className={`p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 border transition-all tactile-btn ${
              isPlatformControl
                ? 'bg-purple-950/80 text-purple-200 border-purple-500/40 shadow-sm'
                : 'bg-[#111317] text-zinc-400 border-white/[0.08] hover:text-zinc-200'
            }`}
            title="Separated Platform Control Plane (Cross-Tenant Infrastructure)"
          >
            <ShieldCheck className="w-4 h-4 text-purple-400" />
            <span className="hidden md:inline text-[11px] font-mono">Control Plane</span>
          </button>
        </div>
      </header>

      {/* Create Gym Workspace Modal */}
      {showNewModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#111317] border border-white/[0.1] rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl animate-in zoom-in-95">
            <div>
              <h3 className="text-sm font-semibold text-white">Create Gym Workspace</h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Each gym receives an isolated workspace database and subdomain URL.
              </p>
            </div>

            <form onSubmit={handleCreateGym} className="space-y-4">
              <div>
                <label className="block text-[11px] font-mono uppercase text-zinc-400 mb-1">
                  Gym Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Iron Forge Athletics"
                  value={newGymName}
                  onChange={e => {
                    setNewGymName(e.target.value);
                    if (!newSlug) {
                      setNewSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, ''));
                    }
                  }}
                  className="w-full bg-[#090a0c] border border-white/[0.08] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-white/30"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase text-zinc-400 mb-1">
                  Subdomain Slug
                </label>
                <div className="flex items-center bg-[#090a0c] border border-white/[0.08] rounded-lg px-3 py-2 text-xs focus-within:border-white/30">
                  <input
                    type="text"
                    required
                    placeholder="ironforge"
                    value={newSlug}
                    onChange={e => setNewSlug(e.target.value)}
                    className="w-full bg-transparent text-white focus:outline-none font-mono"
                  />
                  <span className="text-zinc-400 font-mono text-xs">.ironpulse.app</span>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase text-zinc-400 mb-1">
                  Tagline
                </label>
                <input
                  type="text"
                  placeholder="e.g. Elite barbell strength & conditioning."
                  value={newTagline}
                  onChange={e => setNewTagline(e.target.value)}
                  className="w-full bg-[#090a0c] border border-white/[0.08] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-white/30"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase text-zinc-400 mb-1">
                  Facility Fire-Code Max Capacity
                </label>
                <input
                  type="number"
                  min="20"
                  max="1000"
                  value={newCapacity}
                  onChange={e => setNewCapacity(e.target.value)}
                  className="w-full bg-[#090a0c] border border-white/[0.08] rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-white/30"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="px-3.5 py-2 rounded-lg bg-zinc-800 text-zinc-300 text-xs font-medium hover:bg-zinc-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-white text-zinc-950 text-xs font-semibold hover:bg-zinc-200 tactile-btn"
                >
                  Create Workspace
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
