import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Store, Users, ShoppingCart } from "lucide-react";

export default function AdminDashboard() {
  const { user } = useAuth();
  const [, navigate] = useLocation();

  // Fetch all stores
  const storesQuery = trpc.stores.getAll.useQuery();

  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <Card className="bg-gray-800 border-gray-700 max-w-md">
          <CardHeader>
            <CardTitle className="text-white">Acesso Negado</CardTitle>
            <CardDescription>Você não tem permissão para acessar este painel.</CardDescription>
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

  const stores = storesQuery.data || [];

  // Calculate statistics
  const totalStores = stores.length;
  const totalOwners = new Set(stores.map((s) => s.ownerId)).size;

  // Mock data for chart (in production, this would come from the API)
  const chartData = stores.slice(0, 5).map((store) => ({
    name: store.name,
    revenue: Math.random() * 10000,
  }));

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-4xl font-bold">Painel Admin Supremo</h1>
          <Button onClick={() => navigate("/")} variant="outline" className="border-gray-600">
            Voltar ao Hub
          </Button>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Store size={24} />
                Total de Lojas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-purple-400">{totalStores}</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Users size={24} />
                Lojistas Ativos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-blue-400">{totalOwners}</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <ShoppingCart size={24} />
                Plataforma Ativa
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-green-400">✓</p>
            </CardContent>
          </Card>
        </div>

        {/* Chart */}
        {chartData.length > 0 && (
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Top Lojas (Receita Simulada)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                  <XAxis dataKey="name" stroke="#999" />
                  <YAxis stroke="#999" />
                  <Tooltip contentStyle={{ backgroundColor: "#333", border: "1px solid #666" }} />
                  <Legend />
                  <Bar dataKey="revenue" fill="#8b5cf6" name="Receita (R$)" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Stores List */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Todas as Lojas</CardTitle>
            <CardDescription>Gerenciamento centralizado de lojas</CardDescription>
          </CardHeader>
          <CardContent>
            {stores.length === 0 ? (
              <p className="text-gray-400">Nenhuma loja cadastrada</p>
            ) : (
              <div className="space-y-3">
                {stores.map((store) => (
                  <div
                    key={store.id}
                    className="bg-gray-700 rounded-lg p-4 flex items-center justify-between hover:bg-gray-600 transition-colors cursor-pointer"
                    onClick={() => window.open(`/${store.slug}`, "_blank")}
                  >
                    <div>
                      <h3 className="font-bold text-lg">{store.name}</h3>
                      <p className="text-gray-400 text-sm">
                        URL: <span className="font-mono text-purple-300">/{store.slug}</span>
                      </p>
                      <p className="text-gray-400 text-sm">Dono ID: {store.ownerId}</p>
                    </div>
                    <div
                      className="w-12 h-12 rounded-lg"
                      style={{ backgroundColor: store.accentColor }}
                    />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
