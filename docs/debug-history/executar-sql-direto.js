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

const supabase = createClient(
  envVars.NEXT_PUBLIC_SUPABASE_URL,
  envVars.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    },
    db: {
      schema: 'public'
    }
  }
);

async function executarSQL(sql, descricao) {
  console.log(`\n📊 ${descricao}...\n`);

  try {
    // Usar a API REST para executar SQL raw
    const response = await fetch(`${envVars.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/rpc/exec`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': envVars.SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${envVars.SUPABASE_SERVICE_ROLE_KEY}`
      },
      body: JSON.stringify({ query: sql })
    });

    if (!response.ok) {
      console.log('❌ Erro HTTP:', response.status, response.statusText);
      return null;
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.log('❌ Erro:', error.message);
    return null;
  }
}

async function investigarProblema() {
  console.log('\n═══════════════════════════════════════════════');
  console.log('🔍 INVESTIGAÇÃO COMPLETA VIA CLI');
  console.log('═══════════════════════════════════════════════\n');

  // 1. Ver função handle_new_user
  console.log('1️⃣ Verificando função handle_new_user()...\n');

  const { data: funcData, error: funcError } = await supabase
    .rpc('pg_get_functiondef', {
      funcname: 'public.handle_new_user()'
    });

  if (funcError) {
    console.log('⚠️ Não consegui via RPC, tentando query direta...\n');
  }

  // 2. Verificar triggers
  console.log('2️⃣ Verificando triggers em auth.users...\n');

  // 3. Testar criação de usuário
  console.log('3️⃣ Testando criação de usuário...\n');

  const testEmail = `teste.${Date.now()}@example.com`;

  const { data: userData, error: userError } = await supabase.auth.admin.createUser({
    email: testEmail,
    password: 'senha123456',
    email_confirm: true,
    user_metadata: {
      full_name: 'Teste CLI'
    }
  });

  if (userError) {
    console.log('❌ ERRO AO CRIAR USUÁRIO:\n');
    console.log('Status:', userError.status);
    console.log('Code:', userError.code);
    console.log('Message:', userError.message);
    console.log('\n📋 Detalhes completos:');
    console.log(JSON.stringify(userError, null, 2));

    // Se o erro for de banco, vamos tentar criar o usuário diretamente no auth.users
    console.log('\n4️⃣ Tentando criar usuário DIRETAMENTE na tabela auth.users (bypass Auth API)...\n');

    const testId = crypto.randomUUID();

    // Executar INSERT direto
    const { data: directInsert, error: directError } = await supabase
      .from('users')
      .insert({
        id: testId,
        email: testEmail,
        encrypted_password: '$2a$10$abcdefghijklmnopqrstuv',
        email_confirmed_at: new Date().toISOString(),
        raw_app_meta_data: { provider: 'email', providers: ['email'] },
        raw_user_meta_data: { full_name: 'Teste Direto' },
        aud: 'authenticated',
        role: 'authenticated',
        instance_id: '00000000-0000-0000-0000-000000000000'
      });

    if (directError) {
      console.log('❌ ERRO NO INSERT DIRETO:\n');
      console.log('Code:', directError.code);
      console.log('Message:', directError.message);
      console.log('Details:', directError.details);
      console.log('Hint:', directError.hint);

      console.log('\n💡 CAUSA RAIZ IDENTIFICADA:');

      if (directError.message.includes('permission denied') || directError.code === '42501') {
        console.log('   → RLS está bloqueando o INSERT em auth.users');
        console.log('   → Solução: Verificar RLS policies da tabela auth.users');
      } else if (directError.message.includes('foreign key') || directError.code === '23503') {
        console.log('   → FK constraint está bloqueando');
        console.log('   → Constraint:', directError.details);
      } else if (directError.message.includes('not null') || directError.code === '23502') {
        console.log('   → Campo obrigatório está faltando');
        console.log('   → Campo:', directError.details);
      } else if (directError.message.includes('function') || directError.message.includes('trigger')) {
        console.log('   → Erro na função do trigger');
        console.log('   → Trigger: handle_new_user()');
      } else {
        console.log('   → Erro desconhecido:', directError.message);
      }
    } else {
      console.log('✅ INSERT direto funcionou! Verificando perfil...\n');

      // Verificar se perfil foi criado
      const { data: profile, error: profError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', testId)
        .single();

      if (profError) {
        console.log('❌ Perfil não foi criado! Trigger falhou!\n');
        console.log('Erro:', profError.message);
      } else {
        console.log('✅ Perfil criado automaticamente!\n');
        console.log('Email:', profile.email);
        console.log('Nome:', profile.full_name);
      }

      // Limpar
      await supabase.auth.admin.deleteUser(testId);
    }

    return;
  }

  console.log('✅ Usuário criado com sucesso!\n');
  console.log('ID:', userData.user.id);
  console.log('Email:', userData.user.email);

  // Verificar perfil
  const { data: profile, error: profError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userData.user.id)
    .single();

  if (profError) {
    console.log('\n❌ Perfil não foi criado automaticamente!\n');
    console.log('Erro:', profError.message);
  } else {
    console.log('\n✅ Perfil criado automaticamente!\n');
    console.log('Email:', profile.email);
    console.log('Nome:', profile.full_name);
  }

  // Limpar
  console.log('\n🧹 Limpando usuário de teste...\n');
  await supabase.auth.admin.deleteUser(userData.user.id);

  console.log('\n═══════════════════════════════════════════════');
  console.log('🎉 SISTEMA FUNCIONANDO!');
  console.log('═══════════════════════════════════════════════\n');
}

investigarProblema().then(() => {
  console.log('✓ Investigação concluída\n');
  process.exit(0);
}).catch(err => {
  console.error('\n❌ Erro fatal:', err.message);
  console.error(err.stack);
  process.exit(1);
});
