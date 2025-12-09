import { useState, useMemo, useEffect } from 'react'
import { Plus, Trash2, Download, RotateCcw, Printer } from 'lucide-react'

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
// MAIN COMPONENT
// ============================================================================

export function ProFormaApp() {
  const [inputs, setInputs] = useState<Inputs>(() => {
    const saved = localStorage.getItem('proforma-v3')
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
    localStorage.setItem('proforma-v3', JSON.stringify(inputs))
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

    // === YEAR-BY-YEAR PROJECTION ===
    const years: {
      year: number
      // Income
      scheduledRent: number
      otherIncome: number
      grossPotentialIncome: number
      vacancy: number
      effectiveGrossIncome: number
      // Expenses
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
      // Results
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

    // === KEY METRICS ===
    const year1 = years[0]
    const capRate = purchasePrice > 0 ? (year1.netOperatingIncome / purchasePrice) * 100 : 0
    const cashOnCash = totalCashRequired > 0 ? (year1.cashFlowBeforeTax / totalCashRequired) * 100 : 0
    const grossRentMultiplier = annualRent > 0 ? purchasePrice / annualRent : 0
    const dscr = annualDebtService > 0 ? year1.netOperatingIncome / annualDebtService : 0
    const expenseRatio = year1.effectiveGrossIncome > 0 ? (year1.totalOperatingExpenses / year1.effectiveGrossIncome) * 100 : 0

    // === EXIT ===
    const exitYearNOI = years[projectionYears]?.netOperatingIncome || 0
    const exitValue = exitCapRate > 0 ? exitYearNOI / (exitCapRate / 100) : 0

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
      monthlyMortgage,
      annualDebtService,
      totalCashRequired,
      years,
      capRate,
      cashOnCash,
      grossRentMultiplier,
      dscr,
      expenseRatio,
      exitValue,
    }
  }, [inputs])

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="min-h-screen bg-white text-gray-900 print:bg-white">
      {/* HEADER */}
      <header className="bg-[#1e3a5f] text-white px-6 py-4 print:bg-white print:text-black print:border-b-2 print:border-black">
        <div className="max-w-[1400px] mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">INVESTMENT PRO FORMA</h1>
            <p className="text-blue-200 text-sm print:text-gray-600">Real Estate Investment Analysis</p>
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

      <main className="max-w-[1400px] mx-auto p-6 space-y-8">
        
        {/* PROPERTY IDENTIFICATION */}
        <section className="bg-gray-50 border border-gray-300 rounded-lg overflow-hidden">
          <div className="bg-[#1e3a5f] text-white px-4 py-2 font-semibold text-lg">
            PROPERTY IDENTIFICATION
          </div>
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

        {/* UNIT SCHEDULE / RENT ROLL */}
        <section className="bg-gray-50 border border-gray-300 rounded-lg overflow-hidden">
          <div className="bg-[#1e3a5f] text-white px-4 py-2 font-semibold text-lg flex items-center justify-between">
            <span>UNIT SCHEDULE (RENT ROLL)</span>
            <button onClick={addUnit} className="flex items-center gap-1 px-3 py-1 bg-white/20 hover:bg-white/30 rounded text-sm print:hidden">
              <Plus size={16} /> Add Unit
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-200 border-b-2 border-gray-400">
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Unit</th>
                  <th className="px-4 py-3 text-center font-semibold text-gray-700">Bedrooms</th>
                  <th className="px-4 py-3 text-center font-semibold text-gray-700">Bathrooms</th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-700">Square Feet</th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-700">Monthly Rent</th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-700">$ per Sq Ft</th>
                  <th className="px-4 py-3 text-center font-semibold text-gray-700 print:hidden"></th>
                </tr>
              </thead>
              <tbody>
                {inputs.units.map((unit, idx) => (
                  <tr key={unit.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-4 py-2 border-b border-gray-200">
                      <input
                        type="text"
                        value={unit.unitNumber}
                        onChange={e => updateUnit(unit.id, 'unitNumber', e.target.value)}
                        className="w-24 px-2 py-1 border border-gray-300 rounded bg-white text-sm"
                      />
                    </td>
                    <td className="px-4 py-2 border-b border-gray-200 text-center">
                      <input
                        type="number"
                        value={unit.bedrooms}
                        onChange={e => updateUnit(unit.id, 'bedrooms', e.target.value)}
                        className="w-16 px-2 py-1 border border-gray-300 rounded bg-white text-center text-sm"
                      />
                    </td>
                    <td className="px-4 py-2 border-b border-gray-200 text-center">
                      <input
                        type="number"
                        value={unit.bathrooms}
                        onChange={e => updateUnit(unit.id, 'bathrooms', e.target.value)}
                        className="w-16 px-2 py-1 border border-gray-300 rounded bg-white text-center text-sm"
                      />
                    </td>
                    <td className="px-4 py-2 border-b border-gray-200 text-right">
                      <input
                        type="number"
                        value={unit.sqft}
                        onChange={e => updateUnit(unit.id, 'sqft', e.target.value)}
                        className="w-20 px-2 py-1 border border-gray-300 rounded bg-white text-right text-sm"
                      />
                    </td>
                    <td className="px-4 py-2 border-b border-gray-200 text-right">
                      <div className="flex items-center justify-end">
                        <span className="text-gray-500 mr-1">$</span>
                        <input
                          type="number"
                          value={unit.rent}
                          onChange={e => updateUnit(unit.id, 'rent', e.target.value)}
                          className="w-24 px-2 py-1 border border-gray-300 rounded bg-white text-right text-sm"
                        />
                      </div>
                    </td>
                    <td className="px-4 py-2 border-b border-gray-200 text-right text-gray-600">
                      ${fmtDec(unit.rent / unit.sqft)}
                    </td>
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
                <tr className="bg-[#d4e8d4] border-t-2 border-gray-400 font-semibold">
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

        {/* TWO COLUMN LAYOUT: ACQUISITION + KEY METRICS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* ACQUISITION & FINANCING */}
          <section className="bg-gray-50 border border-gray-300 rounded-lg overflow-hidden">
            <div className="bg-[#1e3a5f] text-white px-4 py-2 font-semibold text-lg">
              ACQUISITION & FINANCING
            </div>
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <NumberInput label="Purchase Price" value={inputs.purchasePrice} onChange={v => setNum('purchasePrice', v)} prefix="$" />
                <NumberInput label="Closing Costs" value={inputs.closingCosts} onChange={v => setNum('closingCosts', v)} prefix="$" />
                <NumberInput label="Immediate Repairs" value={inputs.immediateRepairs} onChange={v => setNum('immediateRepairs', v)} prefix="$" />
                <div className="bg-blue-50 border border-blue-200 rounded p-3">
                  <div className="text-sm text-gray-600">Total Acquisition Cost</div>
                  <div className="text-xl font-bold text-blue-800">${fmt(calc.totalAcquisitionCost)}</div>
                </div>
              </div>
              
              <div className="border-t border-gray-300 pt-4">
                <div className="font-semibold text-gray-700 mb-3">Financing Terms</div>
                <div className="grid grid-cols-3 gap-4">
                  <NumberInput label="Down Payment" value={inputs.downPaymentPct} onChange={v => setNum('downPaymentPct', v)} suffix="%" />
                  <NumberInput label="Interest Rate" value={inputs.interestRate} onChange={v => setNum('interestRate', v)} suffix="%" />
                  <NumberInput label="Loan Term" value={inputs.loanTermYears} onChange={v => setNum('loanTermYears', v)} suffix="Years" />
                </div>
              </div>

              <div className="bg-gray-100 rounded p-4 grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-gray-600">Down Payment:</span> <span className="font-semibold">${fmt(calc.downPayment)}</span></div>
                <div><span className="text-gray-600">Loan Amount:</span> <span className="font-semibold">${fmt(calc.loanAmount)}</span></div>
                <div><span className="text-gray-600">Monthly Payment:</span> <span className="font-semibold">${fmt(calc.monthlyMortgage)}</span></div>
                <div><span className="text-gray-600">Annual Debt Service:</span> <span className="font-semibold">${fmt(calc.annualDebtService)}</span></div>
                <div className="col-span-2 pt-2 border-t border-gray-300">
                  <span className="text-gray-600">Total Cash Required:</span> <span className="font-bold text-lg">${fmt(calc.totalCashRequired)}</span>
                </div>
              </div>
            </div>
          </section>

          {/* KEY INVESTMENT METRICS */}
          <section className="bg-gray-50 border border-gray-300 rounded-lg overflow-hidden">
            <div className="bg-[#1e3a5f] text-white px-4 py-2 font-semibold text-lg">
              KEY INVESTMENT METRICS
            </div>
            <div className="p-4">
              <div className="grid grid-cols-2 gap-4">
                <MetricBox label="Price Per Square Foot" value={`$${fmtDec(calc.pricePerSqft)}`} />
                <MetricBox label="Price Per Unit" value={`$${fmt(calc.pricePerUnit)}`} />
                <MetricBox label="Monthly Rental Income" value={`$${fmt(calc.monthlyRent)}`} />
                <MetricBox label="Annual Rental Income" value={`$${fmt(calc.annualRent)}`} highlight />
                <MetricBox label="Gross Rent Multiplier (GRM)" value={fmtDec(calc.grossRentMultiplier, 2)} />
                <MetricBox label="Expense Ratio" value={`${fmtDec(calc.expenseRatio, 1)}%`} />
                <MetricBox label="Capitalization Rate" value={`${fmtDec(calc.capRate, 2)}%`} highlight={calc.capRate >= 5} />
                <MetricBox label="Cash-on-Cash Return" value={`${fmtDec(calc.cashOnCash, 2)}%`} highlight={calc.cashOnCash >= 6} negative={calc.cashOnCash < 0} />
                <MetricBox label="Debt Service Coverage (DSCR)" value={fmtDec(calc.dscr, 2)} highlight={calc.dscr >= 1.25} />
                <MetricBox label="Year 1 Cash Flow" value={`$${fmt(calc.years[0]?.cashFlowBeforeTax || 0)}`} highlight={(calc.years[0]?.cashFlowBeforeTax || 0) > 0} negative={(calc.years[0]?.cashFlowBeforeTax || 0) < 0} />
              </div>
            </div>
          </section>
        </div>

        {/* INCOME & EXPENSES SECTION */}
        <section className="bg-gray-50 border border-gray-300 rounded-lg overflow-hidden">
          <div className="bg-[#1e3a5f] text-white px-4 py-2 font-semibold text-lg">
            ANNUAL INCOME & OPERATING EXPENSES
          </div>
          <div className="p-4 grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* INCOME */}
            <div>
              <div className="font-semibold text-gray-700 mb-3 pb-2 border-b border-gray-300">INCOME</div>
              <div className="space-y-2">
                <div className="flex justify-between py-2 bg-white px-3 rounded">
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
                <div className="flex justify-between py-3 bg-green-100 px-3 rounded font-bold text-green-800 text-lg border border-green-300">
                  <span>GROSS POTENTIAL INCOME</span>
                  <span>${fmt(calc.grossPotentialIncome)}</span>
                </div>
                <NumberInput label="Vacancy & Credit Loss" value={inputs.vacancyPct} onChange={v => setNum('vacancyPct', v)} suffix="%" inline />
                <div className="flex justify-between py-3 bg-green-200 px-3 rounded font-bold text-green-900 text-lg border border-green-400">
                  <span>EFFECTIVE GROSS INCOME</span>
                  <span>${fmt(calc.years[0]?.effectiveGrossIncome || 0)}</span>
                </div>
              </div>
            </div>

            {/* EXPENSES */}
            <div>
              <div className="font-semibold text-gray-700 mb-3 pb-2 border-b border-gray-300">OPERATING EXPENSES (Annual)</div>
              <div className="space-y-2">
                <NumberInput label="Real Estate Taxes" value={inputs.realEstateTaxes} onChange={v => setNum('realEstateTaxes', v)} prefix="$" inline />
                <NumberInput label="Property Insurance" value={inputs.insurance} onChange={v => setNum('insurance', v)} prefix="$" inline />
                <NumberInput label="Water" value={inputs.water} onChange={v => setNum('water', v)} prefix="$" inline />
                <NumberInput label="Sewer" value={inputs.sewer} onChange={v => setNum('sewer', v)} prefix="$" inline />
                <NumberInput label="Gas" value={inputs.gas} onChange={v => setNum('gas', v)} prefix="$" inline />
                <NumberInput label="Electric" value={inputs.electric} onChange={v => setNum('electric', v)} prefix="$" inline />
                <NumberInput label="Trash Removal" value={inputs.trash} onChange={v => setNum('trash', v)} prefix="$" inline />
                <NumberInput label="Landscaping / Grounds" value={inputs.landscaping} onChange={v => setNum('landscaping', v)} prefix="$" inline />
                <NumberInput label="Snow Removal" value={inputs.snowRemoval} onChange={v => setNum('snowRemoval', v)} prefix="$" inline />
                <NumberInput label="Repairs & Maintenance" value={inputs.repairsMaintenance} onChange={v => setNum('repairsMaintenance', v)} prefix="$" inline />
                <NumberInput label="Pest Control" value={inputs.pestControl} onChange={v => setNum('pestControl', v)} prefix="$" inline />
                <NumberInput label="Property Management" value={inputs.managementPct} onChange={v => setNum('managementPct', v)} suffix="% of EGI" inline />
                <NumberInput label="Legal & Accounting" value={inputs.legalAccounting} onChange={v => setNum('legalAccounting', v)} prefix="$" inline />
                <NumberInput label="Advertising & Marketing" value={inputs.advertising} onChange={v => setNum('advertising', v)} prefix="$" inline />
                <NumberInput label="Miscellaneous" value={inputs.miscellaneous} onChange={v => setNum('miscellaneous', v)} prefix="$" inline />
                <NumberInput label="Replacement Reserves" value={inputs.replacementReserves} onChange={v => setNum('replacementReserves', v)} prefix="$" inline />
                <div className="flex justify-between py-3 bg-yellow-100 px-3 rounded font-bold text-yellow-800 text-lg border border-yellow-300">
                  <span>TOTAL OPERATING EXPENSES</span>
                  <span>${fmt(calc.years[0]?.totalOperatingExpenses || 0)}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* GROWTH ASSUMPTIONS */}
        <section className="bg-gray-50 border border-gray-300 rounded-lg overflow-hidden">
          <div className="bg-[#1e3a5f] text-white px-4 py-2 font-semibold text-lg">
            PROJECTION ASSUMPTIONS
          </div>
          <div className="p-4 grid grid-cols-2 md:grid-cols-4 gap-4">
            <NumberInput label="Annual Rent Increase" value={inputs.annualRentIncrease} onChange={v => setNum('annualRentIncrease', v)} suffix="%" />
            <NumberInput label="Annual Expense Increase" value={inputs.annualExpenseIncrease} onChange={v => setNum('annualExpenseIncrease', v)} suffix="%" />
            <NumberInput label="Projection Period" value={inputs.projectionYears} onChange={v => setNum('projectionYears', v)} suffix="Years" />
            <NumberInput label="Exit Cap Rate" value={inputs.exitCapRate} onChange={v => setNum('exitCapRate', v)} suffix="%" />
          </div>
        </section>

        {/* PRO FORMA PROJECTION TABLE */}
        <section className="bg-gray-50 border border-gray-300 rounded-lg overflow-hidden">
          <div className="bg-[#1e3a5f] text-white px-4 py-2 font-semibold text-lg">
            {inputs.projectionYears + 1}-YEAR PRO FORMA PROJECTION
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-gray-200">
                  <th className="px-4 py-3 text-left font-semibold text-gray-700 border-b-2 border-gray-400 min-w-[200px] sticky left-0 bg-gray-200">Line Item</th>
                  {calc.years.map(y => (
                    <th key={y.year} className="px-4 py-3 text-right font-semibold text-gray-700 border-b-2 border-gray-400 min-w-[110px]">{y.year}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {/* INCOME SECTION */}
                <SectionHeader label="INCOME" colSpan={calc.years.length + 1} />
                <DataRow label="Scheduled Rental Income" values={calc.years.map(y => y.scheduledRent)} />
                <DataRow label="Other Income" values={calc.years.map(y => y.otherIncome)} />
                <DataRow label="Gross Potential Income" values={calc.years.map(y => y.grossPotentialIncome)} bold className="bg-gray-100" />
                <DataRow label="Less: Vacancy & Credit Loss" values={calc.years.map(y => -y.vacancy)} negative />
                <DataRow label="EFFECTIVE GROSS INCOME" values={calc.years.map(y => y.effectiveGrossIncome)} bold className="bg-green-100 text-green-800" />

                {/* EXPENSES SECTION */}
                <SectionHeader label="OPERATING EXPENSES" colSpan={calc.years.length + 1} />
                <DataRow label="Real Estate Taxes" values={calc.years.map(y => y.realEstateTaxes)} />
                <DataRow label="Insurance" values={calc.years.map(y => y.insurance)} />
                <DataRow label="Utilities (Water, Sewer, Gas, Electric)" values={calc.years.map(y => y.utilities)} />
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
                <DataRow label="TOTAL OPERATING EXPENSES" values={calc.years.map(y => y.totalOperatingExpenses)} bold className="bg-yellow-100 text-yellow-800" />

                {/* RESULTS SECTION */}
                <SectionHeader label="NET INCOME & CASH FLOW" colSpan={calc.years.length + 1} />
                <DataRow label="NET OPERATING INCOME (NOI)" values={calc.years.map(y => y.netOperatingIncome)} bold className="bg-green-200 text-green-900 text-base" />
                <DataRow label="Less: Annual Debt Service" values={calc.years.map(y => -y.debtService)} negative />
                <DataRow label="CASH FLOW BEFORE TAX" values={calc.years.map(y => y.cashFlowBeforeTax)} bold className="bg-blue-100 text-blue-900 text-base" />
                
                {/* ROI ROW */}
                <tr className="bg-gray-200 border-t-2 border-gray-400">
                  <td className="px-4 py-3 font-bold sticky left-0 bg-gray-200">CASH-ON-CASH RETURN</td>
                  {calc.years.map(y => {
                    const coc = calc.totalCashRequired > 0 ? (y.cashFlowBeforeTax / calc.totalCashRequired) * 100 : 0
                    return (
                      <td key={y.year} className={`px-4 py-3 text-right font-bold ${coc >= 8 ? 'text-green-700' : coc >= 0 ? 'text-gray-900' : 'text-red-600'}`}>
                        {fmtDec(coc, 2)}%
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
          Free Investment Pro Forma Tool • All data saved locally in your browser • 
          <span className="text-gray-400 ml-2">Last saved: {new Date().toLocaleString()}</span>
        </footer>
      </main>
    </div>
  )
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

function NumberInput({ 
  label, 
  value, 
  onChange, 
  prefix, 
  suffix,
  inline = false 
}: { 
  label: string
  value: number
  onChange: (v: string) => void
  prefix?: string
  suffix?: string
  inline?: boolean
}) {
  if (inline) {
    return (
      <div className="flex items-center justify-between py-2 bg-white px-3 rounded border border-gray-200">
        <label className="text-gray-700">{label}</label>
        <div className="flex items-center">
          {prefix && <span className="text-gray-500 mr-1 text-sm">{prefix}</span>}
          <input
            type="number"
            value={value}
            onChange={e => onChange(e.target.value)}
            className="w-24 px-2 py-1 border border-gray-300 rounded text-right text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500"
          />
          {suffix && <span className="text-gray-500 ml-1 text-sm">{suffix}</span>}
        </div>
      </div>
    )
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-600 mb-1">{label}</label>
      <div className="flex items-center border border-gray-300 rounded bg-white focus-within:ring-2 focus-within:ring-blue-500">
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

function MetricBox({ label, value, highlight, negative }: { label: string; value: string; highlight?: boolean; negative?: boolean }) {
  return (
    <div className={`p-4 rounded border ${
      negative ? 'bg-red-50 border-red-300' :
      highlight ? 'bg-green-50 border-green-300' : 
      'bg-white border-gray-300'
    }`}>
      <div className="text-sm text-gray-600 mb-1">{label}</div>
      <div className={`text-xl font-bold ${
        negative ? 'text-red-700' :
        highlight ? 'text-green-700' : 
        'text-gray-900'
      }`}>{value}</div>
    </div>
  )
}

function SectionHeader({ label, colSpan }: { label: string; colSpan: number }) {
  return (
    <tr className="bg-[#1e3a5f]">
      <td colSpan={colSpan} className="px-4 py-2 text-white font-semibold text-sm sticky left-0 bg-[#1e3a5f]">
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
    <tr className={`border-b border-gray-200 ${className}`}>
      <td className={`px-4 py-2 sticky left-0 ${className || 'bg-white'} ${bold ? 'font-semibold' : ''}`}>{label}</td>
      {values.map((v, i) => (
        <td key={i} className={`px-4 py-2 text-right font-mono ${
          negative && v < 0 ? 'text-red-600' : 
          bold ? 'font-semibold' : ''
        }`}>
          ${fmt(Math.abs(v))}
        </td>
      ))}
    </tr>
  )
}
