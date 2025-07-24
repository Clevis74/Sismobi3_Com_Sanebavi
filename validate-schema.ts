import { promises as fs } from 'fs';
import { join } from 'path';

interface ValidationResult {
  table: string;
  sqlSchema: boolean;
  supabaseTypes: boolean;
  serviceLayer: boolean;
  mappers: boolean;
  hooks: boolean;
  interface: boolean;
}

async function validateSchema(): Promise<void> {
  console.log('🔍 VALIDAÇÃO COMPLETA DE SCHEMA SUPABASE');
  console.log('========================================\n');

  const tables = ['properties', 'tenants', 'transactions', 'documents', 'energy_bills', 'water_bills', 'informors'];
  const results: ValidationResult[] = [];

  // Ler arquivos necessários
  const supabaseSchema = await fs.readFile('/app/supabase-schema.sql', 'utf-8');
  const supabaseClient = await fs.readFile('/app/src/lib/supabaseClient.ts', 'utf-8');
  const supabaseService = await fs.readFile('/app/src/services/supabaseService.ts', 'utf-8');
  const typesIndex = await fs.readFile('/app/src/types/index.ts', 'utf-8');

  // Validar arquivos de hooks
  const hooksDir = '/app/src/hooks';
  const hookFiles = await fs.readdir(hooksDir);

  for (const table of tables) {
    const result: ValidationResult = {
      table,
      sqlSchema: false,
      supabaseTypes: false,
      serviceLayer: false,
      mappers: false,
      hooks: false,
      interface: false
    };

    // Verificar SQL Schema
    result.sqlSchema = supabaseSchema.includes(`CREATE TABLE IF NOT EXISTS public.${table}`);

    // Verificar Supabase Types
    result.supabaseTypes = supabaseClient.includes(`${table}: {`);

    // Verificar Service Layer
    const serviceName = table === 'properties' ? 'propertyService' :
                       table === 'tenants' ? 'tenantService' :
                       table === 'transactions' ? 'transactionService' :
                       table === 'documents' ? 'documentService' :
                       table === 'energy_bills' ? 'energyBillService' :
                       table === 'water_bills' ? 'waterBillService' :
                       table === 'informors' ? 'informorService' : '';
    
    result.serviceLayer = supabaseService.includes(`export const ${serviceName}`);

    // Verificar Mappers
    const mapperName = table === 'properties' ? 'propertyFromSupabase' :
                      table === 'tenants' ? 'tenantFromSupabase' :
                      table === 'transactions' ? 'transactionFromSupabase' :
                      table === 'documents' ? 'documentFromSupabase' :
                      table === 'energy_bills' ? 'energyBillFromSupabase' :
                      table === 'water_bills' ? 'waterBillFromSupabase' :
                      table === 'informors' ? 'informorFromSupabase' : '';
    
    result.mappers = supabaseService.includes(mapperName);

    // Verificar Hooks
    const hookName = table === 'properties' ? 'useProperties.ts' :
                    table === 'tenants' ? 'useTenants.ts' :
                    table === 'transactions' ? 'useTransactions.ts' :
                    table === 'documents' ? 'useDocuments.ts' :
                    table === 'energy_bills' ? 'useEnergyBills.ts' :
                    table === 'water_bills' ? 'useWaterBills.ts' :
                    table === 'informors' ? 'useInformors.ts' : '';
    
    result.hooks = hookFiles.includes(hookName);

    // Verificar Interface TypeScript
    const interfaceName = table === 'properties' ? 'Property' :
                         table === 'tenants' ? 'Tenant' :
                         table === 'transactions' ? 'Transaction' :
                         table === 'documents' ? 'Document' :
                         table === 'energy_bills' ? 'EnergyBill' :
                         table === 'water_bills' ? 'WaterBill' :
                         table === 'informors' ? 'Informor' : '';
    
    result.interface = typesIndex.includes(`export interface ${interfaceName}`);

    results.push(result);
  }

  // Mostrar resultados
  console.log('📊 MATRIZ DE VALIDAÇÃO POR TABELA');
  console.log('=================================\n');

  console.log('| Tabela          | SQL | Types | Service | Mapper | Hook | Interface |');
  console.log('|-----------------|-----|-------|---------|--------|------|-----------|');

  let allValid = true;
  for (const result of results) {
    const sql = result.sqlSchema ? '✅' : '❌';
    const types = result.supabaseTypes ? '✅' : '❌';
    const service = result.serviceLayer ? '✅' : '❌';
    const mapper = result.mappers ? '✅' : '❌';
    const hook = result.hooks ? '✅' : '❌';
    const interface_ = result.interface ? '✅' : '❌';

    const tableDisplay = result.table.padEnd(15);
    console.log(`| ${tableDisplay} |  ${sql}  |   ${types}   |    ${service}    |   ${mapper}   |  ${hook}  |     ${interface_}     |`);

    if (!result.sqlSchema || !result.supabaseTypes || !result.serviceLayer || 
        !result.mappers || !result.hooks || !result.interface) {
      allValid = false;
    }
  }

  console.log('\n📈 ESTATÍSTICAS DE COMPLETUDE');
  console.log('=============================\n');

  const stats = {
    sqlSchema: results.filter(r => r.sqlSchema).length,
    supabaseTypes: results.filter(r => r.supabaseTypes).length,
    serviceLayer: results.filter(r => r.serviceLayer).length,
    mappers: results.filter(r => r.mappers).length,
    hooks: results.filter(r => r.hooks).length,
    interfaces: results.filter(r => r.interface).length
  };

  const total = results.length;

  console.log(`• SQL Schemas: ${stats.sqlSchema}/${total} (${Math.round(stats.sqlSchema/total*100)}%)`);
  console.log(`• Supabase Types: ${stats.supabaseTypes}/${total} (${Math.round(stats.supabaseTypes/total*100)}%)`);
  console.log(`• Service Layer: ${stats.serviceLayer}/${total} (${Math.round(stats.serviceLayer/total*100)}%)`);  
  console.log(`• Mappers: ${stats.mappers}/${total} (${Math.round(stats.mappers/total*100)}%)`);
  console.log(`• Custom Hooks: ${stats.hooks}/${total} (${Math.round(stats.hooks/total*100)}%)`);
  console.log(`• TypeScript Interfaces: ${stats.interfaces}/${total} (${Math.round(stats.interfaces/total*100)}%)`);

  console.log('\n🎯 RESULTADO FINAL');
  console.log('=================\n');

  if (allValid) {
    console.log('🎉 SUCESSO: Schema 100% sincronizado!');
    console.log('   Todas as tabelas possuem implementação completa.');
  } else {
    console.log('⚠️  ATENÇÃO: Algumas implementações estão incompletas.');
    console.log('   Verifique a matriz acima para detalhes específicos.');
  }

  // Verificações adicionais
  console.log('\n🔍 VERIFICAÇÕES ADICIONAIS');
  console.log('=========================\n');

  // Verificar relacionamentos (Foreign Keys)
  const fkMatches = supabaseSchema.match(/REFERENCES/g);
  console.log(`• Foreign Keys implementadas: ${fkMatches ? fkMatches.length : 0}`);

  // Verificar índices
  const indexMatches = supabaseSchema.match(/CREATE INDEX/g);
  console.log(`• Índices criados: ${indexMatches ? indexMatches.length : 0}`);

  // Verificar comentários no schema
  const commentMatches = supabaseSchema.match(/COMMENT ON TABLE/g);
  console.log(`• Tabelas documentadas: ${commentMatches ? commentMatches.length : 0}`);

  console.log('\n📖 Para relatório detalhado, consulte: /app/SCHEMA_SYNCHRONIZATION_REPORT.md');
}

// Executar validação
validateSchema().catch(console.error);