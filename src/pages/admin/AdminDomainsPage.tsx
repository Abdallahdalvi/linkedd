import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Globe,
  Plus,
  Search,
  CheckCircle,
  XCircle,
  Clock,
  Shield,
  ExternalLink,
  Copy,
  MoreVertical,
  RefreshCw,
  Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const mockDomains = [
  { 
    id: '1', 
    domain: 'sarahj.link', 
    username: 'sarahj',
    type: 'custom',
    sslStatus: 'active',
    dnsStatus: 'verified',
    createdAt: '2025-11-15',
  },
  { 
    id: '2', 
    domain: 'mikechen.bio', 
    username: 'mikechen',
    type: 'custom',
    sslStatus: 'active',
    dnsStatus: 'verified',
    createdAt: '2025-12-01',
  },
  { 
    id: '3', 
    domain: 'links.emilyd.com', 
    username: 'emilyd',
    type: 'subdomain',
    sslStatus: 'pending',
    dnsStatus: 'pending',
    createdAt: '2026-01-02',
  },
  { 
    id: '4', 
    domain: 'alexr.me', 
    username: 'alexr',
    type: 'custom',
    sslStatus: 'error',
    dnsStatus: 'error',
    createdAt: '2025-10-20',
  },
  { 
    id: '5', 
    domain: 'jordan.linkbio.app', 
    username: 'jordanl',
    type: 'subdomain',
    sslStatus: 'active',
    dnsStatus: 'verified',
    createdAt: '2025-12-15',
  },
];

export default function AdminDomainsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [addDomainOpen, setAddDomainOpen] = useState(false);

  const filteredDomains = mockDomains.filter(domain => 
    domain.domain.toLowerCase().includes(searchQuery.toLowerCase()) ||
    domain.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusBadge = (status: string, type: 'ssl' | 'dns') => {
    switch (status) {
      case 'active':
      case 'verified':
        return (
          <Badge className="bg-success/10 text-success border-success/20">
            <CheckCircle className="w-3 h-3 mr-1" />
            {type === 'ssl' ? 'SSL Active' : 'Verified'}
          </Badge>
        );
      case 'pending':
        return (
          <Badge className="bg-warning/10 text-warning border-warning/20">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        );
      case 'error':
        return (
          <Badge className="bg-destructive/10 text-destructive border-destructive/20">
            <XCircle className="w-3 h-3 mr-1" />
            Error
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const activeCount = mockDomains.filter(d => d.dnsStatus === 'verified').length;
  const pendingCount = mockDomains.filter(d => d.dnsStatus === 'pending').length;
  const errorCount = mockDomains.filter(d => d.dnsStatus === 'error').length;

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground flex items-center gap-3">
            <Globe className="w-7 h-7 text-primary" />
            Domain Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage custom domains and subdomains for clients
          </p>
        </div>
        
        <Dialog open={addDomainOpen} onOpenChange={setAddDomainOpen}>
          <DialogTrigger asChild>
            <Button className="gradient-primary text-primary-foreground">
              <Plus className="w-4 h-4 mr-2" />
              Add Domain
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Custom Domain</DialogTitle>
              <DialogDescription>
                Assign a custom domain or subdomain to a client profile
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label>Domain</Label>
                <Input placeholder="example.com" className="mt-2" />
              </div>
              <div>
                <Label>Assign to User</Label>
                <Select>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select a user" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sarahj">@sarahj - Sarah Johnson</SelectItem>
                    <SelectItem value="mikechen">@mikechen - Mike Chen</SelectItem>
                    <SelectItem value="emilyd">@emilyd - Emily Davis</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Type</Label>
                <Select defaultValue="custom">
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="custom">Custom Domain</SelectItem>
                    <SelectItem value="subdomain">Subdomain</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setAddDomainOpen(false)}>Cancel</Button>
              <Button className="gradient-primary text-primary-foreground">Add Domain</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Domains', value: mockDomains.length, icon: Globe, color: 'text-primary' },
          { label: 'Active', value: activeCount, icon: CheckCircle, color: 'text-success' },
          { label: 'Pending', value: pendingCount, icon: Clock, color: 'text-warning' },
          { label: 'Errors', value: errorCount, icon: XCircle, color: 'text-destructive' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="stat-card"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Search */}
      <div className="glass-card p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search domains or users..." 
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Domains List */}
      <div className="space-y-4">
        {filteredDomains.map((domain, i) => (
          <motion.div
            key={domain.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="glass-card p-6"
          >
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Globe className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-foreground">{domain.domain}</h3>
                    <Button variant="ghost" size="icon" className="h-6 w-6">
                      <Copy className="w-3 h-3" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-6 w-6">
                      <ExternalLink className="w-3 h-3" />
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Assigned to @{domain.username} • {domain.type === 'custom' ? 'Custom Domain' : 'Subdomain'}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {getStatusBadge(domain.dnsStatus, 'dns')}
                {getStatusBadge(domain.sslStatus, 'ssl')}
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Verify DNS
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Shield className="w-4 h-4 mr-2" />
                      Renew SSL
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Remove Domain
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {(domain.dnsStatus === 'pending' || domain.dnsStatus === 'error') && (
              <div className="mt-4 p-4 bg-secondary rounded-xl">
                <h4 className="font-medium text-foreground mb-2">DNS Configuration Required</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Add the following DNS records to verify ownership:
                </p>
                <div className="space-y-2 font-mono text-xs">
                  <div className="flex gap-4 p-2 bg-background rounded">
                    <span className="text-muted-foreground">Type:</span>
                    <span className="text-foreground">CNAME</span>
                  </div>
                  <div className="flex gap-4 p-2 bg-background rounded">
                    <span className="text-muted-foreground">Name:</span>
                    <span className="text-foreground">@</span>
                  </div>
                  <div className="flex gap-4 p-2 bg-background rounded">
                    <span className="text-muted-foreground">Value:</span>
                    <span className="text-foreground">cname.linkbio.app</span>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
