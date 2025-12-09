import { useState, useMemo, useEffect } from 'react'
import { Plus, Trash2, Download, RotateCcw } from 'lucide-react'

// ============================================================================
// TYPES
// ============================================================================

interface Unit {
  id: string
  bedrooms: number
  bathrooms: number
  sqft: number
  rent: number
}

interface Inputs {
  propertyName: string
  purchasePrice: number
  capitalImprovements: number
  downPaymentPct: number
  interestRate: number
  loanTerm: number
  closingCostsPct: number
  units: Unit[]
  otherIncome: number
  propertyTaxes: number
  insurance: number
  repairs: number
  utilities: number
  managementPct: number
  trash: number
  landscape: number
  reserves: number
  vacancyPct: number
  rentGrowth: number
  expenseGrowth: number
  holdYears: number
  exitCapRate: number
}

const defaultInputs: Inputs = {
  propertyName: '',
  purchasePrice: 2300000,
  capitalImprovements: 0,
  downPaymentPct: 25,
  interestRate: 7,
  loanTerm: 30,
  closingCostsPct: 2,
  units: [
    { id: '1', bedrooms: 1, bathrooms: 1, sqft: 550, rent: 1600 },
    { id: '2', bedrooms: 1, bathrooms: 1, sqft: 550, rent: 1600 },
    { id: '3', bedrooms: 1, bathrooms: 1, sqft: 550, rent: 1600 },
    { id: '4', bedrooms: 2, bathrooms: 1, sqft: 775, rent: 1800 },
    { id: '5', bedrooms: 1, bathrooms: 1, sqft: 550, rent: 1600 },
    { id: '6', bedrooms: 1, bathrooms: 1, sqft: 550, rent: 1600 },
    { id: '7', bedrooms: 1, bathrooms: 1, sqft: 550, rent: 1550 },
    { id: '8', bedrooms: 1, bathrooms: 1, sqft: 550, rent: 1600 },
    { id: '9', bedrooms: 1, bathrooms: 1, sqft: 550, rent: 1600 },
    { id: '10', bedrooms: 2, bathrooms: 1, sqft: 775, rent: 1800 },
    { id: '11', bedrooms: 1, bathrooms: 1, sqft: 550, rent: 1600 },
    { id: '12', bedrooms: 1, bathrooms: 1, sqft: 550, rent: 1600 },
  ],
  otherIncome: 208,
  propertyTaxes: 47915,
  insurance: 11000,
  repairs: 4800,
  utilities: 10300,
  managementPct: 5,
  trash: 2400,
  landscape: 2400,
  reserves: 0,
  vacancyPct: 5,
  rentGrowth: 3,
  expenseGrowth: 3,
  holdYears: 10,
  exitCapRate: 6,
}

// ============================================================================
// HELPERS
// ============================================================================

const fmt = (n: number, dec = 0) => n.toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec })
const fmtMoney = (n: number, dec = 0) => '$' + fmt(Math.abs(n), dec)
const fmtPct = (n: number, dec = 2) => fmt(n, dec) + '%'

// ============================================================================
// MAIN APP
// ============================================================================

