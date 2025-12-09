'use client'

import { useState } from 'react'
import { User, Shield, Bell, Lock, Zap } from 'lucide-react'
import ProfileSettings from './profile-edit-settings'
import AccountSecuritySettings from './account-security-settings'
import PlanSettings from './plan-settings'
import NotificationPreferencesSettings from './notification-preferences-settings'
import PrivacySettings from './privacy-settings'

interface SettingsTabsProps {
  user: any
  profile: any
  subscription: any
}

const tabs = [
  { id: 'profile', label: 'Perfil', icon: User },
  { id: 'account', label: 'Conta', icon: Shield },
  { id: 'plan', label: 'Plano', icon: Zap },
  { id: 'notifications', label: 'Notificações', icon: Bell },
  { id: 'privacy', label: 'Privacidade', icon: Lock },
]

export default function SettingsTabs({ user, profile, subscription }: SettingsTabsProps) {
  const [activeTab, setActiveTab] = useState('profile')

  return (
    <div className="space-y-6">
      {/* Tabs Navigation */}
      <div className="bg-white rounded-2xl border border-gray-100 p-2 shadow-sm overflow-x-auto">
        <div className="flex gap-2 min-w-max">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all whitespace-nowrap cursor-pointer
                  ${activeTab === tab.id
                    ? 'bg-primary text-white shadow-lg'
                    : 'text-gray-700 hover:bg-gray-100'
                  }
                `}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'profile' && <ProfileSettings profile={profile} />}
        {activeTab === 'account' && <AccountSecuritySettings user={user} />}
        {activeTab === 'plan' && <PlanSettings subscription={subscription} />}
        {activeTab === 'notifications' && <NotificationPreferencesSettings />}
        {activeTab === 'privacy' && <PrivacySettings />}
      </div>
    </div>
  )
}
