import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, Zap, Crown } from 'lucide-react';
import { SubscriptionBadge } from '../ui/SubscriptionBadge';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

const features = {
  Free: [
    'Access to basic tutorials',
    'Community support',
    'Limited access to resources',
    'Basic learning paths'
  ],
  Starter: [
    'All Free features',
    'Access to Starter tutorials',
    'Downloadable resources',
    'Email support',
    'Progress tracking'
  ],
  Pro: [
    'All Starter features',
    'Access to Pro tutorials',
    'Priority support',
    'Advanced learning paths',
    'Exclusive webinars',
    'Certificate of completion'
  ],
  Power: [
    'All Pro features',
    'Access to Power tutorials',
    '1:1 mentorship sessions',
    'Early access to new content',
    'Project reviews',
    'Job placement assistance'
  ],
  Ultra: [
    'All Power features',
    'Access to all tutorials',
    '24/7 priority support',
    'Custom learning path',
    'Portfolio reviews',
    'Job guarantee program',
    'Exclusive community access'
  ]
};

const planPrices = {
  Free: '₹0',
  Starter: '₹499',
  Pro: '₹1,299',
  Power: '₹2,399',
  Ultra: '₹4,499'
};

const planDurations = {
  Free: '',
  Starter: '/month',
  Pro: '/3 months',
  Power: '/6 months',
  Ultra: '/year'
};

interface PricingCardProps {
  plan: 'Free' | 'Starter' | 'Pro' | 'Power' | 'Ultra';
  isPopular?: boolean;
}

export const PricingCard: React.FC<PricingCardProps> = ({ plan, isPopular = false }) => {
  const { user } = useAuth();
  const { subscription, updateSubscription, isLoading } = useSubscription();
  const navigate = useNavigate();
  
  const isCurrentPlan = subscription.plan === plan;
  const isSubscribed = subscription.plan !== 'Free';
  const isHigherPlan = 
    (plan === 'Starter' && subscription.plan !== 'Free') ||
    (plan === 'Pro' && !['Free', 'Starter'].includes(subscription.plan)) ||
    (plan === 'Power' && ['Ultra'].includes(subscription.plan)) ||
    (plan === 'Ultra' && false);

  const handleUpgrade = async () => {
    if (!user) {
      router.push(`/login?redirect=${encodeURIComponent('/pricing')}`);
      return;
    }
    
    if (plan === 'Free') {
      // Handle downgrade to free
      if (confirm('Are you sure you want to cancel your subscription?')) {
        await updateSubscription('Free');
      }
    } else {
      await updateSubscription(plan);
    }
  };

  return (
    <Card className={cn(
      'relative overflow-hidden transition-all hover:shadow-lg',
      isPopular && 'border-2 border-primary/50 shadow-lg',
      isCurrentPlan && 'ring-2 ring-primary'
    )}>
      {isPopular && (
        <div className="absolute top-0 right-0 px-4 py-1 text-xs font-bold text-white bg-gradient-to-r from-purple-600 to-pink-600 rounded-bl-lg">
          MOST POPULAR
        </div>
      )}
      
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-2xl font-bold">{plan}</CardTitle>
          <SubscriptionBadge plan={plan} />
        </div>
        
        <div className="mt-4">
          <div className="flex items-end">
            <span className="text-4xl font-bold">{planPrices[plan]}</span>
            <span className="text-muted-foreground mb-1 ml-1">{planDurations[plan]}</span>
          </div>
          {plan !== 'Free' && (
            <p className="text-sm text-muted-foreground mt-1">
              {plan === 'Ultra' ? 'Save 30%' : plan === 'Power' ? 'Save 20%' : ''}
            </p>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <ul className="space-y-2">
          {features[plan].map((feature, index) => (
            <li key={index} className="flex items-center">
              <Check className="w-4 h-4 text-green-500 mr-2" />
              <span className="text-sm">{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      
      <CardFooter className="mt-auto">
        <Button 
          onClick={handleUpgrade}
          disabled={isCurrentPlan || (isHigherPlan && plan !== 'Free') || isLoading}
          className={cn(
            'w-full',
            isCurrentPlan 
              ? 'bg-muted text-muted-foreground hover:bg-muted/80' 
              : 'bg-gradient-primary hover:opacity-90',
            isPopular && 'bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90'
          )}
        >
          {isLoading ? (
            'Processing...'
          ) : isCurrentPlan ? (
            'Current Plan'
          ) : isHigherPlan ? (
            'Downgrade'
          ) : plan === 'Free' ? (
            'Get Started'
          ) : (
            <>
              {plan === 'Ultra' ? <Crown className="w-4 h-4 mr-2" /> : <Zap className="w-4 h-4 mr-2" />}
              Upgrade to {plan}
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};
