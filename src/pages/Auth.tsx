import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Home, Mail, Lock, User, AlertCircle, Flame, Database, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useFirebaseAuth } from '@/hooks/useFirebaseAuth';
import { ForgotPasswordDialog } from '@/components/auth/ForgotPasswordDialog';
import { supabase } from '@/integrations/supabase/client';
import { z } from 'zod';
import { HexagonBackground } from '@/components/home/HexagonBackground';

const emailSchema = z.string().email('Please enter a valid email address');
const passwordSchema = z.string().min(6, 'Password must be at least 6 characters');

type AuthProvider = 'supabase' | 'firebase';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [authProvider, setAuthProvider] = useState<AuthProvider>('firebase');
  const [forgotOpen, setForgotOpen] = useState(false);

  const navigate = useNavigate();
  
  // Supabase auth
  const {
    user: supabaseUser,
    signIn: supabaseSignIn,
    signUp: supabaseSignUp,
    resetPassword: supabaseResetPassword,
    verifyOtp: supabaseVerifyOtp,
    updatePassword: supabaseUpdatePassword,
  } = useAuth();
  
  // Firebase auth
  const {
    user: firebaseUser,
    signIn: firebaseSignIn,
    signUp: firebaseSignUp,
    resetPassword: firebaseResetPassword,
  } = useFirebaseAuth();

  useEffect(() => {
    // Clear any old recovery hash fragments
    const hash = window.location.hash || '';
    if (hash.includes('type=recovery')) {
      window.location.hash = '';
    }
  }, []);

  useEffect(() => {
    if (supabaseUser || firebaseUser) {
      navigate('/dashboard');
    }
  }, [supabaseUser, firebaseUser, navigate]);

  const validateForm = () => {
    try {
      emailSchema.parse(email);
      passwordSchema.parse(password);
      return true;
    } catch (e) {
      if (e instanceof z.ZodError) {
        setError(e.errors[0].message);
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) return;

    setLoading(true);

    try {
      if (authProvider === 'firebase') {
        // Firebase Authentication
        if (isLogin) {
          const { error } = await firebaseSignIn(email, password);
          if (error) {
            if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password') {
              setError('Invalid email or password');
            } else if (error.code === 'auth/user-not-found') {
              setError('No account found with this email');
            } else if (error.code === 'auth/too-many-requests') {
              setError('Too many failed attempts. Please try again later.');
            } else {
              setError(error.message || 'Login failed');
            }
          }
        } else {
          const { error } = await firebaseSignUp(email, password);
          if (error) {
            if (error.code === 'auth/email-already-in-use') {
              setError('This email is already registered. Please login instead.');
            } else if (error.code === 'auth/weak-password') {
              setError('Password is too weak. Please use a stronger password.');
            } else {
              setError(error.message || 'Sign up failed');
            }
          }
        }
      } else {
        // Supabase Authentication
        if (isLogin) {
          const { error } = await supabaseSignIn(email, password);
          if (error) {
            if (error.message.includes('Invalid login')) {
              setError('Invalid email or password');
            } else {
              setError(error.message);
            }
          }
        } else {
          const { error } = await supabaseSignUp(email, password, displayName);
          if (error) {
            if (error.message.includes('already registered')) {
              setError('This email is already registered. Please login instead.');
            } else {
              setError(error.message);
            }
          }
        }
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      {/* Hexagon Background */}
      <HexagonBackground />

      {/* Back Button */}
      <Button
        variant="ghost"
        onClick={() => navigate('/')}
        className="fixed top-4 left-4 z-20 gap-2"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Home
      </Button>

      <Card className="w-full max-w-md relative z-10 bg-card/60 backdrop-blur-2xl border border-white/10 shadow-2xl shadow-black/20 rounded-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center mb-4">
            <Home className="w-8 h-8 text-primary-foreground" />
          </div>
           <CardTitle className="text-2xl bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </CardTitle>
          <CardDescription>
            {isLogin
              ? 'Sign in to control your smart home'
              : 'Join us to start automating your home'}
          </CardDescription>
        </CardHeader>

        <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
            {/* Auth Provider Selector */}
            <div className="space-y-3">
              <Label className="text-sm text-muted-foreground">Sign in with</Label>
              <RadioGroup 
                value={authProvider} 
                onValueChange={(value) => {
                  setAuthProvider(value as AuthProvider);
                  setError('');
                }}
                className="grid grid-cols-2 gap-3"
              >
                <Label
                  htmlFor="firebase"
                  className={`flex flex-col items-center gap-2 p-3 rounded-lg border-2 cursor-pointer transition-all
                    ${authProvider === 'firebase' 
                      ? 'border-orange-500 bg-orange-500/10' 
                      : 'border-border hover:border-orange-500/50 hover:bg-muted/50'}`}
                  onClick={() => setAuthProvider('firebase')}
                >
                  <RadioGroupItem value="firebase" id="firebase" className="sr-only" />
                  <Flame className="w-5 h-5 text-orange-500" />
                  <span className="text-xs font-medium">Firebase</span>
                </Label>
                <Label
                  htmlFor="supabase"
                  className={`flex flex-col items-center gap-2 p-3 rounded-lg border-2 cursor-pointer transition-all
                    ${authProvider === 'supabase' 
                      ? 'border-emerald-500 bg-emerald-500/10' 
                      : 'border-border hover:border-emerald-500/50 hover:bg-muted/50'}`}
                  onClick={() => setAuthProvider('supabase')}
                >
                  <RadioGroupItem value="supabase" id="supabase" className="sr-only" />
                  <Database className="w-5 h-5 text-emerald-500" />
                  <span className="text-xs font-medium">App Account</span>
                </Label>
              </RadioGroup>
            </div>

            {/* Display Name (only for Supabase signup) */}
            {!isLogin && authProvider === 'supabase' && (
              <div className="space-y-2">
                <Label htmlFor="name">Display Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="name"
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="John Doe"
                    className="pl-10"
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pl-10"
                  required
                />
              </div>
            </div>

            {isLogin && (
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setForgotOpen(true)}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  Forgot password?
                </button>
              </div>
            )}

            {error && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90"
              disabled={loading}
            >
              {loading ? 'Please wait...' : isLogin ? 'Sign In' : 'Create Account'}
            </Button>

            {/* Trial credentials hint for Firebase */}
            {authProvider === 'firebase' && isLogin && (
              <div className="p-3 rounded-lg bg-orange-500/10 border border-orange-500/20">
                <p className="text-xs text-muted-foreground">
                  <span className="font-medium text-orange-500">Trial Account:</span>{' '}
                  Use the demo credentials for testing the Firebase integration.
                </p>
              </div>
            )}
            </form>
          )}

          <ForgotPasswordDialog
            open={forgotOpen}
            onOpenChange={setForgotOpen}
            provider={authProvider}
            defaultEmail={email}
            onReset={async (targetEmail) => {
              if (authProvider === 'firebase') {
                return firebaseResetPassword(targetEmail);
              }
              return supabaseResetPassword(targetEmail);
            }}
          />

          {!isRecoveryFlow && (
            <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
              }}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {isLogin ? "Don't have an account? " : 'Already have an account? '}
              <span className="text-primary font-medium">
                {isLogin ? 'Sign up' : 'Sign in'}
              </span>
            </button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