export function ProFormaApp() {
  const [inputs, setInputs] = useState<Inputs>(() => {
    const saved = localStorage.getItem('proforma-v2')
    return saved ? { ...defaultInputs, ...JSON.parse(saved) } : defaultInputs
  })

  useEffect(() => {
    localStorage.setItem('proforma-v2', JSON.stringify(inputs))
  }, [inputs])

  const set = <K extends keyof Inputs>(k: K, v: Inputs[K]) => setInputs(p => ({ ...p, [k]: v }))
  const setNum = (k: keyof Inputs, v: string) => set(k, parseFloat(v) || 0)

  const updateUnit = (id: string, field: keyof Unit, value: number) => {
    set('units', inputs.units.map(u => u.id === id ? { ...u, [field]: value } : u))
  }

  const addUnit = () => {
    const id = String(Date.now())
    set('units', [...inputs.units, { id, bedrooms: 1, bathrooms: 1, sqft: 550, rent: 1600 }])
  }

  const removeUnit = (id: string) => {
    if (inputs.units.length > 1) set('units', inputs.units.filter(u => u.id !== id))
  }

  const reset = () => {
    if (confirm('Reset all values to defaults?')) {
      setInputs(defaultInputs)
      localStorage.removeItem('proforma-v2')
    }
  }

  // ============================================================================
  // CALCULATIONS
  // ============================================================================

  const calc = useMemo(() => {
    const { units, purchasePrice, capitalImprovements, downPaymentPct, interestRate, loanTerm,
            closingCostsPct, otherIncome, propertyTaxes, insurance, repairs, utilities,
            managementPct, trash, landscape, reserves, vacancyPct, rentGrowth, expenseGrowth,
            holdYears, exitCapRate } = inputs

    // Unit metrics
    const totalSqft = units.reduce((s, u) => s + u.sqft, 0)
    const monthlyRent = units.reduce((s, u) => s + u.rent, 0)
    const annualRent = monthlyRent * 12
    const annualOther = otherIncome * 12
    const gpi = annualRent + annualOther
    
    // Acquisition
    const closingCosts = purchasePrice * (closingCostsPct / 100)
    const totalAcquisition = purchasePrice + closingCosts + capitalImprovements
    const pricePerSqft = totalSqft > 0 ? purchasePrice / totalSqft : 0
    
    // Financing
    const downPayment = purchasePrice * (downPaymentPct / 100)
    const loanAmount = purchasePrice - downPayment
    const monthlyRate = interestRate / 100 / 12
    const numPayments = loanTerm * 12
    const monthlyDebt = loanAmount > 0 && monthlyRate > 0
      ? loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / (Math.pow(1 + monthlyRate, numPayments) - 1)
      : 0
    const annualDebt = monthlyDebt * 12
    
    // Total equity
    const equity = downPayment + closingCosts + capitalImprovements
    
    // Year-by-year
    const years: {
      year: number
      rent: number
      vacancy: number
      egi: number
      taxes: number
      insurance: number
      repairs: number
      utilities: number
      management: number
      trash: number
      landscape: number
      reserves: number
      opex: number
      noi: number
      leasing: number
      ti: number
      capReserves: number
      totalCapex: number
      cfBeforeDebt: number
      debt: number
      cfAfterDebt: number
      coc: number
    }[] = []
    
    for (let i = 0; i <= holdYears; i++) {
      const rentGrowthFactor = Math.pow(1 + rentGrowth / 100, i)
      const expGrowthFactor = Math.pow(1 + expenseGrowth / 100, i)
      
      const rent = gpi * rentGrowthFactor
      const vacancy = rent * (vacancyPct / 100)
      const egi = rent - vacancy
      
      const taxes = propertyTaxes * expGrowthFactor
      const ins = insurance * expGrowthFactor
      const rep = repairs * expGrowthFactor
      const util = utilities * expGrowthFactor
      const mgmt = egi * (managementPct / 100)
      const trsh = trash * expGrowthFactor
      const land = landscape * expGrowthFactor
      const res = reserves * expGrowthFactor
      
      const opex = taxes + ins + rep + util + mgmt + trsh + land + res
      const noi = egi - opex
      
      // Capital costs (simplified)
      const leasing = egi * 0.05
      const ti = 1000
      const capReserves = 1800
      const totalCapex = leasing + ti + capReserves
      
      const cfBeforeDebt = noi - totalCapex
      const cfAfterDebt = cfBeforeDebt - annualDebt
      const coc = equity > 0 ? (cfAfterDebt / equity) * 100 : 0
      
      years.push({
        year: 2024 + i,
        rent, vacancy, egi,
        taxes, insurance: ins, repairs: rep, utilities: util, management: mgmt, 
        trash: trsh, landscape: land, reserves: res,
        opex, noi,
        leasing, ti, capReserves, totalCapex,
        cfBeforeDebt, debt: annualDebt, cfAfterDebt, coc
      })
    }
    
    const year1 = years[0]
    const exitNOI = years[holdYears]?.noi || 0
    const exitValue = exitCapRate > 0 ? exitNOI / (exitCapRate / 100) : 0
    
    return {
      totalSqft, monthlyRent, annualRent, gpi, pricePerSqft,
      closingCosts, totalAcquisition, downPayment, loanAmount,
      monthlyDebt, annualDebt, equity, years,
      capRate: purchasePrice > 0 ? (year1.noi / purchasePrice) * 100 : 0,
      coc: year1.coc,
      exitValue,
    }
  }, [inputs])

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="min-h-screen bg-[#1a1f2e] text-slate-100 font-sans">
      {/* Header */}
      <div className="bg-[#141821] border-b border-slate-700 px-4 py-3 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="text-emerald-400 text-2xl font-bold tracking-tight">PRO FORMA</div>
          <input
            type="text"
            value={inputs.propertyName}
            onChange={e => set('propertyName', e.target.value)}
            placeholder="Property Name"
            className="bg-transparent border-b border-slate-600 px-2 py-1 text-lg font-medium focus:outline-none focus:border-emerald-400"
          />
        </div>
        <div className="flex gap-2">
          <button onClick={reset} className="flex items-center gap-1 px-3 py-1.5 text-sm bg-slate-700 hover:bg-slate-600 rounded">
            <RotateCcw size={14} /> Reset
          </button>
          <button className="flex items-center gap-1 px-3 py-1.5 text-sm bg-emerald-600 hover:bg-emerald-500 rounded font-medium">
            <Download size={14} /> Export
          </button>
        </div>
      </div>

      <div className="max-w-[1800px] mx-auto p-4 space-y-6">
        
        {/* TOP SECTION: Property Summary + Rent Roll */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          
          {/* RENT ROLL TABLE */}
          <div className="bg-[#141821] rounded-lg border border-slate-700 overflow-hidden">
            <div className="bg-emerald-600 text-white px-4 py-2 flex items-center justify-between">
              <span className="font-semibold text-sm uppercase tracking-wide">Rent Roll</span>
              <button onClick={addUnit} className="flex items-center gap-1 text-sm hover:bg-emerald-500 px-2 py-1 rounded">
                <Plus size={14} /> Add Unit
              </button>
            </div>
            <div className="overflow-x-auto max-h-[300px] overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-800 sticky top-0">
                  <tr>
                    <th className="px-3 py-2 text-left text-slate-400 font-medium">Unit</th>
                    <th className="px-3 py-2 text-center text-slate-400 font-medium">Bed</th>
                    <th className="px-3 py-2 text-center text-slate-400 font-medium">Bath</th>
                    <th className="px-3 py-2 text-right text-slate-400 font-medium">SF</th>
                    <th className="px-3 py-2 text-right text-slate-400 font-medium">Rent</th>
                    <th className="px-3 py-2 text-right text-slate-400 font-medium">$/SF</th>
                    <th className="px-3 py-2"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {inputs.units.map((u, i) => (
                    <tr key={u.id} className="hover:bg-slate-800/50">
                      <td className="px-3 py-1.5 text-slate-300">{i + 1}</td>
                      <td className="px-3 py-1.5">
                        <input type="number" value={u.bedrooms} onChange={e => updateUnit(u.id, 'bedrooms', +e.target.value)}
                          className="w-12 bg-transparent text-center border-b border-transparent hover:border-slate-600 focus:border-emerald-400 focus:outline-none" />
                      </td>
                      <td className="px-3 py-1.5">
                        <input type="number" value={u.bathrooms} onChange={e => updateUnit(u.id, 'bathrooms', +e.target.value)}
                          className="w-12 bg-transparent text-center border-b border-transparent hover:border-slate-600 focus:border-emerald-400 focus:outline-none" />
                      </td>
                      <td className="px-3 py-1.5">
                        <input type="number" value={u.sqft} onChange={e => updateUnit(u.id, 'sqft', +e.target.value)}
                          className="w-16 bg-transparent text-right border-b border-transparent hover:border-slate-600 focus:border-emerald-400 focus:outline-none" />
                      </td>
                      <td className="px-3 py-1.5">
                        <div className="flex items-center justify-end">
                          <span className="text-slate-500">$</span>
                          <input type="number" value={u.rent} onChange={e => updateUnit(u.id, 'rent', +e.target.value)}
                            className="w-20 bg-transparent text-right border-b border-transparent hover:border-slate-600 focus:border-emerald-400 focus:outline-none" />
                        </div>
                      </td>
                      <td className="px-3 py-1.5 text-right text-slate-400">${(u.rent / u.sqft).toFixed(2)}</td>
                      <td className="px-3 py-1.5">
                        {inputs.units.length > 1 && (
                          <button onClick={() => removeUnit(u.id)} className="text-slate-500 hover:text-red-400">
                            <Trash2 size={14} />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-slate-800 font-medium">
                  <tr>
                    <td className="px-3 py-2">Total</td>
                    <td className="px-3 py-2 text-center">{inputs.units.length}</td>
                    <td className="px-3 py-2"></td>
                    <td className="px-3 py-2 text-right">{fmt(calc.totalSqft)}</td>
                    <td className="px-3 py-2 text-right text-emerald-400">${fmt(calc.monthlyRent)}</td>
                    <td className="px-3 py-2 text-right text-slate-400">${(calc.monthlyRent / calc.totalSqft).toFixed(2)}</td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* SUMMARY METRICS */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {/* Purchase & Financing */}
              <div className="bg-[#141821] rounded-lg border border-slate-700 p-4 space-y-3">
                <div className="text-xs text-slate-400 uppercase tracking-wide font-semibold">Acquisition</div>
                <Field label="Purchase Price" value={inputs.purchasePrice} onChange={v => setNum('purchasePrice', v)} prefix="$" />
                <Field label="Capital Improvements" value={inputs.capitalImprovements} onChange={v => setNum('capitalImprovements', v)} prefix="$" />
                <Field label="Closing Costs" value={inputs.closingCostsPct} onChange={v => setNum('closingCostsPct', v)} suffix="%" />
                <div className="pt-2 border-t border-slate-700 text-sm">
                  <div className="flex justify-between"><span className="text-slate-400">Total Acquisition</span><span>{fmtMoney(calc.totalAcquisition)}</span></div>
                  <div className="flex justify-between"><span className="text-slate-400">Price/SF</span><span>{fmtMoney(calc.pricePerSqft, 2)}</span></div>
                </div>
              </div>
              
              {/* Financing */}
              <div className="bg-[#141821] rounded-lg border border-slate-700 p-4 space-y-3">
                <div className="text-xs text-slate-400 uppercase tracking-wide font-semibold">Financing</div>
                <Field label="Down Payment" value={inputs.downPaymentPct} onChange={v => setNum('downPaymentPct', v)} suffix="%" />
                <Field label="Interest Rate" value={inputs.interestRate} onChange={v => setNum('interestRate', v)} suffix="%" />
                <Field label="Loan Term" value={inputs.loanTerm} onChange={v => setNum('loanTerm', v)} suffix="yrs" />
                <div className="pt-2 border-t border-slate-700 text-sm">
                  <div className="flex justify-between"><span className="text-slate-400">Loan Amount</span><span>{fmtMoney(calc.loanAmount)}</span></div>
                  <div className="flex justify-between"><span className="text-slate-400">Annual Debt Service</span><span>{fmtMoney(calc.annualDebt)}</span></div>
                </div>
              </div>
            </div>

            {/* Key Returns */}
            <div className="grid grid-cols-4 gap-3">
              <KPI label="Monthly Rent" value={fmtMoney(calc.monthlyRent)} />
              <KPI label="Annual Income" value={fmtMoney(calc.gpi)} highlight />
              <KPI label="Cap Rate" value={fmtPct(calc.capRate)} highlight={calc.capRate > 5} />
              <KPI label="Cash-on-Cash" value={fmtPct(calc.coc)} highlight={calc.coc > 6} />
            </div>
          </div>
        </div>

        {/* OPERATING EXPENSES */}
        <div className="bg-[#141821] rounded-lg border border-slate-700">
          <div className="bg-amber-600 text-white px-4 py-2 font-semibold text-sm uppercase tracking-wide">Operating Expenses (Annual)</div>
          <div className="p-4 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            <Field label="Property Taxes" value={inputs.propertyTaxes} onChange={v => setNum('propertyTaxes', v)} prefix="$" />
            <Field label="Insurance" value={inputs.insurance} onChange={v => setNum('insurance', v)} prefix="$" />
            <Field label="Repairs & Maint" value={inputs.repairs} onChange={v => setNum('repairs', v)} prefix="$" />
            <Field label="Utilities" value={inputs.utilities} onChange={v => setNum('utilities', v)} prefix="$" />
            <Field label="Management" value={inputs.managementPct} onChange={v => setNum('managementPct', v)} suffix="% EGI" />
            <Field label="Trash" value={inputs.trash} onChange={v => setNum('trash', v)} prefix="$" />
            <Field label="Landscape" value={inputs.landscape} onChange={v => setNum('landscape', v)} prefix="$" />
            <Field label="Reserves" value={inputs.reserves} onChange={v => setNum('reserves', v)} prefix="$" />
            <Field label="Other Income/mo" value={inputs.otherIncome} onChange={v => setNum('otherIncome', v)} prefix="$" />
            <Field label="Vacancy" value={inputs.vacancyPct} onChange={v => setNum('vacancyPct', v)} suffix="%" />
          </div>
        </div>

        {/* ASSUMPTIONS */}
        <div className="bg-[#141821] rounded-lg border border-slate-700">
          <div className="bg-blue-600 text-white px-4 py-2 font-semibold text-sm uppercase tracking-wide">Growth & Exit Assumptions</div>
          <div className="p-4 grid grid-cols-2 md:grid-cols-4 gap-4">
            <Field label="Rent Growth" value={inputs.rentGrowth} onChange={v => setNum('rentGrowth', v)} suffix="%" />
            <Field label="Expense Growth" value={inputs.expenseGrowth} onChange={v => setNum('expenseGrowth', v)} suffix="%" />
            <Field label="Hold Period" value={inputs.holdYears} onChange={v => setNum('holdYears', v)} suffix="years" />
            <Field label="Exit Cap Rate" value={inputs.exitCapRate} onChange={v => setNum('exitCapRate', v)} suffix="%" />
          </div>
        </div>

        {/* PRO FORMA TABLE */}
        <div className="bg-[#141821] rounded-lg border border-slate-700 overflow-hidden">
          <div className="bg-emerald-600 text-white px-4 py-2 font-semibold text-sm uppercase tracking-wide">Pro Forma Projection</div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-800">
                  <th className="px-4 py-2 text-left text-slate-300 font-medium sticky left-0 bg-slate-800 min-w-[180px]"></th>
                  {calc.years.map(y => (
                    <th key={y.year} className="px-4 py-2 text-right text-slate-300 font-medium min-w-[100px]">{y.year}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                <Row label="Annual Rent" values={calc.years.map(y => y.rent)} />
                <Row label="Vacancy Factor" values={calc.years.map(y => -y.vacancy)} negative />
                <Row label="Effective Gross Revenue" values={calc.years.map(y => y.egi)} bold className="bg-emerald-900/20" />
                
                <tr className="h-2"></tr>
                <Row label="Real Estate Taxes" values={calc.years.map(y => -y.taxes)} negative />
                <Row label="Insurance" values={calc.years.map(y => -y.insurance)} negative />
                <Row label="Repairs & Maintenance" values={calc.years.map(y => -y.repairs)} negative />
                <Row label="Utilities" values={calc.years.map(y => -y.utilities)} negative />
                <Row label="Management" values={calc.years.map(y => -y.management)} negative />
                <Row label="Trash" values={calc.years.map(y => -y.trash)} negative />
                <Row label="Landscape" values={calc.years.map(y => -y.landscape)} negative />
                <Row label="Reserves" values={calc.years.map(y => -y.reserves)} negative />
                <Row label="Total Operating Expenses" values={calc.years.map(y => -y.opex)} bold negative className="bg-yellow-900/20" />
                
                <tr className="h-2"></tr>
                <Row label="NOI" values={calc.years.map(y => y.noi)} bold className="bg-emerald-900/30 text-emerald-400" />
                
                <tr className="h-2"></tr>
                <Row label="Lease Commissions" values={calc.years.map(y => -y.leasing)} negative />
                <Row label="Tenant Improvements" values={calc.years.map(y => -y.ti)} negative />
                <Row label="Capital Reserves" values={calc.years.map(y => -y.capReserves)} negative />
                <Row label="Total Leasing & Capital" values={calc.years.map(y => -y.totalCapex)} bold negative />
                
                <tr className="h-2"></tr>
                <Row label="Cash Flow Before Debt" values={calc.years.map(y => y.cfBeforeDebt)} bold />
                <Row label="Debt Service" values={calc.years.map(y => -y.debt)} negative />
                <Row label="Cash Flow After Debt" values={calc.years.map(y => y.cfAfterDebt)} bold className="bg-emerald-900/40 text-emerald-300" />
                
                <tr className="bg-slate-800">
                  <td className="px-4 py-2 font-medium sticky left-0 bg-slate-800">Cash-on-Cash Return</td>
                  {calc.years.map(y => (
                    <td key={y.year} className={`px-4 py-2 text-right font-mono font-bold ${y.coc >= 8 ? 'text-emerald-400' : y.coc >= 0 ? 'text-white' : 'text-red-400'}`}>
                      {fmtPct(y.coc)}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* FOOTER */}
        <div className="text-center text-slate-500 text-sm py-4">
          Free Real Estate Investment Analysis • Data auto-saved in your browser
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// COMPONENTS
// ============================================================================

function Field({ label, value, onChange, prefix, suffix }: {
  label: string
  value: number
  onChange: (v: string) => void
  prefix?: string
  suffix?: string
}) {
  return (
    <div>
      <label className="text-xs text-slate-400 block mb-1">{label}</label>
      <div className="flex items-center bg-slate-800 rounded border border-slate-600 focus-within:border-emerald-400">
        {prefix && <span className="pl-2 text-slate-500 text-sm">{prefix}</span>}
        <input
          type="number"
          value={value}
          onChange={e => onChange(e.target.value)}
          className="flex-1 bg-transparent px-2 py-1.5 text-sm focus:outline-none w-full"
        />
        {suffix && <span className="pr-2 text-slate-500 text-xs">{suffix}</span>}
      </div>
    </div>
  )
}

function KPI({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`bg-slate-800 rounded-lg p-3 text-center ${highlight ? 'ring-1 ring-emerald-500/50' : ''}`}>
      <div className="text-xs text-slate-400 mb-1">{label}</div>
      <div className={`text-lg font-bold font-mono ${highlight ? 'text-emerald-400' : ''}`}>{value}</div>
    </div>
  )
}

function Row({ label, values, bold, negative, className = '' }: {
  label: string
  values: number[]
  bold?: boolean
  negative?: boolean
  className?: string
}) {
  return (
    <tr className={className}>
      <td className={`px-4 py-1.5 sticky left-0 bg-[#141821] ${bold ? 'font-semibold' : 'text-slate-400'} ${className}`}>{label}</td>
      {values.map((v, i) => (
        <td key={i} className={`px-4 py-1.5 text-right font-mono ${
          negative && v < 0 ? 'text-red-400/70' : bold ? 'font-semibold' : ''
        }`}>
          {fmtMoney(v)}
        </td>
      ))}
    </tr>
  )
}
