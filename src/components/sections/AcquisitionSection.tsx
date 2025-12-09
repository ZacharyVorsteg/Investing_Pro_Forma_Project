import React, { useState } from 'react'
import { DollarSign, Plus, Trash2, Calculator } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent, Input, Select, Button } from '../ui'
import { useProjectStore } from '../../store/projectStore'
import { v4 as uuidv4 } from 'uuid'
import type { ClosingCostItem, ImmediateCapitalItem } from '../../types'

const closingCostCategories = [
  'Title Insurance',
  'Escrow Fees',
  'Legal Fees - Acquisition',
  'Due Diligence - Phase I Environmental',
  'Due Diligence - Phase II Environmental',
  'Due Diligence - Property Condition Assessment',
  'Due Diligence - Survey',
  'Due Diligence - Appraisal',
  'Due Diligence - Zoning Report',
  'Due Diligence - Title Search',
  'Recording Fees',
  'Transfer Taxes',
  'Broker Commission',
  'Lender Legal Fees',
  'Third Party Reports',
  'Accounting/Tax Structuring',
  'Other',
]

const immediateCapitalCategories = [
  'Deferred Maintenance',
  'Immediate Repairs',
  'Tenant Buyout',
  'Lease-Up Costs',
  'Working Capital Reserve',
  'Interest Reserve',
  'Operating Reserve',
  'Other',
]

interface AcquisitionSectionProps {
  onChange: () => void
}

