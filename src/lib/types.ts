// Tipos para o sistema de receitas aninhadas

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

export interface Recipe {
  id: number;
  name: string;
  type: IngredientType;
  description: string;
  category: string;
  ingredients: RecipeIngredient[];
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
