import React, { useState } from 'react';
import { useTenant } from '../../context/TenantContext';
import { LeadStage, LeadSource, MembershipTier, CRMLead } from '../../types';
import { 
  Plus, 
  User, 
  Phone, 
  Mail, 
  Tag, 
  ArrowRight, 
  CheckCircle2, 
  X,
  UserCheck,
  ArchiveX,
  RotateCcw
} from 'lucide-react';

const STAGES: { id: LeadStage; label: string; color: string; desc: string }[] = [
  { id: 'INQUIRY', label: 'New Inquiries', color: '#3b82f6', desc: 'Website, Instagram & Walk-ins' },
  { id: 'INTRO_BOOKED', label: 'Intro Scheduled', color: '#a855f7', desc: 'Facility tour or movement screen' },
  { id: 'TRIAL_ACTIVE', label: 'Active Trial', color: '#f59e0b', desc: '7-day trial pass ongoing' },
  { id: 'WON_MEMBER', label: 'Converted Members', color: '#10b981', desc: 'Signed paid annual / monthly contract' },
  { id: 'LOST', label: 'Closed / Inactive', color: '#6b7280', desc: 'Cold or relocated leads' },
];

const LOSS_REASONS = [
  'Price objection ($199/mo rate)',
  'Location / Commute distance too far',
  'Chose competitor (Orangetheory / Equinox / F45)',
  'Schedule mismatch (lack of 6am or late evening slots)',
  'Medical condition / injury',
  'Unresponsive / Ghosted after free trial',
];

