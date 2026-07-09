import { useAuth } from "@/_core/hooks/useAuth";
import { startLogin } from "@/const";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { useState } from "react";
import { toast } from "sonner";
import { ShoppingCart, LogIn } from "lucide-react";

interface StoreFrontProps {
  params: { slug: string };
}

export default function StoreFront({ params }: StoreFrontProps) {
  const { slug } = params;
  const { isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const [cart, setCart] = useState<Array<{ productId: number; quantity: number }>>([]);

  // Buscar loja pelo slug
  const storeQuery = trpc.stores.getBySlug.useQuery({ slug });

  // Buscar produtos da loja
  const productsQuery = trpc.products.getByStore.useQuery(
    { storeId: storeQuery.data?.id || 0 },
    { enabled: !!storeQuery.data }
  );

  const addToCartMutation = trpc.cart.addItem.useMutation({
    onSuccess: () => {
      toast.success("Produto adicionado ao carrinho!");
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao adicionar ao carrinho");
    },
  });

  const handleAddToCart = (productId: number) => {
    if (!isAuthenticated) {
      toast.error("Faça login para adicionar itens ao carrinho");
      startLogin();
      return;
    }

    if (!storeQuery.data) return;

    addToCartMutation.mutate({
      storeId: storeQuery.data.id,
      productId,
      quantity: 1,
    });
  };

  if (storeQuery.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-white text-xl">Carregando loja...</div>
      </div>
    );
  }

  if (!storeQuery.data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <Card className="bg-gray-800 border-gray-700 max-w-md">
          <CardHeader>
            <CardTitle className="text-white">Loja não encontrada</CardTitle>
            <CardDescription>A loja "{slug}" não existe ou foi removida.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate("/")} className="w-full bg-purple-600 hover:bg-purple-700">
              Voltar ao Hub
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const store = storeQuery.data;
  const products = productsQuery.data || [];

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="border-b border-gray-700 bg-gray-800">
        <div className="max-w-6xl mx-auto px-4 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold" style={{ color: store.accentColor }}>
              {store.name}
            </h1>
            {store.description && <p className="text-gray-400 mt-1">{store.description}</p>}
          </div>
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <Button
                onClick={() => navigate(`/${slug}/profile`)}
                className="bg-gray-700 hover:bg-gray-600"
              >
                Meu Perfil
              </Button>
            ) : (
              <Button
                onClick={() => startLogin()}
                className="bg-purple-600 hover:bg-purple-700 flex items-center gap-2"
              >
                <LogIn size={16} />
                Login
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Products Grid */}
      <main className="max-w-6xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold mb-8">Nossos Produtos</h2>

        {products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">Nenhum produto disponível no momento.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <Card
                key={product.id}
                className="bg-gray-800 border-gray-700 hover:border-gray-600 transition-colors overflow-hidden"
              >
                <CardHeader>
                  <CardTitle className="text-white">{product.name}</CardTitle>
                  <CardDescription className="text-gray-400">
                    R$ {parseFloat(product.price).toFixed(2)}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {product.description && (
                    <p className="text-gray-300 text-sm">{product.description}</p>
                  )}

                  {product.benefits && product.benefits.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-semibold text-gray-300">Benefícios:</p>
                      <ul className="list-disc list-inside space-y-1">
                        {product.benefits.map((benefit, idx) => (
                          <li key={idx} className="text-sm text-gray-400">
                            {benefit}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <Button
                    onClick={() => handleAddToCart(product.id)}
                    disabled={addToCartMutation.isPending}
                    className="w-full flex items-center justify-center gap-2"
                    style={{
                      backgroundColor: store.accentColor,
                      color: "white",
                    }}
                  >
                    <ShoppingCart size={16} />
                    {addToCartMutation.isPending ? "Adicionando..." : "Adicionar ao Carrinho"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-700 bg-gray-800 mt-12">
        <div className="max-w-6xl mx-auto px-4 py-6 text-center text-gray-400">
          <p>© 2026 {store.name}. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
