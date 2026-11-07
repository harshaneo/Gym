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
  Mail
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

  const PLANS = [
    {
      id: 'gold',
      tier: 'Unlimited',
      name: 'Gold Unlimited',
      price: 189,
      interval: 'month',
      featured: true,
      features: [
        '24/7 keyless facility access',
        'Unlimited group class timetable',
        'Monthly InBody movement screen',
        'Open barbell platform use',
      ],
    },
    {
      id: 'black',
      tier: 'VIP',
      name: 'Black Card',
      price: 249,
      interval: 'month',
      featured: false,
      features: [
        'All Gold benefits included',
        'Cold plunge & infrared sauna',
        'Priority class reservations',
        'Dedicated locker & towel service',
      ],
    },
    {
      id: 'punch',
      tier: 'Flexible',
      name: '10-Visit Card',
      price: 160,
      interval: 'pack',
      featured: false,
      features: [
        '10 drop-in session credits',
        'Any group class booking',
        '90-day validity window',
        'No recurring commitment',
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-[#08090b] text-zinc-100">
      {/* Navigation */}
      <nav className="border-b border-white/[0.06] px-5 sm:px-8 py-3 flex items-center justify-between sticky top-14 z-30 bg-[#08090b]/95 backdrop-blur-lg">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-white text-zinc-950 font-bold text-xs flex items-center justify-center">
            {currentTenant.name.charAt(0)}
          </div>
          <div>
            <h1 className="font-semibold text-sm text-white tracking-tight leading-tight">{currentTenant.name}</h1>
            <span className="font-mono text-[10px] text-zinc-500">{currentTenant.subdomain}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-4 text-xs text-zinc-400 mr-3">
            <span className="hover:text-white cursor-pointer transition-colors">Classes</span>
            <span className="hover:text-white cursor-pointer transition-colors">Pricing</span>
            <span className="hover:text-white cursor-pointer transition-colors">Contact</span>
          </div>
          <button 
            onClick={() => setCheckoutModalPlan('Member Portal Sign-In')}
            className="btn-secondary px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5"
          >
            <UserCheck className="w-3.5 h-3.5" />
            Sign In
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="px-6 sm:px-8 pt-16 sm:pt-24 pb-12 max-w-5xl mx-auto">
        <div className="max-w-2xl">
          <div className="flex items-center gap-2 mb-5">
            <span className="w-1.5 h-1.5 rounded-full dot-live" />
            <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">
              {currentTenant.currentOccupancy} members on floor · Open now
            </span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-bold text-white tracking-tight leading-[1.1]">
            {currentTenant.tagline}
          </h2>

          <p className="mt-5 text-[15px] leading-relaxed text-zinc-400 max-w-xl">
            Serious coaching. Open barbell platforms. Verified capacity limits so you always have space to train.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <button
              onClick={() => setCheckoutModalPlan('Gold Unlimited')}
              className="btn-primary px-5 py-2.5 rounded-lg text-sm flex items-center gap-2"
            >
              Start Membership
              <ArrowRight className="w-4 h-4" />
            </button>
            <button className="btn-secondary px-4 py-2.5 rounded-lg text-sm">
              Book a Tour
            </button>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-zinc-500 font-mono">
            <span className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-zinc-600" />
              {currentTenant.address}
            </span>
            <span className="flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-zinc-600" />
              {currentTenant.phone}
            </span>
          </div>
        </div>
      </section>

      {/* Promo Bar */}
      <section className="max-w-5xl mx-auto px-6 sm:px-8 mb-16">
        <div className="card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center shrink-0">
              <TicketPercent className="w-4 h-4 text-zinc-400" />
            </div>
            <div>
              <h3 className="font-medium text-sm text-white">Have a promo code?</h3>
              <p className="text-[11px] text-zinc-500 mt-0.5">
                Try <span className="font-mono text-zinc-300">IRON20</span> or <span className="font-mono text-zinc-300">FIRSTMONTH50</span>
              </p>
            </div>
          </div>

          <form onSubmit={handleApplyPromo} className="flex items-center gap-2 shrink-0">
            <input
              type="text"
              placeholder="CODE"
              value={promoInput}
              onChange={e => setPromoInput(e.target.value.toUpperCase())}
              className="input rounded-lg px-3 py-1.5 text-xs font-mono uppercase w-28"
            />
            <button type="submit" className="btn-primary px-3 py-1.5 rounded-lg text-xs">
              Apply
            </button>
          </form>
        </div>

        {appliedPromo && (
          <div className="mt-2 badge-success px-3 py-2 rounded-lg text-xs font-mono flex items-center gap-2">
            <Check className="w-3.5 h-3.5" />
            <span><strong>{appliedPromo.code}</strong> applied — savings reflected in pricing below</span>
          </div>
        )}

        {promoError && (
          <div className="mt-2 badge-danger px-3 py-2 rounded-lg text-xs font-mono">{promoError}</div>
        )}
      </section>

      {/* Pricing */}
      <section className="max-w-5xl mx-auto px-6 sm:px-8 pb-16">
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-white tracking-tight">Membership</h3>
          <p className="text-sm text-zinc-500 mt-1">Simple pricing. Cancel anytime.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {PLANS.map(plan => (
            <div 
              key={plan.id} 
              className={`rounded-xl p-5 flex flex-col justify-between relative ${
                plan.featured 
                  ? 'bg-[#111317] border-2 border-white/[0.16]' 
                  : 'card'
              }`}
            >
              {plan.featured && (
                <span className="absolute -top-2.5 left-5 px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-white text-zinc-950">
                  Popular
                </span>
              )}

              <div>
                <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">{plan.tier}</span>
                <h4 className="text-base font-semibold text-white mt-1">{plan.name}</h4>

                <div className="flex items-baseline gap-1 mt-4 mb-5">
                  <span className="text-3xl font-semibold text-white tabular-nums">
                    ${calculatePrice(plan.price).toFixed(0)}
                  </span>
                  <span className="text-xs text-zinc-500 font-mono">/{plan.interval}</span>
                  {appliedPromo && (
                    <span className="text-xs text-zinc-600 line-through font-mono ml-1.5">${plan.price}</span>
                  )}
                </div>

                <ul className="space-y-2.5">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-xs text-zinc-400">
                      <Check className="w-3.5 h-3.5 text-zinc-600 shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                onClick={() => setCheckoutModalPlan(plan.name)}
                className={`mt-6 w-full py-2.5 rounded-lg text-xs font-medium ${
                  plan.featured 
                    ? 'btn-primary' 
                    : 'btn-secondary'
                }`}
              >
                {plan.featured ? 'Start Membership' : `Select ${plan.name}`}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Class Timetable */}
      <section className="max-w-5xl mx-auto px-6 sm:px-8 pb-20">
        <div className="mb-6">
          <h3 className="text-xl font-semibold text-white tracking-tight">Today's Classes</h3>
          <p className="text-sm text-zinc-500 mt-1">Live capacity from the front-desk scheduler</p>
        </div>

        <div className="card overflow-hidden divide-y divide-white/[0.04]">
          {classes.map(cls => {
            const spotsLeft = cls.capacity - cls.bookedCount;
            return (
              <div key={cls.id} className="px-5 py-3.5 flex items-center justify-between gap-4 hover:bg-white/[0.015] transition-colors">
                <div className="flex items-center gap-4 min-w-0">
                  <div className="text-center shrink-0 w-12">
                    <div className="font-mono text-sm font-semibold text-white">{cls.startTime}</div>
                    <div className="font-mono text-[10px] text-zinc-600">{cls.endTime}</div>
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-medium text-sm text-white truncate">{cls.name}</h4>
                    <p className="text-[11px] text-zinc-500 truncate">{cls.coachName} · {cls.room}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className={`font-mono text-xs tabular-nums ${spotsLeft <= 2 ? 'text-amber-400' : 'text-zinc-400'}`}>
                    {spotsLeft > 0 ? `${spotsLeft} spots` : 'Full'}
                  </span>
                  <button className="btn-secondary px-2.5 py-1 rounded-md text-[11px]">
                    Book
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/[0.06] py-10 px-6">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-600">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-white text-zinc-950 font-bold text-[8px] flex items-center justify-center">IP</div>
            <span className="font-mono">Powered by IronPulse</span>
          </div>
          <div className="flex items-center gap-4 font-mono">
            <span>{currentTenant.subdomain}</span>
            <span>·</span>
            <span>{currentTenant.phone}</span>
          </div>
        </div>
      </footer>

      {/* Checkout Modal */}
      {checkoutModalPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-overlay">
          <div className="modal-panel w-full max-w-sm rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-white text-sm">{checkoutModalPlan}</h3>
              <button 
                onClick={() => setCheckoutModalPlan(null)}
                className="text-zinc-500 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-zinc-400">
              Sign in to link your digital pass to your smartphone wallet.
            </p>

            <div className="space-y-2.5">
              <button 
                onClick={() => {
                  alert(`Registered for ${checkoutModalPlan}. PIN code sent via SMS.`);
                  setCheckoutModalPlan(null);
                }}
                className="btn-primary w-full py-2.5 rounded-lg text-xs flex items-center justify-center gap-2"
              >
                <Mail className="w-3.5 h-3.5" />
                Continue with Email
              </button>
              <button 
                onClick={() => {
                  alert(`Registered for ${checkoutModalPlan}. PIN code sent via SMS.`);
                  setCheckoutModalPlan(null);
                }}
                className="btn-secondary w-full py-2.5 rounded-lg text-xs flex items-center justify-center gap-2"
              >
                <Phone className="w-3.5 h-3.5" />
                Continue with Phone
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
