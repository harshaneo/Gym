import React, { useState } from 'react';
import { useTenant } from '../../context/TenantContext';
import { 
  ShieldCheck, 
  Globe2, 
  Sliders, 
  Terminal, 
  ArrowUpRight, 
  CheckCircle2, 
  Clock, 
  Plus, 
  Building2, 
  Users, 
  DollarSign, 
  Radio, 
  RefreshCw,
  LogOut
} from 'lucide-react';

export const PlatformControlPlaneView: React.FC = () => {
  const { 
    platformTenants, 
    featureFlags, 
    toggleFeatureFlag, 
    platformAuditLogs, 
    verifyCustomDomainDns, 
    provisionPlatformTenant,
    setRole,
    switchTenant
  } = useTenant();

  const [showProvisionModal, setShowProvisionModal] = useState(false);
  const [newGymName, setNewGymName] = useState('');
  const [newSlug, setNewSlug] = useState('');
  const [newCustomDomain, setNewCustomDomain] = useState('');
  const [newPlan, setNewPlan] = useState<'STARTER' | 'GROWTH' | 'ENTERPRISE'>('GROWTH');
  const [isVerifyingDns, setIsVerifyingDns] = useState<string | null>(null);

  const totalPlatformMrr = platformTenants.reduce((acc, t) => acc + t.mrr, 0);
  const totalMembers = platformTenants.reduce((acc, t) => acc + t.memberCount, 0);

  const handleProvision = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGymName || !newSlug) return;
    const cleanSlug = newSlug.toLowerCase().replace(/[^a-z0-9-]/g, '');
    provisionPlatformTenant({
      name: newGymName,
      slug: cleanSlug,
      customDomain: newCustomDomain ? newCustomDomain.toLowerCase().trim() : undefined,
      plan: newPlan,
    });
    setNewGymName('');
    setNewSlug('');
    setNewCustomDomain('');
    setShowProvisionModal(false);
  };

  const handleVerifyDns = (tenantId: string) => {
    setIsVerifyingDns(tenantId);
    setTimeout(() => {
      verifyCustomDomainDns(tenantId);
      setIsVerifyingDns(null);
    }, 600);
  };

  const handleEnterWorkspace = (slug: string) => {
    switchTenant(slug);
    setRole('GYM_OWNER');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Platform Control Plane Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-[#0e1117] border border-white/[0.08]">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-purple-950/70 border border-purple-500/30 flex items-center justify-center text-purple-300">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-semibold text-white tracking-tight">Platform Control Plane</h1>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-purple-500/15 text-purple-300 border border-purple-500/25">
                ISOLATED CONTROL PLANE
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              IronPulse SaaS infrastructure management, cross-tenant DNS, and multi-tenant telemetry.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowProvisionModal(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-white hover:bg-zinc-200 text-zinc-950 text-xs font-semibold shadow-sm transition-all tactile-btn"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Provision Gym Tenant</span>
          </button>
          <button
            onClick={() => setRole('GYM_OWNER')}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-white/[0.08] text-zinc-300 text-xs font-medium transition-colors"
            title="Return to Tenant Workspace"
          >
            <LogOut className="w-3.5 h-3.5 text-zinc-400" />
            <span className="hidden sm:inline">Exit to Workspace</span>
          </button>
        </div>
      </div>

      {/* Global SaaS Telemetry Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-[#0e1117] border border-white/[0.08]">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs font-medium">Platform ARR / MRR</span>
            <DollarSign className="w-4 h-4 text-zinc-500" />
          </div>
          <div className="text-xl md:text-2xl font-bold font-mono text-white tracking-tight">
            ${(totalPlatformMrr).toLocaleString('en-US')}
            <span className="text-xs text-zinc-400 font-normal ml-1">/mo</span>
          </div>
          <div className="text-[11px] text-zinc-400 mt-1 font-mono">
            ${(totalPlatformMrr * 12).toLocaleString('en-US')} Annual Run Rate
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#0e1117] border border-white/[0.08]">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs font-medium">Active Tenants</span>
            <Building2 className="w-4 h-4 text-zinc-500" />
          </div>
          <div className="text-xl md:text-2xl font-bold font-mono text-white tracking-tight">
            {platformTenants.length}
          </div>
          <div className="text-[11px] text-zinc-400 mt-1 font-mono">
            100% active multi-tenant SLA
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#0e1117] border border-white/[0.08]">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs font-medium">Total Gym Members</span>
            <Users className="w-4 h-4 text-zinc-500" />
          </div>
          <div className="text-xl md:text-2xl font-bold font-mono text-white tracking-tight">
            {totalMembers.toLocaleString('en-US')}
          </div>
          <div className="text-[11px] text-zinc-400 mt-1 font-mono">
            Across {platformTenants.length} gym locations
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#0e1117] border border-white/[0.08]">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs font-medium">Edge Gateway Status</span>
            <Radio className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl md:text-2xl font-bold font-mono text-white tracking-tight flex items-center gap-2">
            <span>99.99%</span>
            <span className="w-2 h-2 rounded-full dot-approved" />
          </div>
          <div className="text-[11px] text-zinc-400 mt-1 font-mono">
            Cloudflare Anycast SSL Active
          </div>
        </div>
      </div>

      {/* Main Grid: Tenant Directory + Global Platform Feature Flags */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Tenant Roster & Custom Domain DNS Verification */}
        <div className="lg:col-span-2 space-y-4">
          <div className="p-5 rounded-2xl bg-[#0e1117] border border-white/[0.08]">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-semibold text-white tracking-tight flex items-center gap-2">
                  <Globe2 className="w-4 h-4 text-zinc-400" />
                  <span>Tenant Workspaces & Domain Verification</span>
                </h2>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Subdomain routing and edge TLS certificates for each organization.
                </p>
              </div>
              <span className="text-xs font-mono text-zinc-400">
                {platformTenants.length} tenants
              </span>
            </div>

            <div className="overflow-x-auto -mx-5 px-5">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/[0.06] text-zinc-400 font-mono text-[10px] uppercase tracking-wider">
                    <th className="pb-2.5 font-medium">Organization / Subdomain</th>
                    <th className="pb-2.5 font-medium">SaaS Tier</th>
                    <th className="pb-2.5 font-medium">Custom Domain</th>
                    <th className="pb-2.5 font-medium">MRR</th>
                    <th className="pb-2.5 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {platformTenants.map(t => (
                    <tr key={t.id} className="group hover:bg-white/[0.02] transition-colors">
                      <td className="py-3">
                        <div className="font-semibold text-white text-xs">{t.name}</div>
                        <div className="font-mono text-[11px] text-zinc-400 mt-0.5 flex items-center gap-1">
                          <span>{t.subdomain}</span>
                        </div>
                      </td>

                      <td className="py-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-medium ${
                          t.plan === 'ENTERPRISE' 
                            ? 'bg-purple-950/60 text-purple-300 border border-purple-500/30'
                            : t.plan === 'GROWTH'
                            ? 'bg-blue-950/60 text-blue-300 border border-blue-500/30'
                            : 'bg-zinc-800 text-zinc-300 border border-white/[0.08]'
                        }`}>
                          {t.plan}
                        </span>
                      </td>

                      <td className="py-3 font-mono">
                        {t.customDomain ? (
                          <div className="flex items-center gap-1.5">
                            <span className="text-zinc-200">{t.customDomain}</span>
                            {t.customDomainStatus === 'VERIFIED' ? (
                              <span className="badge-status-approved text-[10px] px-1.5 py-0.2 flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" />
                                <span>SSL Active</span>
                              </span>
                            ) : (
                              <button
                                onClick={() => handleVerifyDns(t.id)}
                                disabled={isVerifyingDns === t.id}
                                className="badge-status-warning text-[10px] px-1.5 py-0.2 flex items-center gap-1 hover:brightness-110 cursor-pointer"
                                title="Click to verify CNAME DNS propagation"
                              >
                                {isVerifyingDns === t.id ? (
                                  <RefreshCw className="w-3 h-3 animate-spin" />
                                ) : (
                                  <Clock className="w-3 h-3" />
                                )}
                                <span>Verify DNS</span>
                              </button>
                            )}
                          </div>
                        ) : (
                          <span className="text-zinc-400 font-sans text-xs">Standard Subdomain</span>
                        )}
                      </td>

                      <td className="py-3 font-mono font-medium text-zinc-200">
                        ${t.mrr.toLocaleString('en-US')}
                      </td>

                      <td className="py-3 text-right">
                        <button
                          onClick={() => handleEnterWorkspace(t.slug)}
                          className="px-2.5 py-1 rounded bg-white/[0.06] hover:bg-white/[0.1] text-zinc-200 hover:text-white text-[11px] font-medium transition-colors inline-flex items-center gap-1"
                        >
                          <span>Support Access</span>
                          <ArrowUpRight className="w-3 h-3 opacity-70" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Platform Security & System Audit Logs */}
          <div className="p-5 rounded-2xl bg-[#0e1117] border border-white/[0.08]">
            <div className="flex items-center justify-between mb-3.5">
              <h2 className="text-sm font-semibold text-white tracking-tight flex items-center gap-2">
                <Terminal className="w-4 h-4 text-zinc-400" />
                <span>Platform Security & Provisioning Log</span>
              </h2>
              <span className="text-[11px] font-mono text-zinc-400">Append-Only Audit Stream</span>
            </div>

            <div className="space-y-2">
              {platformAuditLogs.map(log => (
                <div 
                  key={log.id} 
                  className="p-3 rounded-lg bg-[#090a0c] border border-white/[0.05] text-xs font-mono space-y-1"
                >
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-purple-300 font-semibold">{log.action}</span>
                    <span className="text-zinc-400">{log.timestamp}</span>
                  </div>
                  <div className="text-zinc-300 text-[11px] font-sans">
                    {log.details}
                  </div>
                  <div className="text-[10px] text-zinc-400">
                    Actor: {log.actor} {log.targetTenant && `• Target: ${log.targetTenant}`}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Col: Global Platform Feature Flags (§5.11) */}
        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-[#0e1117] border border-white/[0.08]">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-semibold text-white tracking-tight flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-zinc-400" />
                  <span>Platform Feature Flags</span>
                </h2>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Controlled rollouts across all gym tenants (§5.11).
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {featureFlags.map(flag => (
                <div 
                  key={flag.id} 
                  className="p-3.5 rounded-xl bg-[#090a0c] border border-white/[0.06] flex items-start justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-white">{flag.name}</span>
                      <span className="text-[10px] font-mono text-zinc-400">
                        {flag.rolloutPct}%
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-400 leading-relaxed">
                      {flag.description}
                    </p>
                    <code className="text-[10px] font-mono text-zinc-400 block pt-0.5">
                      {flag.key}
                    </code>
                  </div>

                  <button
                    onClick={() => toggleFeatureFlag(flag.id)}
                    className={`relative shrink-0 w-9 h-5 rounded-full transition-colors duration-200 ease-in-out focus:outline-none ${
                      flag.enabled ? 'bg-white' : 'bg-zinc-800 border border-white/[0.1]'
                    }`}
                  >
                    <span 
                      className={`inline-block w-3.5 h-3.5 rounded-full transform transition duration-200 ease-in-out mt-0.5 ml-0.5 ${
                        flag.enabled ? 'translate-x-4 bg-zinc-950' : 'translate-x-0 bg-zinc-400'
                      }`} 
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Architecture Isolation Spec Notice */}
          <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-500/20 text-xs space-y-2">
            <div className="font-semibold text-purple-300 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" />
              <span>Identity & Credential Isolation</span>
            </div>
            <p className="text-purple-200/80 text-[11px] leading-relaxed">
              In compliance with §4.2 & §5.9, Platform Admin credentials exist in an isolated namespace. They cannot be converted into gym memberships or leaked to tenant front-desk terminals.
            </p>
          </div>
        </div>
      </div>

      {/* Provision Tenant Modal */}
      {showProvisionModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#111317] border border-white/[0.1] rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div>
              <h3 className="text-sm font-semibold text-white">Provision New Gym Workspace</h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Creates an isolated multi-tenant organization database partition and edge DNS route.
              </p>
            </div>

            <form onSubmit={handleProvision} className="space-y-4">
              <div>
                <label className="block text-[11px] font-mono uppercase text-zinc-400 mb-1">
                  Gym / Organization Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Iron Forge Athletics"
                  value={newGymName}
                  onChange={e => {
                    setNewGymName(e.target.value);
                    if (!newSlug) {
                      setNewSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, ''));
                    }
                  }}
                  className="w-full bg-[#090a0c] border border-white/[0.08] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-white/30"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase text-zinc-400 mb-1">
                  Subdomain Slug
                </label>
                <div className="flex items-center bg-[#090a0c] border border-white/[0.08] rounded-lg px-3 py-2 text-xs focus-within:border-white/30">
                  <input
                    type="text"
                    required
                    placeholder="ironforge"
                    value={newSlug}
                    onChange={e => setNewSlug(e.target.value)}
                    className="w-full bg-transparent text-white focus:outline-none font-mono"
                  />
                  <span className="text-zinc-400 font-mono text-xs">.ironpulse.app</span>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase text-zinc-400 mb-1">
                  Custom Domain (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. ironforgegym.com"
                  value={newCustomDomain}
                  onChange={e => setNewCustomDomain(e.target.value)}
                  className="w-full bg-[#090a0c] border border-white/[0.08] rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-white/30"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase text-zinc-400 mb-1">
                  Subscription Tier
                </label>
                <select
                  value={newPlan}
                  onChange={e => setNewPlan(e.target.value as any)}
                  className="w-full bg-[#090a0c] border border-white/[0.08] rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
                >
                  <option value="STARTER">Starter ($149/mo - 1 location, 150 members)</option>
                  <option value="GROWTH">Growth ($299/mo - 1 location, 500 members)</option>
                  <option value="ENTERPRISE">Enterprise ($499/mo - Unlimited, Custom Domain)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowProvisionModal(false)}
                  className="px-3.5 py-2 rounded-lg bg-zinc-800 text-zinc-300 text-xs font-medium hover:bg-zinc-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-white text-zinc-950 text-xs font-semibold hover:bg-zinc-200 tactile-btn"
                >
                  Provision Tenant
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
