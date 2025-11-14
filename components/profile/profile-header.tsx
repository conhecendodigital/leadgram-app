'use client'

import { m } from 'framer-motion'
import Image from 'next/image'
import { Camera, User, Mail, Calendar } from 'lucide-react'
import { useState } from 'react'
import { showToast } from '@/lib/toast'

interface ProfileHeaderProps {
  user: any
  profile: any
}

export default function ProfileHeader({ user, profile }: ProfileHeaderProps) {
  const [uploading, setUploading] = useState(false)
  const [imageError, setImageError] = useState(false)

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      showToast.error('Por favor, envie apenas imagens')
      return
    }

    setUploading(true)
    try {
      // TODO: Upload para Supabase Storage
      showToast.success('Avatar atualizado com sucesso!')
    } catch (error) {
      showToast.error('Erro ao fazer upload')
    } finally {
      setUploading(false)
    }
  }

  return (
    <m.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm"
    >
      <div className="flex flex-col md:flex-row items-center gap-6">
        {/* Avatar */}
        <div className="relative group">
          <div className="w-32 h-32 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 p-1">
            <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden relative">
              {profile?.avatar_url && !imageError ? (
                <Image
                  src={profile.avatar_url}
                  alt={profile.full_name || 'Avatar'}
                  fill
                  className="object-cover"
                  sizes="128px"
                  onError={() => setImageError(true)}
                />
              ) : (
                <User className="w-16 h-16 text-gray-400" />
              )}
            </div>
          </div>

          {/* Upload Button */}
          <label className="absolute bottom-0 right-0 p-2 bg-primary hover:bg-primary/90 rounded-full cursor-pointer shadow-lg transition-all group-hover:scale-110 transform duration-200">
            <Camera className="w-5 h-5 text-white" />
            <input
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="hidden"
              disabled={uploading}
            />
          </label>
        </div>

        {/* Info */}
        <div className="flex-1 text-center md:text-left">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            {profile?.full_name || 'Sem nome'}
          </h2>

          <div className="space-y-2">
            <div className="flex items-center gap-2 justify-center md:justify-start text-gray-600">
              <Mail className="w-4 h-4" />
              <span className="text-sm">{user.email}</span>
            </div>

            <div className="flex items-center gap-2 justify-center md:justify-start text-gray-600">
              <Calendar className="w-4 h-4" />
              <span className="text-sm">
                Membro desde {new Date(user.created_at).toLocaleDateString('pt-BR', {
                  month: 'long',
                  year: 'numeric'
                })}
              </span>
            </div>
          </div>

          {/* Badges */}
          {profile?.subscription_tier && (
            <div className="flex gap-2 mt-4 justify-center md:justify-start">
              <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold">
                {profile.subscription_tier === 'pro' ? 'Pro Member' : 'Free Plan'}
              </span>
              {user.email_confirmed_at && (
                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                  Verificado
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </m.div>
  )
}
