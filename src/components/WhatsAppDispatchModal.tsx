import React, { useState, useEffect } from 'react';
import { useTenant } from '../context/TenantContext';
import { MessageSquare, X, Send, Copy, Check, Sparkles, User, Phone } from 'lucide-react';

export const WhatsAppDispatchModal: React.FC = () => {
  const { whatsAppModal, closeWhatsAppModal, currentTenant } = useTenant();
  const [message, setMessage] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (whatsAppModal.initialMessage) {
      setMessage(whatsAppModal.initialMessage);
    } else if (whatsAppModal.memberName) {
      // Default renewal reminder template
      const bank = currentTenant.bankDetails || {
        bankName: 'Commercial Bank of Ceylon',
        accountName: 'IronPulse Fitness (Pvt) Ltd',
        accountNumber: '8491002341',
        branch: 'Cinnamon Gardens Branch'
      };
      const text = `Hi ${whatsAppModal.memberName}, your membership at ${currentTenant.name} is due for renewal.\n\n` +
        `Amount: LKR 7,500\n` +
        `Bank Details: ${bank.bankName}\n` +
        `A/C: ${bank.accountNumber} (${bank.branch})\n` +
        `A/C Name: ${bank.accountName}\n\n` +
        `You can also scan our LankaQR at the reception desk. Please send us your bank slip photo once transferred so we can activate your access card immediately. Thank you!`;
      setMessage(text);
    }
  }, [whatsAppModal, currentTenant]);

  if (!whatsAppModal.isOpen) return null;

  const cleanPhone = whatsAppModal.phone.replace(/[^0-9]/g, '');
  const internationalPhone = cleanPhone.startsWith('94')
    ? cleanPhone
    : cleanPhone.startsWith('0')
    ? '94' + cleanPhone.slice(1)
    : '94' + cleanPhone;

  const handleCopy = () => {
    navigator.clipboard.writeText(message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLaunchWhatsApp = () => {
    const url = `https://wa.me/${internationalPhone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
    closeWhatsAppModal();
  };

  const setTemplate = (type: 'RENEWAL' | 'SLIP_CONFIRM' | 'PT_LOW' | 'FREEZE' | 'COMEBACK') => {
    const bank = currentTenant.bankDetails || {
      bankName: 'Commercial Bank',
      accountNumber: '8491002341',
      branch: 'Cinnamon Gardens'
    };

    switch (type) {
      case 'RENEWAL':
        setMessage(
          `Hi ${whatsAppModal.memberName}, your membership renewal at ${currentTenant.name} is ready.\n\n` +
          `• Renewal Fee: LKR 7,500\n` +
          `• Direct Deposit: ${bank.bankName} A/C ${bank.accountNumber} (${bank.branch})\n` +
          `• LankaQR: Scan & pay via FriMi, Genie, Flash or ComBank Q+\n\n` +
          `Please reply with your transfer slip so our desk can extend your digital key instantly! 💪`
        );
        break;
      case 'SLIP_CONFIRM':
        setMessage(
          `Hi ${whatsAppModal.memberName}, we have verified and approved your bank transfer slip!\n\n` +
          `Your membership access at ${currentTenant.name} is now ACTIVE. We look forward to seeing you at your next training session! 🏋️`
        );
        break;
      case 'PT_LOW':
        setMessage(
          `Hi ${whatsAppModal.memberName}, you have only 1-2 personal training sessions remaining in your current coaching package at ${currentTenant.name}.\n\n` +
          `To lock in your preferred trainer time slots for next month, reply here to top up your 10 or 12-session block! 🥊`
        );
        break;
      case 'FREEZE':
        setMessage(
          `Hi ${whatsAppModal.memberName}, your membership freeze hold has been applied successfully at ${currentTenant.name}.\n\n` +
          `Your remaining days have been pushed forward on your account. Best of luck and see you once your hold concludes! ❄️`
        );
        break;
      case 'COMEBACK':
        setMessage(
          `Aayubowan ${whatsAppModal.memberName}! We noticed you haven’t checked in at ${currentTenant.name} in a little while.\n\n` +
          `Our coaches are on the floor today. Drop by this week for a free program tune-up or recovery session. Let us know if you need anything!`
        );
        break;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="w-full max-w-lg bg-[#0e1014] border border-white/[0.08] rounded-xl shadow-2xl overflow-hidden flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-white/[0.06] flex items-center justify-between bg-[#111317]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-white">WhatsApp Direct Dispatcher</h3>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Sri Lanka 94+
                </span>
              </div>
              <p className="text-[11px] text-zinc-400">Direct message trigger without saving contact</p>
            </div>
          </div>
          <button
            onClick={closeWhatsAppModal}
            className="p-1 rounded-md text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Recipient Details Pill */}
        <div className="px-5 py-3 bg-[#16181d] border-b border-white/[0.06] flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-zinc-300">
            <User className="w-3.5 h-3.5 text-zinc-500" />
            <span className="font-medium text-white">{whatsAppModal.memberName}</span>
          </div>
          <div className="flex items-center gap-2 font-mono text-zinc-400">
            <Phone className="w-3.5 h-3.5 text-zinc-500" />
            <span className="text-emerald-400 font-semibold">+{internationalPhone}</span>
          </div>
        </div>

        {/* Template Selector */}
        <div className="p-5 space-y-4">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>Pre-Engineered Sri Lankan Templates</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
              <button
                type="button"
                onClick={() => setTemplate('RENEWAL')}
                className="px-2.5 py-1.5 rounded-md bg-[#16181d] hover:bg-white/[0.06] border border-white/[0.06] text-[11px] font-medium text-zinc-300 text-left transition-colors"
              >
                🔄 Renewal Dues
              </button>
              <button
                type="button"
                onClick={() => setTemplate('SLIP_CONFIRM')}
                className="px-2.5 py-1.5 rounded-md bg-[#16181d] hover:bg-white/[0.06] border border-white/[0.06] text-[11px] font-medium text-zinc-300 text-left transition-colors"
              >
                🧾 Slip Approved
              </button>
              <button
                type="button"
                onClick={() => setTemplate('PT_LOW')}
                className="px-2.5 py-1.5 rounded-md bg-[#16181d] hover:bg-white/[0.06] border border-white/[0.06] text-[11px] font-medium text-zinc-300 text-left transition-colors"
              >
                🥊 PT Low Balance
              </button>
              <button
                type="button"
                onClick={() => setTemplate('FREEZE')}
                className="px-2.5 py-1.5 rounded-md bg-[#16181d] hover:bg-white/[0.06] border border-white/[0.06] text-[11px] font-medium text-zinc-300 text-left transition-colors"
              >
                ❄️ Hold Applied
              </button>
              <button
                type="button"
                onClick={() => setTemplate('COMEBACK')}
                className="px-2.5 py-1.5 rounded-md bg-[#16181d] hover:bg-white/[0.06] border border-white/[0.06] text-[11px] font-medium text-zinc-300 text-left transition-colors"
              >
                👋 Inactive Check
              </button>
            </div>
          </div>

          {/* Message Textarea */}
          <div>
            <div className="flex items-center justify-between text-[11px] text-zinc-400 mb-1.5">
              <span>Message Payload</span>
              <span className="font-mono text-[10px] text-zinc-500">{message.length} chars</span>
            </div>
            <textarea
              rows={6}
              value={message}
              onChange={e => setMessage(e.target.value)}
              className="w-full bg-[#111317] border border-white/[0.08] rounded-lg p-3 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-emerald-500/60 leading-relaxed font-sans"
              placeholder="Type your WhatsApp message..."
            />
          </div>
        </div>

        {/* Modal Actions */}
        <div className="px-5 py-3.5 bg-[#111317] border-t border-white/[0.06] flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#16181d] hover:bg-white/[0.08] text-zinc-300 text-xs font-medium border border-white/[0.06] transition-all"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-zinc-400" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={closeWhatsAppModal}
              className="px-3 py-1.5 rounded-md text-zinc-400 hover:text-white text-xs font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleLaunchWhatsApp}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-md bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold text-xs transition-all shadow-sm active:scale-97"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Launch WhatsApp</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
