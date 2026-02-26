import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { ShieldX, LogIn, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AccessDeniedScreen() {
  const navigate = useNavigate();
  const { login, loginStatus } = useInternetIdentity();
  const isLoggingIn = loginStatus === 'logging-in';

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="flex justify-center mb-6">
          <div className="bg-deepRed-100 rounded-full p-6">
            <ShieldX className="h-16 w-16 text-deepRed-600" />
          </div>
        </div>
        <h1 className="font-display text-3xl font-bold text-deepRed-800 mb-3">
          Access Denied
        </h1>
        <p className="text-spice-600 mb-8 text-lg">
          You need to be an admin to access this page. Please log in with an admin account.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            onClick={() => login()}
            disabled={isLoggingIn}
            className="bg-saffron-500 hover:bg-saffron-400 text-deepRed-900 font-semibold"
          >
            <LogIn className="h-4 w-4 mr-2" />
            {isLoggingIn ? 'Logging in...' : 'Login'}
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate({ to: '/' })}
            className="border-deepRed-300 text-deepRed-600 hover:bg-deepRed-50"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Menu
          </Button>
        </div>
      </div>
    </div>
  );
}
