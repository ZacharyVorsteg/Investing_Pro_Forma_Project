import { useState, useMemo, useEffect } from 'react'
import { Plus, Trash2, Download, RotateCcw, Printer, HelpCircle, CheckCircle, XCircle, TrendingUp, Info } from 'lucide-react'

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
  
  // Acquisition
  purchasePrice: number
  closingCosts: number
  immediateRepairs: number
  
  // Financing
  downPaymentPct: number
  interestRate: number
  loanTermYears: number
  
  // Units
  units: Unit[]
  
  // Other Income
  laundryIncome: number
  parkingIncome: number
  storageIncome: number
  otherIncome: number
  
  // Operating Expenses
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
  
  // Assumptions
  vacancyPct: number
  annualRentIncrease: number
  annualExpenseIncrease: number
  projectionYears: number
  exitCapRate: number
}

// ============================================================================
// DEFAULT VALUES - Croissant Park Example
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
// INVESTMENT GRADING LOGIC
// ============================================================================

type Grade = 'A' | 'B' | 'C' | 'D' | 'F'
type Strategy = 'core' | 'core-plus' | 'value-add' | 'opportunistic' | 'owner-user'

interface MetricGrade {
  grade: Grade
  score: number
  label: string
  insight: string
}

interface InvestmentAnalysis {
  overallGrade: Grade
  overallScore: number
  strategy: Strategy
  strategyName: string
  strategyDescription: string
  
  capRateGrade: MetricGrade
  cashOnCashGrade: MetricGrade
  dscrGrade: MetricGrade
  expenseRatioGrade: MetricGrade
  vacancyGrade: MetricGrade
  leverageGrade: MetricGrade
  
  strengths: string[]
  concerns: string[]
  considerations: string[]
}

function gradeCapRate(capRate: number): MetricGrade {
  if (capRate >= 8) return { grade: 'A', score: 95, label: 'Excellent', insight: 'Strong cash flow potential relative to price. Typical of value-add or higher-risk markets.' }
  if (capRate >= 6.5) return { grade: 'B', score: 80, label: 'Good', insight: 'Solid returns. Common in stable suburban markets with growth potential.' }
  if (capRate >= 5) return { grade: 'C', score: 65, label: 'Average', insight: 'Typical for primary markets. Returns rely more on appreciation than cash flow.' }
  if (capRate >= 4) return { grade: 'D', score: 50, label: 'Below Average', insight: 'Low yield suggests premium pricing. May work for institutional or long-term hold.' }
  return { grade: 'F', score: 30, label: 'Poor', insight: 'Very low cap rate. Ensure appreciation potential justifies the price.' }
}

function gradeCashOnCash(coc: number): MetricGrade {
  if (coc >= 12) return { grade: 'A', score: 95, label: 'Excellent', insight: 'Outstanding returns on your invested capital. Exceeds most alternative investments.' }
  if (coc >= 8) return { grade: 'B', score: 80, label: 'Good', insight: 'Strong cash-on-cash. Your equity is working hard for you.' }
  if (coc >= 5) return { grade: 'C', score: 65, label: 'Average', insight: 'Acceptable returns. Consider ways to improve through rent increases or expense reduction.' }
  if (coc >= 2) return { grade: 'D', score: 50, label: 'Below Average', insight: 'Marginal returns. Relies heavily on appreciation for profitability.' }
  if (coc >= 0) return { grade: 'D', score: 40, label: 'Breakeven', insight: 'Barely covering costs. Evaluate if this is a strategic hold or needs repositioning.' }
  return { grade: 'F', score: 20, label: 'Negative', insight: 'Losing money each month. Urgent need to increase income or reduce expenses.' }
}

function gradeDSCR(dscr: number): MetricGrade {
  if (dscr >= 1.5) return { grade: 'A', score: 95, label: 'Excellent', insight: 'Strong debt coverage. Lenders love this. Room to weather vacancies or surprises.' }
  if (dscr >= 1.25) return { grade: 'B', score: 80, label: 'Good', insight: 'Healthy coverage. Meets most lender requirements comfortably.' }
  if (dscr >= 1.1) return { grade: 'C', score: 65, label: 'Adequate', insight: 'Minimum acceptable coverage. Little margin for error.' }
  if (dscr >= 1.0) return { grade: 'D', score: 45, label: 'Tight', insight: 'Just covering debt. Any vacancy or expense increase could cause issues.' }
  return { grade: 'F', score: 20, label: 'Insufficient', insight: 'NOI doesn\'t cover debt service. Consider more equity or renegotiating terms.' }
}

function gradeExpenseRatio(ratio: number): MetricGrade {
  if (ratio <= 35) return { grade: 'A', score: 95, label: 'Excellent', insight: 'Very efficient operations. Ensure you\'re not under-maintaining the property.' }
  if (ratio <= 45) return { grade: 'B', score: 80, label: 'Good', insight: 'Well-managed expenses. Typical of newer or well-maintained properties.' }
  if (ratio <= 55) return { grade: 'C', score: 65, label: 'Average', insight: 'Normal expense ratio for most multifamily. Look for efficiency opportunities.' }
  if (ratio <= 65) return { grade: 'D', score: 50, label: 'High', insight: 'Expenses eating into profits. Review each category for savings.' }
  return { grade: 'F', score: 30, label: 'Very High', insight: 'Significant expense burden. May indicate deferred maintenance or inefficiencies.' }
}

