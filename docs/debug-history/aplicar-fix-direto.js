// Script para aplicar as correções SQL diretamente
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabaseUrl = 'https://tgblybswivkktbehkblu.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRnYmx5YnN3aXZra3RiZWhrYmx1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTgxMzEwMCwiZXhwIjoyMDc3Mzg5MTAwfQ.P41FN0lgcHiIjD2bpViGTWN9BTzHFys-oy2zC3lGSf8';

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function aplicarCorrecoes() {
  console.log('='.repeat(80));
  console.log('APLICANDO CORREÇÕES DIRETAMENTE');
  console.log('='.repeat(80));
  console.log();

  // SQL para remover TODAS as FK constraints
  const sql = `
    -- Remover FK de profiles
    ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey CASCADE;
    ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_user_id_fkey CASCADE;

    -- Remover FK de user_subscriptions
    ALTER TABLE public.user_subscriptions DROP CONSTRAINT IF EXISTS user_subscriptions_user_id_fkey CASCADE;

    -- Remover FK de payments
    ALTER TABLE public.payments DROP CONSTRAINT IF EXISTS payments_user_id_fkey CASCADE;
  `;

  console.log('Executando SQL...');
  console.log(sql);
  console.log();

  try {
    // Note: A API do Supabase não expõe execução de SQL arbitrário por segurança
    // Vamos usar uma abordagem alternativa: tentar fazer signup e ver o erro

    console.log('⚠️  Não é possível executar SQL arbitrário via API do Supabase');
    console.log('    (por questões de segurança, apenas Supabase CLI ou Dashboard SQL Editor)');
    console.log();
    console.log('Testando signup diretamente...');
    console.log();

    const testEmail = `teste.final.${Date.now()}@example.com`;

    const { data, error } = await supabase.auth.signUp({
      email: testEmail,
      password: 'senha123456789',
      options: {
        data: {
          full_name: 'Teste Final'
        }
      }
    });

    if (error) {
      console.log('❌ ERRO NO SIGNUP:', error.message);
      console.log('Status:', error.status);
      console.log('Code:', error.code);
      console.log();
      console.log('Erro completo:');
      console.log(JSON.stringify(error, null, 2));
    } else {
      console.log('✅ SIGNUP FUNCIONOU!');
      console.log('User ID:', data.user?.id);
      console.log('Email:', data.user?.email);

      // Aguardar trigger
      await new Promise(r => setTimeout(r, 3000));

      // Verificar perfil
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (profile) {
        console.log('✅ Perfil criado com sucesso!');
        console.table([profile]);
      } else {
        console.log('❌ Perfil não foi criado');
      }

      // Limpar
      await supabase.auth.admin.deleteUser(data.user.id);
    }

  } catch (e) {
    console.error('Exception:', e);
  }

  console.log();
  console.log('='.repeat(80));
  console.log('PARA APLICAR AS CORREÇÕES MANUALMENTE:');
  console.log('='.repeat(80));
  console.log();
  console.log('1. Acesse: https://supabase.com/dashboard/project/tgblybswivkktbehkblu/sql/new');
  console.log();
  console.log('2. Cole e execute o seguinte SQL:');
  console.log();
  console.log('```sql');
  console.log('-- Remover TODAS as FK constraints para auth.users');
  console.log('ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey CASCADE;');
  console.log('ALTER TABLE public.user_subscriptions DROP CONSTRAINT IF EXISTS user_subscriptions_user_id_fkey CASCADE;');
  console.log('ALTER TABLE public.payments DROP CONSTRAINT IF EXISTS payments_user_id_fkey CASCADE;');
  console.log('```');
  console.log();
  console.log('3. Depois teste novamente o signup');
  console.log();
  console.log('='.repeat(80));
}

aplicarCorrecoes().catch(console.error);
