# Configuração do Ambiente de Desenvolvimento - Cardápio Digital

## ✅ Status da Instalação

### Dependências Instaladas
- ✅ **Node.js 22.19.0** - Ambiente de execução
- ✅ **pnpm** - Gerenciador de pacotes
- ✅ **Next.js 15.5.2** - Framework React
- ✅ **TypeScript** - Tipagem estática
- ✅ **Tailwind CSS** - Framework CSS
- ✅ **Radix UI** - Componentes de interface
- ✅ **Supabase** - Backend como serviço

### Arquivos Criados
- ✅ `.env.local` - Variáveis de ambiente (configuração necessária)
- ✅ `node_modules/` - Dependências instaladas
- ✅ Build de produção testado e funcionando

## 🚀 Como Executar Localmente

### 1. Servidor de Desenvolvimento
```bash
pnpm run dev
```
**URL:** http://localhost:3000

### 2. Build de Produção
```bash
pnpm run build
pnpm run start
```

### 3. Outros Comandos
```bash
# Verificar sintaxe
pnpm run lint

# Instalar novas dependências
pnpm install [pacote]
```

## 🔧 Configuração do Supabase

### Passo 1: Criar Projeto no Supabase

1. Acesse [https://supabase.com](https://supabase.com)
2. Faça login ou crie uma conta
3. Clique em **"New Project"**
4. Preencha os dados:
   - **Name**: `cardapio-digital` (ou nome de sua preferência)
   - **Database Password**: Crie uma senha forte
   - **Region**: Escolha a região mais próxima (ex: South America)
5. Clique em **"Create new project"**
6. Aguarde a criação (pode levar alguns minutos)

### Passo 2: Obter Credenciais

1. No painel do Supabase, vá em **Settings > API**
2. Copie as seguintes informações:
   - **Project URL**
   - **anon public key**

### Passo 3: Configurar Variáveis de Ambiente

1. Abra o arquivo `.env.local` na raiz do projeto
2. Substitua os valores placeholder pelas suas credenciais:

```env
# Substitua pelos valores reais do seu projeto
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon-aqui
```

### Passo 4: Executar Scripts do Banco de Dados

1. No Supabase, vá em **SQL Editor**
2. Execute os scripts na seguinte ordem:

```sql
-- 1. Criar tabelas principais
-- Execute: scripts/01-create-tables.sql

-- 2. Configurar administrador
-- Execute: scripts/02-admin-setup.sql

-- 3. Configurar clientes
-- Execute: scripts/18-create-clientes-table.sql

-- 4. Popular dados iniciais
-- Execute os scripts SQL da pasta sql/:
-- - categorias_rows.sql
-- - produtos_rows.sql
-- - tamanhos_pizza_rows.sql
-- - opcoes_sabores_rows.sql
-- - bordas_recheadas_rows.sql
-- - pizzaria_config_rows.sql
```

### Passo 5: Configurar Storage (Opcional)

1. Execute o script: `scripts/09-setup-storage.sql`
2. Isso criará o bucket para upload de imagens

### Passo 6: Criar Usuário Administrador

```sql
INSERT INTO admins (email, senha, nome, ativo)
VALUES ('admin@exemplo.com', 'senha123', 'Administrador', true);
```

## 🔍 Verificação da Configuração

### Teste de Conexão
1. Execute `pnpm run dev`
2. Acesse http://localhost:3000
3. Se configurado corretamente, você verá o cardápio
4. Para testar o admin, acesse http://localhost:3000/admin/login

### Logs de Debug
- Verifique o console do navegador para erros
- Logs do servidor aparecem no terminal
- Use http://localhost:3000/admin/debug para informações técnicas

## 📁 Estrutura do Projeto

```
cardapiov2/
├── app/                    # Páginas Next.js 13+ (App Router)
│   ├── admin/             # Painel administrativo
│   ├── checkout/          # Processo de checkout
│   ├── page.tsx           # Homepage do cardápio
│   └── layout.tsx         # Layout principal
├── components/            # Componentes React reutilizáveis
│   ├── ui/               # Componentes base (Radix UI)
│   └── *.tsx             # Componentes específicos
├── lib/                   # Utilitários e contextos
│   ├── supabase.ts       # Cliente Supabase
│   ├── *-context.tsx     # Contextos React
│   └── *.ts              # Utilitários
├── scripts/               # Scripts SQL do banco
├── sql/                   # Dados iniciais
├── .env.local            # Variáveis de ambiente
└── package.json          # Dependências
```

## 🛠️ Tecnologias Utilizadas

- **Frontend**: Next.js 15 + React 19 + TypeScript
- **Styling**: Tailwind CSS + Radix UI
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **Deployment**: Vercel (recomendado)
- **Package Manager**: pnpm

## 🚨 Problemas Conhecidos

### Erro de Sintaxe JavaScript
- **Sintoma**: "SyntaxError: Invalid or unexpected token" no console
- **Causa**: Incompatibilidade entre React 19 e algumas dependências
- **Status**: Não afeta funcionalidade, apenas logs do console
- **Solução**: Aguardar atualizações das dependências

### Supabase Não Configurado
- **Sintoma**: "Sistema não configurado" na aplicação
- **Solução**: Configurar variáveis de ambiente conforme Passo 3

## 📞 Suporte

Se encontrar problemas:
1. Verifique se todas as variáveis de ambiente estão configuradas
2. Confirme que o Supabase está acessível
3. Execute `pnpm run build` para verificar erros de compilação
4. Consulte os logs no console do navegador e terminal

## 🎯 Próximos Passos

1. **Configurar Supabase** seguindo os passos acima
2. **Popular banco de dados** com os scripts SQL
3. **Testar funcionalidades** do cardápio e admin
4. **Personalizar** dados da pizzaria
5. **Deploy** para produção (Vercel)

---

**Aplicação configurada e pronta para desenvolvimento!** 🍕