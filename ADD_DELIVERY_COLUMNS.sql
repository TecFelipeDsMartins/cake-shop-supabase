-- Adicionar colunas de entrega na tabela sales
ALTER TABLE sales 
ADD COLUMN IF NOT EXISTS delivery_type VARCHAR(255),
ADD COLUMN IF NOT EXISTS delivery_cost DECIMAL(10, 2) DEFAULT 0;
