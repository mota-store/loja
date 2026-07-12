import { useAuth } from "@/_core/hooks/useAuth";
import { startLogin } from "@/const";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { useLocation, Link } from "wouter";
import { useState } from "react";
import { toast } from "sonner";
import { HexColorPicker } from "react-colorful";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Loader2, ArrowLeft, Store, Sparkles } from "lucide-react";

export default function CreateStore() {
  const { isAuthenticated, loading } = useAuth();
  const [, navigate] = useLocation();
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    accentColor: "#9333ea",
    whatsappNumber: "",
  });

  const createStoreMutation = trpc.stores.create.useMutation({
    onSuccess: (result) => {
      toast.success("Loja criada com sucesso!");
      navigate(`/${formData.slug}/admin`);
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao criar loja");
    },
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-purple-500 animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-gray-900 border-white/5 rounded-3xl overflow-hidden shadow-2xl">
          <CardHeader className="text-center pt-10">
            <div className="mx-auto w-16 h-16 bg-purple-500/10 rounded-3xl flex items-center justify-center mb-4">
              <Store className="text-purple-500" size={32} />
            </div>
            <CardTitle className="text-2xl font-black text-white">Acesso Necessário</CardTitle>
            <CardDescription className="text-gray-400">
              Você precisa estar logado para criar e gerenciar suas lojas.
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-10 flex flex-col gap-4">
            <Button 
              onClick={() => startLogin()} 
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-6 rounded-2xl"
            >
              Fazer Login
            </Button>
            <Link href="/">
              <Button variant="ghost" className="w-full text-gray-400 hover:text-white hover:bg-white/5 rounded-2xl">
                Voltar para Início
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === "name") {
      const slug = value
        .toLowerCase()
        .trim()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "");
      setFormData((prev) => ({
        ...prev,
        slug,
      }));
    }
  };

  const handleColorChange = (color: string) => {
    setFormData((prev) => ({
      ...prev,
      accentColor: color,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.slug || !formData.whatsappNumber) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    createStoreMutation.mutate({
      name: formData.name,
      slug: formData.slug,
      accentColor: formData.accentColor,
      whatsappNumber: formData.whatsappNumber,
    });
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white p-4">
      <div className="max-w-2xl mx-auto space-y-8 py-10">
        <div className="flex items-center gap-4">
          <Link href="/my-stores">
            <Button variant="ghost" size="icon" className="rounded-full hover:bg-white/5 text-gray-400 hover:text-white">
              <ArrowLeft className="h-6 w-6" />
            </Button>
          </Link>
          <h1 className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-500 tracking-tighter">
            Criar Minha Loja
          </h1>
        </div>

        <Card className="bg-gray-900 border-white/5 rounded-3xl shadow-2xl overflow-hidden">
          <div className="h-2 w-full bg-gradient-to-r from-purple-600 to-pink-600" />
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Sparkles className="text-purple-500" size={20} />
              Detalhes da Loja
            </CardTitle>
            <CardDescription className="text-gray-500">
              Configure sua loja e comece a vender em minutos.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-gray-300 font-bold">Nome da Loja *</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Ex: Minha Loja"
                  className="bg-white/5 border-white/10 text-white rounded-xl py-6 focus:ring-purple-500"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug" className="text-gray-300 font-bold">URL da Loja *</Label>
                <div className="flex items-center bg-white/5 border border-white/10 rounded-xl px-4 focus-within:ring-2 focus-within:ring-purple-500">
                  <span className="text-gray-500 text-sm font-mono truncate">{window.location.host}/</span>
                  <Input
                    id="slug"
                    name="slug"
                    value={formData.slug}
                    onChange={handleChange}
                    placeholder="minha-loja"
                    className="bg-transparent border-none text-white py-6 focus:ring-0 pl-1"
                    required
                  />
                </div>
                <p className="text-xs text-gray-500">Apenas letras minúsculas, números e hífens.</p>
              </div>

              <div className="space-y-2">
                <Label className="text-gray-300 font-bold block">Cor de Destaque</Label>
                <div className="flex items-center gap-4">
                  <Popover>
                    <PopoverTrigger asChild>
                      <button 
                        type="button"
                        className="w-16 h-16 rounded-2xl border-2 border-white/10 shadow-lg transition-transform hover:scale-105"
                        style={{ backgroundColor: formData.accentColor }}
                      />
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-3 bg-gray-900 border-white/10 rounded-2xl">
                      <HexColorPicker color={formData.accentColor} onChange={handleColorChange} />
                      <div className="mt-3 flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: formData.accentColor }} />
                        <span className="text-xs font-mono text-gray-400 uppercase">{formData.accentColor}</span>
                      </div>
                    </PopoverContent>
                  </Popover>
                  <div className="flex-1">
                    <Input
                      type="text"
                      value={formData.accentColor}
                      onChange={(e) => handleColorChange(e.target.value)}
                      className="bg-white/5 border-white/10 text-white font-mono uppercase rounded-xl py-6"
                      placeholder="#9333EA"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="whatsappNumber" className="text-gray-300 font-bold">WhatsApp para Vendas *</Label>
                <Input
                  id="whatsappNumber"
                  name="whatsappNumber"
                  value={formData.whatsappNumber}
                  onChange={handleChange}
                  placeholder="5591984886473"
                  className="bg-white/5 border-white/10 text-white rounded-xl py-6 focus:ring-purple-500"
                  required
                />
                <p className="text-xs text-gray-500">Com DDD, apenas números. Ex: 5591984886473</p>
              </div>

              <Button
                type="submit"
                disabled={createStoreMutation.isPending}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-black py-8 rounded-2xl text-lg shadow-xl shadow-purple-600/20 transition-all hover:scale-[1.02]"
              >
                {createStoreMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Criando seu site...
                  </>
                ) : (
                  "Lançar Minha Loja Agora"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
