import React, { useState } from 'react';
import { useTenant } from '../../context/TenantContext';
import { ThemePreset } from '../../types';
import { 
  Building2, 
  Globe, 
  Palette, 
  ShieldCheck, 
  Check, 
  Image as ImageIcon, 
  Sparkles,
  Layers,
  Eye,
  Plus,
  Trash2
} from 'lucide-react';

const THEME_PRESETS: { id: ThemePreset; name: string; desc: string; previewColor: string; bgTone: string }[] = [
  {
    id: 'MONOCHROME_INDUSTRIAL',
    name: 'Monochrome Industrial',
    desc: 'Pure high-contrast black & white. Raw barbell and athletic facility standard.',
    previewColor: '#ffffff',
    bgTone: '#08090b',
  },
  {
    id: 'NEO_EMERALD',
    name: 'Neo Emerald',
    desc: 'Deep forest tones and recovery green accents. Boutique clubs & wellness studios.',
    previewColor: '#10b981',
    bgTone: '#08140e',
  },
  {
    id: 'AMBER_FORGE',
    name: 'Amber Forge',
    desc: 'Warm telemetry gold & foundry amber. Functional fitness and HIIT gyms.',
    previewColor: '#f59e0b',
    bgTone: '#140f08',
  },
  {
    id: 'OBSIDIAN_SLATE',
    name: 'Obsidian Slate',
    desc: 'Muted cool slate and blue depth. Modern corporate training and strength clubs.',
    previewColor: '#60a5fa',
    bgTone: '#080c14',
  },
];

const CURATED_IMAGES = [
  {
    label: 'Olympic Barbell & Platforms',
    url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1200&q=80',
  },
  {
    label: 'Boutique Wellness & Turf',
    url: 'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?auto=format&fit=crop&w=1200&q=80',
  },
  {
    label: 'Cardio & Rowing Fleet',
    url: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1200&q=80',
  },
  {
    label: 'Dumbbell Vault & Heavy Free Weights',
    url: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=1200&q=80',
  },
];

