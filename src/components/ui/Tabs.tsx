import React, { createContext, useContext, useState } from 'react'

interface TabsContextType {
  activeTab: string
  setActiveTab: (tab: string) => void
}

const TabsContext = createContext<TabsContextType | null>(null)

interface TabsProps {
  defaultTab: string
  children: React.ReactNode
  className?: string
  onChange?: (tab: string) => void
}

export const Tabs: React.FC<TabsProps> = ({
  defaultTab,
  children,
  className = '',
  onChange,
}) => {
  const [activeTab, setActiveTab] = useState(defaultTab)

  const handleTabChange = (tab: string) => {
    setActiveTab(tab)
    onChange?.(tab)
  }

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab: handleTabChange }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  )
}

interface TabsListProps {
  children: React.ReactNode
  className?: string
}

export const TabsList: React.FC<TabsListProps> = ({ children, className = '' }) => (
  <div className={`flex gap-1 p-1 bg-slate-800/50 rounded-lg ${className}`}>
    {children}
  </div>
)

interface TabTriggerProps {
  value: string
  children: React.ReactNode
  className?: string
  icon?: React.ReactNode
}

export const TabTrigger: React.FC<TabTriggerProps> = ({
  value,
  children,
  className = '',
  icon,
}) => {
  const context = useContext(TabsContext)
  if (!context) throw new Error('TabTrigger must be used within Tabs')

  const isActive = context.activeTab === value

  return (
    <button
      onClick={() => context.setActiveTab(value)}
      className={`
        flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium
        transition-all duration-200
        ${isActive 
          ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25' 
          : 'text-slate-400 hover:text-white hover:bg-slate-700/50'}
        ${className}
      `}
    >
      {icon}
      {children}
    </button>
  )
}

interface TabContentProps {
  value: string
  children: React.ReactNode
  className?: string
}

export const TabContent: React.FC<TabContentProps> = ({
  value,
  children,
  className = '',
}) => {
  const context = useContext(TabsContext)
  if (!context) throw new Error('TabContent must be used within Tabs')

  if (context.activeTab !== value) return null

  return (
    <div className={`animate-fade-in ${className}`}>
      {children}
    </div>
  )
}

