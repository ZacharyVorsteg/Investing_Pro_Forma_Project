import React from 'react'
import { BarChart3, Plus, Trash2 } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent, Input, Select, Button } from '../ui'
import { useProjectStore } from '../../store/projectStore'
import { v4 as uuidv4 } from 'uuid'
import type { Tenant, OtherIncomeItem } from '../../types'

const otherIncomeCategories = [
  'Parking - Reserved/Assigned',
  'Parking - Transient/Hourly',
  'Signage Revenue',
  'Cell Tower/Antenna Lease',
  'Storage Units',
  'Laundry Revenue',
  'Vending Machines',
  'Late Fees',
  'Application Fees',
  'Pet Fees/Rent',
  'Utility Reimbursements',
  'Other',
]

interface IncomeSectionProps {
  onChange: () => void
}

export const IncomeSection: React.FC<IncomeSectionProps> = ({ onChange }) => {
  const { currentProject, updateIncome } = useProjectStore()
  
  if (!currentProject) return null

  const income = currentProject.income
  const property = currentProject.property

  // Calculate totals
  const totalRent = income?.tenants?.reduce((sum, t) => sum + ((t.base_rent_monthly || 0) * 12), 0) || 0
  const otherIncomeTotal = income?.other_income?.reduce((sum, i) => sum + (i.amount_annual || 0), 0) || 0
  const vacancyRate = income?.vacancy?.vacancy_rate_single || 0
  const vacancyDeduction = totalRent * (vacancyRate / 100)
  const effectiveGrossIncome = totalRent + otherIncomeTotal - vacancyDeduction

  const addTenant = () => {
    onChange()
    const newTenant: Tenant = {
      id: uuidv4(),
      tenant_name: '',
      suite_unit: '',
      rentable_sf: null,
      usable_sf: null,
      pro_rata_share: null,
      lease_start_date: '',
      lease_end_date: '',
      lease_type: 'NNN (Triple Net)',
      base_rent_monthly: null,
      escalation_type: 'Fixed Annual Percentage',
      escalation_percentage: null,
      escalation_dollar: null,
      renewal_options: [],
      termination_option: false,
      ti_allowance_total: null,
      free_rent_months: null,
      cam_recoverable: true,
      tax_recoverable: true,
      insurance_recoverable: true,
      tenant_credit: 'Unknown',
      security_deposit: null,
      notes: '',
    }
    updateIncome({ tenants: [...(income?.tenants || []), newTenant] })
  }

  const updateTenant = (id: string, updates: Partial<Tenant>) => {
    onChange()
    updateIncome({
      tenants: income?.tenants?.map(t => t.id === id ? { ...t, ...updates } : t) || []
    })
  }

  const removeTenant = (id: string) => {
    onChange()
    updateIncome({
      tenants: income?.tenants?.filter(t => t.id !== id) || []
    })
  }

  const addOtherIncome = () => {
    onChange()
    const newItem: OtherIncomeItem = {
      id: uuidv4(),
      category: 'Other',
      description: '',
      amount_monthly: null,
      amount_annual: null,
      growth_rate: null,
      growth_type: 'Fixed %',
      notes: '',
    }
    updateIncome({ other_income: [...(income?.other_income || []), newItem] })
  }

  const updateOtherIncome = (id: string, updates: Partial<OtherIncomeItem>) => {
    onChange()
    updateIncome({
      other_income: income?.other_income?.map(i => i.id === id ? { ...i, ...updates } : i) || []
    })
  }

  const removeOtherIncome = (id: string) => {
    onChange()
    updateIncome({
      other_income: income?.other_income?.filter(i => i.id !== id) || []
    })
  }

  return (
    <div className="space-y-6">
      {/* Entry Method */}
      <Card variant="elevated">
        <CardHeader>
          <CardTitle subtitle="Choose how to enter your income data">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-emerald-400" />
              Income Entry Method
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {['Summary Entry', 'Manual Rent Roll Entry', 'Rent Roll Import', 'Unit Mix Entry'].map((method) => (
              <button
                key={method}
                onClick={() => {
                  onChange()
                  updateIncome({ entry_method: method as never })
                }}
                className={`
                  p-4 rounded-xl border text-sm font-medium transition-all
                  ${income?.entry_method === method
                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                    : 'bg-slate-800/50 border-slate-700 text-slate-300 hover:border-slate-600'}
                `}
              >
                {method}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Summary Entry Mode */}
      {income?.entry_method === 'Summary Entry' && (
        <Card variant="elevated">
          <CardHeader>
            <CardTitle subtitle="Enter total rental income figures">
              Summary Income
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Gross Potential Rent (Annual)"
                type="number"
                leftAddon="$"
                placeholder="0"
                value={income?.summary?.gross_potential_rent || ''}
                onChange={(e) => {
                  onChange()
                  updateIncome({ 
                    summary: { 
                      ...income?.summary, 
                      gross_potential_rent: e.target.value ? Number(e.target.value) : null 
                    }
                  })
                }}
                helperText="Total rent if 100% occupied at market rates"
              />
              <Input
                label="Total Other Income (Annual)"
                type="number"
                leftAddon="$"
                placeholder="0"
                value={income?.summary?.total_other_income || ''}
                onChange={(e) => {
                  onChange()
                  updateIncome({ 
                    summary: { 
                      ...income?.summary, 
                      total_other_income: e.target.value ? Number(e.target.value) : null 
                    }
                  })
                }}
                helperText="Parking, storage, fees, etc."
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Rent Roll */}
      {income?.entry_method === 'Manual Rent Roll Entry' && (
        <Card variant="elevated">
          <CardHeader
            action={
              <Button variant="secondary" size="sm" leftIcon={<Plus className="w-4 h-4" />} onClick={addTenant}>
                Add Tenant
              </Button>
            }
          >
            <CardTitle subtitle="Enter each tenant's lease details">
              Rent Roll
            </CardTitle>
          </CardHeader>
          <CardContent>
            {(income?.tenants?.length || 0) === 0 ? (
              <div className="text-center py-8 text-slate-400">
                <p className="mb-4">No tenants added yet</p>
                <Button variant="secondary" leftIcon={<Plus className="w-4 h-4" />} onClick={addTenant}>
                  Add First Tenant
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {income?.tenants?.map((tenant, index) => (
                  <div key={tenant.id} className="p-6 rounded-xl bg-slate-800/50 border border-slate-700">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-medium text-white">Tenant {index + 1}</h4>
                      <button
                        onClick={() => removeTenant(tenant.id)}
                        className="p-2 text-slate-400 hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                      <Input
                        label="Tenant Name"
                        placeholder="Tenant name"
                        value={tenant.tenant_name}
                        onChange={(e) => updateTenant(tenant.id, { tenant_name: e.target.value })}
                      />
                      <Input
                        label="Suite/Unit"
                        placeholder="Suite 100"
                        value={tenant.suite_unit}
                        onChange={(e) => updateTenant(tenant.id, { suite_unit: e.target.value })}
                      />
                      <Input
                        label="Rentable SF"
                        type="number"
                        placeholder="0"
                        value={tenant.rentable_sf || ''}
                        onChange={(e) => updateTenant(tenant.id, { rentable_sf: e.target.value ? Number(e.target.value) : null })}
                      />
                      <Select
                        label="Lease Type"
                        options={[
                          { value: 'NNN (Triple Net)', label: 'NNN (Triple Net)' },
                          { value: 'Modified Gross', label: 'Modified Gross' },
                          { value: 'Gross', label: 'Gross' },
                          { value: 'Absolute Net', label: 'Absolute Net' },
                        ]}
                        value={tenant.lease_type}
                        onChange={(e) => updateTenant(tenant.id, { lease_type: e.target.value as never })}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                      <Input
                        label="Monthly Base Rent"
                        type="number"
                        leftAddon="$"
                        placeholder="0"
                        value={tenant.base_rent_monthly || ''}
                        onChange={(e) => updateTenant(tenant.id, { base_rent_monthly: e.target.value ? Number(e.target.value) : null })}
                      />
                      <Input
                        label="Lease Start"
                        type="date"
                        value={tenant.lease_start_date}
                        onChange={(e) => updateTenant(tenant.id, { lease_start_date: e.target.value })}
                      />
                      <Input
                        label="Lease End"
                        type="date"
                        value={tenant.lease_end_date}
                        onChange={(e) => updateTenant(tenant.id, { lease_end_date: e.target.value })}
                      />
                      <Input
                        label="Annual Escalation"
                        type="number"
                        rightAddon="%"
                        placeholder="3.0"
                        value={tenant.escalation_percentage || ''}
                        onChange={(e) => updateTenant(tenant.id, { escalation_percentage: e.target.value ? Number(e.target.value) : null })}
                      />
                    </div>

                    {tenant.rentable_sf && tenant.base_rent_monthly && (
                      <div className="p-3 rounded-lg bg-slate-700/30 text-sm">
                        <span className="text-slate-400">Rent PSF: </span>
                        <span className="text-white font-medium">
                          ${((tenant.base_rent_monthly * 12) / tenant.rentable_sf).toFixed(2)}/SF/year
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Other Income */}
      <Card variant="elevated">
        <CardHeader
          action={
            <Button variant="secondary" size="sm" leftIcon={<Plus className="w-4 h-4" />} onClick={addOtherIncome}>
              Add Income
            </Button>
          }
        >
          <CardTitle subtitle="Additional income sources beyond base rent">
            Other Income
          </CardTitle>
        </CardHeader>
        <CardContent>
          {(income?.other_income?.length || 0) === 0 ? (
            <div className="text-center py-6 text-slate-400">
              <p className="mb-4 text-sm">No other income sources added</p>
              <Button variant="ghost" size="sm" leftIcon={<Plus className="w-4 h-4" />} onClick={addOtherIncome}>
                Add Other Income
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {income?.other_income?.map((item) => (
                <div key={item.id} className="flex items-center gap-4 p-4 rounded-lg bg-slate-800/50 border border-slate-700">
                  <div className="flex-1 grid grid-cols-4 gap-4">
                    <Select
                      options={otherIncomeCategories.map(c => ({ value: c, label: c }))}
                      value={item.category}
                      onChange={(e) => updateOtherIncome(item.id, { category: e.target.value })}
                    />
                    <Input
                      placeholder="Description"
                      value={item.description}
                      onChange={(e) => updateOtherIncome(item.id, { description: e.target.value })}
                    />
                    <Input
                      type="number"
                      leftAddon="$"
                      placeholder="Monthly"
                      value={item.amount_monthly || ''}
                      onChange={(e) => {
                        const monthly = e.target.value ? Number(e.target.value) : null
                        updateOtherIncome(item.id, { 
                          amount_monthly: monthly,
                          amount_annual: monthly ? monthly * 12 : null
                        })
                      }}
                    />
                    <Input
                      type="number"
                      rightAddon="%"
                      placeholder="Growth"
                      value={item.growth_rate || ''}
                      onChange={(e) => updateOtherIncome(item.id, { growth_rate: e.target.value ? Number(e.target.value) : null })}
                    />
                  </div>
                  <button
                    onClick={() => removeOtherIncome(item.id)}
                    className="p-2 text-slate-400 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}

              <div className="flex justify-end pt-4 border-t border-slate-700">
                <div className="text-right">
                  <p className="text-sm text-slate-400">Total Other Income</p>
                  <p className="text-xl font-bold text-white">${otherIncomeTotal.toLocaleString()}/year</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Vacancy & Loss */}
      <Card variant="elevated">
        <CardHeader>
          <CardTitle subtitle="Model vacancy, credit loss, and concessions">
            Vacancy & Collection Loss
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Input
              label="Vacancy Rate"
              type="number"
              rightAddon="%"
              placeholder="5.0"
              value={income?.vacancy?.vacancy_rate_single || ''}
              onChange={(e) => {
                onChange()
                updateIncome({ 
                  vacancy: { 
                    ...income?.vacancy, 
                    vacancy_rate_single: e.target.value ? Number(e.target.value) : null 
                  }
                })
              }}
              state={income?.vacancy?.vacancy_rate_single ? 'known' : 'incomplete'}
              showStateSelector
              helperText="What vacancy rate reflects your market expectations?"
            />
            <Input
              label="Credit Loss"
              type="number"
              rightAddon="%"
              placeholder="1.0"
              value={income?.vacancy?.credit_loss_rate || ''}
              onChange={(e) => {
                onChange()
                updateIncome({ 
                  vacancy: { 
                    ...income?.vacancy, 
                    credit_loss_rate: e.target.value ? Number(e.target.value) : null 
                  }
                })
              }}
              helperText="Expected bad debt from non-paying tenants"
            />
            <Input
              label="Concessions"
              type="number"
              rightAddon="%"
              placeholder="0.5"
              value={income?.vacancy?.concession_rate || ''}
              onChange={(e) => {
                onChange()
                updateIncome({ 
                  vacancy: { 
                    ...income?.vacancy, 
                    concession_rate: e.target.value ? Number(e.target.value) : null 
                  }
                })
              }}
              helperText="Free rent, reduced rates, etc."
            />
          </div>

          <div className="mt-6">
            <Input
              label="Vacancy Assumption Rationale"
              placeholder="Explain your vacancy assumption (e.g., 'Market vacancy is 4%, but building is older so we assume 6%')"
              value={income?.vacancy?.vacancy_assumption_rationale || ''}
              onChange={(e) => {
                onChange()
                updateIncome({ 
                  vacancy: { 
                    ...income?.vacancy, 
                    vacancy_assumption_rationale: e.target.value 
                  }
                })
              }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Income Summary */}
      <Card variant="elevated" className="bg-gradient-to-r from-emerald-500/10 to-blue-500/10 border-emerald-500/30">
        <CardContent>
          <h3 className="text-lg font-semibold text-white mb-4">Income Summary (Year 1)</h3>
          
          <div className="space-y-3">
            <div className="flex justify-between py-2">
              <span className="text-slate-300">Gross Potential Rent</span>
              <span className="text-white font-medium">${totalRent.toLocaleString()}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-slate-300">Other Income</span>
              <span className="text-white font-medium">${otherIncomeTotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between py-2 text-red-400">
              <span>Less: Vacancy ({vacancyRate}%)</span>
              <span>-${vacancyDeduction.toLocaleString()}</span>
            </div>
            <div className="flex justify-between py-3 border-t border-slate-700">
              <span className="text-white font-semibold">Effective Gross Income</span>
              <span className="text-emerald-400 font-bold text-xl">${effectiveGrossIncome.toLocaleString()}</span>
            </div>
          </div>

          {property?.sizing?.rentable_sf && effectiveGrossIncome > 0 && (
            <div className="mt-4 pt-4 border-t border-slate-700/50">
              <p className="text-sm text-slate-400">
                EGI per SF: <span className="text-white font-medium">
                  ${(effectiveGrossIncome / property.sizing.rentable_sf).toFixed(2)}
                </span>
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

