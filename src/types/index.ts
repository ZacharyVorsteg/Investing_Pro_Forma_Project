// ============================================================================
// INVESTOR PRO FORMA TOOL - TYPE DEFINITIONS
// ============================================================================

export type PropertyType =
  | 'Industrial - Warehouse/Distribution'
  | 'Industrial - Flex'
  | 'Industrial - Manufacturing'
  | 'Office - CBD'
  | 'Office - Suburban'
  | 'Office - Medical'
  | 'Retail - Strip Center'
  | 'Retail - Single Tenant (NNN)'
  | 'Retail - Anchored Center'
  | 'Multifamily - Garden'
  | 'Multifamily - Mid-Rise'
  | 'Multifamily - High-Rise'
  | 'Mixed-Use'
  | 'Self-Storage'
  | 'Mobile Home Park'
  | 'Hotel/Hospitality'
  | 'Senior Housing'
  | 'Student Housing'
  | 'Land - Entitled'
  | 'Land - Raw'
  | 'Development - Ground Up'
  | 'Special Purpose'
  | 'Other'

export type AnalysisType =
  | 'Acquisition'
  | 'Refinance'
  | 'Development'
  | 'Value-Add'
  | 'Hold Period Analysis'
  | 'Disposition Analysis'

export type ProjectStatus = 'draft' | 'complete' | 'archived'

export type FieldState = 'known' | 'estimate' | 'incomplete'

// ============================================================================
// PROJECT STRUCTURE
// ============================================================================

export interface Project {
  id: string
  user_id: string
  name: string
  property_type: PropertyType | null
  status: ProjectStatus
  created_at: string
  updated_at: string
  is_template: boolean
  completeness: number
  
  // Sections
  property?: PropertyInfo
  analysis?: AnalysisParameters
  acquisition?: Acquisition
  financing?: Financing
  income?: Income
  expenses?: OperatingExpenses
  capital?: CapitalExpenditures
  growth?: GrowthAssumptions
  exit?: ExitAssumptions
  scenarios?: Scenario[]
}

// ============================================================================
// PROPERTY INFO
// ============================================================================

export interface PropertyInfo {
  address: {
    street: string
    city: string
    state: string
    zip: string
    county: string
  }
  sizing: {
    gross_building_sf: number | null
    rentable_sf: number | null
    land_sf: number | null
    land_acres: number | null
    units: number | null
    floors: number | null
    clear_height_ft: number | null
    dock_doors: number | null
    drive_in_doors: number | null
    parking_spaces: number | null
    parking_ratio: number | null
    far: number | null
    coverage: number | null
    zoning: string
    entitlements: string
  }
  year_built: number | null
  year_renovated: number | null
  analysis_start_date: string
}

// ============================================================================
// ANALYSIS PARAMETERS
// ============================================================================

export interface AnalysisParameters {
  hold_period_years: number
  hold_period_months: number
  granularity: 'annual' | 'monthly' | 'quarterly'
  analysis_type: AnalysisType
}

// ============================================================================
// ACQUISITION
// ============================================================================

export interface ClosingCostItem {
  id: string
  category: string
  description: string
  amount: number
  calculation_type: 'flat' | 'percentage'
  percentage_of: 'purchase_price' | 'loan_amount' | 'custom'
  percentage: number
}

export interface ImmediateCapitalItem {
  id: string
  description: string
  amount: number
  category: string
  notes: string
}

export interface Acquisition {
  purchase_price: number | null
  purchase_price_state: FieldState
  derived_from: 'Direct input' | 'Price per SF' | 'Price per unit' | 'Cap rate on T12 NOI' | 'Cap rate on Year 1 NOI'
  price_per_sf: number | null
  price_per_unit: number | null
  applied_cap_rate: number | null
  noi_used: number | null
  acquisition_date: string
  closing_costs: ClosingCostItem[]
  immediate_capital: ImmediateCapitalItem[]
}

// ============================================================================
// FINANCING
// ============================================================================

