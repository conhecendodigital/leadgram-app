// Script para verificar constraints e triggers
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://tgblybswivkktbehkblu.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRnYmx5YnN3aXZra3RiZWhrYmx1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTgxMzEwMCwiZXhwIjoyMDc3Mzg5MTAwfQ.P41FN0lgcHiIjD2bpViGTWN9BTzHFys-oy2zC3lGSf8';

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function verificarDetalhes() {
  console.log('='.repeat(80));
  console.log('INVESTIGAÇÃO DETALHADA DO ERRO DE CADASTRO');
  console.log('='.repeat(80));
  console.log();

  // Tentar criar usuário diretamente via service role
  console.log('1. TESTE: Criar perfil DIRETAMENTE (bypass RLS):');
  console.log('-'.repeat(80));

  const testId = 'f0000000-0000-0000-0000-000000000000';
  const testEmail = `teste.direto.${Date.now()}@example.com`;

  const { data: insertData, error: insertError } = await supabase
    .from('profiles')
    .insert({
      id: testId,
      email: testEmail,
      full_name: 'Teste Direto',
      role: 'user',
      plan_id: 'free',
      ideas_limit: 10,
      ideas_used: 0
    })
    .select();

  if (insertError) {
    console.log('❌ INSERT direto FALHOU:', insertError.message);
    console.log('Detalhes:', JSON.stringify(insertError, null, 2));
  } else {
    console.log('✅ INSERT direto FUNCIONOU!');
    console.table(insertData);

    // Limpar teste
    await supabase.from('profiles').delete().eq('id', testId);
    console.log('Teste limpo.');
  }
  console.log();

  // Testar criação de usuário sem signup (apenas perfil)
  console.log('2. TESTE: SignUp com email confirmation DESABILITADO:');
  console.log('-'.repeat(80));

  const testEmail2 = `teste.signup.${Date.now()}@example.com`;
  console.log(`Tentando signup: ${testEmail2}`);

  const { data: signupData, error: signupError } = await supabase.auth.signUp({
    email: testEmail2,
    password: 'senhateste123456',
    options: {
      data: {
        full_name: 'Teste Signup'
      },
      emailRedirectTo: undefined  // Sem redirect
    }
  });

  if (signupError) {
    console.log('❌ SIGNUP FALHOU:', signupError.message);
    console.log('Status:', signupError.status);
    console.log('Code:', signupError.code || signupError.__isAuthError);
    console.log();
    console.log('Detalhes completos:');
    console.log(JSON.stringify(signupError, null, 2));
  } else {
    console.log('✅ SIGNUP FUNCIONOU!');
    console.log('User ID:', signupData.user?.id);
    console.log('Email:', signupData.user?.email);
    console.log('Session:', signupData.session ? 'Criada' : 'Não criada (email confirmation)');

    // Aguardar trigger executar
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Verificar se perfil foi criado
    if (signupData.user?.id) {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', signupData.user.id)
        .single();

      if (profileError) {
        console.log('❌ PERFIL NÃO FOI CRIADO PELO TRIGGER:', profileError.message);
      } else {
        console.log('✅ PERFIL CRIADO PELO TRIGGER:');
        console.table([profile]);
      }

      // Limpar usuário de teste
      console.log('\nLimpando usuário de teste...');
      await supabase.auth.admin.deleteUser(signupData.user.id);
      console.log('✓ Teste limpo');
    }
  }
  console.log();

  console.log('='.repeat(80));
  console.log('INVESTIGAÇÃO COMPLETA');
  console.log('='.repeat(80));
}

verificarDetalhes().catch(console.error);
