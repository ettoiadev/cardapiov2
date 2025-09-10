# PRD - Cardápio Digital para Pizzaria

## 1. Visão Geral do Produto

### 1.1 Resumo Executivo
O **Cardápio Digital** é uma aplicação web completa desenvolvida para pizzarias que permite aos clientes visualizar o cardápio, personalizar pedidos e finalizar compras de forma digital. O sistema inclui um painel administrativo robusto para gerenciamento de produtos, categorias e configurações.

### 1.2 Objetivos do Produto
- **Digitalizar** o processo de pedidos da pizzaria
- **Simplificar** a experiência do cliente na escolha e personalização de produtos
- **Automatizar** o envio de pedidos via WhatsApp
- **Centralizar** o gerenciamento de cardápio e configurações
- **Otimizar** operações de delivery e retirada no balcão

### 1.3 Público-Alvo
- **Primário**: Clientes da pizzaria (consumidores finais)
- **Secundário**: Administradores/funcionários da pizzaria
- **Terciário**: Proprietários de pizzarias

## 2. Especificações Técnicas

### 2.1 Stack Tecnológica
- **Frontend**: Next.js 15.2.4 com React
- **UI Framework**: Tailwind CSS + Radix UI
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **Deployment**: Vercel
- **Linguagem**: TypeScript

### 2.2 Arquitetura
- **Aplicação**: Single Page Application (SPA)
- **Autenticação**: Supabase Auth
- **Banco de Dados**: PostgreSQL (Supabase)
- **Storage**: Supabase Storage para imagens
- **Estado**: Context API (React)

## 3. Funcionalidades Principais

### 3.1 Área do Cliente

#### 3.1.1 Homepage
- **Carousel de imagens** promocionais
- **Visualização do cardápio** por categorias
- **Filtros** por tipo de produto
- **Labels visuais** para promoções
- **Informações da loja** (horários, contato)
- **Rodapé com redes sociais**

#### 3.1.2 Seleção de Produtos
- **Pizzas**:
  - Seleção de tamanho
  - Escolha de 1, 2 ou mais sabores
  - Adicionais personalizados por sabor
  - Bordas recheadas
  - Preços promocionais
- **Bebidas**:
  - Seleção simples
  - Controle de quantidade
- **Outros produtos**:
  - Sobremesas, acompanhamentos

#### 3.1.3 Carrinho de Compras
- **Resumo detalhado** do pedido
- **Stepper de quantidade** para cada item
- **Cálculo automático** de preços
- **Edição/remoção** de itens
- **Persistência** entre sessões

#### 3.1.4 Checkout
- **Stepper vertical** para navegação
- **Dados do cliente**:
  - Nome, telefone
  - Endereço (para delivery)
- **Modalidade de entrega**:
  - Delivery
  - Retirada no balcão
- **Formas de pagamento**:
  - Dinheiro, cartão, PIX
  - Troco (quando aplicável)
- **Finalização via WhatsApp**

### 3.2 Área Administrativa

#### 3.2.1 Autenticação
- **Login seguro** com credenciais
- **Sessão persistente**
- **Proteção de rotas** administrativas

#### 3.2.2 Gerenciamento de Produtos
- **CRUD completo** de produtos
- **Upload de imagens** com preview
- **Configuração de preços** por tamanho
- **Adicionais personalizados**
- **Status ativo/inativo**
- **Produtos promocionais**

#### 3.2.3 Gerenciamento de Cardápio
- **Categorias**:
  - Criação, edição, exclusão
  - Ordenação personalizada
  - Status ativo/inativo
- **Tamanhos de Pizza**:
  - Configuração de tamanhos
  - Quantidade de fatias
  - Preços base
- **Opções de Sabores**:
  - Configuração de frações (1, 2, 3+ sabores)
  - Limites por opção

#### 3.2.4 Configurações Gerais
- **Dados da pizzaria**:
  - Nome, endereço, telefone
  - Horários de funcionamento
  - Taxa de delivery
- **Formas de pagamento** aceitas
- **Redes sociais**
- **Configurações de promoção**

#### 3.2.5 Debug e Análise
- **Visualização de dados** do banco
- **Logs de sistema**
- **Análise de performance**

## 4. Fluxos de Usuário

### 4.1 Fluxo do Cliente
1. **Acesso** à homepage
2. **Navegação** pelo cardápio
3. **Seleção** de produtos
4. **Personalização** (sabores, adicionais)
5. **Adição** ao carrinho
6. **Revisão** do pedido
7. **Preenchimento** de dados
8. **Escolha** da modalidade de entrega
9. **Seleção** da forma de pagamento
10. **Finalização** via WhatsApp

