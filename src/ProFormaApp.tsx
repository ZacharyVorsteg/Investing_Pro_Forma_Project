import { useState, useMemo, useEffect, useRef } from 'react'
import { Plus, Trash2, Download, RotateCcw, Printer, XCircle, TrendingUp, AlertCircle, Lightbulb, ChevronUp, Settings, DollarSign, Percent, Target, Zap } from 'lucide-react'

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
// SOPHISTICATED ANALYSIS ENGINE
// ============================================================================

interface AnalysisInsight {
  category: 'critical' | 'outlier' | 'benchmark' | 'sensitivity' | 'opportunity'
  title: string
  detail: string
  metric?: string
  value?: string
}

interface BreakevenAnalysis {
  occupancyBreakeven: number
  rentBreakeven: number
  rateBreakeven: number | null
  yearsToPositiveCashFlow: number | null
}

interface SensitivityData {
  rateImpact: { rate: number; cashFlow: number; dscr: number }[]
  vacancyImpact: { vacancy: number; cashFlow: number; noi: number }[]
  priceImpact: { price: number; capRate: number; coc: number }[]
}

interface InvestmentAnalysis {
  dealType: string
  isCashDeal: boolean
  score: number
  grade: string
  gradeColor: string
  
  // Critical KPIs
  kpis: {
    label: string
    value: string
    benchmark: string
    status: 'good' | 'neutral' | 'warning' | 'critical'
    delta?: string
  }[]
  
  // Breakeven
  breakeven: BreakevenAnalysis
  
  // Sensitivity
  sensitivity: SensitivityData
  
  // Outliers & Insights
  insights: AnalysisInsight[]
  
  // Expense Analysis
  expenseAnalysis: {
    category: string
    annual: number
    perUnit: number
    pctOfEGI: number
    benchmark: { low: number; high: number }
    status: 'low' | 'normal' | 'high' | 'outlier'
  }[]
}

