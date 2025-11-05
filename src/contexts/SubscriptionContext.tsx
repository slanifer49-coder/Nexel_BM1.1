import { createContext, useContext, useEffect, useState } from 'react';
import { useAuth, type AuthContextType, type SubscriptionPlan } from './AuthContext';
import { toast } from 'sonner';
import { getPlanLevel, getPlanFeatures, getPlanPrice } from '@/utils/subscriptionUtils';

interface SubscriptionContextType {
  subscription: {
    plan: SubscriptionPlan;
    startDate?: string;
    endDate?: string;
  };
  hasAccess: (requiredPlan: SubscriptionPlan) => boolean;
  updateSubscription: (plan: SubscriptionPlan, paymentVerified?: boolean) => Promise<void>;
  isSubscribed: boolean;
  isLoading: boolean;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export const SubscriptionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, updateUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  
  const subscription = user?.subscription || {
    plan: 'Free' as const,
    startDate: undefined,
    endDate: undefined
  };
  const isSubscribed = subscription.plan !== 'Free';
  
  // Helper function to convert date strings to Date objects
  const parseDate = (dateString?: string): Date | undefined => {
    return dateString ? new Date(dateString) : undefined;
  };

  const hasAccess = (requiredPlan: SubscriptionPlan): boolean => {
    if (!user) return false;
    
    // Check if subscription is active
    if (subscription.endDate) {
      const endDate = new Date(subscription.endDate);
      if (endDate < new Date()) {
        return false; // Subscription has expired
      }
    }
    
    return getPlanLevel(subscription.plan) >= getPlanLevel(requiredPlan);
  };

  const updateSubscription = async (plan: SubscriptionPlan, paymentVerified = false) => {
    if (!user) {
      toast('Please log in to subscribe', {
        action: {
          label: 'Log In',
          onClick: () => window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname)}`
        }
      });
      return;
    }

    // If it's a free plan or payment is already verified, update directly
    if (plan === 'Free' || paymentVerified) {
      try {
        setIsLoading(true);
        await updateSubscriptionDirectly(plan);
      } catch (error) {
        console.error('Failed to update subscription:', error);
        toast.error('Failed to update subscription. Please try again.');
      } finally {
        setIsLoading(false);
      }
      return;
    }

    // For paid plans, redirect to virtual payment page
    const redirectUrl = `/payment/virtual?plan=${encodeURIComponent(plan)}&redirect=${encodeURIComponent(window.location.pathname)}`;
    window.location.href = redirectUrl;
  };

  const updateSubscriptionDirectly = async (plan: SubscriptionPlan) => {
    try {
      const base = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';
      const res = await fetch(`${base}/subscriptions/update-subscription`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ 
          plan,
          // Add a virtual payment ID for tracking
          paymentId: `virt_${Date.now()}`,
          paymentMethod: 'virtual'
        }),
      });

      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.message || 'Failed to update subscription');
      }

      const data = await res.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to update subscription');
      }
      
      // Update the user's subscription in the auth context
      if (!user) {
        throw new Error('User context is missing');
      }
      
      if (!data.user?.subscription) {
        throw new Error('Invalid response: missing subscription data');
      }

      const updatedUser = { 
        ...user, 
        subscription: data.user.subscription
      };
      updateUser(updatedUser);
      
      // Show success message
      if (plan === 'Free') {
        toast.success('Your subscription has been cancelled');
      } else {
        toast.success(`🎉 Successfully upgraded to ${plan} plan!`);
      }
      
      // Redirect back to the original page or dashboard
      const urlParams = new URLSearchParams(window.location.search);
      const redirectTo = urlParams.get('redirect') || '/';
      window.location.href = redirectTo;
      
      return data;
    } catch (error: any) {
      console.error('Subscription error:', error);
      toast.error(error.message || 'Failed to update subscription');
      setIsLoading(false);
      throw error;
    }
  };

  return (
    <SubscriptionContext.Provider 
      value={{ 
        subscription, 
        hasAccess, 
        updateSubscription, 
        isSubscribed,
        isLoading
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscription = (): SubscriptionContextType => {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
};
