import { useState, useMemo, useEffect, useRef } from 'react'
import { Plus, Trash2, Download, RotateCcw, Printer, TrendingUp, TrendingDown, AlertTriangle, ChevronUp, ChevronDown, ChevronRight, Settings, DollarSign, Percent, Target, Zap, Check, X } from 'lucide-react'

// ============================================================================
// TYPES
// ============================================================================

interface Unit {
  id: string
  unitNumber: string
  tenant: string
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

interface YearProjection {
  year: number
  scheduledRent: number
  laundryIncome: number
  parkingIncome: number
  storageIncome: number
  otherIncome: number
  grossPotentialIncome: number
  vacancy: number
  effectiveGrossIncome: number
  realEstateTaxes: number
  insurance: number
  water: number
  sewer: number
  gas: number
  electric: number
  utilitiesTotal: number
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
}

// Design uses colorblind-friendly palette:
// Positive: Teal (#0d9488) instead of green
// Negative: Orange (#c2410c) instead of red
// This works for deuteranopia, protanopia, and tritanopia

// ============================================================================
// DEFAULT VALUES
// ============================================================================

const createDefaultUnits = (): Unit[] => {
  const units: Unit[] = []
  for (let i = 1; i <= 12; i++) {
    const isLarger = i === 4 || i === 10
    units.push({
      id: String(i),
      unitNumber: `Unit ${i}`,
      tenant: i === 7 ? 'Vacant' : '',
      sqft: isLarger ? 775 : 550,
      rent: isLarger ? 1800 : (i === 7 ? 1550 : 1600),
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
// ANALYSIS ENGINE
// ============================================================================

interface AnalysisInsight {
  type: 'positive' | 'negative' | 'warning' | 'info'
  title: string
  detail: string
  value?: string
}

interface InvestmentAnalysis {
  dealType: string
  isCashDeal: boolean
  score: number
  grade: string
  kpis: { label: string; value: string; status: 'positive' | 'neutral' | 'warning' | 'negative' }[]
  breakeven: { occupancy: number; rent: number; rate: number | null }
  insights: AnalysisInsight[]
}

function generateAnalysis(inputs: Inputs, calc: {
  capRate: number; cashOnCash: number; dscr: number; expenseRatio: number;
  pricePerUnit: number; pricePerSqft: number; year1NOI: number; year1CashFlow: number;
  year1EGI: number; year1TotalExpenses: number; annualDebtService: number;
  grossRentMultiplier: number; monthlyRent: number; totalSqft: number;
  totalUnits: number; loanAmount: number; grossPotentialIncome: number
}): InvestmentAnalysis {
  const insights: AnalysisInsight[] = []
  const { capRate, cashOnCash, dscr, expenseRatio, pricePerUnit, pricePerSqft,
          year1NOI, year1CashFlow, year1TotalExpenses, annualDebtService,
          grossRentMultiplier, monthlyRent, totalSqft, totalUnits, loanAmount, grossPotentialIncome } = calc
  const { purchasePrice, downPaymentPct, interestRate, vacancyPct, managementPct,
          annualRentIncrease, annualExpenseIncrease, realEstateTaxes, loanTermYears } = inputs

  const isCashDeal = downPaymentPct >= 100 || loanAmount <= 0
  let dealType = isCashDeal ? 'Cash Acquisition' : year1CashFlow < 0 ? 'Appreciation Play' : cashOnCash >= 8 ? 'Cash Flow Investment' : 'Stabilized Investment'

  // Breakeven
  const totalObligations = year1TotalExpenses + annualDebtService
  const occupancyBE = grossPotentialIncome > 0 ? Math.min(100, (totalObligations / grossPotentialIncome) * 100) : 100
  const rentBE = totalUnits > 0 ? (totalObligations / totalUnits / 12) / (1 - vacancyPct/100 - managementPct/100) : 0
  let rateBE: number | null = null
  if (!isCashDeal && year1NOI > 0) {
    for (let r = 1; r <= 15; r += 0.25) {
      const mr = r / 100 / 12, np = loanTermYears * 12
      const pmt = loanAmount * (mr * Math.pow(1 + mr, np)) / (Math.pow(1 + mr, np) - 1)
      if (pmt * 12 >= year1NOI) { rateBE = r; break }
    }
  }

  // KPIs
  const effectiveTaxRate = (realEstateTaxes / purchasePrice) * 100
  const rentPerSF = monthlyRent / totalSqft
  const expensePerUnit = year1TotalExpenses / totalUnits
  
  const kpis: InvestmentAnalysis['kpis'] = [
    { label: 'Price/SF', value: `$${fmtDec(pricePerSqft, 0)}`, status: pricePerSqft > 350 ? 'warning' : pricePerSqft < 180 ? 'positive' : 'neutral' },
    { label: 'Price/Unit', value: `$${fmt(pricePerUnit)}`, status: pricePerUnit > 200000 ? 'warning' : pricePerUnit < 120000 ? 'positive' : 'neutral' },
    { label: 'GRM', value: fmtDec(grossRentMultiplier, 1), status: grossRentMultiplier > 12 ? 'warning' : grossRentMultiplier < 9 ? 'positive' : 'neutral' },
    { label: 'OpEx/Unit', value: `$${fmt(expensePerUnit)}`, status: expensePerUnit > 7500 ? 'warning' : expensePerUnit < 5000 ? 'positive' : 'neutral' },
    { label: 'Rent/SF', value: `$${fmtDec(rentPerSF, 2)}`, status: rentPerSF > 2.5 ? 'positive' : rentPerSF < 1.5 ? 'warning' : 'neutral' },
    { label: 'Tax Rate', value: `${fmtDec(effectiveTaxRate, 2)}%`, status: effectiveTaxRate > 2.5 ? 'negative' : 'neutral' },
  ]

  // Insights
  if (isCashDeal) {
    insights.push({ type: 'info', title: 'All-Cash Deal', detail: `Unleveraged return: ${fmtDec(capRate)}% cap rate`, value: 'No Debt' })
  } else {
    const spread = capRate - interestRate
    if (spread < 0) {
      insights.push({ type: 'negative', title: 'Negative Leverage', detail: `Cap rate (${fmtDec(capRate)}%) below debt cost (${interestRate}%). Rate breakeven: ${rateBE ? fmtDec(rateBE) + '%' : 'N/A'}`, value: `${fmtDec(spread * 100, 0)} bps` })
    } else if (spread > 1.5) {
      insights.push({ type: 'positive', title: 'Positive Leverage', detail: `Cap rate exceeds debt cost by ${fmtDec(spread * 100, 0)} bps. Leverage enhances returns.`, value: `+${fmtDec(spread * 100, 0)} bps` })
    }
  }

  insights.push({ type: occupancyBE > 95 ? 'warning' : 'info', title: 'Occupancy Breakeven', detail: `Need ${fmtDec(occupancyBE, 1)}% occupancy to cover obligations. Current: ${100 - vacancyPct}%.`, value: `${fmtDec(occupancyBE, 1)}%` })

  const currentAvgRent = monthlyRent / totalUnits
  const rentCushion = ((currentAvgRent - rentBE) / currentAvgRent) * 100
  insights.push({ type: rentCushion < 0 ? 'negative' : rentCushion < 10 ? 'warning' : 'info', title: 'Rent Breakeven', detail: `Minimum: $${fmt(rentBE)}/unit/mo. Current: $${fmt(currentAvgRent)}. ${rentCushion > 0 ? fmtDec(rentCushion, 0) + '% margin.' : 'Below breakeven.'}`, value: `$${fmt(rentBE)}` })

  if (expenseRatio > 50) {
    insights.push({ type: 'warning', title: 'High Expense Ratio', detail: `${fmtDec(expenseRatio, 0)}% of EGI goes to expenses. Look for efficiency improvements.`, value: `${fmtDec(expenseRatio, 0)}%` })
  }

  if (annualExpenseIncrease > annualRentIncrease) {
    insights.push({ type: 'warning', title: 'Margin Compression', detail: `Expenses (${annualExpenseIncrease}%) growing faster than rent (${annualRentIncrease}%).`, value: `${fmtDec(annualExpenseIncrease - annualRentIncrease, 1)}%/yr` })
  }

  // Score
  let score = 50
  if (cashOnCash >= 10) score += 20; else if (cashOnCash >= 6) score += 12; else if (cashOnCash >= 0) score += 4; else score -= 15
  if (isCashDeal) score += 8; else if (dscr >= 1.3) score += 12; else if (dscr >= 1.15) score += 6; else if (dscr < 1) score -= 15
  if (capRate >= 7) score += 10; else if (capRate >= 5.5) score += 5; else if (capRate < 4.5) score -= 5
  if (expenseRatio <= 42) score += 6; else if (expenseRatio > 52) score -= 6
  score = Math.max(0, Math.min(100, score))
  
  const grade = score >= 80 ? 'A' : score >= 68 ? 'B' : score >= 55 ? 'C' : score >= 40 ? 'D' : 'F'

  return { dealType, isCashDeal, score, grade, kpis, breakeven: { occupancy: occupancyBE, rent: rentBE, rate: rateBE }, insights }
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function ProFormaApp() {
  const [inputs, setInputs] = useState<Inputs>(() => {
    const saved = localStorage.getItem('proforma-v8')
    if (saved) { try { return { ...defaultInputs, ...JSON.parse(saved) } } catch { return defaultInputs } }
    return defaultInputs
  })

  const [showQuickEdit, setShowQuickEdit] = useState(false)
  const [expandedSections, setExpandedSections] = useState<{ [key: string]: boolean }>({ income: true, expenses: true, net: true })
  const sectionsRef = useRef<{ [key: string]: HTMLElement | null }>({})

  useEffect(() => { localStorage.setItem('proforma-v8', JSON.stringify(inputs)) }, [inputs])

  const toggleSection = (section: string) => setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }))
  const set = <K extends keyof Inputs>(key: K, value: Inputs[K]) => setInputs(prev => ({ ...prev, [key]: value }))
  const setNum = (key: keyof Inputs, value: string) => set(key, (parseFloat(value) || 0) as Inputs[typeof key])
  const updateUnit = (id: string, field: keyof Unit, value: string | number) => set('units', inputs.units.map(u => u.id === id ? { ...u, [field]: typeof value === 'string' && field !== 'unitNumber' && field !== 'tenant' ? parseFloat(value) || 0 : value } : u))
  const addUnit = () => set('units', [...inputs.units, { id: String(Date.now()), unitNumber: `Unit ${inputs.units.length + 1}`, tenant: '', sqft: 550, rent: 1500 }])
  const removeUnit = (id: string) => { if (inputs.units.length > 1) set('units', inputs.units.filter(u => u.id !== id)) }
  const reset = () => { if (confirm('Reset all values to example property?')) setInputs(defaultInputs) }
  const scrollToSection = (section: string) => sectionsRef.current[section]?.scrollIntoView({ behavior: 'smooth', block: 'start' })

  // CALCULATIONS
  const calc = useMemo(() => {
    const { purchasePrice, closingCosts, immediateRepairs, downPaymentPct, interestRate, loanTermYears, units,
      laundryIncome, parkingIncome, storageIncome, otherIncome, realEstateTaxes, insurance, water, sewer, gas, electric, trash,
      landscaping, snowRemoval, repairsMaintenance, pestControl, managementPct, legalAccounting, advertising, miscellaneous, replacementReserves,
      vacancyPct, annualRentIncrease, annualExpenseIncrease, projectionYears, exitCapRate } = inputs

    const totalUnits = units.length
    const totalSqft = units.reduce((sum, u) => sum + u.sqft, 0)
    const monthlyRent = units.reduce((sum, u) => sum + u.rent, 0)
    const annualRent = monthlyRent * 12
    const pricePerSqft = totalSqft > 0 ? purchasePrice / totalSqft : 0
    const pricePerUnit = totalUnits > 0 ? purchasePrice / totalUnits : 0
    const monthlyOtherIncome = laundryIncome + parkingIncome + storageIncome + otherIncome
    const annualOtherIncome = monthlyOtherIncome * 12
    const grossPotentialIncome = annualRent + annualOtherIncome
    const downPayment = purchasePrice * (downPaymentPct / 100)
    const loanAmount = purchasePrice - downPayment
    const ltv = purchasePrice > 0 ? (loanAmount / purchasePrice) * 100 : 0
    const monthlyRate = interestRate / 100 / 12
    const numPayments = loanTermYears * 12
    const monthlyMortgage = loanAmount > 0 && monthlyRate > 0 ? loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / (Math.pow(1 + monthlyRate, numPayments) - 1) : 0
    const annualDebtService = monthlyMortgage * 12
    const totalCashRequired = downPayment + closingCosts + immediateRepairs
    const year1Vacancy = grossPotentialIncome * (vacancyPct / 100)
    const year1EGI = grossPotentialIncome - year1Vacancy
    const year1Management = year1EGI * (managementPct / 100)
    const baseExpensesTotal = realEstateTaxes + insurance + water + sewer + gas + electric + trash + landscaping + snowRemoval + repairsMaintenance + pestControl + legalAccounting + advertising + miscellaneous + replacementReserves
    const year1TotalExpenses = baseExpensesTotal + year1Management
    const year1NOI = year1EGI - year1TotalExpenses
    const year1CashFlow = year1NOI - annualDebtService
    const capRate = purchasePrice > 0 ? (year1NOI / purchasePrice) * 100 : 0
    const cashOnCash = totalCashRequired > 0 ? (year1CashFlow / totalCashRequired) * 100 : 0
    const grossRentMultiplier = annualRent > 0 ? purchasePrice / annualRent : 0
    const dscr = annualDebtService > 0 ? year1NOI / annualDebtService : 999
    const expenseRatio = year1EGI > 0 ? (year1TotalExpenses / year1EGI) * 100 : 0

    // Year-by-year
    const years: YearProjection[] = []
    const currentYear = new Date().getFullYear()
    for (let i = 0; i <= projectionYears; i++) {
      const rentGrowth = Math.pow(1 + annualRentIncrease / 100, i)
      const expenseGrowth = Math.pow(1 + annualExpenseIncrease / 100, i)
      const scheduledRent = annualRent * rentGrowth
      const yearLaundry = laundryIncome * 12 * rentGrowth
      const yearParking = parkingIncome * 12 * rentGrowth
      const yearStorage = storageIncome * 12 * rentGrowth
      const yearOther = otherIncome * 12 * rentGrowth
      const gpi = scheduledRent + yearLaundry + yearParking + yearStorage + yearOther
      const vacancy = gpi * (vacancyPct / 100)
      const egi = gpi - vacancy
      const yearTaxes = realEstateTaxes * expenseGrowth
      const yearInsurance = insurance * expenseGrowth
      const yearWater = water * expenseGrowth
      const yearSewer = sewer * expenseGrowth
      const yearGas = gas * expenseGrowth
      const yearElectric = electric * expenseGrowth
      const yearUtilities = yearWater + yearSewer + yearGas + yearElectric
      const yearTrash = trash * expenseGrowth
      const yearLandscaping = landscaping * expenseGrowth
      const yearSnow = snowRemoval * expenseGrowth
      const yearRepairs = repairsMaintenance * expenseGrowth
      const yearPest = pestControl * expenseGrowth
      const yearMgmt = egi * (managementPct / 100)
      const yearLegal = legalAccounting * expenseGrowth
      const yearAd = advertising * expenseGrowth
      const yearMisc = miscellaneous * expenseGrowth
      const yearReserves = replacementReserves * expenseGrowth
      const totalOpex = yearTaxes + yearInsurance + yearUtilities + yearTrash + yearLandscaping + yearSnow + yearRepairs + yearPest + yearMgmt + yearLegal + yearAd + yearMisc + yearReserves
      const noi = egi - totalOpex
      const cashFlow = noi - annualDebtService
      years.push({
        year: currentYear + i, scheduledRent, laundryIncome: yearLaundry, parkingIncome: yearParking, storageIncome: yearStorage, otherIncome: yearOther,
        grossPotentialIncome: gpi, vacancy, effectiveGrossIncome: egi,
        realEstateTaxes: yearTaxes, insurance: yearInsurance, water: yearWater, sewer: yearSewer, gas: yearGas, electric: yearElectric, utilitiesTotal: yearUtilities,
        trash: yearTrash, landscaping: yearLandscaping, snowRemoval: yearSnow, repairsMaintenance: yearRepairs, pestControl: yearPest,
        management: yearMgmt, legalAccounting: yearLegal, advertising: yearAd, miscellaneous: yearMisc, replacementReserves: yearReserves,
        totalOperatingExpenses: totalOpex, netOperatingIncome: noi, debtService: annualDebtService, cashFlowBeforeTax: cashFlow,
      })
    }
    const exitValue = exitCapRate > 0 ? (years[projectionYears]?.netOperatingIncome || 0) / (exitCapRate / 100) : 0

    return { totalUnits, totalSqft, monthlyRent, annualRent, pricePerSqft, pricePerUnit, grossPotentialIncome, downPayment, loanAmount, ltv, monthlyMortgage, annualDebtService, totalCashRequired, year1EGI, year1TotalExpenses, year1NOI, year1CashFlow, years, capRate, cashOnCash, grossRentMultiplier, dscr, expenseRatio, exitValue }
  }, [inputs])

  const analysis = useMemo(() => generateAnalysis(inputs, calc), [inputs, calc])

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#1e293b]" style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif" }}>
      {/* HEADER */}
      <header className="bg-[#1a365d] text-white px-6 py-4 sticky top-0 z-50 shadow-lg">
        <div className="max-w-[1800px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6">
            <h1 className="text-xl font-bold tracking-tight">PRO FORMA</h1>
            <nav className="hidden md:flex items-center gap-1">
              {['Analysis', 'Property', 'Units', 'Financing', 'Expenses', 'Projection'].map(section => (
                <button key={section} onClick={() => scrollToSection(section.toLowerCase())} className="px-4 py-2 text-sm font-medium text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors">{section}</button>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setShowQuickEdit(!showQuickEdit)} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${showQuickEdit ? 'bg-[#0d9488] text-white' : 'bg-white/10 text-white hover:bg-white/20'}`}>
              <Settings size={16} /> Quick Edit
            </button>
            <button onClick={reset} className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors" title="Reset"><RotateCcw size={18} /></button>
            <button onClick={() => window.print()} className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors" title="Print"><Printer size={18} /></button>
            <button className="flex items-center gap-2 px-4 py-2 bg-[#0d9488] hover:bg-[#0f766e] rounded-lg text-sm font-medium transition-colors"><Download size={16} /> Export</button>
          </div>
        </div>
      </header>

      {/* QUICK EDIT BAR */}
      {showQuickEdit && (
        <div className="bg-[#1e293b] text-white px-6 py-3 sticky top-[72px] z-40 shadow-md">
          <div className="max-w-[1800px] mx-auto flex items-center gap-6 overflow-x-auto">
            <QuickInput label="Purchase" value={inputs.purchasePrice} onChange={v => setNum('purchasePrice', v)} prefix="$" />
            <QuickInput label="Down" value={inputs.downPaymentPct} onChange={v => setNum('downPaymentPct', v)} suffix="%" />
            <QuickInput label="Rate" value={inputs.interestRate} onChange={v => setNum('interestRate', v)} suffix="%" />
            <QuickInput label="Vacancy" value={inputs.vacancyPct} onChange={v => setNum('vacancyPct', v)} suffix="%" />
            <QuickInput label="Rent↑" value={inputs.annualRentIncrease} onChange={v => setNum('annualRentIncrease', v)} suffix="%" />
            <QuickInput label="Exp↑" value={inputs.annualExpenseIncrease} onChange={v => setNum('annualExpenseIncrease', v)} suffix="%" />
            <div className="border-l border-white/20 pl-6 flex items-center gap-6">
              <MetricDisplay label="Cap Rate" value={`${fmtDec(calc.capRate)}%`} />
              <MetricDisplay label="Cash/Cash" value={`${fmtDec(calc.cashOnCash)}%`} positive={calc.cashOnCash > 0} negative={calc.cashOnCash < 0} />
              <MetricDisplay label="DSCR" value={fmtDec(calc.dscr, 2)} positive={calc.dscr >= 1.25} negative={calc.dscr < 1} />
            </div>
          </div>
        </div>
      )}

      <main className="max-w-[1800px] mx-auto p-6 space-y-6">
        
        {/* ANALYSIS SECTION */}
        <section ref={el => { sectionsRef.current['analysis'] = el }} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="bg-[#1a365d] text-white px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Target size={24} />
              <div>
                <h2 className="text-lg font-bold">Investment Analysis</h2>
                <p className="text-white/70 text-sm">{analysis.dealType}</p>
              </div>
            </div>
            <GradeBadge grade={analysis.grade} score={analysis.score} />
          </div>
          
          <div className="p-6">
            {/* KEY METRICS */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
              {analysis.kpis.map((kpi, i) => (
                <KPICard key={i} label={kpi.label} value={kpi.value} status={kpi.status} />
              ))}
            </div>

            {/* BREAKEVEN & INSIGHTS */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Breakeven */}
              <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
                <div className="flex items-center gap-2 font-bold text-slate-700 mb-4 text-lg">
                  <Zap size={20} className="text-amber-500" /> Breakeven Points
                </div>
                <div className="space-y-3">
                  <BreakevenRow label="Occupancy" value={`${fmtDec(analysis.breakeven.occupancy, 1)}%`} current={`${100 - inputs.vacancyPct}%`} ok={analysis.breakeven.occupancy < 100 - inputs.vacancyPct} />
                  <BreakevenRow label="Rent/Unit" value={`$${fmt(analysis.breakeven.rent)}`} current={`$${fmt(calc.monthlyRent / calc.totalUnits)}`} ok={analysis.breakeven.rent < calc.monthlyRent / calc.totalUnits} />
                  {analysis.breakeven.rate && <BreakevenRow label="Interest Rate" value={`${fmtDec(analysis.breakeven.rate)}%`} current={`${inputs.interestRate}%`} ok={analysis.breakeven.rate > inputs.interestRate} />}
                </div>
              </div>

              {/* Insights */}
              <div className="lg:col-span-2 space-y-3">
                {analysis.insights.map((insight, i) => (
                  <InsightCard key={i} insight={insight} />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* PROPERTY & FINANCING */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <section ref={el => { sectionsRef.current['property'] = el }} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <SectionHeader title="Property Details" icon={<DollarSign size={20} />} />
            <div className="p-6 space-y-4">
              <input type="text" value={inputs.propertyName} onChange={e => set('propertyName', e.target.value)} className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-xl font-bold focus:border-[#1a365d] focus:outline-none transition-colors" placeholder="Property Name" />
              <input type="text" value={inputs.propertyAddress} onChange={e => set('propertyAddress', e.target.value)} className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-[#1a365d] focus:outline-none transition-colors" placeholder="Address" />
              <div className="grid grid-cols-4 gap-3 pt-2">
                <StatCard label="Units" value={String(calc.totalUnits)} />
                <StatCard label="Total SF" value={fmt(calc.totalSqft)} />
                <StatCard label="$/Unit" value={`$${fmt(calc.pricePerUnit)}`} />
                <StatCard label="$/SF" value={`$${fmtDec(calc.pricePerSqft, 0)}`} />
              </div>
            </div>
          </section>

          <section ref={el => { sectionsRef.current['financing'] = el }} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <SectionHeader title="Acquisition & Financing" icon={<Percent size={20} />} />
            <div className="p-6">
              <div className="grid grid-cols-3 gap-4 mb-4">
                <InputField label="Purchase Price" value={inputs.purchasePrice} onChange={v => setNum('purchasePrice', v)} prefix="$" />
                <InputField label="Closing Costs" value={inputs.closingCosts} onChange={v => setNum('closingCosts', v)} prefix="$" />
                <InputField label="Repairs" value={inputs.immediateRepairs} onChange={v => setNum('immediateRepairs', v)} prefix="$" />
                <InputField label="Down Payment" value={inputs.downPaymentPct} onChange={v => setNum('downPaymentPct', v)} suffix="%" />
                <InputField label="Interest Rate" value={inputs.interestRate} onChange={v => setNum('interestRate', v)} suffix="%" />
                <InputField label="Loan Term" value={inputs.loanTermYears} onChange={v => setNum('loanTermYears', v)} suffix="yrs" />
              </div>
              <div className="grid grid-cols-4 gap-3 pt-4 border-t border-slate-200">
                <StatCard label="Loan Amount" value={`$${fmt(calc.loanAmount)}`} />
                <StatCard label="Monthly P&I" value={`$${fmt(calc.monthlyMortgage)}`} />
                <StatCard label="Cash Required" value={`$${fmt(calc.totalCashRequired)}`} highlight />
                <StatCard label="LTV" value={`${fmtDec(calc.ltv, 0)}%`} />
              </div>
            </div>
          </section>
        </div>

        {/* RENT ROLL */}
        <section ref={el => { sectionsRef.current['units'] = el }} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="bg-[#1a365d] text-white px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-bold">Rent Roll</h2>
              <span className="bg-white/20 px-3 py-1 rounded-full text-sm">{calc.totalUnits} Units</span>
            </div>
            <button onClick={addUnit} className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium transition-colors"><Plus size={16} /> Add Unit</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b-2 border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-left font-bold text-slate-700 text-sm uppercase tracking-wide">Unit</th>
                  <th className="px-6 py-4 text-left font-bold text-slate-700 text-sm uppercase tracking-wide">Tenant / Use</th>
                  <th className="px-6 py-4 text-right font-bold text-slate-700 text-sm uppercase tracking-wide">Square Feet</th>
                  <th className="px-6 py-4 text-right font-bold text-slate-700 text-sm uppercase tracking-wide">Monthly Rent</th>
                  <th className="px-6 py-4 text-right font-bold text-slate-700 text-sm uppercase tracking-wide">$/SF</th>
                  <th className="px-4 py-4 w-12"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {inputs.units.map((unit, idx) => (
                  <tr key={unit.id} className={`${idx % 2 ? 'bg-slate-50/50' : ''} hover:bg-blue-50/50 transition-colors`}>
                    <td className="px-6 py-3">
                      <input type="text" value={unit.unitNumber} onChange={e => updateUnit(unit.id, 'unitNumber', e.target.value)} className="w-24 px-3 py-2 border-2 border-slate-200 rounded-lg text-sm font-medium focus:border-[#1a365d] focus:outline-none" />
                    </td>
                    <td className="px-6 py-3">
                      <input type="text" value={unit.tenant || ''} onChange={e => updateUnit(unit.id, 'tenant', e.target.value)} placeholder="Optional" className={`w-40 px-3 py-2 border-2 rounded-lg text-sm focus:border-[#1a365d] focus:outline-none ${(unit.tenant || '').toLowerCase() === 'vacant' ? 'border-amber-300 bg-amber-50 text-amber-700' : 'border-slate-200'}`} />
                    </td>
                    <td className="px-6 py-3 text-right">
                      <input type="number" value={unit.sqft} onChange={e => updateUnit(unit.id, 'sqft', e.target.value)} className="w-20 px-3 py-2 border-2 border-slate-200 rounded-lg text-sm text-right font-mono focus:border-[#1a365d] focus:outline-none" />
                    </td>
                    <td className="px-6 py-3 text-right">
                      <div className="inline-flex items-center border-2 border-slate-200 rounded-lg focus-within:border-[#1a365d]">
                        <span className="pl-3 text-slate-400">$</span>
                        <input type="number" value={unit.rent} onChange={e => updateUnit(unit.id, 'rent', e.target.value)} className="w-20 px-2 py-2 text-sm text-right font-mono focus:outline-none rounded-r-lg" />
                      </div>
                    </td>
                    <td className="px-6 py-3 text-right font-mono text-slate-600">${fmtDec(unit.sqft > 0 ? unit.rent / unit.sqft : 0)}</td>
                    <td className="px-4 py-3">
                      {inputs.units.length > 1 && <button onClick={() => removeUnit(unit.id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={16} /></button>}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-[#0d9488]/10 border-t-2 border-[#0d9488]">
                <tr className="font-bold">
                  <td className="px-6 py-4 text-[#0d9488]">TOTAL</td>
                  <td className="px-6 py-4 text-slate-500 text-sm">{inputs.units.filter(u => (u.tenant || '').toLowerCase() === 'vacant').length > 0 && `${inputs.units.filter(u => (u.tenant || '').toLowerCase() === 'vacant').length} vacant`}</td>
                  <td className="px-6 py-4 text-right font-mono">{fmt(calc.totalSqft)} SF</td>
                  <td className="px-6 py-4 text-right font-mono text-[#0d9488]">${fmt(calc.monthlyRent)}/mo</td>
                  <td className="px-6 py-4 text-right font-mono">${fmtDec(calc.totalSqft > 0 ? calc.monthlyRent / calc.totalSqft : 0)}</td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </section>

        {/* OPERATING EXPENSES */}
        <section ref={el => { sectionsRef.current['expenses'] = el }} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <SectionHeader title="Operating Statement" icon={<TrendingUp size={20} />} />
          <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Income */}
            <div>
              <h3 className="text-lg font-bold text-slate-700 mb-4 flex items-center gap-2"><DollarSign size={20} className="text-[#0d9488]" /> Income</h3>
              <div className="space-y-2">
                <SummaryRow label="Scheduled Rent" value={`$${fmt(calc.annualRent)}`} bold />
                <ExpenseInput label="Laundry Income" value={inputs.laundryIncome} onChange={v => setNum('laundryIncome', v)} prefix="$" suffix="/mo" />
                <ExpenseInput label="Parking Income" value={inputs.parkingIncome} onChange={v => setNum('parkingIncome', v)} prefix="$" suffix="/mo" />
                <ExpenseInput label="Other Income" value={inputs.otherIncome} onChange={v => setNum('otherIncome', v)} prefix="$" suffix="/mo" />
                <ExpenseInput label="Vacancy Rate" value={inputs.vacancyPct} onChange={v => setNum('vacancyPct', v)} suffix="%" highlight />
                <SummaryRow label="Effective Gross Income" value={`$${fmt(calc.year1EGI)}`} positive bold />
              </div>
            </div>

            {/* Expenses */}
            <div>
              <h3 className="text-lg font-bold text-slate-700 mb-4 flex items-center gap-2"><Percent size={20} className="text-[#c2410c]" /> Operating Expenses</h3>
              <div className="grid grid-cols-2 gap-2">
                <ExpenseInput label="Property Taxes" value={inputs.realEstateTaxes} onChange={v => setNum('realEstateTaxes', v)} prefix="$" compact />
                <ExpenseInput label="Insurance" value={inputs.insurance} onChange={v => setNum('insurance', v)} prefix="$" compact />
                <ExpenseInput label="Water" value={inputs.water} onChange={v => setNum('water', v)} prefix="$" compact />
                <ExpenseInput label="Sewer" value={inputs.sewer} onChange={v => setNum('sewer', v)} prefix="$" compact />
                <ExpenseInput label="Gas" value={inputs.gas} onChange={v => setNum('gas', v)} prefix="$" compact />
                <ExpenseInput label="Electric" value={inputs.electric} onChange={v => setNum('electric', v)} prefix="$" compact />
                <ExpenseInput label="Trash" value={inputs.trash} onChange={v => setNum('trash', v)} prefix="$" compact />
                <ExpenseInput label="Landscaping" value={inputs.landscaping} onChange={v => setNum('landscaping', v)} prefix="$" compact />
                <ExpenseInput label="Repairs" value={inputs.repairsMaintenance} onChange={v => setNum('repairsMaintenance', v)} prefix="$" compact />
                <ExpenseInput label="Management" value={inputs.managementPct} onChange={v => setNum('managementPct', v)} suffix="%" compact />
                <ExpenseInput label="Reserves" value={inputs.replacementReserves} onChange={v => setNum('replacementReserves', v)} prefix="$" compact />
                <ExpenseInput label="Other" value={inputs.miscellaneous} onChange={v => setNum('miscellaneous', v)} prefix="$" compact />
              </div>
              <div className="mt-3">
                <SummaryRow label="Total Operating Expenses" value={`$${fmt(calc.year1TotalExpenses)}`} negative bold />
              </div>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="px-6 pb-6 grid grid-cols-4 gap-4">
            <ResultCard label="Net Operating Income" value={`$${fmt(calc.year1NOI)}`} positive={calc.year1NOI > 0} large />
            <ResultCard label="Annual Debt Service" value={`$${fmt(calc.annualDebtService)}`} />
            <ResultCard label="Cash Flow" value={`$${fmt(calc.year1CashFlow)}`} positive={calc.year1CashFlow > 0} negative={calc.year1CashFlow < 0} large />
            <ResultCard label="Cash-on-Cash" value={`${fmtDec(calc.cashOnCash)}%`} positive={calc.cashOnCash >= 8} negative={calc.cashOnCash < 0} large />
          </div>
        </section>

        {/* PROJECTION TABLE */}
        <section ref={el => { sectionsRef.current['projection'] = el }} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="bg-[#1a365d] text-white px-6 py-4 flex items-center justify-between">
            <h2 className="text-lg font-bold">{inputs.projectionYears + 1}-Year Pro Forma Projection</h2>
            <div className="flex items-center gap-4 text-sm">
              <label className="flex items-center gap-2">
                <span className="text-white/70">Rent Growth</span>
                <input type="number" value={inputs.annualRentIncrease} onChange={e => setNum('annualRentIncrease', e.target.value)} className="w-14 px-2 py-1 bg-white/10 border border-white/20 rounded text-center" step="0.5" />
                <span>%</span>
              </label>
              <label className="flex items-center gap-2">
                <span className="text-white/70">Expense Growth</span>
                <input type="number" value={inputs.annualExpenseIncrease} onChange={e => setNum('annualExpenseIncrease', e.target.value)} className="w-14 px-2 py-1 bg-white/10 border border-white/20 rounded text-center" step="0.5" />
                <span>%</span>
              </label>
              <label className="flex items-center gap-2">
                <span className="text-white/70">Years</span>
                <input type="number" value={inputs.projectionYears} onChange={e => setNum('projectionYears', e.target.value)} className="w-12 px-2 py-1 bg-white/10 border border-white/20 rounded text-center" />
              </label>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-100 border-b-2 border-slate-200">
                <tr>
                  <th className="px-4 py-3 text-left font-bold text-slate-700 sticky left-0 z-20 bg-slate-100 min-w-[220px] border-r border-slate-200">Line Item</th>
                  {calc.years.map(y => <th key={y.year} className="px-3 py-3 text-right font-bold text-slate-700 min-w-[100px]">{y.year}</th>)}
                </tr>
              </thead>
              <tbody>
                <CollapsibleHeader title="INCOME" expanded={expandedSections.income} onToggle={() => toggleSection('income')} color="teal" />
                {expandedSections.income && (
                  <>
                    <ProjectionRow label="Scheduled Rent" values={calc.years.map(y => y.scheduledRent)} indent />
                    {inputs.laundryIncome > 0 && <ProjectionRow label="Laundry Income" values={calc.years.map(y => y.laundryIncome)} indent />}
                    {inputs.parkingIncome > 0 && <ProjectionRow label="Parking Income" values={calc.years.map(y => y.parkingIncome)} indent />}
                    {inputs.otherIncome > 0 && <ProjectionRow label="Other Income" values={calc.years.map(y => y.otherIncome)} indent />}
                  </>
                )}
                <ProjectionRow label="Gross Potential Income" values={calc.years.map(y => y.grossPotentialIncome)} bold bg="bg-slate-50" />
                <ProjectionRow label={`Less: Vacancy (${inputs.vacancyPct}%)`} values={calc.years.map(y => -y.vacancy)} negative />
                <ProjectionRow label="Effective Gross Income" values={calc.years.map(y => y.effectiveGrossIncome)} bold bg="bg-[#ccfbf1]" />

                <CollapsibleHeader title="OPERATING EXPENSES" expanded={expandedSections.expenses} onToggle={() => toggleSection('expenses')} color="orange" />
                {expandedSections.expenses && (
                  <>
                    <ProjectionRow label="Real Estate Taxes" values={calc.years.map(y => y.realEstateTaxes)} indent />
                    <ProjectionRow label="Insurance" values={calc.years.map(y => y.insurance)} indent />
                    <ProjectionRow label="Utilities" values={calc.years.map(y => y.utilitiesTotal)} indent />
                    <ProjectionRow label="Repairs & Maintenance" values={calc.years.map(y => y.repairsMaintenance)} indent />
                    <ProjectionRow label={`Management (${inputs.managementPct}%)`} values={calc.years.map(y => y.management)} indent />
                    <ProjectionRow label="Other Operating" values={calc.years.map(y => y.trash + y.landscaping + y.legalAccounting + y.advertising + y.miscellaneous + y.replacementReserves)} indent />
                  </>
                )}
                <ProjectionRow label="Total Operating Expenses" values={calc.years.map(y => y.totalOperatingExpenses)} bold bg="bg-[#ffedd5]" />

                <CollapsibleHeader title="NET INCOME" expanded={expandedSections.net} onToggle={() => toggleSection('net')} color="blue" />
                <ProjectionRow label="Net Operating Income (NOI)" values={calc.years.map(y => y.netOperatingIncome)} bold bg="bg-[#ccfbf1]" />
                {expandedSections.net && calc.annualDebtService > 0 && <ProjectionRow label="Less: Debt Service" values={calc.years.map(y => -y.debtService)} negative indent />}
                <ProjectionRow label="Cash Flow Before Tax" values={calc.years.map(y => y.cashFlowBeforeTax)} bold bg="bg-[#dbeafe]" />
                
                {/* Metrics */}
                <tr className="bg-slate-200 border-t-2 border-slate-300">
                  <td className="px-4 py-3 font-bold sticky left-0 z-10 bg-slate-200 min-w-[220px] border-r border-slate-300">Cash-on-Cash Return</td>
                  {calc.years.map(y => {
                    const coc = calc.totalCashRequired > 0 ? (y.cashFlowBeforeTax / calc.totalCashRequired) * 100 : 0
                    return <td key={y.year} className={`px-3 py-3 text-right font-bold ${coc >= 8 ? 'text-[#0d9488]' : coc >= 0 ? '' : 'text-[#c2410c]'}`}>{fmtDec(coc)}%</td>
                  })}
                </tr>
                <tr className="bg-slate-100">
                  <td className="px-4 py-3 font-semibold sticky left-0 z-10 bg-slate-100 min-w-[220px] border-r border-slate-200">Cap Rate</td>
                  {calc.years.map(y => <td key={y.year} className="px-3 py-3 text-right font-semibold">{fmtDec(inputs.purchasePrice > 0 ? (y.netOperatingIncome / inputs.purchasePrice) * 100 : 0)}%</td>)}
                </tr>
                {calc.annualDebtService > 0 && (
                  <tr className="bg-slate-100">
                    <td className="px-4 py-3 font-semibold sticky left-0 z-10 bg-slate-100 min-w-[220px] border-r border-slate-200">DSCR</td>
                    {calc.years.map(y => {
                      const d = calc.annualDebtService > 0 ? y.netOperatingIncome / calc.annualDebtService : 0
                      return <td key={y.year} className={`px-3 py-3 text-right font-semibold ${d >= 1.25 ? 'text-[#0d9488]' : d >= 1 ? 'text-[#b45309]' : 'text-[#c2410c]'}`}>{fmtDec(d, 2)}x</td>
                    })}
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <footer className="text-center text-slate-400 text-sm py-6">Investment Pro Forma Analysis Tool</footer>
      </main>

      <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="fixed bottom-6 right-6 w-12 h-12 bg-[#1a365d] text-white rounded-full shadow-lg flex items-center justify-center hover:bg-[#2c5282] transition-colors" title="Back to top">
        <ChevronUp size={24} />
      </button>
    </div>
  )
}

// ============================================================================
// COMPONENTS
// ============================================================================

function SectionHeader({ title, icon }: { title: string; icon?: React.ReactNode }) {
  return (
    <div className="bg-[#1a365d] text-white px-6 py-4 flex items-center gap-3">
      {icon}
      <h2 className="text-lg font-bold">{title}</h2>
    </div>
  )
}

function GradeBadge({ grade, score }: { grade: string; score: number }) {
  const colors = grade === 'A' ? 'bg-[#0d9488] border-[#5eead4]' : grade === 'B' ? 'bg-[#1d4ed8] border-[#93c5fd]' : grade === 'C' ? 'bg-[#b45309] border-[#fcd34d]' : 'bg-[#c2410c] border-[#fdba74]'
  return (
    <div className={`flex items-center gap-3 px-4 py-2 rounded-xl border-2 ${colors}`}>
      <span className="text-3xl font-black">{grade}</span>
      <div className="text-right text-sm">
        <div className="font-bold">{score}/100</div>
        <div className="text-white/70">Score</div>
      </div>
    </div>
  )
}

function KPICard({ label, value, status }: { label: string; value: string; status: 'positive' | 'neutral' | 'warning' | 'negative' }) {
  const styles = {
    positive: 'bg-[#ccfbf1] border-[#5eead4] text-[#0d9488]',
    neutral: 'bg-slate-50 border-slate-200 text-slate-700',
    warning: 'bg-[#fef3c7] border-[#fcd34d] text-[#b45309]',
    negative: 'bg-[#ffedd5] border-[#fdba74] text-[#c2410c]',
  }
  return (
    <div className={`p-4 rounded-xl border-2 ${styles[status]}`}>
      <div className="text-xs font-bold uppercase tracking-wide opacity-70 mb-1">{label}</div>
      <div className="text-2xl font-bold">{value}</div>
    </div>
  )
}

function BreakevenRow({ label, value, current, ok }: { label: string; value: string; current: string; ok: boolean }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-slate-200 last:border-0">
      <div>
        <div className="font-semibold text-slate-700">{label}</div>
        <div className="text-xs text-slate-500">Current: {current}</div>
      </div>
      <div className="flex items-center gap-2">
        <span className="font-mono font-bold text-lg">{value}</span>
        {ok ? <Check size={20} className="text-[#0d9488]" /> : <X size={20} className="text-[#c2410c]" />}
      </div>
    </div>
  )
}

function InsightCard({ insight }: { insight: AnalysisInsight }) {
  const styles = {
    positive: { bg: 'bg-[#ccfbf1]', border: 'border-[#5eead4]', icon: <TrendingUp size={18} className="text-[#0d9488]" />, text: 'text-[#0d9488]' },
    negative: { bg: 'bg-[#ffedd5]', border: 'border-[#fdba74]', icon: <TrendingDown size={18} className="text-[#c2410c]" />, text: 'text-[#c2410c]' },
    warning: { bg: 'bg-[#fef3c7]', border: 'border-[#fcd34d]', icon: <AlertTriangle size={18} className="text-[#b45309]" />, text: 'text-[#b45309]' },
    info: { bg: 'bg-[#dbeafe]', border: 'border-[#93c5fd]', icon: <Target size={18} className="text-[#1d4ed8]" />, text: 'text-[#1d4ed8]' },
  }
  const s = styles[insight.type]
  return (
    <div className={`p-4 rounded-xl border-2 ${s.bg} ${s.border}`}>
      <div className="flex items-start gap-3">
        <div className="mt-0.5">{s.icon}</div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <span className={`font-bold ${s.text}`}>{insight.title}</span>
            {insight.value && <span className="font-mono font-bold bg-white/50 px-2 py-1 rounded text-sm">{insight.value}</span>}
          </div>
          <p className="text-slate-600 text-sm mt-1">{insight.detail}</p>
        </div>
      </div>
    </div>
  )
}

function QuickInput({ label, value, onChange, prefix, suffix }: { label: string; value: number; onChange: (v: string) => void; prefix?: string; suffix?: string }) {
  return (
    <div className="flex items-center gap-2 whitespace-nowrap">
      <span className="text-white/60 text-sm font-medium">{label}</span>
      <div className="flex items-center bg-white/10 rounded-lg border border-white/20">
        {prefix && <span className="pl-3 text-white/60">{prefix}</span>}
        <input type="number" value={value} onChange={e => onChange(e.target.value)} className="w-24 px-2 py-2 bg-transparent text-right text-sm font-mono focus:outline-none" />
        {suffix && <span className="pr-3 text-white/60">{suffix}</span>}
      </div>
    </div>
  )
}

function MetricDisplay({ label, value, positive, negative }: { label: string; value: string; positive?: boolean; negative?: boolean }) {
  return (
    <div className="text-center">
      <div className="text-xs text-white/60 font-medium">{label}</div>
      <div className={`text-lg font-bold ${negative ? 'text-[#fdba74]' : positive ? 'text-[#5eead4]' : 'text-white'}`}>{value}</div>
    </div>
  )
}

function InputField({ label, value, onChange, prefix, suffix }: { label: string; value: number; onChange: (v: string) => void; prefix?: string; suffix?: string }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-600 mb-1">{label}</label>
      <div className="flex items-center border-2 border-slate-200 rounded-xl focus-within:border-[#1a365d] transition-colors bg-white">
        {prefix && <span className="pl-4 text-slate-400 font-medium">{prefix}</span>}
        <input type="number" value={value} onChange={e => onChange(e.target.value)} className="w-full px-3 py-3 text-right font-mono focus:outline-none rounded-xl" />
        {suffix && <span className="pr-4 text-slate-400 font-medium">{suffix}</span>}
      </div>
    </div>
  )
}

function ExpenseInput({ label, value, onChange, prefix, suffix, compact, highlight }: { label: string; value: number; onChange: (v: string) => void; prefix?: string; suffix?: string; compact?: boolean; highlight?: boolean }) {
  return (
    <div className={`flex items-center justify-between py-2 px-3 rounded-lg border-2 ${highlight ? 'border-amber-300 bg-amber-50' : 'border-slate-100 bg-white hover:border-slate-300'} transition-colors`}>
      <span className={`text-slate-600 font-medium ${compact ? 'text-sm' : ''}`}>{label}</span>
      <div className="flex items-center">
        {prefix && <span className="text-slate-400 mr-1">{prefix}</span>}
        <input type="number" value={value} onChange={e => onChange(e.target.value)} className={`${compact ? 'w-20' : 'w-24'} px-2 py-1 border-2 border-slate-200 rounded-lg text-right font-mono text-sm focus:border-[#1a365d] focus:outline-none`} />
        {suffix && <span className="text-slate-400 ml-1 text-sm">{suffix}</span>}
      </div>
    </div>
  )
}

function SummaryRow({ label, value, bold, positive, negative }: { label: string; value: string; bold?: boolean; positive?: boolean; negative?: boolean }) {
  return (
    <div className={`flex items-center justify-between py-3 px-4 rounded-lg ${positive ? 'bg-[#ccfbf1] border-2 border-[#5eead4]' : negative ? 'bg-[#ffedd5] border-2 border-[#fdba74]' : 'bg-slate-50'}`}>
      <span className={`${bold ? 'font-bold' : 'font-medium'} ${positive ? 'text-[#0d9488]' : negative ? 'text-[#c2410c]' : 'text-slate-700'}`}>{label}</span>
      <span className={`font-mono ${bold ? 'font-bold text-lg' : 'font-semibold'} ${positive ? 'text-[#0d9488]' : negative ? 'text-[#c2410c]' : ''}`}>{value}</span>
    </div>
  )
}

function StatCard({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`text-center p-3 rounded-xl ${highlight ? 'bg-[#dbeafe] border-2 border-[#93c5fd]' : 'bg-slate-50 border-2 border-slate-200'}`}>
      <div className="text-xs font-bold uppercase tracking-wide text-slate-500 mb-1">{label}</div>
      <div className={`text-lg font-bold ${highlight ? 'text-[#1d4ed8]' : ''}`}>{value}</div>
    </div>
  )
}

function ResultCard({ label, value, positive, negative, large }: { label: string; value: string; positive?: boolean; negative?: boolean; large?: boolean }) {
  return (
    <div className={`p-4 rounded-xl text-center border-2 ${negative ? 'bg-[#ffedd5] border-[#fdba74]' : positive ? 'bg-[#ccfbf1] border-[#5eead4]' : 'bg-slate-50 border-slate-200'}`}>
      <div className="text-xs font-bold uppercase tracking-wide text-slate-500 mb-1">{label}</div>
      <div className={`font-bold font-mono ${large ? 'text-2xl' : 'text-xl'} ${negative ? 'text-[#c2410c]' : positive ? 'text-[#0d9488]' : ''}`}>{value}</div>
    </div>
  )
}

function CollapsibleHeader({ title, expanded, onToggle, color }: { title: string; expanded: boolean; onToggle: () => void; color: 'teal' | 'orange' | 'blue' }) {
  const colors = { teal: 'bg-[#0d9488]', orange: 'bg-[#c2410c]', blue: 'bg-[#1d4ed8]' }
  return (
    <tr className={`${colors[color]} text-white cursor-pointer hover:opacity-90 transition-opacity`} onClick={onToggle}>
      <td className={`px-4 py-3 font-bold text-sm sticky left-0 z-10 ${colors[color]} min-w-[220px] border-r border-white/20`}>
        <div className="flex items-center gap-2">
          {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          {title}
        </div>
      </td>
      <td colSpan={99}></td>
    </tr>
  )
}

function ProjectionRow({ label, values, bold, negative, bg, indent }: { label: string; values: number[]; bold?: boolean; negative?: boolean; bg?: string; indent?: boolean }) {
  const bgClass = bg || 'bg-white'
  return (
    <tr className={bg}>
      <td className={`px-4 py-2 sticky left-0 z-10 ${bgClass} ${bold ? 'font-bold' : 'text-slate-600'} ${indent ? 'pl-10' : ''} min-w-[220px] border-r border-slate-200`}>{label}</td>
      {values.map((v, i) => (
        <td key={i} className={`px-3 py-2 text-right font-mono ${negative && v < 0 ? 'text-[#c2410c]' : ''} ${bold ? 'font-bold' : ''}`}>
          {negative && v < 0 ? `(${fmt(Math.abs(v))})` : `$${fmt(Math.abs(v))}`}
        </td>
      ))}
    </tr>
  )
}
