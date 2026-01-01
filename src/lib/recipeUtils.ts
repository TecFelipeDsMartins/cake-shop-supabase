import { Recipe, RecipeIngredient, RecipeHierarchy } from './types';

/**
 * Calcula o custo total de uma receita baseado em seus ingredientes
 */
export function calculateRecipeCost(recipe: Recipe): number {
  const ingredientsCost = recipe.ingredients.reduce((sum, ing) => sum + ing.totalCost, 0);
  return ingredientsCost + recipe.prepCost;
}

/**
 * Calcula o custo por unidade de uma receita
 */
export function calculateCostPerUnit(recipe: Recipe): number {
  const totalCost = calculateRecipeCost(recipe);
  return recipe.yield > 0 ? totalCost / recipe.yield : 0;
}

/**
 * Calcula o custo de um ingrediente em uma receita
 */
export function calculateIngredientCost(ingredient: RecipeIngredient): number {
  return ingredient.quantity * ingredient.costPerUnit;
}

/**
 * Atualiza os custos de todos os ingredientes em uma receita
 */
export function updateRecipeIngredientsCosts(recipe: Recipe): Recipe {
  const updatedIngredients = recipe.ingredients.map(ing => ({
    ...ing,
    totalCost: calculateIngredientCost(ing),
  }));

  const totalCost = calculateRecipeCost({
    ...recipe,
    ingredients: updatedIngredients,
  });

  return {
    ...recipe,
    ingredients: updatedIngredients,
    totalCost,
    costPerUnit: calculateCostPerUnit({
      ...recipe,
      ingredients: updatedIngredients,
      totalCost,
    }),
  };
}

/**
 * Cria uma hierarquia visual de receitas
 */
export function buildRecipeHierarchy(
  recipe: Recipe,
  allRecipes: Recipe[],
  level: number = 0,
  visited: Set<number> = new Set()
): RecipeHierarchy {
  if (visited.has(recipe.id)) {
    return { recipe, children: [], level };
  }

  visited.add(recipe.id);

  const children = recipe.ingredients
    .map(ing => allRecipes.find(r => r.id === ing.ingredientId))
    .filter((r): r is Recipe => r !== undefined)
    .map(childRecipe => buildRecipeHierarchy(childRecipe, allRecipes, level + 1, visited));

  return { recipe, children, level };
}

/**
 * Formata a exibição de uma receita em árvore
 */
export function formatRecipeTree(hierarchy: RecipeHierarchy, indent: number = 0): string[] {
  const lines: string[] = [];
  const prefix = '  '.repeat(indent);
  const icon = hierarchy.level === 0 ? '📦' : hierarchy.recipe.type === 'processed' ? '⚙️' : '🥄';

  lines.push(
    `${prefix}${icon} ${hierarchy.recipe.name} (${hierarchy.recipe.yield}${hierarchy.recipe.yieldUnit})`
  );
  lines.push(`${prefix}   💰 R$ ${hierarchy.recipe.costPerUnit.toFixed(2)}/un`);

  hierarchy.children.forEach(child => {
    lines.push(...formatRecipeTree(child, indent + 1));
  });

  return lines;
}

/**
 * Valida se há ciclos na hierarquia de receitas
 */
export function detectCycles(
  recipe: Recipe,
  allRecipes: Recipe[],
  visited: Set<number> = new Set(),
  recursionStack: Set<number> = new Set()
): boolean {
  visited.add(recipe.id);
  recursionStack.add(recipe.id);

  for (const ingredient of recipe.ingredients) {
    const childRecipe = allRecipes.find(r => r.id === ingredient.ingredientId);
    if (!childRecipe) continue;

    if (!visited.has(childRecipe.id)) {
      if (detectCycles(childRecipe, allRecipes, visited, recursionStack)) {
        return true;
      }
    } else if (recursionStack.has(childRecipe.id)) {
      return true;
    }
  }

  recursionStack.delete(recipe.id);
  return false;
}

/**
 * Obtém todas as receitas que usam um ingrediente específico
 */
export function getRecipesDependingOn(
  ingredientId: number,
  allRecipes: Recipe[]
): Recipe[] {
  return allRecipes.filter(recipe =>
    recipe.ingredients.some(ing => ing.ingredientId === ingredientId)
  );
}

/**
 * Calcula o impacto de uma mudança de custo em cascata
 */
export function calculateCostImpact(
  changedRecipeId: number,
  allRecipes: Recipe[]
): Map<number, number> {
  const impactMap = new Map<number, number>();
  const processed = new Set<number>();

  function processRecipe(recipeId: number) {
    if (processed.has(recipeId)) return;
    processed.add(recipeId);

    const recipe = allRecipes.find(r => r.id === recipeId);
    if (!recipe) return;

    const newCost = calculateRecipeCost(recipe);
    const oldCost = recipe.totalCost;
    const impact = newCost - oldCost;

    if (impact !== 0) {
      impactMap.set(recipeId, impact);
    }

    // Processa receitas que dependem desta
    const dependents = getRecipesDependingOn(recipeId, allRecipes);
    dependents.forEach(dep => processRecipe(dep.id));
  }

  processRecipe(changedRecipeId);
  return impactMap;
}
