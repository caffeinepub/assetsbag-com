import { ReactNode } from 'react';
import { useInternetIdentity } from '@/hooks/useInternetIdentity';
import { useGetCallerUserProfile } from '@/hooks/useCurrentUserProfile';
import { Button } from '@/components/ui/button';
import { useQueryClient } from '@tanstack/react-query';
import { Wallet, LogOut } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import ThemeToggle from '@/components/theme/ThemeToggle';

interface AppShellProps {
  children: ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  const { clear, identity } = useInternetIdentity();
  const { data: userProfile } = useGetCallerUserProfile();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
  };

  const handleLogoClick = () => {
    navigate({ to: '/' });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <button
            onClick={handleLogoClick}
            className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <Wallet className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold tracking-tight">AssetsBag</span>
          </button>

          <div className="flex items-center space-x-3">
            {userProfile && (
              <span className="text-sm text-muted-foreground hidden sm:inline">
                {userProfile.name}
              </span>
            )}
            <ThemeToggle />
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="gap-2"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="container py-8 flex-1">
        {children}
      </main>

      <footer className="border-t mt-auto">
        <div className="container py-6 text-center text-sm text-muted-foreground">
          © 2026. Built with ❤️ using{' '}
          <a
            href="https://caffeine.ai"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium underline underline-offset-4 hover:text-foreground transition-colors"
          >
            caffeine.ai
          </a>
        </div>
      </footer>
    </div>
  );
}
