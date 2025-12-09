import { useState, useMemo, useEffect, useRef } from 'react'
import { Plus, Trash2, Download, RotateCcw, Printer, CheckCircle, XCircle, TrendingUp, Info, AlertCircle, Lightbulb, ChevronUp, Settings, DollarSign, Percent } from 'lucide-react'

// ============================================================================
// TYPES
// ============================================================================

interface Unit {
  id: string
  unitNumber: string
  bedrooms: number
  bathrooms: number
  sqft: number
  rent: number
}

interface Inputs {
  propertyName: string
  propertyAddress: string
  purchasePrice: number
  closingCosts: number
  immediateRepairs: number
  downPaymentPct: number
  interestRate: number
  loanTermYears: number
  units: Unit[]
  laundryIncome: number
  parkingIncome: number
  storageIncome: number
  otherIncome: number
  realEstateTaxes: number
  insurance: number
  water: number
  sewer: number
  gas: number
  electric: number
  trash: number
  landscaping: number
  snowRemoval: number
  repairsMaintenance: number
  pestControl: number
  managementPct: number
  legalAccounting: number
  advertising: number
  miscellaneous: number
  replacementReserves: number
  vacancyPct: number
  annualRentIncrease: number
  annualExpenseIncrease: number
  projectionYears: number
  exitCapRate: number
}

// ============================================================================
// DEFAULT VALUES
// ============================================================================

const createDefaultUnits = (): Unit[] => {
  const units: Unit[] = []
  for (let i = 1; i <= 12; i++) {
    const is2Bed = i === 4 || i === 10
    units.push({
      id: String(i),
      unitNumber: `432-${i}`,
      bedrooms: is2Bed ? 2 : 1,
      bathrooms: 1,
      sqft: is2Bed ? 775 : 550,
      rent: is2Bed ? 1800 : (i === 7 ? 1550 : 1600),
    })
  }
  return units
}

const defaultInputs: Inputs = {
  propertyName: 'CROISSANT PARK APARTMENTS',
  propertyAddress: 'Building 155 SE 5th Ct - Vista Court Apartments',
  purchasePrice: 2300000,
  closingCosts: 46000,
  immediateRepairs: 0,
  downPaymentPct: 25,
  interestRate: 7.0,
  loanTermYears: 30,
  units: createDefaultUnits(),
  laundryIncome: 208.33,
  parkingIncome: 0,
  storageIncome: 0,
  otherIncome: 0,
  realEstateTaxes: 47915,
  insurance: 11000,
  water: 4000,
  sewer: 2000,
  gas: 1500,
  electric: 2800,
  trash: 2400,
  landscaping: 2400,
  snowRemoval: 0,
  repairsMaintenance: 4800,
  pestControl: 600,
  managementPct: 5,
  legalAccounting: 1200,
  advertising: 500,
  miscellaneous: 1000,
  replacementReserves: 1800,
  vacancyPct: 5,
  annualRentIncrease: 3,
  annualExpenseIncrease: 3,
  projectionYears: 10,
  exitCapRate: 6,
}

// ============================================================================
// HELPERS
// ============================================================================

const fmt = (n: number): string => {
  if (isNaN(n) || !isFinite(n)) return '0'
  return Math.round(n).toLocaleString('en-US')
}

const fmtDec = (n: number, dec: number = 2): string => {
  if (isNaN(n) || !isFinite(n)) return '0.00'
  return n.toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec })
}

// ============================================================================
// DEEP INTELLIGENCE ENGINE
// ============================================================================

interface DeepInsight {
  type: 'critical' | 'warning' | 'opportunity' | 'strength' | 'tip'
  title: string
  message: string
  action?: string
  metric?: string
}

interface InvestmentAnalysis {
  overallGrade: string
  overallScore: number
  gradeColor: string
  strategy: string
  strategyDescription: string
  insights: DeepInsight[]
  quickFixes: { label: string; field: keyof Inputs; currentValue: number; suggestedValue: number; impact: string }[]
}

