import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Cpu, Zap, Workflow, Settings, LogOut, LogIn, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useFirebaseAuth } from '@/hooks/useFirebaseAuth';
import { useHome } from '@/contexts/HomeContext';
import { FirebaseActiveBadge } from '@/components/firebase/FirebaseStatusBadge';
import { cn } from '@/lib/utils';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/devices', label: 'Devices', icon: Cpu },
  { path: '/energy', label: 'Energy', icon: Zap },
  { path: '/automation', label: 'Automation', icon: Workflow },
  { path: '/settings', label: 'Settings', icon: Settings },
];

export function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user: supabaseUser, signOut: supabaseSignOut } = useAuth();
  const { user: firebaseUser, signOut: firebaseSignOut } = useFirebaseAuth();
  const { currentHome } = useHome();

  // User is logged in if either auth method has a user
  const user = supabaseUser || firebaseUser;

  const handleLogout = async () => {
    // Sign out from both to be safe
    if (supabaseUser) await supabaseSignOut();
    if (firebaseUser) await firebaseSignOut();
    navigate('/auth');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/50 safe-area-top">
      <div className="container-responsive">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Logo + Active Workspace */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-foreground/10 flex items-center justify-center">
              <Home className="w-4 h-4 sm:w-5 sm:h-5 text-foreground" />
            </div>
            <div className="hidden xs:flex flex-col">
              <span className="text-base sm:text-lg font-bold text-foreground leading-tight">
                SmartHome
              </span>
              {user && currentHome && (
                <div className="flex items-center gap-1">
                  <span className="text-[10px] text-muted-foreground leading-tight">
                    {currentHome.name}
                  </span>
                  <FirebaseActiveBadge />
                </div>
              )}
            </div>
          </Link>

          {/* Navigation Links - Desktop */}
          {user && (
            <div className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={cn(
                      "flex items-center gap-2 px-3 lg:px-4 py-2 rounded-lg transition-all duration-300",
                      isActive
                        ? "bg-foreground/10 text-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="font-medium text-sm">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          )}

          {/* Auth Button */}
          <div className="flex items-center gap-2 sm:gap-4">
            {user ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-muted-foreground hover:text-destructive"
              >
                <LogOut className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/auth')}
                className="text-primary hover:text-primary/80"
              >
                <LogIn className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Login</span>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Navigation - Bottom Tab Bar */}
      {user && (
        <div className="md:hidden border-t border-border/50 safe-area-bottom">
          <div className="flex items-center justify-around py-1.5 sm:py-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-lg transition-all min-w-[56px]",
                    isActive
                      ? "text-primary"
                      : "text-muted-foreground"
                  )}
                >
                  <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="text-[10px] sm:text-xs">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </nav>
  );
}
