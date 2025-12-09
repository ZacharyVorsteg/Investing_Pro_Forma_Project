import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Building2, 
  ArrowRight, 
  Warehouse, 
  Building, 
  ShoppingBag, 
  Home, 
  Box,
  Hotel,
  Trees,
  HardHat,
  Shapes
} from 'lucide-react'
import { Button, Card, Input } from '../components/ui'
import { useProjectStore } from '../store/projectStore'
import type { PropertyType, AnalysisType } from '../types'

const propertyTypes: { type: PropertyType; icon: React.ReactNode; category: string }[] = [
  { type: 'Industrial - Warehouse/Distribution', icon: <Warehouse />, category: 'Industrial' },
  { type: 'Industrial - Flex', icon: <Warehouse />, category: 'Industrial' },
  { type: 'Industrial - Manufacturing', icon: <Warehouse />, category: 'Industrial' },
  { type: 'Office - CBD', icon: <Building />, category: 'Office' },
  { type: 'Office - Suburban', icon: <Building />, category: 'Office' },
  { type: 'Office - Medical', icon: <Building />, category: 'Office' },
  { type: 'Retail - Strip Center', icon: <ShoppingBag />, category: 'Retail' },
  { type: 'Retail - Single Tenant (NNN)', icon: <ShoppingBag />, category: 'Retail' },
  { type: 'Retail - Anchored Center', icon: <ShoppingBag />, category: 'Retail' },
  { type: 'Multifamily - Garden', icon: <Home />, category: 'Multifamily' },
  { type: 'Multifamily - Mid-Rise', icon: <Home />, category: 'Multifamily' },
  { type: 'Multifamily - High-Rise', icon: <Home />, category: 'Multifamily' },
  { type: 'Mixed-Use', icon: <Shapes />, category: 'Other' },
  { type: 'Self-Storage', icon: <Box />, category: 'Other' },
  { type: 'Mobile Home Park', icon: <Home />, category: 'Other' },
  { type: 'Hotel/Hospitality', icon: <Hotel />, category: 'Other' },
  { type: 'Senior Housing', icon: <Home />, category: 'Other' },
  { type: 'Student Housing', icon: <Home />, category: 'Other' },
  { type: 'Land - Entitled', icon: <Trees />, category: 'Land' },
  { type: 'Land - Raw', icon: <Trees />, category: 'Land' },
  { type: 'Development - Ground Up', icon: <HardHat />, category: 'Development' },
  { type: 'Special Purpose', icon: <Building2 />, category: 'Other' },
  { type: 'Other', icon: <Building2 />, category: 'Other' },
]

const analysisTypes: { type: AnalysisType; description: string }[] = [
  { type: 'Acquisition', description: 'Analyze a potential property purchase' },
  { type: 'Refinance', description: 'Model refinancing existing debt' },
  { type: 'Development', description: 'Ground-up or major redevelopment' },
  { type: 'Value-Add', description: 'Improve NOI through capital investment' },
  { type: 'Hold Period Analysis', description: 'Analyze existing asset performance' },
  { type: 'Disposition Analysis', description: 'Model potential sale scenarios' },
]