### 4.2 Fluxo do Administrador
1. **Login** no sistema
2. **Acesso** ao painel administrativo
3. **Gerenciamento** de produtos/categorias
4. **Upload** de imagens
5. **Configuração** de preços e promoções
6. **Ajuste** de configurações gerais
7. **Monitoramento** via debug

## 5. Requisitos Funcionais

### 5.1 Obrigatórios
- [x] Sistema de autenticação para admin
- [x] CRUD completo de produtos
- [x] Carrinho de compras funcional
- [x] Checkout com múltiplas formas de pagamento
- [x] Integração com WhatsApp
- [x] Upload e gerenciamento de imagens
- [x] Sistema de promoções
- [x] Responsividade mobile

### 5.2 Desejáveis
- [x] Carousel de imagens promocionais
- [x] Sistema de adicionais por sabor
- [x] Bordas recheadas para pizzas
- [x] Configuração de horários de funcionamento
- [x] Redes sociais no rodapé
- [x] Sistema de debug administrativo

## 6. Requisitos Não-Funcionais

### 6.1 Performance
- **Tempo de carregamento**: < 3 segundos
- **Otimização de imagens**: Compressão automática
- **Cache**: Implementado via Next.js

### 6.2 Segurança
- **Autenticação**: Supabase Auth
- **RLS (Row Level Security)**: Implementado
- **Validação**: Frontend e backend
- **HTTPS**: Obrigatório em produção

### 6.3 Usabilidade
- **Interface intuitiva**: Design limpo e moderno
- **Responsividade**: Mobile-first
- **Acessibilidade**: Padrões WCAG
- **Feedback visual**: Toasts e loading states

### 6.4 Escalabilidade
- **Banco de dados**: PostgreSQL (Supabase)
- **CDN**: Vercel Edge Network
- **Caching**: Next.js ISR

## 7. Integrações

### 7.1 WhatsApp Business API
- **Envio automático** de pedidos
- **Formatação** de mensagens estruturadas
- **Dados do cliente** e detalhes do pedido

### 7.2 Supabase
- **Banco de dados**: PostgreSQL
- **Autenticação**: Auth service
- **Storage**: Upload de imagens
- **Real-time**: Atualizações em tempo real

### 7.3 Vercel
- **Deploy automático**: CI/CD
- **Edge functions**: Performance otimizada
- **Analytics**: Monitoramento de uso

## 8. Modelo de Dados

### 8.1 Principais Entidades

#### 8.1.1 Tabelas Implementadas
- **pizzaria_config**: Configurações gerais da pizzaria (2 registros)
  - Dados da empresa, horários, formas de pagamento
  - Configurações de redes sociais e contato
  - Taxa de entrega e valores mínimos

- **categorias**: Agrupamento de produtos (7 categorias)
  - Pizzas Salgadas, Pizzas Doces, Bebidas
  - Sobremesas, Acompanhamentos, Promoções, Combos
  - Suporte a múltiplos sabores configurável

- **produtos**: Itens do cardápio (18 produtos)
  - Pizzas com preços tradicional e broto
  - Bebidas e outros produtos
  - Sistema de preços promocionais
  - Adicionais em formato JSON

- **tamanhos_pizza**: Configurações de tamanho (4 tamanhos)
  - Broto (4 fatias), Pequena (6 fatias)
  - Média (8 fatias), Grande (12 fatias)

- **opcoes_sabores**: Configurações de frações (6 opções)
  - 1 sabor, 2 sabores, 3 sabores
  - 4 sabores, 5 sabores, 6+ sabores

- **bordas_recheadas**: Opções de borda (8 opções)
  - Catupiry, Cheddar, Chocolate, etc.
  - Preços adicionais configuráveis

- **admins**: Usuários administradores (1 usuário)
  - Sistema de autenticação básico
  - Credenciais para acesso ao painel

- **pedidos**: Histórico de pedidos (estrutura criada)
  - Dados de entrega e pagamento
  - Status e observações

- **pedido_itens**: Itens dos pedidos (estrutura criada)
  - Detalhes de produtos e personalizações
  - Quantidades e preços

- **mensagens_whatsapp**: Log de mensagens (estrutura criada)
  - Rastreabilidade de envios
  - Histórico de comunicação

### 8.2 Relacionamentos Implementados
- **Produtos → Categorias** (N:1): FK categoria_id
- **Pedido_Itens → Produtos** (N:1): FK produto_id
- **Pedido_Itens → Pedidos** (N:1): FK pedido_id
- **Produtos**: Adicionais em formato JSONB
- **Categorias**: Multi-sabores habilitado (boolean)

### 8.3 Características Técnicas
- **IDs**: UUID para todas as entidades
- **Timestamps**: created_at/updated_at automáticos
- **RLS**: Row Level Security habilitado
- **Constraints**: Validações de preços positivos
- **Indexes**: Otimizações de performance
- **JSONB**: Dados estruturados flexíveis

