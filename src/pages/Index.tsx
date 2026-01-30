import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Home, Cpu, Zap, Settings, ArrowRight, Sparkles } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useFirebaseAuth } from '@/hooks/useFirebaseAuth';

const features = [
  {
    icon: Home,
    title: 'Room Control',
    description: 'Organize devices by room for intuitive control',
  },
  {
    icon: Cpu,
    title: 'Smart Devices',
    description: 'Manage all your IoT devices from one dashboard',
  },
  {
    icon: Zap,
    title: 'Energy Monitoring',
    description: 'Track power consumption in real-time',
  },
  {
    icon: Settings,
    title: 'Automation Rules',
    description: 'Schedule devices to run automatically',
  },
];

export default function Index() {
  const navigate = useNavigate();
  const { user: supabaseUser, loading: supabaseLoading } = useAuth();
  const { user: firebaseUser, loading: firebaseLoading } = useFirebaseAuth();

  const loading = supabaseLoading || firebaseLoading;
  const user = supabaseUser || firebaseUser;

  useEffect(() => {
    if (!loading && user) {
      navigate('/dashboard');
    }
  }, [user, loading, navigate]);

  return (
    <div className="min-h-screen bg-background">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-foreground/5 rounded-full blur-[128px]" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-foreground/5 rounded-full blur-[128px]" />
      </div>

      {/* Hero Section */}
      <div className="relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
          <div className="text-center">
            {/* Logo */}
            <div className="mx-auto w-20 h-20 rounded-2xl bg-foreground/10 flex items-center justify-center mb-8">
              <Home className="w-10 h-10 text-foreground" />
            </div>

            {/* Title */}
            <h1 className="text-5xl md:text-7xl font-bold mb-6 text-foreground">
              SmartHome
            </h1>

            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto mb-8">
              Control your entire home from one futuristic dashboard.
              Automate, monitor, and manage all your IoT devices.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                size="lg"
                onClick={() => navigate('/auth')}
                className="bg-foreground text-background hover:bg-foreground/90 text-lg px-8 py-6 group"
              >
                Get Started
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate('/auth')}
                className="border-foreground/50 text-foreground hover:bg-foreground/10 text-lg px-8 py-6"
              >
                Sign In
              </Button>
            </div>

            {/* Features Badge */}
            <div className="mt-8 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted/50 text-muted-foreground text-sm">
              <Sparkles className="w-4 h-4 text-foreground" />
              <span>Minimalist Design</span>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="glass rounded-xl p-6 border border-border/50 hover:border-foreground/30 transition-all group"
                >
                  <div className="w-12 h-12 rounded-lg bg-foreground/10 flex items-center justify-center mb-4 group-hover:bg-foreground/20 transition-all">
                    <Icon className="w-6 h-6 text-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <footer className="border-t border-border/50 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <p className="text-center text-muted-foreground text-sm">
              Web Developed by <span className="text-primary font-semibold">RT</span>
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
