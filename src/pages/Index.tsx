import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Home, Cpu, Zap, Settings, ArrowRight, Sparkles, ArrowLeft, BookOpen } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useFirebaseAuth } from '@/hooks/useFirebaseAuth';
import { FloatingCubes } from '@/components/home/FloatingCubes';
import { ESP32Icon, RaspberryPiIcon, FirebaseIcon, CircuitIcon, WiFiIcon } from '@/components/home/IoTIcons';
import { DocumentationTabs } from '@/components/home/DocumentationTabs';

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
  const [showDocs, setShowDocs] = useState(false);

  const loading = supabaseLoading || firebaseLoading;
  const user = supabaseUser || firebaseUser;

  useEffect(() => {
    if (!loading && user) {
      navigate('/dashboard');
    }
  }, [user, loading, navigate]);

  if (showDocs) {
    return (
      <div className="min-h-screen bg-background">
        {/* 3D Background Effects */}
        <FloatingCubes />
        
        {/* Grid pattern overlay */}
        <div className="fixed inset-0 pointer-events-none opacity-[0.02]"
          style={{
            backgroundImage: `
              linear-gradient(to right, currentColor 1px, transparent 1px),
              linear-gradient(to bottom, currentColor 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px'
          }}
        />

        <div className="relative z-10">
          {/* Header */}
          <div className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <Button
                variant="ghost"
                onClick={() => setShowDocs(false)}
                className="gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Home
              </Button>
            </div>
          </div>

          {/* Documentation Content */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">Documentation</h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Learn how to integrate your IoT devices with our smart home platform.
              </p>
            </div>

            <DocumentationTabs />
          </div>

          {/* Footer */}
          <footer className="border-t border-border/50 py-8 mt-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <p className="text-center text-muted-foreground text-sm">
                Web Developed by <span className="text-primary font-semibold">RT</span>
              </p>
            </div>
          </footer>
        </div>

        {/* Animation styles */}
        <style>{`
          @keyframes float-cube {
            0%, 100% {
              transform: translateY(0) rotateX(0deg) rotateY(0deg);
            }
            25% {
              transform: translateY(-30px) rotateX(90deg) rotateY(45deg);
            }
            50% {
              transform: translateY(-10px) rotateX(180deg) rotateY(90deg);
            }
            75% {
              transform: translateY(-40px) rotateX(270deg) rotateY(135deg);
            }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* 3D Background Effects */}
      <FloatingCubes />
      
      {/* Grid pattern overlay */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.02]"
        style={{
          backgroundImage: `
            linear-gradient(to right, currentColor 1px, transparent 1px),
            linear-gradient(to bottom, currentColor 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px'
        }}
      />

      {/* Floating IoT Icons */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[15%] left-[10%] animate-pulse opacity-10">
          <ESP32Icon className="w-16 h-16" />
        </div>
        <div className="absolute top-[25%] right-[15%] animate-pulse opacity-10" style={{ animationDelay: '1s' }}>
          <RaspberryPiIcon className="w-20 h-20" />
        </div>
        <div className="absolute bottom-[30%] left-[20%] animate-pulse opacity-10" style={{ animationDelay: '2s' }}>
          <CircuitIcon className="w-14 h-14" />
        </div>
        <div className="absolute bottom-[20%] right-[10%] animate-pulse opacity-10" style={{ animationDelay: '0.5s' }}>
          <WiFiIcon className="w-18 h-18" />
        </div>
        <div className="absolute top-[60%] left-[5%] animate-pulse opacity-10" style={{ animationDelay: '1.5s' }}>
          <FirebaseIcon className="w-12 h-12" />
        </div>
      </div>

      {/* Hero Section */}
      <div className="relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
          <div className="text-center">
            {/* Logo with IoT elements */}
            <div className="mx-auto w-24 h-24 rounded-2xl bg-foreground/10 flex items-center justify-center mb-8 relative">
              <Home className="w-12 h-12 text-foreground" />
              {/* Orbiting elements */}
              <div className="absolute inset-0 animate-spin" style={{ animationDuration: '20s' }}>
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-foreground/20" />
              </div>
              <div className="absolute inset-0 animate-spin" style={{ animationDuration: '15s', animationDirection: 'reverse' }}>
                <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-foreground/15" />
              </div>
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
              <span>ESP32 • Raspberry Pi • Firebase Ready</span>
            </div>
          </div>
        </div>

        {/* IoT Device Icons Row */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          <div className="flex justify-center items-center gap-8 flex-wrap opacity-40">
            <ESP32Icon className="w-10 h-10" />
            <RaspberryPiIcon className="w-10 h-10" />
            <FirebaseIcon className="w-10 h-10" />
            <CircuitIcon className="w-10 h-10" />
            <WiFiIcon className="w-10 h-10" />
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
                  className="glass rounded-xl p-6 border border-border/50 hover:border-foreground/30 transition-all group bg-card/30 backdrop-blur-sm"
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

        {/* Documentation CTA */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
          <div className="glass rounded-2xl p-8 md:p-12 border border-border/50 bg-card/30 backdrop-blur-sm text-center">
            <BookOpen className="w-12 h-12 mx-auto mb-4 text-foreground/70" />
            <h2 className="text-2xl md:text-3xl font-bold mb-4">View Documentation</h2>
            <p className="text-muted-foreground max-w-xl mx-auto mb-6">
              Learn how to set up ESP32, Raspberry Pi, Firebase, and more with our comprehensive guides.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button
                size="lg"
                variant="outline"
                onClick={() => setShowDocs(true)}
                className="gap-2"
              >
                <ESP32Icon className="w-5 h-5" />
                ESP32 Guide
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => setShowDocs(true)}
                className="gap-2"
              >
                <RaspberryPiIcon className="w-5 h-5" />
                Raspberry Pi Guide
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => setShowDocs(true)}
                className="gap-2"
              >
                <FirebaseIcon className="w-5 h-5" />
                Firebase Guide
              </Button>
            </div>
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

      {/* Animation styles */}
      <style>{`
        @keyframes float-cube {
          0%, 100% {
            transform: translateY(0) rotateX(0deg) rotateY(0deg);
          }
          25% {
            transform: translateY(-30px) rotateX(90deg) rotateY(45deg);
          }
          50% {
            transform: translateY(-10px) rotateX(180deg) rotateY(90deg);
          }
          75% {
            transform: translateY(-40px) rotateX(270deg) rotateY(135deg);
          }
        }
      `}</style>
    </div>
  );
}
