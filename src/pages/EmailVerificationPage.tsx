import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, ArrowRight, Loader2, RefreshCw, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { toast } from 'sonner';

export default function EmailVerificationPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = (location.state as { email?: string })?.email || '';
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [verified, setVerified] = useState(false);

  const handleVerify = async () => {
    if (code.length !== 6) {
      toast.error('Please enter the full 6-digit code');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.verifyOtp({
        email,
        token: code,
        type: 'signup',
      });

      if (error) {
        toast.error(error.message || 'Invalid verification code');
      } else {
        setVerified(true);
        toast.success('Email verified successfully!');
        setTimeout(() => navigate('/dashboard', { replace: true }), 1500);
      }
    } catch {
      toast.error('Something went wrong. Please try again.');
    }
    setLoading(false);
  };

  const handleResend = async () => {
    setResending(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
      });
      if (error) {
        toast.error(error.message || 'Failed to resend code');
      } else {
        toast.success('Verification code resent! Check your inbox.');
      }
    } catch {
      toast.error('Failed to resend. Please try again.');
    }
    setResending(false);
  };

  if (!email) {
    navigate('/auth', { replace: true });
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-primary/10 flex items-center justify-center">
            {verified ? (
              <CheckCircle2 className="w-8 h-8 text-green-500" />
            ) : (
              <Mail className="w-8 h-8 text-primary" />
            )}
          </div>

          <h1 className="text-2xl font-display font-bold text-foreground mb-2">
            {verified ? 'Email Verified!' : 'Check your email'}
          </h1>
          <p className="text-muted-foreground">
            {verified
              ? 'Redirecting you to the dashboard...'
              : (
                <>
                  We sent a 6-digit verification code to{' '}
                  <span className="font-medium text-foreground">{email}</span>
                </>
              )}
          </p>
        </div>

        {!verified && (
          <div className="space-y-6">
            <div className="flex justify-center">
              <InputOTP
                maxLength={6}
                value={code}
                onChange={setCode}
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
            </div>

            <Button
              onClick={handleVerify}
              disabled={loading || code.length !== 6}
              className="w-full btn-primary"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Verify Email
                  <ArrowRight className="w-5 h-5 ml-2" />
                </>
              )}
            </Button>

            <div className="text-center space-y-3">
              <p className="text-sm text-muted-foreground">
                Didn't receive the code?
              </p>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleResend}
                disabled={resending}
              >
                {resending ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <RefreshCw className="w-4 h-4 mr-2" />
                )}
                Resend Code
              </Button>
            </div>

            <div className="text-center">
              <button
                type="button"
                onClick={() => navigate('/auth')}
                className="text-sm text-primary hover:underline"
              >
                ← Back to Sign In
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
