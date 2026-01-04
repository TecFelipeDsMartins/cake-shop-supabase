-- ===== Criar tabela de Whitelist =====

CREATE TABLE IF NOT EXISTS whitelisted_emails (
  id BIGSERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE whitelisted_emails ENABLE ROW LEVEL SECURITY;

-- Qualquer pessoa pode ver a whitelist (para validar durante signup)
CREATE POLICY "Anyone can view whitelisted emails"
  ON whitelisted_emails FOR SELECT
  USING (true);

-- Apenas admin pode inserir/atualizar/deletar
CREATE POLICY "Only authenticated users can manage whitelist"
  ON whitelisted_emails FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Only authenticated users can update whitelist"
  ON whitelisted_emails FOR UPDATE
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Only authenticated users can delete from whitelist"
  ON whitelisted_emails FOR DELETE
  USING (auth.uid() IS NOT NULL);

-- Adicionar emails iniciais (MODIFICAR COM SEUS EMAILS)
INSERT INTO whitelisted_emails (email) VALUES
  ('seu_email@example.com'),
  ('gerente@example.com'),
  ('vendedor@example.com')
ON CONFLICT (email) DO NOTHING;
