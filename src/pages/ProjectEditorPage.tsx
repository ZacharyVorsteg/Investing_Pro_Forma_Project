import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { 
  Building2, 
  DollarSign, 
  CreditCard, 
  BarChart3, 
  Receipt,
  Hammer,
  TrendingUp,
  LogOut,
  Save,
  FileDown,
  ChevronLeft,
  AlertTriangle,
  Check
} from 'lucide-react'
import { Button, Card, ProgressBar, Tabs, TabsList, TabTrigger, TabContent } from '../components/ui'
import { useProjectStore } from '../store/projectStore'

// Section Components
import { PropertySection } from '../components/sections/PropertySection'
import { AcquisitionSection } from '../components/sections/AcquisitionSection'
import { FinancingSection } from '../components/sections/FinancingSection'
import { IncomeSection } from '../components/sections/IncomeSection'
import { ExpensesSection } from '../components/sections/ExpensesSection'
import { CapitalSection } from '../components/sections/CapitalSection'
import { GrowthExitSection } from '../components/sections/GrowthExitSection'
import { ProFormaSection } from '../components/sections/ProFormaSection'

const sections = [
  { id: 'property', label: 'Property', icon: Building2 },
  { id: 'acquisition', label: 'Acquisition', icon: DollarSign },
  { id: 'financing', label: 'Financing', icon: CreditCard },
  { id: 'income', label: 'Income', icon: BarChart3 },
  { id: 'expenses', label: 'Expenses', icon: Receipt },
  { id: 'capital', label: 'Capital', icon: Hammer },
  { id: 'growth', label: 'Growth & Exit', icon: TrendingUp },
  { id: 'proforma', label: 'Pro Forma', icon: LogOut },
]

export const ProjectEditorPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { 
    currentProject, 
    loadProject, 
    saveProject, 
    isLoading, 
    isSaving,
    lastSaved,
    calculateCompleteness 
  } = useProjectStore()
  
  const [, setActiveSection] = useState('property')
  const [hasChanges, setHasChanges] = useState(false)

  useEffect(() => {
    if (id) {
      loadProject(id)
    }
  }, [id, loadProject])

  useEffect(() => {
    // Auto-save every 30 seconds if there are changes
    const interval = setInterval(() => {
      if (hasChanges && currentProject) {
        saveProject()
        setHasChanges(false)
      }
    }, 30000)

    return () => clearInterval(interval)
  }, [hasChanges, currentProject, saveProject])

  const handleSave = async () => {
    await saveProject()
    setHasChanges(false)
  }

  if (isLoading || !currentProject) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading project...</p>
        </div>
      </div>
    )
  }

  const completeness = calculateCompleteness()

  return (
    <div className="max-w-7xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/projects')}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white">{currentProject.name}</h1>
            <p className="text-slate-400 text-sm">
              {currentProject.property_type || 'No property type'} • 
              {currentProject.analysis?.analysis_type || 'Acquisition'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {hasChanges && (
            <span className="flex items-center gap-1.5 text-amber-400 text-sm">
              <AlertTriangle className="w-4 h-4" />
              Unsaved changes
            </span>
          )}
          {lastSaved && !hasChanges && (
            <span className="flex items-center gap-1.5 text-emerald-400 text-sm">
              <Check className="w-4 h-4" />
              Saved
            </span>
          )}
          
          <Button 
            variant="secondary" 
            leftIcon={<FileDown className="w-4 h-4" />}
          >
            Export
          </Button>
          <Button 
            onClick={handleSave}
            isLoading={isSaving}
            leftIcon={<Save className="w-4 h-4" />}
          >
            Save
          </Button>
        </div>
      </div>

      {/* Completeness Bar */}
      <Card variant="elevated" padding="md" className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-slate-300">Model Completeness</span>
          <span className="text-sm font-bold text-white">{completeness}%</span>
        </div>
        <ProgressBar value={completeness} showLabel={false} size="md" />
        {completeness < 100 && (
          <p className="text-xs text-slate-400 mt-2">
            Complete all required fields for accurate returns calculation
          </p>
        )}
      </Card>

      {/* Section Tabs */}
      <Tabs defaultTab="property" onChange={setActiveSection}>
        <Card variant="elevated" padding="sm" className="mb-6">
          <TabsList className="flex-wrap">
            {sections.map(({ id, label, icon: Icon }) => (
              <TabTrigger key={id} value={id} icon={<Icon className="w-4 h-4" />}>
                {label}
              </TabTrigger>
            ))}
          </TabsList>
        </Card>

        <TabContent value="property">
          <PropertySection onChange={() => setHasChanges(true)} />
        </TabContent>
        
        <TabContent value="acquisition">
          <AcquisitionSection onChange={() => setHasChanges(true)} />
        </TabContent>
        
        <TabContent value="financing">
          <FinancingSection onChange={() => setHasChanges(true)} />
        </TabContent>
        
        <TabContent value="income">
          <IncomeSection onChange={() => setHasChanges(true)} />
        </TabContent>
        
        <TabContent value="expenses">
          <ExpensesSection onChange={() => setHasChanges(true)} />
        </TabContent>
        
        <TabContent value="capital">
          <CapitalSection onChange={() => setHasChanges(true)} />
        </TabContent>
        
        <TabContent value="growth">
          <GrowthExitSection onChange={() => setHasChanges(true)} />
        </TabContent>
        
        <TabContent value="proforma">
          <ProFormaSection />
        </TabContent>
      </Tabs>
    </div>
  )
}

