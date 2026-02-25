import { Link, useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { useIsAdmin } from '../hooks/useQueries';
import { ChefHat, Settings, LogIn, LogOut, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Header() {
  const { login, clear, loginStatus, identity } = useInternetIdentity();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const isAuthenticated = !!identity;
  const isLoggingIn = loginStatus === 'logging-in';
  const { data: isAdmin, isLoading: isAdminLoading } = useIsAdmin();

  const handleAuth = async () => {
    if (isAuthenticated) {
      await clear();
      queryClient.clear();
      navigate({ to: '/' });
    } else {
      try {
        await login();
      } catch (error: unknown) {
        const err = error as Error;
        if (err?.message === 'User is already authenticated') {
          await clear();
          setTimeout(() => login(), 300);
        }
      }
    }
  };

  // Show admin link only when authenticated AND confirmed as admin (not while loading)
  const showAdminLink = isAuthenticated && !isAdminLoading && isAdmin === true;

  return (
    <header className="bg-deepRed shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo & Brand */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-saffron flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
              <ChefHat className="w-5 h-5 md:w-6 md:h-6 text-deepRed" />
            </div>
            <div className="flex flex-col">
              <span className="font-display text-xl md:text-2xl font-black text-saffron tracking-wide leading-none">
                PUNJABI BITES
              </span>
              <span className="text-cream/70 text-xs font-medium tracking-widest uppercase">
                Authentic Flavors
              </span>
            </div>
          </Link>

          {/* Nav Actions */}
          <div className="flex items-center gap-2 md:gap-3">
            {/* Admin link: visible only to confirmed admins */}
            {showAdminLink && (
              <Link to="/admin">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-saffron text-saffron hover:bg-saffron hover:text-deepRed transition-colors gap-2 font-semibold bg-saffron/10"
                >
                  <Settings className="w-4 h-4" />
                  <span className="hidden sm:inline">Admin Panel</span>
                  <span className="sm:hidden">Admin</span>
                </Button>
              </Link>
            )}

            {/* Loading indicator while checking admin status after login */}
            {isAuthenticated && isAdminLoading && (
              <div className="w-8 h-8 flex items-center justify-center">
                <Loader2 className="w-4 h-4 animate-spin text-saffron/60" />
              </div>
            )}

            <Button
              onClick={handleAuth}
              disabled={isLoggingIn}
              size="sm"
              className={`gap-2 font-semibold transition-colors ${
                isAuthenticated
                  ? 'bg-cream/20 hover:bg-cream/30 text-cream border border-cream/30'
                  : 'bg-saffron hover:bg-saffron/90 text-deepRed'
              }`}
            >
              {isLoggingIn ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : isAuthenticated ? (
                <LogOut className="w-4 h-4" />
              ) : (
                <LogIn className="w-4 h-4" />
              )}
              <span className="hidden sm:inline">
                {isLoggingIn ? 'Logging in...' : isAuthenticated ? 'Logout' : 'Login'}
              </span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
