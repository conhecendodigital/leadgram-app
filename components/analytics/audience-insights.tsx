'use client'

import { motion } from 'framer-motion'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import { Users, MapPin, Clock } from 'lucide-react'

export default function AudienceInsights() {
  const ageData = [
    { name: '18-24', value: 35, color: '#8B5CF6' },
    { name: '25-34', value: 45, color: '#EC4899' },
    { name: '35-44', value: 15, color: '#F59E0B' },
    { name: '45+', value: 5, color: '#10B981' },
  ]

  const genderData = [
    { name: 'Feminino', value: 62, color: '#EC4899' },
    { name: 'Masculino', value: 35, color: '#3B82F6' },
    { name: 'Outro', value: 3, color: '#8B5CF6' },
  ]

  const topLocations = [
    { city: 'São Paulo', country: 'Brasil', percentage: '28%' },
    { city: 'Rio de Janeiro', country: 'Brasil', percentage: '18%' },
    { city: 'Belo Horizonte', country: 'Brasil', percentage: '12%' },
    { city: 'Brasília', country: 'Brasil', percentage: '8%' },
    { city: 'Curitiba', country: 'Brasil', percentage: '6%' },
  ]

  const peakHours = [
    { time: '08:00 - 10:00', percentage: '15%', active: false },
    { time: '12:00 - 14:00', percentage: '25%', active: true },
    { time: '18:00 - 20:00', percentage: '45%', active: true },
    { time: '20:00 - 22:00', percentage: '35%', active: true },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 shadow-sm"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl">
          <Users className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            Insights da Audiência
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Conheça melhor seu público
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Age Distribution */}
        <div>
          <h4 className="font-semibold text-gray-900 dark:text-white mb-4">
            Distribuição por Idade
          </h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={ageData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {ageData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gender Distribution */}
        <div>
          <h4 className="font-semibold text-gray-900 dark:text-white mb-4">
            Distribuição por Gênero
          </h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={genderData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {genderData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Locations */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <h4 className="font-semibold text-gray-900 dark:text-white">
              Principais Localizações
            </h4>
          </div>
          <div className="space-y-3">
            {topLocations.map((location, index) => (
              <motion.div
                key={location.city}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl"
              >
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {location.city}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {location.country}
                  </p>
                </div>
                <span className="text-lg font-bold text-purple-600 dark:text-purple-400">
                  {location.percentage}
                </span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Peak Hours */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <h4 className="font-semibold text-gray-900 dark:text-white">
              Horários de Pico
            </h4>
          </div>
          <div className="space-y-3">
            {peakHours.map((hour, index) => (
              <motion.div
                key={hour.time}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`flex items-center justify-between p-3 rounded-xl transition-all ${
                  hour.active
                    ? 'bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-2 border-purple-200 dark:border-purple-700'
                    : 'bg-gray-50 dark:bg-gray-700/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      hour.active ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
                    }`}
                  />
                  <p
                    className={`font-medium ${
                      hour.active
                        ? 'text-purple-700 dark:text-purple-300'
                        : 'text-gray-900 dark:text-white'
                    }`}
                  >
                    {hour.time}
                  </p>
                </div>
                <span
                  className={`text-lg font-bold ${
                    hour.active
                      ? 'text-purple-600 dark:text-purple-400'
                      : 'text-gray-600 dark:text-gray-400'
                  }`}
                >
                  {hour.percentage}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