export type CapitalStructureType =
  | 'All Cash'
  | 'Single Senior Loan'
  | 'Senior + Mezzanine'
  | 'Senior + Preferred Equity'
  | 'Senior + Mezz + Pref'
  | 'Construction Loan'
  | 'Bridge Loan'
  | 'Seller Financing'
  | 'Assumable Debt'
  | 'Multiple Loans'
  | 'Custom Structure'

export type InterestType =
  | 'Fixed Rate'
  | 'Floating Rate'
  | 'Floating with Cap'
  | 'Floating with Swap'
  | 'Step Rate'
  | 'Accruing/PIK'

export type AmortizationType =
  | 'Fully Amortizing'
  | 'Interest Only (Full Term)'
  | 'Interest Only then Amortizing'
  | 'Partial IO'
  | 'Balloon'
  | 'Custom Schedule'

export interface DebtTranche {
  id: string
  tranche_name: string
  sizing_method: 'Loan Amount (direct)' | 'LTV' | 'LTC' | 'DSCR Constrained' | 'Debt Yield Constrained'
  loan_amount: number | null
  ltv_percentage: number | null
  ltc_percentage: number | null
  target_dscr: number | null
  target_debt_yield: number | null
  interest_type: InterestType
  interest_rate_annual: number | null
  index: 'SOFR' | 'Prime' | 'LIBOR Legacy' | 'Treasury' | 'Custom'
  spread_bps: number | null
  floor_rate: number | null
  ceiling_rate: number | null
  index_assumption: number | null
  amortization_type: AmortizationType
  amortization_years: number | null
  io_period_months: number | null
  loan_term_months: number | null
  origination_fee_pct: number | null
  origination_fee_flat: number | null
  exit_fee_pct: number | null
  prepayment_type: string
  prepayment_lockout_months: number | null
  other_loan_costs: { description: string; amount: number }[]
  lender_required_reserves: {
    tax_escrow_months: number | null
    insurance_escrow_months: number | null
    capex_reserve: number | null
    ti_lc_reserve: number | null
    interest_reserve_months: number | null
  }
  covenants: {
    min_dscr: number | null
    max_ltv: number | null
    min_debt_yield: number | null
  }
}

export interface EquitySplit {
  id: string
  investor_class: string
  equity_contribution: number | null
  equity_percentage: number | null
  preferred_return: number | null
  preferred_type: 'Simple' | 'Compounding' | 'Cumulative' | 'Non-Cumulative'
  catch_up: boolean
  catch_up_percentage: number | null
}

export interface PromoteTier {
  tier: number
  irr_hurdle: number | null
  gp_split: number | null
  lp_split: number | null
}

export interface Financing {
  structure_type: CapitalStructureType
  debt_tranches: DebtTranche[]
  equity_structure_type: string
  equity_splits: EquitySplit[]
  promote_structure: PromoteTier[]
  fees?: {
    acquisition_fee_pct?: number | null
    asset_management_fee_pct?: number | null
    disposition_fee_pct?: number | null
    refinance_fee_pct?: number | null
    construction_management_fee_pct?: number | null
  }
}

// ============================================================================
// INCOME
// ============================================================================

export type LeaseType =
  | 'Gross'
  | 'Modified Gross'
  | 'NNN (Triple Net)'
  | 'NN (Double Net)'
  | 'N (Single Net)'
  | 'Absolute Net'
  | 'Percentage'
  | 'Ground Lease'

export interface RenewalOption {
  id: string
  term_months: number | null
  rent_type: 'Market' | 'Fixed' | 'CPI' | 'Percentage Increase'
  rent_value: number | null
  notice_period_days: number | null
}

