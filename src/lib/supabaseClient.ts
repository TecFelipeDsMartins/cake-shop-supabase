import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('ERRO CRÍTICO: Variáveis do Supabase não encontradas! Verifique o painel da Vercel.');
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');

// Helper para lidar com erros com logs detalhados
const handleError = (error: any, context: string) => {
  if (error) {
    console.error(`[SUPABASE ERROR] em ${context}:`, {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code
    });
    return true;
  }
  return false;
};

// --- INSUMOS (INGREDIENTS) ---
export async function getIngredients() {
  console.log('[SUPABASE] Buscando ingredientes...');
  const { data, error } = await supabase.from('ingredients').select('*').order('name');
  if (handleError(error, 'getIngredients')) return [];
  console.log(`[SUPABASE] ${data?.length || 0} ingredientes encontrados.`);
  return data || [];
}

export async function addIngredient(ingredient: any) {
  const { data, error } = await supabase.from('ingredients').insert([ingredient]).select();
  handleError(error, 'addIngredient');
  return data?.[0];
}

export async function updateIngredient(id: number, ingredient: any) {
  const { data, error } = await supabase.from('ingredients').update(ingredient).eq('id', id).select();
  handleError(error, 'updateIngredient');
  return data?.[0];
}

export async function deleteIngredient(id: number) {
  const { error } = await supabase.from('ingredients').delete().eq('id', id);
  handleError(error, 'deleteIngredient');
}

// --- RECEITAS (RECIPES) ---
export async function getRecipes() {
  console.log('[SUPABASE] Buscando receitas...');
  const { data, error } = await supabase.from('ingredients').select('*').eq('is_processed', true).order('name');
  if (handleError(error, 'getRecipes')) return [];
  
  const recipesWithComponents = await Promise.all((data || []).map(async (recipe) => {
    const { data: components, error: compError } = await supabase
      .from('recipes')
      .select('*, component:ingredients!recipes_component_ingredient_id_fkey(*)')
      .eq('ingredient_id', recipe.id);
    
    return {
      ...recipe,
      costPerUnit: recipe.cost,
      yieldUnit: recipe.unit,
      yield: 1,
      ingredients: (components || []).map(c => ({
        id: c.id,
        ingredientId: c.component_ingredient_id,
        ingredientName: c.component?.name || 'Item removido',
        quantity: c.quantity,
        unit: c.component?.unit || 'un',
        costPerUnit: c.component?.cost || 0,
        totalCost: c.quantity * (c.component?.cost || 0)
      }))
    };
  }));

  console.log(`[SUPABASE] ${recipesWithComponents.length} receitas processadas.`);
  return recipesWithComponents;
}

export async function saveFullRecipe(recipeData: any) {
  const ingredientPayload = {
    name: recipeData.name,
    unit: recipeData.yieldUnit,
    cost: recipeData.costPerUnit,
    is_processed: true
  };

  let recipeId = recipeData.id;
  if (recipeId && recipeId > 1) {
    await updateIngredient(recipeId, ingredientPayload);
    await supabase.from('recipes').delete().eq('ingredient_id', recipeId);
  } else {
    const newIng = await addIngredient(ingredientPayload);
    recipeId = newIng.id;
  }

  if (recipeData.ingredients && recipeData.ingredients.length > 0) {
    const components = recipeData.ingredients.map((ing: any) => ({
      ingredient_id: recipeId,
      component_ingredient_id: ing.ingredientId,
      quantity: ing.quantity
    }));
    const { error } = await supabase.from('recipes').insert(components);
    handleError(error, 'saveRecipeComponents');
  }

  return { id: recipeId };
}

// --- PRODUTOS (PRODUCTS) ---
export async function getProductsWithIngredients() {
  console.log('[SUPABASE] Buscando produtos...');
  const { data: products, error } = await supabase.from('products').select('*').order('name');
  if (handleError(error, 'getProducts')) return [];

  const result = await Promise.all((products || []).map(async (product) => {
    const { data: components } = await supabase
      .from('product_ingredients')
      .select('*')
      .eq('product_id', product.id);
    
    return {
      ...product,
      ingredients: components || []
    };
  }));
  
  console.log(`[SUPABASE] ${result.length} produtos encontrados.`);
  return result;
}

export async function addProduct(product: any) {
  const payload = {
    name: product.name,
    description: product.description,
    category_id: product.category_id,
    price: product.price,
    production_cost: product.production_cost
  };
  const { data, error } = await supabase.from('products').insert([payload]).select();
  handleError(error, 'addProduct');
  return data?.[0];
}

export async function updateProduct(id: number, product: any) {
  const payload = {
    name: product.name,
    description: product.description,
    category_id: product.category_id,
    price: product.price,
    production_cost: product.production_cost
  };
  const { data, error } = await supabase.from('products').update(payload).eq('id', id).select();
  handleError(error, 'updateProduct');
  return data?.[0];
}

export async function addProductIngredient(ingredient: any) {
  const { data, error } = await supabase.from('product_ingredients').insert([ingredient]).select();
  handleError(error, 'addProductIngredient');
  return data?.[0];
}

export async function deleteProductIngredientsByProductId(productId: number) {
  const { error } = await supabase.from('product_ingredients').delete().eq('product_id', productId);
  handleError(error, 'deleteProductIngredients');
}

export async function deleteProduct(id: number) {
  await deleteProductIngredientsByProductId(id);
  const { error } = await supabase.from('products').delete().eq('id', id);
  handleError(error, 'deleteProduct');
}

// --- OUTROS ---
export async function getCustomers() {
  const { data } = await supabase.from('customers').select('*').order('name');
  return data || [];
}

export async function getSales() {
  const { data } = await supabase.from('sales').select('*').order('sale_date', { ascending: false });
  return data || [];
}
