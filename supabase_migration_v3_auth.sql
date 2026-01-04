-- ===== MIGRATION V3: Adicionar user_id e RLS =====
-- Esta migration adiciona suporte a autenticação de usuários
-- Execute este arquivo no Supabase SQL Editor

-- 1. Adicionar coluna user_id nas tabelas principais
ALTER TABLE IF EXISTS ingredients ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE IF EXISTS recipes ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE IF EXISTS products ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE IF EXISTS sales ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE IF EXISTS technical_sheets ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE IF EXISTS ingredient_categories ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE IF EXISTS product_categories ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE IF EXISTS customers ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- 2. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_ingredients_user_id ON ingredients(user_id);
CREATE INDEX IF NOT EXISTS idx_recipes_user_id ON recipes(user_id);
CREATE INDEX IF NOT EXISTS idx_products_user_id ON products(user_id);
CREATE INDEX IF NOT EXISTS idx_sales_user_id ON sales(user_id);
CREATE INDEX IF NOT EXISTS idx_technical_sheets_user_id ON technical_sheets(user_id);
CREATE INDEX IF NOT EXISTS idx_ingredient_categories_user_id ON ingredient_categories(user_id);
CREATE INDEX IF NOT EXISTS idx_product_categories_user_id ON product_categories(user_id);
CREATE INDEX IF NOT EXISTS idx_customers_user_id ON customers(user_id);

-- 3. Habilitar RLS em todas as tabelas
ALTER TABLE ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE technical_sheets ENABLE ROW LEVEL SECURITY;
ALTER TABLE ingredient_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

-- 4. Políticas RLS para INGREDIENTS
DROP POLICY IF EXISTS "Users can view own ingredients" ON ingredients;
DROP POLICY IF EXISTS "Users can insert own ingredients" ON ingredients;
DROP POLICY IF EXISTS "Users can update own ingredients" ON ingredients;
DROP POLICY IF EXISTS "Users can delete own ingredients" ON ingredients;

CREATE POLICY "Users can view own ingredients"
  ON ingredients FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own ingredients"
  ON ingredients FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own ingredients"
  ON ingredients FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own ingredients"
  ON ingredients FOR DELETE
  USING (user_id = auth.uid());

-- 5. Políticas RLS para RECIPES
DROP POLICY IF EXISTS "Users can view own recipes" ON recipes;
DROP POLICY IF EXISTS "Users can insert own recipes" ON recipes;
DROP POLICY IF EXISTS "Users can update own recipes" ON recipes;
DROP POLICY IF EXISTS "Users can delete own recipes" ON recipes;

CREATE POLICY "Users can view own recipes"
  ON recipes FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own recipes"
  ON recipes FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own recipes"
  ON recipes FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own recipes"
  ON recipes FOR DELETE
  USING (user_id = auth.uid());

-- 6. Políticas RLS para PRODUCTS
DROP POLICY IF EXISTS "Users can view own products" ON products;
DROP POLICY IF EXISTS "Users can insert own products" ON products;
DROP POLICY IF EXISTS "Users can update own products" ON products;
DROP POLICY IF EXISTS "Users can delete own products" ON products;

CREATE POLICY "Users can view own products"
  ON products FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own products"
  ON products FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own products"
  ON products FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own products"
  ON products FOR DELETE
  USING (user_id = auth.uid());

-- 7. Políticas RLS para SALES
DROP POLICY IF EXISTS "Users can view own sales" ON sales;
DROP POLICY IF EXISTS "Users can insert own sales" ON sales;
DROP POLICY IF EXISTS "Users can update own sales" ON sales;
DROP POLICY IF EXISTS "Users can delete own sales" ON sales;

CREATE POLICY "Users can view own sales"
  ON sales FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own sales"
  ON sales FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own sales"
  ON sales FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own sales"
  ON sales FOR DELETE
  USING (user_id = auth.uid());

-- 8. Políticas RLS para TECHNICAL_SHEETS
DROP POLICY IF EXISTS "Users can view own technical_sheets" ON technical_sheets;
DROP POLICY IF EXISTS "Users can insert own technical_sheets" ON technical_sheets;
DROP POLICY IF EXISTS "Users can update own technical_sheets" ON technical_sheets;
DROP POLICY IF EXISTS "Users can delete own technical_sheets" ON technical_sheets;

CREATE POLICY "Users can view own technical_sheets"
  ON technical_sheets FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own technical_sheets"
  ON technical_sheets FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own technical_sheets"
  ON technical_sheets FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own technical_sheets"
  ON technical_sheets FOR DELETE
  USING (user_id = auth.uid());

-- 9. Políticas RLS para INGREDIENT_CATEGORIES
DROP POLICY IF EXISTS "Users can view own ingredient_categories" ON ingredient_categories;
DROP POLICY IF EXISTS "Users can insert own ingredient_categories" ON ingredient_categories;
DROP POLICY IF EXISTS "Users can update own ingredient_categories" ON ingredient_categories;
DROP POLICY IF EXISTS "Users can delete own ingredient_categories" ON ingredient_categories;

CREATE POLICY "Users can view own ingredient_categories"
  ON ingredient_categories FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own ingredient_categories"
  ON ingredient_categories FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own ingredient_categories"
  ON ingredient_categories FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own ingredient_categories"
  ON ingredient_categories FOR DELETE
  USING (user_id = auth.uid());

-- 10. Políticas RLS para PRODUCT_CATEGORIES
DROP POLICY IF EXISTS "Users can view own product_categories" ON product_categories;
DROP POLICY IF EXISTS "Users can insert own product_categories" ON product_categories;
DROP POLICY IF EXISTS "Users can update own product_categories" ON product_categories;
DROP POLICY IF EXISTS "Users can delete own product_categories" ON product_categories;

CREATE POLICY "Users can view own product_categories"
  ON product_categories FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own product_categories"
  ON product_categories FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own product_categories"
  ON product_categories FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own product_categories"
  ON product_categories FOR DELETE
  USING (user_id = auth.uid());

-- 11. Políticas RLS para CUSTOMERS
DROP POLICY IF EXISTS "Users can view own customers" ON customers;
DROP POLICY IF EXISTS "Users can insert own customers" ON customers;
DROP POLICY IF EXISTS "Users can update own customers" ON customers;
DROP POLICY IF EXISTS "Users can delete own customers" ON customers;

CREATE POLICY "Users can view own customers"
  ON customers FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own customers"
  ON customers FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own customers"
  ON customers FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own customers"
  ON customers FOR DELETE
  USING (user_id = auth.uid());
