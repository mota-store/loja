import { useAuth } from "@/_core/hooks/useAuth";
import { startLogin } from "@/const";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { useState } from "react";
import { toast } from "sonner";
import { HexColorPicker } from "react-colorful";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export default function CreateStore() {
  const { isAuthenticated } = useAuth();
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
      navigate(`/${formData.slug}`);
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao criar loja");
    },
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-black p-4">
        <Card className="w-full max-w-md bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Acesso Necessário</CardTitle>
            <CardDescription>Você precisa fazer login para criar uma loja.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => startLogin()} className="w-full bg-purple-600 hover:bg-purple-700">
              Fazer Login
            </Button>
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

    // Auto-generate slug from name
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

    if (!/^#[0-9A-F]{6}$/i.test(formData.accentColor)) {
      toast.error("Cor inválida. Use o formato #RRGGBB");
      return;
    }

    if (!/^[a-z0-9-]+$/.test(formData.slug)) {
      toast.error("Slug deve conter apenas letras minúsculas, números e hífens");
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-black p-4">
      <Card className="w-full max-w-md bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Criar Nova Loja</CardTitle>
          <CardDescription>Configure sua loja e comece a vender</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-gray-300">
                Nome da Loja *
              </Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Ex: Minha Loja"
                className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug" className="text-gray-300">
                URL da Loja *
              </Label>
              <div className="flex items-center">
                <span className="text-gray-400 mr-2 text-sm truncate">motastorehub.com/</span>
                <Input
                  id="slug"
                  name="slug"
                  value={formData.slug}
                  onChange={handleChange}
                  placeholder="minha-loja"
                  className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                  required
                />
              </div>
              <p className="text-xs text-gray-400">Apenas letras minúsculas, números e hífens</p>
            </div>

            <div className="space-y-2">
              <Label className="text-gray-300 block">Cor de Destaque</Label>
              <div className="flex items-center gap-4">
                <Popover>
                  <PopoverTrigger asChild>
                    <button 
                      type="button"
                      className="w-12 h-12 rounded-full border-2 border-gray-600 shadow-inner transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      style={{ backgroundColor: formData.accentColor }}
                    />
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-3 bg-gray-800 border-gray-700">
                    <HexColorPicker color={formData.accentColor} onChange={handleColorChange} />
                    <div className="mt-3 flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full border border-gray-600" style={{ backgroundColor: formData.accentColor }} />
                      <span className="text-xs font-mono text-gray-300 uppercase">{formData.accentColor}</span>
                    </div>
                  </PopoverContent>
                </Popover>
                <div className="flex-1">
                  <Input
                    type="text"
                    value={formData.accentColor}
                    onChange={(e) => handleColorChange(e.target.value)}
                    className="bg-gray-700 border-gray-600 text-white font-mono uppercase"
                    placeholder="#9333EA"
                  />
                </div>
              </div>
              <p className="text-xs text-gray-400">Clique no círculo para escolher a cor visualmente</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="whatsappNumber" className="text-gray-300">
                Número do WhatsApp *
              </Label>
              <Input
                id="whatsappNumber"
                name="whatsappNumber"
                value={formData.whatsappNumber}
                onChange={handleChange}
                placeholder="5591984886473"
                className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                required
              />
              <p className="text-xs text-gray-400">Para receber notificações de pedidos</p>
            </div>

            <Button
              type="submit"
              disabled={createStoreMutation.isPending}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-6 text-lg transition-all"
            >
              {createStoreMutation.isPending ? "Criando..." : "Criar Loja"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
