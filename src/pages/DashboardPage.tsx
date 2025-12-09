import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { 
  Plus, 
  FolderOpen, 
  TrendingUp, 
  Calculator, 
  Clock,
  ArrowUpRight,
  Building2,
  DollarSign,
  Percent,
  BarChart3
} from 'lucide-react'
import { Button, Card, CardHeader, CardTitle, CardContent, ProgressBar } from '../components/ui'
import { useProjectStore } from '../store/projectStore'
import { useAuthStore } from '../store/authStore'
import { format } from 'date-fns'

export const DashboardPage: React.FC = () => {
  const { user } = useAuthStore()
  const { projects, fetchProjects, isLoading } = useProjectStore()

  useEffect(() => {
    fetchProjects()
  }, [fetchProjects])

  const recentProjects = projects.slice(0, 5)
  const totalProjects = projects.length
  const draftProjects = projects.filter(p => p.status === 'draft').length
  const completedProjects = projects.filter(p => p.status === 'complete').length

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Welcome back, {user?.full_name?.split(' ')[0] || 'Investor'}
          </h1>
          <p className="text-slate-400">
            Your investment analysis command center
          </p>
        </div>
        <Link to="/projects/new">
          <Button leftIcon={<Plus className="w-4 h-4" />}>
            New Analysis
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card variant="elevated" className="animate-fade-in stagger-1">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-slate-400 text-sm font-medium">Total Projects</p>
              <p className="text-3xl font-bold text-white mt-1">{totalProjects}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400/20 to-emerald-600/20 flex items-center justify-center">
              <FolderOpen className="w-6 h-6 text-emerald-400" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 text-sm">
            <span className="text-emerald-400 flex items-center gap-1">
              <ArrowUpRight className="w-3 h-3" />
              {completedProjects}
            </span>
            <span className="text-slate-500">completed</span>
          </div>
        </Card>

        <Card variant="elevated" className="animate-fade-in stagger-2">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-slate-400 text-sm font-medium">In Progress</p>
              <p className="text-3xl font-bold text-white mt-1">{draftProjects}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400/20 to-amber-600/20 flex items-center justify-center">
              <Clock className="w-6 h-6 text-amber-400" />
            </div>
          </div>
          <div className="mt-4">
            <ProgressBar 
              value={draftProjects} 
              max={totalProjects || 1} 
              size="sm" 
              showLabel={false} 
            />
          </div>
        </Card>

        <Card variant="elevated" className="animate-fade-in stagger-3">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-slate-400 text-sm font-medium">Avg IRR Target</p>
              <p className="text-3xl font-bold text-white mt-1">15%</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-400/20 to-blue-600/20 flex items-center justify-center">
              <Percent className="w-6 h-6 text-blue-400" />
            </div>
          </div>
          <div className="mt-4 text-sm text-slate-500">
            Across all analyses
          </div>
        </Card>

        <Card variant="elevated" className="animate-fade-in stagger-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-slate-400 text-sm font-medium">Total Equity</p>
              <p className="text-3xl font-bold text-white mt-1">$0</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-400/20 to-purple-600/20 flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-purple-400" />
            </div>
          </div>
          <div className="mt-4 text-sm text-slate-500">
            Under analysis
          </div>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Projects */}
        <Card variant="elevated" padding="none" className="lg:col-span-2">
          <CardHeader className="p-6 pb-0">
            <CardTitle subtitle="Your latest investment analyses">
              Recent Projects
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {isLoading ? (
              <div className="text-center py-8 text-slate-400">Loading...</div>
            ) : recentProjects.length === 0 ? (
              <div className="text-center py-12">
                <Building2 className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400 mb-4">No projects yet</p>
                <Link to="/projects/new">
                  <Button variant="secondary" leftIcon={<Plus className="w-4 h-4" />}>
                    Create Your First Analysis
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {recentProjects.map((project) => (
                  <Link
                    key={project.id}
                    to={`/projects/${project.id}`}
                    className="flex items-center justify-between p-4 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/50 hover:border-emerald-500/30 transition-all group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500/20 to-blue-500/20 flex items-center justify-center group-hover:from-emerald-500/30 group-hover:to-blue-500/30 transition-all">
                        <Building2 className="w-5 h-5 text-emerald-400" />
                      </div>
                      <div>
                        <p className="font-medium text-white group-hover:text-emerald-400 transition-colors">
                          {project.name}
                        </p>
                        <p className="text-sm text-slate-400">
                          {project.property_type || 'No property type'} • Updated {format(new Date(project.updated_at), 'MMM d, yyyy')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        project.status === 'complete' 
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : 'bg-amber-500/20 text-amber-400'
                      }`}>
                        {project.status === 'complete' ? 'Complete' : 'Draft'}
                      </span>
                      <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 transition-colors" />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card variant="elevated">
          <CardHeader>
            <CardTitle subtitle="Get started quickly">
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link to="/projects/new" className="block">
              <div className="flex items-center gap-4 p-4 rounded-lg bg-gradient-to-r from-emerald-500/10 to-blue-500/10 border border-emerald-500/30 hover:from-emerald-500/20 hover:to-blue-500/20 transition-all cursor-pointer">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                  <Plus className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <p className="font-medium text-white">New Pro Forma</p>
                  <p className="text-sm text-slate-400">Start fresh analysis</p>
                </div>
              </div>
            </Link>

            <Link to="/calculators" className="block">
              <div className="flex items-center gap-4 p-4 rounded-lg bg-slate-800/50 border border-slate-700/50 hover:border-slate-600 transition-all cursor-pointer">
                <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                  <Calculator className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <p className="font-medium text-white">Calculators</p>
                  <p className="text-sm text-slate-400">Cap rate, DSCR, IRR</p>
                </div>
              </div>
            </Link>

            <Link to="/templates" className="block">
              <div className="flex items-center gap-4 p-4 rounded-lg bg-slate-800/50 border border-slate-700/50 hover:border-slate-600 transition-all cursor-pointer">
                <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <p className="font-medium text-white">Templates</p>
                  <p className="text-sm text-slate-400">Pre-built models</p>
                </div>
              </div>
            </Link>

            <Link to="/help" className="block">
              <div className="flex items-center gap-4 p-4 rounded-lg bg-slate-800/50 border border-slate-700/50 hover:border-slate-600 transition-all cursor-pointer">
                <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <p className="font-medium text-white">Learning Center</p>
                  <p className="text-sm text-slate-400">Pro forma guides</p>
                </div>
              </div>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Features Showcase */}
      <Card variant="glass" className="overflow-hidden">
        <div className="flex flex-col md:flex-row items-center gap-8 p-8">
          <div className="flex-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-sm font-medium mb-4">
              <TrendingUp className="w-4 h-4" />
              Pro Forma Tool
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">
              Zero Assumptions, Maximum Flexibility
            </h2>
            <p className="text-slate-400 mb-6">
              Build investor-grade pro formas with comprehensive income, expense, and returns modeling. 
              Every assumption is transparent and fully customizable.
            </p>
            <div className="flex flex-wrap gap-3">
              <span className="px-3 py-1.5 rounded-lg bg-slate-700/50 text-slate-300 text-sm">
                Dynamic Hold Periods
              </span>
              <span className="px-3 py-1.5 rounded-lg bg-slate-700/50 text-slate-300 text-sm">
                Multi-Tranche Financing
              </span>
              <span className="px-3 py-1.5 rounded-lg bg-slate-700/50 text-slate-300 text-sm">
                Sensitivity Analysis
              </span>
              <span className="px-3 py-1.5 rounded-lg bg-slate-700/50 text-slate-300 text-sm">
                PDF/Excel Export
              </span>
            </div>
          </div>
          <div className="w-full md:w-80 h-48 rounded-xl bg-gradient-to-br from-emerald-500/20 via-blue-500/20 to-purple-500/20 flex items-center justify-center">
            <BarChart3 className="w-20 h-20 text-emerald-400/50" />
          </div>
        </div>
      </Card>
    </div>
  )
}

