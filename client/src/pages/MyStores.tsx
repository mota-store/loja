import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { useLocation, Link } from "wouter";
import { Store, ExternalLink, Settings, PlusCircle, ArrowLeft } from "lucide-react";

export default function MyStores() {
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();

  // Fetch only stores owned by the current user
  const storesQuery = trpc.stores.getMyStores.useQuery(undefined, {
    enabled: isAuthenticated
  });

  if (!isAuthenticated) {
    navigate("/");
    return null;
  }

  const stores = storesQuery.data || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white p-4">
      <div className="max-w-5xl mx-auto space-y-8 py-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="icon" className="rounded-full hover:bg-gray-800">
                <ArrowLeft className="h-6 w-6" />
              </Button>
            </Link>
            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
              Minhas Lojas
            </h1>
          </div>
          <Link href="/create-store">
            <Button className="bg-purple-600 hover:bg-purple-700 font-bold px-6 py-6 shadow-lg hover:scale-105 transition-all">
              <PlusCircle className="mr-2 h-5 w-5" />
              Criar Nova Loja
            </Button>
          </Link>
        </div>

        {/* Dashboard Content */}
        <div className="grid grid-cols-1 gap-6">
          {storesQuery.isLoading ? (
            <div className="text-center py-20 text-gray-400">Carregando suas lojas...</div>
          ) : stores.length === 0 ? (
            <Card className="bg-gray-800/50 border-gray-700 border-dashed py-20">
              <CardContent className="flex flex-col items-center text-center space-y-4">
                <div className="bg-gray-700/50 p-6 rounded-full">
                  <Store size={48} className="text-gray-500" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-white">Nenhuma loja encontrada</h3>
                  <p className="text-gray-400 max-w-sm mx-auto">
                    Você ainda não criou nenhuma loja. Comece agora mesmo e tenha seu próprio site de vendas!
                  </p>
                </div>
                <Link href="/create-store">
                  <Button className="bg-purple-600 hover:bg-purple-700">
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
                  className="bg-gray-800 border-gray-700 hover:border-purple-500/50 transition-all duration-300 overflow-hidden group"
                >
                  <div className="h-2 w-full" style={{ backgroundColor: store.accentColor }} />
                  <CardHeader className="pb-4">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <CardTitle className="text-2xl text-white group-hover:text-purple-300 transition-colors">
                          {store.name}
                        </CardTitle>
                        <CardDescription className="text-gray-400 font-mono text-xs">
                          motastorehub.com/{store.slug}
                        </CardDescription>
                      </div>
                      <div 
                        className="w-10 h-10 rounded-lg shadow-inner border border-white/10" 
                        style={{ backgroundColor: store.accentColor }}
                      />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col gap-3">
                      <Button 
                        onClick={() => window.open(`/${store.slug}`, "_blank")}
                        variant="secondary" 
                        className="w-full bg-gray-700 hover:bg-gray-600 text-white border-none"
                      >
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Ver Meu Site
                      </Button>
                      <Button 
                        onClick={() => navigate(`/${store.slug}/admin`)}
                        className="w-full bg-purple-600 hover:bg-purple-700 text-white border-none"
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
