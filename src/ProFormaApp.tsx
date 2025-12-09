import { useState, useMemo, useEffect, useRef } from 'react'
import { Plus, Trash2, Download, RotateCcw, Printer, TrendingUp, TrendingDown, AlertTriangle, ChevronUp, ChevronDown, ChevronRight, Settings, Check, X } from 'lucide-react'

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
  year1TotalExpenses: number; annualDebtService: number;
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
  if (expenseRatio > 50) insights.push({ type: 'warning', title: 'High Expense Ratio', detail: `${fmtDec(expenseRatio, 0)}% of EGI goes to expenses.`, value: `${fmtDec(expenseRatio, 0)}%` })
  if (annualExpenseIncrease > annualRentIncrease) insights.push({ type: 'warning', title: 'Margin Compression', detail: `Expenses (${annualExpenseIncrease}%) growing faster than rent (${annualRentIncrease}%).`, value: `${fmtDec(annualExpenseIncrease - annualRentIncrease, 1)}%/yr` })

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
    const saved = localStorage.getItem('proforma-v9')
    if (saved) { try { return { ...defaultInputs, ...JSON.parse(saved) } } catch { return defaultInputs } }
    return defaultInputs
  })

  const [showQuickEdit, setShowQuickEdit] = useState(false)
  const [expandedSections, setExpandedSections] = useState<{ [key: string]: boolean }>({ income: true, expenses: true, net: true })
  const sectionsRef = useRef<{ [key: string]: HTMLElement | null }>({})

  useEffect(() => { localStorage.setItem('proforma-v9', JSON.stringify(inputs)) }, [inputs])

  const toggleSection = (section: string) => setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }))
  const set = <K extends keyof Inputs>(key: K, value: Inputs[K]) => setInputs(prev => ({ ...prev, [key]: value }))
  const setNum = (key: keyof Inputs, value: string) => set(key, (parseFloat(value) || 0) as Inputs[typeof key])
  const updateUnit = (id: string, field: keyof Unit, value: string | number) => set('units', inputs.units.map(u => u.id === id ? { ...u, [field]: typeof value === 'string' && field !== 'unitNumber' && field !== 'tenant' ? parseFloat(value) || 0 : value } : u))
  const addUnit = () => set('units', [...inputs.units, { id: String(Date.now()), unitNumber: `Unit ${inputs.units.length + 1}`, tenant: '', sqft: 550, rent: 1500 }])
  const removeUnit = (id: string) => { if (inputs.units.length > 1) set('units', inputs.units.filter(u => u.id !== id)) }
  const reset = () => { if (confirm('Reset all values?')) setInputs(defaultInputs) }
  const scrollToSection = (section: string) => sectionsRef.current[section]?.scrollIntoView({ behavior: 'smooth', block: 'start' })

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

  return (
    <div className="min-h-screen bg-[#0a0e17] text-[#e2e8f0]" style={{ fontFamily: "'SF Mono', 'Fira Code', 'Monaco', monospace" }}>
      {/* HEADER */}
      <header className="bg-gradient-to-r from-[#0f1419] to-[#1a1f2e] border-b border-[#2d3748] px-6 py-3 sticky top-0 z-50">
        <div className="max-w-[1920px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-[#f59e0b] to-[#d97706] rounded flex items-center justify-center">
                <span className="text-black font-black text-sm">IP</span>
              </div>
              <div>
                <h1 className="text-sm font-bold text-white tracking-wider">INVESTOR PRO</h1>
                <p className="text-[10px] text-[#64748b] tracking-widest">PRO FORMA ANALYSIS</p>
              </div>
            </div>
            <nav className="hidden lg:flex items-center border-l border-[#2d3748] pl-6">
              {['Analysis', 'Property', 'Units', 'Financing', 'Expenses', 'Projection'].map(section => (
                <button key={section} onClick={() => scrollToSection(section.toLowerCase())} className="px-3 py-1.5 text-xs font-medium text-[#94a3b8] hover:text-[#f59e0b] transition-colors tracking-wide">{section.toUpperCase()}</button>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowQuickEdit(!showQuickEdit)} className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs font-medium tracking-wide transition-all ${showQuickEdit ? 'bg-[#f59e0b] text-black' : 'bg-[#1e293b] text-[#94a3b8] hover:bg-[#2d3748]'}`}>
              <Settings size={14} /> QUICK EDIT
            </button>
            <button onClick={reset} className="p-2 bg-[#1e293b] hover:bg-[#2d3748] rounded transition-colors"><RotateCcw size={14} /></button>
            <button onClick={() => window.print()} className="p-2 bg-[#1e293b] hover:bg-[#2d3748] rounded transition-colors"><Printer size={14} /></button>
            <button className="flex items-center gap-2 px-3 py-1.5 bg-[#f59e0b] hover:bg-[#d97706] text-black rounded text-xs font-bold tracking-wide transition-colors"><Download size={14} /> EXPORT</button>
          </div>
        </div>
      </header>

      {/* QUICK EDIT */}
      {showQuickEdit && (
        <div className="bg-[#0f1419] border-b border-[#2d3748] px-6 py-3 sticky top-[57px] z-40">
          <div className="max-w-[1920px] mx-auto flex items-center gap-6 overflow-x-auto">
            <QuickInput label="PURCHASE" value={inputs.purchasePrice} onChange={v => setNum('purchasePrice', v)} prefix="$" />
            <QuickInput label="DOWN" value={inputs.downPaymentPct} onChange={v => setNum('downPaymentPct', v)} suffix="%" />
            <QuickInput label="RATE" value={inputs.interestRate} onChange={v => setNum('interestRate', v)} suffix="%" />
            <QuickInput label="VACANCY" value={inputs.vacancyPct} onChange={v => setNum('vacancyPct', v)} suffix="%" />
            <QuickInput label="RENT↑" value={inputs.annualRentIncrease} onChange={v => setNum('annualRentIncrease', v)} suffix="%" />
            <QuickInput label="EXP↑" value={inputs.annualExpenseIncrease} onChange={v => setNum('annualExpenseIncrease', v)} suffix="%" />
            <div className="border-l border-[#2d3748] pl-6 flex items-center gap-6">
              <MetricDisplay label="CAP RATE" value={`${fmtDec(calc.capRate)}%`} />
              <MetricDisplay label="CASH/CASH" value={`${fmtDec(calc.cashOnCash)}%`} positive={calc.cashOnCash > 0} negative={calc.cashOnCash < 0} />
              <MetricDisplay label="DSCR" value={fmtDec(calc.dscr, 2)} positive={calc.dscr >= 1.25} negative={calc.dscr < 1} />
            </div>
          </div>
        </div>
      )}

      <main className="max-w-[1920px] mx-auto p-6 space-y-4">
        
        {/* TOP METRICS BAR */}
        <div className="grid grid-cols-4 lg:grid-cols-8 gap-3">
          <MetricCard label="CAP RATE" value={`${fmtDec(calc.capRate)}%`} />
          <MetricCard label="CASH-ON-CASH" value={`${fmtDec(calc.cashOnCash)}%`} positive={calc.cashOnCash > 0} negative={calc.cashOnCash < 0} />
          <MetricCard label="DSCR" value={fmtDec(calc.dscr, 2)} positive={calc.dscr >= 1.25} negative={calc.dscr < 1} />
          <MetricCard label="NOI" value={`$${fmt(calc.year1NOI)}`} />
          <MetricCard label="CASH FLOW" value={`$${fmt(calc.year1CashFlow)}`} positive={calc.year1CashFlow > 0} negative={calc.year1CashFlow < 0} />
          <MetricCard label="LTV" value={`${fmtDec(calc.ltv, 0)}%`} />
          <MetricCard label="EXP RATIO" value={`${fmtDec(calc.expenseRatio, 1)}%`} />
          <div className="bg-gradient-to-br from-[#1e293b] to-[#0f172a] rounded border border-[#2d3748] p-3 flex items-center justify-center">
            <div className="text-center">
              <div className={`text-3xl font-black ${analysis.grade === 'A' ? 'text-[#10b981]' : analysis.grade === 'B' ? 'text-[#3b82f6]' : analysis.grade === 'C' ? 'text-[#f59e0b]' : 'text-[#ef4444]'}`}>{analysis.grade}</div>
              <div className="text-[10px] text-[#64748b] tracking-wider">GRADE</div>
            </div>
          </div>
        </div>

        {/* ANALYSIS SECTION */}
        <section ref={el => { sectionsRef.current['analysis'] = el }} className="bg-[#0f1419] rounded border border-[#2d3748]">
          <div className="px-4 py-3 border-b border-[#2d3748] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-[#f59e0b] tracking-wider">INVESTMENT ANALYSIS</span>
              <span className="px-2 py-0.5 bg-[#1e293b] rounded text-[10px] text-[#94a3b8] tracking-wide">{analysis.dealType.toUpperCase()}</span>
            </div>
            <span className="text-xs text-[#64748b]">Score: {analysis.score}/100</span>
          </div>
          
          <div className="p-4 grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* KPIs */}
            <div className="lg:col-span-5 grid grid-cols-3 gap-2">
              {analysis.kpis.map((kpi, i) => (
                <div key={i} className={`p-3 rounded border ${kpi.status === 'positive' ? 'bg-[#10b981]/10 border-[#10b981]/30' : kpi.status === 'negative' ? 'bg-[#ef4444]/10 border-[#ef4444]/30' : kpi.status === 'warning' ? 'bg-[#f59e0b]/10 border-[#f59e0b]/30' : 'bg-[#1e293b] border-[#2d3748]'}`}>
                  <div className="text-[10px] text-[#64748b] tracking-wider mb-1">{kpi.label.toUpperCase()}</div>
                  <div className={`text-lg font-bold ${kpi.status === 'positive' ? 'text-[#10b981]' : kpi.status === 'negative' ? 'text-[#ef4444]' : kpi.status === 'warning' ? 'text-[#f59e0b]' : 'text-white'}`}>{kpi.value}</div>
                </div>
              ))}
            </div>

            {/* Breakeven */}
            <div className="lg:col-span-3 bg-[#1e293b]/50 rounded border border-[#2d3748] p-4">
              <div className="text-xs font-bold text-[#f59e0b] tracking-wider mb-3">BREAKEVEN ANALYSIS</div>
              <div className="space-y-3">
                <BreakevenRow label="Occupancy" value={`${fmtDec(analysis.breakeven.occupancy, 1)}%`} current={`${100 - inputs.vacancyPct}%`} ok={analysis.breakeven.occupancy < 100 - inputs.vacancyPct} />
                <BreakevenRow label="Rent/Unit" value={`$${fmt(analysis.breakeven.rent)}`} current={`$${fmt(calc.monthlyRent / calc.totalUnits)}`} ok={analysis.breakeven.rent < calc.monthlyRent / calc.totalUnits} />
                {analysis.breakeven.rate && <BreakevenRow label="Rate" value={`${fmtDec(analysis.breakeven.rate)}%`} current={`${inputs.interestRate}%`} ok={analysis.breakeven.rate > inputs.interestRate} />}
              </div>
            </div>

            {/* Insights */}
            <div className="lg:col-span-4 space-y-2">
              {analysis.insights.slice(0, 4).map((insight, i) => (
                <InsightRow key={i} insight={insight} />
              ))}
            </div>
          </div>
        </section>

        {/* PROPERTY & FINANCING */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <section ref={el => { sectionsRef.current['property'] = el }} className="bg-[#0f1419] rounded border border-[#2d3748]">
            <div className="px-4 py-3 border-b border-[#2d3748]">
              <span className="text-xs font-bold text-[#f59e0b] tracking-wider">PROPERTY</span>
            </div>
            <div className="p-4 space-y-3">
              <input type="text" value={inputs.propertyName} onChange={e => set('propertyName', e.target.value)} className="w-full bg-[#1e293b] border border-[#2d3748] rounded px-3 py-2 text-white font-bold focus:border-[#f59e0b] focus:outline-none" />
              <input type="text" value={inputs.propertyAddress} onChange={e => set('propertyAddress', e.target.value)} className="w-full bg-[#1e293b] border border-[#2d3748] rounded px-3 py-2 text-[#94a3b8] text-sm focus:border-[#f59e0b] focus:outline-none" />
              <div className="grid grid-cols-4 gap-2 pt-2 border-t border-[#2d3748]">
                <StatBox label="UNITS" value={String(calc.totalUnits)} />
                <StatBox label="SQ FT" value={fmt(calc.totalSqft)} />
                <StatBox label="$/UNIT" value={`$${fmt(calc.pricePerUnit)}`} />
                <StatBox label="$/SF" value={`$${fmtDec(calc.pricePerSqft, 0)}`} />
              </div>
            </div>
          </section>

          <section ref={el => { sectionsRef.current['financing'] = el }} className="bg-[#0f1419] rounded border border-[#2d3748]">
            <div className="px-4 py-3 border-b border-[#2d3748]">
              <span className="text-xs font-bold text-[#f59e0b] tracking-wider">ACQUISITION & FINANCING</span>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-3 gap-3 mb-3">
                <InputField label="Purchase Price" value={inputs.purchasePrice} onChange={v => setNum('purchasePrice', v)} prefix="$" />
                <InputField label="Closing Costs" value={inputs.closingCosts} onChange={v => setNum('closingCosts', v)} prefix="$" />
                <InputField label="Repairs" value={inputs.immediateRepairs} onChange={v => setNum('immediateRepairs', v)} prefix="$" />
                <InputField label="Down Payment" value={inputs.downPaymentPct} onChange={v => setNum('downPaymentPct', v)} suffix="%" />
                <InputField label="Interest Rate" value={inputs.interestRate} onChange={v => setNum('interestRate', v)} suffix="%" />
                <InputField label="Term" value={inputs.loanTermYears} onChange={v => setNum('loanTermYears', v)} suffix="yrs" />
              </div>
              <div className="grid grid-cols-4 gap-2 pt-3 border-t border-[#2d3748]">
                <StatBox label="LOAN" value={`$${fmt(calc.loanAmount)}`} />
                <StatBox label="P&I/MO" value={`$${fmt(calc.monthlyMortgage)}`} />
                <StatBox label="CASH IN" value={`$${fmt(calc.totalCashRequired)}`} highlight />
                <StatBox label="LTV" value={`${fmtDec(calc.ltv, 0)}%`} />
              </div>
            </div>
          </section>
        </div>

        {/* RENT ROLL */}
        <section ref={el => { sectionsRef.current['units'] = el }} className="bg-[#0f1419] rounded border border-[#2d3748]">
          <div className="px-4 py-3 border-b border-[#2d3748] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-[#f59e0b] tracking-wider">RENT ROLL</span>
              <span className="px-2 py-0.5 bg-[#1e293b] rounded text-[10px] text-[#94a3b8]">{calc.totalUnits} UNITS</span>
            </div>
            <button onClick={addUnit} className="flex items-center gap-1 px-2 py-1 bg-[#1e293b] hover:bg-[#2d3748] rounded text-xs transition-colors"><Plus size={12} /> ADD</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#2d3748]">
                  <th className="px-4 py-3 text-left text-[10px] font-bold text-[#64748b] tracking-wider">UNIT</th>
                  <th className="px-4 py-3 text-left text-[10px] font-bold text-[#64748b] tracking-wider">TENANT</th>
                  <th className="px-4 py-3 text-right text-[10px] font-bold text-[#64748b] tracking-wider">SQ FT</th>
                  <th className="px-4 py-3 text-right text-[10px] font-bold text-[#64748b] tracking-wider">RENT/MO</th>
                  <th className="px-4 py-3 text-right text-[10px] font-bold text-[#64748b] tracking-wider">$/SF</th>
                  <th className="px-4 py-3 w-10"></th>
                </tr>
              </thead>
              <tbody>
                {inputs.units.map((unit, idx) => (
                  <tr key={unit.id} className={`border-b border-[#1e293b] hover:bg-[#1e293b]/50 ${idx % 2 ? 'bg-[#0a0e17]' : ''}`}>
                    <td className="px-4 py-2"><input type="text" value={unit.unitNumber} onChange={e => updateUnit(unit.id, 'unitNumber', e.target.value)} className="w-20 bg-transparent border border-[#2d3748] rounded px-2 py-1 text-white text-sm focus:border-[#f59e0b] focus:outline-none" /></td>
                    <td className="px-4 py-2"><input type="text" value={unit.tenant || ''} onChange={e => updateUnit(unit.id, 'tenant', e.target.value)} placeholder="—" className={`w-32 bg-transparent border rounded px-2 py-1 text-sm focus:border-[#f59e0b] focus:outline-none ${(unit.tenant || '').toLowerCase() === 'vacant' ? 'border-[#f59e0b]/50 text-[#f59e0b]' : 'border-[#2d3748] text-[#94a3b8]'}`} /></td>
                    <td className="px-4 py-2 text-right"><input type="number" value={unit.sqft} onChange={e => updateUnit(unit.id, 'sqft', e.target.value)} className="w-16 bg-transparent border border-[#2d3748] rounded px-2 py-1 text-white text-sm text-right focus:border-[#f59e0b] focus:outline-none" /></td>
                    <td className="px-4 py-2 text-right"><div className="inline-flex items-center"><span className="text-[#64748b] mr-1">$</span><input type="number" value={unit.rent} onChange={e => updateUnit(unit.id, 'rent', e.target.value)} className="w-16 bg-transparent border border-[#2d3748] rounded px-2 py-1 text-white text-sm text-right focus:border-[#f59e0b] focus:outline-none" /></div></td>
                    <td className="px-4 py-2 text-right text-[#64748b]">${fmtDec(unit.sqft > 0 ? unit.rent / unit.sqft : 0)}</td>
                    <td className="px-4 py-2">{inputs.units.length > 1 && <button onClick={() => removeUnit(unit.id)} className="p-1 text-[#64748b] hover:text-[#ef4444] transition-colors"><Trash2 size={14} /></button>}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-[#10b981]/10 border-t border-[#10b981]/30">
                  <td className="px-4 py-3 font-bold text-[#10b981] text-sm">TOTAL</td>
                  <td className="px-4 py-3 text-[#64748b] text-xs">{inputs.units.filter(u => (u.tenant || '').toLowerCase() === 'vacant').length > 0 && `${inputs.units.filter(u => (u.tenant || '').toLowerCase() === 'vacant').length} vacant`}</td>
                  <td className="px-4 py-3 text-right font-bold text-white">{fmt(calc.totalSqft)}</td>
                  <td className="px-4 py-3 text-right font-bold text-[#10b981]">${fmt(calc.monthlyRent)}</td>
                  <td className="px-4 py-3 text-right text-white">${fmtDec(calc.totalSqft > 0 ? calc.monthlyRent / calc.totalSqft : 0)}</td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </section>

        {/* OPERATING STATEMENT */}
        <section ref={el => { sectionsRef.current['expenses'] = el }} className="bg-[#0f1419] rounded border border-[#2d3748]">
          <div className="px-4 py-3 border-b border-[#2d3748]">
            <span className="text-xs font-bold text-[#f59e0b] tracking-wider">OPERATING STATEMENT</span>
          </div>
          <div className="p-4 grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <div className="text-[10px] font-bold text-[#10b981] tracking-wider mb-3">INCOME</div>
              <div className="space-y-1">
                <SummaryRow label="Scheduled Rent" value={`$${fmt(calc.annualRent)}`} />
                <ExpenseInput label="Laundry Income" value={inputs.laundryIncome} onChange={v => setNum('laundryIncome', v)} prefix="$" suffix="/mo" />
                <ExpenseInput label="Parking Income" value={inputs.parkingIncome} onChange={v => setNum('parkingIncome', v)} prefix="$" suffix="/mo" />
                <ExpenseInput label="Other Income" value={inputs.otherIncome} onChange={v => setNum('otherIncome', v)} prefix="$" suffix="/mo" />
                <ExpenseInput label="Vacancy" value={inputs.vacancyPct} onChange={v => setNum('vacancyPct', v)} suffix="%" warning />
                <SummaryRow label="Effective Gross Income" value={`$${fmt(calc.year1EGI)}`} highlight />
              </div>
            </div>
            <div>
              <div className="text-[10px] font-bold text-[#ef4444] tracking-wider mb-3">EXPENSES</div>
              <div className="grid grid-cols-2 gap-1">
                <ExpenseInput label="Taxes" value={inputs.realEstateTaxes} onChange={v => setNum('realEstateTaxes', v)} prefix="$" />
                <ExpenseInput label="Insurance" value={inputs.insurance} onChange={v => setNum('insurance', v)} prefix="$" />
                <ExpenseInput label="Water" value={inputs.water} onChange={v => setNum('water', v)} prefix="$" />
                <ExpenseInput label="Sewer" value={inputs.sewer} onChange={v => setNum('sewer', v)} prefix="$" />
                <ExpenseInput label="Gas" value={inputs.gas} onChange={v => setNum('gas', v)} prefix="$" />
                <ExpenseInput label="Electric" value={inputs.electric} onChange={v => setNum('electric', v)} prefix="$" />
                <ExpenseInput label="Trash" value={inputs.trash} onChange={v => setNum('trash', v)} prefix="$" />
                <ExpenseInput label="Landscape" value={inputs.landscaping} onChange={v => setNum('landscaping', v)} prefix="$" />
                <ExpenseInput label="Repairs" value={inputs.repairsMaintenance} onChange={v => setNum('repairsMaintenance', v)} prefix="$" />
                <ExpenseInput label="Mgmt" value={inputs.managementPct} onChange={v => setNum('managementPct', v)} suffix="%" />
                <ExpenseInput label="Reserves" value={inputs.replacementReserves} onChange={v => setNum('replacementReserves', v)} prefix="$" />
                <ExpenseInput label="Other" value={inputs.miscellaneous} onChange={v => setNum('miscellaneous', v)} prefix="$" />
              </div>
              <div className="mt-2"><SummaryRow label="Total Operating Expenses" value={`$${fmt(calc.year1TotalExpenses)}`} negative /></div>
            </div>
          </div>
          <div className="px-4 pb-4 grid grid-cols-4 gap-3 border-t border-[#2d3748] pt-4">
            <ResultCard label="NOI" value={`$${fmt(calc.year1NOI)}`} />
            <ResultCard label="DEBT SERVICE" value={`$${fmt(calc.annualDebtService)}`} />
            <ResultCard label="CASH FLOW" value={`$${fmt(calc.year1CashFlow)}`} positive={calc.year1CashFlow > 0} negative={calc.year1CashFlow < 0} />
            <ResultCard label="CASH-ON-CASH" value={`${fmtDec(calc.cashOnCash)}%`} positive={calc.cashOnCash >= 8} negative={calc.cashOnCash < 0} />
          </div>
        </section>

        {/* PROJECTION */}
        <section ref={el => { sectionsRef.current['projection'] = el }} className="bg-[#0f1419] rounded border border-[#2d3748]">
          <div className="px-4 py-3 border-b border-[#2d3748] flex items-center justify-between">
            <span className="text-xs font-bold text-[#f59e0b] tracking-wider">{inputs.projectionYears + 1}-YEAR PRO FORMA</span>
            <div className="flex items-center gap-4 text-xs">
              <label className="flex items-center gap-2 text-[#64748b]">RENT↑<input type="number" value={inputs.annualRentIncrease} onChange={e => setNum('annualRentIncrease', e.target.value)} className="w-12 bg-[#1e293b] border border-[#2d3748] rounded px-2 py-1 text-white text-center" step="0.5" />%</label>
              <label className="flex items-center gap-2 text-[#64748b]">EXP↑<input type="number" value={inputs.annualExpenseIncrease} onChange={e => setNum('annualExpenseIncrease', e.target.value)} className="w-12 bg-[#1e293b] border border-[#2d3748] rounded px-2 py-1 text-white text-center" step="0.5" />%</label>
              <label className="flex items-center gap-2 text-[#64748b]">YRS<input type="number" value={inputs.projectionYears} onChange={e => setNum('projectionYears', e.target.value)} className="w-10 bg-[#1e293b] border border-[#2d3748] rounded px-2 py-1 text-white text-center" /></label>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-[#2d3748]">
                  <th className="px-4 py-3 text-left font-bold text-[#64748b] tracking-wider sticky left-0 z-20 bg-[#0f1419] min-w-[200px] border-r border-[#2d3748]">LINE ITEM</th>
                  {calc.years.map(y => <th key={y.year} className="px-3 py-3 text-right font-bold text-[#64748b] min-w-[90px]">{y.year}</th>)}
                </tr>
              </thead>
              <tbody>
                <CollapsibleHeader title="INCOME" expanded={expandedSections.income} onToggle={() => toggleSection('income')} color="green" />
                {expandedSections.income && (
                  <>
                    <ProjectionRow label="Scheduled Rent" values={calc.years.map(y => y.scheduledRent)} indent />
                    {inputs.laundryIncome > 0 && <ProjectionRow label="Laundry Income" values={calc.years.map(y => y.laundryIncome)} indent />}
                    {inputs.otherIncome > 0 && <ProjectionRow label="Other Income" values={calc.years.map(y => y.otherIncome)} indent />}
                  </>
                )}
                <ProjectionRow label="Gross Potential Income" values={calc.years.map(y => y.grossPotentialIncome)} bold />
                <ProjectionRow label={`Vacancy (${inputs.vacancyPct}%)`} values={calc.years.map(y => -y.vacancy)} negative />
                <ProjectionRow label="Effective Gross Income" values={calc.years.map(y => y.effectiveGrossIncome)} bold highlight="green" />

                <CollapsibleHeader title="OPERATING EXPENSES" expanded={expandedSections.expenses} onToggle={() => toggleSection('expenses')} color="red" />
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
                <ProjectionRow label="Total Operating Expenses" values={calc.years.map(y => y.totalOperatingExpenses)} bold highlight="red" />

                <CollapsibleHeader title="NET INCOME" expanded={expandedSections.net} onToggle={() => toggleSection('net')} color="blue" />
                <ProjectionRow label="Net Operating Income" values={calc.years.map(y => y.netOperatingIncome)} bold highlight="green" />
                {expandedSections.net && calc.annualDebtService > 0 && <ProjectionRow label="Debt Service" values={calc.years.map(y => -y.debtService)} negative indent />}
                <ProjectionRow label="Cash Flow Before Tax" values={calc.years.map(y => y.cashFlowBeforeTax)} bold highlight="blue" />
                
                <tr className="border-t-2 border-[#2d3748] bg-[#1e293b]">
                  <td className="px-4 py-3 font-bold text-[#f59e0b] sticky left-0 z-10 bg-[#1e293b] min-w-[200px] border-r border-[#2d3748]">CASH-ON-CASH</td>
                  {calc.years.map(y => {
                    const coc = calc.totalCashRequired > 0 ? (y.cashFlowBeforeTax / calc.totalCashRequired) * 100 : 0
                    return <td key={y.year} className={`px-3 py-3 text-right font-bold ${coc >= 8 ? 'text-[#10b981]' : coc >= 0 ? 'text-white' : 'text-[#ef4444]'}`}>{fmtDec(coc)}%</td>
                  })}
                </tr>
                <tr className="bg-[#0f1419]">
                  <td className="px-4 py-2 text-[#64748b] sticky left-0 z-10 bg-[#0f1419] min-w-[200px] border-r border-[#2d3748]">CAP RATE</td>
                  {calc.years.map(y => <td key={y.year} className="px-3 py-2 text-right text-[#94a3b8]">{fmtDec(inputs.purchasePrice > 0 ? (y.netOperatingIncome / inputs.purchasePrice) * 100 : 0)}%</td>)}
                </tr>
                {calc.annualDebtService > 0 && (
                  <tr className="bg-[#0a0e17]">
                    <td className="px-4 py-2 text-[#64748b] sticky left-0 z-10 bg-[#0a0e17] min-w-[200px] border-r border-[#2d3748]">DSCR</td>
                    {calc.years.map(y => {
                      const d = calc.annualDebtService > 0 ? y.netOperatingIncome / calc.annualDebtService : 0
                      return <td key={y.year} className={`px-3 py-2 text-right ${d >= 1.25 ? 'text-[#10b981]' : d >= 1 ? 'text-[#f59e0b]' : 'text-[#ef4444]'}`}>{fmtDec(d, 2)}x</td>
                    })}
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <footer className="text-center text-[#475569] text-xs py-4 tracking-wider">INVESTOR PRO • INSTITUTIONAL GRADE ANALYTICS</footer>
      </main>

      <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="fixed bottom-4 right-4 w-10 h-10 bg-[#f59e0b] text-black rounded flex items-center justify-center hover:bg-[#d97706] transition-colors shadow-lg"><ChevronUp size={20} /></button>
    </div>
  )
}

// ============================================================================
// COMPONENTS
// ============================================================================

function MetricCard({ label, value, positive, negative }: { label: string; value: string; positive?: boolean; negative?: boolean }) {
  return (
    <div className="bg-gradient-to-br from-[#1e293b] to-[#0f172a] rounded border border-[#2d3748] p-3">
      <div className="text-[9px] text-[#64748b] tracking-widest mb-1">{label}</div>
      <div className={`text-lg font-bold ${negative ? 'text-[#ef4444]' : positive ? 'text-[#10b981]' : 'text-white'}`}>{value}</div>
    </div>
  )
}

function QuickInput({ label, value, onChange, prefix, suffix }: { label: string; value: number; onChange: (v: string) => void; prefix?: string; suffix?: string }) {
  return (
    <div className="flex items-center gap-2 whitespace-nowrap">
      <span className="text-[10px] text-[#64748b] tracking-wider">{label}</span>
      <div className="flex items-center bg-[#1e293b] border border-[#2d3748] rounded">
        {prefix && <span className="pl-2 text-[#64748b] text-xs">{prefix}</span>}
        <input type="number" value={value} onChange={e => onChange(e.target.value)} className="w-20 px-2 py-1.5 bg-transparent text-white text-right text-sm focus:outline-none" />
        {suffix && <span className="pr-2 text-[#64748b] text-xs">{suffix}</span>}
      </div>
    </div>
  )
}

function MetricDisplay({ label, value, positive, negative }: { label: string; value: string; positive?: boolean; negative?: boolean }) {
  return (
    <div className="text-center">
      <div className="text-[9px] text-[#64748b] tracking-widest">{label}</div>
      <div className={`text-sm font-bold ${negative ? 'text-[#ef4444]' : positive ? 'text-[#10b981]' : 'text-white'}`}>{value}</div>
    </div>
  )
}

function StatBox({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`text-center p-2 rounded ${highlight ? 'bg-[#f59e0b]/20 border border-[#f59e0b]/30' : 'bg-[#1e293b]'}`}>
      <div className="text-[9px] text-[#64748b] tracking-widest">{label}</div>
      <div className={`text-sm font-bold ${highlight ? 'text-[#f59e0b]' : 'text-white'}`}>{value}</div>
    </div>
  )
}

function InputField({ label, value, onChange, prefix, suffix }: { label: string; value: number; onChange: (v: string) => void; prefix?: string; suffix?: string }) {
  return (
    <div>
      <label className="block text-[10px] text-[#64748b] tracking-wider mb-1">{label}</label>
      <div className="flex items-center bg-[#1e293b] border border-[#2d3748] rounded focus-within:border-[#f59e0b]">
        {prefix && <span className="pl-2 text-[#64748b] text-sm">{prefix}</span>}
        <input type="number" value={value} onChange={e => onChange(e.target.value)} className="w-full px-2 py-2 bg-transparent text-white text-right text-sm focus:outline-none" />
        {suffix && <span className="pr-2 text-[#64748b] text-xs">{suffix}</span>}
      </div>
    </div>
  )
}

function ExpenseInput({ label, value, onChange, prefix, suffix, warning }: { label: string; value: number; onChange: (v: string) => void; prefix?: string; suffix?: string; warning?: boolean }) {
  return (
    <div className={`flex items-center justify-between py-1.5 px-2 rounded border ${warning ? 'bg-[#f59e0b]/10 border-[#f59e0b]/30' : 'bg-[#1e293b]/50 border-[#2d3748]'}`}>
      <span className="text-xs text-[#94a3b8]">{label}</span>
      <div className="flex items-center">
        {prefix && <span className="text-[#64748b] text-xs mr-1">{prefix}</span>}
        <input type="number" value={value} onChange={e => onChange(e.target.value)} className="w-16 bg-[#1e293b] border border-[#2d3748] rounded px-2 py-1 text-white text-right text-xs focus:border-[#f59e0b] focus:outline-none" />
        {suffix && <span className="text-[#64748b] text-xs ml-1">{suffix}</span>}
      </div>
    </div>
  )
}

function SummaryRow({ label, value, highlight, negative }: { label: string; value: string; highlight?: boolean; negative?: boolean }) {
  return (
    <div className={`flex items-center justify-between py-2 px-3 rounded ${highlight ? 'bg-[#10b981]/10 border border-[#10b981]/30' : negative ? 'bg-[#ef4444]/10 border border-[#ef4444]/30' : 'bg-[#1e293b]/50'}`}>
      <span className={`text-sm ${highlight ? 'text-[#10b981] font-bold' : negative ? 'text-[#ef4444] font-bold' : 'text-[#94a3b8]'}`}>{label}</span>
      <span className={`text-sm font-bold ${highlight ? 'text-[#10b981]' : negative ? 'text-[#ef4444]' : 'text-white'}`}>{value}</span>
    </div>
  )
}

function ResultCard({ label, value, positive, negative }: { label: string; value: string; positive?: boolean; negative?: boolean }) {
  return (
    <div className={`p-3 rounded border text-center ${negative ? 'bg-[#ef4444]/10 border-[#ef4444]/30' : positive ? 'bg-[#10b981]/10 border-[#10b981]/30' : 'bg-[#1e293b] border-[#2d3748]'}`}>
      <div className="text-[9px] text-[#64748b] tracking-widest mb-1">{label}</div>
      <div className={`text-xl font-bold ${negative ? 'text-[#ef4444]' : positive ? 'text-[#10b981]' : 'text-white'}`}>{value}</div>
    </div>
  )
}

function BreakevenRow({ label, value, current, ok }: { label: string; value: string; current: string; ok: boolean }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-[#2d3748] last:border-0">
      <div>
        <div className="text-sm text-white">{label}</div>
        <div className="text-[10px] text-[#64748b]">Current: {current}</div>
      </div>
      <div className="flex items-center gap-2">
        <span className="font-bold text-white">{value}</span>
        {ok ? <Check size={16} className="text-[#10b981]" /> : <X size={16} className="text-[#ef4444]" />}
      </div>
    </div>
  )
}

function InsightRow({ insight }: { insight: AnalysisInsight }) {
  const styles = {
    positive: { border: 'border-[#10b981]/30', bg: 'bg-[#10b981]/10', icon: <TrendingUp size={14} className="text-[#10b981]" />, text: 'text-[#10b981]' },
    negative: { border: 'border-[#ef4444]/30', bg: 'bg-[#ef4444]/10', icon: <TrendingDown size={14} className="text-[#ef4444]" />, text: 'text-[#ef4444]' },
    warning: { border: 'border-[#f59e0b]/30', bg: 'bg-[#f59e0b]/10', icon: <AlertTriangle size={14} className="text-[#f59e0b]" />, text: 'text-[#f59e0b]' },
    info: { border: 'border-[#3b82f6]/30', bg: 'bg-[#3b82f6]/10', icon: <TrendingUp size={14} className="text-[#3b82f6]" />, text: 'text-[#3b82f6]' },
  }
  const s = styles[insight.type]
  return (
    <div className={`flex items-start gap-3 p-3 rounded border ${s.border} ${s.bg}`}>
      <div className="mt-0.5">{s.icon}</div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <span className={`text-sm font-bold ${s.text}`}>{insight.title}</span>
          {insight.value && <span className="text-xs font-bold text-white bg-[#1e293b] px-2 py-0.5 rounded">{insight.value}</span>}
        </div>
        <p className="text-xs text-[#94a3b8] mt-1">{insight.detail}</p>
      </div>
    </div>
  )
}

function CollapsibleHeader({ title, expanded, onToggle, color }: { title: string; expanded: boolean; onToggle: () => void; color: 'green' | 'red' | 'blue' }) {
  const colors = { green: 'bg-[#10b981]', red: 'bg-[#ef4444]', blue: 'bg-[#3b82f6]' }
  return (
    <tr className={`${colors[color]} cursor-pointer hover:opacity-90`} onClick={onToggle}>
      <td className={`px-4 py-2 font-bold text-white text-xs tracking-wider sticky left-0 z-10 ${colors[color]} min-w-[200px]`}>
        <div className="flex items-center gap-2">{expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}{title}</div>
      </td>
      <td colSpan={99}></td>
    </tr>
  )
}

function ProjectionRow({ label, values, bold, negative, highlight, indent }: { label: string; values: number[]; bold?: boolean; negative?: boolean; highlight?: 'green' | 'red' | 'blue'; indent?: boolean }) {
  const bgClass = highlight === 'green' ? 'bg-[#10b981]/10' : highlight === 'red' ? 'bg-[#ef4444]/10' : highlight === 'blue' ? 'bg-[#3b82f6]/10' : ''
  const textClass = highlight === 'green' ? 'text-[#10b981]' : highlight === 'red' ? 'text-[#ef4444]' : highlight === 'blue' ? 'text-[#3b82f6]' : ''
  return (
    <tr className={`border-b border-[#1e293b] ${bgClass}`}>
      <td className={`px-4 py-2 sticky left-0 z-10 min-w-[200px] border-r border-[#2d3748] ${bgClass || 'bg-[#0f1419]'} ${bold ? `font-bold ${textClass || 'text-white'}` : 'text-[#94a3b8]'} ${indent ? 'pl-8' : ''}`}>{label}</td>
      {values.map((v, i) => (
        <td key={i} className={`px-3 py-2 text-right ${negative && v < 0 ? 'text-[#ef4444]' : ''} ${bold ? `font-bold ${textClass || 'text-white'}` : 'text-[#94a3b8]'}`}>
          {negative && v < 0 ? `(${fmt(Math.abs(v))})` : `$${fmt(Math.abs(v))}`}
        </td>
      ))}
    </tr>
  )
}
