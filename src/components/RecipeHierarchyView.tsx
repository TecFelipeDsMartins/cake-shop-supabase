import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronRight, Edit2, Trash2, Package, Zap, Cake } from 'lucide-react';
import { useState } from 'react';
import { Recipe, RecipeHierarchy } from '@/lib/types';
import { buildRecipeHierarchy, calculateCostPerUnit } from '@/lib/recipeUtils';

interface RecipeHierarchyViewProps {
  recipe: Recipe;
  allRecipes: Recipe[];
  onEdit?: (recipe: Recipe) => void;
  onDelete?: (recipeId: number) => void;
  expandedIds?: Set<number>;
  onToggleExpand?: (recipeId: number) => void;
}

function RecipeTreeNode({
  hierarchy,
  onEdit,
  onDelete,
  expandedIds,
  onToggleExpand,
}: {
  hierarchy: RecipeHierarchy;
  onEdit?: (recipe: Recipe) => void;
  onDelete?: (recipeId: number) => void;
  expandedIds?: Set<number>;
  onToggleExpand?: (recipeId: number) => void;
}) {
  const isExpanded = expandedIds?.has(hierarchy.recipe.id) ?? true;
  const hasChildren = hierarchy.children.length > 0;

  const getIcon = () => {
    if (hierarchy.recipe.type === 'base') return <Package size={16} className="text-blue-600" />;
    if (hierarchy.recipe.type === 'processed') return <Zap size={16} className="text-amber-600" />;
    return <Cake size={16} className="text-rose-600" />;
  };

  const getTypeLabel = () => {
    if (hierarchy.recipe.type === 'base') return 'Insumo Base';
    if (hierarchy.recipe.type === 'processed') return 'Insumo Processado';
    return 'Produto Final';
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors">
        {hasChildren ? (
          <button
            onClick={() => onToggleExpand?.(hierarchy.recipe.id)}
            className="p-1 hover:bg-muted rounded"
          >
            {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
          </button>
        ) : (
          <div className="w-6" />
        )}

        <div className="flex items-center gap-2">
          {getIcon()}
          <div className="flex-1">
            <p className="font-semibold text-foreground">{hierarchy.recipe.name}</p>
            <p className="text-xs text-muted-foreground">
              {getTypeLabel()} • {hierarchy.recipe.yield}{hierarchy.recipe.yieldUnit}
            </p>
          </div>
        </div>

        <div className="text-right">
          <p className="font-bold text-accent">R$ {hierarchy.recipe.costPerUnit.toFixed(2)}</p>
          <p className="text-xs text-muted-foreground">por unidade</p>
        </div>

        <div className="flex gap-1">
          {onEdit && (
            <Button
              variant="ghost"
              size="sm"
              className="text-accent hover:text-accent/80"
              onClick={() => onEdit(hierarchy.recipe)}
            >
              <Edit2 size={14} />
            </Button>
          )}
          {onDelete && (
            <Button
              variant="ghost"
              size="sm"
              className="text-red-600 hover:text-red-700"
              onClick={() => onDelete(hierarchy.recipe.id)}
            >
              <Trash2 size={14} />
            </Button>
          )}
        </div>
      </div>

      {hasChildren && isExpanded && (
        <div className="ml-4 pl-4 border-l-2 border-border space-y-2">
          {hierarchy.children.map(child => (
            <RecipeTreeNode
              key={child.recipe.id}
              hierarchy={child}
              onEdit={onEdit}
              onDelete={onDelete}
              expandedIds={expandedIds}
              onToggleExpand={onToggleExpand}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function RecipeHierarchyView({
  recipe,
  allRecipes,
  onEdit,
  onDelete,
  expandedIds,
  onToggleExpand,
}: RecipeHierarchyViewProps) {
  const hierarchy = buildRecipeHierarchy(recipe, allRecipes);

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-foreground mb-2">Hierarquia de Receita</h2>
        <p className="text-sm text-muted-foreground">
          Visualize como este produto é composto por insumos e sub-receitas
        </p>
      </div>

      <div className="space-y-2">
        <RecipeTreeNode
          hierarchy={hierarchy}
          onEdit={onEdit}
          onDelete={onDelete}
          expandedIds={expandedIds}
          onToggleExpand={onToggleExpand}
        />
      </div>

      <div className="mt-6 pt-6 border-t border-border">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Custo Total</p>
            <p className="text-lg font-bold text-foreground">R$ {recipe.totalCost.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Custo por Unidade</p>
            <p className="text-lg font-bold text-accent">R$ {recipe.costPerUnit.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Rendimento</p>
            <p className="text-lg font-bold text-foreground">
              {recipe.yield}{recipe.yieldUnit}
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}
