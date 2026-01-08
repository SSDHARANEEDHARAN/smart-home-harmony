import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Home, Cpu, Zap, Settings, ArrowRight, Sparkles } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

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
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      navigate('/dashboard');
    }
  }, [user, loading, navigate]);

  return (
    <div className="min-h-screen bg-background">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[128px]" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-[128px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent/10 rounded-full blur-[128px]" />
      </div>

      {/* Hero Section */}
      <div className="relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
          <div className="text-center">
            {/* Logo */}
            <div className="mx-auto w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center mb-8 shadow-2xl shadow-primary/25">
              <Home className="w-10 h-10 text-primary-foreground" />
            </div>

            {/* Title */}
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                SmartHome
              </span>
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
                className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-lg px-8 py-6 group"
              >
                Get Started
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate('/auth')}
                className="border-primary/50 text-primary hover:bg-primary/10 text-lg px-8 py-6"
              >
                Sign In
              </Button>
            </div>

            {/* Features Badge */}
            <div className="mt-8 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted/50 text-muted-foreground text-sm">
              <Sparkles className="w-4 h-4 text-primary" />
              <span>Dark & Futuristic Design</span>
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
                  className="glass rounded-xl p-6 border border-border/50 hover:border-primary/30 transition-all group"
                >
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center mb-4 group-hover:from-primary/30 group-hover:to-secondary/30 transition-all">
                    <Icon className="w-6 h-6 text-primary" />
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
