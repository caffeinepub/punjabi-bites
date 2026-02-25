import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Button } from '@/components/ui/button';
import { ShieldX, LogIn, Loader2 } from 'lucide-react';
import { Link } from '@tanstack/react-router';

export default function AccessDeniedScreen() {
  const { login, loginStatus, identity } = useInternetIdentity();
  const isLoggingIn = loginStatus === 'logging-in';
  const isAuthenticated = !!identity;

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 rounded-full bg-deepRed/10 flex items-center justify-center mx-auto mb-6">
          <ShieldX className="w-10 h-10 text-deepRed" />
        </div>
        <h2 className="font-display text-3xl font-black text-deepRed mb-3">Access Denied</h2>
        <p className="text-gray-600 mb-2">
          {isAuthenticated
            ? 'You do not have admin privileges to access this panel.'
            : 'Please log in with an admin account to access the admin panel.'}
        </p>
        <p className="text-gray-500 text-sm mb-8">
          Only authorized administrators can manage the menu.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {!isAuthenticated && (
            <Button
              onClick={login}
              disabled={isLoggingIn}
              className="bg-saffron hover:bg-saffron/90 text-deepRed font-bold gap-2"
            >
              {isLoggingIn ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <LogIn className="w-4 h-4" />
              )}
              {isLoggingIn ? 'Logging in...' : 'Login'}
            </Button>
          )}
          <Link to="/">
            <Button variant="outline" className="border-deepRed/30 text-deepRed hover:bg-deepRed/5 w-full sm:w-auto">
              View Menu
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
