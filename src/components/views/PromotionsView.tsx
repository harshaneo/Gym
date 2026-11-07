import React, { useState } from 'react';
import { useTenant } from '../../context/TenantContext';
import { DiscountType, MembershipTier } from '../../types';
import { 
  Plus, 
  Copy, 
  Check, 
  X
} from 'lucide-react';

export const PromotionsView: React.FC = () => {
  const { currentTenant, promotions, addPromotion, togglePromotionActive } = useTenant();

  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

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
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-white/[0.06]">
        <div>
          <h1 className="text-lg font-semibold text-white tracking-tight">Promotions & Vouchers</h1>
          <p className="text-[13px] text-zinc-400 mt-0.5">
            Configure discount codes, referral passes, and member acquisition vouchers.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="btn-primary px-3.5 py-2 rounded-lg text-xs flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Promo Code</span>
        </button>
      </div>

      {/* KPI Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="card p-4">
          <span className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider">Active Campaigns</span>
          <div className="text-xl font-semibold text-white font-mono tabular-nums mt-1.5">
            {promotions.filter(p => p.isActive).length} <span className="text-zinc-600 text-xs font-normal">/ {promotions.length}</span>
          </div>
          <span className="text-[11px] text-zinc-500 font-mono mt-0.5 block">Live on public subdomain</span>
        </div>

        <div className="card p-4">
          <span className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider">Redemptions</span>
          <div className="text-xl font-semibold text-zinc-200 font-mono tabular-nums mt-1.5">
            {totalRedemptions}
          </div>
          <span className="text-[11px] text-zinc-500 font-mono mt-0.5 block">Verified member signups</span>
        </div>

        <div className="card p-4">
          <span className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider">Referral Conversion</span>
          <div className="text-xl font-semibold text-white font-mono tabular-nums mt-1.5">
            78.4%
          </div>
          <span className="text-[11px] text-zinc-500 font-mono mt-0.5 block">Converted to annual contracts</span>
        </div>
      </div>

      {/* Promotions Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {promotions.map(promo => {
          const isFull = promo.currentRedemptions >= promo.maxRedemptions;
          const pct = Math.round((promo.currentRedemptions / promo.maxRedemptions) * 100);

          return (
            <div 
              key={promo.id} 
              className={`card p-4 flex flex-col justify-between transition-colors ${
                !promo.isActive ? 'opacity-50' : ''
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <span className="badge-neutral px-2 py-0.5 rounded text-[10px] font-mono font-medium">
                    {promo.discountType === 'PERCENTAGE' ? `${promo.value}% OFF` : `$${(promo.value / 100).toFixed(0)} VOUCHER`}
                  </span>

                  <button
                    onClick={() => togglePromotionActive(promo.id)}
                    className="text-zinc-500 hover:text-white transition-colors"
                  >
                    {promo.isActive ? (
                      <span className="flex items-center gap-1.5 text-[11px] text-zinc-300 font-medium">
                        <span className="w-1.5 h-1.5 rounded-full dot-live" />
                        <span>Active</span>
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-[11px] text-zinc-500 font-medium">
                        <span className="w-1.5 h-1.5 rounded-full dot-neutral" />
                        <span>Paused</span>
                      </span>
                    )}
                  </button>
                </div>

                <div className="flex items-center justify-between bg-[#0e1014] border border-white/[0.04] rounded-lg p-2.5 mb-2.5">
                  <div className="font-mono text-xs font-semibold text-white tracking-wider">
                    {promo.code}
                  </div>
                  <button
                    onClick={() => handleCopy(promo.code)}
                    className="p-1 rounded text-zinc-500 hover:text-white transition-colors"
                  >
                    {copiedCode === promo.code ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>

                <h3 className="font-medium text-xs text-white mb-1">{promo.title}</h3>
                <p className="text-[11px] text-zinc-500 leading-relaxed mb-3">{promo.description}</p>
              </div>

              {/* Progress */}
              <div className="pt-2.5 border-t border-white/[0.04] space-y-1.5">
                <div className="flex items-center justify-between text-[11px] text-zinc-500 font-mono">
                  <span>Redeemed</span>
                  <span className="text-zinc-300 tabular-nums">
                    {promo.currentRedemptions} <span className="text-zinc-600">/ {promo.maxRedemptions}</span>
                  </span>
                </div>
                <div className="progress-track">
                  <div 
                    className={`progress-fill ${isFull ? 'progress-fill-warn' : ''}`}
                    style={{ width: `${Math.min(pct, 100)}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[10px] text-zinc-500 pt-0.5 font-mono">
                  <span>Valid to {promo.validUntil}</span>
                  <span>{pct}%</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Promotion Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-overlay">
          <div className="modal-panel w-full max-w-md rounded-xl p-6 relative space-y-4">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 text-zinc-500 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            <div>
              <h3 className="font-semibold text-white text-sm">New Promotion Campaign</h3>
              <p className="text-xs text-zinc-500 mt-0.5">Publish coupon voucher to {currentTenant.name} public portal.</p>
            </div>

            <form onSubmit={handleCreatePromo} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-medium text-zinc-400 mb-1">Coupon Code (Uppercase)</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. TITAN25"
                  value={formCode}
                  onChange={e => setFormCode(e.target.value.toUpperCase())}
                  className="w-full input px-3 py-2 text-xs font-mono uppercase"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-zinc-400 mb-1">Headline</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. New Year Strength Kickoff"
                  value={formTitle}
                  onChange={e => setFormTitle(e.target.value)}
                  className="w-full input px-3 py-2 text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-zinc-400 mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Applies 25% discount to first 3 months of Unlimited Gold..."
                  value={formDesc}
                  onChange={e => setFormDesc(e.target.value)}
                  className="w-full input px-3 py-2 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-zinc-400 mb-1">Type</label>
                  <select
                    value={formType}
                    onChange={e => setFormType(e.target.value as DiscountType)}
                    className="w-full input px-3 py-2 text-xs"
                  >
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FIXED_AMOUNT">Fixed Dollar ($)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                    {formType === 'PERCENTAGE' ? 'Discount %' : 'Amount ($)'}
                  </label>
                  <input
                    type="number"
                    value={formValue}
                    onChange={e => setFormValue(e.target.value)}
                    className="w-full input px-3 py-2 text-xs font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-zinc-400 mb-1">Max Redemptions</label>
                  <input
                    type="number"
                    value={formMax}
                    onChange={e => setFormMax(e.target.value)}
                    className="w-full input px-3 py-2 text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-zinc-400 mb-1">Expiration Date</label>
                  <input
                    type="date"
                    value={formValidUntil}
                    onChange={e => setFormValidUntil(e.target.value)}
                    className="w-full input px-3 py-2 text-xs font-mono"
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
                  className="btn-primary px-4 py-2 rounded-lg text-xs"
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
