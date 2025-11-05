import { useNavigate, useSearchParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { useAuth, type SubscriptionPlan } from '@/contexts/AuthContext';
import { Loader2, CheckCircle, CreditCard, Calendar, Lock, User } from 'lucide-react';
import { toast } from 'sonner';

export default function VirtualPayment() {
  const router = useRouter();
  const { plan } = router.query;
  const { updateSubscription } = useSubscription();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    cardNumber: '4242 4242 4242 4242',
    expiry: '12/25',
    cvv: '123',
    name: user?.name || 'Test User',
  });

  // Ensure plan is a valid SubscriptionPlan
  const subscriptionPlan = (plan as SubscriptionPlan) || 'Starter';

  useEffect(() => {
    if (!plan) {
      router.push('/pricing');
    }
  }, [plan, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const formatCardNumber = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{4})/g, '$1 ')
      .trim()
      .substring(0, 19);
  };

  const formatExpiry = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/^(\d{2})/, '$1/')
      .substring(0, 5);
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    try {
      if (!subscriptionPlan) throw new Error('No plan selected');
      
      // Update subscription with payment verification
      await updateSubscription(subscriptionPlan, true);
      
      // Show success state
      setSuccess(true);
      
      // Redirect to dashboard after a short delay
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
    } catch (error: any) {
      console.error('Payment error:', error);
      toast.error(error.message || 'Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!plan) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="text-center">
          <Loader2 className="w-8 h-8 mx-auto mb-4 animate-spin text-primary" />
          <p>Loading payment details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/30 p-4">
      <Card className="w-full max-w-md border-0 shadow-lg overflow-hidden bg-background/80 backdrop-blur-sm">
        <div className="bg-gradient-to-r from-primary to-primary/80 p-6 text-white">
          <h1 className="text-2xl font-bold">Complete Your Purchase</h1>
          <p className="text-primary-foreground/80">You're subscribing to the {subscriptionPlan} plan</p>
        </div>
        
        <form onSubmit={handlePayment}>
          <CardContent className="p-6 space-y-6">
            {success ? (
              <div className="text-center py-8">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold">Payment Successful!</h3>
                <p className="text-muted-foreground mt-2">
                  Your {plan} subscription is now active. Redirecting...
                </p>
              </div>
            ) : (
              <>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center">
                      <CreditCard className="w-4 h-4 mr-2" />
                      Card Number
                    </label>
                    <Input 
                      name="cardNumber"
                      value={formData.cardNumber}
                      onChange={(e) => {
                        e.target.value = formatCardNumber(e.target.value);
                        handleInputChange(e);
                      }}
                      placeholder="4242 4242 4242 4242"
                      required
                      className="pl-10"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium flex items-center">
                        <Calendar className="w-4 h-4 mr-2" />
                        Expiry Date
                      </label>
                      <Input 
                        name="expiry"
                        value={formData.expiry}
                        onChange={(e) => {
                          e.target.value = formatExpiry(e.target.value);
                          handleInputChange(e);
                        }}
                        placeholder="MM/YY"
                        required
                        className="pl-10"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium flex items-center">
                        <Lock className="w-4 h-4 mr-2" />
                        CVV
                      </label>
                      <Input 
                        name="cvv"
                        type="password"
                        value={formData.cvv}
                        onChange={handleInputChange}
                        placeholder="123"
                        maxLength={4}
                        required
                        className="pl-10"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center">
                      <User className="w-4 h-4 mr-2" />
                      Cardholder Name
                    </label>
                    <Input 
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="John Doe"
                      required
                      className="pl-10"
                    />
                  </div>
                  
                  <div className="p-4 bg-muted/30 rounded-md text-sm space-y-2">
                    <p className="font-medium text-foreground/80">Test Card Details:</p>
                    <p className="text-muted-foreground"><span className="font-mono">4242 4242 4242 4242</span> - Any future date - Any 3 digits</p>
                    <p className="text-xs text-muted-foreground/70 mt-2">This is a demo payment. No real money will be charged.</p>
                  </div>
                </div>
              </>
            )}
          </CardContent>
          
          {!success && (
            <CardFooter className="p-6 pt-0">
              <Button 
                type="submit" 
                className="w-full h-12 text-base bg-gradient-to-r from-primary to-primary/80 hover:opacity-90 transition-opacity"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  `Pay Now - ${subscriptionPlan} Plan`
                )}
              </Button>
            </CardFooter>
          )}
        </form>
      </Card>
    </div>
  );
}