function generateSophisticatedAnalysis(
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
    year1EGI: number
    year1TotalExpenses: number
    annualDebtService: number
    grossRentMultiplier: number
    monthlyRent: number
    annualRent: number
    totalSqft: number
    totalUnits: number
    loanAmount: number
    totalCashRequired: number
    grossPotentialIncome: number
  }
): InvestmentAnalysis {
  const insights: AnalysisInsight[] = []
  
  const { capRate, cashOnCash, dscr, expenseRatio, pricePerUnit, pricePerSqft,
          year1NOI, year1CashFlow, year1EGI, year1TotalExpenses, annualDebtService, grossRentMultiplier,
          monthlyRent, totalSqft, totalUnits, loanAmount, grossPotentialIncome } = calc
  
  const { purchasePrice, downPaymentPct, interestRate, vacancyPct, managementPct,
          annualRentIncrease, annualExpenseIncrease, exitCapRate, realEstateTaxes,
          insurance, repairsMaintenance, loanTermYears, water, sewer, gas, electric,
          trash, landscaping } = inputs

  // ============================================
  // DEAL TYPE DETECTION
  // ============================================
  
  const isCashDeal = downPaymentPct >= 100 || loanAmount <= 0
  let dealType: string
  
  if (isCashDeal) {
    if (capRate >= 7) dealType = 'High-Yield Cash Acquisition'
    else if (capRate >= 5) dealType = 'Stabilized Cash Acquisition'
    else dealType = 'Premium Cash Acquisition'
  } else if (year1CashFlow < 0) {
    if (capRate > exitCapRate) dealType = 'Appreciation Play (Negative Leverage)'
    else dealType = 'Speculative / Turnaround'
  } else if (cashOnCash >= 10 && dscr >= 1.3) {
    dealType = 'Cash Flow Optimized'
  } else if (expenseRatio > 50) {
    dealType = 'Value-Add / Repositioning'
  } else {
    dealType = 'Stabilized Investment'
  }

  // ============================================
  // BREAKEVEN ANALYSIS
  // ============================================
  
  // Occupancy breakeven: What occupancy covers all expenses + debt?
  const totalObligations = year1TotalExpenses + annualDebtService
  const occupancyBreakeven = grossPotentialIncome > 0 
    ? Math.min(100, (totalObligations / grossPotentialIncome) * 100)
    : 100
  
  // Rent breakeven: What monthly rent covers obligations?
  const rentBreakeven = totalUnits > 0 
    ? (totalObligations / totalUnits / 12) / (1 - vacancyPct/100 - managementPct/100)
    : 0
  
  // Rate breakeven: At what rate does cash flow hit zero? (Only for leveraged deals)
  let rateBreakeven: number | null = null
  if (!isCashDeal && year1NOI > 0) {
    // Iterate to find rate where debt service = NOI
    for (let testRate = 1; testRate <= 15; testRate += 0.25) {
      const monthlyRate = testRate / 100 / 12
      const numPayments = loanTermYears * 12
      const testPayment = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / (Math.pow(1 + monthlyRate, numPayments) - 1)
      const testDebtService = testPayment * 12
      if (testDebtService >= year1NOI) {
        rateBreakeven = testRate
        break
      }
    }
  }
  
  // Years to positive cash flow (if currently negative)
  let yearsToPositiveCashFlow: number | null = null
  if (year1CashFlow < 0 && annualRentIncrease > annualExpenseIncrease) {
    const netGrowthRate = (1 + annualRentIncrease/100) / (1 + annualExpenseIncrease/100) - 1
    if (netGrowthRate > 0) {
      const targetNOI = annualDebtService
      yearsToPositiveCashFlow = Math.ceil(Math.log(targetNOI / year1NOI) / Math.log(1 + netGrowthRate))
      if (yearsToPositiveCashFlow > 30 || yearsToPositiveCashFlow < 0) yearsToPositiveCashFlow = null
    }
  }

  // ============================================
  // SENSITIVITY ANALYSIS
  // ============================================
  
  const rateImpact: SensitivityData['rateImpact'] = []
  if (!isCashDeal) {
    for (let r = Math.max(4, interestRate - 2); r <= interestRate + 2; r += 0.5) {
      const mr = r / 100 / 12
      const np = loanTermYears * 12
      const payment = loanAmount * (mr * Math.pow(1 + mr, np)) / (Math.pow(1 + mr, np) - 1)
      const ds = payment * 12
      const cf = year1NOI - ds
      const testDscr = ds > 0 ? year1NOI / ds : 0
      rateImpact.push({ rate: r, cashFlow: cf, dscr: testDscr })
    }
  }
  
  const vacancyImpact: SensitivityData['vacancyImpact'] = []
  for (let v = 0; v <= 15; v += 2.5) {
    const testEGI = grossPotentialIncome * (1 - v/100)
    const testMgmt = testEGI * (managementPct/100)
    const fixedExpenses = year1TotalExpenses - (year1EGI * managementPct/100)
    const testTotalExp = fixedExpenses + testMgmt
    const testNOI = testEGI - testTotalExp
    const testCF = testNOI - annualDebtService
    vacancyImpact.push({ vacancy: v, cashFlow: testCF, noi: testNOI })
  }
  
  const priceImpact: SensitivityData['priceImpact'] = []
  for (let pct = -15; pct <= 15; pct += 5) {
    const testPrice = purchasePrice * (1 + pct/100)
    const testCap = testPrice > 0 ? (year1NOI / testPrice) * 100 : 0
    const testDown = testPrice * (downPaymentPct/100)
    const testCash = testDown + inputs.closingCosts + inputs.immediateRepairs
    const testCoC = testCash > 0 ? (year1CashFlow / testCash) * 100 : 0
    priceImpact.push({ price: testPrice, capRate: testCap, coc: testCoC })
  }

  // ============================================
  // EXPENSE BENCHMARKING (per unit, industry standards)
  // ============================================
  
  const utilities = water + sewer + gas + electric
  const expenseAnalysis: InvestmentAnalysis['expenseAnalysis'] = [
    {
      category: 'Real Estate Taxes',
      annual: realEstateTaxes,
      perUnit: realEstateTaxes / totalUnits,
      pctOfEGI: (realEstateTaxes / year1EGI) * 100,
      benchmark: { low: 2000, high: 5000 },
      status: realEstateTaxes / totalUnits > 6000 ? 'outlier' : realEstateTaxes / totalUnits > 5000 ? 'high' : realEstateTaxes / totalUnits < 1500 ? 'low' : 'normal'
    },
    {
      category: 'Insurance',
      annual: insurance,
      perUnit: insurance / totalUnits,
      pctOfEGI: (insurance / year1EGI) * 100,
      benchmark: { low: 400, high: 1200 },
      status: insurance / totalUnits > 1500 ? 'outlier' : insurance / totalUnits > 1200 ? 'high' : insurance / totalUnits < 300 ? 'low' : 'normal'
    },
    {
      category: 'Utilities',
      annual: utilities,
      perUnit: utilities / totalUnits,
      pctOfEGI: (utilities / year1EGI) * 100,
      benchmark: { low: 600, high: 1500 },
      status: utilities / totalUnits > 2000 ? 'outlier' : utilities / totalUnits > 1500 ? 'high' : utilities / totalUnits < 400 ? 'low' : 'normal'
    },
    {
      category: 'Repairs & Maintenance',
      annual: repairsMaintenance,
      perUnit: repairsMaintenance / totalUnits,
      pctOfEGI: (repairsMaintenance / year1EGI) * 100,
      benchmark: { low: 300, high: 600 },
      status: repairsMaintenance / totalUnits > 800 ? 'outlier' : repairsMaintenance / totalUnits > 600 ? 'high' : repairsMaintenance / totalUnits < 200 ? 'low' : 'normal'
    },
    {
      category: 'Landscaping & Grounds',
      annual: landscaping + trash,
      perUnit: (landscaping + trash) / totalUnits,
      pctOfEGI: ((landscaping + trash) / year1EGI) * 100,
      benchmark: { low: 200, high: 500 },
      status: (landscaping + trash) / totalUnits > 700 ? 'outlier' : (landscaping + trash) / totalUnits > 500 ? 'high' : 'normal'
    },
  ]

  // ============================================
  // CRITICAL KPIs
  // ============================================
  
  const kpis: InvestmentAnalysis['kpis'] = []
  
  // Price per SF
  const avgPricePerSF = 250 // Market benchmark
  kpis.push({
    label: 'Price / SF',
    value: `$${fmtDec(pricePerSqft, 0)}`,
    benchmark: `Market avg ~$${avgPricePerSF}`,
    status: pricePerSqft > avgPricePerSF * 1.3 ? 'warning' : pricePerSqft < avgPricePerSF * 0.8 ? 'good' : 'neutral',
    delta: `${pricePerSqft > avgPricePerSF ? '+' : ''}${fmtDec(((pricePerSqft - avgPricePerSF) / avgPricePerSF) * 100, 0)}% vs avg`
  })
  
  // Price per Unit
  const avgPricePerUnit = 150000
  kpis.push({
    label: 'Price / Unit',
    value: `$${fmt(pricePerUnit)}`,
    benchmark: `Market avg ~$${fmt(avgPricePerUnit)}`,
    status: pricePerUnit > avgPricePerUnit * 1.4 ? 'warning' : pricePerUnit < avgPricePerUnit * 0.7 ? 'good' : 'neutral',
    delta: `${pricePerUnit > avgPricePerUnit ? '+' : ''}${fmtDec(((pricePerUnit - avgPricePerUnit) / avgPricePerUnit) * 100, 0)}% vs avg`
  })
  
  // GRM
  kpis.push({
    label: 'Gross Rent Multiplier',
    value: fmtDec(grossRentMultiplier, 1),
    benchmark: '8-12 typical',
    status: grossRentMultiplier > 14 ? 'warning' : grossRentMultiplier < 8 ? 'good' : 'neutral'
  })
  
  // Expense per Unit
  const expensePerUnit = year1TotalExpenses / totalUnits
  kpis.push({
    label: 'OpEx / Unit',
    value: `$${fmt(expensePerUnit)}`,
    benchmark: '$4,500-7,000 typical',
    status: expensePerUnit > 8000 ? 'warning' : expensePerUnit < 4000 ? 'good' : 'neutral'
  })
  
  // Rent per SF
  const rentPerSF = monthlyRent / totalSqft
  kpis.push({
    label: 'Rent / SF',
    value: `$${fmtDec(rentPerSF, 2)}`,
    benchmark: '$1.50-2.50 typical',
    status: rentPerSF > 3 ? 'good' : rentPerSF < 1.2 ? 'warning' : 'neutral'
  })
  
  // Tax Rate (as % of value)
  const effectiveTaxRate = (realEstateTaxes / purchasePrice) * 100
  kpis.push({
    label: 'Effective Tax Rate',
    value: `${fmtDec(effectiveTaxRate, 2)}%`,
    benchmark: '1.0-2.5% typical',
    status: effectiveTaxRate > 3 ? 'critical' : effectiveTaxRate > 2.5 ? 'warning' : 'neutral'
  })

  // ============================================
  // INSIGHTS - Quantified & Sophisticated
  // ============================================

  // === CASH DEAL SPECIFIC ===
  if (isCashDeal) {
    insights.push({
      category: 'benchmark',
      title: 'All-Cash Acquisition',
      detail: `Unleveraged return of ${fmtDec(capRate)}% (cap rate). Leveraging at 75% LTV with ${interestRate}% debt would ${capRate > interestRate ? `boost CoC to ~${fmtDec((year1NOI - (purchasePrice * 0.75 * interestRate/100 * 0.8)) / (purchasePrice * 0.25 + inputs.closingCosts) * 100)}%` : 'result in negative leverage'}.`,
      metric: 'leverage',
      value: 'All Cash'
    })
  }
  
  // === LEVERAGE ANALYSIS ===
  if (!isCashDeal) {
    const leverageSpread = capRate - interestRate
    if (leverageSpread < 0) {
      insights.push({
        category: 'critical',
        title: 'Negative Leverage',
        detail: `Cap rate (${fmtDec(capRate)}%) is ${fmtDec(Math.abs(leverageSpread))} bps below debt cost (${interestRate}%). Each dollar of debt destroys value. Breakeven rate: ${rateBreakeven ? fmtDec(rateBreakeven) + '%' : 'N/A'}.`,
        metric: 'leverage',
        value: `${fmtDec(leverageSpread)} bps`
      })
    } else if (leverageSpread < 1) {
      insights.push({
        category: 'benchmark',
        title: 'Thin Leverage Spread',
        detail: `Only ${fmtDec(leverageSpread * 100, 0)} bps between cap rate and debt cost. Minimal yield enhancement from leverage. Rate sensitivity: each 50 bps increase reduces cash flow by ~$${fmt(loanAmount * 0.005 * 0.8)}/yr.`,
        metric: 'leverage',
        value: `+${fmtDec(leverageSpread * 100, 0)} bps`
      })
    }
  }
  
  // === RATE SENSITIVITY ===
  if (!isCashDeal && rateBreakeven) {
    const cushion = rateBreakeven - interestRate
    insights.push({
      category: 'sensitivity',
      title: 'Interest Rate Cushion',
      detail: `Cash flow turns negative at ${fmtDec(rateBreakeven)}% (${fmtDec(cushion)} pts above current rate). A ${fmtDec(cushion/2)} pt rate increase cuts annual cash flow by ~$${fmt(Math.abs(rateImpact.find(r => Math.abs(r.rate - interestRate - cushion/2) < 0.3)?.cashFlow || 0) - Math.abs(year1CashFlow))}.`,
      metric: 'rate',
      value: `${fmtDec(cushion)} pts cushion`
    })
  }
  
  // === BREAKEVEN ===
  insights.push({
    category: 'benchmark',
    title: 'Occupancy Breakeven',
    detail: `Requires ${fmtDec(occupancyBreakeven, 1)}% occupancy to cover all operating expenses${isCashDeal ? '' : ' and debt service'}. Current assumption: ${100 - vacancyPct}%. Cushion: ${fmtDec(100 - vacancyPct - occupancyBreakeven, 1)} pts.`,
    metric: 'breakeven',
    value: `${fmtDec(occupancyBreakeven, 1)}%`
  })
  
  // Rent breakeven
  const currentAvgRent = monthlyRent / totalUnits
  const rentCushion = ((currentAvgRent - rentBreakeven) / currentAvgRent) * 100
  insights.push({
    category: 'benchmark',
    title: 'Rent Breakeven',
    detail: `Minimum avg rent to breakeven: $${fmt(rentBreakeven)}/unit/mo (current: $${fmt(currentAvgRent)}). ${rentCushion > 0 ? `${fmtDec(rentCushion, 0)}% margin before breakeven.` : `Currently ${fmtDec(Math.abs(rentCushion), 0)}% below breakeven.`}`,
    metric: 'breakeven',
    value: `$${fmt(rentBreakeven)}/unit`
  })
  
  // === EXPENSE OUTLIERS ===
  const outlierExpenses = expenseAnalysis.filter(e => e.status === 'outlier' || e.status === 'high')
  if (outlierExpenses.length > 0) {
    outlierExpenses.forEach(exp => {
      const overage = exp.perUnit - exp.benchmark.high
      const totalOverage = overage * totalUnits
      insights.push({
        category: 'outlier',
        title: `${exp.category} Above Benchmark`,
        detail: `$${fmt(exp.perUnit)}/unit vs benchmark ceiling of $${fmt(exp.benchmark.high)}. Excess: $${fmt(overage)}/unit ($${fmt(totalOverage)}/yr total). Reducing to benchmark adds $${fmt(totalOverage / (exitCapRate/100))} to exit value.`,
        metric: 'expenses',
        value: `+$${fmt(overage)}/unit`
      })
    })
  }
  
  // Low expense warning
  const lowExpenses = expenseAnalysis.filter(e => e.status === 'low')
  if (lowExpenses.length > 0) {
    lowExpenses.forEach(exp => {
      insights.push({
        category: 'outlier',
        title: `${exp.category} Below Typical`,
        detail: `$${fmt(exp.perUnit)}/unit is below typical range ($${fmt(exp.benchmark.low)}-$${fmt(exp.benchmark.high)}). Verify this isn't understated—could indicate deferred maintenance or upcoming increases.`,
        metric: 'expenses',
        value: `$${fmt(exp.perUnit)}/unit`
      })
    })
  }
  
  // === TAX ANALYSIS ===
  if (effectiveTaxRate > 2.5) {
    insights.push({
      category: 'critical',
      title: 'High Tax Burden',
      detail: `Effective rate of ${fmtDec(effectiveTaxRate)}% exceeds typical 1.0-2.5% range. Taxes consume ${fmtDec((realEstateTaxes/year1EGI)*100, 1)}% of EGI. Verify assessment basis and appeal potential.`,
      metric: 'taxes',
      value: `${fmtDec(effectiveTaxRate)}% effective`
    })
  }
  
  // === GROWTH DIFFERENTIAL ===
  const growthDiff = annualRentIncrease - annualExpenseIncrease
  if (Math.abs(growthDiff) >= 0.5) {
    insights.push({
      category: growthDiff > 0 ? 'opportunity' : 'benchmark',
      title: growthDiff > 0 ? 'Favorable Growth Spread' : 'Expense Growth Exceeds Rent',
      detail: growthDiff > 0 
        ? `Rent growth (${annualRentIncrease}%) exceeds expense growth (${annualExpenseIncrease}%) by ${fmtDec(growthDiff)} pts. NOI margin expands ~${fmtDec(growthDiff * expenseRatio / 100, 1)}% annually.`
        : `Expenses (${annualExpenseIncrease}%) outpace rent (${annualRentIncrease}%) by ${fmtDec(Math.abs(growthDiff))} pts. Margin compression of ~${fmtDec(Math.abs(growthDiff) * expenseRatio / 100, 1)}% annually.`,
      metric: 'growth',
      value: `${growthDiff > 0 ? '+' : ''}${fmtDec(growthDiff)} pts`
    })
  }
  
  // === YEARS TO POSITIVE (if negative cash flow) ===
  if (yearsToPositiveCashFlow !== null && year1CashFlow < 0) {
    insights.push({
      category: 'sensitivity',
      title: 'Path to Positive Cash Flow',
      detail: `At current growth rates, cash flow turns positive in Year ${yearsToPositiveCashFlow}. Cumulative negative cash flow until breakeven: ~$${fmt(Math.abs(year1CashFlow) * yearsToPositiveCashFlow * 0.6)}.`,
      metric: 'cashflow',
      value: `Year ${yearsToPositiveCashFlow}`
    })
  }
  
  // === EXIT ANALYSIS ===
  const exitCapSpread = exitCapRate - capRate
  if (Math.abs(exitCapSpread) >= 0.5) {
    insights.push({
      category: exitCapSpread < 0 ? 'benchmark' : 'opportunity',
      title: exitCapSpread < 0 ? 'Assumes Cap Rate Compression' : 'Conservative Exit Assumption',
      detail: exitCapSpread < 0
        ? `Exit cap (${exitCapRate}%) is ${fmtDec(Math.abs(exitCapSpread))} pts below entry (${fmtDec(capRate)}%). This implies ${fmtDec(Math.abs(exitCapSpread) / capRate * 100, 0)}% value increase from cap compression alone—validate market trajectory.`
        : `Exit cap (${exitCapRate}%) exceeds entry by ${fmtDec(exitCapSpread)} pts. Conservative assumption builds in cushion for market softening.`,
      metric: 'exit',
      value: `${exitCapSpread > 0 ? '+' : ''}${fmtDec(exitCapSpread)} pts`
    })
  }
  
  // === PRICE PER SF OUTLIER ===
  if (pricePerSqft > 400 || pricePerSqft < 150) {
    insights.push({
      category: 'outlier',
      title: pricePerSqft > 400 ? 'Premium Price/SF' : 'Below-Market Price/SF',
      detail: pricePerSqft > 400
        ? `$${fmtDec(pricePerSqft, 0)}/SF is elevated for multifamily. Typical range: $150-350/SF. Verify comps support this basis—may limit exit optionality.`
        : `$${fmtDec(pricePerSqft, 0)}/SF is below typical multifamily pricing. Investigate condition, location factors, or motivated seller dynamics.`,
      metric: 'basis',
      value: `$${fmtDec(pricePerSqft, 0)}/SF`
    })
  }
  
  // === DSCR ANALYSIS ===
  if (!isCashDeal) {
    if (dscr < 1.0) {
      insights.push({
        category: 'critical',
        title: 'DSCR Below 1.0x',
        detail: `NOI ($${fmt(year1NOI)}) fails to cover debt service ($${fmt(annualDebtService)}) by $${fmt(annualDebtService - year1NOI)}/yr. Annual cash contribution required. Most lenders require 1.20-1.25x minimum.`,
        metric: 'dscr',
        value: `${fmtDec(dscr, 2)}x`
      })
    } else if (dscr < 1.25) {
      insights.push({
        category: 'benchmark',
        title: 'Tight DSCR',
        detail: `${fmtDec(dscr, 2)}x coverage provides ${fmtDec((dscr - 1) * 100, 0)}% buffer above debt service. A ${fmtDec(5/dscr, 0)}% NOI decline would breach 1.0x. May limit refinancing options.`,
        metric: 'dscr',
        value: `${fmtDec(dscr, 2)}x`
      })
    }
  }

  // ============================================
  // SCORING
  // ============================================
  
  let score = 50
  
  // Cash flow weighted heavily
  if (cashOnCash >= 10) score += 20
  else if (cashOnCash >= 8) score += 15
  else if (cashOnCash >= 5) score += 8
  else if (cashOnCash >= 0) score += 2
  else score -= 15
  
  // DSCR or cash deal
  if (isCashDeal) score += 10
  else if (dscr >= 1.4) score += 15
  else if (dscr >= 1.25) score += 10
  else if (dscr >= 1.1) score += 3
  else if (dscr < 1) score -= 15
  
  // Cap rate
  if (capRate >= 7) score += 12
  else if (capRate >= 5.5) score += 6
  else if (capRate < 4) score -= 8
  
  // Expense efficiency
  if (expenseRatio <= 40) score += 8
  else if (expenseRatio > 55) score -= 8
  
  // Outliers penalty
  score -= outlierExpenses.length * 3
  
  score = Math.max(0, Math.min(100, score))
  
  let grade: string
  let gradeColor: string
  if (score >= 80) { grade = 'A'; gradeColor = 'emerald' }
  else if (score >= 70) { grade = 'B+'; gradeColor = 'blue' }
  else if (score >= 60) { grade = 'B'; gradeColor = 'blue' }
  else if (score >= 50) { grade = 'C+'; gradeColor = 'yellow' }
  else if (score >= 40) { grade = 'C'; gradeColor = 'yellow' }
  else if (score >= 30) { grade = 'D'; gradeColor = 'orange' }
  else { grade = 'F'; gradeColor = 'red' }

  // Sort insights by category priority
  const categoryOrder = { critical: 0, outlier: 1, sensitivity: 2, benchmark: 3, opportunity: 4 }
  insights.sort((a, b) => categoryOrder[a.category] - categoryOrder[b.category])

  return {
    dealType,
    isCashDeal,
    score,
    grade,
    gradeColor,
    kpis,
    breakeven: { occupancyBreakeven, rentBreakeven, rateBreakeven, yearsToPositiveCashFlow },
    sensitivity: { rateImpact, vacancyImpact, priceImpact },
    insights,
    expenseAnalysis,
  }
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function ProFormaApp() {
  const [inputs, setInputs] = useState<Inputs>(() => {
    const saved = localStorage.getItem('proforma-v6')
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
    localStorage.setItem('proforma-v6', JSON.stringify(inputs))
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
    if (confirm('Reset all values?')) {
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
    const dscr = annualDebtService > 0 ? year1NOI / annualDebtService : 999
    const expenseRatio = year1EGI > 0 ? (year1TotalExpenses / year1EGI) * 100 : 0

    // Year-by-year projection
    const years: {
      year: number
      scheduledRent: number
      otherIncome: number
      grossPotentialIncome: number
      vacancy: number
      effectiveGrossIncome: number
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

      const fixedExpenses = Object.values(baseExpenses).reduce((s, v) => s + v, 0) * expenseGrowth
      const mgmt = egi * (managementPct / 100)
      const totalOpex = fixedExpenses + mgmt
      const noi = egi - totalOpex
      const cashFlow = noi - annualDebtService

      years.push({
        year: currentYear + i,
        scheduledRent,
        otherIncome: yearOtherIncome,
        grossPotentialIncome: gpi,
        vacancy,
        effectiveGrossIncome: egi,
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

  // Generate analysis
  const analysis = useMemo(() => generateSophisticatedAnalysis(inputs, calc), [inputs, calc])

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      {/* HEADER */}
      <header className="bg-slate-900 text-white px-4 py-3 sticky top-0 z-50">
        <div className="max-w-[1800px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-bold tracking-tight">PRO FORMA</h1>
            <nav className="hidden md:flex items-center gap-1">
              {['Analysis', 'Property', 'Units', 'Financing', 'Expenses', 'Projection'].map(section => (
                <button key={section} onClick={() => scrollToSection(section.toLowerCase())} className="px-3 py-1 text-sm text-slate-400 hover:text-white rounded hover:bg-slate-800">
                  {section}
                </button>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowQuickEdit(!showQuickEdit)} className={`flex items-center gap-1 px-3 py-1.5 rounded text-sm ${showQuickEdit ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-slate-300'}`}>
              <Settings size={14} /> Quick Edit
            </button>
            <button onClick={reset} className="p-2 bg-slate-800 hover:bg-slate-700 rounded"><RotateCcw size={14} /></button>
            <button onClick={() => window.print()} className="p-2 bg-slate-800 hover:bg-slate-700 rounded"><Printer size={14} /></button>
            <button className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 rounded text-sm"><Download size={14} /> Export</button>
          </div>
        </div>
      </header>

      {/* QUICK EDIT */}
      {showQuickEdit && (
        <div className="bg-slate-800 text-white px-4 py-2 sticky top-[52px] z-40 border-b border-slate-700">
          <div className="max-w-[1800px] mx-auto flex items-center gap-4 overflow-x-auto text-sm">
            <QuickInput label="Price" value={inputs.purchasePrice} onChange={v => setNum('purchasePrice', v)} prefix="$" />
            <QuickInput label="Down" value={inputs.downPaymentPct} onChange={v => setNum('downPaymentPct', v)} suffix="%" />
            <QuickInput label="Rate" value={inputs.interestRate} onChange={v => setNum('interestRate', v)} suffix="%" />
            <QuickInput label="Vacancy" value={inputs.vacancyPct} onChange={v => setNum('vacancyPct', v)} suffix="%" />
            <QuickInput label="Rent↑" value={inputs.annualRentIncrease} onChange={v => setNum('annualRentIncrease', v)} suffix="%" />
            <QuickInput label="Exp↑" value={inputs.annualExpenseIncrease} onChange={v => setNum('annualExpenseIncrease', v)} suffix="%" />
            <QuickInput label="Exit Cap" value={inputs.exitCapRate} onChange={v => setNum('exitCapRate', v)} suffix="%" />
            <div className="border-l border-slate-600 pl-4 flex items-center gap-4">
              <Metric label="Cap" value={`${fmtDec(calc.capRate)}%`} />
              <Metric label="CoC" value={`${fmtDec(calc.cashOnCash)}%`} good={calc.cashOnCash > 0} bad={calc.cashOnCash < 0} />
              <Metric label="DSCR" value={fmtDec(calc.dscr, 2)} good={calc.dscr >= 1.25} bad={calc.dscr < 1} />
            </div>
          </div>
        </div>
      )}

      <main className="max-w-[1800px] mx-auto p-4 space-y-4">
        
        {/* ANALYSIS SECTION */}
        <section ref={el => { sectionsRef.current['analysis'] = el }} className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
          <div className="bg-slate-900 text-white px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Target size={20} />
              <span className="font-semibold">Investment Analysis</span>
              <span className="px-2 py-0.5 bg-slate-700 rounded text-xs">{analysis.dealType}</span>
              {analysis.isCashDeal && <span className="px-2 py-0.5 bg-emerald-600 rounded text-xs">Cash Deal</span>}
            </div>
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-lg font-bold ${
              analysis.gradeColor === 'emerald' ? 'bg-emerald-500' :
              analysis.gradeColor === 'blue' ? 'bg-blue-500' :
              analysis.gradeColor === 'yellow' ? 'bg-yellow-500 text-slate-900' :
              analysis.gradeColor === 'orange' ? 'bg-orange-500' :
              'bg-red-500'
            }`}>
              {analysis.grade}
            </div>
          </div>
          
          <div className="p-4">
            {/* KPIs Row */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-4">
              {analysis.kpis.map((kpi, i) => (
                <div key={i} className={`p-3 rounded border ${
                  kpi.status === 'critical' ? 'bg-red-50 border-red-200' :
                  kpi.status === 'warning' ? 'bg-amber-50 border-amber-200' :
                  kpi.status === 'good' ? 'bg-emerald-50 border-emerald-200' :
                  'bg-slate-50 border-slate-200'
                }`}>
                  <div className="text-xs text-slate-500">{kpi.label}</div>
                  <div className="text-lg font-bold">{kpi.value}</div>
                  {kpi.delta && <div className="text-xs text-slate-400">{kpi.delta}</div>}
                </div>
              ))}
            </div>

            {/* Breakeven & Sensitivity */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
              {/* Breakeven */}
              <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                <div className="flex items-center gap-2 font-semibold text-slate-700 mb-3">
                  <Zap size={16} /> Breakeven Analysis
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Occupancy Breakeven</span>
                    <span className="font-mono font-semibold">{fmtDec(analysis.breakeven.occupancyBreakeven, 1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Rent Breakeven</span>
                    <span className="font-mono font-semibold">${fmt(analysis.breakeven.rentBreakeven)}/unit</span>
                  </div>
                  {analysis.breakeven.rateBreakeven && (
                    <div className="flex justify-between">
                      <span className="text-slate-600">Rate Breakeven</span>
                      <span className="font-mono font-semibold">{fmtDec(analysis.breakeven.rateBreakeven)}%</span>
                    </div>
                  )}
                  {analysis.breakeven.yearsToPositiveCashFlow && (
                    <div className="flex justify-between text-amber-700">
                      <span>Years to Positive CF</span>
                      <span className="font-mono font-semibold">Year {analysis.breakeven.yearsToPositiveCashFlow}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Rate Sensitivity */}
              {!analysis.isCashDeal && (
                <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                  <div className="flex items-center gap-2 font-semibold text-slate-700 mb-3">
                    <Percent size={16} /> Rate Sensitivity
                  </div>
                  <div className="space-y-1 text-xs">
                    {analysis.sensitivity.rateImpact.map((r, i) => (
                      <div key={i} className={`flex justify-between py-1 px-2 rounded ${Math.abs(r.rate - inputs.interestRate) < 0.1 ? 'bg-slate-200 font-semibold' : ''}`}>
                        <span>{fmtDec(r.rate, 1)}%</span>
                        <span className={r.cashFlow >= 0 ? 'text-emerald-700' : 'text-red-600'}>${fmt(r.cashFlow)}</span>
                        <span className={r.dscr >= 1.25 ? 'text-emerald-700' : r.dscr >= 1 ? 'text-amber-600' : 'text-red-600'}>{fmtDec(r.dscr, 2)}x</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Vacancy Sensitivity */}
              <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                <div className="flex items-center gap-2 font-semibold text-slate-700 mb-3">
                  <TrendingUp size={16} /> Vacancy Sensitivity
                </div>
                <div className="space-y-1 text-xs">
                  {analysis.sensitivity.vacancyImpact.map((v, i) => (
                    <div key={i} className={`flex justify-between py-1 px-2 rounded ${Math.abs(v.vacancy - inputs.vacancyPct) < 0.1 ? 'bg-slate-200 font-semibold' : ''}`}>
                      <span>{fmtDec(v.vacancy, 0)}% vacancy</span>
                      <span>NOI: ${fmt(v.noi)}</span>
                      <span className={v.cashFlow >= 0 ? 'text-emerald-700' : 'text-red-600'}>CF: ${fmt(v.cashFlow)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Insights */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {analysis.insights.slice(0, 9).map((insight, i) => (
                <InsightCard key={i} insight={insight} />
              ))}
            </div>

            {/* Expense Benchmarking */}
            {analysis.expenseAnalysis.some(e => e.status !== 'normal') && (
              <div className="mt-4 pt-4 border-t border-slate-200">
                <div className="text-sm font-semibold text-slate-700 mb-2">Expense Benchmarking (per unit)</div>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                  {analysis.expenseAnalysis.map((exp, i) => (
                    <div key={i} className={`p-2 rounded text-xs ${
                      exp.status === 'outlier' ? 'bg-red-50 border border-red-200' :
                      exp.status === 'high' ? 'bg-amber-50 border border-amber-200' :
                      exp.status === 'low' ? 'bg-blue-50 border border-blue-200' :
                      'bg-slate-50'
                    }`}>
                      <div className="font-medium text-slate-700">{exp.category}</div>
                      <div className="font-bold">${fmt(exp.perUnit)}/unit</div>
                      <div className="text-slate-400">Benchmark: ${fmt(exp.benchmark.low)}-${fmt(exp.benchmark.high)}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* PROPERTY & FINANCING */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <section ref={el => { sectionsRef.current['property'] = el }} className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
            <SectionHeader title="Property" />
            <div className="p-4 space-y-3">
              <input type="text" value={inputs.propertyName} onChange={e => set('propertyName', e.target.value)} placeholder="Property Name" className="w-full px-3 py-2 border border-slate-300 rounded-lg text-lg font-semibold" />
              <input type="text" value={inputs.propertyAddress} onChange={e => set('propertyAddress', e.target.value)} placeholder="Address" className="w-full px-3 py-2 border border-slate-300 rounded-lg" />
              <div className="grid grid-cols-4 gap-2 pt-2 border-t border-slate-200">
                <StatBox label="Units" value={String(calc.totalUnits)} />
                <StatBox label="SF" value={fmt(calc.totalSqft)} />
                <StatBox label="$/Unit" value={`$${fmt(calc.pricePerUnit)}`} />
                <StatBox label="$/SF" value={`$${fmtDec(calc.pricePerSqft, 0)}`} />
              </div>
            </div>
          </section>

          <section ref={el => { sectionsRef.current['financing'] = el }} className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
            <SectionHeader title="Acquisition & Financing" />
            <div className="p-4">
              <div className="grid grid-cols-3 gap-3 mb-3">
                <CompactInput label="Purchase Price" value={inputs.purchasePrice} onChange={v => setNum('purchasePrice', v)} prefix="$" />
                <CompactInput label="Closing Costs" value={inputs.closingCosts} onChange={v => setNum('closingCosts', v)} prefix="$" />
                <CompactInput label="Repairs" value={inputs.immediateRepairs} onChange={v => setNum('immediateRepairs', v)} prefix="$" />
                <CompactInput label="Down Payment" value={inputs.downPaymentPct} onChange={v => setNum('downPaymentPct', v)} suffix="%" />
                <CompactInput label="Interest Rate" value={inputs.interestRate} onChange={v => setNum('interestRate', v)} suffix="%" />
                <CompactInput label="Term (Years)" value={inputs.loanTermYears} onChange={v => setNum('loanTermYears', v)} />
              </div>
              <div className="grid grid-cols-4 gap-2 pt-2 border-t border-slate-200 text-sm">
                <StatBox label="Loan" value={`$${fmt(calc.loanAmount)}`} />
                <StatBox label="P&I/mo" value={`$${fmt(calc.monthlyMortgage)}`} />
                <StatBox label="Cash In" value={`$${fmt(calc.totalCashRequired)}`} />
                <StatBox label="LTV" value={`${fmtDec(calc.ltv, 0)}%`} />
              </div>
            </div>
          </section>
        </div>

        {/* UNITS */}
        <section ref={el => { sectionsRef.current['units'] = el }} className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
          <div className="bg-slate-900 text-white px-4 py-2 flex items-center justify-between">
            <span className="font-semibold">Rent Roll</span>
            <button onClick={addUnit} className="flex items-center gap-1 px-2 py-1 bg-slate-700 hover:bg-slate-600 rounded text-sm"><Plus size={14} /> Add</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-3 py-2 text-left font-medium text-slate-600">Unit</th>
                  <th className="px-3 py-2 text-center font-medium text-slate-600">Bed</th>
                  <th className="px-3 py-2 text-center font-medium text-slate-600">Bath</th>
                  <th className="px-3 py-2 text-right font-medium text-slate-600">SF</th>
                  <th className="px-3 py-2 text-right font-medium text-slate-600">Rent</th>
                  <th className="px-3 py-2 text-right font-medium text-slate-600">$/SF</th>
                  <th className="px-3 py-2 w-8"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {inputs.units.map((unit, idx) => (
                  <tr key={unit.id} className={idx % 2 ? 'bg-slate-50' : ''}>
                    <td className="px-3 py-1"><input type="text" value={unit.unitNumber} onChange={e => updateUnit(unit.id, 'unitNumber', e.target.value)} className="w-20 px-2 py-1 border border-slate-200 rounded" /></td>
                    <td className="px-3 py-1 text-center"><input type="number" value={unit.bedrooms} onChange={e => updateUnit(unit.id, 'bedrooms', e.target.value)} className="w-12 px-1 py-1 border border-slate-200 rounded text-center" /></td>
                    <td className="px-3 py-1 text-center"><input type="number" value={unit.bathrooms} onChange={e => updateUnit(unit.id, 'bathrooms', e.target.value)} className="w-12 px-1 py-1 border border-slate-200 rounded text-center" /></td>
                    <td className="px-3 py-1 text-right"><input type="number" value={unit.sqft} onChange={e => updateUnit(unit.id, 'sqft', e.target.value)} className="w-16 px-1 py-1 border border-slate-200 rounded text-right" /></td>
                    <td className="px-3 py-1 text-right"><input type="number" value={unit.rent} onChange={e => updateUnit(unit.id, 'rent', e.target.value)} className="w-20 px-1 py-1 border border-slate-200 rounded text-right" /></td>
                    <td className="px-3 py-1 text-right text-slate-500">${fmtDec(unit.rent / unit.sqft)}</td>
                    <td className="px-3 py-1">{inputs.units.length > 1 && <button onClick={() => removeUnit(unit.id)} className="text-slate-400 hover:text-red-500"><Trash2 size={14} /></button>}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-emerald-50 font-semibold">
                <tr>
                  <td className="px-3 py-2">Total ({calc.totalUnits})</td>
                  <td className="px-3 py-2"></td>
                  <td className="px-3 py-2"></td>
                  <td className="px-3 py-2 text-right">{fmt(calc.totalSqft)}</td>
                  <td className="px-3 py-2 text-right text-emerald-700">${fmt(calc.monthlyRent)}</td>
                  <td className="px-3 py-2 text-right">${fmtDec(calc.monthlyRent / calc.totalSqft)}</td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </section>

        {/* EXPENSES */}
        <section ref={el => { sectionsRef.current['expenses'] = el }} className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
          <SectionHeader title="Operating Expenses" />
          <div className="p-4 grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <div className="text-sm font-semibold text-slate-700 mb-2"><DollarSign size={14} className="inline mr-1" />Income</div>
              <div className="space-y-1">
                <div className="flex justify-between py-1.5 px-2 bg-slate-50 rounded text-sm"><span>Annual Rent</span><span className="font-semibold">${fmt(calc.annualRent)}</span></div>
                <InlineInput label="Laundry/mo" value={inputs.laundryIncome} onChange={v => setNum('laundryIncome', v)} prefix="$" />
                <InlineInput label="Other/mo" value={inputs.otherIncome} onChange={v => setNum('otherIncome', v)} prefix="$" />
                <InlineInput label="Vacancy" value={inputs.vacancyPct} onChange={v => setNum('vacancyPct', v)} suffix="%" />
                <div className="flex justify-between py-2 px-3 bg-emerald-100 rounded font-semibold text-emerald-800 border border-emerald-200"><span>EGI</span><span>${fmt(calc.year1EGI)}</span></div>
              </div>
            </div>
            <div>
              <div className="text-sm font-semibold text-slate-700 mb-2"><Percent size={14} className="inline mr-1" />Expenses</div>
              <div className="grid grid-cols-2 gap-1">
                <InlineInput label="Taxes" value={inputs.realEstateTaxes} onChange={v => setNum('realEstateTaxes', v)} prefix="$" compact />
                <InlineInput label="Insurance" value={inputs.insurance} onChange={v => setNum('insurance', v)} prefix="$" compact />
                <InlineInput label="Water" value={inputs.water} onChange={v => setNum('water', v)} prefix="$" compact />
                <InlineInput label="Sewer" value={inputs.sewer} onChange={v => setNum('sewer', v)} prefix="$" compact />
                <InlineInput label="Gas" value={inputs.gas} onChange={v => setNum('gas', v)} prefix="$" compact />
                <InlineInput label="Electric" value={inputs.electric} onChange={v => setNum('electric', v)} prefix="$" compact />
                <InlineInput label="Trash" value={inputs.trash} onChange={v => setNum('trash', v)} prefix="$" compact />
                <InlineInput label="Landscape" value={inputs.landscaping} onChange={v => setNum('landscaping', v)} prefix="$" compact />
                <InlineInput label="Repairs" value={inputs.repairsMaintenance} onChange={v => setNum('repairsMaintenance', v)} prefix="$" compact />
                <InlineInput label="Mgmt %" value={inputs.managementPct} onChange={v => setNum('managementPct', v)} suffix="%" compact />
                <InlineInput label="Reserves" value={inputs.replacementReserves} onChange={v => setNum('replacementReserves', v)} prefix="$" compact />
                <InlineInput label="Other" value={inputs.miscellaneous} onChange={v => setNum('miscellaneous', v)} prefix="$" compact />
              </div>
              <div className="flex justify-between py-2 px-3 bg-amber-100 rounded font-semibold text-amber-800 border border-amber-200 mt-2"><span>Total OpEx</span><span>${fmt(calc.year1TotalExpenses)}</span></div>
            </div>
          </div>
          <div className="px-4 pb-4 grid grid-cols-4 gap-3 border-t border-slate-200 pt-4">
            <ResultBox label="NOI" value={`$${fmt(calc.year1NOI)}`} highlight={calc.year1NOI > 0} />
            <ResultBox label="Debt Service" value={`$${fmt(calc.annualDebtService)}`} />
            <ResultBox label="Cash Flow" value={`$${fmt(calc.year1CashFlow)}`} highlight={calc.year1CashFlow > 0} negative={calc.year1CashFlow < 0} />
            <ResultBox label="Cash-on-Cash" value={`${fmtDec(calc.cashOnCash)}%`} highlight={calc.cashOnCash >= 8} negative={calc.cashOnCash < 0} />
          </div>
        </section>

        {/* PROJECTION */}
        <section ref={el => { sectionsRef.current['projection'] = el }} className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
          <div className="bg-slate-900 text-white px-4 py-2 flex items-center justify-between">
            <span className="font-semibold">{inputs.projectionYears + 1}-Year Pro Forma</span>
            <div className="flex items-center gap-3 text-sm">
              <div className="flex items-center gap-1">
                <span className="text-slate-400">Rent↑</span>
                <input type="number" value={inputs.annualRentIncrease} onChange={e => setNum('annualRentIncrease', e.target.value)} className="w-12 px-1 py-0.5 bg-slate-700 rounded text-center" step="0.5" />%
              </div>
              <div className="flex items-center gap-1">
                <span className="text-slate-400">Exp↑</span>
                <input type="number" value={inputs.annualExpenseIncrease} onChange={e => setNum('annualExpenseIncrease', e.target.value)} className="w-12 px-1 py-0.5 bg-slate-700 rounded text-center" step="0.5" />%
              </div>
              <div className="flex items-center gap-1">
                <span className="text-slate-400">Years</span>
                <input type="number" value={inputs.projectionYears} onChange={e => setNum('projectionYears', e.target.value)} className="w-10 px-1 py-0.5 bg-slate-700 rounded text-center" />
              </div>
              <div className="flex items-center gap-1">
                <span className="text-slate-400">Exit Cap</span>
                <input type="number" value={inputs.exitCapRate} onChange={e => setNum('exitCapRate', e.target.value)} className="w-12 px-1 py-0.5 bg-slate-700 rounded text-center" step="0.25" />%
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-100">
                <tr>
                  <th className="px-3 py-2 text-left font-semibold text-slate-700 sticky left-0 bg-slate-100 min-w-[160px]">Line Item</th>
                  {calc.years.map(y => <th key={y.year} className="px-2 py-2 text-right font-semibold text-slate-700 min-w-[80px]">{y.year}</th>)}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <DataRow label="Gross Rent" values={calc.years.map(y => y.scheduledRent)} />
                <DataRow label="Vacancy" values={calc.years.map(y => -y.vacancy)} negative />
                <DataRow label="EGI" values={calc.years.map(y => y.effectiveGrossIncome)} bold className="bg-emerald-50" />
                <DataRow label="Operating Expenses" values={calc.years.map(y => -y.totalOperatingExpenses)} negative />
                <DataRow label="NOI" values={calc.years.map(y => y.netOperatingIncome)} bold className="bg-emerald-100" />
                <DataRow label="Debt Service" values={calc.years.map(y => -y.debtService)} negative />
                <DataRow label="Cash Flow" values={calc.years.map(y => y.cashFlowBeforeTax)} bold className="bg-blue-100" />
                <tr className="bg-slate-200">
                  <td className="px-3 py-2 font-bold sticky left-0 bg-slate-200">Cash-on-Cash</td>
                  {calc.years.map(y => {
                    const coc = calc.totalCashRequired > 0 ? (y.cashFlowBeforeTax / calc.totalCashRequired) * 100 : 0
                    return <td key={y.year} className={`px-2 py-2 text-right font-bold ${coc >= 8 ? 'text-emerald-700' : coc >= 0 ? '' : 'text-red-600'}`}>{fmtDec(coc)}%</td>
                  })}
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <footer className="text-center text-slate-400 text-sm py-4">Pro Forma Analysis Tool</footer>
      </main>

      <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="fixed bottom-4 right-4 w-10 h-10 bg-slate-900 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-slate-700">
        <ChevronUp size={20} />
      </button>
    </div>
  )
}

// ============================================================================
// COMPONENTS
// ============================================================================

function SectionHeader({ title }: { title: string }) {
  return <div className="bg-slate-900 text-white px-4 py-2 font-semibold">{title}</div>
}

function QuickInput({ label, value, onChange, prefix, suffix }: { label: string; value: number; onChange: (v: string) => void; prefix?: string; suffix?: string }) {
  return (
    <div className="flex items-center gap-1 whitespace-nowrap">
      <span className="text-slate-400 text-xs">{label}</span>
      {prefix && <span className="text-slate-500">{prefix}</span>}
      <input type="number" value={value} onChange={e => onChange(e.target.value)} className="w-20 px-2 py-1 bg-slate-700 border border-slate-600 rounded text-right text-sm" />
      {suffix && <span className="text-slate-500">{suffix}</span>}
    </div>
  )
}

function Metric({ label, value, good, bad }: { label: string; value: string; good?: boolean; bad?: boolean }) {
  return (
    <div className="text-center">
      <div className="text-xs text-slate-400">{label}</div>
      <div className={`font-bold ${bad ? 'text-red-400' : good ? 'text-emerald-400' : 'text-white'}`}>{value}</div>
    </div>
  )
}

function CompactInput({ label, value, onChange, prefix, suffix }: { label: string; value: number; onChange: (v: string) => void; prefix?: string; suffix?: string }) {
  return (
    <div>
      <label className="block text-xs text-slate-500 mb-0.5">{label}</label>
      <div className="flex items-center border border-slate-300 rounded bg-white">
        {prefix && <span className="pl-2 text-slate-400 text-sm">{prefix}</span>}
        <input type="number" value={value} onChange={e => onChange(e.target.value)} className="flex-1 px-2 py-1.5 text-right text-sm focus:outline-none" />
        {suffix && <span className="pr-2 text-slate-400 text-xs">{suffix}</span>}
      </div>
    </div>
  )
}

function InlineInput({ label, value, onChange, prefix, suffix, compact }: { label: string; value: number; onChange: (v: string) => void; prefix?: string; suffix?: string; compact?: boolean }) {
  return (
    <div className="flex items-center justify-between py-1 px-2 bg-white rounded border border-slate-100 hover:border-slate-300">
      <span className={`text-slate-600 ${compact ? 'text-xs' : 'text-sm'}`}>{label}</span>
      <div className="flex items-center">
        {prefix && <span className="text-slate-400 text-xs mr-1">{prefix}</span>}
        <input type="number" value={value} onChange={e => onChange(e.target.value)} className={`${compact ? 'w-16' : 'w-20'} px-1 py-0.5 border border-slate-200 rounded text-right text-sm`} />
        {suffix && <span className="text-slate-400 text-xs ml-1">{suffix}</span>}
      </div>
    </div>
  )
}

function StatBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center p-2 bg-slate-50 rounded">
      <div className="text-xs text-slate-500">{label}</div>
      <div className="font-semibold">{value}</div>
    </div>
  )
}

function ResultBox({ label, value, highlight, negative }: { label: string; value: string; highlight?: boolean; negative?: boolean }) {
  return (
    <div className={`p-3 rounded text-center ${negative ? 'bg-red-50 border border-red-200' : highlight ? 'bg-emerald-50 border border-emerald-200' : 'bg-slate-50 border border-slate-200'}`}>
      <div className="text-xs text-slate-500">{label}</div>
      <div className={`text-lg font-bold ${negative ? 'text-red-700' : highlight ? 'text-emerald-700' : ''}`}>{value}</div>
    </div>
  )
}

function InsightCard({ insight }: { insight: AnalysisInsight }) {
  const icons = {
    critical: <XCircle size={14} className="text-red-500" />,
    outlier: <AlertCircle size={14} className="text-amber-500" />,
    benchmark: <Target size={14} className="text-slate-500" />,
    sensitivity: <TrendingUp size={14} className="text-blue-500" />,
    opportunity: <Lightbulb size={14} className="text-emerald-500" />,
  }
  const colors = {
    critical: 'bg-red-50 border-red-200',
    outlier: 'bg-amber-50 border-amber-200',
    benchmark: 'bg-slate-50 border-slate-200',
    sensitivity: 'bg-blue-50 border-blue-200',
    opportunity: 'bg-emerald-50 border-emerald-200',
  }
  
  return (
    <div className={`p-3 rounded border ${colors[insight.category]}`}>
      <div className="flex items-start gap-2">
        <div className="mt-0.5">{icons[insight.category]}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-sm">{insight.title}</span>
            {insight.value && <span className="text-xs font-mono bg-white px-1.5 py-0.5 rounded">{insight.value}</span>}
          </div>
          <p className="text-xs text-slate-600 mt-1">{insight.detail}</p>
        </div>
      </div>
    </div>
  )
}

function DataRow({ label, values, bold, negative, className = '' }: { label: string; values: number[]; bold?: boolean; negative?: boolean; className?: string }) {
  return (
    <tr className={className}>
      <td className={`px-3 py-1.5 sticky left-0 ${className || 'bg-white'} ${bold ? 'font-semibold' : 'text-slate-600'}`}>{label}</td>
      {values.map((v, i) => (
        <td key={i} className={`px-2 py-1.5 text-right font-mono ${negative && v < 0 ? 'text-red-600' : ''} ${bold ? 'font-semibold' : ''}`}>
          ${fmt(Math.abs(v))}
        </td>
      ))}
    </tr>
  )
}
