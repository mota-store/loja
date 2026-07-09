import { useAuth } from "@/_core/hooks/useAuth";
import { startLogin } from "@/const";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function Home() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 to-black text-white p-4">
      <div className="max-w-4xl text-center space-y-8">
        <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
          Mota Store Hub
        </h1>
        <p className="text-xl text-gray-300 leading-relaxed">
          Crie sua própria loja de créditos online em minutos. Personalize, gerencie produtos, cupons e pedidos, tudo em um só lugar. Comece a vender hoje mesmo!
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          {isAuthenticated ? (
            <Link href="/create-store">
              <Button className="px-8 py-4 text-lg font-semibold bg-purple-600 hover:bg-purple-700 transition-colors duration-300 shadow-lg">
                Criar Minha Loja
              </Button>
            </Link>
          ) : (
            <Button
              onClick={() => startLogin()}
              className="px-8 py-4 text-lg font-semibold bg-purple-600 hover:bg-purple-700 transition-colors duration-300 shadow-lg"
            >
              Começar Agora
            </Button>
          )}
          <Link href="#features">
            <Button variant="outline" className="px-8 py-4 text-lg font-semibold border-2 border-purple-500 text-purple-300 hover:bg-purple-900 transition-colors duration-300">
              Saiba Mais
            </Button>
          </Link>
        </div>
      </div>

      <section id="features" className="mt-20 w-full max-w-5xl">
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

      <footer className="mt-20 text-gray-500 text-sm">
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
    <div className="bg-gray-800 rounded-lg p-6 shadow-xl hover:shadow-purple-500/50 transition-shadow duration-300 border border-gray-700">
      <h3 className="text-2xl font-bold text-purple-300 mb-2">{title}</h3>
      <p className="text-gray-400">{description}</p>
    </div>
  );
}