export interface Tenant {
  id: string
  tenant_name: string
  suite_unit: string
  rentable_sf: number | null
  usable_sf: number | null
  pro_rata_share: number | null
  lease_start_date: string
  lease_end_date: string
  lease_type: LeaseType
  base_rent_monthly: number | null
  escalation_type: string
  escalation_percentage: number | null
  escalation_dollar: number | null
  renewal_options: RenewalOption[]
  termination_option: boolean
  ti_allowance_total: number | null
  free_rent_months: number | null
  cam_recoverable: boolean
  tax_recoverable: boolean
  insurance_recoverable: boolean
  tenant_credit: string
  security_deposit: number | null
  notes: string
}

export interface VacantSpace {
  id: string
  suite: string
  sf: number | null
  market_rent_psf: number | null
  estimated_lease_up_months: number | null
  estimated_ti: number | null
  estimated_lc: number | null
  notes: string
}

export interface OtherIncomeItem {
  id: string
  category: string
  description: string
  amount_monthly: number | null
  amount_annual: number | null
  growth_rate: number | null
  growth_type: 'Fixed %' | 'CPI' | 'Custom' | 'None'
  notes: string
}

export interface VacancyAssumptions {
  vacancy_input_method?: 'Single rate all years' | 'Year-by-year custom' | 'Lease-up schedule' | 'Calculated from rent roll'
  vacancy_rate_single?: number | null
  vacancy_by_year?: { year: number; rate: number }[]
  credit_loss_rate?: number | null
  concession_rate?: number | null
  average_downtime_months?: number | null
  vacancy_assumption_rationale?: string
}

export interface Income {
  entry_method: 'Summary Entry' | 'Rent Roll Import' | 'Manual Rent Roll Entry' | 'Unit Mix Entry' | 'Hybrid'
  tenants: Tenant[]
  vacant_spaces: VacantSpace[]
  other_income: OtherIncomeItem[]
  vacancy: VacancyAssumptions
  summary?: {
    gross_potential_rent?: number | null
    total_other_income?: number | null
  }
}

// ============================================================================
// OPERATING EXPENSES
// ============================================================================

export interface ExpenseCategory {
  amount: number | null
  growth_rate: number | null
  state: FieldState
  recoverable_pct: number | null
  notes: string
}

export interface OperatingExpenses {
  entry_method: 'Category by category' | 'Bulk entry from T12' | 'Per SF estimate' | 'Per unit estimate'
  
  real_estate_taxes: ExpenseCategory & {
    current_assessed_value: number | null
    mill_rate: number | null
    reassessment_expected: boolean
    reassessment_year: number | null
  }
  
  insurance: ExpenseCategory & {
    property_coverage: number | null
    general_liability: number | null
    flood_insurance: number | null
    umbrella: number | null
  }
  
  utilities?: {
    electric?: ExpenseCategory
    gas?: ExpenseCategory
    water_sewer?: ExpenseCategory
    trash?: ExpenseCategory
  }
  
  repairs_maintenance: ExpenseCategory & {
    hvac_maintenance: number | null
    elevator_maintenance: number | null
    general_repairs: number | null
  }
  
  grounds_exterior: ExpenseCategory & {
    landscaping: number | null
    snow_removal: number | null
    pest_control: number | null
  }
  
  cleaning: ExpenseCategory & {
    common_area_janitorial: number | null
    supplies: number | null
  }
  
  security: ExpenseCategory & {
    guard_service: number | null
    monitoring_alarm: number | null
  }
  
  management?: {
    property_management_pct?: number | null
    property_management_flat?: number | null
    fee_type?: 'Percentage of EGI' | 'Flat Monthly' | 'Flat Annual'
    asset_management_pct?: number | null
  }
  
  administrative: ExpenseCategory & {
    accounting: number | null
    legal_general: number | null
    licenses_permits: number | null
    professional_fees: number | null
  }
  
  marketing_leasing: ExpenseCategory & {
    marketing: number | null
    advertising: number | null
  }
  
  custom_expenses: {
    id: string
    description: string
    amount: number | null
    growth_rate: number | null
    recoverable_pct: number | null
  }[]
  
  expense_growth_global: number | null
}

