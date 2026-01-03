# 🔍 Relatório de Revisão da Lógica do Projeto - Cake Shop Supabase

**Data da Revisão:** 03/01/2026  
**Revisor:** Auto (AI Assistant)  
**Versão do Projeto:** 1.0.0

---

## 📋 Sumário Executivo

Esta revisão identificou **15 problemas críticos** e **8 melhorias recomendadas** no código do projeto. Os problemas variam desde inconsistências de schema do banco de dados até bugs lógicos que impedem o funcionamento correto de funcionalidades.

---

## 🚨 Problemas Críticos (Alta Prioridade)

### 1. **Inconsistência no Schema do Banco de Dados** ⚠️ CRÍTICO

**Problema:**
- O código referencia a tabela `technical_sheets` que não existe no `database.sql` inicial
- Esta tabela só é criada no arquivo `supabase_migration_v2.sql`
- Se o usuário executou apenas o `database.sql`, várias funcionalidades vão falhar

**Arquivos Afetados:**
- `src/lib/supabaseClient.ts` (linhas 483-528)
- `src/pages/Recipes.tsx`
- Funções: `saveTechnicalSheet()`, `getTechnicalSheet()`, `saveFullRecipe()`

**Impacto:** Alto - Funcionalidades de receitas e produtos não funcionarão

**Solução:**
1. Verificar se a migration v2 foi executada
2. Se não, executar `supabase_migration_v2.sql` no Supabase
3. Ou unificar os scripts SQL em um único arquivo

---

### 2. **Dashboard: Acesso Incorreto a Dados de Vendas** ⚠️ CRÍTICO

**Problema:**
- O Dashboard tenta acessar `sale.items` (linha 77), mas `getSales()` não retorna items
- Items de vendas estão em uma tabela separada (`sale_items`)
- Resultado: Produtos mais vendidos não aparecem no dashboard

**Arquivo:** `src/pages/Dashboard.tsx` (linhas 74-93)

**Código Problemático:**
```typescript
salesList?.forEach((sale: any) => {
  if (sale.items) {  // ❌ sale.items não existe!
    sale.items.forEach((item: any) => {
      // ...
    });
  }
});
```

**Solução:**
- Usar `getSaleItems(sale.id)` para cada venda
- Ou modificar `getSales()` para incluir items via join
- Processar os dados corretamente

---

### 3. **Conversão Incorreta de Valores Monetários** ⚠️ CRÍTICO

**Problema:**
- No Dashboard, valores são divididos por 100 (linha 67-68)
- Isso indica que o código assume valores em centavos, mas o banco armazena em reais
- Resultado: Valores exibidos são 100x menores do que deveriam

**Arquivo:** `src/pages/Dashboard.tsx` (linhas 64-70)

**Código Problemático:**
```typescript
sales: Math.round(amount / 100), // ❌ Dividindo por 100 incorretamente
revenue: Math.round(amount / 100)
```

**Solução:**
- Remover a divisão por 100
- Verificar se o banco realmente armazena em reais (DECIMAL(10,2))

---

### 4. **Duplicação de Cliente Supabase** ⚠️ ALTO

**Problema:**
- Existem dois arquivos de configuração do Supabase:
  - `src/lib/supabase.ts` (não utilizado)
  - `src/lib/supabaseClient.ts` (utilizado)
- Isso causa confusão e pode levar a inconsistências

**Solução:**
- Remover `src/lib/supabase.ts` ou unificar em um único arquivo
- Manter apenas `supabaseClient.ts` que está sendo usado

---

### 5. **Lógica Confusa de IDs Temporários em saveFullRecipe** ⚠️ ALTO

**Problema:**
- A condição `recipeId && !isNaN(recipeId) && recipeId < 1` (linha 119) é confusa
- IDs nunca são menores que 1 em um banco real
- Lógica de criação/atualização está duplicada e inconsistente

**Arquivo:** `src/lib/supabaseClient.ts` (linhas 105-144)

**Código Problemático:**
```typescript
if (recipeId && !isNaN(recipeId) && recipeId < 1) { // ❌ Lógica confusa
  const newIng = await addIngredient(ingredientPayload);
  recipeId = newIng?.id;
} else if (recipeId) {
  await updateIngredient(recipeId, ingredientPayload);
} else {
  const newIng = await addIngredient(ingredientPayload); // ❌ Duplicado
  recipeId = newIng?.id;
}
```

