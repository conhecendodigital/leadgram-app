/**
 * Funções utilitárias para cálculo de métricas de analytics
 * SEM uso de IA - apenas matemática e estatística
 */

export interface PostMetrics {
  likes: number
  comments: number
  shares?: number
  saves?: number
  impressions?: number
  reach?: number
}

export interface AccountMetrics {
  followers: number
  following: number
  posts: number
}

/**
 * Calcula taxa de engajamento (engagement rate)
 * Fórmula: (Curtidas + Comentários + Compartilhamentos + Salvamentos) / Seguidores * 100
 */
export function calculateEngagementRate(
  post: PostMetrics,
  followers: number
): number {
  if (followers === 0) return 0

  const totalEngagement =
    post.likes +
    post.comments +
    (post.shares || 0) +
    (post.saves || 0)

  return parseFloat(((totalEngagement / followers) * 100).toFixed(2))
}

/**
 * Calcula taxa média de engajamento de múltiplos posts
 */
export function calculateAverageEngagementRate(
  posts: PostMetrics[],
  followers: number
): number {
  if (posts.length === 0) return 0

  const totalRate = posts.reduce((sum, post) => {
    return sum + calculateEngagementRate(post, followers)
  }, 0)

  return parseFloat((totalRate / posts.length).toFixed(2))
}

/**
 * Calcula taxa de alcance (reach rate)
 * Fórmula: (Reach / Seguidores) * 100
 */
export function calculateReachRate(reach: number, followers: number): number {
  if (followers === 0) return 0
  return parseFloat(((reach / followers) * 100).toFixed(2))
}

/**
 * Calcula crescimento percentual entre dois valores
 * Fórmula: ((Novo - Antigo) / Antigo) * 100
 */
export function calculateGrowthPercentage(
  oldValue: number,
  newValue: number
): number {
  if (oldValue === 0) return newValue > 0 ? 100 : 0
  return parseFloat((((newValue - oldValue) / oldValue) * 100).toFixed(2))
}

/**
 * Identifica melhor horário para postar baseado em histórico
 * Retorna hora do dia (0-23) com maior engajamento médio
 */
export function findBestTimeToPost(
  posts: Array<{ timestamp: string; engagement: number }>
): { hour: number; engagement: number } {
  const hourlyEngagement: { [hour: number]: { total: number; count: number } } = {}

  // Agrupar por hora
  posts.forEach((post) => {
    const hour = new Date(post.timestamp).getHours()
    if (!hourlyEngagement[hour]) {
      hourlyEngagement[hour] = { total: 0, count: 0 }
    }
    hourlyEngagement[hour].total += post.engagement
    hourlyEngagement[hour].count += 1
  })

  // Calcular média e encontrar melhor hora
  let bestHour = 0
  let bestEngagement = 0

  Object.entries(hourlyEngagement).forEach(([hour, data]) => {
    const avgEngagement = data.total / data.count
    if (avgEngagement > bestEngagement) {
      bestEngagement = avgEngagement
      bestHour = parseInt(hour)
    }
  })

  return {
    hour: bestHour,
    engagement: parseFloat(bestEngagement.toFixed(2)),
  }
}

/**
 * Identifica melhores dias da semana para postar
 * Retorna array ordenado por engajamento
 */
export function findBestDaysToPost(
  posts: Array<{ timestamp: string; engagement: number }>
): Array<{ day: string; engagement: number; dayNumber: number }> {
  const dayNames = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']
  const dailyEngagement: { [day: number]: { total: number; count: number } } = {}

  // Agrupar por dia da semana
  posts.forEach((post) => {
    const day = new Date(post.timestamp).getDay()
    if (!dailyEngagement[day]) {
      dailyEngagement[day] = { total: 0, count: 0 }
    }
    dailyEngagement[day].total += post.engagement
    dailyEngagement[day].count += 1
  })

  // Calcular médias e ordenar
  const results = Object.entries(dailyEngagement)
    .map(([day, data]) => ({
      day: dayNames[parseInt(day)],
      dayNumber: parseInt(day),
      engagement: parseFloat((data.total / data.count).toFixed(2)),
    }))
    .sort((a, b) => b.engagement - a.engagement)

  return results
}

/**
 * Calcula tendência (crescente, estável, decrescente)
 * Baseado em regressão linear simples
 */
export function calculateTrend(
  values: number[]
): { direction: 'up' | 'stable' | 'down'; slope: number } {
  if (values.length < 2) {
    return { direction: 'stable', slope: 0 }
  }

  // Regressão linear simples
  const n = values.length
  const sumX = values.reduce((sum, _, i) => sum + i, 0)
  const sumY = values.reduce((sum, y) => sum + y, 0)
  const sumXY = values.reduce((sum, y, i) => sum + i * y, 0)
  const sumX2 = values.reduce((sum, _, i) => sum + i * i, 0)

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX)

  let direction: 'up' | 'stable' | 'down' = 'stable'
  if (slope > 0.1) direction = 'up'
  else if (slope < -0.1) direction = 'down'

  return {
    direction,
    slope: parseFloat(slope.toFixed(4)),
  }
}

/**
 * Compara performance de dois períodos
 */
export function comparePerformance(
  currentPeriod: { [metric: string]: number },
  previousPeriod: { [metric: string]: number }
): { [metric: string]: { current: number; previous: number; change: number; changePercentage: number } } {
  const comparison: any = {}

  Object.keys(currentPeriod).forEach((metric) => {
    const current = currentPeriod[metric] || 0
    const previous = previousPeriod[metric] || 0
    const change = current - previous
    const changePercentage = calculateGrowthPercentage(previous, current)

    comparison[metric] = {
      current,
      previous,
      change,
      changePercentage,
    }
  })

  return comparison
}

/**
 * Calcula percentil de um valor em um array
 * Útil para benchmark (ex: "Você está no top 10% de engajamento")
 */
export function calculatePercentile(value: number, values: number[]): number {
  if (values.length === 0) return 0

  const sorted = [...values].sort((a, b) => a - b)
  const count = sorted.filter((v) => v <= value).length

  return parseFloat(((count / values.length) * 100).toFixed(1))
}

/**
 * Identifica outliers (posts excepcionalmente bons ou ruins)
 * Usa método do IQR (Interquartile Range)
 */
export function findOutliers(
  posts: Array<{ id: string; engagement: number }>
): { exceptional: any[]; underperforming: any[] } {
  if (posts.length < 4) {
    return { exceptional: [], underperforming: [] }
  }

  const sorted = [...posts].sort((a, b) => a.engagement - b.engagement)
  const q1Index = Math.floor(sorted.length * 0.25)
  const q3Index = Math.floor(sorted.length * 0.75)

  const q1 = sorted[q1Index].engagement
  const q3 = sorted[q3Index].engagement
  const iqr = q3 - q1

  const lowerBound = q1 - 1.5 * iqr
  const upperBound = q3 + 1.5 * iqr

  const exceptional = posts.filter((p) => p.engagement > upperBound)
  const underperforming = posts.filter((p) => p.engagement < lowerBound)

  return { exceptional, underperforming }
}

/**
 * Formata número para exibição (1234 -> 1.2K)
 */
export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  }
  return num.toString()
}

/**
 * Formata percentual para exibição
 */
export function formatPercentage(num: number): string {
  return num.toFixed(1) + '%'
}
