import { useAuth } from "@/_core/hooks/useAuth";
import { startLogin } from "@/const";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { useState } from "react";
import { toast } from "sonner";
import { ShoppingCart, LogIn, User, Info, CheckCircle2 } from "lucide-react";

interface StoreFrontProps {
  params: { slug: string };
}

export default function StoreFront({ params }: StoreFrontProps) {
  const { slug } = params;
  const { isAuthenticated, user } = useAuth();
  const [, navigate] = useLocation();

  // Buscar loja pelo slug
  const storeQuery = trpc.stores.getBySlug.useQuery({ slug });

  // Buscar produtos da loja
  const productsQuery = trpc.products.getByStore.useQuery(
    { storeId: storeQuery.data?.id || 0 },
    { enabled: !!storeQuery.data }
  );

  const cartQuery = trpc.cart.getItems.useQuery(
    { storeId: storeQuery.data?.id || 0 },
    { enabled: !!storeQuery.data && isAuthenticated }
  );

  const addToCartMutation = trpc.cart.addItem.useMutation({
    onSuccess: () => {
      toast.success("Produto adicionado ao carrinho!");
      cartQuery.refetch();
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
        <div className="animate-pulse text-purple-400 text-xl font-bold">Carregando loja...</div>
      </div>
    );
  }

  if (!storeQuery.data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <Card className="bg-gray-800 border-gray-700 max-w-md shadow-2xl">
          <CardHeader>
            <CardTitle className="text-white text-2xl">Loja não encontrada</CardTitle>
            <CardDescription className="text-gray-400">A loja "{slug}" não existe ou foi removida.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate("/")} className="w-full bg-purple-600 hover:bg-purple-700 py-6 font-bold">
              Voltar ao Hub
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const store = storeQuery.data;
  const products = productsQuery.data || [];
  const cartItemCount = cartQuery.data?.length || 0;

  return (
    <div className="min-h-screen bg-gray-950 text-white selection:bg-purple-500/30">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-gray-900/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl shadow-lg border border-white/10" style={{ backgroundColor: store.accentColor }} />
            <div>
              <h1 className="text-2xl font-black tracking-tight" style={{ color: store.accentColor }}>
                {store.name}
              </h1>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <Button
                  onClick={() => navigate(`/${slug}/profile`)}
                  variant="ghost"
                  className="relative group bg-gray-800/50 hover:bg-gray-800 border border-white/5"
                >
                  <ShoppingCart className="mr-2 h-5 w-5 text-gray-400 group-hover:text-white transition-colors" />
                  <span className="hidden sm:inline">Carrinho</span>
                  {cartItemCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center animate-bounce shadow-lg">
                      {cartItemCount}
                    </span>
                  )}
                </Button>
                <Button
                  onClick={() => navigate(`/${slug}/profile`)}
                  className="bg-gray-800 hover:bg-gray-700 border border-white/5"
                >
                  <User className="h-5 w-5" />
                </Button>
              </>
            ) : (
              <Button
                onClick={() => startLogin()}
                className="bg-purple-600 hover:bg-purple-700 flex items-center gap-2 font-bold px-6 shadow-lg shadow-purple-600/20"
              >
                <LogIn size={18} />
                Entrar
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Hero / Home Content */}
      <div className="relative overflow-hidden bg-gray-900 border-b border-white/5">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-600/5 to-transparent pointer-events-none" />
        <div className="max-w-6xl mx-auto px-4 py-16 sm:py-24 relative z-10">
          <div className="max-w-3xl">
            <h2 className="text-4xl sm:text-5xl font-black mb-6 leading-tight">
              {store.description || `Bem-vindo à ${store.name}`}
            </h2>
            {store.homeContent ? (
              <div className="prose prose-invert max-w-none">
                <p className="text-xl text-gray-400 leading-relaxed whitespace-pre-wrap">
                  {store.homeContent}
                </p>
              </div>
            ) : (
              <p className="text-xl text-gray-400 leading-relaxed">
                Confira nossos produtos exclusivos e garanta seus créditos agora mesmo.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* How to Buy Guide */}
      <section className="bg-gray-900/50 py-12 border-b border-white/5">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex items-start gap-4 p-4 rounded-xl bg-gray-800/30 border border-white/5">
              <div className="bg-purple-600/20 p-3 rounded-lg text-purple-400">
                <LogIn size={24} />
              </div>
              <div>
                <h4 className="font-bold text-white">1. Faça Login</h4>
                <p className="text-sm text-gray-400">Entre com sua conta para acessar a loja.</p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-4 rounded-xl bg-gray-800/30 border border-white/5">
              <div className="bg-blue-600/20 p-3 rounded-lg text-blue-400">
                <Info size={24} />
              </div>
              <div>
                <h4 className="font-bold text-white">2. Adicione Saldo</h4>
                <p className="text-sm text-gray-400">Fale com o lojista via WhatsApp para carregar saldo.</p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-4 rounded-xl bg-gray-800/30 border border-white/5">
              <div className="bg-green-600/20 p-3 rounded-lg text-green-400">
                <CheckCircle2 size={24} />
              </div>
              <div>
                <h4 className="font-bold text-white">3. Compre & Receba</h4>
                <p className="text-sm text-gray-400">Escolha o produto e finalize sua compra instantaneamente.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <main className="max-w-6xl mx-auto px-4 py-16">
        <div className="flex items-center justify-between mb-12">
          <h3 className="text-3xl font-black">Produtos Disponíveis</h3>
          <div className="h-1 flex-1 bg-white/5 mx-8 rounded-full hidden sm:block" />
        </div>

        {products.length === 0 ? (
          <div className="text-center py-24 bg-gray-900/50 rounded-3xl border border-dashed border-white/10">
            <p className="text-gray-500 text-xl italic">Nenhum produto disponível no momento.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((product) => (
              <Card
                key={product.id}
                className="bg-gray-900 border-white/10 hover:border-purple-500/50 transition-all duration-500 overflow-hidden flex flex-col group shadow-xl hover:-translate-y-2"
              >
                {product.imageUrl && (
                  <div className="aspect-square w-full overflow-hidden bg-gray-800 relative">
                    <img 
                      src={product.imageUrl} 
                      alt={product.name} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      onError={(e) => (e.currentTarget.src = "https://placehold.co/600x600/1a202c/4a5568?text=Mota+Store")}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  </div>
                )}
                <CardHeader className="flex-1">
                  <div className="flex justify-between items-start gap-2">
                    <CardTitle className="text-xl text-white group-hover:text-purple-300 transition-colors font-bold">{product.name}</CardTitle>
                    <div className="text-xl font-black whitespace-nowrap" style={{ color: store.accentColor }}>
                      R$ {parseFloat(product.price).toFixed(2)}
                    </div>
                  </div>
                  {product.description && (
                    <CardDescription className="text-gray-400 mt-2 line-clamp-3 leading-relaxed">
                      {product.description}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent className="pt-0 pb-6 px-6">
                  {product.benefits && product.benefits.length > 0 && (
                    <div className="mb-6 space-y-2">
                      {product.benefits.slice(0, 3).map((benefit, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-xs text-gray-400">
                          <CheckCircle2 size={12} className="text-green-500" />
                          <span>{benefit}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <Button
                    onClick={() => handleAddToCart(product.id)}
                    disabled={addToCartMutation.isPending}
                    className="w-full py-6 font-bold text-lg rounded-xl transition-all duration-300 shadow-lg"
                    style={{
                      backgroundColor: store.accentColor,
                      color: "white",
                    }}
                  >
                    <ShoppingCart size={20} className="mr-2" />
                    {addToCartMutation.isPending ? "Adicionando..." : "Comprar Agora"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 bg-gray-900 py-12">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg" style={{ backgroundColor: store.accentColor }} />
            <p className="font-bold text-gray-300">© 2026 {store.name}</p>
          </div>
          <div className="flex gap-8 text-sm text-gray-500">
            <a href="#" className="hover:text-white transition-colors">Termos de Uso</a>
            <a href="#" className="hover:text-white transition-colors">Privacidade</a>
            <a href="#" className="hover:text-white transition-colors">Suporte</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
