import { Lock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { Button } from './button';
import { useNavigate } from 'react-router-dom';

interface LockedContentProps {
  requiredPlan: 'Starter' | 'Pro' | 'Power' | 'Ultra';
  children: React.ReactNode;
  className?: string;
  message?: string;
}

export const LockedContent: React.FC<LockedContentProps> = ({
  requiredPlan,
  children,
  className = '',
  message,
}) => {
  const { user } = useAuth();
  const { hasAccess } = useSubscription();
  const navigate = useNavigate();

  // If user doesn't have access, show the lock overlay
  if (user && !hasAccess(requiredPlan)) {
    return (
      <div className={`relative ${className}`}>
        {/* Blurred content */}
        <div className="blur-sm select-none">
          {children}
        </div>
        
        {/* Lock overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm rounded-lg p-6 text-center">
          <div className="p-4 bg-accent/10 rounded-full mb-4">
            <Lock className="h-8 w-8 text-accent" />
          </div>
          
          <h3 className="text-xl font-bold mb-2">Upgrade to {requiredPlan}</h3>
          <p className="text-muted-foreground mb-6 max-w-md">
            {message || `This content requires a ${requiredPlan} subscription.`}
          </p>
          
          <Button 
            onClick={() => router.push('/pricing')}
            className="bg-gradient-primary hover:glow-primary"
          >
            Upgrade Now
          </Button>
        </div>
      </div>
    );
  }

  // If user has access or is not logged in (handled by ProtectedRoute)
  return <>{children}</>;
};
