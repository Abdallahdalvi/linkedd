import { useState } from 'react';
import { Database, Key, Copy, AlertTriangle, Pencil, Save, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { SchemaExportSection } from '@/components/settings/SchemaExportSection';

export default function AdminDatabasePage() {
  const currentProjectId = import.meta.env.VITE_SUPABASE_PROJECT_ID || '';
  const currentAnonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || '';
  const currentUrl = import.meta.env.VITE_SUPABASE_URL || '';

  const [editing, setEditing] = useState(false);
  const [editProjectId, setEditProjectId] = useState(currentProjectId);
  const [editUrl, setEditUrl] = useState(currentUrl);
  const [editAnonKey, setEditAnonKey] = useState(currentAnonKey);
  const [saving, setSaving] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const handleEdit = () => {
    setEditProjectId(currentProjectId);
    setEditUrl(currentUrl);
    setEditAnonKey(currentAnonKey);
    setEditing(true);
  };

  const handleCancel = () => {
    setEditing(false);
  };

  const handleSave = async () => {
    if (!editProjectId.trim() || !editUrl.trim() || !editAnonKey.trim()) {
      toast.error('All fields are required');
      return;
    }

    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      await supabase.from('admin_settings').upsert(
        {
          setting_key: 'custom_supabase_connection',
          setting_value: {
            project_id: editProjectId.trim(),
            url: editUrl.trim(),
            anon_key: editAnonKey.trim(),
            updated_at: new Date().toISOString(),
          } as any,
          updated_by: user?.id || null,
        },
        { onConflict: 'setting_key' }
      );

      toast.success('Connection saved! Update your environment variables to apply changes.', { duration: 6000 });
      setEditing(false);
    } catch (err: any) {
      toast.error(err.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold flex items-center gap-3">
            <Database className="w-8 h-8 text-primary" />
            Database Schema
          </h1>
          <p className="text-muted-foreground mt-1">Copy SQL queries to recreate tables in your own database</p>
        </div>
        <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/30">
          <AlertTriangle className="w-3 h-3 mr-1" />
          Super Admin Only
        </Badge>
      </div>

      {/* Connection Info */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2"><Key className="w-5 h-5" />Connection Details</CardTitle>
              <CardDescription>Your database connection credentials for external tools</CardDescription>
            </div>
            {!editing ? (
              <Button variant="outline" size="sm" onClick={handleEdit}>
                <Pencil className="w-4 h-4 mr-1" /> Edit
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleCancel}>
                  <X className="w-4 h-4 mr-1" /> Cancel
                </Button>
                <Button size="sm" onClick={handleSave} disabled={saving}>
                  <Save className="w-4 h-4 mr-1" /> {saving ? 'Saving...' : 'Save'}
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-xs text-muted-foreground">Project ID</Label>
            <div className="flex items-center gap-2 mt-1">
              <Input
                readOnly={!editing}
                value={editing ? editProjectId : currentProjectId}
                onChange={(e) => setEditProjectId(e.target.value)}
                className="font-mono text-sm"
                placeholder="your-project-id"
              />
              <Button variant="outline" size="icon" onClick={() => copyToClipboard(editing ? editProjectId : currentProjectId)}>
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">API URL</Label>
            <div className="flex items-center gap-2 mt-1">
              <Input
                readOnly={!editing}
                value={editing ? editUrl : currentUrl}
                onChange={(e) => setEditUrl(e.target.value)}
                className="font-mono text-sm"
                placeholder="https://your-project.supabase.co"
              />
              <Button variant="outline" size="icon" onClick={() => copyToClipboard(editing ? editUrl : currentUrl)}>
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Anon Key (Publishable)</Label>
            <div className="flex items-center gap-2 mt-1">
              <Input
                readOnly={!editing}
                value={editing ? editAnonKey : currentAnonKey}
                onChange={(e) => setEditAnonKey(e.target.value)}
                type={editing ? 'text' : 'password'}
                className="font-mono text-sm"
                placeholder="eyJhbGciOiJIUzI1NiIs..."
              />
              <Button variant="outline" size="icon" onClick={() => copyToClipboard(editing ? editAnonKey : currentAnonKey)}>
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {editing && (
            <Alert className="border-blue-500/30 bg-blue-500/5">
              <AlertTriangle className="w-4 h-4 text-blue-500" />
              <AlertDescription className="text-blue-700 dark:text-blue-400">
                Saving here stores the new credentials in the database. To apply them, update your <strong>.env</strong> file with:<br />
                <code className="text-xs mt-1 block font-mono">
                  VITE_SUPABASE_PROJECT_ID="{editProjectId}"<br />
                  VITE_SUPABASE_URL="{editUrl}"<br />
                  VITE_SUPABASE_PUBLISHABLE_KEY="{editAnonKey}"
                </code>
              </AlertDescription>
            </Alert>
          )}

          <Alert>
            <Key className="w-4 h-4" />
            <AlertDescription>
              The <strong>Service Role Key</strong> is stored securely on the server and is never exposed to the client.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      <SchemaExportSection />
    </div>
  );
}
