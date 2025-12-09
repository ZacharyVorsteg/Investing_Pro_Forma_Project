import React from 'react'
import { BookOpen, Calculator, FileText, Mail, MessageCircle } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent, Button } from '../components/ui'

const guides = [
  {
    title: 'Getting Started',
    description: 'Learn the basics of creating your first pro forma analysis',
    icon: BookOpen,
    color: 'text-emerald-400',
  },
  {
    title: 'Understanding Cap Rates',
    description: 'Deep dive into capitalization rates and how they affect valuation',
    icon: Calculator,
    color: 'text-blue-400',
  },
  {
    title: 'Financing Structures',
    description: 'Model senior debt, mezzanine, and preferred equity',
    icon: FileText,
    color: 'text-purple-400',
  },
  {
    title: 'Sensitivity Analysis',
    description: 'Test your assumptions and understand risks',
    icon: Calculator,
    color: 'text-amber-400',
  },
]

const glossary = [
  { term: 'NOI', definition: 'Net Operating Income - Revenue minus operating expenses (before debt service)' },
  { term: 'Cap Rate', definition: 'Capitalization Rate - NOI divided by property value, expressed as a percentage' },
  { term: 'DSCR', definition: 'Debt Service Coverage Ratio - NOI divided by annual debt service' },
  { term: 'LTV', definition: 'Loan-to-Value - Loan amount divided by property value' },
  { term: 'IRR', definition: 'Internal Rate of Return - The discount rate that makes NPV equal to zero' },
  { term: 'Equity Multiple', definition: 'Total distributions divided by total equity invested' },
  { term: 'Cash-on-Cash', definition: 'Annual cash flow divided by equity invested' },
  { term: 'NNN', definition: 'Triple Net Lease - Tenant pays taxes, insurance, and maintenance' },
]

export const HelpPage: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Help & Documentation</h1>
        <p className="text-slate-400">Learn how to use Investor Pro effectively</p>
      </div>

      {/* Quick Start Guides */}
      <Card variant="elevated">
        <CardHeader>
          <CardTitle subtitle="Step-by-step tutorials">
            Learning Center
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {guides.map((guide) => (
              <div 
                key={guide.title}
                className="p-4 rounded-xl bg-slate-800/50 border border-slate-700 hover:border-emerald-500/30 transition-all cursor-pointer group"
              >
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-lg bg-slate-700/50 flex items-center justify-center ${guide.color}`}>
                    <guide.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-medium text-white group-hover:text-emerald-400 transition-colors">
                      {guide.title}
                    </h3>
                    <p className="text-sm text-slate-400 mt-1">{guide.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Glossary */}
      <Card variant="elevated">
        <CardHeader>
          <CardTitle subtitle="Common real estate investment terms">
            Glossary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {glossary.map((item) => (
              <div key={item.term} className="p-4 rounded-lg bg-slate-800/50">
                <dt className="font-semibold text-emerald-400">{item.term}</dt>
                <dd className="text-sm text-slate-300 mt-1">{item.definition}</dd>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Key Formulas */}
      <Card variant="elevated">
        <CardHeader>
          <CardTitle subtitle="Essential calculations">
            Key Formulas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 font-mono text-sm">
            <div className="p-4 rounded-lg bg-slate-800/50">
              <p className="text-emerald-400">NOI = Effective Gross Income - Operating Expenses</p>
            </div>
            <div className="p-4 rounded-lg bg-slate-800/50">
              <p className="text-emerald-400">Cap Rate = NOI ÷ Property Value</p>
            </div>
            <div className="p-4 rounded-lg bg-slate-800/50">
              <p className="text-emerald-400">Cash-on-Cash = Annual Cash Flow ÷ Equity Invested</p>
            </div>
            <div className="p-4 rounded-lg bg-slate-800/50">
              <p className="text-emerald-400">DSCR = NOI ÷ Annual Debt Service</p>
            </div>
            <div className="p-4 rounded-lg bg-slate-800/50">
              <p className="text-emerald-400">Equity Multiple = Total Distributions ÷ Total Equity</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact */}
      <Card variant="glass">
        <CardContent className="text-center py-8">
          <h3 className="text-xl font-semibold text-white mb-2">Need More Help?</h3>
          <p className="text-slate-400 mb-6">
            Our team is here to help you succeed
          </p>
          <div className="flex justify-center gap-4">
            <Button variant="secondary" leftIcon={<Mail className="w-4 h-4" />}>
              Email Support
            </Button>
            <Button variant="secondary" leftIcon={<MessageCircle className="w-4 h-4" />}>
              Live Chat
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

