import React, { useState } from 'react';
import { useTenant } from '../../context/TenantContext';
import { 
  Dumbbell, 
  MapPin, 
  Phone, 
  Check, 
  TicketPercent, 
  Sparkles, 
  UserCheck
} from 'lucide-react';

export const PublicPortalPreview: React.FC = () => {
  const { currentTenant, promotions, classes } = useTenant();

  const [promoInput, setPromoInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<{ code: string; discountPct?: number; discountFixed?: number } | null>(null);
  const [promoError, setPromoError] = useState('');
  const [checkoutModalPlan, setCheckoutModalPlan] = useState<string | null>(null);

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

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      {/* Public Subdomain Navigation Bar */}
      <header className="border-b border-white/10 px-6 py-4 flex items-center justify-between sticky top-[41px] z-40 backdrop-blur-xl bg-zinc-950/80">
        <div className="flex items-center gap-3">
          <div 
            className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white shadow-lg"
            style={{ backgroundColor: currentTenant.primaryColor }}
          >
            <Dumbbell className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-extrabold text-base text-white tracking-tight">{currentTenant.name}</h1>
            <span className="font-mono text-[11px] text-zinc-400">{currentTenant.subdomain}</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-1.5 text-xs text-zinc-400 font-mono">
            <span className="w-1.5 h-1.5 rounded-full dot-approved" />
            <span>{currentTenant.currentOccupancy} Members on Floor</span>
          </div>

          <button 
            onClick={() => setCheckoutModalPlan('Member Portal Sign-In')}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 text-white border border-white/10 tactile-btn flex items-center gap-1.5"
          >
            <UserCheck className="w-3.5 h-3.5" />
            Member Login
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative px-6 py-16 sm:py-24 max-w-6xl mx-auto text-center overflow-hidden">
        <div 
          className="absolute left-1/2 -top-24 -translate-x-1/2 w-96 h-96 rounded-full blur-3xl opacity-25 pointer-events-none"
          style={{ backgroundColor: currentTenant.primaryColor }}
        />

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-white/5 border border-white/10 mb-6">
          <Sparkles className="w-3.5 h-3.5 text-orange-400" />
          <span>Austin's Dedicated Strength & Conditioning Facility</span>
        </div>

        <h2 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-tight max-w-4xl mx-auto">
          {currentTenant.tagline}
        </h2>

        <p className="mt-4 text-sm sm:text-base text-zinc-400 max-w-2xl mx-auto">
          Access high-caliber coaching, open barbell platforms, and metabolic conditioning. No crowd queues, verified capacity caps.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-4 text-xs text-zinc-400 font-mono">
          <div className="flex items-center gap-1.5 bg-zinc-900 px-3 py-1.5 rounded-lg border border-white/5">
            <MapPin className="w-3.5 h-3.5 text-orange-400" />
            {currentTenant.address}
          </div>
          <div className="flex items-center gap-1.5 bg-zinc-900 px-3 py-1.5 rounded-lg border border-white/5">
            <Phone className="w-3.5 h-3.5 text-orange-400" />
            {currentTenant.phone}
          </div>
        </div>
      </section>

      {/* Interactive Promotions Banner */}
      <section className="max-w-4xl mx-auto px-6 mb-12">
        <div className="bg-[#111317] rounded-xl p-5 border border-white/[0.08]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-zinc-400 mb-1">
                <TicketPercent className="w-3.5 h-3.5 text-zinc-400" />
                Voucher Redemption
              </div>
              <h3 className="font-semibold text-sm text-white">Have a Gym Voucher or Referral Code?</h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Active codes: <strong className="text-white font-mono">IRON20</strong> (20% off) or <strong className="text-white font-mono">FIRSTMONTH50</strong> ($50 voucher)
              </p>
            </div>

            <form onSubmit={handleApplyPromo} className="flex items-center gap-2 shrink-0">
              <input
                type="text"
                placeholder="PROMO CODE"
                value={promoInput}
                onChange={e => setPromoInput(e.target.value.toUpperCase())}
                className="bg-[#0d0f12] border border-white/10 rounded-lg px-3 py-1.5 text-xs font-mono uppercase text-white placeholder:text-zinc-600 focus:outline-none w-36"
              />
              <button
                type="submit"
                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white hover:bg-zinc-200 text-zinc-950 tactile-btn"
              >
                Apply
              </button>
            </form>
          </div>

          {appliedPromo && (
            <div className="mt-3 p-2 rounded-[4px] badge-status-approved text-xs font-mono flex items-center gap-2 animate-in fade-in">
              <Check className="w-3.5 h-3.5 text-[#4ade80]" />
              Promotion Code <strong>{appliedPromo.code}</strong> Applied! Savings will be calculated at checkout.
            </div>
          )}

          {promoError && (
            <div className="mt-3 text-red-400 text-xs font-mono">{promoError}</div>
          )}
        </div>
      </section>

      {/* Membership Tiers & Pricing */}
      <section className="max-w-6xl mx-auto px-6 py-8">
        <div className="text-center mb-10">
          <h3 className="text-2xl font-bold text-white tracking-tight">Membership Plans</h3>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">Simple transparent memberships. Zero cancellation fees.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Tier 1: Gold Unlimited */}
          <div className="bg-[#111317] rounded-2xl p-6 border border-white/[0.12] flex flex-col justify-between relative">
            <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider bg-white text-zinc-950 font-semibold">
              Most Popular
            </span>

            <div>
              <div className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider mb-1">UNLIMITED ACCESS</div>
              <h4 className="text-lg font-bold text-white mb-1.5">Gold Unlimited Pass</h4>
              <p className="text-xs text-zinc-400 mb-4">Complete 24/7 access to all barbell zones, platforms & open gym.</p>

              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-3xl font-bold text-white font-mono">
                  ${calculatePrice(189).toFixed(0)}
                </span>
                <span className="text-xs text-zinc-400 font-mono">/ month</span>
                {appliedPromo && (
                  <span className="text-xs text-zinc-500 line-through font-mono ml-2">$189</span>
                )}
              </div>

              <ul className="space-y-2.5 text-xs text-zinc-300">
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                  <span>24/7 Keyless Pass & Check-In</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                  <span>Unlimited Group Fitness Timetable</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                  <span>1 Free Monthly InBody Movement Screen</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => setCheckoutModalPlan('Gold Unlimited Pass')}
              className="mt-6 w-full py-2.5 rounded-lg text-xs font-medium bg-white hover:bg-zinc-200 text-zinc-950 tactile-btn"
            >
              Start Membership
            </button>
          </div>

          {/* Tier 2: Black Card All-Access */}
          <div className="bg-[#111317] rounded-2xl p-6 border border-white/[0.08] flex flex-col justify-between">
            <div>
              <div className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider mb-1">VIP & RECOVERY</div>
              <h4 className="text-lg font-bold text-white mb-1.5">Black Card All-Access</h4>
              <p className="text-xs text-zinc-400 mb-4">Unlimited gym, priority class booking & cold plunge recovery suite.</p>

              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-3xl font-bold text-white font-mono">
                  ${calculatePrice(249).toFixed(0)}
                </span>
                <span className="text-xs text-zinc-400 font-mono">/ month</span>
              </div>

              <ul className="space-y-2.5 text-xs text-zinc-300">
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                  <span>All Gold Benefits Included</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                  <span>Cold Plunge & Infrared Sauna Suite</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                  <span>Dedicated Private Locker & Towel Service</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => setCheckoutModalPlan('Black Card All-Access')}
              className="mt-6 w-full py-2.5 rounded-lg text-xs font-medium bg-[#16191f] hover:bg-[#1e222b] text-zinc-200 border border-white/[0.08] tactile-btn"
            >
              Select Black Card
            </button>
          </div>

          {/* Tier 3: 10-Class Punch Card */}
          <div className="bg-[#111317] rounded-2xl p-6 border border-white/[0.08] flex flex-col justify-between">
            <div>
              <div className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider mb-1">FLEXIBLE PASS</div>
              <h4 className="text-lg font-bold text-white mb-1.5">10-Class Punch Card</h4>
              <p className="text-xs text-zinc-400 mb-4">Ideal for travelers or hybrid athletes. Valid for 90 days.</p>

              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-3xl font-bold text-white font-mono">
                  ${calculatePrice(160).toFixed(0)}
                </span>
                <span className="text-xs text-zinc-400 font-mono">/ pack</span>
              </div>

              <ul className="space-y-2.5 text-xs text-zinc-300">
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                  <span>10 Drop-In Scans</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                  <span>Book Any Group Fitness Timetable</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                  <span>Valid Within 90-Day Window</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => setCheckoutModalPlan('10-Class Punch Card')}
              className="mt-6 w-full py-2.5 rounded-lg text-xs font-medium bg-[#16191f] hover:bg-[#1e222b] text-zinc-200 border border-white/[0.08] tactile-btn"
            >
              Buy Punch Card
            </button>
          </div>
        </div>
      </section>

      {/* Group Class Timetable Preview */}
      <section className="max-w-5xl mx-auto px-6 py-12">
        <div className="text-center mb-8">
          <h3 className="text-2xl font-extrabold text-white">Daily Class Timetable</h3>
          <p className="text-xs text-zinc-400 mt-1">Live capacity sync directly from front-desk scheduler</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {classes.map(cls => (
            <div key={cls.id} className="glass-card rounded-2xl p-4 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-xs font-bold text-orange-400">{cls.startTime}</span>
                  <span className="text-zinc-500 text-xs">•</span>
                  <span className="text-xs font-semibold text-white">{cls.name}</span>
                </div>
                <div className="text-[11px] text-zinc-400">
                  Coach: {cls.coachName} • {cls.room}
                </div>
              </div>

              <div className="text-right">
                <div className="font-mono text-xs font-bold text-zinc-200">
                  {cls.bookedCount} / {cls.capacity} Booked
                </div>
                <span className="text-[10px] text-zinc-400 font-medium">Slots Open</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8 text-center text-xs text-zinc-500 font-mono">
        Powered by IronPulse Multi-Tenant Platform • Subdomain: {currentTenant.subdomain}
      </footer>

      {/* Checkout Modal Simulation */}
      {checkoutModalPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="glass-panel w-full max-w-md rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white text-base">Checkout: {checkoutModalPlan}</h3>
              <button 
                onClick={() => setCheckoutModalPlan(null)}
                className="text-zinc-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-zinc-400">
              Sign in with your email or phone to link your digital turnstile pass to your smartphone wallet.
            </p>

            <div className="space-y-3">
              <button 
                onClick={() => {
                  alert(`Demo: Registered successfully for ${checkoutModalPlan}! PIN code sent via SMS.`);
                  setCheckoutModalPlan(null);
                }}
                className="w-full py-2.5 rounded-xl text-xs font-semibold bg-white text-zinc-900 hover:bg-zinc-200 tactile-btn flex items-center justify-center gap-2"
              >
                Continue with Google
              </button>
              <button 
                onClick={() => {
                  alert(`Demo: Registered successfully for ${checkoutModalPlan}! PIN code sent via SMS.`);
                  setCheckoutModalPlan(null);
                }}
                className="w-full py-2.5 rounded-xl text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 text-white border border-white/10 tactile-btn flex items-center justify-center gap-2"
              >
                Continue with Phone (SMS OTP)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
