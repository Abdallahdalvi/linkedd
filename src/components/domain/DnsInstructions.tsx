import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Copy, 
  CheckCircle, 
  AlertTriangle, 
  ExternalLink, 
  Server, 
  FileText, 
  Shield, 
  RefreshCw,
  ChevronRight,
  Zap,
  HelpCircle,
  Clock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { 
  SERVER_IP, 
  TXT_RECORD_NAME, 
  formatTxtRecordValue 
} from '@/config/domain';

interface DnsRecord {
  type: 'A' | 'TXT' | 'CNAME';
  name: string;
  value: string;
  description: string;
  isVerified?: boolean;
}

interface DnsInstructionsProps {
  domain: string;
  verificationToken: string;
  showVerificationStatus?: boolean;
  aRecordVerified?: boolean;
  txtRecordVerified?: boolean;
  onRegenerateToken?: () => void;
  isRegenerating?: boolean;
  compact?: boolean;
}

// Popular DNS provider guides (Hostinger-focused)
const dnsProviders = [
  { name: 'Hostinger', url: 'https://support.hostinger.com/en/articles/1583227-how-to-manage-dns-zone' },
  { name: 'GoDaddy', url: 'https://www.godaddy.com/help/manage-dns-records-680' },
  { name: 'Namecheap', url: 'https://www.namecheap.com/support/knowledgebase/article.aspx/319/2237/' },
  { name: 'Google Domains', url: 'https://support.google.com/domains/answer/3290350' },
];

