import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Globe,
  Server,
  FileText,
  CheckCircle,
  Copy,
  ExternalLink,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Sparkles,
  Shield,
  Zap,
  Clock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  SERVER_IP, 
  TXT_RECORD_NAME, 
  formatTxtRecordValue,
  generateVerificationToken 
} from '@/config/domain';

interface DomainSetupWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profileId: string;
  onAddDomain: (domain: string) => Promise<{ success: boolean; error?: string; token?: string }>;
}

type WizardStep = 'input' | 'dns-a' | 'dns-txt' | 'verify' | 'success';

const steps: { id: WizardStep; label: string; icon: React.ReactNode }[] = [
  { id: 'input', label: 'Enter Domain', icon: <Globe className="w-4 h-4" /> },
  { id: 'dns-a', label: 'A Record', icon: <Server className="w-4 h-4" /> },
  { id: 'dns-txt', label: 'TXT Record', icon: <FileText className="w-4 h-4" /> },
  { id: 'verify', label: 'Verify', icon: <Shield className="w-4 h-4" /> },
  { id: 'success', label: 'Complete', icon: <CheckCircle className="w-4 h-4" /> },
];

export function DomainSetupWizard({
  open,
  onOpenChange,
  profileId,
  onAddDomain,
}: DomainSetupWizardProps) {
  const [currentStep, setCurrentStep] = useState<WizardStep>('input');
  const [domain, setDomain] = useState('');
  const [verificationToken, setVerificationToken] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const currentStepIndex = steps.findIndex((s) => s.id === currentStep);
  const progress = ((currentStepIndex + 1) / steps.length) * 100;

  const copyToClipboard = async (value: string, field: string) => {
    await navigator.clipboard.writeText(value);
    setCopiedField(field);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleDomainSubmit = () => {
    if (!domain.trim()) {
      toast.error('Please enter a domain');
      return;
    }

    const domainRegex = /^([a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/;
    if (!domainRegex.test(domain.trim())) {
      toast.error('Please enter a valid domain (e.g., example.com)');
      return;
    }

    // Generate verification token using config
    const token = generateVerificationToken(profileId);
    setVerificationToken(token);
    setCurrentStep('dns-a');
  };

  const handleVerify = async () => {
    setIsLoading(true);
    const result = await onAddDomain(domain.trim());
    
    if (result.success) {
      setCurrentStep('success');
    } else {
      toast.error(result.error || 'Verification failed. Please check your DNS records.');
    }
    setIsLoading(false);
  };

  const handleClose = () => {
    onOpenChange(false);
    // Reset after animation
    setTimeout(() => {
      setCurrentStep('input');
      setDomain('');
      setVerificationToken('');
    }, 300);
  };

  const goBack = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setCurrentStep(steps[prevIndex].id);
    }
  };

  const goNext = () => {
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < steps.length) {
      setCurrentStep(steps[nextIndex].id);
    }
  };

  const CopyButton = ({ value, field }: { value: string; field: string }) => (
    <Button
      variant="outline"
      size="sm"
      className="shrink-0 gap-2"
      onClick={() => copyToClipboard(value, field)}
    >
      {copiedField === field ? (
        <>
          <CheckCircle className="w-3.5 h-3.5 text-success" />
          Copied!
        </>
      ) : (
        <>
          <Copy className="w-3.5 h-3.5" />
          Copy
        </>
      )}
    </Button>
  );

  const DnsRecordCard = ({
    type,
    name,
    value,
    description,
  }: {
    type: string;
    name: string;
    value: string;
    description: string;
  }) => (
    <div className="bg-secondary/50 border border-border rounded-xl p-4 space-y-4">
      <div className="flex items-center gap-2">
        <Badge variant="outline" className="font-mono text-xs px-2 py-1">
          {type === 'A' ? <Server className="w-3 h-3 mr-1" /> : <FileText className="w-3 h-3 mr-1" />}
          {type} Record
        </Badge>
        <span className="text-xs text-muted-foreground">{description}</span>
      </div>

      <div className="grid gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground uppercase tracking-wide">
            Name / Host
          </Label>
          <div className="flex items-center gap-2">
            <code className="flex-1 px-3 py-2 bg-background border border-border rounded-lg font-mono text-sm">
              {name}
            </code>
            <CopyButton value={name} field={`${type}-name`} />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground uppercase tracking-wide">
            Value / Points to
          </Label>
          <div className="flex items-center gap-2">
            <code className="flex-1 px-3 py-2 bg-background border border-border rounded-lg font-mono text-sm break-all">
              {value}
            </code>
            <CopyButton value={value} field={`${type}-value`} />
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg p-0 gap-0 overflow-hidden">
        {/* Progress Header */}
        <div className="p-6 pb-4 border-b border-border bg-gradient-to-b from-primary/5 to-transparent">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Globe className="w-5 h-5 text-primary" />
              Connect Your Domain
            </DialogTitle>
          </DialogHeader>

          {/* Step Progress */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              {steps.map((step, index) => (
                <div
                  key={step.id}
                  className={`flex items-center ${
                    index < steps.length - 1 ? 'flex-1' : ''
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-all duration-300 ${
                      index < currentStepIndex
                        ? 'bg-primary text-primary-foreground'
                        : index === currentStepIndex
                        ? 'bg-primary text-primary-foreground ring-4 ring-primary/20'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {index < currentStepIndex ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      step.icon
                    )}
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`flex-1 h-0.5 mx-1 transition-all duration-300 ${
                        index < currentStepIndex ? 'bg-primary' : 'bg-muted'
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
            <p className="text-sm text-muted-foreground text-center mt-3">
              Step {currentStepIndex + 1} of {steps.length}: {steps[currentStepIndex].label}
            </p>
          </div>
        </div>

        {/* Step Content */}
        <div className="p-6 min-h-[320px]">
          <AnimatePresence mode="wait">
            {/* Step 1: Enter Domain */}
            {currentStep === 'input' && (
              <motion.div
                key="input"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="text-center space-y-2">
                  <div className="w-16 h-16 mx-auto bg-primary/10 rounded-2xl flex items-center justify-center">
                    <Globe className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold">Enter your domain</h3>
                  <p className="text-sm text-muted-foreground">
                    Use your own domain like <span className="font-mono text-foreground">yourname.com</span>
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="domain">Domain Name</Label>
                  <Input
                    id="domain"
                    placeholder="example.com"
                    value={domain}
                    onChange={(e) => setDomain(e.target.value.toLowerCase())}
                    className="font-mono text-center text-lg h-12"
                    onKeyDown={(e) => e.key === 'Enter' && handleDomainSubmit()}
                  />
                  <p className="text-xs text-muted-foreground text-center">
                    Don't include http:// or www
                  </p>
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1" onClick={handleClose}>
                    Cancel
                  </Button>
                  <Button className="flex-1 gap-2" onClick={handleDomainSubmit}>
                    Continue
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Step 2: A Record */}
            {currentStep === 'dns-a' && (
              <motion.div
                key="dns-a"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="text-center space-y-2">
                  <div className="w-16 h-16 mx-auto bg-blue-500/10 rounded-2xl flex items-center justify-center">
                    <Server className="w-8 h-8 text-blue-500" />
                  </div>
                  <h3 className="text-lg font-semibold">Add A Record</h3>
                  <p className="text-sm text-muted-foreground">
                    Go to your domain registrar's DNS settings
                  </p>
                </div>

                <DnsRecordCard
                  type="A"
                  name="@"
                  value={SERVER_IP}
                  description="Points your domain to the hosting server"
                />

                {/* Also add www */}
                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="text-xs text-muted-foreground flex items-center gap-2">
                    <Zap className="w-3 h-3 text-warning" />
                    <span>
                      <strong className="text-foreground">Tip:</strong> Also add an A record for{' '}
                      <code className="px-1 py-0.5 bg-secondary rounded">www</code> with the same value
                    </span>
                  </p>
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" onClick={goBack}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>
                  <Button className="flex-1 gap-2" onClick={goNext}>
                    I've Added This
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Step 3: TXT Record */}
            {currentStep === 'dns-txt' && (
              <motion.div
                key="dns-txt"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="text-center space-y-2">
                  <div className="w-16 h-16 mx-auto bg-purple-500/10 rounded-2xl flex items-center justify-center">
                    <FileText className="w-8 h-8 text-purple-500" />
                  </div>
                  <h3 className="text-lg font-semibold">Add TXT Record</h3>
                  <p className="text-sm text-muted-foreground">
                    This verifies you own the domain
                  </p>
                </div>

                <DnsRecordCard
                  type="TXT"
                  name={TXT_RECORD_NAME}
                  value={formatTxtRecordValue(verificationToken)}
                  description="Proves domain ownership"
                />

                <div className="flex gap-3">
                  <Button variant="outline" onClick={goBack}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>
                  <Button className="flex-1 gap-2" onClick={goNext}>
                    I've Added This
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Step 4: Verify */}
            {currentStep === 'verify' && (
              <motion.div
                key="verify"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="text-center space-y-2">
                  <div className="w-16 h-16 mx-auto bg-success/10 rounded-2xl flex items-center justify-center">
                    <Shield className="w-8 h-8 text-success" />
                  </div>
                  <h3 className="text-lg font-semibold">Ready to Verify</h3>
                  <p className="text-sm text-muted-foreground">
                    We'll check if your DNS records are set up correctly
                  </p>
                </div>

                <div className="bg-secondary/50 border border-border rounded-xl p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <Globe className="w-5 h-5 text-primary" />
                    <span className="font-mono">{domain}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2 bg-background rounded-lg">
                      <span className="text-muted-foreground">A Record:</span>
                      <span className="ml-1 font-mono">{SERVER_IP}</span>
                    </div>
                    <div className="p-2 bg-background rounded-lg">
                      <span className="text-muted-foreground">TXT:</span>
                      <span className="ml-1 font-mono">{TXT_RECORD_NAME}</span>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-warning/5 border border-warning/20 rounded-lg">
                  <p className="text-xs text-muted-foreground flex items-start gap-2">
                    <Sparkles className="w-3 h-3 text-warning mt-0.5" />
                    <span>
                      DNS changes can take up to 48 hours to propagate. If verification fails, wait a bit and try again.
                    </span>
                  </p>
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" onClick={goBack}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>
                  <Button
                    className="flex-1 gap-2"
                    onClick={handleVerify}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      <>
                        Verify Domain
                        <CheckCircle className="w-4 h-4" />
                      </>
                    )}
                  </Button>
                </div>

                {/* External tools */}
                <div className="flex justify-center">
                  <Button
                    variant="link"
                    size="sm"
                    className="text-xs text-muted-foreground"
                    onClick={() => window.open('https://dnschecker.org', '_blank')}
                  >
                    <ExternalLink className="w-3 h-3 mr-1" />
                    Check DNS Propagation
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Step 5: Success */}
            {currentStep === 'success' && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-6 text-center"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', delay: 0.1 }}
                  className="w-20 h-20 mx-auto bg-success/10 rounded-full flex items-center justify-center"
                >
                  <CheckCircle className="w-10 h-10 text-success" />
                </motion.div>

                <div className="space-y-2">
                  <h3 className="text-xl font-semibold">DNS Verified!</h3>
                  <p className="text-muted-foreground">
                    Your domain is now pending admin activation
                  </p>
                </div>

                <div className="inline-flex items-center gap-2 px-4 py-2 bg-success/10 border border-success/20 rounded-full">
                  <Globe className="w-4 h-4 text-success" />
                  <span className="font-mono font-medium">{domain}</span>
                </div>

                <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
                  <p className="text-sm text-muted-foreground flex items-start gap-2">
                    <Clock className="w-4 h-4 text-primary mt-0.5" />
                    <span>
                      <strong className="text-foreground">Next step:</strong> Admin will configure your domain on the 
                      server and activate it. You'll be notified when it's live.
                    </span>
                  </p>
                </div>

                <Button className="w-full" onClick={handleClose}>
                  Done
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
}
