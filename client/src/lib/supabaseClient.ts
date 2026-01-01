import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials not configured. Using local storage fallback.');
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');

// Customers
export async function getCustomers() {
  const { data, error } = await supabase.from('customers').select('*');
  if (error) console.error('Error fetching customers:', error);
  return data || [];
}

export async function addCustomer(customer: any) {
  const { data, error } = await supabase.from('customers').insert([customer]).select();
  if (error) console.error('Error adding customer:', error);
  return data?.[0];
}

export async function updateCustomer(id: number, customer: any) {
  const { data, error } = await supabase.from('customers').update(customer).eq('id', id).select();
  if (error) console.error('Error updating customer:', error);
  return data?.[0];
}

export async function deleteCustomer(id: number) {
  const { error } = await supabase.from('customers').delete().eq('id', id);
  if (error) console.error('Error deleting customer:', error);
}

// Ingredients
export async function getIngredients() {
  const { data, error } = await supabase.from('ingredients').select('*');
  if (error) console.error('Error fetching ingredients:', error);
  return data || [];
}

export async function addIngredient(ingredient: any) {
  const { data, error } = await supabase.from('ingredients').insert([ingredient]).select();
  if (error) console.error('Error adding ingredient:', error);
  return data?.[0];
}

export async function updateIngredient(id: number, ingredient: any) {
  const { data, error } = await supabase.from('ingredients').update(ingredient).eq('id', id).select();
  if (error) console.error('Error updating ingredient:', error);
  return data?.[0];
}

export async function deleteIngredient(id: number) {
  const { error } = await supabase.from('ingredients').delete().eq('id', id);
  if (error) console.error('Error deleting ingredient:', error);
}

// Products
export async function getProducts() {
  const { data, error } = await supabase.from('products').select('*');
  if (error) console.error('Error fetching products:', error);
  return data || [];
}

export async function getProductsWithIngredients() {
  const { data: products, error: productsError } = await supabase.from('products').select('*');
  if (productsError) {
    console.error('Error fetching products:', productsError);
    return [];
  }

  // Carregar insumos para cada produto
  const productsWithIngredients = await Promise.all(
    (products || []).map(async (product) => {
      const { data: ingredients, error: ingredientsError } = await supabase
        .from('product_ingredients')
        .select('*')
        .eq('product_id', product.id);
      
      if (ingredientsError) console.error('Error fetching product ingredients:', ingredientsError);
      return {
        ...product,
        ingredients: ingredients || [],
      };
    })
  );

  return productsWithIngredients;
}

export async function addProduct(product: any) {
  const { data, error } = await supabase.from('products').insert([product]).select();
  if (error) console.error('Error adding product:', error);
  return data?.[0];
}

export async function updateProduct(id: number, product: any) {
  const { data, error } = await supabase.from('products').update(product).eq('id', id).select();
  if (error) console.error('Error updating product:', error);
  return data?.[0];
}

export async function deleteProduct(id: number) {
  // Deletar insumos do produto primeiro
  const { error: ingredientsError } = await supabase.from('product_ingredients').delete().eq('product_id', id);
  if (ingredientsError) console.error('Error deleting product ingredients:', ingredientsError);
  
  // Depois deletar o produto
  const { error } = await supabase.from('products').delete().eq('id', id);
  if (error) console.error('Error deleting product:', error);
}

// Product Ingredients
export async function addProductIngredient(ingredient: any) {
  const { data, error } = await supabase.from('product_ingredients').insert([ingredient]).select();
  if (error) console.error('Error adding product ingredient:', error);
  return data?.[0];
}

export async function deleteProductIngredient(id: number) {
  const { error } = await supabase.from('product_ingredients').delete().eq('id', id);
  if (error) console.error('Error deleting product ingredient:', error);
}

export async function deleteProductIngredientsByProductId(productId: number) {
  const { error } = await supabase.from('product_ingredients').delete().eq('product_id', productId);
  if (error) console.error('Error deleting product ingredients:', error);
}

// Sales
export async function getSales() {
  const { data, error } = await supabase.from('sales').select('*');
  if (error) console.error('Error fetching sales:', error);
  return data || [];
}

export async function addSale(sale: any) {
  const { data, error } = await supabase.from('sales').insert([sale]).select();
  if (error) console.error('Error adding sale:', error);
  return data?.[0];
}

export async function updateSale(id: number, sale: any) {
  const { data, error } = await supabase.from('sales').update(sale).eq('id', id).select();
  if (error) console.error('Error updating sale:', error);
  return data?.[0];
}

export async function deleteSale(id: number) {
  const { error } = await supabase.from('sales').delete().eq('id', id);
  if (error) console.error('Error deleting sale:', error);
}

// Accounts
export async function getAccounts() {
  const { data, error } = await supabase.from('accounts').select('*');
  if (error) console.error('Error fetching accounts:', error);
  return data || [];
}

export async function addAccount(account: any) {
  const { data, error } = await supabase.from('accounts').insert([account]).select();
  if (error) console.error('Error adding account:', error);
  return data?.[0];
}

export async function updateAccount(id: number, account: any) {
  const { data, error } = await supabase.from('accounts').update(account).eq('id', id).select();
  if (error) console.error('Error updating account:', error);
  return data?.[0];
}

export async function deleteAccount(id: number) {
  const { error } = await supabase.from('accounts').delete().eq('id', id);
  if (error) console.error('Error deleting account:', error);
}

// Categories
export async function getCategories(type?: string) {
  let query = supabase.from('transaction_categories').select('*');
  if (type) {
    query = query.eq('type', type);
  }
  const { data, error } = await query;
  if (error) console.error('Error fetching categories:', error);
  return data || [];
}

export async function addCategory(category: any) {
  const { data, error } = await supabase.from('transaction_categories').insert([category]).select();
  if (error) console.error('Error adding category:', error);
  return data?.[0];
}

export async function updateCategory(id: number, category: any) {
  const { data, error } = await supabase.from('transaction_categories').update(category).eq('id', id).select();
  if (error) console.error('Error updating category:', error);
  return data?.[0];
}

export async function deleteCategory(id: number) {
  const { error } = await supabase.from('transaction_categories').delete().eq('id', id);
  if (error) console.error('Error deleting category:', error);
}

// Financial Transactions
export async function getFinancialTransactions() {
  const { data, error } = await supabase.from('financial_transactions').select('*');
  if (error) console.error('Error fetching transactions:', error);
  return data || [];
}

export async function addFinancialTransaction(transaction: any) {
  const { data, error } = await supabase.from('financial_transactions').insert([transaction]).select();
  if (error) console.error('Error adding transaction:', error);
  return data?.[0];
}

export async function updateFinancialTransaction(id: number, transaction: any) {
  const { data, error } = await supabase.from('financial_transactions').update(transaction).eq('id', id).select();
  if (error) console.error('Error updating transaction:', error);
  return data?.[0];
}

export async function deleteFinancialTransaction(id: number) {
  const { error } = await supabase.from('financial_transactions').delete().eq('id', id);
  if (error) console.error('Error deleting transaction:', error);
}
