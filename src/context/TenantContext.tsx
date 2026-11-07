import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  Tenant, Coach, CRMLead, Appointment, Promotion, Member, GroupClass, CheckInLog,
  LeadStage, AppointmentStatus, MembershipTier,
  UserRole, PlatformTenantInfo, PlatformFeatureFlag, PlatformAuditLog,
  RetailProduct, RetailTransaction, ChurnRiskMember, GymEquipment,
  TrainerPayrollRecord, SalaryAdvance, BankTransferSlip, PTPackage, MembershipFreeze
} from '../types';
import { 
  INITIAL_TENANTS, INITIAL_COACHES, INITIAL_LEADS, INITIAL_APPOINTMENTS, 
  INITIAL_PROMOTIONS, INITIAL_MEMBERS, INITIAL_CLASSES, INITIAL_CHECKINS,
  INITIAL_PLATFORM_TENANTS, INITIAL_FEATURE_FLAGS, INITIAL_PLATFORM_AUDIT_LOGS,
  INITIAL_RETAIL_PRODUCTS, INITIAL_CHURN_RISKS, INITIAL_EQUIPMENT,
  INITIAL_TRAINER_PAYROLL, INITIAL_SALARY_ADVANCES, INITIAL_BANK_SLIPS,
  INITIAL_PT_PACKAGES, INITIAL_MEMBERSHIP_FREEZES
} from '../data/mockData';

interface TenantContextType {
  currentTenant: Tenant;
  allTenants: Tenant[];
  switchTenant: (slug: string) => void;
  updateTenantBranding: (updated: Partial<Tenant>) => void;
  createNewTenant: (tenantData: Omit<Tenant, 'id' | 'currentOccupancy' | 'mrr'>) => void;
  
  // Role & Permission Separation
  currentRole: UserRole;
  setRole: (role: UserRole) => void;

  // Platform Super-Admin Control Plane
  platformTenants: PlatformTenantInfo[];
  featureFlags: PlatformFeatureFlag[];
  toggleFeatureFlag: (flagId: string) => void;
  platformAuditLogs: PlatformAuditLog[];
  verifyCustomDomainDns: (tenantId: string) => void;
  provisionPlatformTenant: (data: { name: string; slug: string; customDomain?: string; plan: 'STARTER' | 'GROWTH' | 'ENTERPRISE' }) => void;

  // Scoped Data
  coaches: Coach[];
  leads: CRMLead[];
  appointments: Appointment[];
  promotions: Promotion[];
  members: Member[];
  classes: GroupClass[];
  checkInLogs: CheckInLog[];

  // Retail POS, Retention & Equipment Operations
  products: RetailProduct[];
  transactions: RetailTransaction[];
  churnRisks: ChurnRiskMember[];
  equipment: GymEquipment[];
  sellRetailCart: (items: { product: RetailProduct; quantity: number }[], paymentMethod: 'CARD' | 'CASH' | 'ACCOUNT_ON_FILE', memberName?: string) => void;
  dispatchRetentionAction: (riskId: string, actionNote: string) => void;
  updateEquipmentStatus: (equipmentId: string, status: 'OPERATIONAL' | 'NEEDS_SERVICE' | 'OUT_OF_ORDER', notes?: string) => void;

  // Mutations
  addLead: (lead: Omit<CRMLead, 'id' | 'tenantId' | 'createdAt' | 'lastContactedAt'>) => void;
  updateLeadStage: (leadId: string, newStage: LeadStage) => void;
  updateLeadNotes: (leadId: string, notes: string) => void;
  convertLeadToMember: (leadId: string, tier: MembershipTier, monthlyDuesCents: number) => Member;
  markLeadLost: (leadId: string, reason: string) => void;

  addAppointment: (appt: Omit<Appointment, 'id' | 'tenantId'>) => void;
  updateAppointmentStatus: (apptId: string, status: AppointmentStatus) => void;

  addPromotion: (promo: Omit<Promotion, 'id' | 'tenantId' | 'currentRedemptions'>) => void;
  togglePromotionActive: (promoId: string) => void;

  processCheckIn: (pinOrSearch: string, mode?: 'CHECK_IN' | 'CHECK_OUT') => { 
    success: boolean; 
    status: 'GRANTED' | 'WARNING_LOW_CREDITS' | 'DENIED_PAST_DUE' | 'NOT_FOUND'; 
    message: string; 
    member?: Member;
    classCheckedIn?: string;
  };
  settlePastDue: (memberId: string) => void;
  supervisorOverride: (memberId: string, reason: string) => void;
  refillPunchPass: (memberId: string, passCount: number) => void;

  // Sri Lanka-First Specialized Operations
  payrollRecords: TrainerPayrollRecord[];
  salaryAdvances: SalaryAdvance[];
  bankSlips: BankTransferSlip[];
  ptPackages: PTPackage[];
  membershipFreezes: MembershipFreeze[];

  addSalaryAdvance: (data: { coachId: string; coachName: string; amountLKR: number; reason: string }) => void;
  approvePayrollRecord: (payrollId: string) => void;
  disbursePayrollRecord: (payrollId: string, paymentMethod: 'COMMERCIAL_BANK_TRANSFER' | 'SAMPATH_VISHWA' | 'CASH_ENVELOPE', refNo: string) => void;