function gradeVacancy(vacancy: number): MetricGrade {
  if (vacancy <= 3) return { grade: 'A', score: 95, label: 'Excellent', insight: 'Very low vacancy assumption. Ensure this is realistic for your market.' }
  if (vacancy <= 5) return { grade: 'B', score: 80, label: 'Conservative', insight: 'Standard vacancy factor. Good for most stable markets.' }
  if (vacancy <= 8) return { grade: 'C', score: 65, label: 'Moderate', insight: 'Higher vacancy factor. May indicate market concerns or property issues.' }
  if (vacancy <= 12) return { grade: 'D', score: 50, label: 'High', insight: 'Significant vacancy expected. Factor this into your strategy.' }
  return { grade: 'F', score: 30, label: 'Very High', insight: 'Extreme vacancy. Property may need major repositioning.' }
}

function gradeLeverage(ltv: number): MetricGrade {
  if (ltv <= 60) return { grade: 'A', score: 90, label: 'Conservative', insight: 'Low leverage reduces risk. More equity cushion in downturns.' }
  if (ltv <= 70) return { grade: 'B', score: 80, label: 'Moderate', insight: 'Balanced leverage. Good risk/return profile.' }
  if (ltv <= 75) return { grade: 'C', score: 65, label: 'Standard', insight: 'Typical investment leverage. Common for conventional financing.' }
  if (ltv <= 80) return { grade: 'D', score: 50, label: 'Aggressive', insight: 'Higher leverage increases both returns and risk.' }
  return { grade: 'F', score: 35, label: 'Very High', insight: 'Maximum leverage. Vulnerable to market corrections or rate changes.' }
}

function determineStrategy(capRate: number, coc: number, expenseRatio: number, pricePerUnit: number): { strategy: Strategy; name: string; description: string } {
  // Value-add indicators
  if (expenseRatio > 55 || capRate > 7) {
    return {
      strategy: 'value-add',
      name: 'Value-Add Investment',
      description: 'This property shows potential for improvement. Focus on reducing expenses, increasing rents, or making capital improvements to boost NOI and value.'
    }
  }
  
  // Opportunistic
  if (capRate > 8 || coc < 0) {
    return {
      strategy: 'opportunistic',
      name: 'Opportunistic / Turnaround',
      description: 'Higher risk/reward profile. Requires active management and capital to realize potential. Not for passive investors.'
    }
  }
  
  // Core-Plus
  if (capRate >= 5.5 && capRate <= 7 && coc >= 5) {
    return {
      strategy: 'core-plus',
      name: 'Core-Plus Investment',
      description: 'Stable property with modest upside potential. Good balance of current income and growth opportunity.'
    }
  }
  
  // Owner-user consideration
  if (pricePerUnit < 150000 && capRate < 5) {
    return {
      strategy: 'owner-user',
      name: 'Owner-User Opportunity',
      description: 'Lower returns suggest this may work better if you live in one unit. House-hacking can offset your housing costs.'
    }
  }
  
  // Core
  return {
    strategy: 'core',
    name: 'Core / Stable Investment',
    description: 'Steady, predictable returns from a well-positioned property. Lower risk, suitable for wealth preservation.'
  }
}

