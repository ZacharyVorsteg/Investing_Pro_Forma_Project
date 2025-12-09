import React from 'react'
import { CreditCard, Plus, Trash2 } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent, Input, Select, Button } from '../ui'
import { useProjectStore } from '../../store/projectStore'
import { v4 as uuidv4 } from 'uuid'
import type { DebtTranche, CapitalStructureType } from '../../types'

const capitalStructureTypes: { value: CapitalStructureType; label: string }[] = [
  { value: 'All Cash', label: 'All Cash' },
  { value: 'Single Senior Loan', label: 'Single Senior Loan' },
  { value: 'Senior + Mezzanine', label: 'Senior + Mezzanine' },
  { value: 'Senior + Preferred Equity', label: 'Senior + Preferred Equity' },
  { value: 'Construction Loan', label: 'Construction Loan' },
  { value: 'Bridge Loan', label: 'Bridge Loan' },
  { value: 'Seller Financing', label: 'Seller Financing' },
  { value: 'Assumable Debt', label: 'Assumable Debt' },
  { value: 'Multiple Loans', label: 'Multiple Loans' },
]

interface FinancingSectionProps {
  onChange: () => void
}

export const FinancingSection: React.FC<FinancingSectionProps> = ({ onChange }) => {
  const { currentProject, updateFinancing } = useProjectStore()
  
  if (!currentProject) return null

  const financing = currentProject.financing
  const acquisition = currentProject.acquisition
  const purchasePrice = acquisition?.purchase_price || 0

  // Calculate totals
  const totalDebt = financing?.debt_tranches?.reduce((sum, t) => sum + (t.loan_amount || 0), 0) || 0
  const totalEquity = purchasePrice - totalDebt

  const addDebtTranche = () => {
    onChange()
    const newTranche: DebtTranche = {
      id: uuidv4(),
      tranche_name: `Loan ${(financing?.debt_tranches?.length || 0) + 1}`,
      sizing_method: 'Loan Amount (direct)',
      loan_amount: null,
      ltv_percentage: null,
      ltc_percentage: null,
      target_dscr: null,
      target_debt_yield: null,
      interest_type: 'Fixed Rate',
      interest_rate_annual: null,
      index: 'SOFR',
      spread_bps: null,
      floor_rate: null,
      ceiling_rate: null,
      index_assumption: null,
      amortization_type: 'Interest Only (Full Term)',
      amortization_years: 30,
      io_period_months: null,
      loan_term_months: 60,
      origination_fee_pct: null,
      origination_fee_flat: null,
      exit_fee_pct: null,
      prepayment_type: 'None',
      prepayment_lockout_months: null,
      other_loan_costs: [],
      lender_required_reserves: {
        tax_escrow_months: null,
        insurance_escrow_months: null,
        capex_reserve: null,
        ti_lc_reserve: null,
        interest_reserve_months: null,
      },
      covenants: {
        min_dscr: null,
        max_ltv: null,
        min_debt_yield: null,
      },
    }
    updateFinancing({ 
      debt_tranches: [...(financing?.debt_tranches || []), newTranche] 
    })
  }

  const updateTranche = (id: string, updates: Partial<DebtTranche>) => {
    onChange()
    updateFinancing({
      debt_tranches: financing?.debt_tranches?.map(t =>
        t.id === id ? { ...t, ...updates } : t
      ) || []
    })
  }

  const removeTranche = (id: string) => {
    onChange()
    updateFinancing({
      debt_tranches: financing?.debt_tranches?.filter(t => t.id !== id) || []
    })
  }

  const handleStructureChange = (type: CapitalStructureType) => {
    onChange()
    updateFinancing({ structure_type: type })
    
    // If changing to "All Cash", clear debt tranches
    if (type === 'All Cash') {
      updateFinancing({ debt_tranches: [] })
    } else if ((financing?.debt_tranches?.length || 0) === 0) {
      // Auto-add first tranche if none exist
      addDebtTranche()
    }
  }

  return (
    <div className="space-y-6">
      {/* Capital Structure Selection */}
      <Card variant="elevated">
        <CardHeader>
          <CardTitle subtitle="Choose your financing approach">
            <div className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-emerald-400" />
              Capital Structure
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {capitalStructureTypes.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => handleStructureChange(value)}
                className={`
                  p-4 rounded-xl border text-left transition-all
                  ${financing?.structure_type === value
                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                    : 'bg-slate-800/50 border-slate-700 text-slate-300 hover:border-slate-600'}
                `}
              >
                <span className="font-medium">{label}</span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Debt Tranches */}
      {financing?.structure_type !== 'All Cash' && (
        <Card variant="elevated">
          <CardHeader
            action={
              <Button variant="secondary" size="sm" leftIcon={<Plus className="w-4 h-4" />} onClick={addDebtTranche}>
                Add Tranche
              </Button>
            }
          >
            <CardTitle subtitle="Configure each layer of debt">
              Debt Tranches
            </CardTitle>
          </CardHeader>
          <CardContent>
            {(financing?.debt_tranches?.length || 0) === 0 ? (
              <div className="text-center py-8 text-slate-400">
                <p className="mb-4">No debt tranches configured</p>
                <Button variant="secondary" leftIcon={<Plus className="w-4 h-4" />} onClick={addDebtTranche}>
                  Add Debt Tranche
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                {financing?.debt_tranches?.map((tranche) => (
                  <div key={tranche.id} className="p-6 rounded-xl bg-slate-800/50 border border-slate-700">
                    <div className="flex items-center justify-between mb-6">
                      <Input
                        value={tranche.tranche_name}
                        onChange={(e) => updateTranche(tranche.id, { tranche_name: e.target.value })}
                        className="text-lg font-semibold bg-transparent border-none p-0 focus:ring-0 max-w-xs"
                      />
                      <button
                        onClick={() => removeTranche(tranche.id)}
                        className="p-2 text-slate-400 hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Loan Sizing */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <Select
                        label="Sizing Method"
                        options={[
                          { value: 'Loan Amount (direct)', label: 'Loan Amount (Direct)' },
                          { value: 'LTV', label: 'LTV (Loan-to-Value)' },
                          { value: 'LTC', label: 'LTC (Loan-to-Cost)' },
                          { value: 'DSCR Constrained', label: 'DSCR Constrained' },
                          { value: 'Debt Yield Constrained', label: 'Debt Yield Constrained' },
                        ]}
                        value={tranche.sizing_method}
                        onChange={(e) => updateTranche(tranche.id, { sizing_method: e.target.value as never })}
                      />
                      
                      {tranche.sizing_method === 'Loan Amount (direct)' && (
                        <Input
                          label="Loan Amount"
                          type="number"
                          leftAddon="$"
                          placeholder="0"
                          value={tranche.loan_amount || ''}
                          onChange={(e) => updateTranche(tranche.id, { loan_amount: e.target.value ? Number(e.target.value) : null })}
                        />
                      )}
                      
                      {tranche.sizing_method === 'LTV' && (
                        <>
                          <Input
                            label="LTV Percentage"
                            type="number"
                            rightAddon="%"
                            placeholder="65"
                            value={tranche.ltv_percentage || ''}
                            onChange={(e) => {
                              const ltv = e.target.value ? Number(e.target.value) : null
                              updateTranche(tranche.id, { 
                                ltv_percentage: ltv,
                                loan_amount: ltv && purchasePrice ? Math.round(purchasePrice * ltv / 100) : null
                              })
                            }}
                          />
                          <Input
                            label="Calculated Loan Amount"
                            type="number"
                            leftAddon="$"
                            value={tranche.loan_amount || ''}
                            disabled
                          />
                        </>
                      )}
                    </div>

                    {/* Interest */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                      <Select
                        label="Interest Type"
                        options={[
                          { value: 'Fixed Rate', label: 'Fixed Rate' },
                          { value: 'Floating Rate', label: 'Floating Rate' },
                          { value: 'Floating with Cap', label: 'Floating with Cap' },
                        ]}
                        value={tranche.interest_type}
                        onChange={(e) => updateTranche(tranche.id, { interest_type: e.target.value as never })}
                      />
                      
                      {tranche.interest_type === 'Fixed Rate' ? (
                        <Input
                          label="Interest Rate"
                          type="number"
                          rightAddon="%"
                          placeholder="6.50"
                          value={tranche.interest_rate_annual || ''}
                          onChange={(e) => updateTranche(tranche.id, { interest_rate_annual: e.target.value ? Number(e.target.value) : null })}
                        />
                      ) : (
                        <>
                          <Select
                            label="Index"
                            options={[
                              { value: 'SOFR', label: 'SOFR' },
                              { value: 'Prime', label: 'Prime' },
                              { value: 'Treasury', label: 'Treasury' },
                            ]}
                            value={tranche.index}
                            onChange={(e) => updateTranche(tranche.id, { index: e.target.value as never })}
                          />
                          <Input
                            label="Spread"
                            type="number"
                            rightAddon="bps"
                            placeholder="250"
                            value={tranche.spread_bps || ''}
                            onChange={(e) => updateTranche(tranche.id, { spread_bps: e.target.value ? Number(e.target.value) : null })}
                          />
                          <Input
                            label="Index Assumption"
                            type="number"
                            rightAddon="%"
                            placeholder="5.00"
                            value={tranche.index_assumption || ''}
                            onChange={(e) => updateTranche(tranche.id, { index_assumption: e.target.value ? Number(e.target.value) : null })}
                          />
                        </>
                      )}
                    </div>

                    {/* Amortization */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <Select
                        label="Amortization"
                        options={[
                          { value: 'Interest Only (Full Term)', label: 'Interest Only (Full Term)' },
                          { value: 'Interest Only then Amortizing', label: 'IO then Amortizing' },
                          { value: 'Fully Amortizing', label: 'Fully Amortizing' },
                        ]}
                        value={tranche.amortization_type}
                        onChange={(e) => updateTranche(tranche.id, { amortization_type: e.target.value as never })}
                      />
                      
                      {tranche.amortization_type !== 'Interest Only (Full Term)' && (
                        <Input
                          label="Amortization Period"
                          type="number"
                          rightAddon="years"
                          placeholder="30"
                          value={tranche.amortization_years || ''}
                          onChange={(e) => updateTranche(tranche.id, { amortization_years: e.target.value ? Number(e.target.value) : null })}
                        />
                      )}
                      
                      {tranche.amortization_type === 'Interest Only then Amortizing' && (
                        <Input
                          label="IO Period"
                          type="number"
                          rightAddon="months"
                          placeholder="24"
                          value={tranche.io_period_months || ''}
                          onChange={(e) => updateTranche(tranche.id, { io_period_months: e.target.value ? Number(e.target.value) : null })}
                        />
                      )}
                      
                      <Input
                        label="Loan Term"
                        type="number"
                        rightAddon="months"
                        placeholder="60"
                        value={tranche.loan_term_months || ''}
                        onChange={(e) => updateTranche(tranche.id, { loan_term_months: e.target.value ? Number(e.target.value) : null })}
                      />
                    </div>

                    {/* Fees */}
                    <div className="mt-6 pt-6 border-t border-slate-700">
                      <h4 className="text-sm font-medium text-slate-300 mb-4">Loan Fees</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Input
                          label="Origination Fee"
                          type="number"
                          rightAddon="%"
                          placeholder="1.00"
                          value={tranche.origination_fee_pct || ''}
                          onChange={(e) => updateTranche(tranche.id, { origination_fee_pct: e.target.value ? Number(e.target.value) : null })}
                        />
                        <Input
                          label="Exit Fee"
                          type="number"
                          rightAddon="%"
                          placeholder="0.50"
                          value={tranche.exit_fee_pct || ''}
                          onChange={(e) => updateTranche(tranche.id, { exit_fee_pct: e.target.value ? Number(e.target.value) : null })}
                        />
                        <Select
                          label="Prepayment Terms"
                          options={[
                            { value: 'None', label: 'No Penalty' },
                            { value: 'Lockout then Open', label: 'Lockout then Open' },
                            { value: 'Yield Maintenance', label: 'Yield Maintenance' },
                            { value: 'Step-Down', label: 'Step-Down' },
                          ]}
                          value={tranche.prepayment_type}
                          onChange={(e) => updateTranche(tranche.id, { prepayment_type: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Equity Structure */}
      <Card variant="elevated">
        <CardHeader>
          <CardTitle subtitle="Configure equity contributions and splits">
            Equity Structure
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Select
              label="Equity Structure Type"
              options={[
                { value: 'Single Investor / Self-Funded', label: 'Single Investor / Self-Funded' },
                { value: 'JV - Pari Passu', label: 'JV - Pari Passu' },
                { value: 'JV - Preferred Return', label: 'JV - Preferred Return' },
                { value: 'Syndication - Standard', label: 'Syndication - Standard' },
                { value: 'Syndication - Waterfall', label: 'Syndication - Waterfall' },
              ]}
              value={financing?.equity_structure_type || 'Single Investor / Self-Funded'}
              onChange={(e) => {
                onChange()
                updateFinancing({ equity_structure_type: e.target.value })
              }}
            />
          </div>

          {/* Fees */}
          <div className="pt-6 border-t border-slate-700">
            <h4 className="text-sm font-medium text-slate-300 mb-4">Sponsor Fees</h4>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Input
                label="Acquisition Fee"
                type="number"
                rightAddon="%"
                placeholder="1.00"
                value={financing?.fees?.acquisition_fee_pct || ''}
                onChange={(e) => {
                  onChange()
                  updateFinancing({ 
                    fees: { 
                      ...financing?.fees, 
                      acquisition_fee_pct: e.target.value ? Number(e.target.value) : null 
                    }
                  })
                }}
              />
              <Input
                label="Asset Management Fee"
                type="number"
                rightAddon="% / yr"
                placeholder="2.00"
                value={financing?.fees?.asset_management_fee_pct || ''}
                onChange={(e) => {
                  onChange()
                  updateFinancing({ 
                    fees: { 
                      ...financing?.fees, 
                      asset_management_fee_pct: e.target.value ? Number(e.target.value) : null 
                    }
                  })
                }}
              />
              <Input
                label="Disposition Fee"
                type="number"
                rightAddon="%"
                placeholder="1.00"
                value={financing?.fees?.disposition_fee_pct || ''}
                onChange={(e) => {
                  onChange()
                  updateFinancing({ 
                    fees: { 
                      ...financing?.fees, 
                      disposition_fee_pct: e.target.value ? Number(e.target.value) : null 
                    }
                  })
                }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sources & Uses Summary */}
      <Card variant="elevated" className="bg-gradient-to-r from-emerald-500/10 to-blue-500/10 border-emerald-500/30">
        <CardContent>
          <h3 className="text-lg font-semibold text-white mb-6">Sources & Uses Summary</h3>
          
          <div className="grid grid-cols-2 gap-8">
            {/* Sources */}
            <div>
              <h4 className="text-sm font-medium text-slate-400 mb-4">SOURCES</h4>
              <div className="space-y-3">
                {financing?.debt_tranches?.map((tranche) => (
                  <div key={tranche.id} className="flex justify-between">
                    <span className="text-slate-300">{tranche.tranche_name}</span>
                    <span className="text-white font-medium">
                      ${(tranche.loan_amount || 0).toLocaleString()}
                    </span>
                  </div>
                ))}
                <div className="flex justify-between">
                  <span className="text-slate-300">Equity</span>
                  <span className="text-white font-medium">${totalEquity.toLocaleString()}</span>
                </div>
                <div className="flex justify-between pt-3 border-t border-slate-700">
                  <span className="text-white font-semibold">Total Sources</span>
                  <span className="text-emerald-400 font-bold">${purchasePrice.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Uses */}
            <div>
              <h4 className="text-sm font-medium text-slate-400 mb-4">USES</h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-300">Purchase Price</span>
                  <span className="text-white font-medium">${purchasePrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between pt-3 border-t border-slate-700">
                  <span className="text-white font-semibold">Total Uses</span>
                  <span className="text-emerald-400 font-bold">${purchasePrice.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="mt-6 pt-6 border-t border-slate-700/50">
            <div className="grid grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-slate-400">LTV</p>
                <p className="text-lg font-semibold text-white">
                  {purchasePrice > 0 ? ((totalDebt / purchasePrice) * 100).toFixed(1) : 0}%
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Total Debt</p>
                <p className="text-lg font-semibold text-white">${totalDebt.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Total Equity</p>
                <p className="text-lg font-semibold text-white">${totalEquity.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Equity %</p>
                <p className="text-lg font-semibold text-white">
                  {purchasePrice > 0 ? ((totalEquity / purchasePrice) * 100).toFixed(1) : 0}%
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

