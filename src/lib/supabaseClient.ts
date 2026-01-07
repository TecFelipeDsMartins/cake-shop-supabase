import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('ERRO CRÍTICO: Variáveis do Supabase não encontradas! Verifique o painel da Vercel.');
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');

// ===== WHITELIST VALIDATION =====
export async function isEmailWhitelisted(email: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('whitelisted_emails')
      .select('id')
      .eq('email', email.toLowerCase())
      .single();
    
    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
      handleError(error, 'isEmailWhitelisted');
      return false;
    }
    
    return !!data;
  } catch (error) {
    console.error('Erro ao verificar whitelist:', error);
    return false;
  }
}

export async function addToWhitelist(email: string) {
  try {
    const { data, error } = await supabase
      .from('whitelisted_emails')
      .insert([{ email: email.toLowerCase() }])
      .select();
    
    if (handleError(error, 'addToWhitelist')) return null;
    return data?.[0];
  } catch (error) {
    console.error('Erro ao adicionar email à whitelist:', error);
    return null;
  }
}

export async function removeFromWhitelist(email: string) {
  try {
    const { error } = await supabase
      .from('whitelisted_emails')
      .delete()
      .eq('email', email.toLowerCase());
    
    if (handleError(error, 'removeFromWhitelist')) return false;
    return true;
  } catch (error) {
    console.error('Erro ao remover email da whitelist:', error);
    return false;
  }
}

export async function getAllWhitelistedEmails() {
  try {
    const { data, error } = await supabase
      .from('whitelisted_emails')
      .select('email')
      .order('email');
    
    if (handleError(error, 'getAllWhitelistedEmails')) return [];
    return data?.map(row => row.email) || [];
  } catch (error) {
    console.error('Erro ao obter whitelist:', error);
    return [];
  }
}

