# Mota Store Hub - TODO

## Fase 1: Configuração e Banco de Dados
- [x] Configurar repositório GitHub
- [x] Estrutura inicial do projeto
- [x] Esquema de banco de dados (stores, products, orders, wallets, coupons)

## Fase 2: Autenticação e Papéis
- [ ] Implementar autenticação OAuth com papéis (cliente, lojista, admin supremo)
- [ ] Criar middleware de verificação de papéis
- [ ] Implementar proteção de rotas por papel

## Fase 3: Landing Page e Cadastro
- [ ] Criar landing page do Hub com CTA
- [ ] Implementar fluxo de cadastro de loja (nome, slug, cor, WhatsApp)
- [ ] Validação de slug único
- [ ] Página de sucesso após cadastro

## Fase 4: Roteamento Dinâmico
- [ ] Implementar roteamento dinâmico por slug (/:storeSlug)
- [ ] Criar vitrine da loja com produtos
- [ ] Aplicar tema personalizado (cor de destaque)

## Fase 5: Painel do Lojista
- [ ] Criar painel do lojista (/:storeSlug/admin)
- [ ] Gerenciamento de produtos (CRUD)
- [ ] Gerenciamento de cupons (CRUD)
- [ ] Visualização de pedidos
- [ ] Dashboard com estatísticas

## Fase 6: Catálogo e Carrinho
- [ ] Implementar catálogo de produtos por loja
- [ ] Carrinho de compras
- [ ] Persistência do carrinho (localStorage + DB)
- [ ] Página de checkout

## Fase 7: Sistema de Carteira
- [ ] Implementar carteira/saldo por usuário por loja
- [ ] Histórico de transações
- [ ] Página de perfil com saldo
- [ ] Adição de créditos (se necessário)

## Fase 8: Cupons
- [ ] Criação de cupons no painel do lojista
- [ ] Resgate de cupons no checkout
- [ ] Validação de cupons (ativo, não expirado, limite de usos)
- [ ] Aplicação de desconto

## Fase 9: Pedidos e WhatsApp
- [ ] Fluxo de checkout com saldo de carteira
- [ ] Criação de pedido
- [ ] Envio automático de mensagem ao WhatsApp do lojista
- [ ] Página de confirmação de pedido
- [ ] Histórico de pedidos do usuário

## Fase 10: Painel Admin Supremo
- [ ] Criar painel admin supremo (/admin)
- [ ] Visualização de todas as lojas
- [ ] Estatísticas globais
- [ ] Gerenciamento de lojas (ativar/desativar)
- [ ] Visualização de transações globais

## Fase 11: Refinamento Visual
- [ ] Garantir elegância em todos os componentes
- [ ] Tipografia cuidadosa
- [ ] Paleta de cores sofisticada
- [ ] Responsividade completa
- [ ] Animações e micro-interações

## Fase 12: Testes e Deploy
- [ ] Testes de fluxos críticos
- [ ] Testes de segurança (isolamento de tenants)
- [ ] Commit final no GitHub
- [ ] Documentação de deploy no Render
