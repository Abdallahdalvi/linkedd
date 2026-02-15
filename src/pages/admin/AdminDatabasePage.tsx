import { Database, Key, Copy, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { SchemaExportSection } from '@/components/settings/SchemaExportSection';

export default function AdminDatabasePage() {
  const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID || '';
  const anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || '';
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
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
          <CardTitle className="flex items-center gap-2"><Key className="w-5 h-5" />Connection Details</CardTitle>
          <CardDescription>Your database connection credentials for external tools</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-xs text-muted-foreground">Project ID</Label>
            <div className="flex items-center gap-2 mt-1">
              <Input readOnly value={projectId} className="font-mono text-sm" />
              <Button variant="outline" size="icon" onClick={() => copyToClipboard(projectId)}>
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">API URL</Label>
            <div className="flex items-center gap-2 mt-1">
              <Input readOnly value={supabaseUrl} className="font-mono text-sm" />
              <Button variant="outline" size="icon" onClick={() => copyToClipboard(supabaseUrl)}>
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Anon Key (Publishable)</Label>
            <div className="flex items-center gap-2 mt-1">
              <Input readOnly value={anonKey} type="password" className="font-mono text-sm" />
              <Button variant="outline" size="icon" onClick={() => copyToClipboard(anonKey)}>
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </div>
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
