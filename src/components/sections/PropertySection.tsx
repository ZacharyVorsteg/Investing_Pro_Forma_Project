import React from 'react'
import { MapPin, Ruler, Calendar, HelpCircle } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent, Input, Select } from '../ui'
import { useProjectStore } from '../../store/projectStore'
import type { PropertyType } from '../../types'

const propertyTypeOptions: { value: PropertyType; label: string }[] = [
  { value: 'Industrial - Warehouse/Distribution', label: 'Industrial - Warehouse/Distribution' },
  { value: 'Industrial - Flex', label: 'Industrial - Flex' },
  { value: 'Industrial - Manufacturing', label: 'Industrial - Manufacturing' },
  { value: 'Office - CBD', label: 'Office - CBD' },
  { value: 'Office - Suburban', label: 'Office - Suburban' },
  { value: 'Office - Medical', label: 'Office - Medical' },
  { value: 'Retail - Strip Center', label: 'Retail - Strip Center' },
  { value: 'Retail - Single Tenant (NNN)', label: 'Retail - Single Tenant (NNN)' },
  { value: 'Retail - Anchored Center', label: 'Retail - Anchored Center' },
  { value: 'Multifamily - Garden', label: 'Multifamily - Garden' },
  { value: 'Multifamily - Mid-Rise', label: 'Multifamily - Mid-Rise' },
  { value: 'Multifamily - High-Rise', label: 'Multifamily - High-Rise' },
  { value: 'Mixed-Use', label: 'Mixed-Use' },
  { value: 'Self-Storage', label: 'Self-Storage' },
  { value: 'Mobile Home Park', label: 'Mobile Home Park' },
  { value: 'Hotel/Hospitality', label: 'Hotel/Hospitality' },
  { value: 'Other', label: 'Other' },
]

interface PropertySectionProps {
  onChange: () => void
}

