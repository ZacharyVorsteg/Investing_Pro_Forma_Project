import React, { useMemo } from 'react'
import { BarChart3, Download } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent, Button } from '../ui'
import { useProjectStore } from '../../store/projectStore'

export const ProFormaSection: React.FC = () => {
  const { currentProject } = useProjectStore()
  
  if (!currentProject) return null

  const analysis = currentProject.analysis
  const acquisition = currentProject.acquisition
  const financing = currentProject.financing
  const income = currentProject.income
  const expenses = currentProject.expenses
  const capital = currentProject.capital
  const growth = currentProject.growth
  const exit = currentProject.exit
  const property = currentProject.property

  const holdPeriod = analysis?.hold_period_years || 5

  // Generate pro forma projections
  const proforma = useMemo(() => {
    const years = Array.from({ length: holdPeriod + 1 }, (_, i) => i)
    
    // Base values
    const baseRent = income?.tenants?.reduce((sum, t) => sum + ((t.base_rent_monthly || 0) * 12), 0) || 
                     income?.summary?.gross_potential_rent || 0
    const otherIncome = income?.other_income?.reduce((sum, i) => sum + (i.amount_annual || 0), 0) ||
                        income?.summary?.total_other_income || 0
    const vacancyRate = (income?.vacancy?.vacancy_rate_single || 5) / 100
    const rentGrowth = (growth?.rent_growth_rate || 3) / 100
    const expenseGrowth = (growth?.expense_growth_rate || 3) / 100
    
    // Base expenses
    let baseExpenses = 0
    baseExpenses += expenses?.real_estate_taxes?.amount || 0
    baseExpenses += expenses?.insurance?.amount || 0
    baseExpenses += (expenses?.utilities?.electric?.amount || 0) +
                    (expenses?.utilities?.gas?.amount || 0) +
                    (expenses?.utilities?.water_sewer?.amount || 0) +
                    (expenses?.utilities?.trash?.amount || 0)
    baseExpenses += expenses?.repairs_maintenance?.amount || 0
    baseExpenses += expenses?.administrative?.amount || 0
    baseExpenses += expenses?.marketing_leasing?.amount || 0

    // Capital reserves
    const rentableSF = property?.sizing?.rentable_sf || 0
    const reservePerSF = capital?.reserve_per_sf || 0.25
    const baseReserve = rentableSF * reservePerSF

    // Debt
    const totalDebt = financing?.debt_tranches?.reduce((sum, t) => sum + (t.loan_amount || 0), 0) || 0
    const avgRate = financing?.debt_tranches?.[0]?.interest_rate_annual || 6.5
    const annualDebtService = totalDebt * (avgRate / 100) // IO assumption

    // Purchase price and equity
    const purchasePrice = acquisition?.purchase_price || 0
    const totalEquity = purchasePrice - totalDebt

    // Exit
    const exitCapRate = (exit?.exit_cap_rate || 6.5) / 100
    const dispositionCostsPct = ((exit?.selling_costs?.broker_commission_pct || 2) + 
                                  (exit?.selling_costs?.transfer_taxes_pct || 0.5)) / 100

    // Build projections
    const rows: { [key: string]: number[] } = {
      gpr: [],
      otherIncome: [],
      vacancy: [],
      egi: [],
      opex: [],
      noi: [],
      reserves: [],
      cfBeforeDebt: [],
      debtService: [],
      cfAfterDebt: [],
    }

    let finalNOI = 0
    for (let year = 0; year <= holdPeriod; year++) {
      if (year === 0) {
        // Year 0 - Acquisition
        Object.keys(rows).forEach(key => rows[key].push(0))
        continue
      }

      const gpr = baseRent * Math.pow(1 + rentGrowth, year - 1)
      const other = otherIncome * Math.pow(1 + rentGrowth, year - 1)
      const vacancy = gpr * vacancyRate
      const egi = gpr + other - vacancy
      const opex = baseExpenses * Math.pow(1 + expenseGrowth, year - 1)
      const noi = egi - opex
      const reserves = baseReserve * Math.pow(1 + expenseGrowth, year - 1)
      const cfBeforeDebt = noi - reserves
      const debtService = annualDebtService
      const cfAfterDebt = cfBeforeDebt - debtService

      rows.gpr.push(gpr)
      rows.otherIncome.push(other)
      rows.vacancy.push(-vacancy)
      rows.egi.push(egi)
      rows.opex.push(-opex)
      rows.noi.push(noi)
      rows.reserves.push(-reserves)
      rows.cfBeforeDebt.push(cfBeforeDebt)
      rows.debtService.push(-debtService)
      rows.cfAfterDebt.push(cfAfterDebt)

      if (year === holdPeriod) {
        finalNOI = noi
      }
    }

    // Exit calculations
    const exitValue = finalNOI / exitCapRate
    const dispositionCosts = exitValue * dispositionCostsPct
    const netSaleProceeds = exitValue - dispositionCosts - totalDebt

    // Calculate returns
    const cashFlows = [-totalEquity]
    for (let year = 1; year <= holdPeriod; year++) {
      let cf = rows.cfAfterDebt[year] || 0
      if (year === holdPeriod) {
        cf += netSaleProceeds
      }
      cashFlows.push(cf)
    }

    // IRR calculation (simplified Newton-Raphson)
    const calculateIRR = (cashFlows: number[]): number => {
      let rate = 0.1
      for (let i = 0; i < 100; i++) {
        let npv = 0
        let dnpv = 0
        for (let t = 0; t < cashFlows.length; t++) {
          npv += cashFlows[t] / Math.pow(1 + rate, t)
          dnpv -= t * cashFlows[t] / Math.pow(1 + rate, t + 1)
        }
        if (Math.abs(npv) < 0.01) break
        rate = rate - npv / dnpv
        if (rate < -0.99 || rate > 10) return 0
      }
      return rate * 100
    }

    const totalDistributions = cashFlows.reduce((sum, cf, i) => i > 0 ? sum + cf : sum, 0)
    const equityMultiple = totalEquity > 0 ? totalDistributions / totalEquity : 0
    const irr = calculateIRR(cashFlows)
    const avgCashOnCash = holdPeriod > 0 && totalEquity > 0
      ? (rows.cfAfterDebt.slice(1).reduce((sum, cf) => sum + cf, 0) / holdPeriod) / totalEquity * 100
      : 0

    return {
      years,
      rows,
      metrics: {
        purchasePrice,
        totalEquity,
        totalDebt,
        exitValue,
        netSaleProceeds,
        irr,
        equityMultiple,
        avgCashOnCash,
        goingInCap: purchasePrice > 0 ? (rows.noi[1] / purchasePrice) * 100 : 0,
        exitCap: (exit?.exit_cap_rate || 6.5),
      }
    }
  }, [analysis, acquisition, financing, income, expenses, capital, growth, exit, property, holdPeriod])

  const formatCurrency = (value: number) => {
    if (Math.abs(value) >= 1000000) {
      return `$${(value / 1000000).toFixed(2)}M`
    }
    return `$${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`
  }

  return (
    <div className="space-y-6">
      {/* Returns Summary */}
      <Card variant="elevated" className="bg-gradient-to-r from-emerald-500/10 to-blue-500/10 border-emerald-500/30">
        <CardHeader>
          <CardTitle subtitle="Key investment metrics">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-emerald-400" />
              Returns Summary
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center p-4 rounded-xl bg-slate-800/50">
              <p className="text-sm text-slate-400 mb-1">Levered IRR</p>
              <p className="text-3xl font-bold text-emerald-400">
                {proforma.metrics.irr.toFixed(1)}%
              </p>
            </div>
            <div className="text-center p-4 rounded-xl bg-slate-800/50">
              <p className="text-sm text-slate-400 mb-1">Equity Multiple</p>
              <p className="text-3xl font-bold text-white">
                {proforma.metrics.equityMultiple.toFixed(2)}x
              </p>
            </div>
            <div className="text-center p-4 rounded-xl bg-slate-800/50">
              <p className="text-sm text-slate-400 mb-1">Avg Cash-on-Cash</p>
              <p className="text-3xl font-bold text-white">
                {proforma.metrics.avgCashOnCash.toFixed(1)}%
              </p>
            </div>
            <div className="text-center p-4 rounded-xl bg-slate-800/50">
              <p className="text-sm text-slate-400 mb-1">Going-In Cap</p>
              <p className="text-3xl font-bold text-white">
                {proforma.metrics.goingInCap.toFixed(2)}%
              </p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-slate-400">Total Equity</p>
              <p className="text-lg font-semibold text-white">
                {formatCurrency(proforma.metrics.totalEquity)}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-400">Total Debt</p>
              <p className="text-lg font-semibold text-white">
                {formatCurrency(proforma.metrics.totalDebt)}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-400">Exit Value</p>
              <p className="text-lg font-semibold text-white">
                {formatCurrency(proforma.metrics.exitValue)}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-400">Net Proceeds</p>
              <p className="text-lg font-semibold text-white">
                {formatCurrency(proforma.metrics.netSaleProceeds)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pro Forma Table */}
      <Card variant="elevated" padding="none">
        <CardHeader className="p-6">
          <CardTitle subtitle="Year-by-year cash flow projections">
            Pro Forma Cash Flows
          </CardTitle>
          <Button variant="secondary" size="sm" leftIcon={<Download className="w-4 h-4" />}>
            Export
          </Button>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-800">
                <th className="text-left px-6 py-3 font-medium text-slate-300 sticky left-0 bg-slate-800">
                  Line Item
                </th>
                {proforma.years.slice(1).map((year) => (
                  <th key={year} className="text-right px-4 py-3 font-medium text-slate-300 min-w-[100px]">
                    Year {year}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              <tr className="hover:bg-slate-800/30">
                <td className="px-6 py-3 text-slate-300 sticky left-0 bg-slate-900/95">Gross Potential Rent</td>
                {proforma.rows.gpr.slice(1).map((val, i) => (
                  <td key={i} className="text-right px-4 py-3 text-white font-mono">
                    {formatCurrency(val)}
                  </td>
                ))}
              </tr>
              <tr className="hover:bg-slate-800/30">
                <td className="px-6 py-3 text-slate-300 sticky left-0 bg-slate-900/95">Other Income</td>
                {proforma.rows.otherIncome.slice(1).map((val, i) => (
                  <td key={i} className="text-right px-4 py-3 text-white font-mono">
                    {formatCurrency(val)}
                  </td>
                ))}
              </tr>
              <tr className="hover:bg-slate-800/30">
                <td className="px-6 py-3 text-slate-300 sticky left-0 bg-slate-900/95">Less: Vacancy</td>
                {proforma.rows.vacancy.slice(1).map((val, i) => (
                  <td key={i} className="text-right px-4 py-3 text-red-400 font-mono">
                    {formatCurrency(val)}
                  </td>
                ))}
              </tr>
              <tr className="bg-slate-800/50 font-semibold">
                <td className="px-6 py-3 text-white sticky left-0 bg-slate-800/95">Effective Gross Income</td>
                {proforma.rows.egi.slice(1).map((val, i) => (
                  <td key={i} className="text-right px-4 py-3 text-white font-mono">
                    {formatCurrency(val)}
                  </td>
                ))}
              </tr>
              <tr className="hover:bg-slate-800/30">
                <td className="px-6 py-3 text-slate-300 sticky left-0 bg-slate-900/95">Less: Operating Expenses</td>
                {proforma.rows.opex.slice(1).map((val, i) => (
                  <td key={i} className="text-right px-4 py-3 text-red-400 font-mono">
                    {formatCurrency(val)}
                  </td>
                ))}
              </tr>
              <tr className="bg-emerald-500/10 font-bold">
                <td className="px-6 py-3 text-emerald-400 sticky left-0 bg-emerald-500/10">Net Operating Income</td>
                {proforma.rows.noi.slice(1).map((val, i) => (
                  <td key={i} className="text-right px-4 py-3 text-emerald-400 font-mono">
                    {formatCurrency(val)}
                  </td>
                ))}
              </tr>
              <tr className="hover:bg-slate-800/30">
                <td className="px-6 py-3 text-slate-300 sticky left-0 bg-slate-900/95">Less: Capital Reserves</td>
                {proforma.rows.reserves.slice(1).map((val, i) => (
                  <td key={i} className="text-right px-4 py-3 text-red-400 font-mono">
                    {formatCurrency(val)}
                  </td>
                ))}
              </tr>
              <tr className="hover:bg-slate-800/30">
                <td className="px-6 py-3 text-slate-300 sticky left-0 bg-slate-900/95">Less: Debt Service</td>
                {proforma.rows.debtService.slice(1).map((val, i) => (
                  <td key={i} className="text-right px-4 py-3 text-red-400 font-mono">
                    {formatCurrency(val)}
                  </td>
                ))}
              </tr>
              <tr className="bg-blue-500/10 font-bold">
                <td className="px-6 py-3 text-blue-400 sticky left-0 bg-blue-500/10">Cash Flow After Debt</td>
                {proforma.rows.cfAfterDebt.slice(1).map((val, i) => (
                  <td key={i} className="text-right px-4 py-3 font-mono">
                    <span className={val >= 0 ? 'text-emerald-400' : 'text-red-400'}>
                      {formatCurrency(val)}
                    </span>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </Card>

      {/* Metrics by Year */}
      <Card variant="elevated">
        <CardHeader>
          <CardTitle subtitle="Key ratios by year">
            Performance Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left py-3 font-medium text-slate-400">Metric</th>
                  {proforma.years.slice(1).map((year) => (
                    <th key={year} className="text-right py-3 font-medium text-slate-400 min-w-[80px]">
                      Year {year}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                <tr>
                  <td className="py-3 text-slate-300">Cash-on-Cash Return</td>
                  {proforma.rows.cfAfterDebt.slice(1).map((cf, i) => (
                    <td key={i} className="text-right py-3 text-white">
                      {proforma.metrics.totalEquity > 0 
                        ? ((cf / proforma.metrics.totalEquity) * 100).toFixed(1) 
                        : 0}%
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-3 text-slate-300">NOI Yield on Cost</td>
                  {proforma.rows.noi.slice(1).map((noi, i) => (
                    <td key={i} className="text-right py-3 text-white">
                      {proforma.metrics.purchasePrice > 0 
                        ? ((noi / proforma.metrics.purchasePrice) * 100).toFixed(2) 
                        : 0}%
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

