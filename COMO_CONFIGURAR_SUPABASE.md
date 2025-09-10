# Como Configurar o Supabase - Cardápio Digital

## 🎯 Situação Atual

A aplicação está funcionando em **modo de demonstração** com dados fictícios. Para usar dados reais e todas as funcionalidades, você precisa configurar o Supabase.

## ✅ O que já está funcionando

- ✅ Aplicação carregando no navegador
- ✅ Interface completa visível
- ✅ Dados de demonstração (3 pizzas + 1 bebida)
- ✅ Sistema de carrinho funcional
- ✅ Navegação entre páginas

## 🔧 Para configurar o Supabase

### Passo 1: Criar Projeto no Supabase

1. Acesse [https://supabase.com](https://supabase.com)
2. Faça login ou crie uma conta gratuita
3. Clique em **"New Project"**
4. Preencha:
   - **Name**: `cardapio-digital` (ou nome de sua preferência)
   - **Database Password**: Crie uma senha forte
   - **Region**: Escolha a região mais próxima (ex: South America)
5. Clique em **"Create new project"**
6. Aguarde alguns minutos para o projeto ser criado

### Passo 2: Obter as Credenciais

1. No painel do Supabase, vá em **Settings > API**
2. Copie os seguintes valores:
   - **Project URL** (ex: `https://abc123.supabase.co`)
   - **anon public** key (chave longa que começa com `eyJ...`)

### Passo 3: Configurar Variáveis de Ambiente

1. Abra o arquivo `.env.local` na raiz do projeto
2. Substitua os valores placeholder:

```env
# Substitua pelos valores reais do seu projeto
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto-real.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.sua-chave-real-aqui
```

### Passo 4: Executar Scripts do Banco de Dados

1. No Supabase, vá em **SQL Editor**
2. Execute os scripts na seguinte ordem:

```sql
-- 1. Criar tabelas básicas
-- Execute o conteúdo de: scripts/01-create-tables.sql

-- 2. Configurar administrador
-- Execute o conteúdo de: scripts/02-admin-setup.sql

-- 3. Configurar cardápio
-- Execute o conteúdo de: scripts/03-cardapio-management.sql

-- 4. Adicionar sabores
-- Execute o conteúdo de: scripts/04-populate-sabores.sql

-- 5. Configurações da pizzaria
-- Execute o conteúdo de: scripts/06-pizzaria-config.sql

-- 6. Outros scripts conforme necessário
```

### Passo 5: Testar a Conexão

1. Salve o arquivo `.env.local`
2. A aplicação deve recarregar automaticamente
3. Verifique no console do navegador se aparecem mensagens como:
   - `"Supabase configurado - carregando dados de produção"`
   - `"X produtos carregados do banco"`

## 🚨 Solução de Problemas

### Erro: "Sistema não configurado"
- Verifique se as variáveis no `.env.local` estão corretas
- Certifique-se de que não há espaços extras nas URLs/chaves
- Reinicie o servidor de desenvolvimento (`Ctrl+C` e `npm run dev`)

### Erro: "Tabela não existe"
- Execute todos os scripts SQL na ordem correta
- Verifique se o projeto Supabase foi criado com sucesso

### Dados não aparecem
- Verifique se executou os scripts de população de dados
- Confirme se as tabelas têm dados no painel do Supabase

## 📋 Scripts Disponíveis

Todos os scripts SQL estão na pasta `scripts/`:

- `01-create-tables.sql` - Cria estrutura básica
- `02-admin-setup.sql` - Configura usuário admin
- `03-cardapio-management.sql` - Estrutura do cardápio
- `04-populate-sabores.sql` - Adiciona sabores de pizza
- `06-pizzaria-config.sql` - Configurações da loja
- `18-create-clientes-table.sql` - Tabela de clientes

## 🎉 Após a Configuração

Quando o Supabase estiver configurado, você terá acesso a:

- ✅ Painel administrativo completo (`/admin`)
- ✅ Gerenciamento de produtos e categorias
- ✅ Upload de imagens
- ✅ Configurações da pizzaria
- ✅ Histórico de pedidos
- ✅ Sistema de clientes

## 📞 Suporte

Se encontrar problemas:

1. Verifique os logs no console do navegador
2. Confirme se seguiu todos os passos
3. Teste a conexão no painel de debug (`/admin/debug`)

---

**Nota**: A aplicação continuará funcionando em modo de demonstração até que o Supabase seja configurado corretamente.