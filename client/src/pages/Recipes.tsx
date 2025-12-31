import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Eye, Edit2, Trash2, Package, Zap, Cake } from 'lucide-react';
import { Recipe, IngredientType } from '@/lib/types';
import RecipeEditorModal from '@/components/RecipeEditorModal';
import RecipeHierarchyView from '@/components/RecipeHierarchyView';

export default function Recipes() {
  const [showModal, setShowModal] = useState(false);
  const [showHierarchy, setShowHierarchy] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());

  const [recipes, setRecipes] = useState<Recipe[]>([
    {
      id: 1,
      name: 'Leite Condensado',
      type: 'base',
      description: 'Leite condensado comprado',
      category: 'Laticínios',
      ingredients: [],
      prepCost: 0,
      totalCost: 8.5,
      yield: 1,
      yieldUnit: 'lata',
      costPerUnit: 8.5,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 2,
      name: 'Manteiga',
      type: 'base',
      description: 'Manteiga de qualidade',
      category: 'Laticínios',
      ingredients: [],
      prepCost: 0,
      totalCost: 12.0,
      yield: 1,
      yieldUnit: 'kg',
      costPerUnit: 12.0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 3,
      name: 'Chocolate em Pó',
      type: 'base',
      description: 'Chocolate em pó premium',
      category: 'Chocolates',
      ingredients: [],
      prepCost: 0,
      totalCost: 18.0,
      yield: 1,
      yieldUnit: 'kg',
      costPerUnit: 18.0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 4,
      name: 'Brigadeiro',
      type: 'processed',
      description: 'Brigadeiro preparado com leite condensado, chocolate e manteiga',
      category: 'Preparos',
      ingredients: [
        {
          id: 1,
          ingredientId: 1,
          ingredientName: 'Leite Condensado',
          quantity: 1,
          unit: 'lata',
          costPerUnit: 8.5,
          totalCost: 8.5,
        },
        {
          id: 2,
          ingredientId: 3,
          ingredientName: 'Chocolate em Pó',
          quantity: 0.2,
          unit: 'kg',
          costPerUnit: 18.0,
          totalCost: 3.6,
        },
        {
          id: 3,
          ingredientId: 2,
          ingredientName: 'Manteiga',
          quantity: 0.05,
          unit: 'kg',
          costPerUnit: 12.0,
          totalCost: 0.6,
        },
      ],
      prepCost: 2.0,
      totalCost: 14.7,
      yield: 1.5,
      yieldUnit: 'kg',
      costPerUnit: 9.8,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 5,
      name: 'Bolo de Chocolate com Brigadeiro',
      type: 'final',
      description: 'Bolo de chocolate com cobertura e recheio de brigadeiro',
      category: 'Bolos',
      ingredients: [
        {
          id: 1,
          ingredientId: 4,
          ingredientName: 'Brigadeiro',
          quantity: 0.5,
          unit: 'kg',
          costPerUnit: 9.8,
          totalCost: 4.9,
        },
        {
          id: 2,
          ingredientId: 3,
          ingredientName: 'Chocolate em Pó',
          quantity: 0.3,
          unit: 'kg',
          costPerUnit: 18.0,
          totalCost: 5.4,
        },
      ],
      prepCost: 5.0,
      totalCost: 15.3,
      yield: 1,
      yieldUnit: 'bolo',
      costPerUnit: 15.3,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ]);

  const handleOpenModal = (recipe?: Recipe) => {
    if (recipe) {
      setEditingId(recipe.id);
    } else {
      setEditingId(null);
    }
    setShowModal(true);
  };

  const handleSave = (recipe: Recipe) => {
    if (editingId) {
      setRecipes(recipes.map(r => (r.id === editingId ? recipe : r)));
    } else {
      setRecipes([...recipes, { ...recipe, id: Math.max(...recipes.map(r => r.id), 0) + 1 }]);
    }
    setShowModal(false);
  };

  const handleDelete = (id: number) => {
    if (confirm('Tem certeza que deseja deletar esta receita?')) {
      setRecipes(recipes.filter(r => r.id !== id));
    }
  };

  const getIcon = (type: IngredientType) => {
    if (type === 'base') return <Package size={18} className="text-blue-600" />;
    if (type === 'processed') return <Zap size={18} className="text-amber-600" />;
    return <Cake size={18} className="text-rose-600" />;
  };

  const getTypeLabel = (type: IngredientType) => {
    if (type === 'base') return 'Insumo Base';
    if (type === 'processed') return 'Insumo Processado';
    return 'Produto Final';
  };

  const groupedRecipes = {
    base: recipes.filter(r => r.type === 'base'),
    processed: recipes.filter(r => r.type === 'processed'),
    final: recipes.filter(r => r.type === 'final'),
  };

  if (showHierarchy !== null) {
    const recipe = recipes.find(r => r.id === showHierarchy);
    if (recipe) {
      return (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-2">{recipe.name}</h1>
              <p className="text-muted-foreground">{recipe.description}</p>
            </div>
            <Button variant="outline" onClick={() => setShowHierarchy(null)}>
              Voltar
            </Button>
          </div>

          <RecipeHierarchyView
            recipe={recipe}
            allRecipes={recipes}
            onEdit={(r) => {
              setEditingId(r.id);
              setShowModal(true);
            }}
            expandedIds={expandedIds}
            onToggleExpand={(id) => {
              const newExpanded = new Set(expandedIds);
              if (newExpanded.has(id)) {
                newExpanded.delete(id);
              } else {
                newExpanded.add(id);
              }
              setExpandedIds(newExpanded);
            }}
          />
        </div>
      );
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-foreground mb-2">Receitas e Composições</h1>
          <p className="text-muted-foreground">
            Gerencie insumos base, preparos e produtos finais com suas fichas técnicas
          </p>
        </div>
        <Button
          className="flex items-center gap-2 bg-accent hover:bg-accent/90"
          onClick={() => handleOpenModal()}
        >
          <Plus size={18} />
          Nova Receita
        </Button>
      </div>

      {Object.entries(groupedRecipes).map(([type, typeRecipes]) => (
        <div key={type}>
          <h2 className="text-2xl font-bold text-foreground mb-4">
            {type === 'base'
              ? '📦 Insumos Base'
              : type === 'processed'
                ? '⚙️ Insumos Processados'
                : '🎂 Produtos Finais'}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {typeRecipes.map((recipe) => (
              <Card key={recipe.id} className="p-4 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {getIcon(recipe.type)}
                    <div>
                      <h3 className="font-semibold text-foreground">{recipe.name}</h3>
                      <p className="text-xs text-muted-foreground">{getTypeLabel(recipe.type)}</p>
                    </div>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                  {recipe.description}
                </p>

                <div className="grid grid-cols-2 gap-2 mb-4 p-3 bg-muted/30 rounded">
                  <div>
                    <p className="text-xs text-muted-foreground">Custo/un</p>
                    <p className="font-bold text-accent">R$ {recipe.costPerUnit.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Rendimento</p>
                    <p className="font-bold text-foreground">
                      {recipe.yield}
                      {recipe.yieldUnit}
                    </p>
                  </div>
                </div>

                {recipe.ingredients.length > 0 && (
                  <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
                    <p className="text-xs font-semibold text-blue-900 dark:text-blue-200 mb-2">
                      {recipe.ingredients.length} ingrediente(s)
                    </p>
                    <ul className="text-xs text-blue-800 dark:text-blue-300 space-y-1">
                      {recipe.ingredients.slice(0, 3).map((ing) => (
                        <li key={ing.id}>
                          • {ing.ingredientName} ({ing.quantity}
                          {ing.unit})
                        </li>
                      ))}
                      {recipe.ingredients.length > 3 && (
                        <li>• +{recipe.ingredients.length - 3} mais...</li>
                      )}
                    </ul>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex-1 text-blue-600 hover:text-blue-700"
                    onClick={() => setShowHierarchy(recipe.id)}
                  >
                    <Eye size={16} className="mr-1" />
                    Ver Ficha
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-accent hover:text-accent/80"
                    onClick={() => {
                      setEditingId(recipe.id);
                      setShowModal(true);
                    }}
                  >
                    <Edit2 size={16} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-600 hover:text-red-700"
                    onClick={() => handleDelete(recipe.id)}
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </Card>
            ))}

            {typeRecipes.length === 0 && (
              <Card className="p-8 col-span-full flex items-center justify-center text-center">
                <p className="text-muted-foreground">Nenhuma receita neste tipo</p>
              </Card>
            )}
          </div>
        </div>
      ))}

      {showModal && (
        <RecipeEditorModal
          recipe={editingId ? recipes.find(r => r.id === editingId) : undefined}
          allRecipes={recipes}
          onSave={handleSave}
          onClose={() => {
            setShowModal(false);
            setEditingId(null);
          }}
        />
      )}
    </div>
  );
}
