import { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLinkProfile } from '@/hooks/useLinkProfile';
import DashboardLayout from '@/components/layout/DashboardLayout';
import DashboardOverviewPage from './dashboard/DashboardOverviewPage';
import DashboardLinksPage from './dashboard/DashboardLinksPage';
import DashboardAnalyticsPage from './dashboard/DashboardAnalyticsPage';
import DashboardLeadsPage from './dashboard/DashboardLeadsPage';
import DashboardProfilePage from './dashboard/DashboardProfilePage';
import DashboardDesignPage from './dashboard/DashboardDesignPage';
import DashboardSettingsPage from './dashboard/DashboardSettingsPage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export default function DashboardPage() {
  const { user } = useAuth();
  const {
    profile,
    blocks,
    loading,
    createProfile,
    updateProfile,
    addBlock,
    updateBlock,
    deleteBlock,
    reorderBlocks,
  } = useLinkProfile();
  
  const [showSetup, setShowSetup] = useState(false);
  const [username, setUsername] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (!loading && !profile) {
      setShowSetup(true);
    }
  }, [loading, profile]);

  const handleCreateProfile = async () => {
    if (!username.trim()) {
      toast.error('Please enter a username');
      return;
    }
    
    setCreating(true);
    const result = await createProfile(username.trim().toLowerCase().replace(/\s+/g, '-'));
    
    if (result) {
      toast.success('Profile created!');
      setShowSetup(false);
    } else {
      toast.error('Username may already be taken. Try another.');
    }
    setCreating(false);
  };

  const userName = user?.user_metadata?.full_name?.split(' ')[0] || 'Creator';

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Routes>
        <Route 
          path="/" 
          element={
            <DashboardOverviewPage 
              profile={profile}
              blocks={blocks}
              onAddBlock={addBlock}
              onUpdateBlock={updateBlock}
              onDeleteBlock={deleteBlock}
              onReorderBlocks={reorderBlocks}
              userName={userName}
            />
          } 
        />
        <Route 
          path="/links" 
          element={
            <DashboardLinksPage 
              profile={profile}
              blocks={blocks}
              onAddBlock={addBlock}
              onUpdateBlock={updateBlock}
              onDeleteBlock={deleteBlock}
              onReorderBlocks={reorderBlocks}
            />
          } 
        />
        <Route 
          path="/analytics" 
          element={
            <DashboardAnalyticsPage 
              profile={profile}
              blocks={blocks}
            />
          } 
        />
        <Route 
          path="/leads" 
          element={
            <DashboardLeadsPage 
              profile={profile}
              blocks={blocks}
            />
          } 
        />
        <Route 
          path="/profile" 
          element={
            <DashboardProfilePage 
              profile={profile}
              blocks={blocks}
              onUpdateProfile={updateProfile}
            />
          } 
        />
        <Route 
          path="/design" 
          element={
            <DashboardDesignPage 
              profile={profile}
              blocks={blocks}
              onUpdateProfile={updateProfile}
            />
          } 
        />
        <Route 
          path="/settings" 
          element={
            <DashboardSettingsPage 
              profile={profile}
              onUpdateProfile={updateProfile}
              userEmail={user?.email || ''}
            />
          } 
        />
      </Routes>

      {/* Setup Dialog */}
      <Dialog open={showSetup} onOpenChange={setShowSetup}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">Create Your Profile</DialogTitle>
          </DialogHeader>
          <div className="py-6">
            <div className="flex justify-center mb-6">
              <Avatar className="w-20 h-20">
                <AvatarImage src={user?.user_metadata?.avatar_url} />
                <AvatarFallback className="bg-primary/10 text-primary text-2xl font-bold">
                  {user?.email?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Choose your username</Label>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">linkbio.app/</span>
                  <Input
                    value={username}
                    onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                    placeholder="yourname"
                    className="flex-1"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Only lowercase letters, numbers, and hyphens
                </p>
              </div>

              <Button
                onClick={handleCreateProfile}
                disabled={creating || !username.trim()}
                className="w-full btn-primary"
              >
                {creating ? 'Creating...' : 'Create Profile'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
