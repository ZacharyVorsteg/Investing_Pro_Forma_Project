import { create } from 'zustand'
import { v4 as uuidv4 } from 'uuid'
import { supabase } from '../lib/supabase'
import type { 
  Project, 
  PropertyType, 
  AnalysisType,
  Acquisition,
  Financing,
  Income,
  OperatingExpenses,
  CapitalExpenditures,
  GrowthAssumptions,
  ExitAssumptions,
  Scenario
} from '../types'

interface ProjectState {
  projects: Project[]
  currentProject: Project | null
  isLoading: boolean
  isSaving: boolean
  error: string | null
  lastSaved: Date | null

  // Actions
  fetchProjects: () => Promise<void>
  createProject: (name: string, propertyType?: PropertyType) => Promise<Project>
  loadProject: (id: string) => Promise<void>
  updateProject: (updates: Partial<Project>) => void
  saveProject: () => Promise<void>
  deleteProject: (id: string) => Promise<void>
  duplicateProject: (id: string) => Promise<Project>
  
  // Section updates
  updateProperty: (data: Partial<Project['property']>) => void
  updateAnalysis: (data: Partial<Project['analysis']>) => void
  updateAcquisition: (data: Partial<Acquisition>) => void
  updateFinancing: (data: Partial<Financing>) => void
  updateIncome: (data: Partial<Income>) => void
  updateExpenses: (data: Partial<OperatingExpenses>) => void
  updateCapital: (data: Partial<CapitalExpenditures>) => void
  updateGrowth: (data: Partial<GrowthAssumptions>) => void
  updateExit: (data: Partial<ExitAssumptions>) => void
  updateScenarios: (scenarios: Scenario[]) => void
  
  clearError: () => void
  calculateCompleteness: () => number
}

