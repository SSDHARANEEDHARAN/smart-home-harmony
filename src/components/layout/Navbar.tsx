import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Cpu, Zap, Workflow, Settings, LogOut, LogIn, Home, Monitor, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useFirebaseAuth } from '@/hooks/useFirebaseAuth';
import { useHome } from '@/contexts/HomeContext';
import { FirebaseActiveBadge } from '@/components/firebase/FirebaseStatusBadge';
import { cn } from '@/lib/utils';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from '@/components/ui/sheet';

const navItems = [
  { path: '/screen', label: 'Screen', icon: Monitor },
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
  const [mobileOpen, setMobileOpen] = useState(false);

  const user = supabaseUser || firebaseUser;

  const handleLogout = async () => {
    if (supabaseUser) await supabaseSignOut();
    if (firebaseUser) await firebaseSignOut();
    setMobileOpen(false);
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
              <span className="text-sm sm:text-base font-bold text-foreground leading-tight">
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

          {/* Right side: Auth + Hamburger */}
          <div className="flex items-center gap-2">
            {user ? (
              <>
                {/* Desktop logout */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="hidden md:flex text-muted-foreground hover:text-destructive"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>

                {/* Mobile hamburger */}
                <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="md:hidden w-9 h-9">
                      <Menu className="w-5 h-5" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right" className="w-[260px] p-0 glass">
                    <SheetHeader className="p-4 border-b border-border/50">
                      <SheetTitle className="flex items-center gap-2 text-sm">
                        <Home className="w-4 h-4" />
                        SmartHome
                      </SheetTitle>
                    </SheetHeader>
                    <div className="flex flex-col py-2">
                      {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path;
                        return (
                          <SheetClose asChild key={item.path}>
                            <Link
                              to={item.path}
                              className={cn(
                                "flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors",
                                isActive
                                  ? "bg-foreground/10 text-foreground border-l-2 border-foreground"
                                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                              )}
                            >
                              <Icon className="w-4 h-4" />
                              {item.label}
                            </Link>
                          </SheetClose>
                        );
                      })}
                    </div>
                    <div className="border-t border-border/50 p-4 mt-auto">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleLogout}
                        className="w-full justify-start text-muted-foreground hover:text-destructive gap-2"
                      >
                        <LogOut className="w-4 h-4" />
                        Logout
                      </Button>
                    </div>
                  </SheetContent>
                </Sheet>
              </>
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
    </nav>
  );
}