export function DnsInstructions({ 
  domain, 
  verificationToken,
  showVerificationStatus = false,
  aRecordVerified = false,
  txtRecordVerified = false,
  onRegenerateToken,
  isRegenerating = false,
  compact = false,
}: DnsInstructionsProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const isRootDomain = domain.split('.').length === 2 && !domain.startsWith('www.');
  
  const records: DnsRecord[] = [
    {
      type: 'A',
      name: '@',
      value: SERVER_IP,
      description: 'Points your root domain to the hosting server',
      isVerified: aRecordVerified,
    },
    ...(isRootDomain ? [{
      type: 'A' as const,
      name: 'www',
      value: SERVER_IP,
      description: 'Points www subdomain to the hosting server',
      isVerified: aRecordVerified,
    }] : []),
    {
      type: 'TXT',
      name: TXT_RECORD_NAME,
      value: formatTxtRecordValue(verificationToken),
      description: 'Verifies domain ownership',
      isVerified: txtRecordVerified,
    },
  ];

  const copyToClipboard = async (value: string, field: string) => {
    await navigator.clipboard.writeText(value);
    setCopiedField(field);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopiedField(null), 2000);
  };

  const getRecordIcon = (type: string) => {
    switch (type) {
      case 'A':
        return <Server className="w-4 h-4" />;
      case 'TXT':
        return <FileText className="w-4 h-4" />;
      case 'CNAME':
        return <Shield className="w-4 h-4" />;
      default:
        return <Server className="w-4 h-4" />;
    }
  };

  const CopyButton = ({ value, field, size = 'default' }: { value: string; field: string; size?: 'default' | 'sm' }) => (
    <Button 
      variant="ghost" 
      size={size === 'sm' ? 'icon' : 'sm'}
      className={size === 'sm' ? 'h-7 w-7' : 'h-8 gap-1.5'}
      onClick={() => copyToClipboard(value, field)}
    >
      <AnimatePresence mode="wait">
        {copiedField === field ? (
          <motion.div
            key="check"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
          >
            <CheckCircle className="w-3.5 h-3.5 text-success" />
          </motion.div>
        ) : (
          <motion.div
            key="copy"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
          >
            <Copy className="w-3.5 h-3.5" />
          </motion.div>
        )}
      </AnimatePresence>
      {size !== 'sm' && (copiedField === field ? 'Copied!' : 'Copy')}
    </Button>
  );

  if (compact) {
    return (
      <div className="space-y-3">
        {records.map((record, index) => (
          <div 
            key={`${record.type}-${record.name}-${index}`}
            className="flex items-center gap-3 p-3 bg-secondary/50 rounded-lg"
          >
            <Badge variant="outline" className="font-mono text-xs shrink-0">
              {record.type}
            </Badge>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <code className="text-xs font-mono text-muted-foreground">{record.name}</code>
                <ChevronRight className="w-3 h-3 text-muted-foreground" />
                <code className="text-xs font-mono truncate">{record.value}</code>
              </div>
            </div>
            <CopyButton value={record.value} field={`${record.type}-${record.name}`} size="sm" />
            {showVerificationStatus && (
              record.isVerified ? (
                <CheckCircle className="w-4 h-4 text-success shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-warning shrink-0" />
              )
            )}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Server className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h4 className="font-medium text-sm text-foreground">DNS Configuration</h4>
            <p className="text-xs text-muted-foreground">Add these records at your registrar</p>
          </div>
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <HelpCircle className="w-4 h-4 text-muted-foreground" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left" className="max-w-xs">
              <p className="text-xs">
                DNS changes can take 24-48 hours to propagate worldwide. If verification fails, wait and try again.
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* DNS Records */}
      <div className="space-y-3">
        {records.map((record, index) => (
          <motion.div
            key={`${record.type}-${record.name}-${index}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-secondary/30 border border-border rounded-xl overflow-hidden"
          >
            <div className="p-4 space-y-3">
              {/* Record Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge 
                    variant="outline" 
                    className={`gap-1.5 font-mono text-xs ${
                      record.type === 'A' 
                        ? 'border-blue-500/30 bg-blue-500/5 text-blue-600 dark:text-blue-400' 
                        : 'border-purple-500/30 bg-purple-500/5 text-purple-600 dark:text-purple-400'
                    }`}
                  >
                    {getRecordIcon(record.type)}
                    {record.type} Record
                  </Badge>
                  {showVerificationStatus && (
                    <AnimatePresence>
                      {record.isVerified ? (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                        >
                          <Badge className="bg-success/10 text-success border-success/20 text-xs gap-1">
                            <CheckCircle className="w-3 h-3" />
                            Verified
                          </Badge>
                        </motion.div>
                      ) : (
                        <Badge className="bg-warning/10 text-warning border-warning/20 text-xs gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          Pending
                        </Badge>
                      )}
                    </AnimatePresence>
                  )}
                </div>
                {record.type === 'TXT' && onRegenerateToken && !record.isVerified && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs h-7 gap-1"
                    onClick={onRegenerateToken}
                    disabled={isRegenerating}
                  >
                    <RefreshCw className={`w-3 h-3 ${isRegenerating ? 'animate-spin' : ''}`} />
                    {isRegenerating ? 'Regenerating...' : 'New Token'}
                  </Button>
                )}
              </div>

              {/* Record Details */}
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
                    Name / Host
                  </label>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 px-3 py-2 bg-background border border-border rounded-lg text-sm font-mono">
                      {record.name}
                    </code>
                    <CopyButton value={record.name} field={`${record.type}-name-${index}`} size="sm" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
                    Value / Points to
                  </label>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 px-3 py-2 bg-background border border-border rounded-lg text-sm font-mono truncate">
                      {record.value}
                    </code>
                    <CopyButton value={record.value} field={`${record.type}-value-${index}`} size="sm" />
                  </div>
                </div>
              </div>

              {/* Description */}
              <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Zap className="w-3 h-3 text-warning" />
                {record.description}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* TTL Note */}
      <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
        <p className="text-xs text-muted-foreground">
          <strong className="text-foreground">TTL (Time To Live):</strong> Use default or set to 3600 (1 hour). Lower values allow faster updates.
        </p>
      </div>

      {/* Provider Guides */}
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="guides" className="border-none">
          <AccordionTrigger className="text-sm text-muted-foreground hover:text-foreground py-2 hover:no-underline">
            <span className="flex items-center gap-2">
              <HelpCircle className="w-4 h-4" />
              DNS Provider Guides
            </span>
          </AccordionTrigger>
          <AccordionContent>
            <div className="grid grid-cols-2 gap-2 pt-2">
              {dnsProviders.map((provider) => (
                <Button
                  key={provider.name}
                  variant="outline"
                  size="sm"
                  className="text-xs justify-start"
                  onClick={() => window.open(provider.url, '_blank')}
                >
                  <ExternalLink className="w-3 h-3 mr-1.5" />
                  {provider.name}
                </Button>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* Admin Approval Notice */}
      <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
        <p className="text-xs text-muted-foreground flex items-start gap-2">
          <Clock className="w-3 h-3 text-primary mt-0.5" />
          <span>
            <strong className="text-foreground">After verification:</strong> Domain activation requires admin approval. 
            You'll be notified when your domain is live.
          </span>
        </p>
      </div>

      {/* Helpful Links */}
      <div className="flex flex-wrap gap-2 pt-2">
        <Button 
          variant="outline" 
          size="sm" 
          className="text-xs gap-1.5"
          onClick={() => window.open('https://dnschecker.org', '_blank')}
        >
          <ExternalLink className="w-3 h-3" />
          Check DNS Propagation
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          className="text-xs gap-1.5"
          onClick={() => window.open('https://support.hostinger.com/en/articles/1583227-how-to-manage-dns-zone', '_blank')}
        >
          <ExternalLink className="w-3 h-3" />
          Hostinger DNS Guide
        </Button>
      </div>
    </div>
  );
}