const defaultProject = (): Omit<Project, 'id' | 'user_id' | 'created_at' | 'updated_at'> => ({
  name: 'Untitled Project',
  property_type: null,
  status: 'draft',
  is_template: false,
  completeness: 0,
  property: {
    address: { street: '', city: '', state: '', zip: '', county: '' },
    sizing: {
      gross_building_sf: null,
      rentable_sf: null,
      land_sf: null,
      land_acres: null,
      units: null,
      floors: null,
      clear_height_ft: null,
      dock_doors: null,
      drive_in_doors: null,
      parking_spaces: null,
      parking_ratio: null,
      far: null,
      coverage: null,
      zoning: '',
      entitlements: '',
    },
    year_built: null,
    year_renovated: null,
    analysis_start_date: new Date().toISOString().split('T')[0],
  },
  analysis: {
    hold_period_years: 5,
    hold_period_months: 0,
    granularity: 'annual',
    analysis_type: 'Acquisition' as AnalysisType,
  },
  acquisition: {
    purchase_price: null,
    purchase_price_state: 'incomplete',
    derived_from: 'Direct input',
    price_per_sf: null,
    price_per_unit: null,
    applied_cap_rate: null,
    noi_used: null,
    acquisition_date: new Date().toISOString().split('T')[0],
    closing_costs: [],
    immediate_capital: [],
  },
  financing: {
    structure_type: 'All Cash',
    debt_tranches: [],
    equity_structure_type: 'Single Investor / Self-Funded',
    equity_splits: [],
    promote_structure: [],
    fees: {
      acquisition_fee_pct: null,
      asset_management_fee_pct: null,
      disposition_fee_pct: null,
      refinance_fee_pct: null,
      construction_management_fee_pct: null,
    },
  },
  income: {
    entry_method: 'Summary Entry',
    tenants: [],
    vacant_spaces: [],
    other_income: [],
    vacancy: {
      vacancy_input_method: 'Single rate all years',
      vacancy_rate_single: null,
      vacancy_by_year: [],
      credit_loss_rate: null,
      concession_rate: null,
      average_downtime_months: null,
      vacancy_assumption_rationale: '',
    },
  },
  expenses: {
    entry_method: 'Category by category',
    real_estate_taxes: {
      amount: null,
      growth_rate: null,
      state: 'incomplete',
      recoverable_pct: null,
      notes: '',
      current_assessed_value: null,
      mill_rate: null,
      reassessment_expected: false,
      reassessment_year: null,
    },
    insurance: {
      amount: null,
      growth_rate: null,
      state: 'incomplete',
      recoverable_pct: null,
      notes: '',
      property_coverage: null,
      general_liability: null,
      flood_insurance: null,
      umbrella: null,
    },
    utilities: {
      electric: { amount: null, growth_rate: null, state: 'incomplete', recoverable_pct: null, notes: '' },
      gas: { amount: null, growth_rate: null, state: 'incomplete', recoverable_pct: null, notes: '' },
      water_sewer: { amount: null, growth_rate: null, state: 'incomplete', recoverable_pct: null, notes: '' },
      trash: { amount: null, growth_rate: null, state: 'incomplete', recoverable_pct: null, notes: '' },
    },
    repairs_maintenance: {
      amount: null,
      growth_rate: null,
      state: 'incomplete',
      recoverable_pct: null,
      notes: '',
      hvac_maintenance: null,
      elevator_maintenance: null,
      general_repairs: null,
    },
    grounds_exterior: {
      amount: null,
      growth_rate: null,
      state: 'incomplete',
      recoverable_pct: null,
      notes: '',
      landscaping: null,
      snow_removal: null,
      pest_control: null,
    },
    cleaning: {
      amount: null,
      growth_rate: null,
      state: 'incomplete',
      recoverable_pct: null,
      notes: '',
      common_area_janitorial: null,
      supplies: null,
    },
    security: {
      amount: null,
      growth_rate: null,
      state: 'incomplete',
      recoverable_pct: null,
      notes: '',
      guard_service: null,
      monitoring_alarm: null,
    },
    management: {
      property_management_pct: null,
      property_management_flat: null,
      fee_type: 'Percentage of EGI',
      asset_management_pct: null,
    },
    administrative: {
      amount: null,
      growth_rate: null,
      state: 'incomplete',
      recoverable_pct: null,
      notes: '',
      accounting: null,
      legal_general: null,
      licenses_permits: null,
      professional_fees: null,
    },
    marketing_leasing: {
      amount: null,
      growth_rate: null,
      state: 'incomplete',
      recoverable_pct: null,
      notes: '',
      marketing: null,
      advertising: null,
    },
    custom_expenses: [],
    expense_growth_global: null,
  },
  capital: {
    reserve_method: 'Annual per SF',
    reserve_per_sf: null,
    annual_reserve: null,
    reserve_pct: null,
    reserve_growth_rate: null,
    itemized_reserves: [],
    scheduled_capex: [],
    ti_assumptions: {
      new_lease_ti_psf: null,
      renewal_ti_psf: null,
      new_lease_lc_pct: null,
      renewal_lc_pct: null,
    },
  },
  growth: {
    rent_growth_method: 'Fixed annual percentage',
    rent_growth_rate: null,
    rent_growth_by_year: [],
    other_income_growth_rate: null,
    expense_growth_rate: null,
    market_rent_current_psf: null,
    market_rent_growth: null,
    inflation_assumption: null,
  },
  exit: {
    exit_year: null,
    exit_month: null,
    valuation_method: 'Cap Rate on Forward NOI',
    exit_cap_rate: null,
    exit_cap_rate_state: 'incomplete',
    exit_price_per_sf: null,
    exit_price_per_unit: null,
    exit_grm: null,
    custom_exit_value: null,
    selling_costs: {
      broker_commission_pct: null,
      transfer_taxes_pct: null,
      legal_fees: null,
      other_costs: null,
    },
  },
  scenarios: [],
})

