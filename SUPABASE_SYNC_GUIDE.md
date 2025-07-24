# 📚 Guia de Sincronização Schema Supabase - SisMobi

> **Versão:** 1.0  
> **Data:** Dezembro 2024  
> **Sistema:** SisMobi - Sistema de Gestão Imobiliária

---

## 🎯 **Introdução**

Este documento fornece diretrizes completas para manter a sincronização entre o schema SQL do Supabase e a aplicação TypeScript. O SisMobi utiliza uma arquitetura offline-first com sincronização automática.

---

## 📋 **Checklist de Implementação**

### **Para Nova Tabela**

```bash
[ ] 1. Schema SQL criado em supabase-schema.sql
[ ] 2. Interface TypeScript definida em src/types/index.ts
[ ] 3. Tipos Supabase adicionados em src/lib/supabaseClient.ts
[ ] 4. Service CRUD implementado em src/services/supabaseService.ts
[ ] 5. Mapper functions criadas no service
[ ] 6. Custom hook implementado em src/hooks/
[ ] 7. Validação Zod criada (se necessário)
[ ] 8. Testes unitários criados
[ ] 9. Documentação atualizada
```

### **Para Modificação de Tabela**

```bash
[ ] 1. Migration SQL criada
[ ] 2. Interface TypeScript atualizada
[ ] 3. Tipos Supabase atualizados
[ ] 4. Mappers ajustados (se necessário)
[ ] 5. Services atualizados
[ ] 6. Hooks atualizados (se necessário)
[ ] 7. Testes de regressão executados
[ ] 8. Validação completa executada
```

---

## 🏗️ **Padrões de Implementação**

### **1. Nomenclatura de Campos**

**SQL (snake_case)**
```sql
CREATE TABLE properties (
    id UUID PRIMARY KEY,
    created_at TIMESTAMP,
    energy_unit_name VARCHAR,
    purchase_price DECIMAL
);
```

**TypeScript (camelCase)**
```typescript
interface Property {
    id: string;
    createdAt: Date;
    energyUnitName?: string;
    purchasePrice: number;
}
```

**Supabase Types (snake_case)**
```typescript
properties: {
    Row: {
        id: string;
        created_at: string;
        energy_unit_name: string | null;
        purchase_price: number;
    };
}
```

### **2. Template de Service**

```typescript
export const [TABLE]Service = {
    // Buscar todos
    async getAll() {
        const { data, error } = await supabase
            .from('[table_name]')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        return data || [];
    },

    // Criar novo
    async create(item: Omit<[Interface], 'id' | 'createdAt'>) {
        const { data, error } = await supabase
            .from('[table_name]')
            .insert({
                // Mapear campos camelCase -> snake_case
            })
            .select()
            .single();
        
        if (error) throw error;
        return data;
    },

    // Atualizar
    async update(id: string, updates: Partial<[Interface]>) {
        const updateData: any = {};
        // Mapear apenas campos modificados
        
        const { data, error } = await supabase
            .from('[table_name]')
            .update(updateData)
            .eq('id', id)
            .select()
            .single();
        
        if (error) throw error;
        return data;
    },

    // Deletar
    async delete(id: string) {
        const { error } = await supabase
            .from('[table_name]')
            .delete()
            .eq('id', id);
        
        if (error) throw error;
    }
};
```

### **3. Template de Mapper**

```typescript
[TABLE]FromSupabase(data: any): [Interface] {
    return {
        id: data.id,
        // Mapear snake_case -> camelCase
        createdAt: new Date(data.created_at),
        energyUnitName: data.energy_unit_name,
        purchasePrice: data.purchase_price,
        // Relacionamentos
        tenant: data.tenants?.[0] ? mappers.tenantFromSupabase(data.tenants[0]) : undefined
    };
}
```

### **4. Template de Hook**

```typescript
export function use[TABLE](supabaseAvailable: boolean = false) {
    const queryClient = useQueryClient();
    const { addPendingChange } = useSyncManager();
    
    const [local[TABLE], setLocal[TABLE]] = useLocalStorage<[Interface][]>('[table_name]', []);

    const {
        data: [table] = [],
        isLoading: carregando,
        error,
        refetch
    } = useQuery({
        queryKey: ['[table_name]'],
        queryFn: async (): Promise<[Interface][]> => {
            if (!supabaseAvailable) {
                return local[TABLE];
            }
            try {
                const data = await [table]Service.getAll();
                return data.map(mappers.[table]FromSupabase);
            } catch (error) {
                console.warn('Supabase indisponível, usando localStorage:', error);
                return local[TABLE];
            }
        },
        enabled: true,
        retry: false,
    });

    // Implementar mutations (create, update, delete)
    // ...

    return {
        [table],
        carregando,
        erro: supabaseAvailable ? error : null,
        // Funções CRUD
        // Estados de loading
        // Informações adicionais
    };
}
```

---

## 🔄 **Gestão de Migrations**

### **1. Criação de Migration**

