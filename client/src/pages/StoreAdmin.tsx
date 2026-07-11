import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { useState, useRef } from "react";
import { toast } from "sonner";
import { Trash2, Edit2, Plus, Image as ImageIcon, Save, X, Settings, Upload, Loader2 } from "lucide-react";

interface StoreAdminProps {
  params: { slug: string };
}

export default function StoreAdmin({ params }: StoreAdminProps) {
  const { slug } = params;
  const { isAuthenticated, user } = useAuth();
  const [, navigate] = useLocation();
  const fileInputRef = useRef<HTMLInputElement>(null);

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
  const [productForm, setProductForm] = useState({ 
    id: null as number | null,
    name: "", 
    description: "", 
    price: "", 
    imageUrl: "",
    benefits: "" 
  });
  const [couponForm, setCouponForm] = useState({ code: "", discountPercentage: "", maxUses: "" });
  const [storeForm, setStoreForm] = useState({ description: "", homeContent: "" });
  const [isUploading, setIsUploading] = useState(false);

  // Initialize store form when data loads
  useState(() => {
    if (storeQuery.data) {
      setStoreForm({
        description: storeQuery.data.description || "",
        homeContent: storeQuery.data.homeContent || ""
      });
    }
  });

  // Mutations
  const createProductMutation = trpc.products.create.useMutation({
    onSuccess: () => {
      toast.success("Produto criado!");
      resetProductForm();
      productsQuery.refetch();
    },
    onError: (error) => toast.error(error.message),
  });

  const updateProductMutation = trpc.products.update.useMutation({
    onSuccess: () => {
      toast.success("Produto atualizado!");
      resetProductForm();
      productsQuery.refetch();
    },
    onError: (error) => toast.error(error.message),
  });

  const deleteProductMutation = trpc.products.delete.useMutation({
    onSuccess: () => {
      toast.success("Produto deletado!");
      productsQuery.refetch();
    },
  });

  const updateStoreMutation = trpc.stores.update.useMutation({
    onSuccess: () => {
      toast.success("Configurações da loja salvas!");
      storeQuery.refetch();
    },
    onError: (error) => toast.error(error.message),
  });

  const createCouponMutation = trpc.coupons.create.useMutation({
    onSuccess: () => {
      toast.success("Cupom criado!");
      setCouponForm({ code: "", discountPercentage: "", maxUses: "" });
      couponsQuery.refetch();
    },
    onError: (error) => toast.error(error.message),
  });

  const deleteCouponMutation = trpc.coupons.delete.useMutation({
    onSuccess: () => {
      toast.success("Cupom deletado!");
      couponsQuery.refetch();
    },
  });

  const addBalanceMutation = trpc.wallets.addBalance.useMutation({
    onSuccess: () => {
      toast.success("Saldo adicionado com sucesso!");
      (document.getElementById("customer-email") as HTMLInputElement).value = "";
      (document.getElementById("customer-amount") as HTMLInputElement).value = "";
      (document.getElementById("customer-note") as HTMLInputElement).value = "";
    },
    onError: (error) => toast.error(error.message),
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

  const resetProductForm = () => {
    setProductForm({ id: null, name: "", description: "", price: "", imageUrl: "", benefits: "" });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Por favor, selecione apenas imagens.");
      return;
    }

    setIsUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64Data = reader.result as string;
        
        const response = await fetch("/api/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fileName: file.name,
            fileType: file.type,
            base64Data: base64Data
          })
        });

        if (!response.ok) throw new Error("Falha no upload");

        const data = await response.json();
        setProductForm({ ...productForm, imageUrl: data.url });
        toast.success("Foto carregada com sucesso!");
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error(error);
      toast.error("Erro ao subir a foto.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveProduct = () => {
    if (!productForm.name || !productForm.price) {
      toast.error("Preencha nome e preço");
      return;
    }

    const data = {
      name: productForm.name,
      description: productForm.description,
      price: productForm.price,
      imageUrl: productForm.imageUrl,
      benefits: productForm.benefits ? productForm.benefits.split(",").map((b) => b.trim()) : [],
    };

    if (productForm.id) {
      updateProductMutation.mutate({ id: productForm.id, ...data });
    } else {
      createProductMutation.mutate({ storeId: store.id, ...data });
    }
  };

  const handleEditProduct = (product: any) => {
    setProductForm({
      id: product.id,
      name: product.name,
      description: product.description || "",
      price: product.price.toString(),
      imageUrl: product.imageUrl || "",
      benefits: product.benefits ? product.benefits.join(", ") : "",
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSaveStore = () => {
    updateStoreMutation.mutate({
      id: store.id,
      description: storeForm.description,
      homeContent: storeForm.homeContent,
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
        <div className="flex items-center justify-between bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-lg">
          <div>
            <h1 className="text-3xl font-bold text-purple-400">{store.name}</h1>
            <p className="text-gray-400">Painel de Gerenciamento</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => navigate(`/${slug}`)} variant="outline" className="border-gray-600 hover:bg-gray-700">
              Ver Loja
            </Button>
            <Button onClick={() => navigate("/my-stores")} variant="secondary">
              Minhas Lojas
            </Button>
          </div>
        </div>

        <Tabs defaultValue="products" className="w-full">
          <TabsList className="bg-gray-800 border-gray-700 p-1 mb-6">
            <TabsTrigger value="products" className="data-[state=active]:bg-purple-600">Produtos</TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-purple-600">Personalizar Site</TabsTrigger>
            <TabsTrigger value="coupons" className="data-[state=active]:bg-purple-600">Cupons</TabsTrigger>
            <TabsTrigger value="orders" className="data-[state=active]:bg-purple-600">Pedidos</TabsTrigger>
            <TabsTrigger value="customers" className="data-[state=active]:bg-purple-600">Clientes & Saldo</TabsTrigger>
          </TabsList>

          {/* Products Tab */}
          <TabsContent value="products" className="space-y-6">
            <Card className="bg-gray-800 border-gray-700 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  {productForm.id ? <Edit2 size={20} className="text-yellow-400" /> : <Plus size={20} className="text-green-400" />}
                  {productForm.id ? "Editar Produto" : "Novo Produto"}
                </CardTitle>
                <CardDescription>Preencha os dados abaixo para {productForm.id ? "atualizar o" : "criar um novo"} produto.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-gray-300">Nome do Produto</Label>
                    <Input
                      value={productForm.name}
                      onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                      placeholder="Ex: 1000 Créditos"
                      className="bg-gray-700 border-gray-600 text-white focus:ring-purple-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-300">Preço (R$)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={productForm.price}
                      onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                      placeholder="0.00"
                      className="bg-gray-700 border-gray-600 text-white focus:ring-purple-500"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-gray-300">Foto do Produto</Label>
                  <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                    {productForm.imageUrl && (
                      <div className="w-24 h-24 rounded-lg overflow-hidden border border-gray-600 bg-gray-700">
                        <img src={productForm.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="flex-1 w-full space-y-2">
                      <div className="flex gap-2">
                        <Input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          ref={fileInputRef}
                          onChange={handleFileUpload}
                        />
                        <Button
                          type="button"
                          variant="secondary"
                          className="w-full bg-gray-700 hover:bg-gray-600 border-dashed border-2 border-gray-500"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={isUploading}
                        >
                          {isUploading ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <Upload className="mr-2 h-4 w-4" />
                          )}
                          {productForm.imageUrl ? "Trocar Foto" : "Selecionar do Dispositivo"}
                        </Button>
                      </div>
                      <div className="relative">
                        <ImageIcon className="absolute left-3 top-3 text-gray-500" size={18} />
                        <Input
                          value={productForm.imageUrl}
                          onChange={(e) => setProductForm({ ...productForm, imageUrl: e.target.value })}
                          placeholder="Ou cole o link da imagem aqui"
                          className="bg-gray-700 border-gray-600 text-white pl-10 focus:ring-purple-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-300">Descrição Curta</Label>
                  <Input
                    value={productForm.description}
                    onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                    placeholder="Uma breve descrição do que o cliente está comprando"
                    className="bg-gray-700 border-gray-600 text-white focus:ring-purple-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-300">Benefícios (separados por vírgula)</Label>
                  <Textarea
                    value={productForm.benefits}
                    onChange={(e) => setProductForm({ ...productForm, benefits: e.target.value })}
                    placeholder="Ex: Entrega Instantânea, Bônus de 10%, Suporte VIP"
                    className="bg-gray-700 border-gray-600 text-white focus:ring-purple-500 min-h-[80px]"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    onClick={handleSaveProduct}
                    disabled={createProductMutation.isPending || updateProductMutation.isPending || isUploading}
                    className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-bold"
                  >
                    <Save className="mr-2 h-4 w-4" />
                    {productForm.id ? "Salvar Alterações" : "Criar Produto"}
                  </Button>
                  {productForm.id && (
                    <Button onClick={resetProductForm} variant="outline" className="border-gray-600">
                      <X className="mr-2 h-4 w-4" />
                      Cancelar
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Products List */}
            <div className="space-y-4">
              <h3 className="text-2xl font-bold flex items-center gap-2">
                <Settings size={24} className="text-purple-400" />
                Produtos Cadastrados
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(productsQuery.data || []).map((product) => (
                  <Card key={product.id} className="bg-gray-800 border-gray-700 overflow-hidden group hover:border-purple-500/50 transition-all">
                    <CardContent className="p-0">
                      <div className="flex h-full">
                        <div className="w-24 sm:w-32 bg-gray-700 flex-shrink-0 relative">
                          <img 
                            src={product.imageUrl || "https://placehold.co/400x400/2d3748/a0aec0?text=Sem+Foto"} 
                            alt={product.name} 
                            className="w-full h-full object-cover"
                            onError={(e) => (e.currentTarget.src = "https://placehold.co/400x400/2d3748/a0aec0?text=Sem+Foto")}
                          />
                        </div>
                        <div className="flex-1 p-4 flex flex-col justify-between">
                          <div>
                            <h4 className="font-bold text-lg text-white group-hover:text-purple-300 transition-colors">{product.name}</h4>
                            <p className="text-gray-400 text-sm line-clamp-2">{product.description}</p>
                            <p className="text-xl font-bold mt-2" style={{ color: store.accentColor }}>
                              R$ {parseFloat(product.price).toFixed(2)}
                            </p>
                          </div>
                          <div className="flex gap-2 mt-4">
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => handleEditProduct(product)}
                              className="bg-gray-700 hover:bg-gray-600 flex-1"
                            >
                              <Edit2 size={14} className="mr-1" /> Editar
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => deleteProductMutation.mutate({ id: product.id })}
                              className="px-3"
                            >
                              <Trash2 size={14} />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card className="bg-gray-800 border-gray-700 shadow-xl">
              <CardHeader>
                <CardTitle className="text-white">Personalizar sua Loja</CardTitle>
                <CardDescription>Adicione textos e informações que aparecerão no seu site.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-gray-300">Slogan / Descrição Curta (Abaixo do nome da loja)</Label>
                  <Input
                    value={storeForm.description}
                    onChange={(e) => setStoreForm({ ...storeForm, description: e.target.value })}
                    placeholder="Ex: A melhor loja de créditos do servidor!"
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-300">Conteúdo em Destaque na Home</Label>
                  <Textarea
                    value={storeForm.homeContent}
                    onChange={(e) => setStoreForm({ ...storeForm, homeContent: e.target.value })}
                    placeholder="Escreva aqui um texto que aparecerá na página inicial da sua loja. Você pode explicar como comprar, regras da loja ou promoções."
                    className="bg-gray-700 border-gray-600 text-white min-h-[200px]"
                  />
                  <p className="text-xs text-gray-500 italic">Dica: Esse texto ajuda a passar confiança para os seus clientes.</p>
                </div>

                <Button
                  onClick={handleSaveStore}
                  disabled={updateStoreMutation.isPending}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-6"
                >
                  <Save className="mr-2 h-5 w-5" />
                  Salvar Configurações do Site
                </Button>
              </CardContent>
            </Card>
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

          {/* Customers Tab */}
          <TabsContent value="customers" className="space-y-6">
            <Card className="bg-gray-800 border-gray-700 shadow-xl">
              <CardHeader>
                <CardTitle className="text-white">Adicionar Saldo ao Cliente</CardTitle>
                <CardDescription>Use esta ferramenta após receber o Pix do seu cliente.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-gray-300">E-mail do Cliente</Label>
                  <Input
                    placeholder="cliente@email.com"
                    className="bg-gray-700 border-gray-600 text-white"
                    id="customer-email"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-300">Valor em Créditos (R$)</Label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    className="bg-gray-700 border-gray-600 text-white"
                    id="customer-amount"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-300">Observação (Opcional)</Label>
                  <Input
                    placeholder="Ex: Pagamento via Pix"
                    className="bg-gray-700 border-gray-600 text-white"
                    id="customer-note"
                  />
                </div>
                <Button
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-bold"
                  onClick={() => {
                    const email = (document.getElementById("customer-email") as HTMLInputElement).value;
                    const amount = (document.getElementById("customer-amount") as HTMLInputElement).value;
                    const note = (document.getElementById("customer-note") as HTMLInputElement).value;
                    
                    if (!email || !amount) {
                      toast.error("Preencha o e-mail e o valor.");
                      return;
                    }
                    
                    addBalanceMutation.mutate({
                      storeId: store.id,
                      email,
                      amount,
                      description: note
                    });
                  }}
                >
                  Confirmar Depósito de Créditos
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders" className="space-y-6">
            <div className="space-y-3">
              <h3 className="text-xl font-bold">Pedidos Recentes</h3>
              {(ordersQuery.data || []).length === 0 ? (
                <div className="text-center py-20 bg-gray-800 rounded-xl border border-gray-700">
                  <p className="text-gray-400">Nenhum pedido ainda</p>
                </div>
              ) : (
                (ordersQuery.data || []).map((order) => (
                  <Card key={order.id} className="bg-gray-800 border-gray-700 hover:border-gray-600 transition-all">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-bold">Pedido #{order.id.toString().padStart(4, "0")}</h4>
                          <p className="text-gray-400 text-sm">{new Date(order.createdAt).toLocaleDateString("pt-BR")}</p>
                          <p className="text-lg font-semibold" style={{ color: store.accentColor }}>
                            R$ {parseFloat(order.total).toFixed(2)}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className={order.status === "completed" ? "text-green-400 font-bold" : "text-yellow-400 font-bold"}>
                            {order.status === "completed" ? "✓ Concluído" : "⏳ Pendente"}
                          </span>
                          <p className="text-xs text-gray-500 mt-1">Status do Pagamento</p>
                        </div>
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
