// Script para verificar estrutura da tabela auth.users
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://tgblybswivkktbehkblu.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRnYmx5YnN3aXZra3RiZWhrYmx1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTgxMzEwMCwiZXhwIjoyMDc3Mzg5MTAwfQ.P41FN0lgcHiIjD2bpViGTWN9BTzHFys-oy2zC3lGSf8';

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function verificarAuthUsers() {
  console.log('='.repeat(80));
  console.log('VERIFICAÇÃO DA TABELA auth.users');
  console.log('='.repeat(80));
  console.log();

  // Listar todos os usuários via Admin API
  console.log('1. LISTANDO USUÁRIOS VIA ADMIN API:');
  console.log('-'.repeat(80));

  const { data: { users }, error } = await supabase.auth.admin.listUsers();

  if (error) {
    console.log('Erro ao listar usuários:', error.message);
  } else {
    console.log(`Total de usuários: ${users.length}`);
    console.log();

    users.forEach((user, index) => {
      console.log(`\n📧 Usuário ${index + 1}:`);
      console.log(`   ID: ${user.id}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Created: ${user.created_at}`);
      console.log(`   Last Sign In: ${user.last_sign_in_at || 'Nunca'}`);
      console.log(`   User Metadata:`, JSON.stringify(user.user_metadata, null, 2));
      console.log(`   Raw User Metadata:`, JSON.stringify(user.raw_user_meta_data, null, 2));
    });
  }

  console.log();
  console.log('='.repeat(80));

  // Verificar correspondência com profiles
  console.log('\n2. CORRESPONDÊNCIA auth.users ↔️ profiles:');
  console.log('-'.repeat(80));

  if (users) {
    for (const user of users) {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id, email, full_name')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.log(`❌ Usuário ${user.email}: PERFIL NÃO EXISTE`);
      } else {
        const emailMatch = profile.email === user.email;
        const emailIcon = emailMatch ? '✅' : '❌';
        console.log(`${emailIcon} ${user.email}:`);
        console.log(`   auth.users.email: ${user.email}`);
        console.log(`   profiles.email: ${profile.email}`);
        console.log(`   profiles.full_name: ${profile.full_name}`);

        if (!emailMatch) {
          console.log(`   ⚠️ EMAILS NÃO CORRESPONDEM!`);
        }
      }
    }
  }

  console.log();
  console.log('='.repeat(80));
}

verificarAuthUsers().catch(console.error);
