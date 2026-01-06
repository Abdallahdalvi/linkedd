import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  FileText,
  Search,
  Filter,
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

const auditLogs = [
  { 
    id: '1',
    action: 'user_login',
    actor: 'admin@linkbio.com',
    actorRole: 'super_admin',
    target: null,
    details: 'Successful login from 192.168.1.1',
    timestamp: '2026-01-06 14:32:15',
    ipAddress: '192.168.1.1',
  },
  { 
    id: '2',
    action: 'user_suspended',
    actor: 'admin@linkbio.com',
    actorRole: 'super_admin',
    target: '@spammer123',
    details: 'User suspended for policy violation',
    timestamp: '2026-01-06 14:28:00',
    ipAddress: '192.168.1.1',
  },
  { 
    id: '3',
    action: 'block_deleted',
    actor: 'moderator@linkbio.com',
    actorRole: 'admin',
    target: '@fakeprofile',
    details: 'Malicious link block removed',
    timestamp: '2026-01-06 13:45:30',
    ipAddress: '192.168.1.50',
  },
  { 
    id: '4',
    action: 'settings_updated',
    actor: 'admin@linkbio.com',
    actorRole: 'super_admin',
    target: 'Design System',
    details: 'Updated global color palette',
    timestamp: '2026-01-06 12:15:00',
    ipAddress: '192.168.1.1',
  },
  { 
    id: '5',
    action: 'user_created',
    actor: 'admin@linkbio.com',
    actorRole: 'super_admin',
    target: '@newadmin',
    details: 'Created new admin user',
    timestamp: '2026-01-06 11:00:00',
    ipAddress: '192.168.1.1',
  },
  { 
    id: '6',
    action: 'profile_viewed',
    actor: 'moderator@linkbio.com',
    actorRole: 'admin',
    target: '@suspicious_user',
    details: 'Reviewed profile for moderation',
    timestamp: '2026-01-06 10:30:00',
    ipAddress: '192.168.1.50',
  },
  { 
    id: '7',
    action: 'user_logout',
    actor: 'moderator@linkbio.com',
    actorRole: 'admin',
    target: null,
    details: 'Session ended',
    timestamp: '2026-01-05 18:00:00',
    ipAddress: '192.168.1.50',
  },
  { 
    id: '8',
    action: 'role_changed',
    actor: 'admin@linkbio.com',
    actorRole: 'super_admin',
    target: '@newadmin',
    details: 'Role changed from client to admin',
    timestamp: '2026-01-05 15:30:00',
    ipAddress: '192.168.1.1',
  },
];

const actionIcons: Record<string, typeof User> = {
  user_login: LogIn,
  user_logout: LogOut,
  user_created: UserPlus,
  user_suspended: Ban,
  block_deleted: Trash2,
  settings_updated: Settings,
  profile_viewed: Eye,
  role_changed: Shield,
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
};

export default function AdminAuditPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState('all');

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
        
        <Button variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Export Logs
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Actions', value: '1,234', icon: FileText, color: 'text-primary' },
          { label: 'Today', value: '45', icon: Calendar, color: 'text-success' },
          { label: 'Unique Actors', value: '8', icon: User, color: 'text-accent' },
          { label: 'Security Events', value: '12', icon: Shield, color: 'text-warning' },
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
                <SelectItem value="user_login">Login</SelectItem>
                <SelectItem value="user_logout">Logout</SelectItem>
                <SelectItem value="user_created">User Created</SelectItem>
                <SelectItem value="user_suspended">User Suspended</SelectItem>
                <SelectItem value="block_deleted">Block Deleted</SelectItem>
                <SelectItem value="settings_updated">Settings Updated</SelectItem>
                <SelectItem value="role_changed">Role Changed</SelectItem>
              </SelectContent>
            </Select>
            <Select defaultValue="today">
              <SelectTrigger className="w-[140px]">
                <Calendar className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="all">All time</SelectItem>
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
            {filteredLogs.map((log) => {
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
            })}
          </TableBody>
        </Table>

        {/* Pagination */}
        <div className="flex items-center justify-between p-4 border-t border-border">
          <p className="text-sm text-muted-foreground">
            Showing {filteredLogs.length} of {auditLogs.length} entries
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled>Previous</Button>
            <Button variant="outline" size="sm">Next</Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