**Solução:**
- Simplificar a lógica:
  - Se `recipeId` existe e é válido → update
  - Caso contrário → insert

---

### 6. **Tipo Database em supabase.ts Não Corresponde ao Schema Real** ⚠️ MÉDIO

**Problema:**
- O arquivo `supabase.ts` define tipos TypeScript que não correspondem ao schema real
- Usa UUID (string) mas o banco usa BIGSERIAL (number)
- Tabelas definidas não correspondem à estrutura real

**Arquivo:** `src/lib/supabase.ts`

**Solução:**
- Atualizar tipos para corresponder ao schema real
- Ou gerar tipos automaticamente do Supabase
- Ou remover o arquivo se não está sendo usado

---

### 7. **Falta de Validação de Dados na Criação de Vendas** ⚠️ MÉDIO

**Problema:**
- `handleSave` em Sales.tsx não valida se `account_id` existe
- Não valida se produtos existem antes de adicionar items
- Transação não é atômica (se falhar após criar sale, fica inconsistente)

**Arquivo:** `src/pages/Sales.tsx` (linhas 88-127)

**Solução:**
- Adicionar validações antes de salvar
- Considerar usar transações do Supabase (RPC functions)
- Validar existência de produtos, contas, etc.

---

### 8. **getRecipes() Usa Relações Incorretas** ⚠️ MÉDIO

**Problema:**
- `getRecipes()` tenta fazer join com `ingredients` duas vezes com aliases diferentes
- A query pode não funcionar corretamente com a estrutura atual

**Arquivo:** `src/lib/supabaseClient.ts` (linhas 75-86)

**Código Problemático:**
```typescript
.select(`
  *,
  ingredient:ingredients(name, cost, unit),  // ❌ Relação não definida
  component:ingredients(name, cost, unit)     // ❌ Relação não definida
`)
```

**Solução:**
- Revisar a estrutura da tabela `recipes`
- Ajustar as relações conforme o schema real
- Ou usar queries separadas

---

### 9. **Falta de Tratamento de Erro em Operações Críticas** ⚠️ MÉDIO

**Problema:**
- Muitas funções não retornam erros adequadamente
- `handleError()` apenas loga, mas não propaga erros
- Usuário não recebe feedback adequado em caso de falha

**Solução:**
- Melhorar tratamento de erros
- Retornar erros para serem tratados pelo componente
- Mostrar mensagens de erro amigáveis ao usuário

---

### 10. **saveFullRecipe Usa Campos que Podem Não Existir** ⚠️ MÉDIO

**Problema:**
- `saveFullRecipe` tenta salvar `item_type: 'RECIPE'` mas a coluna pode não existir
- Depende da migration v2 ter sido executada
- Não verifica se a coluna existe antes de usar

**Solução:**
- Verificar se coluna existe ou garantir que migration foi executada
- Adicionar fallback se coluna não existir

---

## ⚠️ Problemas de Média Prioridade

### 11. **Falta de Índices em Algumas Queries Frequentes**

**Problema:**
- Queries de dashboard podem ser lentas com muitos dados
- Falta índice em `sales.sale_date` (já existe no SQL, verificar se foi criado)

**Solução:**
- Verificar se índices do `database.sql` foram criados
- Adicionar índices adicionais se necessário

---

### 12. **Cálculo de Custos Não Atualiza Automaticamente**

**Problema:**
- Quando um ingrediente base muda de preço, receitas que o usam não são recalculadas
- Existe função SQL para isso (`recalculate_item_costs`) mas pode não estar sendo chamada

**Solução:**
- Chamar função de recálculo após atualizar custo de ingrediente
- Ou criar trigger no banco (já existe na migration v2)

---

### 13. **Falta de Paginação em Listagens**

**Problema:**
- `getSales()`, `getProducts()`, etc. carregam todos os registros
- Pode ser lento com muitos dados

**Solução:**
- Implementar paginação
- Usar `.range()` do Supabase

---

### 14. **Valores Hardcoded (Magic Numbers)**

**Problema:**
- Dashboard tem `monthlyGrowth: 12.5` hardcoded (linha 43)
- Valores fixos em vários lugares

