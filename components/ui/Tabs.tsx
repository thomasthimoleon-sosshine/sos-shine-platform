'use client'

import React from 'react'

export interface Tab {
  key: string
  label: string
  icon?: string
}

export interface TabsProps {
  tabs: Tab[]
  activeTab: string
  onChange: (key: string) => void
}

export function Tabs({ tabs, activeTab, onChange }: TabsProps) {
  return (
    <div className="flex gap-2">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onChange(tab.key)}
          className="px-5 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer"
          style={{
            background: activeTab === tab.key
              ? 'linear-gradient(135deg, rgba(212,175,55,0.15), rgba(212,175,55,0.05))'
              : 'rgba(255,255,255,0.02)',
            border: activeTab === tab.key
              ? '1px solid rgba(212,175,55,0.4)'
              : '1px solid rgba(255,255,255,0.06)',
            color: activeTab === tab.key ? '#D4AF37' : 'var(--text-muted)',
          }}
        >
          {tab.icon && <span className="mr-2">{tab.icon}</span>}
          {tab.label}
        </button>
      ))}
    </div>
  )
}
