# Contribuindo para o Cake Shop

Obrigado por se interessar em contribuir para o Cake Shop! Este documento fornece diretrizes e instruções para contribuir com o projeto.

## Código de Conduta

Todos os contribuidores devem seguir nosso código de conduta:
- Seja respeitoso e inclusivo
- Aceite críticas construtivas
- Foque no que é melhor para a comunidade
- Mostre empatia com outros membros da comunidade

## Como Contribuir

### Reportando Bugs

Antes de criar um relatório de bug, verifique a lista de issues, pois você pode descobrir que não precisa criar um novo. Quando você está criando um relatório de bug, inclua o máximo de detalhes possível:

- **Use um título descritivo** para o issue
- **Descreva os passos exatos** que reproduzem o problema
- **Forneça exemplos específicos** para demonstrar os passos
- **Descreva o comportamento observado** e aponte o que exatamente é o problema
- **Explique qual seria o comportamento esperado** e por quê
- **Inclua screenshots ou GIFs** se possível
- **Mencione sua configuração** (SO, navegador, versão do Node.js, etc.)

### Sugerindo Melhorias

Sugestões de melhorias são sempre bem-vindas. Ao criar uma sugestão de melhoria, inclua:

- **Use um título descritivo** para a sugestão
- **Forneça uma descrição passo a passo** da sugestão
- **Forneça exemplos específicos** para demonstrar os passos
- **Descreva o comportamento atual** e o comportamento esperado
- **Explique por que essa melhoria seria útil**

### Pull Requests

- Siga o guia de estilo do projeto
- Inclua screenshots e GIFs animados em seus PRs quando apropriado
- Termine todos os arquivos com uma nova linha
- Evite dependências de plataforma específica

## Guia de Estilo

### Git Commit Messages

- Use o tempo presente ("Add feature" não "Added feature")
- Use o modo imperativo ("Move cursor to..." não "Moves cursor to...")
- Limite a primeira linha a 72 caracteres ou menos
- Referencie issues e pull requests liberalmente após a primeira linha

### JavaScript/TypeScript

- Use 2 espaços para indentação
- Use `const` por padrão, `let` quando necessário
- Use nomes descritivos para variáveis e funções
- Adicione comentários para lógica complexa

### CSS/Tailwind

- Use classes Tailwind quando possível
- Mantenha a consistência com o design system
- Use variáveis CSS para cores e espaçamento

### React

- Use componentes funcionais
- Use hooks ao invés de classes
- Mantenha componentes pequenos e focados
- Use TypeScript para tipagem

## Setup Local

1. Fork o repositório
2. Clone seu fork: `git clone https://github.com/seu-usuario/cake-shop-supabase.git`
3. Crie uma branch: `git checkout -b feature/sua-feature`
4. Instale as dependências: `pnpm install`
5. Inicie o servidor de desenvolvimento: `pnpm dev`
6. Faça suas mudanças
7. Teste suas mudanças
8. Commit suas mudanças: `git commit -m 'Add feature'`
9. Push para a branch: `git push origin feature/sua-feature`
10. Abra um Pull Request

## Processo de Review

- Pelo menos um mantenedor deve revisar seu PR
- Mudanças podem ser solicitadas
- Após aprovação, seu PR será mesclado

## Licença

Ao contribuir para este projeto, você concorda que suas contribuições serão licenciadas sob sua licença MIT.

## Dúvidas?

Sinta-se à vontade para abrir uma issue com a tag `question` ou entrar em contato com os mantenedores.

Obrigado por contribuir! 🎉
