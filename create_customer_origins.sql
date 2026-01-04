-- Criar tabela de origens de clientes
CREATE TABLE IF NOT EXISTS customer_origins (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Criar índice
CREATE INDEX IF NOT EXISTS idx_customer_origins_name ON customer_origins(name);

-- Adicionar coluna origin_id na tabela customers se não existir
ALTER TABLE customers
ADD COLUMN IF NOT EXISTS origin_id BIGINT REFERENCES customer_origins(id) ON DELETE SET NULL;

-- Criar índice para a chave estrangeira
CREATE INDEX IF NOT EXISTS idx_customers_origin_id ON customers(origin_id);
