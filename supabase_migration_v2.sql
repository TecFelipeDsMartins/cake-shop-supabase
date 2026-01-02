-- Script de Evolução do Banco de Dados para Ficha Técnica Hierárquica

-- 1. Criar o tipo ENUM para diferenciar os itens
DO $$ BEGIN
    CREATE TYPE public.item_type AS ENUM ('BASE', 'RECIPE', 'FINAL_PRODUCT');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Adicionar a coluna 'type' na tabela 'ingredients' (que passará a ser nossa tabela base de itens)
-- Nota: O projeto atual usa 'ingredients' para insumos e 'products' para produtos finais.
-- Para manter a compatibilidade e evolução incremental, vamos adicionar o tipo em ambas ou unificar.
-- Analisando o código, 'ingredients' já tem 'is_processed'. Vamos aproveitar isso.

ALTER TABLE public.ingredients ADD COLUMN IF NOT EXISTS item_type public.item_type;

-- Atualizar dados existentes em 'ingredients'
UPDATE public.ingredients SET item_type = 'BASE' WHERE is_processed = FALSE AND item_type IS NULL;
UPDATE public.ingredients SET item_type = 'RECIPE' WHERE is_processed = TRUE AND item_type IS NULL;

-- 3. Criar a tabela de Ficha Técnica Unificada
-- Esta tabela substituirá a lógica de 'recipes' e 'product_ingredients' de forma mais robusta.
CREATE TABLE IF NOT EXISTS public.technical_sheets (
    id BIGSERIAL PRIMARY KEY,
    parent_id BIGINT NOT NULL, -- Pode ser um ID de 'ingredients' (se for RECIPE) ou 'products' (se for FINAL_PRODUCT)
    parent_type public.item_type NOT NULL,
    component_id BIGINT NOT NULL REFERENCES public.ingredients(id),
    quantity DECIMAL(10, 4) NOT NULL,
    unit VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Função de Validação: Receitas só podem conter Insumos Base
CREATE OR REPLACE FUNCTION public.check_technical_sheet_logic()
RETURNS TRIGGER AS $$
DECLARE
    comp_type public.item_type;
BEGIN
    -- Obter o tipo do componente
    SELECT item_type INTO comp_type FROM public.ingredients WHERE id = NEW.component_id;

    -- Se o pai for uma RECEITA, o componente DEVE ser BASE
    IF NEW.parent_type = 'RECIPE' AND comp_type <> 'BASE' THEN
        RAISE EXCEPTION 'Uma RECEITA só pode ser composta por insumos do tipo BASE.';
    END IF;

    -- Se o pai for um PRODUTO FINAL, o componente pode ser BASE ou RECIPE (permitido por padrão)
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 5. Trigger para aplicar a validação
DROP TRIGGER IF EXISTS trg_check_technical_sheet ON public.technical_sheets;
CREATE TRIGGER trg_check_technical_sheet
BEFORE INSERT OR UPDATE ON public.technical_sheets
FOR EACH ROW
EXECUTE FUNCTION public.check_technical_sheet_logic();

-- 6. Índices para performance
CREATE INDEX IF NOT EXISTS idx_tech_sheet_parent ON public.technical_sheets(parent_id, parent_type);
CREATE INDEX IF NOT EXISTS idx_tech_sheet_component ON public.technical_sheets(component_id);

-- 7. Função para Recalcular Custos em Cascata
-- Esta função será chamada sempre que o custo de um ingrediente base mudar.

CREATE OR REPLACE FUNCTION public.recalculate_item_costs(target_id BIGINT)
RETURNS VOID AS $$
DECLARE
    entry RECORD;
    total_cost DECIMAL(10, 2) := 0;
    current_prep_cost DECIMAL(10, 2) := 0;
    current_yield DECIMAL(10, 2) := 1;
BEGIN
    -- 1. Calcular o custo total baseado na ficha técnica
    FOR entry IN 
        SELECT ts.quantity, i.cost as component_cost
        FROM public.technical_sheets ts
        JOIN public.ingredients i ON ts.component_id = i.id
        WHERE ts.parent_id = target_id AND ts.parent_type IN ('RECIPE', 'FINAL_PRODUCT')
    LOOP
        total_cost := total_cost + (entry.quantity * entry.component_cost);
    END LOOP;

    -- 2. Obter custos de preparo e rendimento se for uma receita
    -- Nota: O projeto atual armazena isso em 'ingredients' para receitas processadas
    SELECT cost, current_stock INTO current_prep_cost, current_yield 
    FROM public.ingredients 
    WHERE id = target_id AND item_type = 'RECIPE';

    -- 3. Atualizar o custo do item (se for receita, o custo unitário)
    -- Se for FINAL_PRODUCT, atualizamos na tabela 'products'
    IF EXISTS (SELECT 1 FROM public.ingredients WHERE id = target_id AND item_type = 'RECIPE') THEN
        UPDATE public.ingredients 
        SET cost = (total_cost + current_prep_cost) / NULLIF(current_yield, 0)
        WHERE id = target_id;
    ELSIF EXISTS (SELECT 1 FROM public.products WHERE id = target_id) THEN
        UPDATE public.products 
        SET production_cost = total_cost
        WHERE id = target_id;
    END IF;

    -- 4. Propagar para itens que dependem deste
    FOR entry IN 
        SELECT DISTINCT parent_id 
        FROM public.technical_sheets 
        WHERE component_id = target_id
    LOOP
        PERFORM public.recalculate_item_costs(entry.parent_id);
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- 8. Trigger para disparar o recálculo quando o custo de um ingrediente muda
CREATE OR REPLACE FUNCTION public.trg_on_ingredient_cost_change()
RETURNS TRIGGER AS $$
BEGIN
    IF (OLD.cost IS DISTINCT FROM NEW.cost) THEN
        PERFORM public.recalculate_item_costs(NEW.id);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_ingredient_cost_update ON public.ingredients;
CREATE TRIGGER trg_ingredient_cost_update
AFTER UPDATE OF cost ON public.ingredients
FOR EACH ROW
EXECUTE FUNCTION public.trg_on_ingredient_cost_change();
