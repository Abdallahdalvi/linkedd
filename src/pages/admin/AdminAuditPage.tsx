import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  FileText,
  Search,
  Download,
  Calendar,
  User,
  Shield,
  Settings,
  Trash2,
  Edit,
  Eye,
  LogIn,
  LogOut,
  UserPlus,
  Ban,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface AuditLog {
  id: string;
  action: string;
  actor: string;
  actorRole: string;
  target: string | null;
  details: string;
  timestamp: string;
  ipAddress: string;
}

const actionIcons: Record<string, typeof User> = {
  user_login: LogIn,
  user_logout: LogOut,
  user_created: UserPlus,
  user_suspended: Ban,
  block_deleted: Trash2,
  settings_updated: Settings,
  profile_viewed: Eye,
  role_changed: Shield,
  profile_updated: Edit,
};

const actionColors: Record<string, string> = {
  user_login: 'text-success',
  user_logout: 'text-muted-foreground',
  user_created: 'text-primary',
  user_suspended: 'text-destructive',
  block_deleted: 'text-warning',
  settings_updated: 'text-accent',
  profile_viewed: 'text-primary',
  role_changed: 'text-accent',
  profile_updated: 'text-primary',
};

export default function AdminAuditPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  const fetchAuditLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;

      // Fetch user emails for user_ids
      const userIds = [...new Set((data || []).map(log => log.user_id).filter(Boolean))];
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, email')
        .in('id', userIds);

      const emailMap: Record<string, string> = {};
      profilesData?.forEach((p) => {
        emailMap[p.id] = p.email;
      });

      // Fetch user roles
      const { data: rolesData } = await supabase
        .from('user_roles')
        .select('user_id, role')
        .in('user_id', userIds);

      const roleMap: Record<string, string> = {};
      rolesData?.forEach((r) => {
        if (!roleMap[r.user_id] || r.role === 'super_admin' || (r.role === 'admin' && roleMap[r.user_id] === 'client')) {
          roleMap[r.user_id] = r.role;
        }
      });

      const logs: AuditLog[] = (data || []).map((log) => ({
        id: log.id,
        action: log.action,
        actor: log.user_id ? emailMap[log.user_id] || 'Unknown' : 'System',
        actorRole: log.user_id ? roleMap[log.user_id] || 'client' : 'system',
        target: log.entity_type ? `${log.entity_type}:${log.entity_id?.slice(0, 8) || ''}` : null,
        details: typeof log.details === 'object' ? JSON.stringify(log.details) : String(log.details || ''),
        timestamp: new Date(log.created_at).toLocaleString(),
        ipAddress: log.ip_address || 'N/A',
      }));

      setAuditLogs(logs);
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      toast.error('Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = auditLogs.filter(log => {
    const matchesSearch = 
      log.actor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.target?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
      log.details.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesAction = actionFilter === 'all' || log.action === actionFilter;
    return matchesSearch && matchesAction;
  });

  const formatAction = (action: string) => {
    return action.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const uniqueActions = [...new Set(auditLogs.map(log => log.action))];
  const todayCount = auditLogs.filter(log => {
    const logDate = new Date(log.timestamp).toDateString();
    return logDate === new Date().toDateString();
  }).length;

  const uniqueActors = new Set(auditLogs.map(log => log.actor)).size;

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
            <FileText className="w-7 h-7 text-primary" />
            Audit Log
          </h1>
          <p className="text-muted-foreground mt-1">
            Track all administrative actions and changes
          </p>
        </div>
        
        <Button variant="outline" onClick={() => {
          const blob = new Blob([JSON.stringify(filteredLogs, null, 2)], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.json`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          toast.success('Audit logs exported');
        }}>
          <Download className="w-4 h-4 mr-2" />
          Export Logs
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Actions', value: auditLogs.length.toLocaleString(), icon: FileText, color: 'text-primary' },
          { label: 'Today', value: todayCount.toLocaleString(), icon: Calendar, color: 'text-success' },
          { label: 'Unique Actors', value: uniqueActors.toLocaleString(), icon: User, color: 'text-accent' },
          { label: 'Action Types', value: uniqueActions.length.toLocaleString(), icon: Shield, color: 'text-warning' },
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

      {/* Filters */}
      <div className="glass-card p-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search by actor, target, or details..." 
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-3">
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Action Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>
                {uniqueActions.map((action) => (
                  <SelectItem key={action} value={action}>{formatAction(action)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Audit Log Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card overflow-hidden"
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Action</TableHead>
              <TableHead>Actor</TableHead>
              <TableHead>Target</TableHead>
              <TableHead>Details</TableHead>
              <TableHead>IP Address</TableHead>
              <TableHead>Timestamp</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLogs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No audit logs found
                </TableCell>
              </TableRow>
            ) : (
              filteredLogs.map((log) => {
                const ActionIcon = actionIcons[log.action] || FileText;
                const actionColor = actionColors[log.action] || 'text-muted-foreground';
                
                return (
                  <TableRow key={log.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <ActionIcon className={`w-4 h-4 ${actionColor}`} />
                        <span className="font-medium">{formatAction(log.action)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-foreground">{log.actor}</p>
                        <Badge variant="secondary" className="text-xs mt-1">
                          {log.actorRole.replace('_', ' ')}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      {log.target ? (
                        <span className="text-primary">{log.target}</span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="max-w-xs truncate text-muted-foreground">
                      {log.details}
                    </TableCell>
                    <TableCell className="font-mono text-sm text-muted-foreground">
                      {log.ipAddress}
                    </TableCell>
                    <TableCell className="text-muted-foreground whitespace-nowrap">
                      {log.timestamp}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>

        {/* Pagination */}
        <div className="flex items-center justify-between p-4 border-t border-border">
          <p className="text-sm text-muted-foreground">
            Showing {filteredLogs.length} of {auditLogs.length} entries
          </p>
        </div>
      </motion.div>
    </div>
  );
}
