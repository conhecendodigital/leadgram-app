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

const supabase = createClient(
  envVars.NEXT_PUBLIC_SUPABASE_URL,
  envVars.SUPABASE_SERVICE_ROLE_KEY
);

async function verificarFKs() {
  console.log('\n🔍 Verificando FK Constraints...\n');

  const { data, error } = await supabase.rpc('exec_sql', {
    query: `
      SELECT
        tc.table_schema,
        tc.table_name,
        tc.constraint_name,
        tc.constraint_type,
        ccu.table_schema AS foreign_table_schema,
        ccu.table_name AS foreign_table,
        ccu.column_name AS foreign_column
      FROM information_schema.table_constraints tc
      JOIN information_schema.constraint_column_usage ccu
        ON tc.constraint_name = ccu.constraint_name
      WHERE tc.constraint_type = 'FOREIGN KEY'
        AND ccu.table_schema = 'auth'
        AND ccu.table_name = 'users'
      ORDER BY tc.table_schema, tc.table_name;
    `
  });

  if (error) {
    console.error('❌ Erro ao verificar FKs:', error);

    // Tentar outra abordagem: verificar diretamente
    console.log('\n🔄 Tentando query alternativa...\n');

    const { data: fks, error: err2 } = await supabase
      .from('information_schema.table_constraints')
      .select('*');

    if (err2) {
      console.error('❌ Erro na query alternativa:', err2);
    }
    return;
  }

  if (!data || data.length === 0) {
    console.log('✅ Nenhuma FK constraint encontrada! Sistema OK!\n');
  } else {
    console.log('⚠️ FK Constraints encontradas:\n');
    console.table(data);
    console.log('\n❌ Essas constraints precisam ser removidas!\n');
  }
}

verificarFKs().then(() => {
  console.log('✓ Verificação concluída\n');
  process.exit(0);
}).catch(err => {
  console.error('❌ Erro fatal:', err);
  process.exit(1);
});
