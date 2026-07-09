import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { useState } from "react";
import { toast } from "sonner";
import { Trash2, Edit2, Plus } from "lucide-react";

interface StoreAdminProps {
  params: { slug: string };
}

export default function StoreAdmin({ params }: StoreAdminProps) {
  const { slug } = params;
  const { isAuthenticated, user } = useAuth();
  const [, navigate] = useLocation();

  // Fetch store
  const storeQuery = trpc.stores.getBySlug.useQuery({ slug });

  // Fetch products
  const productsQuery = trpc.products.getByStore.useQuery(
    { storeId: storeQuery.data?.id || 0 },
    { enabled: !!storeQuery.data }
  );

  // Fetch coupons
  const couponsQuery = trpc.coupons.getByStore.useQuery(
    { storeId: storeQuery.data?.id || 0 },
    { enabled: !!storeQuery.data && isAuthenticated }
  );

  // Fetch orders
  const ordersQuery = trpc.orders.getByStore.useQuery(
    { storeId: storeQuery.data?.id || 0 },
    { enabled: !!storeQuery.data && isAuthenticated }
  );

  // Form states
  const [productForm, setProductForm] = useState({ name: "", description: "", price: "", benefits: "" });
  const [couponForm, setCouponForm] = useState({ code: "", discountPercentage: "", maxUses: "" });

  // Mutations
  const createProductMutation = trpc.products.create.useMutation({
    onSuccess: () => {
      toast.success("Produto criado!");
      setProductForm({ name: "", description: "", price: "", benefits: "" });
      productsQuery.refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const deleteProductMutation = trpc.products.delete.useMutation({
    onSuccess: () => {
      toast.success("Produto deletado!");
      productsQuery.refetch();
    },
  });

  const createCouponMutation = trpc.coupons.create.useMutation({
    onSuccess: () => {
      toast.success("Cupom criado!");
      setCouponForm({ code: "", discountPercentage: "", maxUses: "" });
      couponsQuery.refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const deleteCouponMutation = trpc.coupons.delete.useMutation({
    onSuccess: () => {
      toast.success("Cupom deletado!");
      couponsQuery.refetch();
    },
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <Card className="bg-gray-800 border-gray-700 max-w-md">
          <CardHeader>
            <CardTitle className="text-white">Acesso Necessário</CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate(`/${slug}`)} className="w-full bg-purple-600 hover:bg-purple-700">
              Voltar
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!storeQuery.data) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">Carregando...</div>;
  }

  const store = storeQuery.data;

  // Verify ownership
  if (store.ownerId !== user?.id) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <Card className="bg-gray-800 border-gray-700 max-w-md">
          <CardHeader>
            <CardTitle className="text-white">Acesso Negado</CardTitle>
            <CardDescription>Você não tem permissão para gerenciar esta loja.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate(`/${slug}`)} className="w-full bg-purple-600 hover:bg-purple-700">
              Voltar
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleCreateProduct = () => {
    if (!productForm.name || !productForm.price) {
      toast.error("Preencha nome e preço");
      return;
    }

    createProductMutation.mutate({
      storeId: store.id,
      name: productForm.name,
      description: productForm.description,
      price: productForm.price,
      benefits: productForm.benefits ? productForm.benefits.split(",").map((b) => b.trim()) : [],
    });
  };

  const handleCreateCoupon = () => {
    if (!couponForm.code || !couponForm.discountPercentage) {
      toast.error("Preencha código e percentual");
      return;
    }

    createCouponMutation.mutate({
      storeId: store.id,
      code: couponForm.code,
      discountPercentage: parseInt(couponForm.discountPercentage),
      maxUses: couponForm.maxUses ? parseInt(couponForm.maxUses) : undefined,
    });
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Painel da Loja: {store.name}</h1>
          <Button onClick={() => navigate(`/${slug}`)} variant="outline" className="border-gray-600">
            Voltar à Loja
          </Button>
        </div>

        <Tabs defaultValue="products" className="w-full">
          <TabsList className="bg-gray-800 border-gray-700">
            <TabsTrigger value="products">Produtos</TabsTrigger>
            <TabsTrigger value="coupons">Cupons</TabsTrigger>
            <TabsTrigger value="orders">Pedidos</TabsTrigger>
          </TabsList>

          {/* Products Tab */}
          <TabsContent value="products" className="space-y-6">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Plus size={20} />
                  Novo Produto
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-gray-300">Nome</Label>
                  <Input
                    value={productForm.name}
                    onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
                <div>
                  <Label className="text-gray-300">Descrição</Label>
                  <Input
                    value={productForm.description}
                    onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
                <div>
                  <Label className="text-gray-300">Preço (R$)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
                <div>
                  <Label className="text-gray-300">Benefícios (separados por vírgula)</Label>
                  <Input
                    value={productForm.benefits}
                    onChange={(e) => setProductForm({ ...productForm, benefits: e.target.value })}
                    placeholder="Ex: Acesso 30 dias, Suporte 24h"
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
                <Button
                  onClick={handleCreateProduct}
                  disabled={createProductMutation.isPending}
                  className="w-full bg-purple-600 hover:bg-purple-700"
                >
                  {createProductMutation.isPending ? "Criando..." : "Criar Produto"}
                </Button>
              </CardContent>
            </Card>

            {/* Products List */}
            <div className="space-y-3">
              <h3 className="text-xl font-bold">Produtos Cadastrados</h3>
              {(productsQuery.data || []).map((product) => (
                <Card key={product.id} className="bg-gray-800 border-gray-700">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-bold">{product.name}</h4>
                        <p className="text-gray-400 text-sm">{product.description}</p>
                        <p className="text-lg font-semibold" style={{ color: store.accentColor }}>
                          R$ {parseFloat(product.price).toFixed(2)}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => deleteProductMutation.mutate({ id: product.id })}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Coupons Tab */}
          <TabsContent value="coupons" className="space-y-6">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Plus size={20} />
                  Novo Cupom
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-gray-300">Código</Label>
                  <Input
                    value={couponForm.code}
                    onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value.toUpperCase() })}
                    className="bg-gray-700 border-gray-600 text-white"
                    placeholder="EX: DESCONTO10"
                  />
                </div>
                <div>
                  <Label className="text-gray-300">Percentual de Desconto (%)</Label>
                  <Input
                    type="number"
                    min="1"
                    max="100"
                    value={couponForm.discountPercentage}
                    onChange={(e) => setCouponForm({ ...couponForm, discountPercentage: e.target.value })}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
                <div>
                  <Label className="text-gray-300">Máximo de Usos (opcional)</Label>
                  <Input
                    type="number"
                    value={couponForm.maxUses}
                    onChange={(e) => setCouponForm({ ...couponForm, maxUses: e.target.value })}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
                <Button
                  onClick={handleCreateCoupon}
                  disabled={createCouponMutation.isPending}
                  className="w-full bg-purple-600 hover:bg-purple-700"
                >
                  {createCouponMutation.isPending ? "Criando..." : "Criar Cupom"}
                </Button>
              </CardContent>
            </Card>

            {/* Coupons List */}
            <div className="space-y-3">
              <h3 className="text-xl font-bold">Cupons Cadastrados</h3>
              {(couponsQuery.data || []).map((coupon) => (
                <Card key={coupon.id} className="bg-gray-800 border-gray-700">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-bold">{coupon.code}</h4>
                        <p className="text-gray-400 text-sm">
                          {coupon.discountPercentage}% de desconto
                          {coupon.maxUses && ` • Máx: ${coupon.maxUses} usos (${coupon.currentUses} usados)`}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => deleteCouponMutation.mutate({ id: coupon.id })}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders" className="space-y-6">
            <div className="space-y-3">
              <h3 className="text-xl font-bold">Pedidos Recentes</h3>
              {(ordersQuery.data || []).length === 0 ? (
                <p className="text-gray-400">Nenhum pedido ainda</p>
              ) : (
                (ordersQuery.data || []).map((order) => (
                  <Card key={order.id} className="bg-gray-800 border-gray-700">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-bold">Pedido #{order.id.toString().padStart(4, "0")}</h4>
                          <p className="text-gray-400 text-sm">{new Date(order.createdAt).toLocaleDateString("pt-BR")}</p>
                          <p className="text-lg font-semibold" style={{ color: store.accentColor }}>
                            R$ {parseFloat(order.total).toFixed(2)}
                          </p>
                        </div>
                        <span className={order.status === "completed" ? "text-green-400 font-bold" : "text-yellow-400 font-bold"}>
                          {order.status === "completed" ? "✓ Concluído" : "⏳ Pendente"}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
