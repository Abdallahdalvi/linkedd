import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Database,
  Play,
  Loader2,
  Copy,
  Trash2,
  Table2,
  Key,
  Terminal,
  AlertTriangle,
  CheckCircle2,
  Clock,
  BookOpen,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { SchemaExportSection } from '@/components/settings/SchemaExportSection';

interface QueryResult {
  rows: Record<string, unknown>[];
  rowCount: number;
  columns: string[];
  error?: string;
  duration?: number;
}

const TEMPLATE_QUERIES = [
  { label: 'List all tables', sql: `SELECT table_name, table_type FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;` },
  { label: 'Table columns', sql: `SELECT column_name, data_type, is_nullable, column_default FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'YOUR_TABLE' ORDER BY ordinal_position;` },
  { label: 'Row counts', sql: `SELECT schemaname, relname AS table_name, n_live_tup AS row_count FROM pg_stat_user_tables ORDER BY n_live_tup DESC;` },
  { label: 'RLS policies', sql: `SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check FROM pg_policies WHERE schemaname = 'public' ORDER BY tablename;` },
  { label: 'Active connections', sql: `SELECT count(*) as total, state FROM pg_stat_activity GROUP BY state;` },
  { label: 'Database size', sql: `SELECT pg_size_pretty(pg_database_size(current_database())) as db_size;` },
  { label: 'Create table template', sql: `CREATE TABLE public.example (\n  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),\n  name TEXT NOT NULL,\n  created_at TIMESTAMPTZ DEFAULT now()\n);\n\nALTER TABLE public.example ENABLE ROW LEVEL SECURITY;` },
  { label: 'Index list', sql: `SELECT indexname, tablename, indexdef FROM pg_indexes WHERE schemaname = 'public' ORDER BY tablename;` },
];

