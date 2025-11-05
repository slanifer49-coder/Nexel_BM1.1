import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CreditCard, Lock, Loader2, CheckCircle, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: {
    name: string;
    price: number;
    duration: string;
  };
}

export const CheckoutModal = ({ isOpen, onClose, plan }: CheckoutModalProps) => {
  const { user, updateUser } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [name, setName] = useState(user?.name || '');

  // Format card number with spaces
  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
    }
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCardNumber(e.target.value);
    if (formatted.replace(/\s/g, '').length <= 16) {
      setCardNumber(formatted);
    }
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length >= 2) {
      value = value.slice(0, 2) + '/' + value.slice(2, 4);
    }
    if (value.length <= 5) {
      setExpiry(value);
    }
  };

  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 3) {
      setCvv(value);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (!cardNumber || cardNumber.replace(/\s/g, '').length !== 16) {
      toast.error('Invalid card number');
      return;
    }
    if (!expiry || expiry.length !== 5) {
      toast.error('Invalid expiry date');
      return;
    }
    if (!cvv || cvv.length !== 3) {
      toast.error('Invalid CVV');
      return;
    }
    if (!name) {
      toast.error('Name is required');
      return;
    }

    setIsProcessing(true);

    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2500));

    // Calculate dates
    const startDate = new Date();
    let endDate = new Date();
    
    // Calculate end date based on plan duration
    const months = parseInt(plan.duration);
    if (!isNaN(months)) {
      endDate.setMonth(endDate.getMonth() + months);
    } else {
      endDate.setFullYear(endDate.getFullYear() + 1);
    }

    // Save subscription to backend
    try {
      const token = localStorage.getItem('token');
      const base = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';
      const response = await fetch(`${base}/subscriptions/update-subscription`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          plan: plan.name,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString()
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update subscription');
      }

      const data = await response.json();
      
      // Update local user state with the response from backend
      updateUser({
        ...user!,
        subscription: {
          plan: plan.name as any,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString()
        }
      });

      // Set flag for asset unlock notification
      sessionStorage.setItem('just_upgraded', 'true');

      setIsProcessing(false);
      setIsSuccess(true);
    } catch (error) {
      console.error('Subscription update failed:', error);
      setIsProcessing(false);
      toast.error('Failed to update subscription', {
        description: 'Please try again or contact support'
      });
      return;
    }

    // Show success and close after delay
    setTimeout(() => {
      toast.success('Subscription activated! 🎉', {
        description: `Welcome to ${plan.name}! Check out your newly unlocked assets.`,
        duration: 5000,
        action: {
          label: 'View Assets',
          onClick: () => window.location.href = '/assets'
        }
      });
      onClose();
      setIsSuccess(false);
      // Reset form
      setCardNumber('');
      setExpiry('');
      setCvv('');
      
      // Trigger a page reload after a short delay to ensure all components update
      setTimeout(() => {
        window.location.reload();
      }, 500);
    }, 2000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-card border-primary/20">
        {!isSuccess ? (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl font-orbitron flex items-center gap-2">
                <CreditCard className="h-6 w-6 text-primary" />
                Checkout
              </DialogTitle>
              <DialogDescription>
                Complete your subscription to <span className="text-primary font-bold">{plan.name}</span>
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 mt-4">
              {/* Plan Summary */}
              <div className="gradient-border p-4 rounded-lg bg-primary/5">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-muted-foreground">Plan</span>
                  <span className="font-bold font-orbitron">{plan.name}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-muted-foreground">Duration</span>
                  <span className="font-medium">{plan.duration}</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-primary/20">
                  <span className="text-lg font-bold">Total</span>
                  <span className="text-2xl font-bold font-orbitron text-primary">
                    ₹{plan.price.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Payment Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Cardholder Name</Label>
                  <Input
                    id="name"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="card">Card Number</Label>
                  <div className="relative">
                    <Input
                      id="card"
                      placeholder="1234 5678 9012 3456"
                      value={cardNumber}
                      onChange={handleCardNumberChange}
                      required
                    />
                    <CreditCard className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="expiry">Expiry Date</Label>
                    <Input
                      id="expiry"
                      placeholder="MM/YY"
                      value={expiry}
                      onChange={handleExpiryChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cvv">CVV</Label>
                    <div className="relative">
                      <Input
                        id="cvv"
                        type="password"
                        placeholder="123"
                        value={cvv}
                        onChange={handleCvvChange}
                        required
                      />
                      <Lock className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/20 p-3 rounded-lg">
                  <Lock className="h-4 w-4 text-primary" />
                  <span>Your payment information is secure and encrypted</span>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onClose}
                    disabled={isProcessing}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isProcessing}
                    className="flex-1 bg-gradient-primary hover:glow-primary"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        Pay ₹{plan.price.toLocaleString('en-IN')}
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </>
        ) : (
          <div className="py-8 text-center">
            <div className="mb-6 flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full animate-pulse" />
                <CheckCircle className="h-24 w-24 text-primary relative" />
              </div>
            </div>
            <h3 className="text-2xl font-bold font-orbitron mb-2 flex items-center justify-center gap-2">
              <Sparkles className="h-6 w-6 text-primary" />
              Payment Successful!
            </h3>
            <p className="text-muted-foreground mb-4">
              Your {plan.name} subscription is now active
            </p>
            <div className="text-sm text-muted-foreground">
              Redirecting...
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
