const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Ler .env.local manualmente
const envPath = path.join(__dirname, '.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');
const envVars = {};

envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    envVars[match[1].trim()] = match[2].trim();
  }
});

const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = envVars.SUPABASE_SERVICE_ROLE_KEY;

console.log('🔗 Conectando ao Supabase...');
console.log('URL:', supabaseUrl);
console.log('Service Key:', serviceKey ? '✓ Presente' : '❌ Ausente');

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function verificarEstado() {
  console.log('\n═══════════════════════════════════════════════');
  console.log('🔍 VERIFICAÇÃO FINAL DO ESTADO DO BANCO');
  console.log('═══════════════════════════════════════════════\n');

  // 1. Tentar criar um usuário de teste
  console.log('1️⃣ Testando signup direto via Supabase Admin API...\n');

  const testEmail = `teste.${Date.now()}@example.com`;
  const testPassword = 'senha123456';

  const { data: signupData, error: signupError } = await supabase.auth.admin.createUser({
    email: testEmail,
    password: testPassword,
    email_confirm: true,
    user_metadata: {
      full_name: 'Teste Verificação'
    }
  });

  if (signupError) {
    console.log('❌ ERRO AO CRIAR USUÁRIO:\n');
    console.log('Código:', signupError.code || signupError.status);
    console.log('Mensagem:', signupError.message);
    console.log('Detalhes:', JSON.stringify(signupError, null, 2));
    console.log('\n⚠️ O problema ainda existe!\n');

    // Ver se é erro de FK
    if (signupError.message.includes('foreign key') ||
        signupError.message.includes('violates') ||
        signupError.message.includes('Database error')) {
      console.log('💡 Causa provável: FK Constraints ainda presentes\n');
      console.log('📝 O SQL no Dashboard pode não ter sido executado corretamente.\n');
      console.log('🔧 Ações sugeridas:');
      console.log('   1. Acesse o SQL Editor do Supabase');
      console.log('   2. Execute este SQL específico:\n');
      console.log('   ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey CASCADE;');
      console.log('   ALTER TABLE public.user_subscriptions DROP CONSTRAINT IF EXISTS user_subscriptions_user_id_fkey CASCADE;');
      console.log('   ALTER TABLE public.payments DROP CONSTRAINT IF EXISTS payments_user_id_fkey CASCADE;\n');
    }

    return;
  }

  console.log('✅ Usuário criado com sucesso!\n');
  console.log('ID:', signupData.user.id);
  console.log('Email:', signupData.user.email);
  console.log('\n2️⃣ Verificando se perfil foi criado automaticamente...\n');

  // 2. Verificar se perfil foi criado
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', signupData.user.id)
    .single();

  if (profileError) {
    console.log('⚠️ Perfil não foi criado automaticamente');
    console.log('Erro:', profileError.message);
    console.log('\n💡 Causa provável: Trigger handle_new_user() não disparou\n');
    return;
  }

  console.log('✅ Perfil criado automaticamente!\n');
  console.log('Email:', profile.email);
  console.log('Nome:', profile.full_name);
  console.log('Role:', profile.role);
  console.log('\n═══════════════════════════════════════════════');
  console.log('🎉 SISTEMA FUNCIONANDO 100%!');
  console.log('═══════════════════════════════════════════════\n');

  console.log('✓ Signup via Admin API: OK');
  console.log('✓ Trigger handle_new_user(): OK');
  console.log('✓ Perfil criado automaticamente: OK');
  console.log('\n🚀 Agora teste no navegador:');
  console.log('   http://localhost:3000/register\n');

  // Limpar usuário de teste
  console.log('🧹 Limpando usuário de teste...\n');
  await supabase.auth.admin.deleteUser(signupData.user.id);
  console.log('✓ Usuário de teste removido\n');
}

verificarEstado().then(() => {
  console.log('✓ Verificação concluída\n');
  process.exit(0);
}).catch(err => {
  console.error('\n❌ Erro fatal:', err.message);
  console.error('Stack:', err.stack);
  process.exit(1);
});