export const CRMLeadsView: React.FC = () => {
  const { 
    leads, 
    coaches, 
    addLead, 
    updateLeadStage, 
    updateLeadNotes,
    convertLeadToMember,
    markLeadLost
  } = useTenant();

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingLeadId, setEditingLeadId] = useState<string | null>(null);
  const [editNoteText, setEditNoteText] = useState('');

  // Convert Lead Modal state
  const [convertingLead, setConvertingLead] = useState<CRMLead | null>(null);
  const [convertTier, setConvertTier] = useState<MembershipTier>('GOLD_UNLIMITED');
  const [convertDues, setConvertDues] = useState('199');
  const [convertedNotice, setConvertedNotice] = useState<{ name: string; pin: string } | null>(null);

  // Lost Lead Modal state
  const [losingLead, setLosingLead] = useState<CRMLead | null>(null);
  const [selectedLossReason, setSelectedLossReason] = useState(LOSS_REASONS[0]);

  // Form states
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formSource, setFormSource] = useState<LeadSource>('INSTAGRAM');
  const [formValue, setFormValue] = useState('199');
  const [formCoachName, setFormCoachName] = useState(coaches[0]?.name || 'Marcus Vance');
  const [formNotes, setFormNotes] = useState('');
  const [formTags, setFormTags] = useState('Gold Unlimited, Morning Slot');

  const handleCreateLead = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName) return;

    addLead({
      fullName: formName,
      email: formEmail,
      phone: formPhone,
      stage: 'INQUIRY',
      source: formSource,
      estimatedValueCents: Math.round(Number(formValue) * 100),
      notes: formNotes,
      assignedCoachName: formCoachName,
      tags: formTags.split(',').map(t => t.trim()).filter(Boolean),
    });

    setShowAddModal(false);
    setFormName('');
    setFormEmail('');
    setFormPhone('');
    setFormNotes('');
  };

  const handleSaveNotes = (leadId: string) => {
    updateLeadNotes(leadId, editNoteText);
    setEditingLeadId(null);
  };

  const handleExecuteConvert = (e: React.FormEvent) => {
    e.preventDefault();
    if (!convertingLead) return;

    const duesCents = Math.round(Number(convertDues) * 100);
    const newMember = convertLeadToMember(convertingLead.id, convertTier, duesCents);

    setConvertedNotice({
      name: newMember.fullName,
      pin: newMember.barcodePin,
    });
    setConvertingLead(null);
  };

  const handleExecuteLost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!losingLead) return;

    markLeadLost(losingLead.id, selectedLossReason);
    setLosingLead(null);
  };

  const getNextStage = (current: LeadStage): LeadStage | null => {
    switch (current) {
      case 'INQUIRY': return 'INTRO_BOOKED';
      case 'INTRO_BOOKED': return 'TRIAL_ACTIVE';
      case 'TRIAL_ACTIVE': return 'WON_MEMBER';
      default: return null;
    }
  };

  const totalPipelineCents = leads.reduce((sum, l) => sum + (l.stage !== 'LOST' ? l.estimatedValueCents : 0), 0);
  const wonCount = leads.filter(l => l.stage === 'WON_MEMBER').length;
  const conversionRate = leads.length > 0 ? Math.round((wonCount / leads.length) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Gym CRM & Member Pipeline</h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Track inquiries from initial contact through trial passes to paid recurring contracts.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-3.5 py-2 rounded-lg font-medium text-xs bg-white hover:bg-zinc-200 text-zinc-950 tactile-btn flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Lead</span>
        </button>
      </div>

      {/* Success Notification Banner for Member Provisioning */}
      {convertedNotice && (
        <div className="bg-[#0e1613] border border-[#1b382b] rounded-xl p-4 flex items-center justify-between text-xs text-zinc-100 animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-[#4ade80] shrink-0" />
            <div>
              <span className="font-semibold text-white">{convertedNotice.name}</span> successfully provisioned as an active member!
              <span className="ml-2 font-mono bg-black/40 px-2 py-0.5 rounded text-[#86efac] border border-[#1f4a33]">
                Turnstile PIN: {convertedNotice.pin}
              </span>
            </div>
          </div>
          <button
            onClick={() => setConvertedNotice(null)}
            className="text-zinc-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* CRM Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#111317] border border-white/[0.08] rounded-xl p-4">
          <span className="text-xs text-zinc-400 font-medium">Active Pipeline Value</span>
          <div className="text-xl font-semibold text-white tracking-tight tabular-nums mt-1">
            ${(totalPipelineCents / 100).toLocaleString()}
          </div>
          <span className="text-[11px] text-zinc-500 font-mono">Weighted prospective MRR</span>
        </div>

        <div className="bg-[#111317] border border-white/[0.08] rounded-xl p-4">
          <span className="text-xs text-zinc-400 font-medium">Trial Conversion Rate</span>
          <div className="text-xl font-semibold text-white tracking-tight tabular-nums mt-1">
            {conversionRate}%
          </div>
          <span className="text-[11px] text-zinc-500 font-mono">{wonCount} won members this month</span>
        </div>

        <div className="bg-[#111317] border border-white/[0.08] rounded-xl p-4">
          <span className="text-xs text-zinc-400 font-medium">Average Lead Velocity</span>
          <div className="text-xl font-bold text-zinc-200 font-mono mt-1">
            4.2 Days
          </div>
          <span className="text-[11px] text-zinc-500 font-mono">Inquiry to trial start</span>
        </div>
      </div>

      {/* Kanban Board Container */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3.5 overflow-x-auto pb-4">
        {STAGES.map(stage => {
          const stageLeads = leads.filter(l => l.stage === stage.id);
          const stageValue = stageLeads.reduce((acc, l) => acc + l.estimatedValueCents, 0) / 100;

          return (
            <div 
              key={stage.id}
              className="bg-[#111317] border border-white/[0.08] rounded-xl p-3.5 flex flex-col min-w-[250px]"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: stage.color }} />
                  <h3 className="font-bold text-xs text-white uppercase tracking-wider">{stage.label}</h3>
                </div>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-zinc-800 text-zinc-300 border border-white/10">
                  {stageLeads.length}
                </span>
              </div>

              <div className="flex items-center justify-between text-[11px] text-zinc-400 font-mono pb-3 mb-3 border-b border-white/10">
                <span>Total Value:</span>
                <span className="text-zinc-200 font-bold">${stageValue.toLocaleString()}</span>
              </div>

              {/* Cards in this stage */}
              <div className="space-y-3 flex-1">
                {stageLeads.map(lead => {
                  const nextStage = getNextStage(lead.stage);

                  return (
                    <div 
                      key={lead.id}
                      className="bg-[#16191f] rounded-lg p-3 space-y-2 border border-white/[0.06] hover:border-white/[0.12] transition-colors"
                    >
                      {/* Name & Source */}
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="font-semibold text-xs text-white">{lead.fullName}</h4>
                          <span className="text-[10px] font-mono text-zinc-400 flex items-center gap-1 mt-0.5">
                            <Tag className="w-2.5 h-2.5 text-zinc-500" />
                            {lead.source}
                          </span>
                        </div>
                        <span className="font-mono text-xs font-semibold text-zinc-200">
                          ${(lead.estimatedValueCents / 100).toFixed(0)}
                        </span>
                      </div>

                      {/* Contact Info */}
                      <div className="text-[11px] text-zinc-400 space-y-0.5 font-mono">
                        <div className="flex items-center gap-1.5 truncate">
                          <Mail className="w-3 h-3 text-zinc-500 shrink-0" />
                          <span className="truncate">{lead.email}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Phone className="w-3 h-3 text-zinc-500 shrink-0" />
                          <span>{lead.phone}</span>
                        </div>
                      </div>

                      {/* Coach Assignment */}
                      {lead.assignedCoachName && (
                        <div className="text-[10px] text-zinc-300 flex items-center gap-1 bg-[#0d0f12] px-2 py-1 rounded border border-white/[0.04]">
                          <User className="w-3 h-3 text-zinc-400" />
                          <span>Trainer: <strong className="text-white">{lead.assignedCoachName}</strong></span>
                        </div>
                      )}

                      {/* Tags */}
                      {lead.tags && lead.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {lead.tags.map((t, idx) => (
                            <span key={idx} className="px-1.5 py-0.5 rounded text-[9px] font-medium bg-white/[0.04] text-zinc-400 border border-white/[0.04]">
                              {t}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Loss Reason for LOST leads */}
                      {lead.stage === 'LOST' && lead.lossReason && (
                        <div className="p-2 rounded bg-red-950/30 border border-red-500/20 text-[10px] text-red-300">
                          <strong className="text-red-200">Loss Reason:</strong> {lead.lossReason}
                        </div>
                      )}

                      {/* Notes Section with Inline Edit */}
                      <div className="pt-1.5 border-t border-white/[0.04] text-[11px]">
                        {editingLeadId === lead.id ? (
                          <div className="space-y-1.5">
                            <textarea
                              rows={2}
                              value={editNoteText}
                              onChange={e => setEditNoteText(e.target.value)}
                              className="w-full bg-[#0d0f12] border border-white/10 rounded px-2 py-1 text-xs text-white focus:outline-none"
                            />
                            <div className="flex justify-end gap-1">
                              <button
                                onClick={() => setEditingLeadId(null)}
                                className="px-2 py-0.5 rounded text-[10px] text-zinc-400 hover:text-white"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() => handleSaveNotes(lead.id)}
                                className="px-2 py-0.5 rounded text-[10px] font-medium bg-white text-zinc-950"
                              >
                                Save
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div 
                            onClick={() => {
                              setEditingLeadId(lead.id);
                              setEditNoteText(lead.notes);
                            }}
                            className="text-zinc-500 hover:text-zinc-300 cursor-pointer italic line-clamp-2 text-[11px]"
                            title="Click to edit notes"
                          >
                            "{lead.notes || 'Click to add notes...'}"
                          </div>
                        )}
                      </div>

                      {/* Stage Advancement & Conversion Controls */}
                      <div className="pt-2 border-t border-white/[0.04] space-y-1.5">
                        {lead.stage !== 'WON_MEMBER' && lead.stage !== 'LOST' && (
                          <div className="flex items-center gap-1.5">
                            {nextStage && nextStage !== 'WON_MEMBER' && (
                              <button
                                onClick={() => updateLeadStage(lead.id, nextStage)}
                                className="flex-1 py-1 rounded text-[10px] font-medium bg-[#1e222b] hover:bg-[#282d37] text-zinc-200 border border-white/[0.06] flex items-center justify-center gap-1 transition-colors"
                              >
                                <span>Advance</span>
                                <ArrowRight className="w-2.5 h-2.5 text-zinc-400" />
                              </button>
                            )}

                            <button
                              onClick={() => {
                                setConvertingLead(lead);
                                setConvertDues(String(lead.estimatedValueCents / 100));
                              }}
                              className="flex-1 py-1 rounded-[4px] text-[10px] font-semibold bg-white hover:bg-zinc-200 text-zinc-950 flex items-center justify-center gap-1 transition-colors shadow-sm tactile-btn"
                            >
                              <UserCheck className="w-2.5 h-2.5" />
                              <span>Convert</span>
                            </button>

                            <button
                              onClick={() => setLosingLead(lead)}
                              title="Mark as Lost"
                              className="p-1 rounded text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                            >
                              <ArchiveX className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}

                        {lead.stage === 'WON_MEMBER' && (
                          <span className="w-full text-center text-[10px] font-medium badge-status-approved flex items-center justify-center gap-1 py-1 font-mono rounded-[4px]">
                            <CheckCircle2 className="w-3 h-3 text-[#4ade80]" />
                            Active Member Account
                          </span>
                        )}

                        {lead.stage === 'LOST' && (
                          <button
                            onClick={() => updateLeadStage(lead.id, 'INQUIRY')}
                            className="w-full py-1 rounded text-[10px] font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-300 flex items-center justify-center gap-1 transition-colors font-mono"
                          >
                            <RotateCcw className="w-2.5 h-2.5" />
                            <span>Re-Open Inquiry</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}

                {stageLeads.length === 0 && (
                  <div className="py-8 text-center text-xs text-zinc-600 border-2 border-dashed border-white/5 rounded-xl">
                    No leads in this stage
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Convert Lead to Member Modal */}
      {convertingLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="glass-panel w-full max-w-md rounded-2xl p-6 shadow-2xl relative border border-white/10">
            <button
              onClick={() => setConvertingLead(null)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-[#132d20] border border-[#1f4a33] text-[#4ade80] flex items-center justify-center">
                <UserCheck className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white tracking-tight">Convert to Member</h3>
                <p className="text-xs text-zinc-400">Provisions keycard PIN and enrolls in active recurring dues.</p>
              </div>
            </div>

            <form onSubmit={handleExecuteConvert} className="space-y-4">
              <div className="p-3 rounded-lg bg-zinc-900 border border-white/10 text-xs space-y-1">
                <div className="text-zinc-400">Prospect: <strong className="text-white">{convertingLead.fullName}</strong></div>
                <div className="text-zinc-400 font-mono">Email: {convertingLead.email}</div>
                <div className="text-zinc-400 font-mono">Phone: {convertingLead.phone}</div>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">Select Membership Tier</label>
                <select
                  value={convertTier}
                  onChange={e => setConvertTier(e.target.value as MembershipTier)}
                  className="w-full bg-zinc-900 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-zinc-400 font-mono"
                >
                  <option value="GOLD_UNLIMITED">Gold Unlimited ($199/mo)</option>
                  <option value="BLACK_CARD_ALL_ACCESS">Black Card All-Access ($249/mo)</option>
                  <option value="OFF_PEAK">Off-Peak Pass ($149/mo)</option>
                  <option value="PUNCH_CARD_10">10-Visit Punch Card ($180)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">Contract Dues ($ USD)</label>
                <input
                  type="number"
                  value={convertDues}
                  onChange={e => setConvertDues(e.target.value)}
                  className="w-full bg-zinc-900 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-zinc-400 font-mono"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-white/[0.06]">
                <button
                  type="button"
                  onClick={() => setConvertingLead(null)}
                  className="px-3 py-2 rounded-lg text-xs font-medium text-zinc-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg text-xs font-semibold bg-white hover:bg-zinc-200 text-zinc-950 tactile-btn flex items-center gap-1.5 shadow-sm"
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Issue Pass & Activate</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Loss Reason Modal */}
      {losingLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="glass-panel w-full max-w-md rounded-2xl p-6 shadow-2xl relative border border-red-500/30">
            <button
              onClick={() => setLosingLead(null)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-red-500/20 text-red-400 flex items-center justify-center">
                <ArchiveX className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white tracking-tight">Record Reason for Lost Lead</h3>
                <p className="text-xs text-zinc-400">Capture reason for sales pipeline analytics.</p>
              </div>
            </div>

            <form onSubmit={handleExecuteLost} className="space-y-4">
              <div className="text-xs text-zinc-300">
                Archiving inquiry for: <strong className="text-white">{losingLead.fullName}</strong>
              </div>

              <div className="space-y-2">
                {LOSS_REASONS.map((reason, idx) => (
                  <label 
                    key={idx}
                    className={`flex items-center gap-2.5 p-2.5 rounded-lg border cursor-pointer text-xs transition-colors ${
                      selectedLossReason === reason 
                        ? 'bg-red-950/30 border-red-500/40 text-white' 
                        : 'bg-zinc-900/50 border-white/5 text-zinc-400 hover:border-white/10'
                    }`}
                  >
                    <input
                      type="radio"
                      name="lossReason"
                      checked={selectedLossReason === reason}
                      onChange={() => setSelectedLossReason(reason)}
                      className="accent-red-500"
                    />
                    <span>{reason}</span>
                  </label>
                ))}
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-white/[0.06]">
                <button
                  type="button"
                  onClick={() => setLosingLead(null)}
                  className="px-3 py-2 rounded-lg text-xs font-medium text-zinc-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg text-xs font-semibold bg-red-600 hover:bg-red-500 text-white tactile-btn"
                >
                  Confirm & Archive Lead
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Lead Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="glass-panel w-full max-w-lg rounded-2xl p-6 shadow-2xl relative">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-base font-bold text-white mb-4 tracking-tight">Register New Gym Inquirer</h3>

            <form onSubmit={handleCreateLead} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">Prospect Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Jordan Hayes"
                  value={formName}
                  onChange={e => setFormName(e.target.value)}
                  className="w-full bg-zinc-900 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">Email</label>
                  <input
                    type="email"
                    required
                    placeholder="jordan@example.com"
                    value={formEmail}
                    onChange={e => setFormEmail(e.target.value)}
                    className="w-full bg-zinc-900 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-orange-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">Phone</label>
                  <input
                    type="tel"
                    required
                    placeholder="+1 (512) 555-0199"
                    value={formPhone}
                    onChange={e => setFormPhone(e.target.value)}
                    className="w-full bg-zinc-900 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-orange-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">Acquisition Source</label>
                  <select
                    value={formSource}
                    onChange={e => setFormSource(e.target.value as LeadSource)}
                    className="w-full bg-zinc-900 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-orange-500"
                  >
                    <option value="INSTAGRAM">Instagram Campaign</option>
                    <option value="WALK_IN">Walk-In Inquirer</option>
                    <option value="REFERRAL">Member Referral</option>
                    <option value="WEBSITE">Website Contact Form</option>
                    <option value="CAMPAIGN">Local Event / Promo</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">Est. Contract Value ($/mo)</label>
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
                  <label className="block text-xs font-medium text-zinc-300 mb-1">Assign Coach</label>
                  <select
                    value={formCoachName}
                    onChange={e => setFormCoachName(e.target.value)}
                    className="w-full bg-zinc-900 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-orange-500"
                  >
                    {coaches.map(c => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">Tags (comma separated)</label>
                  <input
                    type="text"
                    placeholder="e.g. Gold Unlimited, Morning Slot"
                    value={formTags}
                    onChange={e => setFormTags(e.target.value)}
                    className="w-full bg-zinc-900 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">Initial Consultation Notes</label>
                <textarea
                  rows={2}
                  placeholder="Primary fitness goals, experience with barbells, target schedule..."
                  value={formNotes}
                  onChange={e => setFormNotes(e.target.value)}
                  className="w-full bg-zinc-900 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-orange-500"
                />
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
                  Register Lead
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