// ============================================================================
// CAPITAL EXPENDITURES
// ============================================================================

export interface ReserveItem {
  id: string
  system: string
  useful_life_years: number | null
  replacement_cost: number | null
  annual_reserve: number | null
  current_age_years: number | null
  condition: 'Excellent' | 'Good' | 'Fair' | 'Poor' | 'Replace Soon'
}

export interface CapExEvent {
  id: string
  year: number
  month: number | null
  description: string
  category: string
  amount: number | null
  funding_source: string
  notes: string
}

export interface TIAssumptions {
  new_lease_ti_psf?: number | null
  renewal_ti_psf?: number | null
  new_lease_lc_pct?: number | null
  renewal_lc_pct?: number | null
}

export interface CapitalExpenditures {
  reserve_method: 'Annual per SF' | 'Annual flat amount' | 'Percentage of EGI' | 'Percentage of NOI' | 'Itemized by system' | 'None'
  reserve_per_sf: number | null
  annual_reserve: number | null
  reserve_pct: number | null
  reserve_growth_rate: number | null
  itemized_reserves: ReserveItem[]
  scheduled_capex: CapExEvent[]
  ti_assumptions: TIAssumptions
}

// ============================================================================
// GROWTH & EXIT
// ============================================================================

export interface GrowthAssumptions {
  rent_growth_method: 'Fixed annual percentage' | 'Year-by-year custom' | 'Tied to CPI' | 'Market rent resets at rollover' | 'Contractual'
  rent_growth_rate: number | null
  rent_growth_by_year: { year: number; rate: number }[]
  other_income_growth_rate: number | null
  expense_growth_rate: number | null
  market_rent_current_psf: number | null
  market_rent_growth: number | null
  inflation_assumption: number | null
}

export interface ExitAssumptions {
  exit_year: number | null
  exit_month: number | null
  valuation_method: 'Cap Rate on Forward NOI' | 'Cap Rate on Trailing NOI' | 'Price per SF' | 'Price per Unit' | 'Gross Rent Multiplier' | 'Custom Value'
  exit_cap_rate: number | null
  exit_cap_rate_state: FieldState
  exit_price_per_sf: number | null
  exit_price_per_unit: number | null
  exit_grm: number | null
  custom_exit_value: number | null
  selling_costs?: {
    broker_commission_pct?: number | null
    transfer_taxes_pct?: number | null
    legal_fees?: number | null
    other_costs?: number | null
  }
}

// ============================================================================
// SCENARIOS & OUTPUTS
// ============================================================================

export interface Scenario {
  id: string
  name: string
  description: string
  overrides: Partial<{
    rent_growth: number
    expense_growth: number
    vacancy_rate: number
    exit_cap_rate: number
    interest_rate: number
    purchase_price: number
  }>
  results?: {
    irr: number
    equity_multiple: number
    cash_on_cash: number
    npv: number
  }
}

export interface ProFormaRow {
  label: string
  values: (number | null)[]
  isHeader?: boolean
  isTotal?: boolean
  isSubtotal?: boolean
  indent?: number
}

export interface ReturnsMetrics {
  unlevered_irr: number | null
  unlevered_equity_multiple: number | null
  levered_irr: number | null
  levered_equity_multiple: number | null
  average_cash_on_cash: number | null
  going_in_cap_rate: number | null
  exit_cap_rate: number | null
  yield_on_cost: number | null
  peak_equity: number | null
  payback_period_years: number | null
}

export interface SensitivityTable {
  name: string
  output_metric: 'IRR' | 'Equity Multiple' | 'Cash-on-Cash' | 'DSCR' | 'NPV'
  variable_1: {
    name: string
    base: number
    range: number[]
  }
  variable_2: {
    name: string
    base: number
    range: number[]
  }
  results: number[][]
}

// ============================================================================
// USER & AUTH
// ============================================================================

export interface User {
  id: string
  email: string
  full_name?: string
  company?: string
  created_at: string
}

