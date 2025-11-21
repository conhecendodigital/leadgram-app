// BUG #11 FIX: Logger helper para evitar vazamento de dados em produção

const isProd = process.env.NODE_ENV === 'production'

export const logger = {
  // Logs de desenvolvimento - apenas em dev
  log: (...args: any[]) => {
    if (!isProd) {
      console.log(...args)
    }
  },

  // Logs informativos - sempre logam mas sem dados sensíveis em prod
  info: (...args: any[]) => {
    console.log(...args)
  },

  // Avisos - sempre logam
  warn: (...args: any[]) => {
    console.warn(...args)
  },

  // Erros - sempre logam
  error: (...args: any[]) => {
    console.error(...args)
  },

  // Debug - apenas em desenvolvimento
  debug: (...args: any[]) => {
    if (!isProd) {
      console.debug(...args)
    }
  }
}
