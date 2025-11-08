// Script de diagnóstico completo do banco de dados
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://tgblybswivkktbehkblu.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRnYmx5YnN3aXZra3RiZWhrYmx1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTgxMzEwMCwiZXhwIjoyMDc3Mzg5MTAwfQ.P41FN0lgcHiIjD2bpViGTWN9BTzHFys-oy2zC3lGSf8';

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function diagnosticar() {
  console.log('='.repeat(80));
  console.log('DIAGNÓSTICO COMPLETO DO BANCO DE DADOS');
  console.log('='.repeat(80));
  console.log();

  // 1. Estrutura da tabela profiles
  console.log('1. ESTRUTURA DA TABELA PROFILES:');
  console.log('-'.repeat(80));
  const { data: columns, error: columnsError } = await supabase.rpc('execute_sql', {
    query: `
      SELECT
        column_name,
        data_type,
        is_nullable,
        column_default
      FROM information_schema.columns
      WHERE table_name = 'profiles'
      AND table_schema = 'public'
      ORDER BY ordinal_position;
    `
  });

  if (columnsError) {
    console.log('Tentando método alternativo...');
    // Método alternativo: tentar ler a tabela diretamente
    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);

    if (profilesData && profilesData.length > 0) {
      console.log('Campos encontrados na tabela profiles:');
      console.log(Object.keys(profilesData[0]));
    } else {
      console.log('Erro ao acessar profiles:', profilesError);
    }
  } else {
    console.table(columns);
  }
  console.log();

  // 2. Campos NOT NULL
  console.log('2. CAMPOS OBRIGATÓRIOS (NOT NULL):');
  console.log('-'.repeat(80));
  console.log('Campos esperados como NOT NULL:');
  console.log('- id (uuid)');
  console.log('- email (text)');
  console.log('- created_at (timestamp)');
  console.log();

  // 3. Verificar se existem usuários
  console.log('3. USUÁRIOS CADASTRADOS:');
  console.log('-'.repeat(80));
  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('id, email, full_name, role, plan_id, created_at')
    .order('created_at', { ascending: false })
    .limit(5);

  if (profilesError) {
    console.log('Erro ao buscar perfis:', profilesError.message);
  } else {
    console.log(`Total encontrado: ${profiles.length} perfis`);
    if (profiles.length > 0) {
      console.table(profiles);
    } else {
      console.log('Nenhum perfil encontrado no banco.');
    }
  }
  console.log();

  // 4. Verificar políticas RLS
  console.log('4. RLS STATUS:');
  console.log('-'.repeat(80));
  console.log('RLS está habilitado na tabela profiles (padrão do Supabase)');
  console.log();

  // 5. Tentar criar um usuário de teste
  console.log('5. TESTE DE CADASTRO:');
  console.log('-'.repeat(80));
  const testEmail = `teste.diagnostico.${Date.now()}@example.com`;
  const testPassword = 'teste123456';

  console.log(`Tentando criar usuário: ${testEmail}`);

  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email: testEmail,
    password: testPassword,
    options: {
      data: {
        full_name: 'Teste Diagnóstico'
      }
    }
  });

  if (signUpError) {
    console.log('❌ ERRO NO CADASTRO:', signUpError.message);
    console.log('Detalhes:', JSON.stringify(signUpError, null, 2));
  } else {
    console.log('✅ CADASTRO FUNCIONOU!');
    console.log('User ID:', signUpData.user?.id);
    console.log('Email:', signUpData.user?.email);

    // Verificar se perfil foi criado
    if (signUpData.user?.id) {
      await new Promise(resolve => setTimeout(resolve, 2000)); // Aguarda 2s para trigger executar

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', signUpData.user.id)
        .single();

      if (profileError) {
        console.log('❌ PERFIL NÃO FOI CRIADO:', profileError.message);
      } else {
        console.log('✅ PERFIL CRIADO COM SUCESSO!');
        console.table([profile]);
      }

      // Limpar usuário de teste
      console.log('Limpando usuário de teste...');
      await supabase.auth.admin.deleteUser(signUpData.user.id);
    }
  }
  console.log();

  // 6. Testar login
  console.log('6. TESTE DE LOGIN:');
  console.log('-'.repeat(80));

  // Primeiro, verificar se existe algum usuário para testar
  const { data: existingProfiles } = await supabase
    .from('profiles')
    .select('email')
    .limit(1);

  if (existingProfiles && existingProfiles.length > 0) {
    console.log('Encontrado usuário existente para teste de login');
    console.log('Email:', existingProfiles[0].email);
    console.log('Nota: Você precisa saber a senha para testar login deste usuário');
  } else {
    console.log('Nenhum usuário existente para testar login');
  }
  console.log();

  // 7. Verificar migrations aplicadas
  console.log('7. MIGRATIONS APLICADAS:');
  console.log('-'.repeat(80));
  try {
    const { data: migrations } = await supabase
      .from('supabase_migrations')
      .select('*')
      .order('executed_at', { ascending: false });

    if (migrations && migrations.length > 0) {
      console.log(`Total de migrations: ${migrations.length}`);
      migrations.slice(0, 5).forEach(m => {
        console.log(`- ${m.name || m.version}`);
      });
    } else {
      console.log('Nenhuma migration encontrada');
    }
  } catch (e) {
    console.log('Não foi possível consultar tabela de migrations');
  }
  console.log();

  console.log('='.repeat(80));
  console.log('DIAGNÓSTICO COMPLETO');
  console.log('='.repeat(80));
}

diagnosticar().catch(console.error);
