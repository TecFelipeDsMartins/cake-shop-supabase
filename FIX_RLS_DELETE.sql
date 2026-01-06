-- Fix RLS policies to allow deletion of products with NULL user_id
-- This fixes the issue where products created before RLS was enabled cannot be deleted

-- Drop and recreate the delete policy for products to include NULL user_id
DROP POLICY IF EXISTS "Users can delete own products" ON products;

CREATE POLICY "Users can delete own products"
  ON products FOR DELETE
  USING (user_id = auth.uid() OR user_id IS NULL);

-- Similarly for product_ingredients if it has RLS
DROP POLICY IF EXISTS "Users can delete own product_ingredients" ON product_ingredients;

CREATE POLICY "Users can delete own product_ingredients"
  ON product_ingredients FOR DELETE
  USING (true); -- Product ingredients don't have user_id, allow deletion

-- Similarly for sale_items if it has RLS  
DROP POLICY IF EXISTS "Users can delete own sale_items" ON sale_items;

CREATE POLICY "Users can delete own sale_items"
  ON sale_items FOR DELETE
  USING (true); -- Sale items don't have user_id, allow deletion
