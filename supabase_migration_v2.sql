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
