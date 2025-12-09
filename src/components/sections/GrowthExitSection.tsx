import React from 'react'
import { TrendingUp, LogOut, HelpCircle } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent, Input, Select } from '../ui'
import { useProjectStore } from '../../store/projectStore'

interface GrowthExitSectionProps {
  onChange: () => void
}

export const GrowthExitSection: React.FC<GrowthExitSectionProps> = ({ onChange }) => {
  const { currentProject, updateGrowth, updateExit } = useProjectStore()
  
  if (!currentProject) return null

  const growth = currentProject.growth
  const exit = currentProject.exit
  const analysis = currentProject.analysis
  const acquisition = currentProject.acquisition

  // Calculate estimated exit value
  const calculateExitValue = () => {
    if (exit?.valuation_method === 'Custom Value' && exit?.custom_exit_value) {
      return exit.custom_exit_value
    }
    // For now, just use a placeholder based on purchase price
    // In a real app, this would use projected Year N NOI
    const purchasePrice = acquisition?.purchase_price || 0
    const growthRate = growth?.rent_growth_rate || 0
    const holdPeriod = analysis?.hold_period_years || 5
    
    // Simple appreciation model
    return purchasePrice * Math.pow(1 + (growthRate / 100), holdPeriod)
  }

  const estimatedExitValue = calculateExitValue()

  return (
    <div className="space-y-6">
      {/* Growth Assumptions */}
      <Card variant="elevated">
        <CardHeader>
          <CardTitle subtitle="Project how income and expenses will grow">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
              Growth Assumptions
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Income Growth */}
            <div>
              <h4 className="text-sm font-medium text-slate-300 mb-4">Income Growth</h4>
              <div className="space-y-4">
                <Select
                  label="Rent Growth Method"
                  options={[
                    { value: 'Fixed annual percentage', label: 'Fixed Annual Percentage' },
                    { value: 'Year-by-year custom', label: 'Year-by-Year Custom' },
                    { value: 'Tied to CPI', label: 'Tied to CPI' },
                    { value: 'Market rent resets at rollover', label: 'Market Rent Resets' },
                    { value: 'Contractual', label: 'Contractual (from Rent Roll)' },
                  ]}
                  value={growth?.rent_growth_method || 'Fixed annual percentage'}
                  onChange={(e) => {
                    onChange()
                    updateGrowth({ rent_growth_method: e.target.value as never })
                  }}
                />
                
                {growth?.rent_growth_method === 'Fixed annual percentage' && (
                  <Input
                    label="Annual Rent Growth"
                    type="number"
                    rightAddon="%"
                    placeholder="3.0"
                    value={growth?.rent_growth_rate || ''}
                    onChange={(e) => {
                      onChange()
                      updateGrowth({ rent_growth_rate: e.target.value ? Number(e.target.value) : null })
                    }}
                    helperText="What rent growth do you expect based on market conditions?"
                  />
                )}

                <Input
                  label="Other Income Growth"
                  type="number"
                  rightAddon="%"
                  placeholder="2.0"
                  value={growth?.other_income_growth_rate || ''}
                  onChange={(e) => {
                    onChange()
                    updateGrowth({ other_income_growth_rate: e.target.value ? Number(e.target.value) : null })
                  }}
                />
              </div>
            </div>

            {/* Expense Growth */}
            <div>
              <h4 className="text-sm font-medium text-slate-300 mb-4">Expense Growth</h4>
              <div className="space-y-4">
                <Input
                  label="Annual Expense Growth"
                  type="number"
                  rightAddon="%"
                  placeholder="3.0"
                  value={growth?.expense_growth_rate || ''}
                  onChange={(e) => {
                    onChange()
                    updateGrowth({ expense_growth_rate: e.target.value ? Number(e.target.value) : null })
                  }}
                  helperText="Average annual increase in operating expenses"
                />

                <Input
                  label="Inflation Assumption"
                  type="number"
                  rightAddon="%"
                  placeholder="2.5"
                  value={growth?.inflation_assumption || ''}
                  onChange={(e) => {
                    onChange()
                    updateGrowth({ inflation_assumption: e.target.value ? Number(e.target.value) : null })
                  }}
                  helperText="Reference rate for CPI-linked items"
                />
              </div>
            </div>
          </div>

          {/* Market Rent */}
          <div className="mt-6 pt-6 border-t border-slate-700">
            <h4 className="text-sm font-medium text-slate-300 mb-4">Market Rent Assumptions</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Current Market Rent"
                type="number"
                leftAddon="$"
                rightAddon="/SF"
                placeholder="25.00"
                value={growth?.market_rent_current_psf || ''}
                onChange={(e) => {
                  onChange()
                  updateGrowth({ market_rent_current_psf: e.target.value ? Number(e.target.value) : null })
                }}
                helperText="For mark-to-market analysis at lease rollover"
              />
              <Input
                label="Market Rent Growth"
                type="number"
                rightAddon="%"
                placeholder="3.0"
                value={growth?.market_rent_growth || ''}
                onChange={(e) => {
                  onChange()
                  updateGrowth({ market_rent_growth: e.target.value ? Number(e.target.value) : null })
                }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Exit Assumptions */}
      <Card variant="elevated">
        <CardHeader>
          <CardTitle subtitle="Model your disposition scenario">
            <div className="flex items-center gap-2">
              <LogOut className="w-5 h-5 text-emerald-400" />
              Exit / Disposition
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <Input
              label="Exit Year"
              type="number"
              placeholder={String(analysis?.hold_period_years || 5)}
              value={exit?.exit_year || analysis?.hold_period_years || ''}
              onChange={(e) => {
                onChange()
                updateExit({ exit_year: e.target.value ? Number(e.target.value) : null })
              }}
            />
            <Select
              label="Valuation Method"
              options={[
                { value: 'Cap Rate on Forward NOI', label: 'Cap Rate on Forward NOI' },
                { value: 'Cap Rate on Trailing NOI', label: 'Cap Rate on Trailing NOI' },
                { value: 'Price per SF', label: 'Price per SF' },
                { value: 'Price per Unit', label: 'Price per Unit' },
                { value: 'Gross Rent Multiplier', label: 'Gross Rent Multiplier' },
                { value: 'Custom Value', label: 'Custom Value' },
              ]}
              value={exit?.valuation_method || 'Cap Rate on Forward NOI'}
              onChange={(e) => {
                onChange()
                updateExit({ valuation_method: e.target.value as never })
              }}
            />
          </div>

          {/* Exit Cap Rate - Critical Field */}
          {(exit?.valuation_method?.includes('Cap Rate') || !exit?.valuation_method) && (
            <div className="mb-6">
              <Input
                label="Exit Cap Rate"
                type="number"
                rightAddon="%"
                placeholder="6.50"
                value={exit?.exit_cap_rate || ''}
                onChange={(e) => {
                  onChange()
                  updateExit({ 
                    exit_cap_rate: e.target.value ? Number(e.target.value) : null,
                    exit_cap_rate_state: e.target.value ? 'known' : 'incomplete'
                  })
                }}
                state={exit?.exit_cap_rate_state}
                showStateSelector
                onStateChange={(state) => {
                  onChange()
                  updateExit({ exit_cap_rate_state: state })
                }}
                helperText="Exit cap rate is critical to your returns. Consider: property will be older, remaining lease term at sale, market trends. Conservative practice: Exit cap 0.25-0.50% higher than entry."
              />
            </div>
          )}

          {/* Other valuation methods */}
          {exit?.valuation_method === 'Price per SF' && (
            <Input
              label="Exit Price per SF"
              type="number"
              leftAddon="$"
              placeholder="0"
              value={exit?.exit_price_per_sf || ''}
              onChange={(e) => {
                onChange()
                updateExit({ exit_price_per_sf: e.target.value ? Number(e.target.value) : null })
              }}
            />
          )}

          {exit?.valuation_method === 'Custom Value' && (
            <Input
              label="Custom Exit Value"
              type="number"
              leftAddon="$"
              placeholder="0"
              value={exit?.custom_exit_value || ''}
              onChange={(e) => {
                onChange()
                updateExit({ custom_exit_value: e.target.value ? Number(e.target.value) : null })
              }}
            />
          )}

          {/* Disposition Costs */}
          <div className="mt-6 pt-6 border-t border-slate-700">
            <h4 className="text-sm font-medium text-slate-300 mb-4">Disposition Costs</h4>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Input
                label="Broker Commission"
                type="number"
                rightAddon="%"
                placeholder="2.0"
                value={exit?.selling_costs?.broker_commission_pct || ''}
                onChange={(e) => {
                  onChange()
                  updateExit({
                    selling_costs: {
                      ...exit?.selling_costs,
                      broker_commission_pct: e.target.value ? Number(e.target.value) : null
                    }
                  })
                }}
              />
              <Input
                label="Transfer Taxes"
                type="number"
                rightAddon="%"
                placeholder="0.5"
                value={exit?.selling_costs?.transfer_taxes_pct || ''}
                onChange={(e) => {
                  onChange()
                  updateExit({
                    selling_costs: {
                      ...exit?.selling_costs,
                      transfer_taxes_pct: e.target.value ? Number(e.target.value) : null
                    }
                  })
                }}
              />
              <Input
                label="Legal Fees"
                type="number"
                leftAddon="$"
                placeholder="0"
                value={exit?.selling_costs?.legal_fees || ''}
                onChange={(e) => {
                  onChange()
                  updateExit({
                    selling_costs: {
                      ...exit?.selling_costs,
                      legal_fees: e.target.value ? Number(e.target.value) : null
                    }
                  })
                }}
              />
              <Input
                label="Other Costs"
                type="number"
                leftAddon="$"
                placeholder="0"
                value={exit?.selling_costs?.other_costs || ''}
                onChange={(e) => {
                  onChange()
                  updateExit({
                    selling_costs: {
                      ...exit?.selling_costs,
                      other_costs: e.target.value ? Number(e.target.value) : null
                    }
                  })
                }}
              />
            </div>
          </div>

          {/* Cap Rate Warning */}
          <div className="mt-6 p-4 rounded-lg bg-amber-500/10 border border-amber-500/30">
            <div className="flex items-start gap-3">
              <HelpCircle className="w-5 h-5 text-amber-400 mt-0.5" />
              <div>
                <p className="text-sm text-amber-300 font-medium">Exit Cap Rate Considerations</p>
                <p className="text-xs text-amber-400/80 mt-1">
                  At exit, your property will be {analysis?.hold_period_years || 5} years older. 
                  Consider how this affects value. Many investors model exit cap 25-50 bps higher 
                  than entry to be conservative.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Exit Summary */}
      <Card variant="elevated" className="bg-gradient-to-r from-emerald-500/10 to-blue-500/10 border-emerald-500/30">
        <CardContent>
          <h3 className="text-lg font-semibold text-white mb-4">Exit Scenario Summary</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <p className="text-sm text-slate-400">Exit Year</p>
              <p className="text-2xl font-bold text-white">
                Year {exit?.exit_year || analysis?.hold_period_years || 5}
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-400">Exit Cap Rate</p>
              <p className="text-2xl font-bold text-white">
                {exit?.exit_cap_rate ? `${exit.exit_cap_rate}%` : '—'}
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-400">Est. Sale Price</p>
              <p className="text-2xl font-bold text-white">
                ${estimatedExitValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </p>
              <p className="text-xs text-slate-500">Rough estimate</p>
            </div>
            <div>
              <p className="text-sm text-slate-400">Disposition Costs</p>
              <p className="text-2xl font-bold text-white">
                {((exit?.selling_costs?.broker_commission_pct || 0) + 
                  (exit?.selling_costs?.transfer_taxes_pct || 0)).toFixed(1)}%
              </p>
              <p className="text-xs text-slate-500">+ fixed costs</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