## 9. Roadmap e Versioning

### 9.1 Versão Atual (v1.0) - ✅ IMPLEMENTADA

#### 9.1.1 Banco de Dados
- ✅ **10 tabelas** criadas e estruturadas
- ✅ **Dados iniciais** populados:
  - 7 categorias de produtos
  - 18 produtos no cardápio
  - 4 tamanhos de pizza configurados
  - 6 opções de sabores
  - 8 bordas recheadas disponíveis
  - 1 usuário administrador
  - Configurações da pizzaria definidas
- ✅ **Relacionamentos** estabelecidos com FKs
- ✅ **RLS (Row Level Security)** habilitado
- ✅ **Constraints** de validação implementadas

#### 9.1.2 Funcionalidades Core
- ✅ Estrutura de produtos e categorias
- ✅ Sistema de preços (tradicional + broto)
- ✅ Preços promocionais configuráveis
- ✅ Adicionais em formato JSON flexível
- ✅ Sistema de bordas recheadas
- ✅ Configurações de múltiplos sabores
- ✅ Autenticação administrativa
- ✅ Log de mensagens WhatsApp
- ✅ Estrutura para histórico de pedidos

### 9.2 Próximas Versões

#### v1.1 (Em Desenvolvimento)
- [ ] Interface frontend para visualização do cardápio
- [ ] Sistema de carrinho de compras
- [ ] Checkout com integração WhatsApp
- [ ] Painel administrativo funcional
- [ ] Upload de imagens de produtos

#### v1.2 (Planejado)
- [ ] Sistema de cupons de desconto
- [ ] Relatórios de vendas
- [ ] Notificações push
- [ ] Programa de fidelidade

#### v1.3 (Futuro)
- [ ] App mobile nativo
- [ ] Integração com delivery apps
- [ ] Sistema de avaliações
- [ ] Analytics avançado

## 10. Métricas e KPIs

### 10.1 Métricas de Negócio
- **Taxa de conversão**: Visitantes → Pedidos
- **Ticket médio**: Valor médio por pedido
- **Produtos mais vendidos**: Ranking de popularidade
- **Horários de pico**: Análise temporal

### 10.2 Métricas Técnicas
- **Uptime**: Disponibilidade do sistema
- **Performance**: Core Web Vitals
- **Erros**: Taxa de erro por funcionalidade
- **Uso**: Páginas mais acessadas

## 11. Considerações de Manutenção

### 11.1 Atualizações
- **Dependências**: Atualizações regulares
- **Segurança**: Patches de segurança
- **Features**: Novas funcionalidades

### 11.2 Backup e Recovery
- **Banco de dados**: Backup automático (Supabase)
- **Imagens**: Redundância no storage
- **Código**: Versionamento Git

### 11.3 Monitoramento
- **Logs**: Centralizados via Vercel
- **Alertas**: Notificações de erro
- **Performance**: Monitoramento contínuo

## 12. Status Atual e Conclusão

### 12.1 Estado da Implementação

#### ✅ **Banco de Dados - CONCLUÍDO**
- **10 tabelas** completamente estruturadas e operacionais
- **Dados iniciais** populados em todas as tabelas relevantes
- **Relacionamentos** estabelecidos com integridade referencial
- **Segurança** implementada com RLS e constraints
- **Performance** otimizada com indexes apropriados

#### 🔄 **Frontend - EM DESENVOLVIMENTO**
- Estrutura Next.js configurada
- Componentes UI base implementados
- Integração com Supabase estabelecida
- Contextos de estado criados

#### 📋 **Próximos Passos Imediatos**
1. Implementar interfaces de visualização do cardápio
2. Desenvolver sistema de carrinho de compras
3. Criar fluxo de checkout completo
4. Finalizar painel administrativo
5. Implementar upload de imagens

### 12.2 Conclusão

O **Cardápio Digital** está com sua **fundação técnica sólida** estabelecida. O banco de dados PostgreSQL está completamente configurado, populado e otimizado, fornecendo uma base robusta para o desenvolvimento das interfaces frontend.

Com **10 tabelas estruturadas**, **dados iniciais carregados** e **relacionamentos bem definidos**, o sistema está pronto para suportar todas as funcionalidades planejadas. A arquitetura escolhida (Next.js + Supabase) garante escalabilidade, performance e facilidade de manutenção.

O projeto encontra-se em **excelente posição** para a continuidade do desenvolvimento, com uma base de dados sólida que suportará tanto as necessidades dos clientes quanto dos administradores da pizzaria.

---

**Documento criado em**: Janeiro 2025  
**Última atualização**: Janeiro 2025  
**Versão**: 1.1  
**Autor**: Equipe de Desenvolvimento  
**Status**: Banco de Dados Implementado - Frontend em Desenvolvimento