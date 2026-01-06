-- ===== FIX: Permitir deleção de produtos =====

-- 1. Verificar se product_ingredients tem RLS
-- Se tiver, remover políticas restritivas

-- Remover políticas antigas (se existirem)
DROP POLICY IF EXISTS "Users can view product_ingredients" ON product_ingredients;
DROP POLICY IF EXISTS "Users can insert product_ingredients" ON product_ingredients;
DROP POLICY IF EXISTS "Users can update product_ingredients" ON product_ingredients;
DROP POLICY IF EXISTS "Users can delete product_ingredients" ON product_ingredients;

-- Desabilitar RLS em product_ingredients (é uma tabela de relacionamento)
-- Ou permitir acesso total para usuários autenticados
ALTER TABLE product_ingredients DISABLE ROW LEVEL SECURITY;

-- Alternativa (se quiser manter RLS): Criar políticas permissivas
-- CREATE POLICY "Anyone authenticated can view"
--   ON product_ingredients FOR SELECT
--   USING (auth.uid() IS NOT NULL);
-- 
-- CREATE POLICY "Anyone authenticated can insert"
--   ON product_ingredients FOR INSERT
--   WITH CHECK (auth.uid() IS NOT NULL);
--
-- CREATE POLICY "Anyone authenticated can update"
--   ON product_ingredients FOR UPDATE
--   USING (auth.uid() IS NOT NULL)
--   WITH CHECK (auth.uid() IS NOT NULL);
--
-- CREATE POLICY "Anyone authenticated can delete"
--   ON product_ingredients FOR DELETE
--   USING (auth.uid() IS NOT NULL);

-- Testar: Agora a deleção de produtos deve funcionar
