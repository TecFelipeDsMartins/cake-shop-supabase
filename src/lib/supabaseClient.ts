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

// ===== INGREDIENT CATEGORIES =====
export async function getIngredientCategories() {
  const { data, error } = await supabase.from('ingredient_categories').select('*').order('name');
  if (handleError(error, 'getIngredientCategories')) return [];
  return data || [];
}

export async function addIngredientCategory(category: any) {
  const { data, error } = await supabase.from('ingredient_categories').insert([category]).select();
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

// ===== RECEITAS (RECIPES) =====
export async function getRecipes() {
  const { data, error } = await supabase
    .from('recipes')
    .select(`
      *,
      ingredient:ingredients(name, cost, unit),
      component:ingredients(name, cost, unit)
    `)
    .order('created_at', { ascending: false });
  if (handleError(error, 'getRecipes')) return [];
  return data || [];
}

export async function addRecipe(recipe: any) {
  const { data, error } = await supabase.from('recipes').insert([recipe]).select();
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
  try {
    let recipeId = recipeData.id;
    
    if (recipeId) {
      // Atualizar receita existente
      await updateRecipe(recipeId, {
        ingredient_id: recipeData.ingredient_id,
        component_ingredient_id: recipeData.component_ingredient_id,
        quantity: recipeData.quantity
      });
    } else {
      // Criar nova receita
      const newRecipe = await addRecipe({
        ingredient_id: recipeData.ingredient_id,
        component_ingredient_id: recipeData.component_ingredient_id,
        quantity: recipeData.quantity
      });
      recipeId = newRecipe?.id;
    }
    
    return { id: recipeId };
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
  const { data, error } = await supabase.from('product_categories').insert([category]).select();
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
  const { data: products, error } = await supabase.from('products').select('*').order('name');
  if (handleError(error, 'getProducts')) return [];

  const result = await Promise.all((products || []).map(async (product) => {
    const { data: ingredients } = await supabase
      .from('product_ingredients')
      .select('*')
      .eq('product_id', product.id);
    
    return {
      ...product,
      ingredients: ingredients || []
    };
  }));
  
  return result;
}

export async function addProduct(product: any) {
  const { data, error } = await supabase.from('products').insert([product]).select();
  handleError(error, 'addProduct');
  return data?.[0];
}

export async function updateProduct(id: number, product: any) {
  const { data, error } = await supabase.from('products').update(product).eq('id', id).select();
  handleError(error, 'updateProduct');
  return data?.[0];
}

export async function deleteProduct(id: number) {
  const { error } = await supabase.from('products').delete().eq('id', id);
  handleError(error, 'deleteProduct');
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
  const { data, error } = await supabase.from('customers').insert([customer]).select();
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
  return data || [];
}

export async function addSale(sale: any) {
  const { data, error } = await supabase.from('sales').insert([sale]).select();
  handleError(error, 'addSale');
  return data?.[0];
}

export async function updateSale(id: number, sale: any) {
  const { data, error } = await supabase.from('sales').update(sale).eq('id', id).select();
  handleError(error, 'updateSale');
  return data?.[0];
}

export async function deleteSale(id: number) {
  const { error } = await supabase.from('sales').delete().eq('id', id);
  handleError(error, 'deleteSale');
}

// ===== SALE ITEMS =====
export async function getSaleItems(saleId: number) {
  const { data, error } = await supabase
    .from('sale_items')
    .select(`
      *,
      product:products(name, price)
    `)
    .eq('sale_id', saleId);
  if (handleError(error, 'getSaleItems')) return [];
  return data || [];
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
      account:accounts(name),
      from_account:accounts(name),
      to_account:accounts(name)
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

    const totalSales = salesData?.reduce((sum, s) => sum + (s.total_amount || 0), 0) || 0;

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
