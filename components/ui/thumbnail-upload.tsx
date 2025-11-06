'use client'

import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, X, Image as ImageIcon } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { showToast } from '@/lib/toast'

interface ThumbnailUploadProps {
  value?: string
  onChange: (url: string) => void
}

export default function ThumbnailUpload({ value, onChange }: ThumbnailUploadProps) {
  const [preview, setPreview] = useState(value || '')
  const [uploading, setUploading] = useState(false)

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (!file) return

    // Validar tipo
    if (!file.type.startsWith('image/')) {
      showToast.error('Por favor, envie apenas imagens')
      return
    }

    // Validar tamanho (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showToast.error('Imagem muito grande. Máximo 5MB')
      return
    }

    setUploading(true)

    try {
      // Criar preview local
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result as string)
        onChange(reader.result as string)
      }
      reader.readAsDataURL(file)

      // TODO: Upload para Supabase Storage
      // const { data, error } = await supabase.storage
      //   .from('thumbnails')
      //   .upload(`${Date.now()}-${file.name}`, file)

      showToast.success('Thumbnail enviado com sucesso!')
    } catch (error) {
      showToast.error('Erro ao fazer upload')
      console.error(error)
    } finally {
      setUploading(false)
    }
  }, [onChange])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.webp', '.gif']
    },
    maxFiles: 1,
  })

  const handleRemove = () => {
    setPreview('')
    onChange('')
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        Thumbnail
      </label>

      <AnimatePresence mode="wait">
        {preview ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative group"
          >
            <img
              src={preview}
              alt="Thumbnail preview"
              className="w-full h-48 object-cover rounded-xl border-2 border-gray-200"
            />

            {/* Overlay on hover */}
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center">
              <button
                onClick={handleRemove}
                className="p-3 bg-red-500 hover:bg-red-600 rounded-full text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </motion.div>
        ) : (
          <div
            {...getRootProps()}
            className={`
              border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all
              ${isDragActive
                ? 'border-primary bg-purple-50'
                : 'border-gray-300 hover:border-purple-400'
              }
              ${uploading ? 'pointer-events-none opacity-50' : ''}
            `}
          >
            <input {...getInputProps()} />

            <motion.div
              animate={isDragActive ? { scale: 1.1 } : { scale: 1 }}
              className="flex flex-col items-center gap-4"
            >
              {uploading ? (
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              ) : (
                <div className="p-4 bg-purple-100 rounded-full">
                  {isDragActive ? (
                    <Upload className="w-8 h-8 text-primary" />
                  ) : (
                    <ImageIcon className="w-8 h-8 text-primary" />
                  )}
                </div>
              )}

              <div>
                <p className="text-sm font-medium text-gray-900">
                  {uploading
                    ? 'Enviando...'
                    : isDragActive
                    ? 'Solte a imagem aqui'
                    : 'Arraste uma imagem ou clique para selecionar'}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  PNG, JPG, WEBP até 5MB
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
