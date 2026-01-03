# ⚠️ IMPORTANTE: Executar Migration v2 no Supabase

Este arquivo contém as instruções para executar a migration v2 que adiciona suporte a `technical_sheets`.

## Passos para Executar:

1. Acesse o painel do Supabase: https://supabase.com/dashboard
2. Selecione seu projeto
3. Vá em **SQL Editor** no menu lateral
4. Clique em **New query**
5. Copie TODO o conteúdo do arquivo `supabase_migration_v2.sql`
6. Cole no editor SQL
7. Clique em **Run** (ou pressione Ctrl+Enter)
8. Aguarde a confirmação de sucesso

## O que esta migration faz:

- Cria o tipo ENUM `item_type` (BASE, RECIPE, FINAL_PRODUCT)
- Adiciona coluna `item_type` na tabela `ingredients`
- Cria tabela `technical_sheets` para fichas técnicas hierárquicas
- Cria funções e triggers para validação e recálculo automático de custos
- Adiciona índices para performance

## ⚠️ ATENÇÃO:

Esta migration é **OBRIGATÓRIA** para que as funcionalidades de Receitas funcionem corretamente!

Após executar, você pode deletar este arquivo.


