// Script para listar todas as constraints da tabela profiles
const { createClient } = require('@supabase/supabase-js');
const { execSync } = require('child_process');

console.log('='.repeat(80));
console.log('LISTANDO CONSTRAINTS DA TABELA PROFILES');
console.log('='.repeat(80));
console.log();

// Tentar via psql se disponível, senão usar API
console.log('Verificando constraints via arquivos SQL...\n');

const fs = require('fs');
const path = require('path');

// Ler todos os arquivos de migration
const migrationsDir = path.join(__dirname, 'supabase', 'migrations');
const files = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql'));

console.log(`Encontrados ${files.length} arquivos de migration\n`);

let foundFK = false;

files.forEach(file => {
  const content = fs.readFileSync(path.join(migrationsDir, file), 'utf8');

  // Procurar por FOREIGN KEY ou REFERENCES
  if (content.match(/profiles.*FOREIGN KEY|profiles.*REFERENCES|ADD CONSTRAINT.*profiles/gi)) {
    console.log(`📄 ${file}:`);

    const lines = content.split('\n');
    lines.forEach((line, idx) => {
      if (line.match(/FOREIGN KEY|REFERENCES|ADD CONSTRAINT/i)) {
        console.log(`   Linha ${idx + 1}: ${line.trim()}`);
        foundFK = true;
      }
    });
    console.log();
  }
});

if (!foundFK) {
  console.log('❌ Nenhuma FOREIGN KEY encontrada nos arquivos de migration');
  console.log('   Mas o erro indica que existe uma FK "profiles_id_fkey"');
  console.log('   Esta FK pode ter sido criada automaticamente ou manualmente.');
}

console.log();
console.log('='.repeat(80));
console.log('ANÁLISE');
console.log('='.repeat(80));
console.log();
console.log('O erro indica que existe uma constraint:');
console.log('   profiles_id_fkey: profiles.id → auth.users.id');
console.log();
console.log('Esta constraint está BLOQUEANDO o signup porque:');
console.log('1. Trigger tenta INSERT em profiles');
console.log('2. Constraint verifica se ID existe em auth.users');
console.log('3. Mas o transaction do auth.users ainda não comitou');
console.log('4. FK validation falha → signup falha');
console.log();
console.log('SOLUÇÃO: Remover ou adiar a validação da FK');
console.log('   Opção 1: DROP CONSTRAINT profiles_id_fkey (se existir)');
console.log('   Opção 2: DEFERRABLE INITIALLY DEFERRED');
console.log();
console.log('='.repeat(80));