// Helper para lidar com erros com logs detalhados
// Retorna true se houve erro, false caso contrário
const handleError = (error: any, context: string): boolean => {
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

// Classe de erro customizada para erros do Supabase
export class SupabaseError extends Error {
  constructor(message: string, public code?: string, public details?: string, public hint?: string) {
    super(message);
    this.name = 'SupabaseError';
  }
}

// ===== INGREDIENT CATEGORIES =====
export async function getIngredientCategories() {
  const { data, error } = await supabase.from('ingredient_categories').select('*').order('name');
  if (handleError(error, 'getIngredientCategories')) return [];
  return data || [];
}

export async function addIngredientCategory(category: any) {
  const { data: { user } } = await supabase.auth.getUser();
  const payload = { ...category, user_id: user?.id };
  const { data, error } = await supabase.from('ingredient_categories').insert([payload]).select();
  handleError(error, 'addIngredientCategory');
  return data?.[0];
}

export async function updateIngredientCategory(id: number, category: any) {
  const { data, error } = await supabase.from('ingredient_categories').update(category).eq('id', id).select();
  handleError(error, 'updateIngredientCategory');
  return data?.[0];
}

export async function deleteIngredientCategory(id: number) {
  const { error } = await supabase.from('ingredient_categories').delete().eq('id', id);
  handleError(error, 'deleteIngredientCategory');
}

// ===== INSUMOS (INGREDIENTS) =====
export async function getIngredients() {
  const { data, error } = await supabase.from('ingredients').select('*').order('name');
  if (handleError(error, 'getIngredients')) return [];
  return data || [];
}

export async function addIngredient(ingredient: any) {
  const { data: { user } } = await supabase.auth.getUser();
  const payload = { ...ingredient, user_id: user?.id };
  const { data, error } = await supabase.from('ingredients').insert([payload]).select();
  handleError(error, 'addIngredient');
  return data?.[0];
}

export async function updateIngredient(id: number, ingredient: any) {
  const { data, error } = await supabase.from('ingredients').update(ingredient).eq('id', id).select();
  handleError(error, 'updateIngredient');
  return data?.[0];
}

export async function deleteIngredient(id: number) {
  try {
    // Primeiro, deletar todas as referências em technical_sheets
    const { error: sheetError } = await supabase
      .from('technical_sheets')
      .delete()
      .eq('component_id', id);
    
    if (sheetError) throw sheetError;
    
    // Depois, deletar o ingrediente
    const { error } = await supabase.from('ingredients').delete().eq('id', id);
    if (error) throw error;
  } catch (error) {
    console.error('Erro ao deletar ingrediente:', error);
    throw error;
  }
}

// ===== RECEITAS (RECIPES) =====
// Nota: Receitas são ingredientes processados (is_processed = true)
// Para obter receitas completas com ficha técnica, usar getIngredients() filtrado + getTechnicalSheet()
export async function getRecipes() {
  // Buscar ingredientes processados (que são receitas)
  const { data, error } = await supabase
    .from('ingredients')
    .select('*')
    .eq('is_processed', true)
    .order('created_at', { ascending: false });
  
  if (handleError(error, 'getRecipes')) return [];
  
  // Para cada receita, buscar sua ficha técnica se existir
  const recipesWithSheets = await Promise.all((data || []).map(async (recipe) => {
    try {
      const sheet = await getTechnicalSheet(recipe.id, 'RECIPE');
      // Mapear a ficha técnica para o formato de ingredients esperado pelo Recipe
      const ingredients = (sheet || []).map((entry: any) => {
        // Ajustar custo baseado nas unidades
        const baseUnit = entry.component?.unit || 'kg';
        const targetUnit = entry.unit || 'g';
        const baseCost = entry.component?.cost || 0;
        let adjustedCost = baseCost;
        const unit = baseUnit.toLowerCase();
        const target = targetUnit.toLowerCase();
        if (unit !== target) {
          if (unit === 'kg' && target === 'g') adjustedCost = baseCost / 1000;
          else if (unit === 'g' && target === 'kg') adjustedCost = baseCost * 1000;
          else if (unit === 'l' && target === 'ml') adjustedCost = baseCost / 1000;
          else if (unit === 'ml' && target === 'l') adjustedCost = baseCost * 1000;
        }
        
        return {
          id: Math.random(), // ID temporário para o componente
          ingredientId: entry.component_id,
          ingredientName: entry.component?.name || 'Desconhecido',
          quantity: entry.quantity,
          unit: entry.unit,
          costPerUnit: adjustedCost,
          totalCost: entry.quantity * adjustedCost,
        };
      });
      
      const totalCost = ingredients.reduce((sum, ing) => sum + (ing?.totalCost || 0), 0) + (recipe.cost || 0);
      const costPerUnit = recipe.current_stock > 0 ? totalCost / (recipe.current_stock || 1) : 0;
      
      return {
        id: recipe.id,
        name: recipe.name,
        type: (recipe.item_type === 'RECIPE' ? 'processed' : 'base') as IngredientType,
        description: '',
        category: '',
        ingredients,
        prepCost: recipe.cost || 0,
        cost: recipe.cost || 0, // Para compatibilidade com o display
        totalCost,
        yield: recipe.current_stock || 1,
        yieldUnit: recipe.unit || 'un',
        costPerUnit,
        createdAt: recipe.created_at,
        updatedAt: recipe.updated_at,
      };
      console.log('loaded ingredients for recipe', recipe.id, ':', ingredients.length, 'items');
    } catch (error) {
      console.log('error loading technical sheet for recipe', recipe.id, error);
      return {
        id: recipe.id,
        name: recipe.name,
        type: (recipe.item_type === 'RECIPE' ? 'processed' : 'base') as IngredientType,
        description: '',
        category: '',
        ingredients: [],
        prepCost: recipe.cost || 0,
        cost: recipe.cost || 0, // Para compatibilidade
        totalCost: recipe.cost || 0,
        yield: recipe.current_stock || 1,
        yieldUnit: recipe.unit || 'un',
        costPerUnit: 0,
        createdAt: recipe.created_at,
        updatedAt: recipe.updated_at,
      };
    }
  }));
  
  return recipesWithSheets;
}

export async function addRecipe(recipe: any) {
  const { data: { user } } = await supabase.auth.getUser();
  const payload = { ...recipe, user_id: user?.id };
  const { data, error } = await supabase.from('recipes').insert([payload]).select();
  handleError(error, 'addRecipe');
  return data?.[0];
}

export async function updateRecipe(id: number, recipe: any) {
  const { data, error } = await supabase.from('recipes').update(recipe).eq('id', id).select();
  handleError(error, 'updateRecipe');
  return data?.[0];
}

export async function deleteRecipe(id: number) {
  const { error } = await supabase.from('recipes').delete().eq('id', id);
  handleError(error, 'deleteRecipe');
}

export async function saveFullRecipe(recipeData: any) {
  console.log('saveFullRecipe recipeData.totalCost:', recipeData.totalCost);
  try {
    const { data: { user } } = await supabase.auth.getUser();
    const recipeId = recipeData.id;
    
    // 1. Salvar ou atualizar o item base (na tabela ingredients para receitas)
    const ingredientPayload: any = {
      name: recipeData.name,
      cost: recipeData.prepCost || 0, // Salvar apenas o custo de preparo, não o total
      unit: recipeData.yieldUnit,
      current_stock: recipeData.yield || 0,
      is_processed: true,
      user_id: user?.id
    };

    // Adicionar item_type apenas se a coluna existir (migration v2)
    // A migration v2 adiciona essa coluna, mas para compatibilidade, vamos tentar
    if (recipeData.item_type !== undefined) {
      ingredientPayload.item_type = recipeData.item_type || 'RECIPE';
    }

    let finalRecipeId: number;
    
    // Se tem ID válido, atualiza; caso contrário, cria novo
    if (recipeId && typeof recipeId === 'number' && recipeId > 0) {
      const updated = await updateIngredient(recipeId, ingredientPayload);
      finalRecipeId = updated?.id || recipeId;
    } else {
      // Usar insert direto para preservar user_id em nova receita
      const { data: newData, error: newError } = await supabase
        .from('ingredients')
        .insert([ingredientPayload])
        .select();
      
      if (newError) {
        handleError(newError, 'saveFullRecipe - insert');
        throw newError;
      }
      
      if (!newData?.[0]?.id) {
        throw new Error('Falha ao criar ingrediente/receita');
      }
      finalRecipeId = newData[0].id;
    }
    
    // 2. Salvar a ficha técnica (apenas se ingredients foram fornecidos)
    if (finalRecipeId && recipeData.ingredients && Array.isArray(recipeData.ingredients) && recipeData.ingredients.length > 0) {
      const sheetEntries = recipeData.ingredients.map((ing: any) => ({
        component_id: ing.ingredientId,
        quantity: ing.quantity,
        unit: ing.unit,
        user_id: user?.id
      }));
      await saveTechnicalSheet(finalRecipeId, 'RECIPE', sheetEntries);
    }
    
    return { id: finalRecipeId };
  } catch (error) {
    handleError(error, 'saveFullRecipe');
    throw error;
  }
}

// ===== PRODUCT CATEGORIES =====
export async function getProductCategories() {
  const { data, error } = await supabase.from('product_categories').select('*').order('name');
  if (handleError(error, 'getProductCategories')) return [];
  return data || [];
}

export async function addProductCategory(category: any) {
  const { data: { user } } = await supabase.auth.getUser();
  const payload = { ...category, user_id: user?.id };
  const { data, error } = await supabase.from('product_categories').insert([payload]).select();
  handleError(error, 'addProductCategory');
  return data?.[0];
}

export async function updateProductCategory(id: number, category: any) {
  const { data, error } = await supabase.from('product_categories').update(category).eq('id', id).select();
  handleError(error, 'updateProductCategory');
  return data?.[0];
}

export async function deleteProductCategory(id: number) {
  const { error } = await supabase.from('product_categories').delete().eq('id', id);
  handleError(error, 'deleteProductCategory');
}

// ===== PRODUTOS (PRODUCTS) =====
export async function getProducts() {
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      category:product_categories(name, color)
    `)
    .order('name');
  if (handleError(error, 'getProducts')) return [];
  return data || [];
}

export async function getProductsWithIngredients() {
  console.log('getProductsWithIngredients called');
  const { data: products, error } = await supabase.from('products').select('*').order('name');
  console.log('products fetched:', products, 'error:', error);
  if (handleError(error, 'getProducts')) return [];

  const result = await Promise.all((products || []).map(async (product) => {
    console.log('processing product:', product.id, product.name);
    // Buscar ficha técnica do produto
    const sheet = await getTechnicalSheet(product.id, 'FINAL_PRODUCT');
    console.log('sheet for product', product.id, ':', sheet);
    
    // Mapear para o formato de ingredients
    const ingredients = await Promise.all((sheet || []).map(async (entry: any) => {
      let component = await supabase
        .from('ingredients')
        .select('name, cost, unit, is_processed')
        .eq('id', entry.component_id)
        .single();
      
      console.log('component for id', entry.component_id, ':', component.data, 'error:', component.error);
      
      let adjustedCost = component.data?.cost || 0;
      
      // Se for uma receita processada, buscar o custo total da receita
      if (component.data?.is_processed) {
        const recipes = await getRecipes();
        const recipe = recipes.find(r => r.id === entry.component_id);
        console.log('recipe found:', recipe, 'totalCost:', recipe?.totalCost);
        if (recipe) {
          adjustedCost = recipe.totalCost || 0;
        }
      }
      
      // Ajustar custo baseado nas unidades
      const baseUnit = component.data?.unit || 'kg';
      const targetUnit = entry.unit || 'g';
      if (baseUnit !== targetUnit) {
        if (baseUnit === 'kg' && targetUnit === 'g') adjustedCost = adjustedCost / 1000;
        else if (baseUnit === 'g' && targetUnit === 'kg') adjustedCost = adjustedCost * 1000;
        else if (baseUnit === 'l' && targetUnit === 'ml') adjustedCost = adjustedCost / 1000;
        else if (baseUnit === 'ml' && targetUnit === 'l') adjustedCost = adjustedCost * 1000;
      }
      
      return {
        id: Math.random(),
        ingredient_id: entry.component_id,
        ingredient_name: component.data?.name || 'Desconhecido',
        quantity: entry.quantity || 1,
        unit: entry.unit || 'un',
        cost: adjustedCost,
        total_cost: (entry.quantity || 1) * adjustedCost,
      };
    }));
    
    return {
      ...product,
      ingredients,
      production_cost: ingredients.reduce((sum, ing) => sum + ing.total_cost, 0)
    };
  }));
  
  return result;
}

export async function addProduct(product: any) {
  const { data: { user } } = await supabase.auth.getUser();
  const payload = { ...product, user_id: user?.id };
  const { data, error } = await supabase.from('products').insert([payload]).select();
  handleError(error, 'addProduct');
  return data?.[0];
}

export async function updateProduct(id: number, product: any) {
  const { technical_sheet, ingredients, ...productData } = product;
  const { data, error } = await supabase.from('products').update(productData).eq('id', id).select();
  
  if (!handleError(error, 'updateProduct') && technical_sheet) {
    await saveTechnicalSheet(id, 'FINAL_PRODUCT', technical_sheet);
  }
  
  return data?.[0];
}

export async function saveFullProduct(product: any) {
  const { technical_sheet, ingredients, ...productData } = product;
  let productId = product.id;

  if (productId) {
    await updateProduct(productId, product);
  } else {
    // Adicionar user_id do usuário autenticado
    const { data: { user } } = await supabase.auth.getUser();
    const payload = { ...productData, user_id: user?.id };
    
    const { data, error } = await supabase.from('products').insert([payload]).select();
    if (!handleError(error, 'addProduct') && data?.[0]) {
      productId = data[0].id;
      if (technical_sheet) {
        await saveTechnicalSheet(productId, 'FINAL_PRODUCT', technical_sheet);
      }
    }
  }
  return { id: productId };
}

export async function deleteProduct(id: number) {
  try {
    console.log('Deletando produto ID:', id);
    
    // 1. Deletar sale_items
    await supabase.from('sale_items').delete().eq('product_id', id);
    
    // 2. Deletar product_ingredients
    await supabase.from('product_ingredients').delete().eq('product_id', id);

    // 3. Deletar o produto
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);
    
    console.log('Produto deletado, erro:', error);
    
    if (error) {
      console.error('Erro ao deletar:', error);
      throw error;
    }
  } catch (error) {
    console.error('Erro ao deletar produto:', error);
    throw error;
  }
}

// ===== PRODUCT INGREDIENTS =====
export async function addProductIngredient(ingredient: any) {
  const { data, error } = await supabase.from('product_ingredients').insert([ingredient]).select();
  handleError(error, 'addProductIngredient');
  return data?.[0];
}

export async function deleteProductIngredient(id: number) {
  const { error } = await supabase.from('product_ingredients').delete().eq('id', id);
  handleError(error, 'deleteProductIngredient');
}

export async function deleteProductIngredientsByProductId(productId: number) {
  const { error } = await supabase.from('product_ingredients').delete().eq('product_id', productId);
  handleError(error, 'deleteProductIngredients');
}

// ===== CLIENTES (CUSTOMERS) =====
export async function getCustomers() {
  const { data, error } = await supabase.from('customers').select('*').order('name');
  if (handleError(error, 'getCustomers')) return [];
  return data || [];
}

export async function addCustomer(customer: any) {
  const { data: { user } } = await supabase.auth.getUser();
  const payload = { ...customer, user_id: user?.id };
  const { data, error } = await supabase.from('customers').insert([payload]).select();
  handleError(error, 'addCustomer');
  return data?.[0];
}

export async function updateCustomer(id: number, customer: any) {
  const { data, error } = await supabase.from('customers').update(customer).eq('id', id).select();
  handleError(error, 'updateCustomer');
  return data?.[0];
}

export async function deleteCustomer(id: number) {
  const { error } = await supabase.from('customers').delete().eq('id', id);
  handleError(error, 'deleteCustomer');
}

// ===== CONTAS (ACCOUNTS) =====
export async function getAccounts() {
  const { data, error } = await supabase.from('accounts').select('*').order('name');
  if (handleError(error, 'getAccounts')) return [];
  return data || [];
}

export async function addAccount(account: any) {
  const { data, error } = await supabase.from('accounts').insert([account]).select();
  handleError(error, 'addAccount');
  return data?.[0];
}

export async function updateAccount(id: number, account: any) {
  const { data, error } = await supabase.from('accounts').update(account).eq('id', id).select();
  handleError(error, 'updateAccount');
  return data?.[0];
}

export async function deleteAccount(id: number) {
  const { error } = await supabase.from('accounts').delete().eq('id', id);
  handleError(error, 'deleteAccount');
}

// ===== TRANSACTION CATEGORIES =====
export async function getTransactionCategories() {
  const { data, error } = await supabase.from('transaction_categories').select('*').order('name');
  if (handleError(error, 'getTransactionCategories')) return [];
  return data || [];
}

export async function addTransactionCategory(category: any) {
  const { data, error } = await supabase.from('transaction_categories').insert([category]).select();
  handleError(error, 'addTransactionCategory');
  return data?.[0];
}

export async function updateTransactionCategory(id: number, category: any) {
  const { data, error } = await supabase.from('transaction_categories').update(category).eq('id', id).select();
  handleError(error, 'updateTransactionCategory');
  return data?.[0];
}

export async function deleteTransactionCategory(id: number) {
  const { error } = await supabase.from('transaction_categories').delete().eq('id', id);
  handleError(error, 'deleteTransactionCategory');
}

// ===== PAYMENT METHODS =====
export async function getPaymentMethods() {
  const { data, error } = await supabase.from('payment_methods').select('*').order('name');
  if (handleError(error, 'getPaymentMethods')) return [];
  return data || [];
}

export async function addPaymentMethod(method: any) {
  const { data, error } = await supabase.from('payment_methods').insert([method]).select();
  handleError(error, 'addPaymentMethod');
  return data?.[0];
}

export async function updatePaymentMethod(id: number, method: any) {
  const { data, error } = await supabase.from('payment_methods').update(method).eq('id', id).select();
  handleError(error, 'updatePaymentMethod');
  return data?.[0];
}

export async function deletePaymentMethod(id: number) {
   const { error } = await supabase.from('payment_methods').delete().eq('id', id);
   handleError(error, 'deletePaymentMethod');
 }

 // ===== CUSTOMER ORIGINS =====
 export async function getCustomerOrigins() {
   const { data, error } = await supabase.from('customer_origins').select('*').order('name');
   if (handleError(error, 'getCustomerOrigins')) return [];
   return data || [];
 }

 export async function addCustomerOrigin(origin: any) {
   const { data, error } = await supabase.from('customer_origins').insert([origin]).select();
   handleError(error, 'addCustomerOrigin');
   return data?.[0];
 }

 export async function updateCustomerOrigin(id: number, origin: any) {
   const { data, error } = await supabase.from('customer_origins').update(origin).eq('id', id).select();
   handleError(error, 'updateCustomerOrigin');
   return data?.[0];
 }

 export async function deleteCustomerOrigin(id: number) {
   const { error } = await supabase.from('customer_origins').delete().eq('id', id);
   handleError(error, 'deleteCustomerOrigin');
 }

 // ===== VENDAS (SALES) =====
export async function getSales() {
  const { data, error } = await supabase
    .from('sales')
    .select(`
      *,
      customer:customers(name, email, phone),
      payment_method:payment_methods(name),
      account:accounts(name)
    `)
    .order('sale_date', { ascending: false });
  if (handleError(error, 'getSales')) return [];
  // Corrigir total_amount que foram salvos com divisão por 100
  return (data || []).map(sale => ({
    ...sale,
    total_amount: sale.total_amount < 100 ? sale.total_amount * 100 : sale.total_amount
  }));
}

export async function addSale(sale: any) {
  const { data: { user } } = await supabase.auth.getUser();
  const payload = { ...sale, user_id: user?.id };
  const { data, error } = await supabase.from('sales').insert([payload]).select();
  handleError(error, 'addSale');
  return data?.[0];
}

export async function updateSale(id: number, sale: any) {
  const { data, error } = await supabase.from('sales').update(sale).eq('id', id).select();
  handleError(error, 'updateSale');
  return data?.[0];
}

export async function deleteSale(id: number) {
  try {
    // 1. Deletar sale_items primeiro
    await supabase.from('sale_items').delete().eq('sale_id', id);
    
    // 2. Deletar a venda
    const { error } = await supabase.from('sales').delete().eq('id', id);
    if (error) throw error;
  } catch (error) {
    console.error('Erro ao deletar venda:', error);
    throw error;
  }
}

// ===== SALE ITEMS =====
export async function getSaleItems(saleId: number) {
  const { data, error } = await supabase
    .from('sale_items')
    .select(`
      *,
      product:products(name, price, production_cost)
    `)
    .eq('sale_id', saleId);
  if (handleError(error, 'getSaleItems')) return [];
  // Corrigir subtotals que foram salvos com divisão por 100
  return (data || []).map(item => ({
    ...item,
    subtotal: item.subtotal < 100 ? item.subtotal * 100 : item.subtotal
  }));
}

export async function addSaleItem(item: any) {
  const { data, error } = await supabase.from('sale_items').insert([item]).select();
  handleError(error, 'addSaleItem');
  return data?.[0];
}

export async function deleteSaleItem(id: number) {
  const { error } = await supabase.from('sale_items').delete().eq('id', id);
  handleError(error, 'deleteSaleItem');
}

// ===== FINANCIAL TRANSACTIONS =====
export async function getFinancialTransactions() {
  const { data, error } = await supabase
    .from('financial_transactions')
    .select(`
      *,
      category:transaction_categories(name, type),
      account:accounts!account_id(name)
    `)
    .order('transaction_date', { ascending: false });
  if (handleError(error, 'getFinancialTransactions')) return [];
  return data || [];
}

export async function addFinancialTransaction(transaction: any) {
  const { data, error } = await supabase.from('financial_transactions').insert([transaction]).select();
  handleError(error, 'addFinancialTransaction');
  return data?.[0];
}

export async function updateFinancialTransaction(id: number, transaction: any) {
  const { data, error } = await supabase.from('financial_transactions').update(transaction).eq('id', id).select();
  handleError(error, 'updateFinancialTransaction');
  return data?.[0];
}

export async function deleteFinancialTransaction(id: number) {
  const { error } = await supabase.from('financial_transactions').delete().eq('id', id);
  handleError(error, 'deleteFinancialTransaction');
}

// ===== DASHBOARD METRICS =====
export async function getDashboardMetrics() {
  try {
    // Total de vendas do mês
    const { data: salesData } = await supabase
      .from('sales')
      .select('total_amount')
      .gte('sale_date', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString());

    // Total de produtos
    const { data: productsData } = await supabase
      .from('products')
      .select('id');

    // Total de clientes
    const { data: customersData } = await supabase
      .from('customers')
      .select('id');

    // Corrigir valores que foram salvos com divisão por 100
    const totalSales = salesData?.reduce((sum, s) => {
      const amount = s.total_amount || 0;
      const correctedAmount = amount < 100 ? amount * 100 : amount;
      return sum + correctedAmount;
    }, 0) || 0;

    return {
      totalSales,
      totalProducts: productsData?.length || 0,
      totalCustomers: customersData?.length || 0,
      salesCount: salesData?.length || 0
    };
  } catch (error) {
    console.error('Erro ao buscar métricas:', error);
    return {
      totalSales: 0,
      totalProducts: 0,
      totalCustomers: 0,
      salesCount: 0
    };
  }
}

// ===== FICHA TÉCNICA (TECHNICAL SHEETS) =====
export async function getTechnicalSheet(parentId: number, parentType: string) {
  const { data, error } = await supabase
    .from('technical_sheets')
    .select('*')
    .eq('parent_id', parentId)
    .eq('parent_type', parentType);
  
  if (handleError(error, 'getTechnicalSheet')) return [];
  
  // Buscar os componentes separadamente
  const sheetWithComponents = await Promise.all((data || []).map(async (entry) => {
    const { data: comp, error: compError } = await supabase
      .from('ingredients')
      .select('name, cost, unit')
      .eq('id', entry.component_id)
      .single();
    
    return {
      ...entry,
      component: comp || { name: 'Desconhecido', cost: 0, unit: 'un' }
    };
  }));
  
  return sheetWithComponents;
}

export async function saveTechnicalSheet(parentId: number, parentType: string, entries: any[]) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    // 1. Remover entradas antigas
    const { error: deleteError } = await supabase
      .from('technical_sheets')
      .delete()
      .eq('parent_id', parentId)
      .eq('parent_type', parentType);
    
    if (deleteError) throw deleteError;

    // 2. Inserir novas entradas
    if (entries.length > 0) {
      const formattedEntries = entries.map(entry => ({
        parent_id: parentId,
        parent_type: parentType,
        component_id: entry.component_id,
        quantity: entry.quantity,
        unit: entry.unit,
        user_id: entry.user_id || user?.id
      }));

      const { error: insertError } = await supabase
        .from('technical_sheets')
        .insert(formattedEntries);
      
      if (insertError) throw insertError;
    }
  } catch (error) {
    handleError(error, 'saveTechnicalSheet');
    throw error;
  }
}
