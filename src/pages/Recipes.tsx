import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Edit2, Trash2, Package, Zap, Cake, RefreshCw } from 'lucide-react';
import { Recipe } from '@/lib/types';
import RecipeEditorModal from '@/components/RecipeEditorModal';
import { getRecipes, saveFullRecipe, deleteIngredient, getIngredients } from '@/lib/supabaseClient';
import { toast } from 'sonner';

export default function Recipes() {
  const [showModal, setShowModal] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState<any>(null);
  const [recipes, setRecipes] = useState<any[]>([]);
  const [ingredients, setIngredients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  // Atualizar editingRecipe quando recipes mudar
  useEffect(() => {
    if (editingRecipe && showModal) {
      const updated = recipes.find(r => r.id === editingRecipe.id);
      if (updated) setEditingRecipe(updated);
    }
  }, [recipes]);

  async function loadData() {
    setLoading(true);
    try {
      const [recipesData, ingredientsData] = await Promise.all([
        getRecipes(),
        getIngredients()
      ]);
      setRecipes(recipesData || []);
      setIngredients(ingredientsData || []);
    } catch (error) {
      toast.error('Erro ao carregar dados');
    }
    setLoading(false);
  }

  const handleSave = async (recipe: any) => {
    try {
      await saveFullRecipe(recipe);
      toast.success('Receita salva com sucesso');
      setShowModal(false);
      loadData();
    } catch (error) {
      toast.error('Erro ao salvar receita');
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Tem certeza? Isso removerá a receita permanentemente.')) {
      try {
        await deleteIngredient(id);
        toast.success('Receita removida');
        loadData();
      } catch (error) {
        toast.error('Erro ao remover receita');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black text-foreground">Receitas e Preparos</h1>
          <p className="text-muted-foreground">Crie bases e produtos finais com custos automáticos</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadData} disabled={loading}>
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          </Button>
          <Button onClick={() => { setEditingRecipe(null); setShowModal(true); }} className="bg-accent hover:bg-accent/90 gap-2">
            <Plus size={18} /> Nova Receita
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recipes.map((recipe) => (
          <Card key={recipe.id} className="p-5 hover:shadow-xl transition-all border-accent/10">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-accent/10 rounded-lg text-accent">
                  <Cake size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-lg">{recipe.name}</h3>
                  <p className="text-[10px] uppercase font-black text-muted-foreground">Rendimento: {recipe.yield} {recipe.unit}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xl font-black text-accent">R$ {recipe.totalCost.toFixed(2)}</p>
                <p className="text-[10px] text-muted-foreground uppercase font-bold">Custo Total</p>
              </div>
            </div>

            <div className="space-y-1 mb-6">
              <p className="text-xs font-bold text-muted-foreground uppercase">Ingredientes ({recipe.ingredients?.length || 0})</p>
              <div className="flex flex-wrap gap-1">
                {recipe.ingredients?.slice(0, 3).map((ing: any, i: number) => (
                  <span key={i} className="text-[10px] bg-muted px-2 py-0.5 rounded border">{ing.ingredientName}</span>
                ))}
                {recipe.ingredients?.length > 3 && <span className="text-[10px] text-muted-foreground">+{recipe.ingredients.length - 3}</span>}
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="flex-1" onClick={() => { setEditingRecipe(recipe); setShowModal(true); }}>
                <Edit2 size={14} className="mr-1" /> Editar
              </Button>
              <Button variant="outline" size="sm" className="text-red-500" onClick={() => handleDelete(recipe.id)}>
                <Trash2 size={14} />
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {showModal && (
        <RecipeEditorModal
          recipe={editingRecipe}
          allRecipes={recipes}
          ingredients={ingredients.filter(i => !i.is_processed)}
          onSave={handleSave}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
}
