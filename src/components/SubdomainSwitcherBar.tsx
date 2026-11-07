import React, { useState } from 'react';
import { useTenant } from '../context/TenantContext';
import { ChevronDown, Plus, Check, Menu, ShieldCheck, Globe, LayoutDashboard } from 'lucide-react';

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
      <header className="h-12 bg-[#08090b] border-b border-white/[0.06] px-3 md:px-5 flex items-center justify-between sticky top-0 z-40 select-none">
        {/* Left: Hamburger + Brand + Workspace Picker */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          {onOpenMobileDrawer && (
            <button
              onClick={onOpenMobileDrawer}
              className="md:hidden p-1.5 rounded-md text-zinc-400 hover:text-white hover:bg-white/[0.04] transition-colors shrink-0"
              aria-label="Open Menu"
            >
              <Menu className="w-4 h-4" />
            </button>
          )}

          {/* Brand */}
          <div className="flex items-center gap-2 pr-2.5 border-r border-white/[0.06] shrink-0">
            <div className="w-6 h-6 rounded-md bg-white text-zinc-950 font-bold flex items-center justify-center text-[9px] tracking-tighter">
              IP
            </div>
            <span className="font-semibold text-white text-[11px] tracking-tight hidden lg:inline">IRONPULSE</span>
          </div>

          {/* Workspace Picker */}
          <div className="relative min-w-0">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 px-2 py-1 rounded-md hover:bg-white/[0.04] text-left transition-colors max-w-[200px] sm:max-w-xs"
            >
              <div className="flex flex-col min-w-0">
                <span className="font-medium text-[12px] text-white leading-tight flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full dot-live shrink-0" />
                  <span className="truncate">{currentTenant.name}</span>
                </span>
                <span className="font-mono text-[10px] text-zinc-500 leading-tight mt-px truncate pl-3">
                  {currentTenant.subdomain}
                </span>
              </div>
              <ChevronDown className="w-3 h-3 text-zinc-500 shrink-0" />
            </button>

            {dropdownOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
                <div className="absolute left-0 top-full mt-1 w-64 card rounded-lg shadow-2xl py-1 z-50">
                  <div className="px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider text-zinc-500 border-b border-white/[0.04]">
                    Workspaces
                  </div>
                  <div className="py-0.5 max-h-56 overflow-y-auto">
                    {allTenants.map(t => (
                      <button
                        key={t.id}
                        onClick={() => {
                          switchTenant(t.slug);
                          setDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 flex items-center justify-between text-xs transition-colors ${
                          t.slug === currentTenant.slug ? 'bg-white/[0.04] text-white' : 'text-zinc-400 hover:text-white hover:bg-white/[0.02]'
                        }`}
                      >
                        <div className="flex flex-col min-w-0">
                          <span className="font-medium text-[12px] text-white truncate">{t.name}</span>
                          <span className="font-mono text-[10px] text-zinc-500 mt-px truncate">{t.subdomain}</span>
                        </div>
                        {t.slug === currentTenant.slug && <Check className="w-3.5 h-3.5 text-zinc-300 shrink-0 ml-2" />}
                      </button>
                    ))}
                  </div>

                  <div className="pt-0.5 border-t border-white/[0.04]">
                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        setShowNewModal(true);
                      }}
                      className="w-full text-left px-3 py-2 text-xs text-zinc-400 hover:text-white hover:bg-white/[0.02] flex items-center gap-2 font-medium transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Create Workspace
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Right: View Switcher + Control Plane */}
        <div className="flex items-center gap-1.5 shrink-0">
          <div className="segmented-control inline-flex">
            <button
              onClick={() => {
                if (isPlatformControl) setRole('GYM_OWNER');
                setViewMode('PUBLIC_MEMBER_PORTAL');
              }}
              className={`segmented-tab flex items-center gap-1.5 ${
                viewMode === 'PUBLIC_MEMBER_PORTAL' && !isPlatformControl ? 'segmented-tab-active' : ''
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Website</span>
            </button>
            <button
              onClick={() => {
                if (isPlatformControl) setRole('GYM_OWNER');
                setViewMode('ADMIN_WORKSPACE');
              }}
              className={`segmented-tab flex items-center gap-1.5 ${
                viewMode === 'ADMIN_WORKSPACE' && !isPlatformControl ? 'segmented-tab-active' : ''
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Workspace</span>
            </button>
          </div>

          <button
            onClick={() => {
              if (isPlatformControl) {
                setRole('GYM_OWNER');
              } else {
                setRole('PLATFORM_SUPER_ADMIN');
              }
            }}
            className={`p-1.5 rounded-md transition-colors ${
              isPlatformControl
                ? 'bg-white/[0.08] text-white'
                : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.04]'
            }`}
            title="Platform Control Plane"
          >
            <ShieldCheck className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Create Workspace Modal */}
      {showNewModal && (
        <div className="fixed inset-0 modal-overlay z-50 flex items-center justify-center p-4">
          <div className="modal-panel w-full max-w-md rounded-xl p-6 space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-white">Create Workspace</h3>
              <p className="text-xs text-zinc-500 mt-0.5">
                Each gym gets an isolated database and subdomain.
              </p>
            </div>

            <form onSubmit={handleCreateGym} className="space-y-3">
              <div>
                <label className="block text-[11px] font-medium text-zinc-400 mb-1">Gym Name</label>
                <input
                  type="text"
                  required
                  placeholder="Iron Forge Athletics"
                  value={newGymName}
                  onChange={e => {
                    setNewGymName(e.target.value);
                    if (!newSlug) {
                      setNewSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, ''));
                    }
                  }}
                  className="w-full input rounded-lg px-3 py-2 text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-zinc-400 mb-1">Subdomain</label>
                <div className="flex items-center input rounded-lg px-3 py-2 text-xs focus-within:border-white/[0.28]">
                  <input
                    type="text"
                    required
                    placeholder="ironforge"
                    value={newSlug}
                    onChange={e => setNewSlug(e.target.value)}
                    className="w-full bg-transparent text-white focus:outline-none font-mono"
                  />
                  <span className="text-zinc-500 font-mono text-xs shrink-0">.ironpulse.app</span>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-zinc-400 mb-1">Tagline</label>
                <input
                  type="text"
                  placeholder="Elite barbell strength & conditioning."
                  value={newTagline}
                  onChange={e => setNewTagline(e.target.value)}
                  className="w-full input rounded-lg px-3 py-2 text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-zinc-400 mb-1">Max Capacity</label>
                <input
                  type="number"
                  min="20"
                  max="1000"
                  value={newCapacity}
                  onChange={e => setNewCapacity(e.target.value)}
                  className="w-full input rounded-lg px-3 py-2 text-xs font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="px-3 py-2 rounded-lg text-xs font-medium text-zinc-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary px-4 py-2 rounded-lg text-xs"
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