  approveBankSlip: (slipId: string) => void;
  rejectBankSlip: (slipId: string, reason: string) => void;
  submitBankSlip: (slipData: Omit<BankTransferSlip, 'id' | 'tenantId' | 'submittedAt' | 'status'>) => void;

  punchPTSession: (packageId: string, focus: string, coachNotes: string, punchedBy: string) => void;
  enrollPTPackage: (data: { memberId: string; memberName: string; memberPhone: string; assignedCoachId: string; assignedCoachName: string; packageName: string; totalSessions: number; priceLKR: number; costPerSessionLKR: number; coachCommissionPerSessionLKR: number; durationDays?: number }) => void;

  applyMembershipFreeze: (data: { memberId: string; reason: MembershipFreeze['reason']; days: number; notes?: string }) => void;
  resumeMembershipEarly: (freezeId: string) => void;

  // WhatsApp Global Dispatcher State
  whatsAppModal: { isOpen: boolean; phone: string; memberName: string; initialMessage: string };
  openWhatsAppModal: (phone: string, memberName: string, initialMessage?: string) => void;
  closeWhatsAppModal: () => void;
  
  // Public Portal Preview Mode Toggle
  viewMode: 'ADMIN_WORKSPACE' | 'PUBLIC_MEMBER_PORTAL';
  setViewMode: (mode: 'ADMIN_WORKSPACE' | 'PUBLIC_MEMBER_PORTAL') => void;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export const TenantProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tenants, setTenants] = useState<Tenant[]>(INITIAL_TENANTS);
  const [currentTenantSlug, setCurrentTenantSlug] = useState<string>('titan');
  const [viewMode, setViewMode] = useState<'ADMIN_WORKSPACE' | 'PUBLIC_MEMBER_PORTAL'>('ADMIN_WORKSPACE');
  const [currentRole, setCurrentRole] = useState<UserRole>('GYM_OWNER');

  // Separated Platform Admin Control Plane State
  const [platformTenants, setPlatformTenants] = useState<PlatformTenantInfo[]>(INITIAL_PLATFORM_TENANTS);
  const [featureFlags, setFeatureFlags] = useState<PlatformFeatureFlag[]>(INITIAL_FEATURE_FLAGS);
  const [platformAuditLogs, setPlatformAuditLogs] = useState<PlatformAuditLog[]>(INITIAL_PLATFORM_AUDIT_LOGS);

  const [allLeads, setAllLeads] = useState<CRMLead[]>(INITIAL_LEADS);
  const [allAppointments, setAllAppointments] = useState<Appointment[]>(INITIAL_APPOINTMENTS);
  const [allPromotions, setAllPromotions] = useState<Promotion[]>(INITIAL_PROMOTIONS);
  const [allMembers, setAllMembers] = useState<Member[]>(INITIAL_MEMBERS);
  const [allCheckIns, setAllCheckIns] = useState<CheckInLog[]>(INITIAL_CHECKINS);

  // Retail, Churn & Equipment State
  const [allProducts, setAllProducts] = useState<RetailProduct[]>(INITIAL_RETAIL_PRODUCTS);
  const [allTransactions, setAllTransactions] = useState<RetailTransaction[]>([]);
  const [allChurnRisks, setAllChurnRisks] = useState<ChurnRiskMember[]>(INITIAL_CHURN_RISKS);
  const [allEquipment, setAllEquipment] = useState<GymEquipment[]>(INITIAL_EQUIPMENT);

  // Sri Lanka-First Specialized State
  const [allPayrollRecords, setAllPayrollRecords] = useState<TrainerPayrollRecord[]>(INITIAL_TRAINER_PAYROLL);
  const [allSalaryAdvances, setAllSalaryAdvances] = useState<SalaryAdvance[]>(INITIAL_SALARY_ADVANCES);
  const [allBankSlips, setAllBankSlips] = useState<BankTransferSlip[]>(INITIAL_BANK_SLIPS);
  const [allPTPackages, setAllPTPackages] = useState<PTPackage[]>(INITIAL_PT_PACKAGES);
  const [allMembershipFreezes, setAllMembershipFreezes] = useState<MembershipFreeze[]>(INITIAL_MEMBERSHIP_FREEZES);

  // Global WhatsApp Dispatcher State
  const [whatsAppModal, setWhatsAppModal] = useState<{
    isOpen: boolean;
    phone: string;
    memberName: string;
    initialMessage: string;
  }>({
    isOpen: false,
    phone: '',
    memberName: '',
    initialMessage: '',
  });

  const openWhatsAppModal = (phone: string, memberName: string, initialMessage = '') => {
    setWhatsAppModal({
      isOpen: true,
      phone,
      memberName,
      initialMessage,
    });
  };

  const closeWhatsAppModal = () => {
    setWhatsAppModal(prev => ({ ...prev, isOpen: false }));
  };

  const setRole = (role: UserRole) => {
    setCurrentRole(role);
    if (role === 'MEMBER_PORTAL') {
      setViewMode('PUBLIC_MEMBER_PORTAL');
    } else {
      setViewMode('ADMIN_WORKSPACE');
    }
  };

  const toggleFeatureFlag = (flagId: string) => {
    setFeatureFlags(prev => prev.map(f => {
      if (f.id === flagId) {
        const nextState = !f.enabled;
        const log: PlatformAuditLog = {
          id: `audit-${Date.now()}`,
          timestamp: new Date().toISOString().substring(11, 19) + ' UTC',
          actor: 'platform.ops@ironpulse.app',
          action: 'FEATURE_FLAG_TOGGLED',
          details: `Flag "${f.name}" was ${nextState ? 'ENABLED' : 'DISABLED'} platform-wide.`,
        };
        setPlatformAuditLogs(logs => [log, ...logs]);
        return { ...f, enabled: nextState };
      }
      return f;
    }));
  };

  const verifyCustomDomainDns = (tenantId: string) => {
    setPlatformTenants(prev => prev.map(t => {
      if (t.id === tenantId) {
        const log: PlatformAuditLog = {
          id: `audit-${Date.now()}`,
          timestamp: new Date().toISOString().substring(11, 19) + ' UTC',
          actor: 'platform.security@ironpulse.app',
          action: 'DNS_CHALLENGE_VERIFIED',
          targetTenant: t.name,
          details: `Custom domain ${t.customDomain || t.subdomain} CNAME verified with edge SSL active.`,
        };
        setPlatformAuditLogs(logs => [log, ...logs]);
        return { ...t, customDomainStatus: 'VERIFIED' };
      }
      return t;
    }));
  };

  const provisionPlatformTenant = (data: { name: string; slug: string; customDomain?: string; plan: 'STARTER' | 'GROWTH' | 'ENTERPRISE' }) => {
    const newId = `tenant-${data.slug}-${Date.now().toString().slice(-4)}`;
    const newPlatformTenant: PlatformTenantInfo = {
      id: newId,
      name: data.name,
      slug: data.slug,
      subdomain: `${data.slug}.ironpulse.app`,
      customDomain: data.customDomain,
      customDomainStatus: data.customDomain ? 'PENDING_DNS' : 'NONE',
      plan: data.plan,
      mrr: data.plan === 'ENTERPRISE' ? 28450 : data.plan === 'GROWTH' ? 14800 : 7900,
      memberCount: 1,
      healthStatus: 'HEALTHY',
      createdAt: new Date().toISOString().substring(0, 10),
    };
    setPlatformTenants(prev => [...prev, newPlatformTenant]);

    // Also register in workspace tenants
    const newTenant: Tenant = {
      id: newId,
      slug: data.slug,
      subdomain: `${data.slug}.ironpulse.app`,
      name: data.name,
      tagline: 'High-performance training and dedicated coaching.',
      primaryColor: '#f4f5f6',
      secondaryColor: '#9aa0a6',
      address: '100 Fitness Way',
      phone: '+1 (555) 019-2831',
      email: `contact@${data.slug}.com`,
      fireCodeMaxCapacity: 100,
      currentOccupancy: 0,
      customDomain: data.customDomain,
      currency: 'USD',
      mrr: newPlatformTenant.mrr,
    };
    setTenants(prev => [...prev, newTenant]);

    const log: PlatformAuditLog = {
      id: `audit-${Date.now()}`,
      timestamp: new Date().toISOString().substring(11, 19) + ' UTC',
      actor: 'platform.provisioning@ironpulse.app',
      action: 'TENANT_PROVISIONED',
      targetTenant: data.name,
      details: `New gym workspace provisioned on ${data.plan} tier with subdomain ${data.slug}.ironpulse.app.`,
    };
    setPlatformAuditLogs(logs => [log, ...logs]);
  };

  // Detect subdomain from URL if available
  useEffect(() => {
    const host = window.location.hostname;
    const parts = host.split('.');
    if (parts.length > 2 && parts[0] !== 'www' && parts[0] !== 'localhost') {
      const match = tenants.find(t => t.slug === parts[0]);
      if (match) {
        setCurrentTenantSlug(match.slug);
      }
    }
  }, [tenants]);

  const currentTenant = tenants.find(t => t.slug === currentTenantSlug) || tenants[0];

  const switchTenant = (slug: string) => {
    setCurrentTenantSlug(slug);
  };

  const updateTenantBranding = (updated: Partial<Tenant>) => {
    setTenants(prev => prev.map(t => t.id === currentTenant.id ? { ...t, ...updated } : t));
  };

  const createNewTenant = (tenantData: Omit<Tenant, 'id' | 'currentOccupancy' | 'mrr'>) => {
    const newId = `tenant-${tenantData.slug}-${Date.now().toString().slice(-4)}`;
    const newTenant: Tenant = {
      ...tenantData,
      id: newId,
      currentOccupancy: 0,
      mrr: 0,
    };
    setTenants(prev => [...prev, newTenant]);
    setCurrentTenantSlug(newTenant.slug);
  };

  // Scoped views for active tenant
  const coaches = INITIAL_COACHES.filter(c => c.tenantId === currentTenant.id);
  const leads = allLeads.filter(l => l.tenantId === currentTenant.id);
  const appointments = allAppointments.filter(a => a.tenantId === currentTenant.id);
  const promotions = allPromotions.filter(p => p.tenantId === currentTenant.id);
  const members = allMembers.filter(m => m.tenantId === currentTenant.id);
  const classes = INITIAL_CLASSES.filter(c => c.tenantId === currentTenant.id);
  const checkInLogs = allCheckIns.filter(c => c.tenantId === currentTenant.id);

  const products = allProducts.filter(p => p.tenantId === currentTenant.id);
  const transactions = allTransactions.filter(t => t.tenantId === currentTenant.id);
  const churnRisks = allChurnRisks.filter(r => r.tenantId === currentTenant.id);
  const equipment = allEquipment.filter(e => e.tenantId === currentTenant.id);

  // Scoped Sri Lankan Records (gracefully fallback so data is always accessible across tenants)
  const payrollRecords = allPayrollRecords.filter(p => p.tenantId === currentTenant.id || p.tenantId === 'tenant-colombo-01');
  const salaryAdvances = allSalaryAdvances.filter(a => a.tenantId === currentTenant.id || a.tenantId === 'tenant-colombo-01');
  const bankSlips = allBankSlips.filter(s => s.tenantId === currentTenant.id || s.tenantId === 'tenant-colombo-01');
  const ptPackages = allPTPackages.filter(p => p.tenantId === currentTenant.id || p.tenantId === 'tenant-colombo-01');
  const membershipFreezes = allMembershipFreezes.filter(f => f.tenantId === currentTenant.id || f.tenantId === 'tenant-colombo-01');

  // Sri Lanka Mutations: Payroll
  const addSalaryAdvance = (data: { coachId: string; coachName: string; amountLKR: number; reason: string }) => {
    const newAdv: SalaryAdvance = {
      id: `adv-${Date.now()}`,
      tenantId: currentTenant.id,
      coachId: data.coachId,
      coachName: data.coachName,
      amountLKR: data.amountLKR,
      date: new Date().toISOString().substring(0, 10),
      reason: data.reason,
      approvedBy: 'Gym Owner',
      isDeducted: true,
    };
    setAllSalaryAdvances(prev => [newAdv, ...prev]);
    setAllPayrollRecords(prev => prev.map(rec => {
      if (rec.coachId === data.coachId) {
        const newDeducted = rec.salaryAdvancesDeductedLKR + data.amountLKR;
        const gross = rec.baseSalaryLKR + rec.ptTotalCommissionLKR + (rec.groupClassesTaught * rec.groupClassRateLKR);
        const newNet = gross - newDeducted - rec.epfDeductionLKR;
        return {
          ...rec,
          salaryAdvancesDeductedLKR: newDeducted,
          netPayableLKR: Math.max(0, newNet),
        };
      }
      return rec;
    }));
  };

  const approvePayrollRecord = (payrollId: string) => {
    setAllPayrollRecords(prev => prev.map(p => p.id === payrollId ? { ...p, status: 'APPROVED' } : p));
  };

  const disbursePayrollRecord = (payrollId: string, paymentMethod: 'COMMERCIAL_BANK_TRANSFER' | 'SAMPATH_VISHWA' | 'CASH_ENVELOPE', refNo: string) => {
    setAllPayrollRecords(prev => prev.map(p => p.id === payrollId ? {
      ...p,
      status: 'DISBURSED',
      paymentMethod,
      referenceNo: refNo,
      disbursedDate: new Date().toISOString().substring(0, 10),
    } : p));
  };

  // Sri Lanka Mutations: Bank Slips
  const approveBankSlip = (slipId: string) => {
    setAllBankSlips(prev => prev.map(slip => {
      if (slip.id === slipId) {
        setAllMembers(members => members.map(m => {
          if (m.id === slip.memberId || m.phone === slip.memberPhone) {
            const currentExpiry = new Date(m.renewalDate || new Date());
            currentExpiry.setMonth(currentExpiry.getMonth() + slip.durationMonths);
            return {
              ...m,
              status: 'ACTIVE',
              renewalDate: currentExpiry.toISOString().substring(0, 10),
              membershipTier: slip.membershipTierToActivate,
            };
          }
          return m;
        }));
        return {
          ...slip,
          status: 'APPROVED',
          reviewedBy: 'Gym Owner',
          reviewedAt: new Date().toISOString().substring(0, 16).replace('T', ' '),
        };
      }
      return slip;
    }));
  };

  const rejectBankSlip = (slipId: string, reason: string) => {
    setAllBankSlips(prev => prev.map(slip => slip.id === slipId ? {
      ...slip,
      status: 'REJECTED',
      rejectionReason: reason,
      reviewedBy: 'Gym Owner',
      reviewedAt: new Date().toISOString().substring(0, 16).replace('T', ' '),
    } : slip));
  };

  const submitBankSlip = (slipData: Omit<BankTransferSlip, 'id' | 'tenantId' | 'submittedAt' | 'status'>) => {
    const newSlip: BankTransferSlip = {
      ...slipData,
      id: `slip-${Date.now()}`,
      tenantId: currentTenant.id,
      submittedAt: 'Just now',
      status: 'PENDING_VERIFICATION',
    };
    setAllBankSlips(prev => [newSlip, ...prev]);
  };

  // Sri Lanka Mutations: PT Punch
  const punchPTSession = (packageId: string, focus: string, coachNotes: string, punchedBy: string) => {
    setAllPTPackages(prev => prev.map(pkg => {
      if (pkg.id === packageId && pkg.remainingSessions > 0) {
        const nextRemaining = pkg.remainingSessions - 1;
        const nextCompleted = pkg.completedSessions + 1;
        const punchRecord = {
          id: `punch-${Date.now()}`,
          date: new Date().toISOString().substring(0, 10),
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          workoutFocus: focus || 'General Strength & Conditioning',
          coachNotes: coachNotes || 'Session completed.',
          punchedBy: punchedBy || pkg.assignedCoachName,
        };

        // Credit trainer commission
        setAllPayrollRecords(payrolls => payrolls.map(pr => {
          if (pr.coachId === pkg.assignedCoachId) {
            const newSessionsCount = pr.ptSessionsCompleted + 1;
            const newPtCommission = newSessionsCount * pr.ptCommissionRateLKR;
            const gross = pr.baseSalaryLKR + newPtCommission + (pr.groupClassesTaught * pr.groupClassRateLKR);
            const newNet = gross - pr.salaryAdvancesDeductedLKR - pr.epfDeductionLKR;
            return {
              ...pr,
              ptSessionsCompleted: newSessionsCount,
              ptTotalCommissionLKR: newPtCommission,
              netPayableLKR: Math.max(0, newNet),
            };
          }
          return pr;
        }));

        return {
          ...pkg,
          completedSessions: nextCompleted,
          remainingSessions: nextRemaining,
          status: nextRemaining === 0 ? 'DEPLETED' : nextRemaining <= 2 ? 'LOW_BALANCE' : 'ACTIVE',
          sessionPunches: [punchRecord, ...pkg.sessionPunches],
        };
      }
      return pkg;
    }));
  };

  const enrollPTPackage = (data: {
    memberId: string;
    memberName: string;
    memberPhone: string;
    assignedCoachId: string;
    assignedCoachName: string;
    packageName: string;
    totalSessions: number;
    priceLKR: number;
    costPerSessionLKR: number;
    coachCommissionPerSessionLKR: number;
    durationDays?: number;
  }) => {
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + (data.durationDays || 45));
    const newPkg: PTPackage = {
      id: `pt-pack-${Date.now()}`,
      tenantId: currentTenant.id,
      memberId: data.memberId,
      memberName: data.memberName,
      memberPhone: data.memberPhone,
      assignedCoachId: data.assignedCoachId,
      assignedCoachName: data.assignedCoachName,
      packageName: data.packageName,
      totalSessions: data.totalSessions,
      completedSessions: 0,
      remainingSessions: data.totalSessions,
      priceLKR: data.priceLKR,
      costPerSessionLKR: data.costPerSessionLKR,
      coachCommissionPerSessionLKR: data.coachCommissionPerSessionLKR,
      purchasedDate: new Date().toISOString().substring(0, 10),
      expiryDate: expiry.toISOString().substring(0, 10),
      status: 'ACTIVE',
      sessionPunches: [],
    };
    setAllPTPackages(prev => [newPkg, ...prev]);
  };

  // Sri Lanka Mutations: Membership Freezes
  const applyMembershipFreeze = (data: { memberId: string; reason: MembershipFreeze['reason']; days: number; notes?: string }) => {
    const targetMember = allMembers.find(m => m.id === data.memberId);
    const memberName = targetMember ? targetMember.fullName : 'Member';
    const memberTier = targetMember ? targetMember.membershipTier : 'GOLD_UNLIMITED';
    
    const start = new Date();
    const resume = new Date();
    resume.setDate(start.getDate() + data.days);

    const oldExpiry = targetMember?.renewalDate || new Date().toISOString().substring(0, 10);
    const newExpDate = new Date(oldExpiry);
    newExpDate.setDate(newExpDate.getDate() + data.days);
    const newExpiryStr = newExpDate.toISOString().substring(0, 10);

    const newFreeze: MembershipFreeze = {
      id: `frz-${Date.now()}`,
      tenantId: currentTenant.id,
      memberId: data.memberId,
      memberName,
      membershipTier: memberTier,
      startDate: start.toISOString().substring(0, 10),
      scheduledResumeDate: resume.toISOString().substring(0, 10),
      daysFrozen: data.days,
      reason: data.reason,
      status: 'ACTIVE_FREEZE',
      approvedBy: 'Gym Owner',
      notes: data.notes,
      oldExpiryDate: oldExpiry,
      newExpiryDate: newExpiryStr,
    };

    setAllMembershipFreezes(prev => [newFreeze, ...prev]);

    setAllMembers(prev => prev.map(m => m.id === data.memberId ? {
      ...m,
      status: 'FROZEN',
      renewalDate: newExpiryStr,
    } : m));
  };

  const resumeMembershipEarly = (freezeId: string) => {
    setAllMembershipFreezes(prev => prev.map(frz => {
      if (frz.id === freezeId && frz.status === 'ACTIVE_FREEZE') {
        const todayStr = new Date().toISOString().substring(0, 10);
        setAllMembers(members => members.map(m => m.id === frz.memberId ? { ...m, status: 'ACTIVE' } : m));
        return {
          ...frz,
          status: 'RESUMED',
          actualResumeDate: todayStr,
        };
      }
      return frz;
    }));
  };

  const sellRetailCart = (
    items: { product: RetailProduct; quantity: number }[],
    paymentMethod: 'CARD' | 'CASH' | 'ACCOUNT_ON_FILE',
    memberName?: string
  ) => {
    const totalCents = items.reduce((sum, item) => sum + item.product.priceCents * item.quantity, 0);
    const newTx: RetailTransaction = {
      id: `tx-${Date.now()}`,
      tenantId: currentTenant.id,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      items: items.map(i => ({ productName: i.product.name, quantity: i.quantity, priceCents: i.product.priceCents })),
      totalCents,
      paymentMethod,
      memberName,
    };
    setAllTransactions(prev => [newTx, ...prev]);

    // Reduce inventory count
    setAllProducts(prev => prev.map(p => {
      const match = items.find(i => i.product.id === p.id);
      if (match) {
        return { ...p, stockCount: Math.max(0, p.stockCount - match.quantity) };
      }
      return p;
    }));
  };

  const dispatchRetentionAction = (riskId: string, actionNote: string) => {
    setAllChurnRisks(prev => prev.map(r => {
      if (r.id === riskId) {
        return {
          ...r,
          riskScorePct: Math.max(10, r.riskScorePct - 30),
          suggestedAction: `Dispatched: ${actionNote} (Outreach logged)`,
        };
      }
      return r;
    }));
  };

  const updateEquipmentStatus = (
    equipmentId: string,
    status: 'OPERATIONAL' | 'NEEDS_SERVICE' | 'OUT_OF_ORDER',
    notes?: string
  ) => {
    setAllEquipment(prev => prev.map(e => {
      if (e.id === equipmentId) {
        return {
          ...e,
          status,
          notes: notes ? `${notes} · Updated on ${new Date().toISOString().split('T')[0]}` : e.notes,
          lastServiceDate: status === 'OPERATIONAL' ? new Date().toISOString().split('T')[0] : e.lastServiceDate,
        };
      }
      return e;
    }));
  };

  // CRM mutations
  const addLead = (lead: Omit<CRMLead, 'id' | 'tenantId' | 'createdAt' | 'lastContactedAt'>) => {
    const now = new Date().toISOString();
    const newLead: CRMLead = {
      ...lead,
      id: `lead-${Date.now()}`,
      tenantId: currentTenant.id,
      createdAt: now,
      lastContactedAt: now,
    };
    setAllLeads(prev => [newLead, ...prev]);
  };

  const updateLeadStage = (leadId: string, newStage: LeadStage) => {
    setAllLeads(prev => prev.map(l => l.id === leadId ? { ...l, stage: newStage, lastContactedAt: new Date().toISOString() } : l));
  };

  const updateLeadNotes = (leadId: string, notes: string) => {
    setAllLeads(prev => prev.map(l => l.id === leadId ? { ...l, notes, lastContactedAt: new Date().toISOString() } : l));
  };

  const convertLeadToMember = (leadId: string, tier: MembershipTier, monthlyDuesCents: number): Member => {
    const lead = allLeads.find(l => l.id === leadId);
    const now = new Date();
    const renewalDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const generatedPin = String(Math.floor(100000 + Math.random() * 900000));

    const newMember: Member = {
      id: `mem-${Date.now().toString().slice(-4)}`,
      tenantId: currentTenant.id,
      fullName: lead ? lead.fullName : 'New Member',
      email: lead ? lead.email : `member${generatedPin}@gym.com`,
      phone: lead ? lead.phone : '+1 (512) 555-0100',
      membershipTier: tier,
      status: 'ACTIVE',
      remainingCredits: tier === 'PUNCH_CARD_10' ? 10 : undefined,
      joinedDate: now.toISOString().split('T')[0],
      renewalDate,
      barcodePin: generatedPin,
      emergencyContact: 'Self on File',
      isInsideFacility: false,
    };

    // Update lead status
    setAllLeads(prev => prev.map(l => l.id === leadId ? { ...l, stage: 'WON_MEMBER', lastContactedAt: now.toISOString() } : l));
    // Add to members list
    setAllMembers(prev => [newMember, ...prev]);
    // Increment MRR
    setTenants(prev => prev.map(t => t.id === currentTenant.id ? { ...t, mrr: t.mrr + Math.round(monthlyDuesCents / 100) } : t));

    return newMember;
  };

  const markLeadLost = (leadId: string, reason: string) => {
    setAllLeads(prev => prev.map(l => l.id === leadId ? { 
      ...l, 
      stage: 'LOST', 
      lossReason: reason,
      lastContactedAt: new Date().toISOString() 
    } : l));
  };

  // Appointment mutations
  const addAppointment = (appt: Omit<Appointment, 'id' | 'tenantId'>) => {
    const newAppt: Appointment = {
      ...appt,
      id: `appt-${Date.now()}`,
      tenantId: currentTenant.id,
    };
    setAllAppointments(prev => [newAppt, ...prev]);
  };

  const updateAppointmentStatus = (apptId: string, status: AppointmentStatus) => {
    setAllAppointments(prev => prev.map(a => a.id === apptId ? { ...a, status } : a));
  };

  // Promotion mutations
  const addPromotion = (promo: Omit<Promotion, 'id' | 'tenantId' | 'currentRedemptions'>) => {
    const newPromo: Promotion = {
      ...promo,
      id: `promo-${Date.now()}`,
      tenantId: currentTenant.id,
      currentRedemptions: 0,
    };
    setAllPromotions(prev => [newPromo, ...prev]);
  };

  const togglePromotionActive = (promoId: string) => {
    setAllPromotions(prev => prev.map(p => p.id === promoId ? { ...p, isActive: !p.isActive } : p));
  };

  // Remediation actions for check-in
  const settlePastDue = (memberId: string) => {
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' Today';
    const renewalDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    setAllMembers(prev => prev.map(m => m.id === memberId ? {
      ...m,
      status: 'ACTIVE',
      renewalDate,
      isInsideFacility: true,
      lastCheckIn: new Date().toISOString(),
    } : m));

    setTenants(prev => prev.map(t => t.id === currentTenant.id ? {
      ...t,
      currentOccupancy: Math.min(t.fireCodeMaxCapacity, t.currentOccupancy + 1),
      mrr: t.mrr + 199,
    } : t));

    const member = members.find(m => m.id === memberId);
    if (member) {
      const log: CheckInLog = {
        id: `chk-${Date.now()}`,
        tenantId: currentTenant.id,
        memberId: member.id,
        memberName: member.fullName,
        tier: member.membershipTier,
        timestamp: nowTime,
        status: 'GRANTED',
        message: 'Account Settled ($199) & Access Granted (Supervisor Payment Override)',
      };
      setAllCheckIns(prev => [log, ...prev]);
    }
  };

  const supervisorOverride = (memberId: string, reason: string) => {
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' Today';
    setAllMembers(prev => prev.map(m => m.id === memberId ? {
      ...m,
      isInsideFacility: true,
      lastCheckIn: new Date().toISOString(),
    } : m));

    setTenants(prev => prev.map(t => t.id === currentTenant.id ? {
      ...t,
      currentOccupancy: Math.min(t.fireCodeMaxCapacity, t.currentOccupancy + 1),
    } : t));

    const member = members.find(m => m.id === memberId);
    if (member) {
      const log: CheckInLog = {
        id: `chk-${Date.now()}`,
        tenantId: currentTenant.id,
        memberId: member.id,
        memberName: member.fullName,
        tier: member.membershipTier,
        timestamp: nowTime,
        status: 'WARNING_LOW_CREDITS',
        message: `Supervisor Entry Courtesy Granted (${reason}). Account remains flagged.`,
      };
      setAllCheckIns(prev => [log, ...prev]);
    }
  };

  const refillPunchPass = (memberId: string, passCount: number) => {
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' Today';
    const member = members.find(m => m.id === memberId);
    if (!member) return;

    const newCredits = (member.remainingCredits ?? 0) + passCount - 1; // refill and deduct 1 for today

    setAllMembers(prev => prev.map(m => m.id === memberId ? {
      ...m,
      remainingCredits: newCredits,
      isInsideFacility: true,
      lastCheckIn: new Date().toISOString(),
    } : m));

    setTenants(prev => prev.map(t => t.id === currentTenant.id ? {
      ...t,
      currentOccupancy: Math.min(t.fireCodeMaxCapacity, t.currentOccupancy + 1),
    } : t));

    const log: CheckInLog = {
      id: `chk-${Date.now()}`,
      tenantId: currentTenant.id,
      memberId: member.id,
      memberName: member.fullName,
      tier: member.membershipTier,
      timestamp: nowTime,
      status: 'GRANTED',
      message: `Refill Purchased (${passCount} passes). 1 deducted for visit. ${newCredits} remaining.`,
    };
    setAllCheckIns(prev => [log, ...prev]);
  };

  // Check-In Kiosk Processing
  const processCheckIn = (pinOrSearch: string, mode: 'CHECK_IN' | 'CHECK_OUT' = 'CHECK_IN') => {
    const term = pinOrSearch.trim().toLowerCase();
    const member = members.find(m => 
      m.barcodePin === term || 
      m.phone.includes(term) || 
      m.fullName.toLowerCase().includes(term) || 
      m.email.toLowerCase().includes(term)
    );

    if (!member) {
      return {
        success: false,
        status: 'NOT_FOUND' as const,
        message: `No member record matches "${pinOrSearch}". Check spelling or verify active pass.`,
      };
    }

    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' Today';

    // Handle Check-Out Mode
    if (mode === 'CHECK_OUT') {
      setAllMembers(prev => prev.map(m => m.id === member.id ? { ...m, isInsideFacility: false } : m));
      setTenants(prev => prev.map(t => t.id === currentTenant.id ? { 
        ...t, 
        currentOccupancy: Math.max(0, t.currentOccupancy - 1) 
      } : t));

      const log: CheckInLog = {
        id: `chk-${Date.now()}`,
        tenantId: currentTenant.id,
        memberId: member.id,
        memberName: member.fullName,
        tier: member.membershipTier,
        timestamp: nowTime,
        status: 'GRANTED',
        message: 'Member Exit Recorded - Turnstile Released',
      };
      setAllCheckIns(prev => [log, ...prev]);

      return {
        success: true,
        status: 'GRANTED' as const,
        message: `Goodbye, ${member.fullName}! Exit recorded. Have a great recovery!`,
        member: { ...member, isInsideFacility: false },
      };
    }

    // Auto-resolve upcoming class attendance
    let classNote = '';
    const upcomingClass = classes.find(c => c.bookedCount < c.capacity);
    if (upcomingClass) {
      classNote = `Auto-checked in to ${upcomingClass.startTime} ${upcomingClass.name}`;
    }

    // Rule 1: Past Due payment
    if (member.status === 'PAST_DUE') {
      const log: CheckInLog = {
        id: `chk-${Date.now()}`,
        tenantId: currentTenant.id,
        memberId: member.id,
        memberName: member.fullName,
        tier: member.membershipTier,
        timestamp: nowTime,
        status: 'DENIED_PAST_DUE',
        message: 'Access Denied: Past Due Account Balance. Direct to Front Desk Cashier.',
      };
      setAllCheckIns(prev => [log, ...prev]);
      return {
        success: false,
        status: 'DENIED_PAST_DUE' as const,
        message: `Account is Past Due. Billing renewal was required on ${member.renewalDate}.`,
        member,
      };
    }

    // Rule 2: Low or Zero Credits on Punch Card
    if (member.membershipTier === 'PUNCH_CARD_10') {
      const credits = member.remainingCredits ?? 0;
      if (credits <= 0) {
        const log: CheckInLog = {
          id: `chk-${Date.now()}`,
          tenantId: currentTenant.id,
          memberId: member.id,
          memberName: member.fullName,
          tier: member.membershipTier,
          timestamp: nowTime,
          status: 'DENIED_PAST_DUE',
          message: 'Access Denied: 0 Punch Card Passes Remaining. Refill required.',
        };
        setAllCheckIns(prev => [log, ...prev]);
        return {
          success: false,
          status: 'DENIED_PAST_DUE' as const,
          message: 'Zero punch passes remaining. Purchase a refill card to enter.',
          member,
        };
      }

      // Deduct 1 pass
      const newCredits = credits - 1;
      setAllMembers(prev => prev.map(m => m.id === member.id ? { 
        ...m, 
        remainingCredits: newCredits,
        lastCheckIn: new Date().toISOString(),
        isInsideFacility: true 
      } : m));

      // Increment occupancy
      setTenants(prev => prev.map(t => t.id === currentTenant.id ? { 
        ...t, 
        currentOccupancy: Math.min(t.fireCodeMaxCapacity, t.currentOccupancy + 1) 
      } : t));

      const logStatus: 'GRANTED' | 'WARNING_LOW_CREDITS' = newCredits <= 1 ? 'WARNING_LOW_CREDITS' : 'GRANTED';
      const logMsg = newCredits <= 1 
        ? `Access Granted (Low Balance: ${newCredits} pass remaining). Reminder given.` 
        : `Access Granted. ${newCredits} punch passes remaining.`;

      const log: CheckInLog = {
        id: `chk-${Date.now()}`,
        tenantId: currentTenant.id,
        memberId: member.id,
        memberName: member.fullName,
        tier: member.membershipTier,
        timestamp: nowTime,
        status: logStatus,
        message: logMsg,
      };
      setAllCheckIns(prev => [log, ...prev]);

      return {
        success: true,
        status: logStatus,
        message: `${logMsg}${classNote ? ` • ${classNote}` : ''}`,
        member: { ...member, remainingCredits: newCredits },
        classCheckedIn: classNote || undefined,
      };
    }

    // Rule 3: Active Member Granted
    setAllMembers(prev => prev.map(m => m.id === member.id ? { 
      ...m, 
      lastCheckIn: new Date().toISOString(),
      isInsideFacility: true 
    } : m));

    setTenants(prev => prev.map(t => t.id === currentTenant.id ? { 
      ...t, 
      currentOccupancy: Math.min(t.fireCodeMaxCapacity, t.currentOccupancy + 1) 
    } : t));

    const finalMsg = `Access Granted - ${member.membershipTier.replace(/_/g, ' ')}${classNote ? ` • ${classNote}` : ''}`;

    const log: CheckInLog = {
      id: `chk-${Date.now()}`,
      tenantId: currentTenant.id,
      memberId: member.id,
      memberName: member.fullName,
      tier: member.membershipTier,
      timestamp: nowTime,
      status: 'GRANTED',
      message: finalMsg,
    };
    setAllCheckIns(prev => [log, ...prev]);

    return {
      success: true,
      status: 'GRANTED' as const,
      message: finalMsg,
      member,
      classCheckedIn: classNote || undefined,
    };
  };

  return (
    <TenantContext.Provider value={{
      currentTenant,
      allTenants: tenants,
      switchTenant,
      updateTenantBranding,
      createNewTenant,
      coaches,
      leads,
      appointments,
      promotions,
      members,
      classes,
      checkInLogs,
      products,
      transactions,
      churnRisks,
      equipment,
      sellRetailCart,
      dispatchRetentionAction,
      updateEquipmentStatus,
      // Sri Lanka-First Operations
      payrollRecords,
      salaryAdvances,
      bankSlips,
      ptPackages,
      membershipFreezes,
      addSalaryAdvance,
      approvePayrollRecord,
      disbursePayrollRecord,
      approveBankSlip,
      rejectBankSlip,
      submitBankSlip,
      punchPTSession,
      enrollPTPackage,
      applyMembershipFreeze,
      resumeMembershipEarly,
      whatsAppModal,
      openWhatsAppModal,
      closeWhatsAppModal,
      addLead,
      updateLeadStage,
      updateLeadNotes,
      convertLeadToMember,
      markLeadLost,
      addAppointment,
      updateAppointmentStatus,
      addPromotion,
      togglePromotionActive,
      processCheckIn,
      settlePastDue,
      supervisorOverride,
      refillPunchPass,
      viewMode,
      setViewMode,
      currentRole,
      setRole,
      platformTenants,
      featureFlags,
      toggleFeatureFlag,
      platformAuditLogs,
      verifyCustomDomainDns,
      provisionPlatformTenant,
    }}>
      {children}
    </TenantContext.Provider>
  );
};

export const useTenant = () => {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context;
};
