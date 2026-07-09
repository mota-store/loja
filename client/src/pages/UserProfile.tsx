import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { useState } from "react";
import { toast } from "sonner";
import { Trash2, ShoppingCart, Wallet, History } from "lucide-react";

interface UserProfileProps {
  params: { slug: string };
}

export default function UserProfile({ params }: UserProfileProps) {
  const { slug } = params;
  const { isAuthenticated, logout } = useAuth();
  const [, navigate] = useLocation();
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number } | null>(null);

  // Fetch store
  const storeQuery = trpc.stores.getBySlug.useQuery({ slug });

  // Fetch wallet balance
  const walletQuery = trpc.wallets.getBalance.useQuery(
    { storeId: storeQuery.data?.id || 0 },
    { enabled: !!storeQuery.data && isAuthenticated }
  );

  // Fetch cart items
  const cartQuery = trpc.cart.getItems.useQuery(
    { storeId: storeQuery.data?.id || 0 },
    { enabled: !!storeQuery.data && isAuthenticated }
  );

  // Fetch products for cart
  const productsQuery = trpc.products.getByStore.useQuery(
    { storeId: storeQuery.data?.id || 0 },
    { enabled: !!storeQuery.data }
  );

  // Fetch wallet transactions
  const transactionsQuery = trpc.wallets.getTransactions.useQuery(
    { storeId: storeQuery.data?.id || 0, limit: 10 },
    { enabled: !!storeQuery.data && isAuthenticated }
  );

  // Fetch user orders
  const ordersQuery = trpc.orders.getByUser.useQuery(
    { storeId: storeQuery.data?.id || 0 },
    { enabled: !!storeQuery.data && isAuthenticated }
  );

  const removeFromCartMutation = trpc.cart.removeItem.useMutation({
    onSuccess: () => {
      cartQuery.refetch();
      toast.success("Produto removido do carrinho");
    },
  });

  const validateCouponQuery = trpc.coupons.validate.useQuery(
    { storeId: storeQuery.data?.id || 0, code: couponCode },
    { enabled: false }
  );

  const createOrderMutation = trpc.orders.create.useMutation({
    onSuccess: (orderId) => {
      toast.success("Pedido criado com sucesso!");
      navigate(`/${slug}/order-confirmation/${orderId}`);
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao criar pedido");
    },
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <Card className="bg-gray-800 border-gray-700 max-w-md">
          <CardHeader>
            <CardTitle className="text-white">Acesso Necessário</CardTitle>
            <CardDescription>Você precisa fazer login para acessar seu perfil.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate(`/${slug}`)} className="w-full bg-purple-600 hover:bg-purple-700">
              Voltar à Loja
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!storeQuery.data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-white">Carregando...</div>
      </div>
    );
  }

  const store = storeQuery.data;
  const cartItems = cartQuery.data || [];
  const products = productsQuery.data || [];
  const wallet = walletQuery.data;
  const transactions = transactionsQuery.data || [];
  const orders = ordersQuery.data || [];

  // Calculate cart total
  const cartTotal = cartItems.reduce((sum, item) => {
    const product = products.find((p) => p.id === item.productId);
    return sum + (product ? parseFloat(product.price) * item.quantity : 0);
  }, 0);

  const discountAmount = appliedCoupon ? (cartTotal * appliedCoupon.discount) / 100 : 0;
  const finalTotal = cartTotal - discountAmount;

  const handleValidateCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error("Digite um código de cupom");
      return;
    }

    const result = await validateCouponQuery.refetch();
    if (result.data?.valid) {
      setAppliedCoupon({ code: couponCode, discount: result.data.discount || 0 });
      setCouponCode("");
      toast.success(`Cupom aplicado! Desconto de ${result.data.discount}%`);
    } else {
      toast.error(result.data?.error || "Cupom inválido");
    }
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      toast.error("Seu carrinho está vazio");
      return;
    }

    if (!wallet || parseFloat(wallet.balance) < finalTotal) {
      toast.error("Saldo insuficiente");
      return;
    }

    const items = cartItems.map((item) => {
      const product = products.find((p) => p.id === item.productId);
      return {
        productId: item.productId,
        quantity: item.quantity,
        price: product?.price || "0",
      };
    });

    createOrderMutation.mutate({
      storeId: store.id,
      items,
      total: finalTotal.toFixed(2),
      couponCode: appliedCoupon?.code,
      discountApplied: discountAmount.toFixed(2),
    });
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Meu Perfil</h1>
          <div className="space-x-2">
            <Button onClick={() => navigate(`/${slug}`)} variant="outline" className="border-gray-600">
              Voltar à Loja
            </Button>
            <Button onClick={logout} variant="destructive">
              Sair
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Wallet Section */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Wallet size={20} />
                Minha Carteira
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-gray-400 text-sm">Saldo Disponível</p>
                <p className="text-3xl font-bold" style={{ color: store.accentColor }}>
                  R$ {wallet ? parseFloat(wallet.balance).toFixed(2) : "0.00"}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Cart Section */}
          <Card className="lg:col-span-2 bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <ShoppingCart size={20} />
                Carrinho ({cartItems.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {cartItems.length === 0 ? (
                <p className="text-gray-400">Seu carrinho está vazio</p>
              ) : (
                <div className="space-y-3">
                  {cartItems.map((item) => {
                    const product = products.find((p) => p.id === item.productId);
                    return (
                      <div key={item.id} className="flex items-center justify-between bg-gray-700 p-3 rounded">
                        <div>
                          <p className="font-semibold">{product?.name}</p>
                          <p className="text-sm text-gray-400">
                            Qtd: {item.quantity} × R$ {product ? parseFloat(product.price).toFixed(2) : "0.00"}
                          </p>
                        </div>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => removeFromCartMutation.mutate({ id: item.id })}
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Coupon Section */}
              {cartItems.length > 0 && (
                <div className="border-t border-gray-600 pt-4 space-y-2">
                  <Label className="text-gray-300">Código de Cupom</Label>
                  <div className="flex gap-2">
                    <Input
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      placeholder="Digite o cupom"
                      className="bg-gray-700 border-gray-600 text-white"
                      disabled={!!appliedCoupon}
                    />
                    <Button
                      onClick={handleValidateCoupon}
                      disabled={validateCouponQuery.isFetching || !!appliedCoupon}
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      Aplicar
                    </Button>
                  </div>
                  {appliedCoupon && (
                    <p className="text-sm text-green-400">✓ Cupom {appliedCoupon.code} aplicado ({appliedCoupon.discount}% de desconto)</p>
                  )}
                </div>
              )}

              {/* Checkout Summary */}
              {cartItems.length > 0 && (
                <div className="border-t border-gray-600 pt-4 space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>R$ {cartTotal.toFixed(2)}</span>
                  </div>
                  {appliedCoupon && (
                    <div className="flex justify-between text-green-400">
                      <span>Desconto ({appliedCoupon.discount}%):</span>
                      <span>-R$ {discountAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-lg border-t border-gray-600 pt-2">
                    <span>Total:</span>
                    <span style={{ color: store.accentColor }}>R$ {finalTotal.toFixed(2)}</span>
                  </div>
                  <Button
                    onClick={handleCheckout}
                    disabled={createOrderMutation.isPending}
                    className="w-full"
                    style={{ backgroundColor: store.accentColor, color: "white" }}
                  >
                    {createOrderMutation.isPending ? "Processando..." : "Finalizar Compra"}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Transactions and Orders */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Transactions */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <History size={20} />
                Histórico de Transações
              </CardTitle>
            </CardHeader>
            <CardContent>
              {transactions.length === 0 ? (
                <p className="text-gray-400 text-sm">Nenhuma transação</p>
              ) : (
                <div className="space-y-2">
                  {transactions.map((tx) => (
                    <div key={tx.id} className="flex justify-between items-center text-sm py-2 border-b border-gray-700">
                      <div>
                        <p className="font-semibold">{tx.description}</p>
                        <p className="text-gray-400 text-xs">{new Date(tx.createdAt).toLocaleDateString("pt-BR")}</p>
                      </div>
                      <span className={tx.type === "credit" ? "text-green-400" : "text-red-400"}>
                        {tx.type === "credit" ? "+" : "-"} R$ {parseFloat(tx.amount).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Orders */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Meus Pedidos</CardTitle>
            </CardHeader>
            <CardContent>
              {orders.length === 0 ? (
                <p className="text-gray-400 text-sm">Nenhum pedido realizado</p>
              ) : (
                <div className="space-y-2">
                  {orders.map((order) => (
                    <div key={order.id} className="bg-gray-700 p-3 rounded text-sm">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold">Pedido #{order.id.toString().padStart(4, "0")}</span>
                        <span className={order.status === "completed" ? "text-green-400" : "text-yellow-400"}>
                          {order.status === "completed" ? "✓ Concluído" : "⏳ Pendente"}
                        </span>
                      </div>
                      <p className="text-gray-400">R$ {parseFloat(order.total).toFixed(2)}</p>
                      <p className="text-gray-500 text-xs">{new Date(order.createdAt).toLocaleDateString("pt-BR")}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
