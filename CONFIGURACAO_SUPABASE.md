# Configuração do Supabase - Cardápio Digital

## Problema Identificado

O erro "Sistema não configurado. Entre em contato com o administrador técnico." ocorre porque as variáveis de ambiente do Supabase não estão configuradas.

## Solução

### 1. Criar Projeto no Supabase

1. Acesse [https://supabase.com](https://supabase.com)
2. Faça login ou crie uma conta
3. Clique em "New Project"
4. Escolha uma organização
5. Preencha:
   - **Name**: cardapio-digital (ou nome de sua preferência)
   - **Database Password**: Crie uma senha forte
   - **Region**: Escolha a região mais próxima (ex: South America)
6. Clique em "Create new project"
7. Aguarde a criação do projeto (pode levar alguns minutos)

### 2. Obter Credenciais do Projeto

1. No dashboard do seu projeto Supabase
2. Vá em **Settings** > **API**
3. Copie os seguintes valores:
   - **Project URL** (ex: `https://xyzcompany.supabase.co`)
   - **anon public** key (chave longa que começa com `eyJhbGciOiJIUzI1NiIs...`)

### 3. Configurar Variáveis de Ambiente

1. Abra o arquivo `.env.local` na raiz do projeto
2. Substitua os valores placeholder:

```env
# Substitua pela URL real do seu projeto
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co

# Substitua pela chave anônima real
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 4. Executar Scripts do Banco de Dados

1. No Supabase, vá em **SQL Editor**
2. Execute os scripts na seguinte ordem:
   - `scripts/01-create-tables.sql`
   - `scripts/02-admin-setup.sql`
   - `scripts/18-create-clientes-table.sql`
   - Outros scripts conforme necessário

### 5. Criar Usuário Administrador

1. No SQL Editor do Supabase, execute:

```sql
INSERT INTO admins (email, senha, nome, ativo)
VALUES ('admin@exemplo.com', 'senha123', 'Administrador', true);
```

**⚠️ IMPORTANTE**: Altere o email e senha para valores seguros!

### 6. Reiniciar o Servidor de Desenvolvimento

```bash
npm run dev
# ou
yarn dev
# ou
pnpm dev
```

### 7. Testar a Configuração

1. Acesse `http://localhost:3000/admin/login`
2. Clique em "Testar Conexão"
3. Se aparecer "✅ Conexão com Supabase funcionando", a configuração está correta
4. Faça login com as credenciais criadas no passo 5

## Verificação de Problemas

### Erro: "Supabase não configurado"
- Verifique se o arquivo `.env.local` existe
- Confirme se as variáveis estão preenchidas corretamente
- Reinicie o servidor de desenvolvimento

### Erro: "Erro na consulta ao banco"
- Verifique se os scripts SQL foram executados
- Confirme se as tabelas foram criadas no Supabase
- Verifique se a chave anônima tem as permissões corretas

### Erro: "Email ou senha incorretos"
- Verifique se o usuário administrador foi criado
- Confirme email e senha no banco de dados
- Verifique se o campo `ativo` está como `true`

## Segurança

⚠️ **ATENÇÃO**: O sistema atual usa senhas em texto plano para desenvolvimento. Para produção:

1. Implemente hash de senhas (bcrypt, argon2, etc.)
2. Use autenticação JWT adequada
3. Configure RLS (Row Level Security) no Supabase
4. Use variáveis de ambiente seguras

## Suporte

Se ainda houver problemas:

1. Verifique os logs do console do navegador
2. Verifique os logs do terminal onde o servidor está rodando
3. Teste a conexão usando o botão "Testar Conexão" na tela de login
4. Verifique se todas as tabelas foram criadas no Supabase