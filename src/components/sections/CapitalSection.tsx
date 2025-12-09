import React from 'react'
import { Hammer, Plus, Trash2 } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent, Input, Select, Button } from '../ui'
import { useProjectStore } from '../../store/projectStore'
import { v4 as uuidv4 } from 'uuid'
import type { CapExEvent } from '../../types'

const capexCategories = [
  'Roof',
  'HVAC',
  'Parking Lot/Paving',
  'Elevator Modernization',
  'Building Systems',
  'Facade/Exterior',
  'Lobby Renovation',
  'Common Area Upgrade',
  'ADA Compliance',
  'Environmental Remediation',
  'Seismic Retrofit',
  'Energy Efficiency',
  'Solar Installation',
  'Technology Upgrade',
  'Tenant Improvement',
  'Spec Suite Build-Out',
  'Other',
]

interface CapitalSectionProps {
  onChange: () => void
}

export const CapitalSection: React.FC<CapitalSectionProps> = ({ onChange }) => {
  const { currentProject, updateCapital } = useProjectStore()
  
  if (!currentProject) return null

  const capital = currentProject.capital
  const property = currentProject.property
  const analysis = currentProject.analysis

  const addCapexEvent = () => {
    onChange()
    const newEvent: CapExEvent = {
      id: uuidv4(),
      year: 1,
      month: null,
      description: '',
      category: 'Other',
      amount: null,
      funding_source: 'Operating Cash Flow',
      notes: '',
    }
    updateCapital({ 
      scheduled_capex: [...(capital?.scheduled_capex || []), newEvent] 
    })
  }

  const updateCapexEvent = (id: string, updates: Partial<CapExEvent>) => {
    onChange()
    updateCapital({
      scheduled_capex: capital?.scheduled_capex?.map(e => 
        e.id === id ? { ...e, ...updates } : e
      ) || []
    })
  }

  const removeCapexEvent = (id: string) => {
    onChange()
    updateCapital({
      scheduled_capex: capital?.scheduled_capex?.filter(e => e.id !== id) || []
    })
  }

  const totalScheduledCapex = capital?.scheduled_capex?.reduce((sum, e) => sum + (e.amount || 0), 0) || 0

  return (
    <div className="space-y-6">
      {/* Capital Reserves */}
      <Card variant="elevated">
        <CardHeader>
          <CardTitle subtitle="Ongoing reserves for major repairs and replacements">
            <div className="flex items-center gap-2">
              <Hammer className="w-5 h-5 text-emerald-400" />
              Capital Reserves
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <Select
              label="Reserve Method"
              options={[
                { value: 'Annual per SF', label: 'Annual per SF' },
                { value: 'Annual flat amount', label: 'Annual Flat Amount' },
                { value: 'Percentage of EGI', label: 'Percentage of EGI' },
                { value: 'Percentage of NOI', label: 'Percentage of NOI' },
                { value: 'None', label: 'No Reserves' },
              ]}
              value={capital?.reserve_method || 'Annual per SF'}
              onChange={(e) => {
                onChange()
                updateCapital({ reserve_method: e.target.value as never })
              }}
            />
            
            {capital?.reserve_method === 'Annual per SF' && (
              <Input
                label="Reserve per SF"
                type="number"
                leftAddon="$"
                rightAddon="/SF"
                placeholder="0.25"
                value={capital?.reserve_per_sf || ''}
                onChange={(e) => {
                  onChange()
                  updateCapital({ reserve_per_sf: e.target.value ? Number(e.target.value) : null })
                }}
                helperText="Industrial: $0.10-0.25, Office: $0.25-0.50, Retail: $0.15-0.35"
              />
            )}
            
            {capital?.reserve_method === 'Annual flat amount' && (
              <Input
                label="Annual Reserve Amount"
                type="number"
                leftAddon="$"
                placeholder="0"
                value={capital?.annual_reserve || ''}
                onChange={(e) => {
                  onChange()
                  updateCapital({ annual_reserve: e.target.value ? Number(e.target.value) : null })
                }}
              />
            )}
            
            {(capital?.reserve_method === 'Percentage of EGI' || capital?.reserve_method === 'Percentage of NOI') && (
              <Input
                label="Reserve Percentage"
                type="number"
                rightAddon="%"
                placeholder="2.0"
                value={capital?.reserve_pct || ''}
                onChange={(e) => {
                  onChange()
                  updateCapital({ reserve_pct: e.target.value ? Number(e.target.value) : null })
                }}
              />
            )}
          </div>

          <Input
            label="Reserve Growth Rate"
            type="number"
            rightAddon="%"
            placeholder="3.0"
            value={capital?.reserve_growth_rate || ''}
            onChange={(e) => {
              onChange()
              updateCapital({ reserve_growth_rate: e.target.value ? Number(e.target.value) : null })
            }}
            helperText="Annual increase in reserve contributions"
          />

          {/* Calculated Reserve */}
          {capital?.reserve_method === 'Annual per SF' && property?.sizing?.rentable_sf && capital?.reserve_per_sf && (
            <div className="mt-4 p-4 rounded-lg bg-slate-800/50">
              <p className="text-sm text-slate-400">
                Year 1 Reserve: <span className="text-white font-medium">
                  ${((property.sizing.rentable_sf * capital.reserve_per_sf)).toLocaleString()}
                </span>
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Scheduled Capital Expenditures */}
      <Card variant="elevated">
        <CardHeader
          action={
            <Button variant="secondary" size="sm" leftIcon={<Plus className="w-4 h-4" />} onClick={addCapexEvent}>
              Add CapEx
            </Button>
          }
        >
          <CardTitle subtitle="Planned capital projects during hold period">
            Scheduled Capital Expenditures
          </CardTitle>
        </CardHeader>
        <CardContent>
          {(capital?.scheduled_capex?.length || 0) === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <p className="mb-4">No scheduled capital expenditures</p>
              <Button variant="secondary" leftIcon={<Plus className="w-4 h-4" />} onClick={addCapexEvent}>
                Add Capital Project
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {capital?.scheduled_capex?.map((event) => (
                <div key={event.id} className="p-4 rounded-xl bg-slate-800/50 border border-slate-700">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
                      <Select
                        label="Category"
                        options={capexCategories.map(c => ({ value: c, label: c }))}
                        value={event.category}
                        onChange={(e) => updateCapexEvent(event.id, { category: e.target.value })}
                      />
                      <Input
                        label="Description"
                        placeholder="Describe the project"
                        value={event.description}
                        onChange={(e) => updateCapexEvent(event.id, { description: e.target.value })}
                      />
                      <Input
                        label="Year"
                        type="number"
                        placeholder="1"
                        value={event.year || ''}
                        onChange={(e) => updateCapexEvent(event.id, { year: e.target.value ? Number(e.target.value) : 1 })}
                      />
                      <Input
                        label="Amount"
                        type="number"
                        leftAddon="$"
                        placeholder="0"
                        value={event.amount || ''}
                        onChange={(e) => updateCapexEvent(event.id, { amount: e.target.value ? Number(e.target.value) : null })}
                      />
                    </div>
                    <button
                      onClick={() => removeCapexEvent(event.id)}
                      className="p-2 text-slate-400 hover:text-red-400 transition-colors mt-6"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}

              <div className="flex justify-end pt-4 border-t border-slate-700">
                <div className="text-right">
                  <p className="text-sm text-slate-400">Total Scheduled CapEx</p>
                  <p className="text-xl font-bold text-white">${totalScheduledCapex.toLocaleString()}</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* TI/LC Assumptions */}
      <Card variant="elevated">
        <CardHeader>
          <CardTitle subtitle="Tenant improvement and leasing commission assumptions">
            TI/LC Assumptions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h4 className="text-sm font-medium text-slate-300 mb-4">New Leases</h4>
              <div className="space-y-4">
                <Input
                  label="TI Allowance"
                  type="number"
                  leftAddon="$"
                  rightAddon="/SF"
                  placeholder="40"
                  value={capital?.ti_assumptions?.new_lease_ti_psf || ''}
                  onChange={(e) => {
                    onChange()
                    updateCapital({
                      ti_assumptions: {
                        ...capital?.ti_assumptions,
                        new_lease_ti_psf: e.target.value ? Number(e.target.value) : null
                      }
                    })
                  }}
                  helperText="Industrial: $3-15, Office: $40-80, Retail: $20-60"
                />
                <Input
                  label="Leasing Commission"
                  type="number"
                  rightAddon="%"
                  placeholder="5.0"
                  value={capital?.ti_assumptions?.new_lease_lc_pct || ''}
                  onChange={(e) => {
                    onChange()
                    updateCapital({
                      ti_assumptions: {
                        ...capital?.ti_assumptions,
                        new_lease_lc_pct: e.target.value ? Number(e.target.value) : null
                      }
                    })
                  }}
                  helperText="Typically 4-6% of total lease value"
                />
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-slate-300 mb-4">Renewals</h4>
              <div className="space-y-4">
                <Input
                  label="TI Allowance"
                  type="number"
                  leftAddon="$"
                  rightAddon="/SF"
                  placeholder="10"
                  value={capital?.ti_assumptions?.renewal_ti_psf || ''}
                  onChange={(e) => {
                    onChange()
                    updateCapital({
                      ti_assumptions: {
                        ...capital?.ti_assumptions,
                        renewal_ti_psf: e.target.value ? Number(e.target.value) : null
                      }
                    })
                  }}
                  helperText="Typically 25-50% of new lease TI"
                />
                <Input
                  label="Leasing Commission"
                  type="number"
                  rightAddon="%"
                  placeholder="2.0"
                  value={capital?.ti_assumptions?.renewal_lc_pct || ''}
                  onChange={(e) => {
                    onChange()
                    updateCapital({
                      ti_assumptions: {
                        ...capital?.ti_assumptions,
                        renewal_lc_pct: e.target.value ? Number(e.target.value) : null
                      }
                    })
                  }}
                  helperText="Typically 1-2% of total lease value"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Capital Summary */}
      <Card variant="elevated" className="bg-gradient-to-r from-emerald-500/10 to-blue-500/10 border-emerald-500/30">
        <CardContent>
          <h3 className="text-lg font-semibold text-white mb-4">Capital Plan Summary</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-slate-400">Annual Reserves</p>
              <p className="text-2xl font-bold text-white">
                {capital?.reserve_method === 'Annual per SF' && property?.sizing?.rentable_sf && capital?.reserve_per_sf
                  ? `$${(property.sizing.rentable_sf * capital.reserve_per_sf).toLocaleString()}`
                  : capital?.reserve_method === 'Annual flat amount' && capital?.annual_reserve
                  ? `$${capital.annual_reserve.toLocaleString()}`
                  : '$0'
                }
              </p>
              <p className="text-xs text-slate-500">Year 1</p>
            </div>
            <div>
              <p className="text-sm text-slate-400">Scheduled CapEx</p>
              <p className="text-2xl font-bold text-white">${totalScheduledCapex.toLocaleString()}</p>
              <p className="text-xs text-slate-500">Total over hold period</p>
            </div>
            <div>
              <p className="text-sm text-slate-400">Hold Period</p>
              <p className="text-2xl font-bold text-white">{analysis?.hold_period_years || 5} Years</p>
              <p className="text-xs text-slate-500">Analysis period</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