export const useProjectStore = create<ProjectState>((set, get) => ({
  projects: [],
  currentProject: null,
  isLoading: false,
  isSaving: false,
  error: null,
  lastSaved: null,

  fetchProjects: async () => {
    set({ isLoading: true, error: null })
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        set({ projects: [], isLoading: false })
        return
      }

      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })

      if (error) throw error

      // Load full project data for each project
      const projects: Project[] = await Promise.all(
        (data || []).map(async (p) => {
          const { data: projectData } = await supabase
            .from('project_data')
            .select('*')
            .eq('project_id', p.id)

          const sections: Record<string, unknown> = {}
          projectData?.forEach(pd => {
            sections[pd.section] = pd.data
          })

          return {
            ...p,
            ...sections,
            completeness: 0,
          } as Project
        })
      )

      set({ projects, isLoading: false })
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch projects',
        isLoading: false 
      })
    }
  },

  createProject: async (name: string, propertyType?: PropertyType) => {
    set({ isLoading: true, error: null })
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const id = uuidv4()
      const now = new Date().toISOString()
      const projectBase = defaultProject()
      
      const project: Project = {
        id,
        user_id: user.id,
        created_at: now,
        updated_at: now,
        ...projectBase,
        name,
        property_type: propertyType || null,
      }

      // Save to Supabase
      const { error: projectError } = await supabase
        .from('projects')
        .insert({
          id: project.id,
          user_id: project.user_id,
          name: project.name,
          property_type: project.property_type,
          status: project.status,
          is_template: project.is_template,
          created_at: project.created_at,
          updated_at: project.updated_at,
        })

      if (projectError) throw projectError

      // Save sections
      const sections = ['property', 'analysis', 'acquisition', 'financing', 'income', 'expenses', 'capital', 'growth', 'exit', 'scenarios']
      for (const section of sections) {
        const sectionData = project[section as keyof Project]
        if (sectionData !== undefined) {
          await supabase.from('project_data').insert({
            project_id: project.id,
            section,
            data: sectionData as unknown as Record<string, unknown>,
          })
        }
      }

      set(state => ({ 
        projects: [project, ...state.projects],
        currentProject: project,
        isLoading: false,
        lastSaved: new Date(),
      }))

      return project
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to create project',
        isLoading: false 
      })
      throw error
    }
  },

  loadProject: async (id: string) => {
    set({ isLoading: true, error: null })
    try {
      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .single()

      if (projectError) throw projectError

      const { data: sectionsData, error: sectionsError } = await supabase
        .from('project_data')
        .select('*')
        .eq('project_id', id)

      if (sectionsError) throw sectionsError

      const sections: Record<string, unknown> = {}
      sectionsData?.forEach(sd => {
        sections[sd.section] = sd.data
      })

      const project: Project = {
        ...projectData,
        ...sections,
        completeness: 0,
      } as Project

      // Calculate completeness
      const completeness = get().calculateCompleteness()
      project.completeness = completeness

      set({ currentProject: project, isLoading: false })
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to load project',
        isLoading: false 
      })
    }
  },

  updateProject: (updates: Partial<Project>) => {
    set(state => ({
      currentProject: state.currentProject 
        ? { ...state.currentProject, ...updates, updated_at: new Date().toISOString() }
        : null
    }))
  },

  saveProject: async () => {
    const { currentProject } = get()
    if (!currentProject) return

    set({ isSaving: true, error: null })
    try {
      const now = new Date().toISOString()

      // Update main project record
      const { error: projectError } = await supabase
        .from('projects')
        .update({
          name: currentProject.name,
          property_type: currentProject.property_type,
          status: currentProject.status,
          updated_at: now,
        })
        .eq('id', currentProject.id)

      if (projectError) throw projectError

      // Update sections
      const sections = ['property', 'analysis', 'acquisition', 'financing', 'income', 'expenses', 'capital', 'growth', 'exit', 'scenarios']
      for (const section of sections) {
        const sectData = currentProject[section as keyof Project]
        if (sectData !== undefined) {
          await supabase
            .from('project_data')
            .upsert({
              project_id: currentProject.id,
              section,
              data: sectData as unknown as Record<string, unknown>,
              updated_at: now,
            })
        }
      }

      set(state => ({
        isSaving: false,
        lastSaved: new Date(),
        currentProject: state.currentProject 
          ? { ...state.currentProject, updated_at: now }
          : null,
        projects: state.projects.map(p => 
          p.id === currentProject.id 
            ? { ...p, ...currentProject, updated_at: now }
            : p
        ),
      }))
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to save project',
        isSaving: false 
      })
    }
  },

  deleteProject: async (id: string) => {
    set({ isLoading: true, error: null })
    try {
      // Delete project data first
      await supabase.from('project_data').delete().eq('project_id', id)
      
      // Delete project
      const { error } = await supabase.from('projects').delete().eq('id', id)
      if (error) throw error

      set(state => ({
        projects: state.projects.filter(p => p.id !== id),
        currentProject: state.currentProject?.id === id ? null : state.currentProject,
        isLoading: false,
      }))
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to delete project',
        isLoading: false 
      })
    }
  },

  duplicateProject: async (id: string) => {
    const project = get().projects.find(p => p.id === id)
    if (!project) throw new Error('Project not found')

    const newProject = await get().createProject(
      `${project.name} (Copy)`,
      project.property_type || undefined
    )

    // Copy all data
    set(() => ({
      currentProject: {
        ...newProject,
        property: project.property,
        analysis: project.analysis,
        acquisition: project.acquisition,
        financing: project.financing,
        income: project.income,
        expenses: project.expenses,
        capital: project.capital,
        growth: project.growth,
        exit: project.exit,
        scenarios: project.scenarios,
      }
    }))

    await get().saveProject()
    return get().currentProject!
  },

  // Section update functions
  updateProperty: (data) => {
    set(state => ({
      currentProject: state.currentProject 
        ? { 
            ...state.currentProject, 
            property: { ...state.currentProject.property!, ...data },
            updated_at: new Date().toISOString()
          }
        : null
    }))
  },

  updateAnalysis: (data) => {
    set(state => ({
      currentProject: state.currentProject 
        ? { 
            ...state.currentProject, 
            analysis: { ...state.currentProject.analysis!, ...data },
            updated_at: new Date().toISOString()
          }
        : null
    }))
  },

  updateAcquisition: (data) => {
    set(state => ({
      currentProject: state.currentProject 
        ? { 
            ...state.currentProject, 
            acquisition: { ...state.currentProject.acquisition!, ...data },
            updated_at: new Date().toISOString()
          }
        : null
    }))
  },

  updateFinancing: (data) => {
    set(state => ({
      currentProject: state.currentProject 
        ? { 
            ...state.currentProject, 
            financing: { ...state.currentProject.financing!, ...data },
            updated_at: new Date().toISOString()
          }
        : null
    }))
  },

  updateIncome: (data) => {
    set(state => ({
      currentProject: state.currentProject 
        ? { 
            ...state.currentProject, 
            income: { ...state.currentProject.income!, ...data },
            updated_at: new Date().toISOString()
          }
        : null
    }))
  },

  updateExpenses: (data) => {
    set(state => ({
      currentProject: state.currentProject 
        ? { 
            ...state.currentProject, 
            expenses: { ...state.currentProject.expenses!, ...data },
            updated_at: new Date().toISOString()
          }
        : null
    }))
  },

  updateCapital: (data) => {
    set(state => ({
      currentProject: state.currentProject 
        ? { 
            ...state.currentProject, 
            capital: { ...state.currentProject.capital!, ...data },
            updated_at: new Date().toISOString()
          }
        : null
    }))
  },

  updateGrowth: (data) => {
    set(state => ({
      currentProject: state.currentProject 
        ? { 
            ...state.currentProject, 
            growth: { ...state.currentProject.growth!, ...data },
            updated_at: new Date().toISOString()
          }
        : null
    }))
  },

  updateExit: (data) => {
    set(state => ({
      currentProject: state.currentProject 
        ? { 
            ...state.currentProject, 
            exit: { ...state.currentProject.exit!, ...data },
            updated_at: new Date().toISOString()
          }
        : null
    }))
  },

  updateScenarios: (scenarios) => {
    set(state => ({
      currentProject: state.currentProject 
        ? { 
            ...state.currentProject, 
            scenarios,
            updated_at: new Date().toISOString()
          }
        : null
    }))
  },

  clearError: () => set({ error: null }),

  calculateCompleteness: () => {
    const { currentProject } = get()
    if (!currentProject) return 0

    const requiredFields = [
      currentProject.name,
      currentProject.property_type,
      currentProject.property?.address?.city,
      currentProject.acquisition?.purchase_price,
      currentProject.analysis?.hold_period_years,
      currentProject.exit?.exit_cap_rate,
    ]

    const completedFields = requiredFields.filter(f => f !== null && f !== undefined && f !== '').length
    return Math.round((completedFields / requiredFields.length) * 100)
  },
}))

