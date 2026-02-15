import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { t } from '@/lib/schema-prefix';
import { useAuth } from '@/contexts/AuthContext';
import { Block } from '@/hooks/useLinkProfile';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ClipboardList, Download, Trash2, Search, Users, Mail, Phone } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface Lead {
  id: string;
  block_id: string;
  profile_id: string;
  visitor_id: string | null;
  name: string | null;
  email: string | null;
  phone: string | null;
  created_at: string;
  block_title?: string;
  block_type?: string;
}

interface DashboardLeadsPageProps {
  profile: any;
  blocks: Block[];
}

export default function DashboardLeadsPage({ profile, blocks }: DashboardLeadsPageProps) {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterBlock, setFilterBlock] = useState<string>('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!profile?.id) return;
    fetchLeads();
  }, [profile?.id]);

  const fetchLeads = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from(t('block_leads'))
      .select('*')
      .eq('profile_id', profile.id)
      .order('created_at', { ascending: false });

    if (!error && data) {
      const enriched = data.map((lead) => {
        const block = blocks.find((b) => b.id === lead.block_id);
        return {
          ...lead,
          block_title: block?.title || 'Unknown Block',
          block_type: block?.type || 'unknown',
        };
      });
      setLeads(enriched);
    }
    setLoading(false);
  };

  const filtered = useMemo(() => {
    let result = leads;
    if (filterBlock !== 'all') {
      result = result.filter((l) => l.block_id === filterBlock);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (l) =>
          l.name?.toLowerCase().includes(q) ||
          l.email?.toLowerCase().includes(q) ||
          l.phone?.toLowerCase().includes(q)
      );
    }
    return result;
  }, [leads, filterBlock, search]);

  const stats = useMemo(() => {
    const today = new Date().toDateString();
    return {
      total: leads.length,
      today: leads.filter((l) => new Date(l.created_at).toDateString() === today).length,
      emails: new Set(leads.map((l) => l.email).filter(Boolean)).size,
      phones: new Set(leads.map((l) => l.phone).filter(Boolean)).size,
    };
  }, [leads]);

  const gatedBlocks = blocks.filter((b) => {
    const content = b.content as Record<string, unknown> | null;
    return content?.data_gate_enabled;
  });

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from(t('block_leads')).delete().eq('id', id);
    if (!error) {
      setLeads((prev) => prev.filter((l) => l.id !== id));
      toast.success('Lead deleted');
    } else {
      toast.error('Failed to delete lead');
    }
  };

  const exportCSV = () => {
    const headers = ['Name', 'Email', 'Phone', 'Block', 'Type', 'Date'];
    const rows = filtered.map((l) => [
      l.name || '',
      l.email || '',
      l.phone || '',
      l.block_title || '',
      l.block_type || '',
      format(new Date(l.created_at), 'yyyy-MM-dd HH:mm'),
    ]);
    const csv = [headers, ...rows].map((r) => r.map((c) => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `leads-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('CSV exported');
  };

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold">Leads</h1>
          <p className="text-muted-foreground text-sm">Visitor data collected from your blocks</p>
        </div>
        <Button onClick={exportCSV} disabled={filtered.length === 0} variant="outline" className="gap-2">
          <Download className="w-4 h-4" />
          Export CSV
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Leads', value: stats.total, icon: Users },
          { label: 'Today', value: stats.today, icon: ClipboardList },
          { label: 'Unique Emails', value: stats.emails, icon: Mail },
          { label: 'Unique Phones', value: stats.phones, icon: Phone },
        ].map((s) => (
          <div key={s.label} className="p-4 rounded-xl border bg-card">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <s.icon className="w-4 h-4" />
              <span className="text-xs">{s.label}</span>
            </div>
            <p className="text-2xl font-bold">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterBlock} onValueChange={setFilterBlock}>
          <SelectTrigger className="w-full sm:w-[220px]">
            <SelectValue placeholder="Filter by block" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All blocks</SelectItem>
            {gatedBlocks.map((b) => (
              <SelectItem key={b.id} value={b.id}>
                {b.title || 'Untitled'} ({b.type})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <ClipboardList className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium">No leads yet</p>
          <p className="text-sm">Enable data collection on your blocks to start collecting visitor info.</p>
        </div>
      ) : (
        <div className="rounded-xl border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Block</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((lead) => (
                <TableRow key={lead.id}>
                  <TableCell className="font-medium">{lead.name || '—'}</TableCell>
                  <TableCell>{lead.email || '—'}</TableCell>
                  <TableCell>{lead.phone || '—'}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="truncate max-w-[120px]">{lead.block_title}</span>
                      <Badge variant="secondary" className="text-[10px]">{lead.block_type}</Badge>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {format(new Date(lead.created_at), 'MMM d, yyyy')}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={() => handleDelete(lead.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
