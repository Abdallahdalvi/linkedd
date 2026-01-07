import { Copy, CheckCircle, AlertTriangle, ExternalLink, Server, FileText, Shield, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

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
}

export function DnsInstructions({ 
  domain, 
  verificationToken,
  showVerificationStatus = false,
  aRecordVerified = false,
  txtRecordVerified = false,
  onRegenerateToken,
  isRegenerating = false,
}: DnsInstructionsProps) {
  const isRootDomain = domain.split('.').length === 2 && !domain.startsWith('www.');
  
  const records: DnsRecord[] = [
    {
      type: 'A',
      name: '@',
      value: '185.158.133.1',
      description: 'Points your root domain to Lovable servers',
      isVerified: aRecordVerified,
    },
    ...(isRootDomain ? [{
      type: 'A' as const,
      name: 'www',
      value: '185.158.133.1',
      description: 'Points www subdomain to Lovable servers',
      isVerified: aRecordVerified,
    }] : []),
    {
      type: 'TXT',
      name: '_lovable',
      value: `lovable_verify=${verificationToken}`,
      description: 'Verifies domain ownership',
      isVerified: txtRecordVerified,
    },
  ];

  const copyToClipboard = (value: string, label: string) => {
    navigator.clipboard.writeText(value);
    toast.success(`${label} copied to clipboard!`);
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

  return (
    <div className="space-y-4">
      {/* DNS Records Table */}
      <div className="border border-border rounded-lg overflow-hidden">
        <div className="bg-muted/50 px-4 py-3 border-b border-border">
          <h4 className="font-medium text-sm text-foreground">Required DNS Records</h4>
          <p className="text-xs text-muted-foreground mt-1">
            Add these records at your domain registrar (GoDaddy, Namecheap, Cloudflare, etc.)
          </p>
        </div>
        
        <div className="divide-y divide-border">
          {records.map((record, index) => (
            <div 
              key={`${record.type}-${record.name}-${index}`} 
              className="p-4 hover:bg-muted/30 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-2">
                  {/* Record Type Badge */}
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="gap-1.5 font-mono text-xs">
                      {getRecordIcon(record.type)}
                      {record.type} Record
                    </Badge>
                    {showVerificationStatus && (
                      record.isVerified ? (
                        <Badge className="bg-success/10 text-success border-success/20 text-xs">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Verified
                        </Badge>
                      ) : (
                        <Badge className="bg-warning/10 text-warning border-warning/20 text-xs">
                          <AlertTriangle className="w-3 h-3 mr-1" />
                          Pending
                        </Badge>
                      )
                    )}
                  </div>

                  {/* Record Details */}
                  <div className="grid grid-cols-2 gap-4 mt-3">
                    <div>
                      <label className="text-xs text-muted-foreground uppercase tracking-wide">Name / Host</label>
                      <div className="flex items-center gap-2 mt-1">
                        <code className="flex-1 px-2 py-1.5 bg-secondary rounded text-sm font-mono">
                          {record.name}
                        </code>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => copyToClipboard(record.name, 'Name')}
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground uppercase tracking-wide">Value / Points to</label>
                      <div className="flex items-center gap-2 mt-1">
                        <code className="flex-1 px-2 py-1.5 bg-secondary rounded text-sm font-mono truncate">
                          {record.value}
                        </code>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => copyToClipboard(record.value, 'Value')}
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-2">
                    <p className="text-xs text-muted-foreground">
                      {record.description}
                    </p>
                    {record.type === 'TXT' && onRegenerateToken && !record.isVerified && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs h-7"
                        onClick={onRegenerateToken}
                        disabled={isRegenerating}
                      >
                        <RefreshCw className={`w-3 h-3 mr-1 ${isRegenerating ? 'animate-spin' : ''}`} />
                        {isRegenerating ? 'Regenerating...' : 'New Token'}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* TTL Note */}
      <div className="p-3 bg-muted/50 rounded-lg">
        <p className="text-xs text-muted-foreground">
          <strong className="text-foreground">TTL:</strong> Use the default or set to 3600 (1 hour). Lower values allow faster updates.
        </p>
      </div>

      {/* Helpful Links */}
      <div className="flex flex-wrap gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          className="text-xs"
          onClick={() => window.open('https://dnschecker.org', '_blank')}
        >
          <ExternalLink className="w-3 h-3 mr-1.5" />
          Check DNS Propagation
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          className="text-xs"
          onClick={() => window.open('https://docs.lovable.dev/features/custom-domain', '_blank')}
        >
          <ExternalLink className="w-3 h-3 mr-1.5" />
          Documentation
        </Button>
      </div>
    </div>
  );
}
