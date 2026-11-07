export type LeadStage = 'INQUIRY' | 'INTRO_BOOKED' | 'TRIAL_ACTIVE' | 'WON_MEMBER' | 'LOST';
export type LeadSource = 'INSTAGRAM' | 'WALK_IN' | 'REFERRAL' | 'WEBSITE' | 'CAMPAIGN';

export type SessionType = 
  | 'PERSONAL_TRAINING' 
  | 'FITNESS_ASSESSMENT' 
  | 'NUTRITION_CONSULT' 
  | 'REHAB_RECOVERY'
  | 'BOXING_PADWORK';

export type AppointmentStatus = 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'NO_SHOW' | 'LATE_CANCEL' | 'CANCELLED';

export type DiscountType = 'PERCENTAGE' | 'FIXED_AMOUNT';

export type MembershipTier = 'GOLD_UNLIMITED' | 'BLACK_CARD_ALL_ACCESS' | 'OFF_PEAK' | 'PUNCH_CARD_10';
export type MemberStatus = 'ACTIVE' | 'PAST_DUE' | 'FROZEN' | 'EXPIRED';

export type ThemePreset = 'MONOCHROME_INDUSTRIAL' | 'NEO_EMERALD' | 'AMBER_FORGE' | 'OBSIDIAN_SLATE';

export interface Tenant {
  id: string;
  slug: string; // e.g. 'titan', 'apex', 'metabolic'
  subdomain: string; // 'titan.ironpulse.app'
  name: string;
  tagline: string;
  primaryColor: string; // Hex e.g. '#f97316'
  secondaryColor: string;
  address: string;
  phone: string;
  email: string;
  fireCodeMaxCapacity: number;
  currentOccupancy: number;
  customDomain?: string;
  currency: string;
  mrr: number;
  
  // Customization & CMS fields
  themePreset?: ThemePreset;
  heroHeadline?: string;
  heroSubhead?: string;
  heroImage?: string;
  amenities?: string[];
  showOccupancyLive?: boolean;
}

export interface Coach {
  id: string;
  tenantId: string;
  name: string;
  specialty: string;
  bio: string;
  avatar: string;
  hourlyRateCents: number;
  commissionRatePct: number;
  workingDays: number[]; // 0=Sun, 1=Mon...
}

export interface CRMLead {
  id: string;
  tenantId: string;
  fullName: string;
  email: string;
  phone: string;
  stage: LeadStage;
  source: LeadSource;
  estimatedValueCents: number;
  notes: string;
  assignedCoachId?: string;
  assignedCoachName?: string;
  createdAt: string;
  lastContactedAt: string;
  tags: string[];
  lossReason?: string;
}

export interface Appointment {
  id: string;
  tenantId: string;
  coachId: string;
  coachName: string;
  memberId: string;
  memberName: string;
  memberPhone: string;
  sessionType: SessionType;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  status: AppointmentStatus;
  priceCents: number;
  coachPayoutCents: number;
  notes?: string;
}

export interface Promotion {
  id: string;
  tenantId: string;
  code: string; // e.g. 'SUMMER20'
  title: string;
  discountType: DiscountType;
  value: number; // 20 (%) or 2500 ($25.00)
  description: string;
  maxRedemptions: number;
  currentRedemptions: number;
  validFrom: string;
  validUntil: string;
  isActive: boolean;
  applicableTiers: MembershipTier[];
}

export interface Member {
  id: string;
  tenantId: string;
  fullName: string;
  email: string;
  phone: string;
  membershipTier: MembershipTier;
  status: MemberStatus;
  remainingCredits?: number; // for punch cards
  joinedDate: string;
  renewalDate: string;
  lastCheckIn?: string;
  barcodePin: string;
  emergencyContact: string;
  isInsideFacility: boolean;
}

export interface GroupClass {
  id: string;
  tenantId: string;
  name: string;
  coachName: string;
  room: string;
  startTime: string;
  endTime: string;
  capacity: number;
  bookedCount: number;
  intensity: 'HIGH' | 'STRENGTH' | 'ENDURANCE' | 'MOBILITY';
  category: 'CROSSFIT' | 'HIIT' | 'SPIN' | 'YOGA' | 'POWERLIFTING';
}

export type UserRole = 'PLATFORM_SUPER_ADMIN' | 'GYM_OWNER' | 'FRONT_DESK_STAFF' | 'MEMBER_PORTAL';

export interface PlatformTenantInfo {
  id: string;
  name: string;
  slug: string;
  subdomain: string;
  customDomain?: string;
  customDomainStatus: 'VERIFIED' | 'PENDING_DNS' | 'NONE';
  plan: 'STARTER' | 'GROWTH' | 'ENTERPRISE';
  mrr: number;
  memberCount: number;
  healthStatus: 'HEALTHY' | 'PAST_DUE' | 'PROVISIONING';
  createdAt: string;
}

export interface PlatformFeatureFlag {
  id: string;
  key: string;
  name: string;
  description: string;
  enabled: boolean;
  rolloutPct: number;
}

export interface PlatformAuditLog {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  targetTenant?: string;
  details: string;
}

export interface CheckInLog {
  id: string;
  tenantId: string;
  memberId: string;
  memberName: string;
  tier: MembershipTier;
  timestamp: string;
  status: 'GRANTED' | 'WARNING_LOW_CREDITS' | 'DENIED_PAST_DUE';
  message: string;
}

export type NavTab = 
  | 'overview' 
  | 'kiosk' 
  | 'appointments' 
  | 'promotions' 
  | 'crm' 
  | 'members' 
  | 'classes' 
  | 'pos'
  | 'retention'
  | 'equipment'
  | 'settings';

export interface RetailProduct {
  id: string;
  tenantId: string;
  name: string;
  category: 'SUPPLEMENTS' | 'BEVERAGES' | 'APPAREL' | 'GEAR' | 'PASSES';
  priceCents: number;
  stockCount: number;
  sku: string;
}

export interface RetailTransaction {
  id: string;
  tenantId: string;
  timestamp: string;
  items: { productName: string; quantity: number; priceCents: number }[];
  totalCents: number;
  paymentMethod: 'CARD' | 'CASH' | 'ACCOUNT_ON_FILE';
  memberName?: string;
}

export interface ChurnRiskMember {
  id: string;
  tenantId: string;
  memberName: string;
  phone: string;
  email: string;
  membershipTier: MembershipTier;
  monthlyDuesCents: number;
  daysSinceLastVisit: number;
  attendanceTrend: 'STEEP_DROP' | 'MODERATE_DECLINE' | 'FAILED_BILLING';
  riskScorePct: number;
  suggestedAction: string;
  lastVisitDate: string;
}

export interface GymEquipment {
  id: string;
  tenantId: string;
  name: string;
  category: 'BARBELLS_PLATES' | 'CABLE_STATIONS' | 'CARDIO' | 'RECOVERY_SUITE' | 'RACKS';
  brand: string;
  serialNumber: string;
  location: string;
  status: 'OPERATIONAL' | 'NEEDS_SERVICE' | 'OUT_OF_ORDER';
  lastServiceDate: string;
  nextServiceDueDate: string;
  notes: string;
}