function analyzeInvestment(
  capRate: number,
  cashOnCash: number,
  dscr: number,
  expenseRatio: number,
  vacancy: number,
  ltv: number,
  pricePerUnit: number,
  annualCashFlow: number
): InvestmentAnalysis {
  const capRateGrade = gradeCapRate(capRate)
  const cashOnCashGrade = gradeCashOnCash(cashOnCash)
  const dscrGrade = gradeDSCR(dscr)
  const expenseRatioGrade = gradeExpenseRatio(expenseRatio)
  const vacancyGrade = gradeVacancy(vacancy)
  const leverageGrade = gradeLeverage(ltv)
  
  // Calculate overall score (weighted average)
  const overallScore = (
    capRateGrade.score * 0.20 +
    cashOnCashGrade.score * 0.25 +
    dscrGrade.score * 0.20 +
    expenseRatioGrade.score * 0.15 +
    vacancyGrade.score * 0.10 +
    leverageGrade.score * 0.10
  )
  
  let overallGrade: Grade
  if (overallScore >= 85) overallGrade = 'A'
  else if (overallScore >= 70) overallGrade = 'B'
  else if (overallScore >= 55) overallGrade = 'C'
  else if (overallScore >= 40) overallGrade = 'D'
  else overallGrade = 'F'
  
  const { strategy, name, description } = determineStrategy(capRate, cashOnCash, expenseRatio, pricePerUnit)
  
  // Generate strengths
  const strengths: string[] = []
  if (capRateGrade.grade <= 'B') strengths.push('Strong capitalization rate provides solid yield')
  if (cashOnCashGrade.grade <= 'B') strengths.push('Excellent return on your invested equity')
  if (dscrGrade.grade <= 'B') strengths.push('Healthy debt service coverage provides safety margin')
  if (expenseRatioGrade.grade <= 'B') strengths.push('Efficient expense management maximizes profits')
  if (leverageGrade.grade <= 'B') strengths.push('Conservative leverage reduces downside risk')
  if (annualCashFlow > 0) strengths.push('Property generates positive cash flow from day one')
  
  // Generate concerns
  const concerns: string[] = []
  if (capRateGrade.grade >= 'D') concerns.push('Low cap rate means you\'re paying a premium price')
  if (cashOnCashGrade.grade >= 'D') concerns.push('Weak cash-on-cash return on your equity investment')
  if (dscrGrade.grade >= 'D') concerns.push('Tight debt coverage leaves little room for surprises')
  if (expenseRatioGrade.grade >= 'D') concerns.push('High expense ratio is reducing your profits')
  if (leverageGrade.grade >= 'D') concerns.push('High leverage increases your risk exposure')
  if (annualCashFlow < 0) concerns.push('Negative cash flow requires monthly contributions')
  
  // Generate considerations
  const considerations: string[] = []
  considerations.push('Have you verified rents are at market rate? Under-market rents = upside opportunity')
  considerations.push('What is the property condition? Factor in capital expenditures for the first few years')
  considerations.push('Is the area appreciating? Location drives long-term value')
  if (vacancy > 5) considerations.push('Your vacancy assumption is above standard. Verify this reflects reality')
  if (dscr < 1.25) considerations.push('Consider a larger down payment to improve debt coverage')
  if (expenseRatio > 50) considerations.push('Review each expense line item for potential savings')
  if (ltv > 75) considerations.push('Higher leverage amplifies both gains and losses')
  
  return {
    overallGrade,
    overallScore,
    strategy,
    strategyName: name,
    strategyDescription: description,
    capRateGrade,
    cashOnCashGrade,
    dscrGrade,
    expenseRatioGrade,
    vacancyGrade,
    leverageGrade,
    strengths,
    concerns,
    considerations,
  }
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function ProFormaApp() {
  const [inputs, setInputs] = useState<Inputs>(() => {
    const saved = localStorage.getItem('proforma-v4')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        return { ...defaultInputs, ...parsed }
      } catch {
        return defaultInputs
      }
    }
    return defaultInputs
  })

  useEffect(() => {
    localStorage.setItem('proforma-v4', JSON.stringify(inputs))
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

    // === PROPERTY SUMMARY ===
    const totalUnits = units.length
    const totalSqft = units.reduce((sum, u) => sum + u.sqft, 0)
    const monthlyRent = units.reduce((sum, u) => sum + u.rent, 0)
    const annualRent = monthlyRent * 12
    const pricePerSqft = totalSqft > 0 ? purchasePrice / totalSqft : 0
    const pricePerUnit = totalUnits > 0 ? purchasePrice / totalUnits : 0

    // === OTHER INCOME ===
    const monthlyOtherIncome = laundryIncome + parkingIncome + storageIncome + otherIncome
    const annualOtherIncome = monthlyOtherIncome * 12

    // === GROSS POTENTIAL INCOME ===
    const grossPotentialIncome = annualRent + annualOtherIncome

    // === ACQUISITION ===
    const totalAcquisitionCost = purchasePrice + closingCosts + immediateRepairs

    // === FINANCING ===
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

    // === OPERATING EXPENSES (Year 1) ===
    const utilities = water + sewer + gas + electric
    const baseExpenses = {
      realEstateTaxes,
      insurance,
      water,
      sewer,
      gas,
      electric,
      trash,
      landscaping,
      snowRemoval,
      repairsMaintenance,
      pestControl,
      legalAccounting,
      advertising,
      miscellaneous,
      replacementReserves,
    }

    // === YEAR 1 QUICK CALC ===
    const year1Vacancy = grossPotentialIncome * (vacancyPct / 100)
    const year1EGI = grossPotentialIncome - year1Vacancy
    const year1Management = year1EGI * (managementPct / 100)
    const year1TotalExpenses = Object.values(baseExpenses).reduce((s, v) => s + v, 0) + year1Management
    const year1NOI = year1EGI - year1TotalExpenses
    const year1CashFlow = year1NOI - annualDebtService

    // === KEY METRICS ===
    const capRate = purchasePrice > 0 ? (year1NOI / purchasePrice) * 100 : 0
    const cashOnCash = totalCashRequired > 0 ? (year1CashFlow / totalCashRequired) * 100 : 0
    const grossRentMultiplier = annualRent > 0 ? purchasePrice / annualRent : 0
    const dscr = annualDebtService > 0 ? year1NOI / annualDebtService : 0
    const expenseRatio = year1EGI > 0 ? (year1TotalExpenses / year1EGI) * 100 : 0

    // === YEAR-BY-YEAR PROJECTION ===
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

    // === EXIT ===
    const exitYearNOI = years[projectionYears]?.netOperatingIncome || 0
    const exitValue = exitCapRate > 0 ? exitYearNOI / (exitCapRate / 100) : 0

    // === INVESTMENT ANALYSIS ===
    const analysis = analyzeInvestment(
      capRate,
      cashOnCash,
      dscr,
      expenseRatio,
      vacancyPct,
      ltv,
      pricePerUnit,
      year1CashFlow
    )

    return {
      totalUnits,
      totalSqft,
      monthlyRent,
      annualRent,
      pricePerSqft,
      pricePerUnit,
      monthlyOtherIncome,
      annualOtherIncome,
      grossPotentialIncome,
      totalAcquisitionCost,
      downPayment,
      loanAmount,
      ltv,
      monthlyMortgage,
      annualDebtService,
      totalCashRequired,
      year1EGI,
      year1TotalExpenses,
      year1NOI,
      year1CashFlow,
      years,
      capRate,
      cashOnCash,
      grossRentMultiplier,
      dscr,
      expenseRatio,
      exitValue,
      analysis,
    }
  }, [inputs])

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 print:bg-white">
      {/* HEADER */}
      <header className="bg-[#1e3a5f] text-white px-6 py-4 print:bg-white print:text-black print:border-b-2 print:border-black">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">INVESTMENT PRO FORMA</h1>
            <p className="text-blue-200 text-sm print:text-gray-600">Real Estate Investment Analysis Tool</p>
          </div>
          <div className="flex gap-3 print:hidden">
            <button onClick={reset} className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded text-sm">
              <RotateCcw size={16} /> Reset
            </button>
            <button onClick={() => window.print()} className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded text-sm">
              <Printer size={16} /> Print
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 rounded text-sm font-medium">
              <Download size={16} /> Export PDF
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto p-6 space-y-6">
        
        {/* INVESTMENT GRADE CARD */}
        <section className="bg-white border-2 border-gray-300 rounded-xl overflow-hidden shadow-lg">
          <div className="bg-gradient-to-r from-[#1e3a5f] to-[#2d5a87] text-white px-6 py-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <TrendingUp size={24} /> Investment Analysis & Grade
            </h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              
              {/* Overall Grade */}
              <div className="text-center">
                <div className={`w-32 h-32 mx-auto rounded-full flex items-center justify-center text-6xl font-bold border-8 ${
                  calc.analysis.overallGrade === 'A' ? 'bg-emerald-100 border-emerald-500 text-emerald-700' :
                  calc.analysis.overallGrade === 'B' ? 'bg-blue-100 border-blue-500 text-blue-700' :
                  calc.analysis.overallGrade === 'C' ? 'bg-yellow-100 border-yellow-500 text-yellow-700' :
                  calc.analysis.overallGrade === 'D' ? 'bg-orange-100 border-orange-500 text-orange-700' :
                  'bg-red-100 border-red-500 text-red-700'
                }`}>
                  {calc.analysis.overallGrade}
                </div>
                <div className="mt-3 text-lg font-semibold">Overall Grade</div>
                <div className="text-sm text-gray-500">Score: {Math.round(calc.analysis.overallScore)}/100</div>
              </div>

              {/* Strategy */}
              <div className="lg:col-span-2 bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    calc.analysis.strategy === 'core' ? 'bg-blue-100 text-blue-800' :
                    calc.analysis.strategy === 'core-plus' ? 'bg-emerald-100 text-emerald-800' :
                    calc.analysis.strategy === 'value-add' ? 'bg-amber-100 text-amber-800' :
                    calc.analysis.strategy === 'opportunistic' ? 'bg-red-100 text-red-800' :
                    'bg-purple-100 text-purple-800'
                  }`}>
                    {calc.analysis.strategyName}
                  </span>
                </div>
                <p className="text-gray-700">{calc.analysis.strategyDescription}</p>
              </div>

              {/* Metric Grades */}
              <div className="space-y-2">
                <GradeRow label="Cap Rate" grade={calc.analysis.capRateGrade.grade} value={`${fmtDec(calc.capRate)}%`} />
                <GradeRow label="Cash-on-Cash" grade={calc.analysis.cashOnCashGrade.grade} value={`${fmtDec(calc.cashOnCash)}%`} />
                <GradeRow label="DSCR" grade={calc.analysis.dscrGrade.grade} value={fmtDec(calc.dscr)} />
                <GradeRow label="Expense Ratio" grade={calc.analysis.expenseRatioGrade.grade} value={`${fmtDec(calc.expenseRatio, 1)}%`} />
                <GradeRow label="Leverage (LTV)" grade={calc.analysis.leverageGrade.grade} value={`${fmtDec(calc.ltv, 0)}%`} />
              </div>
            </div>

            {/* Strengths, Concerns, Considerations */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              {calc.analysis.strengths.length > 0 && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 font-semibold text-emerald-800 mb-2">
                    <CheckCircle size={18} /> Strengths
                  </div>
                  <ul className="space-y-1 text-sm text-emerald-700">
                    {calc.analysis.strengths.map((s, i) => <li key={i}>• {s}</li>)}
                  </ul>
                </div>
              )}
              
              {calc.analysis.concerns.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 font-semibold text-red-800 mb-2">
                    <XCircle size={18} /> Concerns
                  </div>
                  <ul className="space-y-1 text-sm text-red-700">
                    {calc.analysis.concerns.map((c, i) => <li key={i}>• {c}</li>)}
                  </ul>
                </div>
              )}
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-2 font-semibold text-blue-800 mb-2">
                  <Info size={18} /> Key Considerations
                </div>
                <ul className="space-y-1 text-sm text-blue-700">
                  {calc.analysis.considerations.slice(0, 4).map((c, i) => <li key={i}>• {c}</li>)}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* PROPERTY IDENTIFICATION */}
        <section className="bg-white border border-gray-300 rounded-lg overflow-hidden">
          <SectionHeader title="PROPERTY IDENTIFICATION" />
          <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Property Name</label>
              <input
                type="text"
                value={inputs.propertyName}
                onChange={e => set('propertyName', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded text-lg font-semibold bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Property Address</label>
              <input
                type="text"
                value={inputs.propertyAddress}
                onChange={e => set('propertyAddress', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </section>

        {/* UNIT SCHEDULE */}
        <section className="bg-white border border-gray-300 rounded-lg overflow-hidden">
          <div className="bg-[#1e3a5f] text-white px-4 py-3 flex items-center justify-between">
            <span className="font-semibold text-lg">UNIT SCHEDULE (RENT ROLL)</span>
            <button onClick={addUnit} className="flex items-center gap-1 px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded text-sm print:hidden">
              <Plus size={16} /> Add Unit
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-100 border-b-2 border-gray-300">
                  <th className="px-4 py-3 text-left font-semibold">Unit</th>
                  <th className="px-4 py-3 text-center font-semibold">Bed</th>
                  <th className="px-4 py-3 text-center font-semibold">Bath</th>
                  <th className="px-4 py-3 text-right font-semibold">Sq Ft</th>
                  <th className="px-4 py-3 text-right font-semibold">Monthly Rent</th>
                  <th className="px-4 py-3 text-right font-semibold">$/Sq Ft</th>
                  <th className="px-4 py-3 print:hidden"></th>
                </tr>
              </thead>
              <tbody>
                {inputs.units.map((unit, idx) => (
                  <tr key={unit.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-4 py-2 border-b border-gray-200">
                      <input type="text" value={unit.unitNumber} onChange={e => updateUnit(unit.id, 'unitNumber', e.target.value)}
                        className="w-24 px-2 py-1 border border-gray-300 rounded bg-white text-sm" />
                    </td>
                    <td className="px-4 py-2 border-b border-gray-200 text-center">
                      <input type="number" value={unit.bedrooms} onChange={e => updateUnit(unit.id, 'bedrooms', e.target.value)}
                        className="w-16 px-2 py-1 border border-gray-300 rounded bg-white text-center text-sm" />
                    </td>
                    <td className="px-4 py-2 border-b border-gray-200 text-center">
                      <input type="number" value={unit.bathrooms} onChange={e => updateUnit(unit.id, 'bathrooms', e.target.value)}
                        className="w-16 px-2 py-1 border border-gray-300 rounded bg-white text-center text-sm" />
                    </td>
                    <td className="px-4 py-2 border-b border-gray-200 text-right">
                      <input type="number" value={unit.sqft} onChange={e => updateUnit(unit.id, 'sqft', e.target.value)}
                        className="w-20 px-2 py-1 border border-gray-300 rounded bg-white text-right text-sm" />
                    </td>
                    <td className="px-4 py-2 border-b border-gray-200 text-right">
                      <div className="flex items-center justify-end">
                        <span className="text-gray-500 mr-1">$</span>
                        <input type="number" value={unit.rent} onChange={e => updateUnit(unit.id, 'rent', e.target.value)}
                          className="w-24 px-2 py-1 border border-gray-300 rounded bg-white text-right text-sm" />
                      </div>
                    </td>
                    <td className="px-4 py-2 border-b border-gray-200 text-right text-gray-600">${fmtDec(unit.rent / unit.sqft)}</td>
                    <td className="px-4 py-2 border-b border-gray-200 text-center print:hidden">
                      {inputs.units.length > 1 && (
                        <button onClick={() => removeUnit(unit.id)} className="text-red-500 hover:text-red-700 p-1">
                          <Trash2 size={16} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-green-100 border-t-2 border-gray-400 font-semibold">
                  <td className="px-4 py-3">TOTAL ({calc.totalUnits} Units)</td>
                  <td className="px-4 py-3 text-center">—</td>
                  <td className="px-4 py-3 text-center">—</td>
                  <td className="px-4 py-3 text-right">{fmt(calc.totalSqft)}</td>
                  <td className="px-4 py-3 text-right text-green-700">${fmt(calc.monthlyRent)}</td>
                  <td className="px-4 py-3 text-right">${fmtDec(calc.monthlyRent / calc.totalSqft)}</td>
                  <td className="print:hidden"></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </section>

        {/* TWO COLUMN: ACQUISITION + KEY METRICS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* ACQUISITION & FINANCING */}
          <section className="bg-white border border-gray-300 rounded-lg overflow-hidden">
            <SectionHeader title="ACQUISITION & FINANCING" />
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <NumberInput label="Purchase Price" value={inputs.purchasePrice} onChange={v => setNum('purchasePrice', v)} prefix="$" tooltip="The agreed price to acquire the property" />
                <NumberInput label="Closing Costs" value={inputs.closingCosts} onChange={v => setNum('closingCosts', v)} prefix="$" tooltip="Title, legal, lender fees, inspections, etc." />
                <NumberInput label="Immediate Repairs" value={inputs.immediateRepairs} onChange={v => setNum('immediateRepairs', v)} prefix="$" tooltip="Capital needed right after closing" />
                <div className="bg-blue-50 border border-blue-200 rounded p-3">
                  <div className="text-sm text-gray-600">Total Acquisition</div>
                  <div className="text-xl font-bold text-blue-800">${fmt(calc.totalAcquisitionCost)}</div>
                </div>
              </div>
              
              <div className="border-t border-gray-200 pt-4">
                <div className="font-semibold text-gray-700 mb-3">Financing Terms</div>
                <div className="grid grid-cols-3 gap-4">
                  <NumberInput label="Down Payment" value={inputs.downPaymentPct} onChange={v => setNum('downPaymentPct', v)} suffix="%" tooltip="Typical: 20-30% for investment properties" />
                  <NumberInput label="Interest Rate" value={inputs.interestRate} onChange={v => setNum('interestRate', v)} suffix="%" tooltip="Annual interest rate on the loan" />
                  <NumberInput label="Loan Term" value={inputs.loanTermYears} onChange={v => setNum('loanTermYears', v)} suffix="Yrs" tooltip="Length of amortization (usually 30 years)" />
                </div>
              </div>

              <div className="bg-gray-50 rounded p-4 grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-gray-500">Down Payment:</span> <span className="font-semibold">${fmt(calc.downPayment)}</span></div>
                <div><span className="text-gray-500">Loan Amount:</span> <span className="font-semibold">${fmt(calc.loanAmount)}</span></div>
                <div><span className="text-gray-500">Monthly Payment:</span> <span className="font-semibold">${fmt(calc.monthlyMortgage)}</span></div>
                <div><span className="text-gray-500">Annual Debt Service:</span> <span className="font-semibold">${fmt(calc.annualDebtService)}</span></div>
                <div className="col-span-2 pt-2 border-t border-gray-200">
                  <span className="text-gray-500">Total Cash Required:</span> <span className="font-bold text-lg ml-2">${fmt(calc.totalCashRequired)}</span>
                </div>
              </div>
            </div>
          </section>

          {/* KEY METRICS */}
          <section className="bg-white border border-gray-300 rounded-lg overflow-hidden">
            <SectionHeader title="KEY INVESTMENT METRICS" />
            <div className="p-4">
              <div className="grid grid-cols-2 gap-4">
                <MetricBox label="Purchase Price" value={`$${fmt(inputs.purchasePrice)}`} tooltip="Total price paid for the property" />
                <MetricBox label="Price Per Unit" value={`$${fmt(calc.pricePerUnit)}`} tooltip="Purchase price divided by number of units" />
                <MetricBox label="Price Per Sq Ft" value={`$${fmtDec(calc.pricePerSqft)}`} tooltip="Compare to local market comps" />
                <MetricBox label="Gross Rent Multiplier" value={fmtDec(calc.grossRentMultiplier, 1)} tooltip="Purchase price ÷ annual rent. Lower = better value" />
                <MetricBox label="Year 1 NOI" value={`$${fmt(calc.year1NOI)}`} highlight={calc.year1NOI > 0} negative={calc.year1NOI < 0} tooltip="Net Operating Income before debt service" />
                <MetricBox label="Year 1 Cash Flow" value={`$${fmt(calc.year1CashFlow)}`} highlight={calc.year1CashFlow > 0} negative={calc.year1CashFlow < 0} tooltip="What you pocket after all expenses and debt" />
                <MetricBox label="Cap Rate" value={`${fmtDec(calc.capRate)}%`} grade={calc.analysis.capRateGrade} tooltip="NOI ÷ Purchase Price. Higher = better yield" />
                <MetricBox label="Cash-on-Cash" value={`${fmtDec(calc.cashOnCash)}%`} grade={calc.analysis.cashOnCashGrade} tooltip="Cash flow ÷ Cash invested. Your true return" />
                <MetricBox label="DSCR" value={fmtDec(calc.dscr, 2)} grade={calc.analysis.dscrGrade} tooltip="NOI ÷ Debt Service. Lenders want 1.25+" />
                <MetricBox label="Expense Ratio" value={`${fmtDec(calc.expenseRatio, 1)}%`} grade={calc.analysis.expenseRatioGrade} tooltip="Operating expenses as % of income" />
              </div>
            </div>
          </section>
        </div>

        {/* INCOME & EXPENSES */}
        <section className="bg-white border border-gray-300 rounded-lg overflow-hidden">
          <SectionHeader title="ANNUAL INCOME & OPERATING EXPENSES" />
          <div className="p-4 grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* INCOME */}
            <div>
              <div className="font-semibold text-gray-700 mb-3 pb-2 border-b border-gray-300 flex items-center gap-2">
                INCOME
                <Tooltip text="All sources of revenue from the property" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between py-2 bg-gray-50 px-3 rounded">
                  <span>Scheduled Rental Income</span>
                  <span className="font-semibold">${fmt(calc.annualRent)}</span>
                </div>
                <NumberInput label="Laundry Income (Monthly)" value={inputs.laundryIncome} onChange={v => setNum('laundryIncome', v)} prefix="$" inline />
                <NumberInput label="Parking Income (Monthly)" value={inputs.parkingIncome} onChange={v => setNum('parkingIncome', v)} prefix="$" inline />
                <NumberInput label="Storage Income (Monthly)" value={inputs.storageIncome} onChange={v => setNum('storageIncome', v)} prefix="$" inline />
                <NumberInput label="Other Income (Monthly)" value={inputs.otherIncome} onChange={v => setNum('otherIncome', v)} prefix="$" inline />
                <div className="flex justify-between py-2 bg-gray-100 px-3 rounded font-semibold">
                  <span>Total Other Income (Annual)</span>
                  <span>${fmt(calc.annualOtherIncome)}</span>
                </div>
                <div className="flex justify-between py-3 bg-green-100 px-3 rounded font-bold text-green-800 border border-green-300">
                  <span>GROSS POTENTIAL INCOME</span>
                  <span>${fmt(calc.grossPotentialIncome)}</span>
                </div>
                <NumberInput label="Vacancy & Credit Loss" value={inputs.vacancyPct} onChange={v => setNum('vacancyPct', v)} suffix="%" inline tooltip="Industry standard: 5%. Adjust for your market." />
                <div className="flex justify-between py-3 bg-green-200 px-3 rounded font-bold text-green-900 border border-green-400">
                  <span>EFFECTIVE GROSS INCOME</span>
                  <span>${fmt(calc.year1EGI)}</span>
                </div>
              </div>
            </div>

            {/* EXPENSES */}
            <div>
              <div className="font-semibold text-gray-700 mb-3 pb-2 border-b border-gray-300 flex items-center gap-2">
                OPERATING EXPENSES (Annual)
                <Tooltip text="All costs to operate the property, excluding debt service" />
              </div>
              <div className="space-y-2 text-sm">
                <NumberInput label="Real Estate Taxes" value={inputs.realEstateTaxes} onChange={v => setNum('realEstateTaxes', v)} prefix="$" inline tooltip="Check county assessor for current amount" />
                <NumberInput label="Property Insurance" value={inputs.insurance} onChange={v => setNum('insurance', v)} prefix="$" inline tooltip="Get quotes from multiple insurers" />
                <NumberInput label="Water" value={inputs.water} onChange={v => setNum('water', v)} prefix="$" inline />
                <NumberInput label="Sewer" value={inputs.sewer} onChange={v => setNum('sewer', v)} prefix="$" inline />
                <NumberInput label="Gas" value={inputs.gas} onChange={v => setNum('gas', v)} prefix="$" inline />
                <NumberInput label="Electric" value={inputs.electric} onChange={v => setNum('electric', v)} prefix="$" inline />
                <NumberInput label="Trash Removal" value={inputs.trash} onChange={v => setNum('trash', v)} prefix="$" inline />
                <NumberInput label="Landscaping / Grounds" value={inputs.landscaping} onChange={v => setNum('landscaping', v)} prefix="$" inline />
                <NumberInput label="Snow Removal" value={inputs.snowRemoval} onChange={v => setNum('snowRemoval', v)} prefix="$" inline />
                <NumberInput label="Repairs & Maintenance" value={inputs.repairsMaintenance} onChange={v => setNum('repairsMaintenance', v)} prefix="$" inline tooltip="Rule of thumb: 5-10% of rent" />
                <NumberInput label="Pest Control" value={inputs.pestControl} onChange={v => setNum('pestControl', v)} prefix="$" inline />
                <NumberInput label="Property Management" value={inputs.managementPct} onChange={v => setNum('managementPct', v)} suffix="% of EGI" inline tooltip="Typical: 5-10% of collected rent" />
                <NumberInput label="Legal & Accounting" value={inputs.legalAccounting} onChange={v => setNum('legalAccounting', v)} prefix="$" inline />
                <NumberInput label="Advertising & Marketing" value={inputs.advertising} onChange={v => setNum('advertising', v)} prefix="$" inline />
                <NumberInput label="Miscellaneous" value={inputs.miscellaneous} onChange={v => setNum('miscellaneous', v)} prefix="$" inline />
                <NumberInput label="Replacement Reserves" value={inputs.replacementReserves} onChange={v => setNum('replacementReserves', v)} prefix="$" inline tooltip="Set aside for future capital expenses" />
                <div className="flex justify-between py-3 bg-yellow-100 px-3 rounded font-bold text-yellow-800 border border-yellow-300">
                  <span>TOTAL OPERATING EXPENSES</span>
                  <span>${fmt(calc.year1TotalExpenses)}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* PROJECTION ASSUMPTIONS */}
        <section className="bg-white border border-gray-300 rounded-lg overflow-hidden">
          <SectionHeader title="PROJECTION ASSUMPTIONS" />
          <div className="p-4 grid grid-cols-2 md:grid-cols-4 gap-4">
            <NumberInput label="Annual Rent Increase" value={inputs.annualRentIncrease} onChange={v => setNum('annualRentIncrease', v)} suffix="%" tooltip="Historical average: 2-4% per year" />
            <NumberInput label="Annual Expense Increase" value={inputs.annualExpenseIncrease} onChange={v => setNum('annualExpenseIncrease', v)} suffix="%" tooltip="Typically matches inflation: 2-3%" />
            <NumberInput label="Projection Period" value={inputs.projectionYears} onChange={v => setNum('projectionYears', v)} suffix="Years" tooltip="How long you plan to hold the property" />
            <NumberInput label="Exit Cap Rate" value={inputs.exitCapRate} onChange={v => setNum('exitCapRate', v)} suffix="%" tooltip="Expected cap rate when you sell. Conservative = higher than entry" />
          </div>
        </section>

        {/* PRO FORMA TABLE */}
        <section className="bg-white border border-gray-300 rounded-lg overflow-hidden">
          <SectionHeader title={`${inputs.projectionYears + 1}-YEAR PRO FORMA PROJECTION`} />
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-4 py-3 text-left font-semibold border-b-2 border-gray-300 min-w-[200px] sticky left-0 bg-gray-100">Line Item</th>
                  {calc.years.map(y => (
                    <th key={y.year} className="px-3 py-3 text-right font-semibold border-b-2 border-gray-300 min-w-[95px]">{y.year}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <TableSectionHeader label="INCOME" cols={calc.years.length + 1} />
                <DataRow label="Scheduled Rental Income" values={calc.years.map(y => y.scheduledRent)} />
                <DataRow label="Other Income" values={calc.years.map(y => y.otherIncome)} />
                <DataRow label="Gross Potential Income" values={calc.years.map(y => y.grossPotentialIncome)} bold className="bg-gray-50" />
                <DataRow label="Less: Vacancy & Credit Loss" values={calc.years.map(y => -y.vacancy)} negative />
                <DataRow label="EFFECTIVE GROSS INCOME" values={calc.years.map(y => y.effectiveGrossIncome)} bold className="bg-green-50 text-green-800" />

                <TableSectionHeader label="OPERATING EXPENSES" cols={calc.years.length + 1} />
                <DataRow label="Real Estate Taxes" values={calc.years.map(y => y.realEstateTaxes)} />
                <DataRow label="Insurance" values={calc.years.map(y => y.insurance)} />
                <DataRow label="Utilities (Water/Sewer/Gas/Electric)" values={calc.years.map(y => y.utilities)} />
                <DataRow label="Trash Removal" values={calc.years.map(y => y.trash)} />
                <DataRow label="Landscaping / Grounds" values={calc.years.map(y => y.landscaping)} />
                <DataRow label="Snow Removal" values={calc.years.map(y => y.snowRemoval)} />
                <DataRow label="Repairs & Maintenance" values={calc.years.map(y => y.repairsMaintenance)} />
                <DataRow label="Pest Control" values={calc.years.map(y => y.pestControl)} />
                <DataRow label="Property Management" values={calc.years.map(y => y.management)} />
                <DataRow label="Legal & Accounting" values={calc.years.map(y => y.legalAccounting)} />
                <DataRow label="Advertising & Marketing" values={calc.years.map(y => y.advertising)} />
                <DataRow label="Miscellaneous" values={calc.years.map(y => y.miscellaneous)} />
                <DataRow label="Replacement Reserves" values={calc.years.map(y => y.replacementReserves)} />
                <DataRow label="TOTAL OPERATING EXPENSES" values={calc.years.map(y => y.totalOperatingExpenses)} bold className="bg-yellow-50 text-yellow-800" />

                <TableSectionHeader label="NET INCOME & CASH FLOW" cols={calc.years.length + 1} />
                <DataRow label="NET OPERATING INCOME (NOI)" values={calc.years.map(y => y.netOperatingIncome)} bold className="bg-green-100 text-green-900 text-base" />
                <DataRow label="Less: Annual Debt Service" values={calc.years.map(y => -y.debtService)} negative />
                <DataRow label="CASH FLOW BEFORE TAX" values={calc.years.map(y => y.cashFlowBeforeTax)} bold className="bg-blue-100 text-blue-900 text-base" />
                
                <tr className="bg-gray-200 border-t-2 border-gray-400">
                  <td className="px-4 py-3 font-bold sticky left-0 bg-gray-200">CASH-ON-CASH RETURN</td>
                  {calc.years.map(y => {
                    const coc = calc.totalCashRequired > 0 ? (y.cashFlowBeforeTax / calc.totalCashRequired) * 100 : 0
                    return (
                      <td key={y.year} className={`px-3 py-3 text-right font-bold ${coc >= 8 ? 'text-green-700' : coc >= 0 ? 'text-gray-900' : 'text-red-600'}`}>
                        {fmtDec(coc)}%
                      </td>
                    )
                  })}
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="text-center text-gray-500 text-sm py-4 print:hidden">
          Free Investment Pro Forma Tool • All data saved locally in your browser
        </footer>
      </main>
    </div>
  )
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

function SectionHeader({ title }: { title: string }) {
  return (
    <div className="bg-[#1e3a5f] text-white px-4 py-3 font-semibold text-lg">
      {title}
    </div>
  )
}

function Tooltip({ text }: { text: string }) {
  return (
    <div className="group relative inline-block">
      <HelpCircle size={16} className="text-gray-400 hover:text-blue-500 cursor-help" />
      <div className="hidden group-hover:block absolute z-50 w-64 p-2 bg-gray-900 text-white text-xs rounded shadow-lg -top-2 left-6">
        {text}
      </div>
    </div>
  )
}

function NumberInput({ 
  label, 
  value, 
  onChange, 
  prefix, 
  suffix,
  inline = false,
  tooltip
}: { 
  label: string
  value: number
  onChange: (v: string) => void
  prefix?: string
  suffix?: string
  inline?: boolean
  tooltip?: string
}) {
  if (inline) {
    return (
      <div className="flex items-center justify-between py-2 bg-white px-3 rounded border border-gray-200 hover:border-blue-300">
        <label className="text-gray-700 flex items-center gap-1">
          {label}
          {tooltip && <Tooltip text={tooltip} />}
        </label>
        <div className="flex items-center">
          {prefix && <span className="text-gray-500 mr-1 text-sm">{prefix}</span>}
          <input
            type="number"
            value={value}
            onChange={e => onChange(e.target.value)}
            className="w-24 px-2 py-1 border border-gray-300 rounded text-right text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          {suffix && <span className="text-gray-500 ml-1 text-sm">{suffix}</span>}
        </div>
      </div>
    )
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-600 mb-1 flex items-center gap-1">
        {label}
        {tooltip && <Tooltip text={tooltip} />}
      </label>
      <div className="flex items-center border border-gray-300 rounded bg-white focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500">
        {prefix && <span className="pl-3 text-gray-500">{prefix}</span>}
        <input
          type="number"
          value={value}
          onChange={e => onChange(e.target.value)}
          className="flex-1 px-3 py-2 text-right focus:outline-none bg-transparent"
        />
        {suffix && <span className="pr-3 text-gray-500 text-sm">{suffix}</span>}
      </div>
    </div>
  )
}

function MetricBox({ label, value, highlight, negative, tooltip, grade }: { 
  label: string
  value: string
  highlight?: boolean
  negative?: boolean
  tooltip?: string
  grade?: MetricGrade
}) {
  const getGradeColor = (g: Grade) => {
    if (g === 'A') return 'bg-emerald-500'
    if (g === 'B') return 'bg-blue-500'
    if (g === 'C') return 'bg-yellow-500'
    if (g === 'D') return 'bg-orange-500'
    return 'bg-red-500'
  }

  return (
    <div className={`p-4 rounded border ${
      negative ? 'bg-red-50 border-red-200' :
      highlight ? 'bg-green-50 border-green-200' : 
      'bg-gray-50 border-gray-200'
    }`}>
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm text-gray-600 flex items-center gap-1">
          {label}
          {tooltip && <Tooltip text={tooltip} />}
        </span>
        {grade && (
          <span className={`text-xs font-bold text-white px-2 py-0.5 rounded ${getGradeColor(grade.grade)}`}>
            {grade.grade}
          </span>
        )}
      </div>
      <div className={`text-xl font-bold ${
        negative ? 'text-red-700' :
        highlight ? 'text-green-700' : 
        'text-gray-900'
      }`}>{value}</div>
      {grade && <div className="text-xs text-gray-500 mt-1">{grade.label}</div>}
    </div>
  )
}

function GradeRow({ label, grade, value }: { label: string; grade: Grade; value: string }) {
  const colors = {
    A: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    B: 'bg-blue-100 text-blue-800 border-blue-300',
    C: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    D: 'bg-orange-100 text-orange-800 border-orange-300',
    F: 'bg-red-100 text-red-800 border-red-300',
  }
  
  return (
    <div className={`flex items-center justify-between px-3 py-2 rounded border ${colors[grade]}`}>
      <span className="text-sm">{label}</span>
      <div className="flex items-center gap-2">
        <span className="font-semibold">{value}</span>
        <span className="w-6 h-6 rounded-full bg-current/20 flex items-center justify-center text-xs font-bold">{grade}</span>
      </div>
    </div>
  )
}

function TableSectionHeader({ label, cols }: { label: string; cols: number }) {
  return (
    <tr className="bg-[#1e3a5f]">
      <td colSpan={cols} className="px-4 py-2 text-white font-semibold text-sm sticky left-0 bg-[#1e3a5f]">
        {label}
      </td>
    </tr>
  )
}

function DataRow({ label, values, bold, negative, className = '' }: { 
  label: string
  values: number[]
  bold?: boolean
  negative?: boolean
  className?: string
}) {
  return (
    <tr className={`border-b border-gray-100 ${className}`}>
      <td className={`px-4 py-2 sticky left-0 ${className || 'bg-white'} ${bold ? 'font-semibold' : 'text-gray-600'}`}>{label}</td>
      {values.map((v, i) => (
        <td key={i} className={`px-3 py-2 text-right font-mono text-sm ${
          negative && v < 0 ? 'text-red-600' : 
          bold ? 'font-semibold' : ''
        }`}>
          ${fmt(Math.abs(v))}
        </td>
      ))}
    </tr>
  )
}
