import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { useLocation, Link } from "wouter";
import { Store, ExternalLink, Settings, PlusCircle, ArrowLeft, Loader2 } from "lucide-react";

export default function MyStores() {
  const { user, isAuthenticated, loading } = useAuth();
  const [, navigate] = useLocation();

  // Fetch only stores owned by the current user
  const storesQuery = trpc.stores.getMyStores.useQuery(undefined, {
    enabled: isAuthenticated
  });

  // Wait for auth to load before making decisions
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-purple-500 animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    navigate("/");
    return null;
  }

  const stores = storesQuery.data || [];

  return (
    <div className="min-h-screen bg-gray-950 text-white p-4">
      <div className="max-w-5xl mx-auto space-y-8 py-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="icon" className="rounded-full hover:bg-white/5 text-gray-400 hover:text-white">
                <ArrowLeft className="h-6 w-6" />
              </Button>
            </Link>
            <h1 className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-500 tracking-tighter">
              Minhas Lojas
            </h1>
          </div>
          <Link href="/create-store">
            <Button className="bg-purple-600 hover:bg-purple-700 text-white font-black px-6 py-6 rounded-2xl shadow-lg shadow-purple-600/20 hover:scale-105 transition-all">
              <PlusCircle className="mr-2 h-5 w-5" />
              Criar Nova Loja
            </Button>
          </Link>
        </div>

        {/* Dashboard Content */}
        <div className="grid grid-cols-1 gap-6">
          {storesQuery.isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-500 gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-purple-500/50" />
              <p>Carregando suas lojas...</p>
            </div>
          ) : stores.length === 0 ? (
            <Card className="bg-gray-900/50 border-white/5 border-dashed py-20 rounded-3xl">
              <CardContent className="flex flex-col items-center text-center space-y-6">
                <div className="bg-white/5 p-6 rounded-3xl">
                  <Store size={48} className="text-gray-600" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-white">Nenhuma loja encontrada</h3>
                  <p className="text-gray-400 max-w-sm mx-auto">
                    Você ainda não criou nenhuma loja. Comece agora mesmo e tenha seu próprio site de vendas!
                  </p>
                </div>
                <Link href="/create-store">
                  <Button className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-8 py-6 rounded-2xl">
                    Começar Minha Primeira Loja
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {stores.map((store) => (
                <Card 
                  key={store.id} 
                  className="bg-gray-900 border-white/5 hover:border-purple-500/30 transition-all duration-300 overflow-hidden group rounded-3xl"
                >
                  <div className="h-2 w-full" style={{ backgroundColor: store.accentColor }} />
                  <CardHeader className="pb-4">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <CardTitle className="text-2xl text-white group-hover:text-purple-400 transition-colors font-bold">
                          {store.name}
                        </CardTitle>
                        <CardDescription className="text-gray-500 font-mono text-xs">
                          {window.location.host}/{store.slug}
                        </CardDescription>
                      </div>
                      <div 
                        className="w-10 h-10 rounded-xl shadow-inner border border-white/10" 
                        style={{ backgroundColor: store.accentColor }}
                      />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col gap-3">
                      <Button 
                        onClick={() => window.open(`/${store.slug}`, "_blank")}
                        variant="secondary" 
                        className="w-full bg-white/5 hover:bg-white/10 text-white border-none rounded-xl py-6"
                      >
                        <ExternalLink className="mr-2 h-4 w-4 text-purple-400" />
                        Ver Meu Site
                      </Button>
                      <Button 
                        onClick={() => navigate(`/${store.slug}/admin`)}
                        className="w-full bg-purple-600 hover:bg-purple-700 text-white border-none rounded-xl py-6 font-bold"
                      >
                        <Settings className="mr-2 h-4 w-4" />
                        Configurar Loja
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
