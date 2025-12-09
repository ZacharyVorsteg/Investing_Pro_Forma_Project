import React from 'react'
import { Receipt, HelpCircle } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent, Input, Select } from '../ui'
import { useProjectStore } from '../../store/projectStore'
import type { OperatingExpenses } from '../../types'

interface ExpensesSectionProps {
  onChange: () => void
}

export const ExpensesSection: React.FC<ExpensesSectionProps> = ({ onChange }) => {
  const { currentProject, updateExpenses } = useProjectStore()
  
  if (!currentProject) return null

  const expenses = currentProject.expenses
  const property = currentProject.property

  // Calculate total expenses
  const calculateTotal = () => {
    let total = 0
    total += expenses?.real_estate_taxes?.amount || 0
    total += expenses?.insurance?.amount || 0
    total += (expenses?.utilities?.electric?.amount || 0) + 
             (expenses?.utilities?.gas?.amount || 0) + 
             (expenses?.utilities?.water_sewer?.amount || 0) + 
             (expenses?.utilities?.trash?.amount || 0)
    total += expenses?.repairs_maintenance?.amount || 0
    total += expenses?.grounds_exterior?.amount || 0
    total += expenses?.cleaning?.amount || 0
    total += expenses?.security?.amount || 0
    total += expenses?.administrative?.amount || 0
    total += expenses?.marketing_leasing?.amount || 0
    return total
  }

  const totalExpenses = calculateTotal()

  const updateExpenseCategory = (category: string, field: string, value: unknown) => {
    onChange()
    const expensesObj = expenses as unknown as Record<string, Record<string, unknown>>
    const current = expensesObj?.[category] || {}
    updateExpenses({ 
      [category]: { 
        ...current, 
        [field]: value 
      } 
    } as Partial<OperatingExpenses>)
  }

  const updateUtility = (utility: string, field: string, value: unknown) => {
    onChange()
    const current = expenses?.utilities?.[utility as keyof typeof expenses.utilities] || {}
    updateExpenses({
      utilities: {
        ...expenses?.utilities,
        [utility]: {
          ...(typeof current === 'object' ? current : {}),
          [field]: value
        }
      }
    })
  }

  return (
    <div className="space-y-6">
      {/* Entry Method */}
      <Card variant="elevated">
        <CardHeader>
          <CardTitle subtitle="How would you like to enter expenses?">
            <div className="flex items-center gap-2">
              <Receipt className="w-5 h-5 text-emerald-400" />
              Expense Entry Method
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {['Category by category', 'Bulk entry from T12', 'Per SF estimate', 'Per unit estimate'].map((method) => (
              <button
                key={method}
                onClick={() => {
                  onChange()
                  updateExpenses({ entry_method: method as never })
                }}
                className={`
                  p-4 rounded-xl border text-sm font-medium transition-all
                  ${expenses?.entry_method === method
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

      {/* Real Estate Taxes */}
      <Card variant="elevated">
        <CardHeader>
          <CardTitle subtitle="Annual property tax expense">
            Real Estate Taxes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Input
              label="Annual Property Taxes"
              type="number"
              leftAddon="$"
              placeholder="0"
              value={expenses?.real_estate_taxes?.amount || ''}
              onChange={(e) => updateExpenseCategory('real_estate_taxes', 'amount', e.target.value ? Number(e.target.value) : null)}
              state={expenses?.real_estate_taxes?.state}
              showStateSelector
              onStateChange={(state) => updateExpenseCategory('real_estate_taxes', 'state', state)}
              helperText="Check county assessor's website or ask seller for current tax bill"
            />
            <Input
              label="Annual Growth Rate"
              type="number"
              rightAddon="%"
              placeholder="2.5"
              value={expenses?.real_estate_taxes?.growth_rate || ''}
              onChange={(e) => updateExpenseCategory('real_estate_taxes', 'growth_rate', e.target.value ? Number(e.target.value) : null)}
            />
            <Input
              label="Recoverable %"
              type="number"
              rightAddon="%"
              placeholder="100"
              value={expenses?.real_estate_taxes?.recoverable_pct || ''}
              onChange={(e) => updateExpenseCategory('real_estate_taxes', 'recoverable_pct', e.target.value ? Number(e.target.value) : null)}
              helperText="% passed through to NNN tenants"
            />
          </div>

          {/* Tax Calculator Helper */}
          <div className="mt-6 p-4 rounded-lg bg-blue-500/10 border border-blue-500/30">
            <div className="flex items-start gap-3">
              <HelpCircle className="w-5 h-5 text-blue-400 mt-0.5" />
              <div>
                <p className="text-sm text-blue-300 font-medium">Reassessment Risk</p>
                <p className="text-xs text-blue-400/80 mt-1">
                  Properties are often reassessed upon sale. Consider whether current taxes reflect 
                  post-acquisition assessed value or if you need to model an increase.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Insurance */}
      <Card variant="elevated">
        <CardHeader>
          <CardTitle subtitle="Property and liability insurance">
            Insurance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Input
              label="Total Insurance (Annual)"
              type="number"
              leftAddon="$"
              placeholder="0"
              value={expenses?.insurance?.amount || ''}
              onChange={(e) => updateExpenseCategory('insurance', 'amount', e.target.value ? Number(e.target.value) : null)}
              state={expenses?.insurance?.state}
              showStateSelector
              onStateChange={(state) => updateExpenseCategory('insurance', 'state', state)}
            />
            <Input
              label="Annual Growth Rate"
              type="number"
              rightAddon="%"
              placeholder="5.0"
              value={expenses?.insurance?.growth_rate || ''}
              onChange={(e) => updateExpenseCategory('insurance', 'growth_rate', e.target.value ? Number(e.target.value) : null)}
            />
            <Input
              label="Recoverable %"
              type="number"
              rightAddon="%"
              placeholder="100"
              value={expenses?.insurance?.recoverable_pct || ''}
              onChange={(e) => updateExpenseCategory('insurance', 'recoverable_pct', e.target.value ? Number(e.target.value) : null)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Utilities */}
      <Card variant="elevated">
        <CardHeader>
          <CardTitle subtitle="Landlord-paid utility costs">
            Utilities
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Electric (Annual)"
              type="number"
              leftAddon="$"
              placeholder="0"
              value={expenses?.utilities?.electric?.amount || ''}
              onChange={(e) => updateUtility('electric', 'amount', e.target.value ? Number(e.target.value) : null)}
            />
            <Input
              label="Gas (Annual)"
              type="number"
              leftAddon="$"
              placeholder="0"
              value={expenses?.utilities?.gas?.amount || ''}
              onChange={(e) => updateUtility('gas', 'amount', e.target.value ? Number(e.target.value) : null)}
            />
            <Input
              label="Water/Sewer (Annual)"
              type="number"
              leftAddon="$"
              placeholder="0"
              value={expenses?.utilities?.water_sewer?.amount || ''}
              onChange={(e) => updateUtility('water_sewer', 'amount', e.target.value ? Number(e.target.value) : null)}
            />
            <Input
              label="Trash/Recycling (Annual)"
              type="number"
              leftAddon="$"
              placeholder="0"
              value={expenses?.utilities?.trash?.amount || ''}
              onChange={(e) => updateUtility('trash', 'amount', e.target.value ? Number(e.target.value) : null)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Repairs & Maintenance */}
      <Card variant="elevated">
        <CardHeader>
          <CardTitle subtitle="Ongoing repairs and maintenance costs">
            Repairs & Maintenance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Input
              label="Total R&M (Annual)"
              type="number"
              leftAddon="$"
              placeholder="0"
              value={expenses?.repairs_maintenance?.amount || ''}
              onChange={(e) => updateExpenseCategory('repairs_maintenance', 'amount', e.target.value ? Number(e.target.value) : null)}
              state={expenses?.repairs_maintenance?.state}
              showStateSelector
              onStateChange={(state) => updateExpenseCategory('repairs_maintenance', 'state', state)}
            />
            <Input
              label="Annual Growth Rate"
              type="number"
              rightAddon="%"
              placeholder="3.0"
              value={expenses?.repairs_maintenance?.growth_rate || ''}
              onChange={(e) => updateExpenseCategory('repairs_maintenance', 'growth_rate', e.target.value ? Number(e.target.value) : null)}
            />
            <Input
              label="Recoverable %"
              type="number"
              rightAddon="%"
              placeholder="0"
              value={expenses?.repairs_maintenance?.recoverable_pct || ''}
              onChange={(e) => updateExpenseCategory('repairs_maintenance', 'recoverable_pct', e.target.value ? Number(e.target.value) : null)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Management */}
      <Card variant="elevated">
        <CardHeader>
          <CardTitle subtitle="Property and asset management costs">
            Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Select
              label="Fee Type"
              options={[
                { value: 'Percentage of EGI', label: 'Percentage of EGI' },
                { value: 'Flat Monthly', label: 'Flat Monthly' },
                { value: 'Flat Annual', label: 'Flat Annual' },
              ]}
              value={expenses?.management?.fee_type || 'Percentage of EGI'}
              onChange={(e) => {
                onChange()
                updateExpenses({
                  management: {
                    ...expenses?.management,
                    fee_type: e.target.value as never
                  }
                })
              }}
            />
            {expenses?.management?.fee_type === 'Percentage of EGI' ? (
              <Input
                label="Management Fee"
                type="number"
                rightAddon="%"
                placeholder="4.0"
                value={expenses?.management?.property_management_pct || ''}
                onChange={(e) => {
                  onChange()
                  updateExpenses({
                    management: {
                      ...expenses?.management,
                      property_management_pct: e.target.value ? Number(e.target.value) : null
                    }
                  })
                }}
                helperText="Typically 3-5% commercial, 5-8% multifamily"
              />
            ) : (
              <Input
                label="Management Fee"
                type="number"
                leftAddon="$"
                placeholder="0"
                value={expenses?.management?.property_management_flat || ''}
                onChange={(e) => {
                  onChange()
                  updateExpenses({
                    management: {
                      ...expenses?.management,
                      property_management_flat: e.target.value ? Number(e.target.value) : null
                    }
                  })
                }}
              />
            )}
            <Input
              label="Asset Management Fee"
              type="number"
              rightAddon="%"
              placeholder="2.0"
              value={expenses?.management?.asset_management_pct || ''}
              onChange={(e) => {
                onChange()
                updateExpenses({
                  management: {
                    ...expenses?.management,
                    asset_management_pct: e.target.value ? Number(e.target.value) : null
                  }
                })
              }}
              helperText="Fee to sponsor/GP (if applicable)"
            />
          </div>
        </CardContent>
      </Card>

      {/* Other Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card variant="elevated">
          <CardHeader>
            <CardTitle>Administrative</CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              label="Total Administrative (Annual)"
              type="number"
              leftAddon="$"
              placeholder="0"
              value={expenses?.administrative?.amount || ''}
              onChange={(e) => updateExpenseCategory('administrative', 'amount', e.target.value ? Number(e.target.value) : null)}
              helperText="Accounting, legal, licenses, professional fees"
            />
          </CardContent>
        </Card>

        <Card variant="elevated">
          <CardHeader>
            <CardTitle>Marketing & Leasing</CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              label="Total Marketing (Annual)"
              type="number"
              leftAddon="$"
              placeholder="0"
              value={expenses?.marketing_leasing?.amount || ''}
              onChange={(e) => updateExpenseCategory('marketing_leasing', 'amount', e.target.value ? Number(e.target.value) : null)}
              helperText="Advertising, signage, marketing materials"
            />
          </CardContent>
        </Card>
      </div>

      {/* Global Growth Rate */}
      <Card variant="elevated">
        <CardHeader>
          <CardTitle subtitle="Apply a single growth rate to all expenses">
            Expense Growth Assumptions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Global Expense Growth Rate"
              type="number"
              rightAddon="%"
              placeholder="3.0"
              value={expenses?.expense_growth_global || ''}
              onChange={(e) => {
                onChange()
                updateExpenses({ expense_growth_global: e.target.value ? Number(e.target.value) : null })
              }}
              helperText="Applied to all expenses unless overridden per category"
            />
          </div>
        </CardContent>
      </Card>

      {/* Expense Summary */}
      <Card variant="elevated" className="bg-gradient-to-r from-emerald-500/10 to-blue-500/10 border-emerald-500/30">
        <CardContent>
          <h3 className="text-lg font-semibold text-white mb-4">Operating Expense Summary (Year 1)</h3>
          
          <div className="space-y-2">
            <div className="flex justify-between py-2">
              <span className="text-slate-300">Real Estate Taxes</span>
              <span className="text-white">${(expenses?.real_estate_taxes?.amount || 0).toLocaleString()}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-slate-300">Insurance</span>
              <span className="text-white">${(expenses?.insurance?.amount || 0).toLocaleString()}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-slate-300">Utilities</span>
              <span className="text-white">
                ${((expenses?.utilities?.electric?.amount || 0) + 
                   (expenses?.utilities?.gas?.amount || 0) + 
                   (expenses?.utilities?.water_sewer?.amount || 0) + 
                   (expenses?.utilities?.trash?.amount || 0)).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-slate-300">Repairs & Maintenance</span>
              <span className="text-white">${(expenses?.repairs_maintenance?.amount || 0).toLocaleString()}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-slate-300">Administrative</span>
              <span className="text-white">${(expenses?.administrative?.amount || 0).toLocaleString()}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-slate-300">Marketing & Leasing</span>
              <span className="text-white">${(expenses?.marketing_leasing?.amount || 0).toLocaleString()}</span>
            </div>
            <div className="flex justify-between py-3 border-t border-slate-700">
              <span className="text-white font-semibold">Total Operating Expenses</span>
              <span className="text-red-400 font-bold text-xl">${totalExpenses.toLocaleString()}</span>
            </div>
          </div>

          {property?.sizing?.rentable_sf && totalExpenses > 0 && (
            <div className="mt-4 pt-4 border-t border-slate-700/50">
              <p className="text-sm text-slate-400">
                Expenses per SF: <span className="text-white font-medium">
                  ${(totalExpenses / property.sizing.rentable_sf).toFixed(2)}
                </span>
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

