import React, { useState } from 'react';
import { useTenant } from '../../context/TenantContext';
import { 
  Search, 
  Filter
} from 'lucide-react';

export const MembersView: React.FC = () => {
  const { members } = useTenant();
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Members & Passes</h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Active membership rosters, punch card allowances, and billing renewal dates.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 rounded-lg bg-[#111317] border border-white/[0.08] text-xs font-mono text-zinc-300">
            Total Members: <strong className="text-white">{members.length}</strong>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#111317] p-3 rounded-xl border border-white/[0.08]">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search member by name, PIN, or email..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pro-input rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder:text-zinc-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-zinc-400" />
          <select
            value={tierFilter}
            onChange={e => setTierFilter(e.target.value)}
            className="bg-[#181b21] border border-white/[0.08] rounded-md px-2.5 py-1 text-xs text-zinc-200 focus:outline-none"
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
            className="bg-[#181b21] border border-white/[0.08] rounded-md px-2.5 py-1 text-xs text-zinc-200 focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="PAST_DUE">Past Due</option>
            <option value="FROZEN">Frozen</option>
          </select>
        </div>
      </div>

      {/* Members Directory Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredMembers.map(m => {
          const isActive = m.status === 'ACTIVE';
          const isPastDue = m.status === 'PAST_DUE';

          return (
            <div 
              key={m.id}
              className={`bg-[#111317] rounded-xl p-4 border transition-colors ${
                isPastDue ? 'border-red-500/30 bg-[#171214]' : 'border-white/[0.08] hover:border-white/[0.14]'
              }`}
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`px-2 py-0.5 rounded-[4px] text-[10px] font-mono font-medium leading-none ${
                      isActive ? 'badge-status-approved' :
                      isPastDue ? 'badge-status-denied' :
                      'badge-status-neutral'
                    }`}>
                      {m.status}
                    </span>
                    {m.isInsideFacility && (
                      <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
                        In Facility
                      </span>
                    )}
                  </div>
                  <h3 className="font-semibold text-sm text-white">{m.fullName}</h3>
                  <div className="text-xs text-zinc-300 font-mono mt-0.5">
                    {m.membershipTier.replace(/_/g, ' ')}
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-[10px] text-zinc-500 font-mono">Barcode PIN</div>
                  <div className="font-mono text-xs font-bold text-white bg-zinc-900 px-2 py-1 rounded border border-white/10 mt-0.5">
                    {m.barcodePin}
                  </div>
                </div>
              </div>

              {/* Punch card status if applicable */}
              {typeof m.remainingCredits === 'number' && (
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-2.5 mb-3 text-xs flex items-center justify-between text-amber-300">
                  <span>Remaining Punch Credits:</span>
                  <span className="font-mono font-bold text-sm">{m.remainingCredits} Passes</span>
                </div>
              )}

              {/* Contact info & Dates */}
              <div className="bg-zinc-900/60 rounded-xl p-3 text-xs space-y-1.5 font-mono text-zinc-300 border border-white/5">
                <div className="flex items-center justify-between truncate">
                  <span className="text-zinc-500">Email:</span>
                  <span className="truncate max-w-[170px]">{m.email}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-500">Phone:</span>
                  <span>{m.phone}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-500">Next Renewal:</span>
                  <span className={isPastDue ? 'text-red-400 font-bold' : 'text-zinc-300'}>{m.renewalDate}</span>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-zinc-500">
                <span>Member since {m.joinedDate}</span>
                <span>Emergency: {m.emergencyContact.split('(')[0]}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
