import React, { useState } from 'react';
import { useTenant } from '../../context/TenantContext';
import { 
  QrCode, 
  FileCheck, 
  Clock, 
  CheckCircle2, 
  Eye, 
  Check, 
  X, 
  MessageSquare, 
  Landmark, 
  AlertTriangle
} from 'lucide-react';
import { BankTransferSlip } from '../../types';

export const BankSlipPaymentsView: React.FC = () => {
  const { 
    bankSlips, 
    approveBankSlip, 
    rejectBankSlip, 
    currentTenant, 
    openWhatsAppModal 
  } = useTenant();

  const [activeTab, setActiveTab] = useState<'SLIPS_INBOX' | 'LANKA_QR_DESK'>('SLIPS_INBOX');
  const [selectedSlip, setSelectedSlip] = useState<BankTransferSlip | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState<BankTransferSlip | null>(null);

  // LankaQR State
  const [qrAmountLKR, setQrAmountLKR] = useState<number>(7500);
  const [qrNote, setQrNote] = useState<string>('Monthly Gold Membership');
  const [qrPaidSuccess, setQrPaidSuccess] = useState<boolean>(false);

  const pendingSlips = bankSlips.filter(s => s.status === 'PENDING_VERIFICATION');
  const approvedSlips = bankSlips.filter(s => s.status === 'APPROVED');
  const totalVerifiedLKR = approvedSlips.reduce((sum, s) => sum + s.amountLKR, 0);

  const handleApprove = (slip: BankTransferSlip) => {
    approveBankSlip(slip.id);
    setSelectedSlip(null);
    // Trigger WhatsApp Confirmation
    openWhatsAppModal(
      slip.memberPhone,
      slip.memberName,
      `Hi ${slip.memberName}, we have verified your bank transfer slip (${slip.referenceNumber}) of LKR ${slip.amountLKR.toLocaleString()}!\n\n` +
      `Your ${slip.membershipTierToActivate.replace(/_/g, ' ')} membership at ${currentTenant.name} is now ACTIVE. Access card has been enabled. See you at your next workout! 💪`
    );
  };

  const handleRejectConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!showRejectModal) return;
    rejectBankSlip(showRejectModal.id, rejectionReason || 'Deposit slip unreadable or amount mismatch');
    
    // Trigger WhatsApp Notice
    openWhatsAppModal(
      showRejectModal.memberPhone,
      showRejectModal.memberName,
      `Hi ${showRejectModal.memberName}, we reviewed your bank transfer slip (${showRejectModal.referenceNumber}) for ${currentTenant.name}.\n\n` +
      `⚠️ Status: Incomplete / Rejected\n` +
      `Reason: ${rejectionReason || 'Deposit slip unreadable or amount mismatch'}\n\n` +
      `Kindly reply with a clearer photo of your transfer receipt or bank transaction ID so we can verify and activate your membership promptly.`
    );

    setShowRejectModal(null);
    setRejectionReason('');
  };

  const bankDetails = currentTenant.bankDetails || {
    bankName: 'Commercial Bank of Ceylon',
    accountName: 'IronPulse Fitness (Pvt) Ltd',
    accountNumber: '8491002341',
    branch: 'Cinnamon Gardens (Branch 042)'
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.06]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl font-bold tracking-tight text-white">Bank Slips & LankaQR Desk</h1>
            <span className="badge-primary px-2 py-0.5 rounded text-[10px] font-mono">
              Sri Lanka Payment Rails
            </span>
          </div>
          <p className="text-xs text-zinc-400">
            Reconcile direct Commercial Bank / Sampath transfer slips, approve memberships, and generate dynamic LankaQR codes.
          </p>
        </div>

        {/* Segmented Mode Switcher */}
        <div className="segmented-control flex items-center p-0.5">
          <button
            onClick={() => setActiveTab('SLIPS_INBOX')}
            className={`segmented-tab flex items-center gap-1.5 text-xs px-3 py-1.5 ${
              activeTab === 'SLIPS_INBOX' ? 'segmented-tab-active' : ''
            }`}
          >
            <FileCheck className="w-3.5 h-3.5" />
            <span>Transfer Slips Inbox</span>
            {pendingSlips.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-amber-500/20 text-amber-300 font-bold">
                {pendingSlips.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('LANKA_QR_DESK')}
            className={`segmented-tab flex items-center gap-1.5 text-xs px-3 py-1.5 ${
              activeTab === 'LANKA_QR_DESK' ? 'segmented-tab-active' : ''
            }`}
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>LankaQR Counter</span>
          </button>
        </div>
      </div>

      {activeTab === 'SLIPS_INBOX' ? (
        <div className="space-y-4">
          {/* Summary Metric Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="card-ambient p-4 rounded-xl border border-amber-500/20 bg-amber-950/10 flex items-center justify-between">
              <div>
                <div className="text-[11px] font-mono uppercase text-amber-400">Pending Verification</div>
                <div className="text-2xl font-bold font-mono text-white mt-0.5">{pendingSlips.length} Slips</div>
                <div className="text-[10px] text-zinc-400 mt-1">Awaiting front-desk sign-off</div>
              </div>
              <Clock className="w-8 h-8 text-amber-400/40" />
            </div>

            <div className="card-ambient p-4 rounded-xl border border-emerald-500/20 bg-emerald-950/10 flex items-center justify-between">
              <div>
                <div className="text-[11px] font-mono uppercase text-emerald-400">Total Approved Direct Transfers</div>
                <div className="text-2xl font-bold font-mono text-white mt-0.5">LKR {totalVerifiedLKR.toLocaleString()}</div>
                <div className="text-[10px] text-zinc-400 mt-1">{approvedSlips.length} verified subscriptions</div>
              </div>
              <CheckCircle2 className="w-8 h-8 text-emerald-400/40" />
            </div>

            <div className="card-ambient p-4 rounded-xl border border-white/[0.06] flex items-center justify-between">
              <div>
                <div className="text-[11px] font-mono uppercase text-zinc-400">Active Gym Bank Account</div>
                <div className="text-sm font-semibold text-white mt-0.5">{bankDetails.bankName}</div>
                <div className="text-[11px] font-mono text-zinc-400 mt-0.5">A/C: {bankDetails.accountNumber}</div>
              </div>
              <Landmark className="w-8 h-8 text-zinc-600" />
            </div>
          </div>

          {/* Slips List Table */}
          <div className="card-ambient rounded-xl border border-white/[0.06] overflow-hidden">
            <div className="p-4 border-b border-white/[0.06] flex items-center justify-between bg-[#111317]">
              <div className="flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-zinc-400" />
                <h2 className="text-sm font-semibold text-white">Submitted Payment Slips Queue</h2>
              </div>
              <span className="text-[11px] font-mono text-zinc-500">Live WhatsApp & Counter Uploads</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-white/[0.06] bg-[#0e1014] text-[11px] font-mono text-zinc-400 uppercase tracking-wider">
                    <th className="py-3 px-4">Member Name & Contact</th>
                    <th className="py-3 px-3">Bank & Ref ID</th>
                    <th className="py-3 px-3">Deposited Amount</th>
                    <th className="py-3 px-3">Target Tier</th>
                    <th className="py-3 px-3">Submitted</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {bankSlips.map(slip => (
                    <tr key={slip.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-semibold text-white text-xs">{slip.memberName}</div>
                        <div className="text-[11px] font-mono text-zinc-400">{slip.memberPhone}</div>
                      </td>

                      <td className="py-3 px-3 font-mono">
                        <span className="inline-block px-1.5 py-0.5 rounded text-[10px] bg-white/[0.06] text-zinc-300">
                          {slip.bankName.replace(/_/g, ' ')}
                        </span>
                        <div className="text-[11px] text-zinc-400 mt-0.5">{slip.referenceNumber}</div>
                      </td>

                      <td className="py-3 px-3 font-mono font-bold text-white text-xs">
                        LKR {slip.amountLKR.toLocaleString()}
                      </td>

                      <td className="py-3 px-3">
                        <div className="text-zinc-300 font-medium text-[11px]">
                          {slip.membershipTierToActivate.replace(/_/g, ' ')}
                        </div>
                        <div className="text-[10px] text-zinc-500">{slip.durationMonths} Month(s)</div>
                      </td>

                      <td className="py-3 px-3 text-zinc-400 font-mono text-[11px]">
                        {slip.submittedAt}
                      </td>

                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-medium ${
                          slip.status === 'APPROVED' ? 'badge-success' :
                          slip.status === 'REJECTED' ? 'badge-danger' :
                          'badge-warning'
                        }`}>
                          {slip.status.replace(/_/g, ' ')}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedSlip(slip)}
                            className="px-2.5 py-1 rounded bg-white/[0.06] hover:bg-white/[0.12] text-zinc-300 text-[11px] font-medium flex items-center gap-1 transition-colors"
                          >
                            <Eye className="w-3 h-3" />
                            <span>Inspect</span>
                          </button>

                          {slip.status === 'PENDING_VERIFICATION' && (
                            <>
                              <button
                                onClick={() => handleApprove(slip)}
                                className="px-2.5 py-1 rounded bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-[11px] font-semibold transition-colors shadow-sm"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => setShowRejectModal(slip)}
                                className="px-2 py-1 rounded bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-[11px] transition-colors"
                              >
                                Reject
                              </button>
                            </>
                          )}

                          <button
                            onClick={() => openWhatsAppModal(
                              slip.memberPhone,
                              slip.memberName,
                              `Hi ${slip.memberName}, this is regarding your bank transfer slip (${slip.referenceNumber}) for ${currentTenant.name}.`
                            )}
                            className="p-1 rounded text-zinc-400 hover:text-emerald-400 transition-colors"
                            title="Chat on WhatsApp"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        /* LankaQR Front Desk Counter */
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-5 space-y-4">
            <div className="card-ambient p-5 rounded-xl border border-white/[0.06] space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-white/[0.06]">
                <QrCode className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-semibold text-white">Instant LankaQR Generator</h3>
              </div>

              <div>
                <label className="block text-zinc-400 text-xs mb-1.5">Payment Note / Package Description</label>
                <input
                  type="text"
                  value={qrNote}
                  onChange={e => setQrNote(e.target.value)}
                  className="w-full bg-[#16181d] border border-white/[0.08] rounded-md px-3 py-2 text-white text-xs"
                />
              </div>

              <div>
                <label className="block text-zinc-400 text-xs mb-1.5">Charge Amount (LKR)</label>
                <input
                  type="number"
                  value={qrAmountLKR}
                  onChange={e => setQrAmountLKR(parseInt(e.target.value, 10) || 0)}
                  className="w-full bg-[#16181d] border border-white/[0.08] rounded-md px-3 py-2 text-white font-mono text-base font-bold text-emerald-400"
                />
              </div>

              <div>
                <div className="text-[10px] font-mono uppercase text-zinc-500 mb-1.5">Quick Presets</div>
                <div className="grid grid-cols-2 gap-1.5 text-xs">
                  <button
                    type="button"
                    onClick={() => { setQrAmountLKR(7500); setQrNote('1 Month Gold Membership'); }}
                    className="p-2 rounded bg-[#111317] hover:bg-white/[0.06] border border-white/[0.06] text-left text-zinc-300 font-mono"
                  >
                    LKR 7,500 <span className="text-[10px] text-zinc-500 block">1 Mo Gold</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => { setQrAmountLKR(20000); setQrNote('3 Months Gold Membership'); }}
                    className="p-2 rounded bg-[#111317] hover:bg-white/[0.06] border border-white/[0.06] text-left text-zinc-300 font-mono"
                  >
                    LKR 20,000 <span className="text-[10px] text-zinc-500 block">3 Mo Gold</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => { setQrAmountLKR(36000); setQrNote('12-Session PT Coaching Pack'); }}
                    className="p-2 rounded bg-[#111317] hover:bg-white/[0.06] border border-white/[0.06] text-left text-zinc-300 font-mono"
                  >
                    LKR 36,000 <span className="text-[10px] text-zinc-500 block">12 PT Sessions</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => { setQrAmountLKR(1200); setQrNote('Shake Bar: Whey + Pre-workout'); }}
                    className="p-2 rounded bg-[#111317] hover:bg-white/[0.06] border border-white/[0.06] text-left text-zinc-300 font-mono"
                  >
                    LKR 1,200 <span className="text-[10px] text-zinc-500 block">Shake Bar</span>
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setQrPaidSuccess(true);
                    setTimeout(() => setQrPaidSuccess(false), 3000);
                  }}
                  className="w-full py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all active:scale-97"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Customer Scanned & Paid</span>
                </button>
                {qrPaidSuccess && (
                  <div className="mt-2 text-center text-xs text-emerald-400 font-semibold flex items-center justify-center gap-1">
                    <Check className="w-3.5 h-3.5" />
                    Payment verified & membership access granted!
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Official LankaQR Terminal Display Card */}
          <div className="md:col-span-7 flex flex-col items-center justify-center">
            <div className="w-full max-w-sm bg-white text-zinc-950 rounded-2xl p-6 shadow-2xl border-4 border-amber-400/80 flex flex-col items-center text-center">
              {/* Top LankaQR Branding */}
              <div className="w-full flex items-center justify-between pb-3 border-b-2 border-zinc-200">
                <div className="flex items-center gap-1.5">
                  <div className="bg-amber-400 text-zinc-950 font-black text-xs px-1.5 py-0.5 rounded tracking-tighter">
                    LANKA
                  </div>
                  <div className="bg-zinc-950 text-white font-black text-xs px-1.5 py-0.5 rounded tracking-tighter">
                    QR
                  </div>
                </div>
                <span className="text-[10px] font-mono text-zinc-500 font-semibold">EMVCo Compliant</span>
              </div>

              <div className="my-4">
                <h4 className="font-extrabold text-sm text-zinc-900 tracking-tight">{currentTenant.name}</h4>
                <div className="text-[11px] text-zinc-500 font-mono mt-0.5">MID: {currentTenant.lankaQrMerchantId || 'LK-CB-994120'}</div>
              </div>

              {/* QR Code Container */}
              <div className="p-3 bg-white border-2 border-zinc-900 rounded-xl shadow-inner mb-4">
                <svg className="w-48 h-48" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {/* Corner Target 1 */}
                  <rect x="5" y="5" width="26" height="26" fill="black" rx="4" />
                  <rect x="9" y="9" width="18" height="18" fill="white" rx="2" />
                  <rect x="13" y="13" width="10" height="10" fill="black" rx="1" />

                  {/* Corner Target 2 */}
                  <rect x="69" y="5" width="26" height="26" fill="black" rx="4" />
                  <rect x="73" y="9" width="18" height="18" fill="white" rx="2" />
                  <rect x="77" y="13" width="10" height="10" fill="black" rx="1" />

                  {/* Corner Target 3 */}
                  <rect x="5" y="69" width="26" height="26" fill="black" rx="4" />
                  <rect x="9" y="73" width="18" height="18" fill="white" rx="2" />
                  <rect x="13" y="77" width="10" height="10" fill="black" rx="1" />

                  {/* Simulated Data Matrix Grid */}
                  <rect x="36" y="8" width="6" height="6" fill="black" />
                  <rect x="46" y="8" width="6" height="6" fill="black" />
                  <rect x="56" y="8" width="6" height="6" fill="black" />
                  <rect x="36" y="18" width="6" height="6" fill="black" />
                  <rect x="50" y="18" width="6" height="6" fill="black" />

                  <rect x="8" y="36" width="6" height="6" fill="black" />
                  <rect x="18" y="36" width="6" height="6" fill="black" />
                  <rect x="28" y="36" width="6" height="6" fill="black" />
                  <rect x="8" y="46" width="6" height="6" fill="black" />
                  <rect x="22" y="46" width="6" height="6" fill="black" />
                  <rect x="8" y="56" width="6" height="6" fill="black" />

                  <rect x="40" y="36" width="20" height="20" fill="#f59e0b" rx="3" />
                  <circle cx="50" cy="46" r="5" fill="black" />

                  <rect x="68" y="36" width="6" height="6" fill="black" />
                  <rect x="80" y="36" width="6" height="6" fill="black" />
                  <rect x="72" y="46" width="6" height="6" fill="black" />
                  <rect x="86" y="46" width="6" height="6" fill="black" />
                  <rect x="68" y="56" width="6" height="6" fill="black" />

                  <rect x="36" y="68" width="6" height="6" fill="black" />
                  <rect x="48" y="68" width="6" height="6" fill="black" />
                  <rect x="60" y="68" width="6" height="6" fill="black" />
                  <rect x="40" y="80" width="6" height="6" fill="black" />
                  <rect x="54" y="80" width="6" height="6" fill="black" />
                  <rect x="68" y="80" width="6" height="6" fill="black" />
                  <rect x="82" y="80" width="6" height="6" fill="black" />
                  <rect x="82" y="68" width="6" height="6" fill="black" />
                </svg>
              </div>

              {/* Exact Amount Display */}
              <div className="w-full bg-zinc-100 rounded-xl p-3 mb-3 border border-zinc-200">
                <span className="text-[10px] font-mono text-zinc-500 uppercase">Payment Amount</span>
                <div className="text-2xl font-black font-mono text-zinc-950">
                  LKR {qrAmountLKR.toLocaleString()}
                </div>
                <div className="text-[11px] font-medium text-zinc-600 truncate mt-0.5">{qrNote}</div>
              </div>

              {/* Supported Sri Lanka Banking Apps */}
              <div className="w-full pt-2 border-t border-zinc-200">
                <div className="text-[9px] font-mono uppercase tracking-wider text-zinc-400 mb-1.5">
                  Scan with any Sri Lankan Banking App
                </div>
                <div className="flex items-center justify-center gap-2 text-[10px] font-bold text-zinc-600">
                  <span className="px-1.5 py-0.5 bg-zinc-100 rounded border border-zinc-200">FriMi</span>
                  <span className="px-1.5 py-0.5 bg-zinc-100 rounded border border-zinc-200">Genie</span>
                  <span className="px-1.5 py-0.5 bg-zinc-100 rounded border border-zinc-200">Flash</span>
                  <span className="px-1.5 py-0.5 bg-zinc-100 rounded border border-zinc-200">Q+ ComBank</span>
                  <span className="px-1.5 py-0.5 bg-zinc-100 rounded border border-zinc-200">iPay</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Inspect Bank Slip */}
      {selectedSlip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-[#0e1014] border border-white/[0.08] rounded-xl shadow-2xl overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="px-5 py-4 border-b border-white/[0.06] flex items-center justify-between bg-[#111317]">
              <div>
                <h3 className="text-sm font-semibold text-white">Bank Transfer Slip Inspector</h3>
                <span className="text-[11px] font-mono text-zinc-400">Ref: {selectedSlip.referenceNumber}</span>
              </div>
              <button onClick={() => setSelectedSlip(null)} className="text-zinc-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              {/* Slip Card Graphic */}
              <div className="p-4 rounded-xl bg-white text-zinc-900 border border-zinc-300 shadow-sm space-y-3 font-mono">
                <div className="flex items-center justify-between border-b border-zinc-200 pb-2">
                  <span className="font-bold text-xs uppercase text-zinc-800">{selectedSlip.bankName.replace(/_/g, ' ')}</span>
                  <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                    DIRECT DEPOSIT SLIP
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-zinc-500 block text-[9px]">DEPOSITED TO:</span>
                    <span className="font-semibold text-zinc-900">IronPulse Fitness</span>
                    <span className="text-[10px] text-zinc-600 block">A/C 8491002341</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block text-[9px]">DEPOSITOR:</span>
                    <span className="font-semibold text-zinc-900">{selectedSlip.memberName}</span>
                    <span className="text-[10px] text-zinc-600 block">{selectedSlip.memberPhone}</span>
                  </div>
                </div>

                <div className="p-2 bg-zinc-50 rounded border border-zinc-200 flex items-center justify-between">
                  <div>
                    <span className="text-[9px] text-zinc-500 block">AMOUNT TRANSFERRED</span>
                    <span className="text-base font-black text-zinc-950">LKR {selectedSlip.amountLKR.toLocaleString()}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] text-zinc-500 block">TIMESTAMP</span>
                    <span className="text-[11px] font-medium text-zinc-700">{selectedSlip.submittedAt}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-lg bg-[#16181d] border border-white/[0.04]">
                  <span className="text-zinc-500 text-[10px] block">Target Membership</span>
                  <span className="text-white font-medium">{selectedSlip.membershipTierToActivate.replace(/_/g, ' ')}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-[#16181d] border border-white/[0.04]">
                  <span className="text-zinc-500 text-[10px] block">Duration</span>
                  <span className="text-white font-medium">{selectedSlip.durationMonths} Month(s) Active</span>
                </div>
              </div>

              {selectedSlip.notes && (
                <div className="p-2.5 rounded-lg bg-[#16181d] text-zinc-300 text-[11px] border border-white/[0.04]">
                  <span className="text-zinc-500 text-[10px] block mb-0.5">Member Notes</span>
                  {selectedSlip.notes}
                </div>
              )}
            </div>

            <div className="px-5 py-3.5 bg-[#111317] border-t border-white/[0.06] flex items-center justify-between">
              <button
                type="button"
                onClick={() => setSelectedSlip(null)}
                className="px-3 py-1.5 rounded text-zinc-400 hover:text-white text-xs"
              >
                Close
              </button>

              {selectedSlip.status === 'PENDING_VERIFICATION' && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const slipToReject = selectedSlip;
                      setSelectedSlip(null);
                      setShowRejectModal(slipToReject);
                    }}
                    className="px-3 py-1.5 rounded bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-medium transition-colors"
                  >
                    Reject Slip
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApprove(selectedSlip)}
                    className="px-4 py-1.5 rounded bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs shadow-sm transition-all"
                  >
                    Approve & Extend Access
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal: Reject Slip */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#0e1014] border border-white/[0.08] rounded-xl shadow-2xl p-5" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.06] mb-4">
              <h3 className="text-sm font-semibold text-rose-400 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Reject Bank Transfer Slip
              </h3>
              <button onClick={() => setShowRejectModal(null)} className="text-zinc-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleRejectConfirm} className="space-y-4 text-xs">
              <div className="p-3 rounded-lg bg-[#16181d] border border-white/[0.04]">
                <div className="text-white font-medium">{showRejectModal.memberName}</div>
                <div className="text-zinc-400 font-mono text-[11px]">{showRejectModal.referenceNumber} · LKR {showRejectModal.amountLKR.toLocaleString()}</div>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Reason for Rejection</label>
                <textarea
                  rows={3}
                  required
                  placeholder="e.g. Deposit slip reference unreadable, or amount did not hit bank account."
                  value={rejectionReason}
                  onChange={e => setRejectionReason(e.target.value)}
                  className="w-full bg-[#16181d] border border-white/[0.08] rounded-md p-2.5 text-white text-xs focus:outline-none focus:border-rose-500/50"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowRejectModal(null)}
                  className="px-3 py-1.5 rounded text-zinc-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded bg-rose-500 hover:bg-rose-400 text-white font-semibold"
                >
                  Confirm Rejection & Notify on WhatsApp
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
