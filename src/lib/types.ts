// Tipos para o sistema de receitas aninhadas

export type ItemType = 'BASE' | 'RECIPE' | 'FINAL_PRODUCT';
export type IngredientType = 'base' | 'processed' | 'final';

export interface RecipeIngredient {
  id: number;
  ingredientId: number;
  ingredientName: string;
  quantity: number;
  unit: string;
  costPerUnit: number;
  totalCost: number;
}

export interface TechnicalSheetEntry {
  id?: number;
  parent_id: number;
  parent_type: ItemType;
  component_id: number;
  quantity: number;
  unit: string;
  component_name?: string;
  component_cost?: number;
}

export interface Recipe {
  id: number;
  name: string;
  type: IngredientType;
  item_type?: ItemType;
  description: string;
  category: string;
  ingredients: RecipeIngredient[];
  technical_sheet?: TechnicalSheetEntry[];
  prepCost: number; // Custo de preparo (mão de obra, gás, etc)
  totalCost: number; // Custo total calculado
  yield: number; // Quantidade produzida
  yieldUnit: string;
  costPerUnit: number; // Custo por unidade
  createdAt: string;
  updatedAt: string;
}

export interface RecipeHierarchy {
  recipe: Recipe;
  children: RecipeHierarchy[];
  level: number;
}

export interface IngredientWithRecipe extends Recipe {
  isProcessed: boolean;
  usedInRecipes: number[]; // IDs das receitas que usam este insumo
}
