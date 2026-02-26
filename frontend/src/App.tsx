import { RouterProvider, createRouter, createRoute, createRootRoute, Outlet } from '@tanstack/react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CartProvider } from './contexts/CartContext';
import { Toaster } from '@/components/ui/sonner';
import Layout from './components/Layout';
import MenuDisplay from './pages/MenuDisplay';
import AdminPanel from './pages/AdminPanel';
import PaymentPage from './pages/PaymentPage';
import ErrorBoundary from './components/ErrorBoundary';

const queryClient = new QueryClient();

const rootRoute = createRootRoute({
  component: () => (
    <Layout>
      <Outlet />
    </Layout>
  ),
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: MenuDisplay,
});

const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin',
  component: AdminPanel,
});

const paymentRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/payment',
  component: PaymentPage,
});

const routeTree = rootRoute.addChildren([indexRoute, adminRoute, paymentRoute]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <CartProvider>
          <RouterProvider router={router} />
          <Toaster richColors position="top-right" />
        </CartProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
