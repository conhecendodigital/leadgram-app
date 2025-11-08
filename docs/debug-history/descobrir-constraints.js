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
  envVars.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

async function descobrirConstraints() {
  console.log('\n═══════════════════════════════════════════════');
  console.log('🔍 DESCOBRINDO CONSTRAINTS EXATAS');
  console.log('═══════════════════════════════════════════════\n');

  // Tentar várias abordagens diferentes

  console.log('1️⃣ Tentando via query direta na tabela profiles...\n');

  // Primeira abordagem: listar constraints da tabela profiles
  const queries = [
    // Query 1: Listar todas as constraints de profiles
    `
      SELECT
        conname as constraint_name,
        contype as constraint_type,
        pg_get_constraintdef(oid) as definition
      FROM pg_constraint
      WHERE conrelid = 'public.profiles'::regclass
    `,

    // Query 2: Listar FKs que referenciam auth.users
    `
      SELECT
        tc.table_schema,
        tc.table_name,
        tc.constraint_name,
        kcu.column_name,
        ccu.table_schema AS foreign_table_schema,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name
      FROM information_schema.table_constraints AS tc
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
        AND ccu.table_schema = tc.table_schema
      WHERE tc.constraint_type = 'FOREIGN KEY'
        AND (
          ccu.table_name = 'users'
          OR tc.table_name IN ('profiles', 'user_subscriptions', 'payments')
        )
      ORDER BY tc.table_name, tc.constraint_name
    `,

    // Query 3: Listar TODAS as FKs do schema public
    `
      SELECT
        conrelid::regclass AS table_name,
        conname AS constraint_name,
        pg_get_constraintdef(oid) AS definition
      FROM pg_constraint
      WHERE contype = 'f'
        AND connamespace = 'public'::regnamespace
      ORDER BY table_name
    `
  ];

  for (let i = 0; i < queries.length; i++) {
    console.log(`\n📊 Query ${i + 1}:\n`);

    try {
      // Usar RPC para executar SQL raw
      const { data, error } = await supabase.rpc('exec_sql', {
        sql: queries[i]
      });

      if (error) {
        console.log(`❌ Erro na Query ${i + 1}:`, error.message);

        // Se RPC não funcionar, tentar outra abordagem
        if (error.message.includes('function') || error.message.includes('does not exist')) {
          console.log('⚠️ RPC exec_sql não disponível\n');
          console.log('💡 Vou tentar abordagem alternativa...\n');

          // Criar SQL para executar diretamente no Dashboard
          console.log('═══════════════════════════════════════════════');
          console.log('📋 EXECUTE ESTAS QUERIES NO DASHBOARD DO SUPABASE:');
          console.log('═══════════════════════════════════════════════\n');
          console.log('Link: https://supabase.com/dashboard/project/tgblybswivkktbehkblu/sql/new\n');
          console.log('--- Query 1: Ver constraints de profiles ---');
          console.log(queries[0]);
          console.log('\n--- Query 2: Ver todas as FKs ---');
          console.log(queries[1]);
          console.log('\n--- Query 3: Ver constraints detalhadas ---');
          console.log(queries[2]);
          console.log('\n═══════════════════════════════════════════════');
          console.log('📝 Cole cada query no SQL Editor e me envie os resultados!');
          console.log('═══════════════════════════════════════════════\n');

          // Salvar em arquivo
          const sqlContent = `
-- ════════════════════════════════════════════════════════════════
-- 🔍 QUERIES PARA DESCOBRIR CONSTRAINTS EXATAS
-- ════════════════════════════════════════════════════════════════
--
-- INSTRUÇÕES:
-- 1. Acesse: https://supabase.com/dashboard/project/tgblybswivkktbehkblu/sql/new
-- 2. Execute cada query abaixo SEPARADAMENTE
-- 3. Copie os resultados e me envie
--
-- ════════════════════════════════════════════════════════════════

-- ════════════════════════════════════════════════════════════════
-- QUERY 1: Constraints da tabela profiles
-- ════════════════════════════════════════════════════════════════

${queries[0]};

-- ════════════════════════════════════════════════════════════════
-- QUERY 2: Todas as Foreign Keys que referenciam users
-- ════════════════════════════════════════════════════════════════

${queries[1]};

-- ════════════════════════════════════════════════════════════════
-- QUERY 3: Todas as Foreign Keys do schema public (detalhado)
-- ════════════════════════════════════════════════════════════════

${queries[2]};

-- ════════════════════════════════════════════════════════════════
-- ✅ EXECUTE CADA QUERY E ME ENVIE OS RESULTADOS!
-- ════════════════════════════════════════════════════════════════
`;

          fs.writeFileSync(
            path.join(__dirname, 'QUERIES_DESCOBRIR_CONSTRAINTS.sql'),
            sqlContent
          );

          console.log('✅ Queries salvas em: QUERIES_DESCOBRIR_CONSTRAINTS.sql\n');

          return;
        }
      } else {
        console.log('✅ Resultados:\n');
        console.table(data);
      }
    } catch (err) {
      console.log(`❌ Exceção na Query ${i + 1}:`, err.message);
    }
  }
}

descobrirConstraints().then(() => {
  console.log('\n✓ Descoberta concluída\n');
  process.exit(0);
}).catch(err => {
  console.error('\n❌ Erro fatal:', err.message);
  process.exit(1);
});
