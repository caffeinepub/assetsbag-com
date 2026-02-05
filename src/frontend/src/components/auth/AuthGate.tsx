import { ReactNode } from 'react';
import LoginPrompt from './LoginPrompt';
import ProfileSetupDialog from '../profile/ProfileSetupDialog';
import { useGetCallerUserProfile } from '@/hooks/useCurrentUserProfile';

interface AuthGateProps {
  isAuthenticated: boolean;
  children: ReactNode;
}

export default function AuthGate({ isAuthenticated, children }: AuthGateProps) {
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();

  if (!isAuthenticated) {
    return <LoginPrompt />;
  }

  // Show profile setup if authenticated but no profile exists
  const showProfileSetup = isAuthenticated && !profileLoading && isFetched && userProfile === null;

  return (
    <>
      {showProfileSetup && <ProfileSetupDialog />}
      {children}
    </>
  );
}
