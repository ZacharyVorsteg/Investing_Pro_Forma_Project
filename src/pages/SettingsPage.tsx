import React, { useState } from 'react'
import { User, Bell, Palette, Database } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent, Input, Button, Select } from '../components/ui'
import { useAuthStore } from '../store/authStore'

export const SettingsPage: React.FC = () => {
  const { user } = useAuthStore()
  const [fullName, setFullName] = useState(user?.full_name || '')
  const [company, setCompany] = useState(user?.company || '')

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
        <p className="text-slate-400">Manage your account and preferences</p>
      </div>

      {/* Profile */}
      <Card variant="elevated">
        <CardHeader>
          <CardTitle subtitle="Your personal information">
            <div className="flex items-center gap-2">
              <User className="w-5 h-5 text-emerald-400" />
              Profile
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Full Name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Your name"
            />
            <Input
              label="Email"
              value={user?.email || ''}
              disabled
              helperText="Contact support to change email"
            />
            <Input
              label="Company"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="Your company name"
            />
          </div>
          <div className="mt-6">
            <Button>Save Changes</Button>
          </div>
        </CardContent>
      </Card>

      {/* Preferences */}
      <Card variant="elevated">
        <CardHeader>
          <CardTitle subtitle="Customize your experience">
            <div className="flex items-center gap-2">
              <Palette className="w-5 h-5 text-emerald-400" />
              Preferences
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Select
              label="Default Currency"
              options={[
                { value: 'USD', label: 'USD ($)' },
                { value: 'EUR', label: 'EUR (€)' },
                { value: 'GBP', label: 'GBP (£)' },
                { value: 'CAD', label: 'CAD ($)' },
              ]}
              value="USD"
            />
            <Select
              label="Number Format"
              options={[
                { value: 'us', label: '1,000.00 (US)' },
                { value: 'eu', label: '1.000,00 (EU)' },
              ]}
              value="us"
            />
            <Select
              label="Default Hold Period"
              options={[
                { value: '3', label: '3 Years' },
                { value: '5', label: '5 Years' },
                { value: '7', label: '7 Years' },
                { value: '10', label: '10 Years' },
              ]}
              value="5"
            />
            <Select
              label="Pro Forma Granularity"
              options={[
                { value: 'annual', label: 'Annual' },
                { value: 'quarterly', label: 'Quarterly' },
                { value: 'monthly', label: 'Monthly' },
              ]}
              value="annual"
            />
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card variant="elevated">
        <CardHeader>
          <CardTitle subtitle="Manage email notifications">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-emerald-400" />
              Notifications
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { label: 'Project updates', desc: 'Get notified when collaborators make changes' },
              { label: 'Weekly summary', desc: 'Receive a weekly digest of your projects' },
              { label: 'Product updates', desc: 'Learn about new features and improvements' },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between p-4 rounded-lg bg-slate-800/50">
                <div>
                  <p className="font-medium text-white">{item.label}</p>
                  <p className="text-sm text-slate-400">{item.desc}</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-slate-600 peer-focus:ring-2 peer-focus:ring-emerald-500/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                </label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Data */}
      <Card variant="elevated">
        <CardHeader>
          <CardTitle subtitle="Export or delete your data">
            <div className="flex items-center gap-2">
              <Database className="w-5 h-5 text-emerald-400" />
              Data Management
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Button variant="secondary">Export All Projects</Button>
            <Button variant="danger">Delete Account</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

