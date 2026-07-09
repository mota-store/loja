# Mota Store Hub

Uma plataforma SaaS multi-loja completa para criar e gerenciar lojas de créditos online. Cada lojista pode personalizar sua loja, gerenciar produtos, cupons e pedidos, enquanto os clientes compram usando saldo de carteira.

## 🚀 Características

### Para Lojistas
- **Criar Loja Personalizada**: Nome, URL única (slug), cor de destaque e WhatsApp
- **Gerenciar Produtos**: Criar, editar e deletar produtos com preço e benefícios
- **Cupons de Desconto**: Criar cupons com percentual de desconto e limite de usos
- **Painel de Pedidos**: Visualizar todos os pedidos recebidos
- **Notificações WhatsApp**: Receber notificações automáticas de novos pedidos

### Para Clientes
- **Carrinho de Compras**: Adicionar/remover produtos do carrinho
- **Sistema de Carteira**: Comprar com saldo de carteira
- **Cupons**: Aplicar cupons de desconto no checkout
- **Histórico**: Ver transações e pedidos anteriores
- **Múltiplas Lojas**: Comprar em diferentes lojas com a mesma conta

### Para Admin
- **Painel Supremo**: Visualizar todas as lojas cadastradas
- **Estatísticas**: Ver total de lojas e lojistas ativos
- **Gerenciamento Centralizado**: Controlar a plataforma

## 📁 Estrutura do Projeto

```
.
├── client/                    # Frontend React + Tailwind
│   ├── src/
│   │   ├── pages/            # Páginas principais
│   │   │   ├── Home.tsx      # Landing page do Hub
│   │   │   ├── CreateStore.tsx
│   │   │   ├── StoreFront.tsx # Vitrine da loja
│   │   │   ├── UserProfile.tsx # Perfil do usuário
│   │   │   ├── StoreAdmin.tsx # Painel do lojista
│   │   │   ├── OrderConfirmation.tsx
│   │   │   └── AdminDashboard.tsx
│   │   ├── components/       # Componentes reutilizáveis
│   │   ├── lib/trpc.ts       # Cliente tRPC
│   │   └── App.tsx           # Roteamento
├── server/                    # Backend Express + tRPC
│   ├── db.ts                 # Funções de banco de dados
│   ├── routers.ts            # Routers tRPC
│   └── _core/                # Framework core
├── drizzle/                   # Schema e migrations
│   └── schema.ts             # Definição de tabelas
├── Dockerfile                # Build para produção
└── package.json              # Dependências

```

## 🗄️ Banco de Dados

### Tabelas Principais

- **users**: Usuários da plataforma (clientes e lojistas)
- **stores**: Lojas cadastradas
- **products**: Produtos de cada loja
- **orders**: Pedidos realizados
- **orderItems**: Itens de cada pedido
- **wallets**: Saldo de carteira por usuário por loja
- **walletTransactions**: Histórico de transações
- **coupons**: Cupons de desconto
- **cartItems**: Itens do carrinho

## 🛣️ Rotas da Aplicação

### Públicas
- `/` - Landing page do Hub
- `/:slug` - Vitrine da loja

### Autenticadas
- `/create-store` - Criar nova loja
- `/:slug/profile` - Perfil do usuário (carrinho, saldo, pedidos)
- `/:slug/admin` - Painel do lojista
- `/:slug/order-confirmation/:orderId` - Confirmação de pedido

### Admin
- `/admin` - Painel admin supremo

## 🔐 Autenticação

A plataforma usa OAuth do Manus para autenticação. Usuários podem ter dois papéis:

- **user**: Cliente que compra em lojas
- **admin**: Usuário especial com acesso ao painel supremo

Lojistas são identificados como donos de lojas na tabela `stores`.

## 📦 Dependências Principais

- **React 19**: Framework frontend
- **Tailwind CSS 4**: Estilização
- **tRPC 11**: RPC type-safe
- **Express 4**: Servidor backend
- **Drizzle ORM**: Gerenciamento de banco de dados
- **Zod**: Validação de schemas

## 🚀 Deploy

### No Render

1. Conecte o repositório GitHub ao Render
2. Configure as variáveis de ambiente:
   - `DATABASE_URL`: Connection string do banco de dados
   - `JWT_SECRET`: Secret para JWT
   - `VITE_APP_ID`: OAuth app ID
   - `OAUTH_SERVER_URL`: URL do servidor OAuth

3. O Dockerfile será usado automaticamente para build

### Variáveis de Ambiente

```env
DATABASE_URL=mysql://user:password@host/dbname
JWT_SECRET=seu_secret_aqui
VITE_APP_ID=seu_app_id
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://portal.manus.im
```

## 🔄 Fluxo de Compra

1. **Cliente acessa a loja**: `/:slug`
2. **Adiciona produtos ao carrinho**
3. **Acessa seu perfil**: `/:slug/profile`
4. **Aplica cupom** (opcional)
5. **Finaliza compra** com saldo de carteira
6. **Recebe confirmação** e WhatsApp é aberto
7. **Lojista recebe notificação** no WhatsApp

## 🎨 Personalização

Cada loja tem:
- **Nome único**: Identificação da loja
- **Slug único**: URL personalizada (`/:slug`)
- **Cor de destaque**: Cor principal da interface
- **Número de WhatsApp**: Para receber pedidos

## 📝 Desenvolvimento

### Instalar dependências
```bash
pnpm install
```

### Rodar localmente
```bash
pnpm dev
```

### Build
```bash
pnpm build
```

### Testes
```bash
pnpm test
```

### Verificar tipos
```bash
pnpm check
```

## 🐛 Troubleshooting

### Erro: "Dockerfile: no such file or directory"
- O Dockerfile está incluído no repositório. Se estiver faltando, verifique se foi commitado.

### Erro: "Database connection failed"
- Verifique se `DATABASE_URL` está configurada corretamente
- Certifique-se de que o banco de dados está acessível

### Erro: "OAuth callback failed"
- Verifique se `VITE_APP_ID` e `OAUTH_SERVER_URL` estão corretos
- Confirme que a URL de callback está registrada no OAuth provider

## 📚 Documentação Adicional

- [tRPC Documentation](https://trpc.io/)
- [Drizzle ORM](https://orm.drizzle.team/)
- [Tailwind CSS](https://tailwindcss.com/)
- [React Documentation](https://react.dev/)

## 📄 Licença

MIT

## 👥 Suporte

Para dúvidas ou problemas, abra uma issue no repositório GitHub.
