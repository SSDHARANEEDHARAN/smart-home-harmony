import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Home, Cpu, Zap, Settings, ArrowRight, Sparkles, BookOpen, Shield, Cloud, Wifi } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useFirebaseAuth } from '@/hooks/useFirebaseAuth';
import { HexagonBackground } from '@/components/home/HexagonBackground';
import { DocumentationPage } from '@/components/home/DocumentationPage';
import { ESP32Icon, RaspberryPiIcon, FirebaseIcon, RainMakerIcon, ThingSpeakIcon, MQTTIcon } from '@/components/home/IoTIcons';

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

const platforms = [
  { name: 'ESP32', icon: ESP32Icon },
  { name: 'Raspberry Pi', icon: RaspberryPiIcon },
  { name: 'Firebase', icon: FirebaseIcon },
  { name: 'ESP RainMaker', icon: RainMakerIcon },
  { name: 'ThingSpeak', icon: ThingSpeakIcon },
  { name: 'MQTT', icon: MQTTIcon },
];

const highlights = [
  { icon: Shield, title: 'Secure', description: 'End-to-end encrypted communication' },
  { icon: Cloud, title: 'Cloud Ready', description: 'Firebase & ThingSpeak integration' },
  { icon: Wifi, title: 'Multi-Protocol', description: 'WiFi, MQTT, REST API support' },
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
    return <DocumentationPage onBack={() => setShowDocs(false)} />;
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Animated Background */}
      <HexagonBackground />
      
      {/* Gradient overlays */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-1/2 h-1/2 bg-gradient-radial from-foreground/[0.02] to-transparent" />
        <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-gradient-radial from-foreground/[0.02] to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Navbar */}
        <nav className="border-b border-border/30 bg-background/50 backdrop-blur-xl sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-foreground/10 flex items-center justify-center">
                  <Home className="w-5 h-5 text-foreground" />
                </div>
                <span className="text-xl font-bold">SmartHome</span>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  onClick={() => setShowDocs(true)}
                  className="hidden sm:flex gap-2"
                >
                  <BookOpen className="w-4 h-4" />
                  Docs
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate('/auth')}
                  className="border-foreground/20"
                >
                  Sign In
                </Button>
              </div>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="py-20 md:py-32">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-4xl mx-auto">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-foreground/5 border border-foreground/10 text-sm mb-8">
                <Sparkles className="w-4 h-4" />
                <span className="text-muted-foreground">Open Source IoT Platform</span>
              </div>

              {/* Title */}
              <h1 className="text-xl xs:text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 tracking-tight">
                Control Your Home
                <br />
                <span className="text-muted-foreground">From Anywhere</span>
              </h1>

              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
                A powerful, open-source smart home platform. Connect ESP32, Raspberry Pi, 
                and integrate with Firebase, ThingSpeak, MQTT, and more.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
                <Button
                  size="lg"
                  onClick={() => navigate('/auth')}
                  className="bg-foreground text-background hover:bg-foreground/90 text-base px-8 py-6 group w-full sm:w-auto"
                >
                  Get Started Free
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => setShowDocs(true)}
                  className="border-foreground/20 text-base px-8 py-6 w-full sm:w-auto"
                >
                  View Documentation
                </Button>
              </div>

              {/* Platform Icons */}
              <div className="flex flex-wrap justify-center items-center gap-6 md:gap-10">
                {platforms.map((platform) => {
                  const Icon = platform.icon;
                  return (
                    <button
                      key={platform.name}
                      onClick={() => setShowDocs(true)}
                      className="group flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-foreground/5 transition-all"
                    >
                      <Icon className="w-8 h-8 text-muted-foreground group-hover:text-foreground transition-colors" />
                      <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">{platform.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* Highlights */}
        <section className="py-12 border-t border-border/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {highlights.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.title}
                    className="flex items-center gap-4 p-4 rounded-xl bg-foreground/[0.02] border border-border/30"
                  >
                    <div className="w-12 h-12 rounded-lg bg-foreground/5 flex items-center justify-center shrink-0">
                      <Icon className="w-6 h-6 text-foreground/70" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{item.title}</h3>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-lg md:text-xl font-bold mb-4">Everything You Need</h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                Complete control over your smart home ecosystem
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {features.map((feature) => {
                const Icon = feature.icon;
                return (
                  <div
                    key={feature.title}
                    className="group p-6 rounded-xl bg-foreground/[0.02] border border-border/30 hover:border-foreground/20 hover:bg-foreground/[0.04] transition-all"
                  >
                    <div className="w-12 h-12 rounded-lg bg-foreground/5 flex items-center justify-center mb-4 group-hover:bg-foreground/10 transition-colors">
                      <Icon className="w-6 h-6 text-foreground/70" />
                    </div>
                    <h3 className="font-semibold mb-2">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Documentation CTA */}
        <section className="py-20 border-t border-border/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="relative rounded-2xl bg-foreground/[0.03] border border-border/30 p-8 md:p-12 overflow-hidden">
              {/* Background decoration */}
              <div className="absolute inset-0 opacity-30">
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-radial from-foreground/10 to-transparent" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-radial from-foreground/10 to-transparent" />
              </div>

              <div className="relative z-10 text-center">
                <BookOpen className="w-12 h-12 mx-auto mb-4 text-foreground/50" />
                <h2 className="text-lg md:text-xl font-bold mb-4">Ready to Build?</h2>
                <p className="text-muted-foreground max-w-xl mx-auto mb-8">
                  Explore our comprehensive documentation for ESP32, Raspberry Pi, Firebase, 
                  ThingSpeak, ESP RainMaker, and MQTT integration guides.
                </p>
                <Button
                  size="lg"
                  onClick={() => setShowDocs(true)}
                  className="bg-foreground text-background hover:bg-foreground/90"
                >
                  View Documentation
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-border/30 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-foreground/10 flex items-center justify-center">
                  <Home className="w-4 h-4" />
                </div>
                <span className="font-semibold">SmartHome</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Developed by <span className="text-foreground font-medium">RT</span>
              </p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
