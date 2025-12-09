import React, { useState } from 'react'
import { Calculator, TrendingUp, Percent, DollarSign } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent, Input, Tabs, TabsList, TabTrigger, TabContent } from '../components/ui'

export const CalculatorsPage: React.FC = () => {
  // Cap Rate Calculator
  const [noi, setNoi] = useState<number | null>(null)
  const [value, setValue] = useState<number | null>(null)
  const capRate = noi && value ? ((noi / value) * 100) : null

  // DSCR Calculator
  const [noiDscr, setNoiDscr] = useState<number | null>(null)
  const [debtService, setDebtService] = useState<number | null>(null)
  const dscr = noiDscr && debtService ? (noiDscr / debtService) : null

  // Debt Sizing Calculator
  const [targetDscr, setTargetDscr] = useState<number>(1.25)
  const [noiFds, setNoiFds] = useState<number | null>(null)
  const [interestRate, setInterestRate] = useState<number>(6.5)
  const [amortYears, setAmortYears] = useState<number>(30)
  
  const calculateMaxLoan = () => {
    if (!noiFds) return null
    const maxDebtService = noiFds / targetDscr
    const monthlyRate = interestRate / 100 / 12
    const numPayments = amortYears * 12
    const maxLoan = maxDebtService / 12 * (1 - Math.pow(1 + monthlyRate, -numPayments)) / monthlyRate
    return maxLoan
  }
  const maxLoan = calculateMaxLoan()

  // LTV Calculator
  const [loanAmount, setLoanAmount] = useState<number | null>(null)
  const [propertyValue, setPropertyValue] = useState<number | null>(null)
  const ltv = loanAmount && propertyValue ? ((loanAmount / propertyValue) * 100) : null

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Investment Calculators</h1>
        <p className="text-slate-400">Quick calculations for real estate analysis</p>
      </div>

      <Tabs defaultTab="caprate">
        <Card variant="elevated" padding="sm" className="mb-6">
          <TabsList>
            <TabTrigger value="caprate" icon={<Percent className="w-4 h-4" />}>
              Cap Rate
            </TabTrigger>
            <TabTrigger value="dscr" icon={<TrendingUp className="w-4 h-4" />}>
              DSCR
            </TabTrigger>
            <TabTrigger value="debt" icon={<DollarSign className="w-4 h-4" />}>
              Debt Sizing
            </TabTrigger>
            <TabTrigger value="ltv" icon={<Calculator className="w-4 h-4" />}>
              LTV
            </TabTrigger>
          </TabsList>
        </Card>

        {/* Cap Rate Calculator */}
        <TabContent value="caprate">
          <Card variant="elevated">
            <CardHeader>
              <CardTitle subtitle="Cap Rate = NOI ÷ Property Value">
                Capitalization Rate Calculator
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Net Operating Income (NOI)"
                  type="number"
                  leftAddon="$"
                  placeholder="500000"
                  value={noi || ''}
                  onChange={(e) => setNoi(e.target.value ? Number(e.target.value) : null)}
                  helperText="Annual NOI"
                />
                <Input
                  label="Property Value"
                  type="number"
                  leftAddon="$"
                  placeholder="10000000"
                  value={value || ''}
                  onChange={(e) => setValue(e.target.value ? Number(e.target.value) : null)}
                  helperText="Purchase price or current value"
                />
              </div>

              {capRate && (
                <div className="mt-6 p-6 rounded-xl bg-gradient-to-r from-emerald-500/20 to-blue-500/20 border border-emerald-500/30 text-center">
                  <p className="text-sm text-slate-400 mb-1">Cap Rate</p>
                  <p className="text-4xl font-bold text-emerald-400">{capRate.toFixed(2)}%</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabContent>

        {/* DSCR Calculator */}
        <TabContent value="dscr">
          <Card variant="elevated">
            <CardHeader>
              <CardTitle subtitle="DSCR = NOI ÷ Annual Debt Service">
                Debt Service Coverage Ratio
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Net Operating Income (NOI)"
                  type="number"
                  leftAddon="$"
                  placeholder="500000"
                  value={noiDscr || ''}
                  onChange={(e) => setNoiDscr(e.target.value ? Number(e.target.value) : null)}
                  helperText="Annual NOI"
                />
                <Input
                  label="Annual Debt Service"
                  type="number"
                  leftAddon="$"
                  placeholder="350000"
                  value={debtService || ''}
                  onChange={(e) => setDebtService(e.target.value ? Number(e.target.value) : null)}
                  helperText="Total annual loan payments (P+I)"
                />
              </div>

              {dscr && (
                <div className="mt-6 p-6 rounded-xl bg-gradient-to-r from-emerald-500/20 to-blue-500/20 border border-emerald-500/30 text-center">
                  <p className="text-sm text-slate-400 mb-1">DSCR</p>
                  <p className={`text-4xl font-bold ${dscr >= 1.25 ? 'text-emerald-400' : dscr >= 1.0 ? 'text-amber-400' : 'text-red-400'}`}>
                    {dscr.toFixed(2)}x
                  </p>
                  <p className="text-sm text-slate-400 mt-2">
                    {dscr >= 1.25 ? 'Strong coverage' : dscr >= 1.0 ? 'Adequate coverage' : 'Below breakeven'}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabContent>

        {/* Debt Sizing Calculator */}
        <TabContent value="debt">
          <Card variant="elevated">
            <CardHeader>
              <CardTitle subtitle="Calculate maximum loan amount based on DSCR">
                Debt Sizing Calculator
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Net Operating Income (NOI)"
                  type="number"
                  leftAddon="$"
                  placeholder="500000"
                  value={noiFds || ''}
                  onChange={(e) => setNoiFds(e.target.value ? Number(e.target.value) : null)}
                />
                <Input
                  label="Target DSCR"
                  type="number"
                  placeholder="1.25"
                  value={targetDscr}
                  onChange={(e) => setTargetDscr(e.target.value ? Number(e.target.value) : 1.25)}
                />
                <Input
                  label="Interest Rate"
                  type="number"
                  rightAddon="%"
                  placeholder="6.5"
                  value={interestRate}
                  onChange={(e) => setInterestRate(e.target.value ? Number(e.target.value) : 6.5)}
                />
                <Input
                  label="Amortization Period"
                  type="number"
                  rightAddon="years"
                  placeholder="30"
                  value={amortYears}
                  onChange={(e) => setAmortYears(e.target.value ? Number(e.target.value) : 30)}
                />
              </div>

              {maxLoan && (
                <div className="mt-6 p-6 rounded-xl bg-gradient-to-r from-emerald-500/20 to-blue-500/20 border border-emerald-500/30 text-center">
                  <p className="text-sm text-slate-400 mb-1">Maximum Loan Amount</p>
                  <p className="text-4xl font-bold text-emerald-400">
                    ${maxLoan.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabContent>

        {/* LTV Calculator */}
        <TabContent value="ltv">
          <Card variant="elevated">
            <CardHeader>
              <CardTitle subtitle="LTV = Loan Amount ÷ Property Value">
                Loan-to-Value Calculator
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Loan Amount"
                  type="number"
                  leftAddon="$"
                  placeholder="7000000"
                  value={loanAmount || ''}
                  onChange={(e) => setLoanAmount(e.target.value ? Number(e.target.value) : null)}
                />
                <Input
                  label="Property Value"
                  type="number"
                  leftAddon="$"
                  placeholder="10000000"
                  value={propertyValue || ''}
                  onChange={(e) => setPropertyValue(e.target.value ? Number(e.target.value) : null)}
                />
              </div>

              {ltv && (
                <div className="mt-6 p-6 rounded-xl bg-gradient-to-r from-emerald-500/20 to-blue-500/20 border border-emerald-500/30 text-center">
                  <p className="text-sm text-slate-400 mb-1">LTV Ratio</p>
                  <p className={`text-4xl font-bold ${ltv <= 65 ? 'text-emerald-400' : ltv <= 75 ? 'text-amber-400' : 'text-red-400'}`}>
                    {ltv.toFixed(1)}%
                  </p>
                  <p className="text-sm text-slate-400 mt-2">
                    {ltv <= 65 ? 'Conservative leverage' : ltv <= 75 ? 'Moderate leverage' : 'High leverage'}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabContent>
      </Tabs>
    </div>
  )
}

