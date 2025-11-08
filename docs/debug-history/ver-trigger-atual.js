const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Ler .env.local
const envPath = path.join(__dirname, '.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');
const envVars = {};

envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    envVars[match[1].trim()] = match[2].trim();
  }
});

async function verTrigger() {
  console.log('\n═══════════════════════════════════════════════');
  console.log('🔍 VISUALIZANDO FUNÇÃO DO TRIGGER');
  console.log('═══════════════════════════════════════════════\n');

  // Usar fetch para executar SQL via API REST
  const sql = `
    SELECT pg_get_functiondef(oid) as definition
    FROM pg_proc
    WHERE proname = 'handle_new_user'
      AND pronamespace = 'public'::regnamespace;
  `;

  try {
    const response = await fetch(`${envVars.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/rpc/pg_get_functiondef`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': envVars.SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${envVars.SUPABASE_SERVICE_ROLE_KEY}`,
        'Prefer': 'params=single-object'
      },
      body: JSON.stringify({
        funcid: 'public.handle_new_user()'
      })
    });

    if (!response.ok) {
      console.log('❌ Erro na requisição:', response.status, response.statusText);
      console.log('\n💡 Vou ler a última migration aplicada...\n');

      // Ler a última migration que criou/modificou a função
      const migrations = [
        'supabase/migrations/20250108040000_fix_trigger_email_definitivo.sql',
        'supabase/migrations/20250108020000_fix_signup_with_trigger.sql',
        'supabase/migrations/20250107010000_security_system.sql'
      ];

      for (const migPath of migrations) {
        const fullPath = path.join(__dirname, migPath);
        if (fs.existsSync(fullPath)) {
          console.log(`📄 Lendo: ${migPath}\n`);
          const content = fs.readFileSync(fullPath, 'utf-8');

          // Procurar pela função handle_new_user
          const match = content.match(/CREATE OR REPLACE FUNCTION.*?handle_new_user.*?END;?\s*\$\$/s);
          if (match) {
            console.log('✅ Função encontrada na migration:\n');
            console.log('─'.repeat(60));
            console.log(match[0]);
            console.log('─'.repeat(60));
            console.log('\n');

            // Salvar em arquivo para análise
            fs.writeFileSync(
              path.join(__dirname, 'FUNCAO_HANDLE_NEW_USER_ATUAL.sql'),
              match[0]
            );

            console.log('✅ Função salva em: FUNCAO_HANDLE_NEW_USER_ATUAL.sql\n');

            return;
          }
        }
      }

      console.log('⚠️ Não encontrei a função nas migrations\n');
      return;
    }

    const data = await response.json();
    console.log('✅ Função handle_new_user() atual:\n');
    console.log('─'.repeat(60));
    console.log(data);
    console.log('─'.repeat(60));
  } catch (error) {
    console.log('❌ Erro:', error.message);
  }
}

verTrigger().then(() => {
  console.log('\n✓ Visualização concluída\n');
  process.exit(0);
}).catch(err => {
  console.error('\n❌ Erro fatal:', err.message);
  process.exit(1);
});
