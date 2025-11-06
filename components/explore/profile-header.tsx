'use client'

import { BadgeCheck, Briefcase } from 'lucide-react'
import Image from 'next/image'

interface ProfileHeaderProps {
  profile: any
}

export default function ProfileHeader({ profile }: ProfileHeaderProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 md:p-8 shadow-sm">
      <div className="flex flex-col md:flex-row gap-6 items-start">
        {/* Profile Picture */}
        <div className="relative">
          <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden border-4 border-gradient-to-br from-purple-500 to-pink-500 p-1 bg-white">
            <div className="w-full h-full rounded-full overflow-hidden">
              {profile.profile_pic_url ? (
                <img
                  src={profile.profile_pic_url}
                  alt={profile.username}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white text-3xl font-bold">
                  {profile.username?.[0]?.toUpperCase() || '?'}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Profile Info */}
        <div className="flex-1 space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                @{profile.username}
              </h1>
              {profile.is_verified && (
                <BadgeCheck className="w-6 h-6 text-primary fill-blue-500" />
              )}
              {profile.is_business_account && (
                <Briefcase className="w-5 h-5 text-gray-500" />
              )}
            </div>

            {profile.full_name && (
              <p className="text-lg text-gray-700 font-medium">
                {profile.full_name}
              </p>
            )}

            {profile.category && (
              <p className="text-sm text-gray-500 mt-1">
                {profile.category}
              </p>
            )}
          </div>

          {profile.biography && (
            <p className="text-gray-600 whitespace-pre-wrap">
              {profile.biography}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
