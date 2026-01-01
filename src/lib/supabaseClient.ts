import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');

// Helper para lidar com erros
const handleError = (error: any, context: string) => {
  if (error) {
    console.error(`Erro em ${context}:`, error);
    throw error;
  }
};

// --- INSUMOS (INGREDIENTS) ---
export async function getIngredients() {
  const { data, error } = await supabase.from('ingredients').select('*').order('name');
  handleError(error, 'getIngredients');
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
// Nota: Como a tabela 'recipes' no banco é de ligação, vamos usar uma abordagem 
// onde salvamos o cabeçalho da receita na tabela 'ingredients' com is_processed = true
// Isso unifica tudo e resolve os problemas de chave estrangeira (FK).

export async function getRecipes() {
  // Buscamos itens que são processados (receitas)
  const { data, error } = await supabase.from('ingredients').select('*').eq('is_processed', true).order('name');
  handleError(error, 'getRecipes');
  
  // Para cada receita, buscamos seus componentes na tabela 'recipes'
  const recipesWithComponents = await Promise.all((data || []).map(async (recipe) => {
    const { data: components, error: compError } = await supabase
      .from('recipes')
      .select('*, component:ingredients!recipes_component_ingredient_id_fkey(*)')
      .eq('ingredient_id', recipe.id);
    
    return {
      ...recipe,
      costPerUnit: recipe.cost,
      yieldUnit: recipe.unit,
      yield: 1, // Valor padrão se não houver na tabela
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

  return recipesWithComponents;
}

export async function saveFullRecipe(recipeData: any) {
  // 1. Salva/Atualiza o cabeçalho na tabela ingredients
  const ingredientPayload = {
    name: recipeData.name,
    unit: recipeData.yieldUnit,
    cost: recipeData.costPerUnit,
    is_processed: true
  };

  let recipeId = recipeData.id;
  if (recipeId && recipeId > 1) { // ID real do banco
    await updateIngredient(recipeId, ingredientPayload);
    // Limpa componentes antigos
    await supabase.from('recipes').delete().eq('ingredient_id', recipeId);
  } else {
    const newIng = await addIngredient(ingredientPayload);
    recipeId = newIng.id;
  }

  // 2. Salva os componentes na tabela recipes
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
  const { data: products, error } = await supabase.from('products').select('*').order('name');
  handleError(error, 'getProducts');

  return await Promise.all((products || []).map(async (product) => {
    const { data: components } = await supabase
      .from('product_ingredients')
      .select('*')
      .eq('product_id', product.id);
    
    return {
      ...product,
      ingredients: components || []
    };
  }));
}

export async function saveFullProduct(productData: any) {
  const payload = {
    name: productData.name,
    description: productData.description,
    category_id: productData.category_id,
    price: productData.price,
    production_cost: productData.production_cost
  };

  let productId = productData.id;
  if (productId) {
    await supabase.from('products').update(payload).eq('id', productId);
    await supabase.from('product_ingredients').delete().eq('product_id', productId);
  } else {
    const { data, error } = await supabase.from('products').insert([payload]).select();
    handleError(error, 'addProduct');
    productId = data?.[0].id;
  }

  if (productData.ingredients && productData.ingredients.length > 0) {
    const components = productData.ingredients.map((ing: any) => ({
      product_id: productId,
      ingredient_id: ing.ingredient_id,
      ingredient_name: ing.ingredient_name,
      quantity: ing.quantity,
      unit: ing.unit,
      cost: ing.cost,
      is_processed: ing.is_processed
    }));
    await supabase.from('product_ingredients').insert(components);
  }
  
  return { id: productId };
}

export async function deleteProduct(id: number) {
  await supabase.from('product_ingredients').delete().eq('product_id', id);
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
