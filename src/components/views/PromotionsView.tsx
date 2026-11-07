import React, { useState } from 'react';
import { useTenant } from '../../context/TenantContext';
import { DiscountType, MembershipTier } from '../../types';
import { 
  TicketPercent, 
  Plus, 
  Copy, 
  Check, 
  Calendar, 
  X
} from 'lucide-react';

export const PromotionsView: React.FC = () => {
  const { currentTenant, promotions, addPromotion, togglePromotionActive } = useTenant();

  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // Form states
  const [formCode, setFormCode] = useState('');
  const [formTitle, setFormTitle] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formType, setFormType] = useState<DiscountType>('PERCENTAGE');
  const [formValue, setFormValue] = useState('20');
  const [formMax, setFormMax] = useState('50');
  const [formValidUntil, setFormValidUntil] = useState('2026-12-31');
  const formTiers: MembershipTier[] = ['GOLD_UNLIMITED', 'BLACK_CARD_ALL_ACCESS'];

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleCreatePromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formCode || !formTitle) return;

    const val = formType === 'PERCENTAGE' 
      ? Number(formValue) 
      : Math.round(Number(formValue) * 100);

    addPromotion({
      code: formCode.toUpperCase().replace(/\s+/g, ''),
      title: formTitle,
      description: formDesc,
      discountType: formType,
      value: val,
      maxRedemptions: Number(formMax) || 100,
      validFrom: new Date().toISOString().split('T')[0],
      validUntil: formValidUntil,
      isActive: true,
      applicableTiers: formTiers,
    });

    setShowAddModal(false);
    setFormCode('');
    setFormTitle('');
    setFormDesc('');
  };

  const totalRedemptions = promotions.reduce((acc, p) => acc + p.currentRedemptions, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Promotions & Marketing Offers</h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Configure discount codes, referral passes, and member acquisition vouchers.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-3.5 py-2 rounded-lg font-medium text-xs bg-white hover:bg-zinc-200 text-zinc-950 tactile-btn flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Promo Code</span>
        </button>
      </div>

      {/* KPI Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#111317] border border-white/[0.08] rounded-xl p-4">
          <span className="text-xs text-zinc-400 font-medium">Active Campaigns</span>
          <div className="text-xl font-bold text-white font-mono mt-1">
            {promotions.filter(p => p.isActive).length} <span className="text-zinc-500 text-xs font-normal">/ {promotions.length}</span>
          </div>
          <span className="text-[11px] text-zinc-500 font-mono">Live on public subdomain</span>
        </div>

        <div className="bg-[#111317] border border-white/[0.08] rounded-xl p-4">
          <span className="text-xs text-zinc-400 font-medium">Total Code Redemptions</span>
          <div className="text-xl font-bold text-zinc-200 font-mono mt-1">
            {totalRedemptions}
          </div>
          <span className="text-[11px] text-zinc-500 font-mono">Verified member signups</span>
        </div>

        <div className="bg-[#111317] border border-white/[0.08] rounded-xl p-4">
          <span className="text-xs text-zinc-400 font-medium">Member Referral Pass Rate</span>
          <div className="text-xl font-semibold text-white tracking-tight tabular-nums mt-1">
            78.4%
          </div>
          <span className="text-[11px] text-zinc-500 font-mono">Converted to annual contracts</span>
        </div>
      </div>

      {/* Promotions Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {promotions.map(promo => {
          const isFull = promo.currentRedemptions >= promo.maxRedemptions;
          const pct = Math.round((promo.currentRedemptions / promo.maxRedemptions) * 100);

          return (
            <div 
              key={promo.id} 
              className={`bg-[#111317] rounded-xl p-4 border flex flex-col justify-between transition-colors ${
                promo.isActive ? 'border-white/[0.08] hover:border-white/[0.15]' : 'opacity-50 border-white/[0.04]'
              }`}
            >
              <div>
                {/* Header row with badge & toggle */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-white/[0.06] text-zinc-300">
                    {promo.discountType === 'PERCENTAGE' ? `${promo.value}% OFF` : `$${(promo.value / 100).toFixed(0)} VOUCHER`}
                  </span>

                  <button
                    onClick={() => togglePromotionActive(promo.id)}
                    className="text-zinc-400 hover:text-white transition-colors"
                    title={promo.isActive ? 'Pause Promotion' : 'Activate Promotion'}
                  >
                    {promo.isActive ? (
                      <span className="flex items-center gap-1.5 text-[11px] text-zinc-300 font-medium">
                        <span className="w-1.5 h-1.5 rounded-full dot-approved" />
                        <span>Active</span>
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-[11px] text-zinc-500 font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-zinc-600" />
                        <span>Paused</span>
                      </span>
                    )}
                  </button>
                </div>

                {/* Code keycap */}
                <div className="flex items-center justify-between bg-[#16191f] border border-white/[0.06] rounded-lg p-2.5 mb-3">
                  <div className="font-mono text-sm font-bold text-white tracking-wider">
                    {promo.code}
                  </div>
                  <button
                    onClick={() => handleCopy(promo.code)}
                    className="p-1 rounded bg-[#20242c] hover:bg-[#282d37] text-zinc-400 hover:text-white transition-colors"
                    title="Copy promo code"
                  >
                    {copiedCode === promo.code ? (
                      <Check className="w-3.5 h-3.5 text-[#4ade80]" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>

                <h3 className="font-semibold text-xs text-white mb-1">{promo.title}</h3>
                <p className="text-[11px] text-zinc-400 leading-relaxed mb-3">{promo.description}</p>
              </div>

              {/* Redemptions progress */}
              <div className="pt-2.5 border-t border-white/[0.04] space-y-1.5">
                <div className="flex items-center justify-between text-[11px] text-zinc-400 font-mono">
                  <span>Redemptions</span>
                  <span className="text-zinc-200">
                    {promo.currentRedemptions} <span className="text-zinc-500">/ {promo.maxRedemptions}</span>
                  </span>
                </div>
                <div className="w-full bg-zinc-800 rounded-full h-1 overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-300 ${
                      isFull ? 'bg-amber-400' : 'bg-white'
                    }`}
                    style={{ width: `${Math.min(pct, 100)}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[10px] text-zinc-500 pt-0.5">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-zinc-600" />
                    Valid until {promo.validUntil}
                  </span>
                  <span>{pct}% capacity</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Promotion Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="glass-panel w-full max-w-md rounded-2xl p-6 shadow-2xl relative">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400">
                <TicketPercent className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-white text-base">New Promotion Campaign</h3>
                <p className="text-xs text-zinc-400">Launch a coupon code for {currentTenant.name}</p>
              </div>
            </div>

            <form onSubmit={handleCreatePromo} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">Coupon Code (Uppercase)</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. TITAN25"
                  value={formCode}
                  onChange={e => setFormCode(e.target.value.toUpperCase())}
                  className="w-full bg-zinc-900 border border-white/10 rounded-lg px-3 py-2 text-sm text-white font-mono uppercase focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">Campaign Headline</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. New Year Strength Kickoff"
                  value={formTitle}
                  onChange={e => setFormTitle(e.target.value)}
                  className="w-full bg-zinc-900 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Applies 25% discount to first 3 months of Unlimited Gold..."
                  value={formDesc}
                  onChange={e => setFormDesc(e.target.value)}
                  className="w-full bg-zinc-900 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">Discount Type</label>
                  <select
                    value={formType}
                    onChange={e => setFormType(e.target.value as DiscountType)}
                    className="w-full bg-zinc-900 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-orange-500"
                  >
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FIXED_AMOUNT">Fixed Dollar ($)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">
                    {formType === 'PERCENTAGE' ? 'Discount %' : 'Amount ($)'}
                  </label>
                  <input
                    type="number"
                    value={formValue}
                    onChange={e => setFormValue(e.target.value)}
                    className="w-full bg-zinc-900 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-orange-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">Max Redemptions</label>
                  <input
                    type="number"
                    value={formMax}
                    onChange={e => setFormMax(e.target.value)}
                    className="w-full bg-zinc-900 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-orange-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">Expiration Date</label>
                  <input
                    type="date"
                    value={formValidUntil}
                    onChange={e => setFormValidUntil(e.target.value)}
                    className="w-full bg-zinc-900 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-orange-500 font-mono"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-white/[0.06]">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-2 rounded-lg text-xs font-medium text-zinc-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg text-xs font-medium bg-white hover:bg-zinc-200 text-zinc-950 tactile-btn"
                >
                  Publish Code
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
