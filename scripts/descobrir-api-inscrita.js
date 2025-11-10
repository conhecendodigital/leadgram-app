// Script para descobrir em qual API do Instagram a chave está inscrita
const fs = require('fs')
const path = require('path')

// Carregar .env.local
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

console.log('🔍 DESCOBRINDO QUAL API ESTÁ INSCRITA\n')
console.log('='.repeat(80))
console.log('\n📋 Testando com a chave atual do .env.local')
console.log('Chave:', RAPIDAPI_KEY ? `${RAPIDAPI_KEY.substring(0, 20)}...` : 'NÃO ENCONTRADA')

if (!RAPIDAPI_KEY) {
  console.log('\n❌ RAPIDAPI_KEY não encontrada!')
  process.exit(1)
}

// Lista de APIs populares do Instagram para testar
const apisParaTestar = [
  {
    nome: 'Instagram Scraper API2 (v1.2)',
    host: 'instagram-scraper-api2.p.rapidapi.com',
    endpoints: [
      { path: 'v1.2/user-info', params: { username_or_id_or_url: 'instagram' } },
      { path: 'v1.2/info', params: { username_or_id_or_url: 'instagram' } }
    ]
  },
  {
    nome: 'Instagram Scraper API2 (v1)',
    host: 'instagram-scraper-api2.p.rapidapi.com',
    endpoints: [
      { path: 'v1/info', params: { username_or_id_or_url: 'instagram' } },
      { path: 'v1/user-info', params: { username_or_id_or_url: 'instagram' } }
    ]
  },
  {
    nome: 'Instagram Scraper 2025',
    host: 'instagram-scraper-20251.p.rapidapi.com',
    endpoints: [
      { path: 'userinfo/username_or_id=instagram', params: {} }
    ]
  },
  {
    nome: 'Instagram Scraper Stable API',
    host: 'instagram-scraper-stable-api.p.rapidapi.com',
    endpoints: [
      { path: 'user', params: { username: 'instagram' } },
      { path: 'info', params: { username: 'instagram' } }
    ]
  },
  {
    nome: 'Instagram API (Fast & Reliable)',
    host: 'instagram-fast-api.p.rapidapi.com',
    endpoints: [
      { path: 'user/info', params: { username: 'instagram' } },
      { path: 'userinfo', params: { username: 'instagram' } }
    ]
  },
  {
    nome: 'Instagram Data',
    host: 'instagram-data1.p.rapidapi.com',
    endpoints: [
      { path: 'user/info', params: { username: 'instagram' } },
      { path: 'profile', params: { username: 'instagram' } }
    ]
  },
  {
    nome: 'Instagram Bulk Profile Scrapper',
    host: 'instagram-bulk-profile-scrapper.p.rapidapi.com',
    endpoints: [
      { path: 'clients/api/ig/ig_profile', params: { ig: 'instagram' } }
    ]
  }
]

async function testarAPI(api) {
  console.log(`\n${'='.repeat(80)}`)
  console.log(`📡 Testando: ${api.nome}`)
  console.log(`   Host: ${api.host}`)
  console.log('-'.repeat(80))

  for (const endpoint of api.endpoints) {
    const url = new URL(`https://${api.host}/${endpoint.path}`)

    if (Object.keys(endpoint.params).length > 0) {
      Object.entries(endpoint.params).forEach(([key, value]) => {
        url.searchParams.append(key, value)
      })
    }

    console.log(`\n   Endpoint: /${endpoint.path}`)
    console.log(`   URL: ${url.pathname}${url.search}`)

    try {
      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'x-rapidapi-host': api.host,
          'x-rapidapi-key': RAPIDAPI_KEY,
        },
      })

      console.log(`   Status: ${response.status} ${response.statusText}`)

      if (response.status === 200) {
        const data = await response.json()
        console.log(`   ✅ SUCESSO! Esta é a API correta!`)
        console.log(`   📦 Dados recebidos:`, Object.keys(data).slice(0, 10).join(', '))
        return { sucesso: true, api, endpoint, data }
      } else if (response.status === 403) {
        const errorText = await response.text()
        if (errorText.includes('not subscribed')) {
          console.log(`   ❌ Não inscrito nesta API`)
        } else {
          console.log(`   ❌ Erro 403:`, errorText.substring(0, 100))
        }
      } else if (response.status === 404) {
        console.log(`   ❌ Endpoint não existe`)
      } else if (response.status === 429) {
        console.log(`   ⚠️  Rate limit atingido`)
      } else {
        const errorText = await response.text()
        console.log(`   ❌ Erro:`, errorText.substring(0, 100))
      }
    } catch (error) {
      console.log(`   ❌ Erro de conexão:`, error.message)
    }
  }

  return { sucesso: false }
}

async function descobrirAPI() {
  console.log('\n\n🔎 INICIANDO TESTES...\n')

  for (const api of apisParaTestar) {
    const resultado = await testarAPI(api)

    if (resultado.sucesso) {
      console.log('\n\n' + '='.repeat(80))
      console.log('🎉 API ENCONTRADA!')
      console.log('='.repeat(80))
      console.log('\n✅ A chave do seu chefe está inscrita em:')
      console.log(`   Nome: ${resultado.api.nome}`)
      console.log(`   Host: ${resultado.api.host}`)
      console.log(`   Endpoint que funciona: /${resultado.endpoint.path}`)
      console.log('\n📝 AÇÕES NECESSÁRIAS:')
      console.log('\n1. Atualizar o .env.local com:')
      console.log(`   RAPIDAPI_HOST=${resultado.api.host}`)
      console.log('\n2. Atualizar os endpoints no código conforme a API encontrada')
      console.log('\n3. Rodar: node scripts/diagnostico-rapidapi.js')
      console.log('\n' + '='.repeat(80))
      return
    }

    // Pequeno delay entre testes
    await new Promise(resolve => setTimeout(resolve, 500))
  }

  console.log('\n\n' + '='.repeat(80))
  console.log('❌ NENHUMA API FUNCIONOU')
  console.log('='.repeat(80))
  console.log('\n🔴 Possíveis causas:')
  console.log('   1. A chave está inscrita em uma API que não testamos')
  console.log('   2. A chave expirou ou foi revogada')
  console.log('   3. O plano gratuito acabou')
  console.log('   4. A API mudou seus endpoints')
  console.log('\n💡 Sugestões:')
  console.log('   1. Peça ao seu chefe para verificar no RapidAPI Dashboard qual API ele inscreveu')
  console.log('   2. Acesse: https://rapidapi.com/developer/dashboard')
  console.log('   3. Vá em "My Subscriptions" para ver as APIs ativas')
  console.log('   4. Ou inscreva-se em uma nova API (50 requests/mês grátis)')
  console.log('\n' + '='.repeat(80))
}

// Executar
descobrirAPI().catch(console.error)
