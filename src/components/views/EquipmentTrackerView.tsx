import React, { useState } from 'react';
import { useTenant } from '../../context/TenantContext';
import { 
  Filter, 
  Search,
  Check
} from 'lucide-react';

export const EquipmentTrackerView: React.FC = () => {
  const { equipment, updateEquipmentStatus } = useTenant();

  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusUpdatedNotice, setStatusUpdatedNotice] = useState<string | null>(null);

  const filteredEquipment = equipment.filter(e => {
    const matchStatus = filterStatus === 'ALL' || e.status === filterStatus;
    const matchQuery = e.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                       e.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
                       e.serialNumber.toLowerCase().includes(searchQuery.toLowerCase());
    return matchStatus && matchQuery;
  });

  const handleUpdate = (id: string, name: string, status: 'OPERATIONAL' | 'NEEDS_SERVICE' | 'OUT_OF_ORDER') => {
    updateEquipmentStatus(id, status);
    setStatusUpdatedNotice(`Status for "${name}" updated to ${status.replace(/_/g, ' ')}`);
    setTimeout(() => setStatusUpdatedNotice(null), 3000);
  };

  const operationalCount = equipment.filter(e => e.status === 'OPERATIONAL').length;
  const needsServiceCount = equipment.filter(e => e.status === 'NEEDS_SERVICE').length;
  const outOfOrderCount = equipment.filter(e => e.status === 'OUT_OF_ORDER').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-white/[0.06]">
        <div>
          <h1 className="text-lg font-semibold text-white tracking-tight">Equipment & Facility Ops Registry</h1>
          <p className="text-[13px] text-zinc-400 mt-0.5">
            Asset maintenance logs, calibration schedules for powerlifting racks, cold plunge sanitization, and cardio equipment.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="card px-3 py-1.5 text-xs flex items-center gap-2">
            <span className="text-zinc-500 font-mono text-[11px]">Assets:</span>
            <span className="font-mono font-medium text-white tabular-nums">{equipment.length}</span>
            <span className="text-zinc-600">·</span>
            <span className="text-emerald-400 font-mono text-[11px]">{operationalCount} online</span>
            {needsServiceCount > 0 && (
              <>
                <span className="text-zinc-600">·</span>
                <span className="text-amber-400 font-mono text-[11px]">{needsServiceCount} service due</span>
              </>
            )}
            {outOfOrderCount > 0 && (
              <>
                <span className="text-zinc-600">·</span>
                <span className="text-red-400 font-mono text-[11px]">{outOfOrderCount} repair</span>
              </>
            )}
          </div>
        </div>
      </div>

      {statusUpdatedNotice && (
        <div className="region-success rounded-lg p-3.5 flex items-center justify-between text-xs text-zinc-200 animate-in fade-in">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{statusUpdatedNotice}</span>
          </div>
          <button onClick={() => setStatusUpdatedNotice(null)} className="text-zinc-500 hover:text-white">✕</button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="card p-3 flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search equipment by name, brand, or serial..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full input pl-9 pr-3 py-1.5 text-xs"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-zinc-500" />
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="input px-2.5 py-1 text-xs"
          >
            <option value="ALL">All Statuses ({equipment.length})</option>
            <option value="OPERATIONAL">Operational ({operationalCount})</option>
            <option value="NEEDS_SERVICE">Needs Service ({needsServiceCount})</option>
            <option value="OUT_OF_ORDER">Out of Order ({outOfOrderCount})</option>
          </select>
        </div>
      </div>

      {/* Equipment Asset Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredEquipment.map(item => {
          const isOperational = item.status === 'OPERATIONAL';
          const isNeedsService = item.status === 'NEEDS_SERVICE';
          const isOutOfOrder = item.status === 'OUT_OF_ORDER';

          return (
            <div 
              key={item.id} 
              className={`card p-5 flex flex-col justify-between transition-colors ${
                isOutOfOrder ? 'border-red-500/30 bg-red-950/10' :
                isNeedsService ? 'border-amber-500/30 bg-amber-950/10' : ''
              }`}
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-3 mb-2.5">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-medium leading-none ${
                        isOperational ? 'badge-success' :
                        isNeedsService ? 'badge-warning' : 'badge-danger'
                      }`}>
                        {item.status.replace(/_/g, ' ')}
                      </span>
                      <span className="text-[10px] font-mono text-zinc-500">
                        {item.category.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <h3 className="font-semibold text-sm text-white">{item.name}</h3>
                    <div className="text-xs text-zinc-400 mt-0.5">
                      Brand: <strong className="text-zinc-200">{item.brand}</strong> · {item.location}
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[9px] font-mono text-zinc-500 uppercase block">Serial #</span>
                    <span className="font-mono text-xs font-semibold text-white bg-[#0e1014] px-2 py-0.5 rounded border border-white/[0.06] mt-0.5 inline-block">
                      {item.serialNumber}
                    </span>
                  </div>
                </div>

                {/* Service dates */}
                <div className="bg-[#0e1014] rounded-lg p-2.5 text-xs font-mono space-y-1 text-zinc-400 border border-white/[0.04] mb-3">
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-600">Last Serviced:</span>
                    <span className="text-zinc-300">{item.lastServiceDate}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-600">Next Service Due:</span>
                    <span className={isNeedsService ? 'text-amber-300 font-bold' : 'text-zinc-300'}>
                      {item.nextServiceDueDate}
                    </span>
                  </div>
                </div>

                {/* Maintenance Notes */}
                <p className="text-[11px] text-zinc-400 leading-relaxed italic mb-4">
                  "{item.notes}"
                </p>
              </div>

              {/* Status Update Actions */}
              <div className="pt-3 border-t border-white/[0.04] flex items-center justify-between gap-1.5">
                <span className="text-[10px] font-mono text-zinc-500">Update State:</span>

                <div className="flex items-center gap-1">
                  {!isOperational && (
                    <button
                      type="button"
                      onClick={() => handleUpdate(item.id, item.name, 'OPERATIONAL')}
                      className="px-2 py-1 rounded text-[10px] font-mono badge-success hover:bg-emerald-500/20"
                    >
                      Clear & Online
                    </button>
                  )}

                  {!isNeedsService && (
                    <button
                      type="button"
                      onClick={() => handleUpdate(item.id, item.name, 'NEEDS_SERVICE')}
                      className="px-2 py-1 rounded text-[10px] font-mono badge-warning hover:bg-amber-500/20"
                    >
                      Flag Service
                    </button>
                  )}

                  {!isOutOfOrder && (
                    <button
                      type="button"
                      onClick={() => handleUpdate(item.id, item.name, 'OUT_OF_ORDER')}
                      className="px-2 py-1 rounded text-[10px] font-mono badge-danger hover:bg-red-500/20"
                    >
                      Mark Broken
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
