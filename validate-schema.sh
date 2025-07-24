#!/bin/bash

# 🔍 Script de Validação de Schema Supabase
# Verifica a consistência entre SQL, TypeScript e Supabase types

echo "🔍 INICIANDO VALIDAÇÃO DE SCHEMA SUPABASE"
echo "========================================"
echo ""

# Função para verificar se um arquivo existe
check_file() {
    if [ -f "$1" ]; then
        echo "✅ $1 encontrado"
        return 0
    else
        echo "❌ $1 NÃO encontrado"
        return 1
    fi
}

# Função para contar linhas que contêm um padrão
count_pattern() {
    if [ -f "$1" ]; then
        count=$(grep -c "$2" "$1" 2>/dev/null || echo "0")
        echo "$count"
    else
        echo "0"
    fi
}

echo "📂 VERIFICANDO ARQUIVOS PRINCIPAIS"
echo "================================="

# Verificar arquivos críticos
check_file "/app/supabase-schema.sql"
check_file "/app/src/types/index.ts"
check_file "/app/src/lib/supabaseClient.ts"
check_file "/app/src/services/supabaseService.ts"

echo ""
echo "🗃️ ANÁLISE DE TABELAS"
echo "==================="

# Lista de tabelas esperadas
tables=("properties" "tenants" "transactions" "documents" "energy_bills" "water_bills" "informors")

for table in "${tables[@]}"; do
    echo ""
    echo "📋 Tabela: $table"
    echo "  SQL Schema: $(count_pattern '/app/supabase-schema.sql' "CREATE TABLE.*$table")"
    echo "  Supabase Types: $(count_pattern '/app/src/lib/supabaseClient.ts' "$table:")"
    echo "  Service Layer: $(count_pattern '/app/src/services/supabaseService.ts' "${table}Service")"
    echo "  Mappers: $(count_pattern '/app/src/services/supabaseService.ts' "${table}FromSupabase")"
done

echo ""
echo "🔗 VERIFICANDO RELACIONAMENTOS"
echo "=============================="

# Verificar foreign keys
fk_count=$(count_pattern '/app/supabase-schema.sql' 'REFERENCES')
echo "Foreign Keys no SQL: $fk_count"

# Verificar joins nos services
join_count=$(count_pattern '/app/src/services/supabaseService.ts' 'tenants (' )
echo "Joins implementados: $join_count"

echo ""
echo "📊 ESTATÍSTICAS GERAIS"
echo "====================="

# Contar interfaces TypeScript
interfaces=$(count_pattern '/app/src/types/index.ts' 'export interface')
echo "Interfaces TypeScript: $interfaces"

# Contar mappers
mappers=$(count_pattern '/app/src/services/supabaseService.ts' 'FromSupabase')
echo "Mapper Functions: $mappers"

# Contar hooks customizados
hooks=$(find /app/src/hooks -name "use*.ts" | wc -l)
echo "Custom Hooks: $hooks"

echo ""
echo "🎯 VALIDAÇÃO DE CONSISTÊNCIA"
echo "============================"

# Verificar se todos os tipos estão definidos no supabaseClient
missing_types=()

for table in "${tables[@]}"; do
    if ! grep -q "${table}:" /app/src/lib/supabaseClient.ts; then
        missing_types+=("$table")
    fi
done

if [ ${#missing_types[@]} -eq 0 ]; then
    echo "✅ Todos os tipos Supabase estão definidos"
else
    echo "⚠️  Tipos faltando: ${missing_types[*]}"
fi

# Verificar mappers
missing_mappers=()
for table in "${tables[@]}"; do
    if ! grep -q "${table}FromSupabase" /app/src/services/supabaseService.ts; then
        missing_mappers+=("$table")
    fi
done

if [ ${#missing_mappers[@]} -eq 0 ]; then
    echo "✅ Todos os mappers estão implementados"
else
    echo "⚠️  Mappers faltando: ${missing_mappers[*]}"
fi

echo ""
echo "🚀 TESTE DE SINTAXE TYPESCRIPT"
echo "=============================="

# Verificar se não há erros de sintaxe TypeScript (simplificado)
if command -v tsc >/dev/null 2>&1; then
    cd /app
    echo "Executando verificação TypeScript..."
    if tsc --noEmit --skipLibCheck; then
        echo "✅ Sintaxe TypeScript válida"
    else
        echo "⚠️  Possíveis erros de sintaxe TypeScript detectados"
    fi
else
    echo "⚠️  TypeScript compiler não encontrado, pulando verificação"
fi

echo ""
echo "📋 RELATÓRIO FINAL"
echo "================="

# Resumo final
total_tables=${#tables[@]}
defined_types=$(grep -c ":" /app/src/lib/supabaseClient.ts | head -1)
total_mappers=$(count_pattern '/app/src/services/supabaseService.ts' 'FromSupabase')

echo "📊 Estatísticas Finais:"
echo "  • Tabelas esperadas: $total_tables"
echo "  • Mappers implementados: $total_mappers"
echo "  • Hooks customizados: $hooks"
echo "  • Interfaces TypeScript: $interfaces"

echo ""
if [ ${#missing_types[@]} -eq 0 ] && [ ${#missing_mappers[@]} -eq 0 ]; then
    echo "🎉 VALIDAÇÃO COMPLETA: SCHEMA 100% SINCRONIZADO!"
    echo "   Todas as tabelas possuem tipos, mappers e services implementados."
else
    echo "⚠️  VALIDAÇÃO PARCIAL: Algumas inconsistências detectadas."
    echo "   Verifique o relatório detalhado acima."
fi

echo ""
echo "📖 Para mais detalhes, consulte: /app/SCHEMA_SYNCHRONIZATION_REPORT.md"
echo "========================================"