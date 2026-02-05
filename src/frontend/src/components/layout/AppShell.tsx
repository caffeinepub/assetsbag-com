import { useInternetIdentity } from '@/hooks/useInternetIdentity';
import { useGetCallerUserProfile } from '@/hooks/useCurrentUserProfile';
import { Button } from '@/components/ui/button';
import ThemeToggle from '@/components/theme/ThemeToggle';
import { LogOut, Wallet } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate, useRouterState } from '@tanstack/react-router';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { clear } = useInternetIdentity();
  const { data: userProfile } = useGetCallerUserProfile();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
  };

  const handleNavigation = (path: string) => {
    navigate({ to: path });
  };

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-6">
            <button
              onClick={() => handleNavigation('/')}
              className="flex items-center gap-2 font-bold text-xl hover:opacity-80 transition-opacity"
            >
              <Wallet className="h-6 w-6 text-primary" />
              <span>AssetsBag</span>
            </button>
            <nav className="flex items-center gap-1">
              <Button
                variant={currentPath === '/' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => handleNavigation('/')}
              >
                Portfolio
              </Button>
              <Button
                variant={currentPath === '/fiat-test' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => handleNavigation('/fiat-test')}
              >
                FIAT Test
              </Button>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            {userProfile && (
              <span className="text-sm font-medium text-muted-foreground">
                {userProfile.name}
              </span>
            )}
            <Button variant="outline" size="sm" onClick={handleLogout} className="gap-2">
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 container py-8">{children}</main>

      <footer className="border-t py-6 md:py-8">
        <div className="container flex flex-col items-center justify-center gap-4 md:flex-row">
          <p className="text-center text-sm text-muted-foreground">
            © 2026. Built with ❤️ using{' '}
            <a
              href="https://caffeine.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium underline underline-offset-4 hover:text-primary"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
