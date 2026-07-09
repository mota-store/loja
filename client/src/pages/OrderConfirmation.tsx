import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { useEffect, useState } from "react";
import { CheckCircle, MessageCircle } from "lucide-react";

interface OrderConfirmationProps {
  params: { slug: string; orderId: string };
}

export default function OrderConfirmation({ params }: OrderConfirmationProps) {
  const { slug, orderId } = params;
  const [, navigate] = useLocation();
  const [redirectCountdown, setRedirectCountdown] = useState(5);

  // Fetch order
  const orderQuery = trpc.orders.getById.useQuery({ id: parseInt(orderId) });

  // Fetch store
  const storeQuery = trpc.stores.getBySlug.useQuery({ slug });

  // Fetch order items
  const itemsQuery = trpc.orders.getItems.useQuery(
    { orderId: parseInt(orderId) },
    { enabled: !!orderQuery.data }
  );

  // Fetch products
  const productsQuery = trpc.products.getByStore.useQuery(
    { storeId: storeQuery.data?.id || 0 },
    { enabled: !!storeQuery.data }
  );

  useEffect(() => {
    if (!orderQuery.data || !storeQuery.data) return;

    // Enviar mensagem ao WhatsApp do lojista
    const order = orderQuery.data;
    const store = storeQuery.data;
    const items = itemsQuery.data || [];
    const products = productsQuery.data || [];

    // Agrupar produtos
    const groupedItems: Record<string, number> = {};
    items.forEach((item) => {
      const product = products.find((p) => p.id === item.productId);
      const name = product?.name || `Produto #${item.productId}`;
      groupedItems[name] = (groupedItems[name] || 0) + item.quantity;
    });

    const productList = Object.entries(groupedItems)
      .map(([name, qty]) => (qty > 1 ? `${name} x${qty}` : name))
      .join(", ");

    const now = new Date().toLocaleString("pt-BR");
    const message = `Olá! Acabei de realizar o pedido #${order.id.toString().padStart(4, "0")} na ${store.name}.\nProduto(s): ${productList}\nTotal: R$ ${parseFloat(order.total).toFixed(2)}\nHorário: ${now}\nAguardo a ativação! 😊`;

    // Abrir WhatsApp em nova aba
    window.open(`https://wa.me/${store.whatsappNumber}?text=${encodeURIComponent(message)}`, "_blank");

    // Countdown para redirecionamento
    const timer = setInterval(() => {
      setRedirectCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate(`/${slug}`);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [orderQuery.data, storeQuery.data, itemsQuery.data, productsQuery.data, slug, navigate]);

  if (!orderQuery.data || !storeQuery.data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-white text-xl">Carregando...</div>
      </div>
    );
  }

  const order = orderQuery.data;
  const store = storeQuery.data;
  const items = itemsQuery.data || [];
  const products = productsQuery.data || [];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 p-4">
      <Card className="w-full max-w-md bg-gray-800 border-gray-700">
        <CardHeader className="text-center">
          <CheckCircle size={48} className="mx-auto mb-4 text-green-400" />
          <CardTitle className="text-white text-2xl">Pedido Confirmado!</CardTitle>
          <CardDescription>Pedido #{order.id.toString().padStart(4, "0")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Order Details */}
          <div className="bg-gray-700 rounded-lg p-4 space-y-3">
            <div>
              <p className="text-gray-400 text-sm">Produtos</p>
              <div className="space-y-1 mt-2">
                {items.map((item) => {
                  const product = products.find((p) => p.id === item.productId);
                  return (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span>{product?.name || `Produto #${item.productId}`}</span>
                      <span className="text-gray-400">x{item.quantity}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="border-t border-gray-600 pt-3">
              <div className="flex justify-between font-bold">
                <span>Total</span>
                <span style={{ color: store.accentColor }}>R$ {parseFloat(order.total).toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* WhatsApp Message */}
          <div className="bg-blue-900 rounded-lg p-4 flex items-center gap-3">
            <MessageCircle size={24} className="text-blue-300" />
            <div className="text-sm">
              <p className="font-semibold text-white">WhatsApp aberto</p>
              <p className="text-gray-300">Envie a mensagem para confirmar</p>
            </div>
          </div>

          {/* Redirect Message */}
          <div className="text-center">
            <p className="text-gray-400 text-sm">
              Redirecionando para a loja em <span className="font-bold text-white">{redirectCountdown}s</span>
            </p>
          </div>

          {/* Manual Navigation */}
          <Button onClick={() => navigate(`/${slug}`)} className="w-full bg-purple-600 hover:bg-purple-700">
            Voltar à Loja Agora
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
