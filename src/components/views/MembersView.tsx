import React, { useState } from 'react';
import { useTenant } from '../../context/TenantContext';
import { Search, Filter, MessageSquare } from 'lucide-react';

export const MembersView: React.FC = () => {
  const { members, openWhatsAppModal } = useTenant();
  const [searchTerm, setSearchTerm] = useState('');
  const [tierFilter, setTierFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const filteredMembers = members.filter(m => {
    const matchesSearch = 
      m.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.barcodePin.includes(searchTerm);

    const matchesTier = tierFilter === 'ALL' || m.membershipTier === tierFilter;
    const matchesStatus = statusFilter === 'ALL' || m.status === statusFilter;

    return matchesSearch && matchesTier && matchesStatus;
  });

  const activeCount = members.filter(m => m.status === 'ACTIVE').length;
  const inFacilityCount = members.filter(m => m.isInsideFacility).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-white/[0.06]">
        <div>
          <h1 className="text-lg font-semibold text-white tracking-tight">Members & Passes</h1>
          <p className="text-[13px] text-zinc-400 mt-0.5">
            Active membership roster, punch card balances, and keycard barcode assignments.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="card px-3 py-1.5 text-xs flex items-center gap-2">
            <span className="text-zinc-500 font-mono text-[11px]">Total:</span>
            <span className="font-mono font-medium text-white tabular-nums">{members.length}</span>
            <span className="text-zinc-600">·</span>
            <span className="text-zinc-400 font-mono text-[11px]">{activeCount} active</span>
            <span className="text-zinc-600">·</span>
            <span className="text-emerald-400 font-mono text-[11px]">{inFacilityCount} in facility</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="card p-3 flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[220px] max-w-md">
          <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search member by name, PIN, or email..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full input pl-9 pr-3 py-1.5 text-xs"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-zinc-500" />
          <select
            value={tierFilter}
            onChange={e => setTierFilter(e.target.value)}
            className="input px-2.5 py-1 text-xs"
          >
            <option value="ALL">All Tiers</option>
            <option value="GOLD_UNLIMITED">Gold Unlimited</option>
            <option value="BLACK_CARD_ALL_ACCESS">Black Card All-Access</option>
            <option value="OFF_PEAK">Off-Peak</option>
            <option value="PUNCH_CARD_10">Punch Card (10-Pass)</option>
          </select>

          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="input px-2.5 py-1 text-xs"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="PAST_DUE">Past Due</option>
            <option value="FROZEN">Frozen</option>
          </select>
        </div>
      </div>

      {/* Members Table / Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {filteredMembers.map(m => {
          const isActive = m.status === 'ACTIVE';
          const isPastDue = m.status === 'PAST_DUE';

          return (
            <div 
              key={m.id}
              className={`card p-4 flex flex-col justify-between transition-colors ${
                isPastDue ? 'border-red-500/25 bg-red-950/10' : ''
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-2.5">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-medium leading-none ${
                        isActive ? 'badge-success' :
                        isPastDue ? 'badge-danger' : 'badge-neutral'
                      }`}>
                        {m.status}
                      </span>
                      {m.isInsideFacility && (
                        <span className="badge-info px-1.5 py-0.5 rounded text-[10px] font-mono font-medium">
                          In Facility
                        </span>
                      )}
                    </div>
                    <h3 className="font-semibold text-[13px] text-white">{m.fullName}</h3>
                    <div className="text-[11px] text-zinc-400 font-mono mt-0.5">
                      {m.membershipTier.replace(/_/g, ' ')}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-[9px] text-zinc-500 font-mono uppercase">Keycard PIN</div>
                    <div className="font-mono text-xs font-semibold text-white bg-[#0e1014] px-2 py-0.5 rounded border border-white/[0.08] mt-0.5">
                      {m.barcodePin}
                    </div>
                  </div>
                </div>

                {/* Punch card remaining passes */}
                {typeof m.remainingCredits === 'number' && (
                  <div className="card p-2 mb-2.5 text-xs flex items-center justify-between text-amber-300 font-mono">
                    <span className="text-[11px] text-zinc-400">Remaining Credits:</span>
                    <span className="font-bold">{m.remainingCredits} Passes</span>
                  </div>
                )}

                {/* Contact & Billing info */}
                <div className="bg-[#0e1014] rounded-lg p-2.5 text-[11px] space-y-1 font-mono text-zinc-400 border border-white/[0.04]">
                  <div className="flex items-center justify-between truncate">
                    <span className="text-zinc-600">Email:</span>
                    <span className="text-zinc-300 truncate max-w-[160px]">{m.email}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-600">Phone:</span>
                    <span className="text-zinc-300">{m.phone}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-600">Renewal:</span>
                    <span className={isPastDue ? 'text-red-300 font-bold' : 'text-zinc-300'}>{m.renewalDate}</span>
                  </div>
                </div>
              </div>

              <div className="mt-3 pt-2.5 border-t border-white/[0.04] flex items-center justify-between text-[10px] text-zinc-500 font-mono">
                <span>Joined {m.joinedDate}</span>
                <button
                  type="button"
                  onClick={() => openWhatsAppModal(m.phone, m.fullName)}
                  className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 font-sans text-[11px] font-medium transition-colors"
                >
                  <MessageSquare className="w-3 h-3" />
                  <span>WhatsApp</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
