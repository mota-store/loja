import { useAuth } from "@/_core/hooks/useAuth";
import { startLogin } from "@/const";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { User, LayoutDashboard, PlusCircle, LogOut } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function Home() {
  const { isAuthenticated, user, logout } = useAuth();

  const scrollToFeatures = () => {
    const element = document.getElementById("features");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-900 to-black text-white">
      {/* Navigation Header */}
      <header className="w-full py-4 px-6 flex justify-between items-center border-b border-gray-800 bg-black/50 backdrop-blur-md sticky top-0 z-50">
        <Link href="/">
          <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600 cursor-pointer">
            Mota Store
          </h2>
        </Link>
        
        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full border border-gray-700">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-purple-900 text-purple-100">
                      {user?.name?.charAt(0).toUpperCase() || <User size={20} />}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 bg-gray-800 border-gray-700 text-white" align="end">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user?.name}</p>
                    <p className="text-xs leading-none text-gray-400">{user?.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-gray-700" />
                <Link href="/my-stores">
                  <DropdownMenuItem className="cursor-pointer hover:bg-gray-700 focus:bg-gray-700">
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    <span>Minhas Lojas</span>
                  </DropdownMenuItem>
                </Link>
                <Link href="/create-store">
                  <DropdownMenuItem className="cursor-pointer hover:bg-gray-700 focus:bg-gray-700">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    <span>Criar Nova Loja</span>
                  </DropdownMenuItem>
                </Link>
                <DropdownMenuSeparator className="bg-gray-700" />
                <DropdownMenuItem 
                  onClick={() => logout()}
                  className="cursor-pointer text-red-400 hover:bg-gray-700 focus:bg-gray-700"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sair</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              onClick={() => startLogin()}
              className="bg-purple-600 hover:bg-purple-700 text-white text-sm px-4 py-2"
            >
              Entrar
            </Button>
          )}
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="max-w-4xl text-center space-y-8 py-20">
          <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
            Mota Store Hub
          </h1>
          <p className="text-xl text-gray-300 leading-relaxed">
            Crie sua própria loja de créditos online em minutos. Personalize, gerencie produtos, cupons e pedidos, tudo em um só lugar. Comece a vender hoje mesmo!
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {isAuthenticated ? (
              <Link href="/create-store">
                <Button className="px-8 py-6 text-lg font-semibold bg-purple-600 hover:bg-purple-700 transition-all duration-300 shadow-lg hover:scale-105">
                  Criar Minha Loja
                </Button>
              </Link>
            ) : (
              <Button
                onClick={() => startLogin()}
                className="px-8 py-6 text-lg font-semibold bg-purple-600 hover:bg-purple-700 transition-all duration-300 shadow-lg hover:scale-105"
              >
                Começar Agora
              </Button>
            )}
            <Button 
              variant="outline" 
              onClick={scrollToFeatures}
              className="px-8 py-6 text-lg font-semibold border-2 border-purple-500 text-purple-300 hover:bg-purple-900/30 transition-all duration-300"
            >
              Saiba Mais
            </Button>
          </div>
        </div>

        <section id="features" className="mt-20 w-full max-w-5xl py-20">
          <h2 className="text-4xl font-bold text-center text-purple-400 mb-12">Recursos Incríveis</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              title="Lojas Personalizadas"
              description="Cada loja com sua identidade visual, cores e produtos únicos."
            />
            <FeatureCard
              title="Gestão Completa"
              description="Gerencie produtos, cupons, pedidos e clientes de forma intuitiva."
            />
            <FeatureCard
              title="Roteamento Dinâmico"
              description="URLs amigáveis para suas lojas: motastorehub.com/sua-loja."
            />
            <FeatureCard
              title="Sistema de Carteira"
              description="Clientes compram com saldo, facilitando transações e fidelização."
            />
            <FeatureCard
              title="Cupons de Desconto"
              description="Crie e gerencie cupons para atrair e reter seus clientes."
            />
            <FeatureCard
              title="Pedidos via WhatsApp"
              description="Notificações automáticas para o lojista a cada novo pedido."
            />
          </div>
        </section>
      </main>

      <footer className="py-10 text-center text-gray-500 text-sm border-t border-gray-800">
        © 2026 Mota Store Hub. Todos os direitos reservados.
      </footer>
    </div>
  );
}

interface FeatureCardProps {
  title: string;
  description: string;
}

function FeatureCard({ title, description }: FeatureCardProps) {
  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 shadow-xl hover:shadow-purple-500/20 transition-all duration-300 border border-gray-700 hover:border-purple-500/50">
      <h3 className="text-2xl font-bold text-purple-300 mb-2">{title}</h3>
      <p className="text-gray-400">{description}</p>
    </div>
  );
}