**Solução:**
- Calcular valores dinamicamente
- Remover valores hardcoded

---

### 15. **Falta de Type Safety em Muitos Lugares**

**Problema:**
- Uso extensivo de `any` type
- Falta de interfaces TypeScript para dados do banco

**Solução:**
- Criar interfaces TypeScript para todas as entidades
- Remover `any` types gradualmente
- Gerar tipos do Supabase se possível

---

## 💡 Melhorias Recomendadas

1. **Validação de Schema no Início da Aplicação**
   - Verificar se tabelas necessárias existem
   - Verificar se migrations foram executadas

2. **Logging Melhorado**
   - Usar biblioteca de logging estruturado
   - Logs em produção vs desenvolvimento

3. **Testes Unitários**
   - Adicionar testes para funções críticas
   - Testar integração com Supabase

4. **Documentação de API**
   - Documentar todas as funções do `supabaseClient.ts`
   - Documentar estrutura de dados esperada

5. **Otimização de Queries**
   - Usar `.select()` mais específico (não `*`)
   - Evitar N+1 queries

6. **Cache de Dados**
   - Implementar cache para dados que mudam pouco (categorias, métodos de pagamento)
   - Usar React Query ou similar

7. **Validação de Formulários**
   - Usar Zod para validação (já está instalado)
   - Validar dados antes de enviar ao banco

8. **Feedback Visual de Loading**
   - Melhorar estados de loading
   - Skeleton loaders em vez de apenas texto

---

## 📊 Estatísticas da Revisão

- **Arquivos Revisados:** 15+
- **Problemas Críticos Encontrados:** 10
- **Problemas de Média Prioridade:** 5
- **Melhorias Recomendadas:** 8
- **Linhas de Código Analisadas:** ~2000+

---

## ✅ Priorização de Correções

### Fase 1 (Urgente - Fazer Imediatamente):
1. ✅ Verificar/Executar migration v2 do banco
2. ✅ Corrigir Dashboard (acesso a sale.items)
3. ✅ Corrigir conversão de valores monetários
4. ✅ Remover arquivo supabase.ts duplicado

### Fase 2 (Importante - Fazer em Breve):
5. ✅ Simplificar lógica de saveFullRecipe
6. ✅ Adicionar validações em Sales
7. ✅ Corrigir getRecipes() queries
8. ✅ Melhorar tratamento de erros

### Fase 3 (Melhorias - Fazer Quando Possível):
9. ✅ Adicionar paginação
10. ✅ Implementar type safety
11. ✅ Adicionar testes
12. ✅ Otimizar queries

---

## 🔧 Próximos Passos Recomendados

1. ✅ **Executar Migration v2** no Supabase (se ainda não foi feito)
   - ⚠️ **STATUS:** Documentação criada em `EXECUTAR_MIGRATION_V2.md`
   - **Ação:** Executar manualmente no painel do Supabase
2. ✅ **Corrigir problemas críticos** da Fase 1
   - ✅ Dashboard corrigido (sale.items e valores monetários)
   - ✅ Arquivo supabase.ts duplicado removido
   - ✅ saveFullRecipe simplificado
3. ✅ **Corrigir problemas da Fase 2**
   - ✅ Validações em Sales adicionadas
   - ✅ getRecipes() corrigido
   - ✅ Tratamento de erros melhorado
4. ✅ **Documentar mudanças feitas**
   - ✅ CHANGELOG_CORRECOES.md criado
   - ✅ RESUMO_EXECUCAO.md criado
5. ⏳ **Testar funcionalidades** após correções (próximo passo)
6. ⏳ **Implementar melhorias** gradualmente (futuro)

---

## ✅ Status das Correções

**Data de Execução:** 03/01/2026

- ✅ **7 problemas críticos corrigidos**
- ✅ **3 arquivos modificados**
- ✅ **1 arquivo removido**
- ✅ **3 arquivos de documentação criados**
- ⚠️ **1 ação manual pendente** (Migration v2)

**Ver detalhes em:** `CHANGELOG_CORRECOES.md` e `RESUMO_EXECUCAO.md`

---

**Nota:** Este relatório foi gerado através de análise estática do código. Recomenda-se testar cada correção em ambiente de desenvolvimento antes de aplicar em produção.

