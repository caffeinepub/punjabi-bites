import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { useIsAdmin } from '../hooks/useQueries';
import { ShieldCheck, LogIn, LogOut, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Header() {
  const navigate = useNavigate();
  const { login, clear, loginStatus, identity } = useInternetIdentity();
  const queryClient = useQueryClient();
  const { data: isAdmin, isLoading: adminLoading } = useIsAdmin();

  const isAuthenticated = !!identity;
  const isLoggingIn = loginStatus === 'logging-in';

  const handleAuth = async () => {
    if (isAuthenticated) {
      await clear();
      queryClient.clear();
      navigate({ to: '/' });
    } else {
      try {
        await login();
      } catch (error: any) {
        if (error.message === 'User is already authenticated') {
          await clear();
          setTimeout(() => login(), 300);
        }
      }
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-deepRed-600 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo / Branding */}
          <button
            onClick={() => navigate({ to: '/' })}
            className="flex items-center gap-3 hover:opacity-90 transition-opacity"
          >
            <img
              src="/assets/generated/punjabi-bites-logo.dim_400x200.png"
              alt="Punjabi Bites"
              className="h-10 w-auto object-contain"
            />
            <span className="text-cream-50 font-display text-xl font-bold tracking-wide hidden sm:block">
              PUNJABI BITES
            </span>
          </button>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {isAuthenticated && (
              <>
                {adminLoading ? (
                  <Button
                    variant="outline"
                    size="sm"
                    disabled
                    className="border-cream-200 text-cream-100 bg-transparent"
                  >
                    <Loader2 className="h-4 w-4 animate-spin mr-1" />
                    <span className="hidden sm:inline">Checking...</span>
                  </Button>
                ) : isAdmin ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate({ to: '/admin' })}
                    className="border-saffron-400 text-saffron-300 bg-transparent hover:bg-saffron-400 hover:text-deepRed-900 font-semibold transition-colors"
                  >
                    <ShieldCheck className="h-4 w-4 mr-1" />
                    <span className="hidden sm:inline">Admin Panel</span>
                    <span className="sm:hidden">Admin</span>
                  </Button>
                ) : null}
              </>
            )}

            <Button
              onClick={handleAuth}
              disabled={isLoggingIn}
              size="sm"
              className={
                isAuthenticated
                  ? 'bg-cream-100 text-deepRed-700 hover:bg-cream-200 font-medium'
                  : 'bg-saffron-500 text-deepRed-900 hover:bg-saffron-400 font-semibold'
              }
            >
              {isLoggingIn ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-1" />
                  <span className="hidden sm:inline">Logging in...</span>
                </>
              ) : isAuthenticated ? (
                <>
                  <LogOut className="h-4 w-4 mr-1" />
                  <span className="hidden sm:inline">Logout</span>
                </>
              ) : (
                <>
                  <LogIn className="h-4 w-4 mr-1" />
                  <span className="hidden sm:inline">Login</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
