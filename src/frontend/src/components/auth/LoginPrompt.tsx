import { useInternetIdentity } from '@/hooks/useInternetIdentity';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Shield, TrendingUp, Globe, Lock, Wallet } from 'lucide-react';

export default function LoginPrompt() {
  const { login, loginStatus } = useInternetIdentity();

  const isLoggingIn = loginStatus === 'logging-in';

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
      <div className="container mx-auto px-4 py-16 max-w-6xl">
        {/* Hero Section */}
        <div className="text-center space-y-6 mb-16">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 mb-6">
            <Wallet className="h-10 w-10 text-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
            AssetsBag.com
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Track your portfolio across crypto, stocks, commodities, and fiat currencies
          </p>
          <div className="pt-4">
            <Button
              onClick={login}
              disabled={isLoggingIn}
              className="h-14 px-8 text-lg font-semibold"
              size="lg"
            >
              {isLoggingIn ? (
                <>
                  <div className="mr-2 h-5 w-5 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                  Connecting...
                </>
              ) : (
                'Sign In to Get Started'
              )}
            </Button>
            <p className="text-sm text-muted-foreground mt-4">
              Secure authentication powered by Internet Identity
            </p>
          </div>
        </div>

        {/* Features Section */}
        <div className="space-y-12 mt-20">
          <div className="text-center space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              Track Every Investment, Everywhere
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              AssetsBag monitors your investments across <span className="font-semibold text-foreground">40,000+ global assets</span> using real institutional-grade data
            </p>
          </div>

          {/* Asset Categories */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardContent className="pt-6 pb-5 text-center">
                <TrendingUp className="h-8 w-8 mx-auto mb-3 text-primary" />
                <p className="font-semibold text-sm">Cryptocurrencies</p>
              </CardContent>
            </Card>
            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardContent className="pt-6 pb-5 text-center">
                <Globe className="h-8 w-8 mx-auto mb-3 text-primary" />
                <p className="font-semibold text-sm">Stocks</p>
              </CardContent>
            </Card>
            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardContent className="pt-6 pb-5 text-center">
                <Shield className="h-8 w-8 mx-auto mb-3 text-primary" />
                <p className="font-semibold text-sm">Commodities</p>
              </CardContent>
            </Card>
            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardContent className="pt-6 pb-5 text-center">
                <Lock className="h-8 w-8 mx-auto mb-3 text-primary" />
                <p className="font-semibold text-sm">Fiat Currencies</p>
              </CardContent>
            </Card>
          </div>

          {/* Privacy Statement */}
          <Card className="max-w-4xl mx-auto bg-primary/5 border-primary/20">
            <CardContent className="pt-6 pb-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 mt-1">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Shield className="h-5 w-5 text-primary" />
                  </div>
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold text-lg">Privacy-First Portfolio Tracking</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Your financial data stays completely secure and private. AssetsBag runs on the Internet Computer Protocol, 
                    a decentralized blockchain network where your information is cryptographically protected and impossible to hack. 
                    No central servers, no data breaches—just you and your portfolio.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
