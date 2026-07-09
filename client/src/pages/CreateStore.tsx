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

export default function CreateStore() {
  const { isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    accentColor: "#3B82F6",
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
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
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

            <div>
              <Label htmlFor="slug" className="text-gray-300">
                URL da Loja *
              </Label>
              <div className="flex items-center">
                <span className="text-gray-400 mr-2">motastorehub.com/</span>
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
              <p className="text-xs text-gray-400 mt-1">Apenas letras minúsculas, números e hífens</p>
            </div>

            <div>
              <Label htmlFor="accentColor" className="text-gray-300">
                Cor de Destaque
              </Label>
              <div className="flex items-center gap-2">
                <input
                  id="accentColor"
                  name="accentColor"
                  type="color"
                  value={formData.accentColor}
                  onChange={handleChange}
                  className="w-12 h-10 rounded cursor-pointer"
                />
                <Input
                  type="text"
                  value={formData.accentColor}
                  onChange={handleChange}
                  className="bg-gray-700 border-gray-600 text-white"
                  placeholder="#3B82F6"
                />
              </div>
            </div>

            <div>
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
              <p className="text-xs text-gray-400 mt-1">Para receber notificações de pedidos</p>
            </div>

            <Button
              type="submit"
              disabled={createStoreMutation.isPending}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold"
            >
              {createStoreMutation.isPending ? "Criando..." : "Criar Loja"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
