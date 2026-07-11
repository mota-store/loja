import { useAuth } from "@/_core/hooks/useAuth";
import { startLogin } from "@/const";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { User, LayoutDashboard, PlusCircle, LogOut, Zap, Shield, Smartphone, Layout, Store, ArrowRight } from "lucide-react";
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
    <div className="min-h-screen flex flex-col bg-gray-950 text-white selection:bg-purple-500/30">
      {/* Navigation Header */}
      <header className="fixed top-0 z-50 w-full border-b border-white/5 bg-gray-950/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/">
              <div className="flex items-center gap-3 cursor-pointer group">
                <img src="/logo.png" alt="Mota Hub Logo" className="w-10 h-10 rounded-lg shadow-lg shadow-purple-500/20 group-hover:scale-110 transition-transform duration-300" />
                <span className="text-xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">MOTA HUB</span>
              </div>
            </Link>
            
            <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-400">
              <a href="#features" onClick={(e) => { e.preventDefault(); scrollToFeatures(); }} className="hover:text-white transition-colors">Recursos</a>
              <a href="#" className="hover:text-white transition-colors">Preços</a>
              <a href="#" className="hover:text-white transition-colors">Suporte</a>
            </nav>

            <div className="flex items-center gap-4">
              {isAuthenticated ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full border border-white/10 hover:bg-white/5">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-purple-900 text-purple-100 font-bold">
                          {user?.name?.charAt(0).toUpperCase() || <User size={20} />}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56 bg-gray-900 border-white/10 text-white" align="end">
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{user?.name}</p>
                        <p className="text-xs leading-none text-gray-400">{user?.email}</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-white/5" />
                    <Link href="/my-stores">
                      <DropdownMenuItem className="cursor-pointer hover:bg-white/5 focus:bg-white/5">
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        <span>Minhas Lojas</span>
                      </DropdownMenuItem>
                    </Link>
                    <Link href="/create-store">
                      <DropdownMenuItem className="cursor-pointer hover:bg-white/5 focus:bg-white/5">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        <span>Criar Nova Loja</span>
                      </DropdownMenuItem>
                    </Link>
                    <DropdownMenuSeparator className="bg-white/5" />
                    <DropdownMenuItem 
                      onClick={() => logout()}
                      className="cursor-pointer text-red-400 hover:bg-white/5 focus:bg-white/5"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Sair</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button 
                  onClick={() => startLogin()}
                  className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-6 rounded-full shadow-lg shadow-purple-600/20"
                >
                  Começar Agora
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden flex-1 flex flex-col justify-center">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(147,51,234,0.15),transparent_50%)] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-bold mb-8">
            <Zap size={14} />
            <span>NOVA VERSÃO 2.0 DISPONÍVEL</span>
          </div>
          
          <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black tracking-tight mb-8 bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-500 leading-none">
            Mota Hub
          </h1>
          
          <p className="max-w-2xl mx-auto text-lg sm:text-xl text-gray-400 mb-12 leading-relaxed">
            Crie sua própria loja de créditos online em minutos. Personalize, gerencie produtos, cupons e pedidos, tudo em um só lugar.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button 
              size="lg" 
              onClick={() => isAuthenticated ? (window.location.href = "/my-stores") : startLogin()}
              className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700 text-white font-black text-lg px-10 py-8 rounded-2xl shadow-2xl shadow-purple-600/30 group"
            >
              Criar Minha Loja
              <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={scrollToFeatures}
              className="w-full sm:w-auto border-white/10 hover:bg-white/5 text-white font-bold text-lg px-10 py-8 rounded-2xl"
            >
              Saiba Mais
            </Button>
          </div>

          {/* Floating Stats */}
          <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto opacity-50">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
              <div className="text-2xl font-black">100%</div>
              <div className="text-xs text-gray-500 uppercase tracking-widest">Seguro</div>
            </div>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
              <div className="text-2xl font-black">24/7</div>
              <div className="text-xs text-gray-500 uppercase tracking-widest">Online</div>
            </div>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
              <div className="text-2xl font-black">0.1s</div>
              <div className="text-xs text-gray-500 uppercase tracking-widest">Latência</div>
            </div>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
              <div className="text-2xl font-black">PIX</div>
              <div className="text-xs text-gray-500 uppercase tracking-widest">Pagamento</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-gray-900/50 relative border-y border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-black mb-4 text-purple-400">Recursos Incríveis</h2>
            <p className="text-gray-400">Tudo o que você precisa para escalar suas vendas.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Layout className="text-purple-500" />}
              title="Lojas Personalizadas"
              description="Cada loja com sua identidade visual, cores e produtos únicos. Seu site, suas regras."
            />
            <FeatureCard 
              icon={<Store className="text-blue-500" />}
              title="Gestão Completa"
              description="Gerencie produtos, cupons, pedidos e clientes de forma intuitiva."
            />
            <FeatureCard 
              icon={<Shield className="text-green-500" />}
              title="Segurança Máxima"
              description="Autenticação via Google e sistema de carteira protegida para seus clientes."
            />
            <FeatureCard 
              icon={<Zap className="text-yellow-500" />}
              title="Performance"
              description="Site ultra-rápido otimizado para conversão em qualquer dispositivo."
            />
            <FeatureCard 
              icon={<Smartphone className="text-pink-500" />}
              title="Mobile First"
              description="Experiência de compra perfeita no celular para seus clientes."
            />
            <FeatureCard 
              icon={<LayoutDashboard className="text-indigo-500" />}
              title="Painel de Lojista"
              description="Dashboard exclusivo para gerenciar suas vendas e saldo de clientes."
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-white/5 bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <img src="/logo.png" alt="Mota Hub Logo" className="w-8 h-8 rounded shadow-lg" />
            <span className="font-black tracking-tighter">MOTA HUB</span>
          </div>
          <p className="text-gray-500 text-sm">© 2026 Mota Hub. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="bg-gray-800/50 border border-white/5 p-8 rounded-3xl hover:border-purple-500/30 transition-all duration-300 group hover:-translate-y-1">
      <div className="w-12 h-12 rounded-2xl bg-gray-900 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-xl">
        {icon}
      </div>
      <h3 className="text-white text-xl font-bold mb-3">{title}</h3>
      <p className="text-gray-400 leading-relaxed">{description}</p>
    </div>
  );
}
