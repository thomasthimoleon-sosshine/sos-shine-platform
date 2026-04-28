'use client'

import React from 'react'
import { cva } from 'class-variance-authority'

const tabButton = cva(
  [
    'px-5 py-2.5 rounded-[var(--radius-md)] text-[13px] font-medium',
    'transition-all duration-[var(--transition-base)]',
    'cursor-pointer',
    'focus-visible:outline-none focus-visible:ring-2',
    'focus-visible:ring-[var(--brand)] focus-visible:ring-offset-2',
    'focus-visible:ring-offset-[var(--surface)]',
  ].join(' '),
  {
    variants: {
      active: {
        true: [
          'bg-[var(--brand-alpha-medium)]',
          'text-[var(--brand)]',
        ].join(' '),
        false: [
          'text-[var(--text-muted)]',
          'hover:text-[var(--text-secondary)]',
          'hover:bg-[var(--surface-raised)]',
        ].join(' '),
      },
    },
    defaultVariants: {
      active: false,
    },
  }
)

export interface Tab {
  key: string
  label: string
  icon?: string
}

export interface TabsProps {
  tabs: Tab[]
  activeTab: string
  onChange: (key: string) => void
  className?: string
}

const Tabs = React.forwardRef<HTMLDivElement, TabsProps>(
  ({ tabs, activeTab, onChange, className }, ref) => {
    return (
      <div
        ref={ref}
        className={`flex gap-1 p-1 rounded-[var(--radius-lg)] bg-[var(--surface-raised)] ${className || ''}`}
        role="tablist"
      >
        {tabs.map((tab) => (
          <button
            key={tab.key}
            role="tab"
            aria-selected={activeTab === tab.key}
            onClick={() => onChange(tab.key)}
            className={tabButton({ active: activeTab === tab.key })}
          >
            {tab.icon && <span className="mr-1.5">{tab.icon}</span>}
            {tab.label}
          </button>
        ))}
      </div>
    )
  }
)
Tabs.displayName = 'Tabs'

export { Tabs }
