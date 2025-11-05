'use client'

import { motion } from 'framer-motion'
import { Camera, User, Mail, Calendar } from 'lucide-react'
import { useState } from 'react'
import { showToast } from '@/lib/toast'

interface ProfileHeaderProps {
  user: any
  profile: any
}

export default function ProfileHeader({ user, profile }: ProfileHeaderProps) {
  const [uploading, setUploading] = useState(false)

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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm"
    >
      <div className="flex flex-col md:flex-row items-center gap-6">
        {/* Avatar */}
        <div className="relative group">
          <div className="w-32 h-32 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 p-1">
            <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden">
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={profile.full_name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-16 h-16 text-gray-400" />
              )}
            </div>
          </div>

          {/* Upload Button */}
          <label className="absolute bottom-0 right-0 p-2 bg-primary hover:bg-primary rounded-full cursor-pointer shadow-lg transition-colors group-hover:scale-110 transform duration-200">
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
          <div className="flex gap-2 mt-4 justify-center md:justify-start">
            <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold">
              Pro Member
            </span>
            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
              Verificado
            </span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mt-6 md:mt-0">
          <div className="text-center p-4 rounded-xl bg-gray-50">
            <p className="text-2xl font-bold text-gray-900">48</p>
            <p className="text-xs text-gray-600">Posts</p>
          </div>
          <div className="text-center p-4 rounded-xl bg-gray-50">
            <p className="text-2xl font-bold text-gray-900">2.4K</p>
            <p className="text-xs text-gray-600">Seguidores</p>
          </div>
          <div className="text-center p-4 rounded-xl bg-gray-50">
            <p className="text-2xl font-bold text-gray-900">4.8%</p>
            <p className="text-xs text-gray-600">Engajamento</p>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
