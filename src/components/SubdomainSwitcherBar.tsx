import React, { useState } from 'react';
import { useTenant } from '../context/TenantContext';
import { ChevronDown, Plus, ExternalLink, Check, X } from 'lucide-react';

export const SubdomainSwitcherBar: React.FC = () => {
  const { currentTenant, allTenants, switchTenant, createNewTenant, viewMode, setViewMode } = useTenant();
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

  return (
    <>
      <header className="h-14 bg-[#090a0c] border-b border-white/[0.08] px-4 md:px-6 flex items-center justify-between sticky top-0 z-50 select-none">
        {/* Left: Gym Name and directly under it the Subdomain URL */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 pr-3 border-r border-white/[0.08]">
            <div className="w-7 h-7 rounded-lg bg-white text-zinc-950 font-extrabold flex items-center justify-center text-xs tracking-tighter">
              IP
            </div>
            <span className="font-bold text-white text-xs tracking-tight hidden sm:inline">IRONPULSE</span>
          </div>

          {/* Workspace Switcher with Gym Name and Subdomain underneath */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-3 px-3 py-1.5 rounded-lg bg-[#111317] hover:bg-[#16191f] text-left border border-white/[0.08] transition-all tactile-btn"
            >
              <div className="flex flex-col">
                <span className="font-semibold text-xs text-white leading-tight flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full dot-approved" />
                  {currentTenant.name}
                </span>
                <span className="font-mono text-[10px] text-zinc-400 leading-tight mt-0.5">
                  {currentTenant.subdomain}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-zinc-400 ml-1" />
            </button>

            {dropdownOpen && (
              <div className="absolute left-0 top-full mt-1.5 w-72 bg-[#111317] border border-white/[0.1] rounded-xl shadow-2xl py-1 z-50 animate-in fade-in-50 zoom-in-95">
                <div className="px-3.5 py-2 text-[10px] font-mono uppercase tracking-wider text-zinc-400 border-b border-white/[0.06]">
                  Select Workspace
                </div>
                <div className="py-1">
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
                      <div className="flex flex-col">
                        <span className="font-medium text-white text-xs">{t.name}</span>
                        <span className="font-mono text-[10px] text-zinc-400 mt-0.5">{t.subdomain}</span>
                      </div>
                      {t.slug === currentTenant.slug && <Check className="w-3.5 h-3.5 text-zinc-200" />}
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

        {/* Right: Switcher between Operations Console and Member Portal */}
        <div className="flex items-center gap-3">
          <div className="inline-flex p-0.5 rounded-lg bg-[#111317] border border-white/[0.08]">
            <button
              onClick={() => setViewMode('ADMIN_WORKSPACE')}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                viewMode === 'ADMIN_WORKSPACE'
                  ? 'bg-white text-zinc-950 font-semibold shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Operations Console
            </button>
            <button
              onClick={() => setViewMode('PUBLIC_MEMBER_PORTAL')}
              className={`px-3 py-1 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors ${
                viewMode === 'PUBLIC_MEMBER_PORTAL'
                  ? 'bg-white text-zinc-950 font-semibold shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <span>Member Portal</span>
              <ExternalLink className="w-3 h-3 opacity-70" />
            </button>
          </div>
        </div>
      </header>

      {/* New Workspace Modal */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-100">
          <div className="bg-[#121418] border border-white/[0.12] w-full max-w-md rounded-xl p-6 shadow-2xl relative">
            <button
              onClick={() => setShowNewModal(false)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
            
            <div className="mb-5">
              <h3 className="font-semibold text-white text-base tracking-tight">Create Gym Workspace</h3>
              <p className="text-xs text-zinc-400 mt-0.5">Initialize a dedicated subdomain and operational database</p>
            </div>

            <form onSubmit={handleCreateGym} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">Gym Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Iron Forge Performance"
                  value={newGymName}
                  onChange={e => {
                    setNewGymName(e.target.value);
                    if (!newSlug) {
                      setNewSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, ''));
                    }
                  }}
                  className="w-full pro-input rounded-lg px-3 py-2 text-sm text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">Subdomain Slug</label>
                <div className="flex items-center pro-input rounded-lg px-3 py-2 text-sm">
                  <input
                    type="text"
                    required
                    placeholder="ironforge"
                    value={newSlug}
                    onChange={e => setNewSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                    className="bg-transparent text-white font-mono flex-1 focus:outline-none"
                  />
                  <span className="text-zinc-500 font-mono text-xs">.ironpulse.app</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">Tagline</label>
                <input
                  type="text"
                  placeholder="e.g. Dedicated strength & athletic conditioning"
                  value={newTagline}
                  onChange={e => setNewTagline(e.target.value)}
                  className="w-full pro-input rounded-lg px-3 py-2 text-sm text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">Max Fire-Code Capacity</label>
                <input
                  type="number"
                  value={newCapacity}
                  onChange={e => setNewCapacity(e.target.value)}
                  className="w-full pro-input rounded-lg px-3 py-2 text-sm text-white font-mono"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-white/[0.06]">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="px-3 py-2 rounded-lg text-xs font-medium text-zinc-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg text-xs font-medium bg-white hover:bg-zinc-200 text-zinc-950 tactile-btn"
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
