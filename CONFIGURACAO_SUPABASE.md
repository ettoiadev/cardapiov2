# 🔧 Configuração do Supabase - Guia Completo

## 🚨 Problema Identificado

O painel administrativo está apresentando erro porque as **variáveis de ambiente do Supabase não estão configuradas** no ambiente de produção.

### Sintomas do Problema:
- ❌ Erro: "Could not establish connection. Receiving end does not exist"
- ❌ Erro: "A listener indicated an asynchronous response by returning true, but the message channel closed before a response was received"
- ❌ Login do admin não funciona
- ❌ Console mostra: "Supabase environment variables not found. Using mock data mode."

---

## ⚡ Solução Rápida

### 1. **Configurar Variáveis no Vercel** (URGENTE)

Acesse o painel do Vercel e configure:

```bash
# Vá para: Project Settings > Environment Variables
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-publica-aqui
```

### 2. **Encontrar suas Credenciais**

1. Acesse: https://app.supabase.com
2. Selecione seu projeto
3. Vá em: **Settings > API**
4. Copie:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon/public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 3. **Aplicar a Configuração**

No Vercel:
1. Cole as variáveis em **Environment Variables**
2. Marque: ✅ Production ✅ Preview ✅ Development  
3. Clique **Save**
4. Faça **Redeploy** da aplicação

---

## 🔍 Verificação da Configuração

### No Console do Browser (F12):
```javascript
// Deve mostrar suas URLs reais, não placeholder
console.log(process.env.NEXT_PUBLIC_SUPABASE_URL)
console.log(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
```

### Logs Esperados:
- ✅ `"🔄 Carregando dados de produção..."`
- ✅ `"✅ Configuração da pizzaria carregada"`
- ❌ `"⚠️ Supabase environment variables not found"` (problema)

---

## 🗄️ Estrutura do Banco de Dados

Certifique-se que seu Supabase possui estas tabelas:

### Tabelas Obrigatórias:
- ✅ `pizzaria_config` - Configurações da pizzaria
- ✅ `admins` - Usuários administradores  
- ✅ `produtos` - Cardápio de produtos
- ✅ `categorias` - Categorias dos produtos
- ✅ `opcoes_sabores` - Opções de sabores (1, 2, 3 sabores)

### Scripts SQL Disponíveis:
```bash
scripts/
├── 01-create-tables.sql        # Criar tabelas principais
├── 02-admin-setup.sql          # Configurar usuário admin
├── 03-cardapio-management.sql  # Estrutura do cardápio
├── 04-populate-sabores.sql     # Opções de sabores
├── 05-database-optimization.sql # Otimizações
├── 06-pizzaria-config.sql      # Configurações da pizzaria
└── ... (outros scripts)
```

---

## 👤 Configuração do Admin

### Criar Usuário Administrador:

```sql
-- Execute no SQL Editor do Supabase
INSERT INTO admins (email, senha, nome, ativo) 
VALUES (
  'admin@pizzaria.com',
  'sua-senha-segura',  -- ⚠️ Use senha forte em produção
  'Administrador',
  true
);
```

### Configurações da Pizzaria:

```sql
-- Configurações básicas obrigatórias
INSERT INTO pizzaria_config (
  nome, whatsapp, taxa_entrega, valor_minimo,
  aceita_dinheiro, aceita_cartao, aceita_pix
) VALUES (
  'William Disk Pizza',
  '5511999999999',  -- Seu WhatsApp real
  5.00,             -- Taxa de entrega
  25.00,            -- Valor mínimo
  true, true, true
);
```

---

## 🧪 Teste da Configuração

### 1. **Teste de Conexão**
```javascript
// Cole no console do browser (F12)
fetch(process.env.NEXT_PUBLIC_SUPABASE_URL + '/rest/v1/')
  .then(r => r.ok ? console.log('✅ Supabase OK') : console.log('❌ Erro'))
  .catch(e => console.log('❌ Falha:', e))
```

### 2. **Teste de Login Admin**
1. Vá para: `https://cardapiodigital-mu.vercel.app/admin/login`
2. Use as credenciais configuradas no banco
3. Deve redirecionar para `/admin` sem erros

### 3. **Teste do Cardápio**
1. Acesse a página inicial
2. Deve carregar produtos reais do banco
3. Console deve mostrar: `"✅ X produtos carregados"`

---

## 🔧 Desenvolvimento Local

### Arquivo `.env.local`:
```bash
# Crie o arquivo .env.local na raiz do projeto
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-publica-aqui
```

### Comandos para Desenvolvimento:
```bash
# Instalar dependências
npm install

# Executar em desenvolvimento
npm run dev

# Build para produção
npm run build
```

---

## 🚀 Deploy em Produção

### Checklist Pré-Deploy:
- [ ] ✅ Variáveis configuradas no Vercel
- [ ] ✅ Banco populado com dados reais
- [ ] ✅ Usuário admin criado
- [ ] ✅ Build sem erros: `npm run build`
- [ ] ✅ Teste local funcionando

### Configuração do Vercel:
1. **Environment Variables** → Adicionar variáveis
2. **Deploy Settings** → Auto-deploy habilitado
3. **Build Command** → `npm run build`
4. **Output Directory** → `.next`

---

## ❗ Segurança e Boas Práticas

### ⚠️ Importante:
- **Senhas**: Use hash/salt para senhas de admin em produção
- **Keys**: As chaves do Supabase são públicas, mas não as exponha desnecessariamente
- **RLS**: Configure Row Level Security no Supabase
- **CORS**: Configure domínios permitidos no Supabase

### 🔒 Recomendações:
1. **Backup regular** do banco de dados
2. **Monitoramento** de logs e erros
3. **SSL/HTTPS** sempre habilitado
4. **Versionamento** do banco de dados

---

## 📞 Suporte

### Se os problemas persistirem:

1. **Verifique logs do Vercel**: Functions > View Details
2. **Console do Supabase**: Logs > API, Database
3. **Network tab** do browser: verificar requisições
4. **Console errors**: F12 > Console

### Logs Úteis para Debug:
```javascript
// Verificar configuração
console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
console.log('Configured:', !!process.env.NEXT_PUBLIC_SUPABASE_URL)

// Teste manual de conexão
import { supabase } from '@/lib/supabase'
supabase.from('pizzaria_config').select('*').then(console.log)
```

---

## ✅ Status da Correção

- [x] ✅ **Diagnóstico**: Problema identificado (variáveis de ambiente)
- [x] ✅ **Melhorias**: Tratamento de erro aprimorado
- [x] ✅ **Documentação**: Guia completo criado
- [ ] ⏳ **Configuração**: Aguardando configuração no Vercel
- [ ] ⏳ **Teste**: Validação em produção

**🎯 Próximo passo:** Configure as variáveis de ambiente no Vercel e faça redeploy da aplicação. 