# IronPulse Product Specification & Architecture Contract

## Workspace & Subdomain Representation Standard
- **Primary Anchor**: The Organization / Gym Name is ALWAYS the primary anchor (e.g. `Titan Strength & Conditioning`).
- **Subdomain Placement**: The live subdomain URL must be placed clearly and directly underneath the gym name (e.g., `titan.ironpulse.app`).
- **Applicability**: This rule applies strictly to this multi-tenant gym product across all workspace headers, navigation components, and subdomain switchers.

## Core Domain Modules
1. **Attendance & Check-In**: High-throughput barcode/PIN reader, real-time fire-code capacity meter, binary access states (`Access Approved`, `Low Pass Balance`, `Action Required: Past Due`).
2. **Appointments & Private Coaching**: 1-on-1 PT scheduling, trainer commission splits, payroll export.
3. **Group Classes**: Studio rosters, max seat limits, automated waitlist promotion.
4. **CRM & Lead Pipeline**: 5-stage pipeline (`Inquiry` ➔ `Intro Scheduled` ➔ `Active Trial` ➔ `Active Member` ➔ `Archived`) with direct contact triggers.
5. **Promotions & Offers**: Discount vouchers, usage caps, public subdomain checkout redemption.
6. **Members & Passes**: Directory, auto-renew billing dates, punch card credit tallies.
