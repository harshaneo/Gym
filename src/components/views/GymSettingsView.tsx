import React, { useState } from 'react';
import { useTenant } from '../../context/TenantContext';
import { Building2, Globe, Palette, ShieldCheck, Check } from 'lucide-react';

export const GymSettingsView: React.FC = () => {
  const { currentTenant, updateTenantBranding } = useTenant();

  const [name, setName] = useState(currentTenant.name);
  const [tagline, setTagline] = useState(currentTenant.tagline);
  const [slug, setSlug] = useState(currentTenant.slug);
  const [customDomain, setCustomDomain] = useState(currentTenant.customDomain || '');
  const [color, setColor] = useState(currentTenant.primaryColor);
  const [capacity, setCapacity] = useState(String(currentTenant.fireCodeMaxCapacity));
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateTenantBranding({
      name,
      tagline,
      slug,
      subdomain: `${slug}.ironpulse.app`,
      customDomain: customDomain || undefined,
      primaryColor: color,
      secondaryColor: color,
      fireCodeMaxCapacity: Number(capacity) || 100,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="pb-4 border-b border-white/[0.08]">
        <h2 className="text-xl font-bold text-white tracking-tight">Gym Settings & Routing</h2>
        <p className="text-xs text-zinc-400 mt-0.5">
          Configure multi-tenant routing, custom domain CNAME records, and brand styling.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-5">
        {/* Workspace Identity */}
        <div className="bg-[#111317] border border-white/[0.08] rounded-xl p-5 space-y-4">
          <h3 className="font-semibold text-white text-xs uppercase tracking-wider font-mono flex items-center gap-2">
            <Building2 className="w-3.5 h-3.5 text-zinc-400" />
            Facility Identity
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">Gym Name</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full pro-input rounded-lg px-3 py-2 text-sm text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">Max Fire-Code Capacity</label>
              <input
                type="number"
                value={capacity}
                onChange={e => setCapacity(e.target.value)}
                className="w-full pro-input rounded-lg px-3 py-2 text-sm text-white font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1">Hero Tagline</label>
            <input
              type="text"
              value={tagline}
              onChange={e => setTagline(e.target.value)}
              className="w-full pro-input rounded-lg px-3 py-2 text-sm text-white"
            />
          </div>
        </div>

        {/* Subdomain & Custom Domains */}
        <div className="bg-[#111317] border border-white/[0.08] rounded-xl p-5 space-y-4">
          <h3 className="font-semibold text-white text-xs uppercase tracking-wider font-mono flex items-center gap-2">
            <Globe className="w-3.5 h-3.5 text-zinc-400" />
            Subdomain & Custom Domain Routing
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">Assigned Subdomain</label>
              <div className="flex items-center pro-input rounded-lg px-3 py-2 text-sm">
                <input
                  type="text"
                  value={slug}
                  onChange={e => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                  className="bg-transparent text-white font-mono flex-1 focus:outline-none"
                />
                <span className="text-zinc-500 font-mono text-xs">.ironpulse.app</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">Custom Domain (Optional)</label>
              <input
                type="text"
                placeholder="e.g. www.titanstrength.com"
                value={customDomain}
                onChange={e => setCustomDomain(e.target.value)}
                className="w-full pro-input rounded-lg px-3 py-2 text-sm text-white font-mono"
              />
            </div>
          </div>

          <div className="p-3 bg-[#16191f] rounded-lg border border-white/[0.04] text-xs text-zinc-400 space-y-1">
            <div className="flex items-center gap-1.5 text-zinc-300 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-[#4ade80]" />
              Edge DNS Active
            </div>
            <p className="text-[11px] text-zinc-500">
              CNAME pointing to <code className="text-zinc-300 font-mono">cname.ironpulse.app</code> automatically provisions SSL certs via Cloudflare.
            </p>
          </div>
        </div>

        {/* Brand Appearance */}
        <div className="bg-[#111317] border border-white/[0.08] rounded-xl p-5 space-y-4">
          <h3 className="font-semibold text-white text-xs uppercase tracking-wider font-mono flex items-center gap-2">
            <Palette className="w-3.5 h-3.5 text-zinc-400" />
            Accent Palette
          </h3>

          <div className="flex items-center gap-4">
            <input
              type="color"
              value={color}
              onChange={e => setColor(e.target.value)}
              className="w-10 h-10 rounded-lg border-0 cursor-pointer bg-transparent"
            />
            <div>
              <div className="font-mono text-xs font-semibold text-white">{color}</div>
              <div className="text-[11px] text-zinc-400">Primary UI theme highlight across member dashboard</div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          {savedSuccess && (
            <span className="text-xs font-medium text-[#86efac] flex items-center gap-1.5 animate-in fade-in">
              <Check className="w-3.5 h-3.5 text-[#4ade80]" />
              Settings Saved
            </span>
          )}
          <button
            type="submit"
            className="px-5 py-2 rounded-lg font-medium text-xs bg-white hover:bg-zinc-200 text-zinc-950 tactile-btn flex items-center gap-1.5"
          >
            <Check className="w-3.5 h-3.5" />
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
};
