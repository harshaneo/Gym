import React, { useState } from 'react';
import { useTenant } from '../../context/TenantContext';
import { RetailProduct } from '../../types';
import { 
  ShoppingBag, 
  Plus, 
  Minus, 
  Trash2, 
  CreditCard, 
  Banknote, 
  UserCheck, 
  Check, 
  Search
} from 'lucide-react';

export const RetailPOSView: React.FC = () => {
  const { products, transactions, sellRetailCart, members } = useTenant();

  const [cart, setCart] = useState<{ product: RetailProduct; quantity: number }[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMemberId, setSelectedMemberId] = useState<string>('');
  const [checkoutSuccess, setCheckoutSuccess] = useState<string | null>(null);

  const categories = ['ALL', 'SUPPLEMENTS', 'BEVERAGES', 'GEAR', 'APPAREL', 'PASSES'];

  const filteredProducts = products.filter(p => {
    const matchCat = selectedCategory === 'ALL' || p.category === selectedCategory;
    const matchQuery = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.sku.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchQuery;
  });

  const addToCart = (product: RetailProduct) => {
    if (product.stockCount <= 0) return;
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stockCount) return prev;
        return prev.map(item => item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.product.id === productId) {
        const nextQty = item.quantity + delta;
        if (nextQty <= 0) return null;
        if (nextQty > item.product.stockCount) return item;
        return { ...item, quantity: nextQty };
      }
      return item;
    }).filter(Boolean) as { product: RetailProduct; quantity: number }[]);
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  const subtotalCents = cart.reduce((sum, item) => sum + item.product.priceCents * item.quantity, 0);
  const taxCents = Math.round(subtotalCents * 0.0825); // 8.25% sales tax
  const totalCents = subtotalCents + taxCents;

  const handleCheckout = (method: 'CARD' | 'CASH' | 'ACCOUNT_ON_FILE') => {
    if (cart.length === 0) return;
    const member = members.find(m => m.id === selectedMemberId);
    sellRetailCart(cart, method, member?.fullName);
    setCheckoutSuccess(`Sale completed! Total: $${(totalCents / 100).toFixed(2)} via ${method.replace(/_/g, ' ')}`);
    setCart([]);
    setSelectedMemberId('');
    setTimeout(() => setCheckoutSuccess(null), 3000);
  };

  const todayGross = transactions.reduce((sum, t) => sum + t.totalCents, 0) / 100;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-white/[0.06]">
        <div>
          <h1 className="text-lg font-semibold text-white tracking-tight">Front-Desk Retail & POS</h1>
          <p className="text-[13px] text-zinc-400 mt-0.5">
            Process supplement sales, recovery drinks, lifting gear, and guest passes with 1-tap checkout.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="card px-3 py-1.5 text-xs flex items-center gap-2">
            <span className="text-zinc-500 font-mono text-[11px]">Today's POS Sales:</span>
            <span className="font-mono font-medium text-white tabular-nums">${todayGross.toFixed(2)}</span>
            <span className="text-zinc-600">·</span>
            <span className="text-zinc-400 font-mono text-[11px]">{transactions.length} sales</span>
          </div>
        </div>
      </div>

      {checkoutSuccess && (
        <div className="region-success rounded-lg p-3.5 flex items-center justify-between text-xs text-zinc-200 animate-in fade-in">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{checkoutSuccess}</span>
          </div>
          <button onClick={() => setCheckoutSuccess(null)} className="text-zinc-500 hover:text-white">✕</button>
        </div>
      )}

      {/* POS Screen Layout: Catalog (Left 3 cols) vs Register Cart (Right 2 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* Catalog Section */}
        <div className="lg:col-span-3 space-y-4">
          {/* Search & Category Filter */}
          <div className="card p-3 flex flex-wrap items-center justify-between gap-2.5">
            <div className="relative flex-1 min-w-[180px]">
              <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search products or SKU..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full input pl-9 pr-3 py-1.5 text-xs"
              />
            </div>

            <div className="flex flex-wrap gap-1">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-mono transition-colors ${
                    selectedCategory === cat 
                      ? 'bg-white text-zinc-950 font-semibold' 
                      : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Product Items Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {filteredProducts.map(p => {
              const inStock = p.stockCount > 0;
              const cartItem = cart.find(i => i.product.id === p.id);
              return (
                <div
                  key={p.id}
                  onClick={() => addToCart(p)}
                  className={`card p-3.5 flex flex-col justify-between cursor-pointer transition-all relative ${
                    inStock ? 'hover:border-white/[0.18] hover:bg-white/[0.02]' : 'opacity-40 cursor-not-allowed'
                  }`}
                >
                  {cartItem && (
                    <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-white text-zinc-950 text-[10px] font-bold flex items-center justify-center font-mono">
                      {cartItem.quantity}
                    </div>
                  )}

                  <div>
                    <span className="text-[9px] font-mono text-zinc-500 uppercase">{p.category}</span>
                    <h4 className="font-medium text-xs text-white line-clamp-2 mt-0.5 leading-snug">{p.name}</h4>
                    <span className="text-[10px] font-mono text-zinc-500 mt-0.5 block">{p.sku}</span>
                  </div>

                  <div className="flex items-center justify-between mt-3 pt-2 border-t border-white/[0.04]">
                    <span className="font-mono text-xs font-semibold text-white tabular-nums">
                      ${(p.priceCents / 100).toFixed(2)}
                    </span>
                    <span className={`text-[10px] font-mono ${inStock ? 'text-zinc-500' : 'text-red-400'}`}>
                      {inStock ? `${p.stockCount} in stock` : 'Out of stock'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Register Cart & Cashier Settlement */}
        <div className="lg:col-span-2 card p-5 flex flex-col justify-between h-fit sticky top-16">
          <div>
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/[0.06]">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-zinc-400" />
                <h3 className="font-semibold text-xs text-white uppercase tracking-wider font-mono">Register Cart</h3>
              </div>
              <span className="text-xs font-mono text-zinc-500 tabular-nums">{cart.length} items</span>
            </div>

            {/* Optional Member Charge Selector */}
            <div className="mb-3">
              <label className="block text-[10px] font-mono uppercase text-zinc-500 mb-1">Charge to Member Account (Optional)</label>
              <select
                value={selectedMemberId}
                onChange={e => setSelectedMemberId(e.target.value)}
                className="w-full input px-2.5 py-1.5 text-xs"
              >
                <option value="">Walk-In Guest (No Account)</option>
                {members.map(m => (
                  <option key={m.id} value={m.id}>{m.fullName} ({m.membershipTier.replace(/_/g, ' ')})</option>
                ))}
              </select>
            </div>

            {/* Cart Items List */}
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {cart.map(item => (
                <div key={item.product.id} className="bg-[#0e1014] rounded-lg p-2.5 flex items-center justify-between gap-2 border border-white/[0.04]">
                  <div className="min-w-0 flex-1">
                    <h5 className="font-medium text-xs text-white truncate">{item.product.name}</h5>
                    <span className="font-mono text-[10px] text-zinc-500">
                      ${(item.product.priceCents / 100).toFixed(2)} each
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.product.id, -1)}
                      className="p-1 rounded bg-[#16181d] text-zinc-400 hover:text-white"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="font-mono text-xs text-white font-medium w-4 text-center tabular-nums">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.product.id, 1)}
                      className="p-1 rounded bg-[#16181d] text-zinc-400 hover:text-white"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeFromCart(item.product.id)}
                      className="p-1 text-zinc-600 hover:text-red-400 ml-1"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}

              {cart.length === 0 && (
                <div className="py-12 text-center text-xs text-zinc-600 border border-dashed border-white/[0.04] rounded-lg">
                  Click items on left to add to cart
                </div>
              )}
            </div>
          </div>

          {/* Pricing Totals & Settlement Buttons */}
          <div className="pt-4 mt-4 border-t border-white/[0.06] space-y-3">
            <div className="space-y-1 text-xs font-mono">
              <div className="flex items-center justify-between text-zinc-500">
                <span>Subtotal:</span>
                <span className="text-zinc-300 tabular-nums">${(subtotalCents / 100).toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between text-zinc-500">
                <span>Sales Tax (8.25%):</span>
                <span className="text-zinc-300 tabular-nums">${(taxCents / 100).toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between text-white font-semibold pt-1 border-t border-white/[0.04]">
                <span>Total Due:</span>
                <span className="text-base font-mono tabular-nums">${(totalCents / 100).toFixed(2)}</span>
              </div>
            </div>

            {/* 1-Tap Payment Buttons */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                disabled={cart.length === 0}
                onClick={() => handleCheckout('CARD')}
                className="btn-primary py-2 rounded-lg text-xs flex items-center justify-center gap-1.5 disabled:opacity-40"
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>Card Tap / Swipe</span>
              </button>

              <button
                type="button"
                disabled={cart.length === 0}
                onClick={() => handleCheckout('CASH')}
                className="btn-secondary py-2 rounded-lg text-xs flex items-center justify-center gap-1.5 disabled:opacity-40"
              >
                <Banknote className="w-3.5 h-3.5" />
                <span>Cash Drawer</span>
              </button>
            </div>

            {selectedMemberId && (
              <button
                type="button"
                disabled={cart.length === 0}
                onClick={() => handleCheckout('ACCOUNT_ON_FILE')}
                className="w-full btn-secondary py-2 rounded-lg text-xs flex items-center justify-center gap-1.5 text-zinc-200"
              >
                <UserCheck className="w-3.5 h-3.5 text-zinc-400" />
                <span>Charge to Card on File (Next Billing Cycle)</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
