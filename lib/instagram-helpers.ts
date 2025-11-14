/**
 * Helpers para trabalhar com URLs e IDs do Instagram
 */

/**
 * Extrai o shortcode/ID do post de uma URL do Instagram
 *
 * URLs suportadas:
 * - https://www.instagram.com/p/ABC123/
 * - https://instagram.com/p/ABC123/
 * - https://www.instagram.com/reel/ABC123/
 * - https://instagram.com/reel/ABC123/
 *
 * @param url - URL completa do post do Instagram
 * @returns Shortcode do post ou null se URL invalida
 */
export function extractInstagramPostId(url: string): string | null {
  try {
    // Remover espacos extras
    url = url.trim()

    // Regex para capturar /p/SHORTCODE/ ou /reel/SHORTCODE/
    const regex = /(?:instagram\.com\/(?:p|reel)\/)([\w-]+)/i
    const match = url.match(regex)

    if (match && match[1]) {
      return match[1]
    }

    return null
  } catch (error) {
    console.error('Erro ao extrair ID do Instagram:', error)
    return null
  }
}

/**
 * Valida se uma URL e um link valido do Instagram
 *
 * @param url - URL para validar
 * @returns true se for URL valida do Instagram
 */
export function isValidInstagramUrl(url: string): boolean {
  if (!url || typeof url !== 'string') return false

  const regex = /^https?:\/\/(www\.)?instagram\.com\/(p|reel)\/[\w-]+/i
  return regex.test(url.trim())
}

/**
 * Converte shortcode do Instagram para URL completa
 *
 * @param shortcode - Shortcode do post
 * @param type - Tipo do post ('p' ou 'reel')
 * @returns URL completa do post
 */
export function instagramShortcodeToUrl(shortcode: string, type: 'p' | 'reel' = 'p'): string {
  return `https://www.instagram.com/${type}/${shortcode}/`
}

/**
 * Normaliza uma URL do Instagram (remove query params, trailing slash, etc)
 *
 * @param url - URL do Instagram
 * @returns URL normalizada
 */
export function normalizeInstagramUrl(url: string): string | null {
  const shortcode = extractInstagramPostId(url)
  if (!shortcode) return null

  // Detectar se e reel ou post normal
  const isReel = url.includes('/reel/')
  return instagramShortcodeToUrl(shortcode, isReel ? 'reel' : 'p')
}
