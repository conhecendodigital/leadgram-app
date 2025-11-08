// Script para listar TODOS os triggers em auth.users
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://tgblybswivkktbehkblu.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRnYmx5YnN3aXZra3RiZWhrYmx1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTgxMzEwMCwiZXhwIjoyMDc3Mzg5MTAwfQ.P41FN0lgcHiIjD2bpViGTWN9BTzHFys-oy2zC3lGSf8';

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function verificarTriggers() {
  console.log('='.repeat(80));
  console.log('LISTANDO TODOS OS TRIGGERS');
  console.log('='.repeat(80));
  console.log();

  // Verificar se conseguimos fazer signup direto sem trigger
  console.log('1. TESTE: Desabilitar trigger temporariamente e testar signup');
  console.log('-'.repeat(80));
  console.log();

  // Primeiro, vamos ver os logs do Supabase
  console.log('Para verificar o erro exato, vamos tentar criar um usuário');
  console.log('e capturar qualquer erro mais detalhado...');
  console.log();

  const testEmail = `teste.debug.${Date.now()}@example.com`;
  console.log(`Tentando criar: ${testEmail}`);
  console.log();

  try {
    const { data, error } = await supabase.auth.signUp({
      email: testEmail,
      password: 'senha123456789',
      options: {
        data: {
          full_name: 'Teste Debug'
        }
      }
    });

    if (error) {
      console.log('❌ ERRO:', error.message);
      console.log('Status:', error.status);
      console.log();

      // Tentar capturar mais detalhes
      console.log('Detalhes do objeto error:');
      Object.keys(error).forEach(key => {
        if (error[key] && typeof error[key] !== 'function') {
          console.log(`  ${key}:`, error[key]);
        }
      });
    } else {
      console.log('✅ Signup funcionou!');
      console.log('User:', data.user?.id);

      // Verificar se perfil foi criado
      await new Promise(r => setTimeout(r, 3000));

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (profile) {
        console.log('✅ Perfil criado:');
        console.table([profile]);
      } else {
        console.log('❌ Perfil NÃO foi criado');
      }

      // Limpar
      await supabase.auth.admin.deleteUser(data.user.id);
    }
  } catch (e) {
    console.log('❌ Exception:', e.message);
    console.log('Stack:', e.stack);
  }

  console.log();
  console.log('='.repeat(80));
  console.log('ANÁLISE');
  console.log('='.repeat(80));
  console.log();
  console.log('O erro "Database error saving new user" é muito genérico.');
  console.log('Ele pode significar:');
  console.log('1. Trigger falhando durante execução');
  console.log('2. Constraint sendo violada em QUALQUER tabela');
  console.log('3. Permission negada em alguma operação');
  console.log('4. Erro na função do trigger');
  console.log();
  console.log('Para investigar mais, precisamos:');
  console.log('- Acessar os logs do Supabase Dashboard');
  console.log('- Ver Postgres Logs na seção Logs do projeto');
  console.log('- Procurar por erros detalhados na query');
  console.log();
  console.log('OU');
  console.log();
  console.log('- Temporariamente desabilitar o trigger');
  console.log('- Testar signup sem trigger');
  console.log('- Reabilitar trigger');
  console.log();
}

verificarTriggers().catch(console.error);