export const AcquisitionSection: React.FC<AcquisitionSectionProps> = ({ onChange }) => {
  const { currentProject, updateAcquisition } = useProjectStore()
  const [showCalculator, setShowCalculator] = useState(false)
  
  if (!currentProject) return null

  const acquisition = currentProject.acquisition
  const property = currentProject.property

  // Calculate totals
  const closingCostsTotal = acquisition?.closing_costs?.reduce((sum, item) => sum + (item.amount || 0), 0) || 0
  const immediateCapitalTotal = acquisition?.immediate_capital?.reduce((sum, item) => sum + (item.amount || 0), 0) || 0
  const totalBasis = (acquisition?.purchase_price || 0) + closingCostsTotal + immediateCapitalTotal

  // Calculate metrics
  const rentableSF = property?.sizing?.rentable_sf || 0
  const pricePerSF = rentableSF > 0 && acquisition?.purchase_price ? acquisition.purchase_price / rentableSF : 0

  const handlePriceChange = (value: number | null) => {
    onChange()
    updateAcquisition({ 
      purchase_price: value,
      purchase_price_state: value ? 'known' : 'incomplete'
    })
  }

  const addClosingCost = () => {
    onChange()
    const newItem: ClosingCostItem = {
      id: uuidv4(),
      category: 'Other',
      description: '',
      amount: 0,
      calculation_type: 'flat',
      percentage_of: 'purchase_price',
      percentage: 0,
    }
    updateAcquisition({ 
      closing_costs: [...(acquisition?.closing_costs || []), newItem] 
    })
  }

  const updateClosingCost = (id: string, updates: Partial<ClosingCostItem>) => {
    onChange()
    updateAcquisition({
      closing_costs: acquisition?.closing_costs?.map(item =>
        item.id === id ? { ...item, ...updates } : item
      ) || []
    })
  }

  const removeClosingCost = (id: string) => {
    onChange()
    updateAcquisition({
      closing_costs: acquisition?.closing_costs?.filter(item => item.id !== id) || []
    })
  }

  const addImmediateCapital = () => {
    onChange()
    const newItem: ImmediateCapitalItem = {
      id: uuidv4(),
      description: '',
      amount: 0,
      category: 'Other',
      notes: '',
    }
    updateAcquisition({ 
      immediate_capital: [...(acquisition?.immediate_capital || []), newItem] 
    })
  }

  const updateImmediateCapital = (id: string, updates: Partial<ImmediateCapitalItem>) => {
    onChange()
    updateAcquisition({
      immediate_capital: acquisition?.immediate_capital?.map(item =>
        item.id === id ? { ...item, ...updates } : item
      ) || []
    })
  }

  const removeImmediateCapital = (id: string) => {
    onChange()
    updateAcquisition({
      immediate_capital: acquisition?.immediate_capital?.filter(item => item.id !== id) || []
    })
  }

  return (
    <div className="space-y-6">
      {/* Purchase Price */}
      <Card variant="elevated">
        <CardHeader>
          <CardTitle subtitle="Enter the agreed purchase price">
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-emerald-400" />
              Purchase Price
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Input
                label="Purchase Price"
                type="number"
                leftAddon="$"
                placeholder="0"
                value={acquisition?.purchase_price || ''}
                onChange={(e) => handlePriceChange(e.target.value ? Number(e.target.value) : null)}
                state={acquisition?.purchase_price_state}
                showStateSelector
                onStateChange={(state) => {
                  onChange()
                  updateAcquisition({ purchase_price_state: state })
                }}
                helperText="Enter the total agreed purchase price for the property"
              />
            </div>

            <div className="space-y-4">
              <Input
                label="Acquisition Date"
                type="date"
                value={acquisition?.acquisition_date || ''}
                onChange={(e) => {
                  onChange()
                  updateAcquisition({ acquisition_date: e.target.value })
                }}
              />

              <Select
                label="Price Derived From"
                options={[
                  { value: 'Direct input', label: 'Direct Input' },
                  { value: 'Price per SF', label: 'Price per SF' },
                  { value: 'Price per unit', label: 'Price per Unit' },
                  { value: 'Cap rate on T12 NOI', label: 'Cap Rate on T12 NOI' },
                  { value: 'Cap rate on Year 1 NOI', label: 'Cap Rate on Year 1 NOI' },
                ]}
                value={acquisition?.derived_from || 'Direct input'}
                onChange={(e) => {
                  onChange()
                  updateAcquisition({ derived_from: e.target.value as never })
                }}
              />
            </div>
          </div>

          {/* Calculated Metrics */}
          {acquisition?.purchase_price && (
            <div className="mt-6 p-4 rounded-lg bg-slate-800/50 border border-slate-700">
              <h4 className="text-sm font-medium text-slate-300 mb-3">Calculated Metrics</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-slate-400">Price per SF</p>
                  <p className="text-lg font-semibold text-white">
                    ${pricePerSF.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                  </p>
                </div>
                {property?.sizing?.units && (
                  <div>
                    <p className="text-xs text-slate-400">Price per Unit</p>
                    <p className="text-lg font-semibold text-white">
                      ${(acquisition.purchase_price / property.sizing.units).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Calculator Helper */}
          <div className="mt-6 p-4 rounded-lg bg-blue-500/10 border border-blue-500/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Calculator className="w-5 h-5 text-blue-400" />
                <div>
                  <p className="text-sm text-blue-300 font-medium">Need help calculating?</p>
                  <p className="text-xs text-blue-400/80">Use our cap rate calculator to derive price from NOI</p>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setShowCalculator(!showCalculator)}
              >
                {showCalculator ? 'Hide' : 'Show'} Calculator
              </Button>
            </div>
            
            {showCalculator && (
              <div className="mt-4 pt-4 border-t border-blue-500/30">
                <div className="grid grid-cols-3 gap-4">
                  <Input
                    label="NOI"
                    type="number"
                    leftAddon="$"
                    placeholder="0"
                    value={acquisition?.noi_used || ''}
                    onChange={(e) => {
                      onChange()
                      updateAcquisition({ noi_used: e.target.value ? Number(e.target.value) : null })
                    }}
                  />
                  <Input
                    label="Cap Rate"
                    type="number"
                    rightAddon="%"
                    placeholder="0.00"
                    value={acquisition?.applied_cap_rate || ''}
                    onChange={(e) => {
                      onChange()
                      updateAcquisition({ applied_cap_rate: e.target.value ? Number(e.target.value) : null })
                    }}
                  />
                  <div className="flex items-end">
                    <Button
                      variant="secondary"
                      className="w-full"
                      onClick={() => {
                        if (acquisition?.noi_used && acquisition?.applied_cap_rate) {
                          const calculatedPrice = acquisition.noi_used / (acquisition.applied_cap_rate / 100)
                          handlePriceChange(Math.round(calculatedPrice))
                        }
                      }}
                    >
                      Calculate Price
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Closing Costs */}
      <Card variant="elevated">
        <CardHeader 
          action={
            <Button variant="secondary" size="sm" leftIcon={<Plus className="w-4 h-4" />} onClick={addClosingCost}>
              Add Cost
            </Button>
          }
        >
          <CardTitle subtitle="Itemized transaction costs">
            Closing Costs
          </CardTitle>
        </CardHeader>
        <CardContent>
          {(acquisition?.closing_costs?.length || 0) === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <p className="mb-4">No closing costs added yet</p>
              <Button variant="secondary" leftIcon={<Plus className="w-4 h-4" />} onClick={addClosingCost}>
                Add Closing Cost
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {acquisition?.closing_costs?.map((item) => (
                <div key={item.id} className="flex items-center gap-4 p-4 rounded-lg bg-slate-800/50 border border-slate-700">
                  <div className="flex-1 grid grid-cols-3 gap-4">
                    <Select
                      options={closingCostCategories.map(c => ({ value: c, label: c }))}
                      value={item.category}
                      onChange={(e) => updateClosingCost(item.id, { category: e.target.value })}
                      placeholder="Category"
                    />
                    <Input
                      placeholder="Description"
                      value={item.description}
                      onChange={(e) => updateClosingCost(item.id, { description: e.target.value })}
                    />
                    <Input
                      type="number"
                      leftAddon="$"
                      placeholder="0"
                      value={item.amount || ''}
                      onChange={(e) => updateClosingCost(item.id, { amount: e.target.value ? Number(e.target.value) : 0 })}
                    />
                  </div>
                  <button
                    onClick={() => removeClosingCost(item.id)}
                    className="p-2 text-slate-400 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              
              <div className="flex justify-end pt-4 border-t border-slate-700">
                <div className="text-right">
                  <p className="text-sm text-slate-400">Total Closing Costs</p>
                  <p className="text-xl font-bold text-white">
                    ${closingCostsTotal.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Immediate Capital */}
      <Card variant="elevated">
        <CardHeader 
          action={
            <Button variant="secondary" size="sm" leftIcon={<Plus className="w-4 h-4" />} onClick={addImmediateCapital}>
              Add Item
            </Button>
          }
        >
          <CardTitle subtitle="Day-one capital requirements beyond closing costs">
            Immediate Capital Needs
          </CardTitle>
        </CardHeader>
        <CardContent>
          {(acquisition?.immediate_capital?.length || 0) === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <p className="mb-4">No immediate capital needs added</p>
              <Button variant="secondary" leftIcon={<Plus className="w-4 h-4" />} onClick={addImmediateCapital}>
                Add Capital Need
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {acquisition?.immediate_capital?.map((item) => (
                <div key={item.id} className="flex items-center gap-4 p-4 rounded-lg bg-slate-800/50 border border-slate-700">
                  <div className="flex-1 grid grid-cols-3 gap-4">
                    <Select
                      options={immediateCapitalCategories.map(c => ({ value: c, label: c }))}
                      value={item.category}
                      onChange={(e) => updateImmediateCapital(item.id, { category: e.target.value })}
                      placeholder="Category"
                    />
                    <Input
                      placeholder="Description"
                      value={item.description}
                      onChange={(e) => updateImmediateCapital(item.id, { description: e.target.value })}
                    />
                    <Input
                      type="number"
                      leftAddon="$"
                      placeholder="0"
                      value={item.amount || ''}
                      onChange={(e) => updateImmediateCapital(item.id, { amount: e.target.value ? Number(e.target.value) : 0 })}
                    />
                  </div>
                  <button
                    onClick={() => removeImmediateCapital(item.id)}
                    className="p-2 text-slate-400 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              
              <div className="flex justify-end pt-4 border-t border-slate-700">
                <div className="text-right">
                  <p className="text-sm text-slate-400">Total Immediate Capital</p>
                  <p className="text-xl font-bold text-white">
                    ${immediateCapitalTotal.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Total Basis Summary */}
      <Card variant="elevated" className="bg-gradient-to-r from-emerald-500/10 to-blue-500/10 border-emerald-500/30">
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-white mb-1">Total Project Cost</h3>
              <p className="text-sm text-slate-400">Purchase Price + Closing Costs + Immediate Capital</p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-white">
                ${totalBasis.toLocaleString()}
              </p>
              {rentableSF > 0 && (
                <p className="text-sm text-slate-400">
                  ${(totalBasis / rentableSF).toFixed(2)} per SF
                </p>
              )}
            </div>
          </div>
          
          <div className="mt-4 grid grid-cols-3 gap-4 pt-4 border-t border-slate-700/50">
            <div>
              <p className="text-xs text-slate-400">Purchase Price</p>
              <p className="text-lg font-semibold text-white">${(acquisition?.purchase_price || 0).toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400">Closing Costs</p>
              <p className="text-lg font-semibold text-white">${closingCostsTotal.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400">Immediate Capital</p>
              <p className="text-lg font-semibold text-white">${immediateCapitalTotal.toLocaleString()}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

