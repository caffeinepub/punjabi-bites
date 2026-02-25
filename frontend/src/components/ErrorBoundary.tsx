import { Component, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: { componentStack: string }) {
    // Log to console for debugging without exposing to users
    console.error('[ErrorBoundary] Caught error:', error, info.componentStack);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-cream flex flex-col items-center justify-center px-4 text-center">
          <div className="max-w-md w-full">
            {/* Logo / Branding */}
            <div className="mb-6">
              <img
                src="/assets/generated/punjabi-bites-logo.dim_400x200.png"
                alt="Punjabi Bites"
                className="h-16 object-contain mx-auto mb-4 opacity-80"
              />
            </div>

            {/* Error icon */}
            <div className="w-20 h-20 rounded-full bg-red-50 border-2 border-red-100 flex items-center justify-center mx-auto mb-5">
              <AlertTriangle className="w-10 h-10 text-red-400" />
            </div>

            {/* Message */}
            <h1 className="font-display text-2xl md:text-3xl font-black text-deepRed mb-3">
              Something Went Wrong
            </h1>
            <p className="text-gray-500 text-sm mb-2 max-w-xs mx-auto">
              We ran into an unexpected error. This is usually temporary — please reload the page to try again.
            </p>
            {this.state.error?.message && (
              <p className="text-xs text-gray-400 bg-gray-50 rounded-lg px-3 py-2 mb-6 font-mono break-all max-w-xs mx-auto">
                {this.state.error.message}
              </p>
            )}

            {/* Reload button */}
            <button
              onClick={this.handleReload}
              className="inline-flex items-center gap-2 px-6 py-3 bg-deepRed text-white rounded-xl font-bold text-base hover:bg-deepRed/90 transition-colors shadow-md"
            >
              <RefreshCw className="w-5 h-5" />
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
