import { 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  XCircle, 
  RefreshCw,
  Globe,
  Shield,
  Wifi,
  WifiOff,
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { CustomDomain } from '@/hooks/useCustomDomains';

interface DomainStatusAlertProps {
  domain: CustomDomain;
  onVerify?: () => void;
  onRetry?: () => void;
  isVerifying?: boolean;
}

export function DomainStatusAlert({ 
  domain, 
  onVerify, 
  onRetry,
  isVerifying = false,
}: DomainStatusAlertProps) {
  const getStatusConfig = () => {
    switch (domain.status) {
      case 'active':
        return {
          variant: 'default' as const,
          icon: CheckCircle,
          iconClassName: 'text-success',
          title: 'Domain Active',
          description: `Your domain ${domain.domain} is live and serving your profile.`,
          showAction: false,
          bgClass: 'bg-success/5 border-success/20',
        };
      case 'verifying':
        return {
          variant: 'default' as const,
          icon: Clock,
          iconClassName: 'text-warning animate-pulse',
          title: 'Verifying DNS',
          description: 'We\'re checking your DNS configuration. This usually takes a few minutes, but DNS propagation can take up to 72 hours.',
          showAction: true,
          actionLabel: 'Check Again',
          bgClass: 'bg-warning/5 border-warning/20',
        };
      case 'pending':
        return {
          variant: 'default' as const,
          icon: AlertTriangle,
          iconClassName: 'text-warning',
          title: 'DNS Configuration Required',
          description: 'Please configure the DNS records below at your domain registrar, then click verify.',
          showAction: true,
          actionLabel: 'Verify Domain',
          bgClass: 'bg-warning/5 border-warning/20',
        };
      case 'failed':
        return {
          variant: 'destructive' as const,
          icon: XCircle,
          iconClassName: 'text-destructive',
          title: 'Verification Failed',
          description: 'We couldn\'t verify your domain. Please check that your DNS records are correctly configured and try again.',
          showAction: true,
          actionLabel: 'Retry Verification',
          bgClass: 'bg-destructive/5 border-destructive/20',
        };
      default:
        return {
          variant: 'default' as const,
          icon: Globe,
          iconClassName: 'text-muted-foreground',
          title: 'Unknown Status',
          description: 'Please contact support if this persists.',
          showAction: false,
          bgClass: 'bg-muted/50 border-border',
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <Alert className={`${config.bgClass} border`}>
      <Icon className={`h-4 w-4 ${config.iconClassName}`} />
      <AlertTitle className="flex items-center gap-2">
        {config.title}
        {domain.status === 'active' && domain.ssl_status === 'active' && (
          <span className="inline-flex items-center gap-1 text-xs font-normal text-success">
            <Shield className="w-3 h-3" />
            SSL Active
          </span>
        )}
      </AlertTitle>
      <AlertDescription className="mt-2">
        <p className="text-sm">{config.description}</p>
        
        {/* DNS Status Indicators */}
        {(domain.status === 'pending' || domain.status === 'failed' || domain.status === 'verifying') && (
          <div className="flex flex-wrap gap-3 mt-3">
            <div className="flex items-center gap-1.5 text-xs">
              {domain.dns_verified ? (
                <>
                  <Wifi className="w-3.5 h-3.5 text-success" />
                  <span className="text-success">DNS Configured</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-muted-foreground">DNS Pending</span>
                </>
              )}
            </div>
            <div className="flex items-center gap-1.5 text-xs">
              {domain.ssl_status === 'active' ? (
                <>
                  <Shield className="w-3.5 h-3.5 text-success" />
                  <span className="text-success">SSL Active</span>
                </>
              ) : (
                <>
                  <Shield className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-muted-foreground">SSL Pending</span>
                </>
              )}
            </div>
          </div>
        )}

        {config.showAction && (onVerify || onRetry) && (
          <Button
            size="sm"
            variant="outline"
            className="mt-3"
            onClick={domain.status === 'failed' ? onRetry : onVerify}
            disabled={isVerifying}
          >
            {isVerifying ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                Verifying...
              </>
            ) : (
              <>
                <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
                {config.actionLabel}
              </>
            )}
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );
}
