// Script para verificar o uso da RapidAPI e testar endpoints
const fs = require('fs')
const path = require('path')

// Ler .env.local manualmente
const envPath = path.join(__dirname, '..', '.env.local')
const envContent = fs.readFileSync(envPath, 'utf-8')

const RAPIDAPI_KEY = envContent.match(/RAPIDAPI_KEY=(.+)/)?.[1]?.trim()
const RAPIDAPI_HOST = envContent.match(/RAPIDAPI_HOST=(.+)/)?.[1]?.trim()

async function verificarLimiteRapidAPI() {
  console.log('🔍 Verificando status da RapidAPI...\n')

  // 1. Verificar credenciais
  console.log('📋 Credenciais:')
  console.log(`   RAPIDAPI_KEY: ${RAPIDAPI_KEY ? '✅ Configurada' : '❌ Não encontrada'}`)
  console.log(`   RAPIDAPI_HOST: ${RAPIDAPI_HOST || '❌ Não encontrado'}`)
  console.log()

  if (!RAPIDAPI_KEY || !RAPIDAPI_HOST) {
    console.error('❌ Credenciais não configuradas!')
    return
  }

  // 2. Testar chamada simples
  console.log('🧪 Testando chamada à API...')

  try {
    const response = await fetch(`https://${RAPIDAPI_HOST}/userinfo?username_or_id=instagram`, {
      method: 'GET',
      headers: {
        'x-rapidapi-host': RAPIDAPI_HOST,
        'x-rapidapi-key': RAPIDAPI_KEY,
      },
    })

    console.log(`   Status: ${response.status} ${response.statusText}`)
    console.log(`   Rate Limit Remaining: ${response.headers.get('x-ratelimit-requests-remaining') || 'N/A'}`)
    console.log(`   Rate Limit Total: ${response.headers.get('x-ratelimit-requests-limit') || 'N/A'}`)
    console.log()

    if (response.status === 429) {
      console.error('❌ LIMITE DE REQUISIÇÕES ATINGIDO!')
      console.error('   Você atingiu o limite de 50 requests/mês do plano Free.')
      console.error('   Próximo reset: Início do próximo mês')
      console.error()
      console.error('💡 Soluções:')
      console.error('   1. Aguardar o reset mensal')
      console.error('   2. Upgrade para plano pago (Basic: $10/mês = 500 requests)')
      console.error('   3. Usar modo fallback (apenas perfis populares)')
      return false
    }

    if (response.status === 403) {
      console.error('❌ CHAVE DE API INVÁLIDA!')
      console.error('   Verifique se a chave está correta no RapidAPI dashboard')
      return false
    }

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`❌ Erro: ${errorText}`)
      return false
    }

    const data = await response.json()
    console.log('✅ API funcionando corretamente!')
    console.log(`   Username testado: ${data.data?.username || data.username || 'N/A'}`)
    console.log()

    return true

  } catch (error) {
    console.error('❌ Erro na chamada:', error.message)
    return false
  }
}

// 3. Instruções
async function main() {
  const isWorking = await verificarLimiteRapidAPI()

  if (!isWorking) {
    console.log('\n📊 Verificar uso no dashboard:')
    console.log('   https://rapidapi.com/developer/dashboard')
    console.log()
    console.log('🔧 Para continuar sem API:')
    console.log('   - Os perfis populares continuarão funcionando')
    console.log('   - Busca de perfis novos ficará desabilitada')
    console.log('   - Considere upgrade do plano se necessário')
  }
}

main()
