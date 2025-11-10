// Script de diagnóstico completo do RapidAPI
const fs = require('fs')
const path = require('path')

// Carregar .env.local manualmente
const envPath = path.join(__dirname, '..', '.env.local')
const envContent = fs.readFileSync(envPath, 'utf-8')
const envVars = {}
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/)
  if (match) {
    envVars[match[1].trim()] = match[2].trim()
  }
})

const RAPIDAPI_KEY = envVars.RAPIDAPI_KEY || process.env.RAPIDAPI_KEY
const RAPIDAPI_HOST = envVars.RAPIDAPI_HOST || process.env.RAPIDAPI_HOST

console.log('🔍 DIAGNÓSTICO COMPLETO DO RAPIDAPI\n')
console.log('=' .repeat(60))

// 1. Verificar variáveis de ambiente
console.log('\n📋 1. VARIÁVEIS DE AMBIENTE')
console.log('-'.repeat(60))
console.log('RAPIDAPI_KEY:', RAPIDAPI_KEY ? `✅ Configurada (${RAPIDAPI_KEY.length} caracteres)` : '❌ NÃO CONFIGURADA')
console.log('RAPIDAPI_HOST:', RAPIDAPI_HOST ? `✅ ${RAPIDAPI_HOST}` : '❌ NÃO CONFIGURADA')

if (!RAPIDAPI_KEY || !RAPIDAPI_HOST) {
  console.log('\n❌ ERRO: Variáveis de ambiente não configuradas!')
  console.log('Configure RAPIDAPI_KEY e RAPIDAPI_HOST no arquivo .env.local')
  process.exit(1)
}

// 2. Testar conexão com RapidAPI
async function testRapidAPIConnection() {
  console.log('\n🔌 2. TESTE DE CONEXÃO')
  console.log('-'.repeat(60))

  const testEndpoints = [
    {
      name: 'User Info (v1.2)',
      endpoint: 'v1.2/user-info',
      params: { username_or_id_or_url: 'instagram' }
    },
    {
      name: 'User Info (v1)',
      endpoint: 'v1/info',
      params: { username_or_id_or_url: 'instagram' }
    },
    {
      name: 'User Info (sem versão)',
      endpoint: 'info',
      params: { username_or_id_or_url: 'instagram' }
    }
  ]

  for (const test of testEndpoints) {
    const url = new URL(`https://${RAPIDAPI_HOST}/${test.endpoint}`)
    Object.entries(test.params).forEach(([key, value]) => {
      url.searchParams.append(key, value)
    })

    console.log(`\nTestando: ${test.name}`)
    console.log(`Endpoint: /${test.endpoint}`)

    try {
      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'x-rapidapi-host': RAPIDAPI_HOST,
          'x-rapidapi-key': RAPIDAPI_KEY,
        },
      })

      console.log(`Status: ${response.status} ${response.statusText}`)

      if (response.ok) {
        const data = await response.json()
        console.log('✅ SUCESSO!')
        console.log('Dados recebidos:', Object.keys(data).join(', '))
        return { success: true, endpoint: test.endpoint }
      } else {
        const errorText = await response.text()
        console.log('❌ ERRO:', errorText)
      }
    } catch (error) {
      console.log('❌ ERRO DE CONEXÃO:', error.message)
    }
  }

  return { success: false }
}

// 3. Verificar assinatura da API
async function checkSubscription() {
  console.log('\n📝 3. VERIFICAÇÃO DE ASSINATURA')
  console.log('-'.repeat(60))

  console.log('\n⚠️  IMPORTANTE: Para usar o RapidAPI, você precisa:')
  console.log('1. Acessar: https://rapidapi.com/hub')
  console.log('2. Fazer login na sua conta')
  console.log('3. Encontrar uma API do Instagram (ex: Instagram Scraper API2)')
  console.log('4. Clicar em "Subscribe to Test"')
  console.log('5. Escolher um plano (tem planos gratuitos)')
  console.log('6. Copiar o host da API para RAPIDAPI_HOST')
  console.log('7. Copiar sua chave da API para RAPIDAPI_KEY')
}

// Executar diagnóstico
(async () => {
  const result = await testRapidAPIConnection()

  if (!result.success) {
    await checkSubscription()

    console.log('\n' + '='.repeat(60))
    console.log('❌ PROBLEMA IDENTIFICADO:')
    console.log('='.repeat(60))
    console.log('\n🔴 Você NÃO está inscrito na API do Instagram no RapidAPI!')
    console.log('\n📋 PASSOS PARA CORRIGIR:')
    console.log('\n1. Acesse o RapidAPI Hub:')
    console.log('   https://rapidapi.com/hub')
    console.log('\n2. Procure por "Instagram Scraper" ou "Instagram API"')
    console.log('\n3. APIs populares:')
    console.log('   • Instagram Scraper API2: https://rapidapi.com/social-api1-instagram/api/instagram-scraper-api2')
    console.log('   • Instagram Scraper: https://rapidapi.com/junioroangel/api/instagram-scraper')
    console.log('\n4. Clique em "Subscribe to Test"')
    console.log('\n5. Escolha um plano (tem opções gratuitas)')
    console.log('\n6. Copie o HOST da API (ex: instagram-scraper-api2.p.rapidapi.com)')
    console.log('\n7. Atualize o .env.local:')
    console.log('   RAPIDAPI_HOST=<host-da-api>')
    console.log('   RAPIDAPI_KEY=<sua-chave>')
    console.log('\n8. Execute este script novamente para validar')
  } else {
    console.log('\n' + '='.repeat(60))
    console.log('✅ CONFIGURAÇÃO OK!')
    console.log('='.repeat(60))
    console.log(`\nEndpoint funcionando: /${result.endpoint}`)
    console.log('\n✨ O RapidAPI está configurado corretamente!')
    console.log('Você pode começar a usar o sistema de exploração do Instagram.')
  }

  console.log('\n' + '='.repeat(60))
})()
