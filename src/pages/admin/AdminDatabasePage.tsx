import { useState } from 'react';
import { Database, Key, Copy, AlertTriangle, Pencil, Save, X, RotateCcw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { getSupabaseConfig, saveSupabaseConfig, clearSupabaseConfig } from '@/lib/dynamic-supabase';
import { SchemaExportSection } from '@/components/settings/SchemaExportSection';

export default function AdminDatabasePage() {
  const config = getSupabaseConfig();

  const [editing, setEditing] = useState(false);
  const [editProjectId, setEditProjectId] = useState(config.projectId);
  const [editUrl, setEditUrl] = useState(config.url);
  const [editAnonKey, setEditAnonKey] = useState(config.anonKey);
  const [saving, setSaving] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const handleEdit = () => {
    setEditProjectId(config.projectId);
    setEditUrl(config.url);
    setEditAnonKey(config.anonKey);
    setEditing(true);
  };

  const handleCancel = () => setEditing(false);

  const handleSave = async () => {
    if (!editProjectId.trim() || !editUrl.trim() || !editAnonKey.trim()) {
      toast.error('All fields are required');
      return;
    }

    setSaving(true);
    try {
      // Save to admin_settings for persistence
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

      // Save to localStorage for immediate effect
      saveSupabaseConfig({
        projectId: editProjectId.trim(),
        url: editUrl.trim(),
        anonKey: editAnonKey.trim(),
      });

      toast.success('Connection updated! Reloading...', { duration: 2000 });
      setTimeout(() => window.location.reload(), 1500);
    } catch (err: any) {
      toast.error(err.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    clearSupabaseConfig();
    toast.success('Reset to default credentials. Reloading...');
    setTimeout(() => window.location.reload(), 1500);
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
              <CardTitle className="flex items-center gap-2">
                <Key className="w-5 h-5" />
                Connection Details
                {config.isOverride && (
                  <Badge variant="secondary" className="ml-2 text-xs">Custom</Badge>
                )}
              </CardTitle>
              <CardDescription>Your database connection credentials — editable by super admin</CardDescription>
            </div>
            <div className="flex gap-2">
              {config.isOverride && !editing && (
                <Button variant="ghost" size="sm" onClick={handleReset}>
                  <RotateCcw className="w-4 h-4 mr-1" /> Reset to Default
                </Button>
              )}
              {!editing ? (
                <Button variant="outline" size="sm" onClick={handleEdit}>
                  <Pencil className="w-4 h-4 mr-1" /> Edit
                </Button>
              ) : (
                <>
                  <Button variant="outline" size="sm" onClick={handleCancel}>
                    <X className="w-4 h-4 mr-1" /> Cancel
                  </Button>
                  <Button size="sm" onClick={handleSave} disabled={saving}>
                    <Save className="w-4 h-4 mr-1" /> {saving ? 'Saving...' : 'Save & Apply'}
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-xs text-muted-foreground">Project ID</Label>
            <div className="flex items-center gap-2 mt-1">
              <Input
                readOnly={!editing}
                value={editing ? editProjectId : config.projectId}
                onChange={(e) => setEditProjectId(e.target.value)}
                className="font-mono text-sm"
                placeholder="your-project-id"
              />
              <Button variant="outline" size="icon" onClick={() => copyToClipboard(editing ? editProjectId : config.projectId)}>
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">API URL</Label>
            <div className="flex items-center gap-2 mt-1">
              <Input
                readOnly={!editing}
                value={editing ? editUrl : config.url}
                onChange={(e) => setEditUrl(e.target.value)}
                className="font-mono text-sm"
                placeholder="https://your-project.supabase.co"
              />
              <Button variant="outline" size="icon" onClick={() => copyToClipboard(editing ? editUrl : config.url)}>
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Anon Key (Publishable)</Label>
            <div className="flex items-center gap-2 mt-1">
              <Input
                readOnly={!editing}
                value={editing ? editAnonKey : config.anonKey}
                onChange={(e) => setEditAnonKey(e.target.value)}
                type={editing ? 'text' : 'password'}
                className="font-mono text-sm"
                placeholder="eyJhbGciOiJIUzI1NiIs..."
              />
              <Button variant="outline" size="icon" onClick={() => copyToClipboard(editing ? editAnonKey : config.anonKey)}>
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <Alert>
            <Key className="w-4 h-4" />
            <AlertDescription>
              {config.isOverride
                ? <>Using <strong>custom credentials</strong>. Click "Reset to Default" to revert to the original connection.</>
                : <>The <strong>Service Role Key</strong> is stored securely on the server and is never exposed to the client.</>
              }
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      <SchemaExportSection />
    </div>
  );
}