export const PropertySection: React.FC<PropertySectionProps> = ({ onChange }) => {
  const { currentProject, updateProject, updateProperty, updateAnalysis } = useProjectStore()
  
  if (!currentProject) return null

  const property = currentProject.property
  const analysis = currentProject.analysis
  const propertyType = currentProject.property_type

  const isIndustrial = propertyType?.includes('Industrial')
  const isMultifamily = propertyType?.includes('Multifamily') || propertyType === 'Mobile Home Park'
  const isOffice = propertyType?.includes('Office')

  const handlePropertyChange = (field: string, value: unknown) => {
    onChange()
    if (field.includes('.')) {
      const [parent, child] = field.split('.')
      const currentValue = property?.[parent as keyof typeof property] || {}
      updateProperty({
        [parent]: {
          ...(typeof currentValue === 'object' ? currentValue : {}),
          [child]: value
        }
      })
    } else {
      updateProperty({ [field]: value })
    }
  }

  return (
    <div className="space-y-6">
      {/* Property Type & Analysis */}
      <Card variant="elevated">
        <CardHeader>
          <CardTitle subtitle="Define your property and analysis type">
            Property Classification
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Select
              label="Property Type"
              options={propertyTypeOptions}
              value={propertyType || ''}
              onChange={(e) => {
                onChange()
                updateProject({ property_type: e.target.value as PropertyType })
              }}
              helperText="Determines which fields and metrics are shown"
            />
            
            <Select
              label="Analysis Type"
              options={[
                { value: 'Acquisition', label: 'Acquisition' },
                { value: 'Refinance', label: 'Refinance' },
                { value: 'Development', label: 'Development' },
                { value: 'Value-Add', label: 'Value-Add' },
                { value: 'Hold Period Analysis', label: 'Hold Period Analysis' },
                { value: 'Disposition Analysis', label: 'Disposition Analysis' },
              ]}
              value={analysis?.analysis_type || 'Acquisition'}
              onChange={(e) => {
                onChange()
                updateAnalysis({ analysis_type: e.target.value as never })
              }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Address */}
      <Card variant="elevated">
        <CardHeader>
          <CardTitle 
            subtitle="Property location details"
          >
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-emerald-400" />
              Address
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Input
              label="Street Address"
              placeholder="123 Main Street"
              value={property?.address?.street || ''}
              onChange={(e) => handlePropertyChange('address.street', e.target.value)}
            />
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Input
                label="City"
                placeholder="City"
                value={property?.address?.city || ''}
                onChange={(e) => handlePropertyChange('address.city', e.target.value)}
              />
              <Input
                label="State"
                placeholder="State"
                value={property?.address?.state || ''}
                onChange={(e) => handlePropertyChange('address.state', e.target.value)}
              />
              <Input
                label="ZIP Code"
                placeholder="12345"
                value={property?.address?.zip || ''}
                onChange={(e) => handlePropertyChange('address.zip', e.target.value)}
              />
              <Input
                label="County"
                placeholder="County"
                value={property?.address?.county || ''}
                onChange={(e) => handlePropertyChange('address.county', e.target.value)}
                hint="Important for property tax calculations"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Building Size */}
      <Card variant="elevated">
        <CardHeader>
          <CardTitle subtitle="Square footage and dimensions">
            <div className="flex items-center gap-2">
              <Ruler className="w-5 h-5 text-emerald-400" />
              Property Sizing
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Input
              label="Gross Building SF"
              type="number"
              placeholder="0"
              rightAddon="SF"
              value={property?.sizing?.gross_building_sf || ''}
              onChange={(e) => handlePropertyChange('sizing.gross_building_sf', e.target.value ? Number(e.target.value) : null)}
            />
            <Input
              label="Rentable SF"
              type="number"
              placeholder="0"
              rightAddon="SF"
              value={property?.sizing?.rentable_sf || ''}
              onChange={(e) => handlePropertyChange('sizing.rentable_sf', e.target.value ? Number(e.target.value) : null)}
            />
            <Input
              label="Land Size"
              type="number"
              placeholder="0"
              rightAddon="Acres"
              value={property?.sizing?.land_acres || ''}
              onChange={(e) => handlePropertyChange('sizing.land_acres', e.target.value ? Number(e.target.value) : null)}
            />
          </div>

          {/* Conditional Fields based on property type */}
          {isMultifamily && (
            <div className="mt-6 pt-6 border-t border-slate-700">
              <h4 className="text-sm font-medium text-slate-300 mb-4">Multifamily Details</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Input
                  label="Total Units"
                  type="number"
                  placeholder="0"
                  value={property?.sizing?.units || ''}
                  onChange={(e) => handlePropertyChange('sizing.units', e.target.value ? Number(e.target.value) : null)}
                />
                <Input
                  label="Floors"
                  type="number"
                  placeholder="0"
                  value={property?.sizing?.floors || ''}
                  onChange={(e) => handlePropertyChange('sizing.floors', e.target.value ? Number(e.target.value) : null)}
                />
              </div>
            </div>
          )}

          {isIndustrial && (
            <div className="mt-6 pt-6 border-t border-slate-700">
              <h4 className="text-sm font-medium text-slate-300 mb-4">Industrial Details</h4>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Input
                  label="Clear Height"
                  type="number"
                  placeholder="0"
                  rightAddon="ft"
                  value={property?.sizing?.clear_height_ft || ''}
                  onChange={(e) => handlePropertyChange('sizing.clear_height_ft', e.target.value ? Number(e.target.value) : null)}
                />
                <Input
                  label="Dock Doors"
                  type="number"
                  placeholder="0"
                  value={property?.sizing?.dock_doors || ''}
                  onChange={(e) => handlePropertyChange('sizing.dock_doors', e.target.value ? Number(e.target.value) : null)}
                />
                <Input
                  label="Drive-In Doors"
                  type="number"
                  placeholder="0"
                  value={property?.sizing?.drive_in_doors || ''}
                  onChange={(e) => handlePropertyChange('sizing.drive_in_doors', e.target.value ? Number(e.target.value) : null)}
                />
              </div>
            </div>
          )}

          {(isOffice || !isMultifamily) && (
            <div className="mt-6 pt-6 border-t border-slate-700">
              <h4 className="text-sm font-medium text-slate-300 mb-4">Parking</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Parking Spaces"
                  type="number"
                  placeholder="0"
                  value={property?.sizing?.parking_spaces || ''}
                  onChange={(e) => handlePropertyChange('sizing.parking_spaces', e.target.value ? Number(e.target.value) : null)}
                />
                <Input
                  label="Parking Ratio"
                  type="number"
                  placeholder="0.00"
                  rightAddon="per 1,000 SF"
                  value={property?.sizing?.parking_ratio || ''}
                  onChange={(e) => handlePropertyChange('sizing.parking_ratio', e.target.value ? Number(e.target.value) : null)}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Building Age & Analysis Period */}
      <Card variant="elevated">
        <CardHeader>
          <CardTitle subtitle="Construction date and analysis timeline">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-emerald-400" />
              Timeline
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Input
              label="Year Built"
              type="number"
              placeholder="1990"
              value={property?.year_built || ''}
              onChange={(e) => handlePropertyChange('year_built', e.target.value ? Number(e.target.value) : null)}
            />
            <Input
              label="Year Renovated"
              type="number"
              placeholder="Optional"
              value={property?.year_renovated || ''}
              onChange={(e) => handlePropertyChange('year_renovated', e.target.value ? Number(e.target.value) : null)}
            />
            <Input
              label="Hold Period"
              type="number"
              placeholder="5"
              rightAddon="years"
              value={analysis?.hold_period_years || ''}
              onChange={(e) => {
                onChange()
                updateAnalysis({ hold_period_years: e.target.value ? Number(e.target.value) : 5 })
              }}
              helperText="1-50 years supported"
            />
            <Input
              label="Analysis Start Date"
              type="date"
              value={property?.analysis_start_date || ''}
              onChange={(e) => handlePropertyChange('analysis_start_date', e.target.value)}
            />
          </div>

          <div className="mt-6 p-4 rounded-lg bg-blue-500/10 border border-blue-500/30">
            <div className="flex items-start gap-3">
              <HelpCircle className="w-5 h-5 text-blue-400 mt-0.5" />
              <div>
                <p className="text-sm text-blue-300 font-medium">Hold Period Flexibility</p>
                <p className="text-sm text-blue-400/80 mt-1">
                  You can model any hold period from 1 to 50 years. Choose annual, quarterly, 
                  or monthly granularity based on your analysis needs.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

