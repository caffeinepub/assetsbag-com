import { RouterProvider, createRouter, createRootRoute, createRoute, Outlet } from '@tanstack/react-router';
import { useInternetIdentity } from './hooks/useInternetIdentity';
import AuthGate from './components/auth/AuthGate';
import DashboardPage from './pages/DashboardPage';
import AddAssetPage from './pages/AddAssetPage';
import AppShell from './components/layout/AppShell';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from 'next-themes';

// Layout component that wraps authenticated routes
function Layout() {
  return (
    <AppShell>
      <Outlet />
    </AppShell>
  );
}

// Root route with layout
const rootRoute = createRootRoute({
  component: Layout,
});

// Dashboard route
const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: DashboardPage,
});

// Add Asset route
const addAssetRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/add-asset',
  component: AddAssetPage,
});

// Create router
const routeTree = rootRoute.addChildren([dashboardRoute, addAssetRoute]);
const router = createRouter({ routeTree });

// Declare router type for TypeScript
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  const { identity, isInitializing } = useInternetIdentity();

  if (isInitializing) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <AuthGate isAuthenticated={!!identity}>
        <RouterProvider router={router} />
      </AuthGate>
      <Toaster />
    </ThemeProvider>
  );
}