function generateDeepAnalysis(
  inputs: Inputs,
  calc: {
    capRate: number
    cashOnCash: number
    dscr: number
    expenseRatio: number
    ltv: number
    pricePerUnit: number
    pricePerSqft: number
    year1NOI: number
    year1CashFlow: number
    annualDebtService: number
    totalCashRequired: number
    grossRentMultiplier: number
    monthlyRent: number
    annualRent: number
    totalSqft: number
  }
): InvestmentAnalysis {
  const insights: DeepInsight[] = []
  const quickFixes: InvestmentAnalysis['quickFixes'] = []

  const { capRate, cashOnCash, dscr, expenseRatio, ltv, pricePerUnit, pricePerSqft,
          year1NOI, year1CashFlow, annualDebtService, grossRentMultiplier,
          monthlyRent, totalSqft } = calc
  
  const { purchasePrice, downPaymentPct, interestRate, vacancyPct, managementPct,
          annualRentIncrease, annualExpenseIncrease, exitCapRate, realEstateTaxes,
          repairsMaintenance } = inputs

  // ============================================
  // CRITICAL ISSUES (Deal Breakers)
  // ============================================

  // Negative Cash Flow Analysis
  if (year1CashFlow < 0) {
    const monthlyShortfall = Math.abs(year1CashFlow / 12)
    const annualShortfall = Math.abs(year1CashFlow)
    
    insights.push({
      type: 'critical',
      title: 'Negative Cash Flow',
      message: `This property loses $${fmt(monthlyShortfall)}/month ($${fmt(annualShortfall)}/year). You'll need to contribute this amount from other income sources.`,
      action: dscr < 1 
        ? `Increase down payment to ${Math.ceil((1 - (year1NOI / (annualDebtService * 1.1)) * purchasePrice / purchasePrice) * 100)}% to achieve positive cash flow.`
        : 'Look for ways to increase rent or reduce expenses.',
      metric: 'cashFlow'
    })

    // Suggest down payment fix
    const targetDebt = year1NOI / 1.1 // Target 1.1 DSCR
    const targetLoan = targetDebt > 0 ? targetDebt * ((Math.pow(1 + interestRate/100/12, inputs.loanTermYears*12) - 1) / (interestRate/100/12 * Math.pow(1 + interestRate/100/12, inputs.loanTermYears*12))) : 0
    const targetDownPct = Math.min(100, Math.max(20, (1 - targetLoan / purchasePrice) * 100))
    
    if (targetDownPct > downPaymentPct && targetDownPct <= 50) {
      quickFixes.push({
        label: 'Increase Down Payment',
        field: 'downPaymentPct',
        currentValue: downPaymentPct,
        suggestedValue: Math.ceil(targetDownPct),
        impact: 'Achieve positive cash flow'
      })
    }
  }

  // DSCR Below 1.0
  if (dscr < 1.0 && dscr > 0) {
    insights.push({
      type: 'critical',
      title: 'Debt Service Coverage Below 1.0',
      message: `Your NOI ($${fmt(year1NOI)}) doesn't cover your debt service ($${fmt(annualDebtService)}). Most lenders require DSCR of 1.25+. This deal won't qualify for conventional financing.`,
      action: 'Either negotiate a lower purchase price, bring more equity, or find ways to increase NOI.',
      metric: 'dscr'
    })
  }

  // ============================================
  // CONTEXTUAL WARNINGS
  // ============================================

  // High Interest Rate in Current Market
  if (interestRate >= 7.5) {
    insights.push({
      type: 'warning',
      title: 'High Interest Rate Environment',
      message: `At ${interestRate}% interest, your debt service is eating into cash flow. Consider if this deal makes sense to buy now or wait for rate drops.`,
      action: 'Model scenarios with lower rates (5-6%) to see future refinance potential.',
      metric: 'interestRate'
    })
  }

  // High LTV with Low DSCR
  if (ltv > 75 && dscr < 1.25) {
    insights.push({
      type: 'warning',
      title: 'Risky Leverage Profile',
      message: `High leverage (${fmtDec(ltv, 0)}% LTV) combined with thin debt coverage (${fmtDec(dscr)} DSCR) leaves no margin for error. Any vacancy spike or unexpected expense could cause default.`,
      action: 'Consider 25-30% down payment minimum for this property.',
      metric: 'leverage'
    })
  }

  // Expense Growth > Rent Growth
  if (annualExpenseIncrease > annualRentIncrease) {
    const yearsToNegative = Math.floor(Math.log(1 + (cashOnCash > 0 ? cashOnCash/100 : 0.01)) / Math.log((1 + annualExpenseIncrease/100)/(1 + annualRentIncrease/100)))
    insights.push({
      type: 'warning',
      title: 'Expense Growth Exceeds Rent Growth',
      message: `Your expenses grow at ${annualExpenseIncrease}% while rents grow at ${annualRentIncrease}%. This compresses margins over time.`,
      action: yearsToNegative > 0 && yearsToNegative < 15 
        ? `At these rates, cash flow could turn negative around year ${yearsToNegative}.`
        : 'Consider if rent growth assumption is realistic for your market.',
      metric: 'growth'
    })
    
    quickFixes.push({
      label: 'Match Growth Rates',
      field: 'annualExpenseIncrease',
      currentValue: annualExpenseIncrease,
      suggestedValue: annualRentIncrease,
      impact: 'Maintain margins over time'
    })
  }

  // High Property Taxes
  const taxRate = purchasePrice > 0 ? (realEstateTaxes / purchasePrice) * 100 : 0
  if (taxRate > 2.5) {
    insights.push({
      type: 'warning',
      title: 'High Property Tax Burden',
      message: `Property taxes of $${fmt(realEstateTaxes)} represent ${fmtDec(taxRate)}% of purchase price - significantly above average. This market may have reassessment risk.`,
      action: 'Verify if taxes will increase after sale. Many jurisdictions reassess on transfer.',
      metric: 'taxes'
    })
  }

  // Low Vacancy Assumption
  if (vacancyPct < 5) {
    insights.push({
      type: 'warning',
      title: 'Aggressive Vacancy Assumption',
      message: `${vacancyPct}% vacancy is optimistic. Industry standard is 5-8%. One vacant unit could significantly impact your returns.`,
      action: 'Run the numbers with 7-8% vacancy to stress test.',
      metric: 'vacancy'
    })
    
    quickFixes.push({
      label: 'Conservative Vacancy',
      field: 'vacancyPct',
      currentValue: vacancyPct,
      suggestedValue: 5,
      impact: 'More realistic projection'
    })
  }

  // No Management Fee (Self-Managing)
  if (managementPct === 0) {
    insights.push({
      type: 'warning',
      title: 'No Management Fee Budgeted',
      message: `You're assuming self-management, but your time has value. If circumstances change and you need a manager, it will cost 5-10% of collected rent.`,
      action: 'Budget at least 5% for management to see true passive returns.',
      metric: 'management'
    })
  }

  // Low Repairs Budget
  const repairsPerUnit = repairsMaintenance / inputs.units.length
  if (repairsPerUnit < 300 && inputs.units.length > 0) {
    insights.push({
      type: 'warning',
      title: 'Low Repairs & Maintenance Budget',
      message: `$${fmt(repairsPerUnit)}/unit/year for repairs may be insufficient. Older properties typically need $400-600/unit.`,
      action: 'Review property condition and age. Deferred maintenance can become capital expenditures.',
      metric: 'repairs'
    })
  }

  // ============================================
  // OPPORTUNITIES
  // ============================================

  // Below Market Rents
  const avgRentPerSqft = monthlyRent / totalSqft
  if (avgRentPerSqft < 2.0 && pricePerSqft > 200) {
    insights.push({
      type: 'opportunity',
      title: 'Potential Rent Upside',
      message: `At $${fmtDec(avgRentPerSqft)}/sqft, rents may be below market for a property priced at $${fmt(pricePerSqft)}/sqft. Research comparable rents in the area.`,
      action: 'If rents can increase 10-15%, this could significantly improve returns.',
      metric: 'rents'
    })
  }

  // Value-Add Indicators
  if (expenseRatio > 50 && capRate > 5) {
    insights.push({
      type: 'opportunity',
      title: 'Value-Add Through Expense Reduction',
      message: `${fmtDec(expenseRatio, 0)}% expense ratio is above average. Every 5% reduction in expenses adds ~$${fmt((calc.year1NOI * 0.05) / (exitCapRate/100))} to property value.`,
      action: 'Audit utility bills, insurance quotes, and tax assessments for savings.',
      metric: 'expenses'
    })
  }

  // Cap Rate vs Exit Cap Rate
  if (capRate > exitCapRate + 0.5) {
    const projectedAppreciation = (year1NOI / (exitCapRate/100)) - purchasePrice
    insights.push({
      type: 'opportunity',
      title: 'Built-In Appreciation Potential',
      message: `Buying at ${fmtDec(capRate)}% cap and exiting at ${exitCapRate}% cap implies $${fmt(projectedAppreciation)} in appreciation from cap rate compression alone.`,
      action: 'Validate that exit cap rate assumption is realistic for this market.',
      metric: 'appreciation'
    })
  }

  // Good GRM
  if (grossRentMultiplier < 10 && grossRentMultiplier > 0) {
    insights.push({
      type: 'strength',
      title: 'Attractive Gross Rent Multiplier',
      message: `GRM of ${fmtDec(grossRentMultiplier, 1)} indicates solid income relative to price. Properties under 10 GRM often cash flow better.`,
      metric: 'grm'
    })
  }

  // ============================================
  // STRENGTHS
  // ============================================

  if (dscr >= 1.25) {
    insights.push({
      type: 'strength',
      title: 'Healthy Debt Coverage',
      message: `DSCR of ${fmtDec(dscr)} provides a ${fmtDec((dscr - 1) * 100, 0)}% cushion above debt service. This buffer protects against vacancy or expense surprises.`,
      metric: 'dscr'
    })
  }

  if (cashOnCash >= 8) {
    insights.push({
      type: 'strength',
      title: 'Strong Cash-on-Cash Return',
      message: `${fmtDec(cashOnCash)}% CoC outperforms most passive investments. Your equity is generating meaningful current income.`,
      metric: 'coc'
    })
  }

  if (expenseRatio <= 40) {
    insights.push({
      type: 'strength',
      title: 'Efficient Operations',
      message: `${fmtDec(expenseRatio, 0)}% expense ratio shows well-controlled costs. This leaves more NOI flowing to the bottom line.`,
      metric: 'expenses'
    })
  }

  if (ltv <= 70) {
    insights.push({
      type: 'strength',
      title: 'Conservative Leverage',
      message: `${fmtDec(ltv, 0)}% LTV gives you equity cushion against market downturns and likely qualifies for better loan terms.`,
      metric: 'leverage'
    })
  }

  // ============================================
  // STRATEGIC TIPS
  // ============================================

  // Interest Rate Sensitivity
  if (interestRate >= 6) {
    const lowerRateSavings = annualDebtService - (calc.totalCashRequired * 0.05 * 12) // Rough estimate at 5%
    insights.push({
      type: 'tip',
      title: 'Refinance Opportunity Watch',
      message: `If rates drop to 5%, refinancing could save approximately $${fmt(lowerRateSavings * 0.3)}/year in debt service.`,
      action: 'Set rate alerts. Consider ARM or shorter-term loan if you plan to refinance.'
    })
  }

  // Exit Strategy
  if (exitCapRate < capRate) {
    insights.push({
      type: 'tip',
      title: 'Exit Cap Rate Assumption',
      message: `You're assuming cap rate compression from ${fmtDec(capRate)}% to ${exitCapRate}%. This requires market improvement or significant value-add.`,
      action: 'Conservative approach: use same or higher exit cap than entry.'
    })
    
    quickFixes.push({
      label: 'Match Entry Cap',
      field: 'exitCapRate',
      currentValue: exitCapRate,
      suggestedValue: Math.ceil(capRate * 10) / 10,
      impact: 'More conservative exit'
    })
  }

  // Price Per Unit Context
  if (pricePerUnit > 250000) {
    insights.push({
      type: 'tip',
      title: 'Premium Price Per Unit',
      message: `At $${fmt(pricePerUnit)}/unit, you're paying a premium. Ensure location, condition, and rent potential justify this pricing.`,
      action: 'Compare to recent sales in the immediate area.'
    })
  } else if (pricePerUnit < 100000) {
    insights.push({
      type: 'tip',
      title: 'Below-Market Price Per Unit',
      message: `$${fmt(pricePerUnit)}/unit is below typical multifamily pricing. Investigate why - could be opportunity or hidden issues.`,
      action: 'Thorough inspection recommended. Check for deferred maintenance.'
    })
  }

  // ============================================
  // CALCULATE OVERALL GRADE
  // ============================================

  let score = 50 // Start at middle

  // Cash Flow Impact (25 points)
  if (cashOnCash >= 10) score += 25
  else if (cashOnCash >= 8) score += 20
  else if (cashOnCash >= 5) score += 12
  else if (cashOnCash >= 0) score += 5
  else score -= 15

  // DSCR Impact (20 points)
  if (dscr >= 1.5) score += 20
  else if (dscr >= 1.25) score += 15
  else if (dscr >= 1.1) score += 8
  else if (dscr >= 1.0) score += 0
  else score -= 20

  // Cap Rate Impact (15 points)
  if (capRate >= 8) score += 15
  else if (capRate >= 6) score += 10
  else if (capRate >= 5) score += 5
  else score -= 5

  // Expense Ratio Impact (10 points)
  if (expenseRatio <= 40) score += 10
  else if (expenseRatio <= 50) score += 5
  else if (expenseRatio <= 60) score += 0
  else score -= 10

  // Leverage Impact (10 points)
  if (ltv <= 65) score += 10
  else if (ltv <= 75) score += 5
  else score -= 5

  score = Math.max(0, Math.min(100, score))

  let overallGrade: string
  let gradeColor: string
  if (score >= 85) { overallGrade = 'A'; gradeColor = 'emerald' }
  else if (score >= 75) { overallGrade = 'B+'; gradeColor = 'blue' }
  else if (score >= 65) { overallGrade = 'B'; gradeColor = 'blue' }
  else if (score >= 55) { overallGrade = 'C+'; gradeColor = 'yellow' }
  else if (score >= 45) { overallGrade = 'C'; gradeColor = 'yellow' }
  else if (score >= 35) { overallGrade = 'D'; gradeColor = 'orange' }
  else { overallGrade = 'F'; gradeColor = 'red' }

  // Determine Strategy
  let strategy: string
  let strategyDescription: string

  if (year1CashFlow < 0 && expenseRatio > 50) {
    strategy = 'Heavy Value-Add / Turnaround'
    strategyDescription = 'This property needs significant work. Expect negative cash flow during stabilization. Best for experienced operators with capital reserves.'
  } else if (year1CashFlow < 0) {
    strategy = 'Appreciation Play'
    strategyDescription = 'Negative cash flow means you\'re betting on appreciation. Ensure you can cover monthly shortfalls and have a clear exit timeline.'
  } else if (capRate > 7 && expenseRatio > 45) {
    strategy = 'Value-Add Opportunity'
    strategyDescription = 'Higher cap rate with room for expense optimization. Improve operations to boost NOI and force appreciation.'
  } else if (cashOnCash > 8 && dscr > 1.25) {
    strategy = 'Cash Flow Investment'
    strategyDescription = 'Strong current returns with solid debt coverage. Ideal for passive income seekers prioritizing cash flow over appreciation.'
  } else if (capRate < 5 && pricePerUnit > 200000) {
    strategy = 'Core / Trophy Asset'
    strategyDescription = 'Premium pricing for prime location/quality. Returns come from stability and long-term appreciation. Lower risk, lower yield.'
  } else if (inputs.units.length <= 4 && pricePerUnit < 150000) {
    strategy = 'House Hack Candidate'
    strategyDescription = 'Small property at accessible price point. Consider living in one unit to reduce housing costs while building equity.'
  } else {
    strategy = 'Core-Plus Investment'
    strategyDescription = 'Balanced risk/return profile. Modest cash flow with potential for improvement. Suitable for most investors.'
  }

  // Sort insights by priority
  const priorityOrder = { critical: 0, warning: 1, opportunity: 2, strength: 3, tip: 4 }
  insights.sort((a, b) => priorityOrder[a.type] - priorityOrder[b.type])

  return {
    overallGrade,
    overallScore: score,
    gradeColor,
    strategy,
    strategyDescription,
    insights,
    quickFixes: quickFixes.slice(0, 4) // Top 4 suggestions
  }
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function ProFormaApp() {
  const [inputs, setInputs] = useState<Inputs>(() => {
    const saved = localStorage.getItem('proforma-v5')
    if (saved) {
      try {
        return { ...defaultInputs, ...JSON.parse(saved) }
      } catch {
        return defaultInputs
      }
    }
    return defaultInputs
  })

  const [showQuickEdit, setShowQuickEdit] = useState(false)
  const sectionsRef = useRef<{ [key: string]: HTMLElement | null }>({})

  useEffect(() => {
    localStorage.setItem('proforma-v5', JSON.stringify(inputs))
  }, [inputs])

  const set = <K extends keyof Inputs>(key: K, value: Inputs[K]) => {
    setInputs(prev => ({ ...prev, [key]: value }))
  }

  const setNum = (key: keyof Inputs, value: string) => {
    const num = parseFloat(value) || 0
    set(key, num as Inputs[typeof key])
  }

  const updateUnit = (id: string, field: keyof Unit, value: string | number) => {
    set('units', inputs.units.map(u => 
      u.id === id ? { ...u, [field]: typeof value === 'string' && field !== 'unitNumber' ? parseFloat(value) || 0 : value } : u
    ))
  }

  const addUnit = () => {
    const newNum = inputs.units.length + 1
    set('units', [...inputs.units, {
      id: String(Date.now()),
      unitNumber: `Unit ${newNum}`,
      bedrooms: 1,
      bathrooms: 1,
      sqft: 550,
      rent: 1500,
    }])
  }

  const removeUnit = (id: string) => {
    if (inputs.units.length > 1) {
      set('units', inputs.units.filter(u => u.id !== id))
    }
  }

  const reset = () => {
    if (confirm('Reset all values to the example property?')) {
      setInputs(defaultInputs)
    }
  }

  const scrollToSection = (section: string) => {
    sectionsRef.current[section]?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  // ============================================================================
  // CALCULATIONS
  // ============================================================================

  const calc = useMemo(() => {
    const {
      purchasePrice, closingCosts, immediateRepairs,
      downPaymentPct, interestRate, loanTermYears,
      units,
      laundryIncome, parkingIncome, storageIncome, otherIncome,
      realEstateTaxes, insurance, water, sewer, gas, electric, trash,
      landscaping, snowRemoval, repairsMaintenance, pestControl,
      managementPct, legalAccounting, advertising, miscellaneous, replacementReserves,
      vacancyPct, annualRentIncrease, annualExpenseIncrease, projectionYears, exitCapRate
    } = inputs

    const totalUnits = units.length
    const totalSqft = units.reduce((sum, u) => sum + u.sqft, 0)
    const monthlyRent = units.reduce((sum, u) => sum + u.rent, 0)
    const annualRent = monthlyRent * 12
    const pricePerSqft = totalSqft > 0 ? purchasePrice / totalSqft : 0
    const pricePerUnit = totalUnits > 0 ? purchasePrice / totalUnits : 0

    const monthlyOtherIncome = laundryIncome + parkingIncome + storageIncome + otherIncome
    const annualOtherIncome = monthlyOtherIncome * 12
    const grossPotentialIncome = annualRent + annualOtherIncome
    const totalAcquisitionCost = purchasePrice + closingCosts + immediateRepairs

    const downPayment = purchasePrice * (downPaymentPct / 100)
    const loanAmount = purchasePrice - downPayment
    const ltv = purchasePrice > 0 ? (loanAmount / purchasePrice) * 100 : 0
    const monthlyRate = interestRate / 100 / 12
    const numPayments = loanTermYears * 12
    const monthlyMortgage = loanAmount > 0 && monthlyRate > 0
      ? loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / (Math.pow(1 + monthlyRate, numPayments) - 1)
      : 0
    const annualDebtService = monthlyMortgage * 12
    const totalCashRequired = downPayment + closingCosts + immediateRepairs

    const utilities = water + sewer + gas + electric
    const baseExpenses = { realEstateTaxes, insurance, water, sewer, gas, electric, trash, landscaping, snowRemoval, repairsMaintenance, pestControl, legalAccounting, advertising, miscellaneous, replacementReserves }

    const year1Vacancy = grossPotentialIncome * (vacancyPct / 100)
    const year1EGI = grossPotentialIncome - year1Vacancy
    const year1Management = year1EGI * (managementPct / 100)
    const year1TotalExpenses = Object.values(baseExpenses).reduce((s, v) => s + v, 0) + year1Management
    const year1NOI = year1EGI - year1TotalExpenses
    const year1CashFlow = year1NOI - annualDebtService

    const capRate = purchasePrice > 0 ? (year1NOI / purchasePrice) * 100 : 0
    const cashOnCash = totalCashRequired > 0 ? (year1CashFlow / totalCashRequired) * 100 : 0
    const grossRentMultiplier = annualRent > 0 ? purchasePrice / annualRent : 0
    const dscr = annualDebtService > 0 ? year1NOI / annualDebtService : 0
    const expenseRatio = year1EGI > 0 ? (year1TotalExpenses / year1EGI) * 100 : 0

    // Year-by-year projection
    const years: {
      year: number
      scheduledRent: number
      otherIncome: number
      grossPotentialIncome: number
      vacancy: number
      effectiveGrossIncome: number
      realEstateTaxes: number
      insurance: number
      utilities: number
      trash: number
      landscaping: number
      snowRemoval: number
      repairsMaintenance: number
      pestControl: number
      management: number
      legalAccounting: number
      advertising: number
      miscellaneous: number
      replacementReserves: number
      totalOperatingExpenses: number
      netOperatingIncome: number
      debtService: number
      cashFlowBeforeTax: number
    }[] = []

    const currentYear = new Date().getFullYear()

    for (let i = 0; i <= projectionYears; i++) {
      const rentGrowth = Math.pow(1 + annualRentIncrease / 100, i)
      const expenseGrowth = Math.pow(1 + annualExpenseIncrease / 100, i)

      const scheduledRent = annualRent * rentGrowth
      const yearOtherIncome = annualOtherIncome * rentGrowth
      const gpi = scheduledRent + yearOtherIncome
      const vacancy = gpi * (vacancyPct / 100)
      const egi = gpi - vacancy

      const yearExpenses = {
        realEstateTaxes: baseExpenses.realEstateTaxes * expenseGrowth,
        insurance: baseExpenses.insurance * expenseGrowth,
        utilities: utilities * expenseGrowth,
        trash: baseExpenses.trash * expenseGrowth,
        landscaping: baseExpenses.landscaping * expenseGrowth,
        snowRemoval: baseExpenses.snowRemoval * expenseGrowth,
        repairsMaintenance: baseExpenses.repairsMaintenance * expenseGrowth,
        pestControl: baseExpenses.pestControl * expenseGrowth,
        management: egi * (managementPct / 100),
        legalAccounting: baseExpenses.legalAccounting * expenseGrowth,
        advertising: baseExpenses.advertising * expenseGrowth,
        miscellaneous: baseExpenses.miscellaneous * expenseGrowth,
        replacementReserves: baseExpenses.replacementReserves * expenseGrowth,
      }

      const totalOpex = Object.values(yearExpenses).reduce((sum, v) => sum + v, 0)
      const noi = egi - totalOpex
      const cashFlow = noi - annualDebtService

      years.push({
        year: currentYear + i,
        scheduledRent,
        otherIncome: yearOtherIncome,
        grossPotentialIncome: gpi,
        vacancy,
        effectiveGrossIncome: egi,
        ...yearExpenses,
        totalOperatingExpenses: totalOpex,
        netOperatingIncome: noi,
        debtService: annualDebtService,
        cashFlowBeforeTax: cashFlow,
      })
    }

    const exitYearNOI = years[projectionYears]?.netOperatingIncome || 0
    const exitValue = exitCapRate > 0 ? exitYearNOI / (exitCapRate / 100) : 0

    return {
      totalUnits, totalSqft, monthlyRent, annualRent, pricePerSqft, pricePerUnit,
      monthlyOtherIncome, annualOtherIncome, grossPotentialIncome, totalAcquisitionCost,
      downPayment, loanAmount, ltv, monthlyMortgage, annualDebtService, totalCashRequired,
      year1EGI, year1TotalExpenses, year1NOI, year1CashFlow, years,
      capRate, cashOnCash, grossRentMultiplier, dscr, expenseRatio, exitValue,
    }
  }, [inputs])

  // Generate deep analysis
  const analysis = useMemo(() => generateDeepAnalysis(inputs, calc), [inputs, calc])

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900">
      {/* FIXED HEADER */}
      <header className="bg-[#1e3a5f] text-white px-4 py-3 sticky top-0 z-50 shadow-lg">
        <div className="max-w-[1800px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold">INVESTMENT PRO FORMA</h1>
            <nav className="hidden md:flex items-center gap-1 ml-4">
              {['Grade', 'Property', 'Units', 'Acquisition', 'Expenses', 'Projection'].map(section => (
                <button
                  key={section}
                  onClick={() => scrollToSection(section.toLowerCase())}
                  className="px-3 py-1 text-sm rounded hover:bg-white/20 transition-colors"
                >
                  {section}
                </button>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowQuickEdit(!showQuickEdit)}
              className={`flex items-center gap-1 px-3 py-1.5 rounded text-sm transition-colors ${showQuickEdit ? 'bg-emerald-500' : 'bg-white/20 hover:bg-white/30'}`}
            >
              <Settings size={16} /> Quick Edit
            </button>
            <button onClick={reset} className="flex items-center gap-1 px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded text-sm">
              <RotateCcw size={14} />
            </button>
            <button onClick={() => window.print()} className="flex items-center gap-1 px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded text-sm">
              <Printer size={14} />
            </button>
            <button className="flex items-center gap-1 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 rounded text-sm font-medium">
              <Download size={14} /> Export
            </button>
          </div>
        </div>
      </header>

      {/* QUICK EDIT PANEL */}
      {showQuickEdit && (
        <div className="bg-slate-800 text-white px-4 py-3 sticky top-[52px] z-40 shadow-lg border-b border-slate-700">
          <div className="max-w-[1800px] mx-auto">
            <div className="flex items-center gap-6 overflow-x-auto pb-1">
              <QuickInput label="Purchase" value={inputs.purchasePrice} onChange={v => setNum('purchasePrice', v)} prefix="$" />
              <QuickInput label="Down" value={inputs.downPaymentPct} onChange={v => setNum('downPaymentPct', v)} suffix="%" />
              <QuickInput label="Rate" value={inputs.interestRate} onChange={v => setNum('interestRate', v)} suffix="%" />
              <QuickInput label="Vacancy" value={inputs.vacancyPct} onChange={v => setNum('vacancyPct', v)} suffix="%" />
              <QuickInput label="Rent ↑" value={inputs.annualRentIncrease} onChange={v => setNum('annualRentIncrease', v)} suffix="%" />
              <QuickInput label="Expense ↑" value={inputs.annualExpenseIncrease} onChange={v => setNum('annualExpenseIncrease', v)} suffix="%" />
              <QuickInput label="Exit Cap" value={inputs.exitCapRate} onChange={v => setNum('exitCapRate', v)} suffix="%" />
              <div className="border-l border-slate-600 pl-4 flex items-center gap-4">
                <div className="text-center">
                  <div className="text-xs text-slate-400">Cap Rate</div>
                  <div className="font-bold text-emerald-400">{fmtDec(calc.capRate)}%</div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-slate-400">Cash/Cash</div>
                  <div className={`font-bold ${calc.cashOnCash >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{fmtDec(calc.cashOnCash)}%</div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-slate-400">DSCR</div>
                  <div className={`font-bold ${calc.dscr >= 1.25 ? 'text-emerald-400' : calc.dscr >= 1 ? 'text-yellow-400' : 'text-red-400'}`}>{fmtDec(calc.dscr)}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <main className="max-w-[1800px] mx-auto p-4 space-y-4">
        
        {/* INVESTMENT ANALYSIS */}
        <section ref={el => { sectionsRef.current['grade'] = el }} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-[#1e3a5f] to-[#2d5a87] text-white px-6 py-4">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <TrendingUp size={20} /> Investment Analysis
            </h2>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Grade Circle */}
              <div className="lg:col-span-2 flex flex-col items-center justify-center">
                <div className={`w-28 h-28 rounded-full flex items-center justify-center text-5xl font-black border-[6px] ${
                  analysis.gradeColor === 'emerald' ? 'bg-emerald-100 border-emerald-500 text-emerald-700' :
                  analysis.gradeColor === 'blue' ? 'bg-blue-100 border-blue-500 text-blue-700' :
                  analysis.gradeColor === 'yellow' ? 'bg-yellow-100 border-yellow-500 text-yellow-700' :
                  analysis.gradeColor === 'orange' ? 'bg-orange-100 border-orange-500 text-orange-700' :
                  'bg-red-100 border-red-500 text-red-700'
                }`}>
                  {analysis.overallGrade}
                </div>
                <div className="mt-2 text-sm text-gray-500">Score: {analysis.overallScore}/100</div>
              </div>

              {/* Strategy & Quick Fixes */}
              <div className="lg:col-span-4">
                <div className="bg-gray-50 rounded-lg p-4 h-full">
                  <div className={`inline-block px-3 py-1 rounded-full text-sm font-semibold mb-2 ${
                    analysis.strategy.includes('Turnaround') ? 'bg-red-100 text-red-800' :
                    analysis.strategy.includes('Value-Add') ? 'bg-amber-100 text-amber-800' :
                    analysis.strategy.includes('Cash Flow') ? 'bg-emerald-100 text-emerald-800' :
                    analysis.strategy.includes('House Hack') ? 'bg-purple-100 text-purple-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {analysis.strategy}
                  </div>
                  <p className="text-sm text-gray-700">{analysis.strategyDescription}</p>
                  
                  {analysis.quickFixes.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="text-xs font-semibold text-gray-500 mb-2">QUICK ADJUSTMENTS</div>
                      <div className="space-y-2">
                        {analysis.quickFixes.map((fix, i) => (
                          <button
                            key={i}
                            onClick={() => set(fix.field, fix.suggestedValue as never)}
                            className="w-full text-left px-3 py-2 bg-blue-50 hover:bg-blue-100 rounded border border-blue-200 transition-colors"
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-blue-800">{fix.label}</span>
                              <span className="text-xs text-blue-600">{fix.currentValue} → {fix.suggestedValue}</span>
                            </div>
                            <div className="text-xs text-blue-600">{fix.impact}</div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Key Metrics */}
              <div className="lg:col-span-2">
                <div className="space-y-2">
                  <MetricPill label="Cap Rate" value={`${fmtDec(calc.capRate)}%`} good={calc.capRate >= 6} bad={calc.capRate < 4} />
                  <MetricPill label="Cash-on-Cash" value={`${fmtDec(calc.cashOnCash)}%`} good={calc.cashOnCash >= 8} bad={calc.cashOnCash < 0} />
                  <MetricPill label="DSCR" value={fmtDec(calc.dscr)} good={calc.dscr >= 1.25} bad={calc.dscr < 1} />
                  <MetricPill label="Expense Ratio" value={`${fmtDec(calc.expenseRatio, 0)}%`} good={calc.expenseRatio <= 45} bad={calc.expenseRatio > 55} />
                  <MetricPill label="LTV" value={`${fmtDec(calc.ltv, 0)}%`} good={calc.ltv <= 70} bad={calc.ltv > 80} />
                </div>
              </div>

              {/* Insights */}
              <div className="lg:col-span-4 max-h-[300px] overflow-y-auto space-y-2 pr-2">
                {analysis.insights.slice(0, 6).map((insight, i) => (
                  <InsightCard key={i} insight={insight} />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* PROPERTY & UNITS - Side by Side */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {/* Property Info */}
          <section ref={el => { sectionsRef.current['property'] = el }} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <SectionHeader title="PROPERTY IDENTIFICATION" />
            <div className="p-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-gray-500 mb-1">Property Name</label>
                  <input
                    type="text"
                    value={inputs.propertyName}
                    onChange={e => set('propertyName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg font-semibold focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-gray-500 mb-1">Address</label>
                  <input
                    type="text"
                    value={inputs.propertyAddress}
                    onChange={e => set('propertyAddress', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-4 gap-2 pt-2 border-t border-gray-200">
                <StatBox label="Units" value={calc.totalUnits.toString()} />
                <StatBox label="Total SF" value={fmt(calc.totalSqft)} />
                <StatBox label="$/Unit" value={`$${fmt(calc.pricePerUnit)}`} />
                <StatBox label="$/SF" value={`$${fmtDec(calc.pricePerSqft)}`} />
              </div>
            </div>
          </section>

          {/* Acquisition & Financing */}
          <section ref={el => { sectionsRef.current['acquisition'] = el }} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <SectionHeader title="ACQUISITION & FINANCING" />
            <div className="p-4">
              <div className="grid grid-cols-3 gap-3">
                <CompactInput label="Purchase Price" value={inputs.purchasePrice} onChange={v => setNum('purchasePrice', v)} prefix="$" />
                <CompactInput label="Closing Costs" value={inputs.closingCosts} onChange={v => setNum('closingCosts', v)} prefix="$" />
                <CompactInput label="Repairs" value={inputs.immediateRepairs} onChange={v => setNum('immediateRepairs', v)} prefix="$" />
                <CompactInput label="Down Payment" value={inputs.downPaymentPct} onChange={v => setNum('downPaymentPct', v)} suffix="%" />
                <CompactInput label="Interest Rate" value={inputs.interestRate} onChange={v => setNum('interestRate', v)} suffix="%" />
                <CompactInput label="Loan Term" value={inputs.loanTermYears} onChange={v => setNum('loanTermYears', v)} suffix="yrs" />
              </div>
              
              <div className="grid grid-cols-4 gap-2 mt-3 pt-3 border-t border-gray-200">
                <StatBox label="Loan" value={`$${fmt(calc.loanAmount)}`} />
                <StatBox label="Monthly P&I" value={`$${fmt(calc.monthlyMortgage)}`} />
                <StatBox label="Cash Needed" value={`$${fmt(calc.totalCashRequired)}`} highlight />
                <StatBox label="LTV" value={`${fmtDec(calc.ltv, 0)}%`} />
              </div>
            </div>
          </section>
        </div>

        {/* UNITS TABLE */}
        <section ref={el => { sectionsRef.current['units'] = el }} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-[#1e3a5f] text-white px-4 py-2 flex items-center justify-between">
            <span className="font-semibold">RENT ROLL ({calc.totalUnits} Units)</span>
            <button onClick={addUnit} className="flex items-center gap-1 px-2 py-1 bg-white/20 hover:bg-white/30 rounded text-sm">
              <Plus size={14} /> Add
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-3 py-2 text-left font-medium text-gray-600">Unit</th>
                  <th className="px-3 py-2 text-center font-medium text-gray-600">Bed</th>
                  <th className="px-3 py-2 text-center font-medium text-gray-600">Bath</th>
                  <th className="px-3 py-2 text-right font-medium text-gray-600">SF</th>
                  <th className="px-3 py-2 text-right font-medium text-gray-600">Rent</th>
                  <th className="px-3 py-2 text-right font-medium text-gray-600">$/SF</th>
                  <th className="px-3 py-2 w-8"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {inputs.units.map((unit, idx) => (
                  <tr key={unit.id} className={idx % 2 ? 'bg-gray-50' : ''}>
                    <td className="px-3 py-1">
                      <input type="text" value={unit.unitNumber} onChange={e => updateUnit(unit.id, 'unitNumber', e.target.value)}
                        className="w-20 px-2 py-1 border border-gray-200 rounded text-sm" />
                    </td>
                    <td className="px-3 py-1 text-center">
                      <input type="number" value={unit.bedrooms} onChange={e => updateUnit(unit.id, 'bedrooms', e.target.value)}
                        className="w-12 px-1 py-1 border border-gray-200 rounded text-center text-sm" />
                    </td>
                    <td className="px-3 py-1 text-center">
                      <input type="number" value={unit.bathrooms} onChange={e => updateUnit(unit.id, 'bathrooms', e.target.value)}
                        className="w-12 px-1 py-1 border border-gray-200 rounded text-center text-sm" />
                    </td>
                    <td className="px-3 py-1 text-right">
                      <input type="number" value={unit.sqft} onChange={e => updateUnit(unit.id, 'sqft', e.target.value)}
                        className="w-16 px-1 py-1 border border-gray-200 rounded text-right text-sm" />
                    </td>
                    <td className="px-3 py-1 text-right">
                      <div className="flex items-center justify-end">
                        <span className="text-gray-400 mr-1">$</span>
                        <input type="number" value={unit.rent} onChange={e => updateUnit(unit.id, 'rent', e.target.value)}
                          className="w-20 px-1 py-1 border border-gray-200 rounded text-right text-sm" />
                      </div>
                    </td>
                    <td className="px-3 py-1 text-right text-gray-500">${fmtDec(unit.rent / unit.sqft)}</td>
                    <td className="px-3 py-1">
                      {inputs.units.length > 1 && (
                        <button onClick={() => removeUnit(unit.id)} className="text-gray-400 hover:text-red-500">
                          <Trash2 size={14} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-green-50 font-semibold border-t-2 border-green-200">
                <tr>
                  <td className="px-3 py-2">TOTAL</td>
                  <td className="px-3 py-2 text-center">{calc.totalUnits}</td>
                  <td className="px-3 py-2"></td>
                  <td className="px-3 py-2 text-right">{fmt(calc.totalSqft)}</td>
                  <td className="px-3 py-2 text-right text-green-700">${fmt(calc.monthlyRent)}</td>
                  <td className="px-3 py-2 text-right">${fmtDec(calc.monthlyRent / calc.totalSqft)}</td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </section>

        {/* INCOME & EXPENSES - Side by Side Compact */}
        <section ref={el => { sectionsRef.current['expenses'] = el }} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <SectionHeader title="INCOME & OPERATING EXPENSES" />
          <div className="p-4 grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Income */}
            <div>
              <div className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <DollarSign size={16} className="text-green-600" /> ANNUAL INCOME
              </div>
              <div className="space-y-1">
                <div className="flex justify-between py-1.5 px-2 bg-gray-50 rounded text-sm">
                  <span>Scheduled Rent (12 × ${fmt(calc.monthlyRent)})</span>
                  <span className="font-semibold">${fmt(calc.annualRent)}</span>
                </div>
                <InlineInput label="Laundry/mo" value={inputs.laundryIncome} onChange={v => setNum('laundryIncome', v)} prefix="$" />
                <InlineInput label="Parking/mo" value={inputs.parkingIncome} onChange={v => setNum('parkingIncome', v)} prefix="$" />
                <InlineInput label="Other/mo" value={inputs.otherIncome} onChange={v => setNum('otherIncome', v)} prefix="$" />
                <InlineInput label="Vacancy" value={inputs.vacancyPct} onChange={v => setNum('vacancyPct', v)} suffix="%" highlight />
                <div className="flex justify-between py-2 px-3 bg-green-100 rounded font-semibold text-green-800 border border-green-200">
                  <span>EFFECTIVE GROSS INCOME</span>
                  <span>${fmt(calc.year1EGI)}</span>
                </div>
              </div>
            </div>

            {/* Expenses */}
            <div>
              <div className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <Percent size={16} className="text-amber-600" /> OPERATING EXPENSES
              </div>
              <div className="grid grid-cols-2 gap-1">
                <InlineInput label="Property Taxes" value={inputs.realEstateTaxes} onChange={v => setNum('realEstateTaxes', v)} prefix="$" compact />
                <InlineInput label="Insurance" value={inputs.insurance} onChange={v => setNum('insurance', v)} prefix="$" compact />
                <InlineInput label="Water" value={inputs.water} onChange={v => setNum('water', v)} prefix="$" compact />
                <InlineInput label="Sewer" value={inputs.sewer} onChange={v => setNum('sewer', v)} prefix="$" compact />
                <InlineInput label="Gas" value={inputs.gas} onChange={v => setNum('gas', v)} prefix="$" compact />
                <InlineInput label="Electric" value={inputs.electric} onChange={v => setNum('electric', v)} prefix="$" compact />
                <InlineInput label="Trash" value={inputs.trash} onChange={v => setNum('trash', v)} prefix="$" compact />
                <InlineInput label="Landscaping" value={inputs.landscaping} onChange={v => setNum('landscaping', v)} prefix="$" compact />
                <InlineInput label="Repairs" value={inputs.repairsMaintenance} onChange={v => setNum('repairsMaintenance', v)} prefix="$" compact />
                <InlineInput label="Management" value={inputs.managementPct} onChange={v => setNum('managementPct', v)} suffix="%" compact />
                <InlineInput label="Legal/Acct" value={inputs.legalAccounting} onChange={v => setNum('legalAccounting', v)} prefix="$" compact />
                <InlineInput label="Reserves" value={inputs.replacementReserves} onChange={v => setNum('replacementReserves', v)} prefix="$" compact />
              </div>
              <div className="flex justify-between py-2 px-3 bg-yellow-100 rounded font-semibold text-yellow-800 border border-yellow-200 mt-2">
                <span>TOTAL EXPENSES</span>
                <span>${fmt(calc.year1TotalExpenses)}</span>
              </div>
            </div>
          </div>

          {/* NOI & Cash Flow Summary */}
          <div className="px-4 pb-4">
            <div className="grid grid-cols-4 gap-3 pt-3 border-t border-gray-200">
              <div className="bg-green-50 rounded-lg p-3 text-center border border-green-200">
                <div className="text-xs text-green-600 font-medium">Year 1 NOI</div>
                <div className="text-xl font-bold text-green-700">${fmt(calc.year1NOI)}</div>
              </div>
              <div className="bg-blue-50 rounded-lg p-3 text-center border border-blue-200">
                <div className="text-xs text-blue-600 font-medium">Debt Service</div>
                <div className="text-xl font-bold text-blue-700">${fmt(calc.annualDebtService)}</div>
              </div>
              <div className={`rounded-lg p-3 text-center border ${calc.year1CashFlow >= 0 ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'}`}>
                <div className={`text-xs font-medium ${calc.year1CashFlow >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>Year 1 Cash Flow</div>
                <div className={`text-xl font-bold ${calc.year1CashFlow >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>${fmt(calc.year1CashFlow)}</div>
              </div>
              <div className={`rounded-lg p-3 text-center border ${calc.cashOnCash >= 8 ? 'bg-emerald-50 border-emerald-200' : calc.cashOnCash >= 0 ? 'bg-gray-50 border-gray-200' : 'bg-red-50 border-red-200'}`}>
                <div className="text-xs text-gray-600 font-medium">Cash-on-Cash</div>
                <div className={`text-xl font-bold ${calc.cashOnCash >= 8 ? 'text-emerald-700' : calc.cashOnCash >= 0 ? 'text-gray-700' : 'text-red-700'}`}>{fmtDec(calc.cashOnCash)}%</div>
              </div>
            </div>
          </div>
        </section>

        {/* PROJECTION TABLE WITH INLINE EDITING */}
        <section ref={el => { sectionsRef.current['projection'] = el }} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-[#1e3a5f] text-white px-4 py-2 flex items-center justify-between">
            <span className="font-semibold">{inputs.projectionYears + 1}-YEAR PRO FORMA</span>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-blue-200">Rent Growth:</span>
                <input
                  type="number"
                  value={inputs.annualRentIncrease}
                  onChange={e => setNum('annualRentIncrease', e.target.value)}
                  className="w-14 px-2 py-0.5 bg-white/20 rounded text-center text-white"
                  step="0.5"
                />
                <span>%</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-blue-200">Expense Growth:</span>
                <input
                  type="number"
                  value={inputs.annualExpenseIncrease}
                  onChange={e => setNum('annualExpenseIncrease', e.target.value)}
                  className="w-14 px-2 py-0.5 bg-white/20 rounded text-center text-white"
                  step="0.5"
                />
                <span>%</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-blue-200">Years:</span>
                <input
                  type="number"
                  value={inputs.projectionYears}
                  onChange={e => setNum('projectionYears', e.target.value)}
                  className="w-12 px-2 py-0.5 bg-white/20 rounded text-center text-white"
                />
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-100 border-b border-gray-300">
                  <th className="px-3 py-2 text-left font-semibold text-gray-700 sticky left-0 bg-gray-100 min-w-[180px]">Line Item</th>
                  {calc.years.map(y => (
                    <th key={y.year} className="px-2 py-2 text-right font-semibold text-gray-700 min-w-[85px]">{y.year}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                <TableSection label="INCOME" />
                <DataRow label="Gross Rent" values={calc.years.map(y => y.scheduledRent)} />
                <DataRow label="Other Income" values={calc.years.map(y => y.otherIncome)} />
                <DataRow label="Vacancy" values={calc.years.map(y => -y.vacancy)} negative />
                <DataRow label="Effective Gross Income" values={calc.years.map(y => y.effectiveGrossIncome)} bold className="bg-green-50" />

                <TableSection label="OPERATING EXPENSES" />
                <DataRow label="Property Taxes" values={calc.years.map(y => y.realEstateTaxes)} />
                <DataRow label="Insurance" values={calc.years.map(y => y.insurance)} />
                <DataRow label="Utilities" values={calc.years.map(y => y.utilities)} />
                <DataRow label="Repairs & Maintenance" values={calc.years.map(y => y.repairsMaintenance)} />
                <DataRow label="Management" values={calc.years.map(y => y.management)} />
                <DataRow label="Other Operating" values={calc.years.map(y => y.trash + y.landscaping + y.legalAccounting + y.advertising + y.miscellaneous + y.replacementReserves)} />
                <DataRow label="Total Expenses" values={calc.years.map(y => y.totalOperatingExpenses)} bold className="bg-yellow-50" />

                <TableSection label="NET INCOME" />
                <DataRow label="NOI" values={calc.years.map(y => y.netOperatingIncome)} bold className="bg-green-100 text-green-800" />
                <DataRow label="Debt Service" values={calc.years.map(y => -y.debtService)} negative />
                <DataRow label="Cash Flow" values={calc.years.map(y => y.cashFlowBeforeTax)} bold className="bg-blue-100 text-blue-800" />
                
                <tr className="bg-gray-200 border-t-2 border-gray-300">
                  <td className="px-3 py-2 font-bold sticky left-0 bg-gray-200">Cash-on-Cash</td>
                  {calc.years.map(y => {
                    const coc = calc.totalCashRequired > 0 ? (y.cashFlowBeforeTax / calc.totalCashRequired) * 100 : 0
                    return (
                      <td key={y.year} className={`px-2 py-2 text-right font-bold ${coc >= 8 ? 'text-green-700' : coc >= 0 ? '' : 'text-red-600'}`}>
                        {fmtDec(coc)}%
                      </td>
                    )
                  })}
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <footer className="text-center text-gray-400 text-sm py-4">
          Investment Pro Forma Tool • Data saved locally
        </footer>
      </main>

      {/* SCROLL TO TOP */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="fixed bottom-6 right-6 w-12 h-12 bg-[#1e3a5f] text-white rounded-full shadow-lg flex items-center justify-center hover:bg-[#2d5a87] transition-colors"
      >
        <ChevronUp size={24} />
      </button>
    </div>
  )
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

function SectionHeader({ title }: { title: string }) {
  return <div className="bg-[#1e3a5f] text-white px-4 py-2 font-semibold">{title}</div>
}

function QuickInput({ label, value, onChange, prefix, suffix }: { label: string; value: number; onChange: (v: string) => void; prefix?: string; suffix?: string }) {
  return (
    <div className="flex items-center gap-1.5 whitespace-nowrap">
      <span className="text-slate-400 text-xs">{label}</span>
      {prefix && <span className="text-slate-500 text-sm">{prefix}</span>}
      <input
        type="number"
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-20 px-2 py-1 bg-slate-700 border border-slate-600 rounded text-sm text-right focus:ring-1 focus:ring-emerald-400"
      />
      {suffix && <span className="text-slate-500 text-sm">{suffix}</span>}
    </div>
  )
}

function CompactInput({ label, value, onChange, prefix, suffix }: { label: string; value: number; onChange: (v: string) => void; prefix?: string; suffix?: string }) {
  return (
    <div>
      <label className="block text-xs text-gray-500 mb-0.5">{label}</label>
      <div className="flex items-center border border-gray-300 rounded bg-white focus-within:ring-1 focus-within:ring-blue-500">
        {prefix && <span className="pl-2 text-gray-400 text-sm">{prefix}</span>}
        <input type="number" value={value} onChange={e => onChange(e.target.value)} className="flex-1 px-2 py-1.5 text-right text-sm focus:outline-none bg-transparent" />
        {suffix && <span className="pr-2 text-gray-400 text-xs">{suffix}</span>}
      </div>
    </div>
  )
}

function InlineInput({ label, value, onChange, prefix, suffix, compact, highlight }: { label: string; value: number; onChange: (v: string) => void; prefix?: string; suffix?: string; compact?: boolean; highlight?: boolean }) {
  return (
    <div className={`flex items-center justify-between py-1 px-2 rounded border ${highlight ? 'bg-amber-50 border-amber-200' : 'bg-white border-gray-100 hover:border-gray-300'}`}>
      <span className={`text-gray-600 ${compact ? 'text-xs' : 'text-sm'}`}>{label}</span>
      <div className="flex items-center">
        {prefix && <span className="text-gray-400 text-xs mr-1">{prefix}</span>}
        <input type="number" value={value} onChange={e => onChange(e.target.value)} className={`${compact ? 'w-16' : 'w-20'} px-1 py-0.5 border border-gray-200 rounded text-right text-sm focus:ring-1 focus:ring-blue-500`} />
        {suffix && <span className="text-gray-400 text-xs ml-1">{suffix}</span>}
      </div>
    </div>
  )
}

function StatBox({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`text-center p-2 rounded ${highlight ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50'}`}>
      <div className="text-xs text-gray-500">{label}</div>
      <div className={`font-semibold ${highlight ? 'text-blue-700' : ''}`}>{value}</div>
    </div>
  )
}

function MetricPill({ label, value, good, bad }: { label: string; value: string; good?: boolean; bad?: boolean }) {
  return (
    <div className={`flex items-center justify-between px-3 py-2 rounded-lg border ${bad ? 'bg-red-50 border-red-200' : good ? 'bg-emerald-50 border-emerald-200' : 'bg-gray-50 border-gray-200'}`}>
      <span className="text-sm text-gray-600">{label}</span>
      <span className={`font-bold ${bad ? 'text-red-700' : good ? 'text-emerald-700' : ''}`}>{value}</span>
    </div>
  )
}

function InsightCard({ insight }: { insight: DeepInsight }) {
  const icons = {
    critical: <XCircle size={16} className="text-red-500" />,
    warning: <AlertCircle size={16} className="text-amber-500" />,
    opportunity: <Lightbulb size={16} className="text-blue-500" />,
    strength: <CheckCircle size={16} className="text-emerald-500" />,
    tip: <Info size={16} className="text-purple-500" />,
  }
  const colors = {
    critical: 'bg-red-50 border-red-200',
    warning: 'bg-amber-50 border-amber-200',
    opportunity: 'bg-blue-50 border-blue-200',
    strength: 'bg-emerald-50 border-emerald-200',
    tip: 'bg-purple-50 border-purple-200',
  }
  
  return (
    <div className={`p-3 rounded-lg border ${colors[insight.type]}`}>
      <div className="flex items-start gap-2">
        {icons[insight.type]}
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-sm">{insight.title}</div>
          <p className="text-xs text-gray-600 mt-0.5">{insight.message}</p>
          {insight.action && <p className="text-xs text-gray-500 mt-1 italic">→ {insight.action}</p>}
        </div>
      </div>
    </div>
  )
}

function TableSection({ label }: { label: string }) {
  return (
    <tr className="bg-[#1e3a5f]">
      <td colSpan={100} className="px-3 py-1.5 text-white font-semibold text-xs sticky left-0 bg-[#1e3a5f]">{label}</td>
    </tr>
  )
}

function DataRow({ label, values, bold, negative, className = '' }: { label: string; values: number[]; bold?: boolean; negative?: boolean; className?: string }) {
  return (
    <tr className={className}>
      <td className={`px-3 py-1.5 sticky left-0 ${className || 'bg-white'} ${bold ? 'font-semibold' : 'text-gray-600'} text-sm`}>{label}</td>
      {values.map((v, i) => (
        <td key={i} className={`px-2 py-1.5 text-right font-mono text-sm ${negative && v < 0 ? 'text-red-600' : ''} ${bold ? 'font-semibold' : ''}`}>
          ${fmt(Math.abs(v))}
        </td>
      ))}
    </tr>
  )
}
