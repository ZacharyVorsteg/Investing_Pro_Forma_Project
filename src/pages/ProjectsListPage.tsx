import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { 
  Plus, 
  Search, 
  Building2, 
  MoreVertical, 
  Trash2, 
  Copy, 
  Eye,
  ArrowUpDown,
  Filter,
  Grid,
  List
} from 'lucide-react'
import { Button, Card, Input, Modal } from '../components/ui'
import { useProjectStore } from '../store/projectStore'
import { format } from 'date-fns'

export const ProjectsListPage: React.FC = () => {
  const { projects, fetchProjects, deleteProject, duplicateProject, isLoading } = useProjectStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [sortBy, setSortBy] = useState<'updated' | 'name' | 'type'>('updated')
  const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null)
  const [menuOpen, setMenuOpen] = useState<string | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    fetchProjects()
  }, [fetchProjects])

  const filteredProjects = projects
    .filter(p => 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.property_type?.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name)
        case 'type':
          return (a.property_type || '').localeCompare(b.property_type || '')
        default:
          return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
      }
    })

  const handleDelete = async (id: string) => {
    await deleteProject(id)
    setShowDeleteModal(null)
  }

  const handleDuplicate = async (id: string) => {
    const newProject = await duplicateProject(id)
    setMenuOpen(null)
    navigate(`/projects/${newProject.id}`)
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">My Projects</h1>
          <p className="text-slate-400">{projects.length} total analyses</p>
        </div>
        <Link to="/projects/new">
          <Button leftIcon={<Plus className="w-4 h-4" />}>
            New Analysis
          </Button>
        </Link>
      </div>

      {/* Filters & Search */}
      <Card variant="elevated" padding="md">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input
              type="text"
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSortBy(sortBy === 'updated' ? 'name' : sortBy === 'name' ? 'type' : 'updated')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-slate-700/50 hover:bg-slate-700 text-slate-300 transition-colors"
            >
              <ArrowUpDown className="w-4 h-4" />
              <span className="text-sm">
                {sortBy === 'updated' ? 'Date' : sortBy === 'name' ? 'Name' : 'Type'}
              </span>
            </button>
            
            <button
              onClick={() => {}}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-slate-700/50 hover:bg-slate-700 text-slate-300 transition-colors"
            >
              <Filter className="w-4 h-4" />
              <span className="text-sm">Filter</span>
            </button>

            <div className="flex items-center bg-slate-700/50 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'grid' ? 'bg-emerald-500 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'list' ? 'bg-emerald-500 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </Card>

      {/* Projects Grid/List */}
      {isLoading ? (
        <div className="text-center py-12 text-slate-400">Loading projects...</div>
      ) : filteredProjects.length === 0 ? (
        <Card variant="elevated" className="text-center py-16">
          <Building2 className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">
            {searchQuery ? 'No projects found' : 'No projects yet'}
          </h3>
          <p className="text-slate-400 mb-6">
            {searchQuery 
              ? 'Try adjusting your search terms'
              : 'Create your first investment analysis to get started'
            }
          </p>
          {!searchQuery && (
            <Link to="/projects/new">
              <Button leftIcon={<Plus className="w-4 h-4" />}>
                Create Project
              </Button>
            </Link>
          )}
        </Card>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project, index) => (
            <Card 
              key={project.id} 
              variant="elevated" 
              hover
              className={`animate-fade-in relative group`}
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500/20 to-blue-500/20 flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-emerald-400" />
                </div>
                <div className="relative">
                  <button
                    onClick={() => setMenuOpen(menuOpen === project.id ? null : project.id)}
                    className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
                  >
                    <MoreVertical className="w-5 h-5" />
                  </button>
                  
                  {menuOpen === project.id && (
                    <div className="absolute right-0 top-full mt-1 w-48 py-2 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-10">
                      <Link
                        to={`/projects/${project.id}`}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                        Open
                      </Link>
                      <button
                        onClick={() => handleDuplicate(project.id)}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
                      >
                        <Copy className="w-4 h-4" />
                        Duplicate
                      </button>
                      <button
                        onClick={() => {
                          setShowDeleteModal(project.id)
                          setMenuOpen(null)
                        }}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <Link to={`/projects/${project.id}`}>
                <h3 className="text-lg font-semibold text-white mb-1 group-hover:text-emerald-400 transition-colors">
                  {project.name}
                </h3>
                <p className="text-sm text-slate-400 mb-4">
                  {project.property_type || 'No property type set'}
                </p>

                <div className="flex items-center justify-between">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                    project.status === 'complete' 
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : project.status === 'archived'
                      ? 'bg-slate-500/20 text-slate-400'
                      : 'bg-amber-500/20 text-amber-400'
                  }`}>
                    {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                  </span>
                  <span className="text-xs text-slate-500">
                    {format(new Date(project.updated_at), 'MMM d, yyyy')}
                  </span>
                </div>
              </Link>
            </Card>
          ))}
        </div>
      ) : (
        <Card variant="elevated" padding="none">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left px-6 py-4 text-sm font-medium text-slate-400">Name</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-slate-400">Property Type</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-slate-400">Status</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-slate-400">Last Updated</th>
                <th className="text-right px-6 py-4 text-sm font-medium text-slate-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProjects.map((project) => (
                <tr 
                  key={project.id} 
                  className="border-b border-slate-700/50 hover:bg-slate-800/50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <Link to={`/projects/${project.id}`} className="flex items-center gap-3 group">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                        <Building2 className="w-4 h-4 text-emerald-400" />
                      </div>
                      <span className="font-medium text-white group-hover:text-emerald-400 transition-colors">
                        {project.name}
                      </span>
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-slate-400">
                    {project.property_type || '—'}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                      project.status === 'complete' 
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'bg-amber-500/20 text-amber-400'
                    }`}>
                      {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-400 text-sm">
                    {format(new Date(project.updated_at), 'MMM d, yyyy h:mm a')}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Link to={`/projects/${project.id}`}>
                        <button className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors">
                          <Eye className="w-4 h-4" />
                        </button>
                      </Link>
                      <button 
                        onClick={() => handleDuplicate(project.id)}
                        className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => setShowDeleteModal(project.id)}
                        className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!showDeleteModal}
        onClose={() => setShowDeleteModal(null)}
        title="Delete Project"
        size="sm"
      >
        <p className="text-slate-300 mb-6">
          Are you sure you want to delete this project? This action cannot be undone.
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="ghost" onClick={() => setShowDeleteModal(null)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={() => showDeleteModal && handleDelete(showDeleteModal)}>
            Delete Project
          </Button>
        </div>
      </Modal>
    </div>
  )
}

