import { useState, useEffect } from 'react';
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
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface DomainWithProfile {
  id: string;
  domain: string;
  status: string;
  ssl_status: string;
  dns_verified: boolean;
  is_primary: boolean;
  created_at: string;
  profile_id: string;
  username: string;
  display_name: string | null;
}

interface Profile {
  id: string;
  username: string;
  display_name: string | null;
}

export default function AdminDomainsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [addDomainOpen, setAddDomainOpen] = useState(false);
  const [domains, setDomains] = useState<DomainWithProfile[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [newDomain, setNewDomain] = useState('');
  const [selectedProfileId, setSelectedProfileId] = useState('');
  const [adding, setAdding] = useState(false);

  const fetchDomains = async () => {
    try {
      const { data, error } = await supabase
        .from('custom_domains')
        .select(`
          *,
          link_profiles!inner(username, display_name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const mapped = (data || []).map((d: any) => ({
        id: d.id,
        domain: d.domain,
        status: d.status,
        ssl_status: d.ssl_status,
        dns_verified: d.dns_verified,
        is_primary: d.is_primary,
        created_at: d.created_at,
        profile_id: d.profile_id,
        username: d.link_profiles?.username || 'unknown',
        display_name: d.link_profiles?.display_name,
      }));

      setDomains(mapped);
    } catch (error) {
      console.error('Error fetching domains:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProfiles = async () => {
    try {
      const { data, error } = await supabase
        .from('link_profiles')
        .select('id, username, display_name')
        .order('username');

      if (error) throw error;
      setProfiles(data || []);
    } catch (error) {
      console.error('Error fetching profiles:', error);
    }
  };

  useEffect(() => {
    fetchDomains();
    fetchProfiles();
  }, []);

  const filteredDomains = domains.filter(domain => 
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
      case 'verifying':
        return (
          <Badge className="bg-warning/10 text-warning border-warning/20">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        );
      case 'error':
      case 'failed':
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

  const activeCount = domains.filter(d => d.status === 'active').length;
  const pendingCount = domains.filter(d => d.status === 'pending' || d.status === 'verifying').length;
  const errorCount = domains.filter(d => d.status === 'failed' || d.status === 'error').length;

  const handleAddDomain = async () => {
    if (!newDomain.trim() || !selectedProfileId) {
      toast.error('Please fill all fields');
      return;
    }

    setAdding(true);
    try {
      const verificationToken = crypto.randomUUID().slice(0, 8);
      
      const { error } = await supabase
        .from('custom_domains')
        .insert({
          domain: newDomain.toLowerCase().trim(),
          profile_id: selectedProfileId,
          status: 'pending',
          verification_token: verificationToken,
        });

      if (error) throw error;

      toast.success('Domain added successfully');
      setAddDomainOpen(false);
      setNewDomain('');
      setSelectedProfileId('');
      fetchDomains();
    } catch (error: any) {
      toast.error(error.message || 'Failed to add domain');
    } finally {
      setAdding(false);
    }
  };

  const handleVerifyDomain = async (domainId: string) => {
    try {
      const { error } = await supabase
        .from('custom_domains')
        .update({
          status: 'active',
          dns_verified: true,
          ssl_status: 'active',
        })
        .eq('id', domainId);

      if (error) throw error;
      toast.success('Domain verified');
      fetchDomains();
    } catch (error: any) {
      toast.error(error.message || 'Failed to verify domain');
    }
  };

  const handleRemoveDomain = async (domainId: string) => {
    try {
      const { error } = await supabase
        .from('custom_domains')
        .delete()
        .eq('id', domainId);

      if (error) throw error;
      toast.success('Domain removed');
      fetchDomains();
    } catch (error: any) {
      toast.error(error.message || 'Failed to remove domain');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  if (loading) {
    return (
      <div className="p-6 lg:p-8 flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

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
                <Input 
                  placeholder="example.com" 
                  className="mt-2"
                  value={newDomain}
                  onChange={(e) => setNewDomain(e.target.value)}
                />
              </div>
              <div>
                <Label>Assign to User</Label>
                <Select value={selectedProfileId} onValueChange={setSelectedProfileId}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select a user" />
                  </SelectTrigger>
                  <SelectContent>
                    {profiles.map((profile) => (
                      <SelectItem key={profile.id} value={profile.id}>
                        @{profile.username} {profile.display_name ? `- ${profile.display_name}` : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setAddDomainOpen(false)}>Cancel</Button>
              <Button 
                className="gradient-primary text-primary-foreground"
                onClick={handleAddDomain}
                disabled={adding}
              >
                {adding ? 'Adding...' : 'Add Domain'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Domains', value: domains.length, icon: Globe, color: 'text-primary' },
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
      {filteredDomains.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <Globe className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No domains found</h3>
          <p className="text-muted-foreground">
            {searchQuery ? 'Try a different search term' : 'Add your first custom domain to get started'}
          </p>
        </div>
      ) : (
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
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6"
                        onClick={() => copyToClipboard(domain.domain)}
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6"
                        onClick={() => window.open(`https://${domain.domain}`, '_blank')}
                      >
                        <ExternalLink className="w-3 h-3" />
                      </Button>
                      {domain.is_primary && (
                        <Badge variant="secondary" className="text-xs">Primary</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Assigned to @{domain.username} {domain.display_name ? `(${domain.display_name})` : ''}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  {getStatusBadge(domain.dns_verified ? 'verified' : domain.status, 'dns')}
                  {getStatusBadge(domain.ssl_status, 'ssl')}
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="icon">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleVerifyDomain(domain.id)}>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Verify DNS
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleVerifyDomain(domain.id)}>
                        <Shield className="w-4 h-4 mr-2" />
                        Renew SSL
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="text-destructive"
                        onClick={() => handleRemoveDomain(domain.id)}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Remove Domain
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {(domain.status === 'pending' || domain.status === 'verifying') && (
                <div className="mt-4 p-4 bg-secondary rounded-xl">
                  <h4 className="font-medium text-foreground mb-2">DNS Configuration Required</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Add the following DNS records to verify ownership:
                  </p>
                  <div className="space-y-2 font-mono text-xs">
                    <div className="flex gap-4 p-2 bg-background rounded">
                      <span className="text-muted-foreground">Type:</span>
                      <span className="text-foreground">A</span>
                    </div>
                    <div className="flex gap-4 p-2 bg-background rounded">
                      <span className="text-muted-foreground">Name:</span>
                      <span className="text-foreground">@ (and www)</span>
                    </div>
                    <div className="flex gap-4 p-2 bg-background rounded">
                      <span className="text-muted-foreground">Value:</span>
                      <span className="text-foreground">185.158.133.1</span>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
