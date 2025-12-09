import React from 'react'
import { Link } from 'react-router-dom'
import { Building2, Warehouse, Building, ShoppingBag, Home, Box, ArrowRight } from 'lucide-react'
import { Card, CardContent, Button } from '../components/ui'

const templates = [
  {
    id: 'industrial',
    name: 'Industrial Acquisition',
    description: 'Warehouse/distribution property with NNN leases',
    icon: Warehouse,
    color: 'from-blue-500/20 to-cyan-500/20',
    iconColor: 'text-blue-400',
  },
  {
    id: 'office',
    name: 'Office Building',
    description: 'Multi-tenant office with standard lease structure',
    icon: Building,
    color: 'from-purple-500/20 to-pink-500/20',
    iconColor: 'text-purple-400',
  },
  {
    id: 'retail',
    name: 'Retail Strip Center',
    description: 'Neighborhood retail with percentage rent',
    icon: ShoppingBag,
    color: 'from-orange-500/20 to-red-500/20',
    iconColor: 'text-orange-400',
  },
  {
    id: 'multifamily',
    name: 'Multifamily',
    description: 'Apartment complex with unit mix analysis',
    icon: Home,
    color: 'from-emerald-500/20 to-teal-500/20',
    iconColor: 'text-emerald-400',
  },
  {
    id: 'storage',
    name: 'Self-Storage',
    description: 'Storage facility with unit type breakdown',
    icon: Box,
    color: 'from-amber-500/20 to-yellow-500/20',
    iconColor: 'text-amber-400',
  },
  {
    id: 'mixed-use',
    name: 'Mixed-Use',
    description: 'Retail + residential or office combination',
    icon: Building2,
    color: 'from-indigo-500/20 to-violet-500/20',
    iconColor: 'text-indigo-400',
  },
]

export const TemplatesPage: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Templates</h1>
        <p className="text-slate-400">Start with a pre-configured pro forma template</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((template, index) => (
          <Card 
            key={template.id} 
            variant="elevated" 
            hover 
            className="animate-fade-in group"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <CardContent>
              <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${template.color} flex items-center justify-center mb-4`}>
                <template.icon className={`w-7 h-7 ${template.iconColor}`} />
              </div>
              
              <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-emerald-400 transition-colors">
                {template.name}
              </h3>
              <p className="text-sm text-slate-400 mb-4">
                {template.description}
              </p>

              <Link to="/projects/new">
                <Button variant="ghost" size="sm" className="w-full" rightIcon={<ArrowRight className="w-4 h-4" />}>
                  Use Template
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Custom Template */}
      <Card variant="glass" className="mt-8">
        <CardContent className="text-center py-8">
          <h3 className="text-xl font-semibold text-white mb-2">Need a Custom Template?</h3>
          <p className="text-slate-400 mb-4">
            Create your own reusable templates from any completed project
          </p>
          <Link to="/projects">
            <Button variant="secondary">View Your Projects</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}

