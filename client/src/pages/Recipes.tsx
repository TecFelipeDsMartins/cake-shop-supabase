import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Eye, Edit2, Trash2, Package, Zap, Cake } from 'lucide-react';
import { Recipe, IngredientType } from '@/lib/types';
import RecipeEditorModal from '@/components/RecipeEditorModal';
import RecipeHierarchyView from '@/components/RecipeHierarchyView';
import { getRecipes, addRecipe, updateRecipe, deleteRecipe, getIngredients } from '@/lib/supabaseClient';
import { toast } from 'sonner';

interface Ingredient {
  id?: number;
  name: string;
  category?: string;
  unit?: string;
  cost: number;
  minimum_stock?: number;
  current_stock?: number;
  is_processed?: boolean;
  created_at?: string;
}

export default function Recipes() {
  const [showModal, setShowModal] = useState(false);
  const [showHierarchy, setShowHierarchy] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [recipesData, ingredientsData] = await Promise.all([
        getRecipes(),
        getIngredients()
      ]);
      
      if (recipesData && recipesData.length > 0) {
        setRecipes(recipesData);
      }
      
      if (ingredientsData) {
        setIngredients(ingredientsData);
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar dados do banco de dados');
    }
    setLoading(false);
  }

  const handleOpenModal = (recipe?: Recipe) => {
    if (recipe) {
      setEditingId(recipe.id);
    } else {
      setEditingId(null);
    }
    setShowModal(true);
  };

  const handleSave = async (recipe: Recipe) => {
    try {
      if (editingId) {
        await updateRecipe(editingId, recipe);
        toast.success('Receita atualizada com sucesso');
      } else {
        await addRecipe(recipe);
        toast.success('Receita adicionada com sucesso');
      }
      setShowModal(false);
      loadData();
    } catch (error) {
      console.error('Erro ao salvar receita:', error);
      toast.error('Erro ao salvar receita no banco de dados');
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Tem certeza que deseja deletar esta receita?')) {
      try {
        await deleteRecipe(id);
        toast.success('Receita deletada com sucesso');
        loadData();
      } catch (error) {
        console.error('Erro ao deletar receita:', error);
        toast.error('Erro ao deletar receita');
      }
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Carregando receitas...</p>
      </div>
    );
  }

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
          ingredients={ingredients}
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
