import React, { useState } from 'react';
import { useTenant } from '../../context/TenantContext';
import { 
  MapPin, 
  Phone, 
  Check, 
  TicketPercent, 
  UserCheck,
  ArrowRight,
  X,
  Mail,
  ShieldCheck,
  Star,
  Sparkles,
  ChevronRight,
  Clock,
  Dumbbell,
  Flame,
  Award
} from 'lucide-react';

export const PublicPortalPreview: React.FC = () => {
  const { currentTenant, promotions, classes } = useTenant();

  const [promoInput, setPromoInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<{ code: string; discountPct?: number; discountFixed?: number } | null>(null);
  const [promoError, setPromoError] = useState('');
  const [checkoutModalPlan, setCheckoutModalPlan] = useState<string | null>(null);
  const [activeGalleryTab, setActiveGalleryTab] = useState<'ALL' | 'EQUIPMENT' | 'COACHING' | 'RECOVERY'>('ALL');

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    setPromoError('');
    const code = promoInput.trim().toUpperCase();
    const match = promotions.find(p => p.code === code && p.isActive);

    if (match) {
      if (match.discountType === 'PERCENTAGE') {
        setAppliedPromo({ code: match.code, discountPct: match.value });
      } else {
        setAppliedPromo({ code: match.code, discountFixed: match.value / 100 });
      }
    } else {
      setPromoError('Invalid or expired promotion code.');
    }
  };

  const calculatePrice = (basePrice: number) => {
    if (!appliedPromo) return basePrice;
    if (appliedPromo.discountPct) {
      return basePrice * (1 - appliedPromo.discountPct / 100);
    }
    if (appliedPromo.discountFixed) {
      return Math.max(0, basePrice - appliedPromo.discountFixed);
    }
    return basePrice;
  };

  const isLKR = currentTenant.currency === 'LKR';
  const currencySymbol = isLKR ? 'LKR ' : '$';

  const PLANS = [
    {
      id: 'gold',
      tier: 'All Access',
      name: 'Gold Unlimited',
      price: isLKR ? 28000 : 189,
      interval: 'month',
      featured: true,
      tag: 'Most Popular',
      features: [
        '24/7 keyless RFID & biometric access',
        'Unlimited group class timetable',
        'Monthly InBody 570 body composition scan',
        'Dedicated Eleiko Olympic platform booking',
        'Complimentary towel service & locker',
      ],
    },
    {
      id: 'black',
      tier: 'Executive',
      name: 'Black Card VIP',
      price: isLKR ? 42000 : 249,
      interval: 'month',
      featured: false,
      tag: 'Full Recovery',
      features: [
        'All Gold Unlimited benefits included',
        'Infrared sauna & contrast cold plunge suite',
        '1 private personal training assessment / mo',
        'Priority studio reservation window',
        'Shake bar & pre-workout beverage allowance',
      ],
    },
    {
      id: 'punch',
      tier: 'Flexible',
      name: '10-Session Punch Card',
      price: isLKR ? 22000 : 160,
      interval: 'pack',
      featured: false,
      tag: 'No Lock-In',
      features: [
        '10 drop-in facility & class credits',
        'Any timetable session or open gym block',
        '90-day validity from first check-in',
        'Transferable to guest or training partner',
      ],
    },
  ];

  // Imagery & Visual Fallbacks
  const heroImage = currentTenant.heroImage || 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1400&q=85';
  const headline = currentTenant.heroHeadline || currentTenant.tagline;
  const subhead = currentTenant.heroSubhead || 'High-performance barbell training, dedicated coaching, and verified capacity caps.';
  const amenities = currentTenant.amenities || [
    'Eleiko Calibrated Plates',
    '8 Power Racks & Deadlift Platforms',
    'Dumbbells to 50kg',
    'Cold Plunge 10°C & Finnish Sauna',
    'InBody 570 Body Scan',
    'Shake Bar & Clean Recovery Lounge'
  ];

  const gallery = currentTenant.galleryImages && currentTenant.galleryImages.length > 0 
    ? currentTenant.galleryImages 
    : [
        'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=800&q=80'
      ];

  const trainers = currentTenant.trainerHighlights && currentTenant.trainerHighlights.length > 0
    ? currentTenant.trainerHighlights
    : [
        {
          name: 'Coach Roshan Wijesinghe',
          role: 'Head of Strength & Conditioning',
          specialty: 'National Powerlifting Coach · Biomechanics',
          image: 'https://images.unsplash.com/photo-1567013127542-490d757e51fc?auto=format&fit=crop&w=600&q=80'
        },
        {
          name: 'Kavindi Perera',
          role: 'Senior Olympic Lifting Specialist',
          specialty: 'Snatch & Clean Technique · Mobility',
          image: 'https://images.unsplash.com/photo-1594381898411-846e7d193883?auto=format&fit=crop&w=600&q=80'
        },
        {
          name: 'Devin Fernando',
          role: 'Physiology & Conditioning Coach',
          specialty: 'VO2 Max Conditioning · Functional Hypertrophy',
          image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=600&q=80'
        }
      ];

  const reviews = currentTenant.reviews && currentTenant.reviews.length > 0
    ? currentTenant.reviews
    : [
        {
          author: 'Malik Jayawardena',
          rating: 5,
          quote: 'The standard of barbell equipment here is unmatched in Sri Lanka. 8 calibrated Eleiko platforms and zero waiting.',
          achievement: 'Added 40kg to deadlift in 6 months'
        },
        {
          author: 'Dr. Shenali Mendis',
          rating: 5,
          quote: 'Clean, professional atmosphere with cold plunge and sauna. Best recovery routine after morning strength blocks.',
          achievement: 'Member for 14 months'
        }
      ];

  return (
    <div className="min-h-screen bg-[#08090b] text-zinc-100 flex flex-col font-sans selection:bg-white selection:text-zinc-950">
      {/* Editorial Navigation */}
      <nav className="border-b border-white/[0.08] px-5 sm:px-8 py-3.5 flex items-center justify-between sticky top-12 z-30 bg-[#08090b]/90 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div 
            className="w-9 h-9 rounded-lg font-bold text-xs flex items-center justify-center transition-all shadow-sm border border-white/10"
            style={{ 
              backgroundColor: currentTenant.primaryColor || '#ffffff',
              color: currentTenant.primaryColor === '#ffffff' || currentTenant.primaryColor === '#f4f5f6' ? '#09090b' : '#ffffff'
            }}
          >
            {currentTenant.name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-semibold text-sm text-white tracking-tight leading-tight">{currentTenant.name}</h1>
              <span className="hidden sm:inline-block px-1.5 py-0.2 rounded text-[9px] font-mono border border-white/[0.10] text-zinc-400 bg-white/[0.03]">
                Verified Facility
              </span>
            </div>
            <span className="font-mono text-[11px] text-zinc-500">{currentTenant.subdomain}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {currentTenant.showOccupancyLive !== false && (
            <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-lg bg-white/[0.02] border border-white/[0.08] text-[11px] font-mono text-zinc-300">
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-300" />
              <span>{currentTenant.currentOccupancy} Athletes on Floor</span>
            </div>
          )}

          <button 
            onClick={() => setCheckoutModalPlan('Member Portal Sign-In')}
            className="btn-secondary px-3.5 py-1.5 rounded-lg text-xs flex items-center gap-1.5"
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Member Login</span>
          </button>
        </div>
      </nav>

      {/* Cinematic Hero Header with Immersive Photography */}
      <section className="relative px-4 sm:px-8 pt-8 pb-12 max-w-6xl mx-auto w-full">
        <div className="relative rounded-2xl overflow-hidden border border-white/[0.10] shadow-2xl bg-[#0c0e12] min-h-[500px] sm:min-h-[560px] flex flex-col justify-between p-6 sm:p-12">
          {/* Main Backdrop Image */}
          <img 
            src={heroImage} 
            alt={currentTenant.name}
            className="absolute inset-0 w-full h-full object-cover brightness-[0.48] contrast-[1.08] saturate-[1.1] scale-[1.01]"
          />

          {/* Vignette Gradients */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#08090b] via-[#08090b]/60 to-transparent" />
          <div className="absolute inset-0 bg-radial from-transparent to-[#08090b]/80" />

          {/* Top Bar inside Hero with clear padding to avoid overlaps */}
          <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 pt-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full text-[10px] font-mono uppercase tracking-wider bg-black/80 backdrop-blur-md text-zinc-200 border border-white/15 flex items-center gap-1.5 shadow-sm">
                <ShieldCheck className="w-3.5 h-3.5 text-zinc-300" />
                <span>Verified Facility</span>
              </span>
              <span className="px-3 py-1 rounded-full text-[10px] font-mono bg-black/80 backdrop-blur-md text-zinc-300 border border-white/15 shadow-sm">
                {currentTenant.subdomain}
              </span>
              {currentTenant.customDomain && (
                <span className="px-3 py-1 rounded-full text-[10px] font-mono bg-black/80 backdrop-blur-md text-zinc-300 border border-white/15 hidden sm:inline shadow-sm">
                  {currentTenant.customDomain}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 text-xs font-mono text-zinc-300 bg-black/80 backdrop-blur-md px-3 py-1 rounded-full border border-white/15 shadow-sm">
              <Clock className="w-3.5 h-3.5 text-zinc-400" />
              <span>05:30 – 22:00</span>
            </div>
          </div>

          {/* Centered Editorial Hero Content */}
          <div className="relative z-10 max-w-3xl mx-auto text-center flex flex-col items-center py-10 sm:py-16 space-y-4">
            {/* Centered Tagline Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.08] backdrop-blur-md border border-white/15 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-zinc-300" />
              <span className="text-xs font-mono uppercase tracking-widest text-zinc-200 font-semibold">
                {currentTenant.tagline}
              </span>
            </div>

            <h2 className="text-3xl sm:text-5xl lg:text-6xl font-bold text-white tracking-tight leading-[1.08] text-balance">
              {headline}
            </h2>

            <p className="text-sm sm:text-base text-zinc-300 leading-relaxed max-w-2xl text-pretty pt-1">
              {subhead}
            </p>

            {/* Centered CTAs */}
            <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={() => setCheckoutModalPlan('Gold Unlimited Pass')}
                className="btn-primary px-6 py-3 rounded-lg text-xs font-semibold flex items-center gap-2 shadow-lg"
              >
                <span>Join Facility</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setCheckoutModalPlan('Private Facility Tour')}
                className="btn-secondary px-5 py-3 rounded-lg text-xs font-medium backdrop-blur-md bg-black/50 hover:bg-black/70 border border-white/15"
              >
                Schedule Private Tour
              </button>
            </div>

            {/* Centered Location & Phone Meta */}
            <div className="pt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-zinc-400 font-mono border-t border-white/[0.10] w-full max-w-xl">
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-zinc-400" />
                {currentTenant.address}
              </span>
              <span className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-zinc-400" />
                {currentTenant.phone}
              </span>
            </div>
          </div>

          {/* Bottom spacing spacer */}
          <div className="hidden sm:block h-2" />
        </div>
      </section>

      {/* Facility Highlights / Specs Bar */}
      <section className="max-w-6xl mx-auto px-4 sm:px-8 pb-12 w-full">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="card p-4 rounded-xl border border-white/[0.08] bg-[#0c0e12]">
            <div className="flex items-center gap-2 text-zinc-400 mb-1">
              <Dumbbell className="w-4 h-4 text-zinc-400" />
              <span className="text-[11px] font-mono uppercase tracking-wider">Lifting Arena</span>
            </div>
            <div className="text-lg font-bold text-white">8 Competition Platforms</div>
            <div className="text-[11px] text-zinc-500 mt-0.5">Calibrated Eleiko & Rogue bars</div>
          </div>

          <div className="card p-4 rounded-xl border border-white/[0.08] bg-[#0c0e12]">
            <div className="flex items-center gap-2 text-zinc-400 mb-1">
              <Flame className="w-4 h-4 text-zinc-400" />
              <span className="text-[11px] font-mono uppercase tracking-wider">Thermal Suite</span>
            </div>
            <div className="text-lg font-bold text-white">Cold Plunge & Sauna</div>
            <div className="text-[11px] text-zinc-500 mt-0.5">10°C contrast plunge & dry heat</div>
          </div>

          <div className="card p-4 rounded-xl border border-white/[0.08] bg-[#0c0e12]">
            <div className="flex items-center gap-2 text-zinc-400 mb-1">
              <Award className="w-4 h-4 text-zinc-400" />
              <span className="text-[11px] font-mono uppercase tracking-wider">Diagnostics</span>
            </div>
            <div className="text-lg font-bold text-white">InBody 570 Bio-Scan</div>
            <div className="text-[11px] text-zinc-500 mt-0.5">Segmental lean mass & water tracking</div>
          </div>

          <div className="card p-4 rounded-xl border border-white/[0.08] bg-[#0c0e12]">
            <div className="flex items-center gap-2 text-zinc-400 mb-1">
              <ShieldCheck className="w-4 h-4 text-zinc-400" />
              <span className="text-[11px] font-mono uppercase tracking-wider">Access Model</span>
            </div>
            <div className="text-lg font-bold text-white">Capped Occupancy</div>
            <div className="text-[11px] text-zinc-500 mt-0.5">No crowded waits or shared racks</div>
          </div>
        </div>
      </section>

      {/* Visual Photography Gallery — The Salon / Boutique Gym Vibe */}
      <section className="max-w-6xl mx-auto px-4 sm:px-8 pb-16 w-full">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
          <div>
            <div className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-1 flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-zinc-400" />
              <span>Facility Atmosphere & Spaces</span>
            </div>
            <h3 className="text-2xl font-bold text-white tracking-tight">Curated Architecture & Equipment</h3>
          </div>

          <div className="flex items-center gap-1.5 p-1 rounded-lg bg-[#0e1014] border border-white/[0.06] text-xs font-mono">
            {(['ALL', 'EQUIPMENT', 'COACHING', 'RECOVERY'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveGalleryTab(tab)}
                className={`px-3 py-1 rounded-md text-[11px] transition-all ${
                  activeGalleryTab === tab
                    ? 'bg-white text-zinc-950 font-semibold shadow-sm'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic Image Mosaic Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {gallery.map((imgUrl, idx) => (
            <div 
              key={idx}
              className={`group relative rounded-xl overflow-hidden border border-white/[0.08] bg-[#0c0e12] shadow-lg ${
                idx === 0 ? 'sm:col-span-2 sm:row-span-2 min-h-[340px] sm:min-h-[440px]' : 'min-h-[210px]'
              }`}
            >
              <img 
                src={imgUrl} 
                alt={`${currentTenant.name} space ${idx + 1}`}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 brightness-[0.78]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80 group-hover:opacity-95 transition-opacity" />
              
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">
                    {idx === 0 ? 'Main Powerlifting Floor' : idx === 1 ? 'Thermal Recovery' : idx === 2 ? 'Cardio & Conditioning' : 'Private PT Suite'}
                  </span>
                  <div className="text-xs font-medium text-white mt-0.5">
                    {idx === 0 ? '8 Eleiko Olympic Platforms' : idx === 1 ? 'Cold Plunge 10°C & Dry Sauna' : idx === 2 ? 'Curved Treadmills & Rowers' : 'Custom Biomechanics Testing'}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Amenities Tags */}
      <section className="max-w-6xl mx-auto px-4 sm:px-8 pb-16 w-full">
        <div className="card p-6 rounded-2xl border border-white/[0.08] bg-[#0c0e12]">
          <h4 className="text-sm font-semibold text-white mb-4">Included with Every Club Membership</h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {amenities.map((item, idx) => (
              <div 
                key={idx}
                className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] text-xs text-zinc-300 flex flex-col justify-between"
              >
                <Check className="w-3.5 h-3.5 text-zinc-400 mb-2" />
                <span className="leading-snug">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Coaching Staff Highlights */}
      <section className="max-w-6xl mx-auto px-4 sm:px-8 pb-16 w-full">
        <div className="mb-8">
          <div className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-1">
            Master Coaching Staff
          </div>
          <h3 className="text-2xl font-bold text-white tracking-tight">Coached by National Athletes & Specialists</h3>
          <p className="text-xs text-zinc-400 mt-1 max-w-xl">
            Our trainers are certified strength specialists with competitive athletic credentials.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {trainers.map((coach, idx) => (
            <div 
              key={idx}
              className="card rounded-xl overflow-hidden border border-white/[0.08] bg-[#0c0e12] group flex flex-col"
            >
              <div className="h-60 overflow-hidden relative">
                <img 
                  src={coach.image} 
                  alt={coach.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 brightness-[0.82]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0c0e12] via-transparent to-transparent" />
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between -mt-6 relative z-10">
                <div>
                  <h4 className="text-base font-semibold text-white">{coach.name}</h4>
                  <div className="text-xs font-mono text-zinc-400 mt-0.5">{coach.role}</div>
                  <p className="text-xs text-zinc-400 mt-3 leading-relaxed">
                    {coach.specialty}
                  </p>
                </div>

                <button 
                  onClick={() => setCheckoutModalPlan(`1-on-1 Consultation: ${coach.name}`)}
                  className="mt-5 w-full py-2 rounded-lg btn-secondary text-xs font-medium flex items-center justify-center gap-1.5"
                >
                  <span>Book Consultation</span>
                  <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Member Testimonials / Social Proof */}
      <section className="max-w-6xl mx-auto px-4 sm:px-8 pb-16 w-full">
        <div className="mb-6">
          <div className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-1">
            Member Experiences
          </div>
          <h3 className="text-2xl font-bold text-white tracking-tight">The Member Perspective</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reviews.map((rev, idx) => (
            <div key={idx} className="card p-6 rounded-xl border border-white/[0.08] bg-[#0c0e12] flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-1">
                  {[...Array(rev.rating)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-zinc-200 text-zinc-200" />
                  ))}
                </div>
                <p className="text-sm text-zinc-200 leading-relaxed italic">
                  "{rev.quote}"
                </p>
              </div>

              <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-white">{rev.author}</div>
                  <div className="text-[11px] font-mono text-zinc-500">{rev.achievement}</div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono border border-white/[0.08] text-zinc-400">
                  Verified Member
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Voucher Code Strip */}
      <section className="max-w-6xl mx-auto px-4 sm:px-8 pb-12 w-full">
        <div className="card p-5 rounded-xl border border-white/[0.08] bg-[#0c0e12] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-9 h-9 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center shrink-0">
              <TicketPercent className="w-4 h-4 text-zinc-300" />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-white">Have an invite or referral voucher?</h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Apply promotion code to deduct from initial membership registration.
              </p>
            </div>
          </div>

          <form onSubmit={handleApplyPromo} className="flex items-center gap-2 shrink-0">
            <input
              type="text"
              placeholder="VOUCHER CODE"
              value={promoInput}
              onChange={e => setPromoInput(e.target.value.toUpperCase())}
              className="bg-[#16181d] border border-white/[0.08] rounded-lg px-3 py-2 text-xs font-mono uppercase text-white placeholder-zinc-500 w-36 focus:outline-none focus:border-white/[0.20]"
            />
            <button type="submit" className="btn-primary px-4 py-2 rounded-lg text-xs font-semibold">
              Apply
            </button>
          </form>
        </div>

        {appliedPromo && (
          <div className="mt-2.5 px-3 py-2 rounded-lg text-xs font-mono border border-white/[0.12] bg-white/[0.04] text-zinc-200 flex items-center gap-2">
            <Check className="w-3.5 h-3.5 text-zinc-300" />
            <span>Voucher <strong>{appliedPromo.code}</strong> applied — discount reflected below</span>
          </div>
        )}

        {promoError && (
          <div className="mt-2.5 px-3 py-2 rounded-lg text-xs font-mono border border-rose-500/20 bg-rose-500/10 text-rose-400">
            {promoError}
          </div>
        )}
      </section>

      {/* Membership Tiers */}
      <section className="max-w-6xl mx-auto px-4 sm:px-8 pb-16 w-full">
        <div className="mb-8">
          <div className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-1">
            Transparent Pricing
          </div>
          <h3 className="text-2xl font-bold text-white tracking-tight">Facility Memberships & Day Passes</h3>
          <p className="text-xs text-zinc-400 mt-1">Zero hidden registration fees. Flexible freeze policies available.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {PLANS.map(plan => (
            <div 
              key={plan.id} 
              className={`rounded-xl p-6 flex flex-col justify-between relative transition-all ${
                plan.featured 
                  ? 'bg-[#111317] border-2 border-white/[0.20] shadow-xl' 
                  : 'card bg-[#0c0e12] border border-white/[0.08]'
              }`}
            >
              {plan.tag && (
                <span className="absolute -top-2.5 left-5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-white text-zinc-950">
                  {plan.tag}
                </span>
              )}

              <div>
                <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">{plan.tier}</span>
                <h4 className="text-lg font-semibold text-white mt-1">{plan.name}</h4>

                <div className="flex items-baseline gap-1 mt-4 mb-6">
                  <span className="text-3xl sm:text-4xl font-bold text-white tabular-nums font-mono">
                    {currencySymbol}{calculatePrice(plan.price).toLocaleString()}
                  </span>
                  <span className="text-xs text-zinc-400 font-mono">/{plan.interval}</span>
                  {appliedPromo && (
                    <span className="text-xs text-zinc-500 line-through font-mono ml-2">
                      {currencySymbol}{plan.price.toLocaleString()}
                    </span>
                  )}
                </div>

                <ul className="space-y-3">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-xs text-zinc-300">
                      <Check className="w-3.5 h-3.5 text-zinc-400 shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                onClick={() => setCheckoutModalPlan(plan.name)}
                className={`mt-8 w-full py-2.5 rounded-lg text-xs font-semibold transition-all ${
                  plan.featured 
                    ? 'btn-primary' 
                    : 'btn-secondary'
                }`}
              >
                {plan.featured ? 'Enroll in Membership' : `Choose ${plan.name}`}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Class Schedule Timetable */}
      <section className="max-w-6xl mx-auto px-4 sm:px-8 pb-20 w-full">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div>
            <div className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-1">
              Live Timetable
            </div>
            <h3 className="text-2xl font-bold text-white tracking-tight">Today’s Studio & Floor Schedule</h3>
          </div>
          <span className="text-xs font-mono text-zinc-500">Live booking status synced from reception</span>
        </div>

        <div className="card rounded-xl overflow-hidden border border-white/[0.08] divide-y divide-white/[0.04] bg-[#0c0e12]">
          {classes.map(cls => {
            const spotsLeft = cls.capacity - cls.bookedCount;
            return (
              <div key={cls.id} className="px-5 py-4 flex items-center justify-between gap-4 hover:bg-white/[0.015] transition-colors">
                <div className="flex items-center gap-5 min-w-0">
                  <div className="text-center shrink-0 w-14">
                    <div className="font-mono text-sm font-semibold text-white">{cls.startTime}</div>
                    <div className="font-mono text-[10px] text-zinc-500">{cls.endTime}</div>
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-medium text-sm text-white truncate">{cls.name}</h4>
                    <p className="text-[11px] text-zinc-400 truncate">{cls.coachName} · {cls.room}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className={`font-mono text-xs tabular-nums ${spotsLeft <= 2 ? 'text-amber-400' : 'text-zinc-400'}`}>
                    {spotsLeft > 0 ? `${spotsLeft} spots open` : 'Roster Full'}
                  </span>
                  <button 
                    onClick={() => setCheckoutModalPlan(`Class Booking: ${cls.name}`)}
                    className="btn-secondary px-3 py-1.5 rounded-lg text-xs"
                  >
                    Reserve Spot
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Professional Footer */}
      <footer className="border-t border-white/[0.08] py-12 px-6 bg-[#060709] mt-auto">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-zinc-500">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded bg-white text-zinc-950 font-bold text-[9px] flex items-center justify-center">
              IP
            </div>
            <div>
              <span className="font-semibold text-zinc-300">{currentTenant.name}</span>
              <p className="text-[11px] text-zinc-500">Powered by IronPulse Multi-Tenant Platform</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6 font-mono text-[11px]">
            <span>{currentTenant.subdomain}</span>
            <span>·</span>
            <span>{currentTenant.phone}</span>
            <span>·</span>
            <span>{currentTenant.address}</span>
          </div>
        </div>
      </footer>

      {/* Checkout / Tour Request Modal */}
      {checkoutModalPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-sm rounded-xl p-6 space-y-4 bg-[#111317] border border-white/[0.10] shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">Checkout</span>
                <h3 className="font-semibold text-white text-sm mt-0.5">{checkoutModalPlan}</h3>
              </div>
              <button 
                onClick={() => setCheckoutModalPlan(null)}
                className="text-zinc-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-zinc-400 leading-relaxed">
              Verify your details to link this membership or session reservation to your mobile smartphone pass.
            </p>

            <div className="space-y-2 pt-2">
              <button 
                onClick={() => {
                  alert(`Confirmed enrollment for ${checkoutModalPlan}. Digital access code dispatched.`);
                  setCheckoutModalPlan(null);
                }}
                className="btn-primary w-full py-2.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-2"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Continue with Email</span>
              </button>
              <button 
                onClick={() => {
                  alert(`Confirmed enrollment for ${checkoutModalPlan}. Digital access code dispatched.`);
                  setCheckoutModalPlan(null);
                }}
                className="btn-secondary w-full py-2.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-2"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Continue with Phone / SMS</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