export const NewProjectPage: React.FC = () => {
  const [step, setStep] = useState(1)
  const [projectName, setProjectName] = useState('')
  const [selectedType, setSelectedType] = useState<PropertyType | null>(null)
  const [selectedAnalysis, setSelectedAnalysis] = useState<AnalysisType>('Acquisition')
  const [isCreating, setIsCreating] = useState(false)
  
  const { createProject } = useProjectStore()
  const navigate = useNavigate()

  const categories = [...new Set(propertyTypes.map(p => p.category))]

  const handleCreate = async () => {
    if (!projectName.trim()) return
    
    setIsCreating(true)
    try {
      const project = await createProject(projectName, selectedType || undefined)
      navigate(`/projects/${project.id}`)
    } catch {
      setIsCreating(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      {/* Progress Steps */}
      <div className="flex items-center justify-center gap-4 mb-12">
        {[1, 2, 3].map((s) => (
          <React.Fragment key={s}>
            <div className={`
              w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all
              ${step >= s 
                ? 'bg-emerald-500 text-white' 
                : 'bg-slate-700 text-slate-400'}
            `}>
              {s}
            </div>
            {s < 3 && (
              <div className={`w-16 h-1 rounded-full transition-all ${
                step > s ? 'bg-emerald-500' : 'bg-slate-700'
              }`} />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Step 1: Project Name */}
      {step === 1 && (
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-4">Name Your Analysis</h1>
          <p className="text-slate-400 mb-8">
            Give your project a descriptive name to identify it later
          </p>
          
          <Card variant="elevated" className="max-w-md mx-auto">
            <Input
              label="Project Name"
              placeholder="e.g., 123 Industrial Blvd Acquisition"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              helperText="Use the property address or a memorable name"
              autoFocus
            />
            
            <div className="mt-6 flex justify-end">
              <Button
                onClick={() => setStep(2)}
                disabled={!projectName.trim()}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Continue
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Step 2: Property Type */}
      {step === 2 && (
        <div>
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-4">Select Property Type</h1>
            <p className="text-slate-400">
              This determines which fields and metrics are most relevant
            </p>
          </div>

          <div className="space-y-8">
            {categories.map((category) => (
              <div key={category}>
                <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">
                  {category}
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {propertyTypes
                    .filter(p => p.category === category)
                    .map(({ type, icon }) => (
                      <button
                        key={type}
                        onClick={() => setSelectedType(type)}
                        className={`
                          flex items-center gap-3 p-4 rounded-xl border transition-all text-left
                          ${selectedType === type
                            ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                            : 'bg-slate-800/50 border-slate-700 text-slate-300 hover:border-slate-600'}
                        `}
                      >
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          selectedType === type ? 'bg-emerald-500/30' : 'bg-slate-700'
                        }`}>
                          <span className="w-4 h-4">{icon}</span>
                        </div>
                        <span className="text-sm font-medium">{type.split(' - ')[1] || type}</span>
                      </button>
                    ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 flex justify-between">
            <Button variant="ghost" onClick={() => setStep(1)}>
              Back
            </Button>
            <Button
              onClick={() => setStep(3)}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              {selectedType ? 'Continue' : 'Skip for Now'}
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: Analysis Type */}
      {step === 3 && (
        <div>
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-4">Analysis Type</h1>
            <p className="text-slate-400">
              What type of investment scenario are you modeling?
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
            {analysisTypes.map(({ type, description }) => (
              <button
                key={type}
                onClick={() => setSelectedAnalysis(type)}
                className={`
                  p-6 rounded-xl border text-left transition-all
                  ${selectedAnalysis === type
                    ? 'bg-emerald-500/20 border-emerald-500'
                    : 'bg-slate-800/50 border-slate-700 hover:border-slate-600'}
                `}
              >
                <h3 className={`font-semibold mb-1 ${
                  selectedAnalysis === type ? 'text-emerald-400' : 'text-white'
                }`}>
                  {type}
                </h3>
                <p className="text-sm text-slate-400">{description}</p>
              </button>
            ))}
          </div>

          <div className="mt-8 flex justify-between">
            <Button variant="ghost" onClick={() => setStep(2)}>
              Back
            </Button>
            <Button
              onClick={handleCreate}
              isLoading={isCreating}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Create Project
            </Button>
          </div>
        </div>
      )}

      {/* Summary Footer */}
      <div className="mt-12 p-4 rounded-xl bg-slate-800/50 border border-slate-700">
        <div className="flex items-center justify-between text-sm">
          <div>
            <span className="text-slate-400">Project: </span>
            <span className="text-white font-medium">{projectName || '—'}</span>
          </div>
          <div>
            <span className="text-slate-400">Type: </span>
            <span className="text-white font-medium">{selectedType || 'Not selected'}</span>
          </div>
          <div>
            <span className="text-slate-400">Analysis: </span>
            <span className="text-white font-medium">{selectedAnalysis}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