export default function AdminDatabasePage() {
  const [sql, setSql] = useState('');
  const [result, setResult] = useState<QueryResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<{ sql: string; timestamp: Date; success: boolean }[]>([]);

  const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID || '';
  const anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || '';
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';

  const executeQuery = useCallback(async () => {
    if (!sql.trim()) {
      toast.error('Enter a SQL query');
      return;
    }

    setLoading(true);
    const start = performance.now();

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('You must be logged in');
        return;
      }

      const res = await fetch(`${supabaseUrl}/functions/v1/execute-sql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
          apikey: anonKey,
        },
        body: JSON.stringify({ sql: sql.trim() }),
      });

      const data = await res.json();
      const duration = Math.round(performance.now() - start);

      if (!res.ok) {
        setResult({ rows: [], rowCount: 0, columns: [], error: data.error, duration });
        setHistory(prev => [{ sql: sql.trim(), timestamp: new Date(), success: false }, ...prev.slice(0, 19)]);
        toast.error(data.error || 'Query failed');
      } else {
        setResult({ ...data, duration });
        setHistory(prev => [{ sql: sql.trim(), timestamp: new Date(), success: true }, ...prev.slice(0, 19)]);
        toast.success(`Query executed in ${duration}ms — ${data.rowCount} rows`);
      }
    } catch (err: any) {
      const duration = Math.round(performance.now() - start);
      setResult({ rows: [], rowCount: 0, columns: [], error: err.message, duration });
      toast.error('Failed to execute query');
    } finally {
      setLoading(false);
    }
  }, [sql, supabaseUrl, anonKey]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold flex items-center gap-3">
            <Database className="w-8 h-8 text-primary" />
            Database Manager
          </h1>
          <p className="text-muted-foreground mt-1">Execute SQL queries and manage your database</p>
        </div>
        <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/30">
          <AlertTriangle className="w-3 h-3 mr-1" />
          Super Admin Only
        </Badge>
      </div>

      <Alert className="border-amber-500/30 bg-amber-500/5">
        <AlertTriangle className="w-4 h-4 text-amber-500" />
        <AlertDescription className="text-amber-700 dark:text-amber-400">
          <strong>Warning:</strong> SQL queries execute directly on the database. Destructive operations (DROP, DELETE, TRUNCATE) cannot be undone. All queries are logged in the audit trail.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="editor" className="space-y-4">
        <TabsList>
          <TabsTrigger value="editor" className="gap-2"><Terminal className="w-4 h-4" />SQL Editor</TabsTrigger>
          <TabsTrigger value="connection" className="gap-2"><Key className="w-4 h-4" />Connection Info</TabsTrigger>
          <TabsTrigger value="templates" className="gap-2"><BookOpen className="w-4 h-4" />Templates</TabsTrigger>
          <TabsTrigger value="schema" className="gap-2"><Database className="w-4 h-4" />Schema Export</TabsTrigger>
        </TabsList>

        {/* SQL Editor Tab */}
        <TabsContent value="editor" className="space-y-4">
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="relative">
                <Textarea
                  value={sql}
                  onChange={(e) => setSql(e.target.value)}
                  placeholder="SELECT * FROM public.profiles LIMIT 10;"
                  className="font-mono text-sm min-h-[200px] resize-y bg-muted/30"
                  onKeyDown={(e) => {
                    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                      e.preventDefault();
                      executeQuery();
                    }
                  }}
                />
              </div>
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">Ctrl+Enter to execute</p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => { setSql(''); setResult(null); }}>
                    <Trash2 className="w-4 h-4 mr-1" /> Clear
                  </Button>
                  <Button size="sm" onClick={executeQuery} disabled={loading || !sql.trim()}>
                    {loading ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Play className="w-4 h-4 mr-1" />}
                    Execute
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Results */}
          {result && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                      {result.error ? (
                        <AlertTriangle className="w-4 h-4 text-destructive" />
                      ) : (
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                      )}
                      {result.error ? 'Error' : `Results (${result.rowCount} rows)`}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      {result.duration && (
                        <Badge variant="secondary" className="text-xs">
                          <Clock className="w-3 h-3 mr-1" />{result.duration}ms
                        </Badge>
                      )}
                      {!result.error && result.rows.length > 0 && (
                        <Button variant="ghost" size="sm" onClick={() => copyToClipboard(JSON.stringify(result.rows, null, 2))}>
                          <Copy className="w-3 h-3 mr-1" /> Copy JSON
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {result.error ? (
                    <pre className="text-sm text-destructive font-mono bg-destructive/5 p-4 rounded-lg overflow-auto whitespace-pre-wrap">
                      {result.error}
                    </pre>
                  ) : result.rows.length > 0 ? (
                    <div className="overflow-auto max-h-[400px] rounded-lg border">
                      <table className="w-full text-sm">
                        <thead className="bg-muted/50 sticky top-0">
                          <tr>
                            {result.columns.map((col) => (
                              <th key={col} className="text-left p-2 font-medium border-b whitespace-nowrap">{col}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {result.rows.map((row, i) => (
                            <tr key={i} className="border-b hover:bg-muted/30">
                              {result.columns.map((col) => (
                                <td key={col} className="p-2 font-mono text-xs max-w-[300px] truncate">
                                  {row[col] === null ? <span className="text-muted-foreground italic">null</span> : String(row[col])}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">Query executed successfully. No rows returned.</p>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* History */}
          {history.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Query History</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {history.map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 cursor-pointer group"
                    onClick={() => setSql(item.sql)}
                  >
                    {item.success ? (
                      <CheckCircle2 className="w-3 h-3 text-green-500 shrink-0" />
                    ) : (
                      <AlertTriangle className="w-3 h-3 text-destructive shrink-0" />
                    )}
                    <code className="text-xs font-mono truncate flex-1">{item.sql}</code>
                    <span className="text-xs text-muted-foreground shrink-0">
                      {item.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Connection Info Tab */}
        <TabsContent value="connection" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Key className="w-5 h-5" />Connection Details</CardTitle>
              <CardDescription>Database connection information for external tools</CardDescription>
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
                  The <strong>Service Role Key</strong> is stored securely on the server and is never exposed to the client. It's used internally by the SQL executor edge function.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="templates" className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            {TEMPLATE_QUERIES.map((tpl) => (
              <Card
                key={tpl.label}
                className="cursor-pointer hover:border-primary/50 transition-colors"
                onClick={() => setSql(tpl.sql)}
              >
                <CardContent className="pt-4 pb-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Table2 className="w-4 h-4 text-primary" />
                    <span className="font-medium text-sm">{tpl.label}</span>
                  </div>
                  <pre className="text-xs font-mono text-muted-foreground line-clamp-3 whitespace-pre-wrap">{tpl.sql}</pre>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Schema Export Tab */}
        <TabsContent value="schema" className="space-y-4">
          <SchemaExportSection />
        </TabsContent>
      </Tabs>
    </div>
  );
}
