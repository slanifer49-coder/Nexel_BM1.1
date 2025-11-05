import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPlan?: 'Free' | 'Starter' | 'Pro' | 'Power' | 'Ultra';
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredPlan = 'Free' 
}) => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!loading) {
      // If user is not logged in, redirect to login
      if (!user) {
        toast.error('Please log in to access this page');
        navigate(`/login?redirect=${encodeURIComponent(location.pathname + location.search)}`);
        return;
      }

      // Check subscription level if required
      if (requiredPlan !== 'Free' && user.subscription.plan === 'Free') {
        toast.error(`This content requires a ${requiredPlan} subscription`);
        navigate('/pricing');
      }
    }
  }, [user, loading, requiredPlan, navigate, location]);

  // Show loading state while checking auth
  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Check subscription level
  const planLevels = {
    'Free': 0,
    'Starter': 1,
    'Pro': 2,
    'Power': 3,
    'Ultra': 4
  };

  if (planLevels[user.subscription.plan] < planLevels[requiredPlan]) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
        <div className="max-w-md p-8 rounded-lg border border-accent/20 bg-card/50 backdrop-blur-sm">
          <h2 className="text-2xl font-bold mb-4 text-primary">Upgrade Required</h2>
          <p className="mb-6 text-muted-foreground">
            This content requires a {requiredPlan} plan or higher. Your current plan is {user.subscription.plan}.
          </p>
          <button
            onClick={() => navigate('/pricing')}
            className="px-6 py-3 bg-gradient-primary text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
          >
            Upgrade to {requiredPlan}
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
