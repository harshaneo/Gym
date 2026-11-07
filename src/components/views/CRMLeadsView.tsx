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

const STAGES: { id: LeadStage; label: string; desc: string }[] = [
  { id: 'INQUIRY', label: 'Inquiries', desc: 'Website, Walk-in & Ads' },
  { id: 'INTRO_BOOKED', label: 'Intro Scheduled', desc: 'Tour or movement screen' },
  { id: 'TRIAL_ACTIVE', label: 'Active Trial', desc: '7-day trial pass in use' },
  { id: 'WON_MEMBER', label: 'Converted', desc: 'Signed paid contract' },
  { id: 'LOST', label: 'Archived', desc: 'Cold or disqualified' },
];

const LOSS_REASONS = [
  'Price objection ($199/mo rate)',
  'Location / Commute distance too far',
  'Chose competitor (Orangetheory / Equinox / F45)',
  'Schedule mismatch (lack of 6am or late evening slots)',
  'Medical condition / injury',
  'Unresponsive after free trial',
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

  const [convertingLead, setConvertingLead] = useState<CRMLead | null>(null);
  const [convertTier, setConvertTier] = useState<MembershipTier>('GOLD_UNLIMITED');
  const [convertDues, setConvertDues] = useState('199');
  const [convertedNotice, setConvertedNotice] = useState<{ name: string; pin: string } | null>(null);

  const [losingLead, setLosingLead] = useState<CRMLead | null>(null);
  const [selectedLossReason, setSelectedLossReason] = useState(LOSS_REASONS[0]);

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
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-white/[0.06]">
        <div>
          <h1 className="text-lg font-semibold text-white tracking-tight">CRM & Member Pipeline</h1>
          <p className="text-[13px] text-zinc-400 mt-0.5">
            Track inquiries from initial contact through trial passes to paid recurring contracts.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="btn-primary px-3.5 py-2 rounded-lg text-xs flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Lead</span>
        </button>
      </div>

      {/* Conversion Banner */}
      {convertedNotice && (
        <div className="region-success rounded-lg p-3.5 flex items-center justify-between text-xs text-zinc-200 animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <div>
              <strong className="text-white">{convertedNotice.name}</strong> provisioned as active member.
              <span className="ml-2 font-mono bg-black/40 px-2 py-0.5 rounded text-emerald-300 border border-emerald-500/20">
                Turnstile PIN: {convertedNotice.pin}
              </span>
            </div>
          </div>
          <button onClick={() => setConvertedNotice(null)} className="text-zinc-500 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* CRM Metric Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="card p-4">
          <span className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider">Pipeline Value</span>
          <div className="text-xl font-semibold text-white font-mono tabular-nums mt-1.5">
            ${(totalPipelineCents / 100).toLocaleString()}
          </div>
          <span className="text-[11px] text-zinc-500 font-mono mt-0.5 block">Weighted prospective MRR</span>
        </div>

        <div className="card p-4">
          <span className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider">Conversion Rate</span>
          <div className="text-xl font-semibold text-white font-mono tabular-nums mt-1.5">
            {conversionRate}%
          </div>
          <span className="text-[11px] text-zinc-500 font-mono mt-0.5 block">{wonCount} won members this month</span>
        </div>

        <div className="card p-4">
          <span className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider">Average Velocity</span>
          <div className="text-xl font-semibold text-zinc-200 font-mono tabular-nums mt-1.5">
            4.2 Days
          </div>
          <span className="text-[11px] text-zinc-500 font-mono mt-0.5 block">Inquiry to trial start</span>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3 overflow-x-auto pb-4">
        {STAGES.map(stage => {
          const stageLeads = leads.filter(l => l.stage === stage.id);
          const stageValue = stageLeads.reduce((acc, l) => acc + l.estimatedValueCents, 0) / 100;

          return (
            <div 
              key={stage.id}
              className="card p-3 flex flex-col min-w-[240px]"
            >
              <div className="flex items-center justify-between mb-1.5">
                <h3 className="font-semibold text-xs text-white uppercase tracking-wider font-mono">{stage.label}</h3>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono text-zinc-400 bg-white/[0.04] tabular-nums">
                  {stageLeads.length}
                </span>
              </div>

              <div className="flex items-center justify-between text-[11px] text-zinc-500 font-mono pb-2.5 mb-2.5 border-b border-white/[0.04]">
                <span>Value:</span>
                <span className="text-zinc-300 font-medium">${stageValue.toLocaleString()}</span>
              </div>

              <div className="space-y-2.5 flex-1">
                {stageLeads.map(lead => {
                  const nextStage = getNextStage(lead.stage);

                  return (
                    <div 
                      key={lead.id}
                      className="bg-[#0e1014] rounded-lg p-3 space-y-2 border border-white/[0.04] hover:border-white/[0.10] transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="font-medium text-xs text-white">{lead.fullName}</h4>
                          <span className="text-[10px] font-mono text-zinc-500 flex items-center gap-1 mt-0.5">
                            <Tag className="w-2.5 h-2.5 text-zinc-600" />
                            {lead.source}
                          </span>
                        </div>
                        <span className="font-mono text-xs font-medium text-zinc-300 tabular-nums">
                          ${(lead.estimatedValueCents / 100).toFixed(0)}
                        </span>
                      </div>

                      <div className="text-[11px] text-zinc-400 space-y-0.5 font-mono">
                        <div className="flex items-center gap-1.5 truncate">
                          <Mail className="w-3 h-3 text-zinc-600 shrink-0" />
                          <span className="truncate">{lead.email}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Phone className="w-3 h-3 text-zinc-600 shrink-0" />
                          <span>{lead.phone}</span>
                        </div>
                      </div>

                      {lead.assignedCoachName && (
                        <div className="text-[10px] text-zinc-400 flex items-center gap-1 bg-[#090a0c] px-2 py-1 rounded border border-white/[0.04]">
                          <User className="w-3 h-3 text-zinc-500" />
                          <span>Trainer: <strong className="text-zinc-200">{lead.assignedCoachName}</strong></span>
                        </div>
                      )}

                      {lead.stage === 'LOST' && lead.lossReason && (
                        <div className="p-2 rounded region-danger text-[10px] text-red-200">
                          <strong>Reason:</strong> {lead.lossReason}
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
                              className="w-full input px-2 py-1 text-xs"
                            />
                            <div className="flex justify-end gap-1">
                              <button
                                onClick={() => setEditingLeadId(null)}
                                className="px-2 py-0.5 rounded text-[10px] text-zinc-500 hover:text-white"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() => handleSaveNotes(lead.id)}
                                className="btn-primary px-2 py-0.5 rounded text-[10px]"
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

                      {/* Controls */}
                      <div className="pt-2 border-t border-white/[0.04]">
                        {lead.stage !== 'WON_MEMBER' && lead.stage !== 'LOST' && (
                          <div className="flex items-center gap-1.5">
                            {nextStage && nextStage !== 'WON_MEMBER' && (
                              <button
                                onClick={() => updateLeadStage(lead.id, nextStage)}
                                className="btn-secondary flex-1 py-1 rounded text-[10px] flex items-center justify-center gap-1"
                              >
                                <span>Advance</span>
                                <ArrowRight className="w-2.5 h-2.5 text-zinc-500" />
                              </button>
                            )}

                            <button
                              onClick={() => {
                                setConvertingLead(lead);
                                setConvertDues(String(lead.estimatedValueCents / 100));
                              }}
                              className="btn-primary flex-1 py-1 rounded text-[10px] flex items-center justify-center gap-1"
                            >
                              <UserCheck className="w-2.5 h-2.5" />
                              <span>Convert</span>
                            </button>

                            <button
                              onClick={() => setLosingLead(lead)}
                              title="Mark as Lost"
                              className="p-1 rounded text-zinc-500 hover:text-red-400 transition-colors"
                            >
                              <ArchiveX className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}

                        {lead.stage === 'WON_MEMBER' && (
                          <span className="w-full text-center text-[10px] font-medium badge-success flex items-center justify-center gap-1 py-1 font-mono rounded">
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                            Active Member
                          </span>
                        )}

                        {lead.stage === 'LOST' && (
                          <button
                            onClick={() => updateLeadStage(lead.id, 'INQUIRY')}
                            className="btn-secondary w-full py-1 rounded text-[10px] flex items-center justify-center gap-1 font-mono"
                          >
                            <RotateCcw className="w-2.5 h-2.5" />
                            <span>Re-Open Lead</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}

                {stageLeads.length === 0 && (
                  <div className="py-8 text-center text-xs text-zinc-600 border border-dashed border-white/[0.04] rounded-lg">
                    No leads
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Convert Lead to Member Modal */}
      {convertingLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-overlay">
          <div className="modal-panel w-full max-w-md rounded-xl p-6 relative space-y-4">
            <button
              onClick={() => setConvertingLead(null)}
              className="absolute top-4 right-4 text-zinc-500 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            <div>
              <h3 className="font-semibold text-white text-sm">Convert Lead to Member</h3>
              <p className="text-xs text-zinc-500 mt-0.5">Issues turnstile keycard PIN and enrolls in recurring dues.</p>
            </div>

            <form onSubmit={handleExecuteConvert} className="space-y-3.5">
              <div className="card p-3 text-xs space-y-1 font-mono">
                <div className="text-zinc-400">Prospect: <strong className="text-white">{convertingLead.fullName}</strong></div>
                <div className="text-zinc-500">Email: {convertingLead.email}</div>
                <div className="text-zinc-500">Phone: {convertingLead.phone}</div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-zinc-400 mb-1">Membership Plan</label>
                <select
                  value={convertTier}
                  onChange={e => setConvertTier(e.target.value as MembershipTier)}
                  className="w-full input px-3 py-2 text-xs font-mono"
                >
                  <option value="GOLD_UNLIMITED">Gold Unlimited ($199/mo)</option>
                  <option value="BLACK_CARD_ALL_ACCESS">Black Card All-Access ($249/mo)</option>
                  <option value="OFF_PEAK">Off-Peak Pass ($149/mo)</option>
                  <option value="PUNCH_CARD_10">10-Visit Punch Card ($180)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-zinc-400 mb-1">Contract Dues ($ USD)</label>
                <input
                  type="number"
                  value={convertDues}
                  onChange={e => setConvertDues(e.target.value)}
                  className="w-full input px-3 py-2 text-xs font-mono"
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
                  className="btn-primary px-4 py-2 rounded-lg text-xs"
                >
                  Issue Pass & Activate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lost Reason Modal */}
      {losingLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-overlay">
          <div className="modal-panel w-full max-w-md rounded-xl p-6 relative space-y-4">
            <button
              onClick={() => setLosingLead(null)}
              className="absolute top-4 right-4 text-zinc-500 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            <div>
              <h3 className="font-semibold text-white text-sm">Disqualify / Archive Lead</h3>
              <p className="text-xs text-zinc-500 mt-0.5">Captures objection reason for sales analytics.</p>
            </div>

            <form onSubmit={handleExecuteLost} className="space-y-3.5">
              <div className="text-xs text-zinc-400">
                Archiving record for: <strong className="text-white">{losingLead.fullName}</strong>
              </div>

              <div className="space-y-2">
                {LOSS_REASONS.map((reason, idx) => (
                  <label 
                    key={idx}
                    className={`flex items-center gap-2.5 p-2 rounded-lg border cursor-pointer text-xs transition-colors ${
                      selectedLossReason === reason 
                        ? 'bg-red-950/20 border-red-500/30 text-white' 
                        : 'bg-[#0e1014] border-white/[0.04] text-zinc-400 hover:border-white/[0.08]'
                    }`}
                  >
                    <input
                      type="radio"
                      name="lossReason"
                      checked={selectedLossReason === reason}
                      onChange={() => setSelectedLossReason(reason)}
                      className="accent-white"
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
                  className="px-4 py-2 rounded-lg text-xs font-semibold bg-red-600 hover:bg-red-500 text-white"
                >
                  Archive Lead
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Lead Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-overlay">
          <div className="modal-panel w-full max-w-lg rounded-xl p-6 relative space-y-4">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 text-zinc-500 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            <div>
              <h3 className="font-semibold text-white text-sm">Register New Inquirer</h3>
              <p className="text-xs text-zinc-500 mt-0.5">Capture prospect details and route to front desk scheduler.</p>
            </div>

            <form onSubmit={handleCreateLead} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-medium text-zinc-400 mb-1">Prospect Name</label>
                <input
                  type="text"
                  required
                  placeholder="Jordan Hayes"
                  value={formName}
                  onChange={e => setFormName(e.target.value)}
                  className="w-full input px-3 py-2 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-zinc-400 mb-1">Email</label>
                  <input
                    type="email"
                    required
                    placeholder="jordan@example.com"
                    value={formEmail}
                    onChange={e => setFormEmail(e.target.value)}
                    className="w-full input px-3 py-2 text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-zinc-400 mb-1">Phone</label>
                  <input
                    type="tel"
                    required
                    placeholder="+1 (512) 555-0199"
                    value={formPhone}
                    onChange={e => setFormPhone(e.target.value)}
                    className="w-full input px-3 py-2 text-xs font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-zinc-400 mb-1">Source</label>
                  <select
                    value={formSource}
                    onChange={e => setFormSource(e.target.value as LeadSource)}
                    className="w-full input px-3 py-2 text-xs"
                  >
                    <option value="INSTAGRAM">Instagram Campaign</option>
                    <option value="WALK_IN">Walk-In Inquirer</option>
                    <option value="REFERRAL">Member Referral</option>
                    <option value="WEBSITE">Website Contact Form</option>
                    <option value="CAMPAIGN">Local Event / Promo</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-zinc-400 mb-1">Est. Contract ($/mo)</label>
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
                  <label className="block text-[11px] font-medium text-zinc-400 mb-1">Assign Trainer</label>
                  <select
                    value={formCoachName}
                    onChange={e => setFormCoachName(e.target.value)}
                    className="w-full input px-3 py-2 text-xs"
                  >
                    {coaches.map(c => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-zinc-400 mb-1">Tags (Comma-separated)</label>
                  <input
                    type="text"
                    placeholder="Gold Unlimited, Morning Slot"
                    value={formTags}
                    onChange={e => setFormTags(e.target.value)}
                    className="w-full input px-3 py-2 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-zinc-400 mb-1">Consultation Notes</label>
                <textarea
                  rows={2}
                  placeholder="Goals, experience with barbell lifting, target schedule..."
                  value={formNotes}
                  onChange={e => setFormNotes(e.target.value)}
                  className="w-full input px-3 py-2 text-xs"
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
                  className="btn-primary px-4 py-2 rounded-lg text-xs"
                >
                  Register Inquirer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
