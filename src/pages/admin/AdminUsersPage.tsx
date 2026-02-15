import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  Search,
  Filter,
  MoreVertical,
  UserPlus,
  Mail,
  Shield,
  ShieldCheck,
  ShieldX,
  Eye,
  Ban,
  Trash2,
  Download,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { t } from '@/lib/schema-prefix';
import { useUserRole } from '@/hooks/useUserRole';

interface User {
  id: string;
  name: string;
  email: string;
  username: string;
  role: string;
  status: string;
  verified: boolean;
  views: number;
  clicks: number;
  createdAt: string;
  lastLogin: string;
}

export default function AdminUsersPage() {
  const { isSuperAdmin } = useUserRole();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Dialog states
  const [showChangeRoleDialog, setShowChangeRoleDialog] = useState(false);
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showSuspendDialog, setShowSuspendDialog] = useState(false);
  
  // Form states
  const [selectedRole, setSelectedRole] = useState('client');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [targetUserId, setTargetUserId] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      // Fetch all profiles with their roles
      const { data: profilesData, error: profilesError } = await supabase
        .from(t('profiles'))
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      // Fetch all user roles
      const { data: rolesData } = await supabase
        .from(t('user_roles'))
        .select('user_id, role');

      // Fetch link profiles for usernames and views
      const { data: linkProfilesData } = await supabase
        .from(t('link_profiles'))
        .select('user_id, username, total_views');

      // Map roles by user_id
      const rolesMap: Record<string, string> = {};
      rolesData?.forEach((r) => {
        // Prioritize higher roles
        const currentRole = rolesMap[r.user_id];
        if (!currentRole || 
            (r.role === 'super_admin') || 
            (r.role === 'admin' && currentRole === 'client')) {
          rolesMap[r.user_id] = r.role;
        }
      });

      // Map link profiles by user_id
      const linkProfilesMap: Record<string, { username: string; views: number }> = {};
      linkProfilesData?.forEach((lp) => {
        linkProfilesMap[lp.user_id] = {
          username: lp.username,
          views: lp.total_views || 0,
        };
      });

      // Combine data
      const usersWithData: User[] = (profilesData || []).map((profile) => {
        const linkProfile = linkProfilesMap[profile.id];
        return {
          id: profile.id,
          name: profile.full_name || profile.email,
          email: profile.email,
          username: linkProfile?.username || profile.email.split('@')[0],
          role: rolesMap[profile.id] || 'client',
          status: profile.is_suspended ? 'suspended' : 'active',
          verified: profile.is_verified || false,
          views: linkProfile?.views || 0,
          clicks: 0, // Would need analytics query
          createdAt: profile.created_at ? new Date(profile.created_at).toLocaleDateString() : 'N/A',
          lastLogin: profile.last_login_at ? new Date(profile.last_login_at).toLocaleDateString() : 'Never',
        };
      });

      setUsers(usersWithData);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user => {
    // Regular admins cannot see super_admins
    if (!isSuperAdmin && user.role === 'super_admin') return false;
    
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.username.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const toggleSelectAll = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredUsers.map(u => u.id));
    }
  };

  const toggleSelectUser = (id: string) => {
    setSelectedUsers(prev => 
      prev.includes(id) ? prev.filter(uid => uid !== id) : [...prev, id]
    );
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'super_admin':
        return <Badge className="bg-primary/10 text-primary border-primary/20">Super Admin</Badge>;
      case 'admin':
        return <Badge className="bg-accent/10 text-accent border-accent/20">Admin</Badge>;
      default:
        return <Badge variant="secondary">Client</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-success/10 text-success border-success/20">Active</Badge>;
      case 'suspended':
        return <Badge className="bg-destructive/10 text-destructive border-destructive/20">Suspended</Badge>;
      case 'pending':
        return <Badge className="bg-warning/10 text-warning border-warning/20">Pending</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const handleExport = () => {
    const exportData = filteredUsers.map(u => ({
      name: u.name,
      email: u.email,
      username: u.username,
      role: u.role,
      status: u.status,
      views: u.views,
      createdAt: u.createdAt,
      lastLogin: u.lastLogin,
    }));

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `users-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success(`Exported ${filteredUsers.length} users`);
  };

  const handleBulkEmail = () => {
    if (!emailSubject.trim() || !emailBody.trim()) {
      toast.error('Please fill in subject and body');
      return;
    }

    toast.success(`Email would be sent to ${selectedUsers.length} users (not implemented)`);
    setShowEmailDialog(false);
    setEmailSubject('');
    setEmailBody('');
    setSelectedUsers([]);
  };

  const handleChangeRole = async (userId?: string) => {
    const targetIds = userId ? [userId] : selectedUsers;

    // Regular admins cannot assign super_admin role
    if (!isSuperAdmin && selectedRole === 'super_admin') {
      toast.error('Only super admins can assign the super_admin role');
      return;
    }

    // Regular admins cannot modify other admins
    if (!isSuperAdmin) {
      const targetUsers = users.filter(u => targetIds.includes(u.id));
      if (targetUsers.some(u => u.role === 'admin' || u.role === 'super_admin')) {
        toast.error('You cannot change roles of other admins');
        return;
      }
    }
    
    try {
      for (const id of targetIds) {
        // Delete existing roles
        await supabase.from(t('user_roles')).delete().eq('user_id', id);
        
        // Insert new role
        await supabase.from(t('user_roles')).insert({
          user_id: id,
          role: selectedRole as 'super_admin' | 'admin' | 'client',
        });
      }

      toast.success(`Role changed to ${selectedRole} for ${targetIds.length} user(s)`);
      setShowChangeRoleDialog(false);
      setSelectedUsers([]);
      setTargetUserId(null);
      fetchUsers();
    } catch (error) {
      console.error('Error changing role:', error);
      toast.error('Failed to change role');
    }
  };

  const handleSuspendUser = async (userId?: string) => {
    const targetIds = userId ? [userId] : selectedUsers;
    
    try {
      for (const id of targetIds) {
        const user = users.find(u => u.id === id);
        const newStatus = user?.status === 'suspended' ? false : true;
        
        await supabase
          .from(t('profiles'))
          .update({ is_suspended: newStatus })
          .eq('id', id);
      }

      const action = users.find(u => u.id === targetIds[0])?.status === 'suspended' ? 'activated' : 'suspended';
      toast.success(`${targetIds.length} user(s) ${action}`);
      setShowSuspendDialog(false);
      setSelectedUsers([]);
      setTargetUserId(null);
      fetchUsers();
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error('Failed to update user');
    }
  };

  const handleDeleteUser = async (userId?: string) => {
    const targetIds = userId ? [userId] : selectedUsers;
    
    toast.error('User deletion requires Supabase admin access');
    setShowDeleteDialog(false);
    setSelectedUsers([]);
    setTargetUserId(null);
  };

  const openUserAction = (userId: string, action: 'role' | 'suspend' | 'delete' | 'email') => {
    setTargetUserId(userId);
    switch (action) {
      case 'role':
        setShowChangeRoleDialog(true);
        break;
      case 'suspend':
        setShowSuspendDialog(true);
        break;
      case 'delete':
        setShowDeleteDialog(true);
        break;
      case 'email':
        setSelectedUsers([userId]);
        setShowEmailDialog(true);
        break;
    }
  };

  const activeCount = users.filter(u => u.status === 'active').length;
  const suspendedCount = users.filter(u => u.status === 'suspended').length;

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
            <Users className="w-7 h-7 text-primary" />
            User Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage all platform users, roles, and permissions
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" onClick={fetchUsers}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Users', value: users.length.toLocaleString(), icon: Users, color: 'text-primary' },
          { label: 'Active Users', value: activeCount.toLocaleString(), icon: ShieldCheck, color: 'text-success' },
          { label: 'Suspended', value: suspendedCount.toLocaleString(), icon: ShieldX, color: 'text-destructive' },
          { label: 'Admins', value: users.filter(u => u.role === 'admin' || u.role === 'super_admin').length.toLocaleString(), icon: Shield, color: 'text-warning' },
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

      {/* Filters & Search */}
      <div className="glass-card p-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search by name, email, or username..." 
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-3">
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                {isSuperAdmin && <SelectItem value="super_admin">Super Admin</SelectItem>}
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="client">Client</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {selectedUsers.length > 0 && (
          <div className="flex items-center gap-4 mt-4 pt-4 border-t border-border">
            <span className="text-sm text-muted-foreground">
              {selectedUsers.length} users selected
            </span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowEmailDialog(true)}>
                <Mail className="w-4 h-4 mr-2" />
                Email
              </Button>
              <Button variant="outline" size="sm" onClick={() => setShowChangeRoleDialog(true)}>
                <Shield className="w-4 h-4 mr-2" />
                Change Role
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="text-destructive hover:text-destructive"
                onClick={() => setShowSuspendDialog(true)}
              >
                <Ban className="w-4 h-4 mr-2" />
                Suspend
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Users Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card overflow-hidden"
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox 
                  checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                  onCheckedChange={toggleSelectAll}
                />
              </TableHead>
              <TableHead>User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Views</TableHead>
              <TableHead>Last Login</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No users found
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => (
                <TableRow key={user.id} className="hover:bg-secondary/50">
                  <TableCell>
                    <Checkbox 
                      checked={selectedUsers.includes(user.id)}
                      onCheckedChange={() => toggleSelectUser(user.id)}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-medium text-primary">
                          {user.name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-foreground">{user.name}</p>
                          {user.verified && (
                            <ShieldCheck className="w-4 h-4 text-primary" />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">@{user.username}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{getRoleBadge(user.role)}</TableCell>
                  <TableCell>{getStatusBadge(user.status)}</TableCell>
                  <TableCell className="text-right font-medium">
                    {user.views.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {user.lastLogin}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => window.open(`/${user.username}`, '_blank')}>
                          <Eye className="w-4 h-4 mr-2" />
                          View Profile
                        </DropdownMenuItem>
                        {/* Regular admins can't change roles of other admins */}
                        {(isSuperAdmin || user.role === 'client') && (
                          <DropdownMenuItem onClick={() => openUserAction(user.id, 'role')}>
                            <Shield className="w-4 h-4 mr-2" />
                            Change Role
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem onClick={() => openUserAction(user.id, 'email')}>
                          <Mail className="w-4 h-4 mr-2" />
                          Send Email
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {/* Regular admins can't suspend/delete other admins */}
                        {(isSuperAdmin || user.role === 'client') && (
                          <>
                            <DropdownMenuItem 
                              className="text-warning"
                              onClick={() => openUserAction(user.id, 'suspend')}
                            >
                              <Ban className="w-4 h-4 mr-2" />
                              {user.status === 'suspended' ? 'Unsuspend User' : 'Suspend User'}
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-destructive"
                              onClick={() => openUserAction(user.id, 'delete')}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete User
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* Pagination */}
        <div className="flex items-center justify-between p-4 border-t border-border">
          <p className="text-sm text-muted-foreground">
            Showing {filteredUsers.length} of {users.length} users
          </p>
        </div>
      </motion.div>

      {/* Change Role Dialog */}
      <Dialog open={showChangeRoleDialog} onOpenChange={setShowChangeRoleDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change User Role</DialogTitle>
            <DialogDescription>
              Select a new role for {targetUserId ? '1' : selectedUsers.length} user(s).
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label>New Role</Label>
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="client">Client</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                {isSuperAdmin && <SelectItem value="super_admin">Super Admin</SelectItem>}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowChangeRoleDialog(false)}>
              Cancel
            </Button>
            <Button onClick={() => handleChangeRole(targetUserId || undefined)}>
              <Shield className="w-4 h-4 mr-2" />
              Change Role
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Email Dialog */}
      <Dialog open={showEmailDialog} onOpenChange={setShowEmailDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Send Email</DialogTitle>
            <DialogDescription>
              Send an email to {selectedUsers.length} user(s).
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Subject</Label>
              <Input 
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
                placeholder="Email subject..."
                className="mt-2"
              />
            </div>
            <div>
              <Label>Message</Label>
              <textarea 
                value={emailBody}
                onChange={(e) => setEmailBody(e.target.value)}
                placeholder="Write your message..."
                className="mt-2 w-full min-h-[150px] rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEmailDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleBulkEmail} className="gradient-primary text-primary-foreground">
              <Mail className="w-4 h-4 mr-2" />
              Send Email
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Suspend Dialog */}
      <AlertDialog open={showSuspendDialog} onOpenChange={setShowSuspendDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Suspend User(s)?</AlertDialogTitle>
            <AlertDialogDescription>
              This will suspend {targetUserId ? '1' : selectedUsers.length} user(s). They will not be able to access their account until unsuspended.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              className="bg-warning text-warning-foreground hover:bg-warning/90"
              onClick={() => handleSuspendUser(targetUserId || undefined)}
            >
              <Ban className="w-4 h-4 mr-2" />
              Suspend
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User(s)?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete {targetUserId ? '1' : selectedUsers.length} user(s) and all their data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => handleDeleteUser(targetUserId || undefined)}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