export const GymSettingsView: React.FC = () => {
  const { currentTenant, updateTenantBranding, setViewMode } = useTenant();

  const [activeTab, setActiveTab] = useState<'IDENTITY' | 'THEME_CUSTOMIZER' | 'ROUTING'>('THEME_CUSTOMIZER');

  // Form states
  const [name, setName] = useState(currentTenant.name);
  const [tagline, setTagline] = useState(currentTenant.tagline);
  const [slug, setSlug] = useState(currentTenant.slug);
  const [customDomain, setCustomDomain] = useState(currentTenant.customDomain || '');
  const [capacity, setCapacity] = useState(String(currentTenant.fireCodeMaxCapacity));

  // Customization & CMS fields
  const [themePreset, setThemePreset] = useState<ThemePreset>(currentTenant.themePreset || 'MONOCHROME_INDUSTRIAL');
  const [primaryColor, setPrimaryColor] = useState(currentTenant.primaryColor || '#f4f5f6');
  const [heroHeadline, setHeroHeadline] = useState(currentTenant.heroHeadline || currentTenant.tagline);
  const [heroSubhead, setHeroSubhead] = useState(
    currentTenant.heroSubhead || 'High-performance barbell training, dedicated coaching, and verified capacity caps.'
  );
  const [heroImage, setHeroImage] = useState(
    currentTenant.heroImage || CURATED_IMAGES[0].url
  );
  const [amenities, setAmenities] = useState<string[]>(
    currentTenant.amenities || ['Eleiko Barbell Stations', 'Contrast Cold Plunge', 'Infrared Sauna Suite', 'InBody 570']
  );
  const [newAmenityInput, setNewAmenityInput] = useState('');
  const [showOccupancyLive, setShowOccupancyLive] = useState(currentTenant.showOccupancyLive !== false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateTenantBranding({
      name,
      tagline,
      slug,
      subdomain: `${slug}.ironpulse.app`,
      customDomain: customDomain || undefined,
      fireCodeMaxCapacity: Number(capacity) || 100,
      themePreset,
      primaryColor,
      secondaryColor: primaryColor,
      heroHeadline,
      heroSubhead,
      heroImage,
      amenities,
      showOccupancyLive,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleAddAmenity = () => {
    if (!newAmenityInput.trim()) return;
    setAmenities([...amenities, newAmenityInput.trim()]);
    setNewAmenityInput('');
  };

  const handleRemoveAmenity = (index: number) => {
    setAmenities(amenities.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-white/[0.06]">
        <div>
          <h1 className="text-lg font-semibold text-white tracking-tight">Website Themes & Facility Settings</h1>
          <p className="text-[13px] text-zinc-400 mt-0.5">
            Customize your public subdomain portal appearance, curated photography, amenities, and edge DNS routing.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="segmented-control inline-flex">
            <button
              type="button"
              onClick={() => setActiveTab('THEME_CUSTOMIZER')}
              className={`segmented-tab flex items-center gap-1.5 ${activeTab === 'THEME_CUSTOMIZER' ? 'segmented-tab-active' : ''}`}
            >
              <Palette className="w-3.5 h-3.5" />
              <span>Theme & CMS</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('IDENTITY')}
              className={`segmented-tab flex items-center gap-1.5 ${activeTab === 'IDENTITY' ? 'segmented-tab-active' : ''}`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Identity</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('ROUTING')}
              className={`segmented-tab flex items-center gap-1.5 ${activeTab === 'ROUTING' ? 'segmented-tab-active' : ''}`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Domains</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => setViewMode('PUBLIC_MEMBER_PORTAL')}
            className="btn-secondary px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5"
            title="Preview live public website with active settings"
          >
            <Eye className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Preview Site</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* TAB 1: THEME & CMS CUSTOMIZER */}
        {activeTab === 'THEME_CUSTOMIZER' && (
          <div className="space-y-6">
            {/* Visual Theme Presets */}
            <div className="card p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-xs text-white uppercase tracking-wider font-mono flex items-center gap-2">
                    <Layers className="w-3.5 h-3.5 text-zinc-400" />
                    Visual Theme Preset
                  </h3>
                  <p className="text-[11px] text-zinc-500 mt-0.5">
                    Changes layout tone, typography accenting, and badge styling across your public website.
                  </p>
                </div>
                <span className="badge-neutral px-2 py-0.5 rounded text-[10px] font-mono">
                  {THEME_PRESETS.find(p => p.id === themePreset)?.name}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
                {THEME_PRESETS.map(preset => {
                  const isSelected = themePreset === preset.id;
                  return (
                    <div
                      key={preset.id}
                      onClick={() => {
                        setThemePreset(preset.id);
                        setPrimaryColor(preset.previewColor);
                      }}
                      className={`card p-3.5 cursor-pointer transition-all relative ${
                        isSelected 
                          ? 'border-white/[0.30] bg-[#14161c]' 
                          : 'hover:border-white/[0.12] hover:bg-white/[0.02]'
                      }`}
                    >
                      {isSelected && (
                        <div className="absolute top-2.5 right-2.5 w-4 h-4 rounded-full bg-white text-zinc-950 flex items-center justify-center">
                          <Check className="w-2.5 h-2.5" />
                        </div>
                      )}

                      <div className="flex items-center gap-2 mb-2">
                        <span 
                          className="w-3.5 h-3.5 rounded-full border border-white/20 shrink-0"
                          style={{ backgroundColor: preset.previewColor }}
                        />
                        <h4 className="font-medium text-xs text-white">{preset.name}</h4>
                      </div>

                      <p className="text-[11px] text-zinc-400 leading-relaxed">{preset.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Hero Cover Photography */}
            <div className="card p-5 space-y-4">
              <div>
                <h3 className="font-semibold text-white text-xs uppercase tracking-wider font-mono flex items-center gap-2">
                  <ImageIcon className="w-3.5 h-3.5 text-zinc-400" />
                  Cover Photography
                </h3>
                <p className="text-[11px] text-zinc-500 mt-0.5">
                  Select a high-resolution gym specimen photo or provide your own custom photography URL.
                </p>
              </div>

              {/* Preset Gallery Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {CURATED_IMAGES.map((img, idx) => {
                  const isSelected = heroImage === img.url;
                  return (
                    <div
                      key={idx}
                      onClick={() => setHeroImage(img.url)}
                      className={`group relative rounded-lg overflow-hidden border cursor-pointer aspect-video transition-all ${
                        isSelected ? 'border-white shadow-md' : 'border-white/[0.08] hover:border-white/[0.20]'
                      }`}
                    >
                      <img 
                        src={img.url} 
                        alt={img.label} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-2">
                        <span className="text-[10px] font-medium text-white line-clamp-1 leading-tight">{img.label}</span>
                      </div>
                      {isSelected && (
                        <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded text-[9px] font-mono bg-white text-zinc-950 font-bold">
                          Active
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div>
                <label className="block text-[11px] font-medium text-zinc-400 mb-1">Custom Image URL</label>
                <input
                  type="url"
                  placeholder="https://yourgym.com/assets/gym-floor.jpg"
                  value={heroImage}
                  onChange={e => setHeroImage(e.target.value)}
                  className="w-full input px-3 py-2 text-xs font-mono"
                />
              </div>
            </div>

            {/* Public Headline & Value Proposition */}
            <div className="card p-5 space-y-4">
              <div>
                <h3 className="font-semibold text-white text-xs uppercase tracking-wider font-mono flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-zinc-400" />
                  Public Website Copywriting
                </h3>
                <p className="text-[11px] text-zinc-500 mt-0.5">
                  Headline, value proposition, and live attendance badges displayed to prospective members.
                </p>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-zinc-400 mb-1">Primary Hero Headline</label>
                <input
                  type="text"
                  value={heroHeadline}
                  onChange={e => setHeroHeadline(e.target.value)}
                  placeholder="e.g. Dedicated Strength & Powerlifting Facility"
                  className="w-full input px-3 py-2 text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-zinc-400 mb-1">Subhead Description</label>
                <textarea
                  rows={2}
                  value={heroSubhead}
                  onChange={e => setHeroSubhead(e.target.value)}
                  placeholder="Explain your equipment, coaching style, and crowd caps..."
                  className="w-full input px-3 py-2 text-xs"
                />
              </div>

              {/* Amenities List Manager */}
              <div>
                <label className="block text-[11px] font-medium text-zinc-400 mb-1">Facility Highlights & Amenities</label>
                <div className="flex flex-wrap gap-1.5 mb-2.5">
                  {amenities.map((item, idx) => (
                    <span 
                      key={idx}
                      className="card px-2.5 py-1 text-xs text-zinc-200 flex items-center gap-1.5"
                    >
                      <span>{item}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveAmenity(idx)}
                        className="text-zinc-500 hover:text-red-400"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Add amenity (e.g. Keiser Pneumatic Racks)..."
                    value={newAmenityInput}
                    onChange={e => setNewAmenityInput(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddAmenity();
                      }
                    }}
                    className="flex-1 input px-3 py-1.5 text-xs"
                  />
                  <button
                    type="button"
                    onClick={handleAddAmenity}
                    className="btn-secondary px-3 py-1.5 rounded-lg text-xs flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add</span>
                  </button>
                </div>
              </div>

              {/* Live Occupancy Toggle */}
              <div className="pt-2 border-t border-white/[0.04] flex items-center justify-between">
                <div>
                  <div className="text-xs font-medium text-white">Display Real-Time Turnstile Occupancy</div>
                  <div className="text-[11px] text-zinc-500">Shows prospective members how many athletes are currently on the floor.</div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowOccupancyLive(!showOccupancyLive)}
                  className={`w-10 h-6 rounded-full transition-colors relative ${
                    showOccupancyLive ? 'bg-white' : 'bg-zinc-800'
                  }`}
                >
                  <span className={`w-4 h-4 rounded-full bg-zinc-950 absolute top-1 transition-transform ${
                    showOccupancyLive ? 'left-5' : 'left-1'
                  }`} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: FACILITY IDENTITY */}
        {activeTab === 'IDENTITY' && (
          <div className="space-y-4">
            <div className="card p-5 space-y-4">
              <h3 className="font-semibold text-white text-xs uppercase tracking-wider font-mono flex items-center gap-2">
                <Building2 className="w-3.5 h-3.5 text-zinc-400" />
                Gym Facility Profile
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-medium text-zinc-400 mb-1">Gym / Organization Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full input px-3 py-2 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-zinc-400 mb-1">Fire-Code Max Capacity</label>
                  <input
                    type="number"
                    value={capacity}
                    onChange={e => setCapacity(e.target.value)}
                    className="w-full input px-3 py-2 text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-zinc-400 mb-1">Short Brand Tagline</label>
                <input
                  type="text"
                  value={tagline}
                  onChange={e => setTagline(e.target.value)}
                  className="w-full input px-3 py-2 text-xs"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: DOMAINS & ROUTING */}
        {activeTab === 'ROUTING' && (
          <div className="space-y-4">
            <div className="card p-5 space-y-4">
              <h3 className="font-semibold text-white text-xs uppercase tracking-wider font-mono flex items-center gap-2">
                <Globe className="w-3.5 h-3.5 text-zinc-400" />
                Subdomain & Custom Apex Domain
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-medium text-zinc-400 mb-1">Assigned Subdomain Slug</label>
                  <div className="flex items-center input px-3 py-2 text-xs">
                    <input
                      type="text"
                      value={slug}
                      onChange={e => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                      className="bg-transparent text-white font-mono flex-1 focus:outline-none"
                    />
                    <span className="text-zinc-500 font-mono text-xs shrink-0">.ironpulse.app</span>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-zinc-400 mb-1">Custom Apex Domain</label>
                  <input
                    type="text"
                    placeholder="www.titanstrength.com"
                    value={customDomain}
                    onChange={e => setCustomDomain(e.target.value)}
                    className="w-full input px-3 py-2 text-xs font-mono"
                  />
                </div>
              </div>

              <div className="p-3 bg-[#0e1014] rounded-lg border border-white/[0.04] text-xs text-zinc-400 space-y-1">
                <div className="flex items-center gap-1.5 text-zinc-300 font-medium">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  Edge SSL Gateway Active
                </div>
                <p className="text-[11px] text-zinc-500">
                  Point CNAME record to <code className="text-zinc-300 font-mono">cname.ironpulse.app</code> for automatic Let's Encrypt certificates.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Save Bar */}
        <div className="flex items-center justify-end gap-3 pt-2">
          {savedSuccess && (
            <span className="text-xs font-medium text-emerald-400 flex items-center gap-1.5 animate-in fade-in">
              <Check className="w-3.5 h-3.5" />
              Customizations Saved Live
            </span>
          )}
          <button
            type="submit"
            className="btn-primary px-5 py-2 rounded-lg text-xs flex items-center gap-1.5"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Publish Customizations</span>
          </button>
        </div>
      </form>
    </div>
  );
};