```sql
-- migrations/001_add_new_field.sql
-- Adicionar novo campo opcional
ALTER TABLE properties 
ADD COLUMN new_field VARCHAR NULL;

-- Criar índice se necessário
CREATE INDEX IF NOT EXISTS idx_properties_new_field 
ON properties(new_field);

-- Adicionar comentário
COMMENT ON COLUMN properties.new_field IS 'Descrição do novo campo';
```

### **2. Atualização de Types**

```typescript
// Atualizar em src/lib/supabaseClient.ts
properties: {
    Row: {
        // campos existentes...
        new_field: string | null;
    };
    Insert: {
        // campos existentes...
        new_field?: string | null;
    };
    Update: {
        // campos existentes...
        new_field?: string | null;
    };
};
```

### **3. Atualização de Interface**

```typescript
// Atualizar em src/types/index.ts
export interface Property {
    // campos existentes...
    newField?: string; // camelCase
}
```

### **4. Atualização de Mapper**

```typescript
// Atualizar em src/services/supabaseService.ts
propertyFromSupabase(data: any): Property {
    return {
        // campos existentes...
        newField: data.new_field, // snake_case -> camelCase
    };
}
```

---

## 🧪 **Estratégias de Teste**

### **1. Testes de Integração**

```typescript
// src/tests/integration/properties.test.ts
describe('Properties Integration', () => {
    test('should create property with all fields', async () => {
        const propertyData = {
            name: 'Test Property',
            address: 'Test Address',
            type: 'apartment' as const,
            purchasePrice: 100000,
            rentValue: 1000,
            status: 'vacant' as const
        };

        const created = await propertyService.create(propertyData);
        expect(created.id).toBeDefined();
        expect(created.name).toBe(propertyData.name);
    });

    test('should map Supabase data correctly', () => {
        const supabaseData = {
            id: '123',
            name: 'Test',
            created_at: '2024-01-01T00:00:00Z',
            purchase_price: 100000
        };

        const mapped = mappers.propertyFromSupabase(supabaseData);
        expect(mapped.id).toBe('123');
        expect(mapped.createdAt).toBeInstanceOf(Date);
        expect(mapped.purchasePrice).toBe(100000);
    });
});
```

### **2. Validação de Schema**

Execute o script de validação regularmente:

```bash
# Validação completa
npx tsx validate-schema.ts

# Validação rápida
./validate-schema.sh
```

---

## 🚨 **Troubleshooting Comum**

### **Problema: Type Error em Supabase Operation**

```typescript
// ❌ Erro
const { data } = await supabase
    .from('properties')
    .insert({ newField: 'value' }); // Property 'newField' does not exist

// ✅ Solução
// 1. Verificar se o tipo foi adicionado em Database interface
// 2. Usar snake_case no insert:
const { data } = await supabase
    .from('properties')
    .insert({ new_field: 'value' });
```

### **Problema: Mapper Retornando undefined**

```typescript
// ❌ Problema
propertyFromSupabase(data: any): Property {
    return {
        newField: data.newField, // undefined - campo não existe
    };
}

// ✅ Solução
propertyFromSupabase(data: any): Property {
    return {
        newField: data.new_field, // usar snake_case do Supabase
    };
}
```

### **Problema: Hook Não Atualizando**

```typescript
// ✅ Verificar invalidação de cache
// Após mutation, invalidar queries relacionadas
queryClient.invalidateQueries(['properties']);
queryClient.invalidateQueries(['tenants']); // se houver relacionamento
```

---

## 📈 **Métricas de Qualidade**

### **Indicadores de Schema Saudável**

- ✅ **100% Coverage**: Todos os campos mapeados
- ✅ **Type Safety**: Zero erros TypeScript
- ✅ **Consistent Naming**: snake_case ↔ camelCase
- ✅ **Error Handling**: Fallbacks implementados
- ✅ **Performance**: Queries otimizadas com índices

### **Validação Contínua**

```bash
# Adicionar no CI/CD
npm run validate-schema
npm run type-check
npm run test:integration
```

---

## 🔮 **Roadmap de Melhorias**

### **Próximos Passos**

1. **Automatização**
   - [ ] Code generation para mappers
   - [ ] Migration scripts automatizados
   - [ ] Type generation do Supabase CLI

2. **Observabilidade**
   - [ ] Logging estruturado de sincronização
   - [ ] Métricas de performance de queries
   - [ ] Alertas para falhas de sincronização

3. **Arquitetura**
   - [ ] Row Level Security (RLS) para multi-tenant
   - [ ] Real-time subscriptions
   - [ ] Backup automático e versionado

---

## 📞 **Suporte**

### **Para Dúvidas sobre Schema:**
1. Consulte este documento
2. Execute o script de validação
3. Verifique o arquivo de relatório detalhado

### **Para Reportar Problemas:**
1. Execute `npx tsx validate-schema.ts`
2. Inclua o output completo
3. Descreva o comportamento esperado vs atual

---

**✅ Schema Status: TOTALMENTE SINCRONIZADO**

> Sistema validado e operacional com 100% de cobertura de tipos e mapeamentos.